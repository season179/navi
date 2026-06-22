// Kun PlanPanel chrome
// (../Kun/src/renderer/src/components/plan/PlanPanel.tsx).
// Visual only — used for production PlanPanel and preview hooks.

import type { PlanOperationStatus, PlanSaveStatus } from './planPanelPreviewModes'

/** English copy matching Kun's rightPanelCollapse locale string. */
export const PLAN_PANEL_COLLAPSE_LABEL = 'Collapse right sidebar'

/** English copy matching Kun's planPanelTitle locale string. */
export const PLAN_PANEL_TITLE = 'Plan'

/** English copy matching Kun's planNoActiveFile locale string. */
export const PLAN_NO_ACTIVE_FILE_LABEL = 'No plan file selected'

/** English copy matching Kun's planNoWorkspace locale string. */
export const PLAN_NO_WORKSPACE_LABEL = 'Choose a working directory first.'

/** English copy matching Kun's planEmptyTitle locale string. */
export const PLAN_EMPTY_TITLE = 'No plan file'

/** English copy matching Kun's planEmptySub locale string. */
export const PLAN_EMPTY_DESCRIPTION =
  'Create a plan from the composer or reopen a recent plan for this workspace.'

/** English copy matching Kun's planOpenFile locale string. */
export const PLAN_OPEN_FILE_LABEL = 'Open plan file'

/** English copy matching Kun's planRefineHint locale string. */
export const PLAN_REFINE_HINT =
  'Want changes? Keep chatting on the left and the model will update this plan.'

/** English copy matching Kun's planBuild locale string. */
export const PLAN_BUILD_LABEL = 'Build'

/** English copy matching Kun's planStatusDrafting locale string. */
export const PLAN_STATUS_DRAFTING_LABEL = 'Drafting'

/** English copy matching Kun's planStatusRefining locale string. */
export const PLAN_STATUS_REFINING_LABEL = 'Refining'

/** English copy matching Kun's planStatusBuilding locale string. */
export const PLAN_STATUS_BUILDING_LABEL = 'Building'

/** English copy matching Kun's planStatusSaving locale string. */
export const PLAN_STATUS_SAVING_LABEL = 'Saving'

/** English copy matching Kun's planStatusDirty locale string. */
export const PLAN_STATUS_DIRTY_LABEL = 'Unsaved'

/** English copy matching Kun's planStatusSaved locale string. */
export const PLAN_STATUS_SAVED_LABEL = 'Saved'

/** English copy matching Kun's planStatusError locale string. */
export const PLAN_STATUS_ERROR_LABEL = 'Needs attention'

/** English copy matching Kun's planVerify locale string. */
export const PLAN_VERIFY_LABEL = 'Verify'

/** English copy matching Kun's planVerifyRunning locale string. */
export const PLAN_VERIFY_RUNNING_LABEL = 'Verifying…'

/** English copy matching Kun's sddReplanButton locale string. */
export const PLAN_SDD_REPLAN_LABEL = 'Replan affected steps'

/** English copy matching Kun's planCoverageLabel locale string. */
export const PLAN_COVERAGE_LABEL_TEMPLATE = 'Coverage {{covered}}/{{total}}'

/** English copy matching Kun's planCoverageUncovered locale string. */
export const PLAN_COVERAGE_UNCOVERED_TEMPLATE = 'Uncovered: {{ids}}'

/** English copy matching Kun's sddChangedBanner locale string. */
export const PLAN_SDD_CHANGED_BANNER_TEMPLATE =
  'Requirements {{ids}} changed after planning; the plan may be stale'

export function resolvePlanStatusLabel(
  saveStatus: PlanSaveStatus,
  operationStatus: PlanOperationStatus,
): string {
  if (operationStatus === 'drafting') return PLAN_STATUS_DRAFTING_LABEL
  if (operationStatus === 'refining') return PLAN_STATUS_REFINING_LABEL
  if (operationStatus === 'building') return PLAN_STATUS_BUILDING_LABEL
  if (operationStatus === 'error' || saveStatus === 'error') return PLAN_STATUS_ERROR_LABEL
  if (saveStatus === 'saving') return PLAN_STATUS_SAVING_LABEL
  if (saveStatus === 'dirty') return PLAN_STATUS_DIRTY_LABEL
  return PLAN_STATUS_SAVED_LABEL
}

export function formatPlanCoverageLabel(covered: number, total: number): string {
  return PLAN_COVERAGE_LABEL_TEMPLATE.replace('{{covered}}', String(covered)).replace(
    '{{total}}',
    String(total),
  )
}

export function formatPlanCoverageUncovered(ids: string): string {
  return PLAN_COVERAGE_UNCOVERED_TEMPLATE.replace('{{ids}}', ids)
}

export function formatPlanSddChangedBanner(ids: string): string {
  return PLAN_SDD_CHANGED_BANNER_TEMPLATE.replace('{{ids}}', ids)
}
