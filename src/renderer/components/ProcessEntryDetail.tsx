// Expanded process entry detail echoing Kun's ProcessEntryDetail
// (../Kun/src/renderer/src/components/chat/message-timeline-process.tsx).
// Visual only: parent supplies entry snapshots and optional streaming block id.

import type { ReactElement } from 'react'
import { DiffView } from './DiffView'
import { Markdown } from './Markdown'
import { MessageBubble, type MessageBubbleSnapshot } from './MessageBubble'

export type ProcessEntryDetailKind =
  | 'text'
  | 'command'
  | 'patch'
  | 'error'
  | 'assistant'
  | 'approval'
  | 'user_input'
  | 'reasoning'

export type ProcessEntryDetailSnapshot = {
  detailText?: string
  detailKind?: ProcessEntryDetailKind
  detailFilePath?: string
  filePath?: string
  nestedBubble?: MessageBubbleSnapshot
}

type Props = {
  entry: ProcessEntryDetailSnapshot
  processing?: boolean
  /** Block id for live streaming — Kun uses live-assistant and live-reasoning. */
  streamBlockId?: string
}

export function ProcessEntryDetail({
  entry,
  processing,
  streamBlockId,
}: Props): ReactElement | null {
  if (entry.detailKind === 'approval' || entry.detailKind === 'user_input') {
    if (!entry.nestedBubble) return null
    return <MessageBubble block={entry.nestedBubble} nested />
  }
  if (!entry.detailText) return null
  if (entry.detailKind === 'reasoning') {
    return (
      <div className="process-section-row-reasoning ds-markdown">
        <Markdown
          text={entry.detailText}
          streaming={processing === true && streamBlockId === 'live-reasoning'}
        />
      </div>
    )
  }
  if (entry.detailKind === 'patch') {
    return (
      <DiffView
        patch={entry.detailText}
        filePath={entry.detailFilePath ?? entry.filePath}
      />
    )
  }
  if (entry.detailKind === 'error') {
    return (
      <div className="process-stack-entry-error-panel">
        {entry.detailFilePath ?? entry.filePath ? (
          <div className="process-stack-entry-error-path">
            {entry.detailFilePath ?? entry.filePath}
          </div>
        ) : null}
        <pre className="process-stack-entry-error-text">{entry.detailText}</pre>
      </div>
    )
  }
  if (entry.detailKind === 'assistant') {
    return (
      <div className="process-entry-row-assistant ds-markdown">
        <Markdown
          text={entry.detailText}
          streaming={processing === true && streamBlockId === 'live-assistant'}
        />
      </div>
    )
  }
  if (entry.detailKind === 'command') {
    return <pre className="process-stack-entry-command-text">{entry.detailText}</pre>
  }
  return <p className="process-stack-entry-muted-text">{entry.detailText}</p>
}
