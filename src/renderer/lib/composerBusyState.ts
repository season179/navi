/** English copy matching Kun's composerQueuePlaceholder, queueMessage, and interrupt. */
export const COMPOSER_QUEUE_PLACEHOLDER =
  'Keep typing; sends wait and go out after the current reply finishes…'

export const COMPOSER_QUEUE_MESSAGE_LABEL = 'Queue message'

export const COMPOSER_STOP_LABEL = 'Stop'

export function resolveComposerBusyPreview(): { busy: true; placeholder: string } {
  return { busy: true, placeholder: COMPOSER_QUEUE_PLACEHOLDER }
}
