// Renders a conversation as alternating user / assistant rows. Production chat
// uses the ported MessageBubble chrome (Kun message-timeline-bubbles.tsx) while
// mapping navi's simple ChatMessage thread onto user/assistant/system snapshots.

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react'
import type { ChatMessage } from '../flue/useNaviChat'
import { goalTimelinePaddingClass, LiveTurnProgressRow } from './LiveTurnProgressRow'
import { MessageBubble, type MessageBubbleSnapshot } from './MessageBubble'
import { TimelineJumpRail, type TimelineJumpAnchor } from './TimelineJumpRail'
import {
  TimelineCollapseEarlierButton,
  TimelineShowEarlierButton,
} from './TimelinePaginationControls'
import { CompactionDivider, type CompactionDividerSnapshot } from './CompactionDivider'
import { DevPreviewLaunchCard } from './DevPreviewLaunchCard'
import { GeneratedFilesPanel } from './GeneratedFilesPanel'
import type { MediaReference } from './MediaPreviewTile'
import { ReviewPlanCard } from './ReviewPlanCard'
import { ReviewSummaryCard, type ReviewSummarySnapshot } from './ReviewSummaryCard'
import { ThreadForkBanner, ThreadForkPoint } from './ThreadForkBanner'
import {
  ProcessSectionRow,
  type ProcessSectionSnapshot,
} from './ProcessSectionRow'
import {
  TurnChangeSummary,
  type TurnChangeSnapshot,
} from './TurnChangeSummary'
import { WorkMetaRow } from './WorkMetaRow'

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

type ChatThreadProps = {
  messages: ChatMessage[]
  /** When true, renders Kun's fork banner above the turn list. */
  showForkBanner?: boolean
  forkedFromTitle?: string
  /** Absolute turn index (0-based) at which the fork boundary marker is inserted. */
  forkBoundaryTurnIndex?: number
  /** When set with compactionBlock, renders Kun's compaction divider at this turn. */
  compactionAtTurnIndex?: number
  compactionBlock?: CompactionDividerSnapshot
  /** When set with planTitle/planRelativePath, renders Kun's review plan card at this turn. */
  planAtTurnIndex?: number
  planTitle?: string
  planRelativePath?: string
  /** When set with generatedFiles, renders Kun's generated files panel at this turn. */
  generatedFilesAtTurnIndex?: number
  generatedFiles?: MediaReference[]
  /** When set with turnReviews, renders Kun's review summary cards at this turn. */
  reviewsAtTurnIndex?: number
  turnReviews?: ReviewSummarySnapshot[]
  /** When set with devPreviewUrl, renders Kun's dev preview launch card at this turn. */
  devPreviewAtTurnIndex?: number
  devPreviewUrl?: string
  devPreviewOpened?: boolean
  onDevPreviewOpen?: () => void
  /** When set with turnChanges, renders Kun's turn change summary at this turn. */
  changesAtTurnIndex?: number
  turnChanges?: TurnChangeSnapshot[]
  turnChangesCompact?: boolean
  turnChangesDefaultExpanded?: boolean
  /** When set with workProcess, renders Kun's work meta row and process sections at this turn. */
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
}: ChatThreadProps): ReactElement {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const turnRefMap = useRef(new Map<string, HTMLDivElement>())
  const [workExpandedOverride, setWorkExpandedOverride] = useState<boolean | null>(null)
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
          const showCompaction =
            compactionBlock != null &&
            typeof compactionAtTurnIndex === 'number' &&
            compactionAtTurnIndex === absoluteTurnIndex
          const showPlan =
            planTitle != null &&
            planRelativePath != null &&
            typeof planAtTurnIndex === 'number' &&
            planAtTurnIndex === absoluteTurnIndex
          const showGeneratedFiles =
            generatedFiles != null &&
            generatedFiles.length > 0 &&
            typeof generatedFilesAtTurnIndex === 'number' &&
            generatedFilesAtTurnIndex === absoluteTurnIndex
          const showReviews =
            turnReviews != null &&
            turnReviews.length > 0 &&
            typeof reviewsAtTurnIndex === 'number' &&
            reviewsAtTurnIndex === absoluteTurnIndex
          const showDevPreview =
            devPreviewUrl != null &&
            typeof devPreviewAtTurnIndex === 'number' &&
            devPreviewAtTurnIndex === absoluteTurnIndex
          const showTurnChanges =
            turnChanges != null &&
            turnChanges.length > 0 &&
            typeof changesAtTurnIndex === 'number' &&
            changesAtTurnIndex === absoluteTurnIndex
          const showWorkProcess =
            workProcess != null &&
            typeof workProcessAtTurnIndex === 'number' &&
            workProcessAtTurnIndex === absoluteTurnIndex
          const processSections = workProcess?.processSections ?? []
          const reasoningSectionCount = processSections.filter(
            (section) => section.kind === 'reasoning',
          ).length
          const hasProcessError = processSections.some((section) => section.hasError)
          const workExpanded =
            hasProcessError ||
            (workExpandedOverride ??
              workProcess?.workExpanded ??
              workProcess?.processing ??
              false)

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
              <div className="message-timeline-turn">
                {turn.messages
                  .filter((message) => message.role === 'user')
                  .map((message) => {
                    const snapshot = chatMessageToSnapshot(message)
                    return snapshot ? (
                      <MessageBubble key={message.id} block={snapshot} />
                    ) : null
                  })}

                {showWorkProcess && workProcess?.workMeta ? (
                  <div className="message-timeline-turn-process">
                    <WorkMetaRow
                      processing={workProcess.workMeta.processing}
                      stepCount={workProcess.workMeta.stepCount}
                      durationMs={workProcess.workMeta.durationMs}
                      reasoningDurationMs={workProcess.workMeta.reasoningDurationMs}
                      expanded={workExpanded}
                      collapsible={
                        workProcess.workMeta.collapsible !== false && !hasProcessError
                      }
                      onToggle={() =>
                        setWorkExpandedOverride((value) => !(value ?? workProcess.processing))
                      }
                    />
                    {workExpanded && processSections.length > 0 ? (
                      <div className="message-timeline-turn-process-sections">
                        {processSections.map((section, index) => (
                          <ProcessSectionRow
                            key={
                              section.title ||
                              (section.kind === 'output'
                                ? `output-${section.outputEntries?.[0]?.id ?? index}`
                                : `${section.kind}-${index}`)
                            }
                            section={section}
                            reasoningDurationMs={
                              workProcess.workMeta.reasoningDurationMs
                            }
                            singleReasoningSection={reasoningSectionCount === 1}
                            viewportRef={containerRef}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {turn.messages
                  .filter((message) => message.role !== 'user')
                  .map((message) => {
                    const snapshot = chatMessageToSnapshot(message)
                    const streaming = message.status === 'streaming'
                    const showBubble =
                      snapshot &&
                      !(
                        streaming &&
                        snapshot.kind === 'assistant' &&
                        snapshot.text.trim() === ''
                      )

                    return (
                      <div key={message.id}>
                        {showBubble ? <MessageBubble block={snapshot} /> : null}
                        {streaming ? <LiveTurnProgressRow /> : null}
                      </div>
                    )
                  })}
                {showGeneratedFiles ? (
                  <GeneratedFilesPanel media={generatedFiles} />
                ) : null}
                {showReviews
                  ? turnReviews.map((review) => (
                      <ReviewSummaryCard key={review.title} review={review} />
                    ))
                  : null}
                {showDevPreview ? (
                  <DevPreviewLaunchCard
                    url={devPreviewUrl}
                    opened={devPreviewOpened}
                    onOpen={onDevPreviewOpen}
                  />
                ) : null}
                {showPlan ? (
                  <ReviewPlanCard title={planTitle} relativePath={planRelativePath} />
                ) : null}
                {showTurnChanges ? (
                  <TurnChangeSummary
                    changes={turnChanges}
                    compact={turnChangesCompact}
                    defaultExpanded={turnChangesDefaultExpanded}
                    viewportRef={containerRef}
                  />
                ) : null}
                {showCompaction ? <CompactionDivider block={compactionBlock} /> : null}
              </div>
            </div>
          )
        })}

        {typeof forkBoundaryTurnIndex === 'number' &&
        forkBoundaryTurnIndex === totalTurns &&
        totalTurns > 0 ? (
          <ThreadForkPoint parentTitle={forkedFromTitle} />
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
