// Write-mode sidebar echoing Kun's WriteSidebar
// (../Kun/src/renderer/src/components/write/WriteSidebar.tsx).
// Visual only: parent supplies mock workspace snapshots and optional callbacks.

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import {
  ChevronDown,
  ChevronRight,
  FilePlus2,
  Folder,
  FolderOpen,
  FolderPlus,
  Plus,
  RefreshCw,
  Settings,
  Smartphone,
  Trash2,
} from 'lucide-react'
import { WorkspaceModeTabs, type WorkspaceModeView } from './WorkspaceModeTabs'
import {
  WriteFileTree,
  WRITE_FILE_TREE_PREVIEW,
  type WriteFileTreeEntry,
} from './WriteFileTree'

export type WriteSidebarPreviewMode =
  | 'default'
  | 'empty'
  | 'multi'
  | 'error'
  | 'createFile'
  | 'deleteFile'

type EntryDialog =
  | { kind: 'create-file'; parentDirectory?: string; value: string }
  | { kind: 'create-folder'; parentDirectory?: string; value: string }
  | { kind: 'rename'; entry: WriteFileTreeEntry; value: string }
  | { kind: 'delete'; entry: WriteFileTreeEntry }

type WriteSidebarSnapshot = {
  activeView: WorkspaceModeView
  connectPhoneSidebarOpen: boolean
  defaultWorkspaceRoot: string
  workspaceRoots: string[]
  workspaceRoot: string
  settingsError: string | null
  rootDirectory: string
  entriesByDir: Record<string, WriteFileTreeEntry[]>
  expandedDirs: Set<string>
  loadingDirs: Record<string, boolean>
  treeError: string | null
  activeFilePath: string | null
  rootLoading: boolean
  collapsedWorkspaces: Record<string, boolean>
  entryDialog: EntryDialog | null
}

const PREVIEW_ROOT = '/Users/season/writing'
const PREVIEW_ROOT_ALT = '/Users/season/projects/blog'

const COPY = {
  appName: 'Navi',
  claw: 'Claw',
  settings: 'Settings',
  writeCreateFile: 'New file',
  writeAddWorkspace: 'Add workspace',
  writeSpaces: 'Workspaces',
  writeCreateFolder: 'New folder',
  writeRefreshWorkspace: 'Refresh workspace',
  writeRemoveWorkspace: 'Remove workspace',
  writeDefaultSpace: 'Default workspace',
  writeRenameEntry: 'Rename',
  writeDeleteFolder: 'Delete folder',
  writeDeleteFile: 'Delete file',
  writeEntryDialogCancel: 'Cancel',
  writeEntryDialogCreate: 'Create',
  writeEntryDialogRename: 'Rename',
  writeEntryDialogDelete: 'Delete',
  writeCreateFilePrompt: 'Enter a path relative to the workspace root.',
  writeCreateFolderPrompt: 'Enter a folder name or path.',
  writeRenameEntryPrompt: 'Enter a new name for this item.',
  writeDeleteFileConfirm: 'Delete "{{name}}"? This cannot be undone.',
  writeDeleteFolderConfirm: 'Delete folder "{{name}}" and everything inside? This cannot be undone.',
}

function normalizePath(value: string): string {
  return value.replaceAll('\\', '/').replace(/\/+$/, '')
}

function basenameFromPath(value: string): string {
  const normalized = normalizePath(value)
  const segments = normalized.split('/').filter(Boolean)
  return segments[segments.length - 1] || normalized
}

function collectExpandedPaths(rootDirectory: string, selectedFilePath: string | null): Set<string> {
  const next = new Set<string>([rootDirectory])
  if (!selectedFilePath) return next
  const normalized = normalizePath(selectedFilePath)
  const root = normalizePath(rootDirectory)
  let current = normalized
  while (current.startsWith(root) && current !== root) {
    const parent = current.slice(0, current.lastIndexOf('/'))
    if (parent && parent.length >= root.length) next.add(parent)
    current = parent
  }
  return next
}

function entryDialogTitle(dialog: EntryDialog): string {
  if (dialog.kind === 'create-file') return COPY.writeCreateFile
  if (dialog.kind === 'create-folder') return COPY.writeCreateFolder
  if (dialog.kind === 'rename') return COPY.writeRenameEntry
  return dialog.entry.type === 'directory' ? COPY.writeDeleteFolder : COPY.writeDeleteFile
}

function entryDialogSubmitLabel(dialog: EntryDialog): string {
  if (dialog.kind === 'rename') return COPY.writeEntryDialogRename
  if (dialog.kind === 'delete') return COPY.writeEntryDialogDelete
  return COPY.writeEntryDialogCreate
}

function entryDialogDescription(dialog: EntryDialog): string {
  if (dialog.kind === 'delete') {
    return dialog.entry.type === 'directory'
      ? COPY.writeDeleteFolderConfirm.replace('{{name}}', dialog.entry.name)
      : COPY.writeDeleteFileConfirm.replace('{{name}}', dialog.entry.name)
  }
  if (dialog.kind === 'rename') return COPY.writeRenameEntryPrompt
  if (dialog.kind === 'create-file') return COPY.writeCreateFilePrompt
  return COPY.writeCreateFolderPrompt
}

function previewSnapshot(mode: WriteSidebarPreviewMode): WriteSidebarSnapshot {
  const base = {
    activeView: 'write' as const,
    connectPhoneSidebarOpen: false,
    defaultWorkspaceRoot: PREVIEW_ROOT,
    rootDirectory: PREVIEW_ROOT,
    settingsError: null as string | null,
    entriesByDir: WRITE_FILE_TREE_PREVIEW.entriesByDir,
    expandedDirs: collectExpandedPaths(PREVIEW_ROOT, WRITE_FILE_TREE_PREVIEW.selectedFilePath),
    loadingDirs: WRITE_FILE_TREE_PREVIEW.loadingDirs,
    treeError: null as string | null,
    activeFilePath: WRITE_FILE_TREE_PREVIEW.selectedFilePath,
    rootLoading: false,
    collapsedWorkspaces: {} as Record<string, boolean>,
    entryDialog: null as EntryDialog | null,
  }

  if (mode === 'empty') {
    return {
      ...base,
      workspaceRoots: [],
      workspaceRoot: '',
      rootDirectory: '',
      entriesByDir: {},
      expandedDirs: new Set<string>(),
      activeFilePath: null,
    }
  }

  if (mode === 'multi') {
    return {
      ...base,
      workspaceRoots: [PREVIEW_ROOT, PREVIEW_ROOT_ALT],
      workspaceRoot: PREVIEW_ROOT,
      collapsedWorkspaces: { [PREVIEW_ROOT_ALT]: true },
    }
  }

  if (mode === 'error') {
    return {
      ...base,
      workspaceRoots: [PREVIEW_ROOT],
      workspaceRoot: PREVIEW_ROOT,
      settingsError: 'Could not load write workspace settings.',
    }
  }

  if (mode === 'createFile') {
    return {
      ...base,
      workspaceRoots: [PREVIEW_ROOT],
      workspaceRoot: PREVIEW_ROOT,
      entryDialog: { kind: 'create-file', value: 'drafts/untitled.md' },
    }
  }

  if (mode === 'deleteFile') {
    return {
      ...base,
      workspaceRoots: [PREVIEW_ROOT],
      workspaceRoot: PREVIEW_ROOT,
      entryDialog: {
        kind: 'delete',
        entry: {
          name: 'intro.md',
          path: `${PREVIEW_ROOT}/drafts/intro.md`,
          type: 'file',
          ext: '.md',
        },
      },
    }
  }

  return {
    ...base,
    workspaceRoots: [PREVIEW_ROOT],
    workspaceRoot: PREVIEW_ROOT,
  }
}

type SidebarCommandRowProps = {
  icon: ReactElement
  label: string
  onClick?: () => void
  variant?: 'flat' | 'accent' | 'footer'
  active?: boolean
}

function SidebarCommandRow({
  icon,
  label,
  onClick,
  variant = 'flat',
  active = false,
}: SidebarCommandRowProps): ReactElement {
  const className = [
    'write-sidebar-command-row',
    variant === 'accent' ? 'is-accent' : '',
    variant === 'footer' ? 'is-footer' : '',
    active ? 'is-active' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type="button" className={className} onClick={onClick}>
      <span className="write-sidebar-command-row-icon">{icon}</span>
      <span className="write-sidebar-command-row-label">{label}</span>
    </button>
  )
}

type SidebarIconButtonProps = {
  title: string
  children: ReactNode
  onClick?: () => void
  tone?: 'default' | 'accent' | 'danger'
  stopPropagation?: boolean
}

function SidebarIconButton({
  title,
  children,
  onClick,
  tone = 'default',
  stopPropagation = false,
}: SidebarIconButtonProps): ReactElement {
  return (
    <button
      type="button"
      className={[
        'write-sidebar-icon-btn',
        tone === 'accent' ? 'is-accent' : '',
        tone === 'danger' ? 'is-danger' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      title={title}
      aria-label={title}
      onPointerDown={(event) => {
        if (stopPropagation) event.stopPropagation()
      }}
      onClick={(event) => {
        if (stopPropagation) event.stopPropagation()
        onClick?.()
      }}
    >
      {children}
    </button>
  )
}

type SidebarTreeRowProps = {
  children: ReactNode
  title?: string
  onClick?: () => void
  active?: boolean
  actions?: ReactNode
  buttonClassName?: string
}

function SidebarTreeRow({
  children,
  title,
  onClick,
  active = false,
  actions,
  buttonClassName = '',
}: SidebarTreeRowProps): ReactElement {
  return (
    <div
      className={`write-sidebar-tree-row${active ? ' is-active' : ''}`}
      title={title}
    >
      <button
        type="button"
        className={`write-sidebar-tree-row-btn${buttonClassName ? ` ${buttonClassName}` : ''}`}
        onClick={onClick}
      >
        {children}
      </button>
      {actions ? <div className="write-sidebar-tree-row-actions">{actions}</div> : null}
    </div>
  )
}

function WriteEntryDialog({
  dialog,
  onClose,
  onValueChange,
  onSubmit,
}: {
  dialog: EntryDialog
  onClose: () => void
  onValueChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}): ReactElement {
  const deleting = dialog.kind === 'delete'
  return (
    <div className="write-entry-dialog-overlay" onMouseDown={onClose}>
      <form
        className="write-entry-dialog"
        onSubmit={onSubmit}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 className="write-entry-dialog-title">{entryDialogTitle(dialog)}</h2>
        <p className="write-entry-dialog-description">{entryDialogDescription(dialog)}</p>
        {!deleting ? (
          <input
            autoFocus
            value={dialog.value}
            onChange={(event) => onValueChange(event.target.value)}
            className="write-entry-dialog-input"
          />
        ) : null}
        <div className="write-entry-dialog-actions">
          <button type="button" className="write-entry-dialog-cancel" onClick={onClose}>
            {COPY.writeEntryDialogCancel}
          </button>
          <button
            type="submit"
            className={`write-entry-dialog-submit${deleting ? ' is-danger' : ''}`}
          >
            {entryDialogSubmitLabel(dialog)}
          </button>
        </div>
      </form>
    </div>
  )
}

type WriteSidebarProps = {
  snapshot: WriteSidebarSnapshot
  onToggleWorkspace?: (workspacePath: string) => void
  onSelectFile?: (path: string) => void
  onToggleDir?: (path: string) => void
  onEntryDialogChange?: (dialog: EntryDialog | null) => void
}

export function WriteSidebar({
  snapshot,
  onToggleWorkspace,
  onSelectFile,
  onToggleDir,
  onEntryDialogChange,
}: WriteSidebarProps): ReactElement {
  const {
    activeView,
    connectPhoneSidebarOpen,
    defaultWorkspaceRoot,
    workspaceRoots,
    workspaceRoot,
    settingsError,
    rootDirectory,
    entriesByDir,
    expandedDirs,
    loadingDirs,
    treeError,
    activeFilePath,
    rootLoading,
    collapsedWorkspaces,
    entryDialog,
  } = snapshot

  const handleEntryDialogValueChange = useCallback(
    (value: string) => {
      if (!entryDialog || entryDialog.kind === 'delete') return
      onEntryDialogChange?.({ ...entryDialog, value })
    },
    [entryDialog, onEntryDialogChange],
  )

  return (
    <>
      <aside className="write-sidebar-shell">
        <div className="write-sidebar-titlebar-spacer">
          <div className="write-sidebar-titlebar-row">
            <div aria-hidden className="write-sidebar-titlebar-safe" />
          </div>
        </div>

        <div className="write-sidebar-top">
          <WorkspaceModeTabs
            activeView={activeView}
            onCodeOpen={() => undefined}
            onWriteOpen={() => undefined}
          />
          <SidebarCommandRow
            icon={<FilePlus2 className="write-sidebar-action-icon" strokeWidth={1.9} />}
            label={COPY.writeCreateFile}
            variant="accent"
            onClick={() =>
              onEntryDialogChange?.({ kind: 'create-file', value: 'drafts/untitled.md' })
            }
          />
          <SidebarCommandRow
            icon={<FolderOpen className="write-sidebar-action-icon" strokeWidth={1.75} />}
            label={COPY.writeAddWorkspace}
          />
        </div>

        <div className="write-sidebar-divider" />

        <div className="write-sidebar-body">
          <div className="write-sidebar-section-header">
            <span className="write-sidebar-section-label">{COPY.writeSpaces}</span>
            <SidebarIconButton title={COPY.writeAddWorkspace} stopPropagation>
              <Plus className="write-sidebar-section-action-icon" strokeWidth={1.75} />
            </SidebarIconButton>
          </div>

          {settingsError ? <div className="write-sidebar-error">{settingsError}</div> : null}

          <div className="write-sidebar-scroll">
            {workspaceRoots.length === 0 ? (
              <button type="button" className="write-sidebar-empty-workspace-btn">
                <FolderOpen
                  className="write-sidebar-empty-workspace-icon"
                  strokeWidth={1.75}
                />
                <span className="write-sidebar-empty-workspace-label">{COPY.writeAddWorkspace}</span>
              </button>
            ) : null}

            {workspaceRoots.map((workspacePath) => {
              const active = workspacePath === workspaceRoot
              const collapsed = active ? collapsedWorkspaces[workspacePath] === true : true
              const removable = workspaceRoots.length > 1 && workspacePath !== defaultWorkspaceRoot
              return (
                <div key={workspacePath} className="write-sidebar-workspace-group">
                  <SidebarTreeRow
                    active={active}
                    title={workspacePath}
                    onClick={() => onToggleWorkspace?.(workspacePath)}
                    buttonClassName="write-sidebar-workspace-row-btn"
                    actions={
                      active || removable ? (
                        <>
                          {active ? (
                            <>
                              <SidebarIconButton
                                title={COPY.writeCreateFile}
                                tone="accent"
                                stopPropagation
                                onClick={() =>
                                  onEntryDialogChange?.({
                                    kind: 'create-file',
                                    value: 'drafts/untitled.md',
                                  })
                                }
                              >
                                <FilePlus2
                                  className="write-sidebar-section-action-icon"
                                  strokeWidth={1.75}
                                />
                              </SidebarIconButton>
                              <SidebarIconButton title={COPY.writeCreateFolder} stopPropagation>
                                <FolderPlus
                                  className="write-sidebar-section-action-icon"
                                  strokeWidth={1.75}
                                />
                              </SidebarIconButton>
                              <SidebarIconButton title={COPY.writeRefreshWorkspace} stopPropagation>
                                <RefreshCw
                                  className="write-sidebar-section-action-icon"
                                  strokeWidth={1.75}
                                />
                              </SidebarIconButton>
                            </>
                          ) : null}
                          {removable ? (
                            <SidebarIconButton
                              title={COPY.writeRemoveWorkspace}
                              tone="danger"
                              stopPropagation
                            >
                              <Trash2
                                className="write-sidebar-section-action-icon"
                                strokeWidth={1.9}
                              />
                            </SidebarIconButton>
                          ) : null}
                        </>
                      ) : undefined
                    }
                  >
                    {collapsed ? (
                      <ChevronRight
                        className="write-sidebar-workspace-chevron"
                        strokeWidth={2}
                      />
                    ) : (
                      <ChevronDown className="write-sidebar-workspace-chevron" strokeWidth={2} />
                    )}
                    {collapsed ? (
                      <Folder className="write-sidebar-workspace-folder-icon" strokeWidth={1.75} />
                    ) : (
                      <FolderOpen
                        className="write-sidebar-workspace-folder-icon"
                        strokeWidth={1.75}
                      />
                    )}
                    <span className="write-sidebar-workspace-name">
                      {basenameFromPath(workspacePath)}
                    </span>
                  </SidebarTreeRow>

                  {active && !collapsed ? (
                    <div className="write-sidebar-workspace-tree">
                      <div className="write-sidebar-workspace-path">
                        <span className="write-sidebar-workspace-path-text" title={workspacePath}>
                          {workspacePath === defaultWorkspaceRoot
                            ? COPY.writeDefaultSpace
                            : workspacePath}
                        </span>
                      </div>
                      <WriteFileTree
                        rootDirectory={rootDirectory}
                        entriesByDir={entriesByDir}
                        expandedDirs={expandedDirs}
                        loadingDirs={loadingDirs}
                        selectedFilePath={activeFilePath}
                        error={treeError}
                        rootLoading={rootLoading}
                        showHeader={false}
                        showRootLabel={false}
                        onToggleDir={onToggleDir}
                        onSelectFile={onSelectFile}
                        onCreateFile={() =>
                          onEntryDialogChange?.({ kind: 'create-file', value: 'untitled.md' })
                        }
                        onRenameEntry={(entry) =>
                          onEntryDialogChange?.({ kind: 'rename', entry, value: entry.name })
                        }
                        onDeleteEntry={(entry) =>
                          onEntryDialogChange?.({ kind: 'delete', entry })
                        }
                      />
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>

        <div className="write-sidebar-footer">
          <SidebarCommandRow
            icon={<Smartphone className="write-sidebar-action-icon" strokeWidth={1.75} />}
            label={COPY.claw}
            variant="footer"
            active={connectPhoneSidebarOpen}
          />
          <SidebarCommandRow
            icon={<Settings className="write-sidebar-action-icon" strokeWidth={1.75} />}
            label={COPY.settings}
            variant="footer"
          />
        </div>
      </aside>

      {entryDialog ? (
        <WriteEntryDialog
          dialog={entryDialog}
          onClose={() => onEntryDialogChange?.(null)}
          onValueChange={handleEntryDialogValueChange}
          onSubmit={(event) => {
            event.preventDefault()
            onEntryDialogChange?.(null)
          }}
        />
      ) : null}
    </>
  )
}

type PreviewProps = {
  mode: WriteSidebarPreviewMode
}

/** Full sidebar preview shell for ?writeSidebarPreview URL hooks. */
export function WriteSidebarPreview({ mode }: PreviewProps): ReactElement {
  const initialSnapshot = useMemo(() => previewSnapshot(mode), [mode])
  const [workspaceRoot, setWorkspaceRoot] = useState(initialSnapshot.workspaceRoot)
  const [collapsedWorkspaces, setCollapsedWorkspaces] = useState(initialSnapshot.collapsedWorkspaces)
  const [selectedFilePath, setSelectedFilePath] = useState(initialSnapshot.activeFilePath)
  const [expandedDirs, setExpandedDirs] = useState(initialSnapshot.expandedDirs)
  const [entryDialog, setEntryDialog] = useState(initialSnapshot.entryDialog)

  useEffect(() => {
    const snapshot = previewSnapshot(mode)
    setWorkspaceRoot(snapshot.workspaceRoot)
    setCollapsedWorkspaces(snapshot.collapsedWorkspaces)
    setSelectedFilePath(snapshot.activeFilePath)
    setExpandedDirs(snapshot.expandedDirs)
    setEntryDialog(snapshot.entryDialog)
  }, [mode])

  const snapshot = useMemo(
    (): WriteSidebarSnapshot => ({
      ...initialSnapshot,
      workspaceRoot,
      collapsedWorkspaces,
      activeFilePath: selectedFilePath,
      expandedDirs,
      entryDialog,
    }),
    [
      initialSnapshot,
      workspaceRoot,
      collapsedWorkspaces,
      selectedFilePath,
      expandedDirs,
      entryDialog,
    ],
  )

  const handleToggleWorkspace = useCallback(
    (workspacePath: string) => {
      if (workspacePath !== workspaceRoot) {
        setWorkspaceRoot(workspacePath)
        setCollapsedWorkspaces((current) => ({ ...current, [workspacePath]: false }))
        return
      }
      setCollapsedWorkspaces((current) => ({
        ...current,
        [workspacePath]: current[workspacePath] !== true,
      }))
    },
    [workspaceRoot],
  )

  return (
    <div className="write-sidebar-preview-wrap">
      <WriteSidebar
        snapshot={snapshot}
        onToggleWorkspace={handleToggleWorkspace}
        onSelectFile={setSelectedFilePath}
        onToggleDir={(path) => {
          setExpandedDirs((current) => {
            const next = new Set(current)
            if (next.has(path)) next.delete(path)
            else next.add(path)
            return next
          })
        }}
        onEntryDialogChange={setEntryDialog}
      />
    </div>
  )
}
