// Kun ThreadForkBanner and ThreadForkPoint chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-empty.tsx).
// Visual only — used for production ThreadForkBanner/ThreadForkPoint and preview hooks.

/** English copy matching Kun's threadForkBannerTitle locale string. */
export const THREAD_FORK_BANNER_TITLE = 'Forked conversation'

/** English copy matching Kun's threadForkBannerSub locale string. */
export const THREAD_FORK_BANNER_SUB_TEMPLATE =
  'Continues from {{title}}. Earlier messages are inherited; new turns stay in this branch.'

/** English copy matching Kun's threadForkBannerSubUnknown locale string. */
export const THREAD_FORK_BANNER_SUB_UNKNOWN =
  'Earlier messages are inherited; new turns stay in this branch.'

/** English copy matching Kun's threadForkPoint locale string. */
export const THREAD_FORK_POINT_LABEL = 'Branch starts here'

/** English copy matching Kun's threadForkPointFrom locale string. */
export const THREAD_FORK_POINT_FROM_TEMPLATE = 'Branch from {{title}} starts here'

export function formatThreadForkBannerSubtitle(parentTitle?: string): string {
  const title = parentTitle?.trim()
  if (!title) return THREAD_FORK_BANNER_SUB_UNKNOWN
  return THREAD_FORK_BANNER_SUB_TEMPLATE.replace('{{title}}', title)
}

export function resolveThreadForkPointLabel(parentTitle?: string): string {
  const title = parentTitle?.trim()
  if (!title) return THREAD_FORK_POINT_LABEL
  return THREAD_FORK_POINT_FROM_TEMPLATE.replace('{{title}}', title)
}
