// Shared contract between the Electron main process, the preload bridge, and
// the renderer. Type-only — erased at build time, so it is safe to import from
// all three bundles (main/node, preload/node, renderer/browser).

export const AGENT_NAME = 'navi-assistant'

/** Backend readiness, surfaced to the UI so it can prompt for an API key. */
export interface FlueStatus {
  /** The spawned Flue child is listening and the SDK client is connected. */
  ready: boolean
  /** An Anthropic API key is configured (env or stored via safeStorage). */
  hasApiKey: boolean
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

/** The API exposed on `window.navi.flue` by the preload bridge. */
export interface FlueBridge {
  status(): Promise<FlueStatus>
  send(conversationId: string, message: string): Promise<FlueSendResult>
  cancel(requestId: string): Promise<void>
  setApiKey(key: string): Promise<{ ok: boolean; error?: string }>
  clearApiKey(): Promise<void>
  /** Subscribe to streamed prompt events. Returns an unsubscribe function. */
  onEvent(listener: (message: FlueStreamMessage) => void): () => void
  /** Subscribe to backend status changes. Returns an unsubscribe function. */
  onStatus(listener: (status: FlueStatus) => void): () => void
}
