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
  COMPOSER_VOICE_FAILED_SAMPLE_MESSAGE,
  COMPOSER_VOICE_MIC_DENIED_LABEL,
  COMPOSER_VOICE_SEND_LABEL,
  COMPOSER_VOICE_START_LABEL,
  COMPOSER_VOICE_STOP_LABEL,
  COMPOSER_VOICE_TOO_SHORT_LABEL,
  COMPOSER_VOICE_TRANSCRIBING_LABEL,
  formatComposerVoiceFailed,
  resolveComposerDictationErrorPreview,
} = await import(out)

test('COMPOSER_VOICE_MIC_DENIED_LABEL matches Kun composerVoiceMicDenied English copy', () => {
  assert.equal(
    COMPOSER_VOICE_MIC_DENIED_LABEL,
    'Microphone access was denied. Allow it in system settings and try again.',
  )
  assert.equal(COMPOSER_DICTATION_ERROR_PREVIEW, COMPOSER_VOICE_MIC_DENIED_LABEL)
})

test('voice dictation labels match Kun composerVoice locale strings', () => {
  assert.equal(COMPOSER_VOICE_START_LABEL, 'Voice input')
  assert.equal(COMPOSER_VOICE_STOP_LABEL, 'Stop recording')
  assert.equal(COMPOSER_VOICE_SEND_LABEL, 'Stop and send')
  assert.equal(COMPOSER_VOICE_TRANSCRIBING_LABEL, 'Transcribing…')
  assert.equal(
    COMPOSER_VOICE_TOO_SHORT_LABEL,
    'Recording was too short. Hold on a bit longer.',
  )
})

test('formatComposerVoiceFailed matches Kun composerVoiceFailed English copy', () => {
  assert.equal(
    formatComposerVoiceFailed('Network request failed'),
    'Voice transcription failed: Network request failed',
  )
})

test('resolveComposerDictationErrorPreview routes micDenied, tooShort, and failed modes', () => {
  assert.equal(
    resolveComposerDictationErrorPreview('1'),
    COMPOSER_VOICE_MIC_DENIED_LABEL,
  )
  assert.equal(
    resolveComposerDictationErrorPreview('micDenied'),
    COMPOSER_VOICE_MIC_DENIED_LABEL,
  )
  assert.equal(
    resolveComposerDictationErrorPreview('tooShort'),
    COMPOSER_VOICE_TOO_SHORT_LABEL,
  )
  assert.equal(
    resolveComposerDictationErrorPreview('failed'),
    formatComposerVoiceFailed(COMPOSER_VOICE_FAILED_SAMPLE_MESSAGE),
  )
  assert.equal(resolveComposerDictationErrorPreview(null), undefined)
  assert.equal(resolveComposerDictationErrorPreview('unknown'), undefined)
})
