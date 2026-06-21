// Write-mode markdown preview echoing Kun's WriteMarkdownPreview
// (../Kun/src/renderer/src/components/write/WriteMarkdownPreview.tsx).
// Visual only: uses navi's Markdown component instead of react-markdown.

import { Component, type ReactElement, type ReactNode } from 'react'
import { Markdown } from './Markdown'

const COPY = {
  previewErrorFallback: 'Markdown preview failed, showing source text instead.',
}

export type WriteMarkdownPreviewPreviewMode = 'default' | 'plain' | 'error'

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

type Props = {
  content: string
  isMarkdown?: boolean
  previewErrorMessage?: string
  /** Static preview: render the amber error fallback without throwing. */
  showErrorFallback?: boolean
}

function plainTextFallback(content: string): ReactElement {
  return (
    <pre className="write-markdown-preview-plain">
      {content}
    </pre>
  )
}

type PreviewBoundaryProps = {
  content: string
  previewErrorMessage: string
  children: ReactNode
}

type PreviewBoundaryState = {
  error: string | null
}

class PreviewErrorBoundary extends Component<PreviewBoundaryProps, PreviewBoundaryState> {
  state: PreviewBoundaryState = { error: null }

  static getDerivedStateFromError(error: unknown): PreviewBoundaryState {
    return { error: error instanceof Error ? error.message : String(error) }
  }

  override componentDidUpdate(previousProps: PreviewBoundaryProps): void {
    if (
      this.state.error &&
      (previousProps.content !== this.props.content)
    ) {
      this.setState({ error: null })
    }
  }

  override render(): ReactNode {
    if (!this.state.error) return this.props.children
    return (
      <div className="write-markdown-preview-error-wrap">
        <div className="write-markdown-preview-error-banner">
          {this.props.previewErrorMessage}
        </div>
        {plainTextFallback(this.props.content)}
      </div>
    )
  }
}

function WriteMarkdownPreviewContent({
  content,
  isMarkdown = true,
}: Pick<Props, 'content' | 'isMarkdown'>): ReactElement {
  if (!isMarkdown) return plainTextFallback(content)

  return (
    <div className="write-markdown-preview ds-markdown min-h-full text-ds-ink">
      <Markdown text={content} streaming={false} />
    </div>
  )
}

export function WriteMarkdownPreview({
  content,
  isMarkdown = true,
  previewErrorMessage = COPY.previewErrorFallback,
  showErrorFallback = false,
}: Props): ReactElement {
  if (showErrorFallback) {
    return (
      <div className="write-markdown-preview-error-wrap">
        <div className="write-markdown-preview-error-banner">
          {previewErrorMessage}
        </div>
        {plainTextFallback(content)}
      </div>
    )
  }

  return (
    <PreviewErrorBoundary content={content} previewErrorMessage={previewErrorMessage}>
      <WriteMarkdownPreviewContent content={content} isMarkdown={isMarkdown} />
    </PreviewErrorBoundary>
  )
}

function previewContent(mode: WriteMarkdownPreviewPreviewMode): {
  content: string
  isMarkdown: boolean
  showErrorFallback?: boolean
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
  return { content: WRITE_MARKDOWN_PREVIEW_SAMPLE, isMarkdown: true }
}

type PreviewProps = {
  mode: WriteMarkdownPreviewPreviewMode
}

/** Full-page preview shell for ?writeMarkdownPreview URL hooks. */
export function WriteMarkdownPreviewPreview({ mode }: PreviewProps): ReactElement {
  const snapshot = previewContent(mode)

  return (
    <div className="write-markdown-preview-preview">
      <div className="write-markdown-preview-scroll">
        <WriteMarkdownPreview
          content={snapshot.content}
          isMarkdown={snapshot.isMarkdown}
          showErrorFallback={snapshot.showErrorFallback}
        />
      </div>
    </div>
  )
}
