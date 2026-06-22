import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.dev-browser-panel-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'devBrowserPanel.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  DEV_BROWSER_ADDRESS_PLACEHOLDER,
  DEV_BROWSER_AUTO_FOLLOW_LABEL,
  DEV_BROWSER_BACK_LABEL,
  DEV_BROWSER_CLOSE_TAB_LABEL,
  DEV_BROWSER_EMPTY_SUBTITLE,
  DEV_BROWSER_EMPTY_TITLE,
  DEV_BROWSER_FORWARD_LABEL,
  DEV_BROWSER_LOAD_FAILED,
  DEV_BROWSER_NEW_TAB_LABEL,
  DEV_BROWSER_OPEN_EXTERNAL_LABEL,
  DEV_BROWSER_OPEN_LABEL,
  DEV_BROWSER_PANEL_COLLAPSE_LABEL,
  DEV_BROWSER_RELOAD_LABEL,
  DEV_BROWSER_RESET_LABEL,
  DEV_BROWSER_SHOW_ALL_LABEL,
  DEV_BROWSER_TITLE,
} = await import(out)

test('dev browser panel chrome copy matches Kun locale strings', () => {
  assert.equal(DEV_BROWSER_PANEL_COLLAPSE_LABEL, 'Collapse right sidebar')
  assert.equal(DEV_BROWSER_NEW_TAB_LABEL, 'New tab')
  assert.equal(DEV_BROWSER_CLOSE_TAB_LABEL, 'Close preview')
  assert.equal(DEV_BROWSER_BACK_LABEL, 'Back')
  assert.equal(DEV_BROWSER_FORWARD_LABEL, 'Forward')
  assert.equal(DEV_BROWSER_RELOAD_LABEL, 'Reload')
  assert.equal(DEV_BROWSER_ADDRESS_PLACEHOLDER, 'Enter URL')
  assert.equal(DEV_BROWSER_OPEN_LABEL, 'Open')
  assert.equal(DEV_BROWSER_AUTO_FOLLOW_LABEL, 'Follow local URLs from this thread')
  assert.equal(DEV_BROWSER_RESET_LABEL, 'New blank tab')
  assert.equal(DEV_BROWSER_OPEN_EXTERNAL_LABEL, 'Open in browser')
  assert.equal(DEV_BROWSER_EMPTY_TITLE, 'No local servers online')
  assert.equal(DEV_BROWSER_EMPTY_SUBTITLE, 'Offline local servers are hidden')
  assert.equal(DEV_BROWSER_SHOW_ALL_LABEL, 'Show all')
  assert.equal(DEV_BROWSER_LOAD_FAILED, 'Page failed to load')
  assert.equal(DEV_BROWSER_TITLE, 'Preview')
})
