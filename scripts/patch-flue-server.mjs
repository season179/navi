#!/usr/bin/env node
// Post-build patch for the Flue-generated Node server (dist/server.mjs).
//
// Two independent transformations, each pure + idempotent + fail-loud:
//
// 1. serve() host/port fixup.
//    `flue build --target node` emits a server whose serve() call passes no
//    `hostname` (so it binds 0.0.0.0 — every interface) and logs the *requested*
//    PORT rather than the real bound port (so it cannot report an OS-assigned
//    ephemeral port). Neither is configurable via flue.config.ts or
//    .flue/app.ts — the host/port live in the CLI's codegen template.
//    patchServerSource() injects `hostname: process.env.FLUE_HOST || "127.0.0.1"`
//    (loopback only) and a listening callback that prints `FLUE_READY {host,
//    port}` with the real bound port, which the Electron main process parses to
//    connect.
//
// 2. Global-skills packagedSkills seam (plan §D5).
//    User-global skills (userData/skills/) must load in EVERY conversation,
//    including no-project chat (which has no cwd for Flue to discover from).
//    The only runtime mechanism that crosses that boundary is Flue's
//    packagedSkills Map: the agent factory synthesizes SkillReferences per turn
//    (see .flue/agents/navi-assistant.ts), and the matching PackagedSkillDirectory
//    entries must be in this Map at boot. Flue's build only populates it from
//    `import ... with { type: 'skill' }` (build-time), so runtime-created global
//    skills need a hand-injected registration block.
//    patchGlobalSkillsSeam() injects a block that reads
//    process.env.NAVI_GLOBAL_SKILLS_MANIFEST (a 0600 JSON manifest the Electron
//    main writes: [{ name, description, files }]), packages each entry the same
//    way src/shared/global-skill-pkg.ts does, and registers it into the
//    packagedSkills Map BEFORE its snapshot is taken by getPackagedSkills().
//
// Both transformations FAIL LOUDLY if their anchors are missing, so a Flue
// upgrade that changes the codegen surfaces here immediately instead of
// silently regressing. They are idempotent (re-running is a no-op).
//
// Pinned to @flue/cli's node target as of @flue/runtime@1.0.0-beta.2.
//
// Recovery note (§D5 fallback): if a future Flue upgrade removes or renames the
// packagedSkills Map and this seam can't be re-anchored, the documented
// fallback is to materialize enabled global skills as symlinks into the active
// project's `<cwd>/.agents/skills/` (Flue's discoverLocalSkills follows
// symlinks — verified). That fallback CANNOT cover no-project chat (no cwd), so
// the seam remains preferable; it is noted only as a partial recovery path.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'

// --- Patch 1: serve() host/port --------------------------------------------
// Match the generated serve() options tail and call close:
//   serverOptions: { requestTimeout: 0 }
//   })            <- options-object close, then serve() call close, then ;
// Tolerant of whitespace and minifier reformatting; quote style irrelevant
// since we only anchor on the `serverOptions` property and the braces.
const SERVE_RE = /(serverOptions:\s*\{\s*requestTimeout:\s*0\s*\})(\s*\})(\s*\))(\s*;)/

// The now-misleading "listening on localhost:<requested port>" line; the real
// address is logged from the injected callback instead.
const STALE_LOG_RE =
  /console\.log\(\s*["']\[flue\] Server listening on http:\/\/localhost:["']\s*\+\s*port\s*\)\s*;/

/** Sentinel inserted by patchServerSource(); marks a server already serve()-patched. */
const SERVE_SENTINEL = 'FLUE_READY'
/** Sentinel inserted by patchGlobalSkillsSeam(); marks already seam-patched. */
const SEAM_SENTINEL = 'NAVI_GLOBAL_SKILLS_SEAM'

/**
 * Patch the generated serve() call. Pure and idempotent.
 * @param {string} src
 * @returns {string} patched source
 * @throws if the serve() anchor is missing or appears more than once.
 */
export function patchServerSource(src) {
  if (src.includes(SERVE_SENTINEL)) return src // already patched

  const matches = src.match(new RegExp(SERVE_RE, 'g'))
  if (!matches) {
    throw new Error(
      'serve() options block not found — the Flue codegen template changed. ' +
        'Re-inspect dist/server.mjs and update SERVE_RE in patch-flue-server.mjs.',
    )
  }
  if (matches.length > 1) {
    throw new Error(`expected exactly one serve() block, found ${matches.length}.`)
  }

  let out = src.replace(
    SERVE_RE,
    (_m, optsTail, optsClose, callClose, semi) =>
      `hostname: process.env.FLUE_HOST || "127.0.0.1", ${optsTail}${optsClose}, (info) => {` +
      ` console.log("[flue] FLUE_READY " + JSON.stringify({ host: info.address, port: info.port }));` +
      ` console.log("[flue] Server listening on http://" + info.address + ":" + info.port);` +
      ` }${callClose}${semi}`,
  )

  // Fail-soft: neutralize the stale localhost log if present.
  if (STALE_LOG_RE.test(out)) {
    out = out.replace(STALE_LOG_RE, 'void port; /* real listen address logged from serve() callback */')
  }
  return out
}

// --- Patch 2: global-skills packagedSkills seam ----------------------------
//
// The generated server has, in order:
//   var packagedSkills$1 = new Map();            // the Map (module scope)
//   function getPackagedSkills() { return Object.fromEntries(packagedSkills$1); }
//   ...build-time registerPackagedSkill({...}) calls (from skill imports)...
//   var packagedSkills = getPackagedSkills();     // snapshot taken here
//
// We inject a registration block IMMEDIATELY BEFORE the snapshot line so global
// skills are included in `packagedSkills` (the value the harness config holds).
// The snapshot line is emitted exactly once and is stable across minification
// (top-level var bound to a stable identifier), so we anchor on its literal text.
const SNAPSHOT_LINE = 'var packagedSkills = getPackagedSkills();'

// The block emitted into the server. `__require` is available in the generated
// server's module scope (the file defines it via createRequire at the top), so
// we reach node:fs / node:crypto through it without adding imports.
//
// Algorithmically IDENTICAL to src/shared/global-skill-pkg.ts (the id contract:
// the agent factory's SkillReference and this directory MUST share an id, and
// both derive it the same way). test/global-skills.test.mjs asserts the two
// agree on real inputs, so a drift here fails CI rather than silently breaking
// skill activation.
const SEAM_BLOCK = `/* ${SEAM_SENTINEL} — navi global-skills registration (plan §D5). */
;(() => {
  const manifestPath = process.env.NAVI_GLOBAL_SKILLS_MANIFEST;
  if (!manifestPath) return; /* no global skills configured this launch */
  let entries;
  try {
    entries = JSON.parse(__require('node:fs').readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    if (e && e.code !== 'ENOENT') console.error('[flue] global skills manifest read failed:', e.message || e);
    return;
  }
  if (!Array.isArray(entries)) return;
  const { createHash } = __require('node:crypto');
  const sha256Hex = (s) => createHash('sha256').update(s, 'utf8').digest('hex');
  for (const entry of entries) {
    if (!entry || typeof entry.name !== 'string') continue;
    const sorted = [...(entry.files || [])].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
    let input = entry.name;
    for (const f of sorted) input += '\\0' + f.path + '\\0' + f.kind + '\\0' + f.content;
    const id = 'skill:' + entry.name + ':' + sha256Hex(input).slice(0, 16);
    const files = {};
    for (const f of sorted) files[f.path] = { encoding: 'base64', kind: f.kind, content: f.content };
    packagedSkills$1.set(id, { id, name: entry.name, description: entry.description || '', files });
  }
})();
`;

/**
 * Inject the global-skills packagedSkills registration block. Pure + idempotent.
 *
 * The injected block reads NAVI_GLOBAL_SKILLS_MANIFEST (JSON array, or absent →
 * no-op), computes the same `id` the agent factory's reference uses
 * (skill:<name>:<16hex>), and registers the PackagedSkillDirectory into
 * packagedSkills$1 BEFORE the `getPackagedSkills()` snapshot is taken, so the
 * snapshot includes global skills. The manifest is read at boot, so
 * enable/disable takes effect on the next backend restart (same lifecycle as
 * provider keys).
 *
 * @param {string} src
 * @returns {string} patched source
 * @throws if the snapshot anchor is missing or appears more than once.
 */
export function patchGlobalSkillsSeam(src) {
  if (src.includes(SEAM_SENTINEL)) return src // already patched

  const idx = src.indexOf(SNAPSHOT_LINE)
  if (idx === -1) {
    throw new Error(
      'packagedSkills snapshot line not found — the Flue codegen template changed. ' +
        'Re-inspect dist/server.mjs and update SNAPSHOT_LINE in patch-flue-server.mjs.',
    )
  }
  if (src.indexOf(SNAPSHOT_LINE, idx + 1) !== -1) {
    throw new Error('expected exactly one packagedSkills snapshot, found more than one.')
  }
  return src.slice(0, idx) + SEAM_BLOCK + src.slice(idx)
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url))
  const serverPath = resolve(here, '..', 'dist', 'server.mjs')

  let src
  try {
    src = readFileSync(serverPath, 'utf8')
  } catch (err) {
    console.error(`[patch-flue-server] cannot read ${serverPath} — run \`flue build --target node\` first.`)
    console.error(err.message)
    process.exit(1)
  }

  let out = src
  const serveNeeded = !out.includes(SERVE_SENTINEL)
  const seamNeeded = !out.includes(SEAM_SENTINEL)

  try {
    if (serveNeeded) out = patchServerSource(out)
    if (seamNeeded) out = patchGlobalSkillsSeam(out)
  } catch (err) {
    console.error('[patch-flue-server] FAILED: ' + err.message)
    process.exit(1)
  }

  if (serveNeeded && !STALE_LOG_RE.test(src) && !out.includes('void port;')) {
    console.warn('[patch-flue-server] note: stale localhost log line not found (already changed upstream?).')
  }

  if (out !== src) {
    writeFileSync(serverPath, out, 'utf8')
    const done = []
    if (serveNeeded) done.push('serve() bound to 127.0.0.1, real port via FLUE_READY')
    if (seamNeeded) done.push('global-skills packagedSkills seam injected')
    console.log(`[patch-flue-server] OK — ${done.join('; ')}.`)
  } else {
    console.log('[patch-flue-server] already patched — nothing to do.')
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
