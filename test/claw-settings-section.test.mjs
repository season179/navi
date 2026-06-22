import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.claw-settings-section-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'clawSettingsSection.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const mod = await import(out)

test('claw settings section copy matches Kun locale strings', () => {
  assert.equal(mod.CLAW_SETTINGS_RUNTIME_TITLE, 'Phone connection')
  assert.equal(mod.CLAW_SETTINGS_ENABLED_LABEL, 'Enable phone connection')
  assert.equal(mod.CLAW_SETTINGS_MANAGE_AGENTS_TITLE, 'Connected phone agents')
  assert.equal(
    mod.CLAW_SETTINGS_MANAGE_AGENTS_EMPTY,
    'No phone agent has been connected yet. Use Connect phone to bind Feishu / Lark first.',
  )
  assert.equal(mod.CLAW_SETTINGS_FEISHU_STREAM_LABEL, 'Enable streaming output')
  assert.equal(mod.CLAW_SETTINGS_MODEL_LABEL, 'Model')
})

test('claw settings section formatter helpers match Kun locale templates', () => {
  assert.equal(
    mod.formatClawSettingsDefaultWorkspacePlaceholder('/Users/season/Personal/navi'),
    'Leave empty to inherit: /Users/season/Personal/navi',
  )
  assert.equal(
    mod.formatClawSettingsManageAgentMeta('Feishu / Lark', 'auto', '/tmp/workspace'),
    'Feishu / Lark · auto · /tmp/workspace',
  )
  assert.equal(
    mod.formatClawSettingsWorkspaceInherit('/Users/season/Personal/navi'),
    'Use default workspace: /Users/season/Personal/navi',
  )
})

test('claw settings section agent profile labels match Kun clawManageAgent* keys', () => {
  assert.equal(mod.CLAW_SETTINGS_MANAGE_AGENT_DESCRIPTION_LABEL, 'Short description')
  assert.equal(mod.CLAW_SETTINGS_MANAGE_AGENT_IDENTITY_LABEL, 'Role definition')
  assert.equal(mod.CLAW_SETTINGS_MANAGE_AGENT_PERSONALITY_LABEL, 'Personality')
  assert.equal(mod.CLAW_SETTINGS_MANAGE_AGENT_USER_CONTEXT_LABEL, 'User context')
  assert.equal(mod.CLAW_SETTINGS_MANAGE_AGENT_REPLY_RULES_LABEL, 'Reply rules')
})

test('claw settings section exports expected constant count', () => {
  const constants = Object.keys(mod).filter((key) => key.startsWith('CLAW_SETTINGS_'))
  assert.equal(constants.length, 26)
})
