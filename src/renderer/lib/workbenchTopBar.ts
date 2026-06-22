// Kun WorkbenchTopBar chrome
// (../Kun/src/renderer/src/components/chat/WorkbenchTopBar.tsx).
// Visual only — used for production WorkbenchTopBar and preview hooks.

/** English copy matching Kun's rightPanelTodo locale string. */
export const WORKBENCH_RIGHT_PANEL_TODO_LABEL = 'Todo'

/** English copy matching Kun's rightPanelPlan locale string. */
export const WORKBENCH_RIGHT_PANEL_PLAN_LABEL = 'Plan'

/** English copy matching Kun's rightPanelChanges locale string. */
export const WORKBENCH_RIGHT_PANEL_CHANGES_LABEL = 'Changes'

/** English copy matching Kun's rightPanelBrowser locale string. */
export const WORKBENCH_RIGHT_PANEL_BROWSER_LABEL = 'Preview'

/** English copy matching Kun's rightPanelTerminal locale string. */
export const WORKBENCH_RIGHT_PANEL_TERMINAL_LABEL = 'Terminal'

/** English copy matching Kun's rightPanelFiles locale string. */
export const WORKBENCH_RIGHT_PANEL_FILES_LABEL = 'Files'

/** English copy matching Kun's sidePanelOpen locale string. */
export const WORKBENCH_SIDE_PANEL_OPEN_LABEL = 'Open side chat'

/** English copy matching Kun's editorPickerTitle locale string. */
export const WORKBENCH_EDITOR_PICKER_TITLE = 'Choose default editor'

/** English copy matching Kun's editorPickerTitleWithEditor locale string. */
export const WORKBENCH_EDITOR_PICKER_TITLE_WITH_EDITOR_TEMPLATE = 'Default editor: {{editor}}'

/** English copy matching Kun's editorPickerMenuTitle locale string. */
export const WORKBENCH_EDITOR_PICKER_MENU_TITLE = 'Open files with'

/** English copy matching Kun's editorLineBadge locale string. */
export const WORKBENCH_EDITOR_LINE_BADGE = 'Line'

/** English copy matching Kun's guiUpdateTopbarAvailable locale string. */
export const WORKBENCH_GUI_UPDATE_TOPBAR_AVAILABLE_TEMPLATE = 'Update {{version}}'

/** English copy matching Kun's guiUpdateTopbarDownloading locale string. */
export const WORKBENCH_GUI_UPDATE_TOPBAR_DOWNLOADING_TEMPLATE = 'Updating {{percent}}%'

/** English copy matching Kun's guiUpdateTopbarInstalling locale string. */
export const WORKBENCH_GUI_UPDATE_TOPBAR_INSTALLING_LABEL = 'Installing…'

/** English copy matching Kun's settings:guiUpdateInstall locale string. */
export const WORKBENCH_GUI_UPDATE_INSTALL_LABEL = 'Restart and install'

/** English copy matching Kun's guiUpdateTopbarManual locale string. */
export const WORKBENCH_GUI_UPDATE_TOPBAR_MANUAL_TEMPLATE = 'Download {{version}}'

/** English copy matching Kun's settings:guiUpdateAvailable locale string. */
export const WORKBENCH_GUI_UPDATE_AVAILABLE_TEMPLATE =
  'New version available: {{current}} → {{latest}}'

/** English copy matching Kun's settings:guiUpdateAvailableManual locale string. */
export const WORKBENCH_GUI_UPDATE_AVAILABLE_MANUAL_TEMPLATE =
  'New version available: {{current}} → {{latest}}. Install it from the download page.'

export function formatEditorPickerTitleWithEditor(editor: string): string {
  return WORKBENCH_EDITOR_PICKER_TITLE_WITH_EDITOR_TEMPLATE.replace('{{editor}}', editor)
}

export function formatGuiUpdateTopbarAvailable(version: string): string {
  return WORKBENCH_GUI_UPDATE_TOPBAR_AVAILABLE_TEMPLATE.replace('{{version}}', version)
}

export function formatGuiUpdateTopbarDownloading(percent: number): string {
  return WORKBENCH_GUI_UPDATE_TOPBAR_DOWNLOADING_TEMPLATE.replace(
    '{{percent}}',
    String(Math.max(0, Math.round(percent))),
  )
}

export function formatGuiUpdateTopbarManual(version: string): string {
  return WORKBENCH_GUI_UPDATE_TOPBAR_MANUAL_TEMPLATE.replace('{{version}}', version)
}

export function formatGuiUpdateAvailable(current: string, latest: string): string {
  return WORKBENCH_GUI_UPDATE_AVAILABLE_TEMPLATE.replace('{{current}}', current).replace(
    '{{latest}}',
    latest,
  )
}

export function formatGuiUpdateAvailableManual(current: string, latest: string): string {
  return WORKBENCH_GUI_UPDATE_AVAILABLE_MANUAL_TEMPLATE.replace('{{current}}', current).replace(
    '{{latest}}',
    latest,
  )
}
