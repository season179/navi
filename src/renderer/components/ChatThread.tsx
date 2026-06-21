// Renders a conversation as alternating user / assistant rows. Production chat
// uses the ported MessageBubble chrome (Kun message-timeline-bubbles.tsx) while
// mapping navi's simple ChatMessage thread onto user/assistant/system snapshots.

import { useEffect, useMemo, useRef, type ReactElement } from 'react'
import type { ChatMessage } from '../flue/useNaviChat'
import { goalTimelinePaddingClass, LiveTurnProgressRow } from './LiveTurnProgressRow'
import { MessageBubble, type MessageBubbleSnapshot } from './MessageBubble'
import { TimelineJumpRail, type TimelineJumpAnchor } from './TimelineJumpRail'

type ChatTurn = {
  key: string
  messages: ChatMessage[]
}

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

function groupMessagesIntoTurns(messages: ChatMessage[]): ChatTurn[] {
  const turns: ChatTurn[] = []

  for (const message of messages) {
    if (message.role === 'user') {
      turns.push({ key: message.id, messages: [message] })
      continue
    }

    if (turns.length > 0) {
      turns[turns.length - 1].messages.push(message)
      continue
    }

    turns.push({ key: message.id, messages: [message] })
  }

  return turns
}

function turnPreviewLabel(turn: ChatTurn, index: number): string {
  const user = turn.messages.find((message) => message.role === 'user')
  const text = user?.text.trim() ?? ''
  if (!text) return `Question ${index}`
  const oneLine = text.replace(/\s+/g, ' ')
  return oneLine.length > 48 ? `${oneLine.slice(0, 47).trimEnd()}…` : oneLine
}

export function ChatThread({ messages }: { messages: ChatMessage[] }): ReactElement {
  const bottomRef = useRef<HTMLDivElement>(null)
  const turnRefMap = useRef(new Map<string, HTMLDivElement>())
  const turns = useMemo(() => groupMessagesIntoTurns(messages), [messages])

  const anchors = useMemo((): TimelineJumpAnchor[] => {
    return turns
      .filter((turn) => turn.messages.some((message) => message.role === 'user'))
      .map((turn, index) => ({
        key: turn.key,
        label: String(index + 1),
        title: turnPreviewLabel(turn, index + 1),
      }))
  }, [turns])

  const jumpToTurn = (key: string): void => {
    const target = turnRefMap.current.get(key)
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <div className="message-timeline ds-no-drag">
      <TimelineJumpRail anchors={anchors} onJump={jumpToTurn} />
      <div
        className={`message-timeline-content ds-message-timeline-content ds-chat-column-inset ${goalTimelinePaddingClass(
          'chat',
          false,
        )}`}
      >
        {turns.map((turn) => (
          <div
            key={turn.key}
            ref={(node) => {
              if (node) {
                turnRefMap.current.set(turn.key, node)
              } else {
                turnRefMap.current.delete(turn.key)
              }
            }}
            className="message-timeline-turn-anchor scroll-mt-6"
          >
            <div className="message-timeline-turn">
              {turn.messages.map((message) => {
                const snapshot = chatMessageToSnapshot(message)
                const streaming = message.status === 'streaming'
                const showBubble =
                  snapshot &&
                  !(streaming && snapshot.kind === 'assistant' && snapshot.text.trim() === '')

                return (
                  <div key={message.id}>
                    {showBubble ? <MessageBubble block={snapshot} /> : null}
                    {streaming ? <LiveTurnProgressRow /> : null}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
