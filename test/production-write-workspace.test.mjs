import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PRODUCTION_WRITE_WORKSPACE_SNAPSHOT_MODES,
  resolveProductionWriteWorkspaceSnapshotMode,
} from '../src/renderer/lib/writeWorkspacePreviewModes.ts'

test('defaults to split when param is absent', () => {
  assert.equal(resolveProductionWriteWorkspaceSnapshotMode(new URLSearchParams()), 'split')
})

test('defaults to split for unknown param values', () => {
  assert.equal(
    resolveProductionWriteWorkspaceSnapshotMode(new URLSearchParams('productionWriteWorkspace=unknown')),
    'split',
  )
})

test('assistant modes are not snapshot modes (handled separately)', () => {
  assert.equal(
    resolveProductionWriteWorkspaceSnapshotMode(new URLSearchParams('productionWriteWorkspace=assistant')),
    'split',
  )
})

test('maps document-pane and toolbar snapshot modes', () => {
  for (const mode of [
    'empty',
    'emptyError',
    'start',
    'runtimeBanner',
    'live',
    'source',
    'rich',
    'preview',
    'pdf',
    'image',
    'inlineAgent',
    'error',
    'exportSuccess',
    'exportError',
    'dirty',
    'saving',
  ]) {
    assert.ok(PRODUCTION_WRITE_WORKSPACE_SNAPSHOT_MODES.has(mode), `expected ${mode} in snapshot modes`)
    assert.equal(
      resolveProductionWriteWorkspaceSnapshotMode(new URLSearchParams(`productionWriteWorkspace=${mode}`)),
      mode,
    )
  }
})
