// Renders a conversation as alternating user / assistant rows. Production chat
// uses the ported MessageTurn chrome (Kun MessageTimeline MessageTurn) while
// mapping navi's simple ChatMessage thread onto turn snapshots.

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react'
import type { ChatMessage } from '../flue/useNaviChat'
import { applyChatTurnLiveStream } from '../lib/chatTurnLiveStream'
import { buildDerivedIntermediateTurnPreview } from '../lib/buildMessageTurnSnapshot'
import { goalTimelinePaddingClass } from './LiveTurnProgressRow'
import {
  type AssistantMessageSnapshot,
  type MessageBubbleSnapshot,
  type UserMessageSnapshot,
} from './MessageBubble'
import { MessageTurn, type MessageTurnSnapshot } from './MessageTurn'
import { TimelineJumpRail, type TimelineJumpAnchor } from './TimelineJumpRail'
import {
  TimelineCollapseEarlierButton,
  TimelineShowEarlierButton,
} from './TimelinePaginationControls'
import { type CompactionDividerSnapshot } from './CompactionDivider'
import type { MediaReference } from './MediaPreviewTile'
import { type ReviewSummarySnapshot } from './ReviewSummaryCard'
import { ThreadForkBanner, ThreadForkPoint } from './ThreadForkBanner'
import { type ProcessSectionSnapshot } from './ProcessSectionRow'
import { type TurnChangeSnapshot } from './TurnChangeSummary'

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

type TurnOverlayProps = {
  compactionAtTurnIndex?: number
  compactionBlock?: CompactionDividerSnapshot
  planAtTurnIndex?: number
  planTitle?: string
  planRelativePath?: string
  generatedFilesAtTurnIndex?: number
  generatedFiles?: MediaReference[]
  reviewsAtTurnIndex?: number
  turnReviews?: ReviewSummarySnapshot[]
  devPreviewAtTurnIndex?: number
  devPreviewUrl?: string
  devPreviewOpened?: boolean
  onDevPreviewOpen?: () => void
  changesAtTurnIndex?: number
  turnChanges?: TurnChangeSnapshot[]
  turnChangesCompact?: boolean
  turnChangesDefaultExpanded?: boolean
  workProcessAtTurnIndex?: number
  workProcess?: {
    processing: boolean
    workExpanded?: boolean
    workMeta: {
      processing: boolean
      stepCount: number
      durationMs?: number
      reasoningDurationMs?: number
      collapsible?: boolean
    }
    processSections: ProcessSectionSnapshot[]
  }
  derivedTurnAtIndex?: number
}

function chatTurnToSnapshot(turn: ChatTurn): MessageTurnSnapshot {
  const userMessage = turn.messages.find((message) => message.role === 'user')
  const nonUserMessages = turn.messages.filter((message) => message.role !== 'user')
  const streamingMessage = nonUserMessages.find((message) => message.status === 'streaming')
  const settledMessages = nonUserMessages.filter((message) => message.status !== 'streaming')

  const userSnapshot = userMessage ? chatMessageToSnapshot(userMessage) : null
  const user =
    userSnapshot?.kind === 'user' ? (userSnapshot as UserMessageSnapshot) : undefined

  const assistantBlocks = settledMessages
    .map((message) => chatMessageToSnapshot(message))
    .filter(
      (snapshot): snapshot is MessageBubbleSnapshot =>
        snapshot != null && snapshot.kind === 'assistant',
    )

  const systemBlocks = settledMessages
    .map((message) => chatMessageToSnapshot(message))
    .filter(
      (snapshot): snapshot is MessageBubbleSnapshot =>
        snapshot != null && snapshot.kind === 'system',
    )

  const streamingSnapshot = streamingMessage
    ? chatMessageToSnapshot(streamingMessage)
    : null
  const liveAssistant =
    streamingSnapshot?.kind === 'assistant' && streamingSnapshot.text.trim()
      ? (streamingSnapshot as AssistantMessageSnapshot)
      : undefined
  const showLiveProgress =
    streamingSnapshot?.kind === 'assistant' && !streamingSnapshot.text.trim()

  return {
    key: turn.key,
    user,
    assistantBlocks: [...assistantBlocks, ...systemBlocks],
    liveAssistant,
    showLiveProgress,
    processing: Boolean(streamingMessage),
  }
}

function applyTurnOverlays(
  snapshot: MessageTurnSnapshot,
  absoluteTurnIndex: number,
  overlays: TurnOverlayProps,
): MessageTurnSnapshot {
  if (
    overlays.derivedTurnAtIndex != null &&
    overlays.derivedTurnAtIndex === absoluteTurnIndex
  ) {
    return buildDerivedIntermediateTurnPreview()
  }

  const next: MessageTurnSnapshot = { ...snapshot }

  if (
    overlays.workProcess != null &&
    typeof overlays.workProcessAtTurnIndex === 'number' &&
    overlays.workProcessAtTurnIndex === absoluteTurnIndex
  ) {
    next.processing = overlays.workProcess.processing
    next.workExpanded = overlays.workProcess.workExpanded
    next.workMeta = overlays.workProcess.workMeta
    next.processSections = overlays.workProcess.processSections
  }

  if (
    overlays.generatedFiles != null &&
    overlays.generatedFiles.length > 0 &&
    typeof overlays.generatedFilesAtTurnIndex === 'number' &&
    overlays.generatedFilesAtTurnIndex === absoluteTurnIndex
  ) {
    next.generatedFiles = overlays.generatedFiles
  }

  if (
    overlays.turnReviews != null &&
    overlays.turnReviews.length > 0 &&
    typeof overlays.reviewsAtTurnIndex === 'number' &&
    overlays.reviewsAtTurnIndex === absoluteTurnIndex
  ) {
    next.reviews = overlays.turnReviews
  }

  if (
    overlays.devPreviewUrl != null &&
    typeof overlays.devPreviewAtTurnIndex === 'number' &&
    overlays.devPreviewAtTurnIndex === absoluteTurnIndex
  ) {
    next.devPreviewUrl = overlays.devPreviewUrl
    next.devPreviewOpened = overlays.devPreviewOpened
    next.onDevPreviewOpen = overlays.onDevPreviewOpen
  }

  if (
    overlays.planTitle != null &&
    overlays.planRelativePath != null &&
    typeof overlays.planAtTurnIndex === 'number' &&
    overlays.planAtTurnIndex === absoluteTurnIndex
  ) {
    next.plan = {
      title: overlays.planTitle,
      relativePath: overlays.planRelativePath,
    }
  }

  if (
    overlays.turnChanges != null &&
    overlays.turnChanges.length > 0 &&
    typeof overlays.changesAtTurnIndex === 'number' &&
    overlays.changesAtTurnIndex === absoluteTurnIndex
  ) {
    next.changes = overlays.turnChanges
    next.changesCompact = overlays.turnChangesCompact
    next.changesDefaultExpanded = overlays.turnChangesDefaultExpanded
  }

  if (
    overlays.compactionBlock != null &&
    typeof overlays.compactionAtTurnIndex === 'number' &&
    overlays.compactionAtTurnIndex === absoluteTurnIndex
  ) {
    next.compaction = overlays.compactionBlock
  }

  return next
}

type ChatThreadProps = TurnOverlayProps & {
  messages: ChatMessage[]
  /** When true, renders Kun's fork banner above the turn list. */
  showForkBanner?: boolean
  forkedFromTitle?: string
  /** Absolute turn index (0-based) at which the fork boundary marker is inserted. */
  forkBoundaryTurnIndex?: number
  /** Timeline-level live stream override for the latest turn (preview hooks). */
  liveReasoning?: string
  liveContent?: string
  hasActiveGoal?: boolean
}

export function ChatThread({
  messages,
  showForkBanner = false,
  forkedFromTitle,
  forkBoundaryTurnIndex,
  compactionAtTurnIndex,
  compactionBlock,
  planAtTurnIndex,
  planTitle,
  planRelativePath,
  generatedFilesAtTurnIndex,
  generatedFiles,
  reviewsAtTurnIndex,
  turnReviews,
  devPreviewAtTurnIndex,
  devPreviewUrl,
  devPreviewOpened = false,
  onDevPreviewOpen,
  changesAtTurnIndex,
  turnChanges,
  turnChangesCompact = false,
  turnChangesDefaultExpanded = false,
  workProcessAtTurnIndex,
  workProcess,
  derivedTurnAtIndex,
  liveReasoning,
  liveContent,
  hasActiveGoal = false,
}: ChatThreadProps): ReactElement {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const turnRefMap = useRef(new Map<string, HTMLDivElement>())
  const turns = useMemo(() => groupMessagesIntoTurns(messages), [messages])
  const [visibleTurnCount, setVisibleTurnCount] = useState(TURN_PAGE_SIZE)
  const [historyExpanded, setHistoryExpanded] = useState(false)

  const overlayProps: TurnOverlayProps = {
    compactionAtTurnIndex,
    compactionBlock,
    planAtTurnIndex,
    planTitle,
    planRelativePath,
    generatedFilesAtTurnIndex,
    generatedFiles,
    reviewsAtTurnIndex,
    turnReviews,
    devPreviewAtTurnIndex,
    devPreviewUrl,
    devPreviewOpened,
    onDevPreviewOpen,
    changesAtTurnIndex,
    turnChanges,
    turnChangesCompact,
    turnChangesDefaultExpanded,
    workProcessAtTurnIndex,
    workProcess,
    derivedTurnAtIndex,
  }

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
    <div ref={containerRef} className="message-timeline ds-no-drag">
      <TimelineJumpRail anchors={anchors} onJump={jumpToTurn} />
      <div
        className={`message-timeline-content ds-message-timeline-content ds-chat-column-inset ${goalTimelinePaddingClass(
          'chat',
          false,
        )}`}
      >
        {showForkBanner ? <ThreadForkBanner parentTitle={forkedFromTitle} /> : null}

        <TimelineShowEarlierButton
          hiddenCount={hiddenTurnCount}
          pageSize={TURN_PAGE_SIZE}
          onShowEarlier={loadEarlierTurns}
        />

        {visibleTurns.map((turn, index) => {
          const absoluteTurnIndex = hiddenTurnCount + index
          const showForkPoint =
            typeof forkBoundaryTurnIndex === 'number' &&
            forkBoundaryTurnIndex === absoluteTurnIndex
          const isLatestVisibleTurn = index === visibleTurns.length - 1
          const turnSnapshot = applyChatTurnLiveStream(
            applyTurnOverlays(
              chatTurnToSnapshot(turn),
              absoluteTurnIndex,
              overlayProps,
            ),
            turn,
            {
              isLatestTurn: isLatestVisibleTurn,
              busy,
              liveReasoning: isLatestVisibleTurn ? liveReasoning : undefined,
              liveContent: isLatestVisibleTurn ? liveContent : undefined,
            },
          )

          return (
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
              {showForkPoint ? <ThreadForkPoint parentTitle={forkedFromTitle} /> : null}
              <MessageTurn
                turn={turnSnapshot}
                viewportRef={containerRef}
                hasActiveGoal={hasActiveGoal}
              />
            </div>
          )
        })}

        {typeof forkBoundaryTurnIndex === 'number' &&
        forkBoundaryTurnIndex === totalTurns &&
        totalTurns > 0 ? (
          <ThreadForkPoint parentTitle={forkedFromTitle} />
        ) : null}

        {totalTurns === 0 &&
        (liveReasoning?.trim() || liveContent?.trim()) ? (
          <div className="message-timeline-turn-anchor scroll-mt-6">
            <MessageTurn
              turn={{
                key: 'live-empty-turn',
                source: {
                  blocks: [],
                  isProcessing: busy,
                  liveReasoning: liveReasoning ?? '',
                  liveContent: liveContent ?? '',
                },
              }}
              viewportRef={containerRef}
              hasActiveGoal={hasActiveGoal}
            />
          </div>
        ) : null}

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
