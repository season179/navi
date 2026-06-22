import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.workspace-file-preview-panel-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'workspaceFilePreviewPanel.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  WORKSPACE_FILE_PREVIEW_CLOSE_LABEL,
  WORKSPACE_FILE_PREVIEW_CLOSE_TAB_TEMPLATE,
  WORKSPACE_FILE_PREVIEW_COLLAPSE_LABEL,
  WORKSPACE_FILE_PREVIEW_COPY_CONTENT_LABEL,
  WORKSPACE_FILE_PREVIEW_COPY_PATH_LABEL,
  WORKSPACE_FILE_PREVIEW_COPY_SUCCESS_LABEL,
  WORKSPACE_FILE_PREVIEW_EMPTY_LABEL,
  WORKSPACE_FILE_PREVIEW_FAILED_LABEL,
  WORKSPACE_FILE_PREVIEW_LOADING_LABEL,
  WORKSPACE_FILE_PREVIEW_OPEN_EDITOR_LABEL,
  WORKSPACE_FILE_PREVIEW_OPEN_FILES_LABEL,
  WORKSPACE_FILE_PREVIEW_RENDER_MARKDOWN_LABEL,
  WORKSPACE_FILE_PREVIEW_SHOW_SOURCE_LABEL,
  WORKSPACE_FILE_PREVIEW_TITLE,
  WORKSPACE_FILE_PREVIEW_TRUNCATED_LABEL,
  WORKSPACE_FILE_PREVIEW_UNSUPPORTED_LABEL,
  formatWorkspaceFilePreviewCloseTab,
} = await import(out)

test('workspace file preview panel chrome copy matches Kun locale strings', () => {
  assert.equal(WORKSPACE_FILE_PREVIEW_COLLAPSE_LABEL, 'Collapse right sidebar')
  assert.equal(WORKSPACE_FILE_PREVIEW_TITLE, 'File preview')
  assert.equal(WORKSPACE_FILE_PREVIEW_EMPTY_LABEL, 'No file selected')
  assert.equal(WORKSPACE_FILE_PREVIEW_LOADING_LABEL, 'Reading file…')
  assert.equal(WORKSPACE_FILE_PREVIEW_FAILED_LABEL, 'Could not read the file.')
  assert.equal(
    WORKSPACE_FILE_PREVIEW_UNSUPPORTED_LABEL,
    'Preview is not supported for this file. Choose a text file.',
  )
  assert.equal(WORKSPACE_FILE_PREVIEW_OPEN_EDITOR_LABEL, 'Open in editor')
  assert.equal(WORKSPACE_FILE_PREVIEW_COPY_PATH_LABEL, 'Copy path')
  assert.equal(WORKSPACE_FILE_PREVIEW_COPY_CONTENT_LABEL, 'Copy full file')
  assert.equal(WORKSPACE_FILE_PREVIEW_CLOSE_LABEL, 'Close file preview')
  assert.equal(WORKSPACE_FILE_PREVIEW_OPEN_FILES_LABEL, 'Open files')
  assert.equal(WORKSPACE_FILE_PREVIEW_CLOSE_TAB_TEMPLATE, 'Close {{file}}')
  assert.equal(WORKSPACE_FILE_PREVIEW_RENDER_MARKDOWN_LABEL, 'Render Markdown')
  assert.equal(WORKSPACE_FILE_PREVIEW_SHOW_SOURCE_LABEL, 'Show Markdown source')
  assert.equal(WORKSPACE_FILE_PREVIEW_TRUNCATED_LABEL, 'Truncated')
  assert.equal(WORKSPACE_FILE_PREVIEW_COPY_SUCCESS_LABEL, 'Copied')
})

test('formatWorkspaceFilePreviewCloseTab substitutes file name', () => {
  assert.equal(
    formatWorkspaceFilePreviewCloseTab('Composer.tsx'),
    'Close Composer.tsx',
  )
})
