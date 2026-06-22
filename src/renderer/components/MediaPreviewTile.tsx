// Media preview tiles echoing Kun's MediaPreviewTile and MediaAttachmentGallery
// (../Kun/src/renderer/src/components/chat/message-timeline-bubbles.tsx).
// Visual only: parent supplies media snapshots and optional preview URLs.

import { useState, type ReactElement } from 'react'
import { Check, Download, File, ImageIcon, Loader2, Video } from 'lucide-react'
import {
  formatMediaPreviewTileImageOpen,
  MEDIA_PREVIEW_TILE_DOWNLOAD,
  MEDIA_PREVIEW_TILE_OPEN_EDITOR,
  MEDIA_PREVIEW_TILE_PREVIEW_UNAVAILABLE,
  resolveMediaPreviewTileSaveLabel,
} from '../lib/mediaPreviewTile'
import {
  ImagePreviewLightbox,
  IMAGE_PREVIEW_LIGHTBOX_SAMPLE,
} from './ImagePreviewLightbox'

export type MediaReference = {
  id: string
  name?: string
  mimeType?: string
  previewUrl?: string
  path?: string
  relativePath?: string
  byteSize?: number
  width?: number
  height?: number
}

export type MediaPreviewVariant = 'user' | 'tool' | 'conversation'

function mediaName(media: MediaReference): string {
  const path = media.relativePath || media.path || ''
  const fromPath = path.split(/[\\/]/).filter(Boolean).at(-1)
  return media.name?.trim() || fromPath || media.id || 'file'
}

function mediaPath(media: MediaReference): string | undefined {
  return media.relativePath || media.path || undefined
}

function mediaMime(media: MediaReference): string {
  return media.mimeType?.trim() || ''
}

function mediaIsImage(media: MediaReference): boolean {
  const mimeType = mediaMime(media)
  return mimeType.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(mediaName(media))
}

function mediaIsVideo(media: MediaReference): boolean {
  const mimeType = mediaMime(media)
  return mimeType.startsWith('video/') || /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(mediaName(media))
}

function formatByteSize(byteSize: number | undefined): string {
  if (byteSize == null || !Number.isFinite(byteSize) || byteSize <= 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let value = byteSize
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  const digits = value >= 10 || unit === 0 ? 0 : 1
  return `${value.toFixed(digits)} ${units[unit]}`
}

/** Image tile for ?mediaPreviewTile=image visual verification. */
export const MEDIA_PREVIEW_TILE_PREVIEW_IMAGE: MediaReference = {
  id: 'preview-image',
  name: 'landscape-preview.png',
  mimeType: 'image/png',
  previewUrl: IMAGE_PREVIEW_LIGHTBOX_SAMPLE.src,
  relativePath: 'output/landscape-preview.png',
  byteSize: 245_760,
  width: 640,
  height: 420,
}

/** Video tile for ?mediaPreviewTile=video visual verification. */
export const MEDIA_PREVIEW_TILE_PREVIEW_VIDEO: MediaReference = {
  id: 'preview-video',
  name: 'screen-recording.mp4',
  mimeType: 'video/mp4',
  previewUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  relativePath: 'output/screen-recording.mp4',
  byteSize: 1_048_576,
}

/** File tile without rich preview for ?mediaPreviewTile=file visual verification. */
export const MEDIA_PREVIEW_TILE_PREVIEW_FILE: MediaReference = {
  id: 'preview-file',
  name: 'report.pdf',
  mimeType: 'application/pdf',
  relativePath: 'docs/report.pdf',
  byteSize: 98_304,
}

/** Gallery snapshots for ?mediaAttachmentGallery=user|tool|conversation. */
export const MEDIA_ATTACHMENT_GALLERY_PREVIEW: MediaReference[] = [
  MEDIA_PREVIEW_TILE_PREVIEW_IMAGE,
  {
    id: 'preview-image-2',
    name: 'diagram.svg',
    mimeType: 'image/svg+xml',
    previewUrl: IMAGE_PREVIEW_LIGHTBOX_SAMPLE.src,
    relativePath: 'assets/diagram.svg',
    byteSize: 12_288,
  },
]

type MediaPreviewTileProps = {
  media: MediaReference
  previewUrl?: string
  variant: MediaPreviewVariant
}

export function MediaPreviewTile({
  media,
  previewUrl,
  variant,
}: MediaPreviewTileProps): ReactElement {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const title = mediaName(media)
  const filePath = mediaPath(media)
  const mimeType = media.mimeType || (mediaIsImage(media) ? 'image' : mediaIsVideo(media) ? 'video' : '')
  const byteSize = formatByteSize(media.byteSize)
  const hasRichPreview = !!previewUrl && (mediaIsImage(media) || mediaIsVideo(media))
  const canSave = Boolean(filePath || previewUrl)

  const handleSaveAs = (): void => {
    if (saveState === 'saving' || !canSave) {
      if (!canSave) setSaveState('error')
      return
    }
    setSaveState('saving')
    window.setTimeout(() => {
      setSaveState('saved')
      window.setTimeout(() => setSaveState('idle'), 1600)
    }, 400)
  }

  const saveLabel = resolveMediaPreviewTileSaveLabel(saveState)
  const imageOpenLabel = formatMediaPreviewTileImageOpen(title)

  const saveIcon =
    saveState === 'saving' ? (
      <Loader2 className="media-preview-tile-icon is-spinning" strokeWidth={1.9} />
    ) : saveState === 'saved' ? (
      <Check className="media-preview-tile-icon" strokeWidth={2} />
    ) : (
      <Download className="media-preview-tile-icon" strokeWidth={1.9} />
    )

  const variantClass =
    variant === 'conversation'
      ? hasRichPreview
        ? ' is-conversation is-rich'
        : ' is-conversation is-file'
      : variant === 'tool'
        ? ' is-tool'
        : ' is-user'

  const revealClass = variant === 'user' ? '' : ' ds-media-printer-reveal'

  if (previewUrl && mediaIsImage(media)) {
    return (
      <figure
        className={`media-preview-tile${variantClass}${revealClass} is-image`}
        title={title}
      >
        <button
          type="button"
          onClick={() => setImagePreviewOpen(true)}
          className="media-preview-tile-zoom-trigger"
          title={imageOpenLabel}
          aria-label={imageOpenLabel}
        >
          <img src={previewUrl} alt={title} className="media-preview-tile-media" loading="lazy" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            handleSaveAs()
          }}
          disabled={!canSave || saveState === 'saving'}
          title={saveLabel}
          aria-label={saveLabel}
          className="media-preview-tile-save-icon-btn"
        >
          {saveIcon}
        </button>
        <ImagePreviewLightbox
          open={imagePreviewOpen}
          src={previewUrl}
          alt={title}
          title={title}
          downloadDisabled={!canSave || saveState === 'saving'}
          downloadLabel={saveLabel}
          onDownload={handleSaveAs}
          onClose={() => setImagePreviewOpen(false)}
        />
      </figure>
    )
  }

  if (previewUrl && mediaIsVideo(media)) {
    return (
      <figure className={`media-preview-tile${variantClass} is-video`} title={title}>
        <video
          src={previewUrl}
          className="media-preview-tile-media"
          controls
          preload="metadata"
        />
        <button
          type="button"
          onClick={() => handleSaveAs()}
          disabled={!canSave || saveState === 'saving'}
          title={saveLabel}
          aria-label={saveLabel}
          className="media-preview-tile-save-icon-btn"
        >
          {saveIcon}
        </button>
      </figure>
    )
  }

  const Icon = mediaIsVideo(media) ? Video : mediaIsImage(media) ? ImageIcon : File

  return (
    <div className={`media-preview-tile${variantClass} is-file-card`} title={title}>
      <div className="media-preview-tile-file-row">
        <span className="media-preview-tile-file-icon">
          <Icon className="media-preview-tile-file-icon-svg" strokeWidth={1.8} />
        </span>
        <div className="media-preview-tile-file-copy">
          <div className="media-preview-tile-file-title">{title}</div>
          <div className="media-preview-tile-file-meta">
            {[mimeType, byteSize].filter(Boolean).join(' · ') ||
              MEDIA_PREVIEW_TILE_PREVIEW_UNAVAILABLE}
          </div>
        </div>
      </div>
      <div className="media-preview-tile-file-actions">
        <button
          type="button"
          onClick={() => handleSaveAs()}
          disabled={!canSave || saveState === 'saving'}
          className="media-preview-tile-save-btn"
          title={saveLabel}
        >
          <span className="media-preview-tile-save-btn-icon">{saveIcon}</span>
          {MEDIA_PREVIEW_TILE_DOWNLOAD}
        </button>
        {filePath ? (
          <button type="button" className="media-preview-tile-save-btn">
            {MEDIA_PREVIEW_TILE_OPEN_EDITOR}
          </button>
        ) : null}
      </div>
    </div>
  )
}

type MediaAttachmentGalleryProps = {
  media: MediaReference[]
  variant: MediaPreviewVariant
}

export function MediaAttachmentGallery({
  media,
  variant,
}: MediaAttachmentGalleryProps): ReactElement | null {
  if (media.length === 0) return null

  const variantClass =
    variant === 'conversation'
      ? ' is-conversation'
      : variant === 'tool'
        ? ' is-tool'
        : ' is-user'

  return (
    <div className={`media-attachment-gallery${variantClass}`}>
      {media.map((item) => (
        <MediaPreviewTile
          key={item.id}
          media={item}
          previewUrl={item.previewUrl}
          variant={variant}
        />
      ))}
    </div>
  )
}
