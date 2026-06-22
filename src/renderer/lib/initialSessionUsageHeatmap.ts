// Kun InitialSessionUsageHeatmap chrome
// (../Kun/src/renderer/src/components/chat/InitialSessionUsageHeatmap.tsx).
// Visual only — used for production InitialSessionUsageHeatmap and preview hooks.

export type UsageHeatmapViewMode = 'populated' | 'loading' | 'empty' | 'error'
export type UsageHeatmapRangeKey = 'all' | '90d' | '30d' | '7d'
export type UsageHeatmapWarmupMode = Exclude<UsageHeatmapViewMode, 'populated'>

/** English copy matching Kun's usageHeatmapTitle locale string. */
export const USAGE_HEATMAP_TITLE = 'Your recent agent rhythm'

/** Navi-branded equivalent of Kun's usageHeatmapSub locale string. */
export const USAGE_HEATMAP_SUB =
  'Start from the work pattern you have already built. Each day is colored by Navi token usage, with turns, cost, threads, and cache detail available from the cells.'

/** English copy matching Kun's usageHeatmapTabOverview locale string. */
export const USAGE_HEATMAP_TAB_OVERVIEW = 'Overview'

/** English copy matching Kun's usageHeatmapTabModels locale string. */
export const USAGE_HEATMAP_TAB_MODELS = 'Models'

/** English copy matching Kun's usageHeatmapRange locale strings. */
export const USAGE_HEATMAP_RANGE_LABELS: Record<UsageHeatmapRangeKey, string> = {
  all: 'All',
  '90d': '90d',
  '30d': '30d',
  '7d': '7d',
}

/** Navi-branded equivalent of Kun's usageHeatmapGridLabel locale string. */
export const USAGE_HEATMAP_GRID_LABEL = 'Daily Navi usage calendar'

/** English copy matching Kun's usageHeatmapLoading locale string. */
export const USAGE_HEATMAP_LOADING = 'Loading recent usage…'

/** English copy matching Kun's usageHeatmapCollapse locale string. */
export const USAGE_HEATMAP_COLLAPSE = 'Collapse calendar'

/** English copy matching Kun's usageHeatmapExpand locale string. */
export const USAGE_HEATMAP_EXPAND = 'Expand calendar'

/** English copy matching Kun's usageHeatmapRefresh locale string. */
export const USAGE_HEATMAP_REFRESH = 'Refresh'

/** English copy matching Kun's usageHeatmapSessions locale string. */
export const USAGE_HEATMAP_SESSIONS = 'Sessions'

/** English copy matching Kun's usageHeatmapMessages locale string. */
export const USAGE_HEATMAP_MESSAGES = 'Messages'

/** English copy matching Kun's usageHeatmapTotalTokens locale string. */
export const USAGE_HEATMAP_TOTAL_TOKENS = 'Total tokens'

/** English copy matching Kun's usageHeatmapActiveDays locale string. */
export const USAGE_HEATMAP_ACTIVE_DAYS = 'Active days'

/** English copy matching Kun's usageHeatmapCurrentStreak locale string. */
export const USAGE_HEATMAP_CURRENT_STREAK = 'Current streak'

/** English copy matching Kun's usageHeatmapLongestStreak locale string. */
export const USAGE_HEATMAP_LONGEST_STREAK = 'Longest streak'

/** English copy matching Kun's usageHeatmapCost locale string. */
export const USAGE_HEATMAP_COST = 'Cost'

/** English copy matching Kun's usageHeatmapCacheSavings locale string. */
export const USAGE_HEATMAP_CACHE_SAVINGS = 'Cache hits saved'

/** English copy matching Kun's usageHeatmapContextSavings locale string. */
export const USAGE_HEATMAP_CONTEXT_SAVINGS = 'Context saved'

/** English copy matching Kun's usageHeatmapCache locale string. */
export const USAGE_HEATMAP_CACHE = 'Cache'

/** English copy matching Kun's usageHeatmapTokens locale string. */
export const USAGE_HEATMAP_TOKENS = 'Tokens'

/** English copy matching Kun's usageHeatmapModelTooltipCachedInput locale string. */
export const USAGE_HEATMAP_MODEL_TOOLTIP_CACHED_INPUT = 'Input (cache hit)'

/** English copy matching Kun's usageHeatmapModelTooltipUncachedInput locale string. */
export const USAGE_HEATMAP_MODEL_TOOLTIP_UNCACHED_INPUT = 'Input (cache miss)'

/** English copy matching Kun's usageHeatmapModelTooltipOutput locale string. */
export const USAGE_HEATMAP_MODEL_TOOLTIP_OUTPUT = 'Output'

/** English copy matching Kun's usageHeatmapModelsEmpty locale string. */
export const USAGE_HEATMAP_MODELS_EMPTY_TEMPLATE = 'No model usage for {{model}} yet.'

/** English copy matching Kun's usageHeatmapModelTooltipTotalTokens locale string. */
export const USAGE_HEATMAP_MODEL_TOOLTIP_TOTAL_TOKENS_TEMPLATE = '{{value}} tokens'

/** English copy matching Kun's usageHeatmapModelTokenBreakdown locale string. */
export const USAGE_HEATMAP_MODEL_TOKEN_BREAKDOWN_TEMPLATE =
  '{{input}} in · {{output}} out · {{cacheHit}} hit · {{cacheMiss}} miss'

/** English copy matching Kun's usageHeatmapModelTooltip locale string. */
export const USAGE_HEATMAP_MODEL_TOOLTIP_TEMPLATE =
  '{{label}} · {{total}} tokens total · {{input}} input · {{output}} output · {{cacheHit}} cache hit · {{cacheMiss}} cache miss'

/** English copy matching Kun's usageHeatmapOverviewCaption locale string. */
export const USAGE_HEATMAP_OVERVIEW_CAPTION_TEMPLATE =
  "You've used {{tokens}} tokens across {{activeDays}} active days."

/** English copy matching Kun's usageHeatmapStreakDays locale string. */
export const USAGE_HEATMAP_STREAK_DAYS_TEMPLATE = '{{count}}d'

/** English copy matching Kun's usageHeatmapSavedTokensValue locale string. */
export const USAGE_HEATMAP_SAVED_TOKENS_TEMPLATE = '{{tokens}} tokens'

/** English copy matching Kun's usageHeatmapDaySummary locale string. */
export const USAGE_HEATMAP_DAY_SUMMARY_TEMPLATE =
  '{{date}} · {{tokens}} tokens · {{cost}} · {{saved}} cached tokens · {{turns}} turns · {{threads}} threads · {{cache}} cache'

/** English copy matching Kun's usageHeatmapHeroTitle locale strings. */
export const USAGE_HEATMAP_HERO_TITLE: Record<UsageHeatmapWarmupMode, string> = {
  loading: 'Preparing your usage calendar',
  empty: 'Start your agent rhythm',
  error: 'Start now, sync usage later',
}

/** Navi-branded equivalents of Kun's usageHeatmapHeroSub locale strings. */
export const USAGE_HEATMAP_HERO_SUB: Record<UsageHeatmapWarmupMode, string> = {
  loading: 'Navi is checking recent activity. The starter prompts stay ready while the calendar warms up.',
  empty: 'Once your first Navi turn completes, this space will turn into a daily usage calendar.',
  error: 'Usage history is not available yet, but the workspace is ready for a new conversation.',
}

/** Navi-branded equivalents of Kun's usageHeatmapWarmupBadge locale strings. */
export const USAGE_HEATMAP_WARMUP_BADGE: Record<UsageHeatmapWarmupMode, string> = {
  loading: 'Checking history',
  empty: 'Navi usage',
  error: 'Usage delayed',
}

/** English copy matching Kun's usageHeatmapWarmupTitle locale strings. */
export const USAGE_HEATMAP_WARMUP_TITLE: Record<UsageHeatmapWarmupMode, string> = {
  loading: 'Looking for recent activity',
  empty: 'No usage has been recorded yet',
  error: 'Usage can be retried later',
}

/** Navi-branded equivalents of Kun's usageHeatmapWarmupSub locale strings. */
export const USAGE_HEATMAP_WARMUP_SUB: Record<UsageHeatmapWarmupMode, string> = {
  loading: 'This usually resolves quickly after Navi answers. You can still pick a prompt below.',
  empty: 'Send a request and finish a turn; the first active day will appear here automatically.',
  error: 'The usage endpoint did not respond, so the calendar is paused for now. New chats still work.',
}

function replaceTemplate(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    template,
  )
}

export function resolveUsageHeatmapRangeLabel(rangeKey: UsageHeatmapRangeKey): string {
  return USAGE_HEATMAP_RANGE_LABELS[rangeKey]
}

export function resolveUsageHeatmapExpandCollapseLabel(expanded: boolean): string {
  return expanded ? USAGE_HEATMAP_COLLAPSE : USAGE_HEATMAP_EXPAND
}

export function resolveUsageHeatmapHeroTitle(mode: UsageHeatmapViewMode): string {
  return mode === 'populated' ? USAGE_HEATMAP_TITLE : USAGE_HEATMAP_HERO_TITLE[mode]
}

export function resolveUsageHeatmapHeroSub(mode: UsageHeatmapViewMode): string {
  return mode === 'populated' ? USAGE_HEATMAP_SUB : USAGE_HEATMAP_HERO_SUB[mode]
}

export function resolveUsageHeatmapWarmupBadge(mode: UsageHeatmapWarmupMode): string {
  return USAGE_HEATMAP_WARMUP_BADGE[mode]
}

export function resolveUsageHeatmapWarmupTitle(mode: UsageHeatmapWarmupMode): string {
  return USAGE_HEATMAP_WARMUP_TITLE[mode]
}

export function resolveUsageHeatmapWarmupSub(mode: UsageHeatmapWarmupMode): string {
  return USAGE_HEATMAP_WARMUP_SUB[mode]
}

export function formatUsageHeatmapStreakDays(count: number): string {
  return replaceTemplate(USAGE_HEATMAP_STREAK_DAYS_TEMPLATE, { count })
}

export function formatUsageHeatmapSavedTokens(tokens: string): string {
  return replaceTemplate(USAGE_HEATMAP_SAVED_TOKENS_TEMPLATE, { tokens })
}

export function formatUsageHeatmapOverviewCaption(tokens: string, activeDays: number): string {
  return replaceTemplate(USAGE_HEATMAP_OVERVIEW_CAPTION_TEMPLATE, { tokens, activeDays })
}

export function formatUsageHeatmapModelsEmpty(model: string): string {
  return replaceTemplate(USAGE_HEATMAP_MODELS_EMPTY_TEMPLATE, { model })
}

export function formatUsageHeatmapModelTooltipTotalTokens(value: string): string {
  return replaceTemplate(USAGE_HEATMAP_MODEL_TOOLTIP_TOTAL_TOKENS_TEMPLATE, { value })
}

export function formatUsageHeatmapModelTokenBreakdown(
  input: string,
  output: string,
  cacheHit: string,
  cacheMiss: string,
): string {
  return replaceTemplate(USAGE_HEATMAP_MODEL_TOKEN_BREAKDOWN_TEMPLATE, {
    input,
    output,
    cacheHit,
    cacheMiss,
  })
}

export function formatUsageHeatmapModelTooltip(values: {
  label: string
  total: string
  input: string
  output: string
  cacheHit: string
  cacheMiss: string
}): string {
  return replaceTemplate(USAGE_HEATMAP_MODEL_TOOLTIP_TEMPLATE, values)
}

export function formatUsageHeatmapDaySummary(values: {
  date: string
  tokens: string
  cost: string
  saved: string
  turns: number
  threads: number
  cache: string
}): string {
  return replaceTemplate(USAGE_HEATMAP_DAY_SUMMARY_TEMPLATE, values)
}
