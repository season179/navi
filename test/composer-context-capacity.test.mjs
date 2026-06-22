import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-context-capacity-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerContextCapacity.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  CONTEXT_CAPACITY_TITLE,
  CONTEXT_CAPACITY_CATEGORY_LABELS,
  CONTEXT_CAPACITY_SHARE_NOTE,
  CONTEXT_CAPACITY_NEAR_LIMIT,
  CONTEXT_CAPACITY_OVER_LIMIT,
  CONTEXT_CAPACITY_ESTIMATED_BREAKDOWN,
  CONTEXT_CAPACITY_ESTIMATED_ALL,
  formatContextCapacityChipAria,
  formatContextCapacityBarAria,
  formatContextCapacityThresholdLabel,
  formatContextCapacityPercent,
  resolveContextCapacityStatusText,
  resolveComposerContextCapacityPreview,
} = await import(out)

test('resolveComposerContextCapacityPreview opens popover for default preview hooks', () => {
  assert.equal(resolveComposerContextCapacityPreview(null), true)
  assert.equal(resolveComposerContextCapacityPreview(''), true)
  assert.equal(resolveComposerContextCapacityPreview('1'), true)
  assert.equal(resolveComposerContextCapacityPreview('open'), true)
})

test('resolveComposerContextCapacityPreview rejects unknown preview modes', () => {
  assert.equal(resolveComposerContextCapacityPreview('closed'), false)
})

test('CONTEXT_CAPACITY_TITLE matches Kun contextCapacityTitle English copy', () => {
  assert.equal(CONTEXT_CAPACITY_TITLE, 'Context window')
})

test('CONTEXT_CAPACITY_CATEGORY_LABELS match Kun contextCapacityCat_* English copy', () => {
  assert.equal(CONTEXT_CAPACITY_CATEGORY_LABELS.tools, 'System tools')
  assert.equal(CONTEXT_CAPACITY_CATEGORY_LABELS.system, 'System prompt')
  assert.equal(CONTEXT_CAPACITY_CATEGORY_LABELS.skills, 'Skills')
  assert.equal(CONTEXT_CAPACITY_CATEGORY_LABELS.messages, 'Messages')
  assert.equal(CONTEXT_CAPACITY_CATEGORY_LABELS.other, 'Other')
  assert.equal(CONTEXT_CAPACITY_CATEGORY_LABELS.free, 'Free space')
})

test('context capacity status and footnote copy match Kun English locale strings', () => {
  assert.equal(CONTEXT_CAPACITY_SHARE_NOTE, 'Share of window · sums to 100%')
  assert.equal(CONTEXT_CAPACITY_NEAR_LIMIT, 'Near limit')
  assert.equal(
    CONTEXT_CAPACITY_OVER_LIMIT,
    'Near threshold · will auto-compact',
  )
  assert.equal(
    CONTEXT_CAPACITY_ESTIMATED_BREAKDOWN,
    'Total is measured; the per-category split is estimated.',
  )
  assert.equal(
    CONTEXT_CAPACITY_ESTIMATED_ALL,
    'No turn yet — values are estimated and refresh after you send.',
  )
})

test('formatContextCapacityChipAria matches Kun contextCapacityChipAria pattern', () => {
  assert.equal(formatContextCapacityChipAria('73%'), 'Context window 73% used')
})

test('formatContextCapacityBarAria matches Kun contextCapacityBarAria pattern', () => {
  assert.equal(formatContextCapacityBarAria('73%'), 'Context 73% used')
})

test('formatContextCapacityThresholdLabel matches Kun contextCapacityThresholdLabel pattern', () => {
  assert.equal(formatContextCapacityThresholdLabel('90%'), 'Compacts near 90%')
})

test('resolveContextCapacityStatusText follows Kun threshold and warn bands', () => {
  assert.equal(resolveContextCapacityStatusText(0.5, 0.9), CONTEXT_CAPACITY_SHARE_NOTE)
  assert.equal(resolveContextCapacityStatusText(0.8, 0.9), CONTEXT_CAPACITY_NEAR_LIMIT)
  assert.equal(resolveContextCapacityStatusText(0.95, 0.9), CONTEXT_CAPACITY_OVER_LIMIT)
})

test('formatContextCapacityPercent matches Kun formatPercent rounding', () => {
  assert.equal(formatContextCapacityPercent(0.725), '73%')
  assert.equal(formatContextCapacityPercent(0.045), '4.5%')
})
