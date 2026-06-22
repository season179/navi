import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.terminal-panel-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'terminalPanel.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  TERMINAL_CLEAR_LABEL,
  TERMINAL_CLOSE_ALL_TABS_LABEL,
  TERMINAL_CLOSE_OTHER_TABS_LABEL,
  TERMINAL_CLOSE_TAB_LABEL,
  TERMINAL_EXIT_MESSAGE,
  TERMINAL_NEW_TAB_LABEL,
  TERMINAL_PANEL_COLLAPSE_LABEL,
  TERMINAL_PANEL_TITLE,
  TERMINAL_RENAME_TAB_LABEL,
  TERMINAL_RESTART_LABEL,
  TERMINAL_TAB_MENU_TITLE,
  TERMINAL_UNAVAILABLE_LABEL,
  formatTerminalTabTitle,
} = await import(out)

test('terminal panel chrome copy matches Kun locale strings', () => {
  assert.equal(TERMINAL_PANEL_TITLE, 'Terminal')
  assert.equal(TERMINAL_CLEAR_LABEL, 'Clear terminal')
  assert.equal(TERMINAL_RESTART_LABEL, 'Restart terminal')
  assert.equal(TERMINAL_NEW_TAB_LABEL, 'New terminal tab')
  assert.equal(TERMINAL_CLOSE_TAB_LABEL, 'Close terminal tab')
  assert.equal(TERMINAL_TAB_MENU_TITLE, 'Terminal tab actions')
  assert.equal(TERMINAL_RENAME_TAB_LABEL, 'Rename terminal tab')
  assert.equal(TERMINAL_CLOSE_OTHER_TABS_LABEL, 'Close other terminal tabs')
  assert.equal(TERMINAL_CLOSE_ALL_TABS_LABEL, 'Close all terminal tabs')
  assert.equal(TERMINAL_EXIT_MESSAGE, 'Process exited — click to restart')
  assert.equal(TERMINAL_UNAVAILABLE_LABEL, 'Terminal unavailable')
  assert.equal(TERMINAL_PANEL_COLLAPSE_LABEL, 'Collapse right sidebar')
})

test('terminal tab title formatter matches Kun terminalTabTitle locale string', () => {
  assert.equal(formatTerminalTabTitle(1), 'Terminal 1')
  assert.equal(formatTerminalTabTitle(2), 'Terminal 2')
})
