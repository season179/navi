// Production chat composer using Kun's ds-composer-shell chrome from
// FloatingComposer (../Kun/src/renderer/src/components/chat/FloatingComposer.tsx).
// Controlled by the parent; sends on Enter (Shift+Enter for a newline) and turns
// into a stop button while a reply is streaming.
//
// Also hosts the `/skill` picker (plan §D4 / §D6): when the draft is a single
// leading `/`-token (e.g. "/com"), a floating menu of available skills filters
// live. Picking one replaces the token with a "use the X skill" hint — a
// front-end shortcut only, never a backend trigger.

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { Mic, Plus, Send, Sparkles, Square } from 'lucide-react'
import { filterSkillSlashCommands } from '../lib/composerSlashCommands'
import { VoiceRecordingStrip } from './VoiceRecordingStrip'
import {
  FloatingComposerQueuedMessages,
  type QueuedComposerMessage,
} from './FloatingComposerQueuedMessages'
import { ComposerPlusMenu, ComposerSlashMenu, type ComposerSlashCommandItem } from './FloatingComposer'
import {
  ContextCapacityPopover,
  type ContextCapacity,
} from './ContextCapacityPopover'
import type { SkillSummary } from '../../shared/flue'

function formatContextPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

interface ComposerProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onCancel?: () => void
  busy?: boolean
  disabled?: boolean
  /** Kun FloatingComposer variant — compact omits footer, plus menu, and context controls. */
  variant?: 'default' | 'compact'
  placeholder?: string
  /** Context window occupancy chip shown before the model picker when set. */
  contextCapacity?: ContextCapacity | null
  /** Model picker rendered in the toolbar end row after context controls. */
  modelChip?: ReactNode
  /** Available skills for the `/skill` picker (scoped to active project). */
  skills?: SkillSummary[]
  /** When set, shows Kun's dictation recording strip instead of the send button. */
  voiceRecording?: {
    getLevel: () => number
    startedAtMs: number
    onStop?: () => void
    onSend?: () => void
  }
  /** Queued messages shown above the composer shell while a reply is streaming. */
  queuedMessages?: QueuedComposerMessage[]
  onRemoveQueuedMessage?: (id: string) => void
  /** Execution picker (approval + sandbox) rendered in the toolbar end row. */
  executionPicker?: ReactNode
  /** Footer row below the composer shell (e.g. git branch picker). */
  footerLeft?: ReactNode
}

/**
 * Detect a leading `/skill` trigger: the draft starts with `/`, the slash is the
 * only such token so far, and there's no newline yet (so multi-line drafts don't
 * surface the picker). Returns the query (text after `/`) or null when inactive.
 */
function skillQuery(value: string): string | null {
  if (!value.startsWith('/')) return null
  const newlineIdx = value.indexOf('\n')
  if (newlineIdx !== -1) return null
  return value.slice(1)
}

export function Composer({
  value,
  onChange,
  onSend,
  onCancel,
  busy = false,
  disabled = false,
  variant = 'default',
  placeholder = 'Send a message to Navi…',
  contextCapacity,
  modelChip,
  skills,
  voiceRecording,
  queuedMessages,
  onRemoveQueuedMessage,
  executionPicker,
  footerLeft,
}: ComposerProps) {
  const compact = variant === 'compact'
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const contextCapacityRef = useRef<HTMLDivElement>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [plusMenuOpen, setPlusMenuOpen] = useState(false)
  const [contextCapacityOpen, setContextCapacityOpen] = useState(false)
  const [slashActiveIndex, setSlashActiveIndex] = useState(0)
  const plusMenuRef = useRef<HTMLDivElement>(null)
  const slashMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contextCapacityOpen) return
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target
      if (target instanceof Node && contextCapacityRef.current?.contains(target)) return
      setContextCapacityOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [contextCapacityOpen])

  useEffect(() => {
    if (!plusMenuOpen) return
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target
      if (target instanceof Node && plusMenuRef.current?.contains(target)) return
      setPlusMenuOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [plusMenuOpen])

  useEffect(() => {
    if (pickerOpen) setPlusMenuOpen(false)
  }, [pickerOpen])

  useEffect(() => {
    if (!pickerOpen) return
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target
      if (target instanceof Node && slashMenuRef.current?.contains(target)) return
      if (value.startsWith('/')) onChange(value.slice(1))
      setPickerOpen(false)
      textareaRef.current?.focus()
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [pickerOpen, value, onChange])

  // Auto-grow the textarea up to its CSS max-height.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  const canSend = !disabled && value.trim().length > 0

  // The picker is active when there's a leading /query and skills are provided.
  const query = useMemo(() => (skills && skills.length > 0 ? skillQuery(value) : null), [value, skills])
  const slashCommands = useMemo((): ComposerSlashCommandItem[] => {
    if (query === null || !skills) return []
    return filterSkillSlashCommands(skills, query).map((command, index) => ({
      ...command,
      icon: <Sparkles strokeWidth={1.9} />,
      active: index === slashActiveIndex,
    }))
  }, [query, skills, slashActiveIndex])

  useEffect(() => {
    setPickerOpen(query !== null)
  }, [query])

  useEffect(() => {
    setSlashActiveIndex(0)
  }, [slashCommands.length, query])

  const shellClass = [
    'ds-composer-shell',
    'ds-chat-composer',
    'ds-frosted',
    'ds-no-drag',
    'floating-composer-shell',
    compact ? 'is-compact' : '',
    focused ? 'ds-chat-composer-focus' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const rootClass = [
    'composer-stack',
    'ds-floating-composer',
    'ds-no-drag',
    'floating-composer-root',
    compact ? 'is-compact' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const injectSkillHint = (skill: SkillSummary) => {
    // Replace the entire leading `/query` with a natural-language hint. Per
    // §D4 this is a hint, not a trigger: the agent reads it and activates the
    // skill via Flue's normal catalog (already in its system prompt).
    // skillQuery() guarantees `value` is a single line starting with '/', so the
    // whole draft *is* the `/query` token — drop it all (NOT just the leading
    // '/'), otherwise the typed filter text (e.g. the "release" in "/release")
    // would be left dangling after the hint. Then prepend a space so the user
    // can keep typing their actual request.
    const hint = `Use the ${skill.name} skill for this. `
    onChange(hint)
    setPickerOpen(false)
    // Return focus to the textarea at the end of the hint.
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      const pos = hint.length
      el.focus()
      el.setSelectionRange(pos, pos)
    })
  }

  const closeSlashMenu = () => {
    if (value.startsWith('/')) onChange(value.slice(1))
    setPickerOpen(false)
    textareaRef.current?.focus()
  }

  const pickSlashCommand = (command: ComposerSlashCommandItem) => {
    if (!command.skillName || !skills) {
      closeSlashMenu()
      return
    }
    const skill = skills.find((entry) => entry.name === command.skillName)
    if (skill) injectSkillHint(skill)
    else closeSlashMenu()
  }

  useEffect(() => {
    if (!pickerOpen) return
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeSlashMenu()
        return
      }
      if (slashCommands.length === 0) return
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSlashActiveIndex((index) => Math.min(index + 1, slashCommands.length - 1))
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSlashActiveIndex((index) => Math.max(index - 1, 0))
      } else if (event.key === 'Enter' && slashCommands[slashActiveIndex]) {
        event.preventDefault()
        pickSlashCommand(slashCommands[slashActiveIndex])
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [pickerOpen, slashCommands, slashActiveIndex, value, skills, onChange])

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    // Let the slash menu handle Arrow/Enter/Escape while it's open.
    if (
      pickerOpen &&
      (e.key === 'Escape' || (slashCommands.length > 0 && (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp')))
    ) {
      if (e.key === 'Enter') e.preventDefault()
      return
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      if (busy) {
        if (compact) onCancel?.()
        return
      }
      if (canSend) onSend()
    }
  }

  const toolbarEndClass = [
    'floating-composer-toolbar-end',
    voiceRecording ? 'is-recording' : '',
    compact && modelChip ? 'is-compact-stretch' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const toolbarClass = [
    'ds-composer-toolbar',
    'floating-composer-toolbar',
    compact ? 'is-compact' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const composerBody = (
    <div className={rootClass}>
      {!compact && queuedMessages && queuedMessages.length > 0 ? (
        <FloatingComposerQueuedMessages
          messages={queuedMessages}
          onRemove={onRemoveQueuedMessage}
        />
      ) : null}
      <div className="floating-composer-relative">
        {!compact && plusMenuOpen && query === null ? (
          <div ref={plusMenuRef}>
            <ComposerPlusMenu />
          </div>
        ) : null}
        {!compact && pickerOpen && query !== null ? (
          <div ref={slashMenuRef}>
            <ComposerSlashMenu
              commands={slashCommands}
              onPick={pickSlashCommand}
              onHover={setSlashActiveIndex}
              emptyMessage={
                query.trim() ? `No skills match “${query.trim()}”.` : 'No skills available.'
              }
            />
          </div>
        ) : null}
        <div className={shellClass}>
          <textarea
            ref={textareaRef}
            rows={1}
            className={`floating-composer-textarea${compact ? ' is-compact' : ''}`}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            aria-label="Message"
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <div className={toolbarClass}>
            {!compact ? (
              <div className="floating-composer-toolbar-start">
                <button
                  type="button"
                  className={`floating-composer-plus-btn${plusMenuOpen ? ' is-open' : ''}`}
                  aria-label="Composer menu"
                  aria-expanded={plusMenuOpen}
                  disabled={disabled}
                  onClick={() => setPlusMenuOpen((open) => !open)}
                >
                  <Plus strokeWidth={1.8} />
                </button>
              </div>
            ) : null}
            <div className={toolbarEndClass}>
              {voiceRecording ? (
                <>
                  <VoiceRecordingStrip
                    getLevel={voiceRecording.getLevel}
                    startedAtMs={voiceRecording.startedAtMs}
                  />
                  <button
                    type="button"
                    className="floating-composer-voice-stop"
                    onClick={voiceRecording.onStop}
                    aria-label="Stop recording"
                    title="Stop recording"
                  >
                    <Square strokeWidth={2.4} />
                  </button>
                  <button
                    type="button"
                    className="floating-composer-send-btn"
                    onClick={voiceRecording.onSend}
                    aria-label="Send recording"
                    title="Send recording"
                  >
                    <Send strokeWidth={2.2} />
                  </button>
                </>
              ) : (
                <>
                  {!compact && contextCapacity ? (
                    <div className="floating-composer-context-wrap" ref={contextCapacityRef}>
                      <button
                        type="button"
                        className="floating-composer-context-chip"
                        aria-expanded={contextCapacityOpen}
                        aria-label={`Context capacity ${formatContextPercent(contextCapacity.usedRatio)}`}
                        title="Context capacity"
                        onClick={() => setContextCapacityOpen((open) => !open)}
                      >
                        <span className="floating-composer-context-bar" aria-hidden>
                          <span
                            style={{
                              width: `${Math.min(100, contextCapacity.usedRatio * 100)}%`,
                              background:
                                contextCapacity.usedRatio >= 0.9
                                  ? '#d9544e'
                                  : contextCapacity.usedRatio >= 0.75
                                    ? '#d9920f'
                                    : 'var(--ds-accent)',
                            }}
                          />
                        </span>
                        <span>{formatContextPercent(contextCapacity.usedRatio)}</span>
                      </button>
                      {contextCapacityOpen ? (
                        <div className="floating-composer-context-popover">
                          <ContextCapacityPopover capacity={contextCapacity} />
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {modelChip}
                  {!compact ? executionPicker : null}
                  {!compact ? (
                    <button
                      type="button"
                      className="floating-composer-mic-btn"
                      aria-label="Start voice input"
                      disabled={disabled}
                    >
                      <Mic strokeWidth={2} />
                    </button>
                  ) : null}
                  {busy ? (
                    <button
                      type="button"
                      className="floating-composer-stop-btn"
                      onClick={onCancel}
                      aria-label="Stop"
                      title="Stop"
                    >
                      <Square strokeWidth={2.4} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="floating-composer-send-btn"
                      disabled={!canSend}
                      onClick={onSend}
                      aria-label="Send"
                      title="Send"
                    >
                      <Send strokeWidth={2.2} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {!compact && footerLeft ? (
        <div className="ds-composer-footer floating-composer-footer">
          <div className="ds-composer-footer-left">{footerLeft}</div>
        </div>
      ) : null}
    </div>
  )

  if (compact) return composerBody
  return <div className="composer-wrap">{composerBody}</div>
}
