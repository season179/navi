// The heavy half of code highlighting, isolated into its own esbuild chunk.
// `build:renderer` runs with `--splitting --format=esm`, so everything reachable
// only from here — shiki/core, the JavaScript regex engine, the github-light
// theme, and the 21 statically imported grammars (~1.8 MB) — is emitted as a
// separate chunk instead of being inlined into the initial renderer bundle.
// `code-highlighting.ts` pulls this in via `import('./code-highlighting-lazy')`
// the first time a real code block is highlighted; until then it never loads,
// and the synchronous escaped-HTML fallback covers the UI.

import { createHighlighterCore, type HighlighterCore, type ThemeRegistration } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

import githubLight from 'shiki/themes/github-light.mjs'

import langBash from 'shiki/langs/bash.mjs'
import langC from 'shiki/langs/c.mjs'
import langCpp from 'shiki/langs/cpp.mjs'
import langCss from 'shiki/langs/css.mjs'
import langDiff from 'shiki/langs/diff.mjs'
import langGo from 'shiki/langs/go.mjs'
import langHtml from 'shiki/langs/html.mjs'
import langJava from 'shiki/langs/java.mjs'
import langJs from 'shiki/langs/javascript.mjs'
import langJsx from 'shiki/langs/jsx.mjs'
import langJson from 'shiki/langs/json.mjs'
import langJsonc from 'shiki/langs/jsonc.mjs'
import langMarkdown from 'shiki/langs/markdown.mjs'
import langPython from 'shiki/langs/python.mjs'
import langRust from 'shiki/langs/rust.mjs'
import langScss from 'shiki/langs/scss.mjs'
import langSql from 'shiki/langs/sql.mjs'
import langToml from 'shiki/langs/toml.mjs'
import langTs from 'shiki/langs/typescript.mjs'
import langTsx from 'shiki/langs/tsx.mjs'
import langYaml from 'shiki/langs/yaml.mjs'

// Custom dark theme — Kun's "Codex" palette, kept verbatim so navi's code
// blocks read identically in dark mode.
const CODEX_CODE_THEME = {
  name: 'codex',
  displayName: 'Codex',
  type: 'dark',
  fg: '#ffffff',
  bg: '#181818',
  colors: {
    'editor.background': '#181818',
    'editor.foreground': '#ffffff',
    'editor.selectionBackground': '#6fb0e844',
    'editor.inactiveSelectionBackground': '#6fb0e822',
    'editor.lineHighlightBackground': '#ffffff08',
    'editorCursor.foreground': '#ffffff',
  },
  settings: [
    { settings: { foreground: '#ffffff', background: '#181818' } },
    {
      scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
      settings: { foreground: '#858585', fontStyle: 'italic' },
    },
    {
      scope: ['keyword', 'storage', 'storage.type', 'storage.modifier'],
      settings: { foreground: '#fa423e' },
    },
    { scope: ['string', 'punctuation.definition.string'], settings: { foreground: '#40c977' } },
    {
      scope: ['constant', 'constant.numeric', 'variable.language', 'support.constant'],
      settings: { foreground: '#7bbcff' },
    },
    {
      scope: [
        'entity.name.function',
        'support.function',
        'meta.function-call',
        'entity.name.type',
        'entity.other.inherited-class',
      ],
      settings: { foreground: '#ad7bf9' },
    },
    {
      scope: [
        'variable.parameter',
        'variable.other',
        'meta.property-name',
        'support.type.property-name',
      ],
      settings: { foreground: '#c7c7c7' },
    },
    { scope: ['entity.name.tag', 'entity.other.attribute-name'], settings: { foreground: '#6fb0e8' } },
    { scope: ['punctuation', 'meta.brace'], settings: { foreground: '#c7c7c7' } },
    {
      scope: ['markup.inserted', 'meta.diff.header.to-file', 'punctuation.definition.inserted'],
      settings: { foreground: '#40c977', background: '#173222' },
    },
    {
      scope: ['markup.deleted', 'meta.diff.header.from-file', 'punctuation.definition.deleted'],
      settings: { foreground: '#fa423e', background: '#351b1b' },
    },
    {
      scope: ['markup.changed', 'punctuation.definition.changed', 'meta.diff.range'],
      settings: { foreground: '#6fb0e8' },
    },
  ],
} satisfies ThemeRegistration

// Build the fine-grained highlighter from shiki/core with the curated grammar
// set and the JS regex engine (no oniguruma WASM asset for esbuild to resolve).
// The JS engine's `forgiving` mode keeps partial/streamed code from throwing on
// half-formed grammar constructs.
export function createNaviHighlighter(): Promise<HighlighterCore> {
  return createHighlighterCore({
    themes: [githubLight, CODEX_CODE_THEME],
    langs: [
      langBash,
      langC,
      langCpp,
      langCss,
      langDiff,
      langGo,
      langHtml,
      langJava,
      langJs,
      langJsx,
      langJson,
      langJsonc,
      langMarkdown,
      langPython,
      langRust,
      langScss,
      langSql,
      langToml,
      langTs,
      langTsx,
      langYaml,
    ],
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  })
}
