import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-workspace-project-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerWorkspaceProject.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  resolveWorkspaceProjectEmptyLabel,
  WORKSPACE_PROJECT_ADD_LABEL,
  WORKSPACE_PROJECT_EMPTY_LABEL,
  WORKSPACE_PROJECT_NO_MATCH_LABEL,
  WORKSPACE_PROJECT_SEARCH_PLACEHOLDER,
  WORKSPACE_PROJECT_SECTION_LABEL,
  WORKSPACE_PROJECT_SELECT_LABEL,
  WORKSPACE_PROJECT_WORKING_DIRECTORY_LABEL,
} = await import(out)

test('workspace project picker chrome copy matches Kun locale strings', () => {
  assert.equal(WORKSPACE_PROJECT_WORKING_DIRECTORY_LABEL, 'Working directory')
  assert.equal(WORKSPACE_PROJECT_SELECT_LABEL, 'Choose working directory')
  assert.equal(WORKSPACE_PROJECT_SECTION_LABEL, 'Projects')
  assert.equal(WORKSPACE_PROJECT_SEARCH_PLACEHOLDER, 'Search projects')
  assert.equal(WORKSPACE_PROJECT_EMPTY_LABEL, 'No projects yet')
  assert.equal(WORKSPACE_PROJECT_NO_MATCH_LABEL, 'No matching projects')
  assert.equal(WORKSPACE_PROJECT_ADD_LABEL, 'Add project')
})

test('resolveWorkspaceProjectEmptyLabel matches Kun empty-state priority', () => {
  assert.equal(
    resolveWorkspaceProjectEmptyLabel({ hasOptions: false }),
    'No projects yet',
  )
  assert.equal(
    resolveWorkspaceProjectEmptyLabel({ hasOptions: true }),
    'No matching projects',
  )
})
