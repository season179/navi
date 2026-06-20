// Floating composer echoing Kun's chat composer: a rounded frosted shell with
// a textarea, a plus menu + model chip on the left, and a circular send button
// on the right. Controlled by the parent; sends on Enter (Shift+Enter for a
// newline) and turns into a stop button while a reply is streaming.

import { useEffect, useRef, type KeyboardEvent } from 'react'
import { Plus, ChevronDown, ArrowUp, Square } from 'lucide-react'
import { MODEL_LABEL } from '../../shared/flue'

interface ComposerProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onCancel?: () => void
  busy?: boolean
  disabled?: boolean
  placeholder?: string
}

export function Composer({
  value,
  onChange,
  onSend,
  onCancel,
  busy = false,
  disabled = false,
  placeholder = 'Send a message to Navi…',
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow the textarea up to its CSS max-height.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  const canSend = !disabled && value.trim().length > 0

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      if (busy) return
      if (canSend) onSend()
    }
  }

  return (
    <div className="composer-wrap">
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
            <button className="model-chip" aria-label="Model">
              {MODEL_LABEL}
              <ChevronDown />
            </button>
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
