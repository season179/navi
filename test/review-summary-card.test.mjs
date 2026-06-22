import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.review-summary-card-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'reviewSummaryCard.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  REVIEW_SUMMARY_CARD_FAILED_LABEL,
  REVIEW_SUMMARY_CARD_FINDINGS_TEMPLATE,
  REVIEW_SUMMARY_CARD_NO_FINDINGS_LABEL,
  REVIEW_SUMMARY_CARD_RUNNING_LABEL,
  formatReviewSummaryCardFindings,
  resolveReviewSummaryCardStatusLabel,
} = await import(out)

test('review summary card chrome copy matches Kun locale strings', () => {
  assert.equal(REVIEW_SUMMARY_CARD_RUNNING_LABEL, 'Reviewing changes…')
  assert.equal(REVIEW_SUMMARY_CARD_FAILED_LABEL, 'Review failed')
  assert.equal(REVIEW_SUMMARY_CARD_NO_FINDINGS_LABEL, 'No findings')
  assert.equal(REVIEW_SUMMARY_CARD_FINDINGS_TEMPLATE, '{{count}} findings')
})

test('review summary card status label resolution matches Kun behavior', () => {
  assert.equal(
    resolveReviewSummaryCardStatusLabel({
      running: true,
      failed: false,
      findingsCount: 0,
    }),
    'Reviewing changes…',
  )
  assert.equal(
    resolveReviewSummaryCardStatusLabel({
      running: false,
      failed: true,
      findingsCount: 3,
    }),
    'Review failed',
  )
  assert.equal(
    resolveReviewSummaryCardStatusLabel({
      running: false,
      failed: false,
      findingsCount: 0,
    }),
    'No findings',
  )
  assert.equal(formatReviewSummaryCardFindings(1), '1 findings')
  assert.equal(formatReviewSummaryCardFindings(2), '2 findings')
  assert.equal(
    resolveReviewSummaryCardStatusLabel({
      running: false,
      failed: false,
      findingsCount: 2,
    }),
    '2 findings',
  )
})
