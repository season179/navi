// Shared WriteWorkspaceToolbar preview mode identifiers.

export type WriteWorkspaceToolbarPreviewMode =
  | 'default'
  | 'pdf'
  | 'dirty'
  | 'saving'
  | 'error'
  | 'readonly'
  | 'exportMenu'
  | 'modeMenu'
  | 'assistant'
  | 'review'
  | 'image'
  | 'exporting'

export function resolveWriteWorkspaceToolbarPreviewMode(
  params: URLSearchParams,
): WriteWorkspaceToolbarPreviewMode | null {
  if (!params.has('writeWorkspaceToolbar')) return null
  const value = params.get('writeWorkspaceToolbar')
  if (value === 'pdf') return 'pdf'
  if (value === 'dirty') return 'dirty'
  if (value === 'saving') return 'saving'
  if (value === 'error') return 'error'
  if (value === 'readonly') return 'readonly'
  if (value === 'exportMenu') return 'exportMenu'
  if (value === 'modeMenu') return 'modeMenu'
  if (value === 'assistant') return 'assistant'
  if (value === 'review') return 'review'
  if (value === 'image') return 'image'
  if (value === 'exporting') return 'exporting'
  return 'default'
}
