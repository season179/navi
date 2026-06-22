// Image generation settings section echoing Kun's settings-section-image-generation.tsx
// (../Kun/src/renderer/src/components/settings-section-image-generation.tsx).
// Visual only: mock form state and preview modes.

import { useEffect, useState, type ReactElement } from 'react'
import {
  formatImageGenerationSettingsModelSelectDefaultOption,
  formatImageGenerationSettingsProviderMissingKey,
  IMAGE_GENERATION_SETTINGS_API_KEY_DESC,
  IMAGE_GENERATION_SETTINGS_API_KEY_LABEL,
  IMAGE_GENERATION_SETTINGS_BASE_URL_DESC,
  IMAGE_GENERATION_SETTINGS_BASE_URL_LABEL,
  IMAGE_GENERATION_SETTINGS_BASE_URL_PLACEHOLDER,
  IMAGE_GENERATION_SETTINGS_DEFAULT_SIZE_DESC,
  IMAGE_GENERATION_SETTINGS_DEFAULT_SIZE_LABEL,
  IMAGE_GENERATION_SETTINGS_ENABLED_DESC,
  IMAGE_GENERATION_SETTINGS_ENABLED_LABEL,
  IMAGE_GENERATION_SETTINGS_MODEL_DESC,
  IMAGE_GENERATION_SETTINGS_MODEL_LABEL,
  IMAGE_GENERATION_SETTINGS_MODEL_PLACEHOLDER,
  IMAGE_GENERATION_SETTINGS_MODEL_QUALITY_HINT,
  IMAGE_GENERATION_SETTINGS_PROTOCOL_DESC,
  IMAGE_GENERATION_SETTINGS_PROTOCOL_LABEL,
  IMAGE_GENERATION_SETTINGS_PROVIDER_CUSTOM,
  IMAGE_GENERATION_SETTINGS_PROVIDER_DESC,
  IMAGE_GENERATION_SETTINGS_PROVIDER_LABEL,
  IMAGE_GENERATION_SETTINGS_TIMEOUT_DESC,
  IMAGE_GENERATION_SETTINGS_TIMEOUT_LABEL,
  IMAGE_GENERATION_SETTINGS_TITLE,
  resolveImageGenerationSettingsProtocolLabel,
} from '../../lib/imageGenerationSettingsSection'
import {
  PROVIDERS_SETTINGS_HIDE_SECRET,
  PROVIDERS_SETTINGS_SHOW_SECRET,
} from '../../lib/providersSettingsSection'
import {
  InlineNoticeView,
  ModelSelect,
  SETTINGS_SELECT_CLASS,
  SettingsSecretInput,
  SettingRow,
  SettingsCard,
  Toggle,
} from './SettingsControls'

export const CUSTOM_IMAGE_GENERATION_PROVIDER_ID = 'custom'
const IMAGE_GENERATION_PROTOCOLS = ['openai-images', 'minimax-image'] as const
type ImageGenerationProtocol = (typeof IMAGE_GENERATION_PROTOCOLS)[number]
const DEFAULT_IMAGE_GENERATION_PROTOCOL: ImageGenerationProtocol = 'openai-images'

export type ImageGenerationSettings = {
  enabled: boolean
  providerId: string
  protocol: ImageGenerationProtocol
  baseUrl: string
  apiKey: string
  model: string
  defaultSize: string
  timeoutMs: number
}

export type ImageProviderSnapshot = {
  id: string
  name: string
  hasApiKey?: boolean
  image?: {
    protocol: ImageGenerationProtocol
    models: string[]
  }
}

export const IMAGE_GENERATION_PREVIEW_PROVIDERS: ImageProviderSnapshot[] = [
  {
    id: 'minimax',
    name: 'MiniMax',
    hasApiKey: true,
    image: {
      protocol: 'minimax-image',
      models: ['image-01'],
    },
  },
  {
    id: 'openai',
    name: 'OpenAI',
    hasApiKey: false,
    image: {
      protocol: 'openai-images',
      models: ['gpt-image-1'],
    },
  },
]

export const IMAGE_GENERATION_PREVIEW_DEFAULT: ImageGenerationSettings = {
  enabled: true,
  providerId: 'minimax',
  protocol: DEFAULT_IMAGE_GENERATION_PROTOCOL,
  baseUrl: '',
  apiKey: '',
  model: 'image-01',
  defaultSize: '1024x1024',
  timeoutMs: 180000,
}

type Props = {
  settings: ImageGenerationSettings
  onSettingsChange?: (next: ImageGenerationSettings) => void
  providers?: ImageProviderSnapshot[]
}

export function ImageGenerationSettingsSection({
  settings,
  onSettingsChange,
  providers = IMAGE_GENERATION_PREVIEW_PROVIDERS,
}: Props): ReactElement {
  const [showApiKey, setShowApiKey] = useState(false)
  const [defaultSizeInput, setDefaultSizeInput] = useState(settings.defaultSize)

  useEffect(() => {
    setDefaultSizeInput(settings.defaultSize)
  }, [settings.defaultSize])

  const selectedProviderId = settings.providerId || CUSTOM_IMAGE_GENERATION_PROVIDER_ID
  const selectedProvider = providers.find((item) => item.id === selectedProviderId)
  const usingCustomProvider =
    selectedProviderId === CUSTOM_IMAGE_GENERATION_PROVIDER_ID || !selectedProvider
  const imageModelOptions = usingCustomProvider ? [] : selectedProvider?.image?.models ?? []

  const updateSettings = (patch: Partial<ImageGenerationSettings>): void => {
    onSettingsChange?.({ ...settings, ...patch })
  }

  return (
    <SettingsCard title={IMAGE_GENERATION_SETTINGS_TITLE}>
      <SettingRow
        title={IMAGE_GENERATION_SETTINGS_ENABLED_LABEL}
        description={IMAGE_GENERATION_SETTINGS_ENABLED_DESC}
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
            title={IMAGE_GENERATION_SETTINGS_PROVIDER_LABEL}
            description={IMAGE_GENERATION_SETTINGS_PROVIDER_DESC}
            control={
              <div className="image-generation-provider-control">
                <select
                  className={SETTINGS_SELECT_CLASS}
                  value={
                    usingCustomProvider ? CUSTOM_IMAGE_GENERATION_PROVIDER_ID : selectedProviderId
                  }
                  onChange={(event) => {
                    const providerId = event.target.value
                    const nextProvider = providers.find((item) => item.id === providerId)
                    updateSettings({
                      providerId,
                      protocol:
                        providerId === CUSTOM_IMAGE_GENERATION_PROVIDER_ID
                          ? settings.protocol
                          : nextProvider?.image?.protocol ?? DEFAULT_IMAGE_GENERATION_PROTOCOL,
                      model:
                        providerId === CUSTOM_IMAGE_GENERATION_PROVIDER_ID
                          ? settings.model
                          : nextProvider?.image?.models?.[0] ?? '',
                    })
                  }}
                >
                  {providers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                  <option value={CUSTOM_IMAGE_GENERATION_PROVIDER_ID}>
                    {IMAGE_GENERATION_SETTINGS_PROVIDER_CUSTOM}
                  </option>
                </select>
                {!usingCustomProvider && !selectedProvider?.hasApiKey ? (
                  <p className="image-generation-provider-warning">
                    {formatImageGenerationSettingsProviderMissingKey(
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
                title={IMAGE_GENERATION_SETTINGS_PROTOCOL_LABEL}
                description={IMAGE_GENERATION_SETTINGS_PROTOCOL_DESC}
                control={
                  <select
                    className={SETTINGS_SELECT_CLASS}
                    value={settings.protocol}
                    onChange={(event) =>
                      updateSettings({
                        protocol: event.target.value as ImageGenerationProtocol,
                      })
                    }
                  >
                    {IMAGE_GENERATION_PROTOCOLS.map((protocol) => (
                      <option key={protocol} value={protocol}>
                        {resolveImageGenerationSettingsProtocolLabel(protocol)}
                      </option>
                    ))}
                  </select>
                }
              />
              <SettingRow
                title={IMAGE_GENERATION_SETTINGS_BASE_URL_LABEL}
                description={IMAGE_GENERATION_SETTINGS_BASE_URL_DESC}
                control={
                  <input
                    className="settings-text-input image-generation-text-input"
                    value={settings.baseUrl}
                    placeholder={IMAGE_GENERATION_SETTINGS_BASE_URL_PLACEHOLDER}
                    onChange={(event) => updateSettings({ baseUrl: event.target.value })}
                  />
                }
              />
              <SettingRow
                title={IMAGE_GENERATION_SETTINGS_API_KEY_LABEL}
                description={IMAGE_GENERATION_SETTINGS_API_KEY_DESC}
                control={
                  <SettingsSecretInput
                    value={settings.apiKey}
                    onChange={(value) => updateSettings({ apiKey: value })}
                    visible={showApiKey}
                    onToggleVisibility={() => setShowApiKey((value) => !value)}
                    autoComplete="off"
                    showLabel={PROVIDERS_SETTINGS_SHOW_SECRET}
                    hideLabel={PROVIDERS_SETTINGS_HIDE_SECRET}
                    className="image-generation-secret-input"
                  />
                }
              />
            </>
          ) : null}
          <SettingRow
            title={IMAGE_GENERATION_SETTINGS_MODEL_LABEL}
            description={IMAGE_GENERATION_SETTINGS_MODEL_DESC}
            control={
              <div className="image-generation-model-control">
                {usingCustomProvider ? (
                  <input
                    className="settings-text-input"
                    value={settings.model}
                    placeholder={IMAGE_GENERATION_SETTINGS_MODEL_PLACEHOLDER}
                    onChange={(event) => updateSettings({ model: event.target.value })}
                  />
                ) : (
                  <ModelSelect
                    value={imageModelOptions.includes(settings.model) ? settings.model : ''}
                    options={imageModelOptions}
                    defaultLabel={formatImageGenerationSettingsModelSelectDefaultOption(
                      imageModelOptions[0] ?? '',
                    )}
                    selectClassName={SETTINGS_SELECT_CLASS}
                    onChange={(model) => updateSettings({ model })}
                  />
                )}
              </div>
            }
          />
          <div className="image-generation-quality-hint">
            <InlineNoticeView
              notice={{ tone: 'info', message: IMAGE_GENERATION_SETTINGS_MODEL_QUALITY_HINT }}
            />
          </div>
          <SettingRow
            title={IMAGE_GENERATION_SETTINGS_DEFAULT_SIZE_LABEL}
            description={IMAGE_GENERATION_SETTINGS_DEFAULT_SIZE_DESC}
            control={
              <input
                className="settings-text-input image-generation-size-input"
                value={defaultSizeInput}
                placeholder="1024x1024"
                onChange={(event) => setDefaultSizeInput(event.target.value)}
                onBlur={() => updateSettings({ defaultSize: defaultSizeInput })}
              />
            }
          />
          <SettingRow
            title={IMAGE_GENERATION_SETTINGS_TIMEOUT_LABEL}
            description={IMAGE_GENERATION_SETTINGS_TIMEOUT_DESC}
            control={
              <input
                type="number"
                min={10000}
                max={600000}
                step={10000}
                className="settings-text-input image-generation-timeout-input"
                value={settings.timeoutMs}
                onChange={(event) => updateSettings({ timeoutMs: Number(event.target.value) })}
              />
            }
          />
        </>
      ) : null}
    </SettingsCard>
  )
}

export type ImageGenerationPreviewMode = 'default' | 'disabled' | 'custom' | 'missingKey'

export function ImageGenerationSettingsSectionPreview({
  mode = 'default',
}: {
  mode?: ImageGenerationPreviewMode
}): ReactElement {
  const [settings, setSettings] = useState<ImageGenerationSettings>(() => {
    if (mode === 'disabled') {
      return { ...IMAGE_GENERATION_PREVIEW_DEFAULT, enabled: false }
    }
    if (mode === 'custom') {
      return {
        enabled: true,
        providerId: CUSTOM_IMAGE_GENERATION_PROVIDER_ID,
        protocol: 'openai-images',
        baseUrl: 'https://api.siliconflow.cn/v1',
        apiKey: 'sk-preview-key',
        model: 'gpt-image-1',
        defaultSize: '1024x1024',
        timeoutMs: 180000,
      }
    }
    if (mode === 'missingKey') {
      return {
        ...IMAGE_GENERATION_PREVIEW_DEFAULT,
        providerId: 'openai',
        model: 'gpt-image-1',
      }
    }
    return IMAGE_GENERATION_PREVIEW_DEFAULT
  })

  return (
    <ImageGenerationSettingsSection settings={settings} onSettingsChange={setSettings} />
  )
}
