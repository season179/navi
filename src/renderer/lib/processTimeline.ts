// Kun process timeline chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-process.tsx).
// Visual only — used for ProcessEntryRow, ProcessStackRows, and ProcessFileReference.

/** English copy matching Kun's processExpandDetail locale string. */
export const PROCESS_EXPAND_DETAIL = 'Expand details'

/** English copy matching Kun's processCollapseDetail locale string. */
export const PROCESS_COLLAPSE_DETAIL = 'Collapse details'

/** English copy matching Kun's processFileReferenceHint locale string. */
export const PROCESS_FILE_REFERENCE_HINT =
  'Click to preview, double-click to open in editor'

export function resolveProcessExpandCollapseLabel(expanded: boolean): string {
  return expanded ? PROCESS_COLLAPSE_DETAIL : PROCESS_EXPAND_DETAIL
}
