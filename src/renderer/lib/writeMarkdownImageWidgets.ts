// Write markdown preview image widget helpers echoing Kun's infographic-pending.ts
// and @shared/write-prototype.ts. Visual only: no generation registry or IPC.

export type WriteInfographicPendingKind = 'infographic' | 'design' | 'prototype'
export type WriteInfographicPendingState = 'active' | 'stale'
export type WriteHtmlEmbedVisualState = 'cover' | 'loaded' | 'error' | 'missing'

export const PENDING_INFOGRAPHIC_PROTOCOL = 'kun-pending-infographic:'

const PENDING_SRC_PATTERN = /^kun-pending-infographic:\/\/([A-Za-z0-9-]+)$/

/** Id encoded in a pending src, or null when src is not a pending token. */
export function parsePendingInfographicId(src: string | undefined): string | null {
  if (!src) return null
  const match = PENDING_SRC_PATTERN.exec(src.trim())
  return match ? match[1] : null
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
}

export type WriteMarkdownPreviewPreviewMode =
  | 'default'
  | 'plain'
  | 'error'
  | 'infographic'
  | 'infographicStale'
  | 'infographicDesign'
  | 'infographicPrototype'
  | 'htmlEmbed'
  | 'htmlEmbedLoaded'

const PREVIEW_INFOGRAPHIC_ID = 'preview-infographic-id'
const PREVIEW_HTML_EMBED_SRC = '../../proto/launch-mockup.html'

/** Sample markdown with a pending infographic token for preview hooks. */
export const WRITE_MARKDOWN_PREVIEW_INFOGRAPHIC_SAMPLE = `# Launch plan draft

This section shows the animated placeholder Kun renders while an infographic generates.

![Infographic](${PENDING_INFOGRAPHIC_PROTOCOL}//${PREVIEW_INFOGRAPHIC_ID})

The final PNG replaces the placeholder when generation completes.
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
  if (value === 'infographic') return 'infographic'
  if (value === 'infographicStale') return 'infographicStale'
  if (value === 'infographicDesign') return 'infographicDesign'
  if (value === 'infographicPrototype') return 'infographicPrototype'
  if (value === 'htmlEmbed') return 'htmlEmbed'
  if (value === 'htmlEmbedLoaded') return 'htmlEmbedLoaded'
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
  if (mode === 'htmlEmbed' || mode === 'htmlEmbedLoaded') {
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
