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
import { WriteMarkdownEditor } from '../write/WriteMarkdownEditor'
import { WriteRichEditor } from '../write/WriteRichEditor'
import {
  formatPlanCoverageLabel,
  formatPlanCoverageUncovered,
  formatPlanSddChangedBanner,
  PLAN_BUILD_LABEL,
  PLAN_EMPTY_DESCRIPTION,
  PLAN_EMPTY_TITLE,
  PLAN_NO_ACTIVE_FILE_LABEL,
  PLAN_NO_WORKSPACE_LABEL,
  PLAN_OPEN_FILE_LABEL,
  PLAN_PANEL_COLLAPSE_LABEL,
  PLAN_PANEL_TITLE,
  PLAN_REFINE_HINT,
  PLAN_SDD_REPLAN_LABEL,
  PLAN_VERIFY_LABEL,
  resolvePlanStatusLabel,
} from '../../lib/planPanel'
import {
  PLAN_PANEL_PREVIEW,
  PREVIEW_COVERAGE,
  PREVIEW_DRIFT,
  type PlanActivePlan,
  type PlanCoverageTrace,
  type PlanOperationStatus,
  type PlanPanelPreviewMode,
  type PlanSaveStatus,
} from '../../lib/planPanelPreviewModes'

export type {
  PlanActivePlan,
  PlanCoverageTrace,
  PlanOperationStatus,
  PlanPanelPreviewMode,
  PlanSaveStatus,
} from '../../lib/planPanelPreviewModes'
export { PLAN_PANEL_PREVIEW, PREVIEW_COVERAGE, PREVIEW_DRIFT } from '../../lib/planPanelPreviewModes'

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
  const statusText = resolvePlanStatusLabel(saveStatus, operationStatus)
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
            aria-label={PLAN_PANEL_COLLAPSE_LABEL}
            title={PLAN_PANEL_COLLAPSE_LABEL}
          >
            <PanelRightClose className="plan-panel-collapse-icon" strokeWidth={1.85} />
          </button>
          <div className="plan-panel-title-chip">
            <ClipboardList className="plan-panel-title-icon" strokeWidth={1.8} />
            <span className="plan-panel-title">
              {activePlan?.featureName || PLAN_PANEL_TITLE}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenPlanFile}
            disabled={!activePlan}
            className="ds-sidebar-toggle-button plan-panel-open-btn"
            aria-label={PLAN_OPEN_FILE_LABEL}
            title={PLAN_OPEN_FILE_LABEL}
          >
            <ExternalLink className="plan-panel-open-icon" strokeWidth={1.9} />
          </button>
        </div>
        <div className="plan-panel-meta-row">
          <div className="plan-panel-path-pill">
            {activePlan?.relativePath ?? PLAN_NO_ACTIVE_FILE_LABEL}
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
              {formatPlanCoverageLabel(coverage.covered, coverage.total)}
            </span>
            {coverage.uncoveredIds.length > 0 ? (
              <span className="plan-panel-uncovered-badge">
                <TriangleAlert className="plan-panel-uncovered-icon" strokeWidth={2} />
                <span className="plan-panel-uncovered-text">
                  {formatPlanCoverageUncovered(coverage.uncoveredIds.join(', '))}
                </span>
              </span>
            ) : null}
            {onVerifyPlan ? (
              <button type="button" onClick={onVerifyPlan} className="plan-panel-verify-btn">
                <ShieldCheck className="plan-panel-verify-icon" strokeWidth={2} />
                {PLAN_VERIFY_LABEL}
              </button>
            ) : null}
            {driftIds.length > 0 ? (
              <div className="plan-panel-drift-banner">
                <TriangleAlert className="plan-panel-drift-icon" strokeWidth={2} />
                <span className="plan-panel-drift-text">
                  {formatPlanSddChangedBanner(driftIds.join(', '))}
                </span>
                {onReplanChanged ? (
                  <button type="button" onClick={onReplanChanged} className="plan-panel-replan-btn">
                    <RefreshCw className="plan-panel-replan-icon" strokeWidth={2} />
                    {PLAN_SDD_REPLAN_LABEL}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="plan-panel-body">
        {!hasWorkspace ? (
          <div className="plan-panel-no-workspace">{PLAN_NO_WORKSPACE_LABEL}</div>
        ) : !hasPlan ? (
          <div className="plan-panel-empty">
            <div className="plan-panel-empty-icon-wrap">
              <ClipboardList className="plan-panel-empty-icon" strokeWidth={1.9} />
            </div>
            <div className="plan-panel-empty-title">{PLAN_EMPTY_TITLE}</div>
            <p className="plan-panel-empty-description">{PLAN_EMPTY_DESCRIPTION}</p>
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
          <p className="plan-panel-refine-hint">{PLAN_REFINE_HINT}</p>
          <button type="button" onClick={onBuildPlan} className="plan-panel-build-btn">
            <Hammer className="plan-panel-build-icon" strokeWidth={1.9} />
            {PLAN_BUILD_LABEL}
          </button>
        </div>
      ) : null}
    </aside>
  )
}
