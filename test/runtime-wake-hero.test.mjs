import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.runtime-wake-hero-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'runtimeWakeHero.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  RUNTIME_WAKE_HERO_KICKER,
  RUNTIME_WAKE_HERO_OFFLINE_TITLE,
  RUNTIME_WAKE_HERO_OFFLINE_DETAIL,
  RUNTIME_WAKE_HERO_ERROR_TITLE,
  RUNTIME_WAKE_HERO_RETRY_LABEL,
  RUNTIME_WAKE_HERO_OPEN_SETTINGS_LABEL,
  resolveRuntimeWakeHeroTitle,
  resolveRuntimeWakeHeroDetail,
  resolveRuntimeWakeHeroWaking,
} = await import(out)

test('runtime wake hero chrome copy matches Kun locale strings', () => {
  assert.equal(RUNTIME_WAKE_HERO_KICKER, 'GUI agent core')
  assert.equal(RUNTIME_WAKE_HERO_OFFLINE_TITLE, 'Navi is waking the local agent')
  assert.equal(
    RUNTIME_WAKE_HERO_OFFLINE_DETAIL,
    'The workbench is bringing Navi back into this window. When the local service is ready, sessions and the composer resume here.',
  )
  assert.equal(RUNTIME_WAKE_HERO_ERROR_TITLE, 'Cannot connect to the local runtime')
  assert.equal(RUNTIME_WAKE_HERO_RETRY_LABEL, 'Retry')
  assert.equal(RUNTIME_WAKE_HERO_OPEN_SETTINGS_LABEL, 'Open Settings')
})

test('runtime wake hero title and detail resolution matches Kun behavior', () => {
  assert.equal(resolveRuntimeWakeHeroTitle(undefined), RUNTIME_WAKE_HERO_OFFLINE_TITLE)
  assert.equal(resolveRuntimeWakeHeroTitle('   '), RUNTIME_WAKE_HERO_OFFLINE_TITLE)
  assert.equal(
    resolveRuntimeWakeHeroTitle('Port 4317 is already in use'),
    RUNTIME_WAKE_HERO_ERROR_TITLE,
  )
  assert.equal(resolveRuntimeWakeHeroDetail(undefined), RUNTIME_WAKE_HERO_OFFLINE_DETAIL)
  assert.equal(
    resolveRuntimeWakeHeroDetail('Port 4317 is already in use'),
    'Port 4317 is already in use',
  )
  assert.equal(resolveRuntimeWakeHeroWaking(undefined), true)
  assert.equal(resolveRuntimeWakeHeroWaking('Port 4317 is already in use'), false)
})
