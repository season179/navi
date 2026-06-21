// Write rich editor image widget helpers echoing Kun's WriteLocalImage node views
// (../Kun/src/renderer/src/write/tiptap/local-image.ts). Visual only: no IPC.

import type { WriteHtmlEmbedVisualState } from '../components/WriteHtmlEmbed'
import type {
  WriteInfographicPendingKind,
  WriteInfographicPendingState,
} from '../components/WriteInfographicPending'

export type WriteRichEditorImageWidgetPreviewMode =
  | 'imageError'
  | 'infographic'
  | 'infographicStale'
  | 'htmlEmbed'

const PREVIEW_BROKEN_IMAGE_ALT = 'Hero screenshot'
const PREVIEW_BROKEN_IMAGE_TITLE = 'File not found: ./assets/missing-hero.png'
const PREVIEW_INFOGRAPHIC_ID = 'preview-infographic-id'
const PREVIEW_HTML_EMBED_SRC = '../../proto/launch-mockup.html'
const PREVIEW_HTML_EMBED_ALT = 'Launch flow prototype'

/** Tiny inline SVG used for the loaded rich-editor image preview mode. */
export const WRITE_RICH_EDITOR_PREVIEW_IMAGE_DATA_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%23e8edf4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-family='system-ui' font-size='20'%3EPreview image%3C/text%3E%3C/svg%3E"

export type WriteRichEditorImageWidgetSnapshot = {
  imageError?: {
    alt: string
    title: string
  }
  infographic?: {
    pendingId: string
    kind: WriteInfographicPendingKind
    state: WriteInfographicPendingState
  }
  htmlEmbed?: {
    rawSrc: string
    alt: string
    visualState: WriteHtmlEmbedVisualState
  }
  loadedImage?: {
    src: string
    alt: string
  }
}

export function imageWidgetSnapshotForMode(
  mode: WriteRichEditorImageWidgetPreviewMode,
): WriteRichEditorImageWidgetSnapshot {
  if (mode === 'imageError') {
    return {
      imageError: {
        alt: PREVIEW_BROKEN_IMAGE_ALT,
        title: PREVIEW_BROKEN_IMAGE_TITLE,
      },
    }
  }
  if (mode === 'infographic') {
    return {
      infographic: {
        pendingId: PREVIEW_INFOGRAPHIC_ID,
        kind: 'infographic',
        state: 'active',
      },
    }
  }
  if (mode === 'infographicStale') {
    return {
      infographic: {
        pendingId: PREVIEW_INFOGRAPHIC_ID,
        kind: 'infographic',
        state: 'stale',
      },
    }
  }
  return {
    htmlEmbed: {
      rawSrc: PREVIEW_HTML_EMBED_SRC,
      alt: PREVIEW_HTML_EMBED_ALT,
      visualState: 'cover',
    },
  }
}

export function isWriteRichEditorImageWidgetMode(
  value: string | null | undefined,
): value is WriteRichEditorImageWidgetPreviewMode {
  return (
    value === 'imageError' ||
    value === 'infographic' ||
    value === 'infographicStale' ||
    value === 'htmlEmbed'
  )
}
