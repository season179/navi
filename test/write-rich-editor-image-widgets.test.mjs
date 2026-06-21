import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveWriteRichEditorPreviewMode } from '../src/renderer/lib/writeMarkdownInlineCompletionPreview.ts'
import {
  imageWidgetSnapshotForMode,
  isWriteRichEditorImageWidgetMode,
} from '../src/renderer/lib/writeRichEditorImageWidgets.ts'

test('resolveWriteRichEditorPreviewMode routes image widget preview params', () => {
  assert.equal(resolveWriteRichEditorPreviewMode('imageError'), 'imageError')
  assert.equal(resolveWriteRichEditorPreviewMode('loadedImage'), 'loadedImage')
  assert.equal(resolveWriteRichEditorPreviewMode('infographic'), 'infographic')
  assert.equal(resolveWriteRichEditorPreviewMode('infographicStale'), 'infographicStale')
  assert.equal(resolveWriteRichEditorPreviewMode('infographicDesign'), 'infographicDesign')
  assert.equal(resolveWriteRichEditorPreviewMode('infographicPrototype'), 'infographicPrototype')
  assert.equal(resolveWriteRichEditorPreviewMode('htmlEmbed'), 'htmlEmbed')
  assert.equal(resolveWriteRichEditorPreviewMode('htmlEmbedLoaded'), 'htmlEmbedLoaded')
  assert.equal(resolveWriteRichEditorPreviewMode('inlineCompletion'), 'inlineCompletion')
  assert.equal(resolveWriteRichEditorPreviewMode(null), 'default')
})

test('isWriteRichEditorImageWidgetMode recognizes image widget modes', () => {
  assert.equal(isWriteRichEditorImageWidgetMode('imageError'), true)
  assert.equal(isWriteRichEditorImageWidgetMode('loadedImage'), true)
  assert.equal(isWriteRichEditorImageWidgetMode('infographicDesign'), true)
  assert.equal(isWriteRichEditorImageWidgetMode('htmlEmbedLoaded'), true)
  assert.equal(isWriteRichEditorImageWidgetMode('infographicStale'), true)
  assert.equal(isWriteRichEditorImageWidgetMode('requirementBadges'), false)
})

test('imageWidgetSnapshotForMode returns infographic pending chrome', () => {
  const snapshot = imageWidgetSnapshotForMode('infographic')
  assert.equal(snapshot.infographic?.pendingId, 'preview-infographic-id')
  assert.equal(snapshot.infographic?.state, 'active')
  assert.equal(snapshot.imageError, undefined)
})

test('imageWidgetSnapshotForMode returns design and prototype infographic kinds', () => {
  const design = imageWidgetSnapshotForMode('infographicDesign')
  assert.equal(design.infographic?.kind, 'design')
  const prototype = imageWidgetSnapshotForMode('infographicPrototype')
  assert.equal(prototype.infographic?.kind, 'prototype')
})

test('imageWidgetSnapshotForMode returns loaded image and html embed chrome', () => {
  const loaded = imageWidgetSnapshotForMode('loadedImage')
  assert.match(loaded.loadedImage?.src ?? '', /^data:image\/svg\+xml/)
  const embed = imageWidgetSnapshotForMode('htmlEmbedLoaded')
  assert.equal(embed.htmlEmbed?.visualState, 'loaded')
})

test('imageWidgetSnapshotForMode returns rich-editor image error chrome', () => {
  const snapshot = imageWidgetSnapshotForMode('imageError')
  assert.equal(snapshot.imageError?.alt, 'Hero screenshot')
  assert.match(snapshot.imageError?.title ?? '', /missing-hero/)
})
