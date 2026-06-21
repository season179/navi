import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.composer-slash-commands-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'composerSlashCommands.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  filterSkillSlashCommands,
  COMPOSER_SLASH_COMMAND_MENU_TITLE,
  COMPOSER_SLASH_COMMANDS_PREVIEW,
  COMPOSER_SLASH_COMMANDS_PREVIEW_DRAFT,
  resolveComposerSlashCommandsPreview,
} = await import(out)

const skills = [
  {
    name: 'release-notes',
    description: 'Draft release notes from recent commits',
    source: 'built-in',
    availableNow: true,
    canToggle: false,
  },
  {
    name: 'code-review',
    description: 'Review code changes in the workspace',
    source: 'project',
    availableNow: true,
    canToggle: false,
  },
  {
    name: 'global-helper',
    description: 'A disabled global skill',
    source: 'global',
    availableNow: false,
    canToggle: true,
  },
]

test('filterSkillSlashCommands returns available skills with Kun slash-menu fields', () => {
  const rows = filterSkillSlashCommands(skills, '')
  assert.equal(rows.length, 2)
  assert.deepEqual(rows[0], {
    id: 'skill:release-notes',
    skillName: 'release-notes',
    title: 'release-notes',
    description: 'Draft release notes from recent commits',
    badge: '/skill:release-notes',
    scopeLabel: 'Built-in',
    disabled: false,
  })
})

test('filterSkillSlashCommands prefers name prefix matches', () => {
  const rows = filterSkillSlashCommands(skills, 'code')
  assert.equal(rows.length, 1)
  assert.equal(rows[0].skillName, 'code-review')
  assert.equal(rows[0].scopeLabel, 'Project')
})

test('slash command menu title matches Kun slashCommandMenuTitle locale string', () => {
  assert.equal(COMPOSER_SLASH_COMMAND_MENU_TITLE, 'Commands')
})

test('COMPOSER_SLASH_COMMANDS_PREVIEW matches Kun slash-command row copy', () => {
  assert.equal(COMPOSER_SLASH_COMMANDS_PREVIEW.length, 6)
  assert.equal(COMPOSER_SLASH_COMMANDS_PREVIEW[0].title, 'New session')
  assert.equal(COMPOSER_SLASH_COMMANDS_PREVIEW[0].badge, '/new')
  assert.equal(COMPOSER_SLASH_COMMANDS_PREVIEW[1].title, 'Deep research')
  assert.equal(COMPOSER_SLASH_COMMANDS_PREVIEW[3].title, 'Code review')
})

test('resolveComposerSlashCommandsPreview returns slash-menu draft and commands', () => {
  const preview = resolveComposerSlashCommandsPreview('1')
  assert.equal(preview.draft, COMPOSER_SLASH_COMMANDS_PREVIEW_DRAFT)
  assert.deepEqual(preview.commands, COMPOSER_SLASH_COMMANDS_PREVIEW)
})
