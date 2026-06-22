// Kun tool summary chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-process.tsx summarizeToolBlock
// and ../Kun/src/renderer/src/components/chat/message-timeline-tools.ts formatToolTitle).
// Visual only — used for process-entry tool summaries and formatToolTitle.

/** English copy matching Kun's toolActionFile locale string. */
export const TOOL_SUMMARY_ACTION_FILE = 'Edited file'

/** English copy matching Kun's toolActionCommand locale string. */
export const TOOL_SUMMARY_ACTION_COMMAND = 'Ran command'

/** English copy matching Kun's toolActionTool locale string. */
export const TOOL_SUMMARY_ACTION_TOOL = 'Called tool'

/** English copy matching Kun's toolBuiltinRead locale string. */
export const TOOL_SUMMARY_BUILTIN_READ = 'Read'

/** English copy matching Kun's toolBuiltinWrite locale string. */
export const TOOL_SUMMARY_BUILTIN_WRITE = 'Write'

/** English copy matching Kun's toolBuiltinEdit locale string. */
export const TOOL_SUMMARY_BUILTIN_EDIT = 'Edit'

/** English copy matching Kun's toolBuiltinGrep locale string. */
export const TOOL_SUMMARY_BUILTIN_GREP = 'Search'

/** English copy matching Kun's toolBuiltinFind locale string. */
export const TOOL_SUMMARY_BUILTIN_FIND = 'Find'

/** English copy matching Kun's toolBuiltinLs locale string. */
export const TOOL_SUMMARY_BUILTIN_LS = 'List'

/** English copy matching Kun's toolBuiltinBash locale string. */
export const TOOL_SUMMARY_BUILTIN_BASH = 'Bash'

const LOCALE_BY_KEY: Record<string, string> = {
  toolActionFile: TOOL_SUMMARY_ACTION_FILE,
  toolActionCommand: TOOL_SUMMARY_ACTION_COMMAND,
  toolActionTool: TOOL_SUMMARY_ACTION_TOOL,
  toolBuiltinRead: TOOL_SUMMARY_BUILTIN_READ,
  toolBuiltinWrite: TOOL_SUMMARY_BUILTIN_WRITE,
  toolBuiltinEdit: TOOL_SUMMARY_BUILTIN_EDIT,
  toolBuiltinGrep: TOOL_SUMMARY_BUILTIN_GREP,
  toolBuiltinFind: TOOL_SUMMARY_BUILTIN_FIND,
  toolBuiltinLs: TOOL_SUMMARY_BUILTIN_LS,
  toolBuiltinBash: TOOL_SUMMARY_BUILTIN_BASH,
}

export function resolveToolSummaryLabel(key: string): string {
  return LOCALE_BY_KEY[key] ?? key
}

export function resolveToolSummaryActionLabel(
  toolKind: 'file_change' | 'command_execution' | 'generic' | undefined,
): string {
  if (toolKind === 'file_change') return TOOL_SUMMARY_ACTION_FILE
  if (toolKind === 'command_execution') return TOOL_SUMMARY_ACTION_COMMAND
  return TOOL_SUMMARY_ACTION_TOOL
}

export function resolveBuiltInToolSummaryLabel(toolName: string): string | undefined {
  switch (toolName) {
    case 'read':
    case 'read_file':
      return TOOL_SUMMARY_BUILTIN_READ
    case 'write':
    case 'write_file':
      return TOOL_SUMMARY_BUILTIN_WRITE
    case 'edit':
    case 'edit_file':
      return TOOL_SUMMARY_BUILTIN_EDIT
    case 'grep':
    case 'grep_files':
    case 'search_files':
      return TOOL_SUMMARY_BUILTIN_GREP
    case 'find':
      return TOOL_SUMMARY_BUILTIN_FIND
    case 'ls':
      return TOOL_SUMMARY_BUILTIN_LS
    case 'bash':
    case 'shell':
      return TOOL_SUMMARY_BUILTIN_BASH
    default:
      return undefined
  }
}
