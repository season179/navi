import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-queued-messages-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerQueuedMessages.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  formatQueuedMessagesTitle,
  QUEUED_MESSAGE_REMOVE_LABEL,
  QUEUED_MESSAGES_HINT,
  QUEUED_MESSAGES_TITLE_TEMPLATE,
} = await import(out)

test('queued messages chrome copy matches Kun locale strings', () => {
  assert.equal(QUEUED_MESSAGES_TITLE_TEMPLATE, '{{count}} queued')
  assert.equal(
    QUEUED_MESSAGES_HINT,
    'These messages will send automatically after the current reply finishes.',
  )
  assert.equal(QUEUED_MESSAGE_REMOVE_LABEL, 'Remove queued message')
})

test('formatQueuedMessagesTitle substitutes count like Kun i18n', () => {
  assert.equal(formatQueuedMessagesTitle(1), '1 queued')
  assert.equal(formatQueuedMessagesTitle(3), '3 queued')
})
