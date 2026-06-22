import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-git-branch-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerGitBranch.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  formatGitCreateNamedBranchLabel,
  formatGitDirtyFilesLabel,
  GIT_BRANCH_LABEL,
  GIT_BRANCH_LOADING_LABEL,
  GIT_BRANCH_UNAVAILABLE_LABEL,
  GIT_BRANCHES_SECTION_LABEL,
  GIT_CREATE_BRANCH_LABEL,
  GIT_DETACHED_HEAD_LABEL,
  GIT_NO_BRANCHES_LABEL,
  GIT_SEARCH_BRANCHES_PLACEHOLDER,
  resolveGitBranchTriggerLabel,
} = await import(out)

test('git branch picker chrome copy matches Kun locale strings', () => {
  assert.equal(GIT_BRANCH_LABEL, 'Git branch')
  assert.equal(GIT_BRANCH_UNAVAILABLE_LABEL, 'No Git repo')
  assert.equal(GIT_DETACHED_HEAD_LABEL, 'Detached HEAD')
  assert.equal(GIT_SEARCH_BRANCHES_PLACEHOLDER, 'Search branches')
  assert.equal(GIT_BRANCHES_SECTION_LABEL, 'Branches')
  assert.equal(GIT_BRANCH_LOADING_LABEL, 'Loading branches…')
  assert.equal(GIT_NO_BRANCHES_LABEL, 'No matching branches.')
  assert.equal(GIT_CREATE_BRANCH_LABEL, 'Create and switch to a new branch…')
})

test('formatGitCreateNamedBranchLabel substitutes branch like Kun i18n', () => {
  assert.equal(
    formatGitCreateNamedBranchLabel('feature/foo'),
    'Create and switch to feature/foo',
  )
})

test('formatGitDirtyFilesLabel substitutes count like Kun i18n', () => {
  assert.equal(formatGitDirtyFilesLabel(3), 'Uncommitted: 3 files')
})

test('resolveGitBranchTriggerLabel matches Kun trigger label priority', () => {
  assert.equal(
    resolveGitBranchTriggerLabel({ currentBranch: 'main', snapshotOk: true }),
    'main',
  )
  assert.equal(
    resolveGitBranchTriggerLabel({ currentBranch: null, snapshotOk: true }),
    'Detached HEAD',
  )
  assert.equal(
    resolveGitBranchTriggerLabel({ currentBranch: null, snapshotOk: false }),
    'No Git repo',
  )
})
