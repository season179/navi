import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveWriteWorkspaceViewPreviewMode } from '../src/renderer/lib/writeWorkspacePreviewModes.ts'

test('returns null when writeWorkspaceView param is absent', () => {
  assert.equal(resolveWriteWorkspaceViewPreviewMode(new URLSearchParams()), null)
})

test('defaults to split for bare writeWorkspaceView param', () => {
  assert.equal(
    resolveWriteWorkspaceViewPreviewMode(new URLSearchParams('writeWorkspaceView')),
    'split',
  )
})

test('routes loading and unsupported document-pane preview modes', () => {
  assert.equal(
    resolveWriteWorkspaceViewPreviewMode(new URLSearchParams('writeWorkspaceView=loading')),
    'loading',
  )
  assert.equal(
    resolveWriteWorkspaceViewPreviewMode(new URLSearchParams('writeWorkspaceView=unsupported')),
    'unsupported',
  )
})

test('routes largeFile and truncated file-guard preview modes', () => {
  assert.equal(
    resolveWriteWorkspaceViewPreviewMode(new URLSearchParams('writeWorkspaceView=largeFile')),
    'largeFile',
  )
  assert.equal(
    resolveWriteWorkspaceViewPreviewMode(new URLSearchParams('writeWorkspaceView=truncated')),
    'truncated',
  )
})
