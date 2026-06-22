// Kun ImagePreviewLightbox chrome
// (../Kun/src/renderer/src/components/chat/ImagePreviewLightbox.tsx).
// Visual only — used for production ImagePreviewLightbox and preview hooks.

/** English copy matching Kun's imagePreviewTitle locale string. */
export const IMAGE_PREVIEW_LIGHTBOX_TITLE = 'Image preview'

/** English copy matching Kun's imagePreviewClose locale string. */
export const IMAGE_PREVIEW_LIGHTBOX_CLOSE = 'Close image preview'

/** English copy matching Kun's imagePreviewDownload locale string. */
export const IMAGE_PREVIEW_LIGHTBOX_DOWNLOAD = 'Download image'

/** English copy matching Kun's imagePreviewZoomOut locale string. */
export const IMAGE_PREVIEW_LIGHTBOX_ZOOM_OUT = 'Zoom out'

/** English copy matching Kun's imagePreviewResetZoom locale string. */
export const IMAGE_PREVIEW_LIGHTBOX_RESET_ZOOM = 'Reset zoom'

/** English copy matching Kun's imagePreviewZoomIn locale string. */
export const IMAGE_PREVIEW_LIGHTBOX_ZOOM_IN = 'Zoom in'

export function resolveImagePreviewLightboxTitle(
  title: string | undefined,
  alt: string,
): string {
  const trimmedTitle = title?.trim()
  if (trimmedTitle) return trimmedTitle
  const trimmedAlt = alt.trim()
  if (trimmedAlt) return trimmedAlt
  return IMAGE_PREVIEW_LIGHTBOX_TITLE
}

export function resolveImagePreviewLightboxDownloadLabel(
  downloadLabel: string | undefined,
): string {
  const trimmed = downloadLabel?.trim()
  return trimmed || IMAGE_PREVIEW_LIGHTBOX_DOWNLOAD
}
