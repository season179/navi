// Connection card for the OpenAI provider. Used in two modes:
//   - 'onboard'  (default): shown when no key is configured. The key is
//     required; a custom base URL is optional.
//   - 'settings': opened from the topbar gear to change the key and/or point
//     Navi at a custom OpenAI-compatible gateway after onboarding.
// The key is sent to the main process, encrypted with safeStorage, and never
// stored or echoed in the renderer. Saving restarts the backend with the new
// settings.

import { useState } from 'react'
import { KeyRound, Loader2, X } from 'lucide-react'

interface ApiKeyBannerProps {
  mode?: 'onboard' | 'settings'
  /** Current effective base URL (undefined = default direct OpenAI). */
  currentBaseUrl?: string
  onSaveKey(key: string): Promise<{ ok: boolean; error?: string }>
  onSaveBaseUrl(url: string): Promise<{ ok: boolean; error?: string }>
  onClose?(): void
}

export function ApiKeyBanner({
  mode = 'onboard',
  currentBaseUrl,
  onSaveKey,
  onSaveBaseUrl,
  onClose,
}: ApiKeyBannerProps) {
  const settings = mode === 'settings'
  const [key, setKey] = useState('')
  const [baseUrl, setBaseUrl] = useState(currentBaseUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Re-sync the base URL field when the effective base URL changes after mount.
  // The onboarding card renders before useNaviChat's status() call resolves, so
  // currentBaseUrl arrives as undefined and only later becomes the configured
  // gateway. Without this the field keeps its stale initial value, making
  // baseUrlChanged spuriously true — so a key-only save would clobber the
  // gateway with an empty string. (React's adjust-state-on-prop-change pattern:
  // the setState during render re-renders before committing, and only the URL
  // field is reset, never the in-progress key.)
  const [syncedBaseUrl, setSyncedBaseUrl] = useState(currentBaseUrl)
  if (currentBaseUrl !== syncedBaseUrl) {
    setSyncedBaseUrl(currentBaseUrl)
    setBaseUrl(currentBaseUrl ?? '')
  }

  const trimmedKey = key.trim()
  const trimmedUrl = baseUrl.trim()
  const baseUrlChanged = trimmedUrl !== (currentBaseUrl ?? '')
  // Onboarding requires a key; settings allows saving when either a new key is
  // entered or the base URL changed.
  const canSave = !saving && (settings ? trimmedKey.length > 0 || baseUrlChanged : trimmedKey.length > 0)

  const submit = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    let res: { ok: boolean; error?: string } = { ok: true }
    if (trimmedKey) res = await onSaveKey(trimmedKey)
    if (res.ok && baseUrlChanged) res = await onSaveBaseUrl(trimmedUrl)
    setSaving(false)
    if (res.ok) {
      setKey('')
      if (settings) onClose?.()
    } else {
      setError(res.error ?? 'Could not save.')
    }
  }

  const onEnter = (e: { key: string }) => {
    if (e.key === 'Enter') void submit()
  }

  return (
    <div className="apikey-card">
      <div className="apikey-head">
        <KeyRound />
        <div>
          <div className="apikey-title">
            {settings ? 'Connection settings' : 'Connect Navi to OpenAI'}
          </div>
          <div className="apikey-desc">
            {settings
              ? 'Update your OpenAI API key, or point Navi at a custom OpenAI-compatible gateway. Leave the key blank to keep the current one.'
              : 'Add your OpenAI API key to start chatting. It is encrypted on this device and never leaves it except to call the model.'}
          </div>
        </div>
        {settings && onClose ? (
          <button className="apikey-close" onClick={onClose} aria-label="Close" title="Close">
            <X />
          </button>
        ) : null}
      </div>
      <div className="apikey-row">
        <input
          type="password"
          className="apikey-input"
          placeholder={settings ? 'sk-…  (leave blank to keep current key)' : 'sk-…'}
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={onEnter}
          autoFocus
        />
      </div>
      <div className="apikey-row">
        <input
          type="text"
          className="apikey-input"
          placeholder="https://api.openai.com/v1  (optional gateway URL)"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          onKeyDown={onEnter}
          spellCheck={false}
        />
        <button className="btn btn-primary" onClick={submit} disabled={!canSave}>
          {saving ? <Loader2 className="spin" /> : null}
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      {error ? <div className="apikey-error">{error}</div> : null}
    </div>
  )
}
