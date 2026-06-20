const stripTrailing = (p: string) => (p ?? '').trim().replace(/[/\\]+$/, '')

export function projectName(p: string): string {
  const parts = stripTrailing(p).split(/[/\\]/)
  return parts[parts.length - 1] || ''
}

export function projectLabel(p: string): string {
  const parts = stripTrailing(p).split(/[/\\]/).filter(Boolean)
  return parts.length >= 2 ? parts[parts.length - 2] : ''
}

interface StoreLike {
  conversations: { id: string; projectId?: string }[]
  projects: { id: string; path: string }[]
}

export function resolveProjectCwd(store: StoreLike, conversationId: string): string | undefined {
  const conv = store.conversations.find((c) => c.id === conversationId)
  if (!conv?.projectId) return undefined
  const proj = store.projects.find((p) => p.id === conv.projectId)
  const cwd = proj?.path?.trim()
  return cwd ? cwd : undefined
}
