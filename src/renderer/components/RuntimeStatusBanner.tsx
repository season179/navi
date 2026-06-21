// Slim runtime supervisor status banner echoing Kun's RuntimeStatusBanner
// (../Kun/src/renderer/src/components/RuntimeStatusBanner.tsx).
// Visual only: parent supplies status snapshots and optional dismiss callbacks.

import { useState, type ReactElement } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'

export type RuntimeStatusSnapshot = {
  state: 'restarting' | 'crashed' | 'running'
  rolledBack?: boolean
  attempt?: number
  maxAttempts?: number
  message?: string
  at: string
}

type Props = {
  status: RuntimeStatusSnapshot
  onDismiss?: () => void
}

/** Sample snapshots for ?runtimeStatusBanner preview hooks. */
export const RUNTIME_STATUS_BANNER_PREVIEW = {
  restarting: {
    state: 'restarting',
    at: 'preview-restarting',
  },
  restartingAttempt: {
    state: 'restarting',
    attempt: 2,
    maxAttempts: 3,
    at: 'preview-restarting-attempt',
  },
  crashed: {
    state: 'crashed',
    message: 'Runtime exited unexpectedly. Attempting recovery…',
    at: 'preview-crashed',
  },
  rolledBack: {
    state: 'running',
    rolledBack: true,
    message: 'Settings were rolled back to the last known-good configuration.',
    at: 'preview-rolled-back',
  },
} satisfies Record<string, RuntimeStatusSnapshot>

export type RuntimeStatusBannerPreviewMode = keyof typeof RUNTIME_STATUS_BANNER_PREVIEW

function statusLabel(status: RuntimeStatusSnapshot): string {
  const recoveredWithRollback = status.state === 'running' && status.rolledBack === true
  if (recoveredWithRollback) {
    return 'Runtime recovered after rolling back recent settings changes.'
  }
  if (status.state === 'restarting') {
    if (typeof status.attempt === 'number') {
      const max = status.maxAttempts ?? 3
      return `Restarting runtime (attempt ${status.attempt} of ${max})…`
    }
    return 'Restarting runtime…'
  }
  return 'Runtime crashed. Attempting recovery…'
}

export function RuntimeStatusBanner({ status, onDismiss }: Props): ReactElement {
  const [dismissedAt, setDismissedAt] = useState<string | null>(null)
  const recoveredWithRollback = status.state === 'running' && status.rolledBack === true
  const transient = status.state === 'restarting' || status.state === 'crashed'
  const label = status.message?.trim() || statusLabel(status)

  if (!transient && !recoveredWithRollback) {
    return <></>
  }
  if (dismissedAt === status.at) {
    return <></>
  }

  const handleDismiss = (): void => {
    setDismissedAt(status.at)
    onDismiss?.()
  }

  return (
    <div className="runtime-status-banner">
      <div className="runtime-status-banner-inner">
        {recoveredWithRollback ? (
          <AlertTriangle className="runtime-status-banner-icon" strokeWidth={2} />
        ) : (
          <Loader2 className="runtime-status-banner-icon runtime-status-banner-icon-spin" strokeWidth={2} />
        )}
        <p className="runtime-status-banner-label" title={label}>
          {label}
        </p>
        {recoveredWithRollback ? (
          <button
            type="button"
            aria-label="Dismiss status banner"
            className="runtime-status-banner-dismiss"
            onClick={handleDismiss}
          >
            <X className="runtime-status-banner-dismiss-icon" strokeWidth={2} />
          </button>
        ) : null}
      </div>
    </div>
  )
}
