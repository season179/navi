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
  | 'loading'
  | 'unsupported'
  | 'largeFile'
  | 'truncated'
  | 'inlineAgent'
  | 'assistant'
  | 'assistantTimeline'
  | 'assistantQuoted'
  | 'assistantPdf'
  | 'assistantNoFile'
  | 'assistantStreaming'
  | 'runtimeBanner'
  | 'error'
  | 'exportSuccess'
  | 'exportError'
  | 'dirty'
  | 'saving'
  | 'review'
  | 'exportMenu'
  | 'modeMenu'

export function resolveWriteWorkspaceViewPreviewMode(
  params: URLSearchParams,
): WriteWorkspaceViewPreviewMode | null {
  if (!params.has('writeWorkspaceView')) return null
  const value = params.get('writeWorkspaceView')
  if (value === 'empty') return 'empty'
  if (value === 'emptyError') return 'emptyError'
  if (value === 'start') return 'start'
  if (value === 'live') return 'live'
  if (value === 'source') return 'source'
  if (value === 'rich') return 'rich'
  if (value === 'preview') return 'preview'
  if (value === 'pdf') return 'pdf'
  if (value === 'image') return 'image'
  if (value === 'loading') return 'loading'
  if (value === 'unsupported') return 'unsupported'
  if (value === 'largeFile') return 'largeFile'
  if (value === 'truncated') return 'truncated'
  if (value === 'inlineAgent') return 'inlineAgent'
  if (value === 'assistant') return 'assistant'
  if (value === 'assistantTimeline') return 'assistantTimeline'
  if (value === 'assistantQuoted') return 'assistantQuoted'
  if (value === 'assistantPdf') return 'assistantPdf'
  if (value === 'assistantNoFile') return 'assistantNoFile'
  if (value === 'assistantStreaming') return 'assistantStreaming'
  if (value === 'runtimeBanner') return 'runtimeBanner'
  if (value === 'error') return 'error'
  if (value === 'exportSuccess') return 'exportSuccess'
  if (value === 'exportError') return 'exportError'
  if (value === 'dirty') return 'dirty'
  if (value === 'saving') return 'saving'
  if (value === 'review') return 'review'
  if (value === 'exportMenu') return 'exportMenu'
  if (value === 'modeMenu') return 'modeMenu'
  return 'split'
}

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
  'loading',
  'unsupported',
  'largeFile',
  'truncated',
  'inlineAgent',
  'error',
  'exportSuccess',
  'exportError',
  'dirty',
  'saving',
  'review',
  'exportMenu',
  'modeMenu',
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
