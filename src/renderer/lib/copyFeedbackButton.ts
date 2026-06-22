// Kun CopyFeedbackButton chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-bubbles.tsx).
// Visual only — used for production CopyFeedbackButton and preview hooks.

export type CopyFeedbackStatus = 'idle' | 'success' | 'error'

/** English copy matching Kun's copyMessage locale string. */
export const COPY_FEEDBACK_MESSAGE = 'Copy message'

/** English copy matching Kun's copySuccess locale string. */
export const COPY_FEEDBACK_SUCCESS = 'Copied'

/** English copy matching Kun's copyFailed locale string. */
export const COPY_FEEDBACK_FAILED = 'Copy failed'

export function resolveCopyFeedbackLabel(status: CopyFeedbackStatus): string {
  if (status === 'success') return COPY_FEEDBACK_SUCCESS
  if (status === 'error') return COPY_FEEDBACK_FAILED
  return COPY_FEEDBACK_MESSAGE
}
