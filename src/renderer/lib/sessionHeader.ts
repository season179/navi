// Kun SessionHeader chrome
// (../Kun/src/renderer/src/components/SessionHeader.tsx).
// Visual only — used for production SessionHeader and preview hooks.

/** English copy matching Kun's noSessionSelected locale string. */
export const SESSION_HEADER_NO_THREAD_SELECTED = 'No thread selected'

/** English copy matching Kun's sessionHeaderHint locale string. */
export const SESSION_HEADER_EMPTY_HINT =
  'Start a thread from the left, or reconnect the runtime to continue working.'

/** English copy matching Kun's renameThreadHint locale string. */
export const SESSION_HEADER_RENAME_THREAD_HINT = 'Click to rename thread'

/** English copy matching Kun's running locale string. */
export const SESSION_HEADER_RUNNING_LABEL = 'Running…'

/** English copy matching Kun's sessionForked locale string. */
export const SESSION_HEADER_FORKED_LABEL = 'Forked thread'

/** English copy matching Kun's sessionForkedFrom locale string. */
export const SESSION_FORKED_FROM_TEMPLATE = 'Forked from {{title}}'

/** English copy matching Kun's sessionForkedFromCompact locale string. */
export const SESSION_FORKED_FROM_COMPACT_TEMPLATE = 'from {{title}}'

/** English copy matching Kun's sessionUsageTitle locale string. */
export const SESSION_USAGE_TITLE_TEMPLATE = '{{turns}} turns in this thread'

/** English copy matching Kun's sessionUsageTokens locale string. */
export const SESSION_USAGE_TOKENS_TEMPLATE = '{{tokens}} tokens'

/** English copy matching Kun's sessionUsageCost locale string. */
export const SESSION_USAGE_COST_TEMPLATE = '{{cost}}'

/** English copy matching Kun's sessionUsageCache locale string. */
export const SESSION_USAGE_CACHE_TEMPLATE = 'cache {{cache}}'

/** English copy matching Kun's sessionUsageCacheTitle locale string. */
export const SESSION_USAGE_CACHE_TITLE_TEMPLATE =
  'Cumulative cache {{cache}} · {{cached}} cached / {{miss}} miss'

/** English copy matching Kun's sessionUsageCacheTitleWithLatest locale string. */
export const SESSION_USAGE_CACHE_TITLE_WITH_LATEST_TEMPLATE =
  'Latest turn cache {{latestCache}} · cumulative {{cache}} · {{cached}} cached / {{miss}} miss'

export function formatSessionForkedFrom(title: string): string {
  return SESSION_FORKED_FROM_TEMPLATE.replace('{{title}}', title)
}

export function formatSessionForkedFromCompact(title: string): string {
  return SESSION_FORKED_FROM_COMPACT_TEMPLATE.replace('{{title}}', title)
}

export function formatSessionUsageTitle(turns: number): string {
  return SESSION_USAGE_TITLE_TEMPLATE.replace('{{turns}}', String(turns))
}

export function formatSessionUsageTokens(tokens: string): string {
  return SESSION_USAGE_TOKENS_TEMPLATE.replace('{{tokens}}', tokens)
}

export function formatSessionUsageCost(cost: string): string {
  return SESSION_USAGE_COST_TEMPLATE.replace('{{cost}}', cost)
}

export function formatSessionUsageCache(cache: string): string {
  return SESSION_USAGE_CACHE_TEMPLATE.replace('{{cache}}', cache)
}

export function formatSessionUsageCacheTitle(options: {
  cache: string
  cached: string
  miss: string
  latestCache?: string | null
}): string {
  if (options.latestCache != null) {
    return SESSION_USAGE_CACHE_TITLE_WITH_LATEST_TEMPLATE.replace(
      '{{latestCache}}',
      options.latestCache,
    )
      .replace('{{cache}}', options.cache)
      .replace('{{cached}}', options.cached)
      .replace('{{miss}}', options.miss)
  }
  return SESSION_USAGE_CACHE_TITLE_TEMPLATE.replace('{{cache}}', options.cache)
    .replace('{{cached}}', options.cached)
    .replace('{{miss}}', options.miss)
}
