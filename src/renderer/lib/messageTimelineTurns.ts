// Turn grouping and assistant think-split helpers echoing Kun's message-timeline-turns.ts
// (../Kun/src/renderer/src/components/chat/message-timeline-turns.ts).

export type TimelineChatBlock = {
  id: string
  kind: string
  text?: string
  status?: string
}

export type Turn = {
  user?: TimelineChatBlock & { kind: 'user' }
  blocks: TimelineChatBlock[]
}

export function groupTurns(blocks: TimelineChatBlock[]): Turn[] {
  const turns: Turn[] = []
  let current: Turn | null = null

  for (const block of blocks) {
    if (block.kind === 'user') {
      if (current) turns.push(current)
      current = { user: block as Turn['user'], blocks: [] }
      continue
    }
    if (!current) current = { blocks: [] }
    current.blocks.push(block)
  }

  if (current) turns.push(current)
  return turns
}

export function stableTurnKey(turn: Turn, fallbackIndex: number): string {
  return turn.user?.id ?? turn.blocks[0]?.id ?? `turn-${fallbackIndex}`
}

export function sameTurnContent(left: Turn, right: Turn): boolean {
  if (left.user !== right.user) return false
  if (left.blocks.length !== right.blocks.length) return false
  for (let index = 0; index < left.blocks.length; index += 1) {
    if (left.blocks[index] !== right.blocks[index]) return false
  }
  return true
}

export function splitThink(text: string): { think: string; content: string } {
  const match = text.match(/<think>([\s\S]*?)(?:<\/think>|$)/)
  if (!match) return { think: '', content: text }
  return {
    think: match[1].trim(),
    content: text.replace(/<think>[\s\S]*?(?:<\/think>|$)/, '').trim(),
  }
}

export function blockHasPendingRuntimeWork(block: TimelineChatBlock): boolean {
  if (block.kind === 'tool') return block.status === 'running'
  if (block.kind === 'compaction') return block.status === 'running'
  if (block.kind === 'review') return block.status === 'running'
  if (block.kind === 'approval') return block.status === 'pending'
  if (block.kind === 'user_input') return block.status === 'pending'
  return false
}

export function isProcessBlock(block: TimelineChatBlock): boolean {
  return (
    block.kind === 'reasoning' ||
    block.kind === 'tool' ||
    block.kind === 'compaction' ||
    block.kind === 'approval' ||
    block.kind === 'user_input' ||
    block.kind === 'system'
  )
}

export function findTrailingAssistantContentStart(blocks: TimelineChatBlock[]): number {
  let start = blocks.length

  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    const block = blocks[index]
    // Completed reasoning may be persisted after final text; it should not hide the answer bubble.
    if (block.kind === 'reasoning' && start === blocks.length) continue
    if (block.kind !== 'assistant') break

    const split = splitThink(block.text ?? '')
    if (!split.content.trim()) break
    start = index
  }

  return start
}
