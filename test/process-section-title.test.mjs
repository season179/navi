import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const localeOut = join(ROOT, 'node_modules', '.process-section-title-locale-test.mjs')
const titlesOut = join(ROOT, 'node_modules', '.process-section-titles-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'processSectionTitleLocale.ts')],
  outfile: localeOut,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'components', 'chat', 'processSectionTitles.ts')],
  outfile: titlesOut,
  bundle: true,
  platform: 'node',
  format: 'esm',
  loader: { '.tsx': 'tsx' },
})

const {
  PROCESS_SECTION_THINKING_NOW,
  PROCESS_SECTION_THINKING_LABEL,
  PROCESS_SECTION_GROUP_EDITED_FILE,
  PROCESS_SECTION_GROUP_RAN_COMMAND,
  PROCESS_SECTION_GROUP_USED_TOOL,
  PROCESS_SECTION_GROUP_APPROVAL,
  formatProcessSectionThoughtFor,
  formatProcessSectionThoughtSteps,
  formatProcessSectionGroupEditedFiles,
  formatProcessSectionGroupRanCommands,
  formatProcessSectionGroupUsedTools,
  formatProcessSectionGroupApprovals,
  formatProcessSectionProcessSteps,
} = await import(localeOut)

const {
  formatProcessDuration,
  summarizeExecutionSection,
  resolveProcessSectionTitle,
} = await import(titlesOut)

test('process section title locale copy matches Kun locale strings', () => {
  assert.equal(PROCESS_SECTION_THINKING_NOW, 'Thinking…')
  assert.equal(PROCESS_SECTION_THINKING_LABEL, 'Thinking')
  assert.equal(PROCESS_SECTION_GROUP_EDITED_FILE, 'Edited 1 file')
  assert.equal(PROCESS_SECTION_GROUP_RAN_COMMAND, 'Ran 1 command')
  assert.equal(PROCESS_SECTION_GROUP_USED_TOOL, 'Used 1 tool')
  assert.equal(PROCESS_SECTION_GROUP_APPROVAL, '1 approval')
  assert.equal(formatProcessSectionThoughtFor('2.4s'), 'Thought for 2.4s')
  assert.equal(formatProcessSectionThoughtSteps(3), 'Thought (3 steps)')
  assert.equal(formatProcessSectionGroupEditedFiles(2), 'Edited 2 files')
  assert.equal(formatProcessSectionGroupRanCommands(4), 'Ran 4 commands')
  assert.equal(formatProcessSectionGroupUsedTools(5), 'Used 5 tools')
  assert.equal(formatProcessSectionGroupApprovals(2), '2 approvals')
  assert.equal(formatProcessSectionProcessSteps(6), 'Work process (6 steps)')
})

test('summarizeExecutionSection matches Kun grouped execution titles', () => {
  assert.equal(
    summarizeExecutionSection([
      { id: 'e1', summary: 'edit src/a.ts', detailKind: 'patch' },
    ]),
    'Edited 1 file',
  )
  assert.equal(
    summarizeExecutionSection([
      { id: 'e1', summary: 'edit src/a.ts', detailKind: 'patch' },
      { id: 'e2', summary: 'edit src/b.ts', detailKind: 'patch' },
      { id: 'e3', summary: 'run npm test', detailKind: 'command' },
    ]),
    'Edited 2 files · Ran 1 command',
  )
  assert.equal(
    summarizeExecutionSection([
      { id: 'e1', summary: 'grep pattern', detailKind: 'tool' },
      { id: 'e2', summary: 'Approve deploy', pendingApproval: true },
    ]),
    'Used 1 tool · 1 approval',
  )
  assert.equal(
    summarizeExecutionSection([
      { id: 'e1', summary: 'grep pattern', detailKind: 'tool' },
      { id: 'e2', summary: 'list files', detailKind: 'tool' },
    ]),
    'Used 2 tools',
  )
  assert.equal(summarizeExecutionSection([]), 'Work process (0 steps)')
})

test('resolveProcessSectionTitle matches Kun reasoning section titles', () => {
  assert.equal(
    resolveProcessSectionTitle(
      {
        id: 'r1',
        kind: 'reasoning',
        title: 'Thinking',
        processing: true,
        active: true,
      },
      { singleReasoningSection: true },
    ),
    'Thinking…',
  )
  assert.equal(
    resolveProcessSectionTitle(
      {
        id: 'r2',
        kind: 'reasoning',
        title: 'Thinking',
        reasoningStepCount: 2,
      },
      { singleReasoningSection: true },
    ),
    'Thought (2 steps)',
  )
  assert.equal(
    resolveProcessSectionTitle(
      {
        id: 'r3',
        kind: 'reasoning',
        title: 'Thinking',
      },
      { singleReasoningSection: true, reasoningDurationMs: 2400 },
    ),
    `Thought for ${formatProcessDuration(2400)}`,
  )
})
