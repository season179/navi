import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-model-picker-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerModelPicker.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  COMPOSER_AUTO_LABEL,
  COMPOSER_CONFIGURE_PROVIDERS_LABEL,
  COMPOSER_MODEL_CONTROLS_LABEL,
  COMPOSER_MODEL_LABEL,
  COMPOSER_MODEL_SEARCH_PLACEHOLDER,
  COMPOSER_MODEL_TEXT_ONLY_LABEL,
  COMPOSER_MODEL_VISION_LABEL,
  COMPOSER_NAVI_REASONING_LABELS,
  COMPOSER_NO_MATCHING_MODELS_LABEL,
  COMPOSER_NO_PROVIDERS_LABEL,
  COMPOSER_NO_PROVIDERS_SHORT_LABEL,
  COMPOSER_REASONING_AUTO_LABEL,
  COMPOSER_REASONING_HIGH_LABEL,
  COMPOSER_REASONING_LOW_LABEL,
  COMPOSER_REASONING_MAX_LABEL,
  COMPOSER_REASONING_MEDIUM_LABEL,
  COMPOSER_REASONING_OFF_LABEL,
  COMPOSER_REASONING_OPTIONS,
  COMPOSER_REASONING_SECTION_LABEL,
  formatComposerModelControlsTitle,
  getComposerReasoningLabel,
} = await import(out)

test('model picker chrome copy matches Kun locale strings', () => {
  assert.equal(COMPOSER_MODEL_LABEL, 'Model')
  assert.equal(COMPOSER_MODEL_CONTROLS_LABEL, 'Model and reasoning settings')
  assert.equal(COMPOSER_NO_PROVIDERS_SHORT_LABEL, 'Set up provider')
  assert.equal(COMPOSER_NO_PROVIDERS_LABEL, 'No chat model provider is available yet.')
  assert.equal(COMPOSER_CONFIGURE_PROVIDERS_LABEL, 'Open provider settings')
  assert.equal(COMPOSER_MODEL_SEARCH_PLACEHOLDER, 'Filter models')
  assert.equal(COMPOSER_NO_MATCHING_MODELS_LABEL, 'No matching models')
  assert.equal(COMPOSER_MODEL_VISION_LABEL, 'Vision')
  assert.equal(COMPOSER_MODEL_TEXT_ONLY_LABEL, 'Text')
  assert.equal(COMPOSER_REASONING_SECTION_LABEL, 'Reasoning')
  assert.equal(COMPOSER_AUTO_LABEL, 'Auto')
})

test('reasoning option labels match Kun locale strings', () => {
  assert.deepEqual(
    COMPOSER_REASONING_OPTIONS.map((option) => option.label),
    ['Adaptive', 'Off', 'Low', 'Med', 'High', 'Ultra'],
  )
  assert.equal(getComposerReasoningLabel('auto'), COMPOSER_REASONING_AUTO_LABEL)
  assert.equal(getComposerReasoningLabel('medium'), COMPOSER_REASONING_MEDIUM_LABEL)
  assert.equal(getComposerReasoningLabel('max'), COMPOSER_REASONING_MAX_LABEL)
  assert.equal(getComposerReasoningLabel('unknown'), COMPOSER_REASONING_MAX_LABEL)
})

test('navi reasoning levels use closest Kun labels', () => {
  assert.equal(COMPOSER_NAVI_REASONING_LABELS.low, COMPOSER_REASONING_LOW_LABEL)
  assert.equal(COMPOSER_NAVI_REASONING_LABELS.medium, COMPOSER_REASONING_MEDIUM_LABEL)
  assert.equal(COMPOSER_NAVI_REASONING_LABELS.high, COMPOSER_REASONING_HIGH_LABEL)
  assert.equal(COMPOSER_NAVI_REASONING_LABELS.xhigh, COMPOSER_REASONING_MAX_LABEL)
})

test('formatComposerModelControlsTitle joins model and reasoning like Kun trigger title', () => {
  assert.equal(
    formatComposerModelControlsTitle('claude-sonnet', 'Med'),
    'claude-sonnet / Med',
  )
  assert.equal(formatComposerModelControlsTitle('Set up provider'), 'Set up provider')
})
