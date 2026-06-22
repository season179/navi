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
import {
  DEV_BROWSER_ADDRESS_PLACEHOLDER,
  DEV_BROWSER_AUTO_FOLLOW_LABEL,
  DEV_BROWSER_BACK_LABEL,
  DEV_BROWSER_CLOSE_TAB_LABEL,
  DEV_BROWSER_EMPTY_SUBTITLE,
  DEV_BROWSER_EMPTY_TITLE,
  DEV_BROWSER_FORWARD_LABEL,
  DEV_BROWSER_NEW_TAB_LABEL,
  DEV_BROWSER_OPEN_EXTERNAL_LABEL,
  DEV_BROWSER_OPEN_LABEL,
  DEV_BROWSER_PANEL_COLLAPSE_LABEL,
  DEV_BROWSER_RELOAD_LABEL,
  DEV_BROWSER_RESET_LABEL,
  DEV_BROWSER_SHOW_ALL_LABEL,
} from '../../lib/devBrowserPanel'

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

/** navi preview-only placeholder — Kun renders a real webview instead. */
const DEV_BROWSER_PREVIEW_PLACEHOLDER = 'Dev preview'

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
    : DEV_BROWSER_NEW_TAB_LABEL
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
              aria-label={DEV_BROWSER_CLOSE_TAB_LABEL}
              title={DEV_BROWSER_CLOSE_TAB_LABEL}
            >
              <X className="dev-browser-panel-tab-close-icon" strokeWidth={1.85} />
            </button>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="dev-browser-panel-new-tab-btn"
            aria-label={DEV_BROWSER_NEW_TAB_LABEL}
            title={DEV_BROWSER_NEW_TAB_LABEL}
          >
            <Plus className="dev-browser-panel-new-tab-icon" strokeWidth={1.8} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dev-browser-panel-toolbar">
          <button
            type="button"
            onClick={onCollapse}
            className="ds-sidebar-toggle-button dev-browser-panel-collapse-btn"
            aria-label={DEV_BROWSER_PANEL_COLLAPSE_LABEL}
            title={DEV_BROWSER_PANEL_COLLAPSE_LABEL}
          >
            <PanelRightClose className="dev-browser-panel-collapse-icon" strokeWidth={1.85} />
          </button>

          <div className="dev-browser-panel-nav-group">
            <button
              type="button"
              onClick={onGoBack}
              disabled={!canGoBack}
              className="dev-browser-panel-nav-btn"
              aria-label={DEV_BROWSER_BACK_LABEL}
              title={DEV_BROWSER_BACK_LABEL}
            >
              <ArrowLeft className="dev-browser-panel-nav-icon" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={onGoForward}
              disabled={!canGoForward}
              className="dev-browser-panel-nav-btn"
              aria-label={DEV_BROWSER_FORWARD_LABEL}
              title={DEV_BROWSER_FORWARD_LABEL}
            >
              <ArrowRight className="dev-browser-panel-nav-icon" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={onReload}
              disabled={!activeUrl}
              className="dev-browser-panel-nav-btn"
              aria-label={DEV_BROWSER_RELOAD_LABEL}
              title={DEV_BROWSER_RELOAD_LABEL}
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
              placeholder={DEV_BROWSER_ADDRESS_PLACEHOLDER}
              spellCheck={false}
            />
          </div>

          <div className="dev-browser-panel-actions">
            <button
              type="submit"
              className="dev-browser-panel-action-btn"
              aria-label={DEV_BROWSER_OPEN_LABEL}
              title={DEV_BROWSER_OPEN_LABEL}
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
              aria-label={DEV_BROWSER_AUTO_FOLLOW_LABEL}
              aria-pressed={autoFollow}
              title={DEV_BROWSER_AUTO_FOLLOW_LABEL}
            >
              <Sparkles className="dev-browser-panel-action-icon" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={onReset}
              className="dev-browser-panel-action-btn"
              aria-label={DEV_BROWSER_RESET_LABEL}
              title={DEV_BROWSER_RESET_LABEL}
            >
              <Plus className="dev-browser-panel-action-icon" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={onOpenExternal}
              disabled={!activeUrl}
              className="dev-browser-panel-action-btn"
              aria-label={DEV_BROWSER_OPEN_EXTERNAL_LABEL}
              title={DEV_BROWSER_OPEN_EXTERNAL_LABEL}
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
            <div className="dev-browser-panel-empty-title">{DEV_BROWSER_EMPTY_TITLE}</div>
            <div className="dev-browser-panel-empty-subtitle">{DEV_BROWSER_EMPTY_SUBTITLE}</div>
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
              {DEV_BROWSER_SHOW_ALL_LABEL}
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
                  <div className="dev-browser-panel-preview-kicker">{DEV_BROWSER_PREVIEW_PLACEHOLDER}</div>
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
