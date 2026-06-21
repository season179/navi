import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveWriteWorkspaceDocumentPanePreviewMode } from '../src/renderer/lib/writeWorkspaceDocumentPanePreviewModes.ts'

test('returns null when writeWorkspaceDocumentPane param is absent', () => {
  assert.equal(resolveWriteWorkspaceDocumentPanePreviewMode(new URLSearchParams()), null)
})

test('defaults to split for bare writeWorkspaceDocumentPane param', () => {
  assert.equal(
    resolveWriteWorkspaceDocumentPanePreviewMode(new URLSearchParams('writeWorkspaceDocumentPane')),
    'split',
  )
})

test('routes document mode preview params', () => {
  assert.equal(
    resolveWriteWorkspaceDocumentPanePreviewMode(new URLSearchParams('writeWorkspaceDocumentPane=source')),
    'source',
  )
  assert.equal(
    resolveWriteWorkspaceDocumentPanePreviewMode(new URLSearchParams('writeWorkspaceDocumentPane=live')),
    'live',
  )
  assert.equal(
    resolveWriteWorkspaceDocumentPanePreviewMode(new URLSearchParams('writeWorkspaceDocumentPane=rich')),
    'rich',
  )
})

test('routes live-disabled document pane preview when live preview is off', () => {
  assert.equal(
    resolveWriteWorkspaceDocumentPanePreviewMode(new URLSearchParams('writeWorkspaceDocumentPane=liveDisabled')),
    'liveDisabled',
  )
})

test('routes safety preview params', () => {
  assert.equal(
    resolveWriteWorkspaceDocumentPanePreviewMode(new URLSearchParams('writeWorkspaceDocumentPane=largeFile')),
    'largeFile',
  )
  assert.equal(
    resolveWriteWorkspaceDocumentPanePreviewMode(new URLSearchParams('writeWorkspaceDocumentPane=truncated')),
    'truncated',
  )
})
