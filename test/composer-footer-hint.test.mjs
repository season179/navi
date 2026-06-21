import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-footer-hint-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerFooterHint.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  COMPOSER_FOOTER_HINT_SLASH,
  COMPOSER_FOOTER_HINT_WORKTREE,
  resolveComposerFooterHintPreview,
} = await import(out)

test('COMPOSER_FOOTER_HINT_SLASH matches Kun composerSlashHint English copy', () => {
  assert.equal(COMPOSER_FOOTER_HINT_SLASH, 'Type / for commands')
})

test('COMPOSER_FOOTER_HINT_WORKTREE matches Kun composerWorktreeModeHint English copy', () => {
  assert.equal(
    COMPOSER_FOOTER_HINT_WORKTREE,
    'Worktree mode on — create a new conversation to run in parallel.',
  )
})

test('resolveComposerFooterHintPreview routes default and worktree modes', () => {
  assert.equal(resolveComposerFooterHintPreview('default'), COMPOSER_FOOTER_HINT_SLASH)
  assert.equal(resolveComposerFooterHintPreview('worktree'), COMPOSER_FOOTER_HINT_WORKTREE)
})
