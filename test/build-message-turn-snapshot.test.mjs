// Unit tests for src/renderer/lib/buildMessageTurnSnapshot.ts — block→snapshot bridge.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'
import { buildSync } from 'esbuild'

const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const outfile = join(ROOT, 'node_modules', '.build-message-turn-snapshot-test.cjs')
buildSync({
  entryPoints: [
    join(ROOT, 'src', 'renderer', 'lib', 'buildMessageTurnSnapshot.ts'),
  ],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile,
})
const {
  buildMessageTurnSnapshotFromSource,
  DERIVED_TURN_INTERMEDIATE_BLOCKS,
} = require(outfile)

test('surfaces only the final assistant answer outside process work', () => {
  const snapshot = buildMessageTurnSnapshotFromSource({
    key: 'turn-1',
    source: { blocks: DERIVED_TURN_INTERMEDIATE_BLOCKS, workspaceRoot: '/tmp' },
  })

  assert.deepEqual(
    snapshot.assistantBlocks?.map((block) => block.id),
    ['next'],
  )
  assert.equal(snapshot.workMeta?.stepCount, 4)
  assert.ok(snapshot.processSections?.length)
  assert.equal(snapshot.processSections?.some((section) => section.kind === 'execution'), true)
})

test('keeps live assistant separate from process blocks while processing', () => {
  const snapshot = buildMessageTurnSnapshotFromSource({
    key: 'turn-live',
    source: {
      blocks: [],
      isProcessing: true,
      liveReasoning: 'private reasoning',
      liveContent: 'Streaming answer text.',
      workspaceRoot: '/tmp',
    },
  })

  assert.equal(snapshot.liveAssistant?.text, 'Streaming answer text.')
  assert.equal(snapshot.assistantBlocks?.length ?? 0, 0)
  assert.equal(
    snapshot.processSections?.some(
      (section) =>
        section.kind === 'reasoning' &&
        section.reasoningText?.includes('private reasoning'),
    ),
    true,
  )
  assert.equal(snapshot.showLiveProgress, true)
})
