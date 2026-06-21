// Process section grouping echoing Kun's groupProcessSections
// (../Kun/src/renderer/src/components/chat/message-timeline-process.tsx).

export type GroupProcessBlock = {
  id: string
  kind: string
}

export type GroupedProcessSection<T extends GroupProcessBlock = GroupProcessBlock> = {
  id: string
  kind: 'reasoning' | 'execution' | 'output'
  blocks: T[]
}

/** Kun block.kind → ProcessSection.kind mapping. */
export function resolveProcessSectionKind(
  blockKind: string,
): 'reasoning' | 'execution' | 'output' {
  if (blockKind === 'reasoning') return 'reasoning'
  if (blockKind === 'assistant') return 'output'
  return 'execution'
}

/** Kun groupProcessSections — merge consecutive blocks of the same section kind. */
export function groupProcessSections<T extends GroupProcessBlock>(
  blocks: T[],
): GroupedProcessSection<T>[] {
  const sections: GroupedProcessSection<T>[] = []

  for (const block of blocks) {
    const kind = resolveProcessSectionKind(block.kind)
    const last = sections[sections.length - 1]
    if (last && last.kind === kind) {
      last.blocks.push(block)
      continue
    }
    sections.push({
      id: `${kind}-${block.id}`,
      kind,
      blocks: [block],
    })
  }

  return sections
}
