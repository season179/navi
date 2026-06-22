// Kun Sidebar chrome
// (../Kun/src/renderer/src/components/chat/Sidebar.tsx).
// Visual only — used for production Sidebar and preview hooks.

/** Navi-branded equivalent of Kun's appName locale string. */
export const SIDEBAR_APP_NAME = 'Navi'

/** English copy matching Kun's focusMode locale string. */
export const SIDEBAR_FOCUS_MODE_LABEL = 'Focus'

/** English copy matching Kun's switchOn locale string. */
export const SIDEBAR_SWITCH_ON_LABEL = 'On'

/** English copy matching Kun's switchOff locale string. */
export const SIDEBAR_SWITCH_OFF_LABEL = 'Off'

/** Navi-branded equivalent of Kun's focusModeToggleTitle locale string. */
export const SIDEBAR_FOCUS_MODE_TOGGLE_TITLE = 'Focus mode: quiet Navi animations'

/** English copy matching Kun's focusModeToggleLabel locale string. */
export const SIDEBAR_FOCUS_MODE_TOGGLE_ARIA_LABEL = 'Toggle focus mode'

/** English copy matching Kun's claw locale string. */
export const SIDEBAR_CLAW_LABEL = 'Connect phone'

/** English copy matching Kun's settings locale string. */
export const SIDEBAR_SETTINGS_LABEL = 'Settings'

/** English copy matching Kun's newAgent locale string. */
export const SIDEBAR_NEW_AGENT_LABEL = 'New Agent'

/** English copy matching Kun's sddNewRequirement locale string. */
export const SIDEBAR_SDD_NEW_REQUIREMENT_LABEL = 'New requirement'

/** English copy matching Kun's plugins locale string. */
export const SIDEBAR_PLUGINS_LABEL = 'Plugins'

/** English copy matching Kun's schedule locale string. */
export const SIDEBAR_SCHEDULE_LABEL = 'Scheduled tasks'

/** English copy matching Kun's runtimeActionNeedsConnection locale string. */
export const SIDEBAR_RUNTIME_ACTION_NEEDS_CONNECTION =
  'Connect to the runtime before using AI actions.'

/** Resolve focus-mode toggle title matching Kun's `${title} · ${status}` pattern. */
export function formatFocusModeToggleTitle(enabled: boolean): string {
  return `${SIDEBAR_FOCUS_MODE_TOGGLE_TITLE} · ${enabled ? SIDEBAR_SWITCH_ON_LABEL : SIDEBAR_SWITCH_OFF_LABEL}`
}
