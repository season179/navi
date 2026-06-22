import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.compaction-divider-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'compactionDivider.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  COMPACTION_RUNNING_LABEL,
  COMPACTION_MANUAL_COMPLETED_LABEL,
  COMPACTION_AUTO_COMPLETED_LABEL,
  COMPACTION_FAILED_LABEL,
  formatCompactionManualCompletedWithTokens,
  formatCompactionAutoCompletedWithTokens,
  formatCompactionCompletedWithCounts,
  resolveCompactionDividerLabel,
} = await import(out)

test('compaction divider chrome copy matches Kun locale strings', () => {
  assert.equal(COMPACTION_RUNNING_LABEL, 'Compacting context')
  assert.equal(COMPACTION_MANUAL_COMPLETED_LABEL, 'Compacted context')
  assert.equal(COMPACTION_AUTO_COMPLETED_LABEL, 'Auto-compacted context')
  assert.equal(COMPACTION_FAILED_LABEL, 'Context compaction failed')
})

test('compaction divider token and count formatters match Kun locale strings', () => {
  assert.equal(
    formatCompactionManualCompletedWithTokens(1200),
    'Compacted context · ~1200 tokens freed',
  )
  assert.equal(
    formatCompactionAutoCompletedWithTokens(800),
    'Auto-compacted context · ~800 tokens freed',
  )
  assert.equal(formatCompactionCompletedWithCounts(42, 18), 'Compacted context (42 → 18 messages)')
})

test('resolveCompactionDividerLabel matches Kun compactionDividerLabel behavior', () => {
  assert.equal(resolveCompactionDividerLabel({ status: 'running' }), 'Compacting context')
  assert.equal(
    resolveCompactionDividerLabel({ status: 'done', auto: true }),
    'Auto-compacted context',
  )
  assert.equal(
    resolveCompactionDividerLabel({ status: 'done', auto: false }),
    'Compacted context',
  )
  assert.equal(resolveCompactionDividerLabel({ status: 'error' }), 'Context compaction failed')
  assert.equal(
    resolveCompactionDividerLabel({
      status: 'error',
      summary: 'Compaction timed out after 45s',
    }),
    'Compaction timed out after 45s',
  )
})
