import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveWriteRichEditorPreviewMode } from '../src/renderer/lib/writeMarkdownInlineCompletionPreview.ts'
import {
  imageWidgetSnapshotForMode,
  isWriteRichEditorImageWidgetMode,
} from '../src/renderer/lib/writeRichEditorImageWidgets.ts'

test('resolveWriteRichEditorPreviewMode routes image widget preview params', () => {
  assert.equal(resolveWriteRichEditorPreviewMode('imageError'), 'imageError')
  assert.equal(resolveWriteRichEditorPreviewMode('infographic'), 'infographic')
  assert.equal(resolveWriteRichEditorPreviewMode('infographicStale'), 'infographicStale')
  assert.equal(resolveWriteRichEditorPreviewMode('htmlEmbed'), 'htmlEmbed')
  assert.equal(resolveWriteRichEditorPreviewMode('inlineCompletion'), 'inlineCompletion')
  assert.equal(resolveWriteRichEditorPreviewMode(null), 'default')
})

test('isWriteRichEditorImageWidgetMode recognizes image widget modes', () => {
  assert.equal(isWriteRichEditorImageWidgetMode('imageError'), true)
  assert.equal(isWriteRichEditorImageWidgetMode('infographicStale'), true)
  assert.equal(isWriteRichEditorImageWidgetMode('requirementBadges'), false)
})

test('imageWidgetSnapshotForMode returns infographic pending chrome', () => {
  const snapshot = imageWidgetSnapshotForMode('infographic')
  assert.equal(snapshot.infographic?.pendingId, 'preview-infographic-id')
  assert.equal(snapshot.infographic?.state, 'active')
  assert.equal(snapshot.imageError, undefined)
})

test('imageWidgetSnapshotForMode returns rich-editor image error chrome', () => {
  const snapshot = imageWidgetSnapshotForMode('imageError')
  assert.equal(snapshot.imageError?.alt, 'Hero screenshot')
  assert.match(snapshot.imageError?.title ?? '', /missing-hero/)
})
