/** English copy matching Kun's composerSlashHint and composerWorktreeModeHint. */
export const COMPOSER_FOOTER_HINT_SLASH = 'Type / for commands'

export const COMPOSER_FOOTER_HINT_WORKTREE =
  'Worktree mode on — create a new conversation to run in parallel.'

export type ComposerFooterHintPreviewMode = 'default' | 'worktree'

export function resolveComposerFooterHintPreview(
  mode: ComposerFooterHintPreviewMode = 'default',
): string {
  return mode === 'worktree' ? COMPOSER_FOOTER_HINT_WORKTREE : COMPOSER_FOOTER_HINT_SLASH
}
