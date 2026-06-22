import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.easter-egg-settings-section-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'easterEggSettingsSection.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const mod = await import(out)

test('easter egg settings section shell copy matches Kun locale strings', () => {
  assert.equal(mod.EASTER_EGG_SETTINGS_TITLE, 'Mode workshop')
  assert.equal(mod.EASTER_EGG_SETTINGS_UI_MODE_WORKSHOP_TITLE, 'Mascot modes')
  assert.equal(
    mod.EASTER_EGG_SETTINGS_UI_MODE_WORKSHOP_DESC,
    'Pick the workspace mascot pack. The built-in iKun mode is itself a pre-installed UI plugin example — build and install your own packs with the developer guide (declarative image packs, no executable code).',
  )
  assert.equal(mod.EASTER_EGG_SETTINGS_UI_MODE_DEFAULT_TITLE, 'Default Kun')
  assert.equal(mod.EASTER_EGG_SETTINGS_UI_MODE_DEFAULT_SUBTITLE, 'The little blue bird')
})

test('easter egg settings section plugin action copy matches Kun locale strings', () => {
  assert.equal(mod.EASTER_EGG_SETTINGS_UI_PLUGIN_INSTALL, 'Install plugin folder…')
  assert.equal(mod.EASTER_EGG_SETTINGS_UI_PLUGIN_ACTIVATE, 'Use')
  assert.equal(mod.EASTER_EGG_SETTINGS_UI_PLUGIN_ACTIVE, 'Active')
  assert.equal(mod.EASTER_EGG_SETTINGS_UI_PLUGIN_REMOVE, 'Remove plugin')
  assert.equal(
    mod.EASTER_EGG_SETTINGS_UI_PLUGIN_EMPTY,
    'No UI plugins installed. The bundled iKun example may have been removed; install a plugin folder, or build one with the developer guide.',
  )
  assert.equal(mod.EASTER_EGG_SETTINGS_UI_PLUGIN_INSTALL_FAILED, 'Install failed')
  assert.equal(mod.EASTER_EGG_SETTINGS_UI_PLUGIN_DOCS_HINT, 'Developer guide: docs/UI_PLUGINS.md')
})

test('easter egg settings section exports expected constant count', () => {
  const constants = Object.keys(mod).filter((key) => key.startsWith('EASTER_EGG_SETTINGS_'))
  assert.equal(constants.length, 12)
})
