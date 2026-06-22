import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.updates-settings-section-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'updatesSettingsSection.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const mod = await import(out)

test('updates settings section shell copy matches Kun locale strings', () => {
  assert.equal(mod.UPDATES_SETTINGS_SECTION_TITLE, 'Version & updates')
  assert.equal(mod.UPDATES_SETTINGS_CHANNEL_LABEL, 'Update channel')
  assert.equal(
    mod.UPDATES_SETTINGS_CHANNEL_DESC,
    'Stable is the default; Frontier is only used after you switch to it. Stable only receives formal stable releases.',
  )
  assert.equal(mod.UPDATES_SETTINGS_CHANNEL_FRONTIER, 'Frontier')
  assert.equal(mod.UPDATES_SETTINGS_CHANNEL_STABLE, 'Stable')
  assert.equal(mod.UPDATES_SETTINGS_GUI_UPDATE_LABEL, 'GUI updates')
  assert.equal(
    mod.UPDATES_SETTINGS_GUI_UPDATE_DESC,
    'Check the selected release channel for GUI updates, then download and install in the app.',
  )
})

test('gui update control copy matches Kun locale strings', () => {
  assert.equal(mod.GUI_UPDATE_CHECKING, 'Checking for GUI updates…')
  assert.equal(mod.GUI_UPDATE_CHECK_FAILED, 'Could not check for GUI updates')
  assert.equal(mod.GUI_UPDATE_NOT_CONFIGURED_TITLE, "Can't check for updates")
  assert.equal(
    mod.GUI_UPDATE_ERR_NOT_CONFIGURED,
    "Update checking isn't available right now.",
  )
  assert.equal(mod.GUI_UPDATE_DOWNLOADED_DESC, 'Restart the app to install the new version.')
  assert.equal(mod.GUI_UPDATE_INSTALLING, 'Restarting to install update…')
  assert.equal(mod.GUI_UPDATE_CHECK, 'Check for updates')
  assert.equal(mod.GUI_UPDATE_DOWNLOAD, 'Download update')
  assert.equal(mod.GUI_UPDATE_INSTALL, 'Restart and install')
  assert.equal(mod.GUI_UPDATE_OPEN_RELEASE, 'Open download page')
})

test('gui update control formatters match Kun locale templates', () => {
  assert.equal(mod.formatGuiUpdateCurrent('0.0.2'), 'Up to date: 0.0.2')
  assert.equal(
    mod.formatGuiUpdateAvailable('0.0.1', '0.0.2'),
    'New version available: 0.0.1 → 0.0.2',
  )
  assert.equal(
    mod.formatGuiUpdateAvailableManual('0.0.1', '0.0.2'),
    'New version available: 0.0.1 → 0.0.2. Install it from the download page.',
  )
  assert.equal(mod.formatGuiUpdateDownloading(60), 'Downloading update… 60%')
  assert.equal(
    mod.formatGuiUpdateDownloadProgress('30 MB', '50 MB', '1.5 MB'),
    '30 MB / 50 MB, 1.5 MB/s',
  )
  assert.equal(mod.formatGuiUpdateDownloaded('0.0.2'), 'Update 0.0.2 downloaded')
})

test('updates settings section exports expected constant count', () => {
  const constants = Object.keys(mod).filter(
    (key) => key.startsWith('UPDATES_SETTINGS_') || key.startsWith('GUI_UPDATE_'),
  )
  assert.equal(constants.length, 17)
})
