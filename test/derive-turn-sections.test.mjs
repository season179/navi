// Unit tests for src/renderer/lib/deriveTurnSections.ts — turn slice derivation
// drives which blocks render in process vs content vs file-change panels.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'
import { buildSync } from 'esbuild'

const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const outfile = join(ROOT, 'node_modules', '.derive-turn-sections-test.cjs')
buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'deriveTurnSections.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile,
})
const { deriveTurnSections } = require(outfile)

function sections(blocks) {
  return deriveTurnSections({
    turn: { blocks },
    isProcessing: false,
    liveProcessText: '',
    liveContent: '',
    workspaceRoot: '/tmp',
  })
}

function processingSections(input = {}) {
  return deriveTurnSections({
    turn: { blocks: input.blocks ?? [] },
    isProcessing: true,
    liveProcessText: input.liveProcessText ?? '',
    liveContent: input.liveContent ?? '',
    workspaceRoot: '/tmp',
  })
}

test('renders the final assistant answer as content even when reasoning was persisted after it', () => {
  const result = sections([
    { kind: 'assistant', id: 'answer', text: 'Hello!' },
    { kind: 'reasoning', id: 'reasoning', text: 'The user greeted me.' },
  ])

  assert.deepEqual(result.assistantContentBlocks, [
    { kind: 'assistant', id: 'answer', text: 'Hello!' },
  ])
  assert.deepEqual(
    result.processBlocks.map((block) => block.kind),
    ['reasoning'],
  )
})

test('uses the last assistant text as final content without duplicating it in process work', () => {
  const result = sections([
    { kind: 'assistant', id: 'preface', text: 'Let me check first.' },
    {
      kind: 'tool',
      id: 'tool_1',
      summary: 'read',
      status: 'success',
      toolKind: 'tool_call',
    },
  ])

  assert.deepEqual(result.assistantContentBlocks, [
    { kind: 'assistant', id: 'preface', text: 'Let me check first.' },
  ])
  assert.deepEqual(
    result.processBlocks.map((block) => block.kind),
    ['tool'],
  )
})

test('keeps intermediate assistant text inside the process timeline and surfaces only the final answer', () => {
  const result = sections([
    { kind: 'assistant', id: 'intro', text: 'I found the likely cause.' },
    {
      kind: 'tool',
      id: 'tool_read',
      summary: 'read: source',
      status: 'success',
      toolKind: 'tool_call',
      detail: 'read output',
    },
    {
      kind: 'assistant',
      id: 'analysis',
      text: [
        'Here is the detailed analysis:',
        '',
        '```txt',
        'command output line 1',
        'command output line 2',
        '```',
      ].join('\n'),
    },
    {
      kind: 'tool',
      id: 'tool_issue',
      summary: 'web_fetch: issue',
      status: 'success',
      toolKind: 'tool_call',
      detail: 'https://github.com/example/issue/96',
    },
    { kind: 'assistant', id: 'next', text: 'The issue link above should still be visible.' },
  ])

  assert.deepEqual(
    result.assistantContentBlocks.map((block) => block.id),
    ['next'],
  )
  assert.deepEqual(result.processBlocks.map((block) => block.id), [
    'intro',
    'tool_read',
    'analysis',
    'tool_issue',
  ])
  assert.ok(
    result.processBlocks
      .filter((block) => block.kind === 'assistant')
      .map((block) => block.text)
      .join('\n\n')
      .includes('command output line 2'),
  )
})

test('keeps every consecutive trailing segment but the last inside the timeline', () => {
  const result = sections([
    {
      kind: 'tool',
      id: 'tool_ls',
      summary: 'pwd && ls -la',
      status: 'success',
      toolKind: 'tool_call',
      detail: 'workspace listing',
    },
    { kind: 'assistant', id: 'preface', text: 'Checking the workspace layout first.' },
    { kind: 'assistant', id: 'analysis', text: 'The workspace is empty.' },
    { kind: 'assistant', id: 'question', text: 'Which project should I open?' },
  ])

  assert.deepEqual(result.assistantContentBlocks.map((block) => block.id), ['question'])
  assert.deepEqual(result.processBlocks.map((block) => block.id), [
    'tool_ls',
    'preface',
    'analysis',
  ])
})

test('does not create assistant content from tool-only process work', () => {
  const result = sections([
    {
      kind: 'tool',
      id: 'tool_1',
      summary: 'read',
      status: 'success',
      toolKind: 'tool_call',
    },
  ])

  assert.deepEqual(result.assistantContentBlocks, [])
  assert.deepEqual(
    result.processBlocks.map((block) => block.kind),
    ['tool'],
  )
})

test('surfaces generated media blocks outside the collapsed process work', () => {
  const result = sections([
    {
      kind: 'tool',
      id: 'tool_img',
      summary: 'generate_image',
      status: 'success',
      toolKind: 'tool_call',
      meta: {
        attachments: [{ id: 'att_img', name: 'img.png', mimeType: 'image/png' }],
        generatedFiles: [{ relativePath: '.deepseekgui-images/img.png', mimeType: 'image/png' }],
      },
    },
    {
      kind: 'tool',
      id: 'tool_read',
      summary: 'read',
      status: 'success',
      toolKind: 'tool_call',
    },
  ])

  assert.deepEqual(result.generatedFileBlocks.map((block) => block.id), ['tool_img'])
  assert.deepEqual(result.processBlocks.map((block) => block.id), ['tool_img', 'tool_read'])
})

test('keeps generated media visible while the turn is still processing', () => {
  const result = processingSections({
    blocks: [
      {
        kind: 'tool',
        id: 'tool_img',
        summary: 'generate_image',
        status: 'success',
        toolKind: 'tool_call',
        meta: {
          generatedFiles: [
            {
              relativePath: '.deepseekgui-images/img.png',
              mimeType: 'image/png',
            },
          ],
        },
      },
      {
        kind: 'tool',
        id: 'tool_next',
        summary: 'read',
        status: 'running',
        toolKind: 'tool_call',
      },
    ],
  })

  assert.deepEqual(result.generatedFileBlocks.map((block) => block.id), ['tool_img'])
  assert.deepEqual(result.processBlocks.map((block) => block.id), ['tool_img', 'tool_next'])
})

test('extracts file changes from JSON-wrapped tool output diffs', () => {
  const patch = [
    'diff --git a/demo.ts b/demo.ts',
    '--- a/demo.ts',
    '+++ b/demo.ts',
    '@@ -1,1 +1,1 @@',
    '-old',
    '+new',
  ].join('\n')
  const result = sections([
    {
      kind: 'tool',
      id: 'tool_1',
      summary: 'Edit',
      status: 'success',
      toolKind: 'file_change',
      filePath: '/tmp/demo.ts',
      detail: JSON.stringify({ path: '/tmp/demo.ts', diff: patch }, null, 2),
    },
  ])

  assert.deepEqual(result.turnFileChanges, [
    {
      id: 'tool_1',
      kind: 'tool',
      summary: 'Edit',
      status: 'success',
      toolKind: 'file_change',
      detail: patch,
      filePath: 'demo.ts',
    },
  ])
})

test('merges repeated file changes for the same displayed path', () => {
  const firstPatch = [
    'diff --git a/.kunsdd/draft/plan/requirement.md b/.kunsdd/draft/plan/requirement.md',
    '--- a/.kunsdd/draft/plan/requirement.md',
    '+++ b/.kunsdd/draft/plan/requirement.md',
    '@@ -1,1 +1,1 @@',
    '-old title',
    '+new title',
  ].join('\n')
  const secondPatch = [
    'diff --git a/.kunsdd/draft/plan/requirement.md b/.kunsdd/draft/plan/requirement.md',
    '--- a/.kunsdd/draft/plan/requirement.md',
    '+++ b/.kunsdd/draft/plan/requirement.md',
    '@@ -4,1 +4,2 @@',
    ' context',
    '+new detail',
  ].join('\n')
  const result = sections([
    {
      kind: 'tool',
      id: 'tool_first_edit',
      summary: 'Edit requirement',
      status: 'success',
      toolKind: 'file_change',
      filePath: '/tmp/.kunsdd/draft/plan/requirement.md',
      detail: firstPatch,
    },
    {
      kind: 'tool',
      id: 'tool_second_edit',
      summary: 'Edit requirement again',
      status: 'success',
      toolKind: 'file_change',
      filePath: '/tmp/.kunsdd/draft/plan/requirement.md',
      detail: secondPatch,
    },
  ])

  assert.equal(result.turnFileChanges.length, 1)
  assert.equal(result.turnFileChanges[0]?.id, 'tool_first_edit')
  assert.equal(result.turnFileChanges[0]?.filePath, '.kunsdd/draft/plan/requirement.md')
  assert.ok(result.turnFileChanges[0]?.detail.includes('+new title'))
  assert.ok(result.turnFileChanges[0]?.detail.includes('+new detail'))
})

test('keeps live reasoning in the process timeline; live assistant is rendered separately', () => {
  const result = processingSections({
    liveProcessText: 'private reasoning',
    liveContent: 'Streaming answer text.',
  })

  assert.deepEqual(result.assistantContentBlocks, [])
  assert.deepEqual(result.processBlocks, [
    { kind: 'reasoning', id: 'live-reasoning', text: 'private reasoning' },
  ])
})

test('keeps assistant content in chronological process order while a later tool is still running', () => {
  const result = processingSections({
    blocks: [
      { kind: 'assistant', id: 'answer', text: 'Partial result first.' },
      {
        kind: 'tool',
        id: 'tool_1',
        summary: 'read',
        status: 'running',
        toolKind: 'tool_call',
      },
    ],
  })

  assert.deepEqual(result.assistantContentBlocks, [])
  assert.deepEqual(result.processBlocks, [
    { kind: 'assistant', id: 'answer', text: 'Partial result first.' },
    {
      kind: 'tool',
      id: 'tool_1',
      summary: 'read',
      status: 'running',
      toolKind: 'tool_call',
    },
  ])
})

test('places assistant output between process steps while processing', () => {
  const result = processingSections({
    blocks: [
      {
        kind: 'tool',
        id: 'tool_1',
        summary: 'read',
        status: 'success',
        toolKind: 'tool_call',
      },
      { kind: 'assistant', id: 'answer', text: 'Read complete, continuing search.' },
      {
        kind: 'tool',
        id: 'tool_2',
        summary: 'grep',
        status: 'running',
        toolKind: 'tool_call',
      },
    ],
  })

  assert.deepEqual(result.assistantContentBlocks, [])
  assert.deepEqual(result.processBlocks.map((block) => block.id), ['tool_1', 'answer', 'tool_2'])
})
