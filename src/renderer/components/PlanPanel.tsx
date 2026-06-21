// Right-side plan panel echoing Kun's PlanPanel
// (../Kun/src/renderer/src/components/plan/PlanPanel.tsx).
// Visual only: parent supplies plan snapshots and optional action callbacks.

import { type ReactElement } from 'react'
import {
  ClipboardList,
  ExternalLink,
  Hammer,
  Loader2,
  PanelRightClose,
  RefreshCw,
  Save,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'

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

export type PlanPanelPreviewMode =
  | 'default'
  | 'empty'
  | 'noworkspace'
  | 'dirty'
  | 'saving'
  | 'coverage'
  | 'drift'
  | 'error'

type Props = {
  workspaceRoot?: string
  activePlan?: PlanActivePlan | null
  saveStatus?: PlanSaveStatus
  operationStatus?: PlanOperationStatus
  error?: string | null
  coverage?: PlanCoverageTrace | null
  className?: string
  onCollapse?: () => void
  onOpenPlanFile?: () => void
  onBuildPlan?: () => void
  onVerifyPlan?: () => void
  onReplanChanged?: () => void
}

const COPY = {
  rightPanelCollapse: 'Collapse panel',
  planPanelTitle: 'Plan',
  planNoActiveFile: 'No plan file selected',
  planNoWorkspace: 'Choose a working directory first.',
  planEmptyTitle: 'No plan file',
  planEmptySub:
    'Create a plan from the composer or reopen a recent plan for this workspace.',
  planOpenFile: 'Open plan file',
  planRefineHint:
    'Want changes? Keep chatting on the left and the model will update this plan.',
  planBuild: 'Build',
  planStatusDrafting: 'Drafting',
  planStatusRefining: 'Refining',
  planStatusBuilding: 'Building',
  planStatusSaving: 'Saving',
  planStatusDirty: 'Unsaved',
  planStatusSaved: 'Saved',
  planStatusError: 'Needs attention',
  planCoverageLabel: (covered: number, total: number) => `Coverage ${covered}/${total}`,
  planCoverageUncovered: (ids: string) => `Uncovered: ${ids}`,
  planVerify: 'Verify',
  planVerifyRunning: 'Verifying…',
  sddChangedBanner: (ids: string) =>
    `Requirements ${ids} changed after planning; the plan may be stale`,
  sddReplanButton: 'Replan affected steps',
}

const PREVIEW_PLAN: PlanActivePlan = {
  featureName: 'Refactor auth middleware',
  relativePath: 'docs/plans/refactor-auth-middleware.md',
}

const PREVIEW_WORKSPACE = '/Users/season/Personal/navi'

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

function statusLabel(saveStatus: PlanSaveStatus, operationStatus: PlanOperationStatus): string {
  if (operationStatus === 'drafting') return COPY.planStatusDrafting
  if (operationStatus === 'refining') return COPY.planStatusRefining
  if (operationStatus === 'building') return COPY.planStatusBuilding
  if (operationStatus === 'error' || saveStatus === 'error') return COPY.planStatusError
  if (saveStatus === 'saving') return COPY.planStatusSaving
  if (saveStatus === 'dirty') return COPY.planStatusDirty
  return COPY.planStatusSaved
}

function isStatusBusy(saveStatus: PlanSaveStatus, operationStatus: PlanOperationStatus): boolean {
  return (
    saveStatus === 'saving' ||
    operationStatus === 'drafting' ||
    operationStatus === 'refining' ||
    operationStatus === 'building'
  )
}

function PlanEditorPreview(): ReactElement {
  return (
    <div className="plan-panel-editor-preview">
      <h1>Refactor auth middleware</h1>
      <h2>Goal</h2>
      <p>
        Consolidate token validation and refresh handling into a single middleware module
        with clearer error surfaces for the chat composer.
      </p>
      <h2>Requirements</h2>
      <ul>
        <li>R-1: Preserve existing bearer-token header parsing</li>
        <li>R-2: Add refresh-token rotation for long sessions</li>
        <li>R-3: Surface auth failures as structured tool errors</li>
        <li>R-4: Audit middleware call sites in the runtime bridge</li>
        <li>R-5: Add regression tests for expired and malformed tokens</li>
      </ul>
      <h2>Steps</h2>
      <ol>
        <li>Inventory current auth middleware and session store touch points</li>
        <li>Extract shared token parsing helpers</li>
        <li>Wire refresh flow through the session store</li>
        <li>Update runtime error mapping and add tests</li>
      </ol>
    </div>
  )
}

export function PlanPanel({
  workspaceRoot = PREVIEW_WORKSPACE,
  activePlan = PREVIEW_PLAN,
  saveStatus = 'saved',
  operationStatus = 'idle',
  error = null,
  coverage = null,
  className = '',
  onCollapse,
  onOpenPlanFile,
  onBuildPlan,
  onVerifyPlan,
  onReplanChanged,
}: Props): ReactElement {
  const hasWorkspace = Boolean(workspaceRoot.trim())
  const hasPlan = Boolean(activePlan)
  const statusText = statusLabel(saveStatus, operationStatus)
  const statusBusy = isStatusBusy(saveStatus, operationStatus)
  const showCoverageRow = Boolean(coverage && coverage.total > 0)
  const driftIds = coverage?.driftIds ?? []

  return (
    <aside className={`plan-panel ds-no-drag ${className}`.trim()}>
      <div className="plan-panel-header">
        <div className="plan-panel-header-row">
          <button
            type="button"
            onClick={onCollapse}
            className="ds-sidebar-toggle-button plan-panel-collapse-btn"
            aria-label={COPY.rightPanelCollapse}
            title={COPY.rightPanelCollapse}
          >
            <PanelRightClose className="plan-panel-collapse-icon" strokeWidth={1.85} />
          </button>
          <div className="plan-panel-title-chip">
            <ClipboardList className="plan-panel-title-icon" strokeWidth={1.8} />
            <span className="plan-panel-title">
              {activePlan?.featureName || COPY.planPanelTitle}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenPlanFile}
            disabled={!activePlan}
            className="ds-sidebar-toggle-button plan-panel-open-btn"
            aria-label={COPY.planOpenFile}
            title={COPY.planOpenFile}
          >
            <ExternalLink className="plan-panel-open-icon" strokeWidth={1.9} />
          </button>
        </div>
        <div className="plan-panel-meta-row">
          <div className="plan-panel-path-pill">
            {activePlan?.relativePath ?? COPY.planNoActiveFile}
          </div>
          <div className="plan-panel-status-pill">
            {statusBusy ? (
              <Loader2 className="plan-panel-status-icon plan-panel-status-icon-spin" strokeWidth={2} />
            ) : (
              <Save className="plan-panel-status-icon" strokeWidth={1.85} />
            )}
            <span>{statusText}</span>
          </div>
        </div>
        {showCoverageRow && coverage ? (
          <div className="plan-panel-coverage-row">
            <span className="plan-panel-coverage-badge">
              {COPY.planCoverageLabel(coverage.covered, coverage.total)}
            </span>
            {coverage.uncoveredIds.length > 0 ? (
              <span className="plan-panel-uncovered-badge">
                <TriangleAlert className="plan-panel-uncovered-icon" strokeWidth={2} />
                <span className="plan-panel-uncovered-text">
                  {COPY.planCoverageUncovered(coverage.uncoveredIds.join(', '))}
                </span>
              </span>
            ) : null}
            {onVerifyPlan ? (
              <button type="button" onClick={onVerifyPlan} className="plan-panel-verify-btn">
                <ShieldCheck className="plan-panel-verify-icon" strokeWidth={2} />
                {COPY.planVerify}
              </button>
            ) : null}
            {driftIds.length > 0 ? (
              <div className="plan-panel-drift-banner">
                <TriangleAlert className="plan-panel-drift-icon" strokeWidth={2} />
                <span className="plan-panel-drift-text">
                  {COPY.sddChangedBanner(driftIds.join(', '))}
                </span>
                {onReplanChanged ? (
                  <button type="button" onClick={onReplanChanged} className="plan-panel-replan-btn">
                    <RefreshCw className="plan-panel-replan-icon" strokeWidth={2} />
                    {COPY.sddReplanButton}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="plan-panel-body">
        {!hasWorkspace ? (
          <div className="plan-panel-no-workspace">{COPY.planNoWorkspace}</div>
        ) : !hasPlan ? (
          <div className="plan-panel-empty">
            <div className="plan-panel-empty-icon-wrap">
              <ClipboardList className="plan-panel-empty-icon" strokeWidth={1.9} />
            </div>
            <div className="plan-panel-empty-title">{COPY.planEmptyTitle}</div>
            <p className="plan-panel-empty-description">{COPY.planEmptySub}</p>
          </div>
        ) : (
          <div className="plan-panel-editor-shell">
            <PlanEditorPreview />
          </div>
        )}
      </div>

      {hasPlan ? (
        <div className="plan-panel-footer">
          {error ? <div className="plan-panel-error">{error}</div> : null}
          <p className="plan-panel-refine-hint">{COPY.planRefineHint}</p>
          <button type="button" onClick={onBuildPlan} className="plan-panel-build-btn">
            <Hammer className="plan-panel-build-icon" strokeWidth={1.9} />
            {COPY.planBuild}
          </button>
        </div>
      ) : null}
    </aside>
  )
}
