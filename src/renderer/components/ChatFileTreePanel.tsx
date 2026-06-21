// Workspace file tree panel echoing Kun's ChatFileTreePanel
// (../Kun/src/renderer/src/components/chat/ChatFileTreePanel.tsx).
// Visual only: parent supplies mock tree snapshots and optional action callbacks.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
} from 'react'
import {
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  Folder,
  FolderOpen,
  FolderSearch,
  Loader2,
  Plus,
  RefreshCw,
} from 'lucide-react'

export type ChatFileTreeEntry = {
  name: string
  path: string
  type: 'file' | 'directory'
}

export type ChatFileTreeReference = ChatFileTreeEntry & {
  relativePath: string
}

export type ChatFileTreePreviewMode =
  | 'default'
  | 'loading'
  | 'empty'
  | 'error'
  | 'noworkspace'

type Props = {
  workspaceRoot: string
  entries?: ChatFileTreeEntry[]
  selectedPath?: string | null
  loading?: boolean
  error?: string | null
  className?: string
  fill?: boolean
  onPreviewFile?: (path: string) => void
  onAddReference?: (reference: ChatFileTreeReference) => void
}

type ContextMenuState = {
  x: number
  y: number
  entry: ChatFileTreeEntry
} | null

const COPY = {
  fileTreeTitle: 'Files',
  fileTreeRefresh: 'Refresh file tree',
  fileTreeLoading: 'Loading files…',
  fileTreeEmpty: 'This workspace has no files yet.',
  fileTreeAddFileReference: 'Add file reference',
  fileTreeAddFolderReference: 'Add folder reference',
  fileTreeCopyAbsolutePath: 'Copy absolute path',
  fileTreeCopyRelativePath: 'Copy relative path',
  fileTreeRevealInFinder: 'Reveal in Finder',
  fileTreeRevealInFileManager: 'Reveal in file manager',
  fileTreeUnsupported: (name: string) => `${name} is not a supported text preview.`,
}

const PREVIEW_WORKSPACE = '/Users/season/Personal/navi'

const IGNORED_DIRS = new Set(['.git', '.hg', '.svn', 'node_modules'])

/** Sample tree for ?chatFileTreePanelPreview=1 visual verification. */
export const CHAT_FILE_TREE_PREVIEW_ENTRIES: ChatFileTreeEntry[] = [
  { name: 'AGENTS.md', path: `${PREVIEW_WORKSPACE}/AGENTS.md`, type: 'file' },
  { name: 'package.json', path: `${PREVIEW_WORKSPACE}/package.json`, type: 'file' },
  { name: 'src', path: `${PREVIEW_WORKSPACE}/src`, type: 'directory' },
  { name: 'main', path: `${PREVIEW_WORKSPACE}/src/main`, type: 'directory' },
  { name: 'main.ts', path: `${PREVIEW_WORKSPACE}/src/main/main.ts`, type: 'file' },
  { name: 'preload.ts', path: `${PREVIEW_WORKSPACE}/src/main/preload.ts`, type: 'file' },
  { name: 'renderer', path: `${PREVIEW_WORKSPACE}/src/renderer`, type: 'directory' },
  {
    name: 'components',
    path: `${PREVIEW_WORKSPACE}/src/renderer/components`,
    type: 'directory',
  },
  {
    name: 'Composer.tsx',
    path: `${PREVIEW_WORKSPACE}/src/renderer/components/Composer.tsx`,
    type: 'file',
  },
  {
    name: 'PlanPanel.tsx',
    path: `${PREVIEW_WORKSPACE}/src/renderer/components/PlanPanel.tsx`,
    type: 'file',
  },
  { name: 'routes', path: `${PREVIEW_WORKSPACE}/src/renderer/routes`, type: 'directory' },
  { name: 'home.tsx', path: `${PREVIEW_WORKSPACE}/src/renderer/routes/home.tsx`, type: 'file' },
  { name: 'logo.png', path: `${PREVIEW_WORKSPACE}/logo.png`, type: 'file' },
]

export const CHAT_FILE_TREE_PREVIEW = {
  workspaceRoot: PREVIEW_WORKSPACE,
  entries: CHAT_FILE_TREE_PREVIEW_ENTRIES,
  selectedPath: `${PREVIEW_WORKSPACE}/src/renderer/components/PlanPanel.tsx`,
  loading: false,
  error: null as string | null,
}

function normalizePath(path: string): string {
  return path.replaceAll('\\', '/').replace(/\/+$/g, '')
}

function pathKey(path: string): string {
  return normalizePath(path).toLowerCase()
}

function workspaceDisplayName(path: string): string {
  const normalized = normalizePath(path)
  const parts = normalized.split('/').filter(Boolean)
  return parts.at(-1) ?? path
}

function relativeWorkspacePath(path: string, workspaceRoot: string): string {
  const normalized = normalizePath(path)
  const root = normalizePath(workspaceRoot)
  if (!root || !normalized.startsWith(root)) return normalized
  const relative = normalized.slice(root.length).replace(/^\//, '')
  return relative || '.'
}

function isIgnoredDirectory(name: string): boolean {
  return IGNORED_DIRS.has(name.toLowerCase())
}

function isPreviewableEntry(entry: ChatFileTreeEntry): boolean {
  if (entry.type !== 'file') return false
  const ext = entry.name.split('.').pop()?.toLowerCase() ?? ''
  return ['ts', 'tsx', 'js', 'jsx', 'json', 'md', 'css', 'html', 'txt', 'yaml', 'yml'].includes(ext)
}

function buildChildrenMap(entries: ChatFileTreeEntry[]): Map<string, ChatFileTreeEntry[]> {
  const map = new Map<string, ChatFileTreeEntry[]>()
  for (const entry of entries) {
    const normalized = normalizePath(entry.path)
    const parent = normalized.includes('/')
      ? normalized.slice(0, normalized.lastIndexOf('/'))
      : ''
    const list = map.get(parent) ?? []
    list.push(entry)
    map.set(parent, list)
  }
  for (const list of map.values()) {
    list.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  }
  return map
}

function entryReference(entry: ChatFileTreeEntry, workspaceRoot: string): ChatFileTreeReference {
  return {
    ...entry,
    relativePath: relativeWorkspacePath(entry.path, workspaceRoot),
  }
}

function collectExpandedPaths(
  workspaceRoot: string,
  selectedPath?: string | null,
): Set<string> {
  const next = new Set<string>([workspaceRoot])
  if (!selectedPath) return next
  const normalized = normalizePath(selectedPath)
  const root = normalizePath(workspaceRoot)
  let current = normalized
  while (current.startsWith(root) && current !== root) {
    const parent = current.slice(0, current.lastIndexOf('/'))
    if (parent && parent.length >= root.length) next.add(parent)
    current = parent
  }
  return next
}

export function ChatFileTreePanel({
  workspaceRoot,
  entries = [],
  selectedPath,
  loading = false,
  error = null,
  className = '',
  fill = false,
  onPreviewFile,
  onAddReference,
}: Props): ReactElement | null {
  const root = workspaceRoot.trim()
  const rootName = useMemo(() => workspaceDisplayName(root), [root])
  const childrenMap = useMemo(() => buildChildrenMap(entries), [entries])
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    collectExpandedPaths(root, selectedPath),
  )
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const selectedKey = useMemo(() => pathKey(selectedPath ?? ''), [selectedPath])

  useEffect(() => {
    setExpanded(collectExpandedPaths(root, selectedPath))
    setContextMenu(null)
  }, [root, selectedPath])

  useEffect(() => {
    if (!contextMenu) return
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target
      if (target instanceof Node && menuRef.current?.contains(target)) return
      setContextMenu(null)
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setContextMenu(null)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [contextMenu])

  const toggleDirectory = useCallback((path: string): void => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const refresh = useCallback((): void => {
    setExpanded(new Set([root]))
    setContextMenu(null)
  }, [root])

  const openContextMenu = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>, entry: ChatFileTreeEntry): void => {
      event.preventDefault()
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        entry,
      })
    },
    [],
  )

  if (!root) return null

  const renderDirectory = (path: string, depth: number): ReactElement[] => {
    if (loading && depth === 0) {
      return [
        <div
          key={`${path}-loading`}
          className="chat-file-tree-loading"
          style={{ paddingLeft: depth * 14 + 10 }}
        >
          <Loader2 className="chat-file-tree-spinner" strokeWidth={1.8} />
          {COPY.fileTreeLoading}
        </div>,
      ]
    }
    if (error && depth === 0) {
      return [
        <div
          key={`${path}-error`}
          className="chat-file-tree-error"
          style={{ paddingLeft: depth * 14 + 10 }}
          title={error}
        >
          {error}
        </div>,
      ]
    }

    const childEntries = (childrenMap.get(path) ?? []).filter(
      (entry) => entry.type !== 'directory' || !isIgnoredDirectory(entry.name),
    )

    if (!childEntries.length) {
      return depth === 0
        ? [
            <div key={`${path}-empty`} className="chat-file-tree-empty">
              {COPY.fileTreeEmpty}
            </div>,
          ]
        : []
    }

    return childEntries.flatMap((entry) => {
      const isDirectory = entry.type === 'directory'
      const entryExpanded = expanded.has(entry.path)
      const previewable = isPreviewableEntry(entry)
      const active = !isDirectory && selectedKey === pathKey(entry.path)
      const icon = isDirectory ? (
        entryExpanded ? (
          <FolderOpen className="chat-file-tree-row-icon" strokeWidth={1.75} />
        ) : (
          <Folder className="chat-file-tree-row-icon" strokeWidth={1.75} />
        )
      ) : (
        <FileText className="chat-file-tree-row-icon" strokeWidth={1.75} />
      )

      const row = (
        <div
          key={entry.path}
          className={`chat-file-tree-row${active ? ' is-active' : ''}`}
          title={
            previewable || isDirectory ? entry.path : COPY.fileTreeUnsupported(entry.name)
          }
          onContextMenu={(event) => openContextMenu(event, entry)}
        >
          <button
            type="button"
            className="chat-file-tree-row-btn"
            style={{ paddingLeft: depth * 14 + 8 }}
            onClick={() => {
              if (isDirectory) {
                toggleDirectory(entry.path)
                return
              }
              onPreviewFile?.(entry.path)
            }}
          >
            {icon}
            <span
              className={
                previewable || isDirectory
                  ? 'chat-file-tree-row-label'
                  : 'chat-file-tree-row-label is-faint'
              }
            >
              {entry.name}
            </span>
          </button>
          {isDirectory ? (
            <div className="chat-file-tree-row-trailing">
              {entryExpanded ? (
                <ChevronDown className="chat-file-tree-chevron" strokeWidth={1.8} />
              ) : (
                <ChevronRight className="chat-file-tree-chevron" strokeWidth={1.8} />
              )}
            </div>
          ) : null}
        </div>
      )

      if (!isDirectory || !entryExpanded) return [row]
      return [row, ...renderDirectory(entry.path, depth + 1)]
    })
  }

  const contextEntry = contextMenu?.entry
  const contextLabel =
    contextEntry?.type === 'directory'
      ? COPY.fileTreeAddFolderReference
      : COPY.fileTreeAddFileReference

  return (
    <div className={`chat-file-tree-panel ds-no-drag${fill ? ' is-fill' : ''} ${className}`.trim()}>
      <div className="chat-file-tree-section-header">
        <span className="chat-file-tree-section-label" title={root}>
          {rootName || COPY.fileTreeTitle}
        </span>
        <div className="chat-file-tree-section-actions">
          <button
            type="button"
            className="chat-file-tree-icon-btn"
            title={COPY.fileTreeRefresh}
            aria-label={COPY.fileTreeRefresh}
            onClick={refresh}
          >
            <RefreshCw className="chat-file-tree-action-icon" strokeWidth={1.8} />
          </button>
        </div>
      </div>
      <div className={`chat-file-tree-scroll${fill ? ' is-fill' : ''}`}>
        {renderDirectory(root, 0)}
      </div>
      {contextEntry ? (
        <div
          ref={menuRef}
          className="chat-file-tree-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            className="chat-file-tree-context-item"
            onClick={() => {
              onAddReference?.(entryReference(contextEntry, root))
              setContextMenu(null)
            }}
          >
            <Plus className="chat-file-tree-context-icon" strokeWidth={1.9} />
            <span className="chat-file-tree-context-label">{contextLabel}</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="chat-file-tree-context-item"
            onClick={() => setContextMenu(null)}
          >
            <Copy className="chat-file-tree-context-icon" strokeWidth={1.9} />
            <span className="chat-file-tree-context-label">{COPY.fileTreeCopyAbsolutePath}</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="chat-file-tree-context-item"
            onClick={() => setContextMenu(null)}
          >
            <Copy className="chat-file-tree-context-icon" strokeWidth={1.9} />
            <span className="chat-file-tree-context-label">{COPY.fileTreeCopyRelativePath}</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="chat-file-tree-context-item"
            onClick={() => setContextMenu(null)}
          >
            <FolderSearch className="chat-file-tree-context-icon" strokeWidth={1.9} />
            <span className="chat-file-tree-context-label">{COPY.fileTreeRevealInFinder}</span>
          </button>
        </div>
      ) : null}
    </div>
  )
}
