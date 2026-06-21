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
  buildComposerFileMentionMenuItem,
  COMPOSER_FILE_REFERENCES_PREVIEW,
  COMPOSER_FILE_MENTION_MENU_TITLE,
  COMPOSER_FILE_MENTION_LOADING,
  COMPOSER_FILE_MENTION_EMPTY,
  COMPOSER_REMOVE_FILE_REFERENCE_LABEL,
  resolveComposerFileMentionPreview,
} = await import(out)

test('file mention menu copy matches Kun composerFileMention locale strings', () => {
  assert.equal(COMPOSER_FILE_MENTION_MENU_TITLE, 'Files & folders')
  assert.equal(COMPOSER_FILE_MENTION_LOADING, 'Loading files…')
  assert.equal(COMPOSER_FILE_MENTION_EMPTY, 'No files or folders found.')
})

test('COMPOSER_REMOVE_FILE_REFERENCE_LABEL matches Kun composerRemoveFileReference locale string', () => {
  assert.equal(COMPOSER_REMOVE_FILE_REFERENCE_LABEL, 'Remove reference')
})

test('resolveComposerFileMentionPreview routes preview query values', () => {
  const loading = resolveComposerFileMentionPreview('loading')
  assert.equal(loading.loading, true)
  assert.equal(loading.candidates.length, 0)
  assert.match(loading.draft, /@src\/ren$/)

  const empty = resolveComposerFileMentionPreview('empty')
  assert.equal(empty.loading, false)
  assert.ok(empty.candidates.length > 0)
  assert.match(empty.draft, /@zzz-no-match$/)

  const defaults = resolveComposerFileMentionPreview('1')
  assert.equal(defaults.loading, false)
  assert.ok(defaults.candidates.length > 0)
  assert.match(defaults.draft, /@src\/ren$/)
})

test('buildComposerFileMentionMenuItem matches Kun file-mention menu row shape', () => {
  assert.deepEqual(
    buildComposerFileMentionMenuItem(
      {
        relativePath: 'src/renderer/routes',
        name: 'routes',
        type: 'directory',
      },
      true,
    ),
    {
      relativePath: 'src/renderer/routes',
      name: 'routes',
      isDirectory: true,
      active: true,
    },
  )
})

test('COMPOSER_FILE_REFERENCES_PREVIEW matches Kun file-reference chip mock data', () => {
  assert.equal(COMPOSER_FILE_REFERENCES_PREVIEW.length, 2)
  assert.match(COMPOSER_FILE_REFERENCES_PREVIEW[0].relativePath, /Composer\.tsx$/)
  assert.equal(COMPOSER_FILE_REFERENCES_PREVIEW[1].isDirectory, true)
})

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
