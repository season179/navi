import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.speech-to-text-settings-section-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'speechToTextSettingsSection.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const mod = await import(out)

test('speech to text settings section shell copy matches Kun locale strings', () => {
  assert.equal(mod.SPEECH_TO_TEXT_SETTINGS_TITLE, 'Speech to text')
  assert.equal(mod.SPEECH_TO_TEXT_SETTINGS_ENABLED_LABEL, 'Enable speech to text')
  assert.equal(
    mod.SPEECH_TO_TEXT_SETTINGS_ENABLED_DESC,
    'Adds a voice input button to the chat composer; recordings are transcribed by the selected provider. Xiaomi (MiMo) can reuse the key from Providers; custom OpenAI-compatible speech APIs are also supported.',
  )
  assert.equal(mod.SPEECH_TO_TEXT_SETTINGS_PROVIDER_LABEL, 'Speech provider')
  assert.equal(mod.SPEECH_TO_TEXT_SETTINGS_PROVIDER_CUSTOM, 'Custom speech API')
})

test('speech to text settings section protocol and model copy matches Kun locale strings', () => {
  assert.equal(mod.SPEECH_TO_TEXT_SETTINGS_PROTOCOL_LABEL, 'Speech protocol')
  assert.equal(mod.SPEECH_TO_TEXT_SETTINGS_PROTOCOL_OPENAI, 'OpenAI Transcriptions')
  assert.equal(mod.SPEECH_TO_TEXT_SETTINGS_PROTOCOL_MIMO_ASR, 'MiMo ASR')
  assert.equal(mod.SPEECH_TO_TEXT_SETTINGS_MODEL_LABEL, 'Speech model')
  assert.equal(mod.SPEECH_TO_TEXT_SETTINGS_LANGUAGE_LABEL, 'Language')
  assert.equal(mod.SPEECH_TO_TEXT_SETTINGS_LANGUAGE_AUTO, 'Auto detect')
  assert.equal(mod.SPEECH_TO_TEXT_SETTINGS_ADVANCED_LABEL, 'Advanced options')
  assert.equal(mod.SPEECH_TO_TEXT_SETTINGS_TIMEOUT_LABEL, 'Timeout (ms)')
  assert.equal(mod.SPEECH_TO_TEXT_SETTINGS_TEST_LABEL, 'Test transcription')
})

test('speech to text settings section formatter helpers match Kun locale templates', () => {
  assert.equal(
    mod.formatSpeechToTextSettingsProviderMissingKey('OpenAI'),
    'OpenAI has no API key yet. Add it in Providers.',
  )
  assert.equal(
    mod.formatSpeechToTextSettingsModelSelectDefaultOption('mimo-v2.5-asr'),
    'Default (mimo-v2.5-asr)',
  )
  assert.equal(mod.formatSpeechToTextSettingsModelSelectDefaultOption(''), 'Default')
  assert.equal(
    mod.formatSpeechToTextSettingsTestSuccess('hello'),
    'Transcription works. Returned: hello',
  )
  assert.equal(
    mod.formatSpeechToTextSettingsTestFailed('401 Unauthorized'),
    'Test failed: 401 Unauthorized',
  )
  assert.equal(mod.resolveSpeechToTextSettingsProtocolLabel('mimo-asr'), 'MiMo ASR')
  assert.equal(
    mod.resolveSpeechToTextSettingsProtocolLabel('openai-transcriptions'),
    'OpenAI Transcriptions',
  )
  assert.equal(mod.resolveSpeechToTextSettingsLanguageLabel('zh'), 'Chinese')
  assert.equal(mod.resolveSpeechToTextSettingsLanguageLabel(''), 'Auto detect')
})

test('speech to text settings section exports expected constant count', () => {
  const constants = Object.keys(mod).filter((key) => key.startsWith('SPEECH_TO_TEXT_SETTINGS_'))
  assert.equal(constants.length, 34)
})
