import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.keyboard-shortcuts-settings-section-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'keyboardShortcutsSettingsSection.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const mod = await import(out)

test('keyboard shortcuts settings section shell copy matches Kun locale strings', () => {
  assert.equal(mod.KEYBOARD_SHORTCUTS_SETTINGS_TITLE, 'Keyboard shortcuts')
  assert.equal(mod.KEYBOARD_SHORTCUTS_SETTINGS_SEARCH_PLACEHOLDER, 'Search shortcuts')
  assert.equal(mod.KEYBOARD_SHORTCUTS_SETTINGS_COMMAND_COLUMN, 'Command')
  assert.equal(mod.KEYBOARD_SHORTCUTS_SETTINGS_BINDING_COLUMN, 'Key binding')
  assert.equal(
    mod.KEYBOARD_SHORTCUTS_SETTINGS_CAPTURE_HINT,
    'Press the new shortcut. Press Esc to cancel.',
  )
  assert.equal(mod.KEYBOARD_SHORTCUTS_SETTINGS_RECORDING, 'Press keys')
  assert.equal(mod.KEYBOARD_SHORTCUTS_SETTINGS_UNASSIGNED, 'Unassigned')
  assert.equal(mod.KEYBOARD_SHORTCUTS_SETTINGS_RESET, 'Reset shortcut')
})

test('keyboard shortcuts settings section conflict formatter matches Kun template', () => {
  assert.equal(
    mod.formatKeyboardShortcutsSettingsConflict('Settings'),
    'Already used by "Settings".',
  )
})

test('keyboard shortcuts settings section command labels match Kun shortcut* keys', () => {
  assert.equal(mod.KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_TOGGLE_PLAN_MODE, 'Toggle Plan mode')
  assert.equal(mod.KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_NEW_CHAT, 'New chat')
  assert.equal(mod.KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_DEV_TOOLS, 'Developer tools')
  assert.equal(mod.KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_CLOSE_WINDOW, 'Close window')
  assert.equal(mod.KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_TOGGLE_MAXIMIZE, 'Maximize window')
})

test('keyboard shortcuts settings section command descriptions match Kun shortcut*Desc keys', () => {
  assert.equal(
    mod.KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_TOGGLE_PLAN_MODE_DESC,
    'Switch the composer between Agent and Plan mode.',
  )
  assert.equal(
    mod.KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_NEW_CHAT_DESC,
    'Start a new chat in the current workspace.',
  )
  assert.equal(
    mod.KEYBOARD_SHORTCUTS_SETTINGS_SHORTCUT_TOGGLE_MAXIMIZE_DESC,
    'Maximize or restore the main window.',
  )
})

test('keyboard shortcuts settings section exports 19 Kun-matching commands', () => {
  assert.equal(mod.KEYBOARD_SHORTCUT_SETTINGS_COMMANDS.length, 19)
  assert.equal(mod.KEYBOARD_SHORTCUT_SETTINGS_COMMANDS[0].id, 'toggle-plan-mode')
  assert.equal(mod.KEYBOARD_SHORTCUT_SETTINGS_COMMANDS[0].defaultBindings[0], 'Shift+Tab')
})

test('keyboard shortcuts settings section command label resolver works', () => {
  assert.equal(mod.resolveKeyboardShortcutsSettingsCommandLabel('settings'), 'Settings')
  assert.equal(mod.resolveKeyboardShortcutsSettingsCommandLabel('unknown-id'), 'unknown-id')
})

test('keyboard shortcuts settings section exports expected constant count', () => {
  const constants = Object.keys(mod).filter((key) => key.startsWith('KEYBOARD_SHORTCUTS_SETTINGS_'))
  assert.equal(constants.length, 46)
})
