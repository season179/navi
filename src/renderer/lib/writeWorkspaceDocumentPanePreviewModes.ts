// Shared WriteWorkspaceDocumentPane preview mode identifiers.

export type WriteWorkspaceDocumentPanePreviewMode =
  | 'start'
  | 'loading'
  | 'image'
  | 'pdf'
  | 'unsupported'
  | 'source'
  | 'live'
  | 'rich'
  | 'split'
  | 'preview'
  | 'largeFile'
  | 'truncated'
  | 'liveDisabled'

export function resolveWriteWorkspaceDocumentPanePreviewMode(
  params: URLSearchParams,
): WriteWorkspaceDocumentPanePreviewMode | null {
  if (!params.has('writeWorkspaceDocumentPane')) return null
  const value = params.get('writeWorkspaceDocumentPane')
  if (value === 'start') return 'start'
  if (value === 'loading') return 'loading'
  if (value === 'image') return 'image'
  if (value === 'pdf') return 'pdf'
  if (value === 'unsupported') return 'unsupported'
  if (value === 'source') return 'source'
  if (value === 'live') return 'live'
  if (value === 'rich') return 'rich'
  if (value === 'split') return 'split'
  if (value === 'preview') return 'preview'
  if (value === 'largeFile') return 'largeFile'
  if (value === 'truncated') return 'truncated'
  if (value === 'liveDisabled') return 'liveDisabled'
  return 'split'
}
