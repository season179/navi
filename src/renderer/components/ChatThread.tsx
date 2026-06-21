// Renders a conversation as alternating user / assistant rows. Production chat
// uses the ported MessageBubble chrome (Kun message-timeline-bubbles.tsx) while
// mapping navi's simple ChatMessage thread onto user/assistant/system snapshots.

import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import type { ChatMessage } from '../flue/useNaviChat'
import { goalTimelinePaddingClass, LiveTurnProgressRow } from './LiveTurnProgressRow'
import { MessageBubble, type MessageBubbleSnapshot } from './MessageBubble'
import { TimelineJumpRail, type TimelineJumpAnchor } from './TimelineJumpRail'
import {
  TimelineCollapseEarlierButton,
  TimelineShowEarlierButton,
} from './TimelinePaginationControls'

const TURN_PAGE_SIZE = 18
const AUTO_COLLAPSE_THRESHOLD = 24

function deriveVisibleTurnCount(
  totalTurns: number,
  current: number,
  historyExpanded: boolean,
): number {
  const shouldCollapse = totalTurns > AUTO_COLLAPSE_THRESHOLD
  if (!shouldCollapse) return totalTurns
  const latestPageCount = Math.min(TURN_PAGE_SIZE, totalTurns)
  if (historyExpanded) {
    return Math.min(totalTurns, Math.max(current, latestPageCount))
  }
  return latestPageCount
}

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
  const [visibleTurnCount, setVisibleTurnCount] = useState(TURN_PAGE_SIZE)
  const [historyExpanded, setHistoryExpanded] = useState(false)

  const totalTurns = turns.length
  const busy = useMemo(
    () => messages.some((message) => message.status === 'streaming'),
    [messages],
  )

  useEffect(() => {
    setVisibleTurnCount((current) =>
      deriveVisibleTurnCount(totalTurns, current, historyExpanded),
    )
  }, [totalTurns, historyExpanded])

  const hiddenTurnCount = Math.max(0, totalTurns - visibleTurnCount)
  const visibleTurns = useMemo(
    () => (hiddenTurnCount > 0 ? turns.slice(hiddenTurnCount) : turns),
    [hiddenTurnCount, turns],
  )

  const anchors = useMemo((): TimelineJumpAnchor[] => {
    let questionIndex = turns
      .slice(0, hiddenTurnCount)
      .filter((turn) => turn.messages.some((message) => message.role === 'user')).length

    return visibleTurns
      .filter((turn) => turn.messages.some((message) => message.role === 'user'))
      .map((turn) => {
        questionIndex += 1
        return {
          key: turn.key,
          label: String(questionIndex),
          title: turnPreviewLabel(turn, questionIndex),
        }
      })
  }, [hiddenTurnCount, turns, visibleTurns])

  const loadEarlierTurns = (): void => {
    setHistoryExpanded(true)
    setVisibleTurnCount((count) => Math.min(totalTurns, count + TURN_PAGE_SIZE))
  }

  const collapseEarlierTurns = (): void => {
    setHistoryExpanded(false)
    setVisibleTurnCount(Math.min(TURN_PAGE_SIZE, totalTurns))
  }

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
        <TimelineShowEarlierButton
          hiddenCount={hiddenTurnCount}
          pageSize={TURN_PAGE_SIZE}
          onShowEarlier={loadEarlierTurns}
        />

        {visibleTurns.map((turn) => (
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

        {hiddenTurnCount === 0 ? (
          <TimelineCollapseEarlierButton
            totalTurns={totalTurns}
            pageSize={TURN_PAGE_SIZE}
            autoCollapseThreshold={AUTO_COLLAPSE_THRESHOLD}
            busy={busy}
            onCollapseEarlier={collapseEarlierTurns}
          />
        ) : null}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
