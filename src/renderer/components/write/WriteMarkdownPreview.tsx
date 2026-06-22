// Write-mode markdown preview echoing Kun's WriteMarkdownPreview
// (../Kun/src/renderer/src/components/write/WriteMarkdownPreview.tsx).
// Visual only: Streamdown markdown with infographic and HTML embed widgets.

import { Component, useState, type ImgHTMLAttributes, type ReactElement, type ReactNode } from 'react'
import { Streamdown, type StreamdownProps } from 'streamdown'
import remarkGfm from 'remark-gfm'
import { harden } from 'rehype-harden'
import {
  WRITE_MARKDOWN_PREVIEW_PLAIN_SAMPLE,
  WRITE_MARKDOWN_PREVIEW_SAMPLE,
  isHtmlEmbedSrc,
  parsePendingInfographicId,
  previewContentForMode,
  type WriteMarkdownPreviewPreviewMode,
  type WriteMarkdownPreviewWidgetOverrides,
} from '../../lib/writeMarkdownImageWidgets'
import { CodeBlock } from '../common/CodeBlock'
import { WriteHtmlEmbed } from './WriteHtmlEmbed'
import { WriteInfographicPending } from './WriteInfographicPending'

export type { WriteMarkdownPreviewPreviewMode } from '../../lib/writeMarkdownImageWidgets'
export {
  WRITE_MARKDOWN_PREVIEW_PLAIN_SAMPLE,
  WRITE_MARKDOWN_PREVIEW_SAMPLE,
} from '../../lib/writeMarkdownImageWidgets'

const COPY = {
  previewErrorFallback: 'Markdown preview failed, showing source text instead.',
}

const rehypePlugins = [
  [
    harden,
    {
      allowedLinkPrefixes: ['*'],
      allowedImagePrefixes: ['*'],
    },
  ],
] satisfies StreamdownProps['rehypePlugins']

type Props = {
  content: string
  isMarkdown?: boolean
  previewErrorMessage?: string
  /** Static preview: render the amber error fallback without throwing. */
  showErrorFallback?: boolean
  /** Override widget chrome for pending infographics and HTML embeds. */
  widgetOverrides?: WriteMarkdownPreviewWidgetOverrides
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

type PreviewImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  widgetOverrides?: WriteMarkdownPreviewWidgetOverrides
}

function WriteMarkdownPreviewImage({
  src,
  alt,
  widgetOverrides,
  ...props
}: PreviewImageProps): ReactElement {
  const [loadError, setLoadError] = useState(false)
  const imageSrc = typeof src === 'string' ? src : undefined
  const altText = typeof alt === 'string' ? alt : undefined
  const forcedImageState = widgetOverrides?.image?.state
  const pendingId = parsePendingInfographicId(imageSrc)

  if (pendingId !== null) {
    return (
      <span className="block">
        <WriteInfographicPending
          pendingId={pendingId}
          kind={widgetOverrides?.infographic?.kind ?? 'infographic'}
          state={widgetOverrides?.infographic?.state ?? 'active'}
        />
      </span>
    )
  }

  if (imageSrc && isHtmlEmbedSrc(imageSrc)) {
    return (
      <span className="block">
        <WriteHtmlEmbed
          rawSrc={imageSrc}
          alt={altText ?? ''}
          visualState={widgetOverrides?.htmlEmbed?.visualState ?? 'cover'}
        />
      </span>
    )
  }

  if (forcedImageState === 'error' || loadError) {
    return (
      <span
        className="write-markdown-preview-image-error"
        title={altText ?? imageSrc ?? 'Image could not be loaded'}
      >
        {altText || imageSrc || 'Image could not be loaded'}
      </span>
    )
  }

  if (!imageSrc || forcedImageState === 'pending') {
    return (
      <span
        className="write-markdown-preview-image-chip"
        title={altText ?? imageSrc}
      >
        {altText || imageSrc || 'Image'}
      </span>
    )
  }

  return (
    <img
      {...props}
      src={imageSrc}
      alt={altText ?? ''}
      onError={() => setLoadError(true)}
    />
  )
}

function WriteMarkdownPreviewContent({
  content,
  isMarkdown = true,
  widgetOverrides,
}: Pick<Props, 'content' | 'isMarkdown' | 'widgetOverrides'>): ReactElement {
  if (!isMarkdown) return plainTextFallback(content)

  const components = {
    code: CodeBlock,
    img: (props) => (
      <WriteMarkdownPreviewImage
        {...(props as ImgHTMLAttributes<HTMLImageElement>)}
        widgetOverrides={widgetOverrides}
      />
    ),
  } as StreamdownProps['components']

  return (
    <div className="write-markdown-preview ds-markdown min-h-full text-ds-ink">
      <Streamdown
        mode="static"
        parseIncompleteMarkdown={false}
        isAnimating={false}
        controls={false}
        animated={false}
        linkSafety={{ enabled: false }}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content}
      </Streamdown>
    </div>
  )
}

export function WriteMarkdownPreview({
  content,
  isMarkdown = true,
  previewErrorMessage = COPY.previewErrorFallback,
  showErrorFallback = false,
  widgetOverrides,
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
      <WriteMarkdownPreviewContent
        content={content}
        isMarkdown={isMarkdown}
        widgetOverrides={widgetOverrides}
      />
    </PreviewErrorBoundary>
  )
}

type PreviewProps = {
  mode: WriteMarkdownPreviewPreviewMode
}

/** Full-page preview shell for ?writeMarkdownPreview URL hooks. */
export function WriteMarkdownPreviewPreview({ mode }: PreviewProps): ReactElement {
  const snapshot = previewContentForMode(mode)

  return (
    <div className="write-markdown-preview-preview">
      <div className="write-markdown-preview-scroll">
        <WriteMarkdownPreview
          content={snapshot.content}
          isMarkdown={snapshot.isMarkdown}
          showErrorFallback={snapshot.showErrorFallback}
          widgetOverrides={snapshot.widgetOverrides}
        />
      </div>
    </div>
  )
}
