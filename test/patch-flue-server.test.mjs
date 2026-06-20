// Unit tests for the post-build server patch. This guards the single most
// fragile coupling in the integration: the regex anchor against Flue's
// generated serve() block. If a Flue upgrade reshapes that block, these tests
// (and the build step) must fail loudly rather than silently regress the
// 127.0.0.1 bind.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { patchServerSource } from '../scripts/patch-flue-server.mjs'

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
