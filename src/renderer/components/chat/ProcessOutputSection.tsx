// Output-section assistant markdown echoing Kun's ProcessSectionRow output branch
// (../Kun/src/renderer/src/components/chat/message-timeline-process.tsx).
// Visual only: parent supplies output entry snapshots and optional processing state.

import type { ReactElement } from 'react'
import { ProcessEntryDetail } from './ProcessEntryDetail'

export type ProcessOutputEntrySnapshot = {
  id: string
  text: string
  streaming?: boolean
}

export function ProcessOutputSection({
  entries,
  processing,
}: {
  entries: ProcessOutputEntrySnapshot[]
  processing?: boolean
}): ReactElement {
  const visible = entries.filter((entry) => entry.text.trim().length > 0)
  if (visible.length === 0) return <></>

  return (
    <div className="process-section-row-output">
      {visible.map((entry) => {
        const effectiveProcessing =
          processing === true || entry.streaming === true
        return (
          <ProcessEntryDetail
            key={entry.id}
            entry={{
              detailKind: 'assistant',
              detailText: entry.text,
            }}
            processing={effectiveProcessing}
            streamBlockId={entry.id}
          />
        )
      })}
    </div>
  )
}
