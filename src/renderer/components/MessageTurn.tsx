// Single turn renderer shared by MessageTimeline preview and production ChatThread.
// Echoes Kun's MessageTurn in MessageTimeline.tsx.

import { memo, useMemo, useState, type ReactElement, type RefObject } from 'react'
import type { CompactionDividerSnapshot } from './CompactionDivider'
import { CompactionDivider } from './CompactionDivider'
import { DevPreviewLaunchCard, DEV_PREVIEW_LAUNCH_CARD_PREVIEW } from './DevPreviewLaunchCard'
import { GeneratedFilesPanel } from './GeneratedFilesPanel'
import { LiveTurnProgressRow } from './LiveTurnProgressRow'
import {
  MessageBubble,
  type AssistantMessageSnapshot,
  type MessageBubbleSnapshot,
  type UserMessageSnapshot,
} from './MessageBubble'
import type { MediaReference } from './MediaPreviewTile'
import { ProcessSectionRow, type ProcessSectionSnapshot } from './ProcessSectionRow'
import { ReviewPlanCard } from './ReviewPlanCard'
import { ReviewSummaryCard, type ReviewSummarySnapshot } from './ReviewSummaryCard'
import { TurnChangeSummary, type TurnChangeSnapshot } from './TurnChangeSummary'
import { WorkMetaRow } from './WorkMetaRow'
import {
  buildMessageTurnSnapshotFromSource,
  type MessageTurnSource,
} from '../lib/buildMessageTurnSnapshot'

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
  devPreviewUrl?: string
  devPreviewOpened?: boolean
  onDevPreviewOpen?: () => void
  plan?: { title: string; relativePath: string }
  changes?: TurnChangeSnapshot[]
  changesCompact?: boolean
  changesDefaultExpanded?: boolean
  compaction?: CompactionDividerSnapshot
  compactCards?: boolean
}

function MessageTurnImpl({
  turn,
  viewportRef,
}: {
  turn: MessageTurnSnapshot
  viewportRef?: RefObject<HTMLDivElement | null>
}): ReactElement {
  const resolved: MessageTurnSnapshot = useMemo(() => {
    if (!turn.source) return turn
    return {
      ...buildMessageTurnSnapshotFromSource({
        key: turn.key,
        user: turn.user,
        source: turn.source,
      }),
      devPreviewUrl: turn.devPreviewUrl,
      devPreviewOpened: turn.devPreviewOpened,
      onDevPreviewOpen: turn.onDevPreviewOpen,
      changesCompact: turn.changesCompact,
      changesDefaultExpanded: turn.changesDefaultExpanded,
    }
  }, [turn])

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

      {showLiveProgress ? <LiveTurnProgressRow hasActiveGoal={false} /> : null}

      {resolved.generatedFiles?.length ? (
        <GeneratedFilesPanel media={resolved.generatedFiles} />
      ) : null}

      {(resolved.reviews ?? []).map((review) => (
        <ReviewSummaryCard key={review.title} review={review} />
      ))}

      {!processing && resolved.devPreviewCard ? (
        <DevPreviewLaunchCard url={DEV_PREVIEW_LAUNCH_CARD_PREVIEW.url} />
      ) : null}

      {!processing && resolved.devPreviewUrl ? (
        <DevPreviewLaunchCard
          url={resolved.devPreviewUrl}
          opened={resolved.devPreviewOpened}
          onOpen={resolved.onDevPreviewOpen}
        />
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
          compact={resolved.changesCompact ?? resolved.compactCards}
          defaultExpanded={resolved.changesDefaultExpanded}
          viewportRef={viewportRef}
        />
      ) : null}

      {resolved.compaction ? <CompactionDivider block={resolved.compaction} /> : null}
    </div>
  )
}

export const MessageTurn = memo(MessageTurnImpl)
