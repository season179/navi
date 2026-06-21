import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-goal-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerGoal.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  COMPOSER_GOAL_ACTIVE_HEADING,
  COMPOSER_GOAL_NO_ACTIVE_TITLE,
  COMPOSER_GOAL_PAUSED_PREVIEW,
  COMPOSER_GOAL_PREVIEW,
  COMPOSER_GOAL_SET_CURRENT_INPUT,
  COMPOSER_GOAL_STATUS_PAUSED,
  formatComposerGoalBannerLabel,
  formatComposerGoalStatusShort,
  getGoalPanelDraftObjective,
  resolveComposerGoalPreview,
} = await import(out)

test('COMPOSER_GOAL_PREVIEW matches Kun goal mock data', () => {
  assert.equal(COMPOSER_GOAL_PREVIEW.objective, 'Port Kun FloatingComposer visuals into navi')
  assert.equal(COMPOSER_GOAL_PREVIEW.status, 'active')
  assert.equal(COMPOSER_GOAL_PREVIEW.elapsedLabel, '12m')
})

test('goal copy matches Kun locale strings', () => {
  assert.equal(COMPOSER_GOAL_ACTIVE_HEADING, 'Active goal')
  assert.equal(COMPOSER_GOAL_NO_ACTIVE_TITLE, 'No active goal')
  assert.equal(COMPOSER_GOAL_SET_CURRENT_INPUT, 'Set as goal')
  assert.equal(formatComposerGoalBannerLabel('active'), 'Active goal')
  assert.equal(formatComposerGoalBannerLabel('paused'), COMPOSER_GOAL_STATUS_PAUSED)
  assert.equal(formatComposerGoalStatusShort('active'), 'Active')
  assert.equal(formatComposerGoalStatusShort('paused'), 'Paused')
})

test('resolveComposerGoalPreview routes paused preview mode', () => {
  assert.equal(resolveComposerGoalPreview(null), COMPOSER_GOAL_PREVIEW)
  assert.equal(resolveComposerGoalPreview('paused'), COMPOSER_GOAL_PAUSED_PREVIEW)
  assert.equal(resolveComposerGoalPreview('paused').status, 'paused')
})

test('getGoalPanelDraftObjective matches Kun goal panel draft rules', () => {
  assert.equal(getGoalPanelDraftObjective('ship the goal UX', true), 'ship the goal UX')
  assert.equal(getGoalPanelDraftObjective('  ship the goal UX  ', true), 'ship the goal UX')
  assert.equal(getGoalPanelDraftObjective('ship the goal UX', false), '')
  assert.equal(getGoalPanelDraftObjective('/goal pause', true), '')
  assert.equal(getGoalPanelDraftObjective('/compact after this', true), '')
})
