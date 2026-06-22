import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.memory-settings-section-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'memorySettingsSection.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const mod = await import(out)

test('memory settings section copy matches Kun locale strings', () => {
  assert.equal(mod.MEMORY_SETTINGS_SECTION_TITLE, 'Long-term memory')
  assert.equal(mod.MEMORY_SETTINGS_ENABLE_LABEL, 'Enable memory')
  assert.equal(mod.MEMORY_SETTINGS_RECORDS_LABEL, 'Memory records')
  assert.equal(mod.MEMORY_SETTINGS_CREATE_LABEL, 'New')
  assert.equal(mod.MEMORY_SETTINGS_EMPTY_TEXT, 'No memory records yet. The assistant will create them automatically as it learns your preferences, or add one manually.')
})

test('memory settings section disabled hint matches Kun locale string', () => {
  assert.equal(
    mod.MEMORY_SETTINGS_DISABLED_HINT,
    'Memory is currently disabled. Enable it in the runtime configuration (kun config) to create and use memory records.',
  )
})

test('memory settings section scope label resolver matches Kun memoryScope_* keys', () => {
  assert.equal(mod.resolveMemorySettingsScopeLabel('all'), 'All')
  assert.equal(mod.resolveMemorySettingsScopeLabel('user'), 'User')
  assert.equal(mod.resolveMemorySettingsScopeLabel('workspace'), 'Workspace')
  assert.equal(mod.resolveMemorySettingsScopeLabel('project'), 'Project')
})

test('memory settings section exports expected constant count', () => {
  const constants = Object.keys(mod).filter((key) => key.startsWith('MEMORY_SETTINGS_'))
  assert.equal(constants.length, 32)
})
