// Copy-to-clipboard button with success/error feedback echoing Kun's CopyFeedbackButton
// (../Kun/src/renderer/src/components/chat/message-timeline-bubbles.tsx).
// Visual only: parent supplies the text to copy.

import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState, type ReactElement } from 'react'

const COPY_FEEDBACK_RESET_MS = 1600

export const COPY_FEEDBACK_BUTTON_PREVIEW_TEXT =
  'Can you refactor the auth middleware to use JWT validation?'

type CopyStatus = 'idle' | 'success' | 'error'

type Props = {
  text: string
  iconOnly?: boolean
  /** Visual-only override for ?copyFeedbackButton=success|error preview hooks. */
  forceStatus?: CopyStatus
}

export function CopyFeedbackButton({
  text,
  iconOnly = false,
  forceStatus,
}: Props): ReactElement {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const resetRef = useRef<number | null>(null)
  const effectiveStatus = forceStatus ?? status

  useEffect(
    () => () => {
      if (resetRef.current !== null) window.clearTimeout(resetRef.current)
    },
    [],
  )

  const scheduleReset = (): void => {
    if (resetRef.current !== null) window.clearTimeout(resetRef.current)
    resetRef.current = window.setTimeout(() => {
      setStatus('idle')
      resetRef.current = null
    }, COPY_FEEDBACK_RESET_MS)
  }

  const handleCopy = async (): Promise<void> => {
    if (forceStatus) return
    try {
      if (!navigator?.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(text)
      setStatus('success')
    } catch {
      setStatus('error')
    }
    scheduleReset()
  }

  const success = effectiveStatus === 'success'
  const error = effectiveStatus === 'error'
  const label = success ? 'Copied' : error ? 'Copy failed' : 'Copy message'

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      title={label}
      aria-label={label}
      className={`copy-feedback-button${iconOnly ? ' is-icon-only' : ''}${
        success ? ' is-success' : error ? ' is-error' : ' is-idle'
      }`}
    >
      {success ? (
        <Check
          className={`copy-feedback-button-icon${iconOnly ? ' is-large' : ' is-small'}`}
          strokeWidth={2}
        />
      ) : (
        <Copy
          className={`copy-feedback-button-icon${iconOnly ? ' is-large' : ' is-small'}`}
          strokeWidth={1.8}
        />
      )}
      {!iconOnly ? <span>{label}</span> : null}
    </button>
  )
}
