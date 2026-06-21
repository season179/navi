// Plain DOM factory for CodeMirror live preview echoing Kun's html-embed-dom.ts.
// Visual only: cover card and mock loaded frame instead of live webview IPC.

export type HtmlEmbedContext = {
  rawSrc: string
  alt: string
}

export type HtmlEmbedVisualState = 'cover' | 'loaded' | 'error' | 'missing'

export type HtmlEmbedOptions = {
  visualState?: HtmlEmbedVisualState
  errorMessage?: string
}

const COPY = {
  defaultAlt: 'Interactive prototype',
  run: 'Run prototype',
  reload: 'Reload',
  openExternal: 'Open in browser',
  loadFailed: 'The prototype failed to load — try opening it in the browser.',
  missing: 'The prototype file could not be located — check the link path.',
}

function fileNameFromSrc(rawSrc: string): string {
  const normalized = rawSrc.replaceAll('\\', '/').trim()
  const parts = normalized.split('/').filter(Boolean)
  return parts[parts.length - 1] || normalized
}

function buildMockWebview(): HTMLElement {
  const webview = document.createElement('span')
  webview.className = 'write-html-embed-webview write-html-embed-webview-mock'
  webview.setAttribute('aria-hidden', 'true')

  const bar = document.createElement('span')
  bar.className = 'write-html-embed-webview-mock-bar'
  webview.appendChild(bar)

  const lineWide = document.createElement('span')
  lineWide.className =
    'write-html-embed-webview-mock-line write-html-embed-webview-mock-line--wide'
  webview.appendChild(lineWide)

  const line = document.createElement('span')
  line.className = 'write-html-embed-webview-mock-line'
  webview.appendChild(line)

  const lineShort = document.createElement('span')
  lineShort.className =
    'write-html-embed-webview-mock-line write-html-embed-webview-mock-line--short'
  webview.appendChild(lineShort)

  const card = document.createElement('span')
  card.className = 'write-html-embed-webview-mock-card'
  webview.appendChild(card)

  return webview
}

function buildCover(): HTMLElement {
  const cover = document.createElement('button')
  cover.type = 'button'
  cover.className = 'write-html-embed-cover'

  const icon = document.createElement('span')
  icon.className = 'write-html-embed-cover-icon'
  icon.textContent = '▶'

  const label = document.createElement('span')
  label.className = 'write-html-embed-cover-label'
  label.textContent = COPY.run

  cover.append(icon, label)
  return cover
}

/** Build the Kun-matching HTML prototype embed card for CodeMirror widgets. */
export function createHtmlEmbedElement(
  context: HtmlEmbedContext,
  options?: HtmlEmbedOptions,
): HTMLElement {
  const visualState = options?.visualState ?? 'cover'
  const title = context.alt.trim() || COPY.defaultAlt
  const fileName = fileNameFromSrc(context.rawSrc)
  const statusMessage =
    options?.errorMessage ??
    (visualState === 'missing'
      ? COPY.missing
      : visualState === 'error'
        ? COPY.loadFailed
        : '')
  const showReload = visualState === 'loaded'
  const showCover = visualState === 'cover' || visualState === 'error'

  const root = document.createElement('span')
  root.className = 'write-html-embed'
  root.contentEditable = 'false'
  root.dataset.rawSrc = context.rawSrc

  const header = document.createElement('span')
  header.className = 'write-html-embed-header'

  const titleEl = document.createElement('span')
  titleEl.className = 'write-html-embed-title'
  titleEl.textContent = title

  const fileNameEl = document.createElement('span')
  fileNameEl.className = 'write-html-embed-file'
  fileNameEl.textContent = fileName

  const actions = document.createElement('span')
  actions.className = 'write-html-embed-actions'

  const reloadButton = document.createElement('button')
  reloadButton.type = 'button'
  reloadButton.className = 'write-html-embed-action'
  reloadButton.textContent = COPY.reload
  reloadButton.hidden = !showReload

  const openButton = document.createElement('button')
  openButton.type = 'button'
  openButton.className = 'write-html-embed-action'
  openButton.textContent = COPY.openExternal

  actions.append(reloadButton, openButton)
  header.append(titleEl, fileNameEl, actions)

  const body = document.createElement('span')
  body.className = 'write-html-embed-body'

  if (showCover) {
    body.appendChild(buildCover())
  } else if (visualState === 'loaded') {
    body.appendChild(buildMockWebview())
  }

  root.append(header, body)

  if (statusMessage) {
    const status = document.createElement('span')
    status.className = 'write-html-embed-status'
    status.dataset.tone = 'error'
    status.textContent = statusMessage
    root.appendChild(status)
  }

  return root
}
