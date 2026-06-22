import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.claw-inbound-message-card-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'clawInboundMessageCard.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  CLAW_INBOUND_DEFAULT_SOURCE,
  CLAW_INBOUND_HEADER_TEMPLATE,
  CLAW_INBOUND_SENDER_TEMPLATE,
  CLAW_INBOUND_CHAT_TYPE_TEMPLATE,
  CLAW_INBOUND_MESSAGE_TYPE_TEMPLATE,
  CLAW_INBOUND_MENTIONS_TEMPLATE,
  formatClawInboundHeader,
  formatClawInboundMetaChips,
} = await import(out)

test('claw inbound message card chrome copy matches Kun locale strings', () => {
  assert.equal(CLAW_INBOUND_DEFAULT_SOURCE, 'Connect phone')
  assert.equal(CLAW_INBOUND_HEADER_TEMPLATE, 'From {{source}}')
  assert.equal(CLAW_INBOUND_SENDER_TEMPLATE, 'Sender {{sender}}')
  assert.equal(CLAW_INBOUND_CHAT_TYPE_TEMPLATE, '{{chatType}} chat')
  assert.equal(CLAW_INBOUND_MESSAGE_TYPE_TEMPLATE, '{{messageType}} message')
  assert.equal(CLAW_INBOUND_MENTIONS_TEMPLATE, 'Mentions {{mentions}}')
})

test('claw inbound message card formatters match Kun behavior', () => {
  assert.equal(formatClawInboundHeader(undefined), 'From Connect phone')
  assert.equal(formatClawInboundHeader('Telegram'), 'From Telegram')
  assert.deepEqual(
    formatClawInboundMetaChips({
      sender: '@season',
      chatType: 'group',
      messageType: 'text',
      mentions: '@navi',
    }),
    [
      'Sender @season',
      'group chat',
      'text message',
      'Mentions @navi',
    ],
  )
  assert.deepEqual(formatClawInboundMetaChips({}), [])
})
