import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-voice-dictation-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerVoiceDictation.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  COMPOSER_DICTATION_ERROR_PREVIEW,
  COMPOSER_VOICE_SEND_LABEL,
  COMPOSER_VOICE_START_LABEL,
  COMPOSER_VOICE_STOP_LABEL,
  COMPOSER_VOICE_TRANSCRIBING_LABEL,
} = await import(out)

test('COMPOSER_DICTATION_ERROR_PREVIEW matches Kun composerVoiceMicDenied English copy', () => {
  assert.equal(
    COMPOSER_DICTATION_ERROR_PREVIEW,
    'Microphone access was denied. Allow it in system settings and try again.',
  )
})

test('voice dictation labels match Kun composerVoice locale strings', () => {
  assert.equal(COMPOSER_VOICE_START_LABEL, 'Voice input')
  assert.equal(COMPOSER_VOICE_STOP_LABEL, 'Stop recording')
  assert.equal(COMPOSER_VOICE_SEND_LABEL, 'Stop and send')
  assert.equal(COMPOSER_VOICE_TRANSCRIBING_LABEL, 'Transcribing…')
})
