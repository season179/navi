import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.process-block-label-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'processBlockLabel.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  PROCESS_BLOCK_THINKING_LABEL,
  PROCESS_BLOCK_TEXT_LABEL,
  PROCESS_BLOCK_APPROVAL_TITLE,
  PROCESS_BLOCK_USER_INPUT_TITLE,
  PROCESS_BLOCK_PROCESSED_LABEL,
  resolveCompactionProcessBlockLabel,
  resolveProcessBlockLabel,
} = await import(out)

test('process block label chrome copy matches Kun locale strings', () => {
  assert.equal(PROCESS_BLOCK_THINKING_LABEL, 'Thinking')
  assert.equal(PROCESS_BLOCK_TEXT_LABEL, 'Output')
  assert.equal(PROCESS_BLOCK_APPROVAL_TITLE, 'Approval required')
  assert.equal(PROCESS_BLOCK_USER_INPUT_TITLE, 'Input required')
  assert.equal(PROCESS_BLOCK_PROCESSED_LABEL, 'Processed')
})

test('resolveCompactionProcessBlockLabel matches Kun describeProcessBlock compaction branch', () => {
  assert.equal(resolveCompactionProcessBlockLabel({ status: 'running' }), 'Compacting context')
  assert.equal(
    resolveCompactionProcessBlockLabel({ status: 'error' }),
    'Context compaction failed',
  )
  assert.equal(
    resolveCompactionProcessBlockLabel({
      status: 'error',
      summary: 'Compaction timed out after 45s',
    }),
    'Compaction timed out after 45s',
  )
  assert.equal(
    resolveCompactionProcessBlockLabel({ status: 'done', auto: true }),
    'Auto-compacted context',
  )
  assert.equal(
    resolveCompactionProcessBlockLabel({ status: 'done', auto: false }),
    'Compacted context',
  )
  assert.equal(
    resolveCompactionProcessBlockLabel({
      status: 'done',
      auto: false,
      messagesBefore: 1200,
    }),
    'Compacted context · ~1200 tokens freed',
  )
  assert.equal(
    resolveCompactionProcessBlockLabel({
      status: 'done',
      auto: true,
      messagesBefore: 800,
    }),
    'Auto-compacted context · ~800 tokens freed',
  )
  assert.equal(
    resolveCompactionProcessBlockLabel({
      status: 'done',
      messagesBefore: 42,
      messagesAfter: 18,
    }),
    'Compacted context (42 → 18 messages)',
  )
})

test('resolveProcessBlockLabel matches Kun describeProcessBlock behavior', () => {
  assert.equal(resolveProcessBlockLabel({ id: 'r1', kind: 'reasoning' }), 'Thinking')
  assert.equal(resolveProcessBlockLabel({ id: 'a1', kind: 'assistant' }), 'Output')
  assert.equal(
    resolveProcessBlockLabel({
      id: 'c1',
      kind: 'compaction',
      status: 'running',
    }),
    'Compacting context',
  )
  assert.equal(
    resolveProcessBlockLabel({
      id: 'u1',
      kind: 'user_input',
    }),
    'Input required',
  )
  assert.equal(
    resolveProcessBlockLabel({
      id: 'ap1',
      kind: 'approval',
    }),
    'Approval required',
  )
  assert.equal(
    resolveProcessBlockLabel({
      id: 'ap2',
      kind: 'approval',
      summary: 'Approve deploy to staging',
    }),
    'Approve deploy to staging',
  )
  assert.equal(
    resolveProcessBlockLabel({
      id: 's1',
      kind: 'system',
      text: 'Workspace index refreshed successfully.',
    }),
    'Workspace index refreshed successfully.',
  )
  assert.equal(resolveProcessBlockLabel({ id: 'x1', kind: 'unknown' }), 'Processed')
})
