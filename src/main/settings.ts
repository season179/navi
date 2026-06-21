// Encrypted local settings for the main process. Provider API keys never touch
// the renderer or plain disk: each is encrypted at rest with Electron's
// safeStorage (OS keychain-backed where available) and only decrypted in the
// main process to hand to the spawned Flue child. Non-secret provider metadata
// (profiles, base URLs, the default selection) is stored in plaintext alongside.
//
// The store is multi-provider: `providers[]` is "what exists", `providerKeys`
// holds one encrypted key per provider id, and `defaultSelection` is the
// model applied to new conversations. A legacy single-OpenAI file
// ({ apiKeyEnc, baseUrl }) is migrated to this shape on first read.

import { app, safeStorage } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'
import type { DefaultSelection, ProviderProfile } from '../shared/flue'
import { findPreset, OPENAI_PINNED_MODEL } from '../shared/provider-presets'

interface StoredSettings {
  /** "What exists" — configured provider profiles (non-secret). */
  providers?: ProviderProfile[]
  /** providerId -> base64 of safeStorage.encryptString(apiKey). */
  providerKeys?: Record<string, string>
  /** Model applied to new conversations. */
  defaultSelection?: DefaultSelection
  /**
   * Names of user-global skills (under userData/skills/) that are currently
   * enabled. Absent ⇒ all existing globals are enabled (the default; mirrors how
   * a fresh install treats built-in skills as on). A name present on disk but
   * absent here is disabled. Plan §D3-C / §D6.
   */
  enabledGlobalSkills?: string[]
  // --- legacy single-provider fields, migrated on first read (then dropped) ---
  apiKeyEnc?: string
  baseUrl?: string
}

/** Discriminated key-read result: distinguishes "no key" from "stored but unreadable" (§F8). */
export type ProviderKeyResult =
  | { state: 'ok'; key: string }
  | { state: 'absent' }
  | { state: 'unreadable' }

function settingsPath(): string {
  return path.join(app.getPath('userData'), 'navi-settings.json')
}

/**
 * Bring a loaded store up to the multi-provider shape, in memory. Idempotent.
 * Migration is persisted by the next mutation (write), never from read() — so a
 * read can't clobber a concurrent queued write (mirrors conversations.ts).
 */
function migrate(s: StoredSettings): StoredSettings {
  if (s.providers) return s // already multi-provider

  // Only a legacy single-provider file ({ apiKeyEnc, baseUrl }) is migrated into a
  // seeded OpenAI profile + default. A brand-new install (no legacy fields at all)
  // must start with NO providers and NO default: that lets onboarding pick the
  // first provider, and lets ProvidersSettings set the first *keyed* provider as
  // the default. Seeding a keyless `openai` here instead would leave the app
  // default pinned to an unconfigured provider that every new conversation fails
  // against — even after the user configures a different provider.
  const isLegacy = s.apiKeyEnc !== undefined || s.baseUrl !== undefined
  if (!isLegacy) return { providers: [], providerKeys: {} }

  const openai: ProviderProfile = {
    id: 'openai',
    name: 'OpenAI',
    api: 'openai-completions', // pin Chat Completions over the catalog Responses default (§F3)
    ...(s.baseUrl?.trim() ? { baseUrl: s.baseUrl.trim() } : {}),
    models: [{ ...OPENAI_PINNED_MODEL }],
  }
  const providerKeys: Record<string, string> = {}
  if (s.apiKeyEnc) providerKeys.openai = s.apiKeyEnc // move verbatim — no re-encrypt

  return {
    providers: [openai],
    providerKeys,
    defaultSelection: { providerId: 'openai', modelId: OPENAI_PINNED_MODEL.id, reasoning: 'medium' },
  }
}

async function readRaw(): Promise<StoredSettings> {
  try {
    const raw = await fs.readFile(settingsPath(), 'utf8')
    return migrate(JSON.parse(raw) as StoredSettings)
  } catch {
    return migrate({})
  }
}

async function writeRaw(settings: StoredSettings): Promise<void> {
  const file = settingsPath()
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, JSON.stringify(settings, null, 2), { mode: 0o600 })
}

// Serialize read-modify-write cycles so two overlapping mutations can't clobber.
let queue: Promise<unknown> = Promise.resolve()
function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn)
  queue = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

// --- Provider profiles -----------------------------------------------------

export async function listProviders(): Promise<ProviderProfile[]> {
  const { providers } = await readRaw()
  return providers ?? []
}

export function upsertProvider(profile: ProviderProfile): Promise<void> {
  return enqueue(async () => {
    const s = await readRaw()
    const providers = s.providers ?? []
    const i = providers.findIndex((p) => p.id === profile.id)
    if (i >= 0) providers[i] = profile
    else providers.push(profile)
    await writeRaw({ ...s, providers })
  })
}

export function deleteProvider(id: string): Promise<void> {
  return enqueue(async () => {
    const s = await readRaw()
    const providers = (s.providers ?? []).filter((p) => p.id !== id)
    const providerKeys = { ...(s.providerKeys ?? {}) }
    delete providerKeys[id]
    // Reset the default selection if it pointed at the removed provider. Prefer a
    // provider that still has a key so the new default actually authenticates;
    // only fall back to a keyless one (then to none) if nothing is keyed.
    let defaultSelection = s.defaultSelection
    if (defaultSelection?.providerId === id) {
      const fallback =
        providers.find((p) => providerKeys[p.id] && p.models.length > 0) ??
        providers.find((p) => p.models.length > 0)
      defaultSelection = fallback
        ? { providerId: fallback.id, modelId: fallback.models[0].id, reasoning: 'medium' }
        : undefined
    }
    await writeRaw({ ...s, providers, providerKeys, defaultSelection })
  })
}

// --- Per-provider keys -----------------------------------------------------

/**
 * Resolve a provider's key: an explicit env var wins (dev override, via the
 * preset's apiKeyEnv), otherwise the safeStorage-encrypted value. Distinguishes
 * "no key" from "stored but undecryptable" so the UI can re-prompt (§F8).
 */
export async function getProviderKey(id: string): Promise<ProviderKeyResult> {
  const envName = findPreset(id)?.apiKeyEnv
  const fromEnv = envName ? process.env[envName]?.trim() : undefined
  if (fromEnv) return { state: 'ok', key: fromEnv }

  const { providerKeys } = await readRaw()
  const enc = providerKeys?.[id]
  if (!enc) return { state: 'absent' }
  if (!safeStorage.isEncryptionAvailable()) return { state: 'unreadable' }
  try {
    const decrypted = safeStorage.decryptString(Buffer.from(enc, 'base64')).trim()
    return decrypted ? { state: 'ok', key: decrypted } : { state: 'absent' }
  } catch {
    return { state: 'unreadable' }
  }
}

export function setProviderKey(id: string, key: string): Promise<void> {
  const trimmed = key.trim()
  if (!trimmed) throw new Error('API key is empty.')
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Secure storage is unavailable on this system; cannot persist the API key.')
  }
  return enqueue(async () => {
    const enc = safeStorage.encryptString(trimmed).toString('base64')
    const s = await readRaw()
    await writeRaw({ ...s, providerKeys: { ...(s.providerKeys ?? {}), [id]: enc } })
  })
}

// --- Default selection -----------------------------------------------------

export async function getDefaultSelection(): Promise<DefaultSelection | undefined> {
  const { defaultSelection } = await readRaw()
  return defaultSelection
}

export function setDefaultSelection(sel: DefaultSelection): Promise<void> {
  return enqueue(async () => {
    const s = await readRaw()
    await writeRaw({ ...s, defaultSelection: sel })
  })
}

// --- Global skills enable list ---------------------------------------------
//
// Global skills (plan §D3-C) live as SKILL.md files under userData/skills/; the
// files are the source of truth for "what exists", and this list is the source
// of truth for "which are active". Absent list ⇒ all enabled (so a brand-new
// global skill the user just created is on by default, matching how built-ins
// behave). This keeps the enable state out of the skill files themselves (which
// must stay spec-pure and portable) and in the app-owned settings file.

export async function getEnabledGlobalSkills(): Promise<string[] | undefined> {
  const { enabledGlobalSkills } = await readRaw()
  return enabledGlobalSkills
}

export function setEnabledGlobalSkills(names: string[]): Promise<void> {
  return enqueue(async () => {
    const s = await readRaw()
    await writeRaw({ ...s, enabledGlobalSkills: names })
  })
}

/**
 * Add a name to the enabled set (no-op if already present). Used by the create
 * path so a brand-new skill honors the documented default-on even AFTER the
 * enable list has been materialized by a prior toggle: `resolveEnabled` reads an
 * absent list as "all on", but a *present* list is an explicit opt-in set, so a
 * newly-written skill whose name isn't in it would otherwise read as disabled
 * and never load.
 *
 * CRITICAL: when the stored list is ABSENT we must NOT materialize it. An absent
 * list already means "all enabled" (so the new skill is on), and writing
 * `[name]` would instead flip every other on-disk skill to disabled. Only touch
 * the store when a list is already present (the case the default-on rule fails
 * for). Atomic read-modify-write (shares the settings queue).
 */
export function ensureGlobalSkillEnabled(name: string): Promise<void> {
  return enqueue(async () => {
    const s = await readRaw()
    if (s.enabledGlobalSkills === undefined) return // absent ⇒ all-on already; don't materialize
    const set = new Set(s.enabledGlobalSkills)
    set.add(name)
    await writeRaw({ ...s, enabledGlobalSkills: [...set].sort() })
  })
}

