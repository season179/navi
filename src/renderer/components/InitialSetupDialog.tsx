// Kun InitialSetupDialog.tsx visual port
// (../Kun/src/renderer/src/components/InitialSetupDialog.tsx).
// Visual only: mock setup snapshots and preview URL hooks.

import { useMemo, useState, type ReactElement } from 'react'
import {
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  Mic,
  Monitor,
  Moon,
  Sparkles,
  Sun,
  X,
} from 'lucide-react'

export type ThemePref = 'system' | 'light' | 'dark'
export type SetupMode = 'api' | 'token-plan'
export type SetupProviderId = 'deepseek' | 'minimax' | 'xiaomi'

export type SetupProviderCard = {
  presetId: SetupProviderId
  name: string
  description: string
  capability: 'speech' | 'image' | null
}

export type SetupRegion = {
  id: string
  label: string
  baseUrl: string
}

export type InitialSetupSnapshot = {
  theme: ThemePref
  locale: 'en' | 'zh'
  selection: {
    presetId: SetupProviderId
    mode: SetupMode
  }
  drafts: Record<
    string,
    {
      apiKey: string
      baseUrl: string
    }
  >
  filledProviders: SetupProviderId[]
  showTokenPlanMode: boolean
  regions: SetupRegion[]
  wireNote: { tone: 'success' | 'warning'; text: string } | null
  closeAllowed: boolean
  isPreviewBadge: boolean
  saving: boolean
  error: string | null
  loading: boolean
}

const COPY = {
  loading: 'Loading…',
  firstRunBadge: 'First-time setup',
  firstRunPreviewBadge: 'Setup preview',
  firstRunClose: 'Close',
  firstRunTitle: 'Welcome to Navi',
  firstRunSubtitle:
    'Choose your theme, language, and model provider to get started. You can change these later in Settings.',
  theme: 'Theme',
  themeSystem: 'System',
  themeLight: 'Light',
  themeDark: 'Dark',
  language: 'Language',
  firstRunProviderLabel: 'Model provider',
  firstRunProviderDeepseekDesc: 'General chat and coding',
  firstRunProviderMinimaxDesc: 'Chat, speech, and image',
  firstRunProviderXiaomiDesc: 'Speech-to-text provider',
  firstRunCapabilitySpeech: 'Speech',
  firstRunCapabilityImage: 'Image',
  firstRunCapabilityChat: 'Chat',
  firstRunModeLabel: 'Connection mode',
  firstRunModeApi: 'API key',
  firstRunModeTokenPlan: 'Token plan',
  firstRunRegionLabel: 'Region',
  firstRunRegion_cn: 'China',
  firstRunRegion_us: 'United States',
  firstRunRegion_sg: 'Singapore',
  firstRunApiKeyLabel: '{{provider}} API key',
  firstRunBuyApiHint: 'Purchase an API key from the DeepSeek console, then paste it here.',
  firstRunKeyHintMinimaxApi: 'Create an API key in the MiniMax console.',
  firstRunKeyHintMinimaxTokenPlan: 'Use your MiniMax token-plan key for bundled speech and image.',
  firstRunKeyHintXiaomiApi: 'Create an API key in the Xiaomi MiMo console.',
  firstRunKeyHintXiaomiTokenPlan: 'Use your Xiaomi token-plan key for speech.',
  firstRunGetKeyAction: 'Get API key',
  firstRunAutoWireSpeech: 'Speech-to-text will use this provider automatically.',
  firstRunAutoWireImage: 'Image generation will use this provider automatically.',
  firstRunTokenPlanNoSpeech: 'This token plan does not include speech.',
  firstRunTokenPlanNoImage: 'This token plan does not include image generation.',
  baseUrl: 'Base URL',
  firstRunSaving: 'Saving…',
  firstRunSave: 'Save and continue',
  firstRunPreviewHint: 'Preview mode — changes are not persisted.',
  firstRunChangeLater: 'You can update these choices anytime in Settings.',
  runtimeFetchFailed: 'Could not connect to the runtime. Check your API key and try again.',
}

const PROVIDER_CARDS: SetupProviderCard[] = [
  {
    presetId: 'deepseek',
    name: 'DeepSeek',
    description: COPY.firstRunProviderDeepseekDesc,
    capability: null,
  },
  {
    presetId: 'minimax',
    name: 'MiniMax',
    description: COPY.firstRunProviderMinimaxDesc,
    capability: 'image',
  },
  {
    presetId: 'xiaomi',
    name: 'Xiaomi MiMo',
    description: COPY.firstRunProviderXiaomiDesc,
    capability: 'speech',
  },
]

const THEME_OPTIONS: { value: ThemePref; icon: typeof Sun; label: string }[] = [
  { value: 'system', icon: Monitor, label: COPY.themeSystem },
  { value: 'light', icon: Sun, label: COPY.themeLight },
  { value: 'dark', icon: Moon, label: COPY.themeDark },
]

const MINIMAX_REGIONS: SetupRegion[] = [
  { id: 'cn', label: COPY.firstRunRegion_cn, baseUrl: 'https://api.minimax.chat/v1' },
  { id: 'us', label: COPY.firstRunRegion_us, baseUrl: 'https://api.minimaxi.chat/v1' },
  { id: 'sg', label: COPY.firstRunRegion_sg, baseUrl: 'https://api-sg.minimax.chat/v1' },
]

export const INITIAL_SETUP_PREVIEW: InitialSetupSnapshot = {
  theme: 'system',
  locale: 'en',
  selection: { presetId: 'deepseek', mode: 'api' },
  drafts: {
    deepseek: { apiKey: '', baseUrl: 'https://api.deepseek.com' },
    minimax: { apiKey: '', baseUrl: 'https://api.minimax.chat/v1' },
    xiaomi: { apiKey: '', baseUrl: 'https://api.xiaomimimo.com/v1' },
    'minimax:token-plan': { apiKey: '', baseUrl: 'https://api.minimax.chat/v1' },
    'xiaomi:token-plan': { apiKey: '', baseUrl: 'https://api.xiaomimimo.com/v1' },
  },
  filledProviders: [],
  showTokenPlanMode: false,
  regions: [],
  wireNote: null,
  closeAllowed: false,
  isPreviewBadge: false,
  saving: false,
  error: null,
  loading: false,
}

export const INITIAL_SETUP_PREVIEW_FILLED: InitialSetupSnapshot = {
  ...INITIAL_SETUP_PREVIEW,
  drafts: {
    ...INITIAL_SETUP_PREVIEW.drafts,
    deepseek: { apiKey: 'sk-••••••••••••••••', baseUrl: 'https://api.deepseek.com' },
    minimax: { apiKey: 'eyJ••••••••••••••••', baseUrl: 'https://api.minimax.chat/v1' },
    xiaomi: { apiKey: 'sk-••••••••••••••••', baseUrl: 'https://api.xiaomimimo.com/v1' },
  },
  filledProviders: ['deepseek', 'minimax', 'xiaomi'],
}

function profileId(presetId: SetupProviderId, mode: SetupMode): string {
  return mode === 'token-plan' ? `${presetId}:token-plan` : presetId
}

function keyHint(card: SetupProviderCard, mode: SetupMode): string {
  if (card.presetId === 'deepseek') return COPY.firstRunBuyApiHint
  const suffix = mode === 'token-plan' ? 'TokenPlan' : 'Api'
  if (card.presetId === 'xiaomi') {
    return COPY[`firstRunKeyHintXiaomi${suffix}` as keyof typeof COPY]
  }
  return COPY[`firstRunKeyHintMinimax${suffix}` as keyof typeof COPY]
}

function keyPlaceholder(card: SetupProviderCard, mode: SetupMode): string {
  if (mode === 'token-plan') return 'API Key'
  return card.presetId === 'minimax' ? 'API Key' : 'sk-...'
}

type InitialSetupDialogProps = {
  snapshot: InitialSetupSnapshot
  onClose?: () => void
  onSave?: () => void
}

export function InitialSetupDialog({
  snapshot,
  onClose,
  onSave,
}: InitialSetupDialogProps): ReactElement {
  const [draft, setDraft] = useState(snapshot)
  const [showApiKey, setShowApiKey] = useState(false)

  const selectedCard =
    PROVIDER_CARDS.find((card) => card.presetId === draft.selection.presetId) ?? PROVIDER_CARDS[0]!
  const selectedProfileId = profileId(draft.selection.presetId, draft.selection.mode)
  const selectedDraft = draft.drafts[selectedProfileId] ?? { apiKey: '', baseUrl: '' }

  const updateDraft = (patch: Partial<typeof selectedDraft>): void => {
    setDraft((current) => ({
      ...current,
      drafts: {
        ...current.drafts,
        [selectedProfileId]: { ...selectedDraft, ...patch },
      },
    }))
  }

  const selectCard = (presetId: SetupProviderId): void => {
    setDraft((current) => ({
      ...current,
      selection: { presetId, mode: 'api' },
      error: null,
    }))
  }

  const selectMode = (mode: SetupMode): void => {
    setDraft((current) => ({
      ...current,
      selection: { ...current.selection, mode },
      error: null,
    }))
  }

  if (draft.loading) {
    return (
      <div className="initial-setup-dialog-overlay initial-setup-dialog-overlay--loading ds-no-drag">
        <div className="initial-setup-dialog-loading-card">
          <Loader2 className="initial-setup-dialog-loading-icon" strokeWidth={1.8} />
          {COPY.loading}
        </div>
      </div>
    )
  }

  return (
    <div className="initial-setup-dialog-overlay ds-no-drag">
      <div className="initial-setup-dialog-shell">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="initial-setup-title"
          className="initial-setup-dialog"
        >
          <div className="initial-setup-dialog-header">
            <div className="initial-setup-dialog-header-top">
              <div className="initial-setup-dialog-badge">
                <Sparkles className="initial-setup-dialog-badge-icon" strokeWidth={1.9} />
                <span className="initial-setup-dialog-badge-text">
                  {draft.isPreviewBadge ? COPY.firstRunPreviewBadge : COPY.firstRunBadge}
                </span>
              </div>
              {draft.closeAllowed ? (
                <button
                  type="button"
                  onClick={() => onClose?.()}
                  aria-label={COPY.firstRunClose}
                  title={COPY.firstRunClose}
                  className="initial-setup-dialog-close"
                >
                  <X className="initial-setup-dialog-close-icon" strokeWidth={1.8} />
                </button>
              ) : null}
            </div>
            <h1 id="initial-setup-title" className="initial-setup-dialog-title">
              {COPY.firstRunTitle}
            </h1>
            <p className="initial-setup-dialog-subtitle">{COPY.firstRunSubtitle}</p>
          </div>

          <div className="initial-setup-dialog-body">
            <div className="initial-setup-dialog-section">
              <label className="initial-setup-dialog-label">{COPY.theme}</label>
              <div className="initial-setup-dialog-choice-grid initial-setup-dialog-choice-grid--three">
                {THEME_OPTIONS.map(({ value, icon: Icon, label }) => {
                  const isActive = draft.theme === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDraft((current) => ({ ...current, theme: value }))}
                      className={`initial-setup-dialog-choice${
                        isActive ? ' is-active' : ''
                      }`}
                    >
                      <Icon className="initial-setup-dialog-choice-icon" />
                      <span className="initial-setup-dialog-choice-text">{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="initial-setup-dialog-section">
              <label className="initial-setup-dialog-label">{COPY.language}</label>
              <div className="initial-setup-dialog-choice-grid initial-setup-dialog-choice-grid--two">
                {(['en', 'zh'] as const).map((lang) => {
                  const isActive = draft.locale === lang
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setDraft((current) => ({ ...current, locale: lang }))}
                      className={`initial-setup-dialog-choice${
                        isActive ? ' is-active' : ''
                      }`}
                    >
                      <span className="initial-setup-dialog-choice-text">
                        {lang === 'en' ? 'English' : '简体中文'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="initial-setup-dialog-section">
              <label className="initial-setup-dialog-label">{COPY.firstRunProviderLabel}</label>
              <div className="initial-setup-dialog-provider-grid">
                {PROVIDER_CARDS.map((card) => {
                  const isActive = draft.selection.presetId === card.presetId
                  const filled = draft.filledProviders.includes(card.presetId)
                  return (
                    <button
                      key={card.presetId}
                      type="button"
                      onClick={() => selectCard(card.presetId)}
                      className={`initial-setup-dialog-provider-card${
                        isActive ? ' is-active' : ''
                      }`}
                    >
                      <span className="initial-setup-dialog-provider-name">
                        {card.name}
                        <span
                          aria-hidden="true"
                          className={`initial-setup-dialog-provider-dot${
                            filled ? ' is-filled' : ''
                          }`}
                        />
                      </span>
                      <span className="initial-setup-dialog-provider-desc">{card.description}</span>
                      {card.capability ? (
                        <span
                          className={`initial-setup-dialog-capability initial-setup-dialog-capability--${
                            card.capability
                          }`}
                        >
                          {card.capability === 'speech' ? (
                            <Mic className="initial-setup-dialog-capability-icon" strokeWidth={2} />
                          ) : (
                            <ImageIcon
                              className="initial-setup-dialog-capability-icon"
                              strokeWidth={2}
                            />
                          )}
                          {card.capability === 'speech'
                            ? COPY.firstRunCapabilitySpeech
                            : COPY.firstRunCapabilityImage}
                        </span>
                      ) : (
                        <span className="initial-setup-dialog-capability initial-setup-dialog-capability--chat">
                          <MessageCircle
                            className="initial-setup-dialog-capability-icon"
                            strokeWidth={2}
                          />
                          {COPY.firstRunCapabilityChat}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {draft.showTokenPlanMode ? (
              <div className="initial-setup-dialog-section">
                <label className="initial-setup-dialog-label">{COPY.firstRunModeLabel}</label>
                <div className="initial-setup-dialog-choice-grid initial-setup-dialog-choice-grid--two">
                  <button
                    type="button"
                    onClick={() => selectMode('api')}
                    className={`initial-setup-dialog-choice${
                      draft.selection.mode === 'api' ? ' is-active' : ''
                    }`}
                  >
                    <span className="initial-setup-dialog-choice-text">{COPY.firstRunModeApi}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectMode('token-plan')}
                    className={`initial-setup-dialog-choice${
                      draft.selection.mode === 'token-plan' ? ' is-active' : ''
                    }`}
                  >
                    <span className="initial-setup-dialog-choice-text">
                      {COPY.firstRunModeTokenPlan}
                    </span>
                  </button>
                </div>
              </div>
            ) : null}

            {draft.regions.length > 0 ? (
              <div className="initial-setup-dialog-section">
                <label className="initial-setup-dialog-label">{COPY.firstRunRegionLabel}</label>
                <div className="initial-setup-dialog-choice-grid initial-setup-dialog-choice-grid--three">
                  {draft.regions.map((region) => (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => updateDraft({ baseUrl: region.baseUrl })}
                      className={`initial-setup-dialog-choice${
                        selectedDraft.baseUrl.trim() === region.baseUrl ? ' is-active' : ''
                      }`}
                    >
                      <span className="initial-setup-dialog-choice-text">{region.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="initial-setup-dialog-section">
              <label className="initial-setup-dialog-label">
                {COPY.firstRunApiKeyLabel.replace('{{provider}}', selectedCard.name)}
              </label>
              <div className="initial-setup-dialog-secret-wrap">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={selectedDraft.apiKey}
                  onChange={(event) => updateDraft({ apiKey: event.target.value })}
                  placeholder={keyPlaceholder(selectedCard, draft.selection.mode)}
                  autoComplete="off"
                  className="initial-setup-dialog-field initial-setup-dialog-field--secret"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((value) => !value)}
                  className="initial-setup-dialog-secret-toggle"
                  aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                >
                  {showApiKey ? (
                    <EyeOff className="initial-setup-dialog-secret-toggle-icon" />
                  ) : (
                    <Eye className="initial-setup-dialog-secret-toggle-icon" />
                  )}
                </button>
              </div>
              <div className="initial-setup-dialog-key-hint">
                <p className="initial-setup-dialog-key-hint-copy">
                  {keyHint(selectedCard, draft.selection.mode)}
                </p>
                <button type="button" className="initial-setup-dialog-key-link">
                  <span>{COPY.firstRunGetKeyAction}</span>
                  <ExternalLink className="initial-setup-dialog-key-link-icon" strokeWidth={1.9} />
                </button>
              </div>
              {draft.wireNote ? (
                <div
                  className={`initial-setup-dialog-wire-note initial-setup-dialog-wire-note--${
                    draft.wireNote.tone
                  }`}
                >
                  {draft.wireNote.text}
                </div>
              ) : null}
            </div>

            <div className="initial-setup-dialog-section">
              <label className="initial-setup-dialog-label">{COPY.baseUrl}</label>
              <input
                type="text"
                value={selectedDraft.baseUrl}
                onChange={(event) => updateDraft({ baseUrl: event.target.value })}
                placeholder="https://"
                className="initial-setup-dialog-field"
              />
            </div>
          </div>

          <div className="initial-setup-dialog-footer">
            {draft.error ? (
              <div className="initial-setup-dialog-error">{draft.error}</div>
            ) : null}

            <div
              className={`initial-setup-dialog-actions${
                draft.closeAllowed ? ' initial-setup-dialog-actions--split' : ''
              }`}
            >
              {draft.closeAllowed ? (
                <button
                  type="button"
                  onClick={() => onClose?.()}
                  className="initial-setup-dialog-btn initial-setup-dialog-btn--secondary"
                >
                  {COPY.firstRunClose}
                </button>
              ) : null}
              <button
                type="button"
                disabled={draft.saving}
                onClick={() => onSave?.()}
                className="initial-setup-dialog-btn initial-setup-dialog-btn--primary"
              >
                {draft.saving ? COPY.firstRunSaving : COPY.firstRunSave}
              </button>
            </div>

            <p className="initial-setup-dialog-footer-hint">
              {draft.isPreviewBadge ? COPY.firstRunPreviewHint : COPY.firstRunChangeLater}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export type InitialSetupDialogPreviewMode =
  | 'default'
  | 'preview'
  | 'minimax'
  | 'xiaomi'
  | 'filled'
  | 'saving'
  | 'error'
  | 'loading'
  | 'wireSuccess'
  | 'wireWarning'

function previewSnapshot(mode: InitialSetupDialogPreviewMode): InitialSetupSnapshot {
  if (mode === 'preview') {
    return {
      ...INITIAL_SETUP_PREVIEW,
      closeAllowed: true,
      isPreviewBadge: true,
    }
  }
  if (mode === 'minimax') {
    return {
      ...INITIAL_SETUP_PREVIEW,
      selection: { presetId: 'minimax', mode: 'token-plan' },
      showTokenPlanMode: true,
      regions: MINIMAX_REGIONS,
      drafts: {
        ...INITIAL_SETUP_PREVIEW.drafts,
        'minimax:token-plan': {
          apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
          baseUrl: MINIMAX_REGIONS[0]!.baseUrl,
        },
      },
    }
  }
  if (mode === 'xiaomi') {
    return {
      ...INITIAL_SETUP_PREVIEW,
      selection: { presetId: 'xiaomi', mode: 'api' },
      drafts: {
        ...INITIAL_SETUP_PREVIEW.drafts,
        xiaomi: { apiKey: 'sk-xiaomi-preview', baseUrl: 'https://api.xiaomimimo.com/v1' },
      },
    }
  }
  if (mode === 'filled') {
    return INITIAL_SETUP_PREVIEW_FILLED
  }
  if (mode === 'saving') {
    return { ...INITIAL_SETUP_PREVIEW, saving: true }
  }
  if (mode === 'error') {
    return { ...INITIAL_SETUP_PREVIEW, error: COPY.runtimeFetchFailed }
  }
  if (mode === 'loading') {
    return { ...INITIAL_SETUP_PREVIEW, loading: true }
  }
  if (mode === 'wireSuccess') {
    return {
      ...INITIAL_SETUP_PREVIEW,
      selection: { presetId: 'xiaomi', mode: 'api' },
      wireNote: { tone: 'success', text: COPY.firstRunAutoWireSpeech },
    }
  }
  if (mode === 'wireWarning') {
    return {
      ...INITIAL_SETUP_PREVIEW,
      selection: { presetId: 'minimax', mode: 'token-plan' },
      showTokenPlanMode: true,
      wireNote: { tone: 'warning', text: COPY.firstRunTokenPlanNoImage },
    }
  }
  return INITIAL_SETUP_PREVIEW
}

/** Full-screen preview shell for ?initialSetupDialogPreview URL hooks. */
export function InitialSetupDialogPreview({
  mode = 'default',
}: {
  mode?: InitialSetupDialogPreviewMode
}): ReactElement {
  const snapshot = useMemo(() => previewSnapshot(mode), [mode])

  return (
    <InitialSetupDialog
      snapshot={snapshot}
      onClose={() => undefined}
      onSave={() => undefined}
    />
  )
}
