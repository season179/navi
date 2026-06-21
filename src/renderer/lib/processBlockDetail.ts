// Process block detail helpers echoing Kun's getProcessDetail and processBlockHasError
// (../Kun/src/renderer/src/components/chat/message-timeline-process.tsx).

import { extractUnifiedDiffText } from './diff-stats'
import { splitThink, type TimelineChatBlock } from './messageTimelineTurns'
import { summarizeToolBlock, toolFilePath } from './summarizeToolBlock'

export type ProcessBlockDetail =
  | { kind: 'none' }
  | { kind: 'reasoning'; text: string }
  | { kind: 'assistant'; text: string }
  | {
      kind: 'tool'
      text: string
      isPatch: boolean
      isError: boolean
      filePath?: string
    }
  | { kind: 'text'; text: string }
  | { kind: 'approval' }
  | { kind: 'user_input' }

function normalizeProcessText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase()
}

export function processBlockHasError(block: TimelineChatBlock): boolean {
  return (
    (block.kind === 'tool' && block.status === 'error') ||
    (block.kind === 'compaction' && block.status === 'error') ||
    (block.kind === 'approval' && block.status === 'error') ||
    (block.kind === 'user_input' && block.status === 'error') ||
    (block.kind === 'system' && block.severity === 'error')
  )
}

export function isRequestUserInputTool(block: TimelineChatBlock): boolean {
  if (block.kind === 'user_input' && block.status === 'pending') return true
  if (block.kind !== 'tool' || block.status !== 'running') return false
  const toolName =
    typeof block.meta?.toolName === 'string' ? block.meta.toolName.trim() : ''
  if (toolName === 'request_user_input' || toolName === 'user_input') return true
  return /^request_user_input\s*:/i.test((block.summary ?? '').trim())
}

export function isPendingApproval(block: TimelineChatBlock): boolean {
  return block.kind === 'approval' && block.status === 'pending'
}

export function processBlockIsRunningTool(
  block: TimelineChatBlock,
  processing: boolean,
): boolean {
  return processing && block.kind === 'tool' && block.status === 'running'
}

export function processBlockIsAutoOpenPending(
  block: TimelineChatBlock,
  processing: boolean,
): boolean {
  return (
    processing &&
    ((block.kind === 'compaction' && block.status === 'running') ||
      (block.kind === 'approval' && block.status === 'pending') ||
      (block.kind === 'user_input' && block.status === 'pending'))
  )
}

export function processBlockIsActive(
  block: TimelineChatBlock,
  processing: boolean,
): boolean {
  return (
    processBlockIsRunningTool(block, processing) ||
    processBlockIsAutoOpenPending(block, processing) ||
    (processing && block.kind === 'assistant' && block.id === 'live-assistant')
  )
}

export function getProcessDetailFromBlock(
  block: TimelineChatBlock,
  summaryText?: string,
): ProcessBlockDetail {
  if (block.kind === 'reasoning') {
    return block.text?.trim()
      ? { kind: 'reasoning', text: block.text }
      : { kind: 'none' }
  }
  if (block.kind === 'assistant') {
    const split = splitThink(block.text ?? '')
    const text = split.content || split.think
    return text.trim() ? { kind: 'assistant', text } : { kind: 'none' }
  }
  if (block.kind === 'tool') {
    const detailText = block.detail?.trim() ?? ''
    if (!detailText) return { kind: 'none' }
    if (
      summaryText &&
      normalizeProcessText(detailText) === normalizeProcessText(summaryText)
    ) {
      return { kind: 'none' }
    }
    const isError = block.status === 'error'
    const patchText =
      block.toolKind === 'file_change' && !isError
        ? extractUnifiedDiffText(detailText)
        : undefined
    return {
      kind: 'tool',
      text: patchText ?? block.detail!,
      isPatch: patchText !== undefined,
      isError,
      filePath: block.filePath,
    }
  }
  if (block.kind === 'compaction') {
    const detailText = block.detail?.trim() ?? ''
    if (!detailText) return { kind: 'none' }
    if (
      summaryText &&
      normalizeProcessText(detailText) === normalizeProcessText(summaryText)
    ) {
      return { kind: 'none' }
    }
    return { kind: 'text', text: detailText }
  }
  if (block.kind === 'approval') return { kind: 'approval' }
  if (block.kind === 'user_input') return { kind: 'user_input' }
  if (block.kind === 'system' && block.text?.trim()) {
    if (block.detail?.trim()) return { kind: 'text', text: block.detail }
    if ((block.text ?? '').length <= 140) return { kind: 'none' }
    return { kind: 'text', text: block.text }
  }
  return { kind: 'none' }
}

export function describeProcessBlockLabel(block: TimelineChatBlock): string {
  if (block.kind === 'reasoning') return 'Thinking'
  if (block.kind === 'assistant') return 'Process text'
  if (block.kind === 'tool') {
    return summarizeToolBlock({
      summary: block.summary ?? '',
      detail: block.detail,
      filePath: block.filePath,
      toolKind: block.toolKind as 'file_change' | 'command_execution' | 'generic' | undefined,
      meta: block.meta,
    })
  }
  if (block.kind === 'compaction') {
    if (block.status === 'running') return 'Compacting context…'
    if (block.status === 'error') return block.summary || 'Compaction failed'
    return block.auto === true ? 'Context compacted automatically' : 'Context compacted'
  }
  if (block.kind === 'approval') return block.summary || 'Approval required'
  if (block.kind === 'user_input') return 'User input'
  if (block.kind === 'system') return block.text ?? 'System message'
  return block.text ?? 'Processed'
}

export function stackEntryFilePath(block: TimelineChatBlock): string | undefined {
  if (block.kind !== 'tool') return undefined
  return toolFilePath({
    summary: block.summary ?? '',
    detail: block.detail,
    filePath: block.filePath,
    toolKind: block.toolKind as 'file_change' | 'command_execution' | 'generic' | undefined,
    meta: block.meta,
  })
}
