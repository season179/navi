// Speech-to-text settings section echoing Kun's settings-section-speech-to-text.tsx
// (../Kun/src/renderer/src/components/settings-section-speech-to-text.tsx).
// Visual only: mock form state and preview modes.

import { useState, type ReactElement } from 'react'
import { Loader2, PlugZap } from 'lucide-react'
import {
  AdvancedSettingsDisclosure,
  InlineNoticeView,
  ModelSelect,
  SETTINGS_SELECT_CLASS,
  SettingsSecretInput,
  SettingRow,
  SettingsCard,
  Toggle,
  type InlineNotice,
} from './SettingsControls'

const CUSTOM_SPEECH_TO_TEXT_PROVIDER_ID = 'custom'
const SPEECH_TO_TEXT_PROTOCOLS = ['openai-transcriptions', 'mimo-asr'] as const
type SpeechToTextProtocol = (typeof SPEECH_TO_TEXT_PROTOCOLS)[number]
const DEFAULT_SPEECH_TO_TEXT_PROTOCOL: SpeechToTextProtocol = 'openai-transcriptions'

const SPEECH_LANGUAGE_OPTIONS = ['', 'zh', 'en', 'ja', 'ko'] as const

export type SpeechToTextSettings = {
  enabled: boolean
  providerId: string
  protocol: SpeechToTextProtocol
  baseUrl: string
  apiKey: string
  model: string
  language: string
  timeoutMs: number
}

export type SpeechProviderSnapshot = {
  id: string
  name: string
  hasApiKey?: boolean
  speech?: {
    protocol: SpeechToTextProtocol
    models: string[]
  }
}

export const SPEECH_TO_TEXT_PREVIEW_PROVIDERS: SpeechProviderSnapshot[] = [
  {
    id: 'xiaomi-mimo',
    name: 'Xiaomi MiMo',
    hasApiKey: true,
    speech: {
      protocol: 'mimo-asr',
      models: ['mimo-v2.5-asr'],
    },
  },
  {
    id: 'openai',
    name: 'OpenAI',
    hasApiKey: false,
    speech: {
      protocol: 'openai-transcriptions',
      models: ['whisper-1'],
    },
  },
]

export const SPEECH_TO_TEXT_PREVIEW_DEFAULT: SpeechToTextSettings = {
  enabled: true,
  providerId: 'xiaomi-mimo',
  protocol: DEFAULT_SPEECH_TO_TEXT_PROTOCOL,
  baseUrl: '',
  apiKey: '',
  model: 'mimo-v2.5-asr',
  language: '',
  timeoutMs: 60000,
}

const COPY = {
  speechToText: 'Speech to text',
  speechToTextEnabled: 'Enable speech to text',
  speechToTextEnabledDesc:
    'Adds a voice input button to the chat composer; recordings are transcribed by the selected provider. Xiaomi (MiMo) can reuse the key from Providers; custom OpenAI-compatible speech APIs are also supported.',
  speechToTextProvider: 'Speech provider',
  speechToTextProviderDesc:
    'Choose a configured provider that has speech models, or use a custom speech API.',
  speechToTextProviderCustom: 'Custom speech API',
  speechToTextProviderMissingKey: (provider: string) =>
    `${provider} has no API key yet. Add it in Providers.`,
  speechToTextProtocol: 'Speech protocol',
  speechToTextProtocolDesc:
    'Request shape used by the custom speech API. OpenAI Transcriptions calls {baseUrl}/audio/transcriptions; MiMo ASR sends base64 audio via chat/completions.',
  speechProtocolOpenAi: 'OpenAI Transcriptions',
  speechProtocolMimoAsr: 'MiMo ASR',
  speechToTextBaseUrl: 'Speech API base URL',
  speechToTextBaseUrlDesc: 'Speech endpoint root, e.g. https://api.xiaomimimo.com/v1.',
  speechToTextBaseUrlPlaceholder: 'https://api.xiaomimimo.com/v1',
  speechToTextApiKey: 'API key',
  speechToTextApiKeyDesc: 'Key for the speech provider. Independent from the chat model key.',
  speechToTextModel: 'Speech model',
  speechToTextModelDesc: 'Model id sent to the provider, e.g. mimo-v2.5-asr or whisper-1.',
  speechToTextModelPlaceholder: 'mimo-v2.5-asr',
  speechToTextLanguage: 'Language',
  speechToTextLanguageDesc: 'Optional language hint such as zh or en. Leave empty for auto-detect.',
  speechLanguage_auto: 'Auto detect',
  speechLanguage_zh: 'Chinese',
  speechLanguage_en: 'English',
  speechLanguage_ja: 'Japanese',
  speechLanguage_ko: 'Korean',
  speechToTextAdvanced: 'Advanced options',
  speechToTextAdvancedDesc: 'Rarely needed settings such as the request timeout.',
  speechToTextTimeout: 'Timeout (ms)',
  speechToTextTimeoutDesc: 'Per-request timeout for the speech transcription API.',
  speechToTextTest: 'Test transcription',
  speechToTextTestDesc:
    'Send a built-in test clip to verify the current provider, key, and model configuration.',
  speechToTextTestAction: 'Test',
  speechToTextTesting: 'Testing…',
  speechToTextTestSuccess: (text: string) => `Transcription works. Returned: ${text}`,
  speechToTextTestEmptyOk:
    'Auth and endpoint are working (the test tone having no transcript is expected).',
  speechToTextTestFailed: (message: string) => `Test failed: ${message}`,
  showSecret: 'Show',
  hideSecret: 'Hide',
  modelSelectDefaultOption: (model: string) => (model ? `Default (${model})` : 'Default'),
}

type Props = {
  settings: SpeechToTextSettings
  onSettingsChange?: (next: SpeechToTextSettings) => void
  providers?: SpeechProviderSnapshot[]
  testState?: 'idle' | 'busy' | InlineNotice
  onRunTest?: () => void
  initialAdvancedOpen?: boolean
}

export function SpeechToTextSettingsSection({
  settings,
  onSettingsChange,
  providers = SPEECH_TO_TEXT_PREVIEW_PROVIDERS,
  testState = 'idle',
  onRunTest,
  initialAdvancedOpen = false,
}: Props): ReactElement {
  const [showApiKey, setShowApiKey] = useState(false)

  const selectedProviderId = settings.providerId || CUSTOM_SPEECH_TO_TEXT_PROVIDER_ID
  const selectedProvider = providers.find((item) => item.id === selectedProviderId)
  const usingCustomProvider =
    selectedProviderId === CUSTOM_SPEECH_TO_TEXT_PROVIDER_ID || !selectedProvider
  const speechModelOptions = usingCustomProvider ? [] : selectedProvider?.speech?.models ?? []

  const updateSettings = (patch: Partial<SpeechToTextSettings>): void => {
    onSettingsChange?.({ ...settings, ...patch })
  }

  const languageLabel = (language: string): string => {
    if (language === 'zh') return COPY.speechLanguage_zh
    if (language === 'en') return COPY.speechLanguage_en
    if (language === 'ja') return COPY.speechLanguage_ja
    if (language === 'ko') return COPY.speechLanguage_ko
    if (!language) return COPY.speechLanguage_auto
    return language
  }

  return (
    <SettingsCard title={COPY.speechToText}>
      <SettingRow
        title={COPY.speechToTextEnabled}
        description={COPY.speechToTextEnabledDesc}
        control={
          <Toggle
            checked={settings.enabled}
            onChange={(enabled) => updateSettings({ enabled })}
          />
        }
      />
      {settings.enabled ? (
        <>
          <SettingRow
            title={COPY.speechToTextProvider}
            description={COPY.speechToTextProviderDesc}
            control={
              <div className="speech-to-text-provider-control">
                <select
                  className={SETTINGS_SELECT_CLASS}
                  value={
                    usingCustomProvider ? CUSTOM_SPEECH_TO_TEXT_PROVIDER_ID : selectedProviderId
                  }
                  onChange={(event) => {
                    const providerId = event.target.value
                    const nextProvider = providers.find((item) => item.id === providerId)
                    updateSettings({
                      providerId,
                      baseUrl:
                        providerId === CUSTOM_SPEECH_TO_TEXT_PROVIDER_ID ? settings.baseUrl : '',
                      apiKey:
                        providerId === CUSTOM_SPEECH_TO_TEXT_PROVIDER_ID ? settings.apiKey : '',
                      protocol:
                        providerId === CUSTOM_SPEECH_TO_TEXT_PROVIDER_ID
                          ? settings.protocol
                          : nextProvider?.speech?.protocol ?? DEFAULT_SPEECH_TO_TEXT_PROTOCOL,
                      model:
                        providerId === CUSTOM_SPEECH_TO_TEXT_PROVIDER_ID
                          ? settings.model
                          : nextProvider?.speech?.models?.[0] ?? '',
                    })
                  }}
                >
                  {providers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                  <option value={CUSTOM_SPEECH_TO_TEXT_PROVIDER_ID}>
                    {COPY.speechToTextProviderCustom}
                  </option>
                </select>
                {!usingCustomProvider && !selectedProvider?.hasApiKey ? (
                  <p className="speech-to-text-provider-warning">
                    {COPY.speechToTextProviderMissingKey(
                      selectedProvider?.name ?? selectedProviderId,
                    )}
                  </p>
                ) : null}
              </div>
            }
          />
          {usingCustomProvider ? (
            <>
              <SettingRow
                title={COPY.speechToTextProtocol}
                description={COPY.speechToTextProtocolDesc}
                control={
                  <select
                    className={SETTINGS_SELECT_CLASS}
                    value={settings.protocol}
                    onChange={(event) =>
                      updateSettings({ protocol: event.target.value as SpeechToTextProtocol })
                    }
                  >
                    {SPEECH_TO_TEXT_PROTOCOLS.map((protocol) => (
                      <option key={protocol} value={protocol}>
                        {protocol === 'mimo-asr'
                          ? COPY.speechProtocolMimoAsr
                          : COPY.speechProtocolOpenAi}
                      </option>
                    ))}
                  </select>
                }
              />
              <SettingRow
                title={COPY.speechToTextBaseUrl}
                description={COPY.speechToTextBaseUrlDesc}
                control={
                  <input
                    className="settings-text-input speech-to-text-text-input"
                    value={settings.baseUrl}
                    placeholder={COPY.speechToTextBaseUrlPlaceholder}
                    onChange={(event) => updateSettings({ baseUrl: event.target.value })}
                  />
                }
              />
              <SettingRow
                title={COPY.speechToTextApiKey}
                description={COPY.speechToTextApiKeyDesc}
                control={
                  <SettingsSecretInput
                    value={settings.apiKey}
                    onChange={(value) => updateSettings({ apiKey: value })}
                    visible={showApiKey}
                    onToggleVisibility={() => setShowApiKey((value) => !value)}
                    autoComplete="off"
                    showLabel={COPY.showSecret}
                    hideLabel={COPY.hideSecret}
                    className="speech-to-text-secret-input"
                  />
                }
              />
            </>
          ) : null}
          <SettingRow
            title={COPY.speechToTextModel}
            description={COPY.speechToTextModelDesc}
            control={
              <div className="speech-to-text-model-control">
                {usingCustomProvider ? (
                  <input
                    className="settings-text-input"
                    value={settings.model}
                    placeholder={COPY.speechToTextModelPlaceholder}
                    onChange={(event) => updateSettings({ model: event.target.value })}
                  />
                ) : (
                  <ModelSelect
                    value={speechModelOptions.includes(settings.model) ? settings.model : ''}
                    options={speechModelOptions}
                    defaultLabel={COPY.modelSelectDefaultOption(speechModelOptions[0] ?? '')}
                    selectClassName={SETTINGS_SELECT_CLASS}
                    onChange={(model) => updateSettings({ model })}
                  />
                )}
              </div>
            }
          />
          <SettingRow
            title={COPY.speechToTextLanguage}
            description={COPY.speechToTextLanguageDesc}
            control={
              <select
                className={SETTINGS_SELECT_CLASS}
                value={settings.language}
                onChange={(event) => updateSettings({ language: event.target.value })}
              >
                {SPEECH_LANGUAGE_OPTIONS.map((language) => (
                  <option key={language || 'auto'} value={language}>
                    {languageLabel(language)}
                  </option>
                ))}
                {!SPEECH_LANGUAGE_OPTIONS.includes(
                  settings.language as (typeof SPEECH_LANGUAGE_OPTIONS)[number],
                ) ? (
                  <option value={settings.language}>{settings.language}</option>
                ) : null}
              </select>
            }
          />
          <div className="speech-to-text-advanced-wrap">
            <AdvancedSettingsDisclosure
              title={COPY.speechToTextAdvanced}
              description={COPY.speechToTextAdvancedDesc}
              defaultOpen={initialAdvancedOpen}
            >
              <div className="speech-to-text-advanced-rows">
                <SettingRow
                  title={COPY.speechToTextTimeout}
                  description={COPY.speechToTextTimeoutDesc}
                  control={
                    <input
                      type="number"
                      min={5000}
                      max={600000}
                      step={5000}
                      className="settings-text-input speech-to-text-timeout-input"
                      value={settings.timeoutMs}
                      onChange={(event) =>
                        updateSettings({ timeoutMs: Number(event.target.value) })
                      }
                    />
                  }
                />
              </div>
            </AdvancedSettingsDisclosure>
          </div>
          <SettingRow
            title={COPY.speechToTextTest}
            description={COPY.speechToTextTestDesc}
            control={
              <div className="speech-to-text-test-control">
                <button
                  type="button"
                  disabled={testState === 'busy'}
                  onClick={() => onRunTest?.()}
                  className="speech-to-text-test-button"
                >
                  {testState === 'busy' ? (
                    <Loader2 className="speech-to-text-test-icon is-spinning" strokeWidth={1.9} />
                  ) : (
                    <PlugZap className="speech-to-text-test-icon" strokeWidth={1.9} />
                  )}
                  {testState === 'busy' ? COPY.speechToTextTesting : COPY.speechToTextTestAction}
                </button>
                {typeof testState === 'object' ? <InlineNoticeView notice={testState} /> : null}
              </div>
            }
          />
        </>
      ) : null}
    </SettingsCard>
  )
}

export type SpeechToTextPreviewMode =
  | 'default'
  | 'disabled'
  | 'custom'
  | 'missingKey'
  | 'testing'
  | 'testSuccess'
  | 'testError'
  | 'advanced'

export function SpeechToTextSettingsSectionPreview({
  mode = 'default',
}: {
  mode?: SpeechToTextPreviewMode
}): ReactElement {
  const [settings, setSettings] = useState<SpeechToTextSettings>(() => {
    if (mode === 'disabled') {
      return { ...SPEECH_TO_TEXT_PREVIEW_DEFAULT, enabled: false }
    }
    if (mode === 'custom') {
      return {
        enabled: true,
        providerId: CUSTOM_SPEECH_TO_TEXT_PROVIDER_ID,
        protocol: 'mimo-asr',
        baseUrl: 'https://api.xiaomimimo.com/v1',
        apiKey: 'sk-preview-key',
        model: 'mimo-v2.5-asr',
        language: 'en',
        timeoutMs: 60000,
      }
    }
    if (mode === 'missingKey') {
      return {
        ...SPEECH_TO_TEXT_PREVIEW_DEFAULT,
        providerId: 'openai',
        model: 'whisper-1',
      }
    }
    return SPEECH_TO_TEXT_PREVIEW_DEFAULT
  })

  const testState: 'idle' | 'busy' | InlineNotice =
    mode === 'testing'
      ? 'busy'
      : mode === 'testSuccess'
        ? { tone: 'success', message: COPY.speechToTextTestEmptyOk }
        : mode === 'testError'
          ? {
              tone: 'error',
              message: COPY.speechToTextTestFailed('401 Unauthorized — invalid API key'),
            }
          : 'idle'

  return (
    <SpeechToTextSettingsSection
      settings={settings}
      onSettingsChange={setSettings}
      testState={testState}
      initialAdvancedOpen={mode === 'advanced'}
    />
  )
}
