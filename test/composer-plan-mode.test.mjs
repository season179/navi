import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-plan-mode-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerPlanMode.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const { COMPOSER_PLAN_MODE_PLACEHOLDER } = await import(out)

test('COMPOSER_PLAN_MODE_PLACEHOLDER matches Kun composerPlanPlaceholder English copy', () => {
  assert.equal(
    COMPOSER_PLAN_MODE_PLACEHOLDER,
    'Break the goal down, outline steps, and scope changes before execution…',
  )
})
