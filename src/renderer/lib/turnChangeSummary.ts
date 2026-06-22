// Kun TurnChangeSummary chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-cards.tsx).
// Visual only — used for production TurnChangeSummary and preview hooks.

/** English copy matching Kun's turnChangeFilesOne locale string. */
export const TURN_CHANGE_FILES_ONE_LABEL = 'Edited 1 file'

/** English copy matching Kun's turnChangeFilesMany locale string. */
export const TURN_CHANGE_FILES_MANY_TEMPLATE = 'Edited {{count}} files'

/** English copy matching Kun's toolActionFile locale string. */
export const TURN_CHANGE_FILE_FALLBACK_LABEL = 'Edited file'

export function formatTurnChangeFilesMany(count: number): string {
  return TURN_CHANGE_FILES_MANY_TEMPLATE.replace('{{count}}', String(count))
}

export function resolveTurnChangeSummaryTitle(count: number): string {
  return count === 1 ? TURN_CHANGE_FILES_ONE_LABEL : formatTurnChangeFilesMany(count)
}

export function resolveTurnChangeFileLabel(filePath?: string): string {
  const trimmed = filePath?.trim()
  return trimmed ? trimmed : TURN_CHANGE_FILE_FALLBACK_LABEL
}
