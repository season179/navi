import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.turn-change-summary-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'turnChangeSummary.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  TURN_CHANGE_FILES_ONE_LABEL,
  TURN_CHANGE_FILES_MANY_TEMPLATE,
  TURN_CHANGE_FILE_FALLBACK_LABEL,
  formatTurnChangeFilesMany,
  resolveTurnChangeSummaryTitle,
  resolveTurnChangeFileLabel,
} = await import(out)

test('turn change summary chrome copy matches Kun locale strings', () => {
  assert.equal(TURN_CHANGE_FILES_ONE_LABEL, 'Edited 1 file')
  assert.equal(TURN_CHANGE_FILES_MANY_TEMPLATE, 'Edited {{count}} files')
  assert.equal(TURN_CHANGE_FILE_FALLBACK_LABEL, 'Edited file')
})

test('formatTurnChangeFilesMany substitutes count', () => {
  assert.equal(formatTurnChangeFilesMany(2), 'Edited 2 files')
  assert.equal(formatTurnChangeFilesMany(12), 'Edited 12 files')
})

test('resolveTurnChangeSummaryTitle matches Kun turnChangeFilesOne/Many behavior', () => {
  assert.equal(resolveTurnChangeSummaryTitle(1), 'Edited 1 file')
  assert.equal(resolveTurnChangeSummaryTitle(3), 'Edited 3 files')
})

test('resolveTurnChangeFileLabel matches Kun toolActionFile fallback', () => {
  assert.equal(resolveTurnChangeFileLabel('src/auth/middleware.ts'), 'src/auth/middleware.ts')
  assert.equal(resolveTurnChangeFileLabel(), 'Edited file')
  assert.equal(resolveTurnChangeFileLabel('   '), 'Edited file')
})
