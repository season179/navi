/** Session usage snapshot for Kun's composer footer chip. */
export type ComposerThreadUsage = {
  tokens: string
  cost: string
  savings: string
  cache: string
  turns: number
}

/** Mock usage for ?composerThreadUsagePreview visual verification. */
export const COMPOSER_THREAD_USAGE_PREVIEW = {
  tokens: '145k',
  cost: '$0.42',
  savings: '12k saved',
  cache: '68%',
  turns: 8,
} satisfies ComposerThreadUsage
