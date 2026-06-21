// Unit tests for src/renderer/lib/format-relative-time.ts — the threshold math
// (which ms divisor maps to which unit) is easy to get subtly wrong, so pin it.
// Bundled with esbuild like the other shared/renderer pure modules; Intl is
// available under Node. Deltas use safe margins so no assertion sits on a
// unit boundary, and locale is forced to keep output deterministic.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'
import { buildSync } from 'esbuild'

const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const outfile = join(ROOT, 'node_modules', '.format-relative-time-test.cjs')
buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'format-relative-time.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile,
})
const { formatRelativeTime } = require(outfile)

const SEC = 1000
const MIN = 60 * SEC
const HOUR = 60 * MIN
const DAY = 24 * HOUR
const WEEK = 7 * DAY

test('non-finite input returns empty string', () => {
  assert.equal(formatRelativeTime(NaN, 'en-US'), '')
  assert.equal(formatRelativeTime(Infinity, 'en-US'), '')
})

test('sub-minute deltas format in seconds', () => {
  assert.equal(formatRelativeTime(Date.now() - 5 * SEC, 'en-US'), '5 seconds ago')
})

test('minute, hour, day, and week thresholds pick the right unit', () => {
  assert.equal(formatRelativeTime(Date.now() - 5 * MIN, 'en-US'), '5 minutes ago')
  assert.equal(formatRelativeTime(Date.now() - 3 * HOUR, 'en-US'), '3 hours ago')
  assert.equal(formatRelativeTime(Date.now() - 3 * DAY, 'en-US'), '3 days ago')
  assert.equal(formatRelativeTime(Date.now() - 2 * WEEK, 'en-US'), '2 weeks ago')
})

test('beyond ~30 days falls back to an absolute date, not a relative phrase', () => {
  const out = formatRelativeTime(Date.now() - 200 * DAY, 'en-US')
  assert.doesNotMatch(out, /ago/, 'old timestamps use an absolute date')
  assert.match(out, /\d/, 'absolute date contains a day number')
})
