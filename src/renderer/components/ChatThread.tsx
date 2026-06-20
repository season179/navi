// Renders a conversation as alternating user / assistant rows. Assistant
// messages render as markdown (with shiki-highlighted code blocks) and reveal
// with a typewriter pace while streaming; a typing indicator shows before the
// first token. User and error messages stay plain text. Each finished
// assistant message gets a hover copy button.

import { memo, useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import type { ChatMessage } from '../flue/useNaviChat'
import { Markdown } from './Markdown'

function TypingDots() {
  return (
    <span className="typing" aria-label="Navi is thinking">
      <span />
      <span />
      <span />
    </span>
  )
}

function CopyMessageButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const resetRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (resetRef.current !== null) window.clearTimeout(resetRef.current)
    },
    [],
  )

  const handleCopy = async () => {
    if (!navigator?.clipboard?.writeText) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      if (resetRef.current !== null) window.clearTimeout(resetRef.current)
      resetRef.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      className="msg-copy"
      title="Copy message"
      aria-label="Copy message"
      onClick={() => void handleCopy()}
    >
      {copied ? <Check className="msg-copy-icon" strokeWidth={2.1} /> : <Copy className="msg-copy-icon" strokeWidth={1.9} />}
    </button>
  )
}

// Memoized on the message object. useNaviChat returns a stable reference for
// every message except the one being updated, so while a reply streams (a delta
// ~every 40ms) only the in-flight message re-renders — prior done messages and
// their markdown are skipped.
const AssistantMessage = memo(function AssistantMessage({ message }: { message: ChatMessage }) {
  // Streaming with nothing yet — show the thinking indicator.
  if (message.status === 'streaming' && message.text === '') {
    return (
      <div className="msg-bubble">
        <TypingDots />
      </div>
    )
  }

  if (message.status === 'error') {
    return (
      <div className="msg-bubble is-error">
        <span className="msg-text">{message.text}</span>
      </div>
    )
  }

  return (
    <div className="msg-bubble">
      <div className="ds-markdown">
        <Markdown text={message.text} streaming={message.status === 'streaming'} />
      </div>
      {message.status === 'done' && message.text !== '' ? (
        <CopyMessageButton text={message.text} />
      ) : null}
    </div>
  )
})

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
            {m.role === 'assistant' ? (
              <AssistantMessage message={m} />
            ) : (
              <div className={`msg-bubble${m.status === 'error' ? ' is-error' : ''}`}>
                <span className="msg-text">{m.text}</span>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
