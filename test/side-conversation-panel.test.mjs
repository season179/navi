import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.side-conversation-panel-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'sideConversationPanel.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  SIDE_PANEL_COMPOSER_PLACEHOLDER,
  SIDE_PANEL_DISCARD_TITLE,
  SIDE_PANEL_DRAFT_EMPTY,
  SIDE_PANEL_EMPTY,
  SIDE_PANEL_EXPAND_LABEL,
  SIDE_PANEL_HIDE_LABEL,
  SIDE_PANEL_INHERITED_AT_TEMPLATE,
  SIDE_PANEL_MINIMIZE_LABEL,
  SIDE_PANEL_MORE_LABEL,
  SIDE_PANEL_NEW_LABEL,
  SIDE_PANEL_PARENT_MISSING,
  SIDE_PANEL_PROMOTE_LABEL,
  SIDE_PANEL_THINKING_LABEL,
  SIDE_PANEL_TITLE,
  formatSidePanelInheritedAt,
  formatSidePanelParentLabel,
} = await import(out)

test('side conversation panel chrome copy matches Kun locale strings', () => {
  assert.equal(SIDE_PANEL_TITLE, 'Side conversations')
  assert.equal(SIDE_PANEL_NEW_LABEL, 'New side chat')
  assert.equal(SIDE_PANEL_PARENT_MISSING, 'Side panel')
  assert.equal(SIDE_PANEL_HIDE_LABEL, 'Hide side panel')
  assert.equal(SIDE_PANEL_MINIMIZE_LABEL, 'Minimize side chat')
  assert.equal(SIDE_PANEL_EXPAND_LABEL, 'Expand side panel')
  assert.equal(SIDE_PANEL_MORE_LABEL, 'More side chat actions')
  assert.equal(SIDE_PANEL_PROMOTE_LABEL, 'Promote')
  assert.equal(SIDE_PANEL_DISCARD_TITLE, 'Delete the underlying side thread.')
  assert.equal(SIDE_PANEL_INHERITED_AT_TEMPLATE, 'Context from {{time}}')
  assert.equal(SIDE_PANEL_THINKING_LABEL, 'Thinking...')
  assert.equal(SIDE_PANEL_EMPTY, 'No side conversation yet. Use /btw to open one.')
  assert.equal(
    SIDE_PANEL_DRAFT_EMPTY,
    'Ask a temporary question. A side thread is created only after you send.',
  )
  assert.equal(SIDE_PANEL_COMPOSER_PLACEHOLDER, 'Ask in side chat')
})

test('side conversation panel formatters match Kun locale templates', () => {
  assert.equal(formatSidePanelParentLabel('Refactor auth middleware'), 'From "Refactor auth middleware"')
  assert.equal(formatSidePanelInheritedAt('Jun 22, 10:30 AM'), 'Context from Jun 22, 10:30 AM')
})
