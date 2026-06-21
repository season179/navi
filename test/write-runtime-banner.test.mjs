import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveWriteRuntimeBannerMessage } from '../src/renderer/lib/writeRuntimeBanner.ts'

const NEEDS_CONNECTION = 'Connect to the runtime to use AI features.'

test('returns null when runtime is ready', () => {
  assert.equal(
    resolveWriteRuntimeBannerMessage({
      runtimeConnection: 'ready',
      error: 'Runtime request failed.',
      runtimeActionNeedsConnection: NEEDS_CONNECTION,
    }),
    null,
  )
})

test('returns null for routine offline connection hints', () => {
  assert.equal(
    resolveWriteRuntimeBannerMessage({
      runtimeConnection: 'offline',
      error: NEEDS_CONNECTION,
      runtimeActionNeedsConnection: NEEDS_CONNECTION,
    }),
    null,
  )
})

test('returns actionable runtime errors while offline', () => {
  assert.equal(
    resolveWriteRuntimeBannerMessage({
      runtimeConnection: 'offline',
      error: 'Runtime request failed.',
      runtimeActionNeedsConnection: NEEDS_CONNECTION,
    }),
    'Runtime request failed.',
  )
})

test('returns null when there is no error message', () => {
  assert.equal(
    resolveWriteRuntimeBannerMessage({
      runtimeConnection: 'checking',
      error: '',
      runtimeActionNeedsConnection: NEEDS_CONNECTION,
    }),
    null,
  )
})
