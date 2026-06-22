import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.media-preview-tile-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'mediaPreviewTile.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  MEDIA_PREVIEW_TILE_SAVING,
  MEDIA_PREVIEW_TILE_SAVED,
  MEDIA_PREVIEW_TILE_SAVE_FAILED,
  MEDIA_PREVIEW_TILE_DOWNLOAD,
  MEDIA_PREVIEW_TILE_PREVIEW_UNAVAILABLE,
  MEDIA_PREVIEW_TILE_OPEN_EDITOR,
  MEDIA_PREVIEW_TILE_IMAGE_OPEN_TEMPLATE,
  formatMediaPreviewTileImageOpen,
  resolveMediaPreviewTileSaveLabel,
} = await import(out)

test('media preview tile chrome copy matches Kun locale strings', () => {
  assert.equal(MEDIA_PREVIEW_TILE_SAVING, 'Saving…')
  assert.equal(MEDIA_PREVIEW_TILE_SAVED, 'Saved')
  assert.equal(MEDIA_PREVIEW_TILE_SAVE_FAILED, 'Save failed')
  assert.equal(MEDIA_PREVIEW_TILE_DOWNLOAD, 'Download')
  assert.equal(MEDIA_PREVIEW_TILE_PREVIEW_UNAVAILABLE, 'Preview unavailable')
  assert.equal(MEDIA_PREVIEW_TILE_OPEN_EDITOR, 'Open in editor')
  assert.equal(MEDIA_PREVIEW_TILE_IMAGE_OPEN_TEMPLATE, 'Open {{name}} preview')
})

test('media preview tile formatters match Kun behavior', () => {
  assert.equal(
    formatMediaPreviewTileImageOpen('landscape-preview.png'),
    'Open landscape-preview.png preview',
  )
  assert.equal(resolveMediaPreviewTileSaveLabel('idle'), 'Download')
  assert.equal(resolveMediaPreviewTileSaveLabel('saving'), 'Saving…')
  assert.equal(resolveMediaPreviewTileSaveLabel('saved'), 'Saved')
  assert.equal(resolveMediaPreviewTileSaveLabel('error'), 'Save failed')
})
