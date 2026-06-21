// Shared contract between the Electron main process, the preload bridge, and
// the renderer. Type-only — erased at build time, so it is safe to import from
// all three bundles (main/node, preload/node, renderer/browser).

export const AGENT_NAME = 'navi-assistant'

// ---------------------------------------------------------------------------
// Multi-provider data model
//
// A provider is fully described by data: (id, name, api, baseUrl, models). Flue
// + pi-ai own the wire protocol, so navi only loops `registerProvider`. Keys are
// never part of these shapes — they live encrypted in main settings, keyed by id.
// ---------------------------------------------------------------------------

/**
 * Flue/pi-ai reasoning levels — exactly pi-ai's `ThinkingLevel` union (verified
 * against @earendil-works/pi-agent-core; there is no 'off'). pi-ai maps these
 * per-provider via `thinkingFormat` (e.g. deepseek collapses minimal/low/medium
 * → null, effectively "no reasoning"). Flue defaults to 'medium' when unset.
 *
 * Single source of truth: this ordered list (lowest → highest) drives the
 * reasoning-effort submenu, and the ReasoningLevel union is derived from it so
 * the runtime array and the type can never drift out of sync.
 */
export const REASONING_LEVELS = ['minimal', 'low', 'medium', 'high', 'xhigh'] as const
export type ReasoningLevel = (typeof REASONING_LEVELS)[number]

/** One model offered by a provider, as stored in a profile / preset. */
export interface ProviderModel {
  /** Provider-local model id, e.g. 'glm-5.2'. */
  id: string
  /** Display label; falls back to the id. */
  label?: string
  /** Drives the capability badge; from preset/catalog, default false (text-only). */
  vision?: boolean
  /**
   * OMIT for catalog models so the catalog's real values win (§F5). Only a
   * pinned, catalog-unknown snapshot (the dated OpenAI model) should set these.
   */
  contextWindow?: number
  maxTokens?: number
}

/**
 * A one-click "Add provider" template. `catalog: true` means Flue's pi-ai
 * catalog already knows this id (api/baseUrl optional); `false` means a custom
 * id that MUST supply `api` + `baseUrl` to `registerProvider` or it throws.
 */
export interface ProviderPreset {
  id: string
  name: string
  catalog: boolean
  /** Required only when `catalog === false`; otherwise 'openai-completions'. */
  api: string
  /** Probe + display + the profile's default base URL. Blank ⇒ catalog default. */
  defaultBaseUrl?: string
  /** Env var the key can be sourced from in main (dev override), e.g. 'DEEPSEEK_API_KEY'. */
  apiKeyEnv?: string
  defaultModels: ProviderModel[]
  /** "Get a key" link shown as a hint in the key field. */
  apiKeyUrl?: string
}

/** A configured provider, persisted (non-secret) in navi-settings.json. */
export interface ProviderProfile {
  /** providerId; validated to /^[a-z0-9-]+$/ so `<providerId>/<modelId>` never parses ambiguously. */
  id: string
  name: string
  /** 'openai-completions' for every supported target. */
  api: string
  /** undefined ⇒ catalog/default base URL. */
  baseUrl?: string
  models: ProviderModel[]
  headers?: Record<string, string>
  // No apiKey here — it lives encrypted in main settings, keyed by id.
}

/** App-default selection applied to new conversations. */
export interface DefaultSelection {
  providerId: string
  modelId: string
  reasoning: ReasoningLevel
}

/** Per-provider readiness, surfaced to the settings UI. */
export interface ProviderStatus {
  id: string
  name: string
  /** 'ok' = key resolvable; 'absent' = no key; 'unreadable' = stored but safeStorage can't decrypt (§F8). */
  keyState: 'ok' | 'absent' | 'unreadable'
  baseUrl?: string
}

/**
 * Renderer-safe freshness fingerprint — NO secret. (§F2)
 * `[id, baseUrl ?? '', api, modelsHash, hasKey].join('\0')`. Kun's includes the
 * raw key; navi must never hold a key in renderer state.
 */
export type ProviderFingerprint = string

/** Result of a main-process connection probe (test / fetch-models). */
export type ProbeResult =
  | { ok: true; latencyMs: number; modelIds: string[] }
  | { ok: false; message: string }

/** Backend readiness, surfaced to the UI so it can prompt for credentials. */
export interface FlueStatus {
  /** The spawned Flue child is listening and the SDK client is connected. */
  ready: boolean
  /** Per-provider key state, for the settings UI dots. */
  providers: ProviderStatus[]
  /** Resolved default selection (model new conversations start with), labelled. */
  active?: { providerId: string; modelId: string; label: string; reasoning: ReasoningLevel }
  /** Last fatal error from the backend, if any. */
  error?: string
}

/**
 * True when at least one configured provider is actually usable for chatting: it
 * has a decryptable key AND at least one model to select. A keyed provider with
 * no models would otherwise enable the composer but leave the picker empty, and
 * send() would fall back to an unconfigured default and fail on the first turn.
 */
export function hasUsableProvider(status: FlueStatus, providers: ProviderProfile[]): boolean {
  const keyed = new Set(status.providers.filter((p) => p.keyState === 'ok').map((p) => p.id))
  return providers.some((p) => keyed.has(p.id) && p.models.length > 0)
}

/** Token/cost usage for one prompt, forwarded on the terminal event. */
export interface FlueUsage {
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
  costUsd?: number
}

/**
 * Streamed updates for one prompt, pushed main → renderer over the
 * `flue:event` IPC channel. Correlate by `requestId`; group into a
 * conversation by `conversationId` (the agent instance id).
 */
export type FlueStreamMessage =
  | { requestId: string; conversationId: string; kind: 'delta'; text: string }
  | { requestId: string; conversationId: string; kind: 'thinking'; text: string }
  | { requestId: string; conversationId: string; kind: 'done'; text: string; usage?: FlueUsage }
  | { requestId: string; conversationId: string; kind: 'error'; error: string }

/** Result of admitting a prompt. Events then arrive on the stream channel. */
export interface FlueSendResult {
  requestId: string
}

/** One persisted message bubble (a settled turn — never mid-stream). */
export interface PersistedMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  status: 'done' | 'error'
}

/** Lightweight conversation descriptor for the sidebar list (no message bodies). */
export interface ConversationMeta {
  id: string
  projectId: string
  title: string
  createdAt: number
  updatedAt: number
  // Per-conversation model selection (app-owned pointer the agent reads per turn).
  // Absent ⇒ the conversation uses the app default selection.
  providerId?: string
  modelId?: string
  reasoning?: ReasoningLevel
}

/** Directory-backed project shown in the sidebar tree. */
export interface ProjectMeta {
  id: string
  path: string
  name: string
  label: string
  createdAt: number
  updatedAt: number
}

/** The API exposed on `window.navi.flue` by the preload bridge. */
export interface FlueBridge {
  status(): Promise<FlueStatus>
  send(conversationId: string, message: string): Promise<FlueSendResult>
  cancel(requestId: string): Promise<void>

  // --- Multi-provider ---
  /** Configured provider profiles (with model lists) for the settings UI + picker. */
  listProviders(): Promise<ProviderProfile[]>
  /** Create/replace a provider (and optionally its key), then restart the backend. */
  upsertProvider(profile: ProviderProfile, apiKey?: string): Promise<{ ok: boolean; error?: string }>
  /** Delete a provider, cascade-clear conversation pointers, then restart. */
  deleteProvider(id: string): Promise<{ ok: boolean; error?: string }>
  /** The app-default selection applied to new conversations. */
  getDefaultSelection(): Promise<DefaultSelection | undefined>
  /** Set the app-default selection (used by new conversations). */
  setDefaultSelection(sel: DefaultSelection): Promise<void>
  /** Probe a provider's models endpoint from MAIN (test connection / fetch models). */
  probeProvider(req: {
    baseUrl?: string
    apiKey: string
    id?: string
  }): Promise<ProbeResult>
  /** Point a conversation at a provider+model (no restart; agent re-reads next turn). */
  setActiveModel(conversationId: string, providerId: string, modelId: string): Promise<void>
  /** Set a conversation's reasoning effort (no restart). */
  setReasoning(conversationId: string, level: ReasoningLevel): Promise<void>
  /** Subscribe to streamed prompt events. Returns an unsubscribe function. */
  onEvent(listener: (message: FlueStreamMessage) => void): () => void
  /** Subscribe to backend status changes. Returns an unsubscribe function. */
  onStatus(listener: (status: FlueStatus) => void): () => void
  /** List stored projects, most-recently-updated first. */
  listProjects(): Promise<ProjectMeta[]>
  /** Open a native folder picker and register the chosen directory as a project. */
  createProject(): Promise<ProjectMeta | null>
  /** Delete a project and cascade-delete its conversations. */
  deleteProject(id: string): Promise<void>
  /** List stored conversations, most-recently-updated first. */
  listConversations(): Promise<ConversationMeta[]>
  /** Load the persisted message thread for one conversation (empty if unknown). */
  getConversation(id: string): Promise<PersistedMessage[]>
  /** Upsert a conversation's title + thread (bumps its updatedAt). */
  saveConversation(
    id: string,
    projectId: string,
    title: string,
    messages: PersistedMessage[],
  ): Promise<void>
  /** Delete a stored conversation thread. */
  deleteConversation(id: string): Promise<void>

  // --- Agent skills (plan §D3 / §D6) ---
  /**
   * List every available skill across all three sources, for the Skills panel
   * and the composer picker. `projectPath` (the active conversation's project
   * cwd, if any) scopes which project skills are surfaced — absent ⇒ no project
   * skills (no-project chat). Built-in and global skills are always present.
   */
  listSkills(projectPath?: string): Promise<SkillSummary[]>
  /**
   * Load one skill's full detail (body + path). Null if missing/invalid.
   * `projectPath` is required to resolve a project skill (it has no global
   * location); built-in/global skills ignore it.
   */
  getSkill(source: SkillSource, name: string, projectPath?: string): Promise<SkillDetail | null>
  /** Create a global skill (validates + persists). Rejects `navi-*` (§D7). */
  createGlobalSkill(draft: SkillDraft): Promise<{ ok: boolean; error?: string }>
  /** Update an existing global skill's description/body (name is fixed). */
  updateGlobalSkill(
    name: string,
    draft: { description: string; body: string },
  ): Promise<{ ok: boolean; error?: string }>
  /** Delete a global skill directory. */
  deleteGlobalSkill(name: string): Promise<{ ok: boolean; error?: string }>
  /** Enable/disable a global skill (persisted; takes effect on next restart). */
  setGlobalSkillEnabled(name: string, enabled: boolean): Promise<void>
  /** Reveal a skill's SKILL.md in the OS file manager. */
  openSkillFile(source: SkillSource, name: string): Promise<void>
}

// ---------------------------------------------------------------------------
// Agent skills (plan §D3 / §D6)
//
// Three sources, each surfaced honestly in the UI:
//   built-in — bundled navi-* skills, always on (every conversation).
//   project  — auto-discovered under <project-cwd>/.agents/skills/ (project
//              chats only; Flue does the discovery, navi just lists them).
//   global   — userData/skills/<name>/, user-managed, toggleable, every
//              conversation via the packagedSkills seam (§D5).
// ---------------------------------------------------------------------------

export type SkillSource = 'built-in' | 'project' | 'global'

/** A skill as shown in lists (panel + composer picker). */
export interface SkillSummary {
  name: string
  description: string
  source: SkillSource
  /**
   * Whether the skill is active in the current context. Honest state (§D6):
   *   built-in → always true (rebuild to remove; never a fake toggle);
   *   project  → true only when a project is open (the only context it loads in);
   *   global   → the persisted enable flag.
   */
  availableNow: boolean
  /** Built-in/project skills are always-on; only global supports a real toggle. */
  canToggle: boolean
}

/** A skill with its full SKILL.md body + filesystem path (detail view). */
export interface SkillDetail extends SkillSummary {
  /** SKILL.md body (after frontmatter). */
  body: string
  /** Absolute path to the directory, for "open file" (built-ins have none). */
  dirPath?: string
}

/** Fields for creating/editing a global skill. */
export interface SkillDraft {
  name: string
  description: string
  body: string
}

/**
 * The built-in navi-* skill catalog. Mirrors the imports in
 * .flue/agents/navi-assistant.ts — keep these in sync when adding a built-in.
 * The renderer reads this to render built-in cards without crossing into the
 * agent bundle, and the IPC layer reads it to answer listSkills() for built-ins.
 * Test (§7) asserts this set matches the agent's BUILT_IN_NAMES.
 */
export const BUILT_IN_SKILLS: readonly { name: string; description: string }[] = [
  {
    name: 'navi-release-notes',
    description:
      'Draft concise, user-facing release notes from a git diff or a list of commits.',
  },
  {
    name: 'navi-commit-message',
    description:
      'Write a Conventional Commits message for staged or recent changes.',
  },
]

/**
 * One-click global-skill starters (plan §D6). Body is a spec-valid SKILL.md
 * body; name + description seed the frontmatter. None use the reserved
 * `navi-*` prefix. Curated to cover common personal-skill shapes.
 */
export const SKILL_STARTERS: readonly SkillDraft[] = [
  {
    name: 'summarize-thread',
    description: 'Condense a long chat or document into a tight bulleted summary.',
    body: `# Summarize\n\nProduce a summary a busy reader can act on.\n\n## Steps\n1. Read the full input once.\n2. Pull out the decisions, open questions, and action items.\n3. Drop restatements and filler.\n\n## Format\n- Lead with a one-sentence TL;DR.\n- Then bullets grouped as **Decisions**, **Actions** (with owners if known), **Open questions**.\n- One line per bullet. Skip empty groups.\n`,
  },
  {
    name: 'explain-code',
    description: 'Explain a code snippet clearly for someone unfamiliar with it.',
    body: `# Explain code\n\nExplain code so a newcomer can follow.\n\n## Steps\n1. Say what the code does in one plain sentence first.\n2. Walk through the non-obvious parts in order of importance, not line order.\n3. Call out any trap, invariant, or implicit assumption.\n\n## Rules\n- No jargon without a one-line gloss.\n- Skip what the reader can already see. Explain the *why*, not the *what*.\n`,
  },
  {
    name: 'meeting-notes',
    description: 'Turn raw meeting notes or a transcript into clean, shareable notes.',
    body: `# Meeting notes\n\nTurn rough notes into notes others can use.\n\n## Format\n\`\`\`\n# <topic> — <date>\n\nAttendees: …\n\n## Decisions\n- …\n\n## Action items\n- [ ] <task> — @owner\n\n## Discussion\n- …\n\`\`\`\n\n## Rules\n- Decisions are past-tense, final.\n- Every action item has an owner; if unknown, mark \`@unassigned\`.\n- Discussion is compressed to the points that explain the decisions.\n`,
  },
]
