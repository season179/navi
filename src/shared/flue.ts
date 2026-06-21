// Shared contract between the Electron main process, the preload bridge, and
// the renderer. Type-only — erased at build time, so it is safe to import from
// all three bundles (main/node, preload/node, renderer/browser).

export const AGENT_NAME = 'navi-assistant'

// Single source of truth for the model, shared by the Flue backend
// (.flue/app.ts registerProvider key + .flue/agents/navi-assistant.ts) and the
// renderer (the composer chip). Change it here and all three stay in sync.
/** Provider-local model id (no provider prefix) — the registerProvider key. */
export const MODEL_NAME = 'gpt-5.4-nano-2026-03-17'
/** Fully-qualified model specifier passed to createAgent. */
export const MODEL_ID = `openai/${MODEL_NAME}`
/** Human-readable label for the active model, shown in the composer chip. */
export const MODEL_LABEL = 'GPT-5.4 nano'

/** Backend readiness, surfaced to the UI so it can prompt for an API key. */
export interface FlueStatus {
  /** The spawned Flue child is listening and the SDK client is connected. */
  ready: boolean
  /** An OpenAI API key is configured (env or stored via safeStorage). */
  hasApiKey: boolean
  /** Effective OpenAI base URL, or undefined for the default (direct OpenAI). */
  baseUrl?: string
  /** Last fatal error from the backend, if any. */
  error?: string
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
  setApiKey(key: string): Promise<{ ok: boolean; error?: string }>
  /** Set (or clear, with an empty string) the OpenAI base URL and restart the backend. */
  setBaseUrl(url: string): Promise<{ ok: boolean; error?: string }>
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
