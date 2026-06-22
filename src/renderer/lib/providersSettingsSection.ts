// Kun ProvidersSettingsSection chrome
// (../Kun/src/renderer/src/components/settings-section-providers.tsx).
// Visual only — used for production ProvidersSettingsSection and preview hooks.

export type ModelEndpointFormat =
  | 'chat_completions'
  | 'responses'
  | 'messages'
  | 'custom_endpoint'

/** English copy matching Kun's providers locale string. */
export const PROVIDERS_SETTINGS_TITLE = 'Providers'

/** English copy matching Kun's providersDesc locale string. */
export const PROVIDERS_SETTINGS_DESC =
  'API keys, service URLs, text models, and image capabilities live here. Assistant, Write, and image generation reuse these profiles.'

/** English copy matching Kun's proxyUrl locale string. */
export const PROVIDERS_SETTINGS_PROXY_URL_LABEL = 'Model request proxy'

/** English copy matching Kun's proxyUrlDesc locale string. */
export const PROVIDERS_SETTINGS_PROXY_URL_DESC =
  'Route only model-service HTTP requests through a proxy. Supports http, https, socks, socks4, and socks5 URLs.'

/** English copy matching Kun's proxyEnabled locale string. */
export const PROVIDERS_SETTINGS_PROXY_ENABLED_LABEL = 'Use proxy for model requests'

/** English copy matching Kun's proxyUrlPlaceholder locale string. */
export const PROVIDERS_SETTINGS_PROXY_URL_PLACEHOLDER = 'e.g. http://127.0.0.1:7890'

/** English copy matching Kun's modelProviderAdd locale string. */
export const PROVIDERS_SETTINGS_ADD_PROVIDER = 'Add provider'

/** English copy matching Kun's modelProviderAddMenuCustom locale string. */
export const PROVIDERS_SETTINGS_ADD_MENU_CUSTOM = 'Custom provider…'

/** English copy matching Kun's modelProviderGroupPlans locale string. */
export const PROVIDERS_SETTINGS_GROUP_PLANS = 'Subscription plans'

/** English copy matching Kun's modelProviderGroupApi locale string. */
export const PROVIDERS_SETTINGS_GROUP_API = 'Pay-as-you-go'

/** English copy matching Kun's modelProviderInUse locale string. */
export const PROVIDERS_SETTINGS_IN_USE_BADGE = 'In use'

/** English copy matching Kun's modelProviderMissingKey locale string. */
export const PROVIDERS_SETTINGS_MISSING_KEY_BADGE = 'No API key'

/** English copy matching Kun's modelProviderDraftBadge locale string. */
export const PROVIDERS_SETTINGS_DRAFT_BADGE = 'Unsaved'

/** English copy matching Kun's modelProviderDefaultBadge locale string. */
export const PROVIDERS_SETTINGS_DEFAULT_BADGE = 'Default'

/** English copy matching Kun's modelProviderPresetBadge locale string. */
export const PROVIDERS_SETTINGS_PRESET_BADGE = 'Preset'

/** English copy matching Kun's modelProviderPlanBadge locale string. */
export const PROVIDERS_SETTINGS_PLAN_BADGE = 'Plan'

/** English copy matching Kun's modelProviderCustomBadge locale string. */
export const PROVIDERS_SETTINGS_CUSTOM_BADGE = 'Custom'

/** English copy matching Kun's modelProviderTokenPlanBadge locale string. */
export const PROVIDERS_SETTINGS_TOKEN_PLAN_BADGE = 'Token Plan'

/** English copy matching Kun's modelProviderVisionBadge locale string. */
export const PROVIDERS_SETTINGS_VISION_BADGE = 'Vision'

/** English copy matching Kun's modelProviderSectionBasics locale string. */
export const PROVIDERS_SETTINGS_SECTION_BASICS = 'Basics'

/** English copy matching Kun's modelProviderSectionConnection locale string. */
export const PROVIDERS_SETTINGS_SECTION_CONNECTION = 'Connection'

/** English copy matching Kun's modelProviderSectionDanger locale string. */
export const PROVIDERS_SETTINGS_SECTION_DANGER = 'Danger zone'

/** English copy matching Kun's modelProviderTestConnection locale string. */
export const PROVIDERS_SETTINGS_TEST_CONNECTION = 'Test connection'

/** English copy matching Kun's modelProviderFetchModels locale string. */
export const PROVIDERS_SETTINGS_FETCH_MODELS = 'Fetch from API'

/** English copy matching Kun's modelProviderName locale string. */
export const PROVIDERS_SETTINGS_PROVIDER_NAME = 'Display name'

/** English copy matching Kun's modelProviderId locale string. */
export const PROVIDERS_SETTINGS_PROVIDER_ID = 'Provider ID'

/** English copy matching Kun's modelProviderIdLocked locale string. */
export const PROVIDERS_SETTINGS_PROVIDER_ID_LOCKED =
  'Default and preset provider IDs cannot be changed'

/** English copy matching Kun's modelProviderApiKey locale string. */
export const PROVIDERS_SETTINGS_API_KEY = 'API key'

/** English copy matching Kun's modelProviderApiKeyPlaceholder locale string. */
export const PROVIDERS_SETTINGS_API_KEY_PLACEHOLDER = "Enter this provider's API key"

/** English copy matching Kun's modelProviderBaseUrl locale string. */
export const PROVIDERS_SETTINGS_BASE_URL = 'Base URL'

/** English copy matching Kun's baseUrlPlaceholder locale string. */
export const PROVIDERS_SETTINGS_BASE_URL_PLACEHOLDER = 'e.g. https://api.deepseek.com'

/** English copy matching Kun's modelProviderInvalidUrl locale string. */
export const PROVIDERS_SETTINGS_INVALID_URL = 'URL must start with http:// or https://'

/** English copy matching Kun's modelProviderEndpointFormat locale string. */
export const PROVIDERS_SETTINGS_ENDPOINT_FORMAT = 'Endpoint format'

/** English copy matching Kun's modelEndpointCustomEndpointDesc locale string. */
export const PROVIDERS_SETTINGS_CUSTOM_ENDPOINT_DESC =
  'Uses this URL as the final endpoint. Only paths ending in /chat/completions, /completions, /responses, or /messages can be recognized; other endings are not supported.'

/** English copy matching Kun's modelProviderModels locale string. */
export const PROVIDERS_SETTINGS_MODELS = 'Models'

/** English copy matching Kun's providerModelListDesc locale string. */
export const PROVIDERS_SETTINGS_MODEL_LIST_DESC =
  'Add models here when the provider ships new ones, or fetch them from the API. Text, image, speech, music, and video models are grouped by capability; the sections below control protocol and endpoint details.'

/** English copy matching Kun's providerModelEmpty locale string. */
export const PROVIDERS_SETTINGS_MODEL_EMPTY =
  'No models yet. Click "Add model" to configure one, or use "Fetch from API".'

/** English copy matching Kun's modelProviderModelsPlaceholder locale string. */
export const PROVIDERS_SETTINGS_MODELS_PLACEHOLDER = 'Type a model ID and press Enter'

/** English copy matching Kun's modelProviderImageCapability locale string. */
export const PROVIDERS_SETTINGS_IMAGE_CAPABILITY = 'Image generation capability'

/** English copy matching Kun's modelProviderImageCapabilityDesc locale string. */
export const PROVIDERS_SETTINGS_IMAGE_CAPABILITY_DESC =
  'Optional. Providers with this capability can be selected by Image generation without re-entering credentials.'

/** English copy matching Kun's modelProviderSpeechCapability locale string. */
export const PROVIDERS_SETTINGS_SPEECH_CAPABILITY = 'Speech-to-text capability'

/** English copy matching Kun's modelProviderSpeechCapabilityDesc locale string. */
export const PROVIDERS_SETTINGS_SPEECH_CAPABILITY_DESC =
  'Optional. Providers with this capability can be selected by speech input without re-entering credentials.'

/** English copy matching Kun's modelProviderTextToSpeechCapability locale string. */
export const PROVIDERS_SETTINGS_TTS_CAPABILITY = 'Speech generation capability'

/** English copy matching Kun's modelProviderTextToSpeechCapabilityDesc locale string. */
export const PROVIDERS_SETTINGS_TTS_CAPABILITY_DESC =
  'Optional. Providers with this capability can be selected by agent speech generation without re-entering credentials.'

/** English copy matching Kun's modelProviderMusicCapability locale string. */
export const PROVIDERS_SETTINGS_MUSIC_CAPABILITY = 'Music generation capability'

/** English copy matching Kun's modelProviderMusicCapabilityDesc locale string. */
export const PROVIDERS_SETTINGS_MUSIC_CAPABILITY_DESC =
  'Optional. Providers with this capability can be selected by agent music generation without re-entering credentials.'

/** English copy matching Kun's modelProviderVideoCapability locale string. */
export const PROVIDERS_SETTINGS_VIDEO_CAPABILITY = 'Video generation capability'

/** English copy matching Kun's modelProviderVideoCapabilityDesc locale string. */
export const PROVIDERS_SETTINGS_VIDEO_CAPABILITY_DESC =
  'Optional. Providers with this capability can be selected by agent video generation without re-entering credentials.'

/** English copy matching Kun's imageGenProtocol locale string. */
export const PROVIDERS_SETTINGS_IMAGE_PROTOCOL = 'Image protocol'

/** English copy matching Kun's imageGenBaseUrl locale string. */
export const PROVIDERS_SETTINGS_IMAGE_BASE_URL = 'API base URL'

/** English copy matching Kun's imageGenBaseUrlPlaceholder locale string. */
export const PROVIDERS_SETTINGS_IMAGE_BASE_URL_PLACEHOLDER = 'https://api.siliconflow.cn/v1'

/** English copy matching Kun's imageGenModel locale string. */
export const PROVIDERS_SETTINGS_IMAGE_MODEL = 'Image model'

/** English copy matching Kun's speechToTextProtocol locale string. */
export const PROVIDERS_SETTINGS_SPEECH_PROTOCOL = 'Speech protocol'

/** English copy matching Kun's speechToTextBaseUrl locale string. */
export const PROVIDERS_SETTINGS_SPEECH_BASE_URL = 'Speech API base URL'

/** English copy matching Kun's speechToTextModels locale string. */
export const PROVIDERS_SETTINGS_SPEECH_MODELS = 'Speech models'

/** English copy matching Kun's textToSpeechProtocol locale string. */
export const PROVIDERS_SETTINGS_TTS_PROTOCOL = 'Speech generation protocol'

/** English copy matching Kun's textToSpeechBaseUrl locale string. */
export const PROVIDERS_SETTINGS_TTS_BASE_URL = 'API base URL'

/** English copy matching Kun's textToSpeechModel locale string. */
export const PROVIDERS_SETTINGS_TTS_MODEL = 'Speech generation model'

/** English copy matching Kun's musicGenerationProtocol locale string. */
export const PROVIDERS_SETTINGS_MUSIC_PROTOCOL = 'Music generation protocol'

/** English copy matching Kun's musicGenerationBaseUrl locale string. */
export const PROVIDERS_SETTINGS_MUSIC_BASE_URL = 'API base URL'

/** English copy matching Kun's musicGenerationModel locale string. */
export const PROVIDERS_SETTINGS_MUSIC_MODEL = 'Music model'

/** English copy matching Kun's videoGenerationProtocol locale string. */
export const PROVIDERS_SETTINGS_VIDEO_PROTOCOL = 'Video generation protocol'

/** English copy matching Kun's videoGenerationBaseUrl locale string. */
export const PROVIDERS_SETTINGS_VIDEO_BASE_URL = 'API base URL'

/** English copy matching Kun's videoGenerationModel locale string. */
export const PROVIDERS_SETTINGS_VIDEO_MODEL = 'Video model'

/** English copy matching Kun's modelProviderDraftSection locale string. */
export const PROVIDERS_SETTINGS_DRAFT_SECTION = 'Add this provider'

/** English copy matching Kun's modelProviderDraftConfirm locale string. */
export const PROVIDERS_SETTINGS_DRAFT_CONFIRM = 'Add'

/** English copy matching Kun's modelProviderDraftDiscard locale string. */
export const PROVIDERS_SETTINGS_DRAFT_DISCARD = 'Cancel'

/** English copy matching Kun's modelProviderDraftHintReady locale string. */
export const PROVIDERS_SETTINGS_DRAFT_HINT_READY =
  'Click Add to save this provider and switch to it.'

/** English copy matching Kun's modelProviderDraftHintNoKey locale string. */
export const PROVIDERS_SETTINGS_DRAFT_HINT_NO_KEY =
  'No API key yet — Add saves the configuration without making it the active provider.'

/** English copy matching Kun's modelProviderRemove locale string. */
export const PROVIDERS_SETTINGS_REMOVE_PROVIDER = 'Remove provider'

/** English copy matching Kun's modelProviderDangerHint locale string. */
export const PROVIDERS_SETTINGS_DANGER_HINT =
  'Deletion takes effect immediately; features using this provider fall back automatically.'

/** English copy matching Kun's modelProviderTesting locale string. */
export const PROVIDERS_SETTINGS_TESTING = 'Testing connection…'

/** English copy matching Kun's modelProviderPresetUpdateTag locale string. */
export const PROVIDERS_SETTINGS_PRESET_UPDATE_TAG = 'Update preset'

/** English copy matching Kun's showSecret locale string. */
export const PROVIDERS_SETTINGS_SHOW_SECRET = 'Show value'

/** English copy matching Kun's hideSecret locale string. */
export const PROVIDERS_SETTINGS_HIDE_SECRET = 'Hide value'

/** English copy matching Kun's modelEndpoint* locale strings. */
export const PROVIDERS_SETTINGS_ENDPOINT_FORMAT_LABELS: Record<ModelEndpointFormat, string> = {
  chat_completions: '/v1/chat/completions',
  responses: '/v1/responses',
  messages: '/v1/messages',
  custom_endpoint: 'Custom full endpoint',
}

/** English copy matching Kun's modelProviderModelCount locale template. */
export function formatProviderModelCount(total: number): string {
  return `${total} models`
}

/** English copy matching Kun's modelProviderModelRemove locale template. */
export function formatProviderModelRemove(model: string): string {
  return `Remove ${model}`
}

/** English copy matching Kun's modelProviderTestFailed locale template. */
export function formatProviderTestFailed(message: string): string {
  return `Connection failed: ${message}`
}

/** English copy matching Kun's modelProviderTestSuccess locale template. */
export function formatProviderTestSuccess(latency: number, total: number): string {
  return `Connected · ${latency}ms · upstream returned ${total} models`
}

/** English copy matching Kun's modelProviderFetchedModels locale template. */
export function formatProviderFetchedModels(total: number): string {
  return `Fetched ${total} new models`
}
