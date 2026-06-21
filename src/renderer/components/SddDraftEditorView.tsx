// SDD requirement draft editor echoing Kun's SddDraftEditorView
// (../Kun/src/renderer/src/components/sdd/SddDraftEditorView.tsx).
// Visual only: mock draft snapshots, WriteRichEditor surface, and preview hooks.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react'
import { ArrowRight, FileText, Loader2, Save, Sparkles, X } from 'lucide-react'
import { SidebarTitlebarToggleButton } from './SidebarPrimitives'
import { WriteMarkdownEditor } from './WriteMarkdownEditor'
import { WriteRichEditor } from './WriteRichEditor'
import {
  WriteInlineAgent,
  type WriteBlockType,
  type WriteInlineAgentPosition,
} from './WriteInlineAgent'
import { WRITE_SETTINGS_PREVIEW_DEFAULT } from './WriteSettingsSection'
import {
  SddAssistantPanel,
  SDD_ASSISTANT_PANEL_PREVIEW_BUSY,
  SDD_ASSISTANT_PANEL_PREVIEW_DEFAULT,
  SDD_ASSISTANT_PANEL_PREVIEW_TIMELINE,
  type SddAssistantPanelSnapshot,
} from './SddAssistantPanel'
import {
  isProductionSddDraftAssistantMode,
  resolveProductionSddDraftMode,
  type SddDraftEditorViewPreviewMode,
} from '../lib/sddDraftPreviewModes'

export type { SddDraftEditorViewPreviewMode } from '../lib/sddDraftPreviewModes'

type SddSaveStatus = 'saved' | 'dirty' | 'saving' | 'error'
type SddOperationStatus = 'idle' | 'upgrading' | 'error'
type SddRequirementStatus = 'draft' | 'planned' | 'building' | 'done' | 'verified'

type SddDesignContext = {
  designType?: 'brand' | 'product'
  brandColor?: string
  tone?: string[]
}

type SddRequirementBlock = {
  id: string
  status: SddRequirementStatus
}

export type SddDraftSnapshot = {
  relativePath: string
  content: string
  saveStatus: SddSaveStatus
  operationStatus: SddOperationStatus
  error: string | null
  designContext?: SddDesignContext
  designContextOpen?: boolean
  notice?: { tone: 'success' | 'error'; message: string } | null
}

const SDD_DESIGN_TONE_OPTIONS = [
  'Editorial',
  'Professional',
  'Playful',
  'Minimal',
  'Bold',
  'Warm',
  'Tech',
  'Serious',
] as const

const COPY = {
  sidebarExpand: 'Expand sidebar',
  sddDraftTitle: 'Requirement draft',
  sddNoActiveDraft: 'No requirement draft is open.',
  sddStatusUpgrading: 'Creating plan',
  sddStatusSaving: 'Saving',
  sddStatusDirty: 'Unsaved',
  sddStatusSaved: 'Saved',
  sddStatusError: 'Needs attention',
  sddNextStep: 'Next',
  sddAssistant: 'Requirement AI',
  writeSaveFile: 'Save file',
  close: 'Close',
  clear: 'Clear',
  sddDesignContextTitle: 'Design context',
  sddDesignContextEmpty: 'Not set (affects design-draft / prototype style)',
  sddDesignTypeLabel: 'Design type',
  sddDesignTypeBrand: 'Brand (landing / marketing / portfolio)',
  sddDesignTypeProduct: 'Product (app UI / dashboard / tool)',
  sddDesignBrandColorLabel: 'Brand color',
  sddDesignBrandColorPlaceholder: 'e.g. #3b82d8 or oklch(...); blank = default',
  sddDesignToneLabel: 'Tone',
  sddReqProgressLabel: 'Requirement progress',
  sddReqProgressSummary: (done: number, total: number) => `${done}/${total} implemented`,
}

/** Sample requirement markdown for preview hooks. */
export const SDD_DRAFT_EDITOR_PREVIEW_SAMPLE = `# Export feature requirements

Background notes that sit outside structured requirement blocks.

### R-1: Toolbar export button {planned}
Users see an export entry in the toolbar.
- [ ] Button visible in toolbar
- [x] Disabled state shows a tooltip

### R-2: CSV content complete {done}
Export includes every column from the table view.
- [x] Includes all columns
- [ ] Handles empty rows gracefully

### R-3: Format selection {building}
Let users pick CSV or JSON before downloading.

### R-4: Email delivery {verified}
Send the export to a verified email address.
- [x] Validates email format
- [x] Shows confirmation toast
`

export const SDD_DRAFT_EDITOR_PREVIEW_PATH = 'units/export/requirement.md'

/** Default SDD draft snapshot for Workbench preview integration. */
export const WORKBENCH_SDD_DRAFT_PREVIEW_SNAPSHOT: SddDraftSnapshot = {
  relativePath: SDD_DRAFT_EDITOR_PREVIEW_PATH,
  content: SDD_DRAFT_EDITOR_PREVIEW_SAMPLE,
  saveStatus: 'saved',
  operationStatus: 'idle',
  error: null,
  designContext: {
    designType: 'product',
    brandColor: '#3b82d8',
    tone: ['Minimal', 'Professional'],
  },
}

function parseSddRequirementBlocks(markdown: string): SddRequirementBlock[] {
  const blocks: SddRequirementBlock[] = []
  const lines = markdown.split(/\r?\n/)
  let insideFence = false

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      insideFence = !insideFence
      continue
    }
    if (insideFence) continue

    const match = /^(#{1,6})\s+R-(\d+):\s+(.+?)(?:\s+\{(planned|building|done|verified)\})?\s*$/.exec(
      line,
    )
    if (!match) continue
    blocks.push({
      id: `R-${match[2]}`,
      status: (match[4] as SddRequirementStatus | undefined) ?? 'draft',
    })
  }

  return blocks
}

function statusLabel(saveStatus: SddSaveStatus, operationStatus: SddOperationStatus): string {
  if (operationStatus === 'upgrading') return COPY.sddStatusUpgrading
  if (operationStatus === 'error' || saveStatus === 'error') return COPY.sddStatusError
  if (saveStatus === 'saving') return COPY.sddStatusSaving
  if (saveStatus === 'dirty') return COPY.sddStatusDirty
  return COPY.sddStatusSaved
}

function previewSnapshot(mode: SddDraftEditorViewPreviewMode): {
  draft: SddDraftSnapshot | null
  leftSidebarCollapsed: boolean
  assistantOpen: boolean
  showInlineAgent: boolean
  showRichFallback: boolean
} {
  if (mode === 'noDraft') {
    return {
      draft: null,
      leftSidebarCollapsed: false,
      assistantOpen: false,
      showInlineAgent: false,
      showRichFallback: false,
    }
  }

  const base: SddDraftSnapshot = {
    relativePath: SDD_DRAFT_EDITOR_PREVIEW_PATH,
    content: SDD_DRAFT_EDITOR_PREVIEW_SAMPLE,
    saveStatus: 'saved',
    operationStatus: 'idle',
    error: null,
    designContext: {
      designType: 'product',
      brandColor: '#3b82d8',
      tone: ['Minimal', 'Professional'],
    },
  }

  if (mode === 'dirty') {
    return {
      draft: { ...base, saveStatus: 'dirty' },
      leftSidebarCollapsed: false,
      assistantOpen: false,
      showInlineAgent: false,
      showRichFallback: false,
    }
  }
  if (mode === 'saving') {
    return {
      draft: { ...base, saveStatus: 'saving' },
      leftSidebarCollapsed: false,
      assistantOpen: false,
      showInlineAgent: false,
      showRichFallback: false,
    }
  }
  if (mode === 'error') {
    return {
      draft: {
        ...base,
        saveStatus: 'error',
        error: 'Could not save requirement.md — check folder permissions.',
      },
      leftSidebarCollapsed: false,
      assistantOpen: false,
      showInlineAgent: false,
      showRichFallback: false,
    }
  }
  if (mode === 'upgrading') {
    return {
      draft: { ...base, operationStatus: 'upgrading', saveStatus: 'saved' },
      leftSidebarCollapsed: false,
      assistantOpen: false,
      showInlineAgent: false,
      showRichFallback: false,
    }
  }
  if (mode === 'designContext') {
    return {
      draft: { ...base, designContextOpen: true },
      leftSidebarCollapsed: false,
      assistantOpen: false,
      showInlineAgent: false,
      showRichFallback: false,
    }
  }
  if (mode === 'assistantOpen' || mode === 'assistantTimeline' || mode === 'assistantBusy') {
    return {
      draft: base,
      leftSidebarCollapsed: false,
      assistantOpen: true,
      showInlineAgent: false,
      showRichFallback: false,
    }
  }
  if (mode === 'leftCollapsed') {
    return {
      draft: base,
      leftSidebarCollapsed: true,
      assistantOpen: false,
      showInlineAgent: false,
      showRichFallback: false,
    }
  }
  if (mode === 'withNotice') {
    return {
      draft: {
        ...base,
        notice: { tone: 'success', message: 'Inline edit applied.' },
      },
      leftSidebarCollapsed: false,
      assistantOpen: false,
      showInlineAgent: false,
      showRichFallback: false,
    }
  }
  if (mode === 'inlineAgent') {
    return {
      draft: base,
      leftSidebarCollapsed: false,
      assistantOpen: false,
      showInlineAgent: true,
      showRichFallback: false,
    }
  }
  if (mode === 'richFallback') {
    return {
      draft: base,
      leftSidebarCollapsed: false,
      assistantOpen: false,
      showInlineAgent: false,
      showRichFallback: true,
    }
  }

  return {
    draft: base,
    leftSidebarCollapsed: false,
    assistantOpen: false,
    showInlineAgent: false,
    showRichFallback: false,
  }
}

function inlineAgentPosition(): WriteInlineAgentPosition {
  if (typeof window === 'undefined') {
    return { left: 120, width: 420, anchorTop: 360, anchorBottom: 388 }
  }
  const width = Math.min(420, Math.max(280, window.innerWidth - 96))
  const left = Math.max(48, (window.innerWidth - width) / 2)
  return { left, width, anchorTop: 360, anchorBottom: 388 }
}

function SddRequirementProgress({ content }: { content: string }): ReactElement | null {
  const blocks = useMemo(() => parseSddRequirementBlocks(content), [content])
  if (blocks.length === 0) return null

  const counts = { verified: 0, done: 0, building: 0, planned: 0 }
  for (const block of blocks) {
    if (block.status === 'verified') counts.verified += 1
    else if (block.status === 'done') counts.done += 1
    else if (block.status === 'building') counts.building += 1
    else if (block.status === 'planned') counts.planned += 1
  }
  const total = blocks.length
  const implemented = counts.verified + counts.done

  return (
    <div className="sdd-req-progress">
      <span className="sdd-req-progress-label">{COPY.sddReqProgressLabel}</span>
      <div
        className="sdd-req-progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={implemented}
      >
        {(['verified', 'done', 'building', 'planned'] as const).map((key) =>
          counts[key] > 0 ? (
            <span
              key={key}
              className={`sdd-req-progress-seg-${key}`}
              style={{ width: `${(counts[key] / total) * 100}%` }}
            />
          ) : null,
        )}
      </div>
      <span className="sdd-req-progress-summary">
        {COPY.sddReqProgressSummary(implemented, total)}
      </span>
    </div>
  )
}

function SddDesignContextBar({
  designContext,
  open,
  onToggle,
  onChange,
}: {
  designContext?: SddDesignContext
  open: boolean
  onToggle: () => void
  onChange: (patch: Partial<SddDesignContext>) => void
}): ReactElement {
  const tone = designContext?.tone ?? []
  const brandColor = designContext?.brandColor ?? ''
  const isHexBrandColor = /^#[0-9a-fA-F]{6}$/.test(brandColor)
  const colorInputValue = isHexBrandColor ? brandColor : '#3b82d8'
  const swatchEditable = brandColor === '' || isHexBrandColor

  const summaryParts = [
    designContext?.designType === 'brand'
      ? COPY.sddDesignTypeBrand
      : designContext?.designType === 'product'
        ? COPY.sddDesignTypeProduct
        : null,
    brandColor || null,
    tone.length ? tone.join('·') : null,
  ].filter(Boolean) as string[]
  const summary =
    summaryParts.length > 0 ? summaryParts.join(' · ') : COPY.sddDesignContextEmpty

  const toggleTone = (value: string): void => {
    const next = tone.includes(value) ? tone.filter((item) => item !== value) : [...tone, value]
    onChange({ tone: next })
  }

  return (
    <div className="sdd-design-context-bar">
      <button type="button" onClick={onToggle} className="sdd-design-context-toggle">
        <span className="sdd-design-context-toggle-title">
          <Sparkles className="sdd-design-context-sparkle" strokeWidth={1.8} />
          {COPY.sddDesignContextTitle}
        </span>
        <span className="sdd-design-context-summary">{summary}</span>
      </button>
      {open ? (
        <div className="sdd-design-context-body">
          <div>
            <div className="sdd-design-context-field-label">{COPY.sddDesignTypeLabel}</div>
            <div className="sdd-design-context-type-row">
              {(['brand', 'product'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ designType: value })}
                  className={`sdd-design-context-chip${
                    designContext?.designType === value ? ' is-active' : ''
                  }`}
                >
                  {value === 'brand' ? COPY.sddDesignTypeBrand : COPY.sddDesignTypeProduct}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="sdd-design-context-field-label">{COPY.sddDesignBrandColorLabel}</div>
            <div className="sdd-design-context-color-row">
              <input
                type="color"
                aria-label={COPY.sddDesignBrandColorLabel}
                value={colorInputValue}
                disabled={!swatchEditable}
                onChange={(event) => {
                  if (swatchEditable) onChange({ brandColor: event.target.value })
                }}
                className={`sdd-design-context-color-swatch${
                  swatchEditable ? '' : ' is-disabled'
                }`}
              />
              <input
                type="text"
                value={brandColor}
                placeholder={COPY.sddDesignBrandColorPlaceholder}
                onChange={(event) => onChange({ brandColor: event.target.value })}
                className="sdd-design-context-color-input"
              />
              {brandColor ? (
                <button
                  type="button"
                  onClick={() => onChange({ brandColor: '' })}
                  className="sdd-design-context-clear"
                >
                  {COPY.clear}
                </button>
              ) : null}
            </div>
          </div>
          <div>
            <div className="sdd-design-context-field-label">{COPY.sddDesignToneLabel}</div>
            <div className="sdd-design-context-tone-row">
              {SDD_DESIGN_TONE_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleTone(value)}
                  className={`sdd-design-context-chip${tone.includes(value) ? ' is-active' : ''}`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function SddAssistantToggleButton({
  assistantOpen,
  onToggleAssistant,
  label,
}: {
  assistantOpen: boolean
  onToggleAssistant: () => void
  label: string
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onToggleAssistant}
      className={`ds-sidebar-toggle-button sdd-assistant-toggle-btn${
        assistantOpen ? ' is-active' : ''
      }`}
      title={label}
      aria-label={label}
      aria-pressed={assistantOpen}
    >
      <Sparkles className="sdd-assistant-toggle-icon" strokeWidth={1.85} />
    </button>
  )
}

type Props = {
  draft: SddDraftSnapshot | null
  leftSidebarCollapsed?: boolean
  assistantOpen?: boolean
  designContextOpen?: boolean
  showInlineAgent?: boolean
  showRichFallback?: boolean
  nextDisabled?: boolean
  onToggleLeftSidebar?: () => void
  onToggleAssistant?: () => void
  onToggleDesignContext?: () => void
  onDesignContextChange?: (patch: Partial<SddDesignContext>) => void
  onContentChange?: (value: string) => void
  onNext?: () => void
  onClose?: () => void
  onSave?: () => void
}

export function SddDraftEditorView({
  draft,
  leftSidebarCollapsed = false,
  assistantOpen = false,
  designContextOpen = false,
  showInlineAgent = false,
  showRichFallback = false,
  nextDisabled = false,
  onToggleLeftSidebar,
  onToggleAssistant,
  onToggleDesignContext,
  onDesignContextChange,
  onContentChange,
  onNext,
  onClose,
  onSave,
}: Props): ReactElement {
  const inlineAgentTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [inlineAgentValue, setInlineAgentValue] = useState('')
  const [blockType, setBlockType] = useState<WriteBlockType>('paragraph')
  const [activeAgentId, setActiveAgentId] = useState('')
  const inlinePosition = useMemo(() => inlineAgentPosition(), [])

  if (!draft) {
    return (
      <div className="sdd-draft-empty-state">
        {COPY.sddNoActiveDraft}
      </div>
    )
  }

  const upgrading = draft.operationStatus === 'upgrading'
  const readOnly = upgrading
  const saveStatus = draft.saveStatus
  const statusText = statusLabel(saveStatus, draft.operationStatus)
  const statusClass =
    readOnly
      ? 'is-upgrading'
      : saveStatus === 'error'
        ? 'is-error'
        : saveStatus === 'dirty'
          ? 'is-dirty'
          : 'is-saved'

  return (
    <section className="sdd-draft-shell ds-no-drag">
      <div className="ds-stage-inset sdd-draft-stage-inset">
        <header className="sdd-draft-topbar ds-topbar-surface">
          <div className="sdd-draft-topbar-grid">
            <div
              className={`sdd-draft-topbar-left${
                leftSidebarCollapsed ? ' ds-window-controls-safe-inset' : ''
              }`}
            >
              {leftSidebarCollapsed ? (
                <SidebarTitlebarToggleButton
                  onClick={() => onToggleLeftSidebar?.()}
                  title={COPY.sidebarExpand}
                  ariaLabel={COPY.sidebarExpand}
                />
              ) : null}
              <span className="sdd-draft-file-icon">
                <FileText className="sdd-draft-file-icon-svg" strokeWidth={1.9} />
              </span>
              <div className="sdd-draft-title-wrap">
                <div className="sdd-draft-title">{COPY.sddDraftTitle}</div>
                <div className="sdd-draft-path">{draft.relativePath}</div>
              </div>
            </div>

            <div className="sdd-draft-topbar-actions">
              <span aria-live="polite" className={`sdd-status-pill ${statusClass}`}>
                {readOnly || saveStatus === 'saving' ? (
                  <Loader2 className="sdd-status-pill-icon is-spinning" strokeWidth={2} />
                ) : (
                  <Save className="sdd-status-pill-icon" strokeWidth={1.8} />
                )}
                {statusText}
              </span>
              <button
                type="button"
                onClick={() => onSave?.()}
                disabled={readOnly || saveStatus === 'saved'}
                className="ds-sidebar-toggle-button sdd-draft-save-btn"
                title={COPY.writeSaveFile}
                aria-label={COPY.writeSaveFile}
              >
                <Save className="sdd-draft-action-icon" strokeWidth={1.85} />
              </button>
              <SddAssistantToggleButton
                assistantOpen={assistantOpen}
                onToggleAssistant={() => onToggleAssistant?.()}
                label={COPY.sddAssistant}
              />
              <button
                type="button"
                onClick={() => onNext?.()}
                disabled={nextDisabled || readOnly}
                className="sdd-next-button"
              >
                {readOnly ? (
                  <Loader2 className="sdd-next-button-icon is-spinning" strokeWidth={2} />
                ) : (
                  <ArrowRight className="sdd-next-button-icon" strokeWidth={2} />
                )}
                {COPY.sddNextStep}
              </button>
              <button
                type="button"
                onClick={() => onClose?.()}
                disabled={readOnly}
                className="ds-sidebar-toggle-button sdd-draft-close-btn"
                title={COPY.close}
                aria-label={COPY.close}
              >
                <X className="sdd-draft-action-icon" strokeWidth={1.9} />
              </button>
            </div>
          </div>
        </header>
      </div>

      <SddRequirementProgress content={draft.content} />

      <SddDesignContextBar
        designContext={draft.designContext}
        open={designContextOpen}
        onToggle={() => onToggleDesignContext?.()}
        onChange={(patch) => onDesignContextChange?.(patch)}
      />

      <div className="sdd-draft-editor-pane">
        <div className={`sdd-editor-card${upgrading ? ' is-upgrading' : ''}`}>
          {upgrading ? <div className="sdd-editor-progress" aria-hidden="true" /> : null}
          <WriteRichEditor
            readOnly={readOnly}
            showFallback={showRichFallback}
            fallback={
              <WriteMarkdownEditor
                value={draft.content}
                appearance="live"
                readOnly={readOnly}
                onChange={(value) => onContentChange?.(value)}
              />
            }
          />
        </div>
      </div>

      {showInlineAgent && !readOnly ? (
        <WriteInlineAgent
          action={inlinePosition}
          value={inlineAgentValue}
          inFlight={false}
          textareaRef={inlineAgentTextareaRef}
          onValueChange={setInlineAgentValue}
          onSubmitPrompt={() => undefined}
          onApplyEdit={() => undefined}
          formattingEnabled
          onApplyFormat={() => undefined}
          blockType={blockType}
          onSetBlockType={setBlockType}
          quickActions={WRITE_SETTINGS_PREVIEW_DEFAULT.selectionAssist.quickActions}
          onQuickAction={() => undefined}
          agentPresets={WRITE_SETTINGS_PREVIEW_DEFAULT.agentPresets}
          activeAgentId={activeAgentId}
          onSelectAgent={setActiveAgentId}
          onOpenAgentSettings={() => undefined}
          onQuoteSelection={() => undefined}
          infographicEnabled
          onGenerateInfographic={() => undefined}
          designDraftEnabled
          onGenerateDesignDraft={() => undefined}
          prototypeEnabled
          onGeneratePrototype={() => undefined}
        />
      ) : null}

      {draft.error ? <div className="sdd-error-toast">{draft.error}</div> : null}
      {draft.notice ? (
        <div
          className={`sdd-notice-toast sdd-notice-toast-${draft.notice.tone}`}
          style={{ bottom: draft.error ? 68 : 20 }}
        >
          {draft.notice.message}
        </div>
      ) : null}
    </section>
  )
}

type PreviewProps = {
  mode: SddDraftEditorViewPreviewMode
}

function assistantPanelPreviewSnapshot(
  mode: SddDraftEditorViewPreviewMode,
): SddAssistantPanelSnapshot {
  const draftPath = SDD_DRAFT_EDITOR_PREVIEW_PATH
  if (mode === 'assistantTimeline') {
    return { ...SDD_ASSISTANT_PANEL_PREVIEW_TIMELINE, draftPath }
  }
  if (mode === 'assistantBusy') {
    return { ...SDD_ASSISTANT_PANEL_PREVIEW_BUSY, draftPath }
  }
  return { ...SDD_ASSISTANT_PANEL_PREVIEW_DEFAULT, draftPath }
}

function assistantPanelPreviewOpen(mode: SddDraftEditorViewPreviewMode): boolean {
  return (
    mode === 'assistantOpen' || mode === 'assistantTimeline' || mode === 'assistantBusy'
  )
}

/** Full-page preview shell for ?sddDraftEditorViewPreview URL hooks. */
export function SddDraftEditorViewPreview({ mode }: PreviewProps): ReactElement {
  const initial = useMemo(() => previewSnapshot(mode), [mode])
  const [draft, setDraft] = useState<SddDraftSnapshot | null>(initial.draft)
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(initial.leftSidebarCollapsed)
  const [assistantOpen, setAssistantOpen] = useState(() => assistantPanelPreviewOpen(mode))
  const [assistantInput, setAssistantInput] = useState('')
  const [designContextOpen, setDesignContextOpen] = useState(
    initial.draft?.designContextOpen ?? mode === 'designContext',
  )
  const [showInlineAgent, setShowInlineAgent] = useState(initial.showInlineAgent)
  const [showRichFallback, setShowRichFallback] = useState(initial.showRichFallback)
  const assistantPanelSnapshot = useMemo(() => assistantPanelPreviewSnapshot(mode), [mode])

  useEffect(() => {
    const next = previewSnapshot(mode)
    setDraft(next.draft)
    setLeftSidebarCollapsed(next.leftSidebarCollapsed)
    setAssistantOpen(assistantPanelPreviewOpen(mode))
    setDesignContextOpen(next.draft?.designContextOpen ?? mode === 'designContext')
    setShowInlineAgent(next.showInlineAgent)
    setShowRichFallback(next.showRichFallback)
  }, [mode])

  const handleContentChange = useCallback((value: string) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            content: value,
            saveStatus: current.saveStatus === 'saved' ? 'dirty' : current.saveStatus,
          }
        : current,
    )
  }, [])

  const handleDesignContextChange = useCallback((patch: Partial<SddDesignContext>) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            designContext: { ...current.designContext, ...patch },
            saveStatus: current.saveStatus === 'saved' ? 'dirty' : current.saveStatus,
          }
        : current,
    )
  }, [])

  return (
    <div className="sdd-draft-editor-view-preview">
      <div className="sdd-draft-editor-view-main">
        <SddDraftEditorView
          draft={draft}
          leftSidebarCollapsed={leftSidebarCollapsed}
          assistantOpen={assistantOpen}
          designContextOpen={designContextOpen}
          showInlineAgent={showInlineAgent}
          showRichFallback={showRichFallback}
          onToggleLeftSidebar={() => setLeftSidebarCollapsed((open) => !open)}
          onToggleAssistant={() => setAssistantOpen((open) => !open)}
          onToggleDesignContext={() => setDesignContextOpen((open) => !open)}
          onDesignContextChange={handleDesignContextChange}
          onContentChange={handleContentChange}
          onSave={() =>
            setDraft((current) => (current ? { ...current, saveStatus: 'saved' } : current))
          }
        />
        {assistantOpen ? (
          <>
            <div
              role="separator"
              aria-orientation="vertical"
              className="ds-workbench-divider ds-no-drag"
            />
            <div className="sdd-draft-editor-view-assistant-panel">
              <SddAssistantPanel
                className="sdd-draft-editor-view-assistant-panel-inner"
                snapshot={{
                  ...assistantPanelSnapshot,
                  input: assistantInput || assistantPanelSnapshot.input,
                }}
                onCollapse={() => setAssistantOpen(false)}
                onInputChange={setAssistantInput}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

const PRODUCTION_SDD_RIGHT_PANEL_WIDTH = 360

function resolveProductionSddAssistantSnapshot(
  mode: SddDraftEditorViewPreviewMode,
): SddAssistantPanelSnapshot {
  return assistantPanelPreviewSnapshot(mode)
}

/** Production shell for SDD requirement draft — mock snapshots for visual parity. */
export function SddDraftProductionView({
  leftSidebarCollapsed: leftSidebarCollapsedProp,
  onToggleLeftSidebar,
  onClose,
}: {
  leftSidebarCollapsed: boolean
  onToggleLeftSidebar: () => void
  onClose: () => void
}): ReactElement {
  const productionMode = useMemo(() => resolveProductionSddDraftMode(), [])
  const initial = useMemo(() => previewSnapshot(productionMode), [productionMode])
  const [draft, setDraft] = useState<SddDraftSnapshot | null>(initial.draft)
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(
    () => (initial.leftSidebarCollapsed ? true : leftSidebarCollapsedProp),
  )
  const [assistantOpen, setAssistantOpen] = useState(() =>
    isProductionSddDraftAssistantMode() ? assistantPanelPreviewOpen(productionMode) : false,
  )
  const [designContextOpen, setDesignContextOpen] = useState(
    initial.draft?.designContextOpen ?? productionMode === 'designContext',
  )
  const [showInlineAgent, setShowInlineAgent] = useState(initial.showInlineAgent)
  const [showRichFallback, setShowRichFallback] = useState(initial.showRichFallback)
  const [assistantInput, setAssistantInput] = useState('')
  const assistantPanelSnapshot = useMemo(
    () => resolveProductionSddAssistantSnapshot(productionMode),
    [productionMode],
  )

  const handleContentChange = useCallback((value: string) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            content: value,
            saveStatus: current.saveStatus === 'saved' ? 'dirty' : current.saveStatus,
          }
        : current,
    )
  }, [])

  const handleDesignContextChange = useCallback((patch: Partial<SddDesignContext>) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            designContext: { ...current.designContext, ...patch },
            saveStatus: current.saveStatus === 'saved' ? 'dirty' : current.saveStatus,
          }
        : current,
    )
  }, [])

  return (
    <div className="production-sdd-stage">
      <div className="workbench-main-row production-workbench-main-row">
        <div className="workbench-chat-column production-sdd-column">
          <SddDraftEditorView
            draft={draft}
            leftSidebarCollapsed={leftSidebarCollapsed}
            assistantOpen={assistantOpen}
            designContextOpen={designContextOpen}
            showInlineAgent={showInlineAgent}
            showRichFallback={showRichFallback}
            onToggleLeftSidebar={() => {
              setLeftSidebarCollapsed((open) => !open)
              onToggleLeftSidebar()
            }}
            onToggleAssistant={() => setAssistantOpen((open) => !open)}
            onToggleDesignContext={() => setDesignContextOpen((open) => !open)}
            onDesignContextChange={handleDesignContextChange}
            onContentChange={handleContentChange}
            onSave={() =>
              setDraft((current) => (current ? { ...current, saveStatus: 'saved' } : current))
            }
            onClose={onClose}
          />
        </div>

        {assistantOpen ? (
          <>
            <div
              role="separator"
              aria-orientation="vertical"
              className="ds-workbench-divider ds-no-drag"
            />
            <div
              className="workbench-right-panel production-sdd-assistant-panel"
              style={{ width: PRODUCTION_SDD_RIGHT_PANEL_WIDTH }}
            >
              <SddAssistantPanel
                className="h-full max-h-full w-full"
                snapshot={{
                  ...assistantPanelSnapshot,
                  input: assistantInput || assistantPanelSnapshot.input,
                }}
                onCollapse={() => setAssistantOpen(false)}
                onInputChange={setAssistantInput}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
