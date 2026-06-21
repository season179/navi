// Unit tests for the post-build server patch. This guards the two most fragile
// couplings in the integration: (1) the regex anchor against Flue's generated
// serve() block (loopback bind + real-port reporting), and (2) the
// packagedSkills snapshot anchor (the global-skills seam, plan §D5). If a Flue
// upgrade reshapes either, these tests (and the build step) must fail loudly
// rather than silently regress.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { patchServerSource, patchGlobalSkillsSeam } from '../scripts/patch-flue-server.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SERVER_PATH = join(ROOT, 'dist', 'server.mjs')

// The exact shape emitted by `flue build --target node` (vite/esbuild output).
const GENERATED = `} else {
\tconst port = parseInt(process.env.PORT || "3000", 10);
\tconst server = (0, import_dist.serve)({
\t\tfetch: (request, env) => flueApp.fetch(request, env),
\t\tport,
\t\tserverOptions: { requestTimeout: 0 }
\t});
\tconsole.log("[flue] Server listening on http://localhost:" + port);
\tif (isLocalMode) console.log("[flue] Mode: local");
}
`

// A minimal server body containing the packagedSkills seam anchor. The seam
// injects immediately before `var packagedSkills = getPackagedSkills();`.
const WITH_SNAPSHOT = `var packagedSkills$1 = new Map();
function getPackagedSkills() { return Object.fromEntries(packagedSkills$1); }
registerPackagedSkill({ id: "skill:builtin:x", name: "x" });
var packagedSkills = getPackagedSkills();
var harness = createHarness({ packagedSkills });
`

test('injects loopback hostname and a real-port FLUE_READY callback', () => {
  const out = patchServerSource(GENERATED)
  assert.match(out, /hostname: process\.env\.FLUE_HOST \|\| "127\.0\.0\.1"/)
  assert.match(out, /FLUE_READY/)
  assert.match(out, /info\.port/)
  // The serve() call gained a second argument (the listening callback).
  assert.match(out, /serverOptions: \{ requestTimeout: 0 \}\s*\}, \(info\) =>/)
})

test('neutralizes the misleading localhost log line', () => {
  const out = patchServerSource(GENERATED)
  assert.doesNotMatch(out, /Server listening on http:\/\/localhost:" \+ port/)
  assert.match(out, /void port;/)
})

test('is idempotent — patching twice equals patching once', () => {
  const once = patchServerSource(GENERATED)
  const twice = patchServerSource(once)
  assert.equal(twice, once)
})

test('throws loudly when the serve() anchor is absent', () => {
  const noAnchor = 'const server = makeServer({ port });\n'
  assert.throws(() => patchServerSource(noAnchor), /codegen template changed|not found/)
})

test('throws when more than one serve() block is present', () => {
  assert.throws(() => patchServerSource(GENERATED + '\n' + GENERATED), /found 2/)
})

// --- Global-skills seam (§D5) ----------------------------------------------

test('seam injects a manifest-reading block before the packagedSkills snapshot', () => {
  const out = patchGlobalSkillsSeam(WITH_SNAPSHOT)
  // The sentinel marks the block.
  assert.match(out, /NAVI_GLOBAL_SKILLS_SEAM/)
  // It reads the manifest env var and registers into packagedSkills$1.
  assert.match(out, /NAVI_GLOBAL_SKILLS_MANIFEST/)
  assert.match(out, /packagedSkills\$1\.set\(/)
  // CRITICAL: the block must run BEFORE the snapshot is taken, or global skills
  // won't be in the harness config. Assert the seam precedes the snapshot line.
  const seamIdx = out.indexOf('NAVI_GLOBAL_SKILLS_SEAM')
  const snapIdx = out.indexOf('var packagedSkills = getPackagedSkills();')
  assert.ok(seamIdx !== -1 && snapIdx !== -1, 'both seam and snapshot must be present')
  assert.ok(seamIdx < snapIdx, 'seam must run before the packagedSkills snapshot')
})

test('seam is idempotent — patching twice equals patching once', () => {
  const once = patchGlobalSkillsSeam(WITH_SNAPSHOT)
  const twice = patchGlobalSkillsSeam(once)
  assert.equal(twice, once)
})

test('seam throws loudly when the snapshot anchor is absent', () => {
  const noSnap = 'var x = 1;\n'
  assert.throws(() => patchGlobalSkillsSeam(noSnap), /snapshot.*not found|codegen template changed/i)
})

test('seam throws when more than one snapshot line is present', () => {
  const two = WITH_SNAPSHOT + '\nvar packagedSkills = getPackagedSkills();\n'
  assert.throws(() => patchGlobalSkillsSeam(two), /more than one|found 2/i)
})

test('seam block reads node:fs + node:crypto via the generated __require', () => {
  const out = patchGlobalSkillsSeam(WITH_SNAPSHOT)
  // The generated server defines __require at the top; the seam must reach the
  // built-in modules through it (no bare import statements, which would break
  // the CJS module scope it's injected into).
  assert.match(out, /__require\(['"]node:fs['"]\)/)
  assert.match(out, /__require\(['"]node:crypto['"]\)/)
})

test('both patches compose (serve + seam on the same server body)', () => {
  // A realistic combined body: serve block + snapshot. Apply both patches and
  // confirm both sentinels land without interfering.
  const combined = GENERATED + '\n' + WITH_SNAPSHOT
  let out = patchServerSource(combined)
  out = patchGlobalSkillsSeam(out)
  assert.match(out, /FLUE_READY/)
  assert.match(out, /NAVI_GLOBAL_SKILLS_SEAM/)
  // Idempotent across both.
  const out2 = patchGlobalSkillsSeam(patchServerSource(out))
  assert.equal(out2, out)
})

// --- Live generated server (guards against a Flue codegen rename) ----------
//
// The fixture-based tests above use hand-written server bodies, so they can't
// detect a Flue upgrade that renames `packagedSkills$1` or drops the
// `getPackagedSkills()` snapshot line. The real build would then throw at
// patch time (fail-loud, good), but nothing TESTS that the real generated file
// still matches the anchors. `npm test` runs `build:flue` first (pretest), so
// dist/server.mjs is freshly generated here — assert the seam's load-bearing
// identifiers are still where the patch expects them.

test('the freshly-built dist/server.mjs still carries the seam anchors', (t) => {
  // `npm test` runs `build:flue` first (pretest), so dist/server.mjs should
  // exist. Skip cleanly when this file is run in isolation without the pretest.
  if (!existsSync(SERVER_PATH)) {
    t.skip('dist/server.mjs not built — run `npm run build:flue` first')
    return
  }
  const src = readFileSync(SERVER_PATH, 'utf8')
  // The Map the seam registers into (hard-coded `packagedSkills$1`).
  assert.match(
    src,
    /var packagedSkills\$1 = .*new Map\(\)/,
    'Flue codegen changed: the packagedSkills Map identifier the seam targets is gone or renamed',
  )
  // The snapshot line the seam injects immediately before.
  assert.ok(
    src.includes('var packagedSkills = getPackagedSkills();'),
    'Flue codegen changed: the packagedSkills snapshot line is gone or renamed',
  )
  // The seam itself must already be applied (patch ran during build:flue).
  assert.ok(
    src.includes('NAVI_GLOBAL_SKILLS_SEAM'),
    'the global-skills seam was not injected into the built server',
  )
  // And the serve() host/port patch too.
  assert.ok(src.includes('FLUE_READY'), 'the serve() loopback patch was not injected')
})

