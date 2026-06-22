import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.image-generation-settings-section-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'imageGenerationSettingsSection.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const mod = await import(out)

test('image generation settings section shell copy matches Kun locale strings', () => {
  assert.equal(mod.IMAGE_GENERATION_SETTINGS_TITLE, 'Image generation')
  assert.equal(mod.IMAGE_GENERATION_SETTINGS_ENABLED_LABEL, 'Enable image generation')
  assert.equal(
    mod.IMAGE_GENERATION_SETTINGS_ENABLED_DESC,
    'Enables the generate_image tool in agent chats and powers infographic generation in Write. MiniMax can reuse the key from Providers; custom OpenAI-compatible image APIs are still supported.',
  )
  assert.equal(mod.IMAGE_GENERATION_SETTINGS_PROVIDER_LABEL, 'Image provider')
  assert.equal(mod.IMAGE_GENERATION_SETTINGS_PROVIDER_CUSTOM, 'Custom image API')
})

test('image generation settings section protocol and model copy matches Kun locale strings', () => {
  assert.equal(mod.IMAGE_GENERATION_SETTINGS_PROTOCOL_LABEL, 'Image protocol')
  assert.equal(mod.IMAGE_GENERATION_SETTINGS_PROTOCOL_OPENAI, 'OpenAI Images')
  assert.equal(mod.IMAGE_GENERATION_SETTINGS_PROTOCOL_MINIMAX, 'MiniMax image_generation')
  assert.equal(mod.IMAGE_GENERATION_SETTINGS_MODEL_LABEL, 'Image model')
  assert.equal(
    mod.IMAGE_GENERATION_SETTINGS_MODEL_QUALITY_HINT,
    'For production design drafts and infographics, prefer GPT Image or Gemini image models. Current domestic image models are still inconsistent at layout and text-heavy work, and may not meet directly usable quality standards.',
  )
  assert.equal(mod.IMAGE_GENERATION_SETTINGS_DEFAULT_SIZE_LABEL, 'Default size')
  assert.equal(mod.IMAGE_GENERATION_SETTINGS_TIMEOUT_LABEL, 'Timeout (ms)')
})

test('image generation settings section formatter helpers match Kun locale templates', () => {
  assert.equal(
    mod.formatImageGenerationSettingsProviderMissingKey('OpenAI'),
    'OpenAI has no API key yet. Add it in Providers.',
  )
  assert.equal(
    mod.formatImageGenerationSettingsModelSelectDefaultOption('gpt-image-1'),
    'Default (gpt-image-1)',
  )
  assert.equal(mod.formatImageGenerationSettingsModelSelectDefaultOption(''), 'Default')
  assert.equal(
    mod.resolveImageGenerationSettingsProtocolLabel('minimax-image'),
    'MiniMax image_generation',
  )
  assert.equal(
    mod.resolveImageGenerationSettingsProtocolLabel('openai-images'),
    'OpenAI Images',
  )
})

test('image generation settings section exports expected constant count', () => {
  const constants = Object.keys(mod).filter((key) => key.startsWith('IMAGE_GENERATION_SETTINGS_'))
  assert.equal(constants.length, 23)
})
