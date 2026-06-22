// Kun TimelineJumpRail chrome
// (../Kun/src/renderer/src/components/chat/MessageTimeline.tsx).
// Visual only — used for production TimelineJumpRail and preview hooks.

/** English copy matching Kun's timelineJumpRailLabel locale string. */
export const TIMELINE_JUMP_RAIL_LABEL = 'Jump to a question'

/** English copy matching Kun's timelineJumpTurn locale string. */
export const TIMELINE_JUMP_TURN_TEMPLATE = 'Jump to question {{index}}'

export function formatTimelineJumpTurn(index: number): string {
  return TIMELINE_JUMP_TURN_TEMPLATE.replace('{{index}}', String(index))
}

/** Truncate a turn preview line the same way Kun's turnPreview does. */
export function formatTimelineTurnPreview(text: string, fallbackIndex: number): string {
  const trimmed = text.trim()
  if (!trimmed) return formatTimelineJumpTurn(fallbackIndex)
  const oneLine = trimmed.replace(/\s+/g, ' ')
  return oneLine.length > 48 ? `${oneLine.slice(0, 47).trimEnd()}...` : oneLine
}
