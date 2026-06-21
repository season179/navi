// Pure, Flue-internal-free packaging of user-global skills for the
// `packagedSkills` seam (plan §D5). This module is the single source of truth
// for how a global skill in `userData/skills/<name>/` becomes the two shapes
// Flue's runtime needs to treat it as a packaged skill available in EVERY
// conversation (including no-project chat, which has no cwd to discover from):
//
//   1. a PackagedSkillDirectory  → registered into the runtime's packagedSkills
//      Map at server boot (scripts/patch-flue-server.mjs), keyed by `id`.
//   2. a SkillReference          → synthesized in the agent factory per turn
//      (`.flue/agents/navi-assistant.ts`) and passed via `skills: [...]`.
//
// Both carry the same `id`, so the runtime's `resolvePackagedSkill(reference)`
// lookup (`packagedSkills?.[reference.id]`) succeeds and the skill activates.
//
// Why navi owns this instead of reusing Flue's build-time `packageSkill`: that
// path only runs at `flue build` for `import ... with { type: 'skill' }`. User
// global skills are created at runtime, so they can't go through the import.
// The `id` only needs to be (a) stable for a given skill content and (b)
// identical between the reference and the directory — it does NOT need to match
// Flue's own hash byte-for-byte, because navi produces BOTH sides. So this is a
// self-consistent contract, not a reimplementation of Flue's hash.
//
// This file is type-only at runtime (erased by esbuild), so it is safe to
// import from the main (node), preload (node), and agent (.flue) bundles.

import { createHash } from 'node:crypto'

/** One file inside a packaged skill directory, base64-encoded. */
export interface GlobalSkillFile {
  /** Relative path within the skill dir, POSIX separators (e.g. "SKILL.md"). */
  path: string
  /** base64 of the file bytes. */
  content: string
  /** "text" or "binary", matching Flue's PackagedSkillDirectory file kind. */
  kind: 'text' | 'binary'
}

/**
 * The directory shape Flue's runtime expects under packagedSkills[id]. Mirrors
 * what `packageSkill` emits in @flue/cli: { id, name, description, files }.
 */
export interface GlobalPackagedSkill {
  /** `skill:<name>:<16 hex>` — must equal the matching SkillReference.id. */
  id: string
  name: string
  description: string
  /** Keyed by relative path (POSIX), matching Flue's `files` map. */
  files: Record<string, { encoding: 'base64'; kind: 'text' | 'binary'; content: string }>
}

/**
 * The reference shape Flue's runtime expects in an agent's `skills` array for a
 * packaged skill. Carries `__flueSkillReference: true` so the runtime routes
 * activation through `resolvePackagedSkill` instead of workspace discovery.
 */
export interface GlobalSkillReference {
  __flueSkillReference: true
  id: string
  name: string
  description: string
}

/**
 * One enabled global skill, as written to the handoff manifest the Electron
 * main process passes to the Flue child. The child (server patch + agent
 * factory) consumes this verbatim — it never reads userData itself.
 */
export interface GlobalSkillManifestEntry {
  name: string
  description: string
  /** Pre-packaged files, already base64 + kind-classified by main. */
  files: GlobalSkillFile[]
}

/**
 * Build the stable id for a packaged global skill. SHA-256 over a deterministic
 * serialization of the file list (path + kind + content), truncated to 16 hex
 * chars. Stable across processes and restarts for identical content; changes
 * when any file changes (so a re-packaged edited skill gets a fresh id).
 *
 * Determinism contract: the same set of files in the same order with the same
 * bytes ALWAYS yields the same id. Callers must sort files by path before
 * calling so directory iteration order can't perturb the hash.
 */
export function globalSkillId(name: string, files: GlobalSkillFile[]): string {
  // Web Crypto (available in main via Electron's Node, and in the agent child).
  // SHA-256 is more than enough entropy for a local-content fingerprint; we
  // keep 16 hex chars (64 bits) to match Flue's id length.
  let input = name
  for (const f of files) input += `\0${f.path}\0${f.kind}\0${f.content}`
  const hash = sha256Hex(input)
  return `skill:${name}:${hash.slice(0, 16)}`
}

/**
 * Package one global skill into the two runtime shapes, derived from the same
 * id so they agree. Pure: given identical input it returns identical output.
 */
export function packageGlobalSkill(entry: GlobalSkillManifestEntry): {
  directory: GlobalPackagedSkill
  reference: GlobalSkillReference
} {
  // Tolerate a missing `files` (matches the boot seam's `entry.files || []`): a
  // malformed manifest entry must never throw here, or the per-turn agent
  // factory would brick while the boot seam merely skips it.
  const sorted = [...(entry.files ?? [])].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
  const id = globalSkillId(entry.name, sorted)
  const files: GlobalPackagedSkill['files'] = {}
  for (const f of sorted) {
    files[f.path] = { encoding: 'base64', kind: f.kind, content: f.content }
  }
  const directory: GlobalPackagedSkill = { id, name: entry.name, description: entry.description, files }
  const reference: GlobalSkillReference = {
    __flueSkillReference: true,
    id,
    name: entry.name,
    description: entry.description,
  }
  return { directory, reference }
}

/**
 * Build SkillReferences for a manifest (agent factory path). Returns references
 * only — the matching directories are registered server-side by the patch.
 * Filters out any name in `excludeNames` (defense-in-depth for D7: a `navi-*`
 * global can't be created, but if one slipped in it must never reach the
 * factory's skills array, or it would collide with the built-in).
 */
export function referencesFromManifest(
  manifest: GlobalSkillManifestEntry[],
  excludeNames?: ReadonlySet<string>,
): GlobalSkillReference[] {
  const out: GlobalSkillReference[] = []
  for (const entry of manifest) {
    // Skip malformed entries (matches the boot seam's guard) so a corrupt
    // manifest can't crash the factory mid-turn.
    if (!entry || typeof entry.name !== 'string') continue
    if (excludeNames?.has(entry.name)) continue
    out.push(packageGlobalSkill(entry).reference)
  }
  return out
}

// --- SHA-256 helper --------------------------------------------------------
// Synchronous SHA-256 via Node's crypto (this module runs in node contexts:
// Electron main, the agent child, and node:test). Kept local so the module has
// no async surface and stays trivially unit-testable. If this ever needs to run
// in a browser bundle, swap for a Web Crypto async variant behind a seam.
function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex')
}
