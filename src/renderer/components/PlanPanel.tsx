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
import { WriteMarkdownEditor } from './WriteMarkdownEditor'
import { WriteRichEditor } from './WriteRichEditor'
import {
  PLAN_PANEL_PREVIEW,
  PREVIEW_COVERAGE,
  PREVIEW_DRIFT,
  type PlanActivePlan,
  type PlanCoverageTrace,
  type PlanOperationStatus,
  type PlanPanelPreviewMode,
  type PlanSaveStatus,
} from '../lib/planPanelPreviewModes'

export type {
  PlanActivePlan,
  PlanCoverageTrace,
  PlanOperationStatus,
  PlanPanelPreviewMode,
  PlanSaveStatus,
} from '../lib/planPanelPreviewModes'
export { PLAN_PANEL_PREVIEW, PREVIEW_COVERAGE, PREVIEW_DRIFT } from '../lib/planPanelPreviewModes'

type Props = {
  workspaceRoot?: string
  activePlan?: PlanActivePlan | null
  saveStatus?: PlanSaveStatus
  operationStatus?: PlanOperationStatus
  error?: string | null
  coverage?: PlanCoverageTrace | null
  readOnly?: boolean
  /** Static preview: show WriteRichEditor amber fallback with source editor beneath. */
  showRichFallback?: boolean
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

/** Sample markdown backing the plan panel rich editor fallback surface. */
export const PLAN_PANEL_RICH_SAMPLE = `# Refactor auth middleware

## Goal

Consolidate token validation and refresh handling into a single middleware module with clearer error surfaces for the chat composer.

## Requirements

- R-1: Preserve existing bearer-token header parsing
- R-2: Add refresh-token rotation for long sessions
- R-3: Surface auth failures as structured tool errors
- R-4: Audit middleware call sites in the runtime bridge
- R-5: Add regression tests for expired and malformed tokens

## Steps

1. Inventory current auth middleware and session store touch points
2. Extract shared token parsing helpers
3. Wire refresh flow through the session store
4. Update runtime error mapping and add tests
`

function PlanRichEditorSampleContent(): ReactElement {
  return (
    <>
      <h1>Refactor auth middleware</h1>
      <h2>Goal</h2>
      <p>
        Consolidate token validation and refresh handling into a single middleware module
        with clearer error surfaces for the chat composer.
      </p>
      <h2>Requirements</h2>
      <ul>
        <li>
          <p>R-1: Preserve existing bearer-token header parsing</p>
        </li>
        <li>
          <p>R-2: Add refresh-token rotation for long sessions</p>
        </li>
        <li>
          <p>R-3: Surface auth failures as structured tool errors</p>
        </li>
        <li>
          <p>R-4: Audit middleware call sites in the runtime bridge</p>
        </li>
        <li>
          <p>R-5: Add regression tests for expired and malformed tokens</p>
        </li>
      </ul>
      <h2>Steps</h2>
      <ol>
        <li>
          <p>Inventory current auth middleware and session store touch points</p>
        </li>
        <li>
          <p>Extract shared token parsing helpers</p>
        </li>
        <li>
          <p>Wire refresh flow through the session store</p>
        </li>
        <li>
          <p>Update runtime error mapping and add tests</p>
        </li>
      </ol>
    </>
  )
}

export function PlanPanel({
  workspaceRoot = PLAN_PANEL_PREVIEW.workspaceRoot,
  activePlan = PLAN_PANEL_PREVIEW.activePlan,
  saveStatus = 'saved',
  operationStatus = 'idle',
  error = null,
  coverage = null,
  readOnly = false,
  showRichFallback = false,
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
            <WriteRichEditor
              readOnly={readOnly}
              showFallback={showRichFallback}
              sampleContent={<PlanRichEditorSampleContent />}
              fallback={
                <WriteMarkdownEditor
                  value={PLAN_PANEL_RICH_SAMPLE}
                  appearance="live"
                  readOnly={readOnly}
                />
              }
            />
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
