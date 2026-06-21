import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-plus-menu-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerPlusMenu.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  COMPOSER_PLUS_MENU_PREVIEW_DEFAULT,
  resolveComposerPlusMenuPreview,
} = await import(out)

test('COMPOSER_PLUS_MENU_PREVIEW_DEFAULT matches Kun plusMenu snapshot toggles', () => {
  assert.equal(COMPOSER_PLUS_MENU_PREVIEW_DEFAULT.planMode, false)
  assert.equal(COMPOSER_PLUS_MENU_PREVIEW_DEFAULT.goalActive, true)
  assert.equal(COMPOSER_PLUS_MENU_PREVIEW_DEFAULT.worktreeMode, false)
})

test('resolveComposerPlusMenuPreview routes plan, goal, and worktree modes', () => {
  assert.deepEqual(resolveComposerPlusMenuPreview('default'), {
    open: true,
    toggles: COMPOSER_PLUS_MENU_PREVIEW_DEFAULT,
  })
  assert.equal(resolveComposerPlusMenuPreview('plan').toggles.planMode, true)
  assert.equal(resolveComposerPlusMenuPreview('plan').toggles.goalActive, false)
  assert.equal(resolveComposerPlusMenuPreview('goal').toggles.goalActive, true)
  assert.equal(resolveComposerPlusMenuPreview('worktree').toggles.worktreeMode, true)
})
