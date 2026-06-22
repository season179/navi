import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.write-prompt-meta-disclosure-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'writePromptMetaDisclosure.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  WRITE_PROMPT_ACTIVE_FILE,
  WRITE_PROMPT_CONTEXT_LABEL,
  WRITE_PROMPT_CONTEXT_SHORT,
  WRITE_PROMPT_REFERENCE,
  WRITE_PROMPT_REFERENCE_LINES_TEMPLATE,
  WRITE_PROMPT_REFERENCE_PAGE_TEMPLATE,
  WRITE_PROMPT_REFERENCE_PAGES_TEMPLATE,
  WRITE_PROMPT_REFERENCES_COUNT_TEMPLATE,
  WRITE_PROMPT_RETRIEVAL_COUNT_TEMPLATE,
  WRITE_PROMPT_RETRIEVAL_LABEL,
  WRITE_PROMPT_RETRIEVAL_MATCHED_TEMPLATE,
  WRITE_PROMPT_WORKSPACE,
  buildWritePromptMetaSummary,
  formatWritePromptReferenceLines,
  formatWritePromptReferencePage,
  formatWritePromptReferencePages,
  formatWritePromptReferencesCount,
  formatWritePromptRetrievalCount,
  formatWritePromptRetrievalMatched,
  resolveWritePromptQuoteRangeLabel,
} = await import(out)

test('write prompt meta disclosure chrome copy matches Kun locale strings', () => {
  assert.equal(WRITE_PROMPT_CONTEXT_SHORT, 'Context')
  assert.equal(WRITE_PROMPT_CONTEXT_LABEL, 'Writing context')
  assert.equal(WRITE_PROMPT_REFERENCES_COUNT_TEMPLATE, '{{count}} ref')
  assert.equal(WRITE_PROMPT_REFERENCE, 'Text reference')
  assert.equal(WRITE_PROMPT_REFERENCE_LINES_TEMPLATE, 'lines {{start}}-{{end}}')
  assert.equal(WRITE_PROMPT_REFERENCE_PAGE_TEMPLATE, 'page {{page}}')
  assert.equal(WRITE_PROMPT_REFERENCE_PAGES_TEMPLATE, 'pages {{start}}-{{end}}')
  assert.equal(WRITE_PROMPT_RETRIEVAL_COUNT_TEMPLATE, '{{count}} retrieved')
  assert.equal(WRITE_PROMPT_RETRIEVAL_LABEL, 'Retrieved snippets')
  assert.equal(WRITE_PROMPT_RETRIEVAL_MATCHED_TEMPLATE, 'Matched: {{keywords}}')
  assert.equal(WRITE_PROMPT_ACTIVE_FILE, 'Current file')
  assert.equal(WRITE_PROMPT_WORKSPACE, 'Workspace')
})

test('write prompt meta disclosure formatters match Kun behavior', () => {
  assert.equal(formatWritePromptReferencesCount(2), '2 ref')
  assert.equal(formatWritePromptRetrievalCount(3), '3 retrieved')
  assert.equal(formatWritePromptReferenceLines(12, 28), 'lines 12-28')
  assert.equal(formatWritePromptReferencePage(4), 'page 4')
  assert.equal(formatWritePromptReferencePages(4, 5), 'pages 4-5')
  assert.equal(formatWritePromptRetrievalMatched('jwt, verify'), 'Matched: jwt, verify')
  assert.equal(
    resolveWritePromptQuoteRangeLabel({ lineStart: 8, lineEnd: 14 }),
    'lines 8-14',
  )
  assert.equal(resolveWritePromptQuoteRangeLabel({ pageStart: 4, pageEnd: 4 }), 'page 4')
  assert.equal(
    buildWritePromptMetaSummary({ quotesCount: 2, retrievalCount: 2, hasContext: true }),
    '2 ref · 2 retrieved · Context',
  )
})
