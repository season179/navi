import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.general-settings-section-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'generalSettingsSection.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  GENERAL_SETTINGS_BROWSE_LABEL,
  GENERAL_SETTINGS_CLOSE_ACTION_DESC,
  GENERAL_SETTINGS_CLOSE_ACTION_LABEL,
  GENERAL_SETTINGS_CLOSE_ACTION_LABELS,
  GENERAL_SETTINGS_CURSOR_SPOTLIGHT_DESC,
  GENERAL_SETTINGS_CURSOR_SPOTLIGHT_LABEL,
  GENERAL_SETTINGS_DESKTOP_BEHAVIOR_TITLE,
  GENERAL_SETTINGS_FONT_SCALE_DESC,
  GENERAL_SETTINGS_FONT_SCALE_LABEL,
  GENERAL_SETTINGS_FONT_SCALE_LARGE,
  GENERAL_SETTINGS_FONT_SCALE_MEDIUM,
  GENERAL_SETTINGS_FONT_SCALE_SMALL,
  GENERAL_SETTINGS_LANGUAGE_DESC,
  GENERAL_SETTINGS_LANGUAGE_LABEL,
  GENERAL_SETTINGS_LEGACY_IMPORT_ALL_PRESENT,
  GENERAL_SETTINGS_LEGACY_IMPORT_BUTTON,
  GENERAL_SETTINGS_LEGACY_IMPORT_DESC,
  GENERAL_SETTINGS_LEGACY_IMPORT_NONE_FOUND,
  GENERAL_SETTINGS_LEGACY_IMPORT_PICK,
  GENERAL_SETTINGS_LEGACY_IMPORT_RESTARTING,
  GENERAL_SETTINGS_LEGACY_IMPORT_SCANNING,
  GENERAL_SETTINGS_LEGACY_IMPORT_TITLE,
  GENERAL_SETTINGS_LOG_DIR_DESC,
  GENERAL_SETTINGS_LOG_DIR_LABEL,
  GENERAL_SETTINGS_LOG_DIR_OPEN,
  GENERAL_SETTINGS_LOG_ENABLED_DESC,
  GENERAL_SETTINGS_LOG_ENABLED_LABEL,
  GENERAL_SETTINGS_LOG_RETENTION_DESC,
  GENERAL_SETTINGS_LOG_RETENTION_FIVE,
  GENERAL_SETTINGS_LOG_RETENTION_LABEL,
  GENERAL_SETTINGS_LOG_RETENTION_ONE,
  GENERAL_SETTINGS_LOG_RETENTION_SEVEN,
  GENERAL_SETTINGS_LOG_RETENTION_THREE,
  GENERAL_SETTINGS_LOG_RETENTION_TWO,
  GENERAL_SETTINGS_LOG_TITLE,
  GENERAL_SETTINGS_ONBOARDING_PREVIEW_DESC,
  GENERAL_SETTINGS_ONBOARDING_PREVIEW_OPEN,
  GENERAL_SETTINGS_ONBOARDING_PREVIEW_TITLE,
  GENERAL_SETTINGS_OPEN_AT_LOGIN_DESC,
  GENERAL_SETTINGS_OPEN_AT_LOGIN_LABEL,
  GENERAL_SETTINGS_OPEN_AT_LOGIN_UNSUPPORTED_DESC,
  GENERAL_SETTINGS_RESTORE_WORKSPACE_DEFAULT,
  GENERAL_SETTINGS_SECTION_TITLE,
  GENERAL_SETTINGS_START_MINIMIZED_DESC,
  GENERAL_SETTINGS_START_MINIMIZED_DISABLED_DESC,
  GENERAL_SETTINGS_START_MINIMIZED_LABEL,
  GENERAL_SETTINGS_THEME_DARK,
  GENERAL_SETTINGS_THEME_DESC,
  GENERAL_SETTINGS_THEME_LABEL,
  GENERAL_SETTINGS_THEME_LIGHT,
  GENERAL_SETTINGS_THEME_SYSTEM,
  GENERAL_SETTINGS_TURN_COMPLETE_NOTIFICATION_DESC,
  GENERAL_SETTINGS_TURN_COMPLETE_NOTIFICATION_LABEL,
  GENERAL_SETTINGS_WORKSPACE_ROOT_DESC,
  GENERAL_SETTINGS_WORKSPACE_ROOT_LABEL,
  GENERAL_SETTINGS_WORKSPACE_ROOT_PLACEHOLDER,
  formatGeneralSettingsFontScaleCurrent,
  formatGeneralSettingsLegacyImportFound,
  formatGeneralSettingsLegacyImportSourceCount,
  resolveGeneralSettingsCloseActionLabel,
  resolveGeneralSettingsFontScaleLabel,
} = await import(out)

test('general settings section copy matches Kun locale strings', () => {
  assert.equal(GENERAL_SETTINGS_SECTION_TITLE, 'Basics')
  assert.equal(GENERAL_SETTINGS_LANGUAGE_LABEL, 'Language')
  assert.equal(GENERAL_SETTINGS_LANGUAGE_DESC, 'Applied immediately when selected.')
  assert.equal(GENERAL_SETTINGS_THEME_LABEL, 'Theme')
  assert.equal(GENERAL_SETTINGS_THEME_DESC, 'Light, dark, or match the operating system.')
  assert.equal(GENERAL_SETTINGS_THEME_SYSTEM, 'System')
  assert.equal(GENERAL_SETTINGS_THEME_LIGHT, 'Light')
  assert.equal(GENERAL_SETTINGS_THEME_DARK, 'Dark')
  assert.equal(GENERAL_SETTINGS_FONT_SCALE_LABEL, 'Font size')
  assert.equal(GENERAL_SETTINGS_FONT_SCALE_DESC, 'Adjust the overall UI text size.')
  assert.equal(GENERAL_SETTINGS_FONT_SCALE_SMALL, 'Small')
  assert.equal(GENERAL_SETTINGS_FONT_SCALE_MEDIUM, 'Medium')
  assert.equal(GENERAL_SETTINGS_FONT_SCALE_LARGE, 'Large')
  assert.equal(GENERAL_SETTINGS_WORKSPACE_ROOT_LABEL, 'Default working directory')
  assert.equal(
    GENERAL_SETTINGS_WORKSPACE_ROOT_DESC,
    'First launch uses ~/.navi/default_workspace by default, and you can change it to another directory.',
  )
  assert.equal(GENERAL_SETTINGS_WORKSPACE_ROOT_PLACEHOLDER, '~/.navi/default_workspace')
  assert.equal(GENERAL_SETTINGS_RESTORE_WORKSPACE_DEFAULT, 'Restore default')
  assert.equal(GENERAL_SETTINGS_BROWSE_LABEL, 'Browse')
  assert.equal(GENERAL_SETTINGS_CURSOR_SPOTLIGHT_LABEL, 'Interactive effects')
  assert.equal(
    GENERAL_SETTINGS_CURSOR_SPOTLIGHT_DESC,
    'Show a soft cursor-follow spotlight on the title bar and sidebar.',
  )
  assert.equal(GENERAL_SETTINGS_DESKTOP_BEHAVIOR_TITLE, 'Desktop behavior')
  assert.equal(GENERAL_SETTINGS_OPEN_AT_LOGIN_LABEL, 'Open at login')
  assert.equal(GENERAL_SETTINGS_OPEN_AT_LOGIN_DESC, 'Start Navi automatically after you sign in.')
  assert.equal(
    GENERAL_SETTINGS_OPEN_AT_LOGIN_UNSUPPORTED_DESC,
    'Open at login is available on Windows and macOS.',
  )
  assert.equal(GENERAL_SETTINGS_START_MINIMIZED_LABEL, 'Start minimized')
  assert.equal(
    GENERAL_SETTINGS_START_MINIMIZED_DESC,
    'Keep the main window hidden during Windows login startup.',
  )
  assert.equal(
    GENERAL_SETTINGS_START_MINIMIZED_DISABLED_DESC,
    'Enable Open at login first. This option applies to Windows startup.',
  )
  assert.equal(GENERAL_SETTINGS_CLOSE_ACTION_LABEL, 'Window close behavior')
  assert.equal(
    GENERAL_SETTINGS_CLOSE_ACTION_DESC,
    'Choose what happens when the main window close button is pressed.',
  )
  assert.equal(GENERAL_SETTINGS_CLOSE_ACTION_LABELS.ask, 'Ask every time')
  assert.equal(GENERAL_SETTINGS_CLOSE_ACTION_LABELS.tray, 'Minimize to tray')
  assert.equal(GENERAL_SETTINGS_CLOSE_ACTION_LABELS.quit, 'Quit app')
  assert.equal(
    GENERAL_SETTINGS_TURN_COMPLETE_NOTIFICATION_LABEL,
    'Reply completion notifications',
  )
  assert.equal(
    GENERAL_SETTINGS_TURN_COMPLETE_NOTIFICATION_DESC,
    'Show a native Windows/macOS notification when the AI assistant finishes replying.',
  )
  assert.equal(GENERAL_SETTINGS_ONBOARDING_PREVIEW_TITLE, 'First-run setup guide')
  assert.equal(
    GENERAL_SETTINGS_ONBOARDING_PREVIEW_DESC,
    'Reopen the basic setup flow shown on first launch.',
  )
  assert.equal(GENERAL_SETTINGS_ONBOARDING_PREVIEW_OPEN, 'Open guide')
  assert.equal(GENERAL_SETTINGS_LEGACY_IMPORT_TITLE, 'Import legacy conversations')
  assert.equal(
    GENERAL_SETTINGS_LEGACY_IMPORT_DESC,
    'Bring conversations from a previous DeepSeek GUI installation into Navi.',
  )
  assert.equal(
    GENERAL_SETTINGS_LEGACY_IMPORT_SCANNING,
    'Scanning for previous conversations…',
  )
  assert.equal(
    GENERAL_SETTINGS_LEGACY_IMPORT_ALL_PRESENT,
    'Previous conversations are already imported.',
  )
  assert.equal(
    GENERAL_SETTINGS_LEGACY_IMPORT_NONE_FOUND,
    'No previous conversations found on this computer.',
  )
  assert.equal(GENERAL_SETTINGS_LEGACY_IMPORT_BUTTON, 'Import all')
  assert.equal(GENERAL_SETTINGS_LEGACY_IMPORT_PICK, 'Choose folder…')
  assert.equal(GENERAL_SETTINGS_LEGACY_IMPORT_RESTARTING, 'Restarting…')
  assert.equal(GENERAL_SETTINGS_LOG_TITLE, 'Local error log')
  assert.equal(GENERAL_SETTINGS_LOG_ENABLED_LABEL, 'Enable error logging')
  assert.equal(
    GENERAL_SETTINGS_LOG_ENABLED_DESC,
    'Write tool call errors, request failures, app errors, and local assistant service output to log files. Logs are cleaned up automatically.',
  )
  assert.equal(GENERAL_SETTINGS_LOG_RETENTION_LABEL, 'Retention')
  assert.equal(
    GENERAL_SETTINGS_LOG_RETENTION_DESC,
    'Delete log files older than the selected number of days.',
  )
  assert.equal(GENERAL_SETTINGS_LOG_RETENTION_ONE, '1 day')
  assert.equal(GENERAL_SETTINGS_LOG_RETENTION_TWO, '2 days')
  assert.equal(GENERAL_SETTINGS_LOG_RETENTION_THREE, '3 days')
  assert.equal(GENERAL_SETTINGS_LOG_RETENTION_FIVE, '5 days')
  assert.equal(GENERAL_SETTINGS_LOG_RETENTION_SEVEN, '7 days')
  assert.equal(GENERAL_SETTINGS_LOG_DIR_LABEL, 'Log directory')
  assert.equal(
    GENERAL_SETTINGS_LOG_DIR_DESC,
    'App error logs and local assistant service output are written to daily files in this folder.',
  )
  assert.equal(GENERAL_SETTINGS_LOG_DIR_OPEN, 'Open folder')
})

test('general settings section formatters match Kun templates', () => {
  assert.equal(resolveGeneralSettingsFontScaleLabel('small'), 'Small')
  assert.equal(resolveGeneralSettingsFontScaleLabel('medium'), 'Medium')
  assert.equal(resolveGeneralSettingsFontScaleLabel('large'), 'Large')
  assert.equal(formatGeneralSettingsFontScaleCurrent('Medium'), 'Current: Medium')
  assert.equal(
    formatGeneralSettingsLegacyImportFound(3),
    'Found 3 conversation(s) ready to import.',
  )
  assert.equal(formatGeneralSettingsLegacyImportSourceCount(4, 12), '4 new / 12 total')
  assert.equal(resolveGeneralSettingsCloseActionLabel('quit'), 'Quit app')
})
