// Fetch-then-pick model import (Kun's provider-model-import-dialog). The probe
// returns the provider's model ids; this dialog lets the user search and pick
// which to merge into the profile — pre-selecting only ids that aren't already
// configured. We never dump the whole catalog blindly into the profile.

import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { ProviderModel } from '../../../shared/flue'

interface ProviderModelImportDialogProps {
  modelIds: string[]
  existing: ProviderModel[]
  onConfirm: (selectedIds: string[]) => void
  onClose: () => void
}

export function ProviderModelImportDialog({
  modelIds,
  existing,
  onConfirm,
  onClose,
}: ProviderModelImportDialogProps) {
  const existingIds = useMemo(() => new Set(existing.map((m) => m.id)), [existing])
  const [query, setQuery] = useState('')
  // Pre-select the ids that are NOT already configured (the new ones).
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(modelIds.filter((id) => !existingIds.has(id))),
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const ids = q ? modelIds.filter((id) => id.toLowerCase().includes(q)) : modelIds
    return [...ids].sort()
  }, [modelIds, query])

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const confirm = () => onConfirm([...selected])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card import-dialog" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <div className="modal-title">Import models ({modelIds.length} found)</div>
          <button className="apikey-close" onClick={onClose} aria-label="Close" title="Close">
            <X />
          </button>
        </header>

        <div className="import-search">
          <Search />
          <input
            className="apikey-input"
            placeholder="Search model ids…"
            value={query}
            autoFocus
            spellCheck={false}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <ul className="import-list">
          {filtered.length === 0 ? (
            <li className="import-empty">No matching models.</li>
          ) : (
            filtered.map((id) => {
              const already = existingIds.has(id)
              return (
                <li key={id}>
                  <label className={already ? 'import-row is-existing' : 'import-row'}>
                    <input
                      type="checkbox"
                      checked={selected.has(id)}
                      onChange={() => toggle(id)}
                    />
                    <span className="import-id">{id}</span>
                    {already ? <span className="import-tag">configured</span> : null}
                  </label>
                </li>
              )
            })
          )}
        </ul>

        <footer className="modal-foot">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={confirm} disabled={selected.size === 0}>
            Add {selected.size} model{selected.size === 1 ? '' : 's'}
          </button>
        </footer>
      </div>
    </div>
  )
}
