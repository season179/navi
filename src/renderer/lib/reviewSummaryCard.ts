// Kun ReviewSummaryCard chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-cards.tsx).
// Visual only — used for production ReviewSummaryCard and preview hooks.

/** English copy matching Kun's reviewCardRunning locale string. */
export const REVIEW_SUMMARY_CARD_RUNNING_LABEL = 'Reviewing changes…'

/** English copy matching Kun's reviewCardFailed locale string. */
export const REVIEW_SUMMARY_CARD_FAILED_LABEL = 'Review failed'

/** English copy matching Kun's reviewCardNoFindings locale string. */
export const REVIEW_SUMMARY_CARD_NO_FINDINGS_LABEL = 'No findings'

/** English copy matching Kun's reviewCardFindings locale string. */
export const REVIEW_SUMMARY_CARD_FINDINGS_TEMPLATE = '{{count}} findings'

export function formatReviewSummaryCardFindings(count: number): string {
  return REVIEW_SUMMARY_CARD_FINDINGS_TEMPLATE.replace('{{count}}', String(count))
}

export function resolveReviewSummaryCardStatusLabel(input: {
  running: boolean
  failed: boolean
  findingsCount: number
}): string {
  if (input.running) return REVIEW_SUMMARY_CARD_RUNNING_LABEL
  if (input.failed) return REVIEW_SUMMARY_CARD_FAILED_LABEL
  if (input.findingsCount === 0) return REVIEW_SUMMARY_CARD_NO_FINDINGS_LABEL
  return formatReviewSummaryCardFindings(input.findingsCount)
}
