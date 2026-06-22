// Generated files panel echoing Kun's GeneratedFilesPanel
// (../Kun/src/renderer/src/components/chat/message-timeline-bubbles.tsx).
// Visual only: parent supplies media snapshots for the conversation gallery.

import type { ReactElement } from 'react'
import { GENERATED_FILES_PANEL_TITLE } from '../lib/generatedFilesPanel'
import {
  MediaAttachmentGallery,
  MEDIA_ATTACHMENT_GALLERY_PREVIEW,
  MEDIA_PREVIEW_TILE_PREVIEW_FILE,
  MEDIA_PREVIEW_TILE_PREVIEW_IMAGE,
  type MediaReference,
} from './MediaPreviewTile'

type Props = {
  media: MediaReference[]
}

/** Default gallery for ?generatedFilesPanel=1 visual verification. */
export const GENERATED_FILES_PANEL_PREVIEW: MediaReference[] =
  MEDIA_ATTACHMENT_GALLERY_PREVIEW

/** Single image for ?generatedFilesPanel=single visual verification. */
export const GENERATED_FILES_PANEL_PREVIEW_SINGLE: MediaReference[] = [
  MEDIA_PREVIEW_TILE_PREVIEW_IMAGE,
]

/** Mixed image and file for ?generatedFilesPanel=mixed visual verification. */
export const GENERATED_FILES_PANEL_PREVIEW_MIXED: MediaReference[] = [
  MEDIA_PREVIEW_TILE_PREVIEW_IMAGE,
  MEDIA_PREVIEW_TILE_PREVIEW_FILE,
]

export function GeneratedFilesPanel({ media }: Props): ReactElement | null {
  if (media.length === 0) return null

  return (
    <div className="generated-files-panel">
      <div className="generated-files-panel-title">{GENERATED_FILES_PANEL_TITLE}</div>
      <MediaAttachmentGallery media={media} variant="conversation" />
    </div>
  )
}
