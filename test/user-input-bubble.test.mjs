import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.user-input-bubble-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'userInputBubble.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  USER_INPUT_BUBBLE_TITLE,
  USER_INPUT_BUBBLE_PENDING_LABEL,
  USER_INPUT_BUBBLE_SUBMITTED_LABEL,
  USER_INPUT_BUBBLE_CANCELLED_LABEL,
  USER_INPUT_BUBBLE_FAILED_LABEL,
  USER_INPUT_BUBBLE_QUESTION_PROGRESS_TEMPLATE,
  USER_INPUT_OTHER_LABEL,
  USER_INPUT_FREEFORM_LABEL,
  USER_INPUT_OTHER_DESCRIPTION,
  USER_INPUT_CUSTOM_PLACEHOLDER,
  USER_INPUT_SUBMIT,
  USER_INPUT_CANCEL,
  formatUserInputBubbleQuestionProgress,
  resolveUserInputBubbleStatusLabel,
} = await import(out)

test('user input bubble chrome copy matches Kun locale strings', () => {
  assert.equal(USER_INPUT_BUBBLE_TITLE, 'Input required')
  assert.equal(USER_INPUT_BUBBLE_PENDING_LABEL, 'Waiting for your answer…')
  assert.equal(USER_INPUT_BUBBLE_SUBMITTED_LABEL, 'Submitted')
  assert.equal(USER_INPUT_BUBBLE_CANCELLED_LABEL, 'Cancelled')
  assert.equal(USER_INPUT_BUBBLE_FAILED_LABEL, 'Submit failed')
  assert.equal(
    USER_INPUT_BUBBLE_QUESTION_PROGRESS_TEMPLATE,
    'Question {{current}} / {{total}}',
  )
  assert.equal(USER_INPUT_OTHER_LABEL, 'Other')
  assert.equal(USER_INPUT_FREEFORM_LABEL, 'Answer')
  assert.equal(USER_INPUT_OTHER_DESCRIPTION, 'Type a custom response')
  assert.equal(USER_INPUT_CUSTOM_PLACEHOLDER, 'Type your answer…')
  assert.equal(USER_INPUT_SUBMIT, 'Submit')
  assert.equal(USER_INPUT_CANCEL, 'Cancel')
})

test('user input bubble formatters match Kun behavior', () => {
  assert.equal(formatUserInputBubbleQuestionProgress(1, 3), 'Question 1 / 3')
  assert.equal(resolveUserInputBubbleStatusLabel('pending'), 'Waiting for your answer…')
  assert.equal(resolveUserInputBubbleStatusLabel('submitted'), 'Submitted')
  assert.equal(resolveUserInputBubbleStatusLabel('cancelled'), 'Cancelled')
  assert.equal(resolveUserInputBubbleStatusLabel('error'), 'Submit failed')
})
