// Kun LiveTurnProgressRow chrome
// (../Kun/src/renderer/src/components/chat/MessageTimeline.tsx LiveTurnProgressRow
// and ../Kun/src/renderer/src/components/chat/AnimatedWorkLogo.tsx label keys).
// Visual only — used for LiveTurnProgressRow status labels.

export type LiveTurnProgressSwimMode = 'propel' | 'sprint' | 'dive' | 'surf'

export type LiveTurnProgressIkunVariant = 'dribble' | 'run' | 'boba'

/** English copy matching Kun's working locale string. */
export const LIVE_TURN_PROGRESS_WORKING = 'Working…'

/** English copy matching Kun's workingSprint locale string. */
export const LIVE_TURN_PROGRESS_SPRINT = 'Sprinting…'

/** English copy matching Kun's workingDive locale string. */
export const LIVE_TURN_PROGRESS_DIVE = 'Diving…'

/** English copy matching Kun's workingSurf locale string. */
export const LIVE_TURN_PROGRESS_SURF = 'Surfing…'

/** English copy matching Kun's ikunDribbling locale string. */
export const LIVE_TURN_PROGRESS_IKUN_DRIBBLE = 'Dribbling…'

/** English copy matching Kun's ikunFastBreak locale string. */
export const LIVE_TURN_PROGRESS_IKUN_RUN = 'Fast break…'

/** English copy matching Kun's ikunBobaTime locale string. */
export const LIVE_TURN_PROGRESS_IKUN_BOBA = 'Boba time…'

export const LIVE_TURN_PROGRESS_SWIM_LABELS: Record<LiveTurnProgressSwimMode, string> = {
  propel: LIVE_TURN_PROGRESS_WORKING,
  sprint: LIVE_TURN_PROGRESS_SPRINT,
  dive: LIVE_TURN_PROGRESS_DIVE,
  surf: LIVE_TURN_PROGRESS_SURF,
}

export const LIVE_TURN_PROGRESS_IKUN_LABELS: Record<LiveTurnProgressIkunVariant, string> = {
  dribble: LIVE_TURN_PROGRESS_IKUN_DRIBBLE,
  run: LIVE_TURN_PROGRESS_IKUN_RUN,
  boba: LIVE_TURN_PROGRESS_IKUN_BOBA,
}

export function resolveLiveTurnProgressSwimLabel(mode: LiveTurnProgressSwimMode): string {
  return LIVE_TURN_PROGRESS_SWIM_LABELS[mode]
}

export function resolveLiveTurnProgressIkunLabel(variant: LiveTurnProgressIkunVariant): string {
  return LIVE_TURN_PROGRESS_IKUN_LABELS[variant]
}

export function resolveLiveTurnProgressLabel(input: {
  ikunMode: boolean
  swimMode: LiveTurnProgressSwimMode
  ikunVariant: LiveTurnProgressIkunVariant
}): string {
  return input.ikunMode
    ? resolveLiveTurnProgressIkunLabel(input.ikunVariant)
    : resolveLiveTurnProgressSwimLabel(input.swimMode)
}
