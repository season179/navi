import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.plan-panel-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'planPanel.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  PLAN_BUILD_LABEL,
  PLAN_COVERAGE_LABEL_TEMPLATE,
  PLAN_COVERAGE_UNCOVERED_TEMPLATE,
  PLAN_EMPTY_DESCRIPTION,
  PLAN_EMPTY_TITLE,
  PLAN_NO_ACTIVE_FILE_LABEL,
  PLAN_NO_WORKSPACE_LABEL,
  PLAN_OPEN_FILE_LABEL,
  PLAN_PANEL_COLLAPSE_LABEL,
  PLAN_PANEL_TITLE,
  PLAN_REFINE_HINT,
  PLAN_SDD_CHANGED_BANNER_TEMPLATE,
  PLAN_SDD_REPLAN_LABEL,
  PLAN_STATUS_BUILDING_LABEL,
  PLAN_STATUS_DIRTY_LABEL,
  PLAN_STATUS_DRAFTING_LABEL,
  PLAN_STATUS_ERROR_LABEL,
  PLAN_STATUS_REFINING_LABEL,
  PLAN_STATUS_SAVED_LABEL,
  PLAN_STATUS_SAVING_LABEL,
  PLAN_VERIFY_LABEL,
  PLAN_VERIFY_RUNNING_LABEL,
  formatPlanCoverageLabel,
  formatPlanCoverageUncovered,
  formatPlanSddChangedBanner,
  resolvePlanStatusLabel,
} = await import(out)

test('plan panel chrome copy matches Kun locale strings', () => {
  assert.equal(PLAN_PANEL_COLLAPSE_LABEL, 'Collapse right sidebar')
  assert.equal(PLAN_PANEL_TITLE, 'Plan')
  assert.equal(PLAN_NO_ACTIVE_FILE_LABEL, 'No plan file selected')
  assert.equal(PLAN_NO_WORKSPACE_LABEL, 'Choose a working directory first.')
  assert.equal(PLAN_EMPTY_TITLE, 'No plan file')
  assert.equal(
    PLAN_EMPTY_DESCRIPTION,
    'Create a plan from the composer or reopen a recent plan for this workspace.',
  )
  assert.equal(PLAN_OPEN_FILE_LABEL, 'Open plan file')
  assert.equal(
    PLAN_REFINE_HINT,
    'Want changes? Keep chatting on the left and the model will update this plan.',
  )
  assert.equal(PLAN_BUILD_LABEL, 'Build')
  assert.equal(PLAN_STATUS_DRAFTING_LABEL, 'Drafting')
  assert.equal(PLAN_STATUS_REFINING_LABEL, 'Refining')
  assert.equal(PLAN_STATUS_BUILDING_LABEL, 'Building')
  assert.equal(PLAN_STATUS_SAVING_LABEL, 'Saving')
  assert.equal(PLAN_STATUS_DIRTY_LABEL, 'Unsaved')
  assert.equal(PLAN_STATUS_SAVED_LABEL, 'Saved')
  assert.equal(PLAN_STATUS_ERROR_LABEL, 'Needs attention')
  assert.equal(PLAN_VERIFY_LABEL, 'Verify')
  assert.equal(PLAN_VERIFY_RUNNING_LABEL, 'Verifying…')
  assert.equal(PLAN_SDD_REPLAN_LABEL, 'Replan affected steps')
  assert.equal(PLAN_COVERAGE_LABEL_TEMPLATE, 'Coverage {{covered}}/{{total}}')
  assert.equal(PLAN_COVERAGE_UNCOVERED_TEMPLATE, 'Uncovered: {{ids}}')
  assert.equal(
    PLAN_SDD_CHANGED_BANNER_TEMPLATE,
    'Requirements {{ids}} changed after planning; the plan may be stale',
  )
})

test('plan status label resolver matches Kun planStatus.* locale strings', () => {
  assert.equal(resolvePlanStatusLabel('saved', 'drafting'), 'Drafting')
  assert.equal(resolvePlanStatusLabel('saved', 'refining'), 'Refining')
  assert.equal(resolvePlanStatusLabel('saved', 'building'), 'Building')
  assert.equal(resolvePlanStatusLabel('error', 'idle'), 'Needs attention')
  assert.equal(resolvePlanStatusLabel('saved', 'error'), 'Needs attention')
  assert.equal(resolvePlanStatusLabel('saving', 'idle'), 'Saving')
  assert.equal(resolvePlanStatusLabel('dirty', 'idle'), 'Unsaved')
  assert.equal(resolvePlanStatusLabel('saved', 'idle'), 'Saved')
})

test('plan coverage and drift formatters match Kun i18n templates', () => {
  assert.equal(formatPlanCoverageLabel(3, 5), 'Coverage 3/5')
  assert.equal(formatPlanCoverageUncovered('R-4, R-5'), 'Uncovered: R-4, R-5')
  assert.equal(
    formatPlanSddChangedBanner('R-2, R-3'),
    'Requirements R-2, R-3 changed after planning; the plan may be stale',
  )
})
