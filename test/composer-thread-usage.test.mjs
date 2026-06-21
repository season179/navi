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

const {
  COMPOSER_SESSION_USAGE_LOADING,
  COMPOSER_SESSION_USAGE_UNAVAILABLE,
  COMPOSER_THREAD_USAGE_NO_SAVINGS_PREVIEW,
  COMPOSER_THREAD_USAGE_PREVIEW,
  COMPOSER_THREAD_USAGE_SINGLE_TURN_PREVIEW,
  formatComposerCompactNumber,
  formatComposerCost,
  formatComposerPercent,
  formatComposerSessionUsageCache,
  formatComposerSessionUsageContextSavings,
  formatComposerSessionUsageTokens,
  formatComposerSessionUsageTurns,
  primaryComposerCacheHitRate,
  resolveComposerThreadUsagePreview,
} = await import(out)

test('COMPOSER_THREAD_USAGE_PREVIEW matches Kun default FloatingComposer snapshot', () => {
  assert.equal(formatComposerCompactNumber(COMPOSER_THREAD_USAGE_PREVIEW.totalTokens), '145k')
  assert.equal(formatComposerCost(COMPOSER_THREAD_USAGE_PREVIEW.costUsd), '$0.4200')
  assert.equal(
    formatComposerSessionUsageContextSavings(
      formatComposerCompactNumber(COMPOSER_THREAD_USAGE_PREVIEW.tokenEconomySavingsTokens),
    ),
    'saved 12k tokens',
  )
  assert.equal(
    formatComposerSessionUsageCache(
      formatComposerPercent(primaryComposerCacheHitRate(COMPOSER_THREAD_USAGE_PREVIEW)),
    ),
    'cache 68%',
  )
  assert.equal(COMPOSER_THREAD_USAGE_PREVIEW.turns, 8)
})

test('session usage copy matches Kun locale strings', () => {
  assert.equal(formatComposerSessionUsageTokens('145k'), '145k tokens')
  assert.equal(formatComposerSessionUsageTurns(8), '8 turns')
  assert.equal(COMPOSER_SESSION_USAGE_LOADING, 'Loading usage')
  assert.equal(COMPOSER_SESSION_USAGE_UNAVAILABLE, 'No usage yet')
})

test('resolveComposerThreadUsagePreview routes preview modes', () => {
  assert.deepEqual(resolveComposerThreadUsagePreview(null), {
    usage: COMPOSER_THREAD_USAGE_PREVIEW,
    loading: false,
  })
  assert.deepEqual(resolveComposerThreadUsagePreview('1'), {
    usage: COMPOSER_THREAD_USAGE_PREVIEW,
    loading: false,
  })
  assert.deepEqual(resolveComposerThreadUsagePreview('loading'), {
    usage: null,
    loading: true,
  })
  assert.deepEqual(resolveComposerThreadUsagePreview('unavailable'), {
    usage: null,
    loading: false,
  })
  assert.equal(
    resolveComposerThreadUsagePreview('noSavings').usage,
    COMPOSER_THREAD_USAGE_NO_SAVINGS_PREVIEW,
  )
  assert.equal(
    resolveComposerThreadUsagePreview('singleTurn').usage,
    COMPOSER_THREAD_USAGE_SINGLE_TURN_PREVIEW,
  )
  assert.equal(COMPOSER_THREAD_USAGE_NO_SAVINGS_PREVIEW.tokenEconomySavingsTokens, 0)
  assert.equal(COMPOSER_THREAD_USAGE_SINGLE_TURN_PREVIEW.turns, 1)
})
