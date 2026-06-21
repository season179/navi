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

import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'
import {
  ChevronDown,
  Check,
  Download,
  KeyRound,
  Loader2,
  Lock,
  PlugZap,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
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
  /** When true, omit the panel header — for embedding inside SettingsView. */
  embedded?: boolean
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

function ProviderBadge({
  tone,
  children,
}: {
  tone: 'accent' | 'warning'
  children: ReactNode
}): ReactElement {
  return (
    <span
      className={
        tone === 'accent'
          ? 'providers-settings-badge providers-settings-badge-accent'
          : 'providers-settings-badge providers-settings-badge-warning'
      }
    >
      {children}
    </span>
  )
}

function DetailSection({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children?: ReactNode
}): ReactElement {
  return (
    <section className="providers-settings-detail-section">
      <div className="providers-settings-detail-section-header">
        <h3 className="providers-settings-detail-section-title">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

/**
 * Status pills for a saved provider, mirroring Kun's independent-conditional
 * badges. "In use" = it's the app's default provider; the key-state warnings
 * flag missing/unreadable keys. A keyed, non-default provider yields none.
 */
function renderProviderBadges(
  keyState: ProviderStatus['keyState'],
  inUse: boolean,
): ReactNode {
  const badges: ReactNode[] = []
  if (inUse) {
    badges.push(
      <ProviderBadge key="in-use" tone="accent">
        In use
      </ProviderBadge>,
    )
  }
  if (keyState === 'absent') {
    badges.push(
      <ProviderBadge key="missing-key" tone="warning">
        No API key
      </ProviderBadge>,
    )
  }
  if (keyState === 'unreadable') {
    badges.push(
      <ProviderBadge key="unreadable-key" tone="warning">
        Key unreadable
      </ProviderBadge>,
    )
  }
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
  embedded = false,
}: ProvidersSettingsProps) {
  const addMenuRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    if (!addOpen) return
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target
      if (target instanceof Node && addMenuRef.current?.contains(target)) return
      setAddOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setAddOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [addOpen])

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
  const canEditProviderId = Boolean(isDraft && form && !findPreset(form.id))
  const keyState = form && !isDraft ? statusFor(form.id)?.keyState : undefined

  const renderProviderButton = (p: ProviderProfile, draft = false): ReactElement => {
    const activeId = isDraft && draft ? DRAFT : p.id
    const selectedState = selected === activeId
    const providerKeyState = draft ? 'absent' : (statusFor(p.id)?.keyState ?? 'absent')
    const inUse = !draft && defaultSelection?.providerId === p.id
    const hasStoredKey = providerKeyState === 'ok'
    const preset = findPreset(p.id)

    return (
      <button
        key={draft ? DRAFT : p.id}
        type="button"
        aria-pressed={selectedState}
        onClick={() => {
          if (!draft) editExisting(p)
        }}
        className={
          selectedState
            ? 'providers-settings-provider-btn is-selected'
            : 'providers-settings-provider-btn'
        }
      >
        <div className="providers-settings-provider-btn-title-row">
          <span className="providers-settings-provider-btn-name">
            {p.name.trim() || p.id || 'New provider'}
          </span>
          {draft ? <ProviderBadge tone="warning">Unsaved</ProviderBadge> : renderProviderBadges(providerKeyState, inUse)}
        </div>
        <div className="providers-settings-provider-btn-meta">
          <span>{p.models.length} models</span>
          {preset ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{preset.catalog ? 'Preset' : 'Custom'}</span>
            </>
          ) : null}
          {hasStoredKey ? (
            <KeyRound className="providers-settings-provider-btn-icon" strokeWidth={1.9} />
          ) : null}
        </div>
      </button>
    )
  }

  return (
    <div className={embedded ? 'providers-settings-embedded' : 'providers-panel'}>
      {!embedded ? (
        <header className="providers-head">
          <div className="providers-title">
            Providers
            {!ready ? <span className="providers-reconnecting">reconnecting…</span> : null}
          </div>
          <button className="apikey-close" onClick={onClose} aria-label="Close" title="Close">
            <X />
          </button>
        </header>
      ) : !ready ? (
        <p className="providers-settings-reconnecting-hint">reconnecting…</p>
      ) : null}

      <div
        className={
          embedded
            ? 'providers-settings-layout'
            : 'providers-settings-layout providers-panel-settings-body'
        }
      >
        <div className="providers-settings-sidebar">
          {providers.length === 0 && !isDraft ? (
            <p className="providers-settings-model-empty">No providers yet. Add one to start.</p>
          ) : (
            <div className="providers-settings-provider-list">
              {providers.map((p) => renderProviderButton(p))}
              {isDraft && form ? renderProviderButton(form, true) : null}
            </div>
          )}

          <div ref={addMenuRef} className="providers-settings-add-menu-wrap">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={addOpen}
              onClick={() => setAddOpen((value) => !value)}
              className="providers-settings-add-btn"
            >
              <Plus className="providers-settings-add-btn-icon" strokeWidth={1.9} />
              Add provider
              <ChevronDown className="providers-settings-add-btn-icon" strokeWidth={1.9} />
            </button>
            {addOpen ? (
              <div role="menu" className="providers-settings-add-menu">
                <div className="providers-settings-add-menu-heading">API providers</div>
                {PROVIDER_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="menuitem"
                    onClick={() => startPreset(p.id)}
                    className="providers-settings-add-menu-item"
                  >
                    <span>{p.name}</span>
                    <span className="providers-settings-add-menu-tag">Preset</span>
                  </button>
                ))}
                <div className="providers-settings-add-menu-divider" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={startCustom}
                  className="providers-settings-add-menu-item"
                >
                  Custom provider…
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {!form ? (
          <p className="providers-settings-model-empty providers-settings-detail-placeholder">
            Select a provider, or add one to configure its key and models.
          </p>
        ) : (
          <div className="providers-settings-detail">
            <div className="providers-settings-detail-header">
              <div className="providers-settings-detail-title-row">
                <span className="providers-settings-detail-name">
                  {form.name.trim() || form.id || 'New provider'}
                </span>
                {form.id ? <span className="providers-settings-detail-id">{form.id}</span> : null}
                {!canEditProviderId && form.id ? (
                  <span title="Provider ID locked" className="providers-settings-detail-lock">
                    <Lock className="providers-settings-detail-lock-icon" strokeWidth={1.9} />
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={handleTest}
                disabled={probing || importing || busy}
                className="providers-settings-test-btn"
              >
                {probing ? (
                  <Loader2 className="providers-settings-test-btn-icon is-spinning" strokeWidth={1.9} />
                ) : (
                  <PlugZap className="providers-settings-test-btn-icon" strokeWidth={1.9} />
                )}
                Test connection
              </button>
            </div>

            {probeFresh && probe ? (
              probe.ok ? (
                <p className="providers-settings-muted-copy probe-result probe-ok">
                  <Check strokeWidth={2} />
                  OK · {probe.latencyMs}ms · {probe.modelIds.length} models
                </p>
              ) : (
                <p className="providers-settings-url-warning probe-result probe-err">{probe.message}</p>
              )
            ) : null}

            <DetailSection title="Provider basics">
              <div className="providers-settings-field-grid">
                <label className="providers-settings-field">
                  Provider name
                  <input
                    className="settings-text-input"
                    value={form.name}
                    onChange={(e) => patch({ name: e.target.value })}
                    placeholder="Display name"
                  />
                </label>
                <label className="providers-settings-field">
                  Provider ID
                  <span className="providers-settings-id-wrap">
                    <input
                      className={
                        canEditProviderId
                          ? 'settings-text-input providers-settings-id-input'
                          : 'settings-text-input providers-settings-id-input is-readonly'
                      }
                      value={form.id}
                      readOnly={!canEditProviderId}
                      onChange={(e) => patch({ id: e.target.value.toLowerCase() })}
                      placeholder="lowercase-id"
                      spellCheck={false}
                    />
                    {!canEditProviderId && form.id ? (
                      <span title="Provider ID locked" className="providers-settings-id-lock">
                        <Lock className="providers-settings-detail-lock-icon" strokeWidth={1.9} />
                      </span>
                    ) : null}
                  </span>
                </label>
              </div>
            </DetailSection>

            <DetailSection title="Provider connection">
              <label className="providers-settings-field">
                Provider API key
                {keyState === 'ok' ? (
                  <span className="providers-settings-muted-copy"> (saved — leave blank to keep)</span>
                ) : null}
                {keyState === 'unreadable' ? (
                  <span className="providers-settings-url-warning">
                    {' '}
                    (stored key unreadable — re-enter)
                  </span>
                ) : null}
                <SecretInput
                  value={keyInput}
                  onChange={setKeyInput}
                  placeholder={findPreset(form.id)?.apiKeyUrl ?? 'API key'}
                  onEnter={handleSave}
                />
              </label>
              <label className="providers-settings-field">
                Provider base URL
                {isCatalog(form.id) ? (
                  <span className="providers-settings-muted-copy"> (blank = default)</span>
                ) : null}
                <input
                  className="settings-text-input"
                  value={form.baseUrl ?? ''}
                  onChange={(e) => patch({ baseUrl: e.target.value })}
                  placeholder={findPreset(form.id)?.defaultBaseUrl ?? 'https://…'}
                  spellCheck={false}
                />
              </label>
            </DetailSection>

            <DetailSection
              title={`Models · ${form.models.length}`}
              action={
                <button
                  type="button"
                  onClick={handleFetch}
                  disabled={probing || importing || busy}
                  className="providers-settings-fetch-btn"
                >
                  {importing ? (
                    <Loader2 className="providers-settings-fetch-btn-icon is-spinning" strokeWidth={1.9} />
                  ) : (
                    <Download className="providers-settings-fetch-btn-icon" strokeWidth={1.9} />
                  )}
                  Fetch from API
                </button>
              }
            >
              <ProviderModels models={form.models} catalog={isCatalog(form.id)} onChange={setModels} />
            </DetailSection>

            {error ? <p className="providers-settings-url-warning">{error}</p> : null}

            {isDraft ? (
              <DetailSection title="Draft provider">
                <div className="providers-settings-draft-actions">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={busy}
                    className="providers-settings-draft-confirm"
                  >
                    {busy ? (
                      <Loader2 className="providers-settings-draft-confirm-icon is-spinning" strokeWidth={2} />
                    ) : (
                      <Plus className="providers-settings-draft-confirm-icon" strokeWidth={2} />
                    )}
                    Add provider
                  </button>
                  <span className="providers-settings-draft-hint">
                    {keyInput.trim() || keyState === 'ok'
                      ? 'Ready to save once details look correct.'
                      : 'Add an API key before saving this provider.'}
                  </span>
                </div>
              </DetailSection>
            ) : (
              <DetailSection title="Danger zone">
                <div className="providers-settings-danger-actions">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={busy}
                    className="providers-settings-draft-confirm"
                  >
                    {busy ? (
                      <Loader2 className="providers-settings-draft-confirm-icon is-spinning" strokeWidth={2} />
                    ) : null}
                    Save changes
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={busy}
                    className="providers-settings-remove-btn"
                  >
                    <Trash2 className="providers-settings-remove-btn-icon" strokeWidth={1.9} />
                    Delete provider
                  </button>
                </div>
              </DetailSection>
            )}
          </div>
        )}
      </div>

      {importIds !== null && form ? (
        <ProviderModelImportDialog
          providerName={form.name.trim() || form.id}
          modelIds={importIds}
          existing={form.models}
          onConfirm={mergeImport}
          onClose={() => setImportIds(null)}
        />
      ) : null}
    </div>
  )
}
