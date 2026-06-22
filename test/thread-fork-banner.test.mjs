import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.thread-fork-banner-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'threadForkBanner.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  THREAD_FORK_BANNER_TITLE,
  THREAD_FORK_BANNER_SUB_TEMPLATE,
  THREAD_FORK_BANNER_SUB_UNKNOWN,
  THREAD_FORK_POINT_LABEL,
  THREAD_FORK_POINT_FROM_TEMPLATE,
  formatThreadForkBannerSubtitle,
  resolveThreadForkPointLabel,
} = await import(out)

test('thread fork banner chrome copy matches Kun locale strings', () => {
  assert.equal(THREAD_FORK_BANNER_TITLE, 'Forked conversation')
  assert.equal(
    THREAD_FORK_BANNER_SUB_TEMPLATE,
    'Continues from {{title}}. Earlier messages are inherited; new turns stay in this branch.',
  )
  assert.equal(
    THREAD_FORK_BANNER_SUB_UNKNOWN,
    'Earlier messages are inherited; new turns stay in this branch.',
  )
  assert.equal(THREAD_FORK_POINT_LABEL, 'Branch starts here')
  assert.equal(THREAD_FORK_POINT_FROM_TEMPLATE, 'Branch from {{title}} starts here')
})

test('thread fork banner subtitle resolution matches Kun behavior', () => {
  assert.equal(
    formatThreadForkBannerSubtitle(undefined),
    'Earlier messages are inherited; new turns stay in this branch.',
  )
  assert.equal(formatThreadForkBannerSubtitle('   '), formatThreadForkBannerSubtitle(undefined))
  assert.equal(
    formatThreadForkBannerSubtitle('Deploy auth middleware refactor'),
    'Continues from Deploy auth middleware refactor. Earlier messages are inherited; new turns stay in this branch.',
  )
})

test('thread fork point label resolution matches Kun behavior', () => {
  assert.equal(resolveThreadForkPointLabel(undefined), 'Branch starts here')
  assert.equal(resolveThreadForkPointLabel('   '), 'Branch starts here')
  assert.equal(
    resolveThreadForkPointLabel('Deploy auth middleware refactor'),
    'Branch from Deploy auth middleware refactor starts here',
  )
})
