export type DiffStats = {
  added: number
  removed: number
}

function textHasUnifiedDiffMarkers(text: string): boolean {
  return text
    .split('\n')
    .some((line) => /^(@@|diff --git |--- |\+\+\+ |index )/.test(line))
}

function parseJsonRecord(text: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(text)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

export function extractUnifiedDiffText(text: string | undefined): string | undefined {
  const raw = text?.trim()
  if (!raw) return undefined
  if (textHasUnifiedDiffMarkers(raw)) return raw

  const record = parseJsonRecord(raw)
  if (!record) return undefined

  for (const key of ['diff', 'patch', 'unified_diff', 'unifiedDiff']) {
    const value = record[key]
    if (typeof value !== 'string') continue
    const patch = value.trim()
    if (patch && textHasUnifiedDiffMarkers(patch)) return patch
  }

  return undefined
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
