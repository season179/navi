/** Changed file row for Kun's composer change-summary card. */
export type ComposerChangedFile = {
  path: string
}

export type ComposerChangedFileStats = {
  added: number
  removed: number
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
