// Session title header echoing Kun's SessionHeader
// (../Kun/src/renderer/src/components/SessionHeader.tsx).
// Visual only: parent supplies snapshot data and optional busy/editing state.

import { useEffect, useState, type ReactElement } from 'react'
import { GitFork } from 'lucide-react'
import { formatRelativeTime } from '../../lib/format-relative-time'
import {
  SESSION_HEADER_EMPTY_HINT,
  SESSION_HEADER_FORKED_LABEL,
  SESSION_HEADER_NO_THREAD_SELECTED,
  SESSION_HEADER_RENAME_THREAD_HINT,
  SESSION_HEADER_RUNNING_LABEL,
  formatSessionForkedFrom,
  formatSessionForkedFromCompact,
  formatSessionUsageCache,
  formatSessionUsageCacheTitle,
  formatSessionUsageCost,
  formatSessionUsageTitle,
  formatSessionUsageTokens,
} from '../../lib/sessionHeader'

export type SessionHeaderUsageSnapshot = {
  totalTokens: number
  costUsd: number | null
  costCny?: number | null
  cacheHitRate: number
  lastTurnCacheHitRate?: number | null
  cachedTokens: number
  cacheMissTokens: number
  turns: number
}

export type SessionHeaderSnapshot = {
  title: string
  workspaceLabel: string
  workspacePath?: string
  mode: 'chat' | 'write'
  updatedAt: number
  forkedFromTitle?: string
  forkedFromThreadId?: string
  usage?: SessionHeaderUsageSnapshot
}

type Props = {
  snapshot?: SessionHeaderSnapshot | null
  workspaceLabel?: string
  compact?: boolean
  busy?: boolean
  className?: string
  forceEditing?: boolean
  onRename?: (title: string) => void
}

function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return '0'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (value >= 10_000) return `${Math.round(value / 1000)}k`
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(Math.round(value))
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '0%'
  return `${Math.round(value * 100)}%`
}

function formatCost(
  costUsd: number | null,
  costCny?: number | null,
): string {
  if (costCny != null && Number.isFinite(costCny) && costCny > 0) {
    return `¥${costCny.toFixed(2)}`
  }
  if (costUsd != null && Number.isFinite(costUsd)) {
    return `$${costUsd.toFixed(2)}`
  }
  return '$0.00'
}

function primaryCacheHitRate(usage: SessionHeaderUsageSnapshot): number {
  return usage.lastTurnCacheHitRate ?? usage.cacheHitRate
}

const NOW = Date.now()
const HOUR = 60 * 60 * 1000

/** Sample snapshots for ?sessionHeaderPreview preview hooks. */
export const SESSION_HEADER_PREVIEW = {
  default: {
    title: 'Refactor auth middleware',
    workspaceLabel: 'navi',
    workspacePath: '/Users/season/Personal/navi',
    mode: 'chat',
    updatedAt: NOW - 2 * HOUR,
    usage: {
      totalTokens: 84200,
      costUsd: 0.42,
      cacheHitRate: 0.68,
      lastTurnCacheHitRate: 0.74,
      cachedTokens: 57200,
      cacheMissTokens: 27000,
      turns: 14,
    },
  },
  fork: {
    title: 'Explore caching strategy',
    workspaceLabel: 'navi',
    workspacePath: '/Users/season/Personal/navi',
    mode: 'chat',
    updatedAt: NOW - 45 * 60 * 1000,
    forkedFromTitle: 'Refactor auth middleware',
    forkedFromThreadId: 'thread-fork-source',
    usage: {
      totalTokens: 12800,
      costUsd: 0.06,
      cacheHitRate: 0.52,
      cachedTokens: 6600,
      cacheMissTokens: 6200,
      turns: 3,
    },
  },
} satisfies Record<string, SessionHeaderSnapshot>

export const SESSION_HEADER_PREVIEW_EMPTY = {
  workspaceLabel: 'navi',
} as const

export type SessionHeaderPreviewMode =
  | 'default'
  | 'compact'
  | 'fork'
  | 'busy'
  | 'empty'
  | 'editing'

export function SessionHeader({
  snapshot,
  workspaceLabel = 'navi',
  compact = false,
  busy = false,
  className = '',
  forceEditing = false,
  onRename,
}: Props): ReactElement {
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US'
  const [editing, setEditing] = useState(forceEditing)
  const [draftTitle, setDraftTitle] = useState(snapshot?.title ?? '')

  useEffect(() => {
    setDraftTitle(snapshot?.title ?? '')
    setEditing(forceEditing)
  }, [snapshot?.title, forceEditing])

  const forkedFromTitle = snapshot?.forkedFromTitle?.trim() ?? ''
  const forkLabel = snapshot?.forkedFromThreadId
    ? forkedFromTitle
      ? formatSessionForkedFrom(forkedFromTitle)
      : SESSION_HEADER_FORKED_LABEL
    : ''

  const commitTitle = (): void => {
    if (!snapshot) {
      setEditing(false)
      return
    }
    const next = draftTitle.trim()
    if (!next || next === snapshot.title) {
      setDraftTitle(snapshot.title)
      setEditing(false)
      return
    }
    onRename?.(next)
    setEditing(false)
  }

  if (compact) {
    return (
      <div className={`session-header session-header-compact ${className}`.trim()}>
        {snapshot ? (
          <div className="session-header-compact-body">
            <div className="session-header-compact-title" title={snapshot.title}>
              {snapshot.title}
            </div>
            <div className="session-header-compact-meta">
              <span className="session-meta-workspace">{snapshot.workspaceLabel}</span>
              <span className="session-meta-separator">·</span>
              <span className="session-meta-mode">{snapshot.mode}</span>
              <span className="session-meta-separator">·</span>
              <span className="session-meta-time">
                {formatRelativeTime(snapshot.updatedAt, locale)}
              </span>
              {snapshot.forkedFromThreadId ? (
                <>
                  <span className="session-meta-separator">·</span>
                  <span className="session-meta-fork" title={forkLabel}>
                    <GitFork className="session-meta-fork-icon" strokeWidth={1.8} aria-hidden="true" />
                    <span className="session-meta-fork-label">
                      {forkedFromTitle
                        ? formatSessionForkedFromCompact(forkedFromTitle)
                        : SESSION_HEADER_FORKED_LABEL}
                    </span>
                  </span>
                </>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="session-header-compact-empty">
            <div className="session-header-compact-empty-label">{workspaceLabel}</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`session-header session-header-full ${className}`.trim()}>
      {snapshot ? (
        <>
          <div className="session-header-full-body">
            <div className="session-header-full-meta">
              <span>{snapshot.workspaceLabel}</span>
              <span>·</span>
              <span className="session-meta-mode">{snapshot.mode}</span>
              <span>·</span>
              <span>{formatRelativeTime(snapshot.updatedAt, locale)}</span>
            </div>
            <div className="session-header-full-title-row">
              {editing ? (
                <input
                  className="session-header-title-input"
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  onBlur={() => commitTitle()}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      commitTitle()
                    }
                    if (event.key === 'Escape') {
                      setDraftTitle(snapshot.title)
                      setEditing(false)
                    }
                  }}
                  aria-label={SESSION_HEADER_RENAME_THREAD_HINT}
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  className="session-header-title-button"
                  title={SESSION_HEADER_RENAME_THREAD_HINT}
                  onClick={() => setEditing(true)}
                >
                  {snapshot.title}
                </button>
              )}
            </div>
            <div className="session-header-badges">
              <span className="session-header-badge session-header-badge-subtle">
                {snapshot.mode}
              </span>
              {snapshot.workspacePath ? (
                <span className="session-header-badge session-header-badge-card">
                  {snapshot.workspacePath.split(/[/\\]/).pop()}
                </span>
              ) : null}
              {snapshot.forkedFromThreadId ? (
                <span className="session-header-badge session-header-badge-fork" title={forkLabel}>
                  <GitFork className="session-header-badge-fork-icon" strokeWidth={1.8} aria-hidden="true" />
                  <span className="session-header-badge-fork-label">{forkLabel}</span>
                </span>
              ) : null}
              {snapshot.usage ? (
                <>
                  <span
                    className="session-header-badge session-header-badge-subtle"
                    title={formatSessionUsageTitle(snapshot.usage.turns)}
                  >
                    {formatSessionUsageTokens(formatCompactNumber(snapshot.usage.totalTokens))}
                  </span>
                  <span className="session-header-badge session-header-badge-card">
                    {formatSessionUsageCost(
                      formatCost(snapshot.usage.costUsd, snapshot.usage.costCny),
                    )}
                  </span>
                  <span
                    className="session-header-badge session-header-badge-card"
                    title={formatSessionUsageCacheTitle({
                      cache: formatPercent(snapshot.usage.cacheHitRate),
                      cached: formatCompactNumber(snapshot.usage.cachedTokens),
                      miss: formatCompactNumber(snapshot.usage.cacheMissTokens),
                      latestCache:
                        snapshot.usage.lastTurnCacheHitRate != null
                          ? formatPercent(snapshot.usage.lastTurnCacheHitRate)
                          : null,
                    })}
                  >
                    {formatSessionUsageCache(formatPercent(primaryCacheHitRate(snapshot.usage)))}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <div className="session-header-empty">
          <div className="session-header-empty-kicker">{workspaceLabel}</div>
          <div className="session-header-empty-title">{SESSION_HEADER_NO_THREAD_SELECTED}</div>
          <div className="session-header-empty-hint">{SESSION_HEADER_EMPTY_HINT}</div>
        </div>
      )}
      {busy ? <span className="session-header-busy">{SESSION_HEADER_RUNNING_LABEL}</span> : null}
    </div>
  )
}
