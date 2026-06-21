// Verifies plan §6.4: project conversations resolve cwd + sandbox from the store;
// default "navi" conversations stay plain chat (no cwd/sandbox).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { buildSync } from 'esbuild'

const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const outfile = join(ROOT, 'node_modules', '.agent-config-test.cjs')
buildSync({
  entryPoints: [join(ROOT, '.flue', 'agents', 'navi-assistant.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile,
})
const agent = require(outfile).default

test('project conversation agent config uses real folder cwd and sandbox', async () => {
  const tmp = mkdtempSync(join(tmpdir(), 'navi-agent-proj-'))
  const projDir = join(tmp, 'my-repo')
  mkdirSync(projDir, { recursive: true })
  writeFileSync(join(projDir, 'package.json'), '{"name":"fixture"}\n')

  const storeFile = join(tmp, 'store.json')
  const convId = 'conv-project'
  const projId = 'proj-1'
  writeFileSync(
    storeFile,
    JSON.stringify({
      projects: [{ id: projId, path: projDir, name: 'my-repo', label: '', createdAt: 1, updatedAt: 1 }],
      conversations: [{ id: convId, projectId: projId, title: 't', createdAt: 1, updatedAt: 1, messages: [] }],
    }),
  )

  try {
    const config = await agent.initialize({
      id: convId,
      env: { NAVI_CONVERSATIONS_PATH: storeFile },
    })
    assert.equal(config.cwd, projDir, 'cwd must be the project directory')
    assert.ok(config.sandbox, 'project conversation must have a sandbox')
    assert.match(config.instructions, /my-repo|project directory/i)
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
})

test('default navi conversation agent config has no cwd or sandbox', async () => {
  const tmp = mkdtempSync(join(tmpdir(), 'navi-agent-default-'))
  const storeFile = join(tmp, 'store.json')
  const convId = 'conv-default'
  writeFileSync(
    storeFile,
    JSON.stringify({
      projects: [{ id: 'navi-default', path: '', name: 'navi', label: '', createdAt: 1, updatedAt: 1 }],
      conversations: [
        { id: convId, projectId: 'navi-default', title: 't', createdAt: 1, updatedAt: 1, messages: [] },
      ],
    }),
  )

  try {
    const config = await agent.initialize({
      id: convId,
      env: { NAVI_CONVERSATIONS_PATH: storeFile },
    })
    assert.equal(config.cwd, undefined, 'default navi must not set cwd')
    assert.equal(config.sandbox, undefined, 'default navi must not set sandbox')
    assert.doesNotMatch(config.instructions, /project directory/i)
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
})
