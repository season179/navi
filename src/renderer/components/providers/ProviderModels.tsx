// Per-provider model list editor, shown inside the provider detail pane. Lists
// configured models with a capability badge + remove control, and an add row.
// Context-window / max-tokens fields are only meaningful for non-catalog (or
// otherwise unknown) snapshots — for catalog ids the real values come from the
// pi-ai catalog (§F5), so we hide those fields there.

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { ProviderModel } from '../../../shared/flue'
import { ModelCapabilityBadge } from '../ModelCapabilityBadge'

interface ProviderModelsProps {
  models: ProviderModel[]
  /** Catalog ids hide context/maxTokens fields (the catalog owns those values). */
  catalog: boolean
  onChange: (models: ProviderModel[]) => void
}

export function ProviderModels({ models, catalog, onChange }: ProviderModelsProps) {
  const [id, setId] = useState('')
  const [vision, setVision] = useState(false)

  const addModel = () => {
    const trimmed = id.trim()
    if (!trimmed || models.some((m) => m.id === trimmed)) return
    onChange([...models, { id: trimmed, ...(vision ? { vision: true } : {}) }])
    setId('')
    setVision(false)
  }

  const removeModel = (target: string) => onChange(models.filter((m) => m.id !== target))

  return (
    <div className="provider-models">
      {models.length === 0 ? (
        <div className="provider-models-empty">
          No models yet. Add one below{!catalog ? '' : ', or fetch the provider’s list'}.
        </div>
      ) : (
        <ul className="provider-models-list">
          {models.map((m) => (
            <li key={m.id} className="provider-model-row">
              <span className="provider-model-id">{m.label ?? m.id}</span>
              <ModelCapabilityBadge vision={m.vision} />
              <button
                className="provider-model-remove"
                onClick={() => removeModel(m.id)}
                aria-label={`Remove ${m.id}`}
                title="Remove model"
              >
                <X />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="provider-model-add">
        <input
          className="apikey-input"
          placeholder="model id (e.g. glm-5.2)"
          value={id}
          spellCheck={false}
          onChange={(e) => setId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addModel()
          }}
        />
        <label className="provider-model-vision">
          <input type="checkbox" checked={vision} onChange={(e) => setVision(e.target.checked)} />
          Vision
        </label>
        <button className="btn btn-secondary" onClick={addModel} disabled={!id.trim()}>
          <Plus />
          Add
        </button>
      </div>
    </div>
  )
}
