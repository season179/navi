// Unit tests for src/renderer/lib/applyTimelineLiveStream.ts

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'
import { buildSync } from 'esbuild'

const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const outfile = join(ROOT, 'node_modules', '.apply-timeline-live-stream-test.cjs')
buildSync({
  entryPoints: [
    join(ROOT, 'src', 'renderer', 'lib', 'applyTimelineLiveStream.ts'),
  ],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile,
})
const { applyTimelineLiveStreamToTurn } = require(outfile)

const baseTurn = {
  key: 'turn-1',
  user: { kind: 'user', id: 'u1', text: 'Hello' },
  processing: false,
}

test('returns turn unchanged when not latest', () => {
  const result = applyTimelineLiveStreamToTurn(baseTurn, {
    isLatestTurn: false,
    liveReasoning: 'thinking…',
    liveContent: 'answer',
    busy: true,
  })
  assert.equal(result, baseTurn)
})

test('returns turn unchanged when latest but no live stream', () => {
  const result = applyTimelineLiveStreamToTurn(baseTurn, {
    isLatestTurn: true,
    liveReasoning: '',
    liveContent: '   ',
    busy: true,
  })
  assert.equal(result, baseTurn)
})

test('injects source with live stream on latest turn', () => {
  const result = applyTimelineLiveStreamToTurn(baseTurn, {
    isLatestTurn: true,
    liveReasoning: 'Tracing imports…',
    liveContent: 'Found the issue.',
    busy: true,
  })
  assert.ok(result.source)
  assert.equal(result.source.blocks.length, 0)
  assert.equal(result.source.liveReasoning, 'Tracing imports…')
  assert.equal(result.source.liveContent, 'Found the issue.')
  assert.equal(result.source.isProcessing, true)
  assert.equal(result.user?.text, 'Hello')
})

test('preserves existing source blocks when merging live stream', () => {
  const turnWithSource = {
    ...baseTurn,
    source: {
      blocks: [{ kind: 'assistant', id: 'a1', text: 'Earlier step' }],
      workspaceRoot: '/workspace',
      isProcessing: false,
    },
  }
  const result = applyTimelineLiveStreamToTurn(turnWithSource, {
    isLatestTurn: true,
    liveReasoning: '',
    liveContent: 'Streaming now…',
    busy: false,
  })
  assert.equal(result.source.blocks.length, 1)
  assert.equal(result.source.workspaceRoot, '/workspace')
  assert.equal(result.source.liveContent, 'Streaming now…')
  assert.equal(result.source.isProcessing, true)
})
