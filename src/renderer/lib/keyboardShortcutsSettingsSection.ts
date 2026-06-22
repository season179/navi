// Kun KeyboardShortcutsSettingsSection chrome
// (../Kun/src/renderer/src/components/settings-section-shortcuts.tsx).
// Visual only — used for production KeyboardShortcutsSettingsSection and preview hooks.

export type KeyboardShortcutSettingsCommandId =
  | 'toggle-plan-mode'
  | 'new-chat'
  | 'choose-workspace'
  | 'settings'
  | 'quit'
  | 'undo'
  | 'redo'
  | 'cut'
  | 'copy'
  | 'paste'
  | 'select-all'
  | 'reload'
  | 'zoom-in'
  | 'zoom-out'
  | 'reset-zoom'
  | 'toggle-devtools'
  | 'close'
  | 'minimize'
  | 'toggle-maximize'

export type KeyboardShortcutSettingsCommand = {
  id: KeyboardShortcutSettingsCommandId
  label: string
  description: string
  defaultBindings: string[]
}

/** English copy matching Kun's keyboardShortcuts locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_TITLE = 'Keyboard shortcuts'

/** English copy matching Kun's shortcutSearchPlaceholder locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SEARCH_PLACEHOLDER = 'Search shortcuts'

/** English copy matching Kun's shortcutCommandColumn locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_COMMAND_COLUMN = 'Command'

/** English copy matching Kun's shortcutBindingColumn locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_BINDING_COLUMN = 'Key binding'

/** English copy matching Kun's shortcutCaptureHint locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_CAPTURE_HINT =
  'Press the new shortcut. Press Esc to cancel.'

/** English copy matching Kun's shortcutRecording locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_RECORDING = 'Press keys'

/** English copy matching Kun's shortcutUnassigned locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_UNASSIGNED = 'Unassigned'

/** English copy matching Kun's shortcutReset locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_RESET = 'Reset shortcut'

/** Format Kun's shortcutConflict locale string. */
export function formatKeyboardShortcutsSettingsConflict(command: string): string {
  return `Already used by "${command}".`
}

/** English copy matching Kun's shortcutTogglePlanMode locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_TOGGLE_PLAN_MODE = 'Toggle Plan mode'

/** English copy matching Kun's shortcutTogglePlanModeDesc locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_TOGGLE_PLAN_MODE_DESC =
  'Switch the composer between Agent and Plan mode.'

/** English copy matching Kun's shortcutNewChat locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_NEW_CHAT = 'New chat'

/** English copy matching Kun's shortcutNewChatDesc locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_NEW_CHAT_DESC =
  'Start a new chat in the current workspace.'

/** English copy matching Kun's shortcutChooseWorkspace locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_CHOOSE_WORKSPACE = 'Choose workspace'

/** English copy matching Kun's shortcutChooseWorkspaceDesc locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_CHOOSE_WORKSPACE_DESC =
  'Open the workspace picker.'

/** English copy matching Kun's shortcutSettings locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_SETTINGS = 'Settings'

/** English copy matching Kun's shortcutSettingsDesc locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_SETTINGS_DESC = 'Open settings.'

/** English copy matching Kun's shortcutQuit locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_QUIT = 'Quit'

/** English copy matching Kun's shortcutQuitDesc locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_QUIT_DESC = 'Quit the app.'

/** English copy matching Kun's shortcutUndo locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_UNDO = 'Undo'

/** English copy matching Kun's shortcutUndoDesc locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_UNDO_DESC = 'Undo the current edit.'

/** English copy matching Kun's shortcutRedo locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_REDO = 'Redo'

/** English copy matching Kun's shortcutRedoDesc locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_REDO_DESC = 'Redo the current edit.'

/** English copy matching Kun's shortcutCut locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_CUT = 'Cut'

/** English copy matching Kun's shortcutCutDesc locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_CUT_DESC = 'Cut the current selection.'

/** English copy matching Kun's shortcutCopy locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_COPY = 'Copy'

/** English copy matching Kun's shortcutCopyDesc locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_COPY_DESC = 'Copy the current selection.'

/** English copy matching Kun's shortcutPaste locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_PASTE = 'Paste'

/** English copy matching Kun's shortcutPasteDesc locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_PASTE_DESC = 'Paste from the clipboard.'

/** English copy matching Kun's shortcutSelectAll locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_SELECT_ALL = 'Select all'

/** English copy matching Kun's shortcutSelectAllDesc locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_SELECT_ALL_DESC =
  'Select content in the focused view.'

/** English copy matching Kun's shortcutReload locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_RELOAD = 'Reload'

/** English copy matching Kun's shortcutReloadDesc locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_RELOAD_DESC = 'Reload the app window.'

/** English copy matching Kun's shortcutZoomIn locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_ZOOM_IN = 'Zoom in'

/** English copy matching Kun's shortcutZoomInDesc locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_ZOOM_IN_DESC =
  'Increase the window zoom level.'

/** English copy matching Kun's shortcutZoomOut locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_ZOOM_OUT = 'Zoom out'

/** English copy matching Kun's shortcutZoomOutDesc locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_ZOOM_OUT_DESC =
  'Decrease the window zoom level.'

/** English copy matching Kun's shortcutResetZoom locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_RESET_ZOOM = 'Reset zoom'

/** English copy matching Kun's shortcutResetZoomDesc locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_RESET_ZOOM_DESC = 'Reset the window zoom level.'

/** English copy matching Kun's shortcutDevTools locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_DEV_TOOLS = 'Developer tools'

/** English copy matching Kun's shortcutDevToolsDesc locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_DEV_TOOLS_DESC = 'Toggle developer tools.'

/** English copy matching Kun's shortcutCloseWindow locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_CLOSE_WINDOW = 'Close window'

/** English copy matching Kun's shortcutCloseWindowDesc locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_CLOSE_WINDOW_DESC = 'Close the main window.'

/** English copy matching Kun's shortcutMinimize locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_MINIMIZE = 'Minimize window'

/** English copy matching Kun's shortcutMinimizeDesc locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_MINIMIZE_DESC = 'Minimize the main window.'

/** English copy matching Kun's shortcutToggleMaximize locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_TOGGLE_MAXIMIZE = 'Maximize window'

/** English copy matching Kun's shortcutToggleMaximizeDesc locale string. */
export const KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_TOGGLE_MAXIMIZE_DESC =
  'Maximize or restore the main window.'

/** Kun KEYBOARD_SHORTCUT_COMMANDS with resolved English labels. */
export const KEYBOARD_SHORTCUT_SETTINGS_COMMANDS: readonly KeyboardShortcutSettingsCommand[] = [
  {
    id: 'toggle-plan-mode',
    label: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_TOGGLE_PLAN_MODE,
    description: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_TOGGLE_PLAN_MODE_DESC,
    defaultBindings: ['Shift+Tab'],
  },
  {
    id: 'new-chat',
    label: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_NEW_CHAT,
    description: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_NEW_CHAT_DESC,
    defaultBindings: ['Ctrl+N'],
  },
  {
    id: 'choose-workspace',
    label: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_CHOOSE_WORKSPACE,
    description: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_CHOOSE_WORKSPACE_DESC,
    defaultBindings: ['Ctrl+O'],
  },
  {
    id: 'settings',
    label: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_SETTINGS,
    description: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_SETTINGS_DESC,
    defaultBindings: ['Ctrl+,'],
  },
  {
    id: 'quit',
    label: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_QUIT,
    description: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_QUIT_DESC,
    defaultBindings: ['Alt+F4'],
  },
  {
    id: 'undo',
    label: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_UNDO,
    description: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_UNDO_DESC,
    defaultBindings: ['Ctrl+Z'],
  },
  {
    id: 'redo',
    label: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_REDO,
    description: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_REDO_DESC,
    defaultBindings: ['Ctrl+Y'],
  },
  {
    id: 'cut',
    label: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_CUT,
    description: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_CUT_DESC,
    defaultBindings: ['Ctrl+X'],
  },
  {
    id: 'copy',
    label: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_COPY,
    description: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_COPY_DESC,
    defaultBindings: ['Ctrl+C'],
  },
  {
    id: 'paste',
    label: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_PASTE,
    description: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_PASTE_DESC,
    defaultBindings: ['Ctrl+V'],
  },
  {
    id: 'select-all',
    label: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_SELECT_ALL,
    description: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_SELECT_ALL_DESC,
    defaultBindings: ['Ctrl+A'],
  },
  {
    id: 'reload',
    label: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_RELOAD,
    description: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_RELOAD_DESC,
    defaultBindings: ['Ctrl+R'],
  },
  {
    id: 'zoom-in',
    label: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_ZOOM_IN,
    description: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_ZOOM_IN_DESC,
    defaultBindings: ['Ctrl++'],
  },
  {
    id: 'zoom-out',
    label: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_ZOOM_OUT,
    description: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_ZOOM_OUT_DESC,
    defaultBindings: ['Ctrl+-'],
  },
  {
    id: 'reset-zoom',
    label: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_RESET_ZOOM,
    description: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_RESET_ZOOM_DESC,
    defaultBindings: ['Ctrl+0'],
  },
  {
    id: 'toggle-devtools',
    label: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_DEV_TOOLS,
    description: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_DEV_TOOLS_DESC,
    defaultBindings: ['Ctrl+Shift+I'],
  },
  {
    id: 'close',
    label: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_CLOSE_WINDOW,
    description: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_CLOSE_WINDOW_DESC,
    defaultBindings: ['Ctrl+W'],
  },
  {
    id: 'minimize',
    label: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_MINIMIZE,
    description: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_MINIMIZE_DESC,
    defaultBindings: [],
  },
  {
    id: 'toggle-maximize',
    label: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_TOGGLE_MAXIMIZE,
    description: KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_TOGGLE_MAXIMIZE_DESC,
    defaultBindings: [],
  },
]

/** Resolve a command label by id for conflict messages. */
export function resolveKeyboardShortcutsSettingsCommandLabel(
  commandId: KeyboardShortcutSettingsCommandId,
): string {
  return (
    KEYBOARD_SHORTCUT_SETTINGS_COMMANDS.find((item) => item.id === commandId)?.label ?? commandId
  )
}
