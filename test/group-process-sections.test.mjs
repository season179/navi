// Unit tests for src/renderer/lib/groupProcessSections.ts — consecutive-block
// merging is easy to get wrong at kind boundaries, so pin Kun's grouping rules.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'
import { buildSync } from 'esbuild'

const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const outfile = join(ROOT, 'node_modules', '.group-process-sections-test.cjs')
buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'groupProcessSections.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile,
})
const {
  groupProcessSections,
  resolveProcessSectionKind,
} = require(outfile)

test('resolveProcessSectionKind maps Kun block kinds', () => {
  assert.equal(resolveProcessSectionKind('reasoning'), 'reasoning')
  assert.equal(resolveProcessSectionKind('assistant'), 'output')
  assert.equal(resolveProcessSectionKind('tool'), 'execution')
  assert.equal(resolveProcessSectionKind('approval'), 'execution')
  assert.equal(resolveProcessSectionKind('system'), 'execution')
})

test('empty input returns no sections', () => {
  assert.deepEqual(groupProcessSections([]), [])
})

test('single blocks create one section each', () => {
  assert.deepEqual(groupProcessSections([{ id: 'r1', kind: 'reasoning' }]), [
    { id: 'reasoning-r1', kind: 'reasoning', blocks: [{ id: 'r1', kind: 'reasoning' }] },
  ])
  assert.deepEqual(groupProcessSections([{ id: 'a1', kind: 'assistant' }]), [
    { id: 'output-a1', kind: 'output', blocks: [{ id: 'a1', kind: 'assistant' }] },
  ])
  assert.deepEqual(groupProcessSections([{ id: 't1', kind: 'tool' }]), [
    { id: 'execution-t1', kind: 'execution', blocks: [{ id: 't1', kind: 'tool' }] },
  ])
})

test('consecutive same-kind blocks merge into one section', () => {
  const blocks = [
    { id: 't1', kind: 'tool' },
    { id: 't2', kind: 'approval' },
    { id: 't3', kind: 'system' },
  ]
  assert.deepEqual(groupProcessSections(blocks), [
    {
      id: 'execution-t1',
      kind: 'execution',
      blocks,
    },
  ])
})

test('kind changes split sections and preserve block order', () => {
  const blocks = [
    { id: 'r1', kind: 'reasoning' },
    { id: 't1', kind: 'tool' },
    { id: 't2', kind: 'tool' },
    { id: 'a1', kind: 'assistant' },
    { id: 't3', kind: 'tool' },
    { id: 'r2', kind: 'reasoning' },
  ]
  assert.deepEqual(groupProcessSections(blocks), [
    {
      id: 'reasoning-r1',
      kind: 'reasoning',
      blocks: [{ id: 'r1', kind: 'reasoning' }],
    },
    {
      id: 'execution-t1',
      kind: 'execution',
      blocks: [
        { id: 't1', kind: 'tool' },
        { id: 't2', kind: 'tool' },
      ],
    },
    {
      id: 'output-a1',
      kind: 'output',
      blocks: [{ id: 'a1', kind: 'assistant' }],
    },
    {
      id: 'execution-t3',
      kind: 'execution',
      blocks: [{ id: 't3', kind: 'tool' }],
    },
    {
      id: 'reasoning-r2',
      kind: 'reasoning',
      blocks: [{ id: 'r2', kind: 'reasoning' }],
    },
  ])
})
