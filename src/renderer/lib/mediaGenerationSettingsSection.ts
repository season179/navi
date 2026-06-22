// Kun MediaGenerationSettingsSection chrome
// (../Kun/src/renderer/src/components/settings-section-media-generation.tsx).
// Visual only — used for production MediaGenerationSettingsSection and preview hooks.

/** English copy matching Kun's mediaGeneration locale string. */
export const MEDIA_GENERATION_SETTINGS_TITLE = 'Media generation'

/** English copy matching Kun's mediaGenerationDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_DESC =
  'Expose speech, music, and video generation as agent tools. When enabled, Kun registers generate_speech, generate_music, and generate_video.'

/** English copy matching Kun's textToSpeech locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_TITLE = 'Speech generation'

/** English copy matching Kun's textToSpeechEnabled locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_ENABLED_LABEL = 'Enable speech generation'

/** English copy matching Kun's textToSpeechEnabledDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_ENABLED_DESC =
  'Enables the generate_speech tool in agent chats to synthesize text into audio files.'

/** English copy matching Kun's textToSpeechProvider locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_PROVIDER_LABEL = 'Speech generation provider'

/** English copy matching Kun's textToSpeechProviderDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_PROVIDER_DESC =
  'Choose a configured provider with TTS models, or use a custom speech generation API.'

/** English copy matching Kun's textToSpeechProviderCustom locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_PROVIDER_CUSTOM = 'Custom speech generation API'

/** English copy matching Kun's textToSpeechProtocol locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_PROTOCOL_LABEL = 'Speech generation protocol'

/** English copy matching Kun's textToSpeechProtocolDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_PROTOCOL_DESC =
  'Request shape used by the custom speech generation API.'

/** English copy matching Kun's textToSpeechProtocolOpenAi locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_PROTOCOL_OPENAI = 'OpenAI Speech'

/** English copy matching Kun's textToSpeechProtocolMiniMax locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_PROTOCOL_MINIMAX = 'MiniMax t2a_v2'

/** English copy matching Kun's textToSpeechProtocolMimo locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_PROTOCOL_MIMO = 'Xiaomi MiMo TTS'

/** English copy matching Kun's textToSpeechBaseUrl locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_BASE_URL_LABEL = 'API base URL'

/** English copy matching Kun's textToSpeechBaseUrlDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_BASE_URL_DESC =
  'Speech generation endpoint root, e.g. https://api.minimax.io or https://api.xiaomimimo.com/v1.'

/** English copy matching Kun's textToSpeechBaseUrlPlaceholder locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_BASE_URL_PLACEHOLDER = 'https://api.minimax.io'

/** English copy matching Kun's textToSpeechApiKey locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_API_KEY_LABEL = 'API key'

/** English copy matching Kun's textToSpeechApiKeyDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_API_KEY_DESC =
  'Key for the speech generation provider. Independent from the chat model key.'

/** English copy matching Kun's textToSpeechModel locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_MODEL_LABEL = 'Speech generation model'

/** English copy matching Kun's textToSpeechModelDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_MODEL_DESC =
  'Model id sent to the provider, e.g. speech-2.8-hd or mimo-v2.5-tts.'

/** English copy matching Kun's textToSpeechModelPlaceholder locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_MODEL_PLACEHOLDER = 'speech-2.8-hd'

/** English copy matching Kun's textToSpeechVoice locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_VOICE_LABEL = 'Voice'

/** English copy matching Kun's textToSpeechVoiceDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_VOICE_DESC =
  "Optional voice id/name. MiniMax falls back to male-qn-qingse; Xiaomi can use the provider's voice value."

/** English copy matching Kun's textToSpeechVoicePlaceholder locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_VOICE_PLACEHOLDER = 'male-qn-qingse'

/** English copy matching Kun's textToSpeechFormat locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_FORMAT_LABEL = 'Output format'

/** English copy matching Kun's textToSpeechFormatDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_FORMAT_DESC =
  'Default format for generated speech files.'

/** English copy matching Kun's textToSpeechTimeout locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_TIMEOUT_LABEL = 'Timeout (ms)'

/** English copy matching Kun's textToSpeechTimeoutDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_SPEECH_TIMEOUT_DESC =
  'Per-request timeout for speech generation.'

/** English copy matching Kun's musicGeneration locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_TITLE = 'Music generation'

/** English copy matching Kun's musicGenerationEnabled locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_ENABLED_LABEL = 'Enable music generation'

/** English copy matching Kun's musicGenerationEnabledDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_ENABLED_DESC =
  'Enables the generate_music tool in agent chats to create songs, instrumentals, or covers.'

/** English copy matching Kun's musicGenerationProvider locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_PROVIDER_LABEL = 'Music provider'

/** English copy matching Kun's musicGenerationProviderDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_PROVIDER_DESC =
  'Choose a configured provider with music models, or use a custom music generation API.'

/** English copy matching Kun's musicGenerationProviderCustom locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_PROVIDER_CUSTOM = 'Custom music generation API'

/** English copy matching Kun's musicGenerationProtocol locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_PROTOCOL_LABEL = 'Music generation protocol'

/** English copy matching Kun's musicGenerationProtocolDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_PROTOCOL_DESC =
  'Request shape used by the custom music generation API.'

/** English copy matching Kun's musicGenerationProtocolMiniMax locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_PROTOCOL_MINIMAX = 'MiniMax music_generation'

/** English copy matching Kun's musicGenerationBaseUrl locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_BASE_URL_LABEL = 'API base URL'

/** English copy matching Kun's musicGenerationBaseUrlDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_BASE_URL_DESC =
  'Music generation endpoint root, e.g. https://api.minimax.io.'

/** English copy matching Kun's musicGenerationBaseUrlPlaceholder locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_BASE_URL_PLACEHOLDER = 'https://api.minimax.io'

/** English copy matching Kun's musicGenerationApiKey locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_API_KEY_LABEL = 'API key'

/** English copy matching Kun's musicGenerationApiKeyDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_API_KEY_DESC =
  'Key for the music generation provider. Independent from the chat model key.'

/** English copy matching Kun's musicGenerationModel locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_MODEL_LABEL = 'Music model'

/** English copy matching Kun's musicGenerationModelDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_MODEL_DESC =
  'Model id sent to the provider, e.g. music-2.6 or music-cover.'

/** English copy matching Kun's musicGenerationModelPlaceholder locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_MODEL_PLACEHOLDER = 'music-2.6'

/** English copy matching Kun's musicGenerationFormat locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_FORMAT_LABEL = 'Output format'

/** English copy matching Kun's musicGenerationFormatDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_FORMAT_DESC =
  'Default format for generated music files.'

/** English copy matching Kun's musicGenerationTimeout locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_TIMEOUT_LABEL = 'Timeout (ms)'

/** English copy matching Kun's musicGenerationTimeoutDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_MUSIC_TIMEOUT_DESC =
  'Per-request timeout for music generation.'

/** English copy matching Kun's videoGeneration locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_TITLE = 'Video generation'

/** English copy matching Kun's videoGenerationEnabled locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_ENABLED_LABEL = 'Enable video generation'

/** English copy matching Kun's videoGenerationEnabledDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_ENABLED_DESC =
  'Enables the generate_video tool in agent chats, with text-to-video and optional first/last frame references.'

/** English copy matching Kun's videoGenerationProvider locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_PROVIDER_LABEL = 'Video provider'

/** English copy matching Kun's videoGenerationProviderDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_PROVIDER_DESC =
  'Choose a configured provider with video models, or use a custom video generation API.'

/** English copy matching Kun's videoGenerationProviderCustom locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_PROVIDER_CUSTOM = 'Custom video generation API'

/** English copy matching Kun's videoGenerationProtocol locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_PROTOCOL_LABEL = 'Video generation protocol'

/** English copy matching Kun's videoGenerationProtocolDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_PROTOCOL_DESC =
  'Request shape used by the custom video generation API.'

/** English copy matching Kun's videoGenerationProtocolMiniMax locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_PROTOCOL_MINIMAX = 'MiniMax video_generation'

/** English copy matching Kun's videoGenerationBaseUrl locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_BASE_URL_LABEL = 'API base URL'

/** English copy matching Kun's videoGenerationBaseUrlDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_BASE_URL_DESC =
  'Video generation endpoint root, e.g. https://api.minimax.io.'

/** English copy matching Kun's videoGenerationBaseUrlPlaceholder locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_BASE_URL_PLACEHOLDER = 'https://api.minimax.io'

/** English copy matching Kun's videoGenerationApiKey locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_API_KEY_LABEL = 'API key'

/** English copy matching Kun's videoGenerationApiKeyDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_API_KEY_DESC =
  'Key for the video generation provider. Independent from the chat model key.'

/** English copy matching Kun's videoGenerationModel locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_MODEL_LABEL = 'Video model'

/** English copy matching Kun's videoGenerationModelDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_MODEL_DESC =
  'Model id sent to the provider, e.g. MiniMax-Hailuo-2.3.'

/** English copy matching Kun's videoGenerationModelPlaceholder locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_MODEL_PLACEHOLDER = 'MiniMax-Hailuo-2.3'

/** English copy matching Kun's videoGenerationDefaultDuration locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_DEFAULT_DURATION_LABEL = 'Default duration (sec)'

/** English copy matching Kun's videoGenerationDefaultDurationDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_DEFAULT_DURATION_DESC =
  'Used when the agent does not specify a duration.'

/** English copy matching Kun's videoGenerationDefaultResolution locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_DEFAULT_RESOLUTION_LABEL = 'Default resolution'

/** English copy matching Kun's videoGenerationDefaultResolutionDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_DEFAULT_RESOLUTION_DESC =
  'Used when the agent does not specify a resolution.'

/** English copy matching Kun's videoGenerationTimeout locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_TIMEOUT_LABEL = 'Timeout (ms)'

/** English copy matching Kun's videoGenerationTimeoutDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_TIMEOUT_DESC = 'Total wait time for one video task.'

/** English copy matching Kun's videoGenerationPollInterval locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_POLL_INTERVAL_LABEL = 'Poll interval (ms)'

/** English copy matching Kun's videoGenerationPollIntervalDesc locale string. */
export const MEDIA_GENERATION_SETTINGS_VIDEO_POLL_INTERVAL_DESC =
  'How often the runtime checks asynchronous video task status.'

/** Format Kun's textToSpeechProviderMissingKey locale string. */
export function formatMediaGenerationSettingsProviderMissingKey(provider: string): string {
  return `${provider} has no API key yet. Add it in Providers.`
}

/** Format Kun's modelSelectDefaultOption locale string. */
export function formatMediaGenerationSettingsModelSelectDefaultOption(model: string): string {
  return model ? `Default (${model})` : 'Default'
}

/** Resolve Kun's textToSpeechProtocol* locale strings for a protocol id. */
export function resolveMediaGenerationSettingsSpeechProtocolLabel(protocol: string): string {
  if (protocol === 'minimax-t2a') return MEDIA_GENERATION_SETTINGS_SPEECH_PROTOCOL_MINIMAX
  if (protocol === 'mimo-tts') return MEDIA_GENERATION_SETTINGS_SPEECH_PROTOCOL_MIMO
  return MEDIA_GENERATION_SETTINGS_SPEECH_PROTOCOL_OPENAI
}
