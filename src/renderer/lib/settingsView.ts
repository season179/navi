// Kun SettingsView chrome
// (../Kun/src/renderer/src/components/SettingsView.tsx).
// Visual only — used for production SettingsView and preview hooks.

export type SettingsViewSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

/** English copy matching Kun's settings title locale string. */
export const SETTINGS_VIEW_TITLE = 'Settings'

/** English copy matching Kun's settings subtitle locale string. */
export const SETTINGS_VIEW_SUBTITLE =
  'Manage API access, interface preferences, default folders, and assistant behavior.'

/** English copy matching Kun's autoApplyHint locale string. */
export const SETTINGS_VIEW_AUTO_APPLY_HINT = 'Changes apply automatically'

/** English copy matching Kun's applying locale string. */
export const SETTINGS_VIEW_APPLYING_LABEL = 'Applying…'

/** English copy matching Kun's applied locale string. */
export const SETTINGS_VIEW_APPLIED_LABEL = 'Applied'

/** English copy matching Kun's applyFailed locale string. */
export const SETTINGS_VIEW_APPLY_FAILED_LABEL = 'Could not apply'

/** English copy matching Kun's autoApplyBlocked locale string. */
export const SETTINGS_VIEW_AUTO_APPLY_BLOCKED_LABEL = 'Fix the port to apply changes'

/** English copy matching Kun's retrySave locale string. */
export const SETTINGS_VIEW_RETRY_SAVE_LABEL = 'Retry'

/** English copy matching Kun's apiKeyRequiredTitle locale string. */
export const SETTINGS_VIEW_API_KEY_REQUIRED_TITLE = 'API key required'

/** English copy matching Kun's apiKeyRequiredBody locale string. */
export const SETTINGS_VIEW_API_KEY_REQUIRED_BODY =
  'Add an API key in Providers first. Once entered, the app can start the local AI assistant service for you.'

/** Preview-only mock error message for settingsViewPreview error mode. */
export const SETTINGS_VIEW_PREVIEW_APPLY_ERROR_MESSAGE =
  'Could not write settings to disk. Check permissions and try again.'

/** Resolve save-status pill label matching Kun's SettingsView status chip. */
export function resolveSettingsViewSaveStatusLabel(
  saveStatus: SettingsViewSaveStatus,
  portError: boolean,
): string {
  if (portError) return SETTINGS_VIEW_AUTO_APPLY_BLOCKED_LABEL
  if (saveStatus === 'saving') return SETTINGS_VIEW_APPLYING_LABEL
  if (saveStatus === 'saved') return SETTINGS_VIEW_APPLIED_LABEL
  if (saveStatus === 'error') return SETTINGS_VIEW_APPLY_FAILED_LABEL
  return SETTINGS_VIEW_AUTO_APPLY_HINT
}
