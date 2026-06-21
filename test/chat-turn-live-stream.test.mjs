// Unit tests for src/renderer/lib/chatTurnLiveStream.ts

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'
import { buildSync } from 'esbuild'

const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const outfile = join(ROOT, 'node_modules', '.chat-turn-live-stream-test.cjs')
buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'chatTurnLiveStream.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile,
})
const {
  extractLiveStreamFromChatTurn,
  buildSettledTimelineBlocksFromChatTurn,
  applyChatTurnLiveStream,
} = require(outfile)

test('extractLiveStreamFromChatTurn reads streaming assistant text', () => {
  const result = extractLiveStreamFromChatTurn({
    messages: [
      { id: 'u1', role: 'user', text: 'Hi', status: 'done' },
      { id: 'a1', role: 'assistant', text: 'Partial…', status: 'streaming' },
    ],
  })
  assert.equal(result.liveContent, 'Partial…')
  assert.equal(result.liveReasoning, '')
})

test('buildSettledTimelineBlocksFromChatTurn skips streaming assistant', () => {
  const blocks = buildSettledTimelineBlocksFromChatTurn({
    messages: [
      { id: 'a1', role: 'assistant', text: 'Done answer', status: 'done' },
      { id: 'a2', role: 'assistant', text: 'Streaming…', status: 'streaming' },
    ],
  })
  assert.equal(blocks.length, 1)
  assert.equal(blocks[0].id, 'a1')
  assert.equal(blocks[0].text, 'Done answer')
})

test('applyChatTurnLiveStream injects source on latest turn during streaming', () => {
  const turn = {
    messages: [
      { id: 'u1', role: 'user', text: 'Fix auth', status: 'done' },
      { id: 'a1', role: 'assistant', text: 'Checking middleware…', status: 'streaming' },
    ],
  }
  const base = {
    key: 'turn-1',
    user: { kind: 'user', id: 'u1', text: 'Fix auth' },
    liveAssistant: {
      kind: 'assistant',
      id: 'a1',
      text: 'Checking middleware…',
      streaming: true,
    },
    processing: true,
  }
  const result = applyChatTurnLiveStream(base, turn, {
    isLatestTurn: true,
    busy: true,
  })
  assert.ok(result.source)
  assert.equal(result.source.liveContent, 'Checking middleware…')
  assert.equal(result.source.isProcessing, true)
})

test('applyChatTurnLiveStream leaves non-latest turns unchanged', () => {
  const turn = {
    messages: [
      { id: 'a1', role: 'assistant', text: 'Still streaming…', status: 'streaming' },
    ],
  }
  const base = { key: 'turn-0', processing: true }
  const result = applyChatTurnLiveStream(base, turn, {
    isLatestTurn: false,
    busy: true,
  })
  assert.equal(result, base)
})
