// Syntax highlighting for assistant code blocks. The heavy shiki machinery —
// shiki/core, the JavaScript regex engine, and the themes — lives in
// ./code-highlighting-lazy and is pulled in via a dynamic import() the first time
// a real block is highlighted (see loadHighlighter). Each grammar then loads
// lazily and individually (see loadGrammar over there), so we only download the
// languages a conversation actually uses. This module keeps only the lightweight
// plumbing — language aliases, the LRU cache, and the synchronous escaped-HTML
// fallback — so it stays in the initial renderer bundle and code renders instantly
// while the highlighter chunk and the relevant grammar chunk load.
// Adapted from Kun's code-highlighting
// (../kun/src/renderer/src/lib/code-highlighting.ts). Dual-theme output (light
// default + dark in --shiki-dark vars) is toggled via [data-theme] CSS.

import type { HighlighterCore } from 'shiki/core'

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

type CodeHighlightingLazy = typeof import('./code-highlighting-lazy')

let highlighterPromise: Promise<{ mod: CodeHighlightingLazy; highlighter: HighlighterCore }> | null =
  null
const highlightCache = new Map<string, string>()
const inflightHighlights = new Map<string, Promise<string>>()

function loadHighlighter(): Promise<{ mod: CodeHighlightingLazy; highlighter: HighlighterCore }> {
  // Fetch the shiki chunk (engine + themes, no grammars) lazily on first use; the
  // cached promise ensures the chunk loads and the highlighter is built at most
  // once. We hold onto the module too so highlightCodeHtml can call loadGrammar to
  // pull in per-language grammar chunks on demand. A failed chunk load or build
  // rejects here and is caught by highlightCodeHtml, which renders the
  // escaped-HTML fallback instead.
  highlighterPromise ??= import('./code-highlighting-lazy').then(async (mod) => ({
    mod,
    highlighter: await mod.createNaviHighlighter(),
  }))
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
      const { mod, highlighter } = await loadHighlighter()
      const loaded = await mod.loadGrammar(highlighter, normalized)
      if (!loaded) {
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
