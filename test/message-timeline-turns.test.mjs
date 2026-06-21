// Unit tests for src/renderer/lib/messageTimelineTurns.ts — turn grouping and
// think-split rules drive which bubbles render in the timeline.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'
import { buildSync } from 'esbuild'

const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const outfile = join(ROOT, 'node_modules', '.message-timeline-turns-test.cjs')
buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'messageTimelineTurns.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile,
})
const {
  groupTurns,
  sameTurnContent,
  stableTurnKey,
  splitThink,
  isProcessBlock,
  blockHasPendingRuntimeWork,
  findTrailingAssistantContentStart,
} = require(outfile)

test('uses stable ids for user and assistant-only turns', () => {
  const blocks = [
    { kind: 'assistant', id: 'assistant_intro', text: 'Welcome' },
    { kind: 'user', id: 'user_1', text: 'Hello' },
    { kind: 'assistant', id: 'assistant_1', text: 'Hi' },
  ]

  const turns = groupTurns(blocks)

  assert.equal(stableTurnKey(turns[0], 0), 'assistant_intro')
  assert.equal(stableTurnKey(turns[1], 1), 'user_1')
})

test('treats rebuilt turn arrays as the same content when block references are unchanged', () => {
  const blocks = [
    { kind: 'user', id: 'user_1', text: 'Hello' },
    { kind: 'assistant', id: 'assistant_1', text: 'Hi' },
  ]

  const first = groupTurns(blocks)[0]
  const second = groupTurns(blocks)[0]

  assert.notEqual(first, second)
  assert.equal(sameTurnContent(first, second), true)
})

test('detects updates to a block inside an otherwise stable turn', () => {
  const firstBlocks = [
    { kind: 'user', id: 'user_1', text: 'Hello' },
    { kind: 'assistant', id: 'assistant_1', text: 'Hi' },
  ]
  const nextBlocks = [
    firstBlocks[0],
    { kind: 'assistant', id: 'assistant_1', text: 'Hi again' },
  ]

  assert.equal(sameTurnContent(groupTurns(firstBlocks)[0], groupTurns(nextBlocks)[0]), false)
})

test('splitThink extracts redacted thinking and visible content', () => {
  const text = [
    'Visible intro',
    '<think>',
    'private reasoning',
    '',
  ].join('\n')

  assert.deepEqual(splitThink(text), {
    think: 'private reasoning',
    content: 'Visible intro',
  })
})

test('splitThink returns full text when no think tags are present', () => {
  assert.deepEqual(splitThink('plain answer'), { think: '', content: 'plain answer' })
})

test('isProcessBlock matches Kun process timeline kinds', () => {
  assert.equal(isProcessBlock({ id: 'r1', kind: 'reasoning' }), true)
  assert.equal(isProcessBlock({ id: 't1', kind: 'tool' }), true)
  assert.equal(isProcessBlock({ id: 'a1', kind: 'assistant' }), false)
  assert.equal(isProcessBlock({ id: 'u1', kind: 'user' }), false)
})

test('blockHasPendingRuntimeWork detects running and pending blocks', () => {
  assert.equal(blockHasPendingRuntimeWork({ id: 't1', kind: 'tool', status: 'running' }), true)
  assert.equal(blockHasPendingRuntimeWork({ id: 't1', kind: 'tool', status: 'success' }), false)
  assert.equal(blockHasPendingRuntimeWork({ id: 'a1', kind: 'approval', status: 'pending' }), true)
  assert.equal(blockHasPendingRuntimeWork({ id: 'a1', kind: 'assistant' }), false)
})

test('findTrailingAssistantContentStart skips trailing reasoning after final answer', () => {
  const blocks = [
    { kind: 'assistant', id: 'answer', text: '你好！' },
    { kind: 'reasoning', id: 'reasoning', text: 'The user greeted me.' },
  ]

  assert.equal(findTrailingAssistantContentStart(blocks), 0)
})

test('findTrailingAssistantContentStart returns start index of trailing assistant run', () => {
  const blocks = [
    { kind: 'tool', id: 'tool_1' },
    { kind: 'assistant', id: 'preface', text: '我先看看。' },
    { kind: 'assistant', id: 'question', text: '你想看哪个项目？' },
  ]

  assert.equal(findTrailingAssistantContentStart(blocks), 1)
})
