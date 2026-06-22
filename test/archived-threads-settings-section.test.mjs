import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.archived-threads-settings-section-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'archivedThreadsSettingsSection.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const mod = await import(out)

test('archived threads settings section copy matches Kun locale strings', () => {
  assert.equal(mod.ARCHIVED_THREADS_SETTINGS_TITLE, 'Archived chats')
  assert.equal(mod.ARCHIVED_THREADS_SETTINGS_OVERVIEW_TITLE, 'Archived chat history')
  assert.equal(
    mod.ARCHIVED_THREADS_SETTINGS_OVERVIEW_DESC,
    'Review chats that were removed from the active sidebar. You can open, restore, or permanently delete them here.',
  )
  assert.equal(mod.ARCHIVED_THREADS_SETTINGS_SEARCH_PLACEHOLDER, 'Search archived chats')
  assert.equal(mod.ARCHIVED_THREADS_SETTINGS_UNTITLED, 'Untitled chat')
  assert.equal(mod.ARCHIVED_THREADS_SETTINGS_DELETE_LABEL, 'Delete archived chat')
  assert.equal(mod.ARCHIVED_THREADS_SETTINGS_EMPTY, 'No archived chats yet.')
  assert.equal(
    mod.ARCHIVED_THREADS_SETTINGS_OFFLINE,
    'Connect the local runtime to refresh archived chats.',
  )
})

test('archived threads settings section formatter helpers match Kun locale templates', () => {
  assert.equal(mod.formatArchivedThreadsSettingsCount(3), '3 archived')
  assert.equal(mod.formatArchivedThreadsSettingsWorkspaceCount(1), '1 chats')
  assert.equal(
    mod.formatArchivedThreadsSettingsDeleteConfirmTitle('Refactor sidebar'),
    'Delete "Refactor sidebar"?',
  )
  assert.equal(
    mod.formatArchivedThreadsSettingsFooterHint(),
    'Restore thread / Delete thread',
  )
})

test('archived threads settings section exports expected constant count', () => {
  const constants = Object.keys(mod).filter((key) => key.startsWith('ARCHIVED_THREADS_SETTINGS_'))
  assert.equal(constants.length, 13)
})
