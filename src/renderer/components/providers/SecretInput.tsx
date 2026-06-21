// Masked API-key input with a reveal toggle. The value is held only in the
// parent's transient form state and sent to the main process to be encrypted;
// it is never persisted in the renderer. Mirrors Kun's SecretInput.

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface SecretInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
  onEnter?: () => void
}

export function SecretInput({ value, onChange, placeholder, autoFocus, onEnter }: SecretInputProps) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="secret-input">
      <input
        type={revealed ? 'text' : 'password'}
        className="apikey-input"
        placeholder={placeholder}
        value={value}
        autoFocus={autoFocus}
        spellCheck={false}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onEnter?.()
        }}
      />
      <button
        type="button"
        className="secret-reveal"
        onClick={() => setRevealed((v) => !v)}
        aria-label={revealed ? 'Hide key' : 'Reveal key'}
        title={revealed ? 'Hide key' : 'Reveal key'}
      >
        {revealed ? <EyeOff /> : <Eye />}
      </button>
    </div>
  )
}
