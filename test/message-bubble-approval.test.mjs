import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.message-bubble-approval-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'messageBubbleApproval.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  MESSAGE_BUBBLE_APPROVAL_TITLE,
  MESSAGE_BUBBLE_APPROVAL_TOOL_TEMPLATE,
  MESSAGE_BUBBLE_APPROVAL_PENDING_LABEL,
  MESSAGE_BUBBLE_APPROVAL_ALLOW,
  MESSAGE_BUBBLE_APPROVAL_DENY,
  MESSAGE_BUBBLE_APPROVAL_ALLOWED_LABEL,
  MESSAGE_BUBBLE_APPROVAL_DENIED_LABEL,
  MESSAGE_BUBBLE_APPROVAL_FAILED_LABEL,
  formatMessageBubbleApprovalTool,
  resolveMessageBubbleApprovalStatusLabel,
} = await import(out)

test('message bubble approval chrome copy matches Kun locale strings', () => {
  assert.equal(MESSAGE_BUBBLE_APPROVAL_TITLE, 'Approval required')
  assert.equal(MESSAGE_BUBBLE_APPROVAL_TOOL_TEMPLATE, 'Tool: {{name}}')
  assert.equal(MESSAGE_BUBBLE_APPROVAL_PENDING_LABEL, 'Waiting for your decision…')
  assert.equal(MESSAGE_BUBBLE_APPROVAL_ALLOW, 'Allow')
  assert.equal(MESSAGE_BUBBLE_APPROVAL_DENY, 'Deny')
  assert.equal(MESSAGE_BUBBLE_APPROVAL_ALLOWED_LABEL, 'Allowed')
  assert.equal(MESSAGE_BUBBLE_APPROVAL_DENIED_LABEL, 'Denied')
  assert.equal(MESSAGE_BUBBLE_APPROVAL_FAILED_LABEL, 'Request failed')
})

test('message bubble approval formatters match Kun behavior', () => {
  assert.equal(formatMessageBubbleApprovalTool('run_terminal_cmd'), 'Tool: run_terminal_cmd')
  assert.equal(resolveMessageBubbleApprovalStatusLabel('pending'), 'Waiting for your decision…')
  assert.equal(resolveMessageBubbleApprovalStatusLabel('allowed'), 'Allowed')
  assert.equal(resolveMessageBubbleApprovalStatusLabel('denied'), 'Denied')
  assert.equal(resolveMessageBubbleApprovalStatusLabel('error'), 'Request failed')
})
