import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-primary-action-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerPrimaryAction.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  COMPOSER_SEND_LABEL,
  COMPOSER_SLASH_COMMAND_APPLY_LABEL,
  resolveComposerPrimaryActionState,
  resolveComposerPrimaryActionPreview,
} = await import(out)

test('COMPOSER_SEND_LABEL matches Kun send English copy', () => {
  assert.equal(COMPOSER_SEND_LABEL, 'Send')
})

test('COMPOSER_SLASH_COMMAND_APPLY_LABEL matches Kun slashCommandApply English copy', () => {
  assert.equal(COMPOSER_SLASH_COMMAND_APPLY_LABEL, 'Apply command')
})

test('resolveComposerPrimaryActionState returns Send when idle with draft', () => {
  assert.deepEqual(
    resolveComposerPrimaryActionState({ canSend: true }),
    { label: 'Send', disabled: false },
  )
})

test('resolveComposerPrimaryActionState returns Queue message when busy', () => {
  assert.deepEqual(
    resolveComposerPrimaryActionState({ busy: true, canSend: true }),
    { label: 'Queue message', disabled: false },
  )
})

test('resolveComposerPrimaryActionState returns Apply command when slash menu is open', () => {
  assert.deepEqual(
    resolveComposerPrimaryActionState({ slashMenuOpen: true }),
    { label: 'Apply command', disabled: false },
  )
})

test('resolveComposerPrimaryActionState returns Set as goal when goal panel has draft', () => {
  assert.deepEqual(
    resolveComposerPrimaryActionState({
      goalPanelOpen: true,
      goalPanelDraftObjective: 'Ship the goal UX',
    }),
    { label: 'Set as goal', disabled: false },
  )
})

test('slash menu takes priority over goal panel draft', () => {
  assert.deepEqual(
    resolveComposerPrimaryActionState({
      slashMenuOpen: true,
      goalPanelOpen: true,
      goalPanelDraftObjective: 'Ship the goal UX',
    }),
    { label: 'Apply command', disabled: false },
  )
})

test('resolveComposerPrimaryActionPreview routes preview modes', () => {
  assert.equal(resolveComposerPrimaryActionPreview('send').label, 'Send')
  assert.equal(resolveComposerPrimaryActionPreview('queue').label, 'Queue message')
  assert.equal(resolveComposerPrimaryActionPreview('slashApply').label, 'Apply command')
  assert.equal(resolveComposerPrimaryActionPreview('goalSet').label, 'Set as goal')
})
