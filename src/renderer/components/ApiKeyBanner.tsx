// Inline gate shown when no Anthropic API key is configured. The key is sent
// to the main process, encrypted with safeStorage, and never stored or echoed
// in the renderer. Submitting restarts the backend with the new key.

import { useState } from 'react'
import { KeyRound, Loader2 } from 'lucide-react'

interface ApiKeyBannerProps {
  onSave(key: string): Promise<{ ok: boolean; error?: string }>
}

export function ApiKeyBanner({ onSave }: ApiKeyBannerProps) {
  const [key, setKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    const trimmed = key.trim()
    if (!trimmed || saving) return
    setSaving(true)
    setError(null)
    const res = await onSave(trimmed)
    setSaving(false)
    if (res.ok) setKey('')
    else setError(res.error ?? 'Could not save the key.')
  }

  return (
    <div className="apikey-card">
      <div className="apikey-head">
        <KeyRound />
        <div>
          <div className="apikey-title">Connect Navi to Claude</div>
          <div className="apikey-desc">
            Add your Anthropic API key to start chatting. It is encrypted on this device and
            never leaves it except to call the model.
          </div>
        </div>
      </div>
      <div className="apikey-row">
        <input
          type="password"
          className="apikey-input"
          placeholder="sk-ant-…"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          autoFocus
        />
        <button className="btn btn-primary" onClick={submit} disabled={!key.trim() || saving}>
          {saving ? <Loader2 className="spin" /> : null}
          {saving ? 'Saving…' : 'Save key'}
        </button>
      </div>
      {error ? <div className="apikey-error">{error}</div> : null}
    </div>
  )
}
