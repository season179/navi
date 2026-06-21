// Image generation settings section echoing Kun's settings-section-image-generation.tsx
// (../Kun/src/renderer/src/components/settings-section-image-generation.tsx).
// Visual only: mock form state and preview modes.

import { useEffect, useState, type ReactElement } from 'react'
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

const COPY = {
  imageGen: 'Image generation',
  imageGenEnabled: 'Enable image generation',
  imageGenEnabledDesc:
    'Enables the generate_image tool in agent chats and powers infographic generation in Write. MiniMax can reuse the key from Providers; custom OpenAI-compatible image APIs are still supported.',
  imageGenProvider: 'Image provider',
  imageGenProviderDesc:
    'Choose a configured provider that has image models, or use a custom image API.',
  imageGenProviderCustom: 'Custom image API',
  imageGenProviderMissingKey: (provider: string) =>
    `${provider} has no API key yet. Add it in Providers.`,
  imageGenProtocol: 'Image protocol',
  imageGenProtocolDesc: 'Request shape used by the custom image API.',
  imageGenProtocolOpenAi: 'OpenAI Images',
  imageGenProtocolMiniMax: 'MiniMax image_generation',
  imageGenBaseUrl: 'API base URL',
  imageGenBaseUrlDesc:
    'OpenAI-compatible endpoint root; the tool calls {baseUrl}/images/generations.',
  imageGenBaseUrlPlaceholder: 'https://api.siliconflow.cn/v1',
  imageGenApiKey: 'API key',
  imageGenApiKeyDesc: 'Key for the image provider. Independent from the chat model key.',
  imageGenModel: 'Image model',
  imageGenModelDesc: 'Model id sent to the provider, e.g. gpt-image-1 or Kwai-Kolors/Kolors.',
  imageGenModelQualityHint:
    'For production design drafts and infographics, prefer GPT Image or Gemini image models. Current domestic image models are still inconsistent at layout and text-heavy work, and may not meet directly usable quality standards.',
  imageGenModelPlaceholder: 'gpt-image-1',
  imageGenDefaultSize: 'Default size',
  imageGenDefaultSizeDesc:
    'Optional "WxH" or "auto" used when the assistant does not pick a ratio. Leave empty for the provider default. Note: 2K previews may exceed the 5 MB attachment limit; the file is still saved to the workspace.',
  imageGenTimeout: 'Timeout (ms)',
  imageGenTimeoutDesc:
    'Per-request timeout for the image API. Image models can take minutes at high resolutions.',
  showSecret: 'Show',
  hideSecret: 'Hide',
  modelSelectDefaultOption: (model: string) => (model ? `Default (${model})` : 'Default'),
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
    <SettingsCard title={COPY.imageGen}>
      <SettingRow
        title={COPY.imageGenEnabled}
        description={COPY.imageGenEnabledDesc}
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
            title={COPY.imageGenProvider}
            description={COPY.imageGenProviderDesc}
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
                    {COPY.imageGenProviderCustom}
                  </option>
                </select>
                {!usingCustomProvider && !selectedProvider?.hasApiKey ? (
                  <p className="image-generation-provider-warning">
                    {COPY.imageGenProviderMissingKey(
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
                title={COPY.imageGenProtocol}
                description={COPY.imageGenProtocolDesc}
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
                        {protocol === 'minimax-image'
                          ? COPY.imageGenProtocolMiniMax
                          : COPY.imageGenProtocolOpenAi}
                      </option>
                    ))}
                  </select>
                }
              />
              <SettingRow
                title={COPY.imageGenBaseUrl}
                description={COPY.imageGenBaseUrlDesc}
                control={
                  <input
                    className="settings-text-input image-generation-text-input"
                    value={settings.baseUrl}
                    placeholder={COPY.imageGenBaseUrlPlaceholder}
                    onChange={(event) => updateSettings({ baseUrl: event.target.value })}
                  />
                }
              />
              <SettingRow
                title={COPY.imageGenApiKey}
                description={COPY.imageGenApiKeyDesc}
                control={
                  <SettingsSecretInput
                    value={settings.apiKey}
                    onChange={(value) => updateSettings({ apiKey: value })}
                    visible={showApiKey}
                    onToggleVisibility={() => setShowApiKey((value) => !value)}
                    autoComplete="off"
                    showLabel={COPY.showSecret}
                    hideLabel={COPY.hideSecret}
                    className="image-generation-secret-input"
                  />
                }
              />
            </>
          ) : null}
          <SettingRow
            title={COPY.imageGenModel}
            description={COPY.imageGenModelDesc}
            control={
              <div className="image-generation-model-control">
                {usingCustomProvider ? (
                  <input
                    className="settings-text-input"
                    value={settings.model}
                    placeholder={COPY.imageGenModelPlaceholder}
                    onChange={(event) => updateSettings({ model: event.target.value })}
                  />
                ) : (
                  <ModelSelect
                    value={imageModelOptions.includes(settings.model) ? settings.model : ''}
                    options={imageModelOptions}
                    defaultLabel={COPY.modelSelectDefaultOption(imageModelOptions[0] ?? '')}
                    selectClassName={SETTINGS_SELECT_CLASS}
                    onChange={(model) => updateSettings({ model })}
                  />
                )}
              </div>
            }
          />
          <div className="image-generation-quality-hint">
            <InlineNoticeView notice={{ tone: 'info', message: COPY.imageGenModelQualityHint }} />
          </div>
          <SettingRow
            title={COPY.imageGenDefaultSize}
            description={COPY.imageGenDefaultSizeDesc}
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
            title={COPY.imageGenTimeout}
            description={COPY.imageGenTimeoutDesc}
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
