// Runtime wake / offline hero echoing Kun's RuntimeWakeHero
// (../Kun/src/renderer/src/components/chat/message-timeline-empty.tsx).
// Visual only: parent supplies optional runtime error text and action callbacks.

import type { ReactElement } from 'react'
import { RefreshCw, Settings } from 'lucide-react'
import {
  RUNTIME_WAKE_HERO_KICKER,
  RUNTIME_WAKE_HERO_OPEN_SETTINGS_LABEL,
  RUNTIME_WAKE_HERO_RETRY_LABEL,
  resolveRuntimeWakeHeroDetail,
  resolveRuntimeWakeHeroTitle,
  resolveRuntimeWakeHeroWaking,
} from '../lib/runtimeWakeHero'
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
  const waking = wakingProp ?? resolveRuntimeWakeHeroWaking(runtimeError)
  const title = resolveRuntimeWakeHeroTitle(runtimeError)
  const detail = resolveRuntimeWakeHeroDetail(runtimeError)

  return (
    <div className="runtime-wake-hero">
      <RuntimeWakeStage waking={waking} />

      <p className="runtime-wake-hero-kicker">{RUNTIME_WAKE_HERO_KICKER}</p>
      <h1 className="runtime-wake-hero-title">{title}</h1>
      <p className="runtime-wake-hero-detail">{detail}</p>
      <div className="runtime-wake-hero-actions">
        <button
          type="button"
          className="runtime-wake-hero-chip"
          onClick={onRetry}
        >
          <RefreshCw className="runtime-wake-hero-chip-icon" strokeWidth={1.8} />
          {RUNTIME_WAKE_HERO_RETRY_LABEL}
        </button>
        <button
          type="button"
          className="runtime-wake-hero-chip runtime-wake-hero-chip-muted"
          onClick={onOpenSettings}
        >
          <Settings className="runtime-wake-hero-chip-icon" strokeWidth={1.8} />
          {RUNTIME_WAKE_HERO_OPEN_SETTINGS_LABEL}
        </button>
      </div>
    </div>
  )
}
