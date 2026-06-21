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
    // Reset the default selection if it pointed at the removed provider.
    let defaultSelection = s.defaultSelection
    if (defaultSelection?.providerId === id) {
      const fallback = providers.find((p) => p.models.length > 0)
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

