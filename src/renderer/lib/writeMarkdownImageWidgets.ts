// Write markdown preview image widget helpers echoing Kun's infographic-pending.ts
// and @shared/write-prototype.ts. Visual only: no generation registry or IPC.

export type WriteInfographicPendingKind = 'infographic' | 'design' | 'prototype'
export type WriteInfographicPendingState = 'active' | 'stale'
export type WriteHtmlEmbedVisualState = 'cover' | 'loaded' | 'error' | 'missing'
export type WriteMarkdownPreviewImageState = 'pending' | 'error'

export const PENDING_INFOGRAPHIC_PROTOCOL = 'kun-pending-infographic:'

const PENDING_SRC_PATTERN = /^kun-pending-infographic:\/\/([A-Za-z0-9-]+)$/

/** Id encoded in a pending src, or null when src is not a pending token. */
export function parsePendingInfographicId(src: string | undefined): string | null {
  if (!src) return null
  const match = PENDING_SRC_PATTERN.exec(src.trim())
  return match ? match[1] : null
}

/** Parse `![alt](kun-pending-infographic://id)` image markdown. */
export function parsePendingInfographicImage(
  source: string,
): { alt: string; id: string; src: string } | null {
  const match = /^!\[([^\]]*)\]\(\s*(?:<([^>]*)>|([^)\s]+))\s*\)$/.exec(source.trim())
  if (!match) return null
  const src = (match[2] ?? match[3] ?? '').trim()
  const id = parsePendingInfographicId(src)
  if (!id) return null
  return { alt: match[1] ?? '', id, src }
}

/** Whether an image src points at a local HTML document to embed inline. */
export function isHtmlEmbedSrc(src: string | undefined): boolean {
  if (!src) return false
  const value = src.trim()
  if (!value || value.startsWith('#')) return false
  if (/^(https?:|mailto:|kun-pending-infographic:)/i.test(value)) return false
  if (/[?#]/.test(value)) return false
  return /\.html?$/i.test(value)
}

export type WriteMarkdownPreviewWidgetOverrides = {
  infographic?: {
    kind?: WriteInfographicPendingKind
    state?: WriteInfographicPendingState
  }
  htmlEmbed?: {
    visualState?: WriteHtmlEmbedVisualState
  }
  image?: {
    state?: WriteMarkdownPreviewImageState
  }
}

export type WriteMarkdownPreviewPreviewMode =
  | 'default'
  | 'plain'
  | 'error'
  | 'imagePending'
  | 'imageError'
  | 'infographic'
  | 'infographicStale'
  | 'infographicDesign'
  | 'infographicPrototype'
  | 'htmlEmbed'
  | 'htmlEmbedLoaded'
  | 'htmlEmbedError'
  | 'htmlEmbedMissing'

const PREVIEW_INFOGRAPHIC_ID = 'preview-infographic-id'
const PREVIEW_HTML_EMBED_SRC = '../../proto/launch-mockup.html'

/** Sample markdown with a pending infographic token for preview hooks. */
export const WRITE_MARKDOWN_PREVIEW_INFOGRAPHIC_SAMPLE = `# Launch plan draft

This section shows the animated placeholder Kun renders while an infographic generates.

![Infographic](${PENDING_INFOGRAPHIC_PROTOCOL}//${PREVIEW_INFOGRAPHIC_ID})

The final PNG replaces the placeholder when generation completes.
`

const PREVIEW_BROKEN_IMAGE_SRC = './assets/missing-hero.png'

/** Sample markdown with a broken local image for preview hooks. */
export const WRITE_MARKDOWN_PREVIEW_IMAGE_ERROR_SAMPLE = `# Launch plan draft

This section shows the error chip Kun renders when a markdown image fails to load.

![Hero screenshot](${PREVIEW_BROKEN_IMAGE_SRC})

The chip keeps alt text readable when the asset is missing or unreadable.
`

/** Sample markdown with an HTML prototype embed for preview hooks. */
export const WRITE_MARKDOWN_PREVIEW_HTML_EMBED_SAMPLE = `# Launch plan draft

This section shows the inline HTML prototype card Kun renders for local \`.html\` image sources.

![Launch flow prototype](${PREVIEW_HTML_EMBED_SRC})

Click **Run prototype** to mount the authorized webview in Kun; navi shows the visual cover card only.
`

export function resolveWriteMarkdownPreviewMode(
  params: URLSearchParams,
): WriteMarkdownPreviewPreviewMode | null {
  if (!params.has('writeMarkdownPreview')) return null
  const value = params.get('writeMarkdownPreview')
  if (value === 'plain') return 'plain'
  if (value === 'error') return 'error'
  if (value === 'imagePending') return 'imagePending'
  if (value === 'imageError') return 'imageError'
  if (value === 'infographic') return 'infographic'
  if (value === 'infographicStale') return 'infographicStale'
  if (value === 'infographicDesign') return 'infographicDesign'
  if (value === 'infographicPrototype') return 'infographicPrototype'
  if (value === 'htmlEmbed') return 'htmlEmbed'
  if (value === 'htmlEmbedLoaded') return 'htmlEmbedLoaded'
  if (value === 'htmlEmbedError') return 'htmlEmbedError'
  if (value === 'htmlEmbedMissing') return 'htmlEmbedMissing'
  return 'default'
}

export function widgetOverridesForPreviewMode(
  mode: WriteMarkdownPreviewPreviewMode,
): WriteMarkdownPreviewWidgetOverrides | undefined {
  if (mode === 'infographic') {
    return { infographic: { kind: 'infographic', state: 'active' } }
  }
  if (mode === 'infographicStale') {
    return { infographic: { kind: 'infographic', state: 'stale' } }
  }
  if (mode === 'infographicDesign') {
    return { infographic: { kind: 'design', state: 'active' } }
  }
  if (mode === 'infographicPrototype') {
    return { infographic: { kind: 'prototype', state: 'active' } }
  }
  if (mode === 'htmlEmbed') {
    return { htmlEmbed: { visualState: 'cover' } }
  }
  if (mode === 'htmlEmbedLoaded') {
    return { htmlEmbed: { visualState: 'loaded' } }
  }
  if (mode === 'htmlEmbedError') {
    return { htmlEmbed: { visualState: 'error' } }
  }
  if (mode === 'htmlEmbedMissing') {
    return { htmlEmbed: { visualState: 'missing' } }
  }
  if (mode === 'imagePending') {
    return { image: { state: 'pending' } }
  }
  if (mode === 'imageError') {
    return { image: { state: 'error' } }
  }
  return undefined
}

export function previewContentForMode(mode: WriteMarkdownPreviewPreviewMode): {
  content: string
  isMarkdown: boolean
  showErrorFallback?: boolean
  widgetOverrides?: WriteMarkdownPreviewWidgetOverrides
} {
  if (mode === 'plain') {
    return { content: WRITE_MARKDOWN_PREVIEW_PLAIN_SAMPLE, isMarkdown: false }
  }
  if (mode === 'error') {
    return {
      content: WRITE_MARKDOWN_PREVIEW_SAMPLE,
      isMarkdown: true,
      showErrorFallback: true,
    }
  }
  if (mode === 'imagePending' || mode === 'imageError') {
    return {
      content: WRITE_MARKDOWN_PREVIEW_IMAGE_ERROR_SAMPLE,
      isMarkdown: true,
      widgetOverrides: widgetOverridesForPreviewMode(mode),
    }
  }
  if (
    mode === 'infographic' ||
    mode === 'infographicStale' ||
    mode === 'infographicDesign' ||
    mode === 'infographicPrototype'
  ) {
    return {
      content: WRITE_MARKDOWN_PREVIEW_INFOGRAPHIC_SAMPLE,
      isMarkdown: true,
      widgetOverrides: widgetOverridesForPreviewMode(mode),
    }
  }
  if (
    mode === 'htmlEmbed' ||
    mode === 'htmlEmbedLoaded' ||
    mode === 'htmlEmbedError' ||
    mode === 'htmlEmbedMissing'
  ) {
    return {
      content: WRITE_MARKDOWN_PREVIEW_HTML_EMBED_SAMPLE,
      isMarkdown: true,
      widgetOverrides: widgetOverridesForPreviewMode(mode),
    }
  }
  return { content: WRITE_MARKDOWN_PREVIEW_SAMPLE, isMarkdown: true }
}

/** Rich sample document for ?writeMarkdownPreview preview hooks. */
export const WRITE_MARKDOWN_PREVIEW_SAMPLE = `# Launch plan draft

This document outlines the phased rollout for the writing workspace preview.

## Goals

- Match Kun's write preview typography and spacing
- Keep code blocks, tables, and task lists readable
- Preserve the centered **864px** reading column

> Good prose is clear thinking made visible. The preview pane should feel like a calm reading surface, not a chat bubble.

### Milestones

1. Port preview chrome and typography
2. Wire split-pane layout in the document pane
3. Validate dark theme contrast

| Phase | Owner | Status |
| --- | --- | --- |
| Preview port | Season | In progress |
| Editor port | Season | Planned |
| PDF viewer | Season | Planned |

\`\`\`typescript
export function clamp(value: number, min: number, max: number): number {
  if (max < min) return min
  return Math.min(Math.max(value, min), max)
}
\`\`\`

Inline \`clamp()\` helpers keep zoom ranges stable across preview modes.

---

### Checklist

- [x] Typography tokens
- [x] Code block styling
- [ ] Live image embeds

Read more in the [Kun reference app](https://example.com/kun).
`

export const WRITE_MARKDOWN_PREVIEW_PLAIN_SAMPLE = `# Raw text preview

This pane renders as monospace plain text when the file is not markdown.

function example() {
  return 'no markdown parsing'
}
`

export type WriteMarkdownEditorImageWidgetPreviewMode =
  | 'infographic'
  | 'infographicStale'
  | 'infographicDesign'
  | 'infographicPrototype'
  | 'htmlEmbed'
  | 'htmlEmbedLoaded'
  | 'htmlEmbedError'
  | 'htmlEmbedMissing'
  | 'imageError'
  | 'loadedImage'

/** Tiny inline SVG used for loaded-image live-preview editor mode. */
export const WRITE_MARKDOWN_EDITOR_PREVIEW_IMAGE_DATA_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%23e8edf4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-family='system-ui' font-size='20'%3EPreview image%3C/text%3E%3C/svg%3E"

const WRITE_MARKDOWN_EDITOR_LOADED_IMAGE_SAMPLE = `# Launch plan draft

This section shows a resolved workspace image inside CodeMirror live preview.

![Hero screenshot](${WRITE_MARKDOWN_EDITOR_PREVIEW_IMAGE_DATA_URL})
`

export function isWriteMarkdownEditorImageWidgetMode(
  value: string | null | undefined,
): value is WriteMarkdownEditorImageWidgetPreviewMode {
  return (
    value === 'infographic' ||
    value === 'infographicStale' ||
    value === 'infographicDesign' ||
    value === 'infographicPrototype' ||
    value === 'htmlEmbed' ||
    value === 'htmlEmbedLoaded' ||
    value === 'htmlEmbedError' ||
    value === 'htmlEmbedMissing' ||
    value === 'imageError' ||
    value === 'loadedImage'
  )
}

/** Widget overrides for ?writeMarkdownEditor live-preview infographic modes. */
export function editorWidgetOverridesForImageWidgetMode(
  mode: WriteMarkdownEditorImageWidgetPreviewMode,
): WriteMarkdownPreviewWidgetOverrides | undefined {
  if (
    mode === 'infographic' ||
    mode === 'infographicStale' ||
    mode === 'infographicDesign' ||
    mode === 'infographicPrototype'
  ) {
    return widgetOverridesForPreviewMode(mode)
  }
  if (
    mode === 'htmlEmbed' ||
    mode === 'htmlEmbedLoaded' ||
    mode === 'htmlEmbedError' ||
    mode === 'htmlEmbedMissing'
  ) {
    return widgetOverridesForPreviewMode(mode)
  }
  return undefined
}

/** Markdown sample for ?writeMarkdownEditor live-preview widget modes. */
export function editorPreviewContentForImageWidgetMode(
  mode: WriteMarkdownEditorImageWidgetPreviewMode,
): string {
  if (mode === 'infographic') return WRITE_MARKDOWN_PREVIEW_INFOGRAPHIC_SAMPLE
  if (
    mode === 'htmlEmbed' ||
    mode === 'htmlEmbedLoaded' ||
    mode === 'htmlEmbedError' ||
    mode === 'htmlEmbedMissing'
  ) {
    return WRITE_MARKDOWN_PREVIEW_HTML_EMBED_SAMPLE
  }
  if (mode === 'imageError') return WRITE_MARKDOWN_PREVIEW_IMAGE_ERROR_SAMPLE
  return WRITE_MARKDOWN_EDITOR_LOADED_IMAGE_SAMPLE
}
