// Plain DOM factory for CodeMirror live preview echoing Kun's html-embed-dom.ts.
// Visual only: cover card without webview IPC.

export type HtmlEmbedContext = {
  rawSrc: string
  alt: string
}

const COPY = {
  defaultAlt: 'Interactive prototype',
  run: 'Run prototype',
  reload: 'Reload',
  openExternal: 'Open in browser',
}

function fileNameFromSrc(rawSrc: string): string {
  const normalized = rawSrc.replaceAll('\\', '/').trim()
  const parts = normalized.split('/').filter(Boolean)
  return parts[parts.length - 1] || normalized
}

/** Build the Kun-matching HTML prototype embed cover card for CodeMirror widgets. */
export function createHtmlEmbedElement(context: HtmlEmbedContext): HTMLElement {
  const root = document.createElement('span')
  root.className = 'write-html-embed'
  root.contentEditable = 'false'
  root.dataset.rawSrc = context.rawSrc

  const header = document.createElement('span')
  header.className = 'write-html-embed-header'

  const title = document.createElement('span')
  title.className = 'write-html-embed-title'
  title.textContent = context.alt.trim() || COPY.defaultAlt

  const fileName = document.createElement('span')
  fileName.className = 'write-html-embed-file'
  fileName.textContent = fileNameFromSrc(context.rawSrc)

  const actions = document.createElement('span')
  actions.className = 'write-html-embed-actions'

  const reloadButton = document.createElement('button')
  reloadButton.type = 'button'
  reloadButton.className = 'write-html-embed-action'
  reloadButton.textContent = COPY.reload
  reloadButton.hidden = true

  const openButton = document.createElement('button')
  openButton.type = 'button'
  openButton.className = 'write-html-embed-action'
  openButton.textContent = COPY.openExternal

  actions.append(reloadButton, openButton)
  header.append(title, fileName, actions)

  const body = document.createElement('span')
  body.className = 'write-html-embed-body'

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
  body.appendChild(cover)

  const status = document.createElement('span')
  status.className = 'write-html-embed-status'

  root.append(header, body, status)
  return root
}
