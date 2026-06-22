// Kun process section title chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-process.tsx describeProcessSection
// and summarizeExecutionSection).
// Visual only — used for ProcessSectionRow section headers.

/** English copy matching Kun's thinkingNow locale string. */
export const PROCESS_SECTION_THINKING_NOW = 'Thinking…'

/** English copy matching Kun's thinkingLabel locale string. */
export const PROCESS_SECTION_THINKING_LABEL = 'Thinking'

/** English copy matching Kun's groupEditedFile locale string. */
export const PROCESS_SECTION_GROUP_EDITED_FILE = 'Edited 1 file'

/** English copy matching Kun's groupRanCommand locale string. */
export const PROCESS_SECTION_GROUP_RAN_COMMAND = 'Ran 1 command'

/** English copy matching Kun's groupUsedTool locale string. */
export const PROCESS_SECTION_GROUP_USED_TOOL = 'Used 1 tool'

/** English copy matching Kun's groupApproval locale string. */
export const PROCESS_SECTION_GROUP_APPROVAL = '1 approval'

/** English copy matching Kun's thoughtFor locale template. */
export const PROCESS_SECTION_THOUGHT_FOR_TEMPLATE = 'Thought for {{duration}}'

/** English copy matching Kun's thoughtSteps locale template. */
export const PROCESS_SECTION_THOUGHT_STEPS_TEMPLATE = 'Thought ({{count}} steps)'

/** English copy matching Kun's groupEditedFiles locale template. */
export const PROCESS_SECTION_GROUP_EDITED_FILES_TEMPLATE = 'Edited {{count}} files'

/** English copy matching Kun's groupRanCommands locale template. */
export const PROCESS_SECTION_GROUP_RAN_COMMANDS_TEMPLATE = 'Ran {{count}} commands'

/** English copy matching Kun's groupUsedTools locale template. */
export const PROCESS_SECTION_GROUP_USED_TOOLS_TEMPLATE = 'Used {{count}} tools'

/** English copy matching Kun's groupApprovals locale template. */
export const PROCESS_SECTION_GROUP_APPROVALS_TEMPLATE = '{{count}} approvals'

/** English copy matching Kun's processSteps locale template. */
export const PROCESS_SECTION_PROCESS_STEPS_TEMPLATE = 'Work process ({{count}} steps)'

export function formatProcessSectionThoughtFor(duration: string): string {
  return PROCESS_SECTION_THOUGHT_FOR_TEMPLATE.replace('{{duration}}', duration)
}

export function formatProcessSectionThoughtSteps(count: number): string {
  return PROCESS_SECTION_THOUGHT_STEPS_TEMPLATE.replace('{{count}}', String(count))
}

export function formatProcessSectionGroupEditedFiles(count: number): string {
  return PROCESS_SECTION_GROUP_EDITED_FILES_TEMPLATE.replace('{{count}}', String(count))
}

export function formatProcessSectionGroupRanCommands(count: number): string {
  return PROCESS_SECTION_GROUP_RAN_COMMANDS_TEMPLATE.replace('{{count}}', String(count))
}

export function formatProcessSectionGroupUsedTools(count: number): string {
  return PROCESS_SECTION_GROUP_USED_TOOLS_TEMPLATE.replace('{{count}}', String(count))
}

export function formatProcessSectionGroupApprovals(count: number): string {
  return PROCESS_SECTION_GROUP_APPROVALS_TEMPLATE.replace('{{count}}', String(count))
}

export function formatProcessSectionProcessSteps(count: number): string {
  return PROCESS_SECTION_PROCESS_STEPS_TEMPLATE.replace('{{count}}', String(count))
}
