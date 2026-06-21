/** English copy matching Kun's composerMenuTitle locale string. */
export const COMPOSER_PLUS_MENU_TITLE = 'More actions'

/** English copy matching Kun's composerAddImage locale string. */
export const COMPOSER_PLUS_MENU_ADD_IMAGE_LABEL = 'Attach image'

/** English copy matching Kun's composerMenuPlanMode locale string. */
export const COMPOSER_PLUS_MENU_PLAN_MODE_LABEL = 'Plan mode'

/** English copy matching Kun's composerMenuPursueGoal locale string. */
export const COMPOSER_PLUS_MENU_PURSUE_GOAL_LABEL = 'Pursue goal'

/** English copy matching Kun's composerMenuWorktreeMode locale string. */
export const COMPOSER_PLUS_MENU_WORKTREE_MODE_LABEL = 'Worktree mode'

/** Toggle states for Kun's composer plus menu rows. */
export type ComposerPlusMenuToggles = {
  planMode: boolean
  goalActive: boolean
  worktreeMode: boolean
}

export type ComposerPlusMenuPreviewMode =
  | 'default'
  | 'plan'
  | 'goal'
  | 'worktree'
  | 'uploading'
  | 'noAttach'
  | 'noWorktree'

/** Default toggle states matching Kun's FloatingComposer plusMenu snapshot. */
export const COMPOSER_PLUS_MENU_PREVIEW_DEFAULT: ComposerPlusMenuToggles = {
  planMode: false,
  goalActive: true,
  worktreeMode: false,
}

export type ComposerPlusMenuPreviewState = {
  open: true
  toggles: ComposerPlusMenuToggles
  attachmentUploadBusy?: boolean
  /** When false, hides the Attach image row like Kun when attachmentUploadEnabled is false. */
  showAddImage?: boolean
  /** When false, hides the Worktree mode row like Kun when canToggleWorktreeMode is false. */
  showWorktreeMode?: boolean
}

export function resolveComposerPlusMenuPreview(
  mode: ComposerPlusMenuPreviewMode = 'default',
): ComposerPlusMenuPreviewState {
  const base = COMPOSER_PLUS_MENU_PREVIEW_DEFAULT
  switch (mode) {
    case 'plan':
      return { open: true, toggles: { ...base, planMode: true, goalActive: false } }
    case 'goal':
      return { open: true, toggles: { ...base, goalActive: true } }
    case 'worktree':
      return { open: true, toggles: { ...base, worktreeMode: true, goalActive: false } }
    case 'uploading':
      return { open: true, toggles: base, attachmentUploadBusy: true }
    case 'noAttach':
      return { open: true, toggles: base, showAddImage: false }
    case 'noWorktree':
      return { open: true, toggles: base, showWorktreeMode: false }
    default:
      return { open: true, toggles: base }
  }
}
