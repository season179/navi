import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.sidebar-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'sidebar.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  SIDEBAR_APP_NAME,
  SIDEBAR_CLAW_LABEL,
  SIDEBAR_FOCUS_MODE_LABEL,
  SIDEBAR_FOCUS_MODE_TOGGLE_ARIA_LABEL,
  SIDEBAR_FOCUS_MODE_TOGGLE_TITLE,
  SIDEBAR_NEW_AGENT_LABEL,
  SIDEBAR_PLUGINS_LABEL,
  SIDEBAR_RUNTIME_ACTION_NEEDS_CONNECTION,
  SIDEBAR_SCHEDULE_LABEL,
  SIDEBAR_SDD_NEW_REQUIREMENT_LABEL,
  SIDEBAR_SETTINGS_LABEL,
  SIDEBAR_SWITCH_OFF_LABEL,
  SIDEBAR_SWITCH_ON_LABEL,
  formatFocusModeToggleTitle,
} = await import(out)

test('sidebar chrome copy matches Kun locale strings', () => {
  assert.equal(SIDEBAR_APP_NAME, 'Navi')
  assert.equal(SIDEBAR_FOCUS_MODE_LABEL, 'Focus')
  assert.equal(SIDEBAR_SWITCH_ON_LABEL, 'On')
  assert.equal(SIDEBAR_SWITCH_OFF_LABEL, 'Off')
  assert.equal(SIDEBAR_FOCUS_MODE_TOGGLE_TITLE, 'Focus mode: quiet Navi animations')
  assert.equal(SIDEBAR_FOCUS_MODE_TOGGLE_ARIA_LABEL, 'Toggle focus mode')
  assert.equal(SIDEBAR_CLAW_LABEL, 'Connect phone')
  assert.equal(SIDEBAR_SETTINGS_LABEL, 'Settings')
  assert.equal(SIDEBAR_NEW_AGENT_LABEL, 'New Agent')
  assert.equal(SIDEBAR_SDD_NEW_REQUIREMENT_LABEL, 'New requirement')
  assert.equal(SIDEBAR_PLUGINS_LABEL, 'Plugins')
  assert.equal(SIDEBAR_SCHEDULE_LABEL, 'Scheduled tasks')
  assert.equal(
    SIDEBAR_RUNTIME_ACTION_NEEDS_CONNECTION,
    'Connect to the runtime before using AI actions.',
  )
})

test('formatFocusModeToggleTitle matches Kun title pattern', () => {
  assert.equal(
    formatFocusModeToggleTitle(true),
    'Focus mode: quiet Navi animations · On',
  )
  assert.equal(
    formatFocusModeToggleTitle(false),
    'Focus mode: quiet Navi animations · Off',
  )
})
