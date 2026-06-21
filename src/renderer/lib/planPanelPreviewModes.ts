// Shared PlanPanel preview mode identifiers and snapshot resolution.

export type PlanPanelPreviewMode =
  | 'default'
  | 'empty'
  | 'noworkspace'
  | 'dirty'
  | 'saving'
  | 'coverage'
  | 'drift'
  | 'error'
  | 'richFallback'

export type PlanSaveStatus = 'saved' | 'dirty' | 'saving' | 'error'

export type PlanOperationStatus = 'idle' | 'drafting' | 'refining' | 'building' | 'error'

export type PlanActivePlan = {
  featureName: string
  relativePath: string
}

export type PlanCoverageTrace = {
  covered: number
  total: number
  uncoveredIds: string[]
  driftIds: string[]
}

const PREVIEW_WORKSPACE = '/Users/season/Personal/navi'

const PREVIEW_PLAN: PlanActivePlan = {
  featureName: 'Refactor auth middleware',
  relativePath: 'docs/plans/refactor-auth-middleware.md',
}

export const PREVIEW_COVERAGE: PlanCoverageTrace = {
  covered: 3,
  total: 5,
  uncoveredIds: ['R-4', 'R-5'],
  driftIds: [],
}

export const PREVIEW_DRIFT: PlanCoverageTrace = {
  covered: 4,
  total: 5,
  uncoveredIds: [],
  driftIds: ['R-2', 'R-3'],
}

/** Default snapshot for ?planPanelPreview=1 visual verification. */
export const PLAN_PANEL_PREVIEW = {
  workspaceRoot: PREVIEW_WORKSPACE,
  activePlan: PREVIEW_PLAN,
  saveStatus: 'saved' as PlanSaveStatus,
  operationStatus: 'idle' as PlanOperationStatus,
  error: null as string | null,
  coverage: null as PlanCoverageTrace | null,
}

export type PlanPanelSnapshotProps = {
  workspaceRoot: string
  activePlan: PlanActivePlan | null
  saveStatus: PlanSaveStatus
  operationStatus: PlanOperationStatus
  error: string | null
  coverage: PlanCoverageTrace | null
  showRichFallback: boolean
}

const ALL_MODES = new Set<PlanPanelPreviewMode>([
  'default',
  'empty',
  'noworkspace',
  'dirty',
  'saving',
  'coverage',
  'drift',
  'error',
  'richFallback',
])

/** Snapshot modes exposed via ?productionPlanPanel for live plan-panel verification. */
export const PRODUCTION_PLAN_PANEL_MODES = new Set<PlanPanelPreviewMode>([
  'default',
  'empty',
  'noworkspace',
  'dirty',
  'saving',
  'coverage',
  'drift',
  'error',
  'richFallback',
])

export function resolveProductionPlanPanelParam(
  searchParams?: URLSearchParams | null,
): string | null {
  if (searchParams) {
    return searchParams.get('productionPlanPanel')
  }
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('productionPlanPanel')
}

export function resolveProductionPlanPanelMode(
  searchParams?: URLSearchParams | null,
): PlanPanelPreviewMode {
  const value = resolveProductionPlanPanelParam(searchParams)
  if (value && ALL_MODES.has(value as PlanPanelPreviewMode)) {
    return value as PlanPanelPreviewMode
  }
  return 'default'
}

export function resolvePlanPanelPreviewSnapshot(
  mode: PlanPanelPreviewMode,
): PlanPanelSnapshotProps {
  const showRichFallback = mode === 'richFallback'

  if (mode === 'noworkspace') {
    return {
      workspaceRoot: '',
      activePlan: null,
      saveStatus: 'saved',
      operationStatus: 'idle',
      error: null,
      coverage: null,
      showRichFallback,
    }
  }

  if (mode === 'empty') {
    return {
      workspaceRoot: PLAN_PANEL_PREVIEW.workspaceRoot,
      activePlan: null,
      saveStatus: 'saved',
      operationStatus: 'idle',
      error: null,
      coverage: null,
      showRichFallback,
    }
  }

  if (mode === 'dirty') {
    return {
      ...PLAN_PANEL_PREVIEW,
      saveStatus: 'dirty',
      showRichFallback,
    }
  }

  if (mode === 'saving') {
    return {
      ...PLAN_PANEL_PREVIEW,
      saveStatus: 'saving',
      showRichFallback,
    }
  }

  if (mode === 'coverage') {
    return {
      ...PLAN_PANEL_PREVIEW,
      coverage: PREVIEW_COVERAGE,
      showRichFallback,
    }
  }

  if (mode === 'drift') {
    return {
      ...PLAN_PANEL_PREVIEW,
      coverage: PREVIEW_DRIFT,
      showRichFallback,
    }
  }

  if (mode === 'error') {
    return {
      ...PLAN_PANEL_PREVIEW,
      error: 'Could not start the agent turn for this plan.',
      showRichFallback,
    }
  }

  return {
    ...PLAN_PANEL_PREVIEW,
    showRichFallback,
  }
}
