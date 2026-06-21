import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-placeholder-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerPlaceholder.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  COMPOSER_DEFAULT_PLACEHOLDER,
  COMPOSER_GOAL_MODE_PLACEHOLDER,
  COMPOSER_PLAN_MODE_PLACEHOLDER,
  COMPOSER_STARTS_THREAD_PLACEHOLDER,
  resolveComposerPlaceholder,
  resolveComposerPlaceholderPreview,
} = await import(out)

test('composer placeholder copy matches Kun English locale strings', () => {
  assert.equal(COMPOSER_DEFAULT_PLACEHOLDER, 'Ask the agent…')
  assert.equal(
    COMPOSER_STARTS_THREAD_PLACEHOLDER,
    'Type and send to automatically create a thread…',
  )
  assert.equal(
    COMPOSER_PLAN_MODE_PLACEHOLDER,
    'Break the goal down, outline steps, and scope changes before execution…',
  )
  assert.equal(COMPOSER_GOAL_MODE_PLACEHOLDER, 'Type a goal for this thread')
})

test('resolveComposerPlaceholderPreview routes default, startsThread, plan, and goal modes', () => {
  assert.equal(resolveComposerPlaceholderPreview('default'), COMPOSER_DEFAULT_PLACEHOLDER)
  assert.equal(
    resolveComposerPlaceholderPreview('startsThread'),
    COMPOSER_STARTS_THREAD_PLACEHOLDER,
  )
  assert.equal(resolveComposerPlaceholderPreview('plan'), COMPOSER_PLAN_MODE_PLACEHOLDER)
  assert.equal(resolveComposerPlaceholderPreview('goal'), COMPOSER_GOAL_MODE_PLACEHOLDER)
})

test('resolveComposerPlaceholder mirrors Kun FloatingComposer placeholder priority', () => {
  assert.equal(
    resolveComposerPlaceholder({ goalPanelOpen: true }),
    COMPOSER_GOAL_MODE_PLACEHOLDER,
  )
  assert.equal(
    resolveComposerPlaceholder({ goalPanelOpen: true, busy: true }),
    COMPOSER_GOAL_MODE_PLACEHOLDER,
  )
  assert.match(resolveComposerPlaceholder({ busy: true }), /Keep typing/)
  assert.equal(
    resolveComposerPlaceholder({ planMode: true }),
    COMPOSER_PLAN_MODE_PLACEHOLDER,
  )
  assert.equal(
    resolveComposerPlaceholder({ startsThread: true }),
    COMPOSER_STARTS_THREAD_PLACEHOLDER,
  )
  assert.equal(resolveComposerPlaceholder({}), COMPOSER_DEFAULT_PLACEHOLDER)
})
