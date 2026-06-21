// Create/edit form for a user-global skill (plan §D6). Name + description +
// body, with live validation that mirrors the spec rules (and rejects the
// reserved `navi-*` prefix per §D7). On a project or built-in skill this
// component is never mounted — it's global-only.

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { SkillDraft } from '../../../shared/flue'
// Name validation (incl. the reserved `navi-*` prefix, §D7) is shared with the
// main-process write guard so the rules + messages can't drift.
import { validateSkillName } from '../../../shared/skill-md'

interface SkillEditorProps {
  /** Present when editing an existing global skill; absent when creating. */
  initial?: { name: string; description: string; body: string }
  /** Called with the draft on save. Resolve {ok} to close; {ok:false,error} to stay. */
  onSave: (draft: SkillDraft) => Promise<{ ok: boolean; error?: string }>
  onCancel: () => void
}

function validateDescription(desc: string): string | null {
  const trimmed = desc.trim()
  if (!trimmed) return 'Description is required.'
  if (trimmed.length > 1024) return 'Description must be 1024 characters or fewer.'
  return null
}

export function SkillEditor({ initial, onSave, onCancel }: SkillEditorProps) {
  const isEdit = !!initial
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Track blur so we only surface name errors after the user has interacted.
  const [nameTouched, setNameTouched] = useState(false)
  const [descTouched, setDescTouched] = useState(false)

  const nameError = validateSkillName(name)
  const descError = validateDescription(description)
  const canSave = !nameError && !descError && !busy

  const handleSave = async () => {
    setNameTouched(true)
    setDescTouched(true)
    if (nameError || descError) {
      setError(nameError || descError)
      return
    }
    setBusy(true)
    setError(null)
    const res = await onSave({ name: name.trim(), description: description.trim(), body })
    setBusy(false)
    if (!res.ok) setError(res.error ?? 'Could not save skill.')
  }

  return (
    <div className="skill-editor">
      <div className="skill-editor-head">
        <div className="skill-editor-title">{isEdit ? `Edit ${initial!.name}` : 'New global skill'}</div>
        <button className="apikey-close" onClick={onCancel} aria-label="Cancel" title="Cancel">
          ✕
        </button>
      </div>

      <label className="field">
        <span className="field-label">
          Name
          {isEdit ? <span className="field-hint">(fixed — the directory name)</span> : null}
        </span>
        <input
          className="apikey-input"
          value={name}
          disabled={isEdit}
          onChange={(e) => setName(e.target.value.toLowerCase())}
          onBlur={() => setNameTouched(true)}
          placeholder="my-skill"
          spellCheck={false}
        />
        {nameTouched && nameError ? <span className="field-error">{nameError}</span> : null}
      </label>

      <label className="field">
        <span className="field-label">
          Description
          <span className="field-hint">({description.trim().length}/1024)</span>
        </span>
        <input
          className="apikey-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => setDescTouched(true)}
          placeholder="What this skill does and when to use it"
        />
        {descTouched && descError ? <span className="field-error">{descError}</span> : null}
      </label>

      <label className="field">
        <span className="field-label">Instructions</span>
        <textarea
          className="apikey-input skill-body-input"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={'# My skill\n\nSteps the agent should follow when this skill activates…'}
          spellCheck={false}
        />
      </label>

      {error ? <div className="apikey-error">{error}</div> : null}

      <div className="provider-footer">
        <button className="btn btn-primary" onClick={handleSave} disabled={!canSave}>
          {busy ? <Loader2 className="spin" /> : null}
          {isEdit ? 'Save changes' : 'Create skill'}
        </button>
        <button className="btn btn-secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </div>
  )
}
