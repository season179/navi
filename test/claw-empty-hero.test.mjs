import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.claw-empty-hero-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'clawEmptyHero.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  CLAW_EMPTY_HERO_FALLBACK_NAME,
  CLAW_EMPTY_HERO_TITLE_TEMPLATE,
  CLAW_EMPTY_HERO_SUB,
  CLAW_EMPTY_HERO_NEEDS_INBOUND,
  resolveClawEmptyHeroAgentName,
  formatClawEmptyHeroTitle,
  resolveClawEmptyHeroSubtitle,
} = await import(out)

test('claw empty hero copy matches Kun locale strings', () => {
  assert.equal(CLAW_EMPTY_HERO_FALLBACK_NAME, 'this assistant')
  assert.equal(CLAW_EMPTY_HERO_TITLE_TEMPLATE, 'Start a conversation with {{name}}')
  assert.equal(CLAW_EMPTY_HERO_SUB, 'Start chatting.')
  assert.equal(
    CLAW_EMPTY_HERO_NEEDS_INBOUND,
    'Send the first message in Feishu / Lark or WeChat to establish the conversation, then continue locally. Otherwise local messages cannot sync back to the matching channel.',
  )
})

test('claw empty hero title and subtitle resolution matches Kun behavior', () => {
  assert.equal(resolveClawEmptyHeroAgentName(undefined), CLAW_EMPTY_HERO_FALLBACK_NAME)
  assert.equal(resolveClawEmptyHeroAgentName('   '), CLAW_EMPTY_HERO_FALLBACK_NAME)
  assert.equal(resolveClawEmptyHeroAgentName('Navi Phone Agent'), 'Navi Phone Agent')
  assert.equal(
    formatClawEmptyHeroTitle('Navi Phone Agent'),
    'Start a conversation with Navi Phone Agent',
  )
  assert.equal(formatClawEmptyHeroTitle(undefined), 'Start a conversation with this assistant')
  assert.equal(resolveClawEmptyHeroSubtitle(true), CLAW_EMPTY_HERO_SUB)
  assert.equal(resolveClawEmptyHeroSubtitle(false), CLAW_EMPTY_HERO_NEEDS_INBOUND)
})
