import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.process-timeline-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'processTimeline.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  PROCESS_EXPAND_DETAIL,
  PROCESS_COLLAPSE_DETAIL,
  PROCESS_FILE_REFERENCE_HINT,
  resolveProcessExpandCollapseLabel,
} = await import(out)

test('process timeline chrome copy matches Kun locale strings', () => {
  assert.equal(PROCESS_EXPAND_DETAIL, 'Expand details')
  assert.equal(PROCESS_COLLAPSE_DETAIL, 'Collapse details')
  assert.equal(
    PROCESS_FILE_REFERENCE_HINT,
    'Click to preview, double-click to open in editor',
  )
})

test('process expand/collapse label helper matches Kun behavior', () => {
  assert.equal(resolveProcessExpandCollapseLabel(false), 'Expand details')
  assert.equal(resolveProcessExpandCollapseLabel(true), 'Collapse details')
})
