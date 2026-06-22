import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.providers-settings-section-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'providersSettingsSection.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
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
  PROVIDERS_SETTINGS_IMAGE_CAPABILITY,
  PROVIDERS_SETTINGS_IMAGE_CAPABILITY_DESC,
  PROVIDERS_SETTINGS_IN_USE_BADGE,
  PROVIDERS_SETTINGS_INVALID_URL,
  PROVIDERS_SETTINGS_MISSING_KEY_BADGE,
  PROVIDERS_SETTINGS_MODEL_EMPTY,
  PROVIDERS_SETTINGS_MODEL_LIST_DESC,
  PROVIDERS_SETTINGS_MODELS,
  PROVIDERS_SETTINGS_PLAN_BADGE,
  PROVIDERS_SETTINGS_PRESET_BADGE,
  PROVIDERS_SETTINGS_PRESET_UPDATE_TAG,
  PROVIDERS_SETTINGS_PROXY_ENABLED_LABEL,
  PROVIDERS_SETTINGS_PROXY_URL_DESC,
  PROVIDERS_SETTINGS_PROXY_URL_LABEL,
  PROVIDERS_SETTINGS_PROXY_URL_PLACEHOLDER,
  PROVIDERS_SETTINGS_PROVIDER_ID_LOCKED,
  PROVIDERS_SETTINGS_PROVIDER_NAME,
  PROVIDERS_SETTINGS_REMOVE_PROVIDER,
  PROVIDERS_SETTINGS_SECTION_BASICS,
  PROVIDERS_SETTINGS_SECTION_CONNECTION,
  PROVIDERS_SETTINGS_SECTION_DANGER,
  PROVIDERS_SETTINGS_SHOW_SECRET,
  PROVIDERS_SETTINGS_SPEECH_CAPABILITY,
  PROVIDERS_SETTINGS_TESTING,
  PROVIDERS_SETTINGS_TEST_CONNECTION,
  PROVIDERS_SETTINGS_TITLE,
  PROVIDERS_SETTINGS_TOKEN_PLAN_BADGE,
  PROVIDERS_SETTINGS_TTS_CAPABILITY,
  PROVIDERS_SETTINGS_VISION_BADGE,
  formatProviderFetchedModels,
  formatProviderModelCount,
  formatProviderModelRemove,
  formatProviderTestFailed,
  formatProviderTestSuccess,
} = await import(out)

test('providers settings section chrome copy matches Kun locale strings', () => {
  assert.equal(PROVIDERS_SETTINGS_TITLE, 'Providers')
  assert.equal(
    PROVIDERS_SETTINGS_DESC,
    'API keys, service URLs, text models, and image capabilities live here. Assistant, Write, and image generation reuse these profiles.',
  )
  assert.equal(PROVIDERS_SETTINGS_PROXY_URL_LABEL, 'Model request proxy')
  assert.equal(
    PROVIDERS_SETTINGS_PROXY_URL_DESC,
    'Route only model-service HTTP requests through a proxy. Supports http, https, socks, socks4, and socks5 URLs.',
  )
  assert.equal(PROVIDERS_SETTINGS_PROXY_ENABLED_LABEL, 'Use proxy for model requests')
  assert.equal(PROVIDERS_SETTINGS_PROXY_URL_PLACEHOLDER, 'e.g. http://127.0.0.1:7890')
  assert.equal(PROVIDERS_SETTINGS_ADD_PROVIDER, 'Add provider')
  assert.equal(PROVIDERS_SETTINGS_ADD_MENU_CUSTOM, 'Custom provider…')
  assert.equal(PROVIDERS_SETTINGS_GROUP_PLANS, 'Subscription plans')
  assert.equal(PROVIDERS_SETTINGS_GROUP_API, 'Pay-as-you-go')
  assert.equal(PROVIDERS_SETTINGS_IN_USE_BADGE, 'In use')
  assert.equal(PROVIDERS_SETTINGS_MISSING_KEY_BADGE, 'No API key')
  assert.equal(PROVIDERS_SETTINGS_DRAFT_BADGE, 'Unsaved')
  assert.equal(PROVIDERS_SETTINGS_DEFAULT_BADGE, 'Default')
  assert.equal(PROVIDERS_SETTINGS_PRESET_BADGE, 'Preset')
  assert.equal(PROVIDERS_SETTINGS_PLAN_BADGE, 'Plan')
  assert.equal(PROVIDERS_SETTINGS_CUSTOM_BADGE, 'Custom')
  assert.equal(PROVIDERS_SETTINGS_TOKEN_PLAN_BADGE, 'Token Plan')
  assert.equal(PROVIDERS_SETTINGS_VISION_BADGE, 'Vision')
  assert.equal(PROVIDERS_SETTINGS_SECTION_BASICS, 'Basics')
  assert.equal(PROVIDERS_SETTINGS_SECTION_CONNECTION, 'Connection')
  assert.equal(PROVIDERS_SETTINGS_SECTION_DANGER, 'Danger zone')
  assert.equal(PROVIDERS_SETTINGS_TEST_CONNECTION, 'Test connection')
  assert.equal(PROVIDERS_SETTINGS_FETCH_MODELS, 'Fetch from API')
  assert.equal(PROVIDERS_SETTINGS_PROVIDER_NAME, 'Display name')
  assert.equal(
    PROVIDERS_SETTINGS_PROVIDER_ID_LOCKED,
    'Default and preset provider IDs cannot be changed',
  )
  assert.equal(PROVIDERS_SETTINGS_API_KEY, 'API key')
  assert.equal(PROVIDERS_SETTINGS_API_KEY_PLACEHOLDER, "Enter this provider's API key")
  assert.equal(PROVIDERS_SETTINGS_BASE_URL, 'Base URL')
  assert.equal(PROVIDERS_SETTINGS_BASE_URL_PLACEHOLDER, 'e.g. https://api.deepseek.com')
  assert.equal(PROVIDERS_SETTINGS_INVALID_URL, 'URL must start with http:// or https://')
  assert.equal(PROVIDERS_SETTINGS_ENDPOINT_FORMAT, 'Endpoint format')
  assert.equal(
    PROVIDERS_SETTINGS_CUSTOM_ENDPOINT_DESC,
    'Uses this URL as the final endpoint. Only paths ending in /chat/completions, /completions, /responses, or /messages can be recognized; other endings are not supported.',
  )
  assert.equal(PROVIDERS_SETTINGS_MODELS, 'Models')
  assert.equal(
    PROVIDERS_SETTINGS_MODEL_LIST_DESC,
    'Add models here when the provider ships new ones, or fetch them from the API. Text, image, speech, music, and video models are grouped by capability; the sections below control protocol and endpoint details.',
  )
  assert.equal(
    PROVIDERS_SETTINGS_MODEL_EMPTY,
    'No models yet. Click "Add model" to configure one, or use "Fetch from API".',
  )
  assert.equal(PROVIDERS_SETTINGS_IMAGE_CAPABILITY, 'Image generation capability')
  assert.equal(
    PROVIDERS_SETTINGS_IMAGE_CAPABILITY_DESC,
    'Optional. Providers with this capability can be selected by Image generation without re-entering credentials.',
  )
  assert.equal(PROVIDERS_SETTINGS_SPEECH_CAPABILITY, 'Speech-to-text capability')
  assert.equal(PROVIDERS_SETTINGS_TTS_CAPABILITY, 'Speech generation capability')
  assert.equal(PROVIDERS_SETTINGS_DRAFT_SECTION, 'Add this provider')
  assert.equal(PROVIDERS_SETTINGS_DRAFT_CONFIRM, 'Add')
  assert.equal(PROVIDERS_SETTINGS_DRAFT_DISCARD, 'Cancel')
  assert.equal(
    PROVIDERS_SETTINGS_DRAFT_HINT_READY,
    'Click Add to save this provider and switch to it.',
  )
  assert.equal(
    PROVIDERS_SETTINGS_DRAFT_HINT_NO_KEY,
    'No API key yet — Add saves the configuration without making it the active provider.',
  )
  assert.equal(PROVIDERS_SETTINGS_REMOVE_PROVIDER, 'Remove provider')
  assert.equal(
    PROVIDERS_SETTINGS_DANGER_HINT,
    'Deletion takes effect immediately; features using this provider fall back automatically.',
  )
  assert.equal(PROVIDERS_SETTINGS_TESTING, 'Testing connection…')
  assert.equal(PROVIDERS_SETTINGS_PRESET_UPDATE_TAG, 'Update preset')
  assert.equal(PROVIDERS_SETTINGS_SHOW_SECRET, 'Show value')
  assert.equal(PROVIDERS_SETTINGS_HIDE_SECRET, 'Hide value')
})

test('providers settings endpoint format labels match Kun locale strings', () => {
  assert.equal(PROVIDERS_SETTINGS_ENDPOINT_FORMAT_LABELS.chat_completions, '/v1/chat/completions')
  assert.equal(PROVIDERS_SETTINGS_ENDPOINT_FORMAT_LABELS.responses, '/v1/responses')
  assert.equal(PROVIDERS_SETTINGS_ENDPOINT_FORMAT_LABELS.messages, '/v1/messages')
  assert.equal(PROVIDERS_SETTINGS_ENDPOINT_FORMAT_LABELS.custom_endpoint, 'Custom full endpoint')
})

test('providers settings formatters match Kun locale templates', () => {
  assert.equal(formatProviderModelCount(12), '12 models')
  assert.equal(formatProviderModelRemove('gpt-4o'), 'Remove gpt-4o')
  assert.equal(formatProviderTestFailed('401 Unauthorized'), 'Connection failed: 401 Unauthorized')
  assert.equal(formatProviderTestSuccess(142, 12), 'Connected · 142ms · upstream returned 12 models')
  assert.equal(formatProviderFetchedModels(3), 'Fetched 3 new models')
})
