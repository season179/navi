// Kun SettingsSidebar chrome
// (../Kun/src/renderer/src/components/SettingsSidebar.tsx).
// Visual only — used for production SettingsSidebar and preview hooks.

/** English copy matching Kun's back locale string. */
export const SETTINGS_SIDEBAR_BACK_LABEL = 'Back'

/** English copy matching Kun's general locale string. */
export const SETTINGS_SIDEBAR_GENERAL_LABEL = 'General'

/** English copy matching Kun's providers locale string. */
export const SETTINGS_SIDEBAR_PROVIDERS_LABEL = 'Providers'

/** English copy matching Kun's write locale string. */
export const SETTINGS_SIDEBAR_WRITE_LABEL = 'Write'

/** English copy matching Kun's imageGen locale string. */
export const SETTINGS_SIDEBAR_IMAGE_GEN_LABEL = 'Image generation'

/** English copy matching Kun's mediaGeneration locale string. */
export const SETTINGS_SIDEBAR_MEDIA_GENERATION_LABEL = 'Media generation'

/** English copy matching Kun's speechToText locale string. */
export const SETTINGS_SIDEBAR_SPEECH_TO_TEXT_LABEL = 'Speech to text'

/** English copy matching Kun's agents locale string. */
export const SETTINGS_SIDEBAR_AGENTS_LABEL = 'AI assistant'

/** English copy matching Kun's archives locale string. */
export const SETTINGS_SIDEBAR_ARCHIVES_LABEL = 'Archived chats'

/** English copy matching Kun's permissions locale string. */
export const SETTINGS_SIDEBAR_PERMISSIONS_LABEL = 'Permissions'

/** English copy matching Kun's worktree locale string. */
export const SETTINGS_SIDEBAR_WORKTREE_LABEL = 'Worktrees'

/** English copy matching Kun's memory locale string. */
export const SETTINGS_SIDEBAR_MEMORY_LABEL = 'Memory'

/** English copy matching Kun's keyboardShortcuts locale string. */
export const SETTINGS_SIDEBAR_KEYBOARD_SHORTCUTS_LABEL = 'Keyboard shortcuts'

/** English copy matching Kun's easterEgg locale string. */
export const SETTINGS_SIDEBAR_EASTER_EGG_LABEL = 'Mode workshop'

/** English copy matching Kun's updates locale string. */
export const SETTINGS_SIDEBAR_UPDATES_LABEL = 'Version & updates'

/** English copy matching Kun's claw locale string. */
export const SETTINGS_SIDEBAR_CLAW_LABEL = 'Connect phone'

/** English copy matching Kun's debug locale string. */
export const SETTINGS_SIDEBAR_DEBUG_LABEL = 'Troubleshooting'

/** English copy matching Kun's settingsFooter locale string. */
export const SETTINGS_SIDEBAR_FOOTER_LABEL = 'Preferences are stored locally.'

/** Resolve sidebar category label by Kun locale key. */
export function resolveSettingsSidebarCategoryLabel(labelKey: string): string {
  switch (labelKey) {
    case 'general':
      return SETTINGS_SIDEBAR_GENERAL_LABEL
    case 'providers':
      return SETTINGS_SIDEBAR_PROVIDERS_LABEL
    case 'write':
      return SETTINGS_SIDEBAR_WRITE_LABEL
    case 'imageGen':
      return SETTINGS_SIDEBAR_IMAGE_GEN_LABEL
    case 'mediaGeneration':
      return SETTINGS_SIDEBAR_MEDIA_GENERATION_LABEL
    case 'speechToText':
      return SETTINGS_SIDEBAR_SPEECH_TO_TEXT_LABEL
    case 'agents':
      return SETTINGS_SIDEBAR_AGENTS_LABEL
    case 'archives':
      return SETTINGS_SIDEBAR_ARCHIVES_LABEL
    case 'permissions':
      return SETTINGS_SIDEBAR_PERMISSIONS_LABEL
    case 'worktree':
      return SETTINGS_SIDEBAR_WORKTREE_LABEL
    case 'memory':
      return SETTINGS_SIDEBAR_MEMORY_LABEL
    case 'keyboardShortcuts':
      return SETTINGS_SIDEBAR_KEYBOARD_SHORTCUTS_LABEL
    case 'easterEgg':
      return SETTINGS_SIDEBAR_EASTER_EGG_LABEL
    case 'updates':
      return SETTINGS_SIDEBAR_UPDATES_LABEL
    case 'claw':
      return SETTINGS_SIDEBAR_CLAW_LABEL
    case 'debug':
      return SETTINGS_SIDEBAR_DEBUG_LABEL
    default:
      return labelKey
  }
}
