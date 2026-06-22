// Kun queued-messages composer chrome
// (../Kun/src/renderer/src/components/chat/FloatingComposerQueuedMessages.tsx).
// Visual only — used for production Composer and preview hooks.

/** English copy matching Kun's queuedMessagesTitle locale string. */
export const QUEUED_MESSAGES_TITLE_TEMPLATE = '{{count}} queued'

/** English copy matching Kun's queuedMessagesHint locale string. */
export const QUEUED_MESSAGES_HINT =
  'These messages will send automatically after the current reply finishes.'

/** English copy matching Kun's queuedMessageRemove locale string. */
export const QUEUED_MESSAGE_REMOVE_LABEL = 'Remove queued message'

export function formatQueuedMessagesTitle(count: number): string {
  return QUEUED_MESSAGES_TITLE_TEMPLATE.replace('{{count}}', String(count))
}
