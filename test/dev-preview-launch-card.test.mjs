import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.dev-preview-launch-card-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'devPreviewLaunchCard.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  DEV_PREVIEW_CARD_OPEN,
  DEV_PREVIEW_CARD_OPENED,
  DEV_PREVIEW_CARD_SUBTITLE,
  DEV_PREVIEW_CARD_TITLE,
  formatDevPreviewCardSubtitle,
  formatDevPreviewUrlLabel,
} = await import(out)

test('dev preview launch card chrome copy matches Kun locale strings', () => {
  assert.equal(DEV_PREVIEW_CARD_TITLE, 'Web preview')
  assert.equal(DEV_PREVIEW_CARD_SUBTITLE, 'Website')
  assert.equal(DEV_PREVIEW_CARD_OPENED, 'Preview opened on the right')
  assert.equal(DEV_PREVIEW_CARD_OPEN, 'Open preview')
})

test('formatDevPreviewCardSubtitle matches Kun subtitle template', () => {
  assert.equal(
    formatDevPreviewCardSubtitle('http://localhost:5173'),
    'Website · localhost:5173',
  )
  assert.equal(formatDevPreviewUrlLabel('not-a-url'), 'not-a-url')
})
