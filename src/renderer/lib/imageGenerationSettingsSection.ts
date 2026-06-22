// Kun ImageGenerationSettingsSection chrome
// (../Kun/src/renderer/src/components/settings-section-image-generation.tsx).
// Visual only — used for production ImageGenerationSettingsSection and preview hooks.

/** English copy matching Kun's imageGen locale string. */
export const IMAGE_GENERATION_SETTINGS_TITLE = 'Image generation'

/** English copy matching Kun's imageGenEnabled locale string. */
export const IMAGE_GENERATION_SETTINGS_ENABLED_LABEL = 'Enable image generation'

/** English copy matching Kun's imageGenEnabledDesc locale string. */
export const IMAGE_GENERATION_SETTINGS_ENABLED_DESC =
  'Enables the generate_image tool in agent chats and powers infographic generation in Write. MiniMax can reuse the key from Providers; custom OpenAI-compatible image APIs are still supported.'

/** English copy matching Kun's imageGenProvider locale string. */
export const IMAGE_GENERATION_SETTINGS_PROVIDER_LABEL = 'Image provider'

/** English copy matching Kun's imageGenProviderDesc locale string. */
export const IMAGE_GENERATION_SETTINGS_PROVIDER_DESC =
  'Choose a configured provider that has image models, or use a custom image API.'

/** English copy matching Kun's imageGenProviderCustom locale string. */
export const IMAGE_GENERATION_SETTINGS_PROVIDER_CUSTOM = 'Custom image API'

/** English copy matching Kun's imageGenProtocol locale string. */
export const IMAGE_GENERATION_SETTINGS_PROTOCOL_LABEL = 'Image protocol'

/** English copy matching Kun's imageGenProtocolDesc locale string. */
export const IMAGE_GENERATION_SETTINGS_PROTOCOL_DESC =
  'Request shape used by the custom image API.'

/** English copy matching Kun's imageGenProtocolOpenAi locale string. */
export const IMAGE_GENERATION_SETTINGS_PROTOCOL_OPENAI = 'OpenAI Images'

/** English copy matching Kun's imageGenProtocolMiniMax locale string. */
export const IMAGE_GENERATION_SETTINGS_PROTOCOL_MINIMAX = 'MiniMax image_generation'

/** English copy matching Kun's imageGenBaseUrl locale string. */
export const IMAGE_GENERATION_SETTINGS_BASE_URL_LABEL = 'API base URL'

/** English copy matching Kun's imageGenBaseUrlDesc locale string. */
export const IMAGE_GENERATION_SETTINGS_BASE_URL_DESC =
  'OpenAI-compatible endpoint root; the tool calls {baseUrl}/images/generations.'

/** English copy matching Kun's imageGenBaseUrlPlaceholder locale string. */
export const IMAGE_GENERATION_SETTINGS_BASE_URL_PLACEHOLDER = 'https://api.siliconflow.cn/v1'

/** English copy matching Kun's imageGenApiKey locale string. */
export const IMAGE_GENERATION_SETTINGS_API_KEY_LABEL = 'API key'

/** English copy matching Kun's imageGenApiKeyDesc locale string. */
export const IMAGE_GENERATION_SETTINGS_API_KEY_DESC =
  'Key for the image provider. Independent from the chat model key.'

/** English copy matching Kun's imageGenModel locale string. */
export const IMAGE_GENERATION_SETTINGS_MODEL_LABEL = 'Image model'

/** English copy matching Kun's imageGenModelDesc locale string. */
export const IMAGE_GENERATION_SETTINGS_MODEL_DESC =
  'Model id sent to the provider, e.g. gpt-image-1 or Kwai-Kolors/Kolors.'

/** English copy matching Kun's imageGenModelQualityHint locale string. */
export const IMAGE_GENERATION_SETTINGS_MODEL_QUALITY_HINT =
  'For production design drafts and infographics, prefer GPT Image or Gemini image models. Current domestic image models are still inconsistent at layout and text-heavy work, and may not meet directly usable quality standards.'

/** English copy matching Kun's imageGenModelPlaceholder locale string. */
export const IMAGE_GENERATION_SETTINGS_MODEL_PLACEHOLDER = 'gpt-image-1'

/** English copy matching Kun's imageGenDefaultSize locale string. */
export const IMAGE_GENERATION_SETTINGS_DEFAULT_SIZE_LABEL = 'Default size'

/** English copy matching Kun's imageGenDefaultSizeDesc locale string. */
export const IMAGE_GENERATION_SETTINGS_DEFAULT_SIZE_DESC =
  'Optional "WxH" or "auto" used when the assistant does not pick a ratio. Leave empty for the provider default. Note: 2K previews may exceed the 5 MB attachment limit; the file is still saved to the workspace.'

/** English copy matching Kun's imageGenTimeout locale string. */
export const IMAGE_GENERATION_SETTINGS_TIMEOUT_LABEL = 'Timeout (ms)'

/** English copy matching Kun's imageGenTimeoutDesc locale string. */
export const IMAGE_GENERATION_SETTINGS_TIMEOUT_DESC =
  'Per-request timeout for the image API. Image models can take minutes at high resolutions.'

/** Format Kun's imageGenProviderMissingKey locale string. */
export function formatImageGenerationSettingsProviderMissingKey(provider: string): string {
  return `${provider} has no API key yet. Add it in Providers.`
}

/** Format Kun's modelSelectDefaultOption locale string. */
export function formatImageGenerationSettingsModelSelectDefaultOption(model: string): string {
  return model ? `Default (${model})` : 'Default'
}

/** Resolve Kun's imageGenProtocol* locale strings for a protocol id. */
export function resolveImageGenerationSettingsProtocolLabel(protocol: string): string {
  if (protocol === 'minimax-image') return IMAGE_GENERATION_SETTINGS_PROTOCOL_MINIMAX
  return IMAGE_GENERATION_SETTINGS_PROTOCOL_OPENAI
}
