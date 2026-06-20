// Syntax highlighting for assistant code blocks. Adapted from Kun's
// code-highlighting (../kun/src/renderer/src/lib/code-highlighting.ts) for
// navi's esbuild single-bundle setup: instead of `import('shiki')` (which would
// inline 200+ grammars), we build a fine-grained highlighter from shiki/core
// with a curated, statically imported language set and the JavaScript regex
// engine (no oniguruma WASM asset for esbuild to resolve). Dual-theme output
// (light default + dark in --shiki-dark vars) is toggled via [data-theme] CSS.

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

const LANGUAGE_ALIASES: Record<string, string> = {
  csharp: 'cs',
  docker: 'dockerfile',
  javascriptreact: 'jsx',
  plaintext: '',
  shellscript: 'shell',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  text: '',
  typescriptreact: 'tsx',
}

const DOWNLOAD_EXTENSIONS: Record<string, string> = {
  bash: 'sh',
  c: 'c',
  cpp: 'cpp',
  cs: 'cs',
  css: 'css',
  diff: 'diff',
  go: 'go',
  html: 'html',
  java: 'java',
  javascript: 'js',
  js: 'js',
  json: 'json',
  jsonc: 'jsonc',
  jsx: 'jsx',
  markdown: 'md',
  md: 'md',
  py: 'py',
  python: 'py',
  rs: 'rs',
  rust: 'rs',
  scss: 'scss',
  sql: 'sql',
  toml: 'toml',
  ts: 'ts',
  tsx: 'tsx',
  txt: 'txt',
  typescript: 'ts',
  yaml: 'yml',
  yml: 'yml',
}

const MAX_HIGHLIGHT_CHARS = 250_000
export const MAX_HIGHLIGHT_CACHE_ENTRIES = 120

let highlighterPromise: Promise<HighlighterCore> | null = null
const highlightCache = new Map<string, string>()
const inflightHighlights = new Map<string, Promise<string>>()

function loadHighlighter(): Promise<HighlighterCore> {
  highlighterPromise ??= createHighlighterCore({
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
    // The JS engine avoids the oniguruma WASM binary (which esbuild can't
    // resolve from a single bundle); `forgiving` keeps partial/streamed code
    // from throwing on half-formed grammar constructs.
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  })
  return highlighterPromise
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

// Plain, escaped HTML shown instantly while shiki resolves (or as the final
// output for unknown/plain languages and oversized blocks). Matches the
// `.shiki .line` structure the highlighter emits so the CSS lines up.
export function renderFallbackCodeHtml(code: string): string {
  const lines = code.split('\n')
  return `<pre class="shiki shiki-themes"><code>${lines
    .map((line) => `<span class="line">${line ? escapeHtml(line) : ' '}</span>`)
    .join('')}</code></pre>`
}

export function normalizeCodeLanguage(language: string): string {
  const raw = language.trim().toLowerCase()
  return LANGUAGE_ALIASES[raw] ?? raw
}

export function extensionForLanguage(language: string): string {
  const normalized = normalizeCodeLanguage(language)
  if (!normalized) return 'txt'
  return DOWNLOAD_EXTENSIONS[normalized] ?? normalized
}

function highlightCacheKey(code: string, normalized: string): string {
  return `${normalized || 'plain'}\u0000${code}`
}

function readHighlightCache(cacheKey: string): string | undefined {
  const cached = highlightCache.get(cacheKey)
  if (cached === undefined) return undefined
  // Re-insert to keep most-recently-used at the tail (LRU).
  highlightCache.delete(cacheKey)
  highlightCache.set(cacheKey, cached)
  return cached
}

function writeHighlightCache(cacheKey: string, html: string): void {
  highlightCache.delete(cacheKey)
  highlightCache.set(cacheKey, html)
  while (highlightCache.size > MAX_HIGHLIGHT_CACHE_ENTRIES) {
    const oldestKey = highlightCache.keys().next().value
    if (!oldestKey) break
    highlightCache.delete(oldestKey)
  }
}

export async function highlightCodeHtml(code: string, language: string): Promise<string> {
  const normalized = normalizeCodeLanguage(language)
  const cacheKey = highlightCacheKey(code, normalized)

  const cached = readHighlightCache(cacheKey)
  if (cached !== undefined) return cached

  const inflight = inflightHighlights.get(cacheKey)
  if (inflight) return inflight

  const task = (async () => {
    if (!normalized || code.length > MAX_HIGHLIGHT_CHARS) {
      const fallback = renderFallbackCodeHtml(code)
      writeHighlightCache(cacheKey, fallback)
      return fallback
    }

    try {
      const highlighter = await loadHighlighter()
      if (!highlighter.getLoadedLanguages().includes(normalized)) {
        const fallback = renderFallbackCodeHtml(code)
        writeHighlightCache(cacheKey, fallback)
        return fallback
      }
      const html = highlighter.codeToHtml(code, {
        lang: normalized,
        themes: { light: 'github-light', dark: 'codex' },
        defaultColor: 'light',
      })
      writeHighlightCache(cacheKey, html)
      return html
    } catch {
      const fallback = renderFallbackCodeHtml(code)
      writeHighlightCache(cacheKey, fallback)
      return fallback
    }
  })()

  inflightHighlights.set(cacheKey, task)
  try {
    return await task
  } finally {
    inflightHighlights.delete(cacheKey)
  }
}
