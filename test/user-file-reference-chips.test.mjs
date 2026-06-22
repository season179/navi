import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.user-file-reference-chips-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'userFileReferenceChips.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  MESSAGE_FILE_REFERENCES_TEMPLATE,
  formatUserFileReferenceChipsLabel,
} = await import(out)

test('user file reference chips label template matches Kun locale string', () => {
  assert.equal(MESSAGE_FILE_REFERENCES_TEMPLATE, 'Referenced files {{count}}')
})

test('user file reference chips label formatting matches Kun behavior', () => {
  assert.equal(formatUserFileReferenceChipsLabel(1), 'Referenced files 1')
  assert.equal(formatUserFileReferenceChipsLabel(3), 'Referenced files 3')
})
