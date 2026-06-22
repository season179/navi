// Keyboard shortcuts settings section echoing Kun's settings-section-shortcuts.tsx
// (../Kun/src/renderer/src/components/settings-section-shortcuts.tsx).
// Visual only: mock bindings and preview modes.

import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react'
import { Keyboard, RotateCcw, Search } from 'lucide-react'
import {
  formatKeyboardShortcutsSettingsConflict,
  KEYBOARD_SHORTCUT_SETTINGS_COMMANDS,
  KEYBOARD_SHORTCUTS_SETTINGS_BINDING_COLUMN,
  KEYBOARD_SHORTCUTS_SETTINGS_CAPTURE_HINT,
  KEYBOARD_SHORTCUTS_SETTINGS_COMMAND_COLUMN,
  KEYBOARD_SHORTCUTS_SETTINGS_RECORDING,
  KEYBOARD_SHORTCUTS_SETTINGS_RESET,
  KEYBOARD_SHORTCUTS_SETTINGS_SEARCH_PLACEHOLDER,
  KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_SETTINGS,
  KEYBOARD_SHORTCUTS_SETTINGS_TITLE,
  KEYBOARD_SHORTCUTS_SETTINGS_UNASSIGNED,
  resolveKeyboardShortcutsSettingsCommandLabel,
  type KeyboardShortcutSettingsCommandId,
} from '../lib/keyboardShortcutsSettingsSection'
import { InlineNoticeView, SettingsCard, type InlineNotice } from './SettingsControls'

type KeyboardShortcutsConfig = {
  bindings: Partial<Record<KeyboardShortcutSettingsCommandId, string[]>>
}

export const KEYBOARD_SHORTCUTS_PREVIEW_CONFIG: KeyboardShortcutsConfig = {
  bindings: {},
}

function resolveKeyboardShortcutBindings(
  settings: KeyboardShortcutsConfig,
): Record<KeyboardShortcutSettingsCommandId, string[]> {
  const bindings = {} as Record<KeyboardShortcutSettingsCommandId, string[]>
  for (const command of KEYBOARD_SHORTCUT_SETTINGS_COMMANDS) {
    const configured = settings.bindings[command.id]
    bindings[command.id] =
      configured && configured.length > 0 ? configured : [...command.defaultBindings]
  }
  return bindings
}

function findKeyboardShortcutConflict(
  bindings: Record<KeyboardShortcutSettingsCommandId, string[]>,
  commandId: KeyboardShortcutSettingsCommandId,
  shortcut: string,
): KeyboardShortcutSettingsCommandId | null {
  for (const command of KEYBOARD_SHORTCUT_SETTINGS_COMMANDS) {
    if (command.id === commandId) continue
    if (bindings[command.id].includes(shortcut)) return command.id
  }
  return null
}

type Props = {
  config: KeyboardShortcutsConfig
  onChange: (config: KeyboardShortcutsConfig) => void
  initialQuery?: string
  initialCapturingCommandId?: KeyboardShortcutSettingsCommandId | null
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
  const [capturingCommandId, setCapturingCommandId] = useState<KeyboardShortcutSettingsCommandId | null>(
    initialCapturingCommandId,
  )
  const [notice, setNotice] = useState<InlineNotice | null>(initialNotice)

  const effectiveBindings = useMemo(
    () => resolveKeyboardShortcutBindings(config),
    [config],
  )

  const filteredCommands = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return KEYBOARD_SHORTCUT_SETTINGS_COMMANDS
    return KEYBOARD_SHORTCUT_SETTINGS_COMMANDS.filter((command) => {
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
    (commandId: KeyboardShortcutSettingsCommandId, shortcuts: string[]) => {
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
          message: formatKeyboardShortcutsSettingsConflict(
            resolveKeyboardShortcutsSettingsCommandLabel(conflictId),
          ),
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
          placeholder={KEYBOARD_SHORTCUTS_SETTINGS_SEARCH_PLACEHOLDER}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Keyboard className="keyboard-shortcuts-search-icon" strokeWidth={1.75} />
      </div>

      {notice ? (
        <div className="keyboard-shortcuts-notice">
          <InlineNoticeView notice={notice} />
        </div>
      ) : null}

      <SettingsCard title={KEYBOARD_SHORTCUTS_SETTINGS_TITLE}>
        <div className="keyboard-shortcuts-table-header">
          <div>{KEYBOARD_SHORTCUTS_SETTINGS_COMMAND_COLUMN}</div>
          <div>{KEYBOARD_SHORTCUTS_SETTINGS_BINDING_COLUMN}</div>
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
                    setNotice({ tone: 'info', message: KEYBOARD_SHORTCUTS_SETTINGS_CAPTURE_HINT })
                  }}
                  className={
                    capturing
                      ? 'keyboard-shortcuts-binding is-capturing'
                      : 'keyboard-shortcuts-binding'
                  }
                >
                  {capturing ? (
                    <span className="keyboard-shortcuts-binding-recording">
                      {KEYBOARD_SHORTCUTS_SETTINGS_RECORDING}
                    </span>
                  ) : shortcuts.length > 0 ? (
                    shortcuts.map((shortcut) => (
                      <span key={shortcut} className="keyboard-shortcuts-binding-pill">
                        {shortcut}
                      </span>
                    ))
                  ) : (
                    <span className="keyboard-shortcuts-binding-empty">
                      {KEYBOARD_SHORTCUTS_SETTINGS_UNASSIGNED}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => updateBinding(command.id, [])}
                  className="keyboard-shortcuts-reset"
                  aria-label={KEYBOARD_SHORTCUTS_SETTINGS_RESET}
                  title={KEYBOARD_SHORTCUTS_SETTINGS_RESET}
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
          ? { tone: 'info', message: KEYBOARD_SHORTCUTS_SETTINGS_CAPTURE_HINT }
          : mode === 'conflict'
            ? {
                tone: 'error',
                message: formatKeyboardShortcutsSettingsConflict(
                  KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_SETTINGS,
                ),
              }
            : null
      }
    />
  )
}
