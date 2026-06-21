import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-change-summary-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerChangeSummary.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const { COMPOSER_CHANGE_SUMMARY_PREVIEW } = await import(out)

test('COMPOSER_CHANGE_SUMMARY_PREVIEW matches Kun change-summary mock data', () => {
  assert.equal(COMPOSER_CHANGE_SUMMARY_PREVIEW.files.length, 3)
  assert.equal(COMPOSER_CHANGE_SUMMARY_PREVIEW.stats.added, 428)
  assert.equal(COMPOSER_CHANGE_SUMMARY_PREVIEW.stats.removed, 12)
  assert.match(COMPOSER_CHANGE_SUMMARY_PREVIEW.files[0].path, /FloatingComposer\.tsx$/)
})
