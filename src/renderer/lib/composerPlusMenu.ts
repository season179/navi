/** Toggle states for Kun's composer plus menu rows. */
export type ComposerPlusMenuToggles = {
  planMode: boolean
  goalActive: boolean
  worktreeMode: boolean
}

export type ComposerPlusMenuPreviewMode = 'default' | 'plan' | 'goal' | 'worktree'

/** Default toggle states matching Kun's FloatingComposer plusMenu snapshot. */
export const COMPOSER_PLUS_MENU_PREVIEW_DEFAULT: ComposerPlusMenuToggles = {
  planMode: false,
  goalActive: true,
  worktreeMode: false,
}

export function resolveComposerPlusMenuPreview(
  mode: ComposerPlusMenuPreviewMode = 'default',
): { open: true; toggles: ComposerPlusMenuToggles } {
  const base = COMPOSER_PLUS_MENU_PREVIEW_DEFAULT
  switch (mode) {
    case 'plan':
      return { open: true, toggles: { ...base, planMode: true, goalActive: false } }
    case 'goal':
      return { open: true, toggles: { ...base, goalActive: true } }
    case 'worktree':
      return { open: true, toggles: { ...base, worktreeMode: true, goalActive: false } }
    default:
      return { open: true, toggles: base }
  }
}
