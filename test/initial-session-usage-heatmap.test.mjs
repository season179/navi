import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.initial-session-usage-heatmap-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'initialSessionUsageHeatmap.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  USAGE_HEATMAP_TITLE,
  USAGE_HEATMAP_SUB,
  USAGE_HEATMAP_GRID_LABEL,
  USAGE_HEATMAP_HERO_SUB,
  USAGE_HEATMAP_WARMUP_BADGE,
  formatUsageHeatmapDaySummary,
  formatUsageHeatmapModelTooltip,
  formatUsageHeatmapOverviewCaption,
  formatUsageHeatmapStreakDays,
  resolveUsageHeatmapHeroSub,
  resolveUsageHeatmapHeroTitle,
  resolveUsageHeatmapExpandCollapseLabel,
} = await import(out)

test('usage heatmap copy matches Kun locale strings with Navi branding', () => {
  assert.equal(USAGE_HEATMAP_TITLE, 'Your recent agent rhythm')
  assert.equal(
    USAGE_HEATMAP_SUB,
    'Start from the work pattern you have already built. Each day is colored by Navi token usage, with turns, cost, threads, and cache detail available from the cells.',
  )
  assert.equal(USAGE_HEATMAP_GRID_LABEL, 'Daily Navi usage calendar')
  assert.equal(
    USAGE_HEATMAP_HERO_SUB.empty,
    'Once your first Navi turn completes, this space will turn into a daily usage calendar.',
  )
  assert.equal(USAGE_HEATMAP_WARMUP_BADGE.empty, 'Navi usage')
})

test('usage heatmap formatters match Kun behavior', () => {
  assert.equal(formatUsageHeatmapStreakDays(3), '3d')
  assert.equal(
    formatUsageHeatmapOverviewCaption('12.4k', 5),
    "You've used 12.4k tokens across 5 active days.",
  )
  assert.equal(
    formatUsageHeatmapDaySummary({
      date: '2026-06-01',
      tokens: '1.2k',
      cost: '$0.0012',
      saved: '300',
      turns: 2,
      threads: 1,
      cache: '25%',
    }),
    '2026-06-01 · 1.2k tokens · $0.0012 · 300 cached tokens · 2 turns · 1 threads · 25% cache',
  )
  assert.equal(
    formatUsageHeatmapModelTooltip({
      label: 'Jun 1',
      total: '1,200',
      input: '900',
      output: '300',
      cacheHit: '300',
      cacheMiss: '600',
    }),
    'Jun 1 · 1,200 tokens total · 900 input · 300 output · 300 cache hit · 600 cache miss',
  )
})

test('usage heatmap hero and toggle resolution matches Kun behavior', () => {
  assert.equal(resolveUsageHeatmapHeroTitle('populated'), USAGE_HEATMAP_TITLE)
  assert.equal(resolveUsageHeatmapHeroTitle('loading'), 'Preparing your usage calendar')
  assert.equal(resolveUsageHeatmapHeroSub('populated'), USAGE_HEATMAP_SUB)
  assert.equal(
    resolveUsageHeatmapHeroSub('error'),
    'Usage history is not available yet, but the workspace is ready for a new conversation.',
  )
  assert.equal(resolveUsageHeatmapExpandCollapseLabel(true), 'Collapse calendar')
  assert.equal(resolveUsageHeatmapExpandCollapseLabel(false), 'Expand calendar')
})
