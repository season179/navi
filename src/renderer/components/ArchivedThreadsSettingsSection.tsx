// Archived threads settings section echoing Kun's settings-section-archives.tsx
// (../Kun/src/renderer/src/components/settings-section-archives.tsx).
// Visual only: mock thread snapshots and preview modes.

import { useMemo, useState, type ReactElement } from 'react'
import { Archive, Folder, RotateCcw, Search, Trash2 } from 'lucide-react'
import { formatRelativeTime } from '../lib/format-relative-time'
import { SettingRow, SettingsCard } from './SettingsControls'

export type ArchivedThreadSnapshot = {
  id: string
  title: string
  preview?: string
  workspace?: string
  model?: string
  mode?: string
  updatedAt: number
  archived: boolean
}

const COPY = {
  archivesTitle: 'Archives',
  archivesOverview: 'Archived conversations',
  archivesOverviewDesc:
    'Browse, search, and restore conversations you archived from the sidebar.',
  archivesSearchPlaceholder: 'Search archived conversations…',
  archivesCount: (count: number) => `${count} archived`,
  archivesWorkspaceCount: (count: number) => `${count} conversation${count === 1 ? '' : 's'}`,
  archivesUntitled: 'Untitled conversation',
  archivesRestore: 'Restore',
  archivesDelete: 'Delete',
  archivesEmpty: 'No archived conversations yet.',
  archivesSearchEmpty: 'No archived conversations match your search.',
  archivesOffline: 'Connect a provider to browse archived conversations.',
  archivesFooterHint: 'Restore / Delete from the sidebar thread menu.',
}

function workspaceLabelFromPath(path: string): string {
  const trimmed = path.trim()
  if (!trimmed) return 'Working directory'
  const normalized = trimmed.replace(/[/\\]+$/, '')
  const parts = normalized.split(/[/\\]/)
  return parts[parts.length - 1] || 'Working directory'
}

export function filterArchivedThreads(
  threads: ArchivedThreadSnapshot[],
  query: string,
): ArchivedThreadSnapshot[] {
  const normalizedQuery = query.trim().toLowerCase()
  return threads
    .filter((thread) => thread.archived === true)
    .filter((thread) => {
      if (!normalizedQuery) return true
      return [
        thread.title,
        thread.preview,
        thread.workspace,
        workspaceLabelFromPath(thread.workspace ?? ''),
        thread.model,
        thread.mode,
      ].some((value) => value?.toLowerCase().includes(normalizedQuery))
    })
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

function groupArchivedThreads(
  threads: ArchivedThreadSnapshot[],
): Array<[string, ArchivedThreadSnapshot[]]> {
  const groups = new Map<string, ArchivedThreadSnapshot[]>()
  for (const thread of threads) {
    const workspace = thread.workspace?.trim() || ''
    const key = workspace || workspaceLabelFromPath('')
    const existing = groups.get(key) ?? []
    existing.push(thread)
    groups.set(key, existing)
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b))
}

const NOW = Date.now()

export const ARCHIVED_THREADS_PREVIEW: ArchivedThreadSnapshot[] = [
  {
    id: 'arch-1',
    title: 'Refactor sidebar layout',
    preview: 'Can we match Kun’s workspace picker spacing in the footer row?',
    workspace: '/Users/season/Personal/navi',
    model: 'claude-sonnet-4',
    updatedAt: NOW - 1000 * 60 * 45,
    archived: true,
  },
  {
    id: 'arch-2',
    title: 'Port ContextCapacityPopover',
    preview: 'Segmented bar colors should stay as literal hex values.',
    workspace: '/Users/season/Personal/navi',
    model: 'gpt-4.1',
    updatedAt: NOW - 1000 * 60 * 60 * 6,
    archived: true,
  },
  {
    id: 'arch-3',
    title: 'Voice recording strip polish',
    preview: 'Waveform canvas should read color from computed style.',
    workspace: '/Users/season/Personal/Kun',
    model: 'auto',
    updatedAt: NOW - 1000 * 60 * 60 * 28,
    archived: true,
  },
  {
    id: 'arch-4',
    title: 'Settings sidebar categories',
    preview: 'Active pill uses subtle surface plus inset ring.',
    workspace: '/Users/season/Personal/Kun',
    model: 'claude-opus-4',
    updatedAt: NOW - 1000 * 60 * 60 * 72,
    archived: true,
  },
]

export const ARCHIVED_THREADS_PREVIEW_SINGLE: ArchivedThreadSnapshot[] = [
  {
    id: 'arch-single',
    title: 'Single archived thread',
    preview: 'Only one archived conversation in this workspace.',
    workspace: '/Users/season/Personal/navi',
    model: 'auto',
    updatedAt: NOW - 1000 * 60 * 20,
    archived: true,
  },
]

type Props = {
  threads: ArchivedThreadSnapshot[]
  runtimeReady?: boolean
  locale?: string
  initialQuery?: string
  onOpenThread?: (threadId: string) => void
  onRestoreThread?: (threadId: string) => void
  onDeleteThread?: (thread: ArchivedThreadSnapshot) => void
}

export function ArchivedThreadsSettingsSection({
  threads,
  runtimeReady = true,
  locale = 'en-US',
  initialQuery = '',
  onOpenThread,
  onRestoreThread,
  onDeleteThread,
}: Props): ReactElement {
  const [query, setQuery] = useState(initialQuery)
  const [busyThreadIds, setBusyThreadIds] = useState<Record<string, boolean>>({})

  const archivedThreads = useMemo(
    () => filterArchivedThreads(threads, query),
    [query, threads],
  )
  const groups = useMemo(() => groupArchivedThreads(archivedThreads), [archivedThreads])
  const totalArchived = threads.filter((thread) => thread.archived === true).length

  const runThreadAction = async (
    threadId: string,
    action: () => void | Promise<void>,
  ): Promise<void> => {
    setBusyThreadIds((current) => ({ ...current, [threadId]: true }))
    try {
      await action()
    } finally {
      setBusyThreadIds((current) => {
        const next = { ...current }
        delete next[threadId]
        return next
      })
    }
  }

  const emptyMessage = !runtimeReady
    ? COPY.archivesOffline
    : query.trim()
      ? COPY.archivesSearchEmpty
      : COPY.archivesEmpty

  return (
    <SettingsCard title={COPY.archivesTitle}>
      <SettingRow
        title={COPY.archivesOverview}
        description={COPY.archivesOverviewDesc}
        wideControl
        control={
          <div className="archived-threads-control">
            <div className="archived-threads-toolbar">
              <label className="archived-threads-search">
                <Search className="archived-threads-search-icon" strokeWidth={1.75} />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={COPY.archivesSearchPlaceholder}
                  className="archived-threads-search-input"
                />
              </label>
              <div className="archived-threads-count">
                <Archive className="archived-threads-count-icon" strokeWidth={1.75} />
                {COPY.archivesCount(totalArchived)}
              </div>
            </div>

            {groups.length === 0 ? (
              <div className="archived-threads-empty">
                <Archive className="archived-threads-empty-icon" strokeWidth={1.5} />
                <div className="archived-threads-empty-text">{emptyMessage}</div>
              </div>
            ) : (
              <div className="archived-threads-groups">
                {groups.map(([workspace, items]) => (
                  <div key={workspace} className="archived-threads-group">
                    <div className="archived-threads-group-header">
                      <div className="archived-threads-group-label">
                        <Folder className="archived-threads-group-icon" strokeWidth={1.75} />
                        <span className="archived-threads-group-name">
                          {workspaceLabelFromPath(workspace)}
                        </span>
                      </div>
                      <span>{COPY.archivesWorkspaceCount(items.length)}</span>
                    </div>
                    {items.map((thread) => {
                      const busy = busyThreadIds[thread.id] === true
                      return (
                        <div key={thread.id} className="archived-threads-row">
                          <button
                            type="button"
                            className="archived-threads-row-open"
                            onClick={() =>
                              void runThreadAction(thread.id, () => onOpenThread?.(thread.id))
                            }
                          >
                            <div className="archived-threads-row-title">
                              {thread.title || COPY.archivesUntitled}
                            </div>
                            <div className="archived-threads-row-meta">
                              <span>{formatRelativeTime(thread.updatedAt, locale)}</span>
                              <span className="archived-threads-row-dot">·</span>
                              <span className="archived-threads-row-model">
                                {thread.model || 'auto'}
                              </span>
                            </div>
                            {thread.preview ? (
                              <div className="archived-threads-row-preview">{thread.preview}</div>
                            ) : null}
                          </button>
                          <div className="archived-threads-row-actions">
                            <button
                              type="button"
                              disabled={busy || !runtimeReady}
                              onClick={() =>
                                void runThreadAction(thread.id, () =>
                                  onRestoreThread?.(thread.id),
                                )
                              }
                              className="archived-threads-restore"
                            >
                              <RotateCcw className="archived-threads-restore-icon" strokeWidth={1.8} />
                              {COPY.archivesRestore}
                            </button>
                            <button
                              type="button"
                              disabled={busy || !runtimeReady}
                              onClick={() =>
                                void runThreadAction(thread.id, () => onDeleteThread?.(thread))
                              }
                              aria-label={COPY.archivesDelete}
                              title={COPY.archivesDelete}
                              className="archived-threads-delete"
                            >
                              <Trash2 className="archived-threads-delete-icon" strokeWidth={1.8} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}

            <p className="archived-threads-footer">{COPY.archivesFooterHint}</p>
          </div>
        }
      />
    </SettingsCard>
  )
}

export type ArchivedThreadsPreviewMode =
  | 'default'
  | 'empty'
  | 'search'
  | 'offline'
  | 'single'

export function ArchivedThreadsSettingsSectionPreview({
  mode = 'default',
}: {
  mode?: ArchivedThreadsPreviewMode
}): ReactElement {
  const threads =
    mode === 'empty'
      ? []
      : mode === 'single'
        ? ARCHIVED_THREADS_PREVIEW_SINGLE
        : ARCHIVED_THREADS_PREVIEW

  return (
    <ArchivedThreadsSettingsSection
      threads={threads}
      runtimeReady={mode !== 'offline'}
      initialQuery={mode === 'search' ? 'nonexistent query' : ''}
    />
  )
}
