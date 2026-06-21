// Kun settings-section-providers.tsx ModelChipsInput visual port
// (../Kun/src/renderer/src/components/settings-section-providers.tsx).
// Visual only: chip input for capability model IDs.

import { useState, type ReactElement } from 'react'
import { X } from 'lucide-react'

type Props = {
  values: string[]
  onChange: (next: string[]) => void
  placeholder: string
  inputAriaLabel: string
  removeLabel: (model: string) => string
}

export function ModelChipsInput({
  values,
  onChange,
  placeholder,
  inputAriaLabel,
  removeLabel,
}: Props): ReactElement {
  const [draft, setDraft] = useState('')

  const commit = (raw: string): void => {
    const ids = raw
      .split(/[\s,]+/)
      .map((item) => item.trim())
      .filter(Boolean)
    setDraft('')
    if (ids.length === 0) return
    const seen = new Set(values)
    const next = [...values]
    for (const id of ids) {
      if (seen.has(id)) continue
      seen.add(id)
      next.push(id)
    }
    if (next.length !== values.length) onChange(next)
  }

  const removeAt = (index: number): void => {
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div className="model-chips-input">
      {values.map((model, index) => (
        <span key={`${model}-${index}`} className="model-chips-input-chip">
          <span className="model-chips-input-chip-label">{model}</span>
          <button
            type="button"
            aria-label={removeLabel(model)}
            onClick={() => removeAt(index)}
            className="model-chips-input-chip-remove"
          >
            <X className="model-chips-input-chip-remove-icon" strokeWidth={2} />
          </button>
        </span>
      ))}
      <input
        className="model-chips-input-field"
        value={draft}
        placeholder={placeholder}
        aria-label={inputAriaLabel}
        spellCheck={false}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            commit(draft)
          } else if (e.key === 'Backspace' && !draft && values.length > 0) {
            e.preventDefault()
            removeAt(values.length - 1)
          }
        }}
        onBlur={() => commit(draft)}
        onPaste={(e) => {
          const text = e.clipboardData.getData('text')
          if (/[\s,]/.test(text)) {
            e.preventDefault()
            commit(`${draft} ${text}`)
          }
        }}
      />
    </div>
  )
}

export type ModelChipsInputPreviewMode = 'default' | 'empty' | 'many'

const PREVIEW_DEFAULT = ['dall-e-3', 'gpt-image-1']
const PREVIEW_MANY = [
  'dall-e-3',
  'gpt-image-1',
  'flux-1.1-pro',
  'stable-diffusion-xl',
  'midjourney-v6',
  'imagen-3',
]

/** Full-screen preview shell for ?modelChipsInputPreview URL hooks. */
export function ModelChipsInputPreview({
  mode = 'default',
}: {
  mode?: ModelChipsInputPreviewMode
}): ReactElement {
  const [values, setValues] = useState<string[]>(() => {
    if (mode === 'empty') return []
    if (mode === 'many') return PREVIEW_MANY
    return PREVIEW_DEFAULT
  })

  return (
    <div className="model-chips-input-preview-wrap">
      <div className="model-chips-input-preview-card">
        <label className="model-chips-input-preview-label">
          Image generation models
          <ModelChipsInput
            values={values}
            onChange={setValues}
            placeholder="Type a model ID and press Enter"
            inputAriaLabel="Image generation models"
            removeLabel={(model) => `Remove ${model}`}
          />
        </label>
      </div>
    </div>
  )
}
