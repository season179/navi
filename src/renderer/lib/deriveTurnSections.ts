// Turn section derivation echoing Kun's derive-turn-sections.ts
// (../Kun/src/renderer/src/components/chat/derive-turn-sections.ts).

import {
  extractDiffFilePath,
  extractUnifiedDiffText,
  formatFilePathForDisplay,
} from './diff-stats'
import {
  isProcessBlock,
  splitThink,
  type TimelineChatBlock,
  type Turn,
} from './messageTimelineTurns'

export type TurnAssistantBlock = TimelineChatBlock & { kind: 'assistant' }

export type TurnToolBlock = TimelineChatBlock & {
  kind: 'tool'
  summary?: string
  toolKind?: string
  detail?: string
  filePath?: string
  meta?: Record<string, unknown>
}

export type TurnSections = {
  processBlocks: TimelineChatBlock[]
  assistantContentBlocks: TurnAssistantBlock[]
  generatedFileBlocks: TurnToolBlock[]
  turnFileChanges: TurnToolBlock[]
}

type ResolvedFileChangeBlock = TurnToolBlock & {
  detail: string
  filePath: string
}

type DeriveTurnSectionsInput = {
  turn: Turn
  isProcessing: boolean
  liveProcessText: string
  liveContent: string
  workspaceRoot: string
}

function fileChangeGroupKey(filePath: string): string {
  return filePath.trim().replace(/\\/g, '/').replace(/\/+$/, '')
}

function mergeFileChangeBlocks(changes: ResolvedFileChangeBlock[]): TurnToolBlock[] {
  const merged: ResolvedFileChangeBlock[] = []
  const indexByPath = new Map<string, number>()

  for (const change of changes) {
    const key = fileChangeGroupKey(change.filePath)
    const existingIndex = indexByPath.get(key)
    if (existingIndex === undefined) {
      indexByPath.set(key, merged.length)
      merged.push(change)
      continue
    }

    const existing = merged[existingIndex]
    merged[existingIndex] = {
      ...existing,
      detail: [existing.detail, change.detail].filter(Boolean).join('\n\n'),
    }
  }

  return merged
}

function metaArrayLength(meta: Record<string, unknown> | undefined, key: string): number {
  const value = meta?.[key]
  return Array.isArray(value) ? value.length : 0
}

function hasGeneratedFiles(block: TurnToolBlock): boolean {
  return (
    block.status === 'success' &&
    (metaArrayLength(block.meta, 'attachments') > 0 ||
      metaArrayLength(block.meta, 'generatedFiles') > 0)
  )
}

function isToolBlock(block: TimelineChatBlock): block is TurnToolBlock {
  return block.kind === 'tool'
}

/** Index of the last assistant block that carries visible (non-think) content. */
function findLastAssistantContentIndex(blocks: TimelineChatBlock[]): number {
  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    const block = blocks[index]
    if (block.kind === 'assistant' && splitThink(block.text ?? '').content.trim()) {
      return index
    }
  }
  return -1
}

export function deriveTurnSections({
  turn,
  isProcessing,
  liveProcessText,
  liveContent: _liveContent,
  workspaceRoot,
}: DeriveTurnSectionsInput): TurnSections {
  const processBlocks: TimelineChatBlock[] = []
  const assistantContentBlocks: TurnAssistantBlock[] = []
  const finalAssistantContentIndex = isProcessing
    ? -1
    : findLastAssistantContentIndex(turn.blocks)

  for (const [index, block] of turn.blocks.entries()) {
    if (block.kind === 'assistant') {
      const split = splitThink(block.text ?? '')
      if (split.think) {
        processBlocks.push({ kind: 'reasoning', id: `${block.id}-think`, text: split.think })
      }
      if (split.content.trim()) {
        const contentBlock: TurnAssistantBlock = { ...block, kind: 'assistant', text: split.content }
        if (index === finalAssistantContentIndex) {
          assistantContentBlocks.push(contentBlock)
        } else {
          processBlocks.push(contentBlock)
        }
      }
      continue
    }
    if (isProcessBlock(block)) {
      processBlocks.push(block)
    }
  }

  if (liveProcessText.trim()) {
    processBlocks.push({ kind: 'reasoning', id: 'live-reasoning', text: liveProcessText })
  }

  const turnFileChanges: TurnToolBlock[] = isProcessing
    ? []
    : mergeFileChangeBlocks(
        turn.blocks.flatMap((block): ResolvedFileChangeBlock[] => {
          if (
            !(
              isToolBlock(block) &&
              block.toolKind === 'file_change' &&
              block.status === 'success'
            )
          ) {
            return []
          }

          const detailText = extractUnifiedDiffText(block.detail)
          if (!detailText) return []

          const resolvedFilePath = formatFilePathForDisplay(
            extractDiffFilePath(detailText, block.filePath),
            workspaceRoot,
          )
          if (!resolvedFilePath) return []

          return [{ ...block, detail: detailText, filePath: resolvedFilePath }]
        }),
      )

  const generatedFileBlocks: TurnToolBlock[] = turn.blocks.filter(
    (block): block is TurnToolBlock => isToolBlock(block) && hasGeneratedFiles(block),
  )

  return { processBlocks, assistantContentBlocks, generatedFileBlocks, turnFileChanges }
}
