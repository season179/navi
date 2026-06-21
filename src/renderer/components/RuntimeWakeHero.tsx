// Runtime wake / offline hero echoing Kun's RuntimeWakeHero
// (../Kun/src/renderer/src/components/chat/message-timeline-empty.tsx).
// Visual only: parent supplies optional runtime error text and action callbacks.

import type { ReactElement } from 'react'
import { RefreshCw, Settings } from 'lucide-react'
import { RuntimeWakeStage } from './RuntimeWakeStage'

type Props = {
  runtimeError?: string | null
  /** When set, overrides the default waking=!hasError behavior. */
  waking?: boolean
  onRetry?: () => void
  onOpenSettings?: () => void
}

/** Sample error for ?runtimeWakeHero=error visual verification. */
export const RUNTIME_WAKE_HERO_PREVIEW_ERROR =
  'Port 4317 is already in use by another process.'

export function RuntimeWakeHero({
  runtimeError,
  waking: wakingProp,
  onRetry,
  onOpenSettings,
}: Props): ReactElement {
  const trimmedError = runtimeError?.trim() ?? ''
  const hasError = trimmedError.length > 0
  const waking = wakingProp ?? !hasError
  const title = hasError
    ? 'Cannot connect to the local runtime'
    : 'Navi is waking the local agent'
  const detail = hasError
    ? trimmedError
    : 'The workbench is bringing Navi back into this window. When the local service is ready, sessions and the composer resume here.'

  return (
    <div className="runtime-wake-hero">
      <RuntimeWakeStage waking={waking} />

      <p className="runtime-wake-hero-kicker">GUI agent core</p>
      <h1 className="runtime-wake-hero-title">{title}</h1>
      <p className="runtime-wake-hero-detail">{detail}</p>
      <div className="runtime-wake-hero-actions">
        <button
          type="button"
          className="runtime-wake-hero-chip"
          onClick={onRetry}
        >
          <RefreshCw className="runtime-wake-hero-chip-icon" strokeWidth={1.8} />
          Retry
        </button>
        <button
          type="button"
          className="runtime-wake-hero-chip runtime-wake-hero-chip-muted"
          onClick={onOpenSettings}
        >
          <Settings className="runtime-wake-hero-chip-icon" strokeWidth={1.8} />
          Open settings
        </button>
      </div>
    </div>
  )
}
