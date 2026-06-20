// Unit tests for src/shared/projects.ts — path helpers and store-resolved cwd.
// Pure module, no Electron needed.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'
import { buildSync } from 'esbuild'

const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const outfile = join(ROOT, 'node_modules', '.projects-test.cjs')
buildSync({
  entryPoints: [join(ROOT, 'src', 'shared', 'projects.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile,
})
const { projectName, projectLabel, resolveProjectCwd } = require(outfile)

test('projectName derives basename from absolute paths', () => {
  assert.equal(projectName('/Users/me/code/navi'), 'navi')
  assert.equal(projectName('/foo/'), 'foo')
  assert.equal(projectName('C:\\Users\\me\\web\\'), 'web')
})

test('projectName handles edge paths', () => {
  assert.equal(projectName(''), '')
  assert.equal(projectName('/'), '')
  assert.equal(projectName('///'), '')
})

test('projectLabel derives parent-dir basename', () => {
  assert.equal(projectLabel('/Users/me/code/navi'), 'code')
  assert.equal(projectLabel('/foo/bar'), 'foo')
  assert.equal(projectLabel('/top-level'), '')
  assert.equal(projectLabel(''), '')
  assert.equal(projectLabel('/'), '')
})

test('resolveProjectCwd returns project path for bound conversation', () => {
  const store = {
    projects: [{ id: 'p1', path: '/tmp/myproj' }],
    conversations: [{ id: 'c1', projectId: 'p1' }],
  }
  assert.equal(resolveProjectCwd(store, 'c1'), '/tmp/myproj')
})

test('resolveProjectCwd returns undefined for default empty path', () => {
  const store = {
    projects: [{ id: 'navi-default', path: '' }],
    conversations: [{ id: 'c1', projectId: 'navi-default' }],
  }
  assert.equal(resolveProjectCwd(store, 'c1'), undefined)
})

test('resolveProjectCwd returns undefined for unknown conversation or project', () => {
  const store = {
    projects: [{ id: 'p1', path: '/tmp/x' }],
    conversations: [{ id: 'c1', projectId: 'p1' }],
  }
  assert.equal(resolveProjectCwd(store, 'missing'), undefined)
  assert.equal(
    resolveProjectCwd(
      { projects: [], conversations: [{ id: 'c1', projectId: 'orphan' }] },
      'c1',
    ),
    undefined,
  )
})
