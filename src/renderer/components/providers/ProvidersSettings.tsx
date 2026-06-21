// Provider settings: a master/detail surface replicating Kun's provider flow.
// Left: provider cards with model count + Kun-style status pills ("In use" /
// "No API key" / "Key unreadable" / "Unsaved"). Top: an "Add provider" dropdown
// listing presets + Custom. Right: a draft-before-commit detail pane (name / id
// / base URL / key / Test connection / models).
//
// Status pills mirror Kun's badge semantics (settings-section-providers.tsx):
// green "In use" = this is the app's active/default provider — NOT a
// connection-verified or key-stored signal; amber "No API key" flags what's
// actually missing. A provider that simply has a stored key but isn't the
// default shows no pill (so nothing reads as a misleading "ready" green).
// Connection results live only in the detail pane (Test connection), never as a
// list badge — again matching Kun. (navi adds "Key unreadable" for its
// encrypted key-store, which Kun has no equivalent for.)
//
// Secrets never live in renderer state beyond the transient key field; the key
// is sent to main, encrypted, and never echoed back. Saving a provider restarts
// the backend (registerProvider is boot-only), so a brief "reconnecting" state
// is expected (§F7).

import { useState } from 'react'
import { Plus, X, Check, Loader2, Trash2, Wifi, Download } from 'lucide-react'
import type {
  DefaultSelection,
  ProbeResult,
  ProviderFingerprint,
  ProviderModel,
  ProviderProfile,
  ProviderStatus,
} from '../../../shared/flue'
import { findPreset, PROVIDER_ID_RE, PROVIDER_PRESETS } from '../../../shared/provider-presets'
import { SecretInput } from './SecretInput'
import { ProviderModels } from './ProviderModels'
import { ProviderModelImportDialog } from './ProviderModelImportDialog'

interface ProbeReq {
  baseUrl?: string
  apiKey: string
  id?: string
}

interface ProvidersSettingsProps {
  providers: ProviderProfile[]
  statuses: ProviderStatus[]
  ready: boolean
  defaultSelection?: DefaultSelection
  onUpsert: (profile: ProviderProfile, apiKey?: string) => Promise<{ ok: boolean; error?: string }>
  onDelete: (id: string) => Promise<{ ok: boolean; error?: string }>
  onSetDefault: (sel: DefaultSelection) => Promise<void>
  onProbe: (req: ProbeReq) => Promise<ProbeResult>
  onClose: () => void
}

const DRAFT = '__draft__'

function isCatalog(id: string): boolean {
  return findPreset(id)?.catalog ?? false
}

/** Effective base URL to probe: explicit > preset default > OpenAI fallback. */
function effectiveBaseUrl(form: ProviderProfile): string | undefined {
  const explicit = form.baseUrl?.trim()
  if (explicit) return explicit
  const preset = findPreset(form.id)?.defaultBaseUrl
  if (preset) return preset
  return form.id === 'openai' ? 'https://api.openai.com' : undefined
}

/**
 * Renderer-safe freshness fingerprint (§F2): NO secret. Probe results are shown
 * only while this is unchanged, so editing the base URL / models / clearing the
 * key forces a re-probe. Key presence (not the value) participates.
 */
function fingerprint(form: ProviderProfile, hasKeyInput: boolean): ProviderFingerprint {
  const modelsHash = form.models.map((m) => m.id).join(',')
  return [form.id, form.baseUrl ?? '', form.api, modelsHash, hasKeyInput ? '1' : '0'].join('\0')
}

type Badge = { label: string; tone: 'success' | 'warning' }

/**
 * Status pills for a saved provider, mirroring Kun's independent-conditional
 * badges. "In use" = it's the app's default provider; the key-state warnings
 * flag missing/unreadable keys. A keyed, non-default provider yields none.
 */
function providerBadges(keyState: ProviderStatus['keyState'], inUse: boolean): Badge[] {
  const badges: Badge[] = []
  if (inUse) badges.push({ label: 'In use', tone: 'success' })
  if (keyState === 'absent') badges.push({ label: 'No API key', tone: 'warning' })
  if (keyState === 'unreadable') badges.push({ label: 'Key unreadable', tone: 'warning' })
  return badges
}

export function ProvidersSettings({
  providers,
  statuses,
  ready,
  defaultSelection,
  onUpsert,
  onDelete,
  onSetDefault,
  onProbe,
  onClose,
}: ProvidersSettingsProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [form, setForm] = useState<ProviderProfile | null>(null)
  const [isDraft, setIsDraft] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [probe, setProbe] = useState<ProbeResult | null>(null)
  const [probedFp, setProbedFp] = useState<ProviderFingerprint | null>(null)
  const [probing, setProbing] = useState(false)
  const [importIds, setImportIds] = useState<string[] | null>(null)
  const [importing, setImporting] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  const statusFor = (id: string) => statuses.find((s) => s.id === id)

  const editExisting = (p: ProviderProfile) => {
    setSelected(p.id)
    setForm({ ...p, models: p.models.map((m) => ({ ...m })) })
    setIsDraft(false)
    setKeyInput('')
    setError(null)
    setProbe(null)
  }

  const startPreset = (presetId: string) => {
    setAddOpen(false)
    const existing = providers.find((p) => p.id === presetId)
    if (existing) return editExisting(existing)
    const preset = findPreset(presetId)
    if (!preset) return
    setSelected(DRAFT)
    setForm({
      id: preset.id,
      name: preset.name,
      api: preset.api,
      baseUrl: preset.defaultBaseUrl,
      models: preset.defaultModels.map((m) => ({ ...m })),
    })
    setIsDraft(true)
    setKeyInput('')
    setError(null)
    setProbe(null)
  }

  const startCustom = () => {
    setAddOpen(false)
    setSelected(DRAFT)
    setForm({ id: '', name: '', api: 'openai-completions', baseUrl: '', models: [] })
    setIsDraft(true)
    setKeyInput('')
    setError(null)
    setProbe(null)
  }

  const patch = (p: Partial<ProviderProfile>) => setForm((f) => (f ? { ...f, ...p } : f))

  const validate = (f: ProviderProfile): string | null => {
    if (!f.name.trim()) return 'Name is required.'
    if (!PROVIDER_ID_RE.test(f.id)) return 'Provider id must be lowercase letters, digits, and hyphens.'
    if (!isCatalog(f.id) && !f.baseUrl?.trim()) {
      return 'A base URL is required for non-catalog providers.'
    }
    return null
  }

  const handleSave = async () => {
    if (!form) return
    const v = validate(form)
    if (v) {
      setError(v)
      return
    }
    setBusy(true)
    setError(null)
    const normalized: ProviderProfile = {
      ...form,
      name: form.name.trim(),
      id: form.id.trim(),
      baseUrl: form.baseUrl?.trim() || undefined,
    }
    const res = await onUpsert(normalized, keyInput.trim() || undefined)
    setBusy(false)
    if (!res.ok) {
      setError(res.error ?? 'Could not save provider.')
      return
    }
    // First configured provider with a model becomes the app default.
    if (!defaultSelection && normalized.models.length > 0) {
      await onSetDefault({ providerId: normalized.id, modelId: normalized.models[0].id, reasoning: 'medium' })
    }
    setIsDraft(false)
    setSelected(normalized.id)
    setKeyInput('')
  }

  const handleDelete = async () => {
    if (!form || isDraft) return
    setBusy(true)
    const res = await onDelete(form.id)
    setBusy(false)
    if (!res.ok) {
      setError(res.error ?? 'Could not delete provider.')
      return
    }
    setForm(null)
    setSelected(null)
  }

  const handleTest = async () => {
    if (!form) return
    setProbing(true)
    setProbe(null)
    const fp = fingerprint(form, !!keyInput.trim())
    const result = await onProbe({
      baseUrl: effectiveBaseUrl(form),
      apiKey: keyInput.trim(),
      id: isDraft ? undefined : form.id,
    })
    setProbing(false)
    setProbe(result)
    setProbedFp(fp)
  }

  const handleFetch = async () => {
    if (!form) return
    setImporting(true)
    setProbe(null)
    const result = await onProbe({
      baseUrl: effectiveBaseUrl(form),
      apiKey: keyInput.trim(),
      id: isDraft ? undefined : form.id,
    })
    setImporting(false)
    if (result.ok) setImportIds(result.modelIds)
    else {
      setProbe(result)
      setProbedFp(fingerprint(form, !!keyInput.trim()))
    }
  }

  const mergeImport = (ids: string[]) => {
    if (!form) return
    const have = new Set(form.models.map((m) => m.id))
    const added = ids.filter((id) => !have.has(id)).map((id) => ({ id }))
    patch({ models: [...form.models, ...added] })
    setImportIds(null)
  }

  const setModels = (models: ProviderModel[]) => patch({ models })

  // Probe result is shown only while the form fingerprint matches the one it was
  // probed against — any edit since then makes it stale (§F2).
  const probeFresh = !!form && probe !== null && probedFp === fingerprint(form, !!keyInput.trim())

  return (
    <div className="providers-panel">
      <header className="providers-head">
        <div className="providers-title">
          Providers
          {!ready ? <span className="providers-reconnecting">reconnecting…</span> : null}
        </div>
        <div className="providers-head-actions">
          <div className="add-provider">
            <button className="btn btn-secondary" onClick={() => setAddOpen((v) => !v)}>
              <Plus />
              Add provider
            </button>
            {addOpen ? (
              <div className="add-provider-menu" role="menu">
                {PROVIDER_PRESETS.map((p) => (
                  <button key={p.id} role="menuitem" onClick={() => startPreset(p.id)}>
                    {p.name}
                  </button>
                ))}
                <button role="menuitem" onClick={startCustom}>
                  Custom…
                </button>
              </div>
            ) : null}
          </div>
          <button className="apikey-close" onClick={onClose} aria-label="Close" title="Close">
            <X />
          </button>
        </div>
      </header>

      <div className="providers-body">
        <aside className="providers-list">
          {providers.length === 0 && !isDraft ? (
            <div className="providers-list-empty">No providers yet. Add one to start.</div>
          ) : null}
          {providers.map((p) => {
            const keyState = statusFor(p.id)?.keyState ?? 'absent'
            const badges = providerBadges(keyState, defaultSelection?.providerId === p.id)
            return (
              <button
                key={p.id}
                className={selected === p.id ? 'provider-card is-active' : 'provider-card'}
                onClick={() => editExisting(p)}
              >
                <div className="provider-card-head">
                  <span className="provider-card-name">{p.name}</span>
                  <span className="provider-card-count">{p.models.length}</span>
                </div>
                {badges.length > 0 ? (
                  <div className="provider-card-badges">
                    {badges.map((b) => (
                      <span key={b.label} className={`provider-badge badge-${b.tone}`}>
                        {b.label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </button>
            )
          })}
          {isDraft && form ? (
            <div className="provider-card is-active is-draft">
              <div className="provider-card-head">
                <span className="provider-card-name">{form.name || 'New provider'}</span>
              </div>
              <div className="provider-card-badges">
                <span className="provider-badge badge-warning">Unsaved</span>
              </div>
            </div>
          ) : null}
        </aside>

        <section className="provider-detail">
          {!form ? (
            <div className="provider-detail-empty">
              Select a provider, or add one to configure its key and models.
            </div>
          ) : (
            <>
              <label className="field">
                <span className="field-label">Name</span>
                <input
                  className="apikey-input"
                  value={form.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="Display name"
                />
              </label>

              <label className="field">
                <span className="field-label">Provider id</span>
                <input
                  className="apikey-input"
                  value={form.id}
                  disabled={!isDraft || !!findPreset(form.id)}
                  onChange={(e) => patch({ id: e.target.value.toLowerCase() })}
                  placeholder="lowercase-id"
                  spellCheck={false}
                />
              </label>

              <label className="field">
                <span className="field-label">
                  Base URL {isCatalog(form.id) ? <span className="field-hint">(blank = default)</span> : null}
                </span>
                <input
                  className="apikey-input"
                  value={form.baseUrl ?? ''}
                  onChange={(e) => patch({ baseUrl: e.target.value })}
                  placeholder={findPreset(form.id)?.defaultBaseUrl ?? 'https://…'}
                  spellCheck={false}
                />
              </label>

              <label className="field">
                <span className="field-label">
                  API key
                  {!isDraft && statusFor(form.id)?.keyState === 'ok' ? (
                    <span className="field-hint">(saved — leave blank to keep)</span>
                  ) : null}
                  {!isDraft && statusFor(form.id)?.keyState === 'unreadable' ? (
                    <span className="field-hint field-warn">(stored key unreadable — re-enter)</span>
                  ) : null}
                </span>
                <SecretInput
                  value={keyInput}
                  onChange={setKeyInput}
                  placeholder={findPreset(form.id)?.apiKeyUrl ?? 'API key'}
                  onEnter={handleSave}
                />
              </label>

              <div className="provider-actions">
                <button
                  className="btn btn-secondary"
                  onClick={handleTest}
                  disabled={probing || importing || busy}
                >
                  {probing ? <Loader2 className="spin" /> : <Wifi />}
                  Test connection
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleFetch}
                  disabled={probing || importing || busy}
                >
                  {importing ? <Loader2 className="spin" /> : <Download />}
                  Fetch models
                </button>
                {probeFresh && probe ? (
                  probe.ok ? (
                    <span className="probe-result probe-ok">
                      <Check /> OK · {probe.latencyMs}ms · {probe.modelIds.length} models
                    </span>
                  ) : (
                    <span className="probe-result probe-err">{probe.message}</span>
                  )
                ) : null}
              </div>

              <div className="field">
                <span className="field-label">Models</span>
                <ProviderModels models={form.models} catalog={isCatalog(form.id)} onChange={setModels} />
              </div>

              {error ? <div className="apikey-error">{error}</div> : null}

              <div className="provider-footer">
                <button className="btn btn-primary" onClick={handleSave} disabled={busy}>
                  {busy ? <Loader2 className="spin" /> : null}
                  {isDraft ? 'Add provider' : 'Save changes'}
                </button>
                {!isDraft ? (
                  <button className="btn btn-secondary danger" onClick={handleDelete} disabled={busy}>
                    <Trash2 />
                    Delete
                  </button>
                ) : null}
              </div>
            </>
          )}
        </section>
      </div>

      {importIds !== null && form ? (
        <ProviderModelImportDialog
          modelIds={importIds}
          existing={form.models}
          onConfirm={mergeImport}
          onClose={() => setImportIds(null)}
        />
      ) : null}
    </div>
  )
}
