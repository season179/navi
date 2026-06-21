/** English copy matching Kun's composerSlashHint and composerWorktreeModeHint. */
export const COMPOSER_FOOTER_HINT_SLASH = 'Type / for commands'

export const COMPOSER_FOOTER_HINT_WORKTREE =
  'Worktree mode on — create a new conversation to run in parallel.'

/** English copy matching Kun's composerOfflineHint locale string. */
export const COMPOSER_FOOTER_HINT_OFFLINE =
  'Reconnect the runtime before sending another message.'

/** English copy matching Kun's composerWorkspaceHint locale string. */
export const COMPOSER_FOOTER_HINT_WORKSPACE =
  'Choose a working directory before starting or continuing a thread.'

export type ComposerFooterHintPreviewMode =
  | 'default'
  | 'worktree'
  | 'offline'
  | 'workspace'

export function resolveComposerFooterHintPreview(
  mode: ComposerFooterHintPreviewMode = 'default',
): string {
  if (mode === 'worktree') return COMPOSER_FOOTER_HINT_WORKTREE
  if (mode === 'offline') return COMPOSER_FOOTER_HINT_OFFLINE
  if (mode === 'workspace') return COMPOSER_FOOTER_HINT_WORKSPACE
  return COMPOSER_FOOTER_HINT_SLASH
}
