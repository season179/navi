// Kun UserInputBubble chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-bubbles.tsx).
// Visual only — used for production UserInputBubble and preview hooks.

/** English copy matching Kun's userInputTitle locale string. */
export const USER_INPUT_BUBBLE_TITLE = 'Input required'

/** English copy matching Kun's userInputPending locale string. */
export const USER_INPUT_BUBBLE_PENDING_LABEL = 'Waiting for your answer…'

/** English copy matching Kun's userInputSubmitted locale string. */
export const USER_INPUT_BUBBLE_SUBMITTED_LABEL = 'Submitted'

/** English copy matching Kun's userInputCancelled locale string. */
export const USER_INPUT_BUBBLE_CANCELLED_LABEL = 'Cancelled'

/** English copy matching Kun's userInputFailed locale string. */
export const USER_INPUT_BUBBLE_FAILED_LABEL = 'Submit failed'

/** English copy matching Kun's userInputQuestionProgress locale string. */
export const USER_INPUT_BUBBLE_QUESTION_PROGRESS_TEMPLATE = 'Question {{current}} / {{total}}'

/** English copy matching Kun's userInputOther locale string. */
export const USER_INPUT_OTHER_LABEL = 'Other'

/** Internal freeform answer label used by Kun's UserInputBubble. */
export const USER_INPUT_FREEFORM_LABEL = 'Answer'

/** English copy matching Kun's userInputOtherDescription locale string. */
export const USER_INPUT_OTHER_DESCRIPTION = 'Type a custom response'

/** English copy matching Kun's userInputCustomPlaceholder locale string. */
export const USER_INPUT_CUSTOM_PLACEHOLDER = 'Type your answer…'

/** English copy matching Kun's userInputSubmit locale string. */
export const USER_INPUT_SUBMIT = 'Submit'

/** English copy matching Kun's userInputCancel locale string. */
export const USER_INPUT_CANCEL = 'Cancel'

export type UserInputBubbleStatus = 'pending' | 'submitted' | 'cancelled' | 'error'

export function formatUserInputBubbleQuestionProgress(
  current: number,
  total: number,
): string {
  return USER_INPUT_BUBBLE_QUESTION_PROGRESS_TEMPLATE.replace(
    '{{current}}',
    String(current),
  ).replace('{{total}}', String(total))
}

export function resolveUserInputBubbleStatusLabel(status: UserInputBubbleStatus): string {
  switch (status) {
    case 'submitted':
      return USER_INPUT_BUBBLE_SUBMITTED_LABEL
    case 'cancelled':
      return USER_INPUT_BUBBLE_CANCELLED_LABEL
    case 'error':
      return USER_INPUT_BUBBLE_FAILED_LABEL
    default:
      return USER_INPUT_BUBBLE_PENDING_LABEL
  }
}
