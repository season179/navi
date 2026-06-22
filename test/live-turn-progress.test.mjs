import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.live-turn-progress-locale-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'liveTurnProgressLocale.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  LIVE_TURN_PROGRESS_WORKING,
  LIVE_TURN_PROGRESS_SPRINT,
  LIVE_TURN_PROGRESS_DIVE,
  LIVE_TURN_PROGRESS_SURF,
  LIVE_TURN_PROGRESS_IKUN_DRIBBLE,
  LIVE_TURN_PROGRESS_IKUN_RUN,
  LIVE_TURN_PROGRESS_IKUN_BOBA,
  resolveLiveTurnProgressSwimLabel,
  resolveLiveTurnProgressIkunLabel,
  resolveLiveTurnProgressLabel,
} = await import(out)

test('live turn progress locale copy matches Kun locale strings', () => {
  assert.equal(LIVE_TURN_PROGRESS_WORKING, 'Working…')
  assert.equal(LIVE_TURN_PROGRESS_SPRINT, 'Sprinting…')
  assert.equal(LIVE_TURN_PROGRESS_DIVE, 'Diving…')
  assert.equal(LIVE_TURN_PROGRESS_SURF, 'Surfing…')
  assert.equal(LIVE_TURN_PROGRESS_IKUN_DRIBBLE, 'Dribbling…')
  assert.equal(LIVE_TURN_PROGRESS_IKUN_RUN, 'Fast break…')
  assert.equal(LIVE_TURN_PROGRESS_IKUN_BOBA, 'Boba time…')
})

test('live turn progress label resolution matches Kun behavior', () => {
  assert.equal(resolveLiveTurnProgressSwimLabel('propel'), 'Working…')
  assert.equal(resolveLiveTurnProgressSwimLabel('sprint'), 'Sprinting…')
  assert.equal(resolveLiveTurnProgressSwimLabel('dive'), 'Diving…')
  assert.equal(resolveLiveTurnProgressSwimLabel('surf'), 'Surfing…')
  assert.equal(resolveLiveTurnProgressIkunLabel('dribble'), 'Dribbling…')
  assert.equal(resolveLiveTurnProgressIkunLabel('run'), 'Fast break…')
  assert.equal(resolveLiveTurnProgressIkunLabel('boba'), 'Boba time…')
  assert.equal(
    resolveLiveTurnProgressLabel({
      ikunMode: false,
      swimMode: 'surf',
      ikunVariant: 'dribble',
    }),
    'Surfing…',
  )
  assert.equal(
    resolveLiveTurnProgressLabel({
      ikunMode: true,
      swimMode: 'propel',
      ikunVariant: 'boba',
    }),
    'Boba time…',
  )
})
