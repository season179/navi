// Kun process block label chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-process.tsx describeProcessBlock).
// Visual only — used for process entry summaries in buildMessageTurnSnapshot.

import {
  COMPACTION_AUTO_COMPLETED_LABEL,
  COMPACTION_FAILED_LABEL,
  COMPACTION_MANUAL_COMPLETED_LABEL,
  COMPACTION_RUNNING_LABEL,
  formatCompactionAutoCompletedWithTokens,
  formatCompactionCompletedWithCounts,
  formatCompactionManualCompletedWithTokens,
} from './compactionDivider'
import type { TimelineChatBlock } from './messageTimelineTurns'
import { summarizeToolBlock } from './summarizeToolBlock'

/** English copy matching Kun's thinkingLabel locale string. */
export const PROCESS_BLOCK_THINKING_LABEL = 'Thinking'

/** English copy matching Kun's processTextLabel locale string. */
export const PROCESS_BLOCK_TEXT_LABEL = 'Output'

/** English copy matching Kun's approvalTitle locale string. */
export const PROCESS_BLOCK_APPROVAL_TITLE = 'Approval required'

/** English copy matching Kun's userInputTitle locale string. */
export const PROCESS_BLOCK_USER_INPUT_TITLE = 'Input required'

/** English copy matching Kun's processed locale string. */
export const PROCESS_BLOCK_PROCESSED_LABEL = 'Processed'

export type CompactionProcessBlockSnapshot = {
  status?: string
  summary?: string
  auto?: boolean
  messagesBefore?: number
  messagesAfter?: number
}

/** Kun describeProcessBlock compaction branch — process-entry compaction summaries. */
export function resolveCompactionProcessBlockLabel(
  block: CompactionProcessBlockSnapshot,
): string {
  if (block.status === 'running') return COMPACTION_RUNNING_LABEL
  if (block.status === 'error') return block.summary?.trim() || COMPACTION_FAILED_LABEL
  if (
    typeof block.messagesBefore === 'number' &&
    typeof block.messagesAfter === 'number'
  ) {
    return formatCompactionCompletedWithCounts(block.messagesBefore, block.messagesAfter)
  }
  const releasedTokens = typeof block.messagesBefore === 'number' ? block.messagesBefore : 0
  if (releasedTokens > 0) {
    return block.auto === true
      ? formatCompactionAutoCompletedWithTokens(releasedTokens)
      : formatCompactionManualCompletedWithTokens(releasedTokens)
  }
  return block.auto === true
    ? COMPACTION_AUTO_COMPLETED_LABEL
    : COMPACTION_MANUAL_COMPLETED_LABEL
}

/** Kun describeProcessBlock — derive process-entry summary text from block metadata. */
export function resolveProcessBlockLabel(block: TimelineChatBlock): string {
  if (block.kind === 'reasoning') return PROCESS_BLOCK_THINKING_LABEL
  if (block.kind === 'assistant') return PROCESS_BLOCK_TEXT_LABEL
  if (block.kind === 'tool') {
    return summarizeToolBlock({
      summary: block.summary ?? '',
      detail: block.detail,
      filePath: block.filePath,
      toolKind: block.toolKind as
        | 'file_change'
        | 'command_execution'
        | 'generic'
        | undefined,
      meta: block.meta,
    })
  }
  if (block.kind === 'compaction') {
    return resolveCompactionProcessBlockLabel({
      status: block.status,
      summary: block.summary,
      auto: block.auto,
      messagesBefore: block.messagesBefore,
      messagesAfter: block.messagesAfter,
    })
  }
  if (block.kind === 'approval') {
    return block.summary?.trim() || PROCESS_BLOCK_APPROVAL_TITLE
  }
  if (block.kind === 'user_input') return PROCESS_BLOCK_USER_INPUT_TITLE
  if (block.kind === 'system') return block.text ?? ''
  return block.text?.trim() ? block.text : PROCESS_BLOCK_PROCESSED_LABEL
}
