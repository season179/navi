// Kun WorkMetaRow chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-cards.tsx).
// Visual only — used for production WorkMetaRow and preview hooks.

/** English copy matching Kun's processing locale string. */
export const WORK_META_ROW_PROCESSING_LABEL = 'Processing'

/** English copy matching Kun's processed locale string. */
export const WORK_META_ROW_PROCESSED_LABEL = 'Processed'

/** English copy matching Kun's processSteps locale string. */
export const WORK_META_ROW_PROCESS_STEPS_TEMPLATE = 'Work process ({{count}} steps)'

/** English copy matching Kun's thoughtFor locale string. */
export const WORK_META_ROW_THOUGHT_FOR_TEMPLATE = 'Thought for {{duration}}'

export function formatWorkMetaRowProcessSteps(count: number): string {
  return WORK_META_ROW_PROCESS_STEPS_TEMPLATE.replace('{{count}}', String(count))
}

export function formatWorkMetaRowThoughtFor(duration: string): string {
  return WORK_META_ROW_THOUGHT_FOR_TEMPLATE.replace('{{duration}}', duration)
}

export function resolveWorkMetaRowMainLabel(input: {
  processing: boolean
  stepCount: number
  durationLabel?: string
}): string {
  if (input.processing) {
    return input.durationLabel
      ? `${WORK_META_ROW_PROCESSING_LABEL} ${input.durationLabel}`
      : WORK_META_ROW_PROCESSING_LABEL
  }
  if (input.durationLabel) {
    return `${WORK_META_ROW_PROCESSED_LABEL} ${input.durationLabel}`
  }
  return formatWorkMetaRowProcessSteps(input.stepCount)
}
