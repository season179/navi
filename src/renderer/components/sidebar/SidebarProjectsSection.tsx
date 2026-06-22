// Projects section echoing Kun's SidebarProjectsSection
// (../Kun/src/renderer/src/components/chat/SidebarProjectsSection.tsx).
// Visual only: mock workspace/thread snapshots and preview modes.

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactElement,
} from 'react'
import {
  Archive,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Folder,
  FolderOpen,
  FolderPlus,
  GitFork,
  Loader2,
  PencilLine,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { formatRelativeTime } from '../../lib/format-relative-time'
import {
  SidebarIconButton,
  SidebarSearchField,
  SidebarTreeRow,
} from './SidebarPrimitives'

export type SidebarThreadSnapshot = {
  id: string
  title: string
  updatedAt: string
  archived?: boolean
  forkedFromThreadId?: string
  forkedFromTitle?: string
  status?: string
}

export type SidebarDraftHistorySnapshot = {
  id: string
  title: string
  relativePath: string
  source: 'remembered' | 'disk'
}

export type SidebarWorkspaceGroup = {
  workspacePath: string
  projectId?: string
  threads: SidebarThreadSnapshot[]
  draftHistory?: SidebarDraftHistorySnapshot[]
}

export type SidebarProjectsPreviewMode =
  | 'default'
  | 'empty'
  | 'search'
  | 'multiWorkspace'
  | 'running'
  | 'forked'
  | 'renameDialog'
  | 'contextMenu'

const COPY = {
  sidebarProjects: 'Projects',
  sidebarSearchThreads: 'Search threads',
  clear: 'Clear',
  changeWorkspace: 'Change workspace',
  selectWorkspace: 'Select workspace',
  sidebarWorkspaceNewThread: 'New thread',
  sidebarWorkspaceRemove: 'Remove workspace',
  sidebarEmptyTitle: 'No projects yet',
  sidebarEmptySub: 'Start a new agent or pick a workspace to begin.',
  sidebarEmptySubOffline: 'Connect a provider to start chatting.',
  sidebarThreadUnread: 'Unread',
  sidebarThreadForked: 'Forked thread',
  sidebarThreadForkedFrom: (title: string) => `Forked from ${title}`,
  sidebarThreadForkBadge: 'Fork',
  sidebarThreadRename: 'Rename thread',
  sidebarThreadRenamePrompt: 'Enter a new title for this thread.',
  sidebarThreadArchive: 'Archive',
  sidebarThreadDelete: 'Delete',
  cancel: 'Cancel',
  confirm: 'Confirm',
  sddDraftHistoryTitle: 'Requirement drafts',
  sddDraftHistoryExpand: 'Expand drafts',
  sddDraftHistoryCollapse: 'Collapse drafts',
  sddDraftHistoryRemembered: 'Recent',
  sddDraftHistoryDisk: 'On disk',
  sddDraftHistoryOpen: (title: string) => `Open ${title}`,
}

const PREVIEW_WORKSPACE = '/Users/season/projects/navi'
const PREVIEW_WORKSPACE_ALT = '/Users/season/projects/blog'

const PREVIEW_THREADS: SidebarThreadSnapshot[] = [
  {
    id: 'thread-1',
    title: 'Refactor sidebar layout',
    updatedAt: '2026-06-22T10:30:00.000Z',
  },
  {
    id: 'thread-2',
    title: 'Port Kun settings sections',
    updatedAt: '2026-06-21T18:15:00.000Z',
  },
  {
    id: 'thread-3',
    title: 'Review plugin marketplace UI',
    updatedAt: '2026-06-20T09:00:00.000Z',
  },
]

const PREVIEW_DRAFTS: SidebarDraftHistorySnapshot[] = [
  {
    id: 'draft-1',
    title: 'Mobile onboarding flow',
    relativePath: '.sdd/drafts/mobile-onboarding.md',
    source: 'remembered',
  },
]

function workspaceLabelFromPath(workspacePath: string): string {
  const normalized = workspacePath.replace(/[/\\]+$/, '')
  const parts = normalized.split(/[/\\]/).filter(Boolean)
  return parts[parts.length - 1] || normalized
}

function workspaceContextLabel(workspacePath: string, folderName: string): string {
  const normalized = workspacePath.replace(/[/\\]+$/, '')
  const parts = normalized.split(/[/\\]/).filter(Boolean)
  if (parts.length < 2) return ''
  const parent = parts[parts.length - 2] ?? ''
  if (!parent || parent.toLowerCase() === folderName.toLowerCase()) return ''
  return parent
}

function ThreadActivityDot({
  running,
  unread,
}: {
  running: boolean
  unread: boolean
}): ReactElement | null {
  if (running) {
    return <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-accent" strokeWidth={2} />
  }
  if (unread) {
    return (
      <span
        className="block h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_0_1px_rgba(79,124,255,0.2)]"
        title={COPY.sidebarThreadUnread}
      />
    )
  }
  return null
}

function SddDraftHistoryRows({
  items,
  activeDraftId,
}: {
  items: SidebarDraftHistorySnapshot[]
  activeDraftId: string
}): ReactElement | null {
  const [collapsed, setCollapsed] = useState(true)
  if (items.length === 0) return null

  return (
    <div className="mb-1.5 rounded-lg border border-transparent bg-[var(--ds-sidebar-row-hover)]/35 px-1 py-1">
      <SidebarTreeRow
        title={COPY.sddDraftHistoryTitle}
        ariaLabel={collapsed ? COPY.sddDraftHistoryExpand : COPY.sddDraftHistoryCollapse}
        onClick={() => setCollapsed((current) => !current)}
        className="min-h-[28px]"
        buttonClassName="items-center gap-1.5 px-2 py-1.5"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 shrink-0 text-ds-faint" strokeWidth={2} />
        ) : (
          <ChevronDown className="h-3 w-3 shrink-0 text-ds-faint" strokeWidth={2} />
        )}
        <span className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-ds-faint">
          {COPY.sddDraftHistoryTitle}
        </span>
        <span className="shrink-0 rounded-md bg-ds-card/70 px-1.5 py-0.5 text-[10.5px] text-ds-faint tabular-nums">
          {items.length}
        </span>
      </SidebarTreeRow>
      {!collapsed ? (
        <div className="space-y-[2px] pt-1">
          {items.map((item) => (
            <SidebarTreeRow
              key={item.id}
              active={activeDraftId === item.id}
              activeVariant="outline"
              actionsVisibility="hidden"
              actionsLayout="overlay"
              className="min-h-[32px]"
              buttonClassName="items-center gap-2 px-2 py-1.5"
              title={item.relativePath}
              ariaLabel={COPY.sddDraftHistoryOpen(item.title)}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border transition ${
                  activeDraftId === item.id
                    ? 'border-accent/25 bg-accent/10 text-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]'
                    : 'border-ds-border-muted bg-ds-card/70 text-ds-faint group-hover:border-accent/20 group-hover:bg-accent/10 group-hover:text-accent'
                }`}
                aria-hidden="true"
              >
                <ClipboardList className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] leading-4 text-ds-ink">{item.title}</span>
                <span className="block truncate text-[11.5px] leading-4 text-ds-faint">{item.relativePath}</span>
              </span>
              <span className="shrink-0 rounded-md bg-ds-card/70 px-1.5 py-0.5 text-[10.5px] text-ds-faint transition group-hover:opacity-0 group-focus-within:opacity-0">
                {item.source === 'remembered' ? COPY.sddDraftHistoryRemembered : COPY.sddDraftHistoryDisk}
              </span>
            </SidebarTreeRow>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ThreadRow({
  thread,
  active,
  locale,
  showRunning,
  showUnread,
  onSelect,
  onDelete,
}: {
  thread: SidebarThreadSnapshot
  active: boolean
  locale: string
  showRunning: boolean
  showUnread: boolean
  onSelect?: () => void
  onDelete?: () => void
}): ReactElement {
  const forked = Boolean(thread.forkedFromThreadId)
  const forkLabel = forked
    ? thread.forkedFromTitle
      ? COPY.sidebarThreadForkedFrom(thread.forkedFromTitle)
      : COPY.sidebarThreadForked
    : ''
  const updatedLabel = formatRelativeTime(Date.parse(thread.updatedAt), locale)
  const showUnreadDot = showUnread && !showRunning

  return (
    <SidebarTreeRow
      active={active}
      onClick={onSelect}
      actionsVisibility="hidden"
      actionsLayout="overlay"
      actions={
        <>
          <SidebarIconButton
            tone="accent"
            title={COPY.sidebarThreadArchive}
            ariaLabel={COPY.sidebarThreadArchive}
            stopPropagation
          >
            <Archive className="h-3 w-3" strokeWidth={1.9} />
          </SidebarIconButton>
          <SidebarIconButton
            tone="danger"
            title={COPY.sidebarThreadDelete}
            ariaLabel={COPY.sidebarThreadDelete}
            stopPropagation
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" strokeWidth={1.9} />
          </SidebarIconButton>
        </>
      }
      className="min-h-[34px]"
      buttonClassName="items-center gap-2 px-2.5 py-1.5"
      ariaLabel={[thread.title, updatedLabel].filter(Boolean).join(' — ')}
      title={forkLabel ? `${thread.title}\n${forkLabel}` : thread.title}
    >
      {forked ? (
        <GitFork
          className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-accent' : 'text-ds-faint/90'}`}
          strokeWidth={1.8}
        />
      ) : null}
      <span className="flex min-w-0 flex-1 items-center gap-1.5">
        <span
          className={`min-w-0 flex-1 truncate text-[13.5px] leading-5 ${
            showUnreadDot && !active ? 'font-semibold text-ds-ink' : 'text-ds-ink'
          }`}
        >
          {thread.title}
        </span>
        {forked ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-accent/15 bg-accent/8 px-1.5 py-0.5 text-[10.5px] font-semibold leading-none text-accent">
            <GitFork className="h-2.5 w-2.5" strokeWidth={1.8} />
            {COPY.sidebarThreadForkBadge}
          </span>
        ) : null}
        <span className="ml-auto flex shrink-0 items-center gap-1.5 transition group-hover:opacity-0 group-focus-within:opacity-0">
          <span className="shrink-0 text-right text-[12px] leading-4 text-ds-faint tabular-nums">
            {updatedLabel}
          </span>
          <ThreadActivityDot running={showRunning} unread={showUnreadDot} />
        </span>
      </span>
    </SidebarTreeRow>
  )
}

function ThreadRenameDialog({ title, onClose }: { title: string; onClose: () => void }): ReactElement {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="thread-rename-dialog-title"
      className="ds-no-drag fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/18 px-4 backdrop-blur-[2px] dark:bg-black/35"
      onMouseDown={onClose}
    >
      <form
        onSubmit={(event: FormEvent) => event.preventDefault()}
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-[24px] border border-ds-border bg-ds-card p-5 shadow-[0_24px_72px_rgba(20,47,95,0.22)]"
      >
        <h2
          id="thread-rename-dialog-title"
          className="text-[18px] font-semibold tracking-[-0.035em] text-ds-ink"
        >
          {COPY.sidebarThreadRename}
        </h2>
        <p className="mt-2 text-[13px] leading-6 text-ds-muted">{COPY.sidebarThreadRenamePrompt}</p>
        <input
          autoFocus
          defaultValue={title}
          className="mt-4 w-full rounded-xl border border-ds-border bg-ds-main/65 px-3 py-2 text-[14px] text-ds-ink outline-none transition focus:border-accent/40 focus:ring-1 focus:ring-accent/25"
        />
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-ds-border bg-ds-card px-3 py-2 text-[13px] font-medium text-ds-muted transition hover:bg-ds-hover hover:text-ds-ink"
          >
            {COPY.cancel}
          </button>
          <button
            type="submit"
            className="rounded-xl bg-accent px-3 py-2 text-[13px] font-semibold text-white transition hover:brightness-110"
          >
            {COPY.confirm}
          </button>
        </div>
      </form>
    </div>
  )
}

function ThreadContextMenu({
  threadTitle,
  x,
  y,
}: {
  threadTitle: string
  x: number
  y: number
}): ReactElement {
  return (
    <div
      role="menu"
      aria-label={threadTitle}
      className="ds-thread-context-menu ds-no-drag fixed z-50 min-w-[168px] rounded-lg border border-ds-border bg-ds-card/98 p-1 text-[13px] text-ds-ink shadow-[0_16px_42px_rgba(20,47,95,0.16)] backdrop-blur-xl dark:bg-ds-card"
      style={{ left: x, top: y }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        role="menuitem"
        className="flex min-h-[30px] w-full items-center gap-2 rounded-md px-2 text-left text-ds-ink transition hover:bg-[var(--ds-sidebar-row-hover)]"
      >
        <PencilLine className="h-3.5 w-3.5" strokeWidth={1.9} />
        <span>{COPY.sidebarThreadRename}</span>
      </button>
      <button
        type="button"
        role="menuitem"
        className="flex min-h-[30px] w-full items-center gap-2 rounded-md px-2 text-left text-ds-ink transition hover:bg-[var(--ds-sidebar-row-hover)]"
      >
        <Archive className="h-3.5 w-3.5" strokeWidth={1.9} />
        <span>{COPY.sidebarThreadArchive}</span>
      </button>
      <div className="my-1 h-px bg-ds-border-muted" />
      <button
        type="button"
        role="menuitem"
        className="flex min-h-[30px] w-full items-center gap-2 rounded-md px-2 text-left text-red-600 transition hover:bg-red-500/10 dark:text-red-300"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
        <span>{COPY.sidebarThreadDelete}</span>
      </button>
    </div>
  )
}

export function previewWorkspaceGroups(mode: SidebarProjectsPreviewMode): SidebarWorkspaceGroup[] {
  if (mode === 'empty') return []
  if (mode === 'multiWorkspace') {
    return [
      {
        workspacePath: PREVIEW_WORKSPACE,
        threads: PREVIEW_THREADS,
        draftHistory: PREVIEW_DRAFTS,
      },
      {
        workspacePath: PREVIEW_WORKSPACE_ALT,
        threads: [
          {
            id: 'thread-alt-1',
            title: 'Blog post draft',
            updatedAt: '2026-06-19T14:00:00.000Z',
          },
        ],
      },
    ]
  }
  if (mode === 'running') {
    return [
      {
        workspacePath: PREVIEW_WORKSPACE,
        threads: PREVIEW_THREADS.map((thread, index) =>
          index === 0 ? { ...thread, status: 'running' } : thread,
        ),
        draftHistory: PREVIEW_DRAFTS,
      },
    ]
  }
  if (mode === 'forked') {
    return [
      {
        workspacePath: PREVIEW_WORKSPACE,
        threads: [
          {
            id: 'thread-fork',
            title: 'Explore auth refactor options',
            updatedAt: '2026-06-22T08:00:00.000Z',
            forkedFromThreadId: 'thread-1',
            forkedFromTitle: 'Refactor sidebar layout',
          },
          ...PREVIEW_THREADS.slice(1),
        ],
        draftHistory: PREVIEW_DRAFTS,
      },
    ]
  }
  return [
    {
      workspacePath: PREVIEW_WORKSPACE,
      threads: PREVIEW_THREADS,
      draftHistory: PREVIEW_DRAFTS,
    },
  ]
}

export function SidebarProjectsSection({
  groups,
  activeThreadId,
  searchQuery = '',
  searchVisible = false,
  runtimeReady = true,
  hasWorkspace = true,
  activeDraftId = 'draft-1',
  showRenameDialog = false,
  showContextMenu = false,
  onSearchQueryChange,
  onCreateProject,
  onProjectClick,
  onDeleteProject,
  onSelectThread,
  onDeleteThread,
  onNewThreadInProject,
  deletableProjectIds,
}: {
  groups: SidebarWorkspaceGroup[]
  activeThreadId: string | null
  searchQuery?: string
  searchVisible?: boolean
  runtimeReady?: boolean
  hasWorkspace?: boolean
  activeDraftId?: string
  showRenameDialog?: boolean
  showContextMenu?: boolean
  onSearchQueryChange?: (value: string) => void
  onCreateProject?: () => void
  onProjectClick?: (projectId: string) => void
  onDeleteProject?: (projectId: string) => void
  onSelectThread?: (threadId: string) => void
  onDeleteThread?: (threadId: string) => void
  onNewThreadInProject?: (projectId: string) => void
  deletableProjectIds?: ReadonlySet<string>
}): ReactElement {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [searchOpen, setSearchOpen] = useState(searchVisible)
  const [query, setQuery] = useState(searchQuery)
  const locale = typeof navigator !== 'undefined' ? navigator.language || 'en' : 'en'

  const searchShown = searchOpen || query.trim().length > 0
  const allGroupsCollapsed =
    groups.length > 0 && groups.every((group) => collapsed[group.workspacePath] === true)

  const handleQueryChange = (value: string): void => {
    setQuery(value)
    onSearchQueryChange?.(value)
  }

  return (
    <div className="ds-no-drag flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-[38px] items-center justify-between px-2 pb-1.5 pt-3">
        <button
          type="button"
          onClick={() => {
            if (allGroupsCollapsed) {
              setCollapsed({})
              return
            }
            setCollapsed(Object.fromEntries(groups.map((group) => [group.workspacePath, true])))
          }}
          className="flex min-w-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-ds-faint transition hover:bg-[var(--ds-sidebar-row-hover)] hover:text-ds-muted"
          title={COPY.sidebarProjects}
          aria-label={COPY.sidebarProjects}
        >
          <span className="truncate">{COPY.sidebarProjects}</span>
          {allGroupsCollapsed ? (
            <ChevronRight className="h-3 w-3 shrink-0" strokeWidth={2} />
          ) : (
            <ChevronDown className="h-3 w-3 shrink-0" strokeWidth={2} />
          )}
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <SidebarIconButton
            onClick={() => setSearchOpen((open) => !open)}
            active={searchShown}
            className="h-7 w-7"
            title={COPY.sidebarSearchThreads}
            ariaLabel={COPY.sidebarSearchThreads}
          >
            <Search className="h-3.5 w-3.5" strokeWidth={1.85} />
          </SidebarIconButton>
          <SidebarIconButton
            className="h-7 w-7"
            title={COPY.changeWorkspace}
            ariaLabel={COPY.changeWorkspace}
            onClick={onCreateProject}
          >
            <FolderPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
          </SidebarIconButton>
        </div>
      </div>

      {searchShown ? (
        <div className="mb-2 flex items-center gap-1 px-2">
          <SidebarSearchField
            value={query}
            onChange={handleQueryChange}
            placeholder={COPY.sidebarSearchThreads}
            clearLabel={COPY.clear}
          />
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-2 pt-0.5">
        {groups.length === 0 ? (
          hasWorkspace && runtimeReady ? (
            <button
              type="button"
              className="mx-1 mt-1 flex w-[calc(100%-0.5rem)] items-center gap-2 rounded-lg px-2 py-1.5 text-left text-ds-muted transition hover:bg-[var(--ds-sidebar-row-hover)] hover:text-ds-ink"
            >
              <FolderPlus className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
              <span className="min-w-0 flex-1 truncate text-[14px] font-medium">
                {COPY.selectWorkspace}
              </span>
            </button>
          ) : (
            <div className="mx-2 mt-2 rounded-lg px-2 py-2">
              <p className="text-[15px] font-medium text-ds-muted">{COPY.sidebarEmptyTitle}</p>
              <p className="mt-1 text-[13px] leading-5 text-ds-faint">
                {runtimeReady ? COPY.sidebarEmptySub : COPY.sidebarEmptySubOffline}
              </p>
            </div>
          )
        ) : null}

        {groups.map((group) => {
          const folderName = workspaceLabelFromPath(group.workspacePath)
          const workspaceContext = workspaceContextLabel(group.workspacePath, folderName)
          const isCollapsed = collapsed[group.workspacePath] === true
          return (
            <div key={group.workspacePath} className="mb-2">
              <SidebarTreeRow
                title={group.workspacePath}
                onClick={() => {
                  if (group.projectId) onProjectClick?.(group.projectId)
                  setCollapsed((current) => ({
                    ...current,
                    [group.workspacePath]: !current[group.workspacePath],
                  }))
                }}
                className="min-h-[36px] text-[13.5px]"
                buttonClassName="items-center gap-2 px-2.5 py-2"
                actionsVisibility="hidden"
                actionsLayout="overlay"
                actions={
                  <>
                    {group.projectId && onNewThreadInProject ? (
                      <SidebarIconButton
                        title={COPY.sidebarWorkspaceNewThread}
                        ariaLabel={COPY.sidebarWorkspaceNewThread}
                        className="h-6 w-6"
                        stopPropagation
                        onClick={() => onNewThreadInProject(group.projectId!)}
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={1.9} />
                      </SidebarIconButton>
                    ) : (
                      <SidebarIconButton
                        title={COPY.sidebarWorkspaceNewThread}
                        ariaLabel={COPY.sidebarWorkspaceNewThread}
                        className="h-6 w-6"
                        stopPropagation
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={1.9} />
                      </SidebarIconButton>
                    )}
                    {group.projectId &&
                    onDeleteProject &&
                    deletableProjectIds?.has(group.projectId) ? (
                      <SidebarIconButton
                        title={COPY.sidebarWorkspaceRemove}
                        ariaLabel={COPY.sidebarWorkspaceRemove}
                        tone="danger"
                        className="h-6 w-6"
                        stopPropagation
                        onClick={() => onDeleteProject(group.projectId!)}
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                      </SidebarIconButton>
                    ) : onDeleteProject ? null : (
                      <SidebarIconButton
                        title={COPY.sidebarWorkspaceRemove}
                        ariaLabel={COPY.sidebarWorkspaceRemove}
                        tone="danger"
                        className="h-6 w-6"
                        stopPropagation
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                      </SidebarIconButton>
                    )}
                  </>
                }
              >
                {isCollapsed ? (
                  <Folder className="h-4 w-4 shrink-0 text-ds-muted" strokeWidth={1.75} />
                ) : (
                  <FolderOpen className="h-4 w-4 shrink-0 text-ds-muted" strokeWidth={1.75} />
                )}
                <span className="min-w-0 flex-1 truncate">{folderName}</span>
                {workspaceContext ? (
                  <span className="min-w-0 max-w-[42%] shrink truncate text-[12.5px] text-ds-faint transition group-hover:opacity-0 group-focus-within:opacity-0">
                    {workspaceContext}
                  </span>
                ) : null}
              </SidebarTreeRow>

              {!isCollapsed ? (
                <div className="mt-1 space-y-[3px] pl-4">
                  <SddDraftHistoryRows
                    items={group.draftHistory ?? []}
                    activeDraftId={activeDraftId}
                  />
                  {group.threads.map((thread) => (
                    <ThreadRow
                      key={thread.id}
                      thread={thread}
                      active={activeThreadId === thread.id}
                      locale={locale}
                      showRunning={thread.status?.trim().toLowerCase() === 'running'}
                      showUnread={onSelectThread ? false : thread.id === 'thread-2'}
                      onSelect={onSelectThread ? () => onSelectThread(thread.id) : undefined}
                      onDelete={onDeleteThread ? () => onDeleteThread(thread.id) : undefined}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      {showRenameDialog ? (
        <ThreadRenameDialog title="Refactor sidebar layout" onClose={() => undefined} />
      ) : null}

      {showContextMenu ? (
        <ThreadContextMenu threadTitle="Refactor sidebar layout" x={180} y={280} />
      ) : null}
    </div>
  )
}

/** Standalone preview for ?sidebarProjectsPreview URL hooks. */
export function SidebarProjectsSectionPreview({
  mode,
}: {
  mode: SidebarProjectsPreviewMode
}): ReactElement {
  const groups = useMemo(() => previewWorkspaceGroups(mode), [mode])

  return (
    <div className="sidebar-projects-preview-wrap">
      <aside className="sidebar-projects-preview-shell">
        <SidebarProjectsSection
          groups={groups}
          activeThreadId="thread-1"
          searchQuery={mode === 'search' ? 'sidebar' : ''}
          searchVisible={mode === 'search'}
          showRenameDialog={mode === 'renameDialog'}
          showContextMenu={mode === 'contextMenu'}
        />
      </aside>
    </div>
  )
}
