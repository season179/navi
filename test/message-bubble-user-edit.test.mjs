import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.message-bubble-user-edit-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'messageBubbleUserEdit.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  MESSAGE_BUBBLE_REWIND_HINT,
  MESSAGE_BUBBLE_REWIND_CANCEL,
  MESSAGE_BUBBLE_REWIND_RESEND,
  MESSAGE_BUBBLE_REWIND_EDIT_MESSAGE,
} = await import(out)

test('message bubble user edit chrome copy matches Kun locale strings', () => {
  assert.equal(MESSAGE_BUBBLE_REWIND_HINT, 'Esc to cancel · ⌘/Ctrl + Enter to send')
  assert.equal(MESSAGE_BUBBLE_REWIND_CANCEL, 'Cancel')
  assert.equal(MESSAGE_BUBBLE_REWIND_RESEND, 'Resend')
  assert.equal(MESSAGE_BUBBLE_REWIND_EDIT_MESSAGE, 'Edit & resend')
})
