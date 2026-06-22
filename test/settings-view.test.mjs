import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.settings-view-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'settingsView.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  SETTINGS_VIEW_API_KEY_REQUIRED_BODY,
  SETTINGS_VIEW_API_KEY_REQUIRED_TITLE,
  SETTINGS_VIEW_APPLIED_LABEL,
  SETTINGS_VIEW_APPLY_FAILED_LABEL,
  SETTINGS_VIEW_APPLYING_LABEL,
  SETTINGS_VIEW_AUTO_APPLY_BLOCKED_LABEL,
  SETTINGS_VIEW_AUTO_APPLY_HINT,
  SETTINGS_VIEW_PREVIEW_APPLY_ERROR_MESSAGE,
  SETTINGS_VIEW_RETRY_SAVE_LABEL,
  SETTINGS_VIEW_SUBTITLE,
  SETTINGS_VIEW_TITLE,
  resolveSettingsViewSaveStatusLabel,
} = await import(out)

test('settings view chrome copy matches Kun locale strings', () => {
  assert.equal(SETTINGS_VIEW_TITLE, 'Settings')
  assert.equal(
    SETTINGS_VIEW_SUBTITLE,
    'Manage API access, interface preferences, default folders, and assistant behavior.',
  )
  assert.equal(SETTINGS_VIEW_AUTO_APPLY_HINT, 'Changes apply automatically')
  assert.equal(SETTINGS_VIEW_APPLYING_LABEL, 'Applying…')
  assert.equal(SETTINGS_VIEW_APPLIED_LABEL, 'Applied')
  assert.equal(SETTINGS_VIEW_APPLY_FAILED_LABEL, 'Could not apply')
  assert.equal(SETTINGS_VIEW_AUTO_APPLY_BLOCKED_LABEL, 'Fix the port to apply changes')
  assert.equal(SETTINGS_VIEW_RETRY_SAVE_LABEL, 'Retry')
  assert.equal(SETTINGS_VIEW_API_KEY_REQUIRED_TITLE, 'API key required')
  assert.equal(
    SETTINGS_VIEW_API_KEY_REQUIRED_BODY,
    'Add an API key in Providers first. Once entered, the app can start the local AI assistant service for you.',
  )
  assert.equal(
    SETTINGS_VIEW_PREVIEW_APPLY_ERROR_MESSAGE,
    'Could not write settings to disk. Check permissions and try again.',
  )
})

test('resolveSettingsViewSaveStatusLabel matches Kun status chip labels', () => {
  assert.equal(resolveSettingsViewSaveStatusLabel('idle', false), 'Changes apply automatically')
  assert.equal(resolveSettingsViewSaveStatusLabel('saving', false), 'Applying…')
  assert.equal(resolveSettingsViewSaveStatusLabel('saved', false), 'Applied')
  assert.equal(resolveSettingsViewSaveStatusLabel('error', false), 'Could not apply')
  assert.equal(
    resolveSettingsViewSaveStatusLabel('idle', true),
    'Fix the port to apply changes',
  )
})
