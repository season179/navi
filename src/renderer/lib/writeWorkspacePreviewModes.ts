// Shared WriteWorkspaceView preview mode identifiers.

export type WriteWorkspaceViewPreviewMode =
  | 'empty'
  | 'emptyError'
  | 'start'
  | 'split'
  | 'live'
  | 'source'
  | 'rich'
  | 'preview'
  | 'pdf'
  | 'image'
  | 'inlineAgent'
  | 'assistant'
  | 'assistantTimeline'
  | 'assistantQuoted'
  | 'runtimeBanner'
  | 'error'
  | 'exportSuccess'
  | 'exportError'
  | 'dirty'
  | 'saving'

/** Snapshot modes exposed via ?productionWriteWorkspace for live write-tab verification. */
export const PRODUCTION_WRITE_WORKSPACE_SNAPSHOT_MODES = new Set<WriteWorkspaceViewPreviewMode>([
  'empty',
  'emptyError',
  'start',
  'runtimeBanner',
  'live',
  'source',
  'rich',
  'preview',
  'pdf',
  'image',
  'inlineAgent',
  'error',
  'exportSuccess',
  'exportError',
  'dirty',
  'saving',
])

export function resolveProductionWriteWorkspaceParam(
  searchParams?: URLSearchParams | null,
): string | null {
  if (searchParams) {
    return searchParams.get('productionWriteWorkspace')
  }
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('productionWriteWorkspace')
}

export function resolveProductionWriteWorkspaceSnapshotMode(
  searchParams?: URLSearchParams | null,
): WriteWorkspaceViewPreviewMode {
  const value = resolveProductionWriteWorkspaceParam(searchParams)
  if (value && PRODUCTION_WRITE_WORKSPACE_SNAPSHOT_MODES.has(value as WriteWorkspaceViewPreviewMode)) {
    return value as WriteWorkspaceViewPreviewMode
  }
  return 'split'
}
