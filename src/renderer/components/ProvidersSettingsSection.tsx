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
  Pencil,
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

export type ModelEndpointFormat =
  | 'chat_completions'
  | 'responses'
  | 'messages'
  | 'custom_endpoint'

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

const ENDPOINT_FORMAT_LABELS: Record<ModelEndpointFormat, string> = {
  chat_completions: 'Chat completions (/v1/chat/completions)',
  responses: 'Responses API (/v1/responses)',
  messages: 'Messages API (/v1/messages)',
  custom_endpoint: 'Custom endpoint',
}

const COPY = {
  providers: 'Providers',
  providersDesc: 'Configure model providers, API keys, and available models.',
  proxyUrl: 'Proxy',
  proxyUrlDesc: 'Optional HTTP proxy for provider API requests.',
  proxyEnabled: 'Enable proxy',
  proxyUrlPlaceholder: 'http://127.0.0.1:7890',
  modelProviderAdd: 'Add provider',
  modelProviderAddMenuCustom: 'Custom provider…',
  modelProviderGroupPlans: 'Plans & subscriptions',
  modelProviderGroupApi: 'API providers',
  modelProviderInUse: 'In use',
  modelProviderMissingKey: 'No API key',
  modelProviderDraftBadge: 'Draft',
  modelProviderDefaultBadge: 'Default',
  modelProviderPresetBadge: 'Preset',
  modelProviderPlanBadge: 'Plan',
  modelProviderCustomBadge: 'Custom',
  modelProviderTokenPlanBadge: 'Token plan',
  modelProviderModelCount: (total: number) => `${total} models`,
  modelProviderVisionBadge: 'Vision',
  modelProviderSectionBasics: 'Provider basics',
  modelProviderSectionConnection: 'Provider connection',
  modelProviderSectionDanger: 'Danger zone',
  modelProviderTestConnection: 'Test connection',
  modelProviderFetchModels: 'Fetch from API',
  modelProviderName: 'Provider name',
  modelProviderId: 'Provider ID',
  modelProviderIdLocked: 'Provider ID locked',
  modelProviderApiKey: 'Provider API key',
  modelProviderApiKeyPlaceholder: 'Enter provider API key',
  modelProviderBaseUrl: 'Provider base URL',
  baseUrlPlaceholder: 'https://api.example.com/v1',
  modelProviderInvalidUrl: 'Enter a valid http(s) URL.',
  modelProviderEndpointFormat: 'Endpoint format',
  modelEndpointCustomEndpointDesc:
    'Custom endpoint providers use a fully qualified URL path configured per model.',
  modelProviderModels: 'Provider models',
  providerModelListDesc: 'Models available for chat and capability routing.',
  providerModelEmpty: 'No models yet. Add one manually or fetch from the API.',
  modelProviderModelsPlaceholder: 'Type a model ID and press Enter',
  modelProviderImageCapability: 'Image capability',
  modelProviderImageCapabilityDesc: 'Enable image generation models for this provider.',
  modelProviderSpeechCapability: 'Speech capability',
  modelProviderSpeechCapabilityDesc: 'Enable speech-to-text models for this provider.',
  modelProviderTextToSpeechCapability: 'Text-to-speech capability',
  modelProviderTextToSpeechCapabilityDesc: 'Enable text-to-speech models for this provider.',
  modelProviderMusicCapability: 'Music capability',
  modelProviderMusicCapabilityDesc: 'Enable music generation models for this provider.',
  modelProviderVideoCapability: 'Video capability',
  modelProviderVideoCapabilityDesc: 'Enable video generation models for this provider.',
  imageGenProtocol: 'Image protocol',
  imageGenBaseUrl: 'Image base URL',
  imageGenBaseUrlPlaceholder: 'https://api.example.com/v1',
  imageGenModel: 'Image models',
  speechToTextProtocol: 'Speech protocol',
  speechToTextBaseUrl: 'Speech base URL',
  speechToTextModels: 'Speech models',
  textToSpeechProtocol: 'TTS protocol',
  textToSpeechBaseUrl: 'TTS base URL',
  textToSpeechModel: 'TTS models',
  musicGenerationProtocol: 'Music protocol',
  musicGenerationBaseUrl: 'Music base URL',
  musicGenerationModel: 'Music models',
  videoGenerationProtocol: 'Video protocol',
  videoGenerationBaseUrl: 'Video base URL',
  videoGenerationModel: 'Video models',
  modelProviderDraftSection: 'Draft provider',
  modelProviderDraftConfirm: 'Add provider',
  modelProviderDraftDiscard: 'Discard draft',
  modelProviderDraftHintReady: 'Ready to add — API key is set.',
  modelProviderDraftHintNoKey: 'Add an API key before saving this provider.',
  modelProviderRemove: 'Remove provider',
  modelProviderDangerHint: 'Removing a provider cannot be undone.',
  modelProviderTesting: 'Testing connection…',
  modelProviderTestFailed: (message: string) => `Connection failed: ${message}`,
  modelProviderTestSuccess: (latency: number, total: number) =>
    `Connected in ${latency}ms · ${total} models available`,
  modelProviderFetchedModels: (total: number) => `Fetched ${total} models from API`,
  showSecret: 'Show',
  hideSecret: 'Hide',
  modelProviderPresetUpdateTag: 'Update',
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
  if (item.kind === 'default') return COPY.modelProviderDefaultBadge
  if (item.kind === 'token-plan') return COPY.modelProviderTokenPlanBadge
  if (item.kind === 'plan') return COPY.modelProviderPlanBadge
  if (item.kind === 'preset') return COPY.modelProviderPresetBadge
  return COPY.modelProviderCustomBadge
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

function ProviderModelsListPreview({
  models,
}: {
  models: string[]
}): ReactElement {
  if (models.length === 0) {
    return <p className="providers-settings-model-empty">{COPY.providerModelEmpty}</p>
  }
  return (
    <ul className="providers-settings-model-list">
      {models.map((modelId) => (
        <li key={modelId} className="providers-settings-model-row">
          <div className="providers-settings-model-row-main">
            <span className="providers-settings-model-id">{modelId}</span>
            <span className="providers-settings-model-kind">Chat</span>
          </div>
          <button type="button" className="providers-settings-model-edit" aria-label="Edit model">
            <Pencil className="providers-settings-model-edit-icon" strokeWidth={1.8} />
          </button>
        </li>
      ))}
    </ul>
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
            <ProviderBadge tone="warning">{COPY.modelProviderDraftBadge}</ProviderBadge>
          ) : null}
          {inUse ? <ProviderBadge tone="accent">{COPY.modelProviderInUse}</ProviderBadge> : null}
          {!item.isDraft && missingKey ? (
            <ProviderBadge tone="warning">{COPY.modelProviderMissingKey}</ProviderBadge>
          ) : null}
        </div>
        <div className="providers-settings-provider-btn-meta">
          <span>{COPY.modelProviderModelCount(providerModelCount(item))}</span>
          <span aria-hidden="true">·</span>
          <span>{providerKindLabel(item)}</span>
          {item.apiKey.trim() ? (
            <KeyRound className="providers-settings-provider-btn-icon" strokeWidth={1.9} />
          ) : null}
          {item.image?.enabled ? (
            <ImageIcon className="providers-settings-provider-btn-icon" strokeWidth={1.9} />
          ) : null}
          {hasVision ? (
            <span className="providers-settings-provider-btn-vision">{COPY.modelProviderVisionBadge}</span>
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
    <SettingsCard title={COPY.providers}>
      <SettingRow
        title={COPY.proxyUrl}
        description={COPY.proxyUrlDesc}
        control={
          <div className="providers-settings-proxy">
            <label className="providers-settings-proxy-toggle">
              <span>{COPY.proxyEnabled}</span>
              <Toggle
                checked={settings.proxyEnabled}
                onChange={(enabled) => updateProxy({ proxyEnabled: enabled })}
              />
            </label>
            <input
              className="settings-text-input"
              placeholder={COPY.proxyUrlPlaceholder}
              value={settings.proxyUrl}
              spellCheck={false}
              onChange={(e) => updateProxy({ proxyUrl: e.target.value })}
            />
          </div>
        }
      />

      <SettingRow
        title={COPY.providers}
        description={COPY.providersDesc}
        wideControl
        control={
          <div className="providers-settings-layout">
            <div className="providers-settings-sidebar">
              {grouped ? (
                <>
                  <ProviderListGroup label={COPY.modelProviderGroupPlans} count={planProviders.length}>
                    <div className="providers-settings-provider-list">
                      {planProviders.map(renderProviderButton)}
                    </div>
                  </ProviderListGroup>
                  <ProviderListGroup label={COPY.modelProviderGroupApi} count={apiProviders.length}>
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
                  {COPY.modelProviderAdd}
                  <ChevronDown className="providers-settings-add-btn-icon" strokeWidth={1.9} />
                </button>
                {addMenuOpen ? (
                  <div role="menu" className="providers-settings-add-menu">
                    <div className="providers-settings-add-menu-heading">
                      {COPY.modelProviderGroupPlans}
                    </div>
                    <button type="button" role="menuitem" className="providers-settings-add-menu-item">
                      <span>Claude Code</span>
                      <span className="providers-settings-add-menu-tag">{COPY.modelProviderPlanBadge}</span>
                    </button>
                    <div className="providers-settings-add-menu-divider" />
                    <div className="providers-settings-add-menu-heading">
                      {COPY.modelProviderGroupApi}
                    </div>
                    <button type="button" role="menuitem" className="providers-settings-add-menu-item">
                      <span>OpenAI</span>
                      <span className="providers-settings-add-menu-tag">{COPY.modelProviderPresetBadge}</span>
                    </button>
                    <button type="button" role="menuitem" className="providers-settings-add-menu-item">
                      <span>DeepSeek</span>
                      <span className="providers-settings-add-menu-tag">{COPY.modelProviderPresetUpdateTag}</span>
                    </button>
                    <div className="providers-settings-add-menu-divider" />
                    <button type="button" role="menuitem" className="providers-settings-add-menu-item">
                      {COPY.modelProviderAddMenuCustom}
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
                      <span title={COPY.modelProviderIdLocked} className="providers-settings-detail-lock">
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
                    {COPY.modelProviderTestConnection}
                  </button>
                </div>

                {probeNotice ? <InlineNoticeView notice={probeNotice} /> : null}

                <DetailSection title={COPY.modelProviderSectionBasics}>
                  <div className="providers-settings-field-grid">
                    <label className="providers-settings-field">
                      {COPY.modelProviderName}
                      <input
                        className="settings-text-input"
                        value={activeProvider.name}
                        onChange={(e) => updateActiveProvider({ name: e.target.value })}
                      />
                    </label>
                    <label className="providers-settings-field">
                      {COPY.modelProviderId}
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
                          <span title={COPY.modelProviderIdLocked} className="providers-settings-id-lock">
                            <Lock className="providers-settings-detail-lock-icon" strokeWidth={1.9} />
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </div>
                </DetailSection>

                <DetailSection title={COPY.modelProviderSectionConnection}>
                  <label className="providers-settings-field">
                    {COPY.modelProviderApiKey}
                    <SettingsSecretInput
                      value={activeProvider.apiKey}
                      onChange={(value) => updateActiveProvider({ apiKey: value })}
                      visible={showApiKey}
                      onToggleVisibility={() => onShowApiKeyChange?.(!showApiKey)}
                      placeholder={COPY.modelProviderApiKeyPlaceholder}
                      autoComplete="off"
                      showLabel={COPY.showSecret}
                      hideLabel={COPY.hideSecret}
                    />
                  </label>
                  <label className="providers-settings-field">
                    {COPY.modelProviderBaseUrl}
                    <input
                      className="settings-text-input"
                      value={activeProvider.baseUrl}
                      placeholder={COPY.baseUrlPlaceholder}
                      spellCheck={false}
                      onChange={(e) => updateActiveProvider({ baseUrl: e.target.value })}
                    />
                    {invalidBaseUrl ? (
                      <span className="providers-settings-url-warning">{COPY.modelProviderInvalidUrl}</span>
                    ) : null}
                  </label>
                  <label className="providers-settings-field">
                    {COPY.modelProviderEndpointFormat}
                    <select
                      className={SETTINGS_SELECT_CLASS}
                      value={activeProvider.endpointFormat}
                      onChange={(e) =>
                        updateActiveProvider({
                          endpointFormat: e.target.value as ModelEndpointFormat,
                        })
                      }
                    >
                      {Object.entries(ENDPOINT_FORMAT_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {activeProvider.endpointFormat === 'custom_endpoint' ? (
                    <p className="providers-settings-muted-copy">{COPY.modelEndpointCustomEndpointDesc}</p>
                  ) : null}
                </DetailSection>

                <DetailSection
                  title={`${COPY.modelProviderModels} · ${providerModelCount(activeProvider)}`}
                  action={
                    <button type="button" disabled={probeBusy} className="providers-settings-fetch-btn">
                      {probeBusy && probeMode === 'fetch' ? (
                        <Loader2 className="providers-settings-fetch-btn-icon is-spinning" strokeWidth={1.9} />
                      ) : (
                        <Download className="providers-settings-fetch-btn-icon" strokeWidth={1.9} />
                      )}
                      {COPY.modelProviderFetchModels}
                    </button>
                  }
                >
                  <p className="providers-settings-muted-copy">{COPY.providerModelListDesc}</p>
                  <ProviderModelsListPreview models={activeProvider.models} />
                </DetailSection>

                {(
                  [
                    ['image', COPY.modelProviderImageCapability, COPY.modelProviderImageCapabilityDesc],
                    ['speech', COPY.modelProviderSpeechCapability, COPY.modelProviderSpeechCapabilityDesc],
                    [
                      'textToSpeech',
                      COPY.modelProviderTextToSpeechCapability,
                      COPY.modelProviderTextToSpeechCapabilityDesc,
                    ],
                    ['music', COPY.modelProviderMusicCapability, COPY.modelProviderMusicCapabilityDesc],
                    ['video', COPY.modelProviderVideoCapability, COPY.modelProviderVideoCapabilityDesc],
                  ] as const
                ).map(([key, title, desc]) => {
                  const capability = activeProvider[key]
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
                            {COPY.imageGenProtocol}
                            <select className={SETTINGS_SELECT_CLASS} defaultValue={capability.protocol}>
                              <option value={capability.protocol}>{capability.protocol}</option>
                            </select>
                          </label>
                          <label className="providers-settings-field">
                            {COPY.imageGenBaseUrl}
                            <input
                              className="settings-text-input"
                              value={capability.baseUrl}
                              placeholder={COPY.imageGenBaseUrlPlaceholder}
                              spellCheck={false}
                              readOnly
                            />
                          </label>
                          <label className="providers-settings-field is-wide">
                            {COPY.imageGenModel}
                            <input
                              className="settings-text-input"
                              value={capability.models.join(', ')}
                              placeholder={COPY.modelProviderModelsPlaceholder}
                              readOnly
                            />
                          </label>
                        </div>
                      ) : null}
                    </DetailSection>
                  )
                })}

                {isDraftActive ? (
                  <DetailSection title={COPY.modelProviderDraftSection}>
                    <div className="providers-settings-draft-actions">
                      <button type="button" className="providers-settings-draft-confirm">
                        <Plus className="providers-settings-draft-confirm-icon" strokeWidth={2} />
                        {COPY.modelProviderDraftConfirm}
                      </button>
                      <button type="button" className="providers-settings-draft-discard">
                        {COPY.modelProviderDraftDiscard}
                      </button>
                      <span className="providers-settings-draft-hint">
                        {activeProvider.apiKey.trim()
                          ? COPY.modelProviderDraftHintReady
                          : COPY.modelProviderDraftHintNoKey}
                      </span>
                    </div>
                  </DetailSection>
                ) : activeProvider.kind !== 'default' ? (
                  <DetailSection title={COPY.modelProviderSectionDanger}>
                    <div className="providers-settings-danger-actions">
                      <button type="button" className="providers-settings-remove-btn">
                        <Trash2 className="providers-settings-remove-btn-icon" strokeWidth={1.9} />
                        {COPY.modelProviderRemove}
                      </button>
                      <span className="providers-settings-draft-hint">{COPY.modelProviderDangerHint}</span>
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
      ? { tone: 'info', message: COPY.modelProviderTesting }
      : mode === 'probeError'
        ? { tone: 'error', message: COPY.modelProviderTestFailed('401 Unauthorized') }
        : mode === 'probeSuccess'
          ? { tone: 'success', message: COPY.modelProviderTestSuccess(142, 12) }
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
