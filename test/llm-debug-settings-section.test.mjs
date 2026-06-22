import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.llm-debug-settings-section-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'llmDebugSettingsSection.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const mod = await import(out)

test('llm debug settings section shell copy matches Kun locale strings', () => {
  assert.equal(mod.LLM_DEBUG_SETTINGS_TITLE, 'LLM request troubleshooting')
  assert.equal(
    mod.LLM_DEBUG_SETTINGS_DESC,
    'Inspect the last 25 raw request bodies sent to the model (system prompt, messages, tools) and their raw output. Kept in memory only and cleared on restart.',
  )
  assert.equal(mod.LLM_DEBUG_SETTINGS_EMPTY, 'No records yet. Send a message, then click Refresh.')
  assert.equal(mod.LLM_DEBUG_SETTINGS_REFRESH_LABEL, 'Refresh')
})

test('llm debug settings section round detail copy matches Kun locale strings', () => {
  assert.equal(mod.LLM_DEBUG_SETTINGS_REQUEST, 'Request (HTTP body sent to the model)')
  assert.equal(mod.LLM_DEBUG_SETTINGS_OUTPUT, 'Output')
  assert.equal(mod.LLM_DEBUG_SETTINGS_REASONING, 'Reasoning')
  assert.equal(mod.LLM_DEBUG_SETTINGS_TOOL_CALLS, 'Tool calls')
  assert.equal(mod.LLM_DEBUG_SETTINGS_USAGE, 'Usage')
})

test('llm debug settings section exports expected constant count', () => {
  const constants = Object.keys(mod).filter((key) => key.startsWith('LLM_DEBUG_SETTINGS_'))
  assert.equal(constants.length, 9)
})
