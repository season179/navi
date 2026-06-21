import assert from 'node:assert/strict'
import test from 'node:test'
import {
  resolveWriteMarkdownEditorPreviewMode,
  resolveWriteRichEditorPreviewMode,
} from '../src/renderer/lib/writeMarkdownInlineCompletionPreview.ts'

test('resolveWriteMarkdownEditorPreviewMode routes inline AI preview params', () => {
  assert.equal(resolveWriteMarkdownEditorPreviewMode('inlineCompletion'), 'inlineCompletion')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('inlineEdit'), 'inlineEdit')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('diffReview'), 'diffReview')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('infographic'), 'infographic')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('htmlEmbed'), 'htmlEmbed')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('imageError'), 'imageError')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('loadedImage'), 'loadedImage')
  assert.equal(resolveWriteMarkdownEditorPreviewMode(null), 'default')
})

test('resolveWriteRichEditorPreviewMode routes inline AI preview params', () => {
  assert.equal(resolveWriteRichEditorPreviewMode('inlineCompletion'), 'inlineCompletion')
  assert.equal(resolveWriteRichEditorPreviewMode('inlineEdit'), 'inlineEdit')
  assert.equal(resolveWriteRichEditorPreviewMode('requirementBadges'), 'requirementBadges')
  assert.equal(resolveWriteRichEditorPreviewMode(null), 'default')
})
