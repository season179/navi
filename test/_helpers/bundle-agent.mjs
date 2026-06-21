// Shared esbuild helper for tests that bundle .flue/agents/navi-assistant.ts.
//
// The agent imports built-in skills with Flue's `with { type: 'skill' }`
// attribute, which only Flue's own build resolves (it inlines the SKILL.md as a
// packaged skill). Plain esbuild rejects that attribute, so tests that bundle
// the agent for config-resolution checks need to stub those imports.
//
// The stubs emit SkillReference objects with the REAL built-in names — so a
// test asserting `skills` includes `navi-release-notes` sees it. The names
// here are the source of truth for "which built-ins exist" alongside
// BUILT_IN_SKILLS in src/shared/flue.ts and the imports in the agent file; a
// drift across the three surfaces in a dedicated assertion
// (test/global-skills.test.mjs).

import { basename, dirname, join } from 'node:path'
import { build } from 'esbuild'

/**
 * The built-in skill names the stub emits. MUST match the imports in
 * .flue/agents/navi-assistant.ts and BUILT_IN_SKILLS in src/shared/flue.ts.
 */
export const BUILT_IN_STUB_NAMES = ['navi-release-notes', 'navi-commit-message']

const builtInStubPlugin = {
  name: 'navi-built-in-skill-stub',
  setup(build) {
    build.onResolve({ filter: /\/skills\/[^/]+\/SKILL\.md$/ }, (args) => {
      if (args.with?.type !== 'skill' && args.importAttributes?.type !== 'skill') return null
      const name = basename(dirname(args.path))
      return { path: args.path, namespace: 'navi-skill-stub', pluginData: { name } }
    })
    build.onLoad({ filter: /.*/, namespace: 'navi-skill-stub' }, (args) => {
      const name = args.pluginData.name
      const contents = `export default { __flueSkillReference: true, id: "skill:${name}:stub", name: "${name}", description: "stub for test" };`
      return { contents, loader: 'js' }
    })
  },
}

/**
 * Bundle the agent with the skill-import stub applied. Async (esbuild plugins
 * aren't allowed in buildSync). Returns the require()able outfile path.
 */
export async function bundleAgent(root, outfileSlug) {
  const outfile = join(root, 'node_modules', `.${outfileSlug}.cjs`)
  await build({
    entryPoints: [join(root, '.flue', 'agents', 'navi-assistant.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile,
    plugins: [builtInStubPlugin],
    logLevel: 'silent',
  })
  return outfile
}
