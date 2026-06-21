// User-global skill store (plan §D3-C / §D6). Global skills are SKILL.md files
// under userData/skills/<name>/, managed in-app, available in EVERY conversation
// (including no-project chat) via the packagedSkills seam (§D5).
//
// This module owns the on-disk file store and the enable/disable state:
//   - listGlobalSkills()        → read + parse every <name>/SKILL.md
//   - writeGlobalSkill()        → validate + persist (rejects navi-* per §D7)
//   - deleteGlobalSkill()       → remove the directory
//   - resolveEnabled()          → merge on-disk skills with the enable list
//   - buildGlobalSkillsManifest() → package enabled skills for the Flue child
//
// The skill files are spec-pure Agent Skills SKILL.md (no navi-specific
// frontmatter), so they're portable to Kun-legacy and Claude Code. The enable
// state lives separately in navi-settings.json (settings.ts), not in the files.
//
// Validation uses navi's own spec-compliant parser (src/shared/skill-md.ts).
// Flue's runtime parser remains the final arbiter at boot — but importing Flue's
// `internal` subpath into the main bundle pulls native deps that break esbuild,
// so navi owns this small validator. A skill that passes here but fails Flue's
// stricter parse is simply skipped at boot with a warning (Flue's
// discoverLocalSkills tolerance), never crashing init. A test asserts parity on
// the rules that matter (name + description).

import { app } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'
import { parseSkillMarkdown, composeSkillMd, validateSkillName } from '../shared/skill-md'
import { type GlobalSkillManifestEntry, type GlobalSkillFile } from '../shared/global-skill-pkg'
import { type SkillDraft } from '../shared/flue'
import { getEnabledGlobalSkills, setEnabledGlobalSkills, ensureGlobalSkillEnabled } from './settings'

/** A parsed global skill, with its enable state resolved against settings. */
export interface GlobalSkill {
  name: string
  description: string
  /** SKILL.md body (everything after the frontmatter). */
  body: string
  /** Absolute path to the skill directory (for "open file"). */
  dirPath: string
  /** True when this skill is in the active enabled set. */
  enabled: boolean
}

export function globalSkillsDir(): string {
  return path.join(app.getPath('userData'), 'skills')
}

function skillDir(name: string): string {
  return path.join(globalSkillsDir(), name)
}

function skillMdPath(name: string): string {
  return path.join(skillDir(name), 'SKILL.md')
}

/**
 * Parse one SKILL.md from disk. Returns null (and is skipped on list) if the
 * file is missing or fails Flue's validation — a malformed user skill must not
 * crash the store read, exactly as Flue skips invalid discovered skills.
 */
async function readSkill(name: string): Promise<GlobalSkill | null> {
  const mdPath = skillMdPath(name)
  let raw: string
  try {
    raw = await fs.readFile(mdPath, 'utf8')
  } catch {
    return null
  }
  try {
    const parsed = parseSkillMarkdown(raw, { directoryName: name, path: mdPath })
    return {
      name: parsed.name,
      description: parsed.description,
      body: parsed.body,
      dirPath: skillDir(name),
      // enabled resolved later by resolveEnabled (needs the settings list)
      enabled: true,
    }
  } catch {
    return null
  }
}

/** Resolve which skills are enabled, given the on-disk set + stored list. */
function resolveEnabled(
  skills: Omit<GlobalSkill, 'enabled'>[],
  enabledList: string[] | undefined,
): GlobalSkill[] {
  // Absent list ⇒ all enabled (default-on for newly created skills, matching
  // built-in behavior). Present list ⇒ explicit opt-in set.
  const enabled = enabledList === undefined ? null : new Set(enabledList)
  return skills.map((s) => ({ ...s, enabled: enabled === null ? true : enabled.has(s.name) }))
}

/** List every global skill on disk, with enable state resolved. */
export async function listGlobalSkills(): Promise<GlobalSkill[]> {
  const dir = globalSkillsDir()
  let entries: string[]
  try {
    entries = await fs.readdir(dir)
  } catch {
    return [] // no skills dir yet — fresh install
  }
  const skills = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry)
      const stat = await fs.stat(entryPath).catch(() => null)
      if (!stat?.isDirectory()) return null
      return readSkill(entry)
    }),
  )
  const present = skills.filter((s): s is GlobalSkill => s !== null)
  const enabledList = await getEnabledGlobalSkills()
  return resolveEnabled(present, enabledList)
}

/** Read a single global skill by name (or null if missing/invalid). */
export async function readGlobalSkill(name: string): Promise<GlobalSkill | null> {
  const skill = await readSkill(name)
  if (!skill) return null
  const enabledList = await getEnabledGlobalSkills()
  return resolveEnabled([skill], enabledList)[0]
}

/**
 * Create a new global skill, or (with `allowOverwrite`) rewrite an existing one
 * in place. Validates the name and parses the result through navi's
 * spec-compliant parser to guarantee it will load at boot. Throws on invalid
 * input.
 *
 * The create path (default) MUST NOT clobber an existing skill of the same name:
 * re-adding a starter, or typing a name that's already taken, would otherwise
 * silently destroy the user's existing skill. Only the edit path passes
 * `allowOverwrite: true` (it keeps the same directory/name and just rewrites
 * SKILL.md, preserving the enable state since the editor can't rename).
 */
export async function writeGlobalSkill(
  draft: SkillDraft,
  opts: { allowOverwrite?: boolean } = {},
): Promise<void> {
  const nameError = validateSkillName(draft.name)
  if (nameError) throw new Error(nameError)
  const description = draft.description.trim()
  if (!description) throw new Error('Description is required.')
  if (description.length > 1024) throw new Error('Description must be 1024 characters or fewer.')

  // A brand-new skill has no directory yet; honor the documented default-on for
  // it. Reject an existing name on the create path (data-loss guard).
  const exists = await fs
    .stat(skillDir(draft.name))
    .then((s) => s.isDirectory())
    .catch(() => false)
  if (exists && !opts.allowOverwrite) {
    throw new Error(`A skill named "${draft.name}" already exists.`)
  }

  const content = composeSkillMd({ name: draft.name, description, body: draft.body })
  // Validate the composed file through the parser before writing, so a bad
  // description (e.g. one that breaks the YAML scalar parse) is rejected here
  // rather than silently disabling the skill at boot.
  parseSkillMarkdown(content, {
    directoryName: draft.name,
    path: skillMdPath(draft.name),
  })

  await fs.mkdir(skillDir(draft.name), { recursive: true })
  await fs.writeFile(skillMdPath(draft.name), content, { mode: 0o600 })

  if (!exists) {
    // `resolveEnabled` reads a PRESENT enable list as explicit opt-in, so a
    // freshly-created skill must be added to it or it would load disabled once
    // any toggle has materialized the list. No-op while the list is still absent
    // (then all-on covers it), but harmless and keeps the two code paths aligned.
    await ensureGlobalSkillEnabled(draft.name)
  }
}

/** Permanently delete a global skill directory. No-op if it doesn't exist. */
export async function deleteGlobalSkill(name: string): Promise<void> {
  await fs.rm(skillDir(name), { recursive: true, force: true })
}

/**
 * Toggle a global skill's enable state by rewriting the stored list. New skills
 * default to enabled; this is the only way to disable one. Resolves the current
 * on-disk set so stale names in the list (e.g. a skill deleted out-of-band)
 * can't keep a phantom enabled.
 */
export async function setGlobalSkillEnabled(name: string, enabled: boolean): Promise<void> {
  const current = await getEnabledGlobalSkills()
  // Normalize against what's actually on disk so the stored list can't carry
  // dead names.
  const onDisk = (await listGlobalSkills()).map((s) => s.name)
  const set = new Set((current ?? onDisk).filter((n) => onDisk.includes(n)))
  if (enabled) set.add(name)
  else set.delete(name)
  await setEnabledGlobalSkills([...set].sort())
}

// --- Manifest builder (for the Flue child) ----------------------------------
//
// The Electron main process can't pass live objects to the spawned Flue child,
// so it pre-packages enabled global skills into a JSON manifest the child reads
// at boot (server patch) and per-turn (agent factory). This mirrors how provider
// profiles/keys flow through NAVI_PROVIDERS_PATH / NAVI_PROVIDER_KEYS_PATH.

/**
 * Collect every regular file under a skill directory as GlobalSkillFile, sorted
 * by relative path (deterministic — required for a stable package id). Excludes
 * nothing here: sensitive-file / symlink rejection is Flue's job for imported
 * skills; for user-authored globals we trust the user's own userData. (A global
 * skill with a broken symlink simply fails to read and is skipped.) Symlinks are
 * followed, but resolved directory paths are tracked so a symlink cycle can't
 * recurse forever and hang the manifest build at backend start.
 */
async function collectSkillFiles(skillDir: string): Promise<GlobalSkillFile[]> {
  const out: GlobalSkillFile[] = []
  const seenDirs = new Set<string>()
  const walk = async (rel: string) => {
    const abs = path.join(skillDir, rel)
    let stat
    try {
      stat = await fs.stat(abs)
    } catch {
      return
    }
    if (stat.isDirectory()) {
      // Resolve the real path and skip directories already descended into, so a
      // symlink pointing at an ancestor terminates instead of looping forever.
      let real: string
      try {
        real = await fs.realpath(abs)
      } catch {
        return
      }
      if (seenDirs.has(real)) return
      seenDirs.add(real)
      for (const entry of await fs.readdir(abs)) {
        await walk(rel ? `${rel}/${entry}` : entry)
      }
    } else if (stat.isFile()) {
      const buf = await fs.readFile(abs)
      out.push({
        path: rel,
        content: buf.toString('base64'),
        kind: buf.includes(0) ? 'binary' : 'text',
      })
    }
  }
  await walk('')
  return out.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
}

/**
 * Build the manifest of ENABLED global skills, fully packaged so the child can
 * register them without touching userData. Each entry's id is derived from its
 * file contents, so editing a skill (then restarting) yields a new id — Flue
 * treats it as a fresh packaged skill. Returns only enabled, valid skills.
 */
export async function buildGlobalSkillsManifest(): Promise<GlobalSkillManifestEntry[]> {
  const skills = await listGlobalSkills()
  const enabled = skills.filter((s) => s.enabled)
  const entries: GlobalSkillManifestEntry[] = []
  for (const skill of enabled) {
    const files = await collectSkillFiles(skill.dirPath)
    entries.push({ name: skill.name, description: skill.description, files })
  }
  return entries
}
