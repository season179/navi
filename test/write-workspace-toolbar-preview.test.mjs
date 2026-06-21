import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveWriteWorkspaceToolbarPreviewMode } from '../src/renderer/lib/writeWorkspaceToolbarPreviewModes.ts'
import {
  resolveLiveModeActive,
  resolveWriteToolbarModeActiveFlags,
} from '../src/renderer/lib/writeWorkspaceToolbarModeState.ts'

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

test('routes live toolbar mode preview without opening mode menu', () => {
  assert.equal(
    resolveWriteWorkspaceToolbarPreviewMode(new URLSearchParams('writeWorkspaceToolbar=live')),
    'live',
  )
})

test('routes live-disabled toolbar preview when live preview is off', () => {
  assert.equal(
    resolveWriteWorkspaceToolbarPreviewMode(new URLSearchParams('writeWorkspaceToolbar=liveDisabled')),
    'liveDisabled',
  )
})

test('marks source active when live mode is selected but live preview is disabled', () => {
  assert.equal(resolveLiveModeActive('live', false), false)
  const flags = resolveWriteToolbarModeActiveFlags('live', { livePreviewEnabled: false })
  assert.equal(flags.sourceModeActive, true)
  assert.equal(flags.splitModeActive, false)
})
