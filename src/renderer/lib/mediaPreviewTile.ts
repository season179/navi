// Kun MediaPreviewTile chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-bubbles.tsx).
// Visual only — used for production MediaPreviewTile and preview hooks.

/** English copy matching Kun's generatedFileSaving locale string. */
export const MEDIA_PREVIEW_TILE_SAVING = 'Saving…'

/** English copy matching Kun's generatedFileSaved locale string. */
export const MEDIA_PREVIEW_TILE_SAVED = 'Saved'

/** English copy matching Kun's generatedFileSaveFailed locale string. */
export const MEDIA_PREVIEW_TILE_SAVE_FAILED = 'Save failed'

/** English copy matching Kun's generatedFileDownload locale string. */
export const MEDIA_PREVIEW_TILE_DOWNLOAD = 'Download'

/** English copy matching Kun's generatedFilePreviewUnavailable locale string. */
export const MEDIA_PREVIEW_TILE_PREVIEW_UNAVAILABLE = 'Preview unavailable'

/** English copy matching Kun's filePreviewOpenEditor locale string. */
export const MEDIA_PREVIEW_TILE_OPEN_EDITOR = 'Open in editor'

/** English copy matching Kun's imagePreviewOpen locale string. */
export const MEDIA_PREVIEW_TILE_IMAGE_OPEN_TEMPLATE = 'Open {{name}} preview'

export type MediaPreviewTileSaveState = 'idle' | 'saving' | 'saved' | 'error'

export function formatMediaPreviewTileImageOpen(name: string): string {
  return MEDIA_PREVIEW_TILE_IMAGE_OPEN_TEMPLATE.replace('{{name}}', name)
}

export function resolveMediaPreviewTileSaveLabel(
  state: MediaPreviewTileSaveState,
): string {
  if (state === 'saving') return MEDIA_PREVIEW_TILE_SAVING
  if (state === 'saved') return MEDIA_PREVIEW_TILE_SAVED
  if (state === 'error') return MEDIA_PREVIEW_TILE_SAVE_FAILED
  return MEDIA_PREVIEW_TILE_DOWNLOAD
}
