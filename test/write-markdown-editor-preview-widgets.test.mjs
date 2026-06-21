import assert from 'node:assert/strict'
import test from 'node:test'
import {
  editorPreviewContentForImageWidgetMode,
  isWriteMarkdownEditorImageWidgetMode,
} from '../src/renderer/lib/writeMarkdownImageWidgets.ts'
import { resolveWriteMarkdownEditorPreviewMode } from '../src/renderer/lib/writeMarkdownInlineCompletionPreview.ts'

test('resolveWriteMarkdownEditorPreviewMode routes live image widget preview params', () => {
  assert.equal(resolveWriteMarkdownEditorPreviewMode('infographic'), 'infographic')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('htmlEmbed'), 'htmlEmbed')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('imageError'), 'imageError')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('loadedImage'), 'loadedImage')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('inlineCompletion'), 'inlineCompletion')
  assert.equal(resolveWriteMarkdownEditorPreviewMode(null), 'default')
})

test('isWriteMarkdownEditorImageWidgetMode recognizes editor image widget modes', () => {
  assert.equal(isWriteMarkdownEditorImageWidgetMode('infographic'), true)
  assert.equal(isWriteMarkdownEditorImageWidgetMode('htmlEmbed'), true)
  assert.equal(isWriteMarkdownEditorImageWidgetMode('imageError'), true)
  assert.equal(isWriteMarkdownEditorImageWidgetMode('loadedImage'), true)
  assert.equal(isWriteMarkdownEditorImageWidgetMode('inlineEdit'), false)
})

test('editorPreviewContentForImageWidgetMode returns markdown with image tokens', () => {
  const infographic = editorPreviewContentForImageWidgetMode('infographic')
  assert.match(infographic, /kun-pending-infographic:\/\//)

  const htmlEmbed = editorPreviewContentForImageWidgetMode('htmlEmbed')
  assert.match(htmlEmbed, /\.html\)/)

  const imageError = editorPreviewContentForImageWidgetMode('imageError')
  assert.match(imageError, /missing-hero\.png/)

  const loadedImage = editorPreviewContentForImageWidgetMode('loadedImage')
  assert.match(loadedImage, /data:image\/svg\+xml/)
})
