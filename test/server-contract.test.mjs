// Integration test for the keystone of the integration: the spawned Flue
// server contract. Spawns the real built (and patched) dist/server.mjs exactly
// as src/main/flue-backend.ts does — under Electron's Node via
// ELECTRON_RUN_AS_NODE=1 — and asserts the properties the main process relies
// on. Uses /openapi.json (no model call), so it needs no API key and is
// provider-agnostic: it survives the planned Anthropic→OpenAI provider switch.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'

const require = createRequire(import.meta.url)
const ELECTRON = require('electron') // path to the Electron binary under plain node
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SERVER = join(ROOT, 'dist', 'server.mjs')

function waitForReady(child, getStdout, timeoutMs = 20_000) {
  return new Promise((resolve, reject) => {
    const started = Date.now()
    const timer = setInterval(() => {
      const m = getStdout().match(/FLUE_READY (\{.*\})/)
      if (m) {
        clearInterval(timer)
        resolve(JSON.parse(m[1]))
      } else if (child.exitCode !== null) {
        clearInterval(timer)
        reject(new Error('child exited before ready, code ' + child.exitCode))
      } else if (Date.now() - started > timeoutMs) {
        clearInterval(timer)
        reject(new Error('timeout waiting for FLUE_READY'))
      }
    }, 50)
  })
}

test('spawned Flue server honors the main-process contract', async (t) => {
  assert.ok(existsSync(SERVER), 'dist/server.mjs must be built (run `npm run build:flue`)')

  const tmp = mkdtempSync(join(tmpdir(), 'flue-contract-'))
  const dbPath = join(tmp, 'flue.db')
  const token = 'contract-token-0123456789abcdef'

  let stdout = ''
  const child = spawn(ELECTRON, ['--no-warnings', SERVER], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      PORT: '0',
      FLUE_TOKEN: token,
      FLUE_DB_PATH: dbPath,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  child.stdout.on('data', (d) => (stdout += d.toString()))

  try {
    const ready = await waitForReady(child, () => stdout)

    await t.test('reports a real ephemeral port on loopback', () => {
      assert.equal(ready.host, '127.0.0.1', 'must bind loopback, not 0.0.0.0')
      assert.ok(Number.isInteger(ready.port) && ready.port > 0, `real port, got ${ready.port}`)
    })

    const base = `http://127.0.0.1:${ready.port}`

    await t.test('rejects requests with no bearer token (401)', async () => {
      const res = await fetch(`${base}/openapi.json`)
      assert.equal(res.status, 401)
    })

    await t.test('rejects requests with a wrong token (401)', async () => {
      const res = await fetch(`${base}/openapi.json`, { headers: { authorization: 'Bearer nope' } })
      assert.equal(res.status, 401)
    })

    await t.test('accepts requests with the correct token (200)', async () => {
      const res = await fetch(`${base}/openapi.json`, { headers: { authorization: `Bearer ${token}` } })
      assert.equal(res.status, 200)
    })

    await t.test('creates the file-backed sqlite database', () => {
      assert.ok(existsSync(dbPath), `expected db at ${dbPath}`)
    })

    await t.test('exits cleanly on SIGTERM within 2s', async () => {
      const exited = new Promise((resolve) => child.once('exit', (code, signal) => resolve({ code, signal })))
      child.kill('SIGTERM')
      const winner = await Promise.race([
        exited,
        new Promise((resolve) => setTimeout(() => resolve('timeout'), 2500)),
      ])
      assert.notEqual(winner, 'timeout', 'server did not shut down within 2.5s of SIGTERM')
    })
  } finally {
    if (child.exitCode === null) child.kill('SIGKILL')
    rmSync(tmp, { recursive: true, force: true })
  }
})
