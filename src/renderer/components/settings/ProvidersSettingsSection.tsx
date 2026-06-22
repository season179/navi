// Providers settings section echoing Kun's settings-section-providers.tsx
// (../Kun/src/renderer/src/components/settings-section-providers.tsx).
// Visual only: mock provider snapshots and preview modes.

import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'
import {
  AudioLines,
  ChevronDown,
  Clapperboard,
  Download,
  Image as ImageIcon,
  KeyRound,
  Loader2,
  Lock,
  Mic,
  Music2,
  PlugZap,
  Plus,
  Trash2,
} from 'lucide-react'
import {
  InlineNoticeView,
  SETTINGS_SELECT_CLASS,
  SettingRow,
  SettingsCard,
  SettingsSecretInput,
  Toggle,
  type InlineNotice,
} from './SettingsControls'
import { ModelChipsInput } from './providers/ModelChipsInput'
import {
  ProviderModelsManager,
  providerModelEntriesFromIds,
} from './providers/ProviderModelsManager'
import {
  PROVIDERS_SETTINGS_ADD_MENU_CUSTOM,
  PROVIDERS_SETTINGS_ADD_PROVIDER,
  PROVIDERS_SETTINGS_API_KEY,
  PROVIDERS_SETTINGS_API_KEY_PLACEHOLDER,
  PROVIDERS_SETTINGS_BASE_URL,
  PROVIDERS_SETTINGS_BASE_URL_PLACEHOLDER,
  PROVIDERS_SETTINGS_CUSTOM_BADGE,
  PROVIDERS_SETTINGS_CUSTOM_ENDPOINT_DESC,
  PROVIDERS_SETTINGS_DANGER_HINT,
  PROVIDERS_SETTINGS_DEFAULT_BADGE,
  PROVIDERS_SETTINGS_DESC,
  PROVIDERS_SETTINGS_DRAFT_BADGE,
  PROVIDERS_SETTINGS_DRAFT_CONFIRM,
  PROVIDERS_SETTINGS_DRAFT_DISCARD,
  PROVIDERS_SETTINGS_DRAFT_HINT_NO_KEY,
  PROVIDERS_SETTINGS_DRAFT_HINT_READY,
  PROVIDERS_SETTINGS_DRAFT_SECTION,
  PROVIDERS_SETTINGS_ENDPOINT_FORMAT,
  PROVIDERS_SETTINGS_ENDPOINT_FORMAT_LABELS,
  PROVIDERS_SETTINGS_FETCH_MODELS,
  PROVIDERS_SETTINGS_GROUP_API,
  PROVIDERS_SETTINGS_GROUP_PLANS,
  PROVIDERS_SETTINGS_HIDE_SECRET,
  PROVIDERS_SETTINGS_IMAGE_BASE_URL,
  PROVIDERS_SETTINGS_IMAGE_BASE_URL_PLACEHOLDER,
  PROVIDERS_SETTINGS_IMAGE_CAPABILITY,
  PROVIDERS_SETTINGS_IMAGE_CAPABILITY_DESC,
  PROVIDERS_SETTINGS_IMAGE_MODEL,
  PROVIDERS_SETTINGS_IMAGE_PROTOCOL,
  PROVIDERS_SETTINGS_IN_USE_BADGE,
  PROVIDERS_SETTINGS_INVALID_URL,
  PROVIDERS_SETTINGS_MISSING_KEY_BADGE,
  PROVIDERS_SETTINGS_MODELS,
  PROVIDERS_SETTINGS_MODELS_PLACEHOLDER,
  PROVIDERS_SETTINGS_MUSIC_BASE_URL,
  PROVIDERS_SETTINGS_MUSIC_CAPABILITY,
  PROVIDERS_SETTINGS_MUSIC_CAPABILITY_DESC,
  PROVIDERS_SETTINGS_MUSIC_MODEL,
  PROVIDERS_SETTINGS_MUSIC_PROTOCOL,
  PROVIDERS_SETTINGS_PLAN_BADGE,
  PROVIDERS_SETTINGS_PRESET_BADGE,
  PROVIDERS_SETTINGS_PRESET_UPDATE_TAG,
  PROVIDERS_SETTINGS_PROXY_ENABLED_LABEL,
  PROVIDERS_SETTINGS_PROXY_URL_DESC,
  PROVIDERS_SETTINGS_PROXY_URL_LABEL,
  PROVIDERS_SETTINGS_PROXY_URL_PLACEHOLDER,
  PROVIDERS_SETTINGS_PROVIDER_ID,
  PROVIDERS_SETTINGS_PROVIDER_ID_LOCKED,
  PROVIDERS_SETTINGS_PROVIDER_NAME,
  PROVIDERS_SETTINGS_REMOVE_PROVIDER,
  PROVIDERS_SETTINGS_SECTION_BASICS,
  PROVIDERS_SETTINGS_SECTION_CONNECTION,
  PROVIDERS_SETTINGS_SECTION_DANGER,
  PROVIDERS_SETTINGS_SHOW_SECRET,
  PROVIDERS_SETTINGS_SPEECH_BASE_URL,
  PROVIDERS_SETTINGS_SPEECH_CAPABILITY,
  PROVIDERS_SETTINGS_SPEECH_CAPABILITY_DESC,
  PROVIDERS_SETTINGS_SPEECH_MODELS,
  PROVIDERS_SETTINGS_SPEECH_PROTOCOL,
  PROVIDERS_SETTINGS_TESTING,
  PROVIDERS_SETTINGS_TEST_CONNECTION,
  PROVIDERS_SETTINGS_TITLE,
  PROVIDERS_SETTINGS_TOKEN_PLAN_BADGE,
  PROVIDERS_SETTINGS_TTS_BASE_URL,
  PROVIDERS_SETTINGS_TTS_CAPABILITY,
  PROVIDERS_SETTINGS_TTS_CAPABILITY_DESC,
  PROVIDERS_SETTINGS_TTS_MODEL,
  PROVIDERS_SETTINGS_TTS_PROTOCOL,
  PROVIDERS_SETTINGS_VIDEO_BASE_URL,
  PROVIDERS_SETTINGS_VIDEO_CAPABILITY,
  PROVIDERS_SETTINGS_VIDEO_CAPABILITY_DESC,
  PROVIDERS_SETTINGS_VIDEO_MODEL,
  PROVIDERS_SETTINGS_VIDEO_PROTOCOL,
  PROVIDERS_SETTINGS_VISION_BADGE,
  formatProviderModelCount,
  formatProviderModelRemove,
  formatProviderTestFailed,
  formatProviderTestSuccess,
  type ModelEndpointFormat,
} from '../../lib/providersSettingsSection'

export type { ModelEndpointFormat }

export type ProviderModelSnapshot = {
  id: string
  kind: 'chat' | 'image' | 'speech' | 'tts' | 'music' | 'video'
  reasoning?: boolean
  vision?: boolean
}

export type ProviderCapabilitySnapshot = {
  enabled: boolean
  protocol: string
  baseUrl: string
  models: string[]
}

export type ProviderProfileSnapshot = {
  id: string
  name: string
  apiKey: string
  baseUrl: string
  endpointFormat: ModelEndpointFormat
  models: string[]
  modelProfiles?: Record<string, { reasoning?: boolean; vision?: boolean }>
  image?: ProviderCapabilitySnapshot
  speech?: ProviderCapabilitySnapshot
  textToSpeech?: ProviderCapabilitySnapshot
  music?: ProviderCapabilitySnapshot
  video?: ProviderCapabilitySnapshot
  kind: 'default' | 'preset' | 'plan' | 'custom' | 'token-plan'
  isDraft?: boolean
}

export type ProvidersSettingsSnapshot = {
  proxyEnabled: boolean
  proxyUrl: string
  activeProviderId: string
  inUseProviderId: string
  providers: ProviderProfileSnapshot[]
}

const DEEPSEEK_PROVIDER: ProviderProfileSnapshot = {
  id: 'deepseek',
  name: 'DeepSeek',
  apiKey: 'sk-deepseek-preview',
  baseUrl: 'https://api.deepseek.com/v1',
  endpointFormat: 'chat_completions',
  models: ['deepseek-chat', 'deepseek-reasoner'],
  modelProfiles: {
    'deepseek-reasoner': { reasoning: true },
  },
  kind: 'default',
}

const OPENAI_PROVIDER: ProviderProfileSnapshot = {
  id: 'openai',
  name: 'OpenAI',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  endpointFormat: 'chat_completions',
  models: ['gpt-4.1', 'gpt-4.1-mini'],
  modelProfiles: {
    'gpt-4.1': { vision: true },
  },
  image: {
    enabled: true,
    protocol: 'openai-images',
    baseUrl: 'https://api.openai.com/v1',
    models: ['dall-e-3'],
  },
  speech: {
    enabled: true,
    protocol: 'openai-whisper',
    baseUrl: 'https://api.openai.com/v1',
    models: ['whisper-1'],
  },
  kind: 'preset',
}

const CLAUDE_PLAN_PROVIDER: ProviderProfileSnapshot = {
  id: 'claude-code',
  name: 'Claude Code',
  apiKey: 'sk-claude-plan',
  baseUrl: 'https://api.anthropic.com/v1',
  endpointFormat: 'messages',
  models: ['claude-sonnet-4-20250514'],
  kind: 'plan',
}

const CUSTOM_PROVIDER: ProviderProfileSnapshot = {
  id: 'custom-provider-2',
  name: 'Local LiteLLM',
  apiKey: 'sk-local',
  baseUrl: 'http://127.0.0.1:4000/v1',
  endpointFormat: 'chat_completions',
  models: ['local-llm'],
  kind: 'custom',
}

const DRAFT_PROVIDER: ProviderProfileSnapshot = {
  id: 'custom-provider-3',
  name: 'New provider 3',
  apiKey: '',
  baseUrl: 'https://api.example.com/v1',
  endpointFormat: 'chat_completions',
  models: [],
  kind: 'custom',
  isDraft: true,
}

export const PROVIDERS_SETTINGS_PREVIEW_DEFAULT: ProvidersSettingsSnapshot = {
  proxyEnabled: false,
  proxyUrl: '',
  activeProviderId: 'deepseek',
  inUseProviderId: 'deepseek',
  providers: [DEEPSEEK_PROVIDER, OPENAI_PROVIDER, CUSTOM_PROVIDER],
}

export const PROVIDERS_SETTINGS_PREVIEW_GROUPED: ProvidersSettingsSnapshot = {
  ...PROVIDERS_SETTINGS_PREVIEW_DEFAULT,
  providers: [DEEPSEEK_PROVIDER, CLAUDE_PLAN_PROVIDER, OPENAI_PROVIDER, CUSTOM_PROVIDER],
}

export const PROVIDERS_SETTINGS_PREVIEW_EMPTY: ProvidersSettingsSnapshot = {
  proxyEnabled: false,
  proxyUrl: '',
  activeProviderId: 'deepseek',
  inUseProviderId: 'deepseek',
  providers: [DEEPSEEK_PROVIDER],
}

function providerModelCount(item: ProviderProfileSnapshot): number {
  let total = item.models.length
  if (item.image?.enabled) total += item.image.models.length
  if (item.speech?.enabled) total += item.speech.models.length
  if (item.textToSpeech?.enabled) total += item.textToSpeech.models.length
  if (item.music?.enabled) total += item.music.models.length
  if (item.video?.enabled) total += item.video.models.length
  return total
}

function providerKindLabel(item: ProviderProfileSnapshot): string {
  if (item.kind === 'default') return PROVIDERS_SETTINGS_DEFAULT_BADGE
  if (item.kind === 'token-plan') return PROVIDERS_SETTINGS_TOKEN_PLAN_BADGE
  if (item.kind === 'plan') return PROVIDERS_SETTINGS_PLAN_BADGE
  if (item.kind === 'preset') return PROVIDERS_SETTINGS_PRESET_BADGE
  return PROVIDERS_SETTINGS_CUSTOM_BADGE
}

function isPlanProvider(item: ProviderProfileSnapshot): boolean {
  return item.kind === 'plan' || item.kind === 'token-plan'
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

function ProviderListGroup({
  label,
  count,
  children,
}: {
  label: string
  count: number
  children: ReactNode
}): ReactElement {
  return (
    <div className="providers-settings-list-group">
      <div className="providers-settings-list-group-header">
        <span className="providers-settings-list-group-label">{label}</span>
        <span className="providers-settings-list-group-count">{count}</span>
      </div>
      {children}
    </div>
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

type Props = {
  settings: ProvidersSettingsSnapshot
  showApiKey?: boolean
  addMenuOpen?: boolean
  probeNotice?: InlineNotice | null
  probeBusy?: boolean
  probeMode?: 'test' | 'fetch'
  invalidBaseUrl?: boolean
  onSettingsChange?: (next: ProvidersSettingsSnapshot) => void
  onShowApiKeyChange?: (value: boolean) => void
  onAddMenuOpenChange?: (value: boolean) => void
}

export function ProvidersSettingsSection({
  settings,
  showApiKey = false,
  addMenuOpen = false,
  probeNotice = null,
  probeBusy = false,
  probeMode = 'test',
  invalidBaseUrl = false,
  onSettingsChange,
  onShowApiKeyChange,
  onAddMenuOpenChange,
}: Props): ReactElement {
  const addMenuRef = useRef<HTMLDivElement>(null)
  const displayProviders = settings.providers
  const activeProvider =
    displayProviders.find((item) => item.id === settings.activeProviderId) ?? displayProviders[0]
  const planProviders = displayProviders.filter(isPlanProvider)
  const apiProviders = displayProviders.filter((item) => !isPlanProvider(item))
  const grouped = planProviders.length > 0
  const isDraftActive = Boolean(activeProvider?.isDraft)
  const canEditActiveProviderId = Boolean(
    activeProvider && activeProvider.kind === 'custom' && !activeProvider.isDraft,
  )

  useEffect(() => {
    if (!addMenuOpen) return
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target
      if (target instanceof Node && addMenuRef.current?.contains(target)) return
      onAddMenuOpenChange?.(false)
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onAddMenuOpenChange?.(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [addMenuOpen, onAddMenuOpenChange])

  const selectProvider = (id: string): void => {
    onSettingsChange?.({ ...settings, activeProviderId: id })
  }

  const updateProxy = (patch: Partial<Pick<ProvidersSettingsSnapshot, 'proxyEnabled' | 'proxyUrl'>>): void => {
    onSettingsChange?.({ ...settings, ...patch })
  }

  const updateActiveProvider = (patch: Partial<ProviderProfileSnapshot>): void => {
    if (!activeProvider) return
    onSettingsChange?.({
      ...settings,
      providers: settings.providers.map((item) =>
        item.id === activeProvider.id ? { ...item, ...patch } : item,
      ),
    })
  }

  const toggleCapability = (
    key: 'image' | 'speech' | 'textToSpeech' | 'music' | 'video',
    enabled: boolean,
  ): void => {
    if (!activeProvider) return
    const defaults: ProviderCapabilitySnapshot = {
      enabled: true,
      protocol: 'openai-compatible',
      baseUrl: activeProvider.baseUrl,
      models: [],
    }
    updateActiveProvider({
      [key]: enabled ? activeProvider[key] ?? defaults : undefined,
    })
  }

  const updateCapabilityModels = (
    key: 'image' | 'speech' | 'textToSpeech' | 'music' | 'video',
    models: string[],
  ): void => {
    if (!activeProvider?.[key]) return
    updateActiveProvider({
      [key]: { ...activeProvider[key]!, models },
    })
  }

  const renderProviderButton = (item: ProviderProfileSnapshot): ReactElement => {
    const selected = activeProvider?.id === item.id
    const inUse = !item.isDraft && settings.inUseProviderId === item.id
    const missingKey = !item.apiKey.trim()
    const hasVision = Object.values(item.modelProfiles ?? {}).some((profile) => profile.vision)
    return (
      <button
        key={item.id}
        type="button"
        aria-pressed={selected}
        onClick={() => selectProvider(item.id)}
        className={
          selected
            ? 'providers-settings-provider-btn is-selected'
            : 'providers-settings-provider-btn'
        }
      >
        <div className="providers-settings-provider-btn-title-row">
          <span className="providers-settings-provider-btn-name">
            {item.name.trim() || item.id}
          </span>
          {item.isDraft ? (
            <ProviderBadge tone="warning">{PROVIDERS_SETTINGS_DRAFT_BADGE}</ProviderBadge>
          ) : null}
          {inUse ? <ProviderBadge tone="accent">{PROVIDERS_SETTINGS_IN_USE_BADGE}</ProviderBadge> : null}
          {!item.isDraft && missingKey ? (
            <ProviderBadge tone="warning">{PROVIDERS_SETTINGS_MISSING_KEY_BADGE}</ProviderBadge>
          ) : null}
        </div>
        <div className="providers-settings-provider-btn-meta">
          <span>{formatProviderModelCount(providerModelCount(item))}</span>
          <span aria-hidden="true">·</span>
          <span>{providerKindLabel(item)}</span>
          {item.apiKey.trim() ? (
            <KeyRound className="providers-settings-provider-btn-icon" strokeWidth={1.9} />
          ) : null}
          {item.image?.enabled ? (
            <ImageIcon className="providers-settings-provider-btn-icon" strokeWidth={1.9} />
          ) : null}
          {hasVision ? (
            <span className="providers-settings-provider-btn-vision">{PROVIDERS_SETTINGS_VISION_BADGE}</span>
          ) : null}
          {item.speech?.enabled ? (
            <Mic className="providers-settings-provider-btn-icon" strokeWidth={1.9} />
          ) : null}
          {item.textToSpeech?.enabled ? (
            <AudioLines className="providers-settings-provider-btn-icon" strokeWidth={1.9} />
          ) : null}
          {item.music?.enabled ? (
            <Music2 className="providers-settings-provider-btn-icon" strokeWidth={1.9} />
          ) : null}
          {item.video?.enabled ? (
            <Clapperboard className="providers-settings-provider-btn-icon" strokeWidth={1.9} />
          ) : null}
        </div>
      </button>
    )
  }

  return (
    <SettingsCard title={PROVIDERS_SETTINGS_TITLE}>
      <SettingRow
        title={PROVIDERS_SETTINGS_PROXY_URL_LABEL}
        description={PROVIDERS_SETTINGS_PROXY_URL_DESC}
        control={
          <div className="providers-settings-proxy">
            <label className="providers-settings-proxy-toggle">
              <span>{PROVIDERS_SETTINGS_PROXY_ENABLED_LABEL}</span>
              <Toggle
                checked={settings.proxyEnabled}
                onChange={(enabled) => updateProxy({ proxyEnabled: enabled })}
              />
            </label>
            <input
              className="settings-text-input"
              placeholder={PROVIDERS_SETTINGS_PROXY_URL_PLACEHOLDER}
              value={settings.proxyUrl}
              spellCheck={false}
              onChange={(e) => updateProxy({ proxyUrl: e.target.value })}
            />
          </div>
        }
      />

      <SettingRow
        title={PROVIDERS_SETTINGS_TITLE}
        description={PROVIDERS_SETTINGS_DESC}
        wideControl
        control={
          <div className="providers-settings-layout">
            <div className="providers-settings-sidebar">
              {grouped ? (
                <>
                  <ProviderListGroup label={PROVIDERS_SETTINGS_GROUP_PLANS} count={planProviders.length}>
                    <div className="providers-settings-provider-list">
                      {planProviders.map(renderProviderButton)}
                    </div>
                  </ProviderListGroup>
                  <ProviderListGroup label={PROVIDERS_SETTINGS_GROUP_API} count={apiProviders.length}>
                    <div className="providers-settings-provider-list">
                      {apiProviders.map(renderProviderButton)}
                    </div>
                  </ProviderListGroup>
                </>
              ) : (
                <div className="providers-settings-provider-list">
                  {displayProviders.map(renderProviderButton)}
                </div>
              )}

              <div ref={addMenuRef} className="providers-settings-add-menu-wrap">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={addMenuOpen}
                  onClick={() => onAddMenuOpenChange?.(!addMenuOpen)}
                  className="providers-settings-add-btn"
                >
                  <Plus className="providers-settings-add-btn-icon" strokeWidth={1.9} />
                  {PROVIDERS_SETTINGS_ADD_PROVIDER}
                  <ChevronDown className="providers-settings-add-btn-icon" strokeWidth={1.9} />
                </button>
                {addMenuOpen ? (
                  <div role="menu" className="providers-settings-add-menu">
                    <div className="providers-settings-add-menu-heading">
                      {PROVIDERS_SETTINGS_GROUP_PLANS}
                    </div>
                    <button type="button" role="menuitem" className="providers-settings-add-menu-item">
                      <span>Claude Code</span>
                      <span className="providers-settings-add-menu-tag">{PROVIDERS_SETTINGS_PLAN_BADGE}</span>
                    </button>
                    <div className="providers-settings-add-menu-divider" />
                    <div className="providers-settings-add-menu-heading">
                      {PROVIDERS_SETTINGS_GROUP_API}
                    </div>
                    <button type="button" role="menuitem" className="providers-settings-add-menu-item">
                      <span>OpenAI</span>
                      <span className="providers-settings-add-menu-tag">{PROVIDERS_SETTINGS_PRESET_BADGE}</span>
                    </button>
                    <button type="button" role="menuitem" className="providers-settings-add-menu-item">
                      <span>DeepSeek</span>
                      <span className="providers-settings-add-menu-tag">{PROVIDERS_SETTINGS_PRESET_UPDATE_TAG}</span>
                    </button>
                    <div className="providers-settings-add-menu-divider" />
                    <button type="button" role="menuitem" className="providers-settings-add-menu-item">
                      {PROVIDERS_SETTINGS_ADD_MENU_CUSTOM}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {activeProvider ? (
              <div className="providers-settings-detail">
                <div className="providers-settings-detail-header">
                  <div className="providers-settings-detail-title-row">
                    <span className="providers-settings-detail-name">
                      {activeProvider.name.trim() || activeProvider.id}
                    </span>
                    <span className="providers-settings-detail-id">{activeProvider.id}</span>
                    {!canEditActiveProviderId ? (
                      <span title={PROVIDERS_SETTINGS_PROVIDER_ID_LOCKED} className="providers-settings-detail-lock">
                        <Lock className="providers-settings-detail-lock-icon" strokeWidth={1.9} />
                      </span>
                    ) : null}
                  </div>
                  <button type="button" disabled={probeBusy} className="providers-settings-test-btn">
                    {probeBusy && probeMode === 'test' ? (
                      <Loader2 className="providers-settings-test-btn-icon is-spinning" strokeWidth={1.9} />
                    ) : (
                      <PlugZap className="providers-settings-test-btn-icon" strokeWidth={1.9} />
                    )}
                    {PROVIDERS_SETTINGS_TEST_CONNECTION}
                  </button>
                </div>

                {probeNotice ? <InlineNoticeView notice={probeNotice} /> : null}

                <DetailSection title={PROVIDERS_SETTINGS_SECTION_BASICS}>
                  <div className="providers-settings-field-grid">
                    <label className="providers-settings-field">
                      {PROVIDERS_SETTINGS_PROVIDER_NAME}
                      <input
                        className="settings-text-input"
                        value={activeProvider.name}
                        onChange={(e) => updateActiveProvider({ name: e.target.value })}
                      />
                    </label>
                    <label className="providers-settings-field">
                      {PROVIDERS_SETTINGS_PROVIDER_ID}
                      <span className="providers-settings-id-wrap">
                        <input
                          className={
                            canEditActiveProviderId
                              ? 'settings-text-input providers-settings-id-input'
                              : 'settings-text-input providers-settings-id-input is-readonly'
                          }
                          value={activeProvider.id}
                          readOnly={!canEditActiveProviderId}
                          spellCheck={false}
                        />
                        {!canEditActiveProviderId ? (
                          <span title={PROVIDERS_SETTINGS_PROVIDER_ID_LOCKED} className="providers-settings-id-lock">
                            <Lock className="providers-settings-detail-lock-icon" strokeWidth={1.9} />
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </div>
                </DetailSection>

                <DetailSection title={PROVIDERS_SETTINGS_SECTION_CONNECTION}>
                  <label className="providers-settings-field">
                    {PROVIDERS_SETTINGS_API_KEY}
                    <SettingsSecretInput
                      value={activeProvider.apiKey}
                      onChange={(value) => updateActiveProvider({ apiKey: value })}
                      visible={showApiKey}
                      onToggleVisibility={() => onShowApiKeyChange?.(!showApiKey)}
                      placeholder={PROVIDERS_SETTINGS_API_KEY_PLACEHOLDER}
                      autoComplete="off"
                      showLabel={PROVIDERS_SETTINGS_SHOW_SECRET}
                      hideLabel={PROVIDERS_SETTINGS_HIDE_SECRET}
                    />
                  </label>
                  <label className="providers-settings-field">
                    {PROVIDERS_SETTINGS_BASE_URL}
                    <input
                      className="settings-text-input"
                      value={activeProvider.baseUrl}
                      placeholder={PROVIDERS_SETTINGS_BASE_URL_PLACEHOLDER}
                      spellCheck={false}
                      onChange={(e) => updateActiveProvider({ baseUrl: e.target.value })}
                    />
                    {invalidBaseUrl ? (
                      <span className="providers-settings-url-warning">{PROVIDERS_SETTINGS_INVALID_URL}</span>
                    ) : null}
                  </label>
                  <label className="providers-settings-field">
                    {PROVIDERS_SETTINGS_ENDPOINT_FORMAT}
                    <select
                      className={SETTINGS_SELECT_CLASS}
                      value={activeProvider.endpointFormat}
                      onChange={(e) =>
                        updateActiveProvider({
                          endpointFormat: e.target.value as ModelEndpointFormat,
                        })
                      }
                    >
                      {Object.entries(PROVIDERS_SETTINGS_ENDPOINT_FORMAT_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {activeProvider.endpointFormat === 'custom_endpoint' ? (
                    <p className="providers-settings-muted-copy">{PROVIDERS_SETTINGS_CUSTOM_ENDPOINT_DESC}</p>
                  ) : null}
                </DetailSection>

                <DetailSection
                  title={`${PROVIDERS_SETTINGS_MODELS} · ${providerModelCount(activeProvider)}`}
                  action={
                    <button type="button" disabled={probeBusy} className="providers-settings-fetch-btn">
                      {probeBusy && probeMode === 'fetch' ? (
                        <Loader2 className="providers-settings-fetch-btn-icon is-spinning" strokeWidth={1.9} />
                      ) : (
                        <Download className="providers-settings-fetch-btn-icon" strokeWidth={1.9} />
                      )}
                      {PROVIDERS_SETTINGS_FETCH_MODELS}
                    </button>
                  }
                >
                  <ProviderModelsManager
                    snapshot={{
                      models: providerModelEntriesFromIds(
                        activeProvider.models,
                        activeProvider.modelProfiles,
                      ),
                      providerEndpointFormat:
                        PROVIDERS_SETTINGS_ENDPOINT_FORMAT_LABELS[activeProvider.endpointFormat],
                    }}
                  />
                </DetailSection>

                {(
                  [
                    ['image', PROVIDERS_SETTINGS_IMAGE_CAPABILITY, PROVIDERS_SETTINGS_IMAGE_CAPABILITY_DESC],
                    ['speech', PROVIDERS_SETTINGS_SPEECH_CAPABILITY, PROVIDERS_SETTINGS_SPEECH_CAPABILITY_DESC],
                    [
                      'textToSpeech',
                      PROVIDERS_SETTINGS_TTS_CAPABILITY,
                      PROVIDERS_SETTINGS_TTS_CAPABILITY_DESC,
                    ],
                    ['music', PROVIDERS_SETTINGS_MUSIC_CAPABILITY, PROVIDERS_SETTINGS_MUSIC_CAPABILITY_DESC],
                    ['video', PROVIDERS_SETTINGS_VIDEO_CAPABILITY, PROVIDERS_SETTINGS_VIDEO_CAPABILITY_DESC],
                  ] as const
                ).map(([key, title, desc]) => {
                  const capability = activeProvider[key]
                  const capabilityFieldLabels =
                    key === 'image'
                      ? {
                          protocol: PROVIDERS_SETTINGS_IMAGE_PROTOCOL,
                          baseUrl: PROVIDERS_SETTINGS_IMAGE_BASE_URL,
                          baseUrlPlaceholder: PROVIDERS_SETTINGS_IMAGE_BASE_URL_PLACEHOLDER,
                          models: PROVIDERS_SETTINGS_IMAGE_MODEL,
                        }
                      : key === 'speech'
                        ? {
                            protocol: PROVIDERS_SETTINGS_SPEECH_PROTOCOL,
                            baseUrl: PROVIDERS_SETTINGS_SPEECH_BASE_URL,
                            baseUrlPlaceholder: PROVIDERS_SETTINGS_BASE_URL_PLACEHOLDER,
                            models: PROVIDERS_SETTINGS_SPEECH_MODELS,
                          }
                        : key === 'textToSpeech'
                          ? {
                              protocol: PROVIDERS_SETTINGS_TTS_PROTOCOL,
                              baseUrl: PROVIDERS_SETTINGS_TTS_BASE_URL,
                              baseUrlPlaceholder: PROVIDERS_SETTINGS_BASE_URL_PLACEHOLDER,
                              models: PROVIDERS_SETTINGS_TTS_MODEL,
                            }
                          : key === 'music'
                            ? {
                                protocol: PROVIDERS_SETTINGS_MUSIC_PROTOCOL,
                                baseUrl: PROVIDERS_SETTINGS_MUSIC_BASE_URL,
                                baseUrlPlaceholder: PROVIDERS_SETTINGS_BASE_URL_PLACEHOLDER,
                                models: PROVIDERS_SETTINGS_MUSIC_MODEL,
                              }
                            : {
                                protocol: PROVIDERS_SETTINGS_VIDEO_PROTOCOL,
                                baseUrl: PROVIDERS_SETTINGS_VIDEO_BASE_URL,
                                baseUrlPlaceholder: PROVIDERS_SETTINGS_BASE_URL_PLACEHOLDER,
                                models: PROVIDERS_SETTINGS_VIDEO_MODEL,
                              }
                  return (
                    <DetailSection
                      key={key}
                      title={title}
                      action={
                        <Toggle
                          checked={Boolean(capability?.enabled)}
                          onChange={(value) => toggleCapability(key, value)}
                        />
                      }
                    >
                      <p className="providers-settings-muted-copy">{desc}</p>
                      {capability?.enabled ? (
                        <div className="providers-settings-field-grid">
                          <label className="providers-settings-field">
                            {capabilityFieldLabels.protocol}
                            <select className={SETTINGS_SELECT_CLASS} defaultValue={capability.protocol}>
                              <option value={capability.protocol}>{capability.protocol}</option>
                            </select>
                          </label>
                          <label className="providers-settings-field">
                            {capabilityFieldLabels.baseUrl}
                            <input
                              className="settings-text-input"
                              value={capability.baseUrl}
                              placeholder={capabilityFieldLabels.baseUrlPlaceholder}
                              spellCheck={false}
                              readOnly
                            />
                          </label>
                          <label className="providers-settings-field is-wide">
                            {capabilityFieldLabels.models}
                            <ModelChipsInput
                              key={`${activeProvider.id}-${key}`}
                              values={capability.models}
                              onChange={(models) => updateCapabilityModels(key, models)}
                              placeholder={PROVIDERS_SETTINGS_MODELS_PLACEHOLDER}
                              inputAriaLabel={title}
                              removeLabel={formatProviderModelRemove}
                            />
                          </label>
                        </div>
                      ) : null}
                    </DetailSection>
                  )
                })}

                {isDraftActive ? (
                  <DetailSection title={PROVIDERS_SETTINGS_DRAFT_SECTION}>
                    <div className="providers-settings-draft-actions">
                      <button type="button" className="providers-settings-draft-confirm">
                        <Plus className="providers-settings-draft-confirm-icon" strokeWidth={2} />
                        {PROVIDERS_SETTINGS_DRAFT_CONFIRM}
                      </button>
                      <button type="button" className="providers-settings-draft-discard">
                        {PROVIDERS_SETTINGS_DRAFT_DISCARD}
                      </button>
                      <span className="providers-settings-draft-hint">
                        {activeProvider.apiKey.trim()
                          ? PROVIDERS_SETTINGS_DRAFT_HINT_READY
                          : PROVIDERS_SETTINGS_DRAFT_HINT_NO_KEY}
                      </span>
                    </div>
                  </DetailSection>
                ) : activeProvider.kind !== 'default' ? (
                  <DetailSection title={PROVIDERS_SETTINGS_SECTION_DANGER}>
                    <div className="providers-settings-danger-actions">
                      <button type="button" className="providers-settings-remove-btn">
                        <Trash2 className="providers-settings-remove-btn-icon" strokeWidth={1.9} />
                        {PROVIDERS_SETTINGS_REMOVE_PROVIDER}
                      </button>
                      <span className="providers-settings-draft-hint">{PROVIDERS_SETTINGS_DANGER_HINT}</span>
                    </div>
                  </DetailSection>
                ) : null}
              </div>
            ) : null}
          </div>
        }
      />
    </SettingsCard>
  )
}

export type ProvidersPreviewMode =
  | 'default'
  | 'empty'
  | 'missingKey'
  | 'draft'
  | 'probing'
  | 'probeError'
  | 'probeSuccess'
  | 'grouped'
  | 'addMenu'
  | 'capabilities'
  | 'invalidUrl'

export function ProvidersSettingsSectionPreview({
  mode = 'default',
}: {
  mode?: ProvidersPreviewMode
}): ReactElement {
  const initialSettings =
    mode === 'empty'
      ? PROVIDERS_SETTINGS_PREVIEW_EMPTY
      : mode === 'grouped'
        ? PROVIDERS_SETTINGS_PREVIEW_GROUPED
        : mode === 'draft'
          ? {
              ...PROVIDERS_SETTINGS_PREVIEW_DEFAULT,
              activeProviderId: DRAFT_PROVIDER.id,
              providers: [...PROVIDERS_SETTINGS_PREVIEW_DEFAULT.providers, DRAFT_PROVIDER],
            }
          : mode === 'missingKey'
            ? {
                ...PROVIDERS_SETTINGS_PREVIEW_DEFAULT,
                activeProviderId: 'openai',
              }
            : mode === 'capabilities'
              ? {
                  ...PROVIDERS_SETTINGS_PREVIEW_DEFAULT,
                  activeProviderId: 'openai',
                }
              : PROVIDERS_SETTINGS_PREVIEW_DEFAULT

  const [settings, setSettings] = useState<ProvidersSettingsSnapshot>(initialSettings)
  const [showApiKey, setShowApiKey] = useState(false)
  const [addMenuOpen, setAddMenuOpen] = useState(mode === 'addMenu')

  const probeNotice: InlineNotice | null =
    mode === 'probing'
      ? { tone: 'info', message: PROVIDERS_SETTINGS_TESTING }
      : mode === 'probeError'
        ? { tone: 'error', message: formatProviderTestFailed('401 Unauthorized') }
        : mode === 'probeSuccess'
          ? { tone: 'success', message: formatProviderTestSuccess(142, 12) }
          : null

  return (
    <ProvidersSettingsSection
      settings={settings}
      showApiKey={showApiKey}
      addMenuOpen={addMenuOpen}
      probeNotice={probeNotice}
      probeBusy={mode === 'probing'}
      probeMode="test"
      invalidBaseUrl={mode === 'invalidUrl'}
      onSettingsChange={setSettings}
      onShowApiKeyChange={setShowApiKey}
      onAddMenuOpenChange={setAddMenuOpen}
    />
  )
}
