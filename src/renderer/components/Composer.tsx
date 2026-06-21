// Floating composer echoing Kun's chat composer: a rounded frosted shell with
// a textarea, a plus menu + model chip on the left, and a circular send button
// on the right. Controlled by the parent; sends on Enter (Shift+Enter for a
// newline) and turns into a stop button while a reply is streaming.
//
// Also hosts the `/skill` picker (plan §D4 / §D6): when the draft is a single
// leading `/`-token (e.g. "/com"), a floating menu of available skills filters
// live. Picking one replaces the token with a "use the X skill" hint — a
// front-end shortcut only, never a backend trigger.

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Plus, ArrowUp, Square } from 'lucide-react'
import { SkillPicker } from './SkillPicker'
import type { SkillSummary } from '../../shared/flue'

interface ComposerProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onCancel?: () => void
  busy?: boolean
  disabled?: boolean
  placeholder?: string
  /** Model picker rendered in the toolbar (replaces the old static model chip). */
  modelChip?: ReactNode
  /** Available skills for the `/skill` picker (scoped to active project). */
  skills?: SkillSummary[]
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
  placeholder = 'Send a message to Navi…',
  modelChip,
  skills,
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

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
  useEffect(() => {
    setPickerOpen(query !== null)
  }, [query])

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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Let the SkillPicker handle Arrow/Enter/Escape while it's open.
    if (pickerOpen && (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Escape')) {
      // The picker listens on window with capture; just block the textarea's
      // own Enter-send here so the picker's Enter-pick wins.
      if (e.key === 'Enter') e.preventDefault()
      return
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      if (busy) return
      if (canSend) onSend()
    }
  }

  return (
    <div className="composer-wrap">
      {pickerOpen && query !== null ? (
        <SkillPicker
          skills={skills ?? []}
          query={query}
          onPick={injectSkillHint}
          onClose={() => {
            // Closing the picker without a pick: drop the leading slash so the
            // draft doesn't keep re-triggering it. Leave the rest of the text.
            if (value.startsWith('/')) onChange(value.slice(1))
            setPickerOpen(false)
            textareaRef.current?.focus()
          }}
        />
      ) : null}
      <div className="composer">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="composer-toolbar">
          <div className="composer-toolbar-left">
            <button className="tool-btn" aria-label="Add" title="Add">
              <Plus />
            </button>
            {modelChip}
          </div>
          <div className="composer-toolbar-right">
            {busy ? (
              <button
                className="send-btn is-stop"
                onClick={onCancel}
                aria-label="Stop"
                title="Stop"
              >
                <Square />
              </button>
            ) : (
              <button
                className="send-btn"
                disabled={!canSend}
                onClick={onSend}
                aria-label="Send"
                title="Send"
              >
                <ArrowUp />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
