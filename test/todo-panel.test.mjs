import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.todo-panel-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'todoPanel.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  TODO_PANEL_CLEAR_LABEL,
  TODO_PANEL_COLLAPSE_LABEL,
  TODO_PANEL_EMPTY_DESCRIPTION,
  TODO_PANEL_EMPTY_TITLE,
  TODO_PANEL_TITLE,
  TODO_MARK_COMPLETED_LABEL,
  TODO_MARK_PENDING_LABEL,
  TODO_ROW_STATUS_LABELS,
  TODO_STATUS_COMPLETED_LABEL,
  TODO_STATUS_IN_PROGRESS_LABEL,
  TODO_STATUS_PENDING_LABEL,
  resolveTodoRowStatusLabel,
} = await import(out)

test('todo panel chrome copy matches Kun locale strings', () => {
  assert.equal(TODO_PANEL_COLLAPSE_LABEL, 'Collapse right sidebar')
  assert.equal(TODO_PANEL_TITLE, 'Thread Todo')
  assert.equal(TODO_PANEL_CLEAR_LABEL, 'Clear todos')
  assert.equal(TODO_PANEL_EMPTY_TITLE, 'No todos yet')
  assert.equal(
    TODO_PANEL_EMPTY_DESCRIPTION,
    'Plan checklists and model-written todos for this thread will appear here.',
  )
  assert.equal(TODO_STATUS_PENDING_LABEL, 'Pending')
  assert.equal(TODO_STATUS_IN_PROGRESS_LABEL, 'Active')
  assert.equal(TODO_STATUS_COMPLETED_LABEL, 'Done')
  assert.equal(TODO_MARK_PENDING_LABEL, 'Mark pending')
  assert.equal(TODO_MARK_COMPLETED_LABEL, 'Mark complete')
})

test('todo row status labels match Kun todoStatus.* locale strings', () => {
  assert.equal(TODO_ROW_STATUS_LABELS.pending, 'Pending')
  assert.equal(TODO_ROW_STATUS_LABELS.in_progress, 'Active')
  assert.equal(TODO_ROW_STATUS_LABELS.completed, 'Done')
  assert.equal(resolveTodoRowStatusLabel('pending'), 'Pending')
  assert.equal(resolveTodoRowStatusLabel('in_progress'), 'Active')
  assert.equal(resolveTodoRowStatusLabel('completed'), 'Done')
})
