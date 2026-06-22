// Kun ChangeInspector chrome
// (../Kun/src/renderer/src/components/ChangeInspector.tsx).
// Visual only — used for production ChangeInspector and preview hooks.

/** English copy matching Kun's rightPanelCollapse locale string. */
export const CHANGE_INSPECTOR_COLLAPSE_LABEL = 'Collapse right sidebar'

/** English copy matching Kun's inspectorTitle locale string. */
export const CHANGE_INSPECTOR_TITLE = 'Changes'

/** English copy matching Kun's inspectorEmpty locale string. */
export const CHANGE_INSPECTOR_EMPTY_LABEL = 'No file changes in this thread yet.'

/** English copy matching Kun's inspectorEmptyTitle locale string. */
export const CHANGE_INSPECTOR_EMPTY_TITLE = 'No changes yet'

/** English copy matching Kun's inspectorSummaryFiles locale string. */
export const CHANGE_INSPECTOR_SUMMARY_FILES_TEMPLATE = '{{count}} file changes'

/** English copy matching Kun's inspectorSelectHint locale string. */
export const CHANGE_INSPECTOR_SELECT_HINT = 'Select a changed file to view its diff.'

/** English copy matching Kun's inspectorStatusRunning locale string. */
export const CHANGE_INSPECTOR_STATUS_RUNNING_LABEL = 'running'

/** English copy matching Kun's toolActionFile locale string. */
export const CHANGE_INSPECTOR_FILE_FALLBACK_LABEL = 'Edited file'

export function formatChangeInspectorSummaryFiles(count: number): string {
  return CHANGE_INSPECTOR_SUMMARY_FILES_TEMPLATE.replace('{{count}}', String(count))
}
