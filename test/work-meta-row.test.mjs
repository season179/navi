import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.work-meta-row-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'workMetaRow.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  WORK_META_ROW_PROCESSED_LABEL,
  WORK_META_ROW_PROCESSING_LABEL,
  WORK_META_ROW_PROCESS_STEPS_TEMPLATE,
  WORK_META_ROW_THOUGHT_FOR_TEMPLATE,
  formatWorkMetaRowProcessSteps,
  formatWorkMetaRowThoughtFor,
  resolveWorkMetaRowMainLabel,
} = await import(out)

test('work meta row chrome copy matches Kun locale strings', () => {
  assert.equal(WORK_META_ROW_PROCESSING_LABEL, 'Processing')
  assert.equal(WORK_META_ROW_PROCESSED_LABEL, 'Processed')
  assert.equal(WORK_META_ROW_PROCESS_STEPS_TEMPLATE, 'Work process ({{count}} steps)')
  assert.equal(WORK_META_ROW_THOUGHT_FOR_TEMPLATE, 'Thought for {{duration}}')
})

test('work meta row label resolution matches Kun behavior', () => {
  assert.equal(
    resolveWorkMetaRowMainLabel({ processing: true, stepCount: 4 }),
    'Processing',
  )
  assert.equal(
    resolveWorkMetaRowMainLabel({ processing: true, stepCount: 4, durationLabel: '12.4s' }),
    'Processing 12.4s',
  )
  assert.equal(
    resolveWorkMetaRowMainLabel({ processing: false, stepCount: 6, durationLabel: '28.5s' }),
    'Processed 28.5s',
  )
  assert.equal(formatWorkMetaRowProcessSteps(8), 'Work process (8 steps)')
  assert.equal(
    resolveWorkMetaRowMainLabel({ processing: false, stepCount: 8 }),
    'Work process (8 steps)',
  )
  assert.equal(formatWorkMetaRowThoughtFor('4.2s'), 'Thought for 4.2s')
})
