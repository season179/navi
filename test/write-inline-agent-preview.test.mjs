import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveWriteInlineAgentPreviewMode } from '../src/renderer/lib/writeInlineAgentPreviewModes.ts'

test('returns null when writeInlineAgent param is absent', () => {
  assert.equal(resolveWriteInlineAgentPreviewMode(new URLSearchParams()), null)
})

test('defaults to default for bare writeInlineAgent param', () => {
  assert.equal(
    resolveWriteInlineAgentPreviewMode(new URLSearchParams('writeInlineAgent')),
    'default',
  )
})

test('routes inline agent sub-state preview modes', () => {
  assert.equal(
    resolveWriteInlineAgentPreviewMode(new URLSearchParams('writeInlineAgent=blockMenu')),
    'blockMenu',
  )
  assert.equal(
    resolveWriteInlineAgentPreviewMode(new URLSearchParams('writeInlineAgent=emptyAgents')),
    'emptyAgents',
  )
  assert.equal(
    resolveWriteInlineAgentPreviewMode(new URLSearchParams('writeInlineAgent=askOnly')),
    'askOnly',
  )
  assert.equal(
    resolveWriteInlineAgentPreviewMode(new URLSearchParams('writeInlineAgent=inFlight')),
    'inFlight',
  )
  assert.equal(
    resolveWriteInlineAgentPreviewMode(new URLSearchParams('writeInlineAgent=skills')),
    'skills',
  )
  assert.equal(
    resolveWriteInlineAgentPreviewMode(new URLSearchParams('writeInlineAgent=imageMode')),
    'imageMode',
  )
})
