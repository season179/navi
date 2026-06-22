// Kun TodoPanel chrome
// (../Kun/src/renderer/src/components/todo/TodoPanel.tsx).
// Visual only — used for production TodoPanel and preview hooks.

/** English copy matching Kun's rightPanelCollapse locale string. */
export const TODO_PANEL_COLLAPSE_LABEL = 'Collapse right sidebar'

/** English copy matching Kun's todoPanelTitle locale string. */
export const TODO_PANEL_TITLE = 'Thread Todo'

/** English copy matching Kun's todoClear locale string. */
export const TODO_PANEL_CLEAR_LABEL = 'Clear todos'

/** English copy matching Kun's todoEmptyTitle locale string. */
export const TODO_PANEL_EMPTY_TITLE = 'No todos yet'

/** English copy matching Kun's todoEmptyDescription locale string. */
export const TODO_PANEL_EMPTY_DESCRIPTION =
  'Plan checklists and model-written todos for this thread will appear here.'

/** English copy matching Kun's todoStatusPending locale string. */
export const TODO_STATUS_PENDING_LABEL = 'Pending'

/** English copy matching Kun's todoStatusInProgress locale string. */
export const TODO_STATUS_IN_PROGRESS_LABEL = 'Active'

/** English copy matching Kun's todoStatusCompleted locale string. */
export const TODO_STATUS_COMPLETED_LABEL = 'Done'

/** English copy matching Kun's todoMarkPending locale string. */
export const TODO_MARK_PENDING_LABEL = 'Mark pending'

/** English copy matching Kun's todoMarkCompleted locale string. */
export const TODO_MARK_COMPLETED_LABEL = 'Mark complete'

/** English copy matching Kun's todoStatus.* locale strings. */
export const TODO_ROW_STATUS_LABELS = {
  pending: TODO_STATUS_PENDING_LABEL,
  in_progress: TODO_STATUS_IN_PROGRESS_LABEL,
  completed: TODO_STATUS_COMPLETED_LABEL,
} as const

export type TodoRowStatus = keyof typeof TODO_ROW_STATUS_LABELS

export function resolveTodoRowStatusLabel(status: TodoRowStatus): string {
  return TODO_ROW_STATUS_LABELS[status]
}
