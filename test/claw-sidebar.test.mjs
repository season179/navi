import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.claw-sidebar-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'clawSidebar.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  CLAW_SIDEBAR_IM_LABEL,
  CLAW_SIDEBAR_ADD_IM_LABEL,
  CLAW_SIDEBAR_SETTINGS_LABEL,
  CLAW_SIDEBAR_NO_IM_TITLE,
  CLAW_SIDEBAR_NO_IM_SUB,
  CLAW_SIDEBAR_CLEAR_SESSION_LABEL,
  CLAW_SIDEBAR_IM_DISABLED_LABEL,
} = await import(out)

test('claw sidebar chrome copy matches Kun locale strings', () => {
  assert.equal(CLAW_SIDEBAR_IM_LABEL, 'IM')
  assert.equal(CLAW_SIDEBAR_ADD_IM_LABEL, 'Add IM')
  assert.equal(CLAW_SIDEBAR_SETTINGS_LABEL, 'Phone connection settings')
  assert.equal(CLAW_SIDEBAR_NO_IM_TITLE, 'No IM connection added')
  assert.equal(
    CLAW_SIDEBAR_NO_IM_SUB,
    'Add Feishu/Lark or WeChat and each connection will map directly to one Claw conversation.',
  )
  assert.equal(CLAW_SIDEBAR_CLEAR_SESSION_LABEL, 'Clear current conversation')
  assert.equal(CLAW_SIDEBAR_IM_DISABLED_LABEL, 'This IM is disabled')
})
