// Build the `.../models` URL for OpenAI-compatible providers. Ported verbatim
// from Kun (src/shared/openai-compat-url.ts), which mirrors DeepSeek-TUI's
// `client::api_url(base, "models")` so a `/beta` base still hits `/v1/models`.
//
// Why this matters for navi: a naive `${base}/models` 404s for DeepSeek
// (https://api.deepseek.com/models is not the documented endpoint; /v1/models
// is). versionedBaseUrl appends `v1` only when the base's last path segment
// isn't already a version (`v\d+` / `beta`), so z.ai's `.../v4` base is left
// intact (§F6).

function splitUrlSuffix(url: string): { path: string; suffix: string } {
  const query = url.search(/[?#]/)
  if (query < 0) return { path: url, suffix: '' }
  return { path: url.slice(0, query), suffix: url.slice(query) }
}

function appendUrlPath(baseUrl: string, path: string): string {
  const split = splitUrlSuffix(baseUrl)
  return `${split.path.replace(/\/+$/, '')}/${path}${split.suffix}`
}

function trimUrlPathEnd(baseUrl: string): string {
  const split = splitUrlSuffix(baseUrl.trim())
  return `${split.path.replace(/\/+$/, '')}${split.suffix}`
}

function lastPathSegment(baseUrl: string): string {
  const split = splitUrlSuffix(baseUrl.trim())
  return split.path.replace(/\/+$/, '').split('/').pop() ?? ''
}

function isVersionSegment(segment: string): boolean {
  const s = segment.toLowerCase()
  if (s === 'beta') return true
  return /^v\d+$/i.test(segment)
}

function unversionedBaseUrl(baseUrl: string): string {
  const split = splitUrlSuffix(baseUrl)
  const trimmed = split.path.replace(/\/+$/, '')
  const slash = trimmed.lastIndexOf('/')
  if (slash < 0) return `${trimmed}${split.suffix}`
  const seg = trimmed.slice(slash + 1)
  if (isVersionSegment(seg)) return `${trimmed.slice(0, slash)}${split.suffix}`
  return `${trimmed}${split.suffix}`
}

function versionedBaseUrl(baseUrl: string): string {
  const trimmed = trimUrlPathEnd(baseUrl)
  const seg = lastPathSegment(trimmed)
  if (isVersionSegment(seg)) return trimmed
  return appendUrlPath(trimmed, 'v1')
}

export function upstreamOpenAiModelsUrl(baseUrl: string): string {
  const path = 'models'
  const endpointBase = baseUrl.trim()
  let versioned = versionedBaseUrl(endpointBase)
  if (lastPathSegment(versioned).toLowerCase() === 'beta') {
    versioned = appendUrlPath(unversionedBaseUrl(endpointBase), 'v1')
  }
  return appendUrlPath(versioned, path)
}
