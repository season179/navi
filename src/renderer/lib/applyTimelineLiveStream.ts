import type { MessageTurnSnapshot } from '../components/MessageTurn'

/** Kun passes timeline-level liveReasoning/live only to the latest MessageTurn. */
export function applyTimelineLiveStreamToTurn(
  turn: MessageTurnSnapshot,
  options: {
    isLatestTurn: boolean
    liveReasoning: string
    liveContent: string
    busy?: boolean
  },
): MessageTurnSnapshot {
  const { isLatestTurn, liveReasoning, liveContent } = options
  if (!isLatestTurn) return turn

  const hasLiveStream = Boolean(liveReasoning.trim() || liveContent.trim())
  if (!hasLiveStream) return turn

  const baseSource = turn.source
  return {
    key: turn.key,
    user: turn.user,
    source: {
      blocks: baseSource?.blocks ?? [],
      workspaceRoot: baseSource?.workspaceRoot,
      isProcessing: true,
      liveReasoning,
      liveContent,
    },
    devPreviewUrl: turn.devPreviewUrl,
    devPreviewOpened: turn.devPreviewOpened,
    onDevPreviewOpen: turn.onDevPreviewOpen,
    changesCompact: turn.changesCompact,
    changesDefaultExpanded: turn.changesDefaultExpanded,
  }
}
