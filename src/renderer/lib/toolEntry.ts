// Kun ToolEntry chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-bubbles.tsx).
// Visual only — used for production ToolEntry and preview hooks.

export type ToolEntryKind = 'file_change' | 'command_execution' | 'generic'

/** English copy matching Kun's toolKindFile locale string. */
export const TOOL_ENTRY_KIND_FILE = 'File change'

/** English copy matching Kun's toolKindCommand locale string. */
export const TOOL_ENTRY_KIND_COMMAND = 'Command'

/** English copy matching Kun's toolKindTool locale string. */
export const TOOL_ENTRY_KIND_TOOL = 'Tool'

/** English copy matching Kun's inspectorStatusRunning locale string. */
export const TOOL_ENTRY_STATUS_RUNNING = 'running'

export function resolveToolEntryKindLabel(kind: ToolEntryKind): string {
  if (kind === 'file_change') return TOOL_ENTRY_KIND_FILE
  if (kind === 'command_execution') return TOOL_ENTRY_KIND_COMMAND
  return TOOL_ENTRY_KIND_TOOL
}

export function resolveToolEntrySessionStatusLabel(
  sessionStatus: string | undefined,
): string {
  const trimmed = sessionStatus?.trim()
  if (trimmed === 'running') return TOOL_ENTRY_STATUS_RUNNING
  return trimmed || 'session'
}
