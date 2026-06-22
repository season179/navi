import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.copy-feedback-button-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'copyFeedbackButton.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  COPY_FEEDBACK_MESSAGE,
  COPY_FEEDBACK_SUCCESS,
  COPY_FEEDBACK_FAILED,
  resolveCopyFeedbackLabel,
} = await import(out)

test('copy feedback button chrome copy matches Kun locale strings', () => {
  assert.equal(COPY_FEEDBACK_MESSAGE, 'Copy message')
  assert.equal(COPY_FEEDBACK_SUCCESS, 'Copied')
  assert.equal(COPY_FEEDBACK_FAILED, 'Copy failed')
})

test('copy feedback button label resolution matches Kun behavior', () => {
  assert.equal(resolveCopyFeedbackLabel('idle'), COPY_FEEDBACK_MESSAGE)
  assert.equal(resolveCopyFeedbackLabel('success'), COPY_FEEDBACK_SUCCESS)
  assert.equal(resolveCopyFeedbackLabel('error'), COPY_FEEDBACK_FAILED)
})
