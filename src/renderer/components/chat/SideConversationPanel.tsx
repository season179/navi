// Side conversation overlay echoing Kun's SideConversationPanel
// (../Kun/src/renderer/src/components/chat/SideConversationPanel.tsx).
// Visual only: parent supplies side snapshots and optional action callbacks.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
} from 'react'
import {
  ArrowDownToLine,
  ChevronDown,
  CornerDownLeft,
  Loader2,
  MessageCircleMore,
  Minus,
  MoreHorizontal,
  Plus,
  Trash2,
  Wrench,
  X,
} from 'lucide-react'
import {
  SIDE_PANEL_COMPOSER_PLACEHOLDER,
  SIDE_PANEL_DISCARD_TITLE,
  SIDE_PANEL_DRAFT_EMPTY,
  SIDE_PANEL_EMPTY,
  SIDE_PANEL_EXPAND_LABEL,
  SIDE_PANEL_HIDE_LABEL,
  SIDE_PANEL_MINIMIZE_LABEL,
  SIDE_PANEL_MORE_LABEL,
  SIDE_PANEL_NEW_LABEL,
  SIDE_PANEL_PARENT_MISSING,
  SIDE_PANEL_PROMOTE_LABEL,
  SIDE_PANEL_THINKING_LABEL,
  SIDE_PANEL_TITLE,
  formatSidePanelInheritedAt,
  formatSidePanelParentLabel,
} from '../../lib/sideConversationPanel'
import { Markdown } from '../common/Markdown'

export type SideChatBlockKind =
  | 'user'
  | 'assistant'
  | 'reasoning'
  | 'tool'
  | 'approval'
  | 'compaction'
  | 'user_input'
  | 'system'

export type SideChatBlock = {
  id: string
  kind: SideChatBlockKind
  text?: string
  summary?: string
  toolKind?: string
  status?: 'running' | 'done'
  questions?: Array<{ question: string }>
}

export type SideConversationSnapshot = {
  threadId: string
  title: string
  busy?: boolean
  inheritedAt: string
  blocks: SideChatBlock[]
  liveAssistant?: string
  liveReasoning?: string
  error?: string | null
  input?: string
}

export type SideConversationPanelPreviewMode =
  | 'default'
  | 'draft'
  | 'minimized'
  | 'running'
  | 'error'

type Props = {
  className?: string
  rightOffset?: number
  parentTitle?: string
  sides?: SideConversationSnapshot[]
  activeSideId?: string | null
  minimized?: boolean
  showDraft?: boolean
  draftInput?: string
  onDraftInputChange?: (value: string) => void
  onSelectSide?: (threadId: string) => void
  onMinimize?: () => void
  onExpand?: () => void
  onClose?: () => void
  onNewDraft?: () => void
}

const NOW = new Date().toISOString()

function formatInheritedTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function compactSideTitle(value: string): string {
  const trimmed = value.replace(/\s*·\s*side$/i, '').trim()
  const prefix = Array.from(trimmed || value.trim()).slice(0, 5).join('')
  return prefix || value
}

function overlayStyle(rightOffset = 24): CSSProperties {
  const offset = Math.max(12, Math.round(rightOffset))
  return {
    right: `min(${offset}px, calc(12px + max(0px, 100vw - 760px)))`,
  }
}

/** Default side snapshots for ?sideConversationPanelPreview visual verification. */
export const SIDE_CONVERSATION_PANEL_PREVIEW_SIDES: SideConversationSnapshot[] = [
  {
    threadId: 'side-1',
    title: 'Auth edge cases · side',
    inheritedAt: NOW,
    input: '',
    blocks: [
      {
        id: 'block-user-1',
        kind: 'user',
        text: 'What happens if the refresh token expires mid-request?',
      },
      {
        id: 'block-reasoning-1',
        kind: 'reasoning',
        text: 'Checking middleware order and token refresh race conditions…',
      },
      {
        id: 'block-assistant-1',
        kind: 'assistant',
        text: 'If the refresh token expires **during** an in-flight request, the middleware should queue the retry after a successful refresh rather than failing immediately.',
      },
      {
        id: 'block-tool-1',
        kind: 'tool',
        summary: 'Read auth/middleware.ts',
        toolKind: 'read',
        status: 'done',
      },
    ],
  },
  {
    threadId: 'side-2',
    title: 'Session TTL · side',
    inheritedAt: NOW,
    busy: true,
    blocks: [
      {
        id: 'block-user-2',
        kind: 'user',
        text: 'Compare session TTL defaults across providers.',
      },
    ],
    liveAssistant: 'Looking at provider docs for default session windows…',
  },
  {
    threadId: 'side-3',
    title: 'Migration notes · side',
    inheritedAt: NOW,
    blocks: [],
  },
]

export const SIDE_CONVERSATION_PANEL_PREVIEW_RUNNING: SideConversationSnapshot = {
  threadId: 'side-running',
  title: 'Provider limits · side',
  inheritedAt: NOW,
  busy: true,
  blocks: [
    {
      id: 'block-user-run',
      kind: 'user',
      text: 'Summarize rate limits for the OpenAI-compatible endpoint.',
    },
  ],
  liveReasoning: 'Scanning provider documentation for rate limit headers…',
  liveAssistant: 'The endpoint returns `x-ratelimit-remaining` on each response.',
  input: 'Also check burst limits',
}

export const SIDE_CONVERSATION_PANEL_PREVIEW_ERROR: SideConversationSnapshot = {
  threadId: 'side-error',
  title: 'Debug timeout · side',
  inheritedAt: NOW,
  blocks: [
    {
      id: 'block-user-err',
      kind: 'user',
      text: 'Why did the last tool call time out?',
    },
  ],
  error: 'Side conversation failed: runtime disconnected while streaming.',
}

function SideChatComposer({
  value,
  onChange,
  onSend,
  busy = false,
  disabled = false,
}: {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  busy?: boolean
  disabled?: boolean
}): ReactElement {
  const sendDisabled = disabled || busy || value.trim().length === 0

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key !== 'Enter' || event.shiftKey || event.metaKey || event.ctrlKey) return
    event.preventDefault()
    if (!sendDisabled) onSend()
  }

  return (
    <div className="side-conversation-composer">
      <div className="side-conversation-composer-row">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || busy}
          rows={1}
          placeholder={SIDE_PANEL_COMPOSER_PLACEHOLDER}
          className="side-conversation-composer-input"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={sendDisabled}
          className="side-conversation-composer-send"
          aria-label={SIDE_PANEL_COMPOSER_PLACEHOLDER}
          title={SIDE_PANEL_COMPOSER_PLACEHOLDER}
        >
          {busy ? (
            <Loader2 className="side-conversation-composer-send-icon is-spinning" strokeWidth={1.9} />
          ) : (
            <CornerDownLeft className="side-conversation-composer-send-icon" strokeWidth={1.9} />
          )}
        </button>
      </div>
    </div>
  )
}

function SideMessageBubble({ block }: { block: SideChatBlock }): ReactElement | null {
  if (block.kind === 'user') {
    return (
      <div className="side-conversation-bubble-row is-user">
        <div className="side-conversation-user-bubble">
          <div className="side-conversation-markdown side-conversation-pre-wrap">{block.text}</div>
        </div>
      </div>
    )
  }
  if (block.kind === 'assistant') {
    const streaming = block.id === 'live-assistant'
    return (
      <div className="side-conversation-assistant-bubble">
        {streaming ? (
          <span>{block.text}</span>
        ) : (
          <Markdown text={block.text ?? ''} streaming={false} />
        )}
      </div>
    )
  }
  if (block.kind === 'reasoning') {
    return (
      <div className="side-conversation-reasoning-bubble">
        <div className="side-conversation-markdown">
          <Markdown text={block.text ?? ''} streaming={false} />
        </div>
      </div>
    )
  }
  if (block.kind === 'tool') {
    return (
      <div className="side-conversation-tool-chip">
        <Wrench className="side-conversation-tool-icon" strokeWidth={1.9} />
        <span className="side-conversation-tool-label">
          {block.summary || block.toolKind || 'tool'}
        </span>
        {block.status === 'running' ? (
          <Loader2 className="side-conversation-tool-spinner is-spinning" strokeWidth={1.9} />
        ) : null}
      </div>
    )
  }
  if (block.kind === 'approval' || block.kind === 'compaction') {
    return <div className="side-conversation-meta-chip">{block.summary}</div>
  }
  if (block.kind === 'user_input') {
    return (
      <div className="side-conversation-meta-chip">
        {block.questions?.map((q) => q.question).join(' · ') || 'user input'}
      </div>
    )
  }
  if (block.kind === 'system') {
    return <div className="side-conversation-system-bubble">{block.text}</div>
  }
  return null
}

export function SideConversationPanel({
  className = '',
  rightOffset = 24,
  parentTitle = 'Auth refactor plan',
  sides = SIDE_CONVERSATION_PANEL_PREVIEW_SIDES,
  activeSideId,
  minimized = false,
  showDraft = false,
  draftInput = '',
  onDraftInputChange,
  onSelectSide,
  onMinimize,
  onExpand,
  onClose,
  onNewDraft,
}: Props): ReactElement {
  const [switchMenuOpen, setSwitchMenuOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [localDraftInput, setLocalDraftInput] = useState(draftInput)
  const [localSideInputs, setLocalSideInputs] = useState<Record<string, string>>(() =>
    Object.fromEntries(sides.map((side) => [side.threadId, side.input ?? ''])),
  )
  const switchMenuRef = useRef<HTMLDivElement | null>(null)
  const moreMenuRef = useRef<HTMLDivElement | null>(null)

  const resolvedActiveId =
    activeSideId === undefined
      ? sides[0]?.threadId ?? null
      : activeSideId
  const activeSide = resolvedActiveId
    ? sides.find((side) => side.threadId === resolvedActiveId) ?? null
    : null
  const sideIds = sides.map((side) => side.threadId)
  const runningCount = sides.reduce((count, side) => count + (side.busy ? 1 : 0), 0)
  const rightStyle = overlayStyle(rightOffset)
  const titleCount = sideIds.length > 0 ? ` · ${sideIds.length}` : ''
  const title = `${SIDE_PANEL_TITLE}${titleCount}`
  const subtitle = parentTitle
    ? formatSidePanelParentLabel(parentTitle)
    : SIDE_PANEL_PARENT_MISSING

  const handleDraftChange = useCallback(
    (value: string) => {
      setLocalDraftInput(value)
      onDraftInputChange?.(value)
    },
    [onDraftInputChange],
  )

  const handleSideInputChange = useCallback((threadId: string, value: string) => {
    setLocalSideInputs((current) => ({ ...current, [threadId]: value }))
  }, [])

  useEffect(() => {
    if (!switchMenuOpen && !moreMenuOpen) return
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target
      if (
        target instanceof Node &&
        (switchMenuRef.current?.contains(target) || moreMenuRef.current?.contains(target))
      ) {
        return
      }
      setSwitchMenuOpen(false)
      setMoreMenuOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [switchMenuOpen, moreMenuOpen])

  if (minimized) {
    return (
      <button
        type="button"
        onClick={onExpand}
        className={`side-conversation-panel-mini ${className}`.trim()}
        style={rightStyle}
        aria-label={SIDE_PANEL_EXPAND_LABEL}
        title={SIDE_PANEL_EXPAND_LABEL}
      >
        <MessageCircleMore className="side-conversation-panel-mini-icon" strokeWidth={1.85} />
        <span className="side-conversation-panel-mini-count">{Math.max(sideIds.length, 1)}</span>
        {runningCount > 0 ? <span className="side-conversation-panel-mini-dot" /> : null}
      </button>
    )
  }

  const renderBody = () => {
    if (showDraft || !activeSide) {
      return (
        <div className="side-conversation-empty-state">
          <MessageCircleMore className="side-conversation-empty-icon" strokeWidth={1.7} />
          <p>{SIDE_PANEL_DRAFT_EMPTY}</p>
        </div>
      )
    }

    const hasContent =
      activeSide.blocks.length > 0 ||
      Boolean(activeSide.liveAssistant) ||
      Boolean(activeSide.liveReasoning)

    return (
      <>
        <div className="side-conversation-inherited-at">
          {formatSidePanelInheritedAt(formatInheritedTime(activeSide.inheritedAt))}
        </div>
        {!hasContent ? (
          <div className="side-conversation-empty-state is-compact">
            <MessageCircleMore className="side-conversation-empty-icon" strokeWidth={1.7} />
            <p>{SIDE_PANEL_EMPTY}</p>
          </div>
        ) : null}
        {activeSide.blocks.map((block) => (
          <SideMessageBubble key={block.id} block={block} />
        ))}
        {activeSide.liveReasoning ? (
          <SideMessageBubble
            block={{
              kind: 'reasoning',
              id: 'live-reasoning',
              text: activeSide.liveReasoning,
            }}
          />
        ) : null}
        {activeSide.liveAssistant ? (
          <SideMessageBubble
            block={{
              kind: 'assistant',
              id: 'live-assistant',
              text: activeSide.liveAssistant,
            }}
          />
        ) : null}
        {activeSide.busy ? (
          <div className="side-conversation-thinking">
            <Loader2 className="side-conversation-thinking-icon is-spinning" strokeWidth={1.9} />
            <span>{SIDE_PANEL_THINKING_LABEL}</span>
          </div>
        ) : null}
        {activeSide.error ? (
          <div className="side-conversation-error">{activeSide.error}</div>
        ) : null}
      </>
    )
  }

  return (
    <aside
      className={`side-conversation-panel ${className}`.trim()}
      style={rightStyle}
      aria-label={SIDE_PANEL_TITLE}
    >
      <header className="side-conversation-header">
        <MessageCircleMore className="side-conversation-header-icon" strokeWidth={1.85} />
        <div ref={switchMenuRef} className="side-conversation-header-main">
          <button
            type="button"
            onClick={() => sideIds.length > 0 && setSwitchMenuOpen((open) => !open)}
            className="side-conversation-title-btn"
            disabled={sideIds.length === 0}
            aria-expanded={switchMenuOpen}
            title={title}
          >
            <span className="side-conversation-title-text">{title}</span>
            {sideIds.length > 0 ? (
              <ChevronDown className="side-conversation-title-chevron" strokeWidth={1.9} />
            ) : null}
          </button>
          <div className="side-conversation-subtitle" title={subtitle}>
            {subtitle}
          </div>

          {switchMenuOpen ? (
            <div className="side-conversation-switch-menu">
              {sides.map((side) => {
                const selected = side.threadId === activeSide?.threadId
                return (
                  <button
                    key={side.threadId}
                    type="button"
                    onClick={() => {
                      onSelectSide?.(side.threadId)
                      setSwitchMenuOpen(false)
                    }}
                    className={`side-conversation-switch-item${selected ? ' is-selected' : ''}`}
                  >
                    <span className="side-conversation-switch-label" title={side.title}>
                      {compactSideTitle(side.title)}
                    </span>
                    {side.busy ? <span className="side-conversation-switch-dot" /> : null}
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>

        <div className="side-conversation-header-actions">
          <button
            type="button"
            onClick={onNewDraft}
            className="side-conversation-header-btn"
            aria-label={SIDE_PANEL_NEW_LABEL}
            title={SIDE_PANEL_NEW_LABEL}
          >
            <Plus className="side-conversation-header-btn-icon" strokeWidth={1.9} />
          </button>
          {activeSide ? (
            <button
              type="button"
              className="side-conversation-header-btn is-danger-hover"
              aria-label={SIDE_PANEL_DISCARD_TITLE}
              title={SIDE_PANEL_DISCARD_TITLE}
            >
              <Trash2 className="side-conversation-header-btn-icon" strokeWidth={1.9} />
            </button>
          ) : null}
          <div ref={moreMenuRef} className="side-conversation-more-wrap">
            <button
              type="button"
              onClick={() => setMoreMenuOpen((open) => !open)}
              disabled={!activeSide}
              className="side-conversation-header-btn"
              aria-label={SIDE_PANEL_MORE_LABEL}
              title={SIDE_PANEL_MORE_LABEL}
              aria-expanded={moreMenuOpen}
            >
              <MoreHorizontal className="side-conversation-header-btn-icon" strokeWidth={1.9} />
            </button>
            {moreMenuOpen && activeSide ? (
              <div className="side-conversation-more-menu">
                <button
                  type="button"
                  className="side-conversation-more-item"
                  onClick={() => setMoreMenuOpen(false)}
                >
                  <ArrowDownToLine className="side-conversation-more-icon" strokeWidth={1.8} />
                  <span className="side-conversation-more-label">{SIDE_PANEL_PROMOTE_LABEL}</span>
                </button>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onMinimize}
            className="side-conversation-header-btn"
            aria-label={SIDE_PANEL_MINIMIZE_LABEL}
            title={SIDE_PANEL_MINIMIZE_LABEL}
          >
            <Minus className="side-conversation-header-btn-icon" strokeWidth={1.9} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="side-conversation-header-btn"
            aria-label={SIDE_PANEL_HIDE_LABEL}
            title={SIDE_PANEL_HIDE_LABEL}
          >
            <X className="side-conversation-header-btn-icon" strokeWidth={1.9} />
          </button>
        </div>
      </header>

      <div className="side-conversation-body-wrap">
        <div className="side-conversation-body">{renderBody()}</div>
        <footer className="side-conversation-footer">
          {activeSide && !showDraft ? (
            <SideChatComposer
              value={localSideInputs[activeSide.threadId] ?? ''}
              onChange={(value) => handleSideInputChange(activeSide.threadId, value)}
              onSend={() => undefined}
              busy={activeSide.busy}
            />
          ) : (
            <SideChatComposer
              value={localDraftInput}
              onChange={handleDraftChange}
              onSend={() => undefined}
            />
          )}
        </footer>
      </div>
    </aside>
  )
}
