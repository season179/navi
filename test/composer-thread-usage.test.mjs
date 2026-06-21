import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-thread-usage-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerThreadUsage.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const { COMPOSER_THREAD_USAGE_PREVIEW } = await import(out)

test('COMPOSER_THREAD_USAGE_PREVIEW matches Kun default FloatingComposer snapshot', () => {
  assert.equal(COMPOSER_THREAD_USAGE_PREVIEW.tokens, '145k')
  assert.equal(COMPOSER_THREAD_USAGE_PREVIEW.cost, '$0.42')
  assert.equal(COMPOSER_THREAD_USAGE_PREVIEW.savings, '12k saved')
  assert.equal(COMPOSER_THREAD_USAGE_PREVIEW.cache, '68%')
  assert.equal(COMPOSER_THREAD_USAGE_PREVIEW.turns, 8)
})
