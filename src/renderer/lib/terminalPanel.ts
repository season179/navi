// Kun TerminalPanel chrome
// (../Kun/src/renderer/src/components/terminal/TerminalPanel.tsx).
// Visual only — used for production TerminalPanel and preview hooks.

/** English copy matching Kun's terminalPanelTitle locale string. */
export const TERMINAL_PANEL_TITLE = 'Terminal'

/** English copy matching Kun's terminalClear locale string. */
export const TERMINAL_CLEAR_LABEL = 'Clear terminal'

/** English copy matching Kun's terminalRestart locale string. */
export const TERMINAL_RESTART_LABEL = 'Restart terminal'

/** English copy matching Kun's terminalNewTab locale string. */
export const TERMINAL_NEW_TAB_LABEL = 'New terminal tab'

/** English copy matching Kun's terminalCloseTab locale string. */
export const TERMINAL_CLOSE_TAB_LABEL = 'Close terminal tab'

/** English copy matching Kun's terminalTabMenuTitle locale string. */
export const TERMINAL_TAB_MENU_TITLE = 'Terminal tab actions'

/** English copy matching Kun's terminalRenameTab locale string. */
export const TERMINAL_RENAME_TAB_LABEL = 'Rename terminal tab'

/** English copy matching Kun's terminalCloseOtherTabs locale string. */
export const TERMINAL_CLOSE_OTHER_TABS_LABEL = 'Close other terminal tabs'

/** English copy matching Kun's terminalCloseAllTabs locale string. */
export const TERMINAL_CLOSE_ALL_TABS_LABEL = 'Close all terminal tabs'

/** English copy matching Kun's terminalExitMessage locale string. */
export const TERMINAL_EXIT_MESSAGE = 'Process exited — click to restart'

/** English copy matching Kun's terminalUnavailable locale string. */
export const TERMINAL_UNAVAILABLE_LABEL = 'Terminal unavailable'

/** English copy matching Kun's rightPanelCollapse locale string. */
export const TERMINAL_PANEL_COLLAPSE_LABEL = 'Collapse right sidebar'

/** English copy matching Kun's terminalTabTitle locale string. */
export const TERMINAL_TAB_TITLE_TEMPLATE = 'Terminal {{index}}'

export function formatTerminalTabTitle(index: number): string {
  return TERMINAL_TAB_TITLE_TEMPLATE.replace('{{index}}', String(index))
}
