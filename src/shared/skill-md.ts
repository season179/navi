// Spec-compliant Agent Skills SKILL.md frontmatter parser + validator.
//
// navi validates user-authored global skills (plan §D3-C) BEFORE writing them
// and when listing them, so a malformed skill is surfaced in the UI instead of
// silently failing to activate at boot. Flue has its own parser
// (@flue/runtime/internal → parseSkillMarkdown), but importing the `internal`
// subpath into the Electron main bundle pulls in native deps (@mongodb-js/zstd)
// that break esbuild's CJS bundle. So navi owns this small, pure validator.
//
// This mirrors Flue's documented rules (verified against the runtime in a spike):
//   - frontmatter is a YAML-ish block delimited by `---` lines at the top;
//   - `name` is required, must match the directory name, lowercase letters /
//     digits / hyphens, no leading/trailing/consecutive hyphens, ≤64 chars;
//   - `description` is required, non-empty, ≤1024 chars;
//   - other fields are accepted (license, compatibility, metadata,
//     allowed-tools) but not interpreted — Flue ignores unknowns too.
//
// If this parser ever diverges from Flue's acceptance, the worst case is a
// false positive: navi accepts a skill Flue rejects, which Flue then skips at
// boot with a warning (its discoverLocalSkills tolerance). It can never crash
// init — imported/packaged skills are strict, but navi's globals are runtime-
// registered, not imported, so they get the lenient discovered-skill path.
// A test asserts parity on the rules that matter (name + description).

/** Result of parsing a SKILL.md. */
export interface ParsedSkill {
  name: string
  description: string
  /** Everything after the frontmatter, verbatim. */
  body: string
}

/** Spec name rule: lowercase letters, digits, single hyphens between, ≤64. */
export const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Reserved skill-name prefix for built-ins (plan §D7). A global/project skill
 * must never take it, or it could collide-by-name with a built-in — a hard Flue
 * init failure (C3). The built-in catalog is the authority on what's reserved.
 */
export const RESERVED_SKILL_PREFIX = 'navi-'

/**
 * Validate a user-authored skill name against the spec + navi's `navi-*`
 * reservation (§D7). Returns a human-readable error string, or null when valid.
 * Shared by the main-process write guard (src/main/skills.ts) and the renderer's
 * live editor validation (SkillEditor.tsx) so the rules and messages can't drift.
 */
export function validateSkillName(name: string): string | null {
  if (!name.trim()) return 'Name is required.'
  if (name.length > 64) return 'Name must be 64 characters or fewer.'
  if (!SKILL_NAME_PATTERN.test(name)) {
    return 'Name must be lowercase letters, digits, and single hyphens (e.g. my-skill).'
  }
  if (name.startsWith(RESERVED_SKILL_PREFIX)) {
    return `Names starting with "${RESERVED_SKILL_PREFIX}" are reserved for built-in skills.`
  }
  return null
}

export class SkillParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SkillParseError'
  }
}

/**
 * Parse + validate a SKILL.md string. Throws SkillParseError on any violation.
 * `directoryName` is the expected skill name (Flue requires name === dir name).
 */
export function parseSkillMarkdown(
  content: string,
  opts: { directoryName: string; path?: string },
): ParsedSkill {
  const { directoryName, path = `<${directoryName}/SKILL.md>` } = opts

  // Frontmatter is the YAML block between the first two `---` lines. Require it
  // to start at the very top (no leading blank lines / BOM) — matches Flue.
  const lines = content.split(/\r?\n/)
  if (lines.length === 0 || lines[0].trim() !== '---') {
    throw new SkillParseError(`[navi] Skill ${path} must start with a \`---\` frontmatter block.`)
  }
  const closeIdx = lines.indexOf('---', 1)
  if (closeIdx === -1) {
    throw new SkillParseError(`[navi] Skill ${path} has an unclosed frontmatter block (missing closing \`---\`).`)
  }

  // Minimal YAML scalar parse: `key: value` per line, value is the trimmed
  // remainder. We only read the two required scalars; complex values (lists,
  // nested maps) for optional fields are ignored, matching Flue's "accepted,
  // not interpreted" stance. Quoted scalars are unwrapped of one layer.
  const front = lines.slice(1, closeIdx)
  const scalars = new Map<string, string>()
  for (const line of front) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const colon = trimmed.indexOf(':')
    if (colon === -1) continue
    const key = trimmed.slice(0, colon).trim()
    let value = trimmed.slice(colon + 1).trim()
    // Unwrap a single layer of matching quotes (Flue/YAML accepts `"x"` or `'x'`).
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1)
    }
    scalars.set(key, value)
  }

  const name = scalars.get('name')
  const description = scalars.get('description')

  if (!name) {
    throw new SkillParseError(`[navi] Skill ${path} must define frontmatter \`name\`.`)
  }
  if (name.length > 64) {
    throw new SkillParseError(
      `[navi] Skill ${path} frontmatter name "${name}" must be 64 characters or fewer.`,
    )
  }
  if (!SKILL_NAME_PATTERN.test(name)) {
    throw new SkillParseError(
      `[navi] Skill ${path} frontmatter name "${name}" must contain only lowercase letters, digits, and single hyphens.`,
    )
  }
  if (name !== directoryName) {
    throw new SkillParseError(
      `[navi] Skill ${path} declares frontmatter name "${name}", but it lives in directory "${directoryName}". The name must match the directory.`,
    )
  }

  if (!description) {
    throw new SkillParseError(`[navi] Skill ${path} must define frontmatter \`description\` as a non-empty string.`)
  }
  if (description.length > 1024) {
    throw new SkillParseError(
      `[navi] Skill ${path} description must be 1024 characters or fewer.`,
    )
  }

  // Body is everything after the closing `---`. Drop the single newline that
  // conventionally follows it so the body starts at real content.
  const body = lines.slice(closeIdx + 1).join('\n').replace(/^\r?\n/, '')
  return { name, description, body }
}

/** Compose a spec-valid SKILL.md from its parts (inverse of parseSkillMarkdown). */
export function composeSkillMd(draft: { name: string; description: string; body: string }): string {
  return `---\nname: ${draft.name}\ndescription: ${draft.description}\n---\n${draft.body}\n`
}
