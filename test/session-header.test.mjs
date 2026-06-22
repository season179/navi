import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.session-header-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'sessionHeader.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  SESSION_HEADER_EMPTY_HINT,
  SESSION_HEADER_FORKED_LABEL,
  SESSION_HEADER_NO_THREAD_SELECTED,
  SESSION_HEADER_RENAME_THREAD_HINT,
  SESSION_HEADER_RUNNING_LABEL,
  formatSessionForkedFrom,
  formatSessionForkedFromCompact,
  formatSessionUsageCache,
  formatSessionUsageCacheTitle,
  formatSessionUsageCost,
  formatSessionUsageTitle,
  formatSessionUsageTokens,
} = await import(out)

test('session header chrome copy matches Kun locale strings', () => {
  assert.equal(SESSION_HEADER_NO_THREAD_SELECTED, 'No thread selected')
  assert.equal(
    SESSION_HEADER_EMPTY_HINT,
    'Start a thread from the left, or reconnect the runtime to continue working.',
  )
  assert.equal(SESSION_HEADER_RENAME_THREAD_HINT, 'Click to rename thread')
  assert.equal(SESSION_HEADER_RUNNING_LABEL, 'Running…')
  assert.equal(SESSION_HEADER_FORKED_LABEL, 'Forked thread')
})

test('session header formatters match Kun locale templates', () => {
  assert.equal(formatSessionForkedFrom('Refactor auth middleware'), 'Forked from Refactor auth middleware')
  assert.equal(formatSessionForkedFromCompact('Refactor auth middleware'), 'from Refactor auth middleware')
  assert.equal(formatSessionUsageTitle(14), '14 turns in this thread')
  assert.equal(formatSessionUsageTokens('84.2k'), '84.2k tokens')
  assert.equal(formatSessionUsageCost('$0.42'), '$0.42')
  assert.equal(formatSessionUsageCache('74%'), 'cache 74%')
  assert.equal(
    formatSessionUsageCacheTitle({ cache: '68%', cached: '57.2k', miss: '27k' }),
    'Cumulative cache 68% · 57.2k cached / 27k miss',
  )
  assert.equal(
    formatSessionUsageCacheTitle({
      cache: '68%',
      cached: '57.2k',
      miss: '27k',
      latestCache: '74%',
    }),
    'Latest turn cache 74% · cumulative 68% · 57.2k cached / 27k miss',
  )
})
