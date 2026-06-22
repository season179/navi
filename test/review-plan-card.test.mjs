import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.review-plan-card-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'reviewPlanCard.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  REVIEW_PLAN_BUILD_LABEL,
  REVIEW_PLAN_CARD_HINT,
  REVIEW_PLAN_OPEN_LABEL,
} = await import(out)

test('review plan card chrome copy matches Kun locale strings', () => {
  assert.equal(
    REVIEW_PLAN_CARD_HINT,
    'Plan ready — review or edit it on the right.',
  )
  assert.equal(REVIEW_PLAN_OPEN_LABEL, 'Open')
  assert.equal(REVIEW_PLAN_BUILD_LABEL, 'Build')
})
