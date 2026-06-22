import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.agents-settings-section-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'agentsSettingsSection.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const mod = await import(out)

test('agents settings section copy matches Kun locale strings for corrected mismatches', () => {
  assert.equal(mod.AGENTS_SETTINGS_MODEL_SELECT_CUSTOM_OPTION, "Custom…")
  assert.equal(mod.AGENTS_SETTINGS_MODEL_SELECT_CUSTOM_PLACEHOLDER, "Enter a model id")
  assert.equal(mod.AGENTS_SETTINGS_PORT, "Local service port")
  assert.equal(mod.AGENTS_SETTINGS_RUNTIME_TOKEN_DESC, "Protects the assistant service running on this computer. Fill this only if another local program needs to connect to it.")
  assert.equal(mod.AGENTS_SETTINGS_SHOW_SECRET, "Show value")
  assert.equal(mod.AGENTS_SETTINGS_HIDE_SECRET, "Hide value")
  assert.equal(mod.AGENTS_SETTINGS_CONFIG_FILE_PATH, "External tool config path")
  assert.equal(mod.AGENTS_SETTINGS_DESIGN_QUALITY_HINT, "After the agent writes or edits a frontend file (HTML/CSS/JSX/TSX/SVG), Kun automatically scans for AI-generated design tells and craft issues (purple-blue gradients, cream default backgrounds, bounce easing, nested cards, contrast, line length, missing reduced-motion, etc.) and folds the findings back to the model so it self-corrects on the next turn.")
  assert.equal(mod.AGENTS_SETTINGS_SKILLS_DETECTED_DIRS_DESC, "Auto-detected .agents / .claude / .codex / skills folders (workspace + global) plus your extra folders below. Toggle which ones load; duplicate skill ids are de-duplicated with earlier rows winning.")
  assert.equal(mod.AGENTS_SETTINGS_COMPUTER_USE_PERMISSION_GRANTED, "granted")
  assert.equal(mod.AGENTS_SETTINGS_COMPUTER_USE_PERMISSION_DENIED, "not granted")
})

test('agents settings section formatters match Kun templates', () => {
  assert.equal(mod.formatAgentsSettingsModelSelectDefaultSuffix('gpt-4'), 'gpt-4 (default)')
  assert.equal(mod.formatAgentsSettingsTokenEconomySavings('1,234'), 'Saved about 1,234 tokens')
  assert.equal(mod.formatAgentsSettingsSkillsDirSkillCount(3), '3 skills')
})

test('agents settings section exports expected constant count', () => {
  const constants = Object.keys(mod).filter((key) => key.startsWith('AGENTS_SETTINGS_'))
  assert.equal(constants.length, 200)
})
