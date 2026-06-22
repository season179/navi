// Kun MemorySettingsSection chrome
// (../Kun/src/renderer/src/components/settings-section-memory.tsx).
// Visual only — used for production MemorySettingsSection and preview hooks.

export type MemorySettingsScopeFilter = 'all' | 'user' | 'workspace' | 'project'

/** English copy matching Kun's sectionMemory locale string. */
export const MEMORY_SETTINGS_SECTION_TITLE = 'Long-term memory'

/** English copy matching Kun's memoryEnable locale string. */
export const MEMORY_SETTINGS_ENABLE_LABEL = 'Enable memory'

/** English copy matching Kun's memoryEnableDesc locale string. */
export const MEMORY_SETTINGS_ENABLE_DESC =
  'When enabled, the assistant persists facts and preferences across sessions and injects them into context automatically. Changes apply on the next turn.'

/** English copy matching Kun's memoryOverview locale string. */
export const MEMORY_SETTINGS_OVERVIEW_LABEL = 'Overview'

/** English copy matching Kun's memoryOverviewDesc locale string. */
export const MEMORY_SETTINGS_OVERVIEW_DESC =
  "Memory records persist facts and preferences across sessions. They are injected into the assistant's context automatically and can be edited here."

/** English copy matching Kun's memoryActiveCount locale string. */
export const MEMORY_SETTINGS_ACTIVE_COUNT_LABEL = 'Active'

/** English copy matching Kun's memoryTombstoneCount locale string. */
export const MEMORY_SETTINGS_TOMBSTONE_COUNT_LABEL = 'Deleted'

/** English copy matching Kun's memoryEnabled locale string. */
export const MEMORY_SETTINGS_ENABLED_LABEL = 'Status'

/** English copy matching Kun's memoryOn locale string. */
export const MEMORY_SETTINGS_ON_LABEL = 'On'

/** English copy matching Kun's memoryOff locale string. */
export const MEMORY_SETTINGS_OFF_LABEL = 'Off'

/** English copy matching Kun's memoryRecords locale string. */
export const MEMORY_SETTINGS_RECORDS_LABEL = 'Memory records'

/** English copy matching Kun's memoryRecordsDesc locale string. */
export const MEMORY_SETTINGS_RECORDS_DESC =
  'Create, edit, disable or delete memory records. Changes take effect on the next turn.'

/** English copy matching Kun's memoryCreate locale string. */
export const MEMORY_SETTINGS_CREATE_LABEL = 'New'

/** English copy matching Kun's memoryCreateTitle locale string. */
export const MEMORY_SETTINGS_CREATE_TITLE = 'Create memory'

/** English copy matching Kun's memoryEditTitle locale string. */
export const MEMORY_SETTINGS_EDIT_TITLE = 'Edit memory'

/** English copy matching Kun's memoryEdit locale string. */
export const MEMORY_SETTINGS_EDIT_LABEL = 'Edit'

/** English copy matching Kun's memoryDisable locale string. */
export const MEMORY_SETTINGS_DISABLE_LABEL = 'Disable'

/** English copy matching Kun's memoryDelete locale string. */
export const MEMORY_SETTINGS_DELETE_LABEL = 'Delete'

/** English copy matching Kun's memoryDisabled locale string. */
export const MEMORY_SETTINGS_DISABLED_LABEL = 'disabled'

/** English copy matching Kun's memorySave locale string. */
export const MEMORY_SETTINGS_SAVE_LABEL = 'Save'

/** English copy matching Kun's memoryCancel locale string. */
export const MEMORY_SETTINGS_CANCEL_LABEL = 'Cancel'

/** English copy matching Kun's memoryEmpty locale string. */
export const MEMORY_SETTINGS_EMPTY_TEXT =
  'No memory records yet. The assistant will create them automatically as it learns your preferences, or add one manually.'

/** English copy matching Kun's memoryContentPlaceholder locale string. */
export const MEMORY_SETTINGS_CONTENT_PLACEHOLDER =
  'What should the assistant remember? e.g. "Prefer TypeScript with 2-space indentation."'

/** English copy matching Kun's memoryTagsPlaceholder locale string. */
export const MEMORY_SETTINGS_TAGS_PLACEHOLDER = 'Tags, comma-separated'

/** English copy matching Kun's memoryConfidence locale string. */
export const MEMORY_SETTINGS_CONFIDENCE_LABEL = 'Confidence'

/** English copy matching Kun's memoryScope_all locale string. */
export const MEMORY_SETTINGS_SCOPE_ALL = 'All'

/** English copy matching Kun's memoryScope_user locale string. */
export const MEMORY_SETTINGS_SCOPE_USER = 'User'

/** English copy matching Kun's memoryScope_workspace locale string. */
export const MEMORY_SETTINGS_SCOPE_WORKSPACE = 'Workspace'

/** English copy matching Kun's memoryScope_project locale string. */
export const MEMORY_SETTINGS_SCOPE_PROJECT = 'Project'

/** English copy matching Kun's memoryLastInjected locale string. */
export const MEMORY_SETTINGS_LAST_INJECTED_LABEL = 'Last injected'

/** English copy matching Kun's memoryLastInjectedDesc locale string. */
export const MEMORY_SETTINGS_LAST_INJECTED_DESC =
  'Memory record IDs that were injected into the most recent turn.'

/** Navi-branded equivalent of Kun's memoryDisabledHint locale string. */
export const MEMORY_SETTINGS_DISABLED_HINT =
  'Memory is currently disabled. Enable it in the runtime configuration (navi config) to create and use memory records.'

/** Resolve scope filter button labels matching Kun's memoryScope_* keys. */
export function resolveMemorySettingsScopeLabel(scope: MemorySettingsScopeFilter): string {
  switch (scope) {
    case 'all':
      return MEMORY_SETTINGS_SCOPE_ALL
    case 'user':
      return MEMORY_SETTINGS_SCOPE_USER
    case 'workspace':
      return MEMORY_SETTINGS_SCOPE_WORKSPACE
    case 'project':
      return MEMORY_SETTINGS_SCOPE_PROJECT
  }
}
