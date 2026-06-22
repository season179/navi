// Kun context-capacity composer chrome
// (../Kun/src/renderer/src/components/chat/FloatingComposer.tsx +
// ContextCapacityPopover.tsx). Visual only — used for production Composer previews.

export type ContextCapacityCategoryKey =
  | 'tools'
  | 'system'
  | 'skills'
  | 'messages'
  | 'other'

/** English copy matching Kun's contextCapacityTitle locale string. */
export const CONTEXT_CAPACITY_TITLE = 'Context window'

/** English copy matching Kun's contextCapacityCat_* locale strings. */
export const CONTEXT_CAPACITY_CATEGORY_LABELS: Record<
  ContextCapacityCategoryKey | 'free',
  string
> = {
  tools: 'System tools',
  system: 'System prompt',
  skills: 'Skills',
  messages: 'Messages',
  other: 'Other',
  free: 'Free space',
}

/** English copy matching Kun's contextCapacityShareNote locale string. */
export const CONTEXT_CAPACITY_SHARE_NOTE = 'Share of window · sums to 100%'

/** English copy matching Kun's contextCapacityNearLimit locale string. */
export const CONTEXT_CAPACITY_NEAR_LIMIT = 'Near limit'

/** English copy matching Kun's contextCapacityOverLimit locale string. */
export const CONTEXT_CAPACITY_OVER_LIMIT = 'Near threshold · will auto-compact'

/** English copy matching Kun's contextCapacityEstimatedBreakdown locale string. */
export const CONTEXT_CAPACITY_ESTIMATED_BREAKDOWN =
  'Total is measured; the per-category split is estimated.'

/** English copy matching Kun's contextCapacityEstimatedAll locale string. */
export const CONTEXT_CAPACITY_ESTIMATED_ALL =
  'No turn yet — values are estimated and refresh after you send.'

/** Kun warns at 75% occupancy before the compaction threshold. */
export const CONTEXT_CAPACITY_WARN_RATIO = 0.75

export function formatContextCapacityPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '-'
  const percent = Math.max(0, Math.min(100, value * 100))
  if (percent === 0 || percent >= 10) return `${Math.round(percent)}%`
  return `${percent.toFixed(1)}%`
}

/** Kun locale: contextCapacityThresholdLabel — "Compacts near {{percent}}". */
export function formatContextCapacityThresholdLabel(percent: string): string {
  return `Compacts near ${percent}`
}

/** Kun locale: contextCapacityChipAria — "Context window {{percent}} used". */
export function formatContextCapacityChipAria(percent: string): string {
  return `Context window ${percent} used`
}

/** Kun locale: contextCapacityBarAria — "Context {{percent}} used". */
export function formatContextCapacityBarAria(percent: string): string {
  return `Context ${percent} used`
}

/** Resolves status copy matching Kun's ContextCapacityPopover status row. */
export function resolveContextCapacityStatusText(
  usedRatio: number,
  thresholdRatio: number,
): string {
  if (usedRatio >= thresholdRatio) return CONTEXT_CAPACITY_OVER_LIMIT
  if (usedRatio >= CONTEXT_CAPACITY_WARN_RATIO) return CONTEXT_CAPACITY_NEAR_LIMIT
  return CONTEXT_CAPACITY_SHARE_NOTE
}

/** Whether ?composerContextCapacityPreview should open the toolbar popover on mount. */
export function resolveComposerContextCapacityPreview(
  value: string | null,
): boolean {
  if (value == null || value === '' || value === '1') return true
  return value === 'open'
}
