import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-execution-picker-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerExecutionPicker.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  APPROVAL_POLICY_LABELS,
  COMPOSER_ACCESS_COMMANDS_HINT,
  COMPOSER_ACCESS_SHORT_LABEL,
  COMPOSER_APPROVAL_SHORT_LABEL,
  COMPOSER_EXECUTION_APPLYING_LABEL,
  COMPOSER_EXECUTION_LABEL,
  EXECUTION_PICKER_PREVIEW,
  SANDBOX_MODE_LABELS,
  approvalPolicyLabel,
  formatComposerExecutionPickerTitle,
  sandboxModeLabel,
} = await import(out)

test('execution picker chrome copy matches Kun locale strings', () => {
  assert.equal(COMPOSER_EXECUTION_LABEL, 'Execution')
  assert.equal(COMPOSER_APPROVAL_SHORT_LABEL, 'Approval')
  assert.equal(COMPOSER_ACCESS_SHORT_LABEL, 'Access')
  assert.equal(
    COMPOSER_ACCESS_COMMANDS_HINT,
    'Only Full access can run terminal commands (bash).',
  )
  assert.equal(COMPOSER_EXECUTION_APPLYING_LABEL, 'Applying…')
})

test('approval and sandbox option labels match Kun locale strings', () => {
  assert.equal(APPROVAL_POLICY_LABELS.auto, 'Auto')
  assert.equal(APPROVAL_POLICY_LABELS['on-request'], 'Ask first')
  assert.equal(APPROVAL_POLICY_LABELS.untrusted, 'Risky only')
  assert.equal(APPROVAL_POLICY_LABELS.suggest, 'Suggest')
  assert.equal(APPROVAL_POLICY_LABELS.never, 'Never')
  assert.equal(SANDBOX_MODE_LABELS['workspace-write'], 'Workspace write')
  assert.equal(SANDBOX_MODE_LABELS['read-only'], 'Read only')
  assert.equal(SANDBOX_MODE_LABELS['danger-full-access'], 'Full access')
  assert.equal(SANDBOX_MODE_LABELS['external-sandbox'], 'External')
})

test('formatComposerExecutionPickerTitle matches Kun trigger title pattern', () => {
  assert.equal(
    formatComposerExecutionPickerTitle('on-request', 'workspace-write'),
    'Approval: Ask first / Access: Workspace write',
  )
  assert.equal(approvalPolicyLabel('auto'), 'Auto')
  assert.equal(sandboxModeLabel('danger-full-access'), 'Full access')
})

test('EXECUTION_PICKER_PREVIEW matches Kun default execution settings', () => {
  assert.equal(EXECUTION_PICKER_PREVIEW.approvalPolicy, 'on-request')
  assert.equal(EXECUTION_PICKER_PREVIEW.sandboxMode, 'workspace-write')
})
