// Renders a conversation as alternating user / assistant rows. Streaming
// assistant text shows a typing indicator until the first token arrives, then
// the text with a soft caret while more is streaming.

import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../flue/useNaviChat'

function TypingDots() {
  return (
    <span className="typing" aria-label="Navi is thinking">
      <span />
      <span />
      <span />
    </span>
  )
}

export function ChatThread({ messages }: { messages: ChatMessage[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <div className="chat-thread">
      <div className="chat-thread-inner">
        {messages.map((m) => (
          <div key={m.id} className={`msg msg-${m.role}`}>
            <div className={`msg-bubble${m.status === 'error' ? ' is-error' : ''}`}>
              {m.role === 'assistant' && m.status === 'streaming' && m.text === '' ? (
                <TypingDots />
              ) : (
                <span className="msg-text">{m.text}</span>
              )}
              {m.role === 'assistant' && m.status === 'streaming' && m.text !== '' ? (
                <span className="msg-caret" />
              ) : null}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
