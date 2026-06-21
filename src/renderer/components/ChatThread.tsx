// Renders a conversation as alternating user / assistant rows. Production chat
// uses the ported MessageBubble chrome (Kun message-timeline-bubbles.tsx) while
// mapping navi's simple ChatMessage thread onto user/assistant/system snapshots.

import { useEffect, useRef, type ReactElement } from 'react'
import type { ChatMessage } from '../flue/useNaviChat'
import { LiveTurnProgressRow } from './LiveTurnProgressRow'
import { MessageBubble, type MessageBubbleSnapshot } from './MessageBubble'

function chatMessageToSnapshot(message: ChatMessage): MessageBubbleSnapshot | null {
  if (message.role === 'user') {
    return {
      kind: 'user',
      id: message.id,
      text: message.text,
      canEdit: false,
    }
  }

  if (message.status === 'error') {
    return {
      kind: 'system',
      id: message.id,
      text: message.text,
      severity: 'error',
    }
  }

  return {
    kind: 'assistant',
    id: message.id,
    text: message.text,
    streaming: message.status === 'streaming',
  }
}

export function ChatThread({ messages }: { messages: ChatMessage[] }): ReactElement {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <div className="chat-thread message-timeline">
      <div className="message-timeline-content chat-thread-inner">
        {messages.map((message) => {
          const snapshot = chatMessageToSnapshot(message)
          const streaming = message.status === 'streaming'
          const showBubble =
            snapshot &&
            !(streaming && snapshot.kind === 'assistant' && snapshot.text.trim() === '')

          return (
            <div key={message.id} className="message-timeline-turn">
              {showBubble ? <MessageBubble block={snapshot} /> : null}
              {streaming ? <LiveTurnProgressRow /> : null}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
