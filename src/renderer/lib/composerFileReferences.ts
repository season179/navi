// Kun composer @-mention helpers (../Kun/src/renderer/src/lib/composer-file-references.ts).
// Visual only in navi — used to detect @ triggers and filter file suggestions for
// ComposerFileMentionMenu.

export type ComposerFileReferenceKind = 'file' | 'directory'

export type ComposerFileReference = {
  path: string
  relativePath: string
  name: string
  type?: ComposerFileReferenceKind
}

export type ComposerFileMention = {
  start: number
  end: number
  query: string
  quoted: boolean
}

const FILE_MENTION_BOUNDARY = /(^|[\s([{，。；：、])@([^\s@"']*)$/u
const QUOTED_FILE_MENTION_BOUNDARY = /(^|[\s([{，。；：、])@"([^"\n\r]*)$/u
const TOKEN_SPECIAL_CHARS = /[\s"']/u

function normalizeSlashes(value: string): string {
  return value.trim().replaceAll('\\', '/').replace(/\/+/g, '/')
}

function trimTrailingSlash(value: string): string {
  return normalizeSlashes(value).replace(/\/+$/g, '')
}

function normalizeForCompare(value: string): string {
  return trimTrailingSlash(value).toLowerCase()
}

export function composerFileReferenceKey(reference: Pick<ComposerFileReference, 'relativePath'>): string {
  return normalizeForCompare(reference.relativePath)
}

export function isComposerDirectoryReference(
  reference: Pick<ComposerFileReference, 'type'>,
): boolean {
  return reference.type === 'directory'
}

export function formatComposerFileMentionToken(relativePath: string, isDirectory = false): string {
  const base = normalizeSlashes(relativePath)
  const path = isDirectory ? `${trimTrailingSlash(base)}/` : base
  if (!TOKEN_SPECIAL_CHARS.test(path)) return `@${path}`
  return `@"${path.replaceAll('"', '\\"')}"`
}

export function getFileMentionAtCursor(input: string, cursor: number): ComposerFileMention | null {
  const boundedCursor = Math.max(0, Math.min(cursor, input.length))
  const beforeCursor = input.slice(0, boundedCursor)
  const quoted = QUOTED_FILE_MENTION_BOUNDARY.exec(beforeCursor)
  if (quoted) {
    const query = quoted[2] ?? ''
    const start = boundedCursor - query.length - 2
    return { start, end: boundedCursor, query, quoted: true }
  }

  const plain = FILE_MENTION_BOUNDARY.exec(beforeCursor)
  if (!plain) return null
  const query = plain[2] ?? ''
  const start = boundedCursor - query.length - 1
  return { start, end: boundedCursor, query, quoted: false }
}

export function replaceFileMentionInInput(
  input: string,
  mention: ComposerFileMention,
  reference: Pick<ComposerFileReference, 'relativePath' | 'type'>,
): { input: string; cursor: number } {
  const token = formatComposerFileMentionToken(
    reference.relativePath,
    isComposerDirectoryReference(reference),
  )
  const replacement = `${token}${input[mention.end] && /\s/u.test(input[mention.end] ?? '') ? '' : ' '}`
  const nextInput = `${input.slice(0, mention.start)}${replacement}${input.slice(mention.end)}`
  return {
    input: nextInput,
    cursor: mention.start + replacement.length,
  }
}

function scoreFileSuggestion(reference: ComposerFileReference, query: string): number {
  const normalizedQuery = normalizeForCompare(query)
  if (!normalizedQuery) return 1
  const name = reference.name.toLowerCase()
  const relativePath = normalizeSlashes(reference.relativePath).toLowerCase()
  if (name === normalizedQuery) return 100
  if (relativePath === normalizedQuery) return 95
  if (name.startsWith(normalizedQuery)) return 80
  if (relativePath.startsWith(normalizedQuery)) return 70
  if (relativePath.includes(`/${normalizedQuery}`)) return 55
  if (name.includes(normalizedQuery)) return 40
  if (relativePath.includes(normalizedQuery)) return 25
  const queryParts = normalizedQuery.split(/[/\s._-]+/u).filter(Boolean)
  if (queryParts.length > 1 && queryParts.every((part) => relativePath.includes(part))) return 15
  return 0
}

function directoryRank(reference: ComposerFileReference): number {
  return reference.type === 'directory' ? 0 : 1
}

export function filterWorkspaceFileMentionSuggestions(
  files: ComposerFileReference[],
  query: string,
  selected: ComposerFileReference[] = [],
  limit = 20,
): ComposerFileReference[] {
  const selectedKeys = new Set(selected.map(composerFileReferenceKey))
  const wantsDirectory = /\/\s*$/u.test(query)
  return files
    .map((file) => {
      let score = scoreFileSuggestion(file, query)
      if (score > 0 && wantsDirectory && file.type === 'directory') score += 5
      return { file, score }
    })
    .filter((entry) => entry.score > 0 && !selectedKeys.has(composerFileReferenceKey(entry.file)))
    .sort(
      (left, right) =>
        right.score - left.score ||
        (wantsDirectory ? directoryRank(left.file) - directoryRank(right.file) : 0) ||
        left.file.relativePath.length - right.file.relativePath.length ||
        left.file.relativePath.localeCompare(right.file.relativePath),
    )
    .slice(0, limit)
    .map((entry) => entry.file)
}

/** Chip row item for Kun's composer file-reference strip above the textarea. */
export type ComposerFileReferenceChip = {
  relativePath: string
  isDirectory?: boolean
}

/** Mock file references for ?composerFileReferencesPreview visual verification. */
export const COMPOSER_FILE_REFERENCES_PREVIEW: ComposerFileReferenceChip[] = [
  { relativePath: 'src/renderer/components/Composer.tsx' },
  { relativePath: 'src/renderer/components', isDirectory: true },
]

/** English copy matching Kun's composerFileMentionMenuTitle locale string. */
export const COMPOSER_FILE_MENTION_MENU_TITLE = 'Files & folders'

/** English copy matching Kun's composerFileMentionLoading locale string. */
export const COMPOSER_FILE_MENTION_LOADING = 'Loading files…'

/** English copy matching Kun's composerFileMentionEmpty locale string. */
export const COMPOSER_FILE_MENTION_EMPTY = 'No files or folders found.'

export type ComposerFileMentionPreviewMode = 'default' | 'loading' | 'empty'

export type ComposerFileMentionPreviewState = {
  candidates: ComposerFileReference[]
  loading: boolean
  draft: string
}

/** Routes ?composerFileMentionPreview=1|loading|empty production preview hooks. */
export function resolveComposerFileMentionPreview(
  mode: string | null = 'default',
): ComposerFileMentionPreviewState {
  if (mode === 'loading') {
    return {
      candidates: [],
      loading: true,
      draft: 'Please review @src/ren',
    }
  }
  if (mode === 'empty') {
    return {
      candidates: COMPOSER_FILE_MENTION_PREVIEW,
      loading: false,
      draft: 'Please review @zzz-no-match',
    }
  }
  return {
    candidates: COMPOSER_FILE_MENTION_PREVIEW,
    loading: false,
    draft: 'Please review @src/ren',
  }
}

/** Mock workspace files for ?composerFileMentionPreview visual verification. */
export const COMPOSER_FILE_MENTION_PREVIEW: ComposerFileReference[] = [
  {
    path: '/repo/src/renderer/components/FloatingComposer.tsx',
    relativePath: 'src/renderer/components/FloatingComposer.tsx',
    name: 'FloatingComposer.tsx',
  },
  {
    path: '/repo/src/renderer/styles/app.css',
    relativePath: 'src/renderer/styles/app.css',
    name: 'app.css',
  },
  {
    path: '/repo/src/renderer/routes',
    relativePath: 'src/renderer/routes',
    name: 'routes',
    type: 'directory',
  },
]
