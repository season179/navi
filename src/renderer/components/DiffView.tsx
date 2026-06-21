// Lightweight unified-diff renderer echoing Kun's DiffView
// (../Kun/src/renderer/src/components/DiffView.tsx). Visual only.

import { useMemo, useState, type ReactElement } from 'react'
import { Check, Copy } from 'lucide-react'

type Props = {
  patch: string
  className?: string
  maxHeight?: number
  filePath?: string
}

type ParsedDiff = {
  filePath: string | null
  added: number
  removed: number
}

type LangBadge = {
  test: RegExp
  label: string
  tone: 'ts' | 'js' | 'json' | 'css' | 'md' | 'py' | 'html' | 'yml' | 'sh' | 'txt'
}

const LANG_BADGES: LangBadge[] = [
  { test: /\.tsx?$/i, label: 'TS', tone: 'ts' },
  { test: /\.jsx?$/i, label: 'JS', tone: 'js' },
  { test: /\.json$/i, label: 'JSON', tone: 'json' },
  { test: /\.(css|scss|less)$/i, label: 'CSS', tone: 'css' },
  { test: /\.md$/i, label: 'MD', tone: 'md' },
  { test: /\.py$/i, label: 'PY', tone: 'py' },
  { test: /\.html?$/i, label: 'HTML', tone: 'html' },
  { test: /\.ya?ml$/i, label: 'YML', tone: 'yml' },
  { test: /\.sh$/i, label: 'SH', tone: 'sh' },
]

function parseDiff(patch: string, override?: string): ParsedDiff {
  const lines = patch.split('\n')
  let filePath = override ?? null
  let added = 0
  let removed = 0

  for (const line of lines) {
    if (!filePath) {
      if (line.startsWith('+++ ')) {
        const raw = line.slice(4).trim()
        const cleaned = raw.replace(/^[ab]\//, '')
        if (cleaned && cleaned !== '/dev/null') filePath = cleaned
      } else if (line.startsWith('--- ')) {
        const raw = line.slice(4).trim()
        const cleaned = raw.replace(/^[ab]\//, '')
        if (cleaned && cleaned !== '/dev/null') filePath = cleaned
      } else if (line.startsWith('diff --git ')) {
        const match = line.match(/ b\/(\S+)/)
        if (match) filePath = match[1]
      }
    }
    if (line.startsWith('+') && !line.startsWith('+++')) added += 1
    else if (line.startsWith('-') && !line.startsWith('---')) removed += 1
  }

  return { filePath, added, removed }
}

function badgeFor(name: string | null): { label: string; tone: LangBadge['tone'] } {
  if (!name) return { label: 'TXT', tone: 'txt' }
  for (const badge of LANG_BADGES) {
    if (badge.test.test(name)) return { label: badge.label, tone: badge.tone }
  }
  return { label: 'TXT', tone: 'txt' }
}

export function DiffView({
  patch,
  className = '',
  maxHeight = 320,
  filePath,
}: Props): ReactElement {
  const lines = patch.split('\n')
  const looksLikePatch = lines.some((line) => /^[+-]/.test(line) || line.startsWith('@@'))
  const parsed = useMemo(() => parseDiff(patch, filePath), [patch, filePath])
  const [copied, setCopied] = useState(false)

  const fileLabel = parsed.filePath ?? filePath ?? null
  const displayName = fileLabel ? fileLabel.split(/[/\\]/).pop() ?? fileLabel : null
  const badge = badgeFor(fileLabel)
  const fillParent = maxHeight >= 9000

  const onCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(patch)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      /* clipboard unavailable */
    }
  }

  if (!looksLikePatch) {
    return (
      <div className={`diff-view ${className}`.trim()}>
        <DiffHeader
          badge={badge}
          name={displayName}
          added={null}
          removed={null}
          onCopy={onCopy}
          copied={copied}
        />
        <pre
          className={`diff-view-plain ${fillParent ? 'is-fill' : ''}`}
          style={fillParent ? undefined : { maxHeight }}
        >
          {patch}
        </pre>
      </div>
    )
  }

  const bodyLines = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => {
      if (line.startsWith('--- ') || line.startsWith('+++ ')) return false
      if (line.startsWith('diff --git ')) return false
      if (line.startsWith('index ')) return false
      return true
    })

  const numbered: Array<{
    key: number
    line: string
    lineNo: number | null
    tone: 'hunk' | 'added' | 'removed' | 'context'
  }> = []
  let newLineNo: number | null = null
  for (const { line, index } of bodyLines) {
    let tone: 'hunk' | 'added' | 'removed' | 'context'
    let displayedNo: number | null = null
    if (line.startsWith('@@')) {
      tone = 'hunk'
      const match = line.match(/\+(\d+)/)
      newLineNo = match ? parseInt(match[1], 10) : null
    } else if (line.startsWith('+')) {
      tone = 'added'
      displayedNo = newLineNo
      if (newLineNo != null) newLineNo += 1
    } else if (line.startsWith('-')) {
      tone = 'removed'
    } else {
      tone = 'context'
      displayedNo = newLineNo
      if (newLineNo != null) newLineNo += 1
    }
    numbered.push({ key: index, line, lineNo: displayedNo, tone })
  }

  return (
    <div className={`diff-view ${className}`.trim()}>
      <DiffHeader
        badge={badge}
        name={displayName}
        added={parsed.added}
        removed={parsed.removed}
        onCopy={onCopy}
        copied={copied}
      />
      <div
        className={`diff-view-body ${fillParent ? 'is-fill' : ''}`}
        style={fillParent ? undefined : { maxHeight }}
      >
        <table className="diff-view-table">
          <tbody>
            {numbered.map(({ key, line, lineNo, tone }) => (
              <tr key={key} className={`diff-view-row is-${tone}`}>
                <td className="diff-view-line-no">{lineNo ?? ''}</td>
                <td className="diff-view-line-text">{line || ' '}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DiffHeader({
  badge,
  name,
  added,
  removed,
  onCopy,
  copied,
}: {
  badge: { label: string; tone: LangBadge['tone'] }
  name: string | null
  added: number | null
  removed: number | null
  onCopy: () => void
  copied: boolean
}): ReactElement {
  return (
    <div className="diff-view-header">
      <span className={`diff-view-badge is-${badge.tone}`}>{badge.label}</span>
      <span className="diff-view-filename" title={name ?? ''}>
        {name ?? 'patch'}
      </span>
      {added != null || removed != null ? (
        <span className="diff-view-stats">
          {(added ?? 0) > 0 ? <span className="diff-view-stat-added">+{added}</span> : null}
          {(added ?? 0) > 0 && (removed ?? 0) > 0 ? (
            <span className="diff-view-stat-sep">·</span>
          ) : null}
          {(removed ?? 0) > 0 ? (
            <span className="diff-view-stat-removed">-{removed}</span>
          ) : null}
        </span>
      ) : null}
      <button
        type="button"
        onClick={onCopy}
        className="diff-view-copy-btn"
        aria-label="Copy diff"
        title="Copy diff"
      >
        {copied ? (
          <Check className="diff-view-copy-icon is-copied" strokeWidth={2} />
        ) : (
          <Copy className="diff-view-copy-icon" strokeWidth={1.8} />
        )}
      </button>
    </div>
  )
}
