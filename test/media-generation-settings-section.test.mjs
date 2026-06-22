import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.media-generation-settings-section-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'mediaGenerationSettingsSection.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const mod = await import(out)

test('media generation settings section shell copy matches Kun locale strings', () => {
  assert.equal(mod.MEDIA_GENERATION_SETTINGS_TITLE, 'Media generation')
  assert.equal(
    mod.MEDIA_GENERATION_SETTINGS_DESC,
    'Expose speech, music, and video generation as agent tools. When enabled, navi registers generate_speech, generate_music, and generate_video.',
  )
  assert.equal(mod.MEDIA_GENERATION_SETTINGS_SPEECH_TITLE, 'Speech generation')
  assert.equal(mod.MEDIA_GENERATION_SETTINGS_MUSIC_TITLE, 'Music generation')
  assert.equal(mod.MEDIA_GENERATION_SETTINGS_VIDEO_TITLE, 'Video generation')
})

test('media generation settings section speech copy matches Kun locale strings', () => {
  assert.equal(mod.MEDIA_GENERATION_SETTINGS_SPEECH_ENABLED_LABEL, 'Enable speech generation')
  assert.equal(
    mod.MEDIA_GENERATION_SETTINGS_SPEECH_ENABLED_DESC,
    'Enables the generate_speech tool in agent chats to synthesize text into audio files.',
  )
  assert.equal(mod.MEDIA_GENERATION_SETTINGS_SPEECH_PROVIDER_LABEL, 'Speech generation provider')
  assert.equal(mod.MEDIA_GENERATION_SETTINGS_SPEECH_PROTOCOL_MINIMAX, 'MiniMax t2a_v2')
  assert.equal(mod.MEDIA_GENERATION_SETTINGS_SPEECH_PROTOCOL_MIMO, 'Xiaomi MiMo TTS')
  assert.equal(mod.MEDIA_GENERATION_SETTINGS_SPEECH_TIMEOUT_LABEL, 'Timeout (ms)')
})

test('media generation settings section formatter helpers match Kun locale templates', () => {
  assert.equal(
    mod.formatMediaGenerationSettingsProviderMissingKey('MiniMax'),
    'MiniMax has no API key yet. Add it in Providers.',
  )
  assert.equal(
    mod.formatMediaGenerationSettingsModelSelectDefaultOption('speech-2.8-hd'),
    'Default (speech-2.8-hd)',
  )
  assert.equal(mod.formatMediaGenerationSettingsModelSelectDefaultOption(''), 'Default')
  assert.equal(
    mod.resolveMediaGenerationSettingsSpeechProtocolLabel('minimax-t2a'),
    'MiniMax t2a_v2',
  )
  assert.equal(
    mod.resolveMediaGenerationSettingsSpeechProtocolLabel('mimo-tts'),
    'Xiaomi MiMo TTS',
  )
  assert.equal(
    mod.resolveMediaGenerationSettingsSpeechProtocolLabel('openai-speech'),
    'OpenAI Speech',
  )
})

test('media generation settings section video copy matches Kun locale strings', () => {
  assert.equal(
    mod.MEDIA_GENERATION_SETTINGS_VIDEO_DEFAULT_DURATION_LABEL,
    'Default duration (sec)',
  )
  assert.equal(
    mod.MEDIA_GENERATION_SETTINGS_VIDEO_POLL_INTERVAL_DESC,
    'How often the runtime checks asynchronous video task status.',
  )
})

test('media generation settings section exports expected constant count', () => {
  const constants = Object.keys(mod).filter((key) => key.startsWith('MEDIA_GENERATION_SETTINGS_'))
  assert.equal(constants.length, 74)
})
