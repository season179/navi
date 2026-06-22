// Speech-to-text settings section echoing Kun's settings-section-speech-to-text.tsx
// (../Kun/src/renderer/src/components/settings-section-speech-to-text.tsx).
// Visual only: mock form state and preview modes.

import { useState, type ReactElement } from 'react'
import { Loader2, PlugZap } from 'lucide-react'
import {
  formatSpeechToTextSettingsModelSelectDefaultOption,
  formatSpeechToTextSettingsProviderMissingKey,
  formatSpeechToTextSettingsTestFailed,
  SPEECH_TO_TEXT_SETTINGS_ADVANCED_DESC,
  SPEECH_TO_TEXT_SETTINGS_ADVANCED_LABEL,
  SPEECH_TO_TEXT_SETTINGS_API_KEY_DESC,
  SPEECH_TO_TEXT_SETTINGS_API_KEY_LABEL,
  SPEECH_TO_TEXT_SETTINGS_BASE_URL_DESC,
  SPEECH_TO_TEXT_SETTINGS_BASE_URL_LABEL,
  SPEECH_TO_TEXT_SETTINGS_BASE_URL_PLACEHOLDER,
  SPEECH_TO_TEXT_SETTINGS_ENABLED_DESC,
  SPEECH_TO_TEXT_SETTINGS_ENABLED_LABEL,
  SPEECH_TO_TEXT_SETTINGS_LANGUAGE_DESC,
  SPEECH_TO_TEXT_SETTINGS_LANGUAGE_LABEL,
  SPEECH_TO_TEXT_SETTINGS_MODEL_DESC,
  SPEECH_TO_TEXT_SETTINGS_MODEL_LABEL,
  SPEECH_TO_TEXT_SETTINGS_MODEL_PLACEHOLDER,
  SPEECH_TO_TEXT_SETTINGS_PROTOCOL_DESC,
  SPEECH_TO_TEXT_SETTINGS_PROTOCOL_LABEL,
  SPEECH_TO_TEXT_SETTINGS_PROVIDER_CUSTOM,
  SPEECH_TO_TEXT_SETTINGS_PROVIDER_DESC,
  SPEECH_TO_TEXT_SETTINGS_PROVIDER_LABEL,
  SPEECH_TO_TEXT_SETTINGS_TEST_ACTION,
  SPEECH_TO_TEXT_SETTINGS_TEST_DESC,
  SPEECH_TO_TEXT_SETTINGS_TEST_EMPTY_OK,
  SPEECH_TO_TEXT_SETTINGS_TEST_LABEL,
  SPEECH_TO_TEXT_SETTINGS_TESTING,
  SPEECH_TO_TEXT_SETTINGS_TIMEOUT_DESC,
  SPEECH_TO_TEXT_SETTINGS_TIMEOUT_LABEL,
  SPEECH_TO_TEXT_SETTINGS_TITLE,
  resolveSpeechToTextSettingsLanguageLabel,
  resolveSpeechToTextSettingsProtocolLabel,
} from '../../lib/speechToTextSettingsSection'
import {
  PROVIDERS_SETTINGS_HIDE_SECRET,
  PROVIDERS_SETTINGS_SHOW_SECRET,
} from '../../lib/providersSettingsSection'
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

  return (
    <SettingsCard title={SPEECH_TO_TEXT_SETTINGS_TITLE}>
      <SettingRow
        title={SPEECH_TO_TEXT_SETTINGS_ENABLED_LABEL}
        description={SPEECH_TO_TEXT_SETTINGS_ENABLED_DESC}
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
            title={SPEECH_TO_TEXT_SETTINGS_PROVIDER_LABEL}
            description={SPEECH_TO_TEXT_SETTINGS_PROVIDER_DESC}
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
                    {SPEECH_TO_TEXT_SETTINGS_PROVIDER_CUSTOM}
                  </option>
                </select>
                {!usingCustomProvider && !selectedProvider?.hasApiKey ? (
                  <p className="speech-to-text-provider-warning">
                    {formatSpeechToTextSettingsProviderMissingKey(
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
                title={SPEECH_TO_TEXT_SETTINGS_PROTOCOL_LABEL}
                description={SPEECH_TO_TEXT_SETTINGS_PROTOCOL_DESC}
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
                        {resolveSpeechToTextSettingsProtocolLabel(protocol)}
                      </option>
                    ))}
                  </select>
                }
              />
              <SettingRow
                title={SPEECH_TO_TEXT_SETTINGS_BASE_URL_LABEL}
                description={SPEECH_TO_TEXT_SETTINGS_BASE_URL_DESC}
                control={
                  <input
                    className="settings-text-input speech-to-text-text-input"
                    value={settings.baseUrl}
                    placeholder={SPEECH_TO_TEXT_SETTINGS_BASE_URL_PLACEHOLDER}
                    onChange={(event) => updateSettings({ baseUrl: event.target.value })}
                  />
                }
              />
              <SettingRow
                title={SPEECH_TO_TEXT_SETTINGS_API_KEY_LABEL}
                description={SPEECH_TO_TEXT_SETTINGS_API_KEY_DESC}
                control={
                  <SettingsSecretInput
                    value={settings.apiKey}
                    onChange={(value) => updateSettings({ apiKey: value })}
                    visible={showApiKey}
                    onToggleVisibility={() => setShowApiKey((value) => !value)}
                    autoComplete="off"
                    showLabel={PROVIDERS_SETTINGS_SHOW_SECRET}
                    hideLabel={PROVIDERS_SETTINGS_HIDE_SECRET}
                    className="speech-to-text-secret-input"
                  />
                }
              />
            </>
          ) : null}
          <SettingRow
            title={SPEECH_TO_TEXT_SETTINGS_MODEL_LABEL}
            description={SPEECH_TO_TEXT_SETTINGS_MODEL_DESC}
            control={
              <div className="speech-to-text-model-control">
                {usingCustomProvider ? (
                  <input
                    className="settings-text-input"
                    value={settings.model}
                    placeholder={SPEECH_TO_TEXT_SETTINGS_MODEL_PLACEHOLDER}
                    onChange={(event) => updateSettings({ model: event.target.value })}
                  />
                ) : (
                  <ModelSelect
                    value={speechModelOptions.includes(settings.model) ? settings.model : ''}
                    options={speechModelOptions}
                    defaultLabel={formatSpeechToTextSettingsModelSelectDefaultOption(
                      speechModelOptions[0] ?? '',
                    )}
                    selectClassName={SETTINGS_SELECT_CLASS}
                    onChange={(model) => updateSettings({ model })}
                  />
                )}
              </div>
            }
          />
          <SettingRow
            title={SPEECH_TO_TEXT_SETTINGS_LANGUAGE_LABEL}
            description={SPEECH_TO_TEXT_SETTINGS_LANGUAGE_DESC}
            control={
              <select
                className={SETTINGS_SELECT_CLASS}
                value={settings.language}
                onChange={(event) => updateSettings({ language: event.target.value })}
              >
                {SPEECH_LANGUAGE_OPTIONS.map((language) => (
                  <option key={language || 'auto'} value={language}>
                    {resolveSpeechToTextSettingsLanguageLabel(language)}
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
              title={SPEECH_TO_TEXT_SETTINGS_ADVANCED_LABEL}
              description={SPEECH_TO_TEXT_SETTINGS_ADVANCED_DESC}
              defaultOpen={initialAdvancedOpen}
            >
              <div className="speech-to-text-advanced-rows">
                <SettingRow
                  title={SPEECH_TO_TEXT_SETTINGS_TIMEOUT_LABEL}
                  description={SPEECH_TO_TEXT_SETTINGS_TIMEOUT_DESC}
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
            title={SPEECH_TO_TEXT_SETTINGS_TEST_LABEL}
            description={SPEECH_TO_TEXT_SETTINGS_TEST_DESC}
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
                  {testState === 'busy'
                    ? SPEECH_TO_TEXT_SETTINGS_TESTING
                    : SPEECH_TO_TEXT_SETTINGS_TEST_ACTION}
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
        ? { tone: 'success', message: SPEECH_TO_TEXT_SETTINGS_TEST_EMPTY_OK }
        : mode === 'testError'
          ? {
              tone: 'error',
              message: formatSpeechToTextSettingsTestFailed(
                '401 Unauthorized — invalid API key',
              ),
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
