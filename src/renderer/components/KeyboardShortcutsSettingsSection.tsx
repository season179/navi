// Keyboard shortcuts settings section echoing Kun's settings-section-shortcuts.tsx
// (../Kun/src/renderer/src/components/settings-section-shortcuts.tsx).
// Visual only: mock bindings and preview modes.

import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react'
import { Keyboard, RotateCcw, Search } from 'lucide-react'
import { InlineNoticeView, SettingsCard, type InlineNotice } from './SettingsControls'

type KeyboardShortcutCommandId =
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

type KeyboardShortcutCommand = {
  id: KeyboardShortcutCommandId
  label: string
  description: string
  defaultBindings: string[]
}

type KeyboardShortcutsConfig = {
  bindings: Partial<Record<KeyboardShortcutCommandId, string[]>>
}

const KEYBOARD_SHORTCUT_COMMANDS: readonly KeyboardShortcutCommand[] = [
  {
    id: 'toggle-plan-mode',
    label: 'Toggle Plan mode',
    description: 'Switch the composer between Agent and Plan mode.',
    defaultBindings: ['Shift+Tab'],
  },
  {
    id: 'new-chat',
    label: 'New chat',
    description: 'Start a new chat in the current workspace.',
    defaultBindings: ['Ctrl+N'],
  },
  {
    id: 'choose-workspace',
    label: 'Choose workspace',
    description: 'Open the workspace picker.',
    defaultBindings: ['Ctrl+O'],
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Open settings.',
    defaultBindings: ['Ctrl+,'],
  },
  {
    id: 'quit',
    label: 'Quit',
    description: 'Quit the app.',
    defaultBindings: ['Alt+F4'],
  },
  {
    id: 'undo',
    label: 'Undo',
    description: 'Undo the current edit.',
    defaultBindings: ['Ctrl+Z'],
  },
  {
    id: 'redo',
    label: 'Redo',
    description: 'Redo the current edit.',
    defaultBindings: ['Ctrl+Y'],
  },
  {
    id: 'cut',
    label: 'Cut',
    description: 'Cut the current selection.',
    defaultBindings: ['Ctrl+X'],
  },
  {
    id: 'copy',
    label: 'Copy',
    description: 'Copy the current selection.',
    defaultBindings: ['Ctrl+C'],
  },
  {
    id: 'paste',
    label: 'Paste',
    description: 'Paste from the clipboard.',
    defaultBindings: ['Ctrl+V'],
  },
  {
    id: 'select-all',
    label: 'Select all',
    description: 'Select content in the focused view.',
    defaultBindings: ['Ctrl+A'],
  },
  {
    id: 'reload',
    label: 'Reload',
    description: 'Reload the app window.',
    defaultBindings: ['Ctrl+R'],
  },
  {
    id: 'zoom-in',
    label: 'Zoom in',
    description: 'Increase the window zoom level.',
    defaultBindings: ['Ctrl++'],
  },
  {
    id: 'zoom-out',
    label: 'Zoom out',
    description: 'Decrease the window zoom level.',
    defaultBindings: ['Ctrl+-'],
  },
  {
    id: 'reset-zoom',
    label: 'Reset zoom',
    description: 'Reset the window zoom level.',
    defaultBindings: ['Ctrl+0'],
  },
  {
    id: 'toggle-devtools',
    label: 'Developer tools',
    description: 'Toggle developer tools.',
    defaultBindings: ['Ctrl+Shift+I'],
  },
  {
    id: 'close',
    label: 'Close window',
    description: 'Close the main window.',
    defaultBindings: ['Ctrl+W'],
  },
  {
    id: 'minimize',
    label: 'Minimize window',
    description: 'Minimize the main window.',
    defaultBindings: [],
  },
  {
    id: 'toggle-maximize',
    label: 'Maximize window',
    description: 'Maximize or restore the main window.',
    defaultBindings: [],
  },
]

const COPY = {
  keyboardShortcuts: 'Keyboard shortcuts',
  shortcutSearchPlaceholder: 'Search shortcuts',
  shortcutCommandColumn: 'Command',
  shortcutBindingColumn: 'Key binding',
  shortcutCaptureHint: 'Press the new shortcut. Press Esc to cancel.',
  shortcutRecording: 'Press keys',
  shortcutUnassigned: 'Unassigned',
  shortcutReset: 'Reset shortcut',
  shortcutConflict: (command: string) => `Already used by "${command}".`,
}

export const KEYBOARD_SHORTCUTS_PREVIEW_CONFIG: KeyboardShortcutsConfig = {
  bindings: {},
}

function resolveKeyboardShortcutBindings(
  settings: KeyboardShortcutsConfig,
): Record<KeyboardShortcutCommandId, string[]> {
  const bindings = {} as Record<KeyboardShortcutCommandId, string[]>
  for (const command of KEYBOARD_SHORTCUT_COMMANDS) {
    const configured = settings.bindings[command.id]
    bindings[command.id] =
      configured && configured.length > 0 ? configured : [...command.defaultBindings]
  }
  return bindings
}

function findKeyboardShortcutConflict(
  bindings: Record<KeyboardShortcutCommandId, string[]>,
  commandId: KeyboardShortcutCommandId,
  shortcut: string,
): KeyboardShortcutCommandId | null {
  for (const command of KEYBOARD_SHORTCUT_COMMANDS) {
    if (command.id === commandId) continue
    if (bindings[command.id].includes(shortcut)) return command.id
  }
  return null
}

function commandLabel(commandId: KeyboardShortcutCommandId): string {
  return KEYBOARD_SHORTCUT_COMMANDS.find((item) => item.id === commandId)?.label ?? commandId
}

type Props = {
  config: KeyboardShortcutsConfig
  onChange: (config: KeyboardShortcutsConfig) => void
  initialQuery?: string
  initialCapturingCommandId?: KeyboardShortcutCommandId | null
  initialNotice?: InlineNotice | null
}

export function KeyboardShortcutsSettingsSection({
  config,
  onChange,
  initialQuery = '',
  initialCapturingCommandId = null,
  initialNotice = null,
}: Props): ReactElement {
  const [query, setQuery] = useState(initialQuery)
  const [capturingCommandId, setCapturingCommandId] = useState<KeyboardShortcutCommandId | null>(
    initialCapturingCommandId,
  )
  const [notice, setNotice] = useState<InlineNotice | null>(initialNotice)

  const effectiveBindings = useMemo(
    () => resolveKeyboardShortcutBindings(config),
    [config],
  )

  const filteredCommands = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return KEYBOARD_SHORTCUT_COMMANDS
    return KEYBOARD_SHORTCUT_COMMANDS.filter((command) => {
      const haystack = [
        command.id,
        command.label,
        command.description,
        ...effectiveBindings[command.id],
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(needle)
    })
  }, [effectiveBindings, query])

  const updateBinding = useCallback(
    (commandId: KeyboardShortcutCommandId, shortcuts: string[]) => {
      onChange({
        bindings: {
          ...config.bindings,
          [commandId]: shortcuts,
        },
      })
    },
    [config.bindings, onChange],
  )

  useEffect(() => {
    if (!capturingCommandId) return

    const onKeyDown = (event: KeyboardEvent): void => {
      event.preventDefault()
      event.stopPropagation()
      if (event.key === 'Escape' && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey) {
        setCapturingCommandId(null)
        setNotice(null)
        return
      }

      const modifiers = [
        event.ctrlKey ? 'Ctrl' : '',
        event.shiftKey && event.key !== '+' ? 'Shift' : '',
        event.altKey ? 'Alt' : '',
        event.metaKey ? 'Meta' : '',
      ].filter(Boolean)
      const key = event.key.length === 1 ? event.key.toUpperCase() : event.key
      const shortcut = [...modifiers, key].join('+')

      const conflictId = findKeyboardShortcutConflict(effectiveBindings, capturingCommandId, shortcut)
      if (conflictId) {
        setNotice({
          tone: 'error',
          message: COPY.shortcutConflict(commandLabel(conflictId)),
        })
        return
      }

      updateBinding(capturingCommandId, [shortcut])
      setCapturingCommandId(null)
      setNotice(null)
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [capturingCommandId, effectiveBindings, updateBinding])

  return (
    <div className="keyboard-shortcuts-settings">
      <div className="keyboard-shortcuts-search">
        <Search className="keyboard-shortcuts-search-icon" strokeWidth={1.75} />
        <input
          className="keyboard-shortcuts-search-input"
          value={query}
          placeholder={COPY.shortcutSearchPlaceholder}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Keyboard className="keyboard-shortcuts-search-icon" strokeWidth={1.75} />
      </div>

      {notice ? (
        <div className="keyboard-shortcuts-notice">
          <InlineNoticeView notice={notice} />
        </div>
      ) : null}

      <SettingsCard title={COPY.keyboardShortcuts}>
        <div className="keyboard-shortcuts-table-header">
          <div>{COPY.shortcutCommandColumn}</div>
          <div>{COPY.shortcutBindingColumn}</div>
          <div aria-hidden />
        </div>
        <div className="keyboard-shortcuts-table-body">
          {filteredCommands.map((command) => {
            const shortcuts = effectiveBindings[command.id]
            const capturing = capturingCommandId === command.id
            return (
              <div key={command.id} className="keyboard-shortcuts-row">
                <div className="keyboard-shortcuts-row-copy">
                  <div className="keyboard-shortcuts-row-label">{command.label}</div>
                  <div className="keyboard-shortcuts-row-description">{command.description}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCapturingCommandId(command.id)
                    setNotice({ tone: 'info', message: COPY.shortcutCaptureHint })
                  }}
                  className={
                    capturing
                      ? 'keyboard-shortcuts-binding is-capturing'
                      : 'keyboard-shortcuts-binding'
                  }
                >
                  {capturing ? (
                    <span className="keyboard-shortcuts-binding-recording">{COPY.shortcutRecording}</span>
                  ) : shortcuts.length > 0 ? (
                    shortcuts.map((shortcut) => (
                      <span key={shortcut} className="keyboard-shortcuts-binding-pill">
                        {shortcut}
                      </span>
                    ))
                  ) : (
                    <span className="keyboard-shortcuts-binding-empty">{COPY.shortcutUnassigned}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => updateBinding(command.id, [])}
                  className="keyboard-shortcuts-reset"
                  aria-label={COPY.shortcutReset}
                  title={COPY.shortcutReset}
                >
                  <RotateCcw className="keyboard-shortcuts-reset-icon" strokeWidth={1.75} />
                </button>
              </div>
            )
          })}
        </div>
      </SettingsCard>
    </div>
  )
}

export type KeyboardShortcutsPreviewMode =
  | 'default'
  | 'capturing'
  | 'conflict'
  | 'unassigned'
  | 'search'

export function KeyboardShortcutsSettingsSectionPreview({
  mode = 'default',
}: {
  mode?: KeyboardShortcutsPreviewMode
}): ReactElement {
  const [config, setConfig] = useState<KeyboardShortcutsConfig>(() => {
    if (mode === 'unassigned') {
      return {
        bindings: {
          minimize: [],
          'toggle-maximize': [],
        },
      }
    }
    if (mode === 'conflict') {
      return {
        bindings: {
          'new-chat': ['Ctrl+N'],
          settings: ['Ctrl+N'],
        },
      }
    }
    return KEYBOARD_SHORTCUTS_PREVIEW_CONFIG
  })

  return (
    <KeyboardShortcutsSettingsSection
      config={config}
      onChange={setConfig}
      initialQuery={mode === 'search' ? 'zoom' : ''}
      initialCapturingCommandId={mode === 'capturing' ? 'settings' : null}
      initialNotice={
        mode === 'capturing'
          ? { tone: 'info', message: COPY.shortcutCaptureHint }
          : mode === 'conflict'
            ? { tone: 'error', message: COPY.shortcutConflict('Settings') }
            : null
      }
    />
  )
}
