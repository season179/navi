import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.timeline-pagination-controls-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'timelinePaginationControls.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  TIMELINE_COLLAPSE_EARLIER_TURNS_LABEL,
  TIMELINE_SHOW_EARLIER_TURNS_TEMPLATE,
  formatTimelineShowEarlierTurns,
} = await import(out)

test('timeline pagination controls chrome copy matches Kun locale strings', () => {
  assert.equal(TIMELINE_SHOW_EARLIER_TURNS_TEMPLATE, 'Show {{count}} earlier turns')
  assert.equal(TIMELINE_COLLAPSE_EARLIER_TURNS_LABEL, 'Show recent turns only')
})

test('formatTimelineShowEarlierTurns substitutes count and keeps plural turns', () => {
  assert.equal(formatTimelineShowEarlierTurns(1), 'Show 1 earlier turns')
  assert.equal(formatTimelineShowEarlierTurns(18), 'Show 18 earlier turns')
})
