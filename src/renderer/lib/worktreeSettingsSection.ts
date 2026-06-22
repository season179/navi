// Kun WorktreeSettingsSection chrome
// (../Kun/src/renderer/src/components/settings-section-worktree.tsx).
// Visual only — used for production WorktreeSettingsSection and preview hooks.

/** English copy matching Kun's sectionWorktree locale string. */
export const WORKTREE_SETTINGS_SECTION_TITLE = 'Git worktrees'

/** English copy matching Kun's worktreeOverview locale string. */
export const WORKTREE_SETTINGS_OVERVIEW_TITLE = 'Worktree pool'

/** English copy matching Kun's worktreeOverviewDesc locale string. */
export const WORKTREE_SETTINGS_OVERVIEW_DESC =
  'Manage a pool of Git worktrees so multiple agents can work on the same project in parallel on isolated branches.'

/** English copy matching Kun's worktreeMainBranch locale string. */
export const WORKTREE_SETTINGS_MAIN_BRANCH_LABEL = 'Main branch'

/** English copy matching Kun's worktreeInUse locale string. */
export const WORKTREE_SETTINGS_IN_USE_LABEL = 'In use'

/** English copy matching Kun's worktreePoolDir locale string. */
export const WORKTREE_SETTINGS_POOL_DIR_LABEL = 'Pool directory'

/** English copy matching Kun's worktreeRefresh locale string. */
export const WORKTREE_SETTINGS_REFRESH_LABEL = 'Refresh'

/** English copy matching Kun's worktreeNotGitRepo locale string. */
export const WORKTREE_SETTINGS_NOT_GIT_REPO =
  'The current workspace is not a Git repository. Worktrees require a Git project — please select one in General settings.'

/** English copy matching Kun's worktreePool locale string. */
export const WORKTREE_SETTINGS_POOL_LABEL = 'Pool'

/** English copy matching Kun's worktreeBusy locale string. */
export const WORKTREE_SETTINGS_BUSY_LABEL = 'In use'

/** English copy matching Kun's worktreeIdle locale string. */
export const WORKTREE_SETTINGS_IDLE_LABEL = 'Idle'

/** English copy matching Kun's worktreeEmpty locale string. */
export const WORKTREE_SETTINGS_EMPTY_LABEL = 'Empty'

/** English copy matching Kun's worktreeNotCreated locale string. */
export const WORKTREE_SETTINGS_NOT_CREATED_LABEL = 'Not created yet'

/** English copy matching Kun's worktreeUncommitted locale string. */
export const WORKTREE_SETTINGS_UNCOMMITTED_LABEL = 'uncommitted'

/** English copy matching Kun's worktreeCreate locale string. */
export const WORKTREE_SETTINGS_CREATE_LABEL = 'Create'

/** English copy matching Kun's worktreeMergeTitle locale string. */
export const WORKTREE_SETTINGS_MERGE_TITLE = 'Merge into main'

/** English copy matching Kun's worktreeSyncTitle locale string. */
export const WORKTREE_SETTINGS_SYNC_TITLE = 'Sync from main (rebase)'

/** English copy matching Kun's worktreeRemove locale string. */
export const WORKTREE_SETTINGS_REMOVE_TITLE = 'Remove'

/** English copy matching Kun's worktreeRelease locale string. */
export const WORKTREE_SETTINGS_RELEASE_LABEL = 'Release'

/** English copy matching Kun's worktreeCleanupAll locale string. */
export const WORKTREE_SETTINGS_CLEANUP_ALL_LABEL = 'Clean up all'

/** Format Kun's worktreeForceConfirm locale string. */
export function formatWorktreeSettingsForceConfirm(count: number): string {
  return `This worktree has ${count} uncommitted change(s). Force-reset will discard them. Continue?`
}
