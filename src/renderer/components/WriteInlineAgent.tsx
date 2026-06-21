// Write-mode inline selection agent echoing Kun's WriteInlineAgent
// (../Kun/src/renderer/src/components/write/WriteInlineAgent.tsx).
// Visual only: parent supplies anchor position and optional mock snapshots.

import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react'
import {
  AppWindow,
  Bold,
  ChevronDown,
  ChevronRight,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  LayoutTemplate,
  Lightbulb,
  List,
  ListOrdered,
  Loader2,
  MessageSquareQuote,
  Pilcrow,
  Quote,
  Replace,
  Settings2,
  Sparkles,
  Strikethrough,
  Wand2,
  WandSparkles,
  type LucideIcon,
} from 'lucide-react'
import {
  WRITE_SETTINGS_PREVIEW_DEFAULT,
  type WriteAgentPresetSnapshot,
  type WriteQuickActionSnapshot,
} from './WriteSettingsSection'

export const INLINE_AGENT_GAP = 8

export type WriteBlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'quote'
  | 'bullet'
  | 'ordered'
  | 'code'

export const WRITE_BLOCK_TYPES: WriteBlockType[] = [
  'paragraph',
  'heading1',
  'heading2',
  'heading3',
  'quote',
  'bullet',
  'ordered',
  'code',
]

export type WriteInlineFormatKind = 'bold' | 'italic' | 'strikethrough' | 'code'

export type WriteInlineAgentPosition = {
  left: number
  width: number
  anchorTop: number
  anchorBottom: number
}

export type WriteInlineAgentPreviewMode =
  | 'default'
  | 'blockMenu'
  | 'emptyAgents'
  | 'askOnly'
  | 'inFlight'
  | 'skills'
  | 'imageMode'

const COPY = {
  writeInlineAgentPlaceholder: 'Tell AI what to do with this selection…',
  writeInlineAgentEditHint: 'Edit with AI',
  writeInlineAgentSend: 'Send to writing assistant',
  writeInlineEditApply: 'Apply edit',
  writeInlineEditApplying: 'Editing…',
  writeAgentSwitcherLabel: 'Custom writing agent',
  writeAgentSwitcherNone: 'None',
  writeAgentSwitcherManage: 'Manage',
  writeAgentSwitcherEmptyHint: 'Add a writing agent in Settings',
  writeInfographicGenerate: 'Generate infographic',
  writeDesignDraftGenerate: 'Generate design mockup',
  writePrototypeGenerate: 'Generate interactive prototype',
  writeFormatBold: 'Bold',
  writeFormatItalic: 'Italic',
  writeFormatStrikethrough: 'Strikethrough',
  writeFormatCode: 'Inline code',
  writeSelectionSkills: 'Skills',
  writeSelectionQuote: 'Add quote',
  writeBlockTypeLabel: 'Block style',
  writeBlockTypeParagraph: 'Normal text',
  writeBlockTypeHeading1: 'Heading 1',
  writeBlockTypeHeading2: 'Heading 2',
  writeBlockTypeHeading3: 'Heading 3',
  writeBlockTypeQuote: 'Quote',
  writeBlockTypeBullet: 'Bulleted list',
  writeBlockTypeOrdered: 'Numbered list',
  writeBlockTypeCode: 'Code block',
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min
  return Math.min(Math.max(value, min), max)
}

type Props = {
  action: WriteInlineAgentPosition
  value: string
  inFlight: boolean
  textareaRef: RefObject<HTMLTextAreaElement | null>
  onValueChange: (value: string) => void
  onSubmitPrompt: (value: string) => void
  onApplyEdit: (value: string) => void
  askOnly?: boolean
  preferAbove?: boolean
  formattingEnabled?: boolean
  onApplyFormat?: (kind: WriteInlineFormatKind) => void
  blockType?: WriteBlockType
  onSetBlockType?: (type: WriteBlockType) => void
  quickActions?: WriteQuickActionSnapshot[]
  onQuickAction?: (action: WriteQuickActionSnapshot) => void
  agentPresets?: WriteAgentPresetSnapshot[]
  activeAgentId?: string
  onSelectAgent?: (id: string) => void
  onOpenAgentSettings?: () => void
  onQuoteSelection?: () => void
  infographicEnabled?: boolean
  onGenerateInfographic?: () => void
  designDraftEnabled?: boolean
  onGenerateDesignDraft?: () => void
  prototypeEnabled?: boolean
  onGeneratePrototype?: () => void
  imageMode?: boolean
  onTextareaFocus?: () => void
  onTextareaBlur?: () => void
  defaultBlockMenuOpen?: boolean
}

function ToolbarButton({
  className,
  label,
  disabled = false,
  onActivate,
  children,
}: {
  className: string
  label: string
  disabled?: boolean
  onActivate: () => void
  children: ReactNode
}): ReactElement {
  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
    if (event.pointerType !== 'mouse') event.preventDefault()
  }
  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>): void => {
    if (event.pointerType === 'mouse') return
    event.preventDefault()
    event.stopPropagation()
    onActivate()
  }
  const handleMouseDown = (event: ReactMouseEvent<HTMLButtonElement>): void => {
    event.preventDefault()
    event.stopPropagation()
  }
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      title={label}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onMouseDown={handleMouseDown}
      onClick={onActivate}
    >
      {children}
    </button>
  )
}

const FORMAT_BUTTONS: Array<{ kind: WriteInlineFormatKind; label: string; icon: LucideIcon }> = [
  { kind: 'bold', label: COPY.writeFormatBold, icon: Bold },
  { kind: 'italic', label: COPY.writeFormatItalic, icon: Italic },
  { kind: 'strikethrough', label: COPY.writeFormatStrikethrough, icon: Strikethrough },
  { kind: 'code', label: COPY.writeFormatCode, icon: Code },
]

const BLOCK_TYPE_META: Record<WriteBlockType, { label: string; icon: LucideIcon }> = {
  paragraph: { label: COPY.writeBlockTypeParagraph, icon: Pilcrow },
  heading1: { label: COPY.writeBlockTypeHeading1, icon: Heading1 },
  heading2: { label: COPY.writeBlockTypeHeading2, icon: Heading2 },
  heading3: { label: COPY.writeBlockTypeHeading3, icon: Heading3 },
  quote: { label: COPY.writeBlockTypeQuote, icon: Quote },
  bullet: { label: COPY.writeBlockTypeBullet, icon: List },
  ordered: { label: COPY.writeBlockTypeOrdered, icon: ListOrdered },
  code: { label: COPY.writeBlockTypeCode, icon: Code },
}

function quickActionIcon(id: string): LucideIcon {
  if (id === 'polish') return Wand2
  if (id === 'explain') return Lightbulb
  if (id === 'reformat') return WandSparkles
  return Sparkles
}

export function WriteInlineAgent({
  action,
  value,
  inFlight,
  textareaRef,
  onValueChange,
  onSubmitPrompt,
  onApplyEdit,
  askOnly = false,
  preferAbove = false,
  formattingEnabled = false,
  onApplyFormat,
  blockType = 'paragraph',
  onSetBlockType,
  quickActions = [],
  onQuickAction,
  agentPresets = [],
  activeAgentId = '',
  onSelectAgent,
  onOpenAgentSettings,
  onQuoteSelection,
  infographicEnabled = false,
  onGenerateInfographic,
  designDraftEnabled = false,
  onGenerateDesignDraft,
  prototypeEnabled = false,
  onGeneratePrototype,
  imageMode = false,
  onTextareaFocus,
  onTextareaBlur,
  defaultBlockMenuOpen = false,
}: Props): ReactElement {
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [placement, setPlacement] = useState<{ top: number; origin: 'top-center' | 'bottom-center' } | null>(null)
  const [blockMenuOpen, setBlockMenuOpen] = useState(defaultBlockMenuOpen)

  const showBlockSelector = !imageMode && formattingEnabled && Boolean(onSetBlockType)
  const showFormatting = !imageMode && formattingEnabled && Boolean(onApplyFormat)
  const showQuoteSelection = !imageMode && Boolean(onQuoteSelection)
  const showQuickActions = !imageMode && quickActions.length > 0 && Boolean(onQuickAction)
  const showAgentSwitcher =
    !imageMode && Boolean(onSelectAgent) && (agentPresets.length > 0 || Boolean(onOpenAgentSettings))
  const showInfographic = !imageMode && infographicEnabled && Boolean(onGenerateInfographic)
  const showDesignDraft = designDraftEnabled && Boolean(onGenerateDesignDraft)
  const showPrototype = prototypeEnabled && Boolean(onGeneratePrototype)
  const showComposer = !imageMode
  const activeBlock = BLOCK_TYPE_META[blockType] ?? BLOCK_TYPE_META.paragraph
  const ActiveBlockIcon = activeBlock.icon

  useLayoutEffect(() => {
    const el = menuRef.current
    if (!el) return
    const height = el.offsetHeight
    const viewportHeight = window.innerHeight
    const below = action.anchorBottom + INLINE_AGENT_GAP
    const above = action.anchorTop - height - INLINE_AGENT_GAP
    const canPlaceAbove = above >= 16
    const placeAbove = preferAbove
      ? canPlaceAbove
      : below + height > viewportHeight - 16 && canPlaceAbove
    const top = clamp(placeAbove ? above : below, 16, Math.max(16, viewportHeight - height - 16))
    setPlacement({ top, origin: placeAbove ? 'bottom-center' : 'top-center' })
  }, [
    action.anchorTop,
    action.anchorBottom,
    action.left,
    action.width,
    value,
    inFlight,
    showFormatting,
    showBlockSelector,
    showQuoteSelection,
    showInfographic,
    showDesignDraft,
    showPrototype,
    showComposer,
    blockMenuOpen,
    quickActions.length,
    preferAbove,
  ])

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Escape') {
      event.preventDefault()
      if (inFlight) return
      onValueChange('')
      return
    }
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    if (askOnly) {
      onSubmitPrompt(value)
      return
    }
    if (event.metaKey || event.ctrlKey) {
      onSubmitPrompt(value)
      return
    }
    onApplyEdit(value)
  }

  return (
    <div
      className="write-inline-agent fixed z-50"
      data-origin={placement?.origin ?? 'top-center'}
      data-selection-ignore="true"
      style={{
        left: action.left,
        top: placement?.top ?? action.anchorBottom + INLINE_AGENT_GAP,
        width: action.width,
        visibility: placement ? 'visible' : 'hidden',
      }}
    >
      <div ref={menuRef} className="write-inline-agent-menu">
        {showBlockSelector ? (
          <div className="write-inline-agent-block">
            <button
              type="button"
              className="write-inline-agent-block-trigger"
              aria-label={COPY.writeBlockTypeLabel}
              title={COPY.writeBlockTypeLabel}
              aria-expanded={blockMenuOpen}
              onMouseDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
              }}
              onClick={() => setBlockMenuOpen((open) => !open)}
            >
              <ActiveBlockIcon className="write-inline-agent-icon-muted" strokeWidth={1.85} />
              <span className="write-inline-agent-block-trigger-label">{activeBlock.label}</span>
              <ChevronDown className="write-inline-agent-icon-faint" strokeWidth={1.9} />
            </button>
            {blockMenuOpen ? (
              <>
                <div
                  className="write-inline-agent-block-backdrop"
                  onPointerDown={() => setBlockMenuOpen(false)}
                  onMouseDown={(event) => event.preventDefault()}
                />
                <div className="write-inline-agent-block-pop" role="menu">
                  {WRITE_BLOCK_TYPES.map((type) => {
                    const meta = BLOCK_TYPE_META[type]
                    const Icon = meta.icon
                    return (
                      <ToolbarButton
                        key={type}
                        className={`write-inline-agent-block-item${type === blockType ? ' is-active' : ''}`}
                        label={meta.label}
                        onActivate={() => {
                          setBlockMenuOpen(false)
                          onSetBlockType?.(type)
                        }}
                      >
                        <Icon className="write-inline-agent-block-item-icon" strokeWidth={1.85} />
                        <span className="write-inline-agent-block-item-label">{meta.label}</span>
                      </ToolbarButton>
                    )
                  })}
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {showFormatting ? (
          <div className="write-inline-agent-format-row">
            {FORMAT_BUTTONS.map(({ kind, label, icon: Icon }) => (
              <ToolbarButton
                key={kind}
                className="write-inline-agent-format"
                label={label}
                onActivate={() => onApplyFormat?.(kind)}
              >
                <Icon className="write-inline-agent-format-icon" strokeWidth={2} />
              </ToolbarButton>
            ))}
          </div>
        ) : null}

        {showAgentSwitcher || showQuoteSelection || showQuickActions || showInfographic || showDesignDraft || showPrototype ? (
          <div className="write-inline-agent-actions">
            {showAgentSwitcher ? (
              <div className="write-inline-agent-agent-section">
                <div className="write-inline-agent-agent-header">
                  <span className="write-inline-agent-section-label">{COPY.writeAgentSwitcherLabel}</span>
                  {onOpenAgentSettings && agentPresets.length > 0 ? (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onOpenAgentSettings()}
                      className="write-inline-agent-manage-btn"
                    >
                      <Settings2 className="write-inline-agent-manage-icon" strokeWidth={1.9} />
                      {COPY.writeAgentSwitcherManage}
                    </button>
                  ) : null}
                </div>
                {agentPresets.length > 0 ? (
                  <div className="write-inline-agent-pill-row">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onSelectAgent?.('')}
                      className={`write-inline-agent-pill${activeAgentId === '' ? ' is-active' : ''}`}
                    >
                      {COPY.writeAgentSwitcherNone}
                    </button>
                    {agentPresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        title={preset.persona}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => onSelectAgent?.(activeAgentId === preset.id ? '' : preset.id)}
                        className={`write-inline-agent-pill write-inline-agent-pill-named${
                          activeAgentId === preset.id ? ' is-active' : ''
                        }`}
                      >
                        <span aria-hidden="true" className="write-inline-agent-pill-emoji">
                          {preset.emoji}
                        </span>
                        <span className="write-inline-agent-pill-name">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onOpenAgentSettings?.()}
                    className="write-inline-agent-empty-hint"
                  >
                    <Sparkles className="write-inline-agent-empty-hint-icon" strokeWidth={1.85} />
                    <span className="write-inline-agent-empty-hint-label">{COPY.writeAgentSwitcherEmptyHint}</span>
                    <ChevronRight className="write-inline-agent-empty-hint-chevron" strokeWidth={1.8} />
                  </button>
                )}
              </div>
            ) : null}
            {showQuoteSelection || showQuickActions || showInfographic || showDesignDraft || showPrototype ? (
              <div className="write-inline-agent-section-label">{COPY.writeSelectionSkills}</div>
            ) : null}
            {showQuoteSelection ? (
              <ToolbarButton
                className="write-inline-agent-action-row"
                label={COPY.writeSelectionQuote}
                onActivate={() => onQuoteSelection?.()}
              >
                <MessageSquareQuote className="write-inline-agent-action-accent" strokeWidth={1.85} />
                <span className="write-inline-agent-action-label">{COPY.writeSelectionQuote}</span>
                <MessageSquareQuote className="write-inline-agent-action-hint" strokeWidth={1.8} />
              </ToolbarButton>
            ) : null}
            {showQuickActions
              ? quickActions.map((quickAction) => {
                  const Icon = quickActionIcon(quickAction.id)
                  return (
                    <ToolbarButton
                      key={quickAction.id}
                      className="write-inline-agent-action-row"
                      label={quickAction.label}
                      onActivate={() => onQuickAction?.(quickAction)}
                    >
                      <Icon className="write-inline-agent-action-accent" strokeWidth={1.85} />
                      <span className="write-inline-agent-action-label">{quickAction.label}</span>
                      {quickAction.mode === 'edit' ? (
                        <Replace className="write-inline-agent-action-hint" strokeWidth={1.8} />
                      ) : (
                        <MessageSquareQuote className="write-inline-agent-action-hint" strokeWidth={1.8} />
                      )}
                    </ToolbarButton>
                  )
                })
              : null}
            {showInfographic ? (
              <ToolbarButton
                className="write-inline-agent-action-row"
                label={COPY.writeInfographicGenerate}
                onActivate={() => onGenerateInfographic?.()}
              >
                <ImageIcon className="write-inline-agent-action-accent" strokeWidth={1.85} />
                <span className="write-inline-agent-action-label">{COPY.writeInfographicGenerate}</span>
                <Replace className="write-inline-agent-action-hint" strokeWidth={1.8} />
              </ToolbarButton>
            ) : null}
            {showDesignDraft ? (
              <ToolbarButton
                className="write-inline-agent-action-row"
                label={COPY.writeDesignDraftGenerate}
                onActivate={() => onGenerateDesignDraft?.()}
              >
                <LayoutTemplate className="write-inline-agent-action-accent" strokeWidth={1.85} />
                <span className="write-inline-agent-action-label">{COPY.writeDesignDraftGenerate}</span>
                <Replace className="write-inline-agent-action-hint" strokeWidth={1.8} />
              </ToolbarButton>
            ) : null}
            {showPrototype ? (
              <ToolbarButton
                className="write-inline-agent-action-row"
                label={COPY.writePrototypeGenerate}
                onActivate={() => onGeneratePrototype?.()}
              >
                <AppWindow className="write-inline-agent-action-accent" strokeWidth={1.85} />
                <span className="write-inline-agent-action-label">{COPY.writePrototypeGenerate}</span>
                <Replace className="write-inline-agent-action-hint" strokeWidth={1.8} />
              </ToolbarButton>
            ) : null}
          </div>
        ) : null}

        {showComposer ? (
          <form
            className="write-inline-agent-edit"
            onSubmit={(event) => {
              event.preventDefault()
              if (askOnly) {
                onSubmitPrompt(value)
              } else {
                onApplyEdit(value)
              }
            }}
          >
            {askOnly ? (
              <MessageSquareQuote className="write-inline-agent-edit-icon" strokeWidth={1.9} />
            ) : (
              <Sparkles className="write-inline-agent-edit-icon" strokeWidth={1.9} />
            )}
            <textarea
              ref={textareaRef}
              rows={1}
              value={value}
              placeholder={askOnly ? COPY.writeInlineAgentPlaceholder : COPY.writeInlineAgentEditHint}
              aria-label={askOnly ? COPY.writeInlineAgentPlaceholder : COPY.writeInlineAgentEditHint}
              spellCheck={false}
              className="write-inline-agent-input"
              disabled={inFlight}
              onChange={(event) => onValueChange(event.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={onTextareaFocus}
              onBlur={onTextareaBlur}
            />
            {!askOnly ? (
              <button
                type="button"
                className="write-inline-agent-secondary"
                aria-label={COPY.writeInlineAgentSend}
                title={COPY.writeInlineAgentSend}
                disabled={!value.trim() || inFlight}
                onClick={() => onSubmitPrompt(value)}
              >
                <MessageSquareQuote className="write-inline-agent-secondary-icon" strokeWidth={1.9} />
              </button>
            ) : null}
            <button
              type="submit"
              className="write-inline-agent-submit"
              aria-label={
                inFlight
                  ? COPY.writeInlineEditApplying
                  : askOnly
                    ? COPY.writeInlineAgentSend
                    : COPY.writeInlineEditApply
              }
              title={
                inFlight
                  ? COPY.writeInlineEditApplying
                  : askOnly
                    ? COPY.writeInlineAgentSend
                    : COPY.writeInlineEditApply
              }
              disabled={!value.trim() || inFlight}
            >
              {inFlight ? (
                <Loader2 className="write-inline-agent-submit-icon write-inline-agent-spin" strokeWidth={2} />
              ) : askOnly ? (
                <MessageSquareQuote className="write-inline-agent-submit-icon" strokeWidth={2} />
              ) : (
                <Sparkles className="write-inline-agent-submit-icon" strokeWidth={2} />
              )}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  )
}

function previewPosition(): WriteInlineAgentPosition {
  const width = 300
  const left = Math.max(16, (window.innerWidth - width) / 2)
  const anchorTop = Math.round(window.innerHeight * 0.44)
  return {
    left,
    width,
    anchorTop,
    anchorBottom: anchorTop + 28,
  }
}

type PreviewProps = {
  mode: WriteInlineAgentPreviewMode
}

/** Full-page preview shell for ?writeInlineAgent URL hooks. */
export function WriteInlineAgentPreview({ mode }: PreviewProps): ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [value, setValue] = useState(mode === 'inFlight' ? 'Tighten this paragraph' : '')
  const [blockType, setBlockType] = useState<WriteBlockType>('paragraph')
  const [activeAgentId, setActiveAgentId] = useState(
    mode === 'default' ? WRITE_SETTINGS_PREVIEW_DEFAULT.agentPresets[0]?.id ?? '' : '',
  )
  const [position, setPosition] = useState<WriteInlineAgentPosition>(() =>
    typeof window === 'undefined'
      ? { left: 0, width: 300, anchorTop: 320, anchorBottom: 348 }
      : previewPosition(),
  )

  useLayoutEffect(() => {
    const update = (): void => setPosition(previewPosition())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const agentPresets =
    mode === 'emptyAgents' ? [] : WRITE_SETTINGS_PREVIEW_DEFAULT.agentPresets
  const quickActions = WRITE_SETTINGS_PREVIEW_DEFAULT.selectionAssist.quickActions

  return (
    <div className="write-inline-agent-preview">
      <div className="write-inline-agent-preview-doc">
        <p className="write-inline-agent-preview-lead">
          The quarterly roadmap should emphasize reliability work before new feature launches.
        </p>
        <p className="write-inline-agent-preview-selection">
          <mark className="write-inline-agent-preview-mark">
            Teams need clearer ownership boundaries and fewer handoffs between design and engineering.
          </mark>
        </p>
        <p className="write-inline-agent-preview-trail">
          Shipping cadence improves when every initiative has a single accountable owner.
        </p>
      </div>
      <WriteInlineAgent
        action={position}
        value={value}
        inFlight={mode === 'inFlight'}
        textareaRef={textareaRef}
        onValueChange={setValue}
        onSubmitPrompt={() => undefined}
        onApplyEdit={() => undefined}
        askOnly={mode === 'askOnly'}
        formattingEnabled={mode !== 'imageMode' && mode !== 'askOnly'}
        onApplyFormat={() => undefined}
        blockType={blockType}
        onSetBlockType={setBlockType}
        defaultBlockMenuOpen={mode === 'blockMenu'}
        quickActions={mode === 'imageMode' ? [] : quickActions}
        onQuickAction={() => undefined}
        agentPresets={mode === 'imageMode' ? [] : agentPresets}
        activeAgentId={activeAgentId}
        onSelectAgent={setActiveAgentId}
        onOpenAgentSettings={() => undefined}
        onQuoteSelection={() => undefined}
        infographicEnabled={mode === 'skills'}
        onGenerateInfographic={() => undefined}
        designDraftEnabled={mode === 'skills' || mode === 'imageMode'}
        onGenerateDesignDraft={() => undefined}
        prototypeEnabled={mode === 'skills' || mode === 'imageMode'}
        onGeneratePrototype={() => undefined}
        imageMode={mode === 'imageMode'}
      />
    </div>
  )
}
