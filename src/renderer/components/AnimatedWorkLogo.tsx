// Animated work logo, iKun cameos, and turn-celebration layers echoing Kun's
// AnimatedWorkLogo.tsx (../Kun/src/renderer/src/components/chat/AnimatedWorkLogo.tsx).
// Visual only: inline SVG figures stand in for Kun's PNG assets.

import { useEffect, useRef, useState, type ReactElement } from 'react'
import { CompanionBird, GreetingMascot, SitMascot, SleepingMascot } from './Mascot'

export type WorkLogoSwimMode = 'propel' | 'sprint' | 'dive' | 'surf'

export const WORK_LOGO_SWIM_MODES: readonly WorkLogoSwimMode[] = [
  'propel',
  'sprint',
  'dive',
  'surf',
]

const WORK_LOGO_SWIM_MODE_INTERVAL_MS = 4200

export function useWorkLogoSwimMode(active: boolean): WorkLogoSwimMode {
  const [modeIndex, setModeIndex] = useState(() =>
    Math.floor(Math.random() * WORK_LOGO_SWIM_MODES.length),
  )

  useEffect(() => {
    if (!active) return
    const interval = window.setInterval(() => {
      setModeIndex((current) => (current + 1) % WORK_LOGO_SWIM_MODES.length)
    }, WORK_LOGO_SWIM_MODE_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [active])

  return WORK_LOGO_SWIM_MODES[modeIndex] ?? 'propel'
}

export type KunStateFigureKind = 'greet' | 'sleep' | 'sit'

/** Static Kun state figure — greeting, sleeping, or sitting mascot pose. */
export function KunStateFigure({
  kind,
  className = '',
}: {
  kind: KunStateFigureKind
  className?: string
}): ReactElement {
  return (
    <span
      className={['ds-kun-state', `ds-kun-state-${kind}`, className].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      {kind === 'greet' ? (
        <GreetingMascot className="ds-kun-state-figure" />
      ) : kind === 'sleep' ? (
        <SleepingMascot className="ds-kun-state-figure" />
      ) : (
        <SitMascot className="ds-kun-state-figure" />
      )}
      <IkunFigure variant="wave" className="ds-ikun-state-figure" />
    </span>
  )
}

export type IkunCameoType = 'dash' | 'chase' | 'peek' | 'boba' | 'nap'
export type IkunCameoSide = 'left' | 'right'
export type IkunCameoSpec = { id: number; type: IkunCameoType; side: IkunCameoSide }

export const IKUN_CAMEO_TYPES: readonly IkunCameoType[] = ['dash', 'chase', 'peek', 'boba', 'nap']

export const IKUN_CAMEO_DURATIONS_MS: Record<IkunCameoType, number> = {
  dash: 5200,
  chase: 6600,
  peek: 6200,
  boba: 7200,
  nap: 8200,
}

const IKUN_CAMEO_MIN_GAP_MS = 18000
const IKUN_CAMEO_MAX_GAP_MS = 45000
const IKUN_CAMEO_FIRST_GAP_MS = 7000

let ikunCameoSequence = 0

export function pickIkunCameo(): IkunCameoSpec {
  const type = IKUN_CAMEO_TYPES[Math.floor(Math.random() * IKUN_CAMEO_TYPES.length)] ?? 'dash'
  const side: IkunCameoSide = Math.random() < 0.5 ? 'left' : 'right'
  ikunCameoSequence += 1
  return { id: ikunCameoSequence, type, side }
}

type IkunFigureVariant = 'dribble' | 'run' | 'boba' | 'wave' | 'sleep'

function IkunFigure({
  variant,
  className = '',
}: {
  variant: IkunFigureVariant
  className?: string
}): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="12" cy="20" rx="5" ry="1.2" fill="rgba(249,115,22,0.25)" />
      <circle cx="12" cy="9" r="4.5" fill="#f97316" />
      <rect x="9.5" y="12" width="5" height="7" rx="2" fill="#ea580c" />
      {variant === 'run' ? (
        <>
          <path d="M7 16 l-3 2 l3 -1 z" fill="#ea580c" />
          <path d="M17 15 l3 1 l-2 2 z" fill="#ea580c" />
        </>
      ) : null}
      {variant === 'boba' ? (
        <rect x="15" y="13" width="3" height="5" rx="1" fill="#fdba74" opacity="0.9" />
      ) : null}
      {variant === 'wave' ? (
        <path d="M6 11 C4 9 3 7 5 6 C7 7 8 9 7 11 Z" fill="#ea580c" />
      ) : null}
      {variant === 'sleep' ? (
        <>
          <path d="M9 8 q2 2 4 0" stroke="#7c2d12" strokeWidth="0.8" fill="none" />
          <text x="15" y="7" fontSize="3" fill="#ea580c">z</text>
        </>
      ) : null}
      {variant === 'dribble' ? (
        <circle cx="12" cy="19" r="2.2" fill="#f97316" stroke="#ea580c" strokeWidth="0.5" />
      ) : null}
    </svg>
  )
}

function WorkLogoBird({ className = '' }: { className?: string }): ReactElement {
  return <CompanionBird className={className} />
}

function IkunCameoFigure({
  type,
  side,
  second = false,
}: {
  type: Exclude<IkunCameoType, 'chase'>
  side: IkunCameoSide
  second?: boolean
}): ReactElement {
  const variant: IkunFigureVariant =
    type === 'dash' ? 'run' : type === 'peek' ? 'wave' : type === 'boba' ? 'boba' : 'sleep'

  return (
    <span
      className={[
        'ds-ikun-cameo',
        `ds-ikun-cameo-${type}`,
        `is-${side}`,
        second ? 'is-second' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="ds-ikun-cameo-flip">
        <IkunFigure variant={variant} className="ds-ikun-cameo-figure" />
      </span>
    </span>
  )
}

export function IkunCameo({ cameo }: { cameo: Pick<IkunCameoSpec, 'type' | 'side'> }): ReactElement {
  if (cameo.type === 'chase') {
    const otherSide: IkunCameoSide = cameo.side === 'left' ? 'right' : 'left'
    return (
      <>
        <IkunCameoFigure type="dash" side={cameo.side} />
        <IkunCameoFigure type="dash" side={otherSide} second />
      </>
    )
  }
  return <IkunCameoFigure type={cameo.type} side={cameo.side} />
}

export function IkunCameoLayer(): ReactElement {
  const [cameo, setCameo] = useState<IkunCameoSpec | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let timer = 0
    const schedule = (delay: number): void => {
      timer = window.setTimeout(() => {
        const next = pickIkunCameo()
        setCameo(next)
        timer = window.setTimeout(() => {
          setCameo(null)
          schedule(
            IKUN_CAMEO_MIN_GAP_MS + Math.random() * (IKUN_CAMEO_MAX_GAP_MS - IKUN_CAMEO_MIN_GAP_MS),
          )
        }, IKUN_CAMEO_DURATIONS_MS[next.type])
      }, delay)
    }
    schedule(IKUN_CAMEO_FIRST_GAP_MS + Math.random() * 8000)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <span className="ds-ikun-cameo-layer" aria-hidden="true">
      {cameo ? <IkunCameo key={cameo.id} cameo={cameo} /> : null}
    </span>
  )
}

export type KunCelebrationVariant = 'cheer' | 'lap' | 'toast'

export const KUN_CELEBRATION_VARIANTS: readonly KunCelebrationVariant[] = [
  'cheer',
  'lap',
  'toast',
]

export const KUN_CELEBRATION_DURATIONS_MS: Record<KunCelebrationVariant, number> = {
  cheer: 3200,
  lap: 3600,
  toast: 3400,
}

const KUN_CELEBRATION_MIN_TURN_MS = 2000

let kunCelebrationSequence = 0

export function pickKunCelebration(): { id: number; variant: KunCelebrationVariant } {
  const variant =
    KUN_CELEBRATION_VARIANTS[Math.floor(Math.random() * KUN_CELEBRATION_VARIANTS.length)] ??
    'cheer'
  kunCelebrationSequence += 1
  return { id: kunCelebrationSequence, variant }
}

function KunConfettiBurst(): ReactElement {
  return (
    <span className="ds-kun-confetti">
      {Array.from({ length: 10 }, (_, index) => (
        <i key={index} />
      ))}
    </span>
  )
}

export function KunCelebration({ variant }: { variant: KunCelebrationVariant }): ReactElement {
  const ikunVariant: IkunFigureVariant =
    variant === 'cheer' ? 'wave' : variant === 'lap' ? 'run' : 'boba'

  return (
    <span className={`ds-kun-celebration ds-kun-celebration-${variant}`}>
      <span className="ds-kun-celebration-figure-wrap">
        <GreetingMascot className="ds-kun-celebration-figure is-kun" />
        <IkunFigure variant={ikunVariant} className="ds-kun-celebration-figure is-ikun" />
        <KunConfettiBurst />
      </span>
    </span>
  )
}

export function KunCelebrationLayer({
  active,
  suppressed = false,
}: {
  active: boolean
  suppressed?: boolean
}): ReactElement {
  const [celebration, setCelebration] = useState<{
    id: number
    variant: KunCelebrationVariant
  } | null>(null)
  const turnStartRef = useRef<number | null>(null)
  const hideTimerRef = useRef(0)

  useEffect(() => {
    if (active) {
      turnStartRef.current = Date.now()
      return
    }
    if (turnStartRef.current === null) return
    const elapsed = Date.now() - turnStartRef.current
    turnStartRef.current = null
    if (suppressed) return
    if (elapsed < KUN_CELEBRATION_MIN_TURN_MS) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const next = pickKunCelebration()
    setCelebration(next)
    window.clearTimeout(hideTimerRef.current)
    hideTimerRef.current = window.setTimeout(() => {
      setCelebration(null)
    }, KUN_CELEBRATION_DURATIONS_MS[next.variant])
  }, [active, suppressed])

  useEffect(() => () => window.clearTimeout(hideTimerRef.current), [])

  return (
    <span className="ds-kun-celebration-layer" aria-hidden="true">
      {celebration ? <KunCelebration key={celebration.id} variant={celebration.variant} /> : null}
    </span>
  )
}

export type IkunWorkLogoVariant = 'dribble' | 'run' | 'boba'

export const IKUN_WORK_LOGO_VARIANTS: readonly IkunWorkLogoVariant[] = [
  'dribble',
  'run',
  'boba',
]

const IKUN_WORK_LOGO_VARIANT_INTERVAL_MS = 2800

export function pickIkunWorkLogoVariant(current?: IkunWorkLogoVariant): IkunWorkLogoVariant {
  const candidates = IKUN_WORK_LOGO_VARIANTS.filter((variant) => variant !== current)
  const pool = candidates.length > 0 ? candidates : IKUN_WORK_LOGO_VARIANTS
  return pool[Math.floor(Math.random() * pool.length)] ?? 'dribble'
}

export function useIkunWorkLogoVariant(active: boolean): IkunWorkLogoVariant {
  const [variant, setVariant] = useState<IkunWorkLogoVariant>(() => pickIkunWorkLogoVariant())

  useEffect(() => {
    if (!active) return
    const interval = window.setInterval(() => {
      setVariant((current) => pickIkunWorkLogoVariant(current))
    }, IKUN_WORK_LOGO_VARIANT_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [active])

  return variant
}

export function AnimatedWorkLogo({
  active = false,
  className = '',
  ikunVariant,
  mode,
  phase = 'lead',
  size = 'sm',
}: {
  active?: boolean
  className?: string
  ikunVariant?: IkunWorkLogoVariant
  mode?: WorkLogoSwimMode
  phase?: 'lead' | 'trail'
  size?: 'sm' | 'md'
}): ReactElement {
  const rotatedIkunVariant = useIkunWorkLogoVariant(active && ikunVariant === undefined)
  const effectiveIkunVariant = ikunVariant ?? rotatedIkunVariant
  const rotatedSwimMode = useWorkLogoSwimMode(active && mode === undefined)
  const swimMode = mode ?? rotatedSwimMode

  return (
    <span
      className={[
        'ds-work-logo',
        `ds-work-logo-${size}`,
        `ds-work-logo-phase-${phase}`,
        `ds-work-logo-mode-${swimMode}`,
        active ? 'is-active' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <span className="ds-work-logo-gust" />
      <span className="ds-work-logo-current" />
      <span className="ds-work-logo-swell" />
      <span className="ds-work-logo-wave ds-work-logo-wave-back" />
      <span className="ds-work-logo-ripple" />
      <span className="ds-work-logo-wave ds-work-logo-wave-front" />
      <span className="ds-work-logo-breaker" />
      <span className="ds-work-logo-wake" />
      <span className="ds-work-logo-foam" />
      <span className="ds-work-logo-crest" />
      <span className="ds-work-logo-splash" />
      <span className="ds-work-logo-spray" />
      <span className="ds-work-logo-bubbles" />
      <WorkLogoBird className="ds-work-logo-echo" />
      <span
        className={`ds-ikun-logo ds-ikun-logo-${effectiveIkunVariant}`}
        data-ikun-variant={effectiveIkunVariant}
      >
        <span className="ds-ikun-logo-shadow" />
        <IkunFigure variant={effectiveIkunVariant} className="ds-ikun-figure" />
      </span>
      <span className="ds-work-logo-track">
        <span className="ds-work-logo-body">
          <WorkLogoBird className="ds-work-logo-image" />
        </span>
      </span>
    </span>
  )
}

export type AnimatedWorkLogoPreviewMode =
  | 'default'
  | 'active'
  | 'md'
  | 'surf'
  | 'sprint'
  | 'dive'
  | 'ikun'
  | 'ikunMode'

export type IkunCameoPreviewMode = 'default' | 'dash' | 'chase' | 'peek' | 'boba' | 'nap'

export type KunCelebrationPreviewMode = 'cheer' | 'lap' | 'toast' | 'ikunMode'

export function AnimatedWorkLogoPreview({
  mode,
}: {
  mode: AnimatedWorkLogoPreviewMode
}): ReactElement {
  const ikunMode = mode === 'ikunMode'

  return (
    <div
      className="animated-work-logo-preview-wrap"
      {...(ikunMode ? { 'data-ikun-mode': 'on' } : {})}
    >
      <div className="animated-work-logo-preview-grid">
        <div className="animated-work-logo-preview-cell">
          <span className="animated-work-logo-preview-label">Idle sm</span>
          <AnimatedWorkLogo />
        </div>
        <div className="animated-work-logo-preview-cell">
          <span className="animated-work-logo-preview-label">Active sm</span>
          <AnimatedWorkLogo active phase="trail" />
        </div>
        <div className="animated-work-logo-preview-cell">
          <span className="animated-work-logo-preview-label">Active md</span>
          <AnimatedWorkLogo active size="md" phase="trail" />
        </div>
        {mode === 'surf' ? (
          <div className="animated-work-logo-preview-cell">
            <span className="animated-work-logo-preview-label">Surf</span>
            <AnimatedWorkLogo active mode="surf" phase="trail" />
          </div>
        ) : null}
        {mode === 'sprint' ? (
          <div className="animated-work-logo-preview-cell">
            <span className="animated-work-logo-preview-label">Sprint</span>
            <AnimatedWorkLogo active mode="sprint" phase="trail" />
          </div>
        ) : null}
        {mode === 'dive' ? (
          <div className="animated-work-logo-preview-cell">
            <span className="animated-work-logo-preview-label">Dive</span>
            <AnimatedWorkLogo active mode="dive" phase="trail" />
          </div>
        ) : null}
        {mode === 'ikun' || ikunMode ? (
          <div className="animated-work-logo-preview-cell">
            <span className="animated-work-logo-preview-label">iKun active</span>
            <AnimatedWorkLogo active ikunVariant="run" phase="trail" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function IkunCameoPreview({ mode }: { mode: IkunCameoPreviewMode }): ReactElement {
  const cameoType = mode === 'default' ? 'dash' : mode
  return (
    <div className="ikun-cameo-preview-wrap">
      <span className="ds-ikun-cameo-layer" aria-hidden="true">
        <IkunCameo cameo={{ type: cameoType, side: 'left' }} />
      </span>
    </div>
  )
}

export function KunCelebrationPreview({
  mode,
}: {
  mode: KunCelebrationPreviewMode
}): ReactElement {
  const ikunMode = mode === 'ikunMode'
  const variant: KunCelebrationVariant =
    mode === 'lap' || mode === 'toast' ? mode : 'cheer'

  return (
    <div
      className="kun-celebration-preview-wrap"
      {...(ikunMode ? { 'data-ikun-mode': 'on' } : {})}
    >
      <span className="ds-kun-celebration-layer" aria-hidden="true">
        <KunCelebration variant={variant} />
      </span>
    </div>
  )
}
