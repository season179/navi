// Process file path links echoing Kun's ProcessFileReference and ProcessSummaryText
// (../Kun/src/renderer/src/components/chat/message-timeline-process.tsx).
// Visual only: click handlers are omitted; mousedown stops row toggle like Kun.

import type { MouseEvent, ReactElement } from 'react'
import { PROCESS_FILE_REFERENCE_HINT } from '../lib/processTimeline'

type ProcessFileReferenceProps = {
  path: string
  children: string
}

export function ProcessFileReference({
  path,
  children,
}: ProcessFileReferenceProps): ReactElement {
  const stopRowToggle = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
  }

  return (
    <button
      type="button"
      className="ds-process-file-reference"
      title={PROCESS_FILE_REFERENCE_HINT}
      aria-label={`Preview ${path}`}
      onMouseDown={stopRowToggle}
    >
      {children}
    </button>
  )
}

type ProcessSummaryTextProps = {
  summary: string
  filePath?: string
  /** Kun ProcessSummaryText only embeds file links for tool blocks. */
  enableFileReference?: boolean
}

/** Inline summary with an embedded file-reference button when filePath appears in summary. */
export function ProcessSummaryText({
  summary,
  filePath,
  enableFileReference = false,
}: ProcessSummaryTextProps): ReactElement {
  if (!enableFileReference || !filePath) return <>{summary}</>
  const index = summary.indexOf(filePath)
  if (index < 0) return <>{summary}</>
  const before = summary.slice(0, index)
  const after = summary.slice(index + filePath.length)
  return (
    <>
      {before}
      <ProcessFileReference path={filePath}>{filePath}</ProcessFileReference>
      {after}
    </>
  )
}
