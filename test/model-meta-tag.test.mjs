import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.model-meta-tag-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'modelMetaTag.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const { MODEL_META_TAG_TITLE_TEMPLATE, formatModelMetaTagTitle } = await import(out)

test('model meta tag chrome copy matches Kun locale strings', () => {
  assert.equal(MODEL_META_TAG_TITLE_TEMPLATE, 'Model for this turn: {{model}}')
})

test('model meta tag title formatter matches Kun behavior', () => {
  assert.equal(
    formatModelMetaTagTitle('claude-sonnet-4-20250514'),
    'Model for this turn: claude-sonnet-4-20250514',
  )
})
