import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.runtime-meta-chips-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'runtimeMetaChips.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  RUNTIME_META_ATTACHMENTS,
  RUNTIME_META_ACTIVE_SKILLS,
  RUNTIME_META_INJECTED_MEMORIES,
  RUNTIME_META_CHILD_AGENT,
  RUNTIME_META_SOURCES,
  formatRuntimeMetaAttachmentsLabel,
  formatRuntimeMetaActiveSkillsLabel,
  formatRuntimeMetaInjectedMemoriesLabel,
  formatRuntimeMetaSourcesLabel,
} = await import(out)

test('runtime meta chips chrome copy matches Kun locale strings', () => {
  assert.equal(RUNTIME_META_ATTACHMENTS, 'Attachments')
  assert.equal(RUNTIME_META_ACTIVE_SKILLS, 'Skills')
  assert.equal(RUNTIME_META_INJECTED_MEMORIES, 'Memories')
  assert.equal(RUNTIME_META_CHILD_AGENT, 'Child agent')
  assert.equal(RUNTIME_META_SOURCES, 'Sources')
})

test('runtime meta chips label formatters match Kun behavior', () => {
  assert.equal(formatRuntimeMetaAttachmentsLabel(3), 'Attachments 3')
  assert.equal(formatRuntimeMetaActiveSkillsLabel(2), 'Skills 2')
  assert.equal(formatRuntimeMetaInjectedMemoriesLabel(1), 'Memories 1')
  assert.equal(formatRuntimeMetaSourcesLabel(0), 'Sources 1')
  assert.equal(formatRuntimeMetaSourcesLabel(2), 'Sources 3')
})
