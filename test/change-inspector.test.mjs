import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.change-inspector-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'changeInspector.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  CHANGE_INSPECTOR_COLLAPSE_LABEL,
  CHANGE_INSPECTOR_EMPTY_LABEL,
  CHANGE_INSPECTOR_EMPTY_TITLE,
  CHANGE_INSPECTOR_FILE_FALLBACK_LABEL,
  CHANGE_INSPECTOR_SELECT_HINT,
  CHANGE_INSPECTOR_STATUS_RUNNING_LABEL,
  CHANGE_INSPECTOR_TITLE,
  formatChangeInspectorSummaryFiles,
} = await import(out)

test('change inspector chrome copy matches Kun locale strings', () => {
  assert.equal(CHANGE_INSPECTOR_COLLAPSE_LABEL, 'Collapse right sidebar')
  assert.equal(CHANGE_INSPECTOR_TITLE, 'Changes')
  assert.equal(CHANGE_INSPECTOR_EMPTY_LABEL, 'No file changes in this thread yet.')
  assert.equal(CHANGE_INSPECTOR_EMPTY_TITLE, 'No changes yet')
  assert.equal(CHANGE_INSPECTOR_SELECT_HINT, 'Select a changed file to view its diff.')
  assert.equal(CHANGE_INSPECTOR_STATUS_RUNNING_LABEL, 'running')
  assert.equal(CHANGE_INSPECTOR_FILE_FALLBACK_LABEL, 'Edited file')
})

test('change inspector summary formatter matches Kun inspectorSummaryFiles template', () => {
  assert.equal(formatChangeInspectorSummaryFiles(1), '1 file changes')
  assert.equal(formatChangeInspectorSummaryFiles(3), '3 file changes')
})
