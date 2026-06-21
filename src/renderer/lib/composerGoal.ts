/** Active thread goal snapshot for Kun's composer goal floater and panel. */
export type ComposerGoal = {
  objective: string
  status: 'active' | 'paused'
  elapsedLabel: string
}

/** English copy matching Kun's slashCommandGoalTitle locale string. */
export const COMPOSER_GOAL_MODE_BADGE_LABEL = 'Goal'

/** English copy matching Kun's goalActiveHeading locale string. */
export const COMPOSER_GOAL_ACTIVE_HEADING = 'Active goal'

/** English copy matching Kun's goalNoActiveTitle locale string. */
export const COMPOSER_GOAL_NO_ACTIVE_TITLE = 'No active goal'

/** English copy matching Kun's goalSetCurrentInput locale string. */
export const COMPOSER_GOAL_SET_CURRENT_INPUT = 'Set as goal'

/** English copy matching Kun's goalActionEdit locale string. */
export const COMPOSER_GOAL_ACTION_EDIT = 'Edit goal'

/** English copy matching Kun's goalActionPause locale string. */
export const COMPOSER_GOAL_ACTION_PAUSE = 'Pause'

/** English copy matching Kun's goalActionResume locale string. */
export const COMPOSER_GOAL_ACTION_RESUME = 'Resume'

/** English copy matching Kun's goalActionClear locale string. */
export const COMPOSER_GOAL_ACTION_CLEAR = 'Clear'

/** Kun goalStatusShort.active */
export const COMPOSER_GOAL_STATUS_ACTIVE = 'Active'

/** Kun goalStatusShort.paused */
export const COMPOSER_GOAL_STATUS_PAUSED = 'Paused'

/** Kun goal floater banner label: goalActiveHeading when active, goalStatusShort otherwise. */
export function formatComposerGoalBannerLabel(status: ComposerGoal['status']): string {
  return status === 'active' ? COMPOSER_GOAL_ACTIVE_HEADING : formatComposerGoalStatusShort(status)
}

export function formatComposerGoalStatusShort(status: ComposerGoal['status']): string {
  return status === 'active' ? COMPOSER_GOAL_STATUS_ACTIVE : COMPOSER_GOAL_STATUS_PAUSED
}

/** Mock goal for ?composerGoalFloaterPreview and ?composerGoalPanelPreview visual verification. */
export const COMPOSER_GOAL_PREVIEW = {
  objective: 'Port Kun FloatingComposer visuals into navi',
  status: 'active',
  elapsedLabel: '12m',
} satisfies ComposerGoal

/** Mock paused goal for ?composerGoalFloaterPreview=paused and ?composerGoalPanelPreview=paused. */
export const COMPOSER_GOAL_PAUSED_PREVIEW = {
  ...COMPOSER_GOAL_PREVIEW,
  status: 'paused',
} satisfies ComposerGoal

export function resolveComposerGoalPreview(mode: string | null): ComposerGoal {
  if (mode === 'paused') return COMPOSER_GOAL_PAUSED_PREVIEW
  return COMPOSER_GOAL_PREVIEW
}

/** Kun getGoalPanelDraftObjective — non-empty draft when goal panel is open and input is not a slash command. */
export function getGoalPanelDraftObjective(input: string, goalPanelOpen: boolean): string {
  const objective = input.trim()
  if (!goalPanelOpen || objective.length === 0 || objective.startsWith('/')) return ''
  return objective
}
