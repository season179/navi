import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.workspace-select-empty-hero-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'workspaceSelectEmptyHero.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  WORKSPACE_SELECT_EMPTY_HERO_TITLE,
  WORKSPACE_SELECT_EMPTY_HERO_SUB,
  WORKSPACE_SELECT_EMPTY_HERO_BUTTON,
} = await import(out)

test('workspace select empty hero copy matches Kun locale strings', () => {
  assert.equal(WORKSPACE_SELECT_EMPTY_HERO_TITLE, 'Choose working directory')
  assert.equal(
    WORKSPACE_SELECT_EMPTY_HERO_SUB,
    'Pick a local working directory first, then start your first thread.',
  )
  assert.equal(WORKSPACE_SELECT_EMPTY_HERO_BUTTON, 'Choose working directory')
})
