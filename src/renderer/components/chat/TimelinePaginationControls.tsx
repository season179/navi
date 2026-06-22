// Timeline pagination controls echoing Kun's show/collapse earlier turns buttons
// (../Kun/src/renderer/src/components/chat/MessageTimeline.tsx).
// Visual only: parent supplies counts and optional click handlers.

import type { ReactElement } from 'react'
import {
  TIMELINE_COLLAPSE_EARLIER_TURNS_LABEL,
  formatTimelineShowEarlierTurns,
} from '../../lib/timelinePaginationControls'

type ShowEarlierProps = {
  hiddenCount: number
  pageSize?: number
  onShowEarlier?: () => void
}

export function TimelineShowEarlierButton({
  hiddenCount,
  pageSize = 18,
  onShowEarlier,
}: ShowEarlierProps): ReactElement | null {
  if (hiddenCount <= 0) return null

  const count = Math.min(hiddenCount, pageSize)

  return (
    <div className="timeline-pagination-control">
      <button
        type="button"
        className="timeline-show-earlier-button"
        onClick={() => onShowEarlier?.()}
      >
        {formatTimelineShowEarlierTurns(count)}
      </button>
    </div>
  )
}

type CollapseEarlierProps = {
  totalTurns: number
  pageSize?: number
  autoCollapseThreshold?: number
  busy?: boolean
  onCollapseEarlier?: () => void
}

export function TimelineCollapseEarlierButton({
  totalTurns,
  pageSize = 18,
  autoCollapseThreshold = 24,
  busy = false,
  onCollapseEarlier,
}: CollapseEarlierProps): ReactElement | null {
  if (totalTurns <= pageSize || totalTurns <= autoCollapseThreshold || busy) {
    return null
  }

  return (
    <div className="timeline-pagination-control">
      <button
        type="button"
        className="timeline-collapse-earlier-button"
        onClick={() => onCollapseEarlier?.()}
      >
        {TIMELINE_COLLAPSE_EARLIER_TURNS_LABEL}
      </button>
    </div>
  )
}

export type TimelinePaginationControlsPreviewMode =
  | 'showEarlier'
  | 'showEarlierSingle'
  | 'collapseEarlier'
  | 'both'

export function TimelinePaginationControlsPreview({
  mode,
}: {
  mode: TimelinePaginationControlsPreviewMode
}): ReactElement {
  const showEarlier = mode === 'showEarlier' || mode === 'showEarlierSingle' || mode === 'both'
  const collapseEarlier = mode === 'collapseEarlier' || mode === 'both'

  return (
    <div className="timeline-pagination-controls-preview">
      {showEarlier ? (
        <TimelineShowEarlierButton
          hiddenCount={mode === 'showEarlierSingle' ? 1 : 36}
          pageSize={18}
        />
      ) : null}
      {collapseEarlier ? (
        <TimelineCollapseEarlierButton totalTurns={30} pageSize={18} autoCollapseThreshold={24} />
      ) : null}
    </div>
  )
}
