// Process section title helpers echoing Kun's describeProcessSection,
// summarizeExecutionSection, and splitVerb
// (../Kun/src/renderer/src/components/chat/message-timeline-process.tsx).

import type {
  ProcessSectionSnapshot,
  ProcessStackEntrySnapshot,
} from './ProcessSectionRow'
import {
  PROCESS_SECTION_GROUP_APPROVAL,
  PROCESS_SECTION_GROUP_EDITED_FILE,
  PROCESS_SECTION_GROUP_RAN_COMMAND,
  PROCESS_SECTION_GROUP_USED_TOOL,
  PROCESS_SECTION_THINKING_LABEL,
  PROCESS_SECTION_THINKING_NOW,
  formatProcessSectionGroupApprovals,
  formatProcessSectionGroupEditedFiles,
  formatProcessSectionGroupRanCommands,
  formatProcessSectionGroupUsedTools,
  formatProcessSectionProcessSteps,
  formatProcessSectionThoughtFor,
  formatProcessSectionThoughtSteps,
} from '../../lib/processSectionTitleLocale'

export function formatProcessDuration(ms: number): string {
  if (ms < 1000) return `${Math.max(1, Math.round(ms))}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)}s`
  if (ms < 3_600_000) {
    const totalSeconds = Math.round(ms / 1000)
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m}m ${s}s`
  }
  if (ms < 86_400_000) {
    const totalMinutes = Math.round(ms / 60_000)
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return `${h}h ${m}m`
  }
  const totalHours = Math.round(ms / 3_600_000)
  const d = Math.floor(totalHours / 24)
  const h = totalHours % 24
  return `${d}d ${h}h`
}

function describeReasoningSectionTitle(
  section: ProcessSectionSnapshot,
  opts: {
    singleReasoningSection: boolean
    reasoningDurationMs?: number
  },
): string {
  if (section.processing === true && section.active === true) {
    return PROCESS_SECTION_THINKING_NOW
  }
  if (
    opts.singleReasoningSection &&
    typeof opts.reasoningDurationMs === 'number' &&
    opts.reasoningDurationMs >= 1000
  ) {
    return formatProcessSectionThoughtFor(formatProcessDuration(opts.reasoningDurationMs))
  }
  const stepCount = section.reasoningStepCount ?? 1
  if (stepCount > 1) {
    return formatProcessSectionThoughtSteps(stepCount)
  }
  return PROCESS_SECTION_THINKING_LABEL
}

type StackEntrySummaryKind =
  | 'file_change'
  | 'command_execution'
  | 'tool'
  | 'approval'

function classifyStackEntry(entry: ProcessStackEntrySnapshot): StackEntrySummaryKind {
  if (entry.detailKind === 'approval' || entry.pendingApproval === true) {
    return 'approval'
  }
  if (entry.detailKind === 'patch') {
    return 'file_change'
  }
  if (entry.detailKind === 'command') {
    return 'command_execution'
  }
  const verb = entry.summary.trim().split(/\s+/)[0]?.toLowerCase() ?? ''
  if (verb === 'edit' || verb === 'write') {
    return 'file_change'
  }
  if (verb === 'read' && entry.filePath) {
    return 'file_change'
  }
  if (verb === 'run' || verb === 'bash' || verb === 'shell') {
    return 'command_execution'
  }
  return 'tool'
}

/** Kun summarizeExecutionSection — grouped multi-entry execution section titles. */
export function summarizeExecutionSection(
  entries: ProcessStackEntrySnapshot[],
): string {
  let fileCount = 0
  let commandCount = 0
  let toolCount = 0
  let approvalCount = 0

  for (const entry of entries) {
    switch (classifyStackEntry(entry)) {
      case 'approval':
        approvalCount += 1
        break
      case 'file_change':
        fileCount += 1
        break
      case 'command_execution':
        commandCount += 1
        break
      default:
        toolCount += 1
    }
  }

  const parts: string[] = []
  if (fileCount > 0) {
    parts.push(
      fileCount === 1
        ? PROCESS_SECTION_GROUP_EDITED_FILE
        : formatProcessSectionGroupEditedFiles(fileCount),
    )
  }
  if (commandCount > 0) {
    parts.push(
      commandCount === 1
        ? PROCESS_SECTION_GROUP_RAN_COMMAND
        : formatProcessSectionGroupRanCommands(commandCount),
    )
  }
  if (toolCount > 0) {
    parts.push(
      toolCount === 1
        ? PROCESS_SECTION_GROUP_USED_TOOL
        : formatProcessSectionGroupUsedTools(toolCount),
    )
  }
  if (approvalCount > 0) {
    parts.push(
      approvalCount === 1
        ? PROCESS_SECTION_GROUP_APPROVAL
        : formatProcessSectionGroupApprovals(approvalCount),
    )
  }

  if (parts.length > 0) return parts.join(' · ')
  return formatProcessSectionProcessSteps(entries.length)
}

/** Kun describeProcessSection — dynamic section header titles. */
export function resolveProcessSectionTitle(
  section: ProcessSectionSnapshot,
  opts?: {
    singleReasoningSection?: boolean
    reasoningDurationMs?: number
  },
): string {
  if (
    section.kind === 'reasoning' &&
    opts?.singleReasoningSection !== undefined
  ) {
    return describeReasoningSectionTitle(section, {
      singleReasoningSection: opts.singleReasoningSection,
      reasoningDurationMs: opts.reasoningDurationMs,
    })
  }
  if (section.kind === 'execution') {
    const entries = section.stackEntries ?? []
    if (entries.length > 1) {
      return summarizeExecutionSection(entries)
    }
  }
  return section.title
}

/** Kun splitVerb — first token vs remainder for ProcessEntryRow summary lines. */
export function splitSummaryVerb(summary: string): { verb: string; rest: string } {
  const trimmed = summary.trim()
  if (!trimmed) return { verb: '', rest: '' }
  const space = trimmed.search(/\s/)
  if (space < 0) return { verb: trimmed, rest: '' }
  return { verb: trimmed.slice(0, space), rest: trimmed.slice(space + 1).trim() }
}
