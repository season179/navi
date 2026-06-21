// Live turn progress row echoing Kun's LiveTurnProgressRow
// (../Kun/src/renderer/src/components/chat/MessageTimeline.tsx).
// Visual only: animated work logo with shimmer status label during processing.

import { useState, type ReactElement } from 'react'
import {
  AnimatedWorkLogo,
  useIkunWorkLogoVariant,
  useWorkLogoSwimMode,
  type IkunWorkLogoVariant,
  type WorkLogoSwimMode,
} from './AnimatedWorkLogo'

const WORK_LOGO_SWIM_MODE_LABELS: Record<WorkLogoSwimMode, string> = {
  propel: 'Working…',
  sprint: 'Sprinting…',
  dive: 'Diving…',
  surf: 'Surfing…',
}

const IKUN_WORK_LOGO_VARIANT_LABELS: Record<IkunWorkLogoVariant, string> = {
  dribble: 'Dribbling…',
  run: 'Fast break…',
  boba: 'Boba time…',
}

export function liveTurnProgressClass(hasActiveGoal: boolean): string {
  return hasActiveGoal
    ? 'live-turn-progress-row has-active-goal'
    : 'live-turn-progress-row'
}

export function goalTimelinePaddingClass(
  route: 'chat' | 'claw',
  hasActiveGoal: boolean,
): string {
  return route === 'chat' && hasActiveGoal
    ? 'message-timeline-padding has-active-goal'
    : 'message-timeline-padding'
}

type Props = {
  hasActiveGoal?: boolean
  /** Force iKun mode label + figure styling for preview verification. */
  ikunMode?: boolean
  /** Pin swim mode instead of rotating for preview verification. */
  swimMode?: WorkLogoSwimMode
  /** Pin iKun variant instead of rotating for preview verification. */
  ikunVariant?: IkunWorkLogoVariant
}

export function LiveTurnProgressRow({
  hasActiveGoal = false,
  ikunMode,
  swimMode: swimModeOverride,
  ikunVariant: ikunVariantOverride,
}: Props): ReactElement {
  const swimMode = useWorkLogoSwimMode(activeSwimMode(swimModeOverride))
  const ikunVariant = useIkunWorkLogoVariant(activeIkunVariant(ikunVariantOverride, ikunMode))
  const [ikunModeOn] = useState(
    () =>
      ikunMode === true ||
      (typeof document !== 'undefined' &&
        document.documentElement.getAttribute('data-ikun-mode') === 'on'),
  )

  const effectiveSwimMode = swimModeOverride ?? swimMode
  const effectiveIkunVariant = ikunVariantOverride ?? ikunVariant
  const label = ikunModeOn
    ? IKUN_WORK_LOGO_VARIANT_LABELS[effectiveIkunVariant]
    : WORK_LOGO_SWIM_MODE_LABELS[effectiveSwimMode]

  return (
    <div
      className={liveTurnProgressClass(hasActiveGoal)}
      {...(ikunModeOn ? { 'data-ikun-mode': 'on' } : {})}
    >
      <span className="ds-work-logo-slot ds-work-logo-slot-sm live-turn-progress-logo">
        <AnimatedWorkLogo
          active
          ikunVariant={ikunModeOn ? effectiveIkunVariant : undefined}
          mode={effectiveSwimMode}
          phase="trail"
          size="sm"
        />
      </span>
      <span className="ds-shiny-text">{label}</span>
    </div>
  )
}

function activeSwimMode(override?: WorkLogoSwimMode): boolean {
  return override === undefined
}

function activeIkunVariant(override: IkunWorkLogoVariant | undefined, ikunMode?: boolean): boolean {
  return override === undefined && ikunMode !== true
}

export type LiveTurnProgressRowPreviewMode =
  | 'default'
  | 'withGoal'
  | 'surf'
  | 'sprint'
  | 'dive'
  | 'ikun'
  | 'ikunMode'

export function LiveTurnProgressRowPreview({
  mode,
}: {
  mode: LiveTurnProgressRowPreviewMode
}): ReactElement {
  const hasActiveGoal = mode === 'withGoal'
  const ikunMode = mode === 'ikun' || mode === 'ikunMode'
  const swimMode =
    mode === 'surf'
      ? 'surf'
      : mode === 'sprint'
        ? 'sprint'
        : mode === 'dive'
          ? 'dive'
          : undefined
  const ikunVariant =
    mode === 'ikun' ? ('dribble' as const) : mode === 'ikunMode' ? ('boba' as const) : undefined

  return (
    <div
      className="live-turn-progress-row-preview"
      {...(mode === 'ikunMode' ? { 'data-ikun-mode': 'on' } : {})}
    >
      <LiveTurnProgressRow
        hasActiveGoal={hasActiveGoal}
        ikunMode={ikunMode}
        swimMode={swimMode}
        ikunVariant={ikunVariant}
      />
    </div>
  )
}
