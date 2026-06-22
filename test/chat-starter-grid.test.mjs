import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.chat-starter-grid-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'chatStarterGrid.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  CHAT_STARTER_BUG_PROMPT,
  CHAT_STARTER_BUG_SUB,
  CHAT_STARTER_BUG_TITLE,
  CHAT_STARTER_PLAN_PROMPT,
  CHAT_STARTER_PLAN_SUB,
  CHAT_STARTER_PLAN_TITLE,
  CHAT_STARTER_STRUCTURE_PROMPT,
  CHAT_STARTER_STRUCTURE_SUB,
  CHAT_STARTER_STRUCTURE_TITLE,
  CHAT_STARTER_SUGGESTIONS,
} = await import(out)

test('chat starter grid chrome copy matches Kun locale strings', () => {
  assert.equal(CHAT_STARTER_STRUCTURE_TITLE, "Explain this project's structure")
  assert.equal(CHAT_STARTER_STRUCTURE_SUB, 'Get a quick map of folders and key files')
  assert.equal(
    CHAT_STARTER_STRUCTURE_PROMPT,
    "Please explain this project's overall structure, key folders, and how the entry files relate to each other.",
  )
  assert.equal(CHAT_STARTER_BUG_TITLE, 'Help me find and fix a bug')
  assert.equal(CHAT_STARTER_BUG_SUB, 'Analyze the cause and suggest a fix')
  assert.equal(
    CHAT_STARTER_BUG_PROMPT,
    'I have a bug. Please help me locate the root cause and propose a fix.',
  )
  assert.equal(CHAT_STARTER_PLAN_TITLE, 'Generate an implementation plan')
  assert.equal(CHAT_STARTER_PLAN_SUB, 'Turn the request into a step-by-step plan')
  assert.equal(
    CHAT_STARTER_PLAN_PROMPT,
    'Please break the following requirement into an implementation plan, including files to change and steps.',
  )
})

test('CHAT_STARTER_SUGGESTIONS preserves Kun starter order and tone mapping', () => {
  assert.equal(CHAT_STARTER_SUGGESTIONS.length, 3)
  assert.deepEqual(
    CHAT_STARTER_SUGGESTIONS.map((starter) => starter.tone),
    ['blue', 'emerald', 'violet'],
  )
  assert.equal(CHAT_STARTER_SUGGESTIONS[0].title, CHAT_STARTER_STRUCTURE_TITLE)
  assert.equal(CHAT_STARTER_SUGGESTIONS[1].title, CHAT_STARTER_BUG_TITLE)
  assert.equal(CHAT_STARTER_SUGGESTIONS[2].title, CHAT_STARTER_PLAN_TITLE)
})
