// Bridge deriveTurnSections output to MessageTurnSnapshot for MessageTimeline rendering.
// Echoes Kun's MessageTurn block→section wiring
// (../Kun/src/renderer/src/components/chat/MessageTimeline.tsx).

import type { CompactionDividerSnapshot } from '../components/chat/CompactionDivider'
import type {
  AssistantMessageSnapshot,
  MessageBubbleSnapshot,
  UserMessageSnapshot,
} from '../components/chat/MessageBubble'
import type { MediaReference } from '../components/chat/MediaPreviewTile'
import type { ProcessOutputEntrySnapshot } from '../components/chat/ProcessOutputSection'
import type {
  ProcessSectionSnapshot,
  ProcessStackEntrySnapshot,
} from '../components/chat/ProcessSectionRow'
import type { ReviewSummarySnapshot } from '../components/chat/ReviewSummaryCard'
import type { TurnChangeSnapshot } from '../components/chat/TurnChangeSummary'
import { deriveTurnSections } from './deriveTurnSections'
import { groupProcessSections } from './groupProcessSections'
import { splitThink, type TimelineChatBlock, type Turn } from './messageTimelineTurns'
import {
  describeProcessBlockLabel,
  getProcessDetailFromBlock,
  isPendingApproval,
  isRequestUserInputTool,
  processBlockHasError,
  processBlockIsActive,
  processBlockIsAutoOpenPending,
  processBlockIsRunningTool,
  stackEntryFilePath,
} from './processBlockDetail'
export type MessageTurnSource = {
  blocks: TimelineChatBlock[]
  isProcessing?: boolean
  liveReasoning?: string
  liveContent?: string
  workspaceRoot?: string
}

export type BuiltMessageTurnSnapshot = {
  key: string
  user?: UserMessageSnapshot
  processing?: boolean
  workExpanded?: boolean
  workMeta?: {
    processing: boolean
    stepCount: number
    durationMs?: number
    reasoningDurationMs?: number
    collapsible?: boolean
  }
  processSections?: ProcessSectionSnapshot[]
  assistantBlocks?: MessageBubbleSnapshot[]
  liveAssistant?: AssistantMessageSnapshot
  generatedFiles?: MediaReference[]
  reviews?: ReviewSummarySnapshot[]
  showLiveProgress?: boolean
  devPreviewCard?: boolean
  plan?: { title: string; relativePath: string }
  changes?: TurnChangeSnapshot[]
  compaction?: CompactionDividerSnapshot
  compactCards?: boolean
}

function detailToStackEntryFields(
  block: TimelineChatBlock,
  detail: ReturnType<typeof getProcessDetailFromBlock>,
): Pick<
  ProcessStackEntrySnapshot,
  'detailText' | 'detailKind' | 'detailFilePath' | 'nestedBubble' | 'explicitDetail'
> {
  switch (detail.kind) {
    case 'reasoning':
      return { detailKind: 'reasoning', detailText: detail.text }
    case 'assistant':
      return { detailKind: 'assistant', detailText: detail.text }
    case 'tool':
      return {
        detailKind: detail.isPatch ? 'patch' : detail.isError ? 'error' : 'command',
        detailText: detail.text,
        detailFilePath: detail.filePath,
      }
    case 'text':
      return {
        detailKind: 'text',
        detailText: detail.text,
        explicitDetail: block.kind === 'system' && Boolean(block.detail?.trim()),
      }
    case 'approval':
      return {
        detailKind: 'approval',
        nestedBubble: {
          kind: 'approval',
          id: block.id,
          status:
            block.status === 'pending'
              ? 'pending'
              : block.status === 'error'
                ? 'error'
                : 'allowed',
          summary: block.summary ?? 'Approval required',
        } satisfies MessageBubbleSnapshot,
      }
    case 'user_input':
      return {
        detailKind: 'user_input',
        nestedBubble: {
          kind: 'user_input',
          id: block.id,
          status:
            block.status === 'pending'
              ? 'pending'
              : block.status === 'error'
                ? 'error'
                : 'submitted',
          questions: [
            {
              id: `${block.id}-question`,
              question: block.summary ?? 'User input required',
              options: [],
            },
          ],
        } satisfies MessageBubbleSnapshot,
      }
    default:
      return {}
  }
}

function blockToStackEntry(
  block: TimelineChatBlock,
  processing: boolean,
): ProcessStackEntrySnapshot {
  const summary = describeProcessBlockLabel(block)
  const detail = getProcessDetailFromBlock(block, summary)
  const isError = processBlockHasError(block)
  const runningTool = processBlockIsRunningTool(block, processing)
  const pendingApproval = isPendingApproval(block)
  const requestUserInput = isRequestUserInputTool(block)
  const autoOpenPending = processBlockIsAutoOpenPending(block, processing)
  const active = processBlockIsActive(block, processing)

  return {
    id: block.id,
    summary,
    filePath: stackEntryFilePath(block),
    active,
    error: isError,
    runningTool,
    pendingApproval,
    pendingUserInput: block.kind === 'user_input' && block.status === 'pending',
    requestUserInput,
    showCompactionIcon: block.kind === 'compaction' && block.status === 'running',
    collapsible: detail.kind !== 'none',
    forceOpen: pendingApproval || (processing && (requestUserInput || autoOpenPending)),
    expanded: isError,
    toolBlock: block.kind === 'tool',
    blockKind: block.kind === 'system' ? 'system' : undefined,
    wrapSummary: block.kind === 'assistant' || block.kind === 'system',
    ...detailToStackEntryFields(block, detail),
  }
}

function sectionHasDetails(section: ProcessSectionSnapshot): boolean {
  if (section.kind === 'reasoning') return Boolean(section.reasoningText?.trim())
  if (section.kind === 'output') {
    return (section.outputEntries?.some((entry) => entry.text.trim()) ?? false)
  }
  return (section.stackEntries?.length ?? 0) > 0
}

function isProcessSectionActive(
  section: ProcessSectionSnapshot,
  processing: boolean,
): boolean {
  if (!processing) return false
  if (section.kind === 'reasoning') return section.processing === true
  if (section.kind === 'execution') {
    return (
      section.stackEntries?.some(
        (entry) =>
          entry.runningTool === true ||
          entry.requestUserInput === true ||
          entry.pendingUserInput === true ||
          entry.showCompactionIcon === true,
      ) ?? false
    )
  }
  return false
}

function buildProcessSectionSnapshots(
  blocks: TimelineChatBlock[],
  processing: boolean,
): ProcessSectionSnapshot[] {
  const grouped = groupProcessSections(blocks)
  const sections: ProcessSectionSnapshot[] = []

  for (const section of grouped) {
    if (section.kind === 'reasoning') {
      const reasoningText = section.blocks
        .filter((block) => block.kind === 'reasoning')
        .map((block) => block.text ?? '')
        .filter(Boolean)
        .join('\n\n')
      const snapshot: ProcessSectionSnapshot = {
        kind: 'reasoning',
        title: 'Thinking',
        processing,
        reasoningText,
        reasoningStepCount: section.blocks.length,
        active: processing && section.blocks.some((block) => block.id === 'live-reasoning'),
      }
      snapshot.expanded = snapshot.active === true
      if (sectionHasDetails(snapshot)) sections.push(snapshot)
      continue
    }

    if (section.kind === 'output') {
      const outputEntries: ProcessOutputEntrySnapshot[] = section.blocks
        .filter((block) => block.kind === 'assistant')
        .map((block) => ({
          id: block.id,
          text: splitThink(block.text ?? '').content || block.text || '',
          streaming: processing && block.id === 'live-assistant',
        }))
      const snapshot: ProcessSectionSnapshot = {
        kind: 'output',
        title: 'Output',
        processing,
        outputEntries,
      }
      if (sectionHasDetails(snapshot)) sections.push(snapshot)
      continue
    }

    const stackEntries = section.blocks.map((block) => blockToStackEntry(block, processing))
    const hasError = section.blocks.some(processBlockHasError)
    const hasPendingApproval = section.blocks.some(isPendingApproval)
    const hasRequestUserInput =
      processing && section.blocks.some(isRequestUserInputTool)
    const active = isProcessSectionActive(
      {
        kind: 'execution',
        title: '',
        processing,
        stackEntries,
      },
      processing,
    )
    const defaultExpanded =
      hasError ||
      hasPendingApproval ||
      (processing && hasRequestUserInput)

    const snapshot: ProcessSectionSnapshot = {
      kind: 'execution',
      title: stackEntries.length === 1 ? stackEntries[0]!.summary : 'Working',
      processing,
      active,
      hasError,
      hasPendingApproval,
      hasRequestUserInput,
      expanded: defaultExpanded,
      forceExpanded: hasPendingApproval,
      stackEntries,
    }
    if (sectionHasDetails(snapshot)) sections.push(snapshot)
  }

  return sections
}

function generatedFilesFromBlocks(blocks: TimelineChatBlock[]): MediaReference[] {
  const media: MediaReference[] = []
  for (const block of blocks) {
    if (block.kind !== 'tool' || block.status !== 'success') continue
    const generated = block.meta?.generatedFiles
    if (!Array.isArray(generated)) continue
    for (const [index, entry] of generated.entries()) {
      if (!entry || typeof entry !== 'object') continue
      const raw = entry as Record<string, unknown>
      const relativePath =
        typeof raw.relativePath === 'string' ? raw.relativePath : undefined
      if (!relativePath) continue
      media.push({
        id: `${block.id}-gen-${index}`,
        relativePath,
        mimeType: typeof raw.mimeType === 'string' ? raw.mimeType : undefined,
        name: relativePath.split('/').pop(),
      })
    }
  }
  return media
}

function compactionFromBlock(block: TimelineChatBlock): CompactionDividerSnapshot {
  return {
    status:
      block.status === 'running'
        ? 'running'
        : block.status === 'error'
          ? 'error'
          : 'done',
    auto: block.auto,
    summary: block.summary,
  }
}

export function buildMessageTurnSnapshotFromSource(input: {
  key: string
  user?: UserMessageSnapshot
  source: MessageTurnSource
}): BuiltMessageTurnSnapshot {
  const processing = input.source.isProcessing === true
  const liveReasoning = input.source.liveReasoning ?? ''
  const liveContent = input.source.liveContent ?? ''
  const workspaceRoot = input.source.workspaceRoot ?? '/tmp'
  const liveThink = splitThink(liveContent).think
  const liveProcessText = [liveReasoning, liveThink].filter(Boolean).join('\n\n')

  const turn: Turn = { user: input.user, blocks: input.source.blocks }
  const sections = deriveTurnSections({
    turn,
    isProcessing: processing,
    liveProcessText,
    liveContent,
    workspaceRoot,
  })

  const compactionBlocks = sections.processBlocks.filter(
    (block) => block.kind === 'compaction',
  )
  const workProcessBlocks = sections.processBlocks.filter(
    (block) => block.kind !== 'compaction',
  )
  const onlyCompactionProcess =
    sections.processBlocks.length > 0 && workProcessBlocks.length === 0
  const hasProcessError = workProcessBlocks.some(processBlockHasError)
  const hasProcess =
    (processing && !onlyCompactionProcess) || workProcessBlocks.length > 0

  const processSections = buildProcessSectionSnapshots(workProcessBlocks, processing)
  const reasoningSectionCount = processSections.filter(
    (section) => section.kind === 'reasoning',
  ).length

  const assistantBlocks: MessageBubbleSnapshot[] = sections.assistantContentBlocks.map(
    (block) => ({
      kind: 'assistant',
      id: block.id,
      text: block.text ?? '',
    }),
  )

  const showLiveAssistant = Boolean(liveContent.trim())
  const liveAssistant: MessageBubbleSnapshot | undefined = showLiveAssistant
    ? {
        kind: 'assistant',
        id: 'live-assistant',
        text: splitThink(liveContent).content,
        streaming: true,
      }
    : undefined

  const changes: TurnChangeSnapshot[] = sections.turnFileChanges.map((block) => ({
    id: block.id,
    filePath: block.filePath,
    detail: block.detail,
  }))

  const compaction =
    compactionBlocks.length > 0
      ? compactionFromBlock(compactionBlocks[compactionBlocks.length - 1]!)
      : undefined

  return {
    key: input.key,
    user: input.user,
    processing,
    workExpanded: hasProcessError || processing,
    workMeta: hasProcess
      ? {
          processing,
          stepCount: workProcessBlocks.length,
          collapsible: !hasProcessError,
        }
      : undefined,
    processSections: processSections.map((section) => ({
      ...section,
      // Pass through for ProcessSectionRow title resolution.
      reasoningStepCount:
        section.kind === 'reasoning' ? reasoningSectionCount : section.reasoningStepCount,
    })),
    assistantBlocks,
    liveAssistant,
    generatedFiles: generatedFilesFromBlocks(sections.generatedFileBlocks),
    changes: changes.length > 0 && !processing ? changes : undefined,
    showLiveProgress: processing && !onlyCompactionProcess,
    compaction,
  }
}

/** Kun derive-turn-sections.test.ts intermediate-narration fixture for visual preview. */
export const DERIVED_TURN_INTERMEDIATE_BLOCKS: TimelineChatBlock[] = [
  { kind: 'assistant', id: 'intro', text: 'I found the likely cause.' },
  {
    kind: 'tool',
    id: 'tool_read',
    summary: 'read: source',
    status: 'success',
    toolKind: 'tool_call',
    detail: 'read output',
  },
  {
    kind: 'assistant',
    id: 'analysis',
    text: [
      'Here is the detailed analysis:',
      '',
      '```txt',
      'command output line 1',
      'command output line 2',
      '```',
    ].join('\n'),
  },
  {
    kind: 'tool',
    id: 'tool_issue',
    summary: 'web_fetch: issue',
    status: 'success',
    toolKind: 'tool_call',
    detail: 'https://github.com/example/issue/96',
  },
  {
    kind: 'assistant',
    id: 'next',
    text: 'The issue link above should still be visible.',
  },
]

export function buildDerivedIntermediateTurnPreview(): BuiltMessageTurnSnapshot & {
  source: MessageTurnSource
} {
  return {
    key: 'derived-intermediate',
    user: {
      kind: 'user',
      id: 'preview-user-derived',
      text: 'Why is the auth middleware failing in CI?',
      modelLabel: 'Claude Sonnet 4',
    },
    source: {
      blocks: DERIVED_TURN_INTERMEDIATE_BLOCKS,
      workspaceRoot: '/tmp',
    },
  }
}
