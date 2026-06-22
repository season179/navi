// Tool block summary helpers echoing Kun's summarizeToolBlock
// (../Kun/src/renderer/src/components/chat/message-timeline-process.tsx)
// and formatToolTitle (../Kun/src/renderer/src/components/chat/message-timeline-tools.ts).

import {
  resolveToolSummaryLabel,
} from './toolSummaryLocale'

export type SummarizeToolBlockInput = {
  summary: string
  detail?: string
  filePath?: string
  toolKind?: 'file_change' | 'command_execution' | 'generic'
  meta?: Record<string, unknown>
}

export type ToolSummaryLabelFn = (key: string, opts?: Record<string, unknown>) => string

export function defaultToolSummaryLabel(key: string): string {
  return resolveToolSummaryLabel(key)
}

function summarizeProcessText(text: string, max = 96): string {
  const oneLine = text.replace(/\s+/g, ' ').trim()
  if (!oneLine) return ''
  if (oneLine.length <= max) return oneLine
  return `${oneLine.slice(0, max - 1).trimEnd()}…`
}

function humanizeToolName(name: string): string {
  const trimmed = name.trim().replace(/[_-]+/g, ' ')
  if (!trimmed) return ''
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

function builtInToolLabel(
  toolName: string,
  t: ToolSummaryLabelFn,
): string | undefined {
  switch (toolName) {
    case 'read':
    case 'read_file':
      return t('toolBuiltinRead')
    case 'write':
    case 'write_file':
      return t('toolBuiltinWrite')
    case 'edit':
    case 'edit_file':
      return t('toolBuiltinEdit')
    case 'grep':
    case 'grep_files':
    case 'search_files':
      return t('toolBuiltinGrep')
    case 'find':
      return t('toolBuiltinFind')
    case 'ls':
      return t('toolBuiltinLs')
    case 'bash':
    case 'shell':
      return t('toolBuiltinBash')
    default:
      return undefined
  }
}

function extractToolName(summary: string): string {
  const match = summary.trim().match(/^([a-z0-9_-]+)\s*:/i)
  return match?.[1] ?? ''
}

function extractQuotedField(text: string, field: string): string | undefined {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const attr = new RegExp(`${escaped}="([^"]+)"`, 'i').exec(text)
  if (attr?.[1]) return attr[1]
  const json = new RegExp(`"${escaped}"\\s*:\\s*"([^"]+)"`, 'i').exec(text)
  if (json?.[1]) return json[1]
  return undefined
}

function readMetaString(
  meta: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  if (!meta) return undefined
  const value = meta[key]
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

/** Kun toolFilePath — resolve file path from block fields and quoted attrs. */
export function toolFilePath(block: SummarizeToolBlockInput): string | undefined {
  const sourceText = [block.summary, block.detail ?? ''].filter(Boolean).join('\n')
  return (
    block.filePath ||
    extractQuotedField(sourceText, 'path') ||
    extractQuotedField(sourceText, 'file_path') ||
    extractQuotedField(sourceText, 'file')
  )
}

export function formatToolTitle(
  block: SummarizeToolBlockInput,
  t: ToolSummaryLabelFn = defaultToolSummaryLabel,
): string {
  if (block.toolKind === 'file_change') return t('toolActionFile')
  if (block.toolKind === 'command_execution') return t('toolActionCommand')
  return t('toolActionTool')
}

/** Kun summarizeToolBlock — derive process-entry summary text from tool block metadata. */
export function summarizeToolBlock(
  block: SummarizeToolBlockInput,
  t: ToolSummaryLabelFn = defaultToolSummaryLabel,
): string {
  const rawSummary = block.summary?.trim() ?? ''
  const metaToolName = readMetaString(block.meta, 'toolName')
  const toolName = extractToolName(rawSummary) || metaToolName || ''
  const label =
    builtInToolLabel(toolName, t) ||
    humanizeToolName(toolName) ||
    formatToolTitle(block, t)
  const sourceText = [rawSummary, block.detail ?? ''].filter(Boolean).join('\n')
  const filePath = toolFilePath(block)
  const pattern =
    extractQuotedField(sourceText, 'pattern') ||
    extractQuotedField(sourceText, 'query') ||
    readMetaString(block.meta, 'pattern')
  const command = readMetaString(block.meta, 'command')

  if ((toolName === 'read_file' || toolName === 'read') && filePath) {
    return `${label} ${filePath}`
  }
  if (
    (toolName === 'write' ||
      toolName === 'edit' ||
      toolName === 'write_file' ||
      toolName === 'edit_file') &&
    filePath
  ) {
    return `${label} ${filePath}`
  }
  if (
    (toolName === 'grep_files' ||
      toolName === 'search_files' ||
      toolName === 'grep' ||
      toolName === 'find') &&
    pattern
  ) {
    return filePath ? `${label} ${pattern} · ${filePath}` : `${label} ${pattern}`
  }
  if (toolName === 'ls' && filePath) {
    return `${label} ${filePath}`
  }
  if (command && block.toolKind === 'command_execution') {
    return `${formatToolTitle(block, t)} ${summarizeProcessText(command, 72)}`
  }
  if (filePath) {
    return `${label} ${filePath}`
  }
  if (pattern) {
    return `${label} ${pattern}`
  }
  if (rawSummary) {
    const compact = toolName ? rawSummary.replace(/^([a-z0-9_-]+)\s*:\s*/i, '') : rawSummary
    const summary = summarizeProcessText(compact, 72)
    return summary ? `${label} ${summary}` : label
  }
  return label
}
