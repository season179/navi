// Timeline jump rail echoing Kun's sticky turn-index nav
// (../Kun/src/renderer/src/components/chat/MessageTimeline.tsx).
// Visual only: parent supplies turn anchor snapshots and optional jump handler.

import type { ReactElement } from 'react'

export type TimelineJumpAnchor = {
  key: string
  label: string
  title: string
}

const COPY = {
  railLabel: 'Jump to question',
} as const

/** Sample anchors for ?timelineJumpRailPreview visual verification. */
export const TIMELINE_JUMP_RAIL_PREVIEW_ANCHORS: TimelineJumpAnchor[] = [
  { key: 'turn-1', label: '1', title: 'How do I wire up auth middleware?' },
  { key: 'turn-2', label: '2', title: 'Can you add refresh token rotation?' },
  { key: 'turn-3', label: '3', title: 'Show me the failing test output' },
  { key: 'turn-4', label: '4', title: 'Refactor the session store' },
  { key: 'turn-5', label: '5', title: 'Add rate limiting to the API' },
  { key: 'turn-6', label: '6', title: 'Document the new endpoints' },
]

export const TIMELINE_JUMP_RAIL_PREVIEW_FEW_ANCHORS: TimelineJumpAnchor[] =
  TIMELINE_JUMP_RAIL_PREVIEW_ANCHORS.slice(0, 2)

type Props = {
  anchors: TimelineJumpAnchor[]
  onJump?: (key: string) => void
}

export function TimelineJumpRail({ anchors, onJump }: Props): ReactElement | null {
  if (anchors.length <= 2) return null

  return (
    <nav aria-label={COPY.railLabel} className="timeline-jump-rail">
      {anchors.map((anchor) => (
        <button
          key={anchor.key}
          type="button"
          className="timeline-jump-rail-button"
          title={anchor.title}
          aria-label={anchor.title}
          onClick={() => onJump?.(anchor.key)}
        >
          {anchor.label}
        </button>
      ))}
    </nav>
  )
}

export type TimelineJumpRailPreviewMode = 'default' | 'few' | 'many'

export function TimelineJumpRailPreview({
  mode,
}: {
  mode: TimelineJumpRailPreviewMode
}): ReactElement {
  const anchors =
    mode === 'few'
      ? TIMELINE_JUMP_RAIL_PREVIEW_FEW_ANCHORS
      : mode === 'many'
        ? [
            ...TIMELINE_JUMP_RAIL_PREVIEW_ANCHORS,
            { key: 'turn-7', label: '7', title: 'Ship the migration script' },
            { key: 'turn-8', label: '8', title: 'Review the PR diff' },
            { key: 'turn-9', label: '9', title: 'Fix the flaky integration test' },
            { key: 'turn-10', label: '10', title: 'Update the changelog' },
            { key: 'turn-11', label: '11', title: 'Prepare the release notes' },
            { key: 'turn-12', label: '12', title: 'Tag v2.4.0' },
          ]
        : TIMELINE_JUMP_RAIL_PREVIEW_ANCHORS

  return (
    <div className="timeline-jump-rail-preview">
      <div className="timeline-jump-rail-preview-stage">
        <TimelineJumpRail anchors={anchors} onJump={() => undefined} />
        <div className="timeline-jump-rail-preview-content">
          <p className="timeline-jump-rail-preview-hint">
            {anchors.length <= 2
              ? 'Rail hidden when two or fewer questions (matches Kun).'
              : 'Sticky jump rail appears when more than two questions are visible.'}
          </p>
        </div>
      </div>
    </div>
  )
}
