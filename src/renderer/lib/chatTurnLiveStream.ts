import type { ChatMessage } from '../flue/useNaviChat'
import type { MessageTurnSnapshot } from '../components/chat/MessageTurn'
import type { TimelineChatBlock } from './messageTimelineTurns'
import { applyTimelineLiveStreamToTurn } from './applyTimelineLiveStream'

type ChatTurnLike = {
  messages: ChatMessage[]
}

export function extractLiveStreamFromChatTurn(turn: ChatTurnLike): {
  liveReasoning: string
  liveContent: string
} {
  const streamingMessage = turn.messages.find(
    (message) => message.role === 'assistant' && message.status === 'streaming',
  )
  return {
    liveReasoning: '',
    liveContent: streamingMessage?.text ?? '',
  }
}

export function buildSettledTimelineBlocksFromChatTurn(turn: ChatTurnLike): TimelineChatBlock[] {
  return turn.messages
    .filter((message) => message.role === 'assistant' && message.status !== 'streaming')
    .map((message) => ({
      kind: message.status === 'error' ? 'system' : 'assistant',
      id: message.id,
      text: message.text,
      severity: message.status === 'error' ? 'error' : undefined,
    }))
}

export function applyChatTurnLiveStream(
  turnSnapshot: MessageTurnSnapshot,
  chatTurn: ChatTurnLike,
  options: {
    isLatestTurn: boolean
    busy: boolean
    liveReasoning?: string
    liveContent?: string
  },
): MessageTurnSnapshot {
  const extracted = extractLiveStreamFromChatTurn(chatTurn)
  const liveReasoning = options.liveReasoning ?? extracted.liveReasoning
  const liveContent = options.liveContent ?? extracted.liveContent
  const hasLiveStream = Boolean(liveReasoning.trim() || liveContent.trim())
  if (!options.isLatestTurn || !hasLiveStream) return turnSnapshot

  const settledBlocks = buildSettledTimelineBlocksFromChatTurn(chatTurn)
  let base = turnSnapshot
  if (settledBlocks.length > 0 && !base.source) {
    base = {
      ...base,
      source: {
        blocks: settledBlocks,
        isProcessing: options.busy,
      },
    }
  }

  return applyTimelineLiveStreamToTurn(base, {
    isLatestTurn: true,
    liveReasoning,
    liveContent,
    busy: options.busy,
  })
}
