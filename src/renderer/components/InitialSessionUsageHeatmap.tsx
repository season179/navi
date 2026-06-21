// Usage heatmap empty hero echoing Kun's InitialSessionUsageHeatmap
// (../Kun/src/renderer/src/components/chat/InitialSessionUsageHeatmap.tsx).
// Visual only: parent supplies usage snapshots or uses preview mock data.

import { useMemo, useState, type ReactElement } from 'react'
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { RuntimeWakeStage } from './RuntimeWakeStage'

export type DailyUsageBucket = {
  date: string
  inputTokens: number
  outputTokens: number
  reasoningTokens: number
  cachedTokens: number
  cacheMissTokens: number
  totalTokens: number
  costUsd: number
  costCny: number | null
  tokenEconomySavingsTokens: number
  turns: number
  threadCount: number
  cacheHitRate: number | null
}

export type DailyUsageSummary = {
  groupBy: 'day'
  from: string
  to: string
  timezone: string
  buckets: DailyUsageBucket[]
  totals: DailyUsageBucket & { days: number; activeDays: number }
}

export type DailyUsageState = {
  usage: DailyUsageSummary | null
  loading: boolean
  loaded: boolean
  error: string | null
}

export type ModelUsageBucket = DailyUsageBucket & { model: string }

export type ModelUsageSummary = {
  buckets: ModelUsageBucket[]
  days: DailyUsageBucket[]
  totals: Pick<DailyUsageBucket, 'totalTokens' | 'inputTokens' | 'outputTokens' | 'cachedTokens' | 'cacheMissTokens'>
}

export type ModelUsageState = {
  usage: ModelUsageSummary | null
  loading: boolean
  loaded: boolean
  error: string | null
}

type CalendarCell = DailyUsageBucket | null
type CalendarWeek = { key: string; cells: CalendarCell[] }
type UsageTotalsBucket = DailyUsageBucket & { days: number; activeDays: number }
type UsageViewMode = 'populated' | 'loading' | 'empty' | 'error'
type UsageRangeKey = 'all' | '90d' | '30d' | '7d'
type UsageTabKey = 'overview' | 'models'

const USAGE_HEATMAP_PREVIEW_CELLS = 14 * 7
const USAGE_HEATMAP_GRID_DAYS = 26 * 7
const USAGE_RANGE_DAYS: Record<UsageRangeKey, number> = {
  all: 365,
  '90d': 90,
  '30d': 30,
  '7d': 7,
}
const USAGE_RANGE_KEYS: UsageRangeKey[] = ['all', '90d', '30d', '7d']
const MODEL_USAGE_COLORS = ['#4f83df', '#6b99e5', '#8db3ed', '#b8cff6']
const MODEL_USAGE_BREAKDOWN_COLORS = {
  cachedInput: '#9bd8ff',
  uncachedInput: '#62aaf8',
  output: '#245fd7',
} as const
const EMPTY_DAILY_USAGE_BUCKETS: DailyUsageBucket[] = []

const COPY = {
  title: 'Your recent agent rhythm',
  sub: 'Start from the work pattern you have already built. Each day is colored by token usage, with turns, cost, threads, and cache detail available from the cells.',
  tabOverview: 'Overview',
  tabModels: 'Models',
  range: { all: 'All', '90d': '90d', '30d': '30d', '7d': '7d' } as Record<UsageRangeKey, string>,
  gridLabel: 'Daily usage calendar',
  loading: 'Loading recent usage…',
  collapse: 'Collapse calendar',
  expand: 'Expand calendar',
  refresh: 'Refresh',
  sessions: 'Sessions',
  messages: 'Messages',
  totalTokens: 'Total tokens',
  activeDays: 'Active days',
  currentStreak: 'Current streak',
  longestStreak: 'Longest streak',
  cost: 'Cost',
  cacheSavings: 'Cache hits saved',
  contextSavings: 'Context saved',
  cache: 'Cache',
  tokens: 'Tokens',
  modelsEmpty: (model: string) => `No model usage for ${model} yet.`,
  overviewCaption: (tokens: string, activeDays: number) =>
    `You've used ${tokens} tokens across ${activeDays} active days.`,
  streakDays: (count: number) => `${count}d`,
  savedTokens: (tokens: string) => `${tokens} tokens`,
  heroTitle: {
    loading: 'Preparing your usage calendar',
    empty: 'Start your agent rhythm',
    error: 'Start now, sync usage later',
  },
  heroSub: {
    loading: 'Navi is checking recent activity. The starter prompts stay ready while the calendar warms up.',
    empty: 'Once your first turn completes, this space will turn into a daily usage calendar.',
    error: 'Usage history is not available yet, but the workspace is ready for a new conversation.',
  },
  warmupBadge: {
    loading: 'Checking history',
    empty: 'Navi usage',
    error: 'Usage delayed',
  },
  warmupTitle: {
    loading: 'Looking for recent activity',
    empty: 'No usage has been recorded yet',
    error: 'Usage can be retried later',
  },
  warmupSub: {
    loading: 'This usually resolves quickly after Navi answers. You can still pick a prompt below.',
    empty: 'Send a request and finish a turn; the first active day will appear here automatically.',
    error: 'The usage endpoint did not respond, so the calendar is paused for now. New chats still work.',
  },
  modelTooltipCachedInput: 'Input (cache hit)',
  modelTooltipUncachedInput: 'Input (cache miss)',
  modelTooltipOutput: 'Output',
  modelTooltipTotalTokens: (value: string) => `${value} tokens`,
  modelTokenBreakdown: (input: string, output: string, cacheHit: string, cacheMiss: string) =>
    `${input} in · ${output} out · ${cacheHit} hit · ${cacheMiss} miss`,
} as const

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return new Intl.NumberFormat().format(value)
}

function formatMoneyValue(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0
  if (safeValue > 0 && safeValue < 0.0001) return '<0.0001'
  return safeValue.toFixed(safeValue >= 1 ? 2 : 4)
}

function formatCost(costUsd: number | null | undefined, costCny?: number | null): string {
  const hasUsd = typeof costUsd === 'number' && Number.isFinite(costUsd) && costUsd > 0
  const hasCny = typeof costCny === 'number' && Number.isFinite(costCny) && costCny > 0
  if (!hasUsd && !hasCny) return '-'
  if (hasUsd) return `$${formatMoneyValue(costUsd)}`
  return `￥${formatMoneyValue(costCny ?? 0)}`
}

function formatPercent(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return '-'
  const percent = Math.max(0, Math.min(100, value * 100))
  if (percent === 0 || percent >= 10) return `${Math.round(percent)}%`
  return `${percent.toFixed(1)}%`
}

function formatTokenCount(value: number, locale = 'en'): string {
  return new Intl.NumberFormat(locale).format(Math.max(0, Math.round(value)))
}

function formatChartDate(date: string, locale: string): string {
  const parsed = new Date(`${date}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(parsed)
}

function calendarWeeks(buckets: CalendarCell[]): CalendarWeek[] {
  const weeks: CalendarWeek[] = []
  for (let index = 0; index < buckets.length; index += 7) {
    const weekCells = buckets.slice(index, index + 7)
    while (weekCells.length < 7) weekCells.push(null)
    weeks.push({
      key: weekCells.find((cell) => cell)?.date ?? `week-${index / 7}`,
      cells: weekCells,
    })
  }
  return weeks
}

export function usageHeatmapIntensityLevel(
  bucket: Pick<DailyUsageBucket, 'totalTokens' | 'turns'>,
  maxTokens: number,
  maxTurns: number,
): number {
  const metric = maxTokens > 0 ? bucket.totalTokens : bucket.turns
  const max = maxTokens > 0 ? maxTokens : maxTurns
  if (metric <= 0 || max <= 0) return 0
  return Math.max(1, Math.min(4, Math.ceil((metric / max) * 4)))
}

function usageHasBucketActivity(bucket: Pick<DailyUsageBucket, 'totalTokens' | 'turns'>): boolean {
  return bucket.totalTokens > 0 || bucket.turns > 0
}

function usageStreaks(buckets: DailyUsageBucket[]): { current: number; longest: number } {
  let current = 0
  let longest = 0
  let running = 0
  for (const bucket of buckets) {
    if (usageHasBucketActivity(bucket)) {
      running += 1
      longest = Math.max(longest, running)
    } else {
      running = 0
    }
  }
  for (let index = buckets.length - 1; index >= 0; index -= 1) {
    if (!usageHasBucketActivity(buckets[index])) break
    current += 1
  }
  return { current, longest }
}

function usageRangeBuckets(buckets: DailyUsageBucket[], rangeKey: UsageRangeKey): DailyUsageBucket[] {
  if (rangeKey === 'all') return buckets
  return buckets.slice(-USAGE_RANGE_DAYS[rangeKey])
}

function usageTotalsFromBuckets(buckets: DailyUsageBucket[]): UsageTotalsBucket {
  let hasCny = false
  const totals = buckets.reduce<UsageTotalsBucket>(
    (acc, bucket) => {
      acc.inputTokens += bucket.inputTokens
      acc.outputTokens += bucket.outputTokens
      acc.reasoningTokens += bucket.reasoningTokens
      acc.cachedTokens += bucket.cachedTokens
      acc.cacheMissTokens += bucket.cacheMissTokens
      acc.totalTokens += bucket.totalTokens
      acc.costUsd += bucket.costUsd
      acc.costCny = (acc.costCny ?? 0) + (bucket.costCny ?? 0)
      acc.tokenEconomySavingsTokens += bucket.tokenEconomySavingsTokens
      acc.turns += bucket.turns
      acc.threadCount += bucket.threadCount
      if (bucket.costCny != null) hasCny = true
      if (usageHasBucketActivity(bucket)) acc.activeDays += 1
      return acc
    },
    {
      date: 'totals',
      inputTokens: 0,
      outputTokens: 0,
      reasoningTokens: 0,
      cachedTokens: 0,
      cacheMissTokens: 0,
      totalTokens: 0,
      costUsd: 0,
      costCny: 0,
      tokenEconomySavingsTokens: 0,
      turns: 0,
      threadCount: 0,
      cacheHitRate: null,
      days: buckets.length,
      activeDays: 0,
    },
  )
  const cacheTotal = totals.cachedTokens + totals.cacheMissTokens
  return {
    ...totals,
    costCny: hasCny ? totals.costCny : null,
    cacheHitRate: cacheTotal > 0 ? totals.cachedTokens / cacheTotal : null,
  }
}

function dailySummary(bucket: DailyUsageBucket): string {
  return `${bucket.date} · ${formatCompactNumber(bucket.totalTokens)} tokens · ${formatCost(bucket.costUsd, bucket.costCny)} · ${formatCompactNumber(bucket.cachedTokens)} cached tokens · ${bucket.turns} turns · ${bucket.threadCount} threads · ${formatPercent(bucket.cacheHitRate)} cache`
}

function usageHasActivity(state: DailyUsageState): boolean {
  const usage = state.usage
  if (!usage) return false
  return usage.totals.activeDays > 0 || usage.buckets.some((bucket) => bucket.totalTokens > 0 || bucket.turns > 0)
}

function usageViewMode(state: DailyUsageState): UsageViewMode {
  if (usageHasActivity(state)) return 'populated'
  if (state.loading) return 'loading'
  if (state.error) return 'error'
  return 'empty'
}

function modelUsageChartBreakdown(
  bucket: Pick<DailyUsageBucket, 'inputTokens' | 'outputTokens' | 'cachedTokens' | 'cacheMissTokens' | 'totalTokens'>,
) {
  const cachedInput = Math.max(0, bucket.cachedTokens)
  const uncachedInput = Math.max(
    0,
    bucket.cacheMissTokens > 0 ? bucket.cacheMissTokens : bucket.inputTokens - cachedInput,
  )
  const output = Math.max(0, bucket.outputTokens)
  const total = Math.max(0, bucket.totalTokens, cachedInput + uncachedInput + output)
  return { cachedInput, uncachedInput, output, total }
}

function modelUsageBreakdownSummary(label: string, bucket: DailyUsageBucket, locale: string): string {
  return `${label} · ${formatTokenCount(bucket.totalTokens, locale)} tokens total · ${formatTokenCount(bucket.inputTokens, locale)} input · ${formatTokenCount(bucket.outputTokens, locale)} output · ${formatTokenCount(bucket.cachedTokens, locale)} cache hit · ${formatTokenCount(bucket.cacheMissTokens, locale)} cache miss`
}

function previewBucket(date: string, totalTokens: number, turns = 1): DailyUsageBucket {
  return {
    date,
    inputTokens: totalTokens,
    outputTokens: 0,
    reasoningTokens: 0,
    cachedTokens: Math.round(totalTokens * 0.25),
    cacheMissTokens: Math.round(totalTokens * 0.75),
    totalTokens,
    costUsd: totalTokens / 1_000_000,
    costCny: (totalTokens / 1_000_000) * 7.2,
    tokenEconomySavingsTokens: 0,
    turns,
    threadCount: turns > 0 ? 1 : 0,
    cacheHitRate: totalTokens > 0 ? 0.25 : null,
  }
}

function buildPreviewUsage(buckets: DailyUsageBucket[]): DailyUsageSummary {
  const totalTokens = buckets.reduce((sum, item) => sum + item.totalTokens, 0)
  const turns = buckets.reduce((sum, item) => sum + item.turns, 0)
  return {
    groupBy: 'day',
    from: buckets[0]?.date ?? '2026-05-01',
    to: buckets[buckets.length - 1]?.date ?? '2026-05-01',
    timezone: 'UTC',
    buckets,
    totals: {
      ...usageTotalsFromBuckets(buckets),
      days: buckets.length,
      activeDays: buckets.filter((item) => item.totalTokens > 0 || item.turns > 0).length,
      date: 'totals',
      inputTokens: totalTokens,
      outputTokens: 0,
      reasoningTokens: 0,
      cachedTokens: Math.round(totalTokens * 0.25),
      cacheMissTokens: Math.round(totalTokens * 0.75),
      totalTokens,
      costUsd: totalTokens / 1_000_000,
      costCny: (totalTokens / 1_000_000) * 7.2,
      tokenEconomySavingsTokens: 0,
      turns,
      threadCount: buckets.filter((item) => item.turns > 0).length,
      cacheHitRate: totalTokens > 0 ? 0.25 : null,
    },
  }
}

function buildSparseHeatmapBuckets(): DailyUsageBucket[] {
  const buckets: DailyUsageBucket[] = []
  const start = new Date('2025-12-01T00:00:00.000Z')
  for (let index = 0; index < USAGE_HEATMAP_GRID_DAYS; index += 1) {
    const date = new Date(start)
    date.setUTCDate(start.getUTCDate() + index)
    const iso = date.toISOString().slice(0, 10)
    const active = index % 11 === 0 || index % 17 === 4
    buckets.push(previewBucket(iso, active ? 1200 + (index % 5) * 2400 : 0, active ? 1 + (index % 3) : 0))
  }
  return buckets
}

/** Populated preview for ?initialSessionUsageHeatmap=populated. */
export const INITIAL_SESSION_USAGE_HEATMAP_PREVIEW_POPULATED: DailyUsageState = {
  usage: buildPreviewUsage(buildSparseHeatmapBuckets()),
  loading: false,
  loaded: true,
  error: null,
}

/** Loading preview for ?initialSessionUsageHeatmap=loading. */
export const INITIAL_SESSION_USAGE_HEATMAP_PREVIEW_LOADING: DailyUsageState = {
  usage: null,
  loading: true,
  loaded: false,
  error: null,
}

/** Empty preview for ?initialSessionUsageHeatmap=empty. */
export const INITIAL_SESSION_USAGE_HEATMAP_PREVIEW_EMPTY: DailyUsageState = {
  usage: null,
  loading: false,
  loaded: true,
  error: null,
}

/** Error preview for ?initialSessionUsageHeatmap=error. */
export const INITIAL_SESSION_USAGE_HEATMAP_PREVIEW_ERROR: DailyUsageState = {
  usage: null,
  loading: false,
  loaded: true,
  error: 'Usage endpoint unavailable',
}

const PREVIEW_MODEL_BUCKETS: ModelUsageBucket[] = [
  { ...previewBucket('2026-06-17', 8200, 3), model: 'claude-sonnet-4-20250514' },
  { ...previewBucket('2026-06-18', 12400, 5), model: 'gpt-4.1' },
  { ...previewBucket('2026-06-19', 6100, 2), model: 'gemini-2.5-pro' },
]

export const INITIAL_SESSION_USAGE_HEATMAP_PREVIEW_MODEL: ModelUsageState = {
  usage: {
    buckets: PREVIEW_MODEL_BUCKETS,
    days: [
      previewBucket('2026-06-15', 4200, 2),
      previewBucket('2026-06-16', 6800, 3),
      previewBucket('2026-06-17', 8200, 3),
      previewBucket('2026-06-18', 12400, 5),
      previewBucket('2026-06-19', 6100, 2),
    ],
    totals: {
      totalTokens: 37700,
      inputTokens: 28000,
      outputTokens: 9700,
      cachedTokens: 9400,
      cacheMissTokens: 18600,
    },
  },
  loading: false,
  loaded: true,
  error: null,
}

function HeatmapGrid({
  buckets,
  loading,
  selected,
  onSelect,
}: {
  buckets: DailyUsageBucket[]
  loading: boolean
  selected: DailyUsageBucket | null
  onSelect: (bucket: DailyUsageBucket) => void
}): ReactElement {
  const weeks = useMemo(() => calendarWeeks(buckets), [buckets])
  const maxTokens = useMemo(() => Math.max(0, ...buckets.map((bucket) => bucket.totalTokens)), [buckets])
  const maxTurns = useMemo(() => Math.max(0, ...buckets.map((bucket) => bucket.turns)), [buckets])
  const skeletonWeeks = Array.from({ length: Math.ceil(USAGE_HEATMAP_GRID_DAYS / 7) }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => week * 7 + day),
  )
  const weekCount = loading ? skeletonWeeks.length : Math.max(weeks.length, 1)

  return (
    <div className="usage-heatmap-grid-wrap">
      <div className="usage-heatmap-grid-scroll">
        <div
          className="usage-heatmap-grid"
          style={{ gridTemplateColumns: `repeat(${weekCount}, minmax(0, 1fr))` }}
          aria-label={COPY.gridLabel}
        >
          {loading
            ? skeletonWeeks.map((week) => (
                <span key={week[0]} className="usage-heatmap-week">
                  {week.map((cell) => (
                    <span key={cell} className="usage-heatmap-cell usage-heatmap-cell--skeleton" />
                  ))}
                </span>
              ))
            : weeks.map((week) => (
                <span key={week.key} className="usage-heatmap-week">
                  {week.cells.map((bucket, index) =>
                    bucket ? (
                      <button
                        key={bucket.date}
                        type="button"
                        title={dailySummary(bucket)}
                        aria-label={dailySummary(bucket)}
                        onMouseEnter={() => onSelect(bucket)}
                        onFocus={() => onSelect(bucket)}
                        onClick={() => onSelect(bucket)}
                        className={`usage-heatmap-cell usage-heatmap-cell--level-${usageHeatmapIntensityLevel(bucket, maxTokens, maxTurns)}${
                          selected?.date === bucket.date ? ' usage-heatmap-cell--selected' : ''
                        }`}
                      />
                    ) : (
                      <span
                        key={`blank-${week.key}-${index}`}
                        className="usage-heatmap-cell usage-heatmap-cell--level-0"
                        aria-hidden
                      />
                    ),
                  )}
                </span>
              ))}
        </div>
      </div>
    </div>
  )
}

function PreviewCalendar({ mode }: { mode: Exclude<UsageViewMode, 'populated'> }): ReactElement {
  const weeks = Array.from({ length: Math.ceil(USAGE_HEATMAP_PREVIEW_CELLS / 7) }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => week * 7 + day),
  )
  const activePattern = new Set([6, 12, 20, 24, 29, 33, 42, 57, 63, 78, 91])
  const strongPattern = new Set([24, 63, 91])
  return (
    <div className="usage-heatmap-preview-calendar" aria-hidden>
      <div className="usage-heatmap-preview-calendar-scroll">
        <div className="usage-heatmap-preview-calendar-weeks">
          {weeks.map((week) => (
            <span key={week[0]} className="usage-heatmap-preview-week">
              {week.map((cell) => {
                const patterned = activePattern.has(cell)
                const strong = strongPattern.has(cell)
                const className =
                  mode === 'loading'
                    ? 'usage-heatmap-preview-cell usage-heatmap-preview-cell--loading'
                    : patterned
                      ? strong
                        ? 'usage-heatmap-preview-cell usage-heatmap-preview-cell--strong'
                        : 'usage-heatmap-preview-cell usage-heatmap-preview-cell--active'
                      : 'usage-heatmap-preview-cell usage-heatmap-preview-cell--idle'
                return <span key={cell} className={className} />
              })}
            </span>
          ))}
        </div>
      </div>
      <div className="usage-heatmap-preview-legend">
        <span className={mode === 'loading' ? 'usage-heatmap-preview-legend-pulse' : ''}>--</span>
        <div className="usage-heatmap-preview-legend-cells">
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={`usage-heatmap-preview-legend-cell usage-heatmap-cell--level-${level}${
                mode === 'loading' ? ' usage-heatmap-preview-legend-pulse' : ''
              }`}
            />
          ))}
        </div>
        <span className={mode === 'loading' ? 'usage-heatmap-preview-legend-pulse' : ''}>--</span>
      </div>
    </div>
  )
}

function WarmupStatePanel({
  mode,
  onRefresh,
}: {
  mode: Exclude<UsageViewMode, 'populated'>
  onRefresh?: () => void
}): ReactElement {
  const icon =
    mode === 'loading' ? (
      <Loader2 className="usage-heatmap-warmup-icon usage-heatmap-warmup-icon--spin" strokeWidth={1.9} />
    ) : mode === 'error' ? (
      <AlertCircle className="usage-heatmap-warmup-icon" strokeWidth={1.9} />
    ) : (
      <Sparkles className="usage-heatmap-warmup-icon" strokeWidth={1.9} />
    )
  return (
    <div className="usage-heatmap-warmup">
      <PreviewCalendar mode={mode} />
      <div className="usage-heatmap-warmup-side">
        <div className={`usage-heatmap-warmup-badge usage-heatmap-warmup-badge--${mode}`}>
          {icon}
          <span>{COPY.warmupBadge[mode]}</span>
        </div>
        <h2 className="usage-heatmap-warmup-title">{COPY.warmupTitle[mode]}</h2>
        <p className="usage-heatmap-warmup-sub">{COPY.warmupSub[mode]}</p>
        {mode === 'error' ? (
          <button type="button" className="usage-heatmap-refresh-btn" onClick={onRefresh}>
            <RefreshCw strokeWidth={1.8} />
            <span>{COPY.refresh}</span>
          </button>
        ) : null}
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <span className="usage-heatmap-metric">
      <span className="usage-heatmap-metric-label" title={label}>
        {label}
      </span>
      <span className="usage-heatmap-metric-value" title={value}>
        {value}
      </span>
    </span>
  )
}

function ModelUsagePanel({
  state,
  fallbackModel,
  locale,
  initialActiveDayIndex = null,
}: {
  state: ModelUsageState
  fallbackModel: string
  locale: string
  initialActiveDayIndex?: number | null
}): ReactElement {
  const usage = state.usage
  const modelBuckets = usage?.buckets ?? []
  const dayBuckets = usage?.days ?? []
  const activeDays = dayBuckets.filter((bucket) => bucket.totalTokens > 0)
  const chartDays = (activeDays.length > 0 ? activeDays : dayBuckets).slice(-5)
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(initialActiveDayIndex)
  const chartBreakdowns = useMemo(
    () => chartDays.map((bucket) => modelUsageChartBreakdown(bucket)),
    [chartDays],
  )
  const maxTokens = Math.max(1, ...chartBreakdowns.map((bucket) => bucket.total))
  const topModels = modelBuckets.slice(0, 4)
  const totalTokens = Math.max(usage?.totals.totalTokens ?? 0, 1)
  const resolvedActiveDayIndex =
    activeDayIndex != null && activeDayIndex >= 0 && activeDayIndex < chartDays.length
      ? activeDayIndex
      : null
  const activeDay = resolvedActiveDayIndex != null ? chartDays[resolvedActiveDayIndex] : null
  const activeBreakdown =
    resolvedActiveDayIndex != null ? chartBreakdowns[resolvedActiveDayIndex] : null
  const tooltipAnchorPercent =
    resolvedActiveDayIndex != null
      ? ((resolvedActiveDayIndex + 0.5) / Math.max(chartDays.length, 1)) * 100
      : 50
  const tooltipTransformClass =
    resolvedActiveDayIndex == null || (resolvedActiveDayIndex > 0 && resolvedActiveDayIndex < chartDays.length - 1)
      ? 'usage-heatmap-model-tooltip--center'
      : resolvedActiveDayIndex === 0
        ? 'usage-heatmap-model-tooltip--start'
        : 'usage-heatmap-model-tooltip--end'
  const tooltipRows = activeBreakdown
    ? [
        {
          key: 'cached-input',
          label: COPY.modelTooltipCachedInput,
          value: activeBreakdown.cachedInput,
          color: MODEL_USAGE_BREAKDOWN_COLORS.cachedInput,
        },
        {
          key: 'uncached-input',
          label: COPY.modelTooltipUncachedInput,
          value: activeBreakdown.uncachedInput,
          color: MODEL_USAGE_BREAKDOWN_COLORS.uncachedInput,
        },
        {
          key: 'output',
          label: COPY.modelTooltipOutput,
          value: activeBreakdown.output,
          color: MODEL_USAGE_BREAKDOWN_COLORS.output,
        },
      ]
    : []

  if (state.loading && !usage) {
    return <div className="usage-heatmap-models-loading">{COPY.loading}</div>
  }

  if (modelBuckets.length === 0) {
    return (
      <div className="usage-heatmap-models-empty">
        {COPY.modelsEmpty(fallbackModel || '-')}
      </div>
    )
  }

  return (
    <div className="usage-heatmap-models">
      <div className="usage-heatmap-models-header">
        <span className="usage-heatmap-models-header-label">{COPY.tokens}</span>
        <span className="usage-heatmap-models-header-value">
          {formatTokenCount(usage?.totals.totalTokens ?? 0, locale)}
        </span>
      </div>
      <div className="usage-heatmap-models-chart">
        <div className="usage-heatmap-models-y-axis">
          {[1, 0.75, 0.5, 0.25, 0].map((ratio) => (
            <span key={ratio}>
              {ratio === 0 ? '0' : formatCompactNumber(maxTokens * ratio)}
            </span>
          ))}
        </div>
        <div className="usage-heatmap-models-bars-wrap" onMouseLeave={() => setActiveDayIndex(null)}>
          {activeDay && activeBreakdown ? (
            <div
              className={`usage-heatmap-model-tooltip ${tooltipTransformClass}`}
              style={{ left: `${tooltipAnchorPercent}%` }}
            >
              <div className="usage-heatmap-model-tooltip-header">
                <span className="usage-heatmap-model-tooltip-date">{activeDay.date}</span>
                <span className="usage-heatmap-model-tooltip-total">
                  {COPY.modelTooltipTotalTokens(formatTokenCount(activeBreakdown.total, locale))}
                </span>
              </div>
              <div className="usage-heatmap-model-tooltip-rows">
                {tooltipRows.map((row) => (
                  <div key={row.key} className="usage-heatmap-model-tooltip-row">
                    <span className="usage-heatmap-model-tooltip-swatch" style={{ backgroundColor: row.color }} aria-hidden />
                    <span className="usage-heatmap-model-tooltip-label">{row.label}</span>
                    <span className="usage-heatmap-model-tooltip-value">
                      {COPY.modelTooltipTotalTokens(formatTokenCount(row.value, locale))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="usage-heatmap-models-bars">
            {chartDays.map((bucket, index) => {
              const breakdown = chartBreakdowns[index]
              const segments = [
                { key: 'output', value: breakdown.output, color: MODEL_USAGE_BREAKDOWN_COLORS.output },
                { key: 'uncached-input', value: breakdown.uncachedInput, color: MODEL_USAGE_BREAKDOWN_COLORS.uncachedInput },
                { key: 'cached-input', value: breakdown.cachedInput, color: MODEL_USAGE_BREAKDOWN_COLORS.cachedInput },
              ]
              const dateLabel = formatChartDate(bucket.date, locale)
              const summary = modelUsageBreakdownSummary(dateLabel, bucket, locale)
              const active = resolvedActiveDayIndex === index
              const barHeight = Math.max(8, (breakdown.total / maxTokens) * 112)
              return (
                <div key={`${bucket.date}-${index}`} className="usage-heatmap-models-bar-col">
                  {active ? <span className="usage-heatmap-models-bar-guide" aria-hidden /> : null}
                  <button
                    type="button"
                    title={summary}
                    aria-label={summary}
                    onMouseEnter={() => setActiveDayIndex(index)}
                    onFocus={() => setActiveDayIndex(index)}
                    onClick={() => setActiveDayIndex(index)}
                    className="usage-heatmap-models-bar-btn"
                  >
                    <span
                      className={`usage-heatmap-models-bar-stack${active ? ' usage-heatmap-models-bar-stack--active' : ''}`}
                      style={{ height: `${barHeight}px` }}
                    >
                      {segments.map((segment) => {
                        const ratio = breakdown.total > 0 ? segment.value / breakdown.total : 0
                        if (ratio <= 0) return null
                        return (
                          <span
                            key={segment.key}
                            className="usage-heatmap-models-bar-segment"
                            style={{
                              height: `${Math.max(4, ratio * barHeight)}px`,
                              backgroundColor: segment.color,
                            }}
                          />
                        )
                      })}
                    </span>
                  </button>
                  <span className="usage-heatmap-models-bar-label">{dateLabel}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="usage-heatmap-models-list">
        {topModels.map((bucket, index) => {
          const percent = (bucket.totalTokens / totalTokens) * 100
          const summary = modelUsageBreakdownSummary(bucket.model, bucket, locale)
          return (
            <div key={bucket.model} className="usage-heatmap-models-list-row" title={summary} aria-label={summary}>
              <span className="usage-heatmap-models-list-name">
                <span
                  className="usage-heatmap-models-list-swatch"
                  style={{ backgroundColor: MODEL_USAGE_COLORS[index % MODEL_USAGE_COLORS.length] }}
                />
                <span className="usage-heatmap-models-list-model">{bucket.model}</span>
              </span>
              <span className="usage-heatmap-models-list-breakdown">
                {COPY.modelTokenBreakdown(
                  formatCompactNumber(bucket.inputTokens),
                  formatCompactNumber(bucket.outputTokens),
                  formatCompactNumber(bucket.cachedTokens),
                  formatCompactNumber(bucket.cacheMissTokens),
                )}
              </span>
              <span className="usage-heatmap-models-list-percent">{percent.toFixed(1)}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function UsageHeroToggle({
  expanded,
  onToggle,
}: {
  expanded: boolean
  onToggle: () => void
}): ReactElement {
  const Icon = expanded ? ChevronUp : ChevronDown
  const label = expanded ? COPY.collapse : COPY.expand
  return (
    <button
      type="button"
      className="usage-heatmap-toggle"
      onClick={onToggle}
      aria-label={label}
      title={label}
    >
      <Icon strokeWidth={1.8} />
    </button>
  )
}

function UsageHeroSection({
  title,
  sub,
  showText = true,
}: {
  title: string
  sub: string
  showText?: boolean
}): ReactElement {
  return (
    <div className="usage-heatmap-hero">
      <div className="usage-heatmap-hero-stage">
        <RuntimeWakeStage />
      </div>
      {showText ? (
        <>
          <h1 className="usage-heatmap-hero-title">{title}</h1>
          <p className="usage-heatmap-hero-sub">{sub}</p>
        </>
      ) : null}
    </div>
  )
}

function CollapsedCalendarCard({ onExpand }: { onExpand: () => void }): ReactElement {
  return (
    <div className="usage-heatmap-collapsed">
      <UsageHeroToggle expanded={false} onToggle={onExpand} />
    </div>
  )
}

function UsagePanelCard({ children }: { children: ReactElement }): ReactElement {
  return <div className="usage-heatmap-panel">{children}</div>
}

export function InitialSessionUsageHeatmapView({
  state,
  modelState = { usage: null, loading: false, loaded: false, error: null },
  rangeKey = 'all',
  initialCollapsed = false,
  initialActiveTab = 'overview',
  initialModelHoverIndex = null,
  hideHero = false,
  onRangeChange,
  onRefresh,
}: {
  state: DailyUsageState
  modelState?: ModelUsageState
  rangeKey?: UsageRangeKey
  initialCollapsed?: boolean
  initialActiveTab?: UsageTabKey
  initialModelHoverIndex?: number | null
  hideHero?: boolean
  onRangeChange?: (rangeKey: UsageRangeKey) => void
  onRefresh?: () => void
}): ReactElement {
  const [activeBucket, setActiveBucket] = useState<DailyUsageBucket | null>(null)
  const [activeTab, setActiveTab] = useState<UsageTabKey>(initialActiveTab)
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const [modelLabel] = useState('claude-sonnet-4-20250514')
  const usage = state.usage
  const buckets = usage?.buckets ?? EMPTY_DAILY_USAGE_BUCKETS
  const metricBuckets = useMemo(() => usageRangeBuckets(buckets, rangeKey), [buckets, rangeKey])
  const heatmapBuckets = useMemo(() => buckets.slice(-USAGE_HEATMAP_GRID_DAYS), [buckets])
  const totals = useMemo(() => usageTotalsFromBuckets(metricBuckets), [metricBuckets])
  const mode = usageViewMode(state)
  const streaks = useMemo(() => usageStreaks(metricBuckets), [metricBuckets])
  const overviewMetrics = [
    { label: COPY.sessions, value: formatCompactNumber(totals.threadCount) },
    { label: COPY.messages, value: formatCompactNumber(totals.turns) },
    { label: COPY.totalTokens, value: formatCompactNumber(totals.totalTokens) },
    { label: COPY.activeDays, value: String(totals.activeDays) },
    { label: COPY.currentStreak, value: COPY.streakDays(streaks.current) },
    { label: COPY.longestStreak, value: COPY.streakDays(streaks.longest) },
    { label: COPY.cost, value: formatCost(totals.costUsd, totals.costCny) },
    { label: COPY.cacheSavings, value: COPY.savedTokens(formatCompactNumber(totals.cachedTokens)) },
    { label: COPY.contextSavings, value: COPY.savedTokens(formatCompactNumber(totals.tokenEconomySavingsTokens)) },
    { label: COPY.cache, value: formatPercent(totals.cacheHitRate) },
  ]
  const heroTitle = mode === 'populated' ? COPY.title : COPY.heroTitle[mode]
  const heroSub = mode === 'populated' ? COPY.sub : COPY.heroSub[mode]

  return (
    <div className="initial-session-usage-heatmap">
      <div className="initial-session-usage-heatmap-inner">
        {!hideHero ? (
          <UsageHeroSection title={heroTitle} sub={heroSub} showText={mode !== 'populated'} />
        ) : null}
        {collapsed ? (
          <CollapsedCalendarCard onExpand={() => setCollapsed(false)} />
        ) : (
          <UsagePanelCard>
            {mode === 'populated' ? (
              <div className="usage-heatmap-populated">
                <div className="usage-heatmap-toolbar">
                  <div className="usage-heatmap-tabs">
                    <button
                      type="button"
                      className={`usage-heatmap-tab${activeTab === 'overview' ? ' usage-heatmap-tab--active' : ''}`}
                      aria-pressed={activeTab === 'overview'}
                      onClick={() => setActiveTab('overview')}
                    >
                      {COPY.tabOverview}
                    </button>
                    <button
                      type="button"
                      className={`usage-heatmap-tab${activeTab === 'models' ? ' usage-heatmap-tab--active' : ''}`}
                      aria-pressed={activeTab === 'models'}
                      title={COPY.tabModels}
                      onClick={() => setActiveTab('models')}
                    >
                      {COPY.tabModels}
                    </button>
                  </div>
                  <div className="usage-heatmap-toolbar-right">
                    <div className="usage-heatmap-range-tabs">
                      {USAGE_RANGE_KEYS.map((key) => (
                        <button
                          key={key}
                          type="button"
                          className={`usage-heatmap-range-tab${rangeKey === key ? ' usage-heatmap-range-tab--active' : ''}`}
                          aria-pressed={rangeKey === key}
                          onClick={() => onRangeChange?.(key)}
                        >
                          {COPY.range[key]}
                        </button>
                      ))}
                    </div>
                    <UsageHeroToggle expanded onToggle={() => setCollapsed(true)} />
                  </div>
                </div>
                {activeTab === 'overview' ? (
                  <>
                    <div className="usage-heatmap-metrics">
                      {overviewMetrics.map((metric) => (
                        <Metric key={metric.label} label={metric.label} value={metric.value} />
                      ))}
                    </div>
                    <HeatmapGrid
                      buckets={heatmapBuckets}
                      loading={state.loading && heatmapBuckets.length === 0}
                      selected={activeBucket}
                      onSelect={setActiveBucket}
                    />
                    <p className="usage-heatmap-caption">
                      {COPY.overviewCaption(formatCompactNumber(totals.totalTokens), totals.activeDays)}
                    </p>
                  </>
                ) : (
                  <ModelUsagePanel
                    state={modelState}
                    fallbackModel={modelLabel}
                    locale="en"
                    initialActiveDayIndex={initialModelHoverIndex}
                  />
                )}
              </div>
            ) : (
              <>
                <div className="usage-heatmap-toolbar usage-heatmap-toolbar--warmup">
                  <div className="usage-heatmap-toolbar-right">
                    <button
                      type="button"
                      className="usage-heatmap-refresh-btn usage-heatmap-refresh-btn--toolbar"
                      onClick={onRefresh}
                      disabled={state.loading}
                      title={COPY.refresh}
                    >
                      <RefreshCw className={state.loading ? 'usage-heatmap-warmup-icon--spin' : ''} strokeWidth={1.8} />
                      <span>{COPY.refresh}</span>
                    </button>
                    <UsageHeroToggle expanded onToggle={() => setCollapsed(true)} />
                  </div>
                </div>
                <WarmupStatePanel mode={mode} onRefresh={onRefresh} />
              </>
            )}
          </UsagePanelCard>
        )}
      </div>
    </div>
  )
}

type PreviewMode = 'populated' | 'loading' | 'empty' | 'error' | 'collapsed' | 'models'

type Props = {
  previewMode?: PreviewMode
  hideHero?: boolean
}

export function InitialSessionUsageHeatmap({
  previewMode = 'populated',
  hideHero = false,
}: Props): ReactElement {
  const [rangeKey, setRangeKey] = useState<UsageRangeKey>('all')
  const state =
    previewMode === 'loading'
      ? INITIAL_SESSION_USAGE_HEATMAP_PREVIEW_LOADING
      : previewMode === 'empty'
        ? INITIAL_SESSION_USAGE_HEATMAP_PREVIEW_EMPTY
        : previewMode === 'error'
          ? INITIAL_SESSION_USAGE_HEATMAP_PREVIEW_ERROR
          : INITIAL_SESSION_USAGE_HEATMAP_PREVIEW_POPULATED
  const modelState = INITIAL_SESSION_USAGE_HEATMAP_PREVIEW_MODEL

  return (
    <InitialSessionUsageHeatmapView
      state={state}
      modelState={modelState}
      rangeKey={rangeKey}
      hideHero={hideHero}
      initialCollapsed={previewMode === 'collapsed'}
      initialActiveTab={previewMode === 'models' ? 'models' : 'overview'}
      initialModelHoverIndex={previewMode === 'models' ? 2 : null}
      onRangeChange={setRangeKey}
      onRefresh={() => undefined}
    />
  )
}
