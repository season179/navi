// Full-screen image preview lightbox echoing Kun's ImagePreviewLightbox
// (../Kun/src/renderer/src/components/chat/ImagePreviewLightbox.tsx). Visual
// only: parent controls open state and image source; zoom/download are local UI.

import { useEffect, useId, useState, type ReactElement } from 'react'
import { createPortal } from 'react-dom'
import { Download, Minus, Plus, X } from 'lucide-react'

export type ImagePreviewLightboxProps = {
  open: boolean
  src: string
  alt: string
  title?: string
  downloadHref?: string
  downloadName?: string
  downloadDisabled?: boolean
  downloadLabel?: string
  onDownload?: () => void | Promise<void>
  onClose: () => void
}

const MIN_ZOOM = 0.5
const MAX_ZOOM = 3
const ZOOM_STEP = 0.25

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

/** Sample image for ?imagePreviewLightbox=1 visual verification. */
export const IMAGE_PREVIEW_LIGHTBOX_SAMPLE = {
  src: 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#dbeafe"/>
          <stop offset="100%" stop-color="#bfdbfe"/>
        </linearGradient>
      </defs>
      <rect width="640" height="420" fill="url(#bg)"/>
      <rect x="48" y="48" width="544" height="324" rx="24" fill="#ffffff" opacity="0.72"/>
      <circle cx="320" cy="170" r="56" fill="#3b82f6" opacity="0.18"/>
      <path d="M120 300 L220 220 L300 268 L420 180 L520 300 Z" fill="#2563eb" opacity="0.55"/>
      <text x="320" y="360" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" fill="#1e3a8a">Preview image</text>
    </svg>`,
  ),
  alt: 'Sample landscape preview',
  title: 'Sample preview',
} as const

export function ImagePreviewLightbox({
  open,
  src,
  alt,
  title,
  downloadHref,
  downloadName,
  downloadDisabled = false,
  downloadLabel,
  onDownload,
  onClose,
}: ImagePreviewLightboxProps): ReactElement | null {
  const [zoom, setZoom] = useState(1)
  const titleId = useId()
  const closeLabel = 'Close'
  const resolvedTitle = title || alt || 'Image preview'
  const resolvedDownloadLabel = downloadLabel ?? 'Download'

  useEffect(() => {
    if (!open || typeof window === 'undefined') return
    setZoom(1)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  const zoomPercent = `${Math.round(zoom * 100)}%`
  const canDownload =
    !downloadDisabled && (typeof onDownload === 'function' || Boolean(downloadHref))
  const imageClass =
    zoom === 1 ? 'image-preview-lightbox-image' : 'image-preview-lightbox-image is-zoomed'
  const imageStyle = zoom === 1 ? undefined : { width: `${zoom * 100}%` }

  const downloadControl = onDownload ? (
    <button
      type="button"
      onClick={() => void onDownload()}
      disabled={!canDownload}
      aria-label={resolvedDownloadLabel}
      title={resolvedDownloadLabel}
      className="image-preview-lightbox-btn"
    >
      <Download strokeWidth={1.9} />
    </button>
  ) : downloadHref ? (
    <a
      href={downloadHref}
      download={downloadName || resolvedTitle}
      aria-label={resolvedDownloadLabel}
      title={resolvedDownloadLabel}
      className="image-preview-lightbox-btn"
    >
      <Download strokeWidth={1.9} />
    </a>
  ) : null

  return createPortal(
    <div
      className="image-preview-lightbox ds-no-drag"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <h2 id={titleId} className="sr-only">
        {resolvedTitle}
      </h2>
      <div className="image-preview-lightbox-toolbar">
        {downloadControl}
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          title={closeLabel}
          className="image-preview-lightbox-btn"
        >
          <X strokeWidth={2} />
        </button>
      </div>
      <div className="image-preview-lightbox-stage">
        <div className="image-preview-lightbox-frame">
          <img src={src} alt={alt} className={imageClass} style={imageStyle} draggable={false} />
        </div>
      </div>
      <div className="image-preview-lightbox-zoom">
        <button
          type="button"
          onClick={() => setZoom((value) => clampZoom(value - ZOOM_STEP))}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Zoom out"
          title="Zoom out"
          className="image-preview-lightbox-zoom-btn"
        >
          <Minus strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          aria-label="Reset zoom"
          title="Reset zoom"
          className="image-preview-lightbox-zoom-label"
        >
          {zoomPercent}
        </button>
        <button
          type="button"
          onClick={() => setZoom((value) => clampZoom(value + ZOOM_STEP))}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Zoom in"
          title="Zoom in"
          className="image-preview-lightbox-zoom-btn"
        >
          <Plus strokeWidth={2} />
        </button>
      </div>
    </div>,
    document.body,
  )
}
