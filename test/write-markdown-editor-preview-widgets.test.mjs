import assert from 'node:assert/strict'
import test from 'node:test'
import {
  editorPreviewContentForImageWidgetMode,
  editorWidgetOverridesForImageWidgetMode,
  isWriteMarkdownEditorImageWidgetMode,
} from '../src/renderer/lib/writeMarkdownImageWidgets.ts'
import { resolveWriteMarkdownEditorPreviewMode } from '../src/renderer/lib/writeMarkdownInlineCompletionPreview.ts'

test('resolveWriteMarkdownEditorPreviewMode routes live image widget preview params', () => {
  assert.equal(resolveWriteMarkdownEditorPreviewMode('infographic'), 'infographic')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('infographicStale'), 'infographicStale')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('infographicDesign'), 'infographicDesign')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('infographicPrototype'), 'infographicPrototype')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('htmlEmbed'), 'htmlEmbed')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('htmlEmbedLoaded'), 'htmlEmbedLoaded')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('htmlEmbedError'), 'htmlEmbedError')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('htmlEmbedMissing'), 'htmlEmbedMissing')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('imageError'), 'imageError')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('loadedImage'), 'loadedImage')
  assert.equal(resolveWriteMarkdownEditorPreviewMode('inlineCompletion'), 'inlineCompletion')
  assert.equal(resolveWriteMarkdownEditorPreviewMode(null), 'default')
})

test('isWriteMarkdownEditorImageWidgetMode recognizes editor image widget modes', () => {
  assert.equal(isWriteMarkdownEditorImageWidgetMode('infographic'), true)
  assert.equal(isWriteMarkdownEditorImageWidgetMode('infographicStale'), true)
  assert.equal(isWriteMarkdownEditorImageWidgetMode('infographicDesign'), true)
  assert.equal(isWriteMarkdownEditorImageWidgetMode('infographicPrototype'), true)
  assert.equal(isWriteMarkdownEditorImageWidgetMode('htmlEmbed'), true)
  assert.equal(isWriteMarkdownEditorImageWidgetMode('htmlEmbedLoaded'), true)
  assert.equal(isWriteMarkdownEditorImageWidgetMode('htmlEmbedError'), true)
  assert.equal(isWriteMarkdownEditorImageWidgetMode('htmlEmbedMissing'), true)
  assert.equal(isWriteMarkdownEditorImageWidgetMode('imageError'), true)
  assert.equal(isWriteMarkdownEditorImageWidgetMode('loadedImage'), true)
  assert.equal(isWriteMarkdownEditorImageWidgetMode('inlineEdit'), false)
})

test('editorWidgetOverridesForImageWidgetMode returns infographic and html embed overrides', () => {
  assert.deepEqual(editorWidgetOverridesForImageWidgetMode('infographic'), {
    infographic: { kind: 'infographic', state: 'active' },
  })
  assert.deepEqual(editorWidgetOverridesForImageWidgetMode('infographicStale'), {
    infographic: { kind: 'infographic', state: 'stale' },
  })
  assert.deepEqual(editorWidgetOverridesForImageWidgetMode('infographicDesign'), {
    infographic: { kind: 'design', state: 'active' },
  })
  assert.deepEqual(editorWidgetOverridesForImageWidgetMode('infographicPrototype'), {
    infographic: { kind: 'prototype', state: 'active' },
  })
  assert.deepEqual(editorWidgetOverridesForImageWidgetMode('htmlEmbed'), {
    htmlEmbed: { visualState: 'cover' },
  })
  assert.deepEqual(editorWidgetOverridesForImageWidgetMode('htmlEmbedLoaded'), {
    htmlEmbed: { visualState: 'loaded' },
  })
  assert.deepEqual(editorWidgetOverridesForImageWidgetMode('htmlEmbedError'), {
    htmlEmbed: { visualState: 'error' },
  })
  assert.deepEqual(editorWidgetOverridesForImageWidgetMode('htmlEmbedMissing'), {
    htmlEmbed: { visualState: 'missing' },
  })
})

test('editorPreviewContentForImageWidgetMode returns markdown with image tokens', () => {
  const infographic = editorPreviewContentForImageWidgetMode('infographic')
  assert.match(infographic, /kun-pending-infographic:\/\//)

  const htmlEmbed = editorPreviewContentForImageWidgetMode('htmlEmbed')
  assert.match(htmlEmbed, /\.html\)/)

  const htmlEmbedLoaded = editorPreviewContentForImageWidgetMode('htmlEmbedLoaded')
  assert.match(htmlEmbedLoaded, /\.html\)/)

  const imageError = editorPreviewContentForImageWidgetMode('imageError')
  assert.match(imageError, /missing-hero\.png/)

  const loadedImage = editorPreviewContentForImageWidgetMode('loadedImage')
  assert.match(loadedImage, /data:image\/svg\+xml/)
})
