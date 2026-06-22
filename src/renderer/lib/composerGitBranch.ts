// Kun git-branch picker composer chrome
// (../Kun/src/renderer/src/components/chat/GitBranchPicker.tsx).
// Visual only — used for production Composer and preview hooks.

/** English copy matching Kun's gitBranch locale string. */
export const GIT_BRANCH_LABEL = 'Git branch'

/** English copy matching Kun's gitBranchUnavailable locale string. */
export const GIT_BRANCH_UNAVAILABLE_LABEL = 'No Git repo'

/** English copy matching Kun's gitDetached locale string. */
export const GIT_DETACHED_HEAD_LABEL = 'Detached HEAD'

/** English copy matching Kun's gitSearchBranches locale string. */
export const GIT_SEARCH_BRANCHES_PLACEHOLDER = 'Search branches'

/** English copy matching Kun's gitBranches locale string. */
export const GIT_BRANCHES_SECTION_LABEL = 'Branches'

/** English copy matching Kun's gitBranchLoading locale string. */
export const GIT_BRANCH_LOADING_LABEL = 'Loading branches…'

/** English copy matching Kun's gitNoBranches locale string. */
export const GIT_NO_BRANCHES_LABEL = 'No matching branches.'

/** English copy matching Kun's gitCreateBranch locale string. */
export const GIT_CREATE_BRANCH_LABEL = 'Create and switch to a new branch…'

/** English copy matching Kun's gitCreateNamedBranch locale string. */
export const GIT_CREATE_NAMED_BRANCH_TEMPLATE = 'Create and switch to {{branch}}'

/** English copy matching Kun's gitDirtyFiles locale string. */
export const GIT_DIRTY_FILES_TEMPLATE = 'Uncommitted: {{count}} files'

export function formatGitCreateNamedBranchLabel(branch: string): string {
  return GIT_CREATE_NAMED_BRANCH_TEMPLATE.replace('{{branch}}', branch)
}

export function formatGitDirtyFilesLabel(count: number): string {
  return GIT_DIRTY_FILES_TEMPLATE.replace('{{count}}', String(count))
}

export function resolveGitBranchTriggerLabel(options: {
  currentBranch: string | null
  snapshotOk: boolean
}): string {
  if (options.currentBranch) return options.currentBranch
  return options.snapshotOk ? GIT_DETACHED_HEAD_LABEL : GIT_BRANCH_UNAVAILABLE_LABEL
}
