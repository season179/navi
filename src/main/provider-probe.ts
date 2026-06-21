// Connection probe for a model provider, run in the MAIN process so the API key
// never crosses into the renderer and renderer CORS/CSP does not apply (navi's
// renderer CSP forbids cross-origin/loopback fetches anyway). Ported in spirit
// from Kun's provider-connection.ts, trimmed to navi's single wire protocol
// (openai-completions) — no proxy, no Anthropic messages format.

import type { ProbeResult } from '../shared/flue'
import { upstreamOpenAiModelsUrl } from '../shared/openai-compat-url'

const PROBE_TIMEOUT_MS = 10_000

export interface ProbeRequest {
  /** Effective base URL to probe (renderer resolves profile.baseUrl ?? preset default). */
  baseUrl?: string
  api: string
  apiKey: string
  id?: string
}

/**
 * Probe a provider by listing its `/models` endpoint. Returns the model ids on
 * success, or a short diagnostic message on failure. Used by both "Test
 * connection" and "Fetch models".
 */
export async function probeProvider(req: ProbeRequest): Promise<ProbeResult> {
  const baseUrl = req.baseUrl?.trim()
  if (!baseUrl) {
    return { ok: false, message: 'No base URL to probe. Set a base URL for this provider first.' }
  }
  if (!/^https?:\/\//i.test(baseUrl)) {
    return { ok: false, message: 'Base URL must start with http:// or https://.' }
  }

  const url = upstreamOpenAiModelsUrl(baseUrl)
  const headers: Record<string, string> = { Accept: 'application/json' }
  const key = req.apiKey.trim()
  if (key) headers.Authorization = `Bearer ${key}`

  const startedAt = Date.now()
  let res: Response
  let text: string
  try {
    res = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    })
    text = await res.text()
  } catch (e) {
    const message =
      e instanceof Error && e.name === 'TimeoutError'
        ? `Request to ${url} timed out after ${PROBE_TIMEOUT_MS / 1_000}s.`
        : e instanceof Error
          ? e.message
          : String(e)
    return { ok: false, message }
  }

  const latencyMs = Date.now() - startedAt
  if (!res.ok) {
    return { ok: false, message: `${url} responded ${res.status}: ${text.slice(0, 300)}` }
  }
  return { ok: true, latencyMs, modelIds: parseModelIds(text) }
}

function parseModelIds(body: string): string[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(body) as unknown
  } catch {
    return []
  }
  const data = (parsed as { data?: unknown }).data
  if (!Array.isArray(data)) return []
  const ids = new Set<string>()
  for (const row of data) {
    if (row && typeof row === 'object' && typeof (row as { id?: unknown }).id === 'string') {
      const id = (row as { id: string }).id.trim()
      if (id) ids.add(id)
    }
  }
  return [...ids]
}
