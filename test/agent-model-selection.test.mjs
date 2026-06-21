// Verifies plan §3.4 / F-firstturn: the agent resolves model + reasoning from
// the conversation's app-owned store pointer (set by setActiveModel/setReasoning),
// falling back to the injected NAVI_DEFAULT_* env, then to 'medium'. This is the
// load-bearing seam forced by navi's HTTP transport — selection rides the store,
// not the send call.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { bundleAgent } from './_helpers/bundle-agent.mjs'

const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const outfile = await bundleAgent(ROOT, 'agent-model-selection-test')
const agent = require(outfile).default

function withStore(conversations, fn) {
  const tmp = mkdtempSync(join(tmpdir(), 'navi-model-sel-'))
  const storeFile = join(tmp, 'store.json')
  writeFileSync(storeFile, JSON.stringify({ projects: [], conversations }))
  try {
    return fn(storeFile)
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

test('conversation pointer resolves model specifier + reasoning', async () => {
  await withStore(
    [{ id: 'c1', projectId: 'navi-default', title: 't', createdAt: 1, updatedAt: 1, messages: [], providerId: 'zai', modelId: 'glm-5.2', reasoning: 'high' }],
    async (storeFile) => {
      const config = await agent.initialize({
        id: 'c1',
        env: { NAVI_CONVERSATIONS_PATH: storeFile, NAVI_DEFAULT_MODEL: 'openai/gpt-5.4-nano-2026-03-17' },
      })
      assert.equal(config.model, 'zai/glm-5.2', 'pointer wins over the env default')
      assert.equal(config.thinkingLevel, 'high')
    },
  )
})

test('no pointer falls back to NAVI_DEFAULT_MODEL + NAVI_DEFAULT_REASONING', async () => {
  await withStore(
    [{ id: 'c2', projectId: 'navi-default', title: 't', createdAt: 1, updatedAt: 1, messages: [] }],
    async (storeFile) => {
      const config = await agent.initialize({
        id: 'c2',
        env: {
          NAVI_CONVERSATIONS_PATH: storeFile,
          NAVI_DEFAULT_MODEL: 'deepseek/deepseek-v4-pro',
          NAVI_DEFAULT_REASONING: 'low',
        },
      })
      assert.equal(config.model, 'deepseek/deepseek-v4-pro')
      assert.equal(config.thinkingLevel, 'low')
    },
  )
})

test('reasoning defaults to medium when neither pointer nor env supplies it', async () => {
  await withStore(
    [{ id: 'c3', projectId: 'navi-default', title: 't', createdAt: 1, updatedAt: 1, messages: [] }],
    async (storeFile) => {
      const config = await agent.initialize({
        id: 'c3',
        env: { NAVI_CONVERSATIONS_PATH: storeFile, NAVI_DEFAULT_MODEL: 'deepseek/deepseek-v4-pro' },
      })
      assert.equal(config.thinkingLevel, 'medium')
    },
  )
})

test('an invalid stored reasoning value is ignored (falls back to medium)', async () => {
  await withStore(
    [{ id: 'c4', projectId: 'navi-default', title: 't', createdAt: 1, updatedAt: 1, messages: [], providerId: 'zai', modelId: 'glm-5.2', reasoning: 'bogus' }],
    async (storeFile) => {
      const config = await agent.initialize({ id: 'c4', env: { NAVI_CONVERSATIONS_PATH: storeFile } })
      assert.equal(config.model, 'zai/glm-5.2')
      assert.equal(config.thinkingLevel, 'medium', 'unknown level is rejected, not passed through')
    },
  )
})
