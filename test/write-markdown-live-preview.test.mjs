import assert from 'node:assert/strict'
import test from 'node:test'
import {
  isHtmlEmbedSrc,
  parsePendingInfographicId,
  parsePendingInfographicImage,
} from '../src/renderer/lib/writeMarkdownImageWidgets.ts'

test('parsePendingInfographicImage extracts id from markdown image syntax', () => {
  const parsed = parsePendingInfographicImage(
    '![Infographic](kun-pending-infographic://preview-id)',
  )
  assert.equal(parsed?.id, 'preview-id')
  assert.equal(parsePendingInfographicId('kun-pending-infographic://preview-id'), 'preview-id')
})

test('isHtmlEmbedSrc recognizes local html prototype paths', () => {
  assert.equal(isHtmlEmbedSrc('../../proto/launch-mockup.html'), true)
  assert.equal(isHtmlEmbedSrc('https://example.com/x.html'), false)
})

test('parsePendingInfographicImage rejects non-pending image markdown', () => {
  assert.equal(parsePendingInfographicImage('![photo](./assets/chart.png)'), null)
})
