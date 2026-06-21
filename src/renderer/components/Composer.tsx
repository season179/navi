// Production chat composer using Kun's ds-composer-shell chrome from
// FloatingComposer (../Kun/src/renderer/src/components/chat/FloatingComposer.tsx).
// Controlled by the parent; sends on Enter (Shift+Enter for a newline). While a
// reply is streaming, Kun shows both a stop button and a queue-send button.
//
// Also hosts the `/skill` picker (plan §D4 / §D6): when the draft is a single
// leading `/`-token (e.g. "/com"), a floating menu of available skills filters
// live. Picking one replaces the token with a "use the X skill" hint — a
// front-end shortcut only, never a backend trigger.

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { ListTodo, Loader2, Mic, Plus, Send, Sparkles, Square, Target } from 'lucide-react'
import { filterSkillSlashCommands } from '../lib/composerSlashCommands'
import {
  filterWorkspaceFileMentionSuggestions,
  getFileMentionAtCursor,
  isComposerDirectoryReference,
  replaceFileMentionInInput,
  type ComposerFileReference,
} from '../lib/composerFileReferences'
import type { ComposerChangedFile } from '../lib/composerChangeSummary'
import type { ComposerImageAttachment } from '../lib/composerAttachments'
import type { ComposerGoal } from '../lib/composerGoal'
import type { ComposerThreadUsage } from '../lib/composerThreadUsage'
import type { ComposerPlusMenuToggles } from '../lib/composerPlusMenu'
import { COMPOSER_PLUS_MENU_TITLE } from '../lib/composerPlusMenu'
import { COMPOSER_PLAN_MODE_BADGE_LABEL } from '../lib/composerPlanMode'
import {
  COMPOSER_QUEUE_MESSAGE_LABEL,
  COMPOSER_STOP_LABEL,
} from '../lib/composerBusyState'
import {
  COMPOSER_VOICE_START_LABEL,
  COMPOSER_VOICE_TRANSCRIBING_LABEL,
} from '../lib/composerVoiceDictation'
import { VoiceRecordingStrip } from './VoiceRecordingStrip'
import {
  FloatingComposerQueuedMessages,
  type QueuedComposerMessage,
} from './FloatingComposerQueuedMessages'
import {
  ComposerPlusMenu,
  ComposerSlashMenu,
  ComposerFileMentionMenu,
  ComposerChangeSummary,
  ComposerFileReferenceChips,
  ComposerImageAttachmentPreview,
  ComposerGoalFloater,
  ComposerGoalPanel,
  ComposerThreadUsageFooter,
  type ComposerSlashCommandItem,
  type ComposerFileMentionItem,
} from './FloatingComposer'
import type { ComposerFileReferenceChip } from '../lib/composerFileReferences'
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
  /** Opens the context-capacity popover on mount for visual verification hooks. */
  defaultContextCapacityOpen?: boolean
  /** Model picker rendered in the toolbar end row after context controls. */
  modelChip?: ReactNode
  /** Available skills for the `/skill` picker (scoped to active project). */
  skills?: SkillSummary[]
  /** Workspace files for the `@` mention picker. */
  fileMentionCandidates?: ComposerFileReference[]
  /** When true, shows the loading spinner in the file-mention menu title row. */
  fileMentionLoading?: boolean
  /** When set, shows Kun's dictation recording strip instead of the send button. */
  voiceRecording?: {
    getLevel: () => number
    startedAtMs: number
    onStop?: () => void
    onSend?: () => void
  }
  /** Dictation error shown above the toolbar, matching Kun's composer dictation.error row. */
  dictationError?: string | null
  /** When true, mic button shows transcribing spinner and is disabled. */
  voiceTranscribing?: boolean
  /** Queued messages shown above the composer shell while a reply is streaming. */
  queuedMessages?: QueuedComposerMessage[]
  onRemoveQueuedMessage?: (id: string) => void
  /** Execution picker (approval + sandbox) rendered in the toolbar end row. */
  executionPicker?: ReactNode
  /** Footer row below the composer shell (e.g. git branch picker). */
  footerLeft?: ReactNode
  /** Changed files shown above the textarea in Kun's change-summary card. */
  changedFiles?: ComposerChangedFile[]
  /** Diff stats for the change-summary card; defaults to zeros when omitted. */
  changedStats?: { added: number; removed: number }
  /** When true, shows the Preview action button in the change-summary card. */
  changeSummaryShowOpenChanges?: boolean
  /** When true, shows the Review action button in the change-summary card. */
  changeSummaryShowReviewChanges?: boolean
  /** When true, disables the Review action button in the change-summary card. */
  changeSummaryReviewDisabled?: boolean
  /** File reference chips shown below the textarea in Kun's composer shell. */
  fileReferences?: ComposerFileReferenceChip[]
  onRemoveFileReference?: (relativePath: string) => void
  /** Image attachment previews shown below file-reference chips in Kun's composer shell. */
  attachments?: ComposerImageAttachment[]
  onRemoveAttachment?: (id: string) => void
  /** Attachment upload error shown in the attachment row, matching Kun's attachmentUploadError. */
  attachmentUploadError?: string | null
  /** Active thread goal shown in Kun's goal floater and panel overlays. */
  goal?: ComposerGoal | null
  /** When true, shows the goal floater banner above the composer shell. */
  showGoalFloater?: boolean
  /** When true, shows the goal panel overlay above the composer shell. */
  showGoalPanel?: boolean
  /** When true, shows the Goal badge beside the plus button in the toolbar. */
  goalBadge?: boolean
  /** When true, shows the Plan mode badge beside the plus button in the toolbar. */
  planBadge?: boolean
  /** Session usage chip shown in the composer footer beside project/branch pickers. */
  threadUsage?: ComposerThreadUsage | null
  /** When true, shows Kun's loading usage copy in the session-usage footer chip. */
  threadUsageLoading?: boolean
  /** Opens the plus menu on mount for visual verification hooks. */
  defaultPlusMenuOpen?: boolean
  /** Toggle states for Kun's composer plus menu rows. */
  plusMenuToggles?: ComposerPlusMenuToggles
  /** When true, shows Loader2 on the plus menu Attach image row. */
  plusMenuAttachmentUploadBusy?: boolean
  /** When false, hides the Attach image row like Kun when attachmentUploadEnabled is false. */
  plusMenuShowAddImage?: boolean
  /** When false, hides the Worktree mode row like Kun when canToggleWorktreeMode is false. */
  plusMenuShowWorktreeMode?: boolean
  /** Footer hint shown beside project/branch pickers (e.g. slash or worktree copy). */
  footerHint?: string | null
  /** When set, shows Kun's slash-command overlay with these rows instead of skill filtering. */
  slashCommandsOverride?: ComposerSlashCommandItem[]
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
  defaultContextCapacityOpen = false,
  modelChip,
  skills,
  fileMentionCandidates,
  fileMentionLoading = false,
  voiceRecording,
  dictationError,
  voiceTranscribing = false,
  queuedMessages,
  onRemoveQueuedMessage,
  executionPicker,
  footerLeft,
  changedFiles,
  changedStats,
  changeSummaryShowOpenChanges = false,
  changeSummaryShowReviewChanges = false,
  changeSummaryReviewDisabled = false,
  fileReferences,
  onRemoveFileReference,
  attachments,
  onRemoveAttachment,
  attachmentUploadError,
  goal,
  showGoalFloater = false,
  showGoalPanel = false,
  goalBadge = false,
  planBadge = false,
  threadUsage,
  threadUsageLoading = false,
  defaultPlusMenuOpen = false,
  plusMenuToggles,
  plusMenuAttachmentUploadBusy = false,
  plusMenuShowAddImage = true,
  plusMenuShowWorktreeMode = true,
  footerHint,
  slashCommandsOverride,
}: ComposerProps) {
  const compact = variant === 'compact'
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const contextCapacityRef = useRef<HTMLDivElement>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [plusMenuOpen, setPlusMenuOpen] = useState(defaultPlusMenuOpen)
  const [contextCapacityOpen, setContextCapacityOpen] = useState(defaultContextCapacityOpen)
  const [slashActiveIndex, setSlashActiveIndex] = useState(0)
  const [fileMentionActiveIndex, setFileMentionActiveIndex] = useState(0)
  const [cursor, setCursor] = useState(0)
  const plusMenuRef = useRef<HTMLDivElement>(null)
  const slashMenuRef = useRef<HTMLDivElement>(null)
  const fileMentionMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    syncCursor()
  }, [])

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

  const syncCursor = () => {
    const el = textareaRef.current
    if (!el) return
    setCursor(el.selectionStart ?? value.length)
  }

  // The picker is active when there's a leading /query and skills are provided.
  const query = useMemo(() => {
    if (slashCommandsOverride) {
      return value.startsWith('/') ? value.slice(1) : null
    }
    return skills && skills.length > 0 ? skillQuery(value) : null
  }, [value, skills, slashCommandsOverride])

  const activeFileMention = useMemo(() => {
    if (query !== null) return null
    return getFileMentionAtCursor(value, cursor)
  }, [value, cursor, query])

  const fileMentionOpen =
    activeFileMention !== null && fileMentionCandidates !== undefined

  const fileMentionSuggestions = useMemo((): ComposerFileReference[] => {
    if (!activeFileMention || !fileMentionCandidates) return []
    return filterWorkspaceFileMentionSuggestions(
      fileMentionCandidates,
      activeFileMention.query,
    )
  }, [activeFileMention, fileMentionCandidates])

  const fileMentionItems = useMemo((): ComposerFileMentionItem[] => {
    return fileMentionSuggestions.map((reference, index) => ({
      relativePath: reference.relativePath,
      isDirectory: isComposerDirectoryReference(reference),
      active: index === fileMentionActiveIndex,
    }))
  }, [fileMentionSuggestions, fileMentionActiveIndex])

  useEffect(() => {
    if (fileMentionOpen) setPlusMenuOpen(false)
  }, [fileMentionOpen])

  useEffect(() => {
    setFileMentionActiveIndex(0)
  }, [fileMentionSuggestions.length, activeFileMention?.query])

  useEffect(() => {
    if (!fileMentionOpen) return
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target
      if (target instanceof Node && fileMentionMenuRef.current?.contains(target)) return
      textareaRef.current?.focus()
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [fileMentionOpen])

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

  const slashCommands = useMemo((): ComposerSlashCommandItem[] => {
    if (slashCommandsOverride) {
      return slashCommandsOverride.map((command, index) => ({
        ...command,
        active: index === slashActiveIndex,
      }))
    }
    if (query === null || !skills) return []
    return filterSkillSlashCommands(skills, query).map((command, index) => ({
      ...command,
      icon: <Sparkles strokeWidth={1.9} />,
      active: index === slashActiveIndex,
    }))
  }, [slashCommandsOverride, query, skills, slashActiveIndex])

  useEffect(() => {
    if (slashCommandsOverride) {
      setPickerOpen(value.startsWith('/'))
      return
    }
    setPickerOpen(query !== null)
  }, [query, slashCommandsOverride, value])

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

  const pickFileMention = (item: ComposerFileMentionItem) => {
    if (!activeFileMention) return
    const reference = fileMentionSuggestions.find(
      (entry) => entry.relativePath === item.relativePath,
    )
    if (!reference) return
    const next = replaceFileMentionInInput(value, activeFileMention, reference)
    onChange(next.input)
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      el.setSelectionRange(next.cursor, next.cursor)
      setCursor(next.cursor)
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
    if (!pickerOpen && !fileMentionOpen) return
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (pickerOpen) closeSlashMenu()
        return
      }
      if (fileMentionOpen && fileMentionItems.length > 0) {
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          setFileMentionActiveIndex((index) =>
            Math.min(index + 1, fileMentionItems.length - 1),
          )
          return
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault()
          setFileMentionActiveIndex((index) => Math.max(index - 1, 0))
          return
        }
        if (event.key === 'Enter' && fileMentionItems[fileMentionActiveIndex]) {
          event.preventDefault()
          pickFileMention(fileMentionItems[fileMentionActiveIndex])
          return
        }
      }
      if (!pickerOpen || slashCommands.length === 0) return
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
  }, [
    pickerOpen,
    fileMentionOpen,
    slashCommands,
    slashActiveIndex,
    fileMentionItems,
    fileMentionActiveIndex,
    value,
    skills,
    onChange,
  ])

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    // Let overlay menus handle Arrow/Enter/Escape while open.
    if (
      (pickerOpen || fileMentionOpen) &&
      (e.key === 'Escape' ||
        (e.key === 'Enter' &&
          ((pickerOpen && slashCommands.length > 0) ||
            (fileMentionOpen && fileMentionItems.length > 0))) ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowUp')
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
        {!compact && showGoalFloater && goal ? (
          <ComposerGoalFloater goal={goal} />
        ) : null}
        {!compact && plusMenuOpen && query === null && !showGoalPanel ? (
          <div ref={plusMenuRef}>
            <ComposerPlusMenu
              planMode={plusMenuToggles?.planMode}
              goalActive={plusMenuToggles?.goalActive}
              worktreeMode={plusMenuToggles?.worktreeMode}
              showAddImage={plusMenuShowAddImage}
              showWorktreeMode={plusMenuShowWorktreeMode}
              attachmentUploadBusy={plusMenuAttachmentUploadBusy}
            />
          </div>
        ) : null}
        {!compact && pickerOpen && (slashCommandsOverride || query !== null) ? (
          <div ref={slashMenuRef}>
            <ComposerSlashMenu
              commands={slashCommands}
              onPick={slashCommandsOverride ? undefined : pickSlashCommand}
              onHover={setSlashActiveIndex}
              emptyMessage={
                slashCommandsOverride
                  ? 'No matching command. Keep typing to send the raw text instead.'
                  : query?.trim()
                    ? `No skills match “${query.trim()}”.`
                    : 'No skills available.'
              }
            />
          </div>
        ) : null}
        {!compact && fileMentionOpen ? (
          <div ref={fileMentionMenuRef}>
            <ComposerFileMentionMenu
              items={fileMentionItems}
              loading={fileMentionLoading}
              onPick={pickFileMention}
              onHover={setFileMentionActiveIndex}
            />
          </div>
        ) : null}
        {!compact && showGoalPanel ? (
          <ComposerGoalPanel goal={goal ?? null} />
        ) : null}
        <div className={shellClass}>
          {!compact && changedFiles && changedFiles.length > 0 ? (
            <ComposerChangeSummary
              files={changedFiles}
              stats={changedStats ?? { added: 0, removed: 0 }}
              showOpenChanges={changeSummaryShowOpenChanges}
              showReviewChanges={changeSummaryShowReviewChanges}
              reviewChangesDisabled={changeSummaryReviewDisabled}
            />
          ) : null}
          <textarea
            ref={textareaRef}
            rows={1}
            className={`floating-composer-textarea${compact ? ' is-compact' : ''}`}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            aria-label="Message"
            onChange={(e) => {
              onChange(e.target.value)
              setCursor(e.target.selectionStart ?? e.target.value.length)
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={syncCursor}
            onClick={syncCursor}
            onSelect={syncCursor}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {!compact && fileReferences && fileReferences.length > 0 ? (
            <ComposerFileReferenceChips
              references={fileReferences}
              onRemove={onRemoveFileReference}
            />
          ) : null}
          {!compact &&
          ((attachments && attachments.length > 0) || attachmentUploadError) ? (
            <div className="floating-composer-attachment-row">
              {attachments?.map((attachment) => (
                <ComposerImageAttachmentPreview
                  key={attachment.id}
                  attachment={attachment}
                  onRemoveAttachment={onRemoveAttachment}
                />
              ))}
              {attachmentUploadError ? (
                <span className="floating-composer-attachment-error">
                  {attachmentUploadError}
                </span>
              ) : null}
            </div>
          ) : null}
          {!compact && dictationError ? (
            <div className="floating-composer-dictation-error">
              <span>{dictationError}</span>
            </div>
          ) : null}
          <div className={toolbarClass}>
            {!compact ? (
              <div className="floating-composer-toolbar-start">
                <button
                  type="button"
                  className={`floating-composer-plus-btn${plusMenuOpen ? ' is-open' : ''}`}
                  aria-label={COMPOSER_PLUS_MENU_TITLE}
                  title={COMPOSER_PLUS_MENU_TITLE}
                  aria-expanded={plusMenuOpen}
                  disabled={disabled}
                  onClick={() => setPlusMenuOpen((open) => !open)}
                >
                  <Plus strokeWidth={1.8} />
                </button>
                {planBadge ? (
                  <span className="floating-composer-mode-badge">
                    <ListTodo strokeWidth={1.9} />
                    <span>{COMPOSER_PLAN_MODE_BADGE_LABEL}</span>
                  </span>
                ) : null}
                {goalBadge ? (
                  <span className="floating-composer-mode-badge">
                    <Target strokeWidth={1.9} />
                    <span>Goal</span>
                  </span>
                ) : null}
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
                      aria-label={
                        voiceTranscribing
                          ? COMPOSER_VOICE_TRANSCRIBING_LABEL
                          : COMPOSER_VOICE_START_LABEL
                      }
                      title={
                        voiceTranscribing
                          ? COMPOSER_VOICE_TRANSCRIBING_LABEL
                          : COMPOSER_VOICE_START_LABEL
                      }
                      disabled={disabled || voiceTranscribing}
                    >
                      {voiceTranscribing ? (
                        <Loader2 strokeWidth={2.2} className="floating-composer-mic-spinner" />
                      ) : (
                        <Mic strokeWidth={2} />
                      )}
                    </button>
                  ) : null}
                  {busy ? (
                    <button
                      type="button"
                      className="floating-composer-stop-btn"
                      onClick={onCancel}
                      aria-label={COMPOSER_STOP_LABEL}
                      title={COMPOSER_STOP_LABEL}
                    >
                      <Square strokeWidth={2.4} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="floating-composer-send-btn"
                    disabled={!canSend}
                    onClick={onSend}
                    aria-label={busy ? COMPOSER_QUEUE_MESSAGE_LABEL : 'Send'}
                    title={busy ? COMPOSER_QUEUE_MESSAGE_LABEL : 'Send'}
                  >
                    <Send strokeWidth={2.2} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {!compact && (footerLeft || threadUsage !== undefined || threadUsageLoading || footerHint) ? (
        <div className="ds-composer-footer floating-composer-footer">
          <div className="ds-composer-footer-left">
            {footerLeft}
            {threadUsage !== undefined || threadUsageLoading ? (
              <ComposerThreadUsageFooter usage={threadUsage ?? null} loading={threadUsageLoading} />
            ) : null}
          </div>
          {footerHint ? (
            <div className="ds-composer-footer-hint">
              <span>{footerHint}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )

  if (compact) return composerBody
  return <div className="composer-wrap">{composerBody}</div>
}
