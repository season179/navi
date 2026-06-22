// Write-mode image preview echoing Kun's WriteImagePreview
// (../Kun/src/renderer/src/components/write/WriteImagePreview.tsx).
// Visual only: parent supplies image src and file metadata snapshots.

import { useEffect, useState, type ReactElement } from 'react'
import { ExternalLink, Image as ImageIcon, ZoomIn, ZoomOut } from 'lucide-react'

const IMAGE_MIN_ZOOM = 25
const IMAGE_MAX_ZOOM = 300
const IMAGE_ZOOM_STEP = 25

const COPY = {
  writeImageZoomOut: 'Zoom out',
  writeImageZoomIn: 'Zoom in',
  writeImageZoom: 'Zoom level',
  writeImageActualSize: 'Actual size',
  writeImageFit: 'Fit to window',
  writeImageFitShort: 'Fit',
  writeImageOpenExternal: 'Open in default app',
}

type WriteImageFitMode = 'fit' | 'actual'

export type WriteImagePreviewPreviewMode = 'default' | 'actual' | 'zoomed'

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min
  return Math.min(Math.max(value, min), max)
}

function clampImageZoom(value: number): number {
  return clamp(Math.round(value), IMAGE_MIN_ZOOM, IMAGE_MAX_ZOOM)
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function normalizePath(value: string): string {
  return value.replaceAll('\\', '/').replace(/\/+$/, '')
}

function basenameFromPath(value: string): string {
  const normalized = normalizePath(value)
  const segments = normalized.split('/').filter(Boolean)
  return segments[segments.length - 1] || normalized
}

function relativeToWorkspace(workspaceRoot: string, filePath: string): string {
  const normalizedRoot = normalizePath(workspaceRoot)
  const normalizedTarget = normalizePath(filePath)
  const prefix = `${normalizedRoot}/`
  if (normalizedTarget.startsWith(prefix)) {
    return normalizedTarget.slice(prefix.length)
  }
  return basenameFromPath(normalizedTarget)
}

/** Sample image metadata for ?writeImagePreview preview hooks. */
export const WRITE_IMAGE_PREVIEW_SAMPLE = {
  filePath: '/Users/season/writing/photos/hero-banner.png',
  workspaceRoot: '/Users/season/writing',
  mimeType: 'image/png',
  size: 2_457_600,
  src: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7dd3fc"/>
          <stop offset="100%" stop-color="#dbeafe"/>
        </linearGradient>
        <linearGradient id="hill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#34d399"/>
          <stop offset="100%" stop-color="#059669"/>
        </linearGradient>
      </defs>
      <rect width="960" height="540" fill="url(#sky)"/>
      <circle cx="760" cy="110" r="56" fill="#fde68a" opacity="0.95"/>
      <path d="M0 360 L220 280 L420 340 L640 250 L960 320 L960 540 L0 540 Z" fill="url(#hill)"/>
      <path d="M0 400 L180 340 L360 390 L560 300 L960 380 L960 540 L0 540 Z" fill="#047857" opacity="0.72"/>
      <text x="48" y="96" fill="#0f172a" font-family="system-ui,sans-serif" font-size="28" font-weight="700">Hero banner preview</text>
      <text x="48" y="132" fill="#334155" font-family="system-ui,sans-serif" font-size="16">WriteImagePreview sample</text>
    </svg>`,
  )}`,
}

type Props = {
  src: string
  filePath: string
  mimeType: string
  size: number
  workspaceRoot: string
  /** Optional initial fit mode for preview hooks. */
  initialFitMode?: WriteImageFitMode
  /** Optional initial zoom for preview hooks. */
  initialZoom?: number
}

export function WriteImagePreview({
  src,
  filePath,
  mimeType,
  size,
  workspaceRoot,
  initialFitMode = 'fit',
  initialZoom = 100,
}: Props): ReactElement {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)
  const [fitMode, setFitMode] = useState<WriteImageFitMode>(initialFitMode)
  const [zoom, setZoom] = useState(() => clampImageZoom(initialZoom))
  const fileName = basenameFromPath(filePath)
  const relativePath = relativeToWorkspace(workspaceRoot, filePath)
  const actualMode = fitMode === 'actual'

  useEffect(() => {
    setDimensions(null)
  }, [src, filePath])

  const openImage = (): void => {
    // Visual-only port: no IPC equivalent in navi.
  }

  return (
    <div className="write-image-preview">
      <div className="write-image-preview-header">
        <div className="write-image-preview-header-left">
          <span className="write-image-preview-icon-frame">
            <ImageIcon className="write-image-preview-icon" strokeWidth={1.9} />
          </span>
          <div className="write-image-preview-file-copy">
            <div className="write-image-preview-file-name">{fileName}</div>
            <div className="write-image-preview-file-path" title={relativePath}>
              {relativePath}
            </div>
          </div>
        </div>
        <div className="write-image-preview-zoom-strip">
          <button
            type="button"
            onClick={() => {
              setFitMode('actual')
              setZoom((value) => clampImageZoom(value - IMAGE_ZOOM_STEP))
            }}
            className="write-image-preview-icon-btn"
            title={COPY.writeImageZoomOut}
            aria-label={COPY.writeImageZoomOut}
          >
            <ZoomOut className="write-image-preview-toolbar-icon" strokeWidth={1.85} />
          </button>
          <input
            type="range"
            min={IMAGE_MIN_ZOOM}
            max={IMAGE_MAX_ZOOM}
            step={IMAGE_ZOOM_STEP}
            value={zoom}
            aria-label={COPY.writeImageZoom}
            className="write-image-preview-zoom-slider"
            onChange={(event) => {
              setFitMode('actual')
              setZoom(clampImageZoom(Number(event.target.value)))
            }}
          />
          <button
            type="button"
            onClick={() => {
              setFitMode('actual')
              setZoom((value) => clampImageZoom(value + IMAGE_ZOOM_STEP))
            }}
            className="write-image-preview-icon-btn"
            title={COPY.writeImageZoomIn}
            aria-label={COPY.writeImageZoomIn}
          >
            <ZoomIn className="write-image-preview-toolbar-icon" strokeWidth={1.85} />
          </button>
          <button
            type="button"
            onClick={() => setFitMode((mode) => (mode === 'fit' ? 'actual' : 'fit'))}
            className={`write-image-preview-menu-btn${fitMode === 'fit' ? ' write-image-preview-menu-btn-active' : ''}`}
            title={fitMode === 'fit' ? COPY.writeImageActualSize : COPY.writeImageFit}
            aria-label={fitMode === 'fit' ? COPY.writeImageActualSize : COPY.writeImageFit}
          >
            {fitMode === 'fit' ? COPY.writeImageFitShort : `${zoom}%`}
          </button>
        </div>
        <button
          type="button"
          onClick={openImage}
          className="write-image-preview-icon-btn"
          title={COPY.writeImageOpenExternal}
          aria-label={COPY.writeImageOpenExternal}
        >
          <ExternalLink className="write-image-preview-toolbar-icon" strokeWidth={1.85} />
        </button>
      </div>

      <div className="write-image-preview-body">
        <div className="write-image-preview-body-inner">
          <img
            src={src}
            alt={fileName}
            className={`write-image-preview-image${actualMode ? ' write-image-preview-image-actual' : ''}`}
            style={
              actualMode && dimensions
                ? {
                    width: `${Math.round((dimensions.width * zoom) / 100)}px`,
                    height: 'auto',
                  }
                : undefined
            }
            onLoad={(event) => {
              const image = event.currentTarget
              setDimensions({ width: image.naturalWidth, height: image.naturalHeight })
            }}
          />
        </div>
      </div>

      <div className="write-image-preview-footer">
        <span className="write-image-preview-meta-chip">{mimeType}</span>
        <span className="write-image-preview-meta-chip">{formatBytes(size)}</span>
        {dimensions ? (
          <span className="write-image-preview-meta-chip">
            {dimensions.width} x {dimensions.height}
          </span>
        ) : null}
      </div>
    </div>
  )
}

type PreviewProps = {
  mode: WriteImagePreviewPreviewMode
}

function previewInitialState(mode: WriteImagePreviewPreviewMode): {
  fitMode: WriteImageFitMode
  zoom: number
} {
  if (mode === 'actual') return { fitMode: 'actual', zoom: 100 }
  if (mode === 'zoomed') return { fitMode: 'actual', zoom: 175 }
  return { fitMode: 'fit', zoom: 100 }
}

/** Full-page preview shell for ?writeImagePreview URL hooks. */
export function WriteImagePreviewPreview({ mode }: PreviewProps): ReactElement {
  const initial = previewInitialState(mode)

  return (
    <div className="write-image-preview-preview">
      <WriteImagePreview
        src={WRITE_IMAGE_PREVIEW_SAMPLE.src}
        filePath={WRITE_IMAGE_PREVIEW_SAMPLE.filePath}
        mimeType={WRITE_IMAGE_PREVIEW_SAMPLE.mimeType}
        size={WRITE_IMAGE_PREVIEW_SAMPLE.size}
        workspaceRoot={WRITE_IMAGE_PREVIEW_SAMPLE.workspaceRoot}
        initialFitMode={initial.fitMode}
        initialZoom={initial.zoom}
      />
    </div>
  )
}
