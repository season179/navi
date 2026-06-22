// Kun SpeechToTextSettingsSection chrome
// (../Kun/src/renderer/src/components/settings-section-speech-to-text.tsx).
// Visual only — used for production SpeechToTextSettingsSection and preview hooks.

/** English copy matching Kun's speechToText locale string. */
export const SPEECH_TO_TEXT_SETTINGS_TITLE = 'Speech to text'

/** English copy matching Kun's speechToTextEnabled locale string. */
export const SPEECH_TO_TEXT_SETTINGS_ENABLED_LABEL = 'Enable speech to text'

/** English copy matching Kun's speechToTextEnabledDesc locale string. */
export const SPEECH_TO_TEXT_SETTINGS_ENABLED_DESC =
  'Adds a voice input button to the chat composer; recordings are transcribed by the selected provider. Xiaomi (MiMo) can reuse the key from Providers; custom OpenAI-compatible speech APIs are also supported.'

/** English copy matching Kun's speechToTextProvider locale string. */
export const SPEECH_TO_TEXT_SETTINGS_PROVIDER_LABEL = 'Speech provider'

/** English copy matching Kun's speechToTextProviderDesc locale string. */
export const SPEECH_TO_TEXT_SETTINGS_PROVIDER_DESC =
  'Choose a configured provider that has speech models, or use a custom speech API.'

/** English copy matching Kun's speechToTextProviderCustom locale string. */
export const SPEECH_TO_TEXT_SETTINGS_PROVIDER_CUSTOM = 'Custom speech API'

/** English copy matching Kun's speechToTextProtocol locale string. */
export const SPEECH_TO_TEXT_SETTINGS_PROTOCOL_LABEL = 'Speech protocol'

/** English copy matching Kun's speechToTextProtocolDesc locale string. */
export const SPEECH_TO_TEXT_SETTINGS_PROTOCOL_DESC =
  'Request shape used by the custom speech API. OpenAI Transcriptions calls {baseUrl}/audio/transcriptions; MiMo ASR sends base64 audio via chat/completions.'

/** English copy matching Kun's speechProtocolOpenAi locale string. */
export const SPEECH_TO_TEXT_SETTINGS_PROTOCOL_OPENAI = 'OpenAI Transcriptions'

/** English copy matching Kun's speechProtocolMimoAsr locale string. */
export const SPEECH_TO_TEXT_SETTINGS_PROTOCOL_MIMO_ASR = 'MiMo ASR'

/** English copy matching Kun's speechToTextBaseUrl locale string. */
export const SPEECH_TO_TEXT_SETTINGS_BASE_URL_LABEL = 'Speech API base URL'

/** English copy matching Kun's speechToTextBaseUrlDesc locale string. */
export const SPEECH_TO_TEXT_SETTINGS_BASE_URL_DESC =
  'Speech endpoint root, e.g. https://api.xiaomimimo.com/v1.'

/** English copy matching Kun's speechToTextBaseUrlPlaceholder locale string. */
export const SPEECH_TO_TEXT_SETTINGS_BASE_URL_PLACEHOLDER = 'https://api.xiaomimimo.com/v1'

/** English copy matching Kun's speechToTextApiKey locale string. */
export const SPEECH_TO_TEXT_SETTINGS_API_KEY_LABEL = 'API key'

/** English copy matching Kun's speechToTextApiKeyDesc locale string. */
export const SPEECH_TO_TEXT_SETTINGS_API_KEY_DESC =
  'Key for the speech provider. Independent from the chat model key.'

/** English copy matching Kun's speechToTextModel locale string. */
export const SPEECH_TO_TEXT_SETTINGS_MODEL_LABEL = 'Speech model'

/** English copy matching Kun's speechToTextModelDesc locale string. */
export const SPEECH_TO_TEXT_SETTINGS_MODEL_DESC =
  'Model id sent to the provider, e.g. mimo-v2.5-asr or whisper-1.'

/** English copy matching Kun's speechToTextModelPlaceholder locale string. */
export const SPEECH_TO_TEXT_SETTINGS_MODEL_PLACEHOLDER = 'mimo-v2.5-asr'

/** English copy matching Kun's speechToTextLanguage locale string. */
export const SPEECH_TO_TEXT_SETTINGS_LANGUAGE_LABEL = 'Language'

/** English copy matching Kun's speechToTextLanguageDesc locale string. */
export const SPEECH_TO_TEXT_SETTINGS_LANGUAGE_DESC =
  'Optional language hint such as zh or en. Leave empty for auto-detect.'

/** English copy matching Kun's speechLanguage_auto locale string. */
export const SPEECH_TO_TEXT_SETTINGS_LANGUAGE_AUTO = 'Auto detect'

/** English copy matching Kun's speechLanguage_zh locale string. */
export const SPEECH_TO_TEXT_SETTINGS_LANGUAGE_ZH = 'Chinese'

/** English copy matching Kun's speechLanguage_en locale string. */
export const SPEECH_TO_TEXT_SETTINGS_LANGUAGE_EN = 'English'

/** English copy matching Kun's speechLanguage_ja locale string. */
export const SPEECH_TO_TEXT_SETTINGS_LANGUAGE_JA = 'Japanese'

/** English copy matching Kun's speechLanguage_ko locale string. */
export const SPEECH_TO_TEXT_SETTINGS_LANGUAGE_KO = 'Korean'

/** English copy matching Kun's speechToTextAdvanced locale string. */
export const SPEECH_TO_TEXT_SETTINGS_ADVANCED_LABEL = 'Advanced options'

/** English copy matching Kun's speechToTextAdvancedDesc locale string. */
export const SPEECH_TO_TEXT_SETTINGS_ADVANCED_DESC =
  'Rarely needed settings such as the request timeout.'

/** English copy matching Kun's speechToTextTimeout locale string. */
export const SPEECH_TO_TEXT_SETTINGS_TIMEOUT_LABEL = 'Timeout (ms)'

/** English copy matching Kun's speechToTextTimeoutDesc locale string. */
export const SPEECH_TO_TEXT_SETTINGS_TIMEOUT_DESC =
  'Per-request timeout for the speech transcription API.'

/** English copy matching Kun's speechToTextTest locale string. */
export const SPEECH_TO_TEXT_SETTINGS_TEST_LABEL = 'Test transcription'

/** English copy matching Kun's speechToTextTestDesc locale string. */
export const SPEECH_TO_TEXT_SETTINGS_TEST_DESC =
  'Send a built-in test clip to verify the current provider, key, and model configuration.'

/** English copy matching Kun's speechToTextTestAction locale string. */
export const SPEECH_TO_TEXT_SETTINGS_TEST_ACTION = 'Test'

/** English copy matching Kun's speechToTextTesting locale string. */
export const SPEECH_TO_TEXT_SETTINGS_TESTING = 'Testing…'

/** English copy matching Kun's speechToTextTestEmptyOk locale string. */
export const SPEECH_TO_TEXT_SETTINGS_TEST_EMPTY_OK =
  'Auth and endpoint are working (the test tone having no transcript is expected).'

/** Format Kun's speechToTextProviderMissingKey locale string. */
export function formatSpeechToTextSettingsProviderMissingKey(provider: string): string {
  return `${provider} has no API key yet. Add it in Providers.`
}

/** Format Kun's modelSelectDefaultOption locale string. */
export function formatSpeechToTextSettingsModelSelectDefaultOption(model: string): string {
  return model ? `Default (${model})` : 'Default'
}

/** Format Kun's speechToTextTestSuccess locale string. */
export function formatSpeechToTextSettingsTestSuccess(text: string): string {
  return `Transcription works. Returned: ${text}`
}

/** Format Kun's speechToTextTestFailed locale string. */
export function formatSpeechToTextSettingsTestFailed(message: string): string {
  return `Test failed: ${message}`
}

/** Resolve Kun's speechProtocol* locale strings for a protocol id. */
export function resolveSpeechToTextSettingsProtocolLabel(protocol: string): string {
  if (protocol === 'mimo-asr') return SPEECH_TO_TEXT_SETTINGS_PROTOCOL_MIMO_ASR
  return SPEECH_TO_TEXT_SETTINGS_PROTOCOL_OPENAI
}

/** Resolve Kun's speechLanguage_* locale strings for a language code. */
export function resolveSpeechToTextSettingsLanguageLabel(language: string): string {
  if (language === 'zh') return SPEECH_TO_TEXT_SETTINGS_LANGUAGE_ZH
  if (language === 'en') return SPEECH_TO_TEXT_SETTINGS_LANGUAGE_EN
  if (language === 'ja') return SPEECH_TO_TEXT_SETTINGS_LANGUAGE_JA
  if (language === 'ko') return SPEECH_TO_TEXT_SETTINGS_LANGUAGE_KO
  if (!language) return SPEECH_TO_TEXT_SETTINGS_LANGUAGE_AUTO
  return language
}
