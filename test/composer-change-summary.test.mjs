import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-change-summary-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerChangeSummary.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  COMPOSER_CHANGE_SUMMARY_PREVIEW,
  COMPOSER_CHANGE_SUMMARY_OVERFLOW_PREVIEW,
  COMPOSER_CHANGE_SUMMARY_REVIEW_DISABLED_PREVIEW,
  COMPOSER_CHANGE_SUMMARY_VISIBLE_LIMIT,
  COMPOSER_OPEN_CHANGES_LABEL,
  COMPOSER_REVIEW_CHANGES_LABEL,
  formatComposerChangedFilesMore,
  formatComposerChangedFilesTitle,
  resolveComposerChangeSummaryPreview,
} = await import(out)

test('COMPOSER_CHANGE_SUMMARY_PREVIEW matches Kun change-summary mock data', () => {
  assert.equal(COMPOSER_CHANGE_SUMMARY_PREVIEW.files.length, 3)
  assert.equal(COMPOSER_CHANGE_SUMMARY_PREVIEW.stats.added, 428)
  assert.equal(COMPOSER_CHANGE_SUMMARY_PREVIEW.stats.removed, 12)
  assert.equal(COMPOSER_CHANGE_SUMMARY_PREVIEW.showOpenChanges, true)
  assert.equal(COMPOSER_CHANGE_SUMMARY_PREVIEW.showReviewChanges, true)
  assert.equal(COMPOSER_CHANGE_SUMMARY_PREVIEW.reviewChangesDisabled, false)
  assert.match(COMPOSER_CHANGE_SUMMARY_PREVIEW.files[0].path, /FloatingComposer\.tsx$/)
})

test('change-summary copy matches Kun locale strings', () => {
  assert.equal(formatComposerChangedFilesTitle(3), '3 files changed')
  assert.equal(formatComposerChangedFilesMore(2), '+2 more')
  assert.equal(COMPOSER_OPEN_CHANGES_LABEL, 'Preview')
  assert.equal(COMPOSER_REVIEW_CHANGES_LABEL, 'Review')
  assert.equal(COMPOSER_CHANGE_SUMMARY_VISIBLE_LIMIT, 3)
})

test('resolveComposerChangeSummaryPreview routes overflow and reviewDisabled modes', () => {
  assert.equal(resolveComposerChangeSummaryPreview(null), COMPOSER_CHANGE_SUMMARY_PREVIEW)
  assert.equal(resolveComposerChangeSummaryPreview('1'), COMPOSER_CHANGE_SUMMARY_PREVIEW)
  assert.equal(
    resolveComposerChangeSummaryPreview('overflow'),
    COMPOSER_CHANGE_SUMMARY_OVERFLOW_PREVIEW,
  )
  assert.equal(
    resolveComposerChangeSummaryPreview('reviewDisabled'),
    COMPOSER_CHANGE_SUMMARY_REVIEW_DISABLED_PREVIEW,
  )
  assert.equal(COMPOSER_CHANGE_SUMMARY_OVERFLOW_PREVIEW.files.length, 5)
  assert.equal(COMPOSER_CHANGE_SUMMARY_REVIEW_DISABLED_PREVIEW.reviewChangesDisabled, true)
})
