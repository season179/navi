import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.timeline-jump-rail-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'timelineJumpRail.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  TIMELINE_JUMP_RAIL_LABEL,
  TIMELINE_JUMP_TURN_TEMPLATE,
  formatTimelineJumpTurn,
  formatTimelineTurnPreview,
} = await import(out)

test('timeline jump rail chrome copy matches Kun locale strings', () => {
  assert.equal(TIMELINE_JUMP_RAIL_LABEL, 'Jump to a question')
  assert.equal(TIMELINE_JUMP_TURN_TEMPLATE, 'Jump to question {{index}}')
})

test('formatTimelineJumpTurn substitutes index', () => {
  assert.equal(formatTimelineJumpTurn(1), 'Jump to question 1')
  assert.equal(formatTimelineJumpTurn(12), 'Jump to question 12')
})

test('formatTimelineTurnPreview uses jump-turn fallback and Kun ellipsis', () => {
  assert.equal(formatTimelineTurnPreview('', 3), 'Jump to question 3')
  assert.equal(formatTimelineTurnPreview('   ', 2), 'Jump to question 2')
  assert.equal(
    formatTimelineTurnPreview('How do I wire up auth middleware?', 1),
    'How do I wire up auth middleware?',
  )
  const long = 'a'.repeat(60)
  assert.equal(formatTimelineTurnPreview(long, 1), `${'a'.repeat(47)}...`)
})
