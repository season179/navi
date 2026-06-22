// Queued composer messages echoing Kun's FloatingComposerQueuedMessages
// (../Kun/src/renderer/src/components/chat/FloatingComposerQueuedMessages.tsx).
// Visual only: parent supplies queued message snapshots; no send-queue wiring.

import type { ReactElement } from 'react'
import { Clock3, X } from 'lucide-react'
import {
  formatQueuedMessagesTitle,
  QUEUED_MESSAGE_REMOVE_LABEL,
  QUEUED_MESSAGES_HINT,
} from '../../lib/composerQueuedMessages'

export type QueuedComposerMessage = {
  id: string
  text: string
  displayText?: string
}

type Props = {
  messages: QueuedComposerMessage[]
  onRemove?: (id: string) => void
}

/** Sample queue for ?queuedMessagesPreview=1 visual verification. */
export const QUEUED_MESSAGES_PREVIEW: QueuedComposerMessage[] = [
  {
    id: 'preview-1',
    text: 'Can you walk me through the auth middleware and how tokens are validated?',
  },
  {
    id: 'preview-2',
    text: 'After that, suggest a few test cases I should add for the refresh flow.',
    displayText: 'Suggest test cases for the refresh flow',
  },
  {
    id: 'preview-3',
    text: 'Also check whether we log enough context when validation fails.',
  },
]

export function FloatingComposerQueuedMessages({
  messages,
  onRemove,
}: Props): ReactElement | null {
  if (messages.length === 0) return null

  const count = messages.length

  return (
    <div className="composer-queued-messages">
      <div className="composer-queued-header">
        <div className="composer-queued-title">
          <Clock3 strokeWidth={1.9} />
          <span>{formatQueuedMessagesTitle(count)}</span>
        </div>
        <div className="composer-queued-hint">{QUEUED_MESSAGES_HINT}</div>
      </div>
      <div className="composer-queued-list">
        {messages.map((message, index) => (
          <div key={message.id} className="composer-queued-pill">
            <span className="composer-queued-index">{index + 1}.</span>
            <span className="composer-queued-text">{message.displayText ?? message.text}</span>
            <button
              type="button"
              onClick={() => onRemove?.(message.id)}
              className="composer-queued-remove"
              aria-label={QUEUED_MESSAGE_REMOVE_LABEL}
              title={QUEUED_MESSAGE_REMOVE_LABEL}
            >
              <X strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
