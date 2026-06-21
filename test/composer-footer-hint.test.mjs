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
  COMPOSER_FOOTER_HINT_OFFLINE,
  COMPOSER_FOOTER_HINT_WORKSPACE,
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

test('COMPOSER_FOOTER_HINT_OFFLINE matches Kun composerOfflineHint English copy', () => {
  assert.equal(
    COMPOSER_FOOTER_HINT_OFFLINE,
    'Reconnect the runtime before sending another message.',
  )
})

test('COMPOSER_FOOTER_HINT_WORKSPACE matches Kun composerWorkspaceHint English copy', () => {
  assert.equal(
    COMPOSER_FOOTER_HINT_WORKSPACE,
    'Choose a working directory before starting or continuing a thread.',
  )
})

test('resolveComposerFooterHintPreview routes default, worktree, offline, and workspace modes', () => {
  assert.equal(resolveComposerFooterHintPreview('default'), COMPOSER_FOOTER_HINT_SLASH)
  assert.equal(resolveComposerFooterHintPreview('worktree'), COMPOSER_FOOTER_HINT_WORKTREE)
  assert.equal(resolveComposerFooterHintPreview('offline'), COMPOSER_FOOTER_HINT_OFFLINE)
  assert.equal(resolveComposerFooterHintPreview('workspace'), COMPOSER_FOOTER_HINT_WORKSPACE)
})
