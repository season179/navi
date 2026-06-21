import { createAgent, type AgentRouteHandler } from '@flue/runtime'
import { local } from '@flue/runtime/node'
import { readFileSync, existsSync } from 'fs'
import { REASONING_LEVELS, type ReasoningLevel } from '../../src/shared/flue'
import { OPENAI_PINNED_MODEL } from '../../src/shared/provider-presets'
import { resolveProjectCwd } from '../../src/shared/projects'
import { referencesFromManifest, type GlobalSkillManifestEntry } from '../../src/shared/global-skill-pkg'

// Built-in navi-* skills (plan §D3-A). Imported with the `skill` attribute so
// `flue build` inlines them (base64) into dist/server.mjs and they are available
// in EVERY conversation — including no-project chat, which has no cwd for Flue
// to discover workspace skills from. Adding one: drop a SKILL.md under
// src/skills/navi-<name>/ and import it here. Names MUST be `navi-`-prefixed
// (plan §D7) so a built-in can never collide-by-name with a project or global
// skill — Flue treats a same-name definition+discovery pair as a hard init
// failure, so this namespace is load-bearing.
import naviReleaseNotes from '../../src/skills/navi-release-notes/SKILL.md' with { type: 'skill' }
import naviCommitMessage from '../../src/skills/navi-commit-message/SKILL.md' with { type: 'skill' }

// The built-in skill set, in one place so the namespacing guard (D7) and the
// skills array stay in sync. Any name here is reserved: the global-skill writer
// rejects `navi-*`, and referencesFromManifest is given this set as an exclusion
// filter as defense-in-depth.
const BUILT_IN_SKILLS = [naviReleaseNotes, naviCommitMessage]
const BUILT_IN_NAMES = new Set(BUILT_IN_SKILLS.map((s) => s.name))

// Last-resort model specifier when a conversation has no pointer and no
// NAVI_DEFAULT_MODEL is injected (e.g. all providers deleted). Mirrors the
// single-OpenAI fallback in app.ts so both reference one source of truth.
const DEFAULT_MODEL_ID = `openai/${OPENAI_PINNED_MODEL.id}`

// Expose the agent over HTTP. Flue only marks an agent's `transports.http` when
// its module exports a `route` middleware (see normalizeBuiltModules in the
// generated server); without this the `POST /agents/navi-assistant/:id` route
// 404s with agent_not_found. Auth is already enforced globally in app.ts, so
// this is a passthrough.
export const route: AgentRouteHandler = async (_c, next) => next()

// Read + parse the app-owned conversation store once per turn. The factory runs
// per interaction and previously parsed this file twice (project cwd + model
// selection); parse it once here and feed both resolvers. Returns undefined on a
// missing/corrupt store; logs only unexpected (non-ENOENT) failures.
function readStore(storePath: string | undefined): unknown {
  if (!storePath) return undefined
  try {
    return JSON.parse(readFileSync(storePath, 'utf8'))
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string }
    if (err?.code !== 'ENOENT') {
      process.stderr.write(`[navi-agent] store read failed: ${err?.message ?? e}\n`)
    }
    return undefined
  }
}

function projectCwdFrom(store: unknown, id: string): string | undefined {
  if (!store) return undefined
  try {
    return resolveProjectCwd(store, id)
  } catch (e: unknown) {
    const err = e as { message?: string }
    process.stderr.write(`[navi-agent] resolveProjectCwd failed: ${err?.message ?? e}\n`)
    return undefined
  }
}

function isReasoning(v: unknown): v is ReasoningLevel {
  return typeof v === 'string' && (REASONING_LEVELS as readonly string[]).includes(v)
}

/**
 * Resolve this conversation's model + reasoning from its app-owned store
 * pointer (set by setActiveModel/setReasoning). Forced by navi's HTTP transport:
 * the SDK send call carries no per-prompt model, so selection must be a pointer
 * the factory reads. The factory re-runs per turn, so a switch takes effect next
 * turn with no restart. Falls through to the env default on any miss.
 */
function activeSelectionFrom(
  store: unknown,
  id: string,
): { model?: string; reasoning?: ReasoningLevel } {
  const conv = (
    (store as { conversations?: { id: string; providerId?: string; modelId?: string; reasoning?: unknown }[] } | undefined)
      ?.conversations
  )?.find((c) => c.id === id)
  if (conv?.providerId && conv?.modelId) {
    return {
      model: `${conv.providerId}/${conv.modelId}`,
      reasoning: isReasoning(conv.reasoning) ? conv.reasoning : undefined,
    }
  }
  return {}
}

/**
 * Read the enabled-global-skills manifest the Electron main process writes for
 * this child (plan §D5). The child never touches userData itself — main
 * pre-packages enabled globals into this 0600 JSON file and injects only its
 * path via NAVI_GLOBAL_SKILLS_MANIFEST. The matching packaged directories are
 * registered into Flue's packagedSkills Map at boot by the server patch, keyed
 * by the same id packageGlobalSkill produces here, so each reference resolves.
 *
 * The manifest is read per-turn (factory re-runs every interaction); a missing
 * or unreadable file is a quiet no-op (no global skills this turn), never a
 * crash — it's an enhancement layer, not a correctness path.
 */
function readGlobalSkillsManifest(manifestPath: string | undefined): GlobalSkillManifestEntry[] {
  if (!manifestPath) return []
  try {
    const parsed = JSON.parse(readFileSync(manifestPath, 'utf8'))
    return Array.isArray(parsed) ? (parsed as GlobalSkillManifestEntry[]) : []
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string }
    if (err?.code !== 'ENOENT') {
      process.stderr.write(`[navi-agent] global skills manifest read failed: ${err?.message ?? e}\n`)
    }
    return []
  }
}

/**
 * Assemble the skills array for the agent: built-ins (always) + enabled global
 * skills (from the manifest), minus any whose name collides with a built-in
 * (D7 defense-in-depth — the writer already rejects `navi-*`, but a stray
 * matching name must never reach Flue's merge or it would throw C3 and brick
 * the whole agent).
 */
function resolveSkills(manifestPath: string | undefined) {
  const manifest = readGlobalSkillsManifest(manifestPath)
  const globalRefs = referencesFromManifest(manifest, BUILT_IN_NAMES)
  return [...BUILT_IN_SKILLS, ...globalRefs]
}

export default createAgent((ctx) => {
  const store = readStore(ctx.env.NAVI_CONVERSATIONS_PATH)
  const sel = activeSelectionFrom(store, ctx.id)
  const model = sel.model ?? ctx.env.NAVI_DEFAULT_MODEL ?? DEFAULT_MODEL_ID
  const envReasoning = ctx.env.NAVI_DEFAULT_REASONING
  const thinkingLevel: ReasoningLevel =
    sel.reasoning ?? (isReasoning(envReasoning) ? envReasoning : 'medium')

  const skills = resolveSkills(ctx.env.NAVI_GLOBAL_SKILLS_MANIFEST)

  const cwd = projectCwdFrom(store, ctx.id)
  const base = [
    'You are Navi, an AI assistant inside a local-first desktop app.',
    'Be concise and helpful with writing, coding, analysis, and questions.',
  ]
  if (!cwd || !existsSync(cwd)) return { model, thinkingLevel, skills, instructions: base.join('\n') }
  return {
    model,
    thinkingLevel,
    skills,
    sandbox: local(),
    cwd,
    durability: { maxAttempts: 10, timeoutMs: 3_600_000 },
    instructions: [
      ...base,
      `You are working inside the project directory: ${cwd}.`,
      'You can read, search, edit files, and run shell commands here via your workspace tools. Prefer relative paths.',
    ].join('\n'),
  }
})
