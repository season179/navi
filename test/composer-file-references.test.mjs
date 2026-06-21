import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-file-references-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerFileReferences.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  formatComposerFileMentionToken,
  getFileMentionAtCursor,
  filterWorkspaceFileMentionSuggestions,
  replaceFileMentionInInput,
} = await import(out)

test('getFileMentionAtCursor parses @ file mention queries at the cursor', () => {
  assert.deepEqual(
    getFileMentionAtCursor('please inspect @src/ren', 'please inspect @src/ren'.length),
    { start: 15, end: 23, query: 'src/ren', quoted: false },
  )
  assert.deepEqual(
    getFileMentionAtCursor('compare @"docs/product plan', 'compare @"docs/product plan'.length),
    { start: 8, end: 27, query: 'docs/product plan', quoted: true },
  )
  assert.equal(
    getFileMentionAtCursor('email test@example.com', 'email test@example.com'.length),
    null,
  )
})

test('filterWorkspaceFileMentionSuggestions ranks and filters file references', () => {
  const files = [
    { path: '/repo/src/App.tsx', relativePath: 'src/App.tsx', name: 'App.tsx' },
    { path: '/repo/package.json', relativePath: 'package.json', name: 'package.json' },
    {
      path: '/repo/docs/product plan.md',
      relativePath: 'docs/product plan.md',
      name: 'product plan.md',
    },
  ]

  assert.equal(formatComposerFileMentionToken('docs/product plan.md'), '@"docs/product plan.md"')
  assert.deepEqual(filterWorkspaceFileMentionSuggestions(files, 'pack'), [files[1]])

  const mention = getFileMentionAtCursor('open @doc', 'open @doc'.length)
  assert.ok(mention)
  const replaced = replaceFileMentionInInput('open @doc', mention, files[2])
  assert.equal(replaced.input, 'open @"docs/product plan.md" ')
})
