import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.settings-sidebar-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'settingsSidebar.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  SETTINGS_SIDEBAR_AGENTS_LABEL,
  SETTINGS_SIDEBAR_ARCHIVES_LABEL,
  SETTINGS_SIDEBAR_BACK_LABEL,
  SETTINGS_SIDEBAR_CLAW_LABEL,
  SETTINGS_SIDEBAR_DEBUG_LABEL,
  SETTINGS_SIDEBAR_EASTER_EGG_LABEL,
  SETTINGS_SIDEBAR_FOOTER_LABEL,
  SETTINGS_SIDEBAR_GENERAL_LABEL,
  SETTINGS_SIDEBAR_IMAGE_GEN_LABEL,
  SETTINGS_SIDEBAR_KEYBOARD_SHORTCUTS_LABEL,
  SETTINGS_SIDEBAR_MEDIA_GENERATION_LABEL,
  SETTINGS_SIDEBAR_MEMORY_LABEL,
  SETTINGS_SIDEBAR_PERMISSIONS_LABEL,
  SETTINGS_SIDEBAR_PROVIDERS_LABEL,
  SETTINGS_SIDEBAR_SPEECH_TO_TEXT_LABEL,
  SETTINGS_SIDEBAR_UPDATES_LABEL,
  SETTINGS_SIDEBAR_WORKTREE_LABEL,
  SETTINGS_SIDEBAR_WRITE_LABEL,
  resolveSettingsSidebarCategoryLabel,
} = await import(out)

test('settings sidebar chrome copy matches Kun locale strings', () => {
  assert.equal(SETTINGS_SIDEBAR_BACK_LABEL, 'Back')
  assert.equal(SETTINGS_SIDEBAR_GENERAL_LABEL, 'General')
  assert.equal(SETTINGS_SIDEBAR_PROVIDERS_LABEL, 'Providers')
  assert.equal(SETTINGS_SIDEBAR_WRITE_LABEL, 'Write')
  assert.equal(SETTINGS_SIDEBAR_IMAGE_GEN_LABEL, 'Image generation')
  assert.equal(SETTINGS_SIDEBAR_MEDIA_GENERATION_LABEL, 'Media generation')
  assert.equal(SETTINGS_SIDEBAR_SPEECH_TO_TEXT_LABEL, 'Speech to text')
  assert.equal(SETTINGS_SIDEBAR_AGENTS_LABEL, 'AI assistant')
  assert.equal(SETTINGS_SIDEBAR_ARCHIVES_LABEL, 'Archived chats')
  assert.equal(SETTINGS_SIDEBAR_PERMISSIONS_LABEL, 'Permissions')
  assert.equal(SETTINGS_SIDEBAR_WORKTREE_LABEL, 'Worktrees')
  assert.equal(SETTINGS_SIDEBAR_MEMORY_LABEL, 'Memory')
  assert.equal(SETTINGS_SIDEBAR_KEYBOARD_SHORTCUTS_LABEL, 'Keyboard shortcuts')
  assert.equal(SETTINGS_SIDEBAR_EASTER_EGG_LABEL, 'Mode workshop')
  assert.equal(SETTINGS_SIDEBAR_UPDATES_LABEL, 'Version & updates')
  assert.equal(SETTINGS_SIDEBAR_CLAW_LABEL, 'Connect phone')
  assert.equal(SETTINGS_SIDEBAR_DEBUG_LABEL, 'Troubleshooting')
  assert.equal(SETTINGS_SIDEBAR_FOOTER_LABEL, 'Preferences are stored locally.')
})

test('resolveSettingsSidebarCategoryLabel maps Kun locale keys', () => {
  assert.equal(resolveSettingsSidebarCategoryLabel('agents'), 'AI assistant')
  assert.equal(resolveSettingsSidebarCategoryLabel('archives'), 'Archived chats')
  assert.equal(resolveSettingsSidebarCategoryLabel('claw'), 'Connect phone')
  assert.equal(resolveSettingsSidebarCategoryLabel('debug'), 'Troubleshooting')
  assert.equal(resolveSettingsSidebarCategoryLabel('easterEgg'), 'Mode workshop')
  assert.equal(resolveSettingsSidebarCategoryLabel('updates'), 'Version & updates')
  assert.equal(resolveSettingsSidebarCategoryLabel('worktree'), 'Worktrees')
  assert.equal(resolveSettingsSidebarCategoryLabel('unknown-key'), 'unknown-key')
})
