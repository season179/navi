// The heavy half of code highlighting, split out of the initial renderer bundle.
// `build:renderer` runs with `--splitting --format=esm`, so this module — and,
// crucially, each grammar it import()s on demand — is emitted as its own chunk.
// `code-highlighting.ts` pulls this module in via `import('./code-highlighting-lazy')`
// the first time a real code block is highlighted. The highlighter is built from
// shiki/core + the JavaScript regex engine + the two themes, but with NO grammars
// up front; each grammar then loads lazily through `loadGrammar` the first time a
// block of that language appears. So a Markdown-only conversation never downloads
// the Rust grammar, and no single output chunk is large enough to matter. Until a
// grammar resolves, the synchronous escaped-HTML fallback covers the UI.

import {
  createHighlighterCore,
  type HighlighterCore,
  type LanguageInput,
  type ThemeRegistration,
} from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

import githubLight from 'shiki/themes/github-light.mjs'

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

// One dynamic import() per grammar. esbuild `--splitting` turns each into its own
// chunk (shared grammar deps — e.g. tsx → typescript, html → css/js — are factored
// out into shared chunks automatically), so we only ever download the grammars a
// conversation actually uses. Short aliases ('js', 'ts', …) point at the same
// import() as their canonical id; the duplicate thunks resolve to one shared chunk.
// Keys are the normalized language ids produced by `normalizeCodeLanguage`.
const GRAMMAR_LOADERS: Record<string, () => LanguageInput> = {
  bash: () => import('shiki/langs/bash.mjs'),
  css: () => import('shiki/langs/css.mjs'),
  diff: () => import('shiki/langs/diff.mjs'),
  go: () => import('shiki/langs/go.mjs'),
  html: () => import('shiki/langs/html.mjs'),
  java: () => import('shiki/langs/java.mjs'),
  javascript: () => import('shiki/langs/javascript.mjs'),
  js: () => import('shiki/langs/javascript.mjs'),
  json: () => import('shiki/langs/json.mjs'),
  jsonc: () => import('shiki/langs/jsonc.mjs'),
  jsx: () => import('shiki/langs/jsx.mjs'),
  markdown: () => import('shiki/langs/markdown.mjs'),
  md: () => import('shiki/langs/markdown.mjs'),
  py: () => import('shiki/langs/python.mjs'),
  python: () => import('shiki/langs/python.mjs'),
  rs: () => import('shiki/langs/rust.mjs'),
  rust: () => import('shiki/langs/rust.mjs'),
  scss: () => import('shiki/langs/scss.mjs'),
  sql: () => import('shiki/langs/sql.mjs'),
  toml: () => import('shiki/langs/toml.mjs'),
  ts: () => import('shiki/langs/typescript.mjs'),
  typescript: () => import('shiki/langs/typescript.mjs'),
  tsx: () => import('shiki/langs/tsx.mjs'),
  yaml: () => import('shiki/langs/yaml.mjs'),
  yml: () => import('shiki/langs/yaml.mjs'),
}

// Build the fine-grained highlighter from shiki/core with both themes and the JS
// regex engine (no oniguruma WASM asset for esbuild to resolve), but zero grammars
// — those load on demand via `loadGrammar`. The JS engine's `forgiving` mode keeps
// partial/streamed code from throwing on half-formed grammar constructs.
export function createNaviHighlighter(): Promise<HighlighterCore> {
  return createHighlighterCore({
    themes: [githubLight, CODEX_CODE_THEME],
    langs: [],
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  })
}

// In-flight grammar loads, keyed by normalized language id, so concurrent code
// blocks of the same new language share a single import()/loadLanguage call.
const grammarLoads = new Map<string, Promise<boolean>>()

// Ensure the grammar for `lang` is loaded into `highlighter`. Resolves true once
// it's ready, false for a language we don't ship a grammar for (the caller then
// renders the escaped fallback). A failed load clears the cached promise so a
// later block of the same language can retry, and rejects so the caller falls back.
export function loadGrammar(highlighter: HighlighterCore, lang: string): Promise<boolean> {
  if (highlighter.getLoadedLanguages().includes(lang)) return Promise.resolve(true)

  const loader = GRAMMAR_LOADERS[lang]
  if (!loader) return Promise.resolve(false)

  let load = grammarLoads.get(lang)
  if (!load) {
    load = highlighter
      .loadLanguage(loader())
      .then(() => true)
      .catch((err) => {
        grammarLoads.delete(lang)
        throw err
      })
    grammarLoads.set(lang, load)
  }
  return load
}
