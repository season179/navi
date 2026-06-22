// Kun TimelinePaginationControls chrome
// (../Kun/src/renderer/src/components/chat/MessageTimeline.tsx).
// Visual only — used for production TimelinePaginationControls and preview hooks.

/** English copy matching Kun's timelineShowEarlierTurns locale string. */
export const TIMELINE_SHOW_EARLIER_TURNS_TEMPLATE = 'Show {{count}} earlier turns'

/** English copy matching Kun's timelineCollapseEarlierTurns locale string. */
export const TIMELINE_COLLAPSE_EARLIER_TURNS_LABEL = 'Show recent turns only'

export function formatTimelineShowEarlierTurns(count: number): string {
  return TIMELINE_SHOW_EARLIER_TURNS_TEMPLATE.replace('{{count}}', String(count))
}
