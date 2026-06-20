#!/usr/bin/env node
// Post-build patch for the Flue-generated Node server (dist/server.mjs).
//
// Why this exists: `flue build --target node` emits a server whose serve()
// call passes no `hostname` (so it binds 0.0.0.0 — every interface) and logs
// the *requested* PORT rather than the real bound port (so it cannot report
// an OS-assigned ephemeral port). Neither is configurable via flue.config.ts
// or .flue/app.ts — the host/port live in the CLI's codegen template.
//
// patchServerSource() makes exactly two changes to the generated serve() call:
//   1. inject `hostname: process.env.FLUE_HOST || "127.0.0.1"` (loopback only)
//   2. add a listening callback that prints `FLUE_READY {host,port}` with the
//      real bound port, which the Electron main process parses to connect.
//
// It is anchored on stable strings and FAILS LOUDLY if they are not found, so
// a Flue upgrade that changes the codegen surfaces here immediately instead of
// silently regressing the binding. It is idempotent (re-running is a no-op).
//
// Pinned to @flue/cli's node target as of @flue/runtime@1.0.0-beta.2.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'

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

/**
 * Patch the generated server source. Pure and idempotent.
 * @param {string} src
 * @returns {string} patched source
 * @throws if the serve() anchor is missing or appears more than once.
 */
export function patchServerSource(src) {
  if (src.includes('FLUE_READY')) return src // already patched

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

  if (src.includes('FLUE_READY')) {
    console.log('[patch-flue-server] already patched — nothing to do.')
    return
  }

  let patched
  try {
    patched = patchServerSource(src)
  } catch (err) {
    console.error('[patch-flue-server] FAILED: ' + err.message)
    process.exit(1)
  }

  if (!STALE_LOG_RE.test(src) && !patched.includes('void port;')) {
    console.warn('[patch-flue-server] note: stale localhost log line not found (already changed upstream?).')
  }

  writeFileSync(serverPath, patched, 'utf8')
  console.log('[patch-flue-server] OK — bound to 127.0.0.1, real port reported via FLUE_READY.')
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
