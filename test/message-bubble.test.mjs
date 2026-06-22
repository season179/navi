import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.message-bubble-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'messageBubble.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const { formatMessageDateTime } = await import(out)

function kunFormatMessageDateTime(input, locale = 'en-US') {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return input
  const now = new Date()
  const sameYear = date.getFullYear() === now.getFullYear()
  return new Intl.DateTimeFormat(locale, {
    ...(sameYear ? {} : { year: 'numeric' }),
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

test('formatMessageDateTime matches Kun MessageBubble timestamp formatting', () => {
  assert.equal(formatMessageDateTime('not-a-date'), 'not-a-date')

  const sameYearIso = `${new Date().getFullYear()}-03-15T15:30:00.000Z`
  assert.equal(
    formatMessageDateTime(sameYearIso, 'en-US'),
    kunFormatMessageDateTime(sameYearIso, 'en-US'),
  )

  const priorYearIso = '2020-06-10T09:05:00.000Z'
  assert.equal(
    formatMessageDateTime(priorYearIso, 'en-US'),
    kunFormatMessageDateTime(priorYearIso, 'en-US'),
  )
  assert.match(formatMessageDateTime(priorYearIso, 'en-US'), /2020/)
})
