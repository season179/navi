// Context-window capacity popover echoing Kun's ContextCapacityPopover
// (../Kun/src/renderer/src/components/chat/ContextCapacityPopover.tsx). Visual
// only: parent supplies a ContextCapacity snapshot; no live token accounting.

import type { ReactElement } from 'react'
import {
  CONTEXT_CAPACITY_CATEGORY_LABELS,
  CONTEXT_CAPACITY_ESTIMATED_ALL,
  CONTEXT_CAPACITY_ESTIMATED_BREAKDOWN,
  CONTEXT_CAPACITY_TITLE,
  formatContextCapacityBarAria,
  formatContextCapacityPercent,
  formatContextCapacityThresholdLabel,
  resolveContextCapacityStatusText,
  type ContextCapacityCategoryKey,
} from '../../lib/composerContextCapacity'

export type ContextCategoryKey = ContextCapacityCategoryKey

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

const CATEGORY_ORDER: ContextCategoryKey[] = ['tools', 'system', 'skills', 'messages', 'other']

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return new Intl.NumberFormat().format(value)
}

function stateColor(usedRatio: number, thresholdRatio: number): string {
  if (usedRatio >= thresholdRatio) return '#d9544e'
  if (usedRatio >= 0.75) return '#d9920f'
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

  const usedPercent = formatContextCapacityPercent(capacity.usedRatio)
  const thresholdPercent = formatContextCapacityPercent(thresholdRatio)
  const statusText = resolveContextCapacityStatusText(
    capacity.usedRatio,
    thresholdRatio,
  )

  return (
    <div
      className="context-capacity-popover"
      role="dialog"
      aria-label={CONTEXT_CAPACITY_TITLE}
    >
      <div className="context-capacity-header">
        <span className="context-capacity-title">{CONTEXT_CAPACITY_TITLE}</span>
        <span className="context-capacity-total">
          <span className="context-capacity-total-used" style={{ color: accent }}>
            {formatCompactNumber(capacity.usedTokens)}
          </span>
          {' / '}
          {formatCompactNumber(capacity.windowTokens)}
          {' · '}
          <span className="context-capacity-total-used" style={{ color: accent }}>
            {usedPercent}
          </span>
        </span>
      </div>

      <div className="context-capacity-bar-wrap">
        <div
          className="context-capacity-bar"
          role="img"
          aria-label={formatContextCapacityBarAria(usedPercent)}
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
          title={formatContextCapacityThresholdLabel(thresholdPercent)}
          aria-hidden="true"
        />
      </div>

      <div className="context-capacity-status-row">
        <span className="context-capacity-status" style={{ color: accent }}>
          {statusText}
        </span>
        <span className="context-capacity-threshold-label">
          {formatContextCapacityThresholdLabel(thresholdPercent)}
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
              <span className="context-capacity-row-label">
                {CONTEXT_CAPACITY_CATEGORY_LABELS[key]}
              </span>
              <span className="context-capacity-row-tokens">
                {formatCompactNumber(category.tokens)}
              </span>
              <span className="context-capacity-row-ratio">
                {formatContextCapacityPercent(category.ratio)}
              </span>
            </div>
          )
        })}

        <div className="context-capacity-row context-capacity-row-free">
          <span className="context-capacity-swatch context-capacity-swatch-free" />
          <span className="context-capacity-row-label context-capacity-row-label-muted">
            {CONTEXT_CAPACITY_CATEGORY_LABELS.free}
          </span>
          <span className="context-capacity-row-tokens context-capacity-row-label-muted">
            {formatCompactNumber(capacity.freeTokens)}
          </span>
          <span className="context-capacity-row-ratio context-capacity-row-label-muted">
            {formatContextCapacityPercent(capacity.freeRatio)}
          </span>
        </div>
      </div>

      {capacity.estimated ? (
        <p className="context-capacity-footnote">
          {capacity.hasMeasuredTotal
            ? CONTEXT_CAPACITY_ESTIMATED_BREAKDOWN
            : CONTEXT_CAPACITY_ESTIMATED_ALL}
        </p>
      ) : null}
    </div>
  )
}
