/** Session usage snapshot for Kun's composer footer chip. */
export type ComposerThreadUsage = {
  totalTokens: number
  costUsd: number | null
  costCny?: number | null
  tokenEconomySavingsTokens: number
  cacheHitRate: number | null
  lastTurnCacheHitRate?: number | null
  cachedTokens: number
  cacheMissTokens: number
  turns: number
}

export type ComposerThreadUsagePreviewState = {
  usage: ComposerThreadUsage | null
  loading: boolean
}

/** Kun locale: sessionUsageTokens — "{{tokens}} tokens". */
export function formatComposerSessionUsageTokens(tokens: string): string {
  return `${tokens} tokens`
}

/** Kun locale: sessionUsageCost — "{{cost}}". */
export function formatComposerSessionUsageCost(cost: string): string {
  return cost
}

/** Kun locale: sessionUsageContextSavings — "saved {{tokens}} tokens". */
export function formatComposerSessionUsageContextSavings(tokens: string): string {
  return `saved ${tokens} tokens`
}

/** Kun locale: sessionUsageContextSavingsTitle — "Saved about {{tokens}} context tokens". */
export function formatComposerSessionUsageContextSavingsTitle(tokens: string): string {
  return `Saved about ${tokens} context tokens`
}

/** Kun locale: sessionUsageTurns — "{{turns}} turns". */
export function formatComposerSessionUsageTurns(turns: number): string {
  return `${turns} turns`
}

/** Kun locale: sessionUsageCache — "cache {{cache}}". */
export function formatComposerSessionUsageCache(cache: string): string {
  return `cache ${cache}`
}

/** Kun locale: sessionUsageLoading. */
export const COMPOSER_SESSION_USAGE_LOADING = 'Loading usage'

/** Kun locale: sessionUsageUnavailable. */
export const COMPOSER_SESSION_USAGE_UNAVAILABLE = 'No usage yet'

export function formatComposerCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return '0'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return new Intl.NumberFormat().format(Math.round(value))
}

function formatComposerMoneyValue(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0
  if (safeValue > 0 && safeValue < 0.0001) return '<0.0001'
  return safeValue.toFixed(safeValue >= 1 ? 2 : 4)
}

export function formatComposerCost(
  costUsd: number | null | undefined,
  costCny?: number | null,
): string {
  const hasUsd = typeof costUsd === 'number' && Number.isFinite(costUsd) && costUsd > 0
  const hasCny = typeof costCny === 'number' && Number.isFinite(costCny) && costCny > 0
  if (!hasUsd && !hasCny) return '-'
  if (hasCny) return `¥${formatComposerMoneyValue(costCny!)}`
  return `$${formatComposerMoneyValue(costUsd!)}`
}

export function formatComposerPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '-'
  const percent = Math.max(0, Math.min(100, value * 100))
  if (percent === 0 || percent >= 10) return `${Math.round(percent)}%`
  return `${percent.toFixed(1)}%`
}

export function primaryComposerCacheHitRate(
  usage: Pick<ComposerThreadUsage, 'cacheHitRate' | 'lastTurnCacheHitRate'>,
): number | null {
  return usage.lastTurnCacheHitRate ?? usage.cacheHitRate ?? null
}

/** Kun locale: sessionUsageDetailsTitle / sessionUsageDetailsTitleWithLatestCache. */
export function formatComposerThreadUsageTitle(usage: ComposerThreadUsage): string {
  const tokens = formatComposerCompactNumber(usage.totalTokens)
  const cost = formatComposerCost(usage.costUsd, usage.costCny)
  const saved = formatComposerCompactNumber(usage.tokenEconomySavingsTokens)
  const cache = formatComposerPercent(usage.cacheHitRate)
  const latestCache = formatComposerPercent(usage.lastTurnCacheHitRate ?? null)
  const cached = formatComposerCompactNumber(usage.cachedTokens)
  const miss = formatComposerCompactNumber(usage.cacheMissTokens)
  const turns = usage.turns

  if (usage.lastTurnCacheHitRate != null) {
    return `${tokens} tokens · ${cost} · saved ${saved} · cache ${cache} · latest cache ${latestCache} · ${cached} cached / ${miss} miss · ${turns} turns`
  }

  return `${tokens} tokens · ${cost} · saved ${saved} · cache ${cache} · ${cached} cached / ${miss} miss · ${turns} turns`
}

/** Mock usage for ?composerThreadUsagePreview visual verification. */
export const COMPOSER_THREAD_USAGE_PREVIEW = {
  totalTokens: 145_000,
  costUsd: 0.42,
  tokenEconomySavingsTokens: 12_000,
  cacheHitRate: 0.68,
  cachedTokens: 98_600,
  cacheMissTokens: 46_400,
  turns: 8,
} satisfies ComposerThreadUsage

/** Mock usage without context savings for no-savings preview hooks. */
export const COMPOSER_THREAD_USAGE_NO_SAVINGS_PREVIEW = {
  ...COMPOSER_THREAD_USAGE_PREVIEW,
  tokenEconomySavingsTokens: 0,
} satisfies ComposerThreadUsage

/** Mock usage with a single turn so cache segment is hidden. */
export const COMPOSER_THREAD_USAGE_SINGLE_TURN_PREVIEW = {
  ...COMPOSER_THREAD_USAGE_PREVIEW,
  turns: 1,
  cacheHitRate: 0.42,
} satisfies ComposerThreadUsage

export function resolveComposerThreadUsagePreview(
  mode: string | null,
): ComposerThreadUsagePreviewState {
  switch (mode) {
    case 'loading':
      return { usage: null, loading: true }
    case 'unavailable':
      return { usage: null, loading: false }
    case 'noSavings':
      return { usage: COMPOSER_THREAD_USAGE_NO_SAVINGS_PREVIEW, loading: false }
    case 'singleTurn':
      return { usage: COMPOSER_THREAD_USAGE_SINGLE_TURN_PREVIEW, loading: false }
    default:
      return { usage: COMPOSER_THREAD_USAGE_PREVIEW, loading: false }
  }
}
