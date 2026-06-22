// Kun CompactionDivider chrome
// (../Kun/src/renderer/src/components/chat/MessageTimeline.tsx).
// Visual only — used for production CompactionDivider and preview hooks.

export type CompactionDividerSnapshot = {
  status: 'running' | 'done' | 'error'
  auto?: boolean
  summary?: string
}

/** English copy matching Kun's compactionRunning locale string. */
export const COMPACTION_RUNNING_LABEL = 'Compacting context'

/** English copy matching Kun's compactionManualCompleted locale string. */
export const COMPACTION_MANUAL_COMPLETED_LABEL = 'Compacted context'

/** English copy matching Kun's compactionAutoCompleted locale string. */
export const COMPACTION_AUTO_COMPLETED_LABEL = 'Auto-compacted context'

/** English copy matching Kun's compactionFailed locale string. */
export const COMPACTION_FAILED_LABEL = 'Context compaction failed'

/** English copy matching Kun's compactionManualCompletedWithTokens locale string. */
export const COMPACTION_MANUAL_COMPLETED_WITH_TOKENS_TEMPLATE =
  'Compacted context · ~{{tokens}} tokens freed'

/** English copy matching Kun's compactionAutoCompletedWithTokens locale string. */
export const COMPACTION_AUTO_COMPLETED_WITH_TOKENS_TEMPLATE =
  'Auto-compacted context · ~{{tokens}} tokens freed'

/** English copy matching Kun's compactionCompletedWithCounts locale string. */
export const COMPACTION_COMPLETED_WITH_COUNTS_TEMPLATE =
  'Compacted context ({{before}} → {{after}} messages)'

export function formatCompactionManualCompletedWithTokens(tokens: number): string {
  return COMPACTION_MANUAL_COMPLETED_WITH_TOKENS_TEMPLATE.replace('{{tokens}}', String(tokens))
}

export function formatCompactionAutoCompletedWithTokens(tokens: number): string {
  return COMPACTION_AUTO_COMPLETED_WITH_TOKENS_TEMPLATE.replace('{{tokens}}', String(tokens))
}

export function formatCompactionCompletedWithCounts(before: number, after: number): string {
  return COMPACTION_COMPLETED_WITH_COUNTS_TEMPLATE.replace('{{before}}', String(before)).replace(
    '{{after}}',
    String(after),
  )
}

export function resolveCompactionDividerLabel(block: CompactionDividerSnapshot): string {
  if (block.status === 'running') return COMPACTION_RUNNING_LABEL
  if (block.status === 'error') return block.summary?.trim() || COMPACTION_FAILED_LABEL
  return block.auto === true ? COMPACTION_AUTO_COMPLETED_LABEL : COMPACTION_MANUAL_COMPLETED_LABEL
}
