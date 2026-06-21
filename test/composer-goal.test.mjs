import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-goal-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerGoal.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const { COMPOSER_GOAL_PREVIEW } = await import(out)

test('COMPOSER_GOAL_PREVIEW matches Kun goal mock data', () => {
  assert.equal(COMPOSER_GOAL_PREVIEW.objective, 'Port Kun FloatingComposer visuals into navi')
  assert.equal(COMPOSER_GOAL_PREVIEW.status, 'active')
  assert.equal(COMPOSER_GOAL_PREVIEW.elapsedLabel, '12m')
})
