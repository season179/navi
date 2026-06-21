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

/** Kun locale: composerOpenChanges — "Preview". */
export const COMPOSER_OPEN_CHANGES_LABEL = 'Preview'

/** Kun locale: composerReviewChanges — "Review". */
export const COMPOSER_REVIEW_CHANGES_LABEL = 'Review'

export type ComposerChangeSummaryPreview = {
  files: ComposerChangedFile[]
  stats: ComposerChangedFileStats
  /** When true, shows the Preview action button like Kun when onOpenChanges is wired. */
  showOpenChanges: boolean
  /** When true, shows the Review action button like Kun when onReviewChanges is wired. */
  showReviewChanges: boolean
  /** When true, disables the Review button like Kun's reviewChangesDisabled. */
  reviewChangesDisabled: boolean
}

/** Mock changed files for ?composerChangeSummaryPreview visual verification. */
export const COMPOSER_CHANGE_SUMMARY_PREVIEW = {
  files: [
    { path: 'src/renderer/components/FloatingComposer.tsx' },
    { path: 'src/renderer/styles/app.css' },
    { path: 'src/renderer/routes/home.tsx' },
  ] satisfies ComposerChangedFile[],
  stats: { added: 428, removed: 12 } satisfies ComposerChangedFileStats,
  showOpenChanges: true,
  showReviewChanges: true,
  reviewChangesDisabled: false,
} satisfies ComposerChangeSummaryPreview

/** Mock data with more files than the visible limit for overflow preview hooks. */
export const COMPOSER_CHANGE_SUMMARY_OVERFLOW_PREVIEW = {
  ...COMPOSER_CHANGE_SUMMARY_PREVIEW,
  files: [
    ...COMPOSER_CHANGE_SUMMARY_PREVIEW.files,
    { path: 'src/renderer/components/Composer.tsx' },
    { path: 'test/composer-change-summary.test.mjs' },
  ] satisfies ComposerChangedFile[],
} satisfies ComposerChangeSummaryPreview

/** Mock data with the Review button disabled for preview hooks. */
export const COMPOSER_CHANGE_SUMMARY_REVIEW_DISABLED_PREVIEW = {
  ...COMPOSER_CHANGE_SUMMARY_PREVIEW,
  reviewChangesDisabled: true,
} satisfies ComposerChangeSummaryPreview

export function resolveComposerChangeSummaryPreview(
  mode: string | null,
): ComposerChangeSummaryPreview {
  if (mode === 'overflow') return COMPOSER_CHANGE_SUMMARY_OVERFLOW_PREVIEW
  if (mode === 'reviewDisabled') return COMPOSER_CHANGE_SUMMARY_REVIEW_DISABLED_PREVIEW
  return COMPOSER_CHANGE_SUMMARY_PREVIEW
}
