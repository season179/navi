import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.worktree-settings-section-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'worktreeSettingsSection.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const mod = await import(out)

test('worktree settings section copy matches Kun locale strings', () => {
  assert.equal(mod.WORKTREE_SETTINGS_SECTION_TITLE, 'Git worktrees')
  assert.equal(mod.WORKTREE_SETTINGS_OVERVIEW_TITLE, 'Worktree pool')
  assert.equal(
    mod.WORKTREE_SETTINGS_OVERVIEW_DESC,
    'Manage a pool of Git worktrees so multiple agents can work on the same project in parallel on isolated branches.',
  )
  assert.equal(mod.WORKTREE_SETTINGS_NOT_CREATED_LABEL, 'Not created yet')
  assert.equal(mod.WORKTREE_SETTINGS_SYNC_TITLE, 'Sync from main (rebase)')
  assert.equal(mod.WORKTREE_SETTINGS_REMOVE_TITLE, 'Remove')
  assert.equal(mod.WORKTREE_SETTINGS_CLEANUP_ALL_LABEL, 'Clean up all')
  assert.equal(
    mod.WORKTREE_SETTINGS_NOT_GIT_REPO,
    'The current workspace is not a Git repository. Worktrees require a Git project — please select one in General settings.',
  )
})

test('worktree settings section formatter helpers match Kun locale templates', () => {
  assert.equal(
    mod.formatWorktreeSettingsForceConfirm(3),
    'This worktree has 3 uncommitted change(s). Force-reset will discard them. Continue?',
  )
})

test('worktree settings section exports expected constant count', () => {
  const constants = Object.keys(mod).filter((key) => key.startsWith('WORKTREE_SETTINGS_'))
  assert.equal(constants.length, 20)
})
