// Verifies plan §6.4: project conversations resolve cwd + sandbox from the
// store; default "navi" conversations stay plain chat (no cwd/sandbox). Also
// verifies the agent skills wiring (§D3/§D5): built-ins are always present, and
// global skill references are synthesized from the manifest with D7 filtering.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { bundleAgent } from './_helpers/bundle-agent.mjs'

const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const outfile = await bundleAgent(ROOT, 'agent-config-test')
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
    // Built-in navi-* skills are bundled and present in every conversation.
    assert.ok(Array.isArray(config.skills), 'agent config must carry a skills array')
    const names = config.skills.map((s) => s.name)
    assert.ok(names.includes('navi-release-notes'), 'built-in navi-release-notes is bundled')
    assert.ok(names.includes('navi-commit-message'), 'built-in navi-commit-message is bundled')
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
    // Even no-project chat gets the built-in skills — the whole point of
    // bundling them via skills:[...] (they don't depend on a cwd to discover).
    const names = config.skills.map((s) => s.name)
    assert.ok(names.includes('navi-release-notes'), 'built-ins load in no-project chat too')
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
})

// --- Agent skills wiring (plan §D3 / §D5) ----------------------------------
//
// The factory reads NAVI_GLOBAL_SKILLS_MANIFEST (a JSON file main writes) and
// synthesizes SkillReferences for each enabled global, merging them with the
// built-ins. This is the second half of the §D5 seam: the server patch
// registers the matching directories, the factory emits the references.

test('agent factory synthesizes global skill references from the manifest', async () => {
  const tmp = mkdtempSync(join(tmpdir(), 'navi-agent-globals-'))
  const storeFile = join(tmp, 'store.json')
  const manifestFile = join(tmp, 'manifest.json')
  const convId = 'conv-globals'
  writeFileSync(
    storeFile,
    JSON.stringify({
      projects: [{ id: 'navi-default', path: '', name: 'navi', label: '', createdAt: 1, updatedAt: 1 }],
      conversations: [
        { id: convId, projectId: 'navi-default', title: 't', createdAt: 1, updatedAt: 1, messages: [] },
      ],
    }),
  )
  // A manifest with one valid global + one reserved name (navi-*) that must be
  // filtered out by referencesFromManifest's exclusion set (D7 defense-in-depth).
  writeFileSync(
    manifestFile,
    JSON.stringify([
      {
        name: 'my-global',
        description: 'a user global',
        files: [{ path: 'SKILL.md', content: 'aGVsbG8=', kind: 'text' }],
      },
      {
        name: 'navi-release-notes', // collides with a built-in — must be dropped
        description: 'sneaky',
        files: [{ path: 'SKILL.md', content: 'Yg==', kind: 'text' }],
      },
    ]),
  )

  try {
    const config = await agent.initialize({
      id: convId,
      env: { NAVI_CONVERSATIONS_PATH: storeFile, NAVI_GLOBAL_SKILLS_MANIFEST: manifestFile },
    })
    const byName = new Map(config.skills.map((s) => [s.name, s]))
    // Built-ins always present.
    assert.ok(byName.has('navi-release-notes'), 'built-in still present')
    assert.ok(byName.has('navi-commit-message'), 'built-in still present')
    // The global from the manifest is synthesized as a SkillReference.
    const g = byName.get('my-global')
    assert.ok(g, 'global skill reference synthesized from manifest')
    assert.equal(g.__flueSkillReference, true, 'global ref carries the runtime marker')
    assert.match(g.id, /^skill:my-global:[0-9a-f]{16}$/, 'global ref id format')
    // CRITICAL (D7): the manifest entry that collides with a built-in name is
    // filtered out — only ONE navi-release-notes exists (the built-in). Without
    // this filter, Flue's mergeSkillCatalog would throw C3 and brick the agent.
    const releaseNotesCount = config.skills.filter((s) => s.name === 'navi-release-notes').length
    assert.equal(releaseNotesCount, 1, 'a navi-* name in the manifest must not duplicate the built-in')
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
})

test('agent factory is resilient to a missing/unreadable global skills manifest', async () => {
  const tmp = mkdtempSync(join(tmpdir(), 'navi-agent-nomanifest-'))
  const storeFile = join(tmp, 'store.json')
  const convId = 'conv-nomanifest'
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
    // No NAVI_GLOBAL_SKILLS_MANIFEST at all, and one pointing at a missing file.
    const config1 = await agent.initialize({ id: convId, env: { NAVI_CONVERSATIONS_PATH: storeFile } })
    assert.ok(config1.skills.some((s) => s.name === 'navi-commit-message'), 'built-ins load without a manifest')
    const config2 = await agent.initialize({
      id: convId,
      env: { NAVI_CONVERSATIONS_PATH: storeFile, NAVI_GLOBAL_SKILLS_MANIFEST: join(tmp, 'nope.json') },
    })
    assert.equal(config2.skills.length, config1.skills.length, 'missing manifest file = no globals, built-ins intact')
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
})
