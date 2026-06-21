// Write-mode assistant side panel echoing Kun's WriteAssistantPanel
// (../Kun/src/renderer/src/components/write/WriteAssistantPanel.tsx).
// Visual only: parent supplies snapshot props and optional action callbacks.

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from 'react'
import {
  FileText,
  FolderOpen,
  ListTodo,
  MessageSquareQuote,
  PanelRightClose,
  Plus,
  Sparkles,
  X,
} from 'lucide-react'
import { Composer } from './Composer'
import {
  COMPOSER_MODEL_PICKER_GROUPS_PREVIEW,
  COMPOSER_MODEL_PICKER_PREVIEW,
  FloatingComposerModelPicker,
  type ComposerModelPickerSettings,
} from './FloatingComposerModelPicker'
import { MessageTimeline } from './MessageTimeline'
import { type MessageTurnSnapshot } from './MessageTurn'

export type WriteAssistantQuotedSelection = {
  id: string
  sourceTitle: string
  sourceKind?: 'text' | 'pdf'
  pageStart?: number | null
  pageEnd?: number | null
  lineStart?: number | null
  lineEnd?: number | null
}

export type WriteAssistantTimelineBlock = {
  id: string
  kind: 'user' | 'assistant'
  text: string
}

export type WriteAssistantPanelSnapshot = {
  activeFileLabel: string
  hasTimeline?: boolean
  blocks?: WriteAssistantTimelineBlock[]
  liveAssistant?: string
  quotedSelections?: WriteAssistantQuotedSelection[]
  selectionIsPdf?: boolean
  selectionCharCount?: number
  input?: string
  busy?: boolean
  canCreateConversation?: boolean
}

export type WriteAssistantPanelPreviewMode =
  | 'default'
  | 'timeline'
  | 'quoted'
  | 'pdf'
  | 'noFile'
  | 'streaming'

const COPY = {
  rightPanelCollapse: 'Collapse right sidebar',
  writeAssistant: 'Writing assistant',
  writeAssistantChangeWorkspace: 'Change AI working directory',
  writeAssistantNewConversation: 'New writing assistant conversation',
  writeNoFileOpen: 'No file open',
  writeAssistantEmptyTitle: 'Writing assistant is ready',
  writeAssistantEmptySub:
    'It stays out of the way. Select text to quote it, or start with one of these writing actions.',
  writeAssistantSummarize: 'Summarize document',
  writeAssistantSummarizeSub: 'Extract structure, themes, and gaps',
  writeAssistantSummarizePrompt: (file: string) =>
    `Please read the current writing file "${file}" and summarize its thesis, structure, and missing pieces.`,
  writeAssistantOutline: 'Draft an outline',
  writeAssistantOutlineSub: 'Organize headings and flow',
  writeAssistantOutlinePrompt: (file: string) =>
    `Based on the current writing goal and file "${file}", draft a clear Markdown outline that I can continue writing from.`,
  writeAssistantPolishSelection: 'Polish selection',
  writeAssistantPolishSelectionSub: 'Selected text will be quoted first',
  writeAssistantPolishSelectionPrompt:
    'Please use the quoted selection to polish the expression, improve rhythm, and preserve the original meaning.',
  writeAssistantExplainPdfSelection: 'Explain PDF selection',
  writeAssistantExplainPdfSelectionSub: 'Selected PDF text will be quoted with page context',
  writeAssistantExplainPdfSelectionPrompt:
    'Please explain the quoted PDF selection, including its core meaning, key terms, and role in the paper.',
  writeRemoveQuote: 'Remove quote',
  writeAssistantComposerPlaceholder: 'Ask the writing assistant…',
}

export const WRITE_ASSISTANT_PANEL_PREVIEW_DEFAULT: WriteAssistantPanelSnapshot = {
  activeFileLabel: 'notes/launch-plan.md',
  hasTimeline: false,
  quotedSelections: [],
  selectionIsPdf: false,
  selectionCharCount: 0,
  input: '',
  busy: false,
  canCreateConversation: true,
}

export const WRITE_ASSISTANT_PANEL_PREVIEW_TIMELINE: WriteAssistantPanelSnapshot = {
  ...WRITE_ASSISTANT_PANEL_PREVIEW_DEFAULT,
  hasTimeline: true,
  blocks: [
    {
      id: 'user-1',
      kind: 'user',
      text: 'Summarize the launch plan and call out any missing risks.',
    },
    {
      id: 'assistant-1',
      kind: 'assistant',
      text:
        'The draft centers on a phased rollout with three milestones. The main gap is rollback criteria for the beta cohort.',
    },
  ],
}

export const WRITE_ASSISTANT_PANEL_PREVIEW_QUOTED: WriteAssistantPanelSnapshot = {
  ...WRITE_ASSISTANT_PANEL_PREVIEW_DEFAULT,
  input: COPY.writeAssistantPolishSelectionPrompt,
  quotedSelections: [
    {
      id: 'quote-1',
      sourceTitle: 'notes/launch-plan.md',
      sourceKind: 'text',
      lineStart: 18,
      lineEnd: 24,
    },
  ],
  selectionCharCount: 142,
}

export const WRITE_ASSISTANT_PANEL_PREVIEW_PDF: WriteAssistantPanelSnapshot = {
  ...WRITE_ASSISTANT_PANEL_PREVIEW_DEFAULT,
  activeFileLabel: 'papers/transformers-overview.pdf',
  selectionIsPdf: true,
  selectionCharCount: 96,
}

export const WRITE_ASSISTANT_PANEL_PREVIEW_NO_FILE: WriteAssistantPanelSnapshot = {
  ...WRITE_ASSISTANT_PANEL_PREVIEW_DEFAULT,
  activeFileLabel: COPY.writeNoFileOpen,
  canCreateConversation: false,
}

export const WRITE_ASSISTANT_PANEL_PREVIEW_STREAMING: WriteAssistantPanelSnapshot = {
  ...WRITE_ASSISTANT_PANEL_PREVIEW_TIMELINE,
  busy: true,
  liveAssistant: 'Checking the outline section for missing acceptance criteria…',
}

function previewSnapshot(mode: WriteAssistantPanelPreviewMode): WriteAssistantPanelSnapshot {
  if (mode === 'timeline') return WRITE_ASSISTANT_PANEL_PREVIEW_TIMELINE
  if (mode === 'quoted') return WRITE_ASSISTANT_PANEL_PREVIEW_QUOTED
  if (mode === 'pdf') return WRITE_ASSISTANT_PANEL_PREVIEW_PDF
  if (mode === 'noFile') return WRITE_ASSISTANT_PANEL_PREVIEW_NO_FILE
  if (mode === 'streaming') return WRITE_ASSISTANT_PANEL_PREVIEW_STREAMING
  return WRITE_ASSISTANT_PANEL_PREVIEW_DEFAULT
}

function formatQuoteMeta(quote: WriteAssistantQuotedSelection): string {
  if (quote.sourceKind === 'pdf' && quote.pageStart != null && quote.pageEnd != null) {
    return quote.pageStart === quote.pageEnd
      ? ` · p.${quote.pageStart}`
      : ` · p.${quote.pageStart}-${quote.pageEnd}`
  }
  if (quote.lineStart != null && quote.lineEnd != null) {
    return ` · ${quote.lineStart}-${quote.lineEnd}`
  }
  return ''
}

type PanelProps = {
  className?: string
  snapshot: WriteAssistantPanelSnapshot
  onCollapse?: () => void
  onPickWorkspace?: () => void
  onNewConversation?: () => void
  onInputChange?: (value: string) => void
  onSend?: () => void
  onInterrupt?: () => void
  onRemoveQuote?: (id: string) => void
  onSummarize?: () => void
  onOutline?: () => void
  onPolishSelection?: () => void
}

function WriteAssistantCompactComposer({
  value,
  onChange,
  onSend,
  onInterrupt,
  busy = false,
  disabled = false,
  modelPicker,
  onModelPickerChange,
}: {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onInterrupt: () => void
  busy?: boolean
  disabled?: boolean
  modelPicker: ComposerModelPickerSettings
  onModelPickerChange: (patch: Partial<ComposerModelPickerSettings>) => void
}): ReactElement {
  return (
    <Composer
      variant="compact"
      value={value}
      onChange={onChange}
      onSend={onSend}
      onCancel={onInterrupt}
      busy={busy}
      disabled={disabled}
      placeholder={COPY.writeAssistantComposerPlaceholder}
      modelChip={
        <FloatingComposerModelPicker
          compact
          stretch
          value={modelPicker}
          groups={COMPOSER_MODEL_PICKER_GROUPS_PREVIEW}
          disabled={disabled}
          onChange={onModelPickerChange}
        />
      }
    />
  )
}

function writeAssistantBlocksToTurns(
  blocks: WriteAssistantTimelineBlock[],
  options?: { busy?: boolean; liveAssistant?: string },
): MessageTurnSnapshot[] {
  const turns: MessageTurnSnapshot[] = []

  for (const block of blocks) {
    if (block.kind === 'user') {
      turns.push({
        key: block.id,
        user: {
          kind: 'user',
          id: block.id,
          text: block.text,
          canEdit: false,
          route: 'write',
        },
        assistantBlocks: [],
      })
      continue
    }

    if (turns.length === 0) {
      turns.push({
        key: block.id,
        assistantBlocks: [{ kind: 'assistant', id: block.id, text: block.text }],
      })
      continue
    }

    const last = turns[turns.length - 1]
    turns[turns.length - 1] = {
      ...last,
      assistantBlocks: [
        ...(last.assistantBlocks ?? []),
        { kind: 'assistant', id: block.id, text: block.text },
      ],
    }
  }

  const busy = options?.busy === true
  const liveText = options?.liveAssistant?.trim() ?? ''
  if (turns.length === 0) return turns

  const lastIndex = turns.length - 1
  const last = turns[lastIndex]
  turns[lastIndex] = {
    ...last,
    processing: busy,
    liveAssistant: liveText
      ? {
          kind: 'assistant',
          id: 'live-assistant',
          text: liveText,
          streaming: true,
        }
      : undefined,
    showLiveProgress: busy && !liveText,
  }

  return turns
}

function WriteAssistantTimeline({
  blocks,
  liveAssistant,
  busy = false,
}: {
  blocks: WriteAssistantTimelineBlock[]
  liveAssistant?: string
  busy?: boolean
}): ReactElement {
  const turns = useMemo(
    () => writeAssistantBlocksToTurns(blocks, { busy, liveAssistant }),
    [blocks, busy, liveAssistant],
  )

  return (
    <MessageTimeline
      hasContent
      activeThreadId="write-assistant"
      turns={turns}
      compactCards
    />
  )
}

function WriteAssistantEmptyBody({
  activeFileLabel,
  selectionIsPdf,
  selectionCharCount = 0,
  onSummarize,
  onOutline,
  onPolishSelection,
}: {
  activeFileLabel: string
  selectionIsPdf?: boolean
  selectionCharCount?: number
  onSummarize?: () => void
  onOutline?: () => void
  onPolishSelection?: () => void
}): ReactElement {
  return (
    <div className="write-assistant-empty">
      <div className="write-assistant-empty-hero">
        <div className="write-assistant-empty-icon">
          <Sparkles className="write-assistant-empty-icon-svg" strokeWidth={1.9} />
        </div>
        <h3 className="write-assistant-empty-title">{COPY.writeAssistantEmptyTitle}</h3>
        <p className="write-assistant-empty-sub">{COPY.writeAssistantEmptySub}</p>
      </div>

      <div className="write-assistant-action-grid">
        <button type="button" className="write-assistant-action" onClick={onSummarize}>
          <span className="write-assistant-action-icon is-sky">
            <FileText strokeWidth={1.9} />
          </span>
          <span className="write-assistant-action-copy">
            <span className="write-assistant-action-title">{COPY.writeAssistantSummarize}</span>
            <span className="write-assistant-action-sub">{COPY.writeAssistantSummarizeSub}</span>
          </span>
        </button>
        <button type="button" className="write-assistant-action" onClick={onOutline}>
          <span className="write-assistant-action-icon is-emerald">
            <ListTodo strokeWidth={1.9} />
          </span>
          <span className="write-assistant-action-copy">
            <span className="write-assistant-action-title">{COPY.writeAssistantOutline}</span>
            <span className="write-assistant-action-sub">{COPY.writeAssistantOutlineSub}</span>
          </span>
        </button>
        <button type="button" className="write-assistant-action" onClick={onPolishSelection}>
          <span className="write-assistant-action-icon is-amber">
            <MessageSquareQuote strokeWidth={1.9} />
          </span>
          <span className="write-assistant-action-copy">
            <span className="write-assistant-action-title">
              {selectionIsPdf
                ? COPY.writeAssistantExplainPdfSelection
                : COPY.writeAssistantPolishSelection}
            </span>
            <span className="write-assistant-action-sub">
              {selectionIsPdf
                ? COPY.writeAssistantExplainPdfSelectionSub
                : selectionCharCount > 0
                  ? COPY.writeAssistantPolishSelectionSub
                  : COPY.writeAssistantPolishSelectionSub}
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}

export function WriteAssistantPanel({
  className = '',
  snapshot,
  onCollapse,
  onPickWorkspace,
  onNewConversation,
  onInputChange,
  onSend,
  onInterrupt,
  onRemoveQuote,
  onSummarize,
  onOutline,
  onPolishSelection,
}: PanelProps): ReactElement {
  const {
    activeFileLabel,
    hasTimeline = false,
    blocks = [],
    liveAssistant,
    quotedSelections = [],
    selectionIsPdf = false,
    selectionCharCount = 0,
    input = '',
    busy = false,
    canCreateConversation = true,
  } = snapshot

  const handleSummarize = useCallback(() => {
    onSummarize?.()
    onInputChange?.(COPY.writeAssistantSummarizePrompt(activeFileLabel))
  }, [activeFileLabel, onInputChange, onSummarize])

  const handleOutline = useCallback(() => {
    onOutline?.()
    onInputChange?.(COPY.writeAssistantOutlinePrompt(activeFileLabel))
  }, [activeFileLabel, onInputChange, onOutline])

  const handlePolishSelection = useCallback(() => {
    onPolishSelection?.()
    if (selectionCharCount > 0) return
    onInputChange?.(
      selectionIsPdf
        ? COPY.writeAssistantExplainPdfSelectionPrompt
        : COPY.writeAssistantPolishSelectionPrompt,
    )
  }, [onInputChange, onPolishSelection, selectionCharCount, selectionIsPdf])

  const [modelPicker, setModelPicker] = useState<ComposerModelPickerSettings>(
    COMPOSER_MODEL_PICKER_PREVIEW,
  )

  const handleModelPickerChange = useCallback((patch: Partial<ComposerModelPickerSettings>) => {
    setModelPicker((current) => ({ ...current, ...patch }))
  }, [])

  return (
    <aside className={`write-assistant-panel ds-no-drag ${className}`.trim()}>
      <div className="write-assistant-header">
        <div className="write-assistant-header-row">
          <button
            type="button"
            onClick={onCollapse}
            className="ds-sidebar-toggle-button write-assistant-header-btn"
            aria-label={COPY.rightPanelCollapse}
            title={COPY.rightPanelCollapse}
          >
            <PanelRightClose strokeWidth={1.85} />
          </button>
          <div className="write-assistant-title-chip">
            <Sparkles className="write-assistant-title-icon" strokeWidth={1.8} />
            <span className="write-assistant-title-label">{COPY.writeAssistant}</span>
          </div>
          <button
            type="button"
            onClick={onPickWorkspace}
            className="ds-sidebar-toggle-button write-assistant-header-btn"
            aria-label={COPY.writeAssistantChangeWorkspace}
            title={COPY.writeAssistantChangeWorkspace}
          >
            <FolderOpen strokeWidth={1.85} />
          </button>
          <button
            type="button"
            onClick={onNewConversation}
            disabled={!canCreateConversation}
            className="ds-sidebar-toggle-button write-assistant-header-btn"
            aria-label={COPY.writeAssistantNewConversation}
            title={COPY.writeAssistantNewConversation}
          >
            <Plus strokeWidth={2.1} />
          </button>
        </div>
        <div className="write-assistant-file-label-wrap">
          <div className="write-assistant-file-label">{activeFileLabel}</div>
        </div>
      </div>

      <div className="write-assistant-body">
        {hasTimeline ? (
          <WriteAssistantTimeline
            blocks={blocks}
            liveAssistant={liveAssistant}
            busy={busy}
          />
        ) : (
          <WriteAssistantEmptyBody
            activeFileLabel={activeFileLabel}
            selectionIsPdf={selectionIsPdf}
            selectionCharCount={selectionCharCount}
            onSummarize={handleSummarize}
            onOutline={handleOutline}
            onPolishSelection={handlePolishSelection}
          />
        )}
      </div>

      <div className="write-assistant-footer">
        {quotedSelections.length > 0 ? (
          <div className="write-assistant-quotes">
            {quotedSelections.map((quote) => (
              <div key={quote.id} className="write-assistant-quote">
                <MessageSquareQuote className="write-assistant-quote-icon" strokeWidth={1.9} />
                <span className="write-assistant-quote-label">
                  {quote.sourceTitle}
                  {formatQuoteMeta(quote)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveQuote?.(quote.id)}
                  className="write-assistant-quote-remove"
                  title={COPY.writeRemoveQuote}
                  aria-label={COPY.writeRemoveQuote}
                >
                  <X strokeWidth={1.9} />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <WriteAssistantCompactComposer
          value={input}
          onChange={(value) => onInputChange?.(value)}
          onSend={() => onSend?.()}
          onInterrupt={() => onInterrupt?.()}
          busy={busy}
          disabled={!canCreateConversation && !busy}
          modelPicker={modelPicker}
          onModelPickerChange={handleModelPickerChange}
        />
      </div>
    </aside>
  )
}

type PreviewProps = {
  mode: WriteAssistantPanelPreviewMode
}

/** Full panel preview shell for ?writeAssistantPanelPreview URL hooks. */
export function WriteAssistantPanelPreview({ mode }: PreviewProps): ReactElement {
  const initialSnapshot = useMemo(() => previewSnapshot(mode), [mode])
  const [snapshot, setSnapshot] = useState(initialSnapshot)

  useEffect(() => {
    setSnapshot(previewSnapshot(mode))
  }, [mode])

  const handleInputChange = useCallback((value: string) => {
    setSnapshot((current) => ({ ...current, input: value }))
  }, [])

  const handleRemoveQuote = useCallback((id: string) => {
    setSnapshot((current) => ({
      ...current,
      quotedSelections: (current.quotedSelections ?? []).filter((quote) => quote.id !== id),
    }))
  }, [])

  return (
    <div className="write-assistant-panel-preview-wrap">
      <WriteAssistantPanel
        className="write-assistant-panel-preview-panel"
        snapshot={snapshot}
        onInputChange={handleInputChange}
        onRemoveQuote={handleRemoveQuote}
        onSend={() => setSnapshot((current) => ({ ...current, busy: true }))}
        onInterrupt={() => setSnapshot((current) => ({ ...current, busy: false, liveAssistant: undefined }))}
      />
    </div>
  )
}
