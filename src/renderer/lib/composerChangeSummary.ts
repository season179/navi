/** Changed file row for Kun's composer change-summary card. */
export type ComposerChangedFile = {
  path: string
}

export type ComposerChangedFileStats = {
  added: number
  removed: number
}

/** Kun shows at most three file paths before the "+N more" overflow label. */
export const COMPOSER_CHANGE_SUMMARY_VISIBLE_LIMIT = 3

/** Kun locale: composerChangedFilesTitle — "{{count}} files changed". */
export function formatComposerChangedFilesTitle(count: number): string {
  return `${count} files changed`
}

/** Kun locale: composerChangedFilesMore — "+{{count}} more". */
export function formatComposerChangedFilesMore(count: number): string {
  return `+${count} more`
}

/** Mock changed files for ?composerChangeSummaryPreview visual verification. */
export const COMPOSER_CHANGE_SUMMARY_PREVIEW = {
  files: [
    { path: 'src/renderer/components/FloatingComposer.tsx' },
    { path: 'src/renderer/styles/app.css' },
    { path: 'src/renderer/routes/home.tsx' },
  ] satisfies ComposerChangedFile[],
  stats: { added: 428, removed: 12 } satisfies ComposerChangedFileStats,
}

/** Mock data with more files than the visible limit for overflow preview hooks. */
export const COMPOSER_CHANGE_SUMMARY_OVERFLOW_PREVIEW = {
  files: [
    ...COMPOSER_CHANGE_SUMMARY_PREVIEW.files,
    { path: 'src/renderer/components/Composer.tsx' },
    { path: 'test/composer-change-summary.test.mjs' },
  ] satisfies ComposerChangedFile[],
  stats: COMPOSER_CHANGE_SUMMARY_PREVIEW.stats,
}

export function resolveComposerChangeSummaryPreview(
  mode: string | null,
): typeof COMPOSER_CHANGE_SUMMARY_PREVIEW {
  if (mode === 'overflow') return COMPOSER_CHANGE_SUMMARY_OVERFLOW_PREVIEW
  return COMPOSER_CHANGE_SUMMARY_PREVIEW
}
