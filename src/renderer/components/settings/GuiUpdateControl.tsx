// Settings GUI update control echoing Kun's GuiUpdateControl
// (../Kun/src/renderer/src/components/settings-gui-update.tsx).
// Visual only: parent supplies update snapshots and optional action callbacks.

import type { ReactElement } from 'react'
import { AlertCircle, CheckCircle2, Download, Loader2, RefreshCw } from 'lucide-react'
import {
  formatGuiUpdateAvailable,
  formatGuiUpdateAvailableManual,
  formatGuiUpdateCurrent,
  formatGuiUpdateDownloaded,
  formatGuiUpdateDownloading,
  formatGuiUpdateDownloadProgress,
  GUI_UPDATE_CHECK,
  GUI_UPDATE_CHECK_FAILED,
  GUI_UPDATE_CHECKING,
  GUI_UPDATE_DOWNLOAD,
  GUI_UPDATE_DOWNLOADED_DESC,
  GUI_UPDATE_ERR_NOT_CONFIGURED,
  GUI_UPDATE_INSTALL,
  GUI_UPDATE_INSTALLING,
  GUI_UPDATE_NOT_CONFIGURED_TITLE,
  GUI_UPDATE_OPEN_RELEASE,
} from '../../lib/updatesSettingsSection'

export type GuiUpdateProgress = {
  total: number
  delta: number
  transferred: number
  percent: number
  bytesPerSecond: number
}

export type GuiUpdateInfo =
  | {
      ok: true
      currentVersion: string
      latestVersion: string
      hasUpdate: boolean
      releaseUrl: string
      releaseDate?: string
      manualOnly?: boolean
      downloaded?: boolean
    }
  | {
      ok: false
      currentVersion: string
      message: string
      code?: 'not_configured' | string
      releaseUrl?: string
    }

type Props = {
  info: GuiUpdateInfo | null
  checking: boolean
  downloading: boolean
  installing: boolean
  downloaded: boolean
  progress: GuiUpdateProgress | null
  error: string | null
  onCheck: () => Promise<void>
  onDownload: () => Promise<void>
  onInstall: () => Promise<void>
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  const fractionDigits = value >= 10 || unitIndex === 0 ? 0 : 1
  return `${value.toFixed(fractionDigits)} ${units[unitIndex]}`
}

type PanelTone = 'neutral' | 'good' | 'warn' | 'error'

function resolvePanelState(input: {
  info: GuiUpdateInfo | null
  checking: boolean
  downloading: boolean
  installing: boolean
  downloaded: boolean
  progress: GuiUpdateProgress | null
  error: string | null
}): { title: string; detail: string | null; tone: PanelTone } {
  const { info, checking, downloading, installing, downloaded, progress, error } = input

  if (downloading) {
    return {
      title: formatGuiUpdateDownloading(Math.max(0, Math.round(progress?.percent ?? 0))),
      detail: progress
        ? formatGuiUpdateDownloadProgress(
            formatBytes(progress.transferred),
            formatBytes(progress.total),
            formatBytes(progress.bytesPerSecond),
          )
        : null,
      tone: 'warn',
    }
  }
  if (installing) {
    return { title: GUI_UPDATE_INSTALLING, detail: null, tone: 'warn' }
  }
  if (downloaded && info?.ok) {
    return {
      title: formatGuiUpdateDownloaded(info.latestVersion),
      detail: GUI_UPDATE_DOWNLOADED_DESC,
      tone: 'warn',
    }
  }
  if (checking && !info) {
    return { title: GUI_UPDATE_CHECKING, detail: null, tone: 'neutral' }
  }
  if (error) {
    return { title: GUI_UPDATE_CHECK_FAILED, detail: error, tone: 'error' }
  }
  if (info && !info.ok && info.code === 'not_configured') {
    return {
      title: GUI_UPDATE_NOT_CONFIGURED_TITLE,
      detail: GUI_UPDATE_ERR_NOT_CONFIGURED,
      tone: 'warn',
    }
  }
  if (info?.ok && info.hasUpdate) {
    return {
      title: info.manualOnly
        ? formatGuiUpdateAvailableManual(info.currentVersion, info.latestVersion)
        : formatGuiUpdateAvailable(info.currentVersion, info.latestVersion),
      detail: null,
      tone: 'warn',
    }
  }
  if (info?.ok) {
    return {
      title: formatGuiUpdateCurrent(info.currentVersion),
      detail: null,
      tone: 'good',
    }
  }
  return { title: '', detail: null, tone: 'neutral' }
}

export function GuiUpdateControl({
  info,
  checking,
  downloading,
  installing,
  downloaded,
  progress,
  error,
  onCheck,
  onDownload,
  onInstall,
}: Props): ReactElement {
  const busy = checking || downloading || installing
  const { title, detail, tone } = resolvePanelState({
    info,
    checking,
    downloading,
    installing,
    downloaded,
    progress,
    error,
  })

  const releaseUrl: string | null =
    info?.ok && info.hasUpdate
      ? info.releaseUrl
      : !info?.ok && info?.releaseUrl
        ? info.releaseUrl
        : null
  const canDownload = Boolean(info?.ok && info.hasUpdate && !info.manualOnly && !downloaded)
  const canInstall = Boolean(info?.ok && downloaded)

  return (
    <div className="gui-update-control">
      <div className={`gui-update-control-panel is-${tone}`}>
        <div className="gui-update-control-panel-row">
          {busy ? (
            <Loader2 className="gui-update-control-panel-icon is-spin" strokeWidth={2} />
          ) : error ? (
            <AlertCircle className="gui-update-control-panel-icon" strokeWidth={1.75} />
          ) : (
            <CheckCircle2 className="gui-update-control-panel-icon" strokeWidth={1.75} />
          )}
          <div className="gui-update-control-panel-copy">
            <div className="gui-update-control-panel-title">{title}</div>
            {detail ? <div className="gui-update-control-panel-detail">{detail}</div> : null}
          </div>
        </div>
      </div>
      <div className="gui-update-control-actions">
        <button
          type="button"
          onClick={() => void onCheck()}
          disabled={busy}
          className="gui-update-control-button"
        >
          <RefreshCw
            className={`gui-update-control-button-icon${checking ? ' is-spin' : ''}`}
            strokeWidth={1.75}
          />
          {GUI_UPDATE_CHECK}
        </button>
        {canDownload || downloading ? (
          <button
            type="button"
            onClick={() => void onDownload()}
            disabled={!canDownload || busy}
            className="gui-update-control-button"
          >
            {downloading ? (
              <Loader2 className="gui-update-control-button-icon is-spin" strokeWidth={2} />
            ) : (
              <Download className="gui-update-control-button-icon" strokeWidth={1.75} />
            )}
            {GUI_UPDATE_DOWNLOAD}
          </button>
        ) : null}
        {canInstall || installing ? (
          <button
            type="button"
            onClick={() => void onInstall()}
            disabled={!canInstall || installing}
            className="gui-update-control-button gui-update-control-button-primary"
          >
            {installing ? (
              <Loader2 className="gui-update-control-button-icon is-spin" strokeWidth={2} />
            ) : (
              <RefreshCw className="gui-update-control-button-icon" strokeWidth={1.75} />
            )}
            {GUI_UPDATE_INSTALL}
          </button>
        ) : null}
        {releaseUrl ? (
          <button
            type="button"
            onClick={() => window.open(releaseUrl, '_blank', 'noopener,noreferrer')}
            className="gui-update-control-button gui-update-control-button-primary"
          >
            {GUI_UPDATE_OPEN_RELEASE}
          </button>
        ) : null}
      </div>
    </div>
  )
}

const PREVIEW_RELEASE_URL = 'https://github.com/example/navi/releases/tag/v0.0.2'

const PREVIEW_INFO_AVAILABLE: GuiUpdateInfo = {
  ok: true,
  currentVersion: '0.0.1',
  latestVersion: '0.0.2',
  hasUpdate: true,
  releaseUrl: PREVIEW_RELEASE_URL,
}

const PREVIEW_INFO_CURRENT: GuiUpdateInfo = {
  ok: true,
  currentVersion: '0.0.2',
  latestVersion: '0.0.2',
  hasUpdate: false,
  releaseUrl: PREVIEW_RELEASE_URL,
}

const PREVIEW_INFO_MANUAL: GuiUpdateInfo = {
  ok: true,
  currentVersion: '0.0.1',
  latestVersion: '0.0.2',
  hasUpdate: true,
  releaseUrl: PREVIEW_RELEASE_URL,
  manualOnly: true,
}

const PREVIEW_INFO_NOT_CONFIGURED: GuiUpdateInfo = {
  ok: false,
  currentVersion: '0.0.1',
  message: GUI_UPDATE_ERR_NOT_CONFIGURED,
  code: 'not_configured',
}

const PREVIEW_PROGRESS: GuiUpdateProgress = {
  total: 52_428_800,
  delta: 65_536,
  transferred: 31_457_280,
  percent: 60,
  bytesPerSecond: 1_572_864,
}

/** Preview prop bundles for ?guiUpdateControlPreview hooks. */
export const GUI_UPDATE_CONTROL_PREVIEW = {
  available: {
    info: PREVIEW_INFO_AVAILABLE,
    checking: false,
    downloading: false,
    installing: false,
    downloaded: false,
    progress: null,
    error: null,
  },
  current: {
    info: PREVIEW_INFO_CURRENT,
    checking: false,
    downloading: false,
    installing: false,
    downloaded: false,
    progress: null,
    error: null,
  },
  checking: {
    info: null,
    checking: true,
    downloading: false,
    installing: false,
    downloaded: false,
    progress: null,
    error: null,
  },
  downloading: {
    info: PREVIEW_INFO_AVAILABLE,
    checking: false,
    downloading: true,
    installing: false,
    downloaded: false,
    progress: PREVIEW_PROGRESS,
    error: null,
  },
  downloaded: {
    info: PREVIEW_INFO_AVAILABLE,
    checking: false,
    downloading: false,
    installing: false,
    downloaded: true,
    progress: null,
    error: null,
  },
  installing: {
    info: PREVIEW_INFO_AVAILABLE,
    checking: false,
    downloading: false,
    installing: true,
    downloaded: true,
    progress: null,
    error: null,
  },
  error: {
    info: null,
    checking: false,
    downloading: false,
    installing: false,
    downloaded: false,
    progress: null,
    error: 'Network request failed while contacting the release server.',
  },
  notConfigured: {
    info: PREVIEW_INFO_NOT_CONFIGURED,
    checking: false,
    downloading: false,
    installing: false,
    downloaded: false,
    progress: null,
    error: null,
  },
  manual: {
    info: PREVIEW_INFO_MANUAL,
    checking: false,
    downloading: false,
    installing: false,
    downloaded: false,
    progress: null,
    error: null,
  },
} satisfies Record<
  string,
  {
    info: GuiUpdateInfo | null
    checking: boolean
    downloading: boolean
    installing: boolean
    downloaded: boolean
    progress: GuiUpdateProgress | null
    error: string | null
  }
>

export type GuiUpdateControlPreviewMode = keyof typeof GUI_UPDATE_CONTROL_PREVIEW
