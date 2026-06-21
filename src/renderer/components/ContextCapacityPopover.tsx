// Context-window capacity popover echoing Kun's ContextCapacityPopover
// (../Kun/src/renderer/src/components/chat/ContextCapacityPopover.tsx). Visual
// only: parent supplies a ContextCapacity snapshot; no live token accounting.

import type { ReactElement } from 'react'

export type ContextCategoryKey = 'tools' | 'system' | 'skills' | 'messages' | 'other'

export type ContextCategory = {
  key: ContextCategoryKey
  tokens: number
  /** Share of the whole window, 0..1. */
  ratio: number
}

export type ContextCapacity = {
  windowTokens: number
  usedTokens: number
  freeTokens: number
  /** Used share of the window, 0..1. */
  usedRatio: number
  /** Free share of the window, 0..1. */
  freeRatio: number
  categories: ContextCategory[]
  /** True when the breakdown (not necessarily the total) is estimated. */
  estimated: boolean
  /** True when the total occupancy is a real measurement, not an estimate. */
  hasMeasuredTotal: boolean
}

const CATEGORY_COLORS: Record<ContextCategoryKey, string> = {
  tools: '#3b82d8',
  system: '#8b7be8',
  skills: '#1d9e75',
  messages: '#e0673a',
  other: '#d8910d',
}

const CATEGORY_LABELS: Record<ContextCategoryKey, string> = {
  tools: 'Tools',
  system: 'System',
  skills: 'Skills',
  messages: 'Messages',
  other: 'Other',
}

const CATEGORY_ORDER: ContextCategoryKey[] = ['tools', 'system', 'skills', 'messages', 'other']

const WARN_RATIO = 0.75

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return new Intl.NumberFormat().format(value)
}

function formatPercent(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return '-'
  const percent = Math.max(0, Math.min(100, value * 100))
  if (percent === 0 || percent >= 10) return `${Math.round(percent)}%`
  return `${percent.toFixed(1)}%`
}

function stateColor(usedRatio: number, thresholdRatio: number): string {
  if (usedRatio >= thresholdRatio) return '#d9544e'
  if (usedRatio >= WARN_RATIO) return '#d9920f'
  return 'var(--ds-accent)'
}

/** Sample capacity for ?contextCapacityPreview=1 visual verification. */
export const CONTEXT_CAPACITY_PREVIEW: ContextCapacity = {
  windowTokens: 200_000,
  usedTokens: 145_000,
  freeTokens: 55_000,
  usedRatio: 0.725,
  freeRatio: 0.275,
  categories: [
    { key: 'tools', tokens: 12_600, ratio: 0.063 },
    { key: 'system', tokens: 22_000, ratio: 0.11 },
    { key: 'skills', tokens: 2_700, ratio: 0.0135 },
    { key: 'messages', tokens: 98_000, ratio: 0.49 },
    { key: 'other', tokens: 9_700, ratio: 0.0485 },
  ],
  estimated: true,
  hasMeasuredTotal: true,
}

export function ContextCapacityPopover({
  capacity,
  thresholdRatio = 0.9,
}: {
  capacity: ContextCapacity
  /** Approximate auto-compaction trigger, as a share of the window. */
  thresholdRatio?: number
}): ReactElement {
  const accent = stateColor(capacity.usedRatio, thresholdRatio)

  const visibleSegments = CATEGORY_ORDER.map((key) =>
    capacity.categories.find((c) => c.key === key)
  ).filter((c): c is ContextCategory => Boolean(c) && (c?.tokens ?? 0) > 0)

  const statusText =
    capacity.usedRatio >= thresholdRatio
      ? 'Context window is nearly full'
      : capacity.usedRatio >= WARN_RATIO
        ? 'Approaching context limit'
        : 'Share of context window used'

  return (
    <div
      className="context-capacity-popover"
      role="dialog"
      aria-label="Context capacity"
    >
      <div className="context-capacity-header">
        <span className="context-capacity-title">Context capacity</span>
        <span className="context-capacity-total">
          <span className="context-capacity-total-used" style={{ color: accent }}>
            {formatCompactNumber(capacity.usedTokens)}
          </span>
          {' / '}
          {formatCompactNumber(capacity.windowTokens)}
          {' · '}
          <span className="context-capacity-total-used" style={{ color: accent }}>
            {formatPercent(capacity.usedRatio)}
          </span>
        </span>
      </div>

      <div className="context-capacity-bar-wrap">
        <div
          className="context-capacity-bar"
          role="img"
          aria-label={`${formatPercent(capacity.usedRatio)} of context window used`}
        >
          {visibleSegments.map((segment) => (
            <span
              key={segment.key}
              className="context-capacity-bar-segment"
              style={{
                width: `${segment.ratio * 100}%`,
                minWidth: segment.key === 'messages' ? undefined : 2,
                background: CATEGORY_COLORS[segment.key],
              }}
            />
          ))}
        </div>
        <span
          className="context-capacity-threshold"
          style={{ left: `${thresholdRatio * 100}%` }}
          title={`Compaction threshold · ${formatPercent(thresholdRatio)}`}
          aria-hidden="true"
        />
      </div>

      <div className="context-capacity-status-row">
        <span className="context-capacity-status" style={{ color: accent }}>
          {statusText}
        </span>
        <span className="context-capacity-threshold-label">
          Compaction threshold · {formatPercent(thresholdRatio)}
        </span>
      </div>

      <div className="context-capacity-categories">
        {CATEGORY_ORDER.map((key) => {
          const category = capacity.categories.find((c) => c.key === key)
          if (!category) return null
          return (
            <div key={key} className="context-capacity-row">
              <span
                className="context-capacity-swatch"
                style={{ background: CATEGORY_COLORS[key] }}
              />
              <span className="context-capacity-row-label">{CATEGORY_LABELS[key]}</span>
              <span className="context-capacity-row-tokens">
                {formatCompactNumber(category.tokens)}
              </span>
              <span className="context-capacity-row-ratio">{formatPercent(category.ratio)}</span>
            </div>
          )
        })}

        <div className="context-capacity-row context-capacity-row-free">
          <span className="context-capacity-swatch context-capacity-swatch-free" />
          <span className="context-capacity-row-label context-capacity-row-label-muted">Free</span>
          <span className="context-capacity-row-tokens context-capacity-row-label-muted">
            {formatCompactNumber(capacity.freeTokens)}
          </span>
          <span className="context-capacity-row-ratio context-capacity-row-label-muted">
            {formatPercent(capacity.freeRatio)}
          </span>
        </div>
      </div>

      {capacity.estimated ? (
        <p className="context-capacity-footnote">
          {capacity.hasMeasuredTotal
            ? 'Category breakdown is estimated; total is measured from the latest turn.'
            : 'Capacity is estimated until the first model turn completes.'}
        </p>
      ) : null}
    </div>
  )
}
