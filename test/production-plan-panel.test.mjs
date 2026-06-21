import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PRODUCTION_PLAN_PANEL_MODES,
  resolvePlanPanelPreviewSnapshot,
  resolveProductionPlanPanelMode,
} from '../src/renderer/lib/planPanelPreviewModes.ts'

test('defaults to default when param is absent', () => {
  assert.equal(resolveProductionPlanPanelMode(new URLSearchParams()), 'default')
})

test('defaults to default for unknown param values', () => {
  assert.equal(
    resolveProductionPlanPanelMode(new URLSearchParams('productionPlanPanel=unknown')),
    'default',
  )
})

test('maps all production plan panel snapshot modes', () => {
  for (const mode of [
    'default',
    'empty',
    'noworkspace',
    'dirty',
    'saving',
    'coverage',
    'drift',
    'error',
    'richFallback',
  ]) {
    assert.ok(PRODUCTION_PLAN_PANEL_MODES.has(mode), `expected ${mode} in production modes`)
    assert.equal(
      resolveProductionPlanPanelMode(new URLSearchParams(`productionPlanPanel=${mode}`)),
      mode,
    )
  }
})

test('richFallback enables WriteRichEditor fallback surface', () => {
  const snapshot = resolvePlanPanelPreviewSnapshot('richFallback')
  assert.equal(snapshot.showRichFallback, true)
  assert.ok(snapshot.activePlan)
})
