// Masked API-key input with a reveal toggle. The value is held only in the
// parent's transient form state and sent to the main process to be encrypted;
// it is never persisted in the renderer. Visual styling matches Kun's SecretInput
// from settings-controls.tsx (../Kun/src/renderer/src/components/settings-controls.tsx).

import { useState, type ReactElement } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface SecretInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
  onEnter?: () => void
  invalid?: boolean
}

export function SecretInput({
  value,
  onChange,
  placeholder,
  autoFocus,
  onEnter,
  invalid = false,
}: SecretInputProps): ReactElement {
  const [visible, setVisible] = useState(false)

  return (
    <div className={`settings-secret-input ${invalid ? 'is-invalid' : ''}`.trim()}>
      <input
        type={visible ? 'text' : 'password'}
        autoComplete="off"
        placeholder={placeholder}
        className="settings-secret-input-field"
        value={value}
        autoFocus={autoFocus}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onEnter?.()
        }}
      />
      <button
        type="button"
        aria-label={visible ? 'Hide key' : 'Show key'}
        title={visible ? 'Hide key' : 'Show key'}
        onClick={() => setVisible((v) => !v)}
        className="settings-secret-input-toggle"
      >
        {visible ? (
          <EyeOff className="settings-secret-input-icon" strokeWidth={1.75} />
        ) : (
          <Eye className="settings-secret-input-icon" strokeWidth={1.75} />
        )}
      </button>
    </div>
  )
}

export type SecretInputPreviewMode = 'default' | 'invalid' | 'filled'

/** Full-screen preview shell for ?secretInputPreview URL hooks. */
export function SecretInputPreview({
  mode = 'default',
}: {
  mode?: SecretInputPreviewMode
}): ReactElement {
  const [value, setValue] = useState(() => {
    if (mode === 'filled') return 'sk-local-dev-token-preview'
    return ''
  })

  return (
    <div className="secret-input-preview-wrap">
      <div className="secret-input-preview-card">
        <label className="secret-input-preview-label">
          API key
          <SecretInput
            value={value}
            onChange={setValue}
            placeholder="sk-…"
            invalid={mode === 'invalid'}
          />
        </label>
      </div>
    </div>
  )
}
