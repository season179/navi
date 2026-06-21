// Locks the ported URL normalizer (§F6). The probe builds its /models URL with
// this, so drift here silently 404s "Fetch models". Catalog facts under test:
//   - DeepSeek needs /v1/models (a naive ${base}/models 404s).
//   - z.ai's /v4 bases must be preserved (NOT get a spurious /v1 — a known bug).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { buildSync } from 'esbuild'

const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const outfile = join(ROOT, 'node_modules', '.openai-compat-url-test.cjs')
buildSync({
  entryPoints: [join(ROOT, 'src', 'shared', 'openai-compat-url.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile,
})
const { upstreamOpenAiModelsUrl } = require(outfile)

test('DeepSeek base gets /v1 inserted', () => {
  assert.equal(upstreamOpenAiModelsUrl('https://api.deepseek.com'), 'https://api.deepseek.com/v1/models')
  assert.equal(upstreamOpenAiModelsUrl('https://api.deepseek.com/'), 'https://api.deepseek.com/v1/models')
})

test('a /beta base normalizes to /v1/models', () => {
  assert.equal(upstreamOpenAiModelsUrl('https://api.deepseek.com/beta'), 'https://api.deepseek.com/v1/models')
})

test('z.ai /v4 bases are preserved — no spurious /v1 (known 404 bug)', () => {
  assert.equal(
    upstreamOpenAiModelsUrl('https://api.z.ai/api/paas/v4'),
    'https://api.z.ai/api/paas/v4/models',
  )
  assert.equal(
    upstreamOpenAiModelsUrl('https://api.z.ai/api/coding/paas/v4'),
    'https://api.z.ai/api/coding/paas/v4/models',
  )
})

test('an explicit /v1 base is left intact', () => {
  assert.equal(upstreamOpenAiModelsUrl('https://api.openai.com/v1'), 'https://api.openai.com/v1/models')
})
