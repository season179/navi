import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const localeOut = join(ROOT, 'node_modules', '.tool-summary-locale-test.mjs')
const summaryOut = join(ROOT, 'node_modules', '.summarize-tool-block-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'toolSummaryLocale.ts')],
  outfile: localeOut,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'summarizeToolBlock.ts')],
  outfile: summaryOut,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  TOOL_SUMMARY_ACTION_FILE,
  TOOL_SUMMARY_ACTION_COMMAND,
  TOOL_SUMMARY_ACTION_TOOL,
  TOOL_SUMMARY_BUILTIN_READ,
  TOOL_SUMMARY_BUILTIN_WRITE,
  TOOL_SUMMARY_BUILTIN_EDIT,
  TOOL_SUMMARY_BUILTIN_GREP,
  TOOL_SUMMARY_BUILTIN_FIND,
  TOOL_SUMMARY_BUILTIN_LS,
  TOOL_SUMMARY_BUILTIN_BASH,
  resolveToolSummaryLabel,
  resolveToolSummaryActionLabel,
  resolveBuiltInToolSummaryLabel,
} = await import(localeOut)

const {
  defaultToolSummaryLabel,
  formatToolTitle,
  summarizeToolBlock,
  toolFilePath,
} = await import(summaryOut)

test('tool summary locale copy matches Kun locale strings', () => {
  assert.equal(TOOL_SUMMARY_ACTION_FILE, 'Edited file')
  assert.equal(TOOL_SUMMARY_ACTION_COMMAND, 'Ran command')
  assert.equal(TOOL_SUMMARY_ACTION_TOOL, 'Called tool')
  assert.equal(TOOL_SUMMARY_BUILTIN_READ, 'Read')
  assert.equal(TOOL_SUMMARY_BUILTIN_WRITE, 'Write')
  assert.equal(TOOL_SUMMARY_BUILTIN_EDIT, 'Edit')
  assert.equal(TOOL_SUMMARY_BUILTIN_GREP, 'Search')
  assert.equal(TOOL_SUMMARY_BUILTIN_FIND, 'Find')
  assert.equal(TOOL_SUMMARY_BUILTIN_LS, 'List')
  assert.equal(TOOL_SUMMARY_BUILTIN_BASH, 'Bash')
})

test('tool summary label helpers match Kun behavior', () => {
  assert.equal(resolveToolSummaryLabel('toolActionFile'), 'Edited file')
  assert.equal(resolveToolSummaryLabel('toolBuiltinGrep'), 'Search')
  assert.equal(resolveToolSummaryLabel('unknownKey'), 'unknownKey')
  assert.equal(resolveToolSummaryActionLabel('file_change'), 'Edited file')
  assert.equal(resolveToolSummaryActionLabel('command_execution'), 'Ran command')
  assert.equal(resolveToolSummaryActionLabel('generic'), 'Called tool')
  assert.equal(resolveBuiltInToolSummaryLabel('read_file'), 'Read')
  assert.equal(resolveBuiltInToolSummaryLabel('grep_files'), 'Search')
  assert.equal(resolveBuiltInToolSummaryLabel('shell'), 'Bash')
  assert.equal(resolveBuiltInToolSummaryLabel('custom_tool'), undefined)
})

test('summarizeToolBlock uses Kun-matching tool summary labels', () => {
  assert.equal(defaultToolSummaryLabel('toolActionFile'), 'Edited file')
  assert.equal(
    formatToolTitle({ summary: '', toolKind: 'file_change' }),
    'Edited file',
  )
  assert.equal(
    formatToolTitle({ summary: '', toolKind: 'command_execution' }),
    'Ran command',
  )
  assert.equal(
    formatToolTitle({ summary: '', toolKind: 'generic' }),
    'Called tool',
  )
  assert.equal(
    summarizeToolBlock({
      summary: 'read_file: path="src/a.ts"',
      toolKind: 'generic',
    }),
    'Read src/a.ts',
  )
  assert.equal(
    summarizeToolBlock({
      summary: 'grep_files: pattern="foo" path="src"',
      toolKind: 'generic',
    }),
    'Search foo · src',
  )
  assert.equal(
    summarizeToolBlock({
      summary: 'bash',
      toolKind: 'command_execution',
      meta: { command: 'npm test' },
    }),
    'Ran command npm test',
  )
  assert.equal(
    toolFilePath({
      summary: 'edit path="src/a.ts"',
    }),
    'src/a.ts',
  )
})
