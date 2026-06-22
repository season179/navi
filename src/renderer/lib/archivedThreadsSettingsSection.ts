// Kun ArchivedThreadsSettingsSection chrome
// (../Kun/src/renderer/src/components/settings-section-archives.tsx).
// Visual only — used for production ArchivedThreadsSettingsSection and preview hooks.

/** English copy matching Kun's archivesTitle locale string. */
export const ARCHIVED_THREADS_SETTINGS_TITLE = 'Archived chats'

/** English copy matching Kun's archivesOverview locale string. */
export const ARCHIVED_THREADS_SETTINGS_OVERVIEW_TITLE = 'Archived chat history'

/** English copy matching Kun's archivesOverviewDesc locale string. */
export const ARCHIVED_THREADS_SETTINGS_OVERVIEW_DESC =
  'Review chats that were removed from the active sidebar. You can open, restore, or permanently delete them here.'

/** English copy matching Kun's archivesSearchPlaceholder locale string. */
export const ARCHIVED_THREADS_SETTINGS_SEARCH_PLACEHOLDER = 'Search archived chats'

/** English copy matching Kun's archivesUntitled locale string. */
export const ARCHIVED_THREADS_SETTINGS_UNTITLED = 'Untitled chat'

/** English copy matching Kun's archivesRestore locale string. */
export const ARCHIVED_THREADS_SETTINGS_RESTORE_LABEL = 'Restore'

/** English copy matching Kun's archivesDelete locale string. */
export const ARCHIVED_THREADS_SETTINGS_DELETE_LABEL = 'Delete archived chat'

/** English copy matching Kun's archivesEmpty locale string. */
export const ARCHIVED_THREADS_SETTINGS_EMPTY = 'No archived chats yet.'

/** English copy matching Kun's archivesSearchEmpty locale string. */
export const ARCHIVED_THREADS_SETTINGS_SEARCH_EMPTY = 'No archived chats match your search.'

/** English copy matching Kun's archivesOffline locale string. */
export const ARCHIVED_THREADS_SETTINGS_OFFLINE =
  'Connect the local runtime to refresh archived chats.'

/** English copy matching Kun's archivesDeleteConfirmDesc locale string. */
export const ARCHIVED_THREADS_SETTINGS_DELETE_CONFIRM_DESC =
  'This archived chat will be permanently deleted. This cannot be undone.'

/** English copy matching Kun's common:sidebarThreadRestore locale string. */
export const ARCHIVED_THREADS_SETTINGS_SIDEBAR_RESTORE_LABEL = 'Restore thread'

/** English copy matching Kun's common:sidebarThreadDelete locale string. */
export const ARCHIVED_THREADS_SETTINGS_SIDEBAR_DELETE_LABEL = 'Delete thread'

/** Format Kun's archivesCount locale string. */
export function formatArchivedThreadsSettingsCount(count: number): string {
  return `${count} archived`
}

/** Format Kun's archivesWorkspaceCount locale string. */
export function formatArchivedThreadsSettingsWorkspaceCount(count: number): string {
  return `${count} chats`
}

/** Format Kun's archivesDeleteConfirmTitle locale string. */
export function formatArchivedThreadsSettingsDeleteConfirmTitle(title: string): string {
  return `Delete "${title}"?`
}

/** Format Kun's archives footer hint from common sidebar thread labels. */
export function formatArchivedThreadsSettingsFooterHint(): string {
  return `${ARCHIVED_THREADS_SETTINGS_SIDEBAR_RESTORE_LABEL} / ${ARCHIVED_THREADS_SETTINGS_SIDEBAR_DELETE_LABEL}`
}
