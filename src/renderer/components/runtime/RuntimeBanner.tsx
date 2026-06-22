// Runtime error banner echoing Kun's RuntimeBanner
// (../Kun/src/renderer/src/components/RuntimeBanner.tsx).
// Visual only: parent supplies message snapshots and optional action callbacks.

import { useState, type ReactElement } from 'react'
import { ChevronDown, ChevronRight, Copy, FolderOpen } from 'lucide-react'

export type RuntimeBannerSnapshot = {
  message: string
  detail?: string | null
  code?: string | null
  logPath?: string | null
  runtimeReady?: boolean
  logOpenError?: string | null
}

type Props = {
  snapshot: RuntimeBannerSnapshot
  stageInsetClass?: string
  forceDetailsOpen?: boolean
  forceCopied?: boolean
  onOpenLogDir?: () => Promise<{ ok: boolean; message?: string }>
  onOpenSettings?: () => void
  onRetryConnection?: () => void
}

/** Sample snapshots for ?runtimeBanner preview hooks. */
export const RUNTIME_BANNER_PREVIEW = {
  default: {
    message: 'Runtime request failed.',
    detail: 'Message:\nProvider endpoint returned HTTP 503.',
    code: 'provider_unavailable',
    logPath: '/Users/season/Library/Logs/navi/runtime.log',
    runtimeReady: true,
  },
  expanded: {
    message: 'Runtime request failed.',
    detail: 'Message:\nProvider endpoint returned HTTP 503.',
    code: 'provider_unavailable',
    logPath: '/Users/season/Library/Logs/navi/runtime.log',
    runtimeReady: true,
  },
  offline: {
    message: 'Cannot connect to the local runtime.',
    detail: 'Code: connection_refused\n\nMessage:\nNo process is listening on port 3847.',
    code: 'connection_refused',
    runtimeReady: false,
  },
  logPath: {
    message: 'Runtime exited with a non-zero status.',
    detail: 'Code: runtime_exit\n\nMessage:\nProcess terminated with code 1.',
    code: 'runtime_exit',
    logPath: '/Users/season/Library/Logs/navi/runtime.log',
    runtimeReady: true,
    logOpenError: 'Could not open the log directory.',
  },
} satisfies Record<string, RuntimeBannerSnapshot>

export type RuntimeBannerPreviewMode = keyof typeof RUNTIME_BANNER_PREVIEW

export function RuntimeBanner({
  snapshot,
  stageInsetClass = 'runtime-banner-inset',
  forceDetailsOpen = false,
  forceCopied = false,
  onOpenLogDir,
  onOpenSettings,
  onRetryConnection,
}: Props): ReactElement {
  const [detailsOpen, setDetailsOpen] = useState(forceDetailsOpen)
  const [copied, setCopied] = useState(forceCopied)
  const [logOpenError, setLogOpenError] = useState<string | null>(snapshot.logOpenError ?? null)

  const cleanedLogPath = snapshot.logPath?.trim() ?? ''
  const technicalDetailText = [
    snapshot.code ? `Code: ${snapshot.code}` : '',
    snapshot.detail?.trim() ?? '',
  ]
    .filter(Boolean)
    .join('\n\n')
  const detailText = [
    technicalDetailText,
    cleanedLogPath ? `Log path: ${cleanedLogPath}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
  const hasDetail = technicalDetailText.trim().length > 0
  const runtimeReady = snapshot.runtimeReady ?? true
  const expanded = forceDetailsOpen || detailsOpen

  const copyDetails = async (): Promise<void> => {
    if (!hasDetail || !navigator?.clipboard?.writeText) return
    await navigator.clipboard.writeText(detailText)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  const openLogDir = async (): Promise<void> => {
    if (!onOpenLogDir) return
    setLogOpenError(null)
    try {
      const result = await onOpenLogDir()
      if (!result.ok) setLogOpenError(result.message ?? 'Could not open log directory.')
    } catch (error) {
      setLogOpenError(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <div className="runtime-banner">
      <div className={`runtime-banner-body ${stageInsetClass}`}>
        <div className="runtime-banner-header">
          <p className="runtime-banner-message">{snapshot.message}</p>
          <div className="runtime-banner-actions">
            {hasDetail ? (
              <button
                type="button"
                className="runtime-banner-details-toggle"
                onClick={() => setDetailsOpen((value) => !value)}
              >
                {expanded ? (
                  <ChevronDown className="runtime-banner-details-icon" strokeWidth={2} />
                ) : (
                  <ChevronRight className="runtime-banner-details-icon" strokeWidth={2} />
                )}
                Details
              </button>
            ) : null}
            {!runtimeReady ? (
              <>
                <button
                  type="button"
                  className="runtime-banner-retry-btn"
                  onClick={onRetryConnection}
                >
                  Retry connection
                </button>
                <button
                  type="button"
                  className="runtime-banner-settings-btn"
                  onClick={onOpenSettings}
                >
                  Open settings
                </button>
              </>
            ) : null}
          </div>
        </div>

        {cleanedLogPath ? (
          <div className="runtime-banner-log-row">
            <span className="runtime-banner-log-label">Log path</span>
            <code className="runtime-banner-log-path">{cleanedLogPath}</code>
            {onOpenLogDir ? (
              <button
                type="button"
                className="runtime-banner-log-open-btn"
                onClick={() => void openLogDir()}
              >
                <FolderOpen className="runtime-banner-log-open-icon" strokeWidth={2} />
                Open log directory
              </button>
            ) : null}
            {logOpenError ? (
              <span className="runtime-banner-log-error">{logOpenError}</span>
            ) : null}
          </div>
        ) : null}

        {hasDetail && expanded ? (
          <div className="runtime-banner-details-panel">
            <div className="runtime-banner-details-header">
              <span className="runtime-banner-details-title">Technical details</span>
              <button
                type="button"
                className="runtime-banner-copy-btn"
                onClick={() => void copyDetails()}
              >
                <Copy className="runtime-banner-copy-icon" strokeWidth={2} />
                {copied ? 'Copied' : 'Copy details'}
              </button>
            </div>
            <pre className="runtime-banner-details-pre">{detailText}</pre>
          </div>
        ) : null}
      </div>
    </div>
  )
}
