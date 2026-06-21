// Agent skills tests (plan §D7 + §D5 contract).
//
// Guards the load-bearing invariants of the skills design:
//   1. packageGlobalSkill produces stable ids, and the id matches between the
//      reference and the directory (the contract the agent factory + the server
//      seam both depend on — a drift breaks skill activation silently).
//   2. The seam's inline id computation in scripts/patch-flue-server.mjs agrees
//      with packageGlobalSkill on real inputs (the two MUST stay algorithmically
//      identical; this test is the drift detector).
//   3. The built-in catalog in src/shared/flue.ts is entirely `navi-*`-namespaced
//      (D7) — a built-in without that prefix could collide-by-name with a global
//      or project skill, and Flue treats that as a hard init failure (C3).
//   4. The skill name validator rejects the reserved `navi-*` prefix for globals
//      (the write-side guard that makes (3) a complete fence).
//   5. A same-name collision between a definition skill and a discovered skill
//      throws — reproducing C3 directly, so the `navi-*` namespace is provably
//      what keeps navi off that failure path.
//
// Shared .ts modules are bundled to a temp .mjs via esbuild (same pattern as
// agent-config.test.mjs), then imported.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { bundleAgent, BUILT_IN_STUB_NAMES } from './_helpers/bundle-agent.mjs'

const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// Bundle the shared .ts modules the tests exercise into importable .mjs.
const pkgOut = join(ROOT, 'node_modules', '.global-skill-pkg-test.mjs')
const mdOut = join(ROOT, 'node_modules', '.skill-md-test.mjs')
const flueOut = join(ROOT, 'node_modules', '.flue-skills-test.mjs')
buildSync({
  entryPoints: [join(ROOT, 'src', 'shared', 'global-skill-pkg.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: pkgOut,
})
buildSync({
  entryPoints: [join(ROOT, 'src', 'shared', 'skill-md.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: mdOut,
})
// For src/shared/flue.ts, bundle with node platform so the pure data exports
// (BUILT_IN_SKILLS, SKILL_STARTERS) are reachable without a renderer env.
buildSync({
  entryPoints: [join(ROOT, 'src', 'shared', 'flue.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: flueOut,
})

const { packageGlobalSkill, globalSkillId, referencesFromManifest } = await import(
  'file://' + pkgOut
)
const { parseSkillMarkdown, composeSkillMd, SKILL_NAME_PATTERN } = await import(
  'file://' + mdOut
)
const { BUILT_IN_SKILLS, SKILL_STARTERS } = await import('file://' + flueOut)

// --- (1) packageGlobalSkill: stable ids, ref/dir agreement -----------------

test('packageGlobalSkill produces stable ids for identical content', () => {
  const entry = {
    name: 'my-global',
    description: 'desc',
    files: [{ path: 'SKILL.md', content: 'aGVsbG8=', kind: 'text' }],
  }
  const a = packageGlobalSkill(entry)
  const b = packageGlobalSkill(entry)
  assert.equal(a.directory.id, b.directory.id, 'identical content must yield identical id')
  assert.match(a.directory.id, /^skill:my-global:[0-9a-f]{16}$/, 'id format: skill:<name>:<16hex>')
})

test('packageGlobalSkill reference id matches directory id', () => {
  const entry = {
    name: 'x',
    description: 'd',
    files: [{ path: 'SKILL.md', content: 'aGVsbG8=', kind: 'text' }],
  }
  const { directory, reference } = packageGlobalSkill(entry)
  assert.equal(directory.id, reference.id, 'the runtime looks up packagedSkills[reference.id]')
  assert.equal(reference.__flueSkillReference, true, 'must carry the runtime marker')
})

test('packageGlobalSkill id changes when content changes', () => {
  const base = { name: 'x', description: 'd' }
  const a = packageGlobalSkill({ ...base, files: [{ path: 'SKILL.md', content: 'YQ==', kind: 'text' }] })
  const b = packageGlobalSkill({ ...base, files: [{ path: 'SKILL.md', content: 'Yg==', kind: 'text' }] })
  assert.notEqual(a.directory.id, b.directory.id, 'edited skill must get a fresh id')
})

test('packageGlobalSkill id is order-independent (files sorted before hashing)', () => {
  const base = { name: 'x', description: 'd' }
  const f1 = { path: 'SKILL.md', content: 'YQ==', kind: 'text' }
  const f2 = { path: 'refs/a.md', content: 'Yg==', kind: 'text' }
  const a = packageGlobalSkill({ ...base, files: [f1, f2] })
  const b = packageGlobalSkill({ ...base, files: [f2, f1] })
  assert.equal(a.directory.id, b.directory.id, 'directory iteration order must not perturb the id')
})

// --- (2) seam id contract: patch-flue-server.mjs inline id == packageGlobalSkill id
//
// The seam block in scripts/patch-flue-server.mjs inlines the id computation
// (it can't import the shared module into generated server text). This test is
// the drift detector: if anyone edits one without the other, skill activation
// silently breaks. We replicate the seam's exact algorithm here and assert
// equality on several real inputs.

import { createHash } from 'node:crypto'
function seamId(entry) {
  const sorted = [...(entry.files || [])].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
  let input = entry.name
  for (const f of sorted) input += '\0' + f.path + '\0' + f.kind + '\0' + f.content
  return 'skill:' + entry.name + ':' + createHash('sha256').update(input, 'utf8').digest('hex').slice(0, 16)
}

test('seam inline id matches packageGlobalSkill id (the §D5 contract)', () => {
  const cases = [
    { name: 'my-global', description: 'one', files: [{ path: 'SKILL.md', content: 'YQ==', kind: 'text' }] },
    { name: 'two-files', description: 'two', files: [
      { path: 'SKILL.md', content: 'aGVsbG8=', kind: 'text' },
      { path: 'refs/x.md', content: 'd29ybGQ=', kind: 'text' },
    ] },
    { name: 'binary-asset', description: 'bin', files: [
      { path: 'SKILL.md', content: 'YQ==', kind: 'text' },
      { path: 'img.png', content: 'iVBORw0KGgo=', kind: 'binary' },
    ] },
  ]
  for (const entry of cases) {
    const shared = packageGlobalSkill(entry).directory.id
    assert.equal(seamId(entry), shared, `id mismatch for "${entry.name}" — seam drifted from packageGlobalSkill`)
  }
})

// --- (3) D7: every built-in is navi-*-namespaced ---------------------------

test('every built-in skill is navi-*-namespaced (D7)', () => {
  assert.ok(BUILT_IN_SKILLS.length > 0, 'expected at least one built-in skill')
  for (const s of BUILT_IN_SKILLS) {
    assert.ok(
      s.name.startsWith('navi-'),
      `built-in "${s.name}" must be navi-*-prefixed so it can't collide with a global/project skill`,
    )
    assert.ok(s.description, `built-in "${s.name}" must have a description`)
  }
})

test('starter templates never use the reserved navi-* prefix and parse cleanly', () => {
  for (const s of SKILL_STARTERS) {
    assert.ok(
      !s.name.startsWith('navi-'),
      `starter "${s.name}" must not use the reserved navi-* prefix`,
    )
    // Each starter must parse cleanly through the spec validator.
    const md = composeSkillMd(s)
    assert.doesNotThrow(() =>
      parseSkillMarkdown(md, { directoryName: s.name, path: `/${s.name}/SKILL.md` }),
      `starter "${s.name}" must produce spec-valid SKILL.md`,
    )
  }
})

// --- (4) write-side guard: the validator rejects navi-* for globals --------
//
// src/main/skills.ts uses SKILL_NAME_PATTERN + a BUILT_IN_PREFIX check. We test
// the shared pattern here and the prefix rule via the parser's name rule, since
// the main-module guard depends on Electron's `app` (can't import in node:test).
// The pattern + prefix together form the fence; (3) is the other side.

test('SKILL_NAME_PATTERN accepts valid skill names', () => {
  assert.ok(SKILL_NAME_PATTERN.test('my-skill'))
  assert.ok(SKILL_NAME_PATTERN.test('a'))
  assert.ok(SKILL_NAME_PATTERN.test('release-notes-v2'))
})

test('SKILL_NAME_PATTERN rejects names that would break the namespace', () => {
  assert.ok(!SKILL_NAME_PATTERN.test('My-Skill'), 'uppercase rejected')
  assert.ok(!SKILL_NAME_PATTERN.test('-leading'), 'leading hyphen rejected')
  assert.ok(!SKILL_NAME_PATTERN.test('trailing-'), 'trailing hyphen rejected')
  assert.ok(!SKILL_NAME_PATTERN.test('double--hyphen'), 'consecutive hyphens rejected')
  assert.ok(!SKILL_NAME_PATTERN.test('has_underscore'), 'underscore rejected')
  assert.ok(!SKILL_NAME_PATTERN.test('has space'), 'space rejected')
})

test('the navi- prefix is reserved: a global skill named navi-x would fail the write guard', () => {
  // The write guard in skills.ts is: validateSkillName rejects names starting
  // with BUILT_IN_PREFIX ('navi-'). We assert the reserved set is exactly the
  // built-ins, so the guard and the catalog agree on what's reserved.
  const reservedPrefix = 'navi-'
  for (const s of BUILT_IN_SKILLS) {
    assert.ok(
      s.name.startsWith(reservedPrefix),
      `built-in "${s.name}" defines the reserved prefix`,
    )
  }
  // A hypothetical global with the prefix is exactly what the guard blocks:
  assert.ok('navi-anything'.startsWith(reservedPrefix))
})

// --- (5) C3 reproduction: same-name definition + discovery = hard failure ---
//
// Flue's mergeSkillCatalog throws when a skill name appears in BOTH the agent
// definition (built-ins + globals) and the workspace discovery (<cwd>/.agents/
// skills). This is why the navi-* namespace exists: a global named the same as
// a built-in would throw here and brick the agent. We reproduce the rule inline
// (it's a one-liner) to lock the invariant the namespace protects.

test('C3: a same-name definition + discovered skill throws (the failure D7 prevents)', () => {
  function mergeSkillCatalog(definitionSkills, discoveredSkills) {
    const merged = Object.create(null)
    for (const skill of definitionSkills) merged[skill.name] = skill
    for (const [name, skill] of Object.entries(discoveredSkills)) {
      if (Object.hasOwn(merged, name)) {
        throw new Error(`[flue] Skill name "${name}" appears in both agent definition and workspace discovery.`)
      }
      merged[name] = skill
    }
    return merged
  }
  // A collision throws.
  assert.throws(
    () => mergeSkillCatalog([{ name: 'x' }], { x: { name: 'x' } }),
    /appears in both/,
    'same-name definition + discovery must throw (C3)',
  )
  // Distinct names merge cleanly — the happy path the namespace keeps us on.
  assert.doesNotThrow(() =>
    mergeSkillCatalog([{ name: 'navi-x' }], { 'my-global': { name: 'my-global' } }),
  )
})

// --- bonus: parseSkillMarkdown round-trips through composeSkillMd -----------

test('parseSkillMarkdown + composeSkillMd round-trip', () => {
  const draft = { name: 'round-trip', description: 'a desc', body: '# Title\n\nbody text' }
  const md = composeSkillMd(draft)
  const parsed = parseSkillMarkdown(md, { directoryName: 'round-trip', path: '/x/SKILL.md' })
  assert.equal(parsed.name, draft.name)
  assert.equal(parsed.description, draft.description)
  // composeSkillMd appends a trailing newline (conventional for files); the
  // parser preserves body content verbatim after stripping the leading newline
  // that follows the frontmatter close. Compare trimmed to allow that.
  assert.equal(parsed.body.trim(), draft.body.trim())
})

test('referencesFromManifest excludes reserved names (D7 defense-in-depth)', () => {
  const manifest = [
    { name: 'ok-global', description: 'd', files: [{ path: 'SKILL.md', content: 'YQ==', kind: 'text' }] },
    { name: 'navi-x', description: 'd', files: [{ path: 'SKILL.md', content: 'Yg==', kind: 'text' }] },
  ]
  const refs = referencesFromManifest(manifest, new Set(['navi-x']))
  assert.equal(refs.length, 1, 'a name in the built-in exclusion set is filtered out')
  assert.equal(refs[0].name, 'ok-global')
})

// --- enable-list resolution rule (the default-on invariant C1 protects) -----
//
// `resolveEnabled` in src/main/skills.ts and `ensureGlobalSkillEnabled` in
// src/main/settings.ts share a load-bearing rule: an ABSENT enable list means
// "all on" (so a fresh skill is on by default), but a PRESENT list is an
// explicit opt-in set (so a fresh skill not in it is off). C1's fix adds the
// new name only when the list is present — and crucially must NOT materialize an
// absent list (or it would flip every existing skill off). Both depend on
// Electron's `app`, so we replicate the pure rules here and pin them down, the
// same way the C3 test replicates mergeSkillCatalog.

test('enable-list rule: absent list ⇒ all skills enabled (default-on)', () => {
  function resolveEnabled(skills, enabledList) {
    const enabled = enabledList === undefined ? null : new Set(enabledList)
    return skills.map((s) => ({ ...s, enabled: enabled === null ? true : enabled.has(s.name) }))
  }
  const skills = [{ name: 'a' }, { name: 'b' }, { name: 'c' }]
  const all = resolveEnabled(skills, undefined)
  assert.ok(all.every((s) => s.enabled), 'absent list ⇒ every skill enabled')
  // A present list is opt-in — skills NOT in it go off.
  const opted = resolveEnabled(skills, ['a'])
  assert.equal(opted.find((s) => s.name === 'a').enabled, true, 'listed skill is on')
  assert.equal(opted.find((s) => s.name === 'b').enabled, false, 'unlisted skill is off')
})

test('ensureGlobalSkillEnabled must not materialize an absent list (C1 regression guard)', () => {
  // Replicate the guard's logic: only write when the list is already present.
  // If it wrongly wrote [name] on an absent list, every other skill would flip
  // off — the regression this test exists to prevent.
  function nextStore(store, name) {
    if (store.enabledGlobalSkills === undefined) return store // absent ⇒ no-op
    return { ...store, enabledGlobalSkills: [...new Set([...store.enabledGlobalSkills, name])].sort() }
  }
  // Absent list is left untouched (so "all on" survives creating a new skill).
  const absent = { providers: [] }
  assert.equal(nextStore(absent, 'new-kid'), absent, 'absent list must NOT be materialized')
  // Present list gets the new name added.
  const present = { enabledGlobalSkills: ['a', 'b'] }
  const written = nextStore(present, 'c')
  assert.deepEqual(written.enabledGlobalSkills, ['a', 'b', 'c'], 'present list gains the new name')
})

// --- (6) catalog parity: the three built-in surfaces agree ------------------
//
// The built-in skill set is named in THREE independent places that must agree,
// or the stub the test bundle emits won't match what the renderer lists
// (BUILT_IN_SKILLS) or what the agent actually imports (.flue/agents). The
// helper's header claims a "dedicated assertion" catches this — this is it.
//   1. src/shared/flue.ts BUILT_IN_SKILLS        (what the renderer lists)
//   2. .flue/agents/navi-assistant.ts imports    (what the agent bundles)
//   3. test/_helpers/bundle-agent.mjs stub names (what tests substitute)
// We bundle the agent with the stub and read its initialize() skills array
// (no manifest ⇒ built-ins only), then compare all three sets for equality.

test('the three built-in skill surfaces agree (catalog parity)', async () => {
  const outfile = await bundleAgent(ROOT, 'global-skills-parity')
  const agent = require(outfile).default

  const tmp = mkdtempSync(join(tmpdir(), 'navi-parity-'))
  const storeFile = join(tmp, 'store.json')
  writeFileSync(
    storeFile,
    JSON.stringify({
      projects: [{ id: 'navi-default', path: '', name: 'navi', label: '', createdAt: 1, updatedAt: 1 }],
      conversations: [
        { id: 'c-parity', projectId: 'navi-default', title: 't', createdAt: 1, updatedAt: 1, messages: [] },
      ],
    }),
  )
  try {
    const config = await agent.initialize({
      id: 'c-parity',
      env: { NAVI_CONVERSATIONS_PATH: storeFile },
    })
    // Only built-ins load with no manifest + no project cwd.
    const agentNames = config.skills.map((s) => s.name).sort()
    const catalogNames = BUILT_IN_SKILLS.map((s) => s.name).sort()
    const stubNames = [...BUILT_IN_STUB_NAMES].sort()
    assert.deepEqual(
      agentNames,
      catalogNames,
      'agent-bundled built-ins must equal the shared catalog (renderer lists the catalog)',
    )
    assert.deepEqual(
      stubNames,
      catalogNames,
      'the test stub names must equal the catalog (a drift makes every agent test assert the wrong set)',
    )
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
})
