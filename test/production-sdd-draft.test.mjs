import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PRODUCTION_SDD_DRAFT_SNAPSHOT_MODES,
  isProductionSddDraftAssistantMode,
  resolveProductionSddDraftMode,
  resolveProductionSddDraftSnapshotMode,
} from '../src/renderer/lib/sddDraftPreviewModes.ts'

test('defaults to default when param is absent', () => {
  assert.equal(resolveProductionSddDraftSnapshotMode(new URLSearchParams()), 'default')
  assert.equal(resolveProductionSddDraftMode(new URLSearchParams()), 'default')
})

test('defaults to default for unknown param values', () => {
  assert.equal(
    resolveProductionSddDraftSnapshotMode(new URLSearchParams('productionSddDraft=unknown')),
    'default',
  )
})

test('assistant modes resolve to default snapshot but are flagged as assistant modes', () => {
  for (const mode of ['assistantOpen', 'assistantTimeline', 'assistantBusy']) {
    assert.equal(
      resolveProductionSddDraftSnapshotMode(new URLSearchParams(`productionSddDraft=${mode}`)),
      'default',
    )
    assert.equal(resolveProductionSddDraftMode(new URLSearchParams(`productionSddDraft=${mode}`)), mode)
    assert.equal(
      isProductionSddDraftAssistantMode(new URLSearchParams(`productionSddDraft=${mode}`)),
      true,
    )
  }
})

test('maps draft-editor snapshot modes', () => {
  for (const mode of [
    'default',
    'dirty',
    'saving',
    'error',
    'upgrading',
    'designContext',
    'noDraft',
    'leftCollapsed',
    'withNotice',
    'inlineAgent',
    'richFallback',
  ]) {
    assert.ok(PRODUCTION_SDD_DRAFT_SNAPSHOT_MODES.has(mode), `expected ${mode} in snapshot modes`)
    assert.equal(
      resolveProductionSddDraftSnapshotMode(new URLSearchParams(`productionSddDraft=${mode}`)),
      mode,
    )
    assert.equal(resolveProductionSddDraftMode(new URLSearchParams(`productionSddDraft=${mode}`)), mode)
  }
})
