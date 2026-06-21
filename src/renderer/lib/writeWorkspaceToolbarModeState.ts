// Kun-matching write toolbar mode active-state helpers (WriteWorkspaceView.tsx).

export type WriteToolbarPreviewMode = 'live' | 'rich' | 'source' | 'split' | 'preview'

export type WriteToolbarModeActiveOptions = {
  livePreviewEnabled?: boolean
  isMarkdown?: boolean
  activeFileIsText?: boolean
}

export function resolveLiveModeActive(
  previewMode: WriteToolbarPreviewMode,
  livePreviewEnabled = true,
): boolean {
  return previewMode === 'live' && livePreviewEnabled
}

export function resolveWriteToolbarModeActiveFlags(
  previewMode: WriteToolbarPreviewMode,
  {
    livePreviewEnabled = true,
    isMarkdown = true,
    activeFileIsText = true,
  }: WriteToolbarModeActiveOptions = {},
): {
  richModeActive: boolean
  sourceModeActive: boolean
  splitModeActive: boolean
  previewModeActive: boolean
} {
  const richModeActive =
    previewMode === 'rich' && isMarkdown && livePreviewEnabled && activeFileIsText
  const sourceModeActive =
    previewMode === 'source' ||
    ((previewMode === 'live' || previewMode === 'rich') && !livePreviewEnabled) ||
    (previewMode === 'rich' && !richModeActive)

  return {
    richModeActive,
    sourceModeActive,
    splitModeActive: previewMode === 'split',
    previewModeActive: previewMode === 'preview',
  }
}
