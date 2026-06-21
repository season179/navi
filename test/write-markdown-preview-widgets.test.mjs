import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isHtmlEmbedSrc,
  parsePendingInfographicId,
  previewContentForMode,
  resolveWriteMarkdownPreviewMode,
  widgetOverridesForPreviewMode,
} from '../src/renderer/lib/writeMarkdownImageWidgets.ts'

test('parsePendingInfographicId recognizes kun pending tokens', () => {
  assert.equal(
    parsePendingInfographicId('kun-pending-infographic://abc-123'),
    'abc-123',
  )
  assert.equal(parsePendingInfographicId('img/photo.png'), null)
})

test('isHtmlEmbedSrc matches local html paths only', () => {
  assert.equal(isHtmlEmbedSrc('../../proto/page.html'), true)
  assert.equal(isHtmlEmbedSrc('proto/page.htm'), true)
  assert.equal(isHtmlEmbedSrc('img/photo.png'), false)
  assert.equal(isHtmlEmbedSrc('kun-pending-infographic://abc'), false)
  assert.equal(isHtmlEmbedSrc('https://example.com/page.html'), false)
})

test('resolveWriteMarkdownPreviewMode maps widget preview params', () => {
  assert.equal(resolveWriteMarkdownPreviewMode(new URLSearchParams()), null)
  assert.equal(
    resolveWriteMarkdownPreviewMode(new URLSearchParams('writeMarkdownPreview=infographicDesign')),
    'infographicDesign',
  )
  assert.equal(
    resolveWriteMarkdownPreviewMode(new URLSearchParams('writeMarkdownPreview=htmlEmbedLoaded')),
    'htmlEmbedLoaded',
  )
  assert.equal(
    resolveWriteMarkdownPreviewMode(new URLSearchParams('writeMarkdownPreview=htmlEmbedError')),
    'htmlEmbedError',
  )
  assert.equal(
    resolveWriteMarkdownPreviewMode(new URLSearchParams('writeMarkdownPreview=htmlEmbedMissing')),
    'htmlEmbedMissing',
  )
  assert.equal(
    resolveWriteMarkdownPreviewMode(new URLSearchParams('writeMarkdownPreview=imageError')),
    'imageError',
  )
  assert.equal(
    resolveWriteMarkdownPreviewMode(new URLSearchParams('writeMarkdownPreview=imagePending')),
    'imagePending',
  )
})

test('previewContentForMode wires widget overrides for image, infographic, and html embed modes', () => {
  const imageError = previewContentForMode('imageError')
  assert.match(imageError.content, /missing-hero\.png/)
  assert.deepEqual(widgetOverridesForPreviewMode('imageError'), {
    image: { state: 'error' },
  })

  const imagePending = previewContentForMode('imagePending')
  assert.deepEqual(imagePending.widgetOverrides, {
    image: { state: 'pending' },
  })

  const infographic = previewContentForMode('infographicPrototype')
  assert.match(infographic.content, /kun-pending-infographic:\/\//)
  assert.deepEqual(widgetOverridesForPreviewMode('infographicPrototype'), {
    infographic: { kind: 'prototype', state: 'active' },
  })

  const htmlEmbed = previewContentForMode('htmlEmbed')
  assert.match(htmlEmbed.content, /\.html\)/)
  assert.deepEqual(htmlEmbed.widgetOverrides, {
    htmlEmbed: { visualState: 'cover' },
  })

  const htmlEmbedError = previewContentForMode('htmlEmbedError')
  assert.deepEqual(htmlEmbedError.widgetOverrides, {
    htmlEmbed: { visualState: 'error' },
  })

  const htmlEmbedMissing = previewContentForMode('htmlEmbedMissing')
  assert.deepEqual(htmlEmbedMissing.widgetOverrides, {
    htmlEmbed: { visualState: 'missing' },
  })
})
