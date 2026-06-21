/** Active thread goal snapshot for Kun's composer goal floater and panel. */
export type ComposerGoal = {
  objective: string
  status: 'active' | 'paused'
  elapsedLabel: string
}

/** Mock goal for ?composerGoalFloaterPreview and ?composerGoalPanelPreview visual verification. */
export const COMPOSER_GOAL_PREVIEW = {
  objective: 'Port Kun FloatingComposer visuals into navi',
  status: 'active',
  elapsedLabel: '12m',
} satisfies ComposerGoal
