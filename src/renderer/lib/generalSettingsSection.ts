// Kun GeneralSettingsSection chrome
// (../Kun/src/renderer/src/components/settings-section-general.tsx).
// Visual only — used for production GeneralSettingsSection and preview hooks.

export type GeneralSettingsCloseAction = 'ask' | 'tray' | 'quit'
export type GeneralSettingsFontScale = 'small' | 'medium' | 'large'

/** English copy matching Kun's sectionGeneral locale string. */
export const GENERAL_SETTINGS_SECTION_TITLE = 'Basics'

/** English copy matching Kun's language locale string. */
export const GENERAL_SETTINGS_LANGUAGE_LABEL = 'Language'

/** English copy matching Kun's languageDesc locale string. */
export const GENERAL_SETTINGS_LANGUAGE_DESC = 'Applied immediately when selected.'

/** English copy matching Kun's theme locale string. */
export const GENERAL_SETTINGS_THEME_LABEL = 'Theme'

/** English copy matching Kun's themeDesc locale string. */
export const GENERAL_SETTINGS_THEME_DESC = 'Light, dark, or match the operating system.'

/** English copy matching Kun's themeSystem locale string. */
export const GENERAL_SETTINGS_THEME_SYSTEM = 'System'

/** English copy matching Kun's themeLight locale string. */
export const GENERAL_SETTINGS_THEME_LIGHT = 'Light'

/** English copy matching Kun's themeDark locale string. */
export const GENERAL_SETTINGS_THEME_DARK = 'Dark'

/** English copy matching Kun's fontScale locale string. */
export const GENERAL_SETTINGS_FONT_SCALE_LABEL = 'Font size'

/** English copy matching Kun's fontScaleDesc locale string. */
export const GENERAL_SETTINGS_FONT_SCALE_DESC = 'Adjust the overall UI text size.'

/** English copy matching Kun's fontScaleSmall locale string. */
export const GENERAL_SETTINGS_FONT_SCALE_SMALL = 'Small'

/** English copy matching Kun's fontScaleMedium locale string. */
export const GENERAL_SETTINGS_FONT_SCALE_MEDIUM = 'Medium'

/** English copy matching Kun's fontScaleLarge locale string. */
export const GENERAL_SETTINGS_FONT_SCALE_LARGE = 'Large'

/** English copy matching Kun's workspaceRoot locale string. */
export const GENERAL_SETTINGS_WORKSPACE_ROOT_LABEL = 'Default working directory'

/** English copy matching Kun's workspaceRootDesc locale string. */
export const GENERAL_SETTINGS_WORKSPACE_ROOT_DESC =
  'First launch uses ~/.kun/default_workspace by default, and you can change it to another directory.'

/** English copy matching Kun's workspaceRootPlaceholder locale string. */
export const GENERAL_SETTINGS_WORKSPACE_ROOT_PLACEHOLDER = '~/.kun/default_workspace'

/** English copy matching Kun's restoreWorkspaceDefault locale string. */
export const GENERAL_SETTINGS_RESTORE_WORKSPACE_DEFAULT = 'Restore default'

/** English copy matching Kun's browse locale string. */
export const GENERAL_SETTINGS_BROWSE_LABEL = 'Browse'

/** English copy matching Kun's cursorSpotlight locale string. */
export const GENERAL_SETTINGS_CURSOR_SPOTLIGHT_LABEL = 'Interactive effects'

/** English copy matching Kun's cursorSpotlightDesc locale string. */
export const GENERAL_SETTINGS_CURSOR_SPOTLIGHT_DESC =
  'Show a soft cursor-follow spotlight on the title bar and sidebar.'

/** English copy matching Kun's desktopBehavior locale string. */
export const GENERAL_SETTINGS_DESKTOP_BEHAVIOR_TITLE = 'Desktop behavior'

/** English copy matching Kun's desktopOpenAtLogin locale string. */
export const GENERAL_SETTINGS_OPEN_AT_LOGIN_LABEL = 'Open at login'

/** Navi-branded equivalent of Kun's desktopOpenAtLoginDesc locale string. */
export const GENERAL_SETTINGS_OPEN_AT_LOGIN_DESC =
  'Start Navi automatically after you sign in.'

/** English copy matching Kun's desktopOpenAtLoginUnsupportedDesc locale string. */
export const GENERAL_SETTINGS_OPEN_AT_LOGIN_UNSUPPORTED_DESC =
  'Open at login is available on Windows and macOS.'

/** English copy matching Kun's desktopStartMinimized locale string. */
export const GENERAL_SETTINGS_START_MINIMIZED_LABEL = 'Start minimized'

/** English copy matching Kun's desktopStartMinimizedDesc locale string. */
export const GENERAL_SETTINGS_START_MINIMIZED_DESC =
  'Keep the main window hidden during Windows login startup.'

/** English copy matching Kun's desktopStartMinimizedDisabledDesc locale string. */
export const GENERAL_SETTINGS_START_MINIMIZED_DISABLED_DESC =
  'Enable Open at login first. This option applies to Windows startup.'

/** English copy matching Kun's desktopCloseAction locale string. */
export const GENERAL_SETTINGS_CLOSE_ACTION_LABEL = 'Window close behavior'

/** English copy matching Kun's desktopCloseActionDesc locale string. */
export const GENERAL_SETTINGS_CLOSE_ACTION_DESC =
  'Choose what happens when the main window close button is pressed.'

/** English copy matching Kun's desktopCloseAction_* locale strings. */
export const GENERAL_SETTINGS_CLOSE_ACTION_LABELS: Record<GeneralSettingsCloseAction, string> = {
  ask: 'Ask every time',
  tray: 'Minimize to tray',
  quit: 'Quit app',
}

/** English copy matching Kun's turnCompleteNotification locale string. */
export const GENERAL_SETTINGS_TURN_COMPLETE_NOTIFICATION_LABEL = 'Reply completion notifications'

/** English copy matching Kun's turnCompleteNotificationDesc locale string. */
export const GENERAL_SETTINGS_TURN_COMPLETE_NOTIFICATION_DESC =
  'Show a native Windows/macOS notification when the AI assistant finishes replying.'

/** English copy matching Kun's onboardingPreview locale string. */
export const GENERAL_SETTINGS_ONBOARDING_PREVIEW_TITLE = 'First-run setup guide'

/** English copy matching Kun's onboardingPreviewDesc locale string. */
export const GENERAL_SETTINGS_ONBOARDING_PREVIEW_DESC =
  'Reopen the basic setup flow shown on first launch.'

/** English copy matching Kun's onboardingPreviewOpen locale string. */
export const GENERAL_SETTINGS_ONBOARDING_PREVIEW_OPEN = 'Open guide'

/** English copy matching Kun's legacyImportTitle locale string. */
export const GENERAL_SETTINGS_LEGACY_IMPORT_TITLE = 'Import legacy conversations'

/** Navi-branded equivalent of Kun's legacyImportDesc locale string. */
export const GENERAL_SETTINGS_LEGACY_IMPORT_DESC =
  'Bring conversations from a previous DeepSeek GUI installation into Navi.'

/** English copy matching Kun's legacyImportScanning locale string. */
export const GENERAL_SETTINGS_LEGACY_IMPORT_SCANNING =
  'Scanning for previous conversations…'

/** English copy matching Kun's legacyImportAllPresent locale string. */
export const GENERAL_SETTINGS_LEGACY_IMPORT_ALL_PRESENT =
  'Previous conversations are already imported.'

/** English copy matching Kun's legacyImportNoneFound locale string. */
export const GENERAL_SETTINGS_LEGACY_IMPORT_NONE_FOUND =
  'No previous conversations found on this computer.'

/** English copy matching Kun's legacyImportButton locale string. */
export const GENERAL_SETTINGS_LEGACY_IMPORT_BUTTON = 'Import all'

/** English copy matching Kun's legacyImportPick locale string. */
export const GENERAL_SETTINGS_LEGACY_IMPORT_PICK = 'Choose folder…'

/** English copy matching Kun's legacyImportRestarting locale string. */
export const GENERAL_SETTINGS_LEGACY_IMPORT_RESTARTING = 'Restarting…'

/** English copy matching Kun's logTitle locale string. */
export const GENERAL_SETTINGS_LOG_TITLE = 'Local error log'

/** English copy matching Kun's logEnabled locale string. */
export const GENERAL_SETTINGS_LOG_ENABLED_LABEL = 'Enable error logging'

/** English copy matching Kun's logEnabledDesc locale string. */
export const GENERAL_SETTINGS_LOG_ENABLED_DESC =
  'Write tool call errors, request failures, app errors, and local assistant service output to log files. Logs are cleaned up automatically.'

/** English copy matching Kun's logRetention locale string. */
export const GENERAL_SETTINGS_LOG_RETENTION_LABEL = 'Retention'

/** English copy matching Kun's logRetentionDesc locale string. */
export const GENERAL_SETTINGS_LOG_RETENTION_DESC =
  'Delete log files older than the selected number of days.'

/** English copy matching Kun's logRetention* locale strings. */
export const GENERAL_SETTINGS_LOG_RETENTION_ONE = '1 day'
export const GENERAL_SETTINGS_LOG_RETENTION_TWO = '2 days'
export const GENERAL_SETTINGS_LOG_RETENTION_THREE = '3 days'
export const GENERAL_SETTINGS_LOG_RETENTION_FIVE = '5 days'
export const GENERAL_SETTINGS_LOG_RETENTION_SEVEN = '7 days'

/** English copy matching Kun's logDir locale string. */
export const GENERAL_SETTINGS_LOG_DIR_LABEL = 'Log directory'

/** English copy matching Kun's logDirDesc locale string. */
export const GENERAL_SETTINGS_LOG_DIR_DESC =
  'App error logs and local assistant service output are written to daily files in this folder.'

/** English copy matching Kun's logDirOpen locale string. */
export const GENERAL_SETTINGS_LOG_DIR_OPEN = 'Open folder'

/** Resolve font-scale label matching Kun's fontScaleSmall/Medium/Large keys. */
export function resolveGeneralSettingsFontScaleLabel(
  scale: GeneralSettingsFontScale,
): string {
  if (scale === 'large') return GENERAL_SETTINGS_FONT_SCALE_LARGE
  if (scale === 'medium') return GENERAL_SETTINGS_FONT_SCALE_MEDIUM
  return GENERAL_SETTINGS_FONT_SCALE_SMALL
}

/** Format current font-scale label matching Kun's fontScaleCurrent template. */
export function formatGeneralSettingsFontScaleCurrent(value: string): string {
  return `Current: ${value}`
}

/** Format legacy-import found status matching Kun's legacyImportFound template. */
export function formatGeneralSettingsLegacyImportFound(count: number): string {
  return `Found ${count} conversation(s) ready to import.`
}

/** Format legacy-import source count matching Kun's legacyImportSourceCount template. */
export function formatGeneralSettingsLegacyImportSourceCount(
  newCount: number,
  total: number,
): string {
  return `${newCount} new / ${total} total`
}

/** Resolve close-action option label matching Kun's desktopCloseAction_* keys. */
export function resolveGeneralSettingsCloseActionLabel(
  action: GeneralSettingsCloseAction,
): string {
  return GENERAL_SETTINGS_CLOSE_ACTION_LABELS[action]
}
