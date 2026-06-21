// Message timeline orchestrator echoing Kun's MessageTimeline
// (../Kun/src/renderer/src/components/chat/MessageTimeline.tsx).
// Visual only: mock turn snapshots compose already-ported sub-components.

import {
  memo,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type RefObject,
} from 'react'
import { CompactionDivider, type CompactionDividerSnapshot } from './CompactionDivider'
import { DevPreviewLaunchCard, DEV_PREVIEW_LAUNCH_CARD_PREVIEW } from './DevPreviewLaunchCard'
import { GeneratedFilesPanel, GENERATED_FILES_PANEL_PREVIEW } from './GeneratedFilesPanel'
import {
  goalTimelinePaddingClass,
  LiveTurnProgressRow,
} from './LiveTurnProgressRow'
import {
  MessageBubble,
  MESSAGE_BUBBLE_PREVIEW_ASSISTANT,
  MESSAGE_BUBBLE_PREVIEW_ASSISTANT_STREAMING,
  MESSAGE_BUBBLE_PREVIEW_USER,
  type AssistantMessageSnapshot,
  type MessageBubbleSnapshot,
  type UserMessageSnapshot,
} from './MessageBubble'
import {
  MessageTimelineEmptyHero,
  type MessageTimelineEmptyHeroRoute,
} from './MessageTimelineEmptyHero'
import {
  ProcessSectionRow,
  PROCESS_SECTION_ROW_PREVIEW,
  type ProcessSectionSnapshot,
} from './ProcessSectionRow'
import { ReviewPlanCard, REVIEW_PLAN_CARD_PREVIEW } from './ReviewPlanCard'
import {
  ReviewSummaryCard,
  REVIEW_SUMMARY_CARD_PREVIEW,
  type ReviewSummarySnapshot,
} from './ReviewSummaryCard'
import {
  ThreadForkBanner,
  ThreadForkPoint,
  THREAD_FORK_BANNER_PREVIEW_TITLE,
} from './ThreadForkBanner'
import {
  TimelineCollapseEarlierButton,
  TimelineShowEarlierButton,
} from './TimelinePaginationControls'
import {
  TimelineJumpRail,
  TIMELINE_JUMP_RAIL_PREVIEW_ANCHORS,
  type TimelineJumpAnchor,
} from './TimelineJumpRail'
import {
  TurnChangeSummary,
  TURN_CHANGE_SUMMARY_PREVIEW,
  type TurnChangeSnapshot,
} from './TurnChangeSummary'
import { WorkMetaRow, WORK_META_ROW_PREVIEW } from './WorkMetaRow'
import type { MediaReference } from './MediaPreviewTile'
import {
  buildDerivedIntermediateTurnPreview,
  buildMessageTurnSnapshotFromSource,
  type MessageTurnSource,
} from '../lib/buildMessageTurnSnapshot'

const TURN_PAGE_SIZE = 18
const AUTO_COLLAPSE_THRESHOLD = 24

export type { MessageTurnSource } from '../lib/buildMessageTurnSnapshot'

export type MessageTurnSnapshot = {
  key: string
  user?: UserMessageSnapshot
  /** When set, turn layout is derived from blocks via deriveTurnSections like Kun. */
  source?: MessageTurnSource
  processing?: boolean
  workExpanded?: boolean
  workMeta?: {
    processing: boolean
    stepCount: number
    durationMs?: number
    reasoningDurationMs?: number
    collapsible?: boolean
  }
  processSections?: ProcessSectionSnapshot[]
  assistantBlocks?: MessageBubbleSnapshot[]
  liveAssistant?: AssistantMessageSnapshot
  generatedFiles?: MediaReference[]
  reviews?: ReviewSummarySnapshot[]
  showLiveProgress?: boolean
  devPreviewCard?: boolean
  plan?: { title: string; relativePath: string }
  changes?: TurnChangeSnapshot[]
  compaction?: CompactionDividerSnapshot
  compactCards?: boolean
}

export type MessageTimelineSnapshot = {
  route?: MessageTimelineEmptyHeroRoute
  hasContent?: boolean
  activeThreadId?: string | null
  ready?: boolean
  hasWorkspace?: boolean
  runtimeError?: string | null
  focusModeEnabled?: boolean
  hasActiveGoal?: boolean
  forkedFromTitle?: string
  forkBoundaryTurnIndex?: number
  hiddenTurnCount?: number
  totalTurns?: number
  busy?: boolean
  showCollapseEarlier?: boolean
  jumpAnchors?: TimelineJumpAnchor[]
  turns: MessageTurnSnapshot[]
}

type MessageTimelineProps = MessageTimelineSnapshot

function turnPreviewLabel(turn: MessageTurnSnapshot, index: number): string {
  const text = turn.user?.text.trim() ?? ''
  if (!text) return `Question ${index}`
  const oneLine = text.replace(/\s+/g, ' ')
  return oneLine.length > 48 ? `${oneLine.slice(0, 47).trimEnd()}…` : oneLine
}

function MessageTurnImpl({
  turn,
  viewportRef,
}: {
  turn: MessageTurnSnapshot
  viewportRef?: RefObject<HTMLDivElement | null>
}): ReactElement {
  const derivedTurn = useMemo(
    () =>
      turn.source
        ? buildMessageTurnSnapshotFromSource({
            key: turn.key,
            user: turn.user,
            source: turn.source,
          })
        : null,
    [turn.key, turn.source, turn.user],
  )
  const resolved = derivedTurn ?? turn

  const [workExpandedOverride, setWorkExpandedOverride] = useState<boolean | null>(null)
  const processing = resolved.processing === true
  const workMeta = resolved.workMeta
  const processSections = resolved.processSections ?? []
  const hasProcess = Boolean(workMeta && (processing || processSections.length > 0))
  const hasProcessError = processSections.some((section) => section.hasError)
  const reasoningSectionCount = processSections.filter(
    (section) => section.kind === 'reasoning',
  ).length
  const workExpanded =
    hasProcessError || (workExpandedOverride ?? resolved.workExpanded ?? processing)
  const showLiveAssistant = Boolean(resolved.liveAssistant?.text.trim())
  const showLiveProgress = resolved.showLiveProgress === true

  return (
    <div className="message-timeline-turn">
      {resolved.user ? <MessageBubble block={resolved.user} /> : null}

      {hasProcess && workMeta ? (
        <div className="message-timeline-turn-process">
          <WorkMetaRow
            processing={workMeta.processing}
            stepCount={workMeta.stepCount}
            durationMs={workMeta.durationMs}
            reasoningDurationMs={workMeta.reasoningDurationMs}
            expanded={workExpanded}
            collapsible={workMeta.collapsible !== false && !hasProcessError}
            onToggle={() => setWorkExpandedOverride((value) => !(value ?? processing))}
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
                  reasoningDurationMs={workMeta.reasoningDurationMs}
                  singleReasoningSection={reasoningSectionCount === 1}
                  viewportRef={viewportRef}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {(resolved.assistantBlocks ?? []).map((block) => (
        <MessageBubble key={block.id} block={block} />
      ))}

      {showLiveAssistant && resolved.liveAssistant ? (
        <MessageBubble block={resolved.liveAssistant} />
      ) : null}

      {resolved.generatedFiles?.length ? (
        <GeneratedFilesPanel media={resolved.generatedFiles} />
      ) : null}

      {(resolved.reviews ?? []).map((review) => (
        <ReviewSummaryCard key={review.title} review={review} />
      ))}

      {showLiveProgress ? (
        <LiveTurnProgressRow hasActiveGoal={false} />
      ) : null}

      {!processing && resolved.devPreviewCard ? (
        <DevPreviewLaunchCard url={DEV_PREVIEW_LAUNCH_CARD_PREVIEW.url} />
      ) : null}

      {!processing && resolved.plan ? (
        <ReviewPlanCard
          title={resolved.plan.title}
          relativePath={resolved.plan.relativePath}
          onOpen={() => undefined}
          onBuild={() => undefined}
        />
      ) : null}

      {!processing && resolved.changes?.length ? (
        <TurnChangeSummary
          changes={resolved.changes}
          compact={resolved.compactCards}
          viewportRef={viewportRef}
        />
      ) : null}

      {resolved.compaction ? <CompactionDivider block={resolved.compaction} /> : null}
    </div>
  )
}

const MemoMessageTurn = memo(MessageTurnImpl)

export function MessageTimeline({
  route = 'chat',
  hasContent = true,
  activeThreadId = 'preview-thread',
  ready = true,
  hasWorkspace = true,
  runtimeError,
  focusModeEnabled = false,
  hasActiveGoal = false,
  forkedFromTitle,
  forkBoundaryTurnIndex,
  hiddenTurnCount = 0,
  totalTurns,
  busy = false,
  showCollapseEarlier = false,
  jumpAnchors,
  turns,
}: MessageTimelineProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null)
  const turnRefMap = useRef(new Map<string, HTMLDivElement>())
  const heroRoute: MessageTimelineEmptyHeroRoute = route
  const showHero = !hasContent || !activeThreadId
  const resolvedTotalTurns = totalTurns ?? turns.length + hiddenTurnCount
  const forkTitle = forkedFromTitle?.trim() ?? ''

  const anchors = useMemo((): TimelineJumpAnchor[] => {
    if (jumpAnchors) return jumpAnchors
    return turns
      .filter((turn) => turn.user)
      .map((turn, index) => ({
        key: turn.key,
        label: String(index + 1 + hiddenTurnCount),
        title: turnPreviewLabel(turn, index + 1 + hiddenTurnCount),
      }))
  }, [hiddenTurnCount, jumpAnchors, turns])

  const jumpToTurn = (key: string): void => {
    const target = turnRefMap.current.get(key)
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div ref={containerRef} className="message-timeline ds-no-drag">
      <TimelineJumpRail anchors={anchors} onJump={jumpToTurn} />
      <div
        className={`message-timeline-content ds-message-timeline-content ds-chat-column-inset ${goalTimelinePaddingClass(
          heroRoute,
          hasActiveGoal,
        )}`}
      >
        {showHero ? (
          <MessageTimelineEmptyHero
            route={heroRoute}
            ready={ready}
            hasWorkspace={hasWorkspace}
            runtimeError={runtimeError}
            focusModeEnabled={focusModeEnabled}
          />
        ) : null}

        {forkTitle ? <ThreadForkBanner parentTitle={forkTitle} /> : null}

        <TimelineShowEarlierButton
          hiddenCount={hiddenTurnCount}
          pageSize={TURN_PAGE_SIZE}
        />

        {turns.map((turn, index) => {
          const showForkPoint =
            typeof forkBoundaryTurnIndex === 'number' &&
            forkBoundaryTurnIndex === index + hiddenTurnCount

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
              {showForkPoint ? <ThreadForkPoint parentTitle={forkTitle} /> : null}
              <MemoMessageTurn turn={turn} viewportRef={containerRef} />
            </div>
          )
        })}

        {showCollapseEarlier ? (
          <TimelineCollapseEarlierButton
            totalTurns={resolvedTotalTurns}
            pageSize={TURN_PAGE_SIZE}
            autoCollapseThreshold={AUTO_COLLAPSE_THRESHOLD}
            busy={busy}
          />
        ) : null}
      </div>
    </div>
  )
}

const PREVIEW_TURN_SIMPLE: MessageTurnSnapshot = {
  key: 'turn-simple',
  user: MESSAGE_BUBBLE_PREVIEW_USER,
  workMeta: WORK_META_ROW_PREVIEW.processed,
  processSections: [
    { ...PROCESS_SECTION_ROW_PREVIEW.reasoning, expanded: false },
    { ...PROCESS_SECTION_ROW_PREVIEW.execution, expanded: false },
  ],
  assistantBlocks: [MESSAGE_BUBBLE_PREVIEW_ASSISTANT],
}

const PREVIEW_TURN_PROCESSING: MessageTurnSnapshot = {
  key: 'turn-processing',
  user: {
    kind: 'user',
    id: 'preview-user-processing',
    text: 'Add refresh token rotation to the auth middleware.',
    modelLabel: 'Claude Sonnet 4',
  },
  processing: true,
  workExpanded: true,
  workMeta: WORK_META_ROW_PREVIEW.processing,
  processSections: [
    { ...PROCESS_SECTION_ROW_PREVIEW.reasoningActive, expanded: true },
    { ...PROCESS_SECTION_ROW_PREVIEW.outputStreaming },
    {
      ...PROCESS_SECTION_ROW_PREVIEW.execution,
      active: true,
      processing: true,
      expanded: true,
    },
  ],
  liveAssistant: MESSAGE_BUBBLE_PREVIEW_ASSISTANT_STREAMING,
  showLiveProgress: true,
}

const PREVIEW_TURN_RICH: MessageTurnSnapshot = {
  key: 'turn-rich',
  user: MESSAGE_BUBBLE_PREVIEW_USER,
  workMeta: WORK_META_ROW_PREVIEW.processed,
  processSections: [
    { ...PROCESS_SECTION_ROW_PREVIEW.reasoningExpanded, expanded: true },
    { ...PROCESS_SECTION_ROW_PREVIEW.output },
    { ...PROCESS_SECTION_ROW_PREVIEW.executionExpanded, expanded: true },
  ],
  assistantBlocks: [MESSAGE_BUBBLE_PREVIEW_ASSISTANT],
  generatedFiles: GENERATED_FILES_PANEL_PREVIEW,
  reviews: [REVIEW_SUMMARY_CARD_PREVIEW],
  devPreviewCard: true,
  plan: REVIEW_PLAN_CARD_PREVIEW,
  changes: TURN_CHANGE_SUMMARY_PREVIEW,
  compaction: { status: 'done', auto: true },
}

const PREVIEW_TURNS_MULTI: MessageTurnSnapshot[] = [
  {
    key: 'turn-1',
    user: {
      kind: 'user',
      id: 'preview-user-1',
      text: 'How do I wire up auth middleware?',
      modelLabel: 'Claude Sonnet 4',
    },
    workMeta: WORK_META_ROW_PREVIEW.processed,
    assistantBlocks: [
      {
        kind: 'assistant',
        id: 'preview-assistant-1',
        text: 'Start by adding a middleware function that reads the Authorization header and validates JWTs before route handlers run.',
      },
    ],
  },
  {
    key: 'turn-2',
    user: {
      kind: 'user',
      id: 'preview-user-2',
      text: 'Can you add refresh token rotation?',
      modelLabel: 'Claude Sonnet 4',
    },
    workMeta: WORK_META_ROW_PREVIEW.processed,
    assistantBlocks: [
      {
        kind: 'assistant',
        id: 'preview-assistant-2',
        text: 'Yes — store refresh tokens in the session store and rotate them on each successful refresh call.',
      },
    ],
  },
  {
    key: 'turn-3',
    user: {
      kind: 'user',
      id: 'preview-user-3',
      text: 'Show me the failing test output.',
      modelLabel: 'Claude Sonnet 4',
    },
    workMeta: WORK_META_ROW_PREVIEW.processed,
    assistantBlocks: [
      {
        kind: 'assistant',
        id: 'preview-assistant-3',
        text: 'The integration test fails because the middleware returns 401 before the refresh handler can run.',
      },
    ],
  },
  PREVIEW_TURN_RICH,
]

export type MessageTimelinePreviewMode =
  | 'empty'
  | 'emptyWaking'
  | 'emptyNoWorkspace'
  | 'emptyClaw'
  | 'single'
  | 'processing'
  | 'multi'
  | 'paginated'
  | 'forked'
  | 'rich'
  | 'withGoal'
  | 'derivedIntermediate'

export function resolveMessageTimelinePreviewSnapshot(
  mode: MessageTimelinePreviewMode,
): MessageTimelineSnapshot {
  return resolvePreviewSnapshot(mode)
}

function resolvePreviewSnapshot(mode: MessageTimelinePreviewMode): MessageTimelineSnapshot {
  switch (mode) {
    case 'empty':
      return { hasContent: false, activeThreadId: null, turns: [] }
    case 'emptyWaking':
      return { hasContent: false, activeThreadId: null, ready: false, turns: [] }
    case 'emptyNoWorkspace':
      return {
        hasContent: false,
        activeThreadId: null,
        ready: true,
        hasWorkspace: false,
        turns: [],
      }
    case 'emptyClaw':
      return {
        hasContent: false,
        activeThreadId: null,
        ready: true,
        route: 'claw',
        turns: [],
      }
    case 'single':
      return { turns: [PREVIEW_TURN_SIMPLE] }
    case 'processing':
      return { turns: [PREVIEW_TURN_PROCESSING], busy: true, hasActiveGoal: false }
    case 'multi':
      return {
        turns: PREVIEW_TURNS_MULTI,
        jumpAnchors: TIMELINE_JUMP_RAIL_PREVIEW_ANCHORS,
      }
    case 'paginated':
      return {
        hiddenTurnCount: 36,
        turns: PREVIEW_TURNS_MULTI.slice(0, 3),
        jumpAnchors: TIMELINE_JUMP_RAIL_PREVIEW_ANCHORS.slice(0, 3),
      }
    case 'forked':
      return {
        forkedFromTitle: THREAD_FORK_BANNER_PREVIEW_TITLE,
        forkBoundaryTurnIndex: 1,
        turns: PREVIEW_TURNS_MULTI.slice(0, 3),
      }
    case 'rich':
      return { turns: [PREVIEW_TURN_RICH] }
    case 'withGoal':
      return {
        turns: [PREVIEW_TURN_PROCESSING],
        busy: true,
        hasActiveGoal: true,
      }
    case 'derivedIntermediate':
      return { turns: [buildDerivedIntermediateTurnPreview()] }
  }
}

export function MessageTimelinePreview({
  mode,
}: {
  mode: MessageTimelinePreviewMode
}): ReactElement {
  const snapshot = resolvePreviewSnapshot(mode)

  return (
    <div className="message-timeline-preview-wrap">
      <MessageTimeline {...snapshot} />
    </div>
  )
}

export { summarizeToolBlock, toolFilePath } from '../lib/summarizeToolBlock'
export type { SummarizeToolBlockInput, ToolSummaryLabelFn } from '../lib/summarizeToolBlock'
export {
  groupProcessSections,
  resolveProcessSectionKind,
} from '../lib/groupProcessSections'
export type {
  GroupProcessBlock,
  GroupedProcessSection,
} from '../lib/groupProcessSections'
export {
  blockHasPendingRuntimeWork,
  findTrailingAssistantContentStart,
  groupTurns,
  isProcessBlock,
  sameTurnContent,
  splitThink,
  stableTurnKey,
} from '../lib/messageTimelineTurns'
export type { TimelineChatBlock, Turn } from '../lib/messageTimelineTurns'
export {
  buildMessageTurnSnapshotFromSource,
  buildDerivedIntermediateTurnPreview,
} from '../lib/buildMessageTurnSnapshot'
export { deriveTurnSections } from '../lib/deriveTurnSections'
export type {
  TurnAssistantBlock,
  TurnSections,
  TurnToolBlock,
} from '../lib/deriveTurnSections'
