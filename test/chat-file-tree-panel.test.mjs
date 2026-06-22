import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.chat-file-tree-panel-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'chatFileTreePanel.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  FILE_TREE_ADD_FILE_REFERENCE_LABEL,
  FILE_TREE_ADD_FOLDER_REFERENCE_LABEL,
  FILE_TREE_COPY_ABSOLUTE_PATH_LABEL,
  FILE_TREE_COPY_RELATIVE_PATH_LABEL,
  FILE_TREE_EMPTY,
  FILE_TREE_LOADING_LABEL,
  FILE_TREE_REFRESH_LABEL,
  FILE_TREE_REVEAL_IN_FILE_MANAGER_LABEL,
  FILE_TREE_REVEAL_IN_FINDER_LABEL,
  FILE_TREE_TITLE,
  formatChatFileTreeUnsupportedMessage,
  resolveChatFileTreeRevealLabel,
} = await import(out)

test('chat file tree panel chrome copy matches Kun locale strings', () => {
  assert.equal(FILE_TREE_TITLE, 'Files')
  assert.equal(FILE_TREE_REFRESH_LABEL, 'Refresh file tree')
  assert.equal(FILE_TREE_LOADING_LABEL, 'Loading files…')
  assert.equal(FILE_TREE_EMPTY, 'This workspace has no files yet.')
  assert.equal(FILE_TREE_ADD_FILE_REFERENCE_LABEL, 'Add file reference')
  assert.equal(FILE_TREE_ADD_FOLDER_REFERENCE_LABEL, 'Add folder reference')
  assert.equal(FILE_TREE_COPY_ABSOLUTE_PATH_LABEL, 'Copy absolute path')
  assert.equal(FILE_TREE_COPY_RELATIVE_PATH_LABEL, 'Copy relative path')
  assert.equal(FILE_TREE_REVEAL_IN_FINDER_LABEL, 'Reveal in Finder')
  assert.equal(FILE_TREE_REVEAL_IN_FILE_MANAGER_LABEL, 'Reveal in file manager')
})

test('chat file tree panel formatters match Kun behavior', () => {
  assert.equal(
    formatChatFileTreeUnsupportedMessage('logo.png'),
    'logo.png is not a supported text preview.',
  )
  assert.equal(resolveChatFileTreeRevealLabel('darwin'), 'Reveal in Finder')
  assert.equal(resolveChatFileTreeRevealLabel('MacIntel'), 'Reveal in Finder')
  assert.equal(resolveChatFileTreeRevealLabel('win32'), 'Reveal in file manager')
  assert.equal(resolveChatFileTreeRevealLabel('linux'), 'Reveal in file manager')
})
