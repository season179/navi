// Right-side dev browser panel echoing Kun's DevBrowserPanel
// (../Kun/src/renderer/src/components/DevBrowserPanel.tsx).
// Visual only: parent supplies preview snapshots and optional callbacks.

import { type FormEvent, type ReactElement } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Globe2,
  Loader2,
  PanelRightClose,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  X,
} from 'lucide-react'

export type DevBrowserPreviewMode = 'default' | 'empty' | 'loading' | 'error'

type Props = {
  activeUrl?: string | null
  draftUrl?: string
  pageTitle?: string
  loading?: boolean
  loadError?: string | null
  autoFollow?: boolean
  canGoBack?: boolean
  canGoForward?: boolean
  detectedUrls?: string[]
  className?: string
  onCollapse?: () => void
  onDraftUrlChange?: (value: string) => void
  onSubmitUrl?: (value: string) => void
  onGoBack?: () => void
  onGoForward?: () => void
  onReload?: () => void
  onReset?: () => void
  onToggleAutoFollow?: () => void
  onOpenExternal?: () => void
  onSelectDetectedUrl?: (url: string) => void
}

const COPY = {
  rightPanelCollapse: 'Collapse panel',
  browserNewTab: 'New tab',
  browserCloseTab: 'Close preview',
  browserBack: 'Back',
  browserForward: 'Forward',
  browserReload: 'Reload',
  browserAddressPlaceholder: 'Enter URL',
  browserOpen: 'Open',
  browserAutoFollow: 'Follow local URLs from this thread',
  browserReset: 'New blank tab',
  browserOpenExternal: 'Open in browser',
  browserEmptyTitle: 'No local servers online',
  browserEmptySubtitle: 'Offline local servers are hidden',
  browserShowAll: 'Show all',
  browserLoadFailed: 'Page failed to load',
  browserPreviewPlaceholder: 'Dev preview',
}

const PREVIEW_URL = 'http://localhost:5173'
const PREVIEW_DETECTED_URLS = ['http://localhost:5173', 'http://127.0.0.1:3000']

function formatDevPreviewUrlLabel(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

function formatAddressInput(url: string): string {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname === '/' ? '' : parsed.pathname
    return `${parsed.host}${path}${parsed.search}${parsed.hash}`
  } catch {
    return url
  }
}

/** Default snapshot for ?devBrowserPanelPreview=1 visual verification. */
export type DevBrowserPanelPreviewState = {
  activeUrl: string | null
  draftUrl: string
  pageTitle: string
  loading: boolean
  loadError: string | null
  autoFollow: boolean
  canGoBack: boolean
  canGoForward: boolean
  detectedUrls: string[]
}

/** Default snapshot for ?devBrowserPanelPreview=1 visual verification. */
export const DEV_BROWSER_PANEL_PREVIEW: DevBrowserPanelPreviewState = {
  activeUrl: PREVIEW_URL,
  draftUrl: formatAddressInput(PREVIEW_URL),
  pageTitle: 'Vite + React',
  loading: false,
  loadError: null as string | null,
  autoFollow: true,
  canGoBack: false,
  canGoForward: false,
  detectedUrls: PREVIEW_DETECTED_URLS,
}

export function DevBrowserPanel({
  activeUrl = null,
  draftUrl = '',
  pageTitle = '',
  loading = false,
  loadError = null,
  autoFollow = false,
  canGoBack = false,
  canGoForward = false,
  detectedUrls = [],
  className = '',
  onCollapse,
  onDraftUrlChange,
  onSubmitUrl,
  onGoBack,
  onGoForward,
  onReload,
  onReset,
  onToggleAutoFollow,
  onOpenExternal,
  onSelectDetectedUrl,
}: Props): ReactElement {
  const tabLabel = activeUrl
    ? pageTitle || formatDevPreviewUrlLabel(activeUrl)
    : COPY.browserNewTab
  const primaryDetectedUrl = detectedUrls[0] ?? null

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    onSubmitUrl?.(draftUrl)
  }

  return (
    <aside className={`dev-browser-panel ${className}`.trim()}>
      <div className="dev-browser-panel-header">
        <div className="dev-browser-panel-tab-row">
          <div className="dev-browser-panel-tab">
            <Globe2 className="dev-browser-panel-tab-icon" strokeWidth={1.75} />
            <span className="dev-browser-panel-tab-label">{tabLabel}</span>
            <button
              type="button"
              onClick={onCollapse}
              className="dev-browser-panel-tab-close"
              aria-label={COPY.browserCloseTab}
              title={COPY.browserCloseTab}
            >
              <X className="dev-browser-panel-tab-close-icon" strokeWidth={1.85} />
            </button>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="dev-browser-panel-new-tab-btn"
            aria-label={COPY.browserNewTab}
            title={COPY.browserNewTab}
          >
            <Plus className="dev-browser-panel-new-tab-icon" strokeWidth={1.8} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dev-browser-panel-toolbar">
          <button
            type="button"
            onClick={onCollapse}
            className="ds-sidebar-toggle-button dev-browser-panel-collapse-btn"
            aria-label={COPY.rightPanelCollapse}
            title={COPY.rightPanelCollapse}
          >
            <PanelRightClose className="dev-browser-panel-collapse-icon" strokeWidth={1.85} />
          </button>

          <div className="dev-browser-panel-nav-group">
            <button
              type="button"
              onClick={onGoBack}
              disabled={!canGoBack}
              className="dev-browser-panel-nav-btn"
              aria-label={COPY.browserBack}
              title={COPY.browserBack}
            >
              <ArrowLeft className="dev-browser-panel-nav-icon" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={onGoForward}
              disabled={!canGoForward}
              className="dev-browser-panel-nav-btn"
              aria-label={COPY.browserForward}
              title={COPY.browserForward}
            >
              <ArrowRight className="dev-browser-panel-nav-icon" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={onReload}
              disabled={!activeUrl}
              className="dev-browser-panel-nav-btn"
              aria-label={COPY.browserReload}
              title={COPY.browserReload}
            >
              {loading ? (
                <Loader2 className="dev-browser-panel-nav-icon dev-browser-panel-nav-icon-spin" strokeWidth={1.8} />
              ) : (
                <RefreshCw className="dev-browser-panel-nav-icon" strokeWidth={1.8} />
              )}
            </button>
          </div>

          <div className="dev-browser-panel-address-wrap">
            <Globe2 className="dev-browser-panel-address-icon" strokeWidth={1.75} />
            <input
              value={draftUrl}
              onChange={(event) => onDraftUrlChange?.(event.target.value)}
              className="dev-browser-panel-address-input"
              placeholder={COPY.browserAddressPlaceholder}
              spellCheck={false}
            />
          </div>

          <div className="dev-browser-panel-actions">
            <button
              type="submit"
              className="dev-browser-panel-action-btn"
              aria-label={COPY.browserOpen}
              title={COPY.browserOpen}
            >
              <Send className="dev-browser-panel-action-icon" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={onToggleAutoFollow}
              className={
                autoFollow
                  ? 'dev-browser-panel-action-btn dev-browser-panel-action-btn-auto is-active'
                  : 'dev-browser-panel-action-btn dev-browser-panel-action-btn-auto'
              }
              aria-label={COPY.browserAutoFollow}
              aria-pressed={autoFollow}
              title={COPY.browserAutoFollow}
            >
              <Sparkles className="dev-browser-panel-action-icon" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={onReset}
              className="dev-browser-panel-action-btn"
              aria-label={COPY.browserReset}
              title={COPY.browserReset}
            >
              <Plus className="dev-browser-panel-action-icon" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={onOpenExternal}
              disabled={!activeUrl}
              className="dev-browser-panel-action-btn"
              aria-label={COPY.browserOpenExternal}
              title={COPY.browserOpenExternal}
            >
              <ExternalLink className="dev-browser-panel-action-icon" strokeWidth={1.8} />
            </button>
          </div>
        </form>

        {pageTitle ? (
          <div className="dev-browser-panel-page-title">{pageTitle}</div>
        ) : null}

        {detectedUrls.length > 0 ? (
          <div className="dev-browser-panel-detected-urls">
            {detectedUrls.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => onSelectDetectedUrl?.(url)}
                className="dev-browser-panel-detected-chip"
                title={url}
              >
                {formatDevPreviewUrlLabel(url)}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {loadError ? (
        <div className="dev-browser-panel-error">{loadError}</div>
      ) : null}

      <div className="dev-browser-panel-body">
        {!activeUrl ? (
          <div className="dev-browser-panel-empty">
            <Globe2 className="dev-browser-panel-empty-icon" strokeWidth={1.45} />
            <div className="dev-browser-panel-empty-title">{COPY.browserEmptyTitle}</div>
            <div className="dev-browser-panel-empty-subtitle">{COPY.browserEmptySubtitle}</div>
            <button
              type="button"
              onClick={() => {
                if (primaryDetectedUrl) {
                  onSelectDetectedUrl?.(primaryDetectedUrl)
                  return
                }
                onToggleAutoFollow?.()
              }}
              className="dev-browser-panel-empty-action"
            >
              {COPY.browserShowAll}
            </button>
          </div>
        ) : (
          <div className="dev-browser-panel-preview-frame">
            <div className="dev-browser-panel-preview-toolbar">
              <span className="dev-browser-panel-preview-dot" />
              <span className="dev-browser-panel-preview-dot" />
              <span className="dev-browser-panel-preview-dot" />
              <span className="dev-browser-panel-preview-url">{formatAddressInput(activeUrl)}</span>
            </div>
            <div className="dev-browser-panel-preview-content">
              {loading ? (
                <Loader2 className="dev-browser-panel-preview-spinner" strokeWidth={1.6} />
              ) : (
                <>
                  <div className="dev-browser-panel-preview-kicker">{COPY.browserPreviewPlaceholder}</div>
                  <div className="dev-browser-panel-preview-host">
                    {formatDevPreviewUrlLabel(activeUrl)}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
