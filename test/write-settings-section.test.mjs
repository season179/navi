import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.write-settings-section-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'writeSettingsSection.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const mod = await import(out)

test('write settings section shell copy matches Kun locale strings', () => {
  assert.equal(mod.WRITE_SETTINGS_SECTION_TITLE, 'Write mode')
  assert.equal(mod.WRITE_SETTINGS_WORKSPACE_ROOT_LABEL, 'Default writing workspace')
  assert.equal(
    mod.WRITE_SETTINGS_WORKSPACE_ROOT_DESC,
    'Writing mode reads Markdown documents from here by default. A welcome.md file is created on first launch.',
  )
  assert.equal(mod.WRITE_SETTINGS_WORKSPACE_ROOT_PLACEHOLDER, '~/.navi/write_workspace')
  assert.equal(mod.WRITE_SETTINGS_TYPOGRAPHY_TITLE, 'Typography & font')
  assert.equal(mod.WRITE_SETTINGS_FONT_PRESET_LABEL, 'Editor font')
  assert.equal(mod.WRITE_SETTINGS_LINE_HEIGHT_LABEL, 'Line spacing')
})

test('write settings inline completion copy matches Kun locale strings', () => {
  assert.equal(mod.WRITE_SETTINGS_INLINE_COMPLETION_TITLE, 'Writing suggestions')
  assert.equal(
    mod.WRITE_SETTINGS_INLINE_COMPLETION_ENABLED_LABEL,
    'Show suggestions after you pause',
  )
  assert.equal(mod.WRITE_SETTINGS_INLINE_COMPLETION_PROVIDER_LABEL, 'Writing provider')
  assert.equal(mod.WRITE_SETTINGS_INLINE_COMPLETION_RETRIEVAL_LABEL, 'Reference other documents')
  assert.equal(mod.WRITE_SETTINGS_INLINE_COMPLETION_ADVANCED_TITLE, 'Advanced tuning')
  assert.equal(mod.WRITE_SETTINGS_INLINE_COMPLETION_DEBOUNCE_LABEL, 'Suggestion speed')
  assert.equal(mod.WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_LABEL, 'Suggestion frequency')
  assert.equal(mod.WRITE_SETTINGS_INLINE_COMPLETION_DELAY_SLOW, 'Quiet · 1500 ms')
  assert.equal(
    mod.WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_VERY_STRICT,
    'Very strict · high confidence only',
  )
})

test('write settings selection assist copy matches Kun locale strings', () => {
  assert.equal(mod.WRITE_SETTINGS_SELECTION_ASSIST_TITLE, 'Selection toolbar')
  assert.equal(mod.WRITE_SETTINGS_SELECTION_ASSIST_ADVANCED_TITLE, 'Advanced: custom prompts')
  assert.equal(mod.WRITE_SETTINGS_QUICK_ACTIONS_LABEL, 'AI quick actions')
  assert.equal(mod.WRITE_SETTINGS_QUICK_ACTION_MODE_EDIT, 'Edit in place')
  assert.equal(mod.WRITE_SETTINGS_QUICK_ACTION_MODE_CHAT, 'Send to assistant')
  assert.equal(mod.WRITE_SETTINGS_QUICK_ACTIONS_RESET, 'Restore defaults')
  assert.equal(mod.WRITE_SETTINGS_DESIGN_DRAFT_PROMPT_LABEL, 'Design mockup prompt')
  assert.equal(mod.WRITE_SETTINGS_PROTOTYPE_PROMPT_LABEL, 'Interactive prototype prompt')
})

test('write settings agent presets and debug log copy matches Kun locale strings', () => {
  assert.equal(mod.WRITE_SETTINGS_AGENT_PRESETS_TITLE, 'Custom writing agent prompts')
  assert.equal(mod.WRITE_SETTINGS_AGENT_PRESET_ADD, 'Add agent')
  assert.equal(mod.WRITE_SETTINGS_AGENT_PRESET_REMOVE, 'Remove')
  assert.equal(mod.WRITE_SETTINGS_DEBUG_LOG_TITLE, 'Writing suggestion logs')
  assert.equal(mod.WRITE_SETTINGS_DEBUG_LOG_OPEN_LABEL, 'View recent calls')
  assert.equal(mod.WRITE_SETTINGS_DEBUG_LOG_OPEN_BUTTON, 'View logs')
})

test('write settings formatter helpers match Kun locale templates', () => {
  assert.equal(
    mod.formatWriteSettingsFontSizeDesc(12, 28),
    'Body text size (12–28px). Applies to the editor and preview.',
  )
  assert.equal(
    mod.formatWriteSettingsInlineCompletionProviderInherit('DeepSeek'),
    'Inherit AI assistant (DeepSeek)',
  )
  assert.equal(mod.formatWriteSettingsModelSelectDefaultOption('deepseek-v4-pro'), 'Default (deepseek-v4-pro)')
})

test('write settings font preset labels match Kun writeFont* keys', () => {
  assert.equal(mod.WRITE_SETTINGS_FONT_PRESET_LABELS.system, 'System default')
  assert.equal(mod.WRITE_SETTINGS_FONT_PRESET_LABELS.simsun, 'SimSun (serif)')
  assert.equal(mod.WRITE_SETTINGS_FONT_PRESET_LABELS.custom, 'Custom…')
})

test('write settings font size range matches Kun constants', () => {
  assert.equal(mod.WRITE_EDITOR_FONT_SIZE_MIN, 12)
  assert.equal(mod.WRITE_EDITOR_FONT_SIZE_MAX, 28)
})

test('write settings section exports expected constant count', () => {
  const constants = Object.keys(mod).filter((key) => key.startsWith('WRITE_SETTINGS_'))
  assert.equal(constants.length, 84)
})
