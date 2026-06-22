// Turn-level work-process summary row echoing Kun's WorkMetaRow
// (../Kun/src/renderer/src/components/chat/message-timeline-cards.tsx).
// Visual only: parent supplies processing state and optional durations.

import type { ReactElement } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import {
  formatWorkMetaRowThoughtFor,
  resolveWorkMetaRowMainLabel,
} from '../lib/workMetaRow'

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.max(1, Math.round(ms))}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)}s`
  if (ms < 3_600_000) {
    const totalSeconds = Math.round(ms / 1000)
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m}m ${s}s`
  }
  if (ms < 86_400_000) {
    const totalMinutes = Math.round(ms / 60_000)
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return `${h}h ${m}m`
  }
  const totalHours = Math.round(ms / 3_600_000)
  const d = Math.floor(totalHours / 24)
  const h = totalHours % 24
  return `${d}d ${h}h`
}

export type WorkMetaRowPreviewMode = 'processing' | 'processed' | 'steps' | 'static'

/** Sample props for ?workMetaRow=1 visual verification. */
export const WORK_META_ROW_PREVIEW = {
  processing: {
    processing: true,
    stepCount: 4,
    durationMs: 12_400,
    expanded: false,
    collapsible: true,
  },
  processed: {
    processing: false,
    stepCount: 6,
    durationMs: 28_500,
    reasoningDurationMs: 4_200,
    expanded: false,
    collapsible: true,
  },
  steps: {
    processing: false,
    stepCount: 8,
    expanded: true,
    collapsible: true,
  },
  static: {
    processing: true,
    stepCount: 2,
    durationMs: 3_800,
    expanded: false,
    collapsible: false,
  },
} as const

type Props = {
  processing: boolean
  stepCount: number
  durationMs?: number
  reasoningDurationMs?: number
  expanded: boolean
  onToggle?: () => void
  collapsible?: boolean
}

export function WorkMetaRow({
  processing,
  stepCount,
  durationMs,
  reasoningDurationMs,
  expanded,
  onToggle,
  collapsible = true,
}: Props): ReactElement {
  const mainLabel = resolveWorkMetaRowMainLabel({
    processing,
    stepCount,
    durationLabel:
      typeof durationMs === 'number' ? formatDuration(durationMs) : undefined,
  })

  const showThoughtSuffix =
    !processing &&
    typeof reasoningDurationMs === 'number' &&
    reasoningDurationMs >= 1000

  const content = (
    <>
      <span className={`work-meta-row-label ${processing ? 'ds-shiny-text' : ''}`}>
        {mainLabel}
      </span>
      {showThoughtSuffix ? (
        <span className="work-meta-row-thought">
          · {formatWorkMetaRowThoughtFor(formatDuration(reasoningDurationMs!))}
        </span>
      ) : null}
      {collapsible ? (
        expanded ? (
          <ChevronDown className="work-meta-row-chevron is-expanded" strokeWidth={1.8} />
        ) : (
          <ChevronRight className="work-meta-row-chevron" strokeWidth={1.8} />
        )
      ) : null}
    </>
  )

  if (!collapsible) {
    return <div className="work-meta-row is-static">{content}</div>
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="work-meta-row"
    >
      {content}
    </button>
  )
}
