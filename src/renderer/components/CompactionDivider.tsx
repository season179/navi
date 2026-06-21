// Compaction timeline divider echoing Kun's CompactionDivider
// (../Kun/src/renderer/src/components/chat/MessageTimeline.tsx).
// Visual only: parent supplies compaction block snapshots.

import type { ReactElement } from 'react'

export type CompactionDividerSnapshot = {
  status: 'running' | 'done' | 'error'
  auto?: boolean
  summary?: string
}

const COPY = {
  running: 'Compacting context',
  autoCompleted: 'Auto-compacted context',
  manualCompleted: 'Compacted context',
  failed: 'Context compaction failed',
} as const

/** Sample snapshots for ?compactionDivider preview hooks. */
export const COMPACTION_DIVIDER_PREVIEW = {
  running: { status: 'running' },
  autoCompleted: { status: 'done', auto: true },
  manualCompleted: { status: 'done', auto: false },
  error: { status: 'error' },
  errorWithSummary: {
    status: 'error',
    summary: 'Compaction timed out after 45s',
  },
} as const satisfies Record<string, CompactionDividerSnapshot>

export type CompactionDividerPreviewMode = keyof typeof COMPACTION_DIVIDER_PREVIEW

function compactionDividerLabel(block: CompactionDividerSnapshot): string {
  if (block.status === 'running') return COPY.running
  if (block.status === 'error') return block.summary?.trim() || COPY.failed
  return block.auto === true ? COPY.autoCompleted : COPY.manualCompleted
}

type Props = {
  block: CompactionDividerSnapshot
}

export function CompactionDivider({ block }: Props): ReactElement {
  const error = block.status === 'error'
  const label = compactionDividerLabel(block)

  return (
    <div
      className="compaction-divider"
      role={block.status === 'running' ? 'status' : undefined}
      aria-live={block.status === 'running' ? 'polite' : undefined}
    >
      <span className={`compaction-divider-line ${error ? 'is-error' : ''}`} />
      <span className={`compaction-divider-label ${error ? 'is-error' : ''}`}>{label}</span>
      <span className={`compaction-divider-line ${error ? 'is-error' : ''}`} />
    </div>
  )
}

export function CompactionDividerPreview({
  mode,
}: {
  mode: CompactionDividerPreviewMode
}): ReactElement {
  return (
    <div className="compaction-divider-preview">
      <CompactionDivider block={COMPACTION_DIVIDER_PREVIEW[mode]} />
    </div>
  )
}
