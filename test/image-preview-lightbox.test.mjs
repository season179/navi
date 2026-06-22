import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.image-preview-lightbox-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'imagePreviewLightbox.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  IMAGE_PREVIEW_LIGHTBOX_TITLE,
  IMAGE_PREVIEW_LIGHTBOX_CLOSE,
  IMAGE_PREVIEW_LIGHTBOX_DOWNLOAD,
  IMAGE_PREVIEW_LIGHTBOX_ZOOM_OUT,
  IMAGE_PREVIEW_LIGHTBOX_RESET_ZOOM,
  IMAGE_PREVIEW_LIGHTBOX_ZOOM_IN,
  resolveImagePreviewLightboxTitle,
  resolveImagePreviewLightboxDownloadLabel,
} = await import(out)

test('image preview lightbox chrome copy matches Kun locale strings', () => {
  assert.equal(IMAGE_PREVIEW_LIGHTBOX_TITLE, 'Image preview')
  assert.equal(IMAGE_PREVIEW_LIGHTBOX_CLOSE, 'Close image preview')
  assert.equal(IMAGE_PREVIEW_LIGHTBOX_DOWNLOAD, 'Download image')
  assert.equal(IMAGE_PREVIEW_LIGHTBOX_ZOOM_OUT, 'Zoom out')
  assert.equal(IMAGE_PREVIEW_LIGHTBOX_RESET_ZOOM, 'Reset zoom')
  assert.equal(IMAGE_PREVIEW_LIGHTBOX_ZOOM_IN, 'Zoom in')
})

test('image preview lightbox formatters match Kun behavior', () => {
  assert.equal(
    resolveImagePreviewLightboxTitle('landscape-preview.png', 'Preview image'),
    'landscape-preview.png',
  )
  assert.equal(
    resolveImagePreviewLightboxTitle(undefined, 'Preview image'),
    'Preview image',
  )
  assert.equal(
    resolveImagePreviewLightboxTitle(undefined, ''),
    'Image preview',
  )
  assert.equal(resolveImagePreviewLightboxDownloadLabel(undefined), 'Download image')
  assert.equal(resolveImagePreviewLightboxDownloadLabel('Saving…'), 'Saving…')
})
