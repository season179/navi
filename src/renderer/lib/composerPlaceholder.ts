import { COMPOSER_QUEUE_PLACEHOLDER } from './composerBusyState'

/** English copy matching Kun's placeholder locale string. */
export const COMPOSER_DEFAULT_PLACEHOLDER = 'Ask the agent…'

/** English copy matching Kun's composerStartsThread locale string. */
export const COMPOSER_STARTS_THREAD_PLACEHOLDER =
  'Type and send to automatically create a thread…'

/** English copy matching Kun's composerPlanPlaceholder locale string. */
export const COMPOSER_PLAN_MODE_PLACEHOLDER =
  'Break the goal down, outline steps, and scope changes before execution…'

/** English copy matching Kun's goalComposerPlaceholder locale string. */
export const COMPOSER_GOAL_MODE_PLACEHOLDER = 'Type a goal for this thread'

export type ComposerPlaceholderPreviewMode = 'default' | 'startsThread' | 'plan' | 'goal'

/** Resolves placeholder copy from ?composerPlaceholderPreview query values. */
export function resolveComposerPlaceholderPreview(
  mode: ComposerPlaceholderPreviewMode = 'default',
): string {
  if (mode === 'startsThread') return COMPOSER_STARTS_THREAD_PLACEHOLDER
  if (mode === 'plan') return COMPOSER_PLAN_MODE_PLACEHOLDER
  if (mode === 'goal') return COMPOSER_GOAL_MODE_PLACEHOLDER
  return COMPOSER_DEFAULT_PLACEHOLDER
}

/** Resolves composer textarea placeholder matching Kun's FloatingComposer logic. */
export function resolveComposerPlaceholder(options: {
  busy?: boolean
  goalPanelOpen?: boolean
  planMode?: boolean
  startsThread?: boolean
}): string {
  if (options.goalPanelOpen) return COMPOSER_GOAL_MODE_PLACEHOLDER
  if (options.busy) return COMPOSER_QUEUE_PLACEHOLDER
  if (options.planMode) return COMPOSER_PLAN_MODE_PLACEHOLDER
  if (options.startsThread) return COMPOSER_STARTS_THREAD_PLACEHOLDER
  return COMPOSER_DEFAULT_PLACEHOLDER
}
