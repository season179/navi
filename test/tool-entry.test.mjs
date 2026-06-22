import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.tool-entry-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'toolEntry.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  TOOL_ENTRY_KIND_FILE,
  TOOL_ENTRY_KIND_COMMAND,
  TOOL_ENTRY_KIND_TOOL,
  TOOL_ENTRY_STATUS_RUNNING,
  resolveToolEntryKindLabel,
  resolveToolEntrySessionStatusLabel,
} = await import(out)

test('tool entry chrome copy matches Kun locale strings', () => {
  assert.equal(TOOL_ENTRY_KIND_FILE, 'File change')
  assert.equal(TOOL_ENTRY_KIND_COMMAND, 'Command')
  assert.equal(TOOL_ENTRY_KIND_TOOL, 'Tool')
  assert.equal(TOOL_ENTRY_STATUS_RUNNING, 'running')
})

test('tool entry label helpers match Kun behavior', () => {
  assert.equal(resolveToolEntryKindLabel('file_change'), 'File change')
  assert.equal(resolveToolEntryKindLabel('command_execution'), 'Command')
  assert.equal(resolveToolEntryKindLabel('generic'), 'Tool')
  assert.equal(resolveToolEntrySessionStatusLabel('running'), 'running')
  assert.equal(resolveToolEntrySessionStatusLabel('done'), 'done')
  assert.equal(resolveToolEntrySessionStatusLabel(undefined), 'session')
  assert.equal(resolveToolEntrySessionStatusLabel(''), 'session')
})
