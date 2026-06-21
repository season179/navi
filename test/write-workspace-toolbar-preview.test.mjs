import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveWriteWorkspaceToolbarPreviewMode } from '../src/renderer/lib/writeWorkspaceToolbarPreviewModes.ts'

test('returns null when writeWorkspaceToolbar param is absent', () => {
  assert.equal(resolveWriteWorkspaceToolbarPreviewMode(new URLSearchParams()), null)
})

test('defaults to default for bare writeWorkspaceToolbar param', () => {
  assert.equal(
    resolveWriteWorkspaceToolbarPreviewMode(new URLSearchParams('writeWorkspaceToolbar')),
    'default',
  )
})

test('routes exporting toolbar in-flight preview mode', () => {
  assert.equal(
    resolveWriteWorkspaceToolbarPreviewMode(new URLSearchParams('writeWorkspaceToolbar=exporting')),
    'exporting',
  )
})

test('routes save-status and dropdown preview modes', () => {
  assert.equal(
    resolveWriteWorkspaceToolbarPreviewMode(new URLSearchParams('writeWorkspaceToolbar=dirty')),
    'dirty',
  )
  assert.equal(
    resolveWriteWorkspaceToolbarPreviewMode(new URLSearchParams('writeWorkspaceToolbar=exportMenu')),
    'exportMenu',
  )
  assert.equal(
    resolveWriteWorkspaceToolbarPreviewMode(new URLSearchParams('writeWorkspaceToolbar=review')),
    'review',
  )
})

test('routes rich toolbar mode preview without opening mode menu', () => {
  assert.equal(
    resolveWriteWorkspaceToolbarPreviewMode(new URLSearchParams('writeWorkspaceToolbar=rich')),
    'rich',
  )
})

test('routes source toolbar mode preview without opening mode menu', () => {
  assert.equal(
    resolveWriteWorkspaceToolbarPreviewMode(new URLSearchParams('writeWorkspaceToolbar=source')),
    'source',
  )
})

test('routes split toolbar mode preview without opening mode menu', () => {
  assert.equal(
    resolveWriteWorkspaceToolbarPreviewMode(new URLSearchParams('writeWorkspaceToolbar=split')),
    'split',
  )
})

test('routes preview toolbar mode preview without opening mode menu', () => {
  assert.equal(
    resolveWriteWorkspaceToolbarPreviewMode(new URLSearchParams('writeWorkspaceToolbar=preview')),
    'preview',
  )
})
