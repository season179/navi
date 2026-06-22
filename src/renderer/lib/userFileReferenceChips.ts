// Kun UserFileReferenceChips chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-bubbles.tsx).
// Visual only — used for production UserFileReferenceChips and preview hooks.

/** English copy matching Kun's messageFileReferences locale string template. */
export const MESSAGE_FILE_REFERENCES_TEMPLATE = 'Referenced files {{count}}'

export function formatUserFileReferenceChipsLabel(count: number): string {
  return MESSAGE_FILE_REFERENCES_TEMPLATE.replace('{{count}}', String(count))
}
