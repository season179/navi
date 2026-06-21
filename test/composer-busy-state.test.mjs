import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-busy-state-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerBusyState.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  COMPOSER_QUEUE_PLACEHOLDER,
  COMPOSER_QUEUE_MESSAGE_LABEL,
  COMPOSER_STOP_LABEL,
  resolveComposerBusyPreview,
} = await import(out)

test('COMPOSER_QUEUE_PLACEHOLDER matches Kun composerQueuePlaceholder English copy', () => {
  assert.equal(
    COMPOSER_QUEUE_PLACEHOLDER,
    'Keep typing; sends wait and go out after the current reply finishes…',
  )
})

test('busy toolbar labels match Kun queueMessage and interrupt locale strings', () => {
  assert.equal(COMPOSER_QUEUE_MESSAGE_LABEL, 'Queue message')
  assert.equal(COMPOSER_STOP_LABEL, 'Stop')
})

test('resolveComposerBusyPreview returns busy snapshot with queue placeholder', () => {
  assert.deepEqual(resolveComposerBusyPreview(), {
    busy: true,
    placeholder: COMPOSER_QUEUE_PLACEHOLDER,
  })
})
