// Kun workspace project picker composer chrome
// (../Kun/src/renderer/src/components/chat/WorkspaceProjectPicker.tsx).
// Visual only — used for production Composer footer and preview hooks.

/** English copy matching Kun's workingDirectory locale string. */
export const WORKSPACE_PROJECT_WORKING_DIRECTORY_LABEL = 'Working directory'

/** English copy matching Kun's selectWorkspace locale string. */
export const WORKSPACE_PROJECT_SELECT_LABEL = 'Choose working directory'

/** English copy matching Kun's sidebarProjects locale string. */
export const WORKSPACE_PROJECT_SECTION_LABEL = 'Projects'

/** English copy matching Kun's composerWorkspaceSearch locale string. */
export const WORKSPACE_PROJECT_SEARCH_PLACEHOLDER = 'Search projects'

/** English copy matching Kun's composerWorkspaceEmpty locale string. */
export const WORKSPACE_PROJECT_EMPTY_LABEL = 'No projects yet'

/** English copy matching Kun's composerWorkspaceNoMatch locale string. */
export const WORKSPACE_PROJECT_NO_MATCH_LABEL = 'No matching projects'

/** English copy matching Kun's composerWorkspaceAdd locale string. */
export const WORKSPACE_PROJECT_ADD_LABEL = 'Add project'

export function resolveWorkspaceProjectEmptyLabel(options: {
  hasOptions: boolean
}): string {
  return options.hasOptions
    ? WORKSPACE_PROJECT_NO_MATCH_LABEL
    : WORKSPACE_PROJECT_EMPTY_LABEL
}
