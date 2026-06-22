import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.generated-files-panel-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'generatedFilesPanel.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const { GENERATED_FILES_PANEL_TITLE } = await import(out)

test('generated files panel chrome copy matches Kun locale strings', () => {
  assert.equal(GENERATED_FILES_PANEL_TITLE, 'Generated files')
})
