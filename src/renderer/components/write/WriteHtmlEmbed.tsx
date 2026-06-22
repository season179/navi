// HTML prototype embed card echoing Kun's html-embed-dom.ts
// (../Kun/src/renderer/src/write/html-embed-dom.ts).
// Visual only: cover card and mock loaded frame instead of live webview IPC.

import { useState, type ReactElement } from 'react'

export type WriteHtmlEmbedVisualState = 'cover' | 'loaded' | 'error' | 'missing'
export type WriteHtmlEmbedPreviewMode = 'default' | 'loaded' | 'error' | 'missing'

const COPY = {
  defaultAlt: 'Interactive prototype',
  run: 'Run prototype',
  reload: 'Reload',
  openExternal: 'Open in browser',
  loadFailed: 'The prototype failed to load — try opening it in the browser.',
  missing: 'The prototype file could not be located — check the link path.',
}

const PREVIEW_RAW_SRC = '../../proto/launch-mockup.html'
const PREVIEW_ALT = 'Launch flow prototype'

function fileNameFromSrc(rawSrc: string): string {
  const normalized = rawSrc.replaceAll('\\', '/').trim()
  const parts = normalized.split('/').filter(Boolean)
  return parts[parts.length - 1] || normalized
}

type Props = {
  rawSrc?: string
  alt?: string
  visualState?: WriteHtmlEmbedVisualState
  errorMessage?: string
}

export function WriteHtmlEmbed({
  rawSrc = PREVIEW_RAW_SRC,
  alt = PREVIEW_ALT,
  visualState = 'cover',
  errorMessage,
}: Props): ReactElement {
  const title = alt.trim() || COPY.defaultAlt
  const fileName = fileNameFromSrc(rawSrc)
  const statusMessage =
    errorMessage ??
    (visualState === 'missing' ? COPY.missing : visualState === 'error' ? COPY.loadFailed : '')
  const showReload = visualState === 'loaded'
  const showCover = visualState === 'cover' || visualState === 'error'

  return (
    <span className="write-html-embed" contentEditable={false} data-raw-src={rawSrc}>
      <span className="write-html-embed-header">
        <span className="write-html-embed-title">{title}</span>
        <span className="write-html-embed-file">{fileName}</span>
        <span className="write-html-embed-actions">
          <button
            type="button"
            className="write-html-embed-action"
            hidden={!showReload}
          >
            {COPY.reload}
          </button>
          <button type="button" className="write-html-embed-action">
            {COPY.openExternal}
          </button>
        </span>
      </span>
      <span className="write-html-embed-body">
        {showCover ? (
          <button type="button" className="write-html-embed-cover">
            <span className="write-html-embed-cover-icon" aria-hidden="true">
              ▶
            </span>
            <span className="write-html-embed-cover-label">{COPY.run}</span>
          </button>
        ) : visualState === 'loaded' ? (
          <span className="write-html-embed-webview write-html-embed-webview-mock" aria-hidden="true">
            <span className="write-html-embed-webview-mock-bar" />
            <span className="write-html-embed-webview-mock-line write-html-embed-webview-mock-line--wide" />
            <span className="write-html-embed-webview-mock-line" />
            <span className="write-html-embed-webview-mock-line write-html-embed-webview-mock-line--short" />
            <span className="write-html-embed-webview-mock-card" />
          </span>
        ) : null}
      </span>
      {statusMessage ? (
        <span className="write-html-embed-status" data-tone="error">
          {statusMessage}
        </span>
      ) : null}
    </span>
  )
}

function previewSnapshot(mode: WriteHtmlEmbedPreviewMode): {
  visualState: WriteHtmlEmbedVisualState
  interactive: boolean
} {
  if (mode === 'loaded') return { visualState: 'loaded', interactive: false }
  if (mode === 'error') return { visualState: 'error', interactive: false }
  if (mode === 'missing') return { visualState: 'missing', interactive: false }
  return { visualState: 'cover', interactive: true }
}

type PreviewProps = {
  mode?: WriteHtmlEmbedPreviewMode
}

function InteractiveWriteHtmlEmbed(): ReactElement {
  const [visualState, setVisualState] = useState<WriteHtmlEmbedVisualState>('cover')

  if (visualState === 'cover') {
    return (
      <span className="write-html-embed" contentEditable={false} data-raw-src={PREVIEW_RAW_SRC}>
        <span className="write-html-embed-header">
          <span className="write-html-embed-title">{PREVIEW_ALT}</span>
          <span className="write-html-embed-file">{fileNameFromSrc(PREVIEW_RAW_SRC)}</span>
          <span className="write-html-embed-actions">
            <button type="button" className="write-html-embed-action" hidden>
              {COPY.reload}
            </button>
            <button type="button" className="write-html-embed-action">
              {COPY.openExternal}
            </button>
          </span>
        </span>
        <span className="write-html-embed-body">
          <button
            type="button"
            className="write-html-embed-cover"
            onClick={() => setVisualState('loaded')}
          >
            <span className="write-html-embed-cover-icon" aria-hidden="true">
              ▶
            </span>
            <span className="write-html-embed-cover-label">{COPY.run}</span>
          </button>
        </span>
      </span>
    )
  }

  return (
    <WriteHtmlEmbed
      rawSrc={PREVIEW_RAW_SRC}
      alt={PREVIEW_ALT}
      visualState={visualState}
    />
  )
}

/** Full-page preview shell for ?writeHtmlEmbed URL hooks. */
export function WriteHtmlEmbedPreview({
  mode = 'default',
}: PreviewProps): ReactElement {
  const snapshot = previewSnapshot(mode)

  return (
    <div className="write-html-embed-preview">
      <div className="write-html-embed-preview-scroll">
        <div className="write-markdown-preview ds-markdown min-h-full text-ds-ink">
          <h2>HTML prototype embed</h2>
          <p>
            Kun renders generated HTML prototypes as an inline embed card with a cover overlay.
            Clicking <strong>Run prototype</strong> mounts a webview after main-process authorization.
          </p>
          {snapshot.interactive ? (
            <InteractiveWriteHtmlEmbed />
          ) : (
            <WriteHtmlEmbed visualState={snapshot.visualState} />
          )}
          <p>The embed replaces markdown image syntax pointing at local <code>.html</code> files.</p>
        </div>
      </div>
    </div>
  )
}
