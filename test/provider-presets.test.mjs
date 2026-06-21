// Guards plan §F5 / M2: every model id shipped in a *catalog* preset must
// actually exist under that provider in pi-ai's generated catalog. If pi-ai
// renames or drops a model, this fails loudly instead of silently registering a
// bogus specifier. (The OpenAI preset is excluded: its pinned dated snapshot is
// deliberately not in the catalog — that's why navi supplies its window.)

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'
import { buildSync } from 'esbuild'

const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const outfile = join(ROOT, 'node_modules', '.provider-presets-test.cjs')
buildSync({
  entryPoints: [join(ROOT, 'src', 'shared', 'provider-presets.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile,
})
const { PROVIDER_PRESETS } = require(outfile)

const CATALOG_SRC = readFileSync(
  join(ROOT, 'node_modules', '@earendil-works', 'pi-ai', 'dist', 'models.generated.js'),
  'utf8',
)

// Extract one provider's block by brace-matching from `"<id>": {`, skipping
// braces that appear inside string literals.
function providerBlock(src, id) {
  const marker = `"${id}": {`
  const start = src.indexOf(marker)
  if (start < 0) return null
  let i = start + marker.length - 1 // at the opening brace
  let depth = 0
  let quote = null
  for (; i < src.length; i++) {
    const ch = src[i]
    if (quote) {
      if (ch === '\\') i++ // skip escaped char
      else if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'") quote = ch
    else if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return src.slice(start, i + 1)
    }
  }
  return null
}

test('catalog presets only ship model ids that exist in the pi-ai catalog', () => {
  for (const preset of PROVIDER_PRESETS) {
    if (!preset.catalog || preset.id === 'openai') continue
    const block = providerBlock(CATALOG_SRC, preset.id)
    assert.ok(block, `catalog provider "${preset.id}" must exist in models.generated.js`)
    for (const model of preset.defaultModels) {
      assert.ok(
        block.includes(`"${model.id}":`),
        `model "${model.id}" must exist under provider "${preset.id}" in the catalog`,
      )
    }
  }
})

test('the z.ai general preset overrides the base URL away from the coding-plan path', () => {
  const zai = PROVIDER_PRESETS.find((p) => p.id === 'zai')
  assert.ok(zai, 'zai preset present')
  assert.equal(zai.defaultBaseUrl, 'https://api.z.ai/api/paas/v4')
  // The catalog default for `zai` is the coding path; confirm we are NOT shipping it.
  assert.notEqual(zai.defaultBaseUrl, 'https://api.z.ai/api/coding/paas/v4')
})

test('the OpenAI preset pins the dated snapshot with an explicit context window', () => {
  const openai = PROVIDER_PRESETS.find((p) => p.id === 'openai')
  assert.ok(openai)
  assert.equal(openai.api, 'openai-completions') // forces Chat Completions over Responses (§F3)
  const pinned = openai.defaultModels[0]
  assert.ok(pinned.contextWindow && pinned.maxTokens, 'pinned snapshot supplies its own budget')
})
