import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-attachments-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerAttachments.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  COMPOSER_ATTACHMENTS_PREVIEW,
  COMPOSER_ATTACHMENT_UNAVAILABLE_PREVIEW,
  COMPOSER_ATTACHMENT_MODEL_UNSUPPORTED_PREVIEW,
  resolveComposerAttachmentErrorPreview,
} = await import(out)

test('COMPOSER_ATTACHMENTS_PREVIEW matches Kun image-attachment mock data', () => {
  assert.equal(COMPOSER_ATTACHMENTS_PREVIEW.length, 2)
  assert.equal(COMPOSER_ATTACHMENTS_PREVIEW[0].name, 'mock-screenshot.png')
  assert.equal(COMPOSER_ATTACHMENTS_PREVIEW[1].name, 'wireframe.png')
  assert.match(COMPOSER_ATTACHMENTS_PREVIEW[0].previewUrl, /^data:image\/svg\+xml,/)
})

test('attachment error preview copy matches Kun composerAttachment locale strings', () => {
  assert.equal(COMPOSER_ATTACHMENT_UNAVAILABLE_PREVIEW, 'Attachment upload is unavailable.')
  assert.equal(
    COMPOSER_ATTACHMENT_MODEL_UNSUPPORTED_PREVIEW,
    'The selected model cannot read images. Switch to a vision model or remove the attachment.',
  )
})

test('resolveComposerAttachmentErrorPreview routes preview query values', () => {
  assert.equal(
    resolveComposerAttachmentErrorPreview('1'),
    COMPOSER_ATTACHMENT_UNAVAILABLE_PREVIEW,
  )
  assert.equal(
    resolveComposerAttachmentErrorPreview('unsupported'),
    COMPOSER_ATTACHMENT_MODEL_UNSUPPORTED_PREVIEW,
  )
  assert.equal(resolveComposerAttachmentErrorPreview(null), undefined)
})
