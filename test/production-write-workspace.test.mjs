import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PRODUCTION_WRITE_WORKSPACE_ASSISTANT_MODES,
  PRODUCTION_WRITE_WORKSPACE_SNAPSHOT_MODES,
  resolveProductionWriteWorkspaceMode,
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

test('assistant modes resolve through production mode helper', () => {
  for (const mode of PRODUCTION_WRITE_WORKSPACE_ASSISTANT_MODES) {
    assert.equal(
      resolveProductionWriteWorkspaceMode(new URLSearchParams(`productionWriteWorkspace=${mode}`)),
      mode,
    )
  }
})

test('production mode defaults to split for unknown params', () => {
  assert.equal(
    resolveProductionWriteWorkspaceMode(new URLSearchParams('productionWriteWorkspace=unknown')),
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
    'loading',
    'unsupported',
    'largeFile',
    'truncated',
    'liveDisabled',
    'inlineAgent',
    'inlineAgentBlockMenu',
    'inlineAgentEmptyAgents',
    'inlineAgentAskOnly',
    'inlineAgentPreferAbove',
    'inlineAgentInFlight',
    'inlineAgentSkills',
    'inlineAgentImageMode',
    'error',
    'exportSuccess',
    'exportError',
    'exporting',
    'dirty',
    'saving',
    'readonly',
    'review',
    'exportMenu',
    'modeMenu',
  ]) {
    assert.ok(PRODUCTION_WRITE_WORKSPACE_SNAPSHOT_MODES.has(mode), `expected ${mode} in snapshot modes`)
    assert.equal(
      resolveProductionWriteWorkspaceSnapshotMode(new URLSearchParams(`productionWriteWorkspace=${mode}`)),
      mode,
    )
  }
})
