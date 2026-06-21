// Renders a conversation as alternating user / assistant rows. Production chat
// uses the ported MessageBubble chrome (Kun message-timeline-bubbles.tsx) while
// mapping navi's simple ChatMessage thread onto user/assistant/system snapshots.

import { useEffect, useRef, type ReactElement } from 'react'
import type { ChatMessage } from '../flue/useNaviChat'
import { MessageBubble, type MessageBubbleSnapshot } from './MessageBubble'

function TypingDots(): ReactElement {
  return (
    <span className="typing" aria-label="Navi is thinking">
      <span />
      <span />
      <span />
    </span>
  )
}

function chatMessageToSnapshot(message: ChatMessage): MessageBubbleSnapshot | 'typing' {
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

  if (message.status === 'streaming' && message.text === '') {
    return 'typing'
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

          if (snapshot === 'typing') {
            return (
              <div key={message.id} className="message-timeline-turn">
                <div className="message-bubble-assistant">
                  <TypingDots />
                </div>
              </div>
            )
          }

          return (
            <div key={message.id} className="message-timeline-turn">
              <MessageBubble block={snapshot} />
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
