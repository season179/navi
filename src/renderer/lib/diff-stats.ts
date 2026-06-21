export type DiffStats = {
  added: number
  removed: number
}

export function countDiffStats(patch: string | undefined): DiffStats | null {
  if (!patch) return null

  let added = 0
  let removed = 0
  for (const line of patch.split('\n')) {
    if (line.startsWith('+++') || line.startsWith('---')) continue
    if (line.startsWith('+')) added += 1
    else if (line.startsWith('-')) removed += 1
  }

  if (added === 0 && removed === 0) return null
  return { added, removed }
}

export function sumDiffStats(patches: Array<string | undefined>): DiffStats | null {
  let added = 0
  let removed = 0
  let hasStats = false

  for (const patch of patches) {
    const stats = countDiffStats(patch)
    if (!stats) continue
    added += stats.added
    removed += stats.removed
    hasStats = true
  }

  return hasStats ? { added, removed } : null
}
