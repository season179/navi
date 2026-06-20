// Unit test for the conversation store (src/main/conversations.ts) — the
// persistence contract the chat UI depends on: meta-only listing, recency
// sort, upsert without duplication, atomic writes, no lost writes under
// concurrent saves, and delete. The store is TS bundled into the main process,
// so we bundle it on the fly (CJS, electron external) into a temp dir under
// node_modules (where `require('electron')` resolves to its harmless path
// string) and point it at a temp file via NAVI_CONVERSATIONS_PATH — no Electron
// app object needed.

import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdtempSync, rmSync, existsSync } from 'node:fs'
import { buildSync } from 'esbuild'

const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const DEFAULT_PROJECT_ID = 'navi-default'
let tmp
let store
let storeFile

before(() => {
  // Inside node_modules so the bundle's `require('electron')` resolves upward.
  tmp = mkdtempSync(join(ROOT, 'node_modules', '.conv-test-'))
  storeFile = join(tmp, 'conversations.json')
  process.env.NAVI_CONVERSATIONS_PATH = storeFile

  const outfile = join(tmp, 'store.cjs')
  buildSync({
    entryPoints: [join(ROOT, 'src', 'main', 'conversations.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    external: ['electron'],
    outfile,
  })
  store = require(outfile)
})

after(() => {
  rmSync(tmp, { recursive: true, force: true })
  delete process.env.NAVI_CONVERSATIONS_PATH
})

test('starts empty when no store file exists', async () => {
  assert.deepEqual(await store.listConversations(), [])
})

test('lists meta only (no message bodies), most-recently-updated first', async () => {
  await store.saveConversation('A', DEFAULT_PROJECT_ID, 'First', [{ id: 'm1', role: 'user', text: 'hi', status: 'done' }])
  await store.saveConversation('B', DEFAULT_PROJECT_ID, 'Second', [{ id: 'm2', role: 'user', text: 'yo', status: 'done' }])
  const list = await store.listConversations()
  assert.equal(list.length, 2)
  assert.equal(list[0].id, 'B', 'most recently saved sorts first')
  assert.ok(!('messages' in list[0]), 'list omits message bodies')
})

test('updatedAt is strictly monotonic across saves (no same-millisecond ties)', async () => {
  // Recency ordering must be deterministic even when two saves land in the same
  // wall-clock millisecond, so each save must stamp a strictly larger updatedAt.
  const list = await store.listConversations()
  for (let i = 1; i < list.length; i++) {
    assert.ok(
      list[i - 1].updatedAt > list[i].updatedAt,
      `updatedAt must strictly decrease down the list (index ${i})`,
    )
  }
})

test('upsert replaces the thread and bumps recency without duplicating', async () => {
  await store.saveConversation('A', DEFAULT_PROJECT_ID, 'First', [
    { id: 'm1', role: 'user', text: 'hi', status: 'done' },
    { id: 'm3', role: 'assistant', text: 'hello!', status: 'done' },
  ])
  const list = await store.listConversations()
  assert.equal(list.length, 2, 'updating an existing id does not duplicate it')
  assert.equal(list[0].id, 'A', 'updated conversation becomes most recent')
  const a = await store.getConversation('A')
  assert.equal(a.length, 2)
  assert.equal(a[1].text, 'hello!', 'new assistant turn persisted')
})

test('writes atomically — no leftover temp file', () => {
  assert.ok(existsSync(storeFile), 'store file exists after writes')
  assert.ok(!existsSync(`${storeFile}.tmp`), 'temp file renamed away')
})

test('serializes concurrent saves without losing writes', async () => {
  await Promise.all([
    store.saveConversation('C', DEFAULT_PROJECT_ID, 'c', [{ id: 'c1', role: 'user', text: 'c', status: 'done' }]),
    store.saveConversation('D', DEFAULT_PROJECT_ID, 'd', [{ id: 'd1', role: 'user', text: 'd', status: 'done' }]),
    store.saveConversation('E', DEFAULT_PROJECT_ID, 'e', [{ id: 'e1', role: 'user', text: 'e', status: 'done' }]),
  ])
  assert.equal((await store.listConversations()).length, 5, 'all five conversations present')
})

test('delete removes the conversation and its thread', async () => {
  await store.deleteConversation('A')
  const list = await store.listConversations()
  assert.equal(list.length, 4)
  assert.deepEqual(await store.getConversation('A'), [], 'deleted thread reads empty')
})
