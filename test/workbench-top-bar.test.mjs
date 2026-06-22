import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.workbench-top-bar-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'workbenchTopBar.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  WORKBENCH_EDITOR_LINE_BADGE,
  WORKBENCH_EDITOR_PICKER_MENU_TITLE,
  WORKBENCH_EDITOR_PICKER_TITLE,
  WORKBENCH_GUI_UPDATE_INSTALL_LABEL,
  WORKBENCH_GUI_UPDATE_TOPBAR_INSTALLING_LABEL,
  WORKBENCH_RIGHT_PANEL_BROWSER_LABEL,
  WORKBENCH_RIGHT_PANEL_CHANGES_LABEL,
  WORKBENCH_RIGHT_PANEL_FILES_LABEL,
  WORKBENCH_RIGHT_PANEL_PLAN_LABEL,
  WORKBENCH_RIGHT_PANEL_TERMINAL_LABEL,
  WORKBENCH_RIGHT_PANEL_TODO_LABEL,
  WORKBENCH_SIDE_PANEL_OPEN_LABEL,
  formatEditorPickerTitleWithEditor,
  formatGuiUpdateAvailable,
  formatGuiUpdateAvailableManual,
  formatGuiUpdateTopbarAvailable,
  formatGuiUpdateTopbarDownloading,
  formatGuiUpdateTopbarManual,
} = await import(out)

test('workbench top bar chrome copy matches Kun locale strings', () => {
  assert.equal(WORKBENCH_RIGHT_PANEL_TODO_LABEL, 'Todo')
  assert.equal(WORKBENCH_RIGHT_PANEL_PLAN_LABEL, 'Plan')
  assert.equal(WORKBENCH_RIGHT_PANEL_CHANGES_LABEL, 'Changes')
  assert.equal(WORKBENCH_RIGHT_PANEL_BROWSER_LABEL, 'Preview')
  assert.equal(WORKBENCH_RIGHT_PANEL_TERMINAL_LABEL, 'Terminal')
  assert.equal(WORKBENCH_RIGHT_PANEL_FILES_LABEL, 'Files')
  assert.equal(WORKBENCH_SIDE_PANEL_OPEN_LABEL, 'Open side chat')
  assert.equal(WORKBENCH_EDITOR_PICKER_TITLE, 'Choose default editor')
  assert.equal(WORKBENCH_EDITOR_PICKER_MENU_TITLE, 'Open files with')
  assert.equal(WORKBENCH_EDITOR_LINE_BADGE, 'Line')
  assert.equal(WORKBENCH_GUI_UPDATE_TOPBAR_INSTALLING_LABEL, 'Installing…')
  assert.equal(WORKBENCH_GUI_UPDATE_INSTALL_LABEL, 'Restart and install')
})

test('workbench top bar formatters match Kun locale templates', () => {
  assert.equal(formatEditorPickerTitleWithEditor('Cursor'), 'Default editor: Cursor')
  assert.equal(formatGuiUpdateTopbarAvailable('0.9.2'), 'Update 0.9.2')
  assert.equal(formatGuiUpdateTopbarDownloading(42), 'Updating 42%')
  assert.equal(formatGuiUpdateTopbarManual('0.9.2'), 'Download 0.9.2')
  assert.equal(
    formatGuiUpdateAvailable('0.9.1', '0.9.2'),
    'New version available: 0.9.1 → 0.9.2',
  )
  assert.equal(
    formatGuiUpdateAvailableManual('0.9.1', '0.9.2'),
    'New version available: 0.9.1 → 0.9.2. Install it from the download page.',
  )
})
