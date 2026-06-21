import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-context-capacity-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerContextCapacity.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const { resolveComposerContextCapacityPreview } = await import(out)

test('resolveComposerContextCapacityPreview opens popover for default preview hooks', () => {
  assert.equal(resolveComposerContextCapacityPreview(null), true)
  assert.equal(resolveComposerContextCapacityPreview(''), true)
  assert.equal(resolveComposerContextCapacityPreview('1'), true)
  assert.equal(resolveComposerContextCapacityPreview('open'), true)
})

test('resolveComposerContextCapacityPreview rejects unknown preview modes', () => {
  assert.equal(resolveComposerContextCapacityPreview('closed'), false)
})
