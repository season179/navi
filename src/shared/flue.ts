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
 */
export type ReasoningLevel = 'minimal' | 'low' | 'medium' | 'high' | 'xhigh'

/** Ordered for the reasoning-effort submenu (lowest → highest). */
export const REASONING_LEVELS: ReasoningLevel[] = ['minimal', 'low', 'medium', 'high', 'xhigh']

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

/** True when at least one configured provider has a usable (decryptable) key. */
export function hasUsableProvider(status: FlueStatus): boolean {
  return status.providers.some((p) => p.keyState === 'ok')
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
  /** Store/replace a provider's API key (encrypted in main), then restart. */
  setProviderKey(id: string, key: string): Promise<{ ok: boolean; error?: string }>
  /** The app-default selection applied to new conversations. */
  getDefaultSelection(): Promise<DefaultSelection | undefined>
  /** Set the app-default selection (used by new conversations). */
  setDefaultSelection(sel: DefaultSelection): Promise<void>
  /** Probe a provider's models endpoint from MAIN (test connection / fetch models). */
  probeProvider(req: {
    baseUrl?: string
    api: string
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
}
