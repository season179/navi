// Write-mode workspace file tree echoing Kun's WriteFileTree
// (../Kun/src/renderer/src/components/write/WriteFileTree.tsx).
// Visual only: parent supplies mock tree snapshots and optional action callbacks.

import { useCallback, useEffect, useMemo, useState, type ReactElement, type ReactNode } from 'react'
import {
  ChevronDown,
  ChevronRight,
  FilePlus2,
  FileText,
  Folder,
  FolderPlus,
  Image,
  Pencil,
  RefreshCw,
  Trash2,
} from 'lucide-react'

export type WriteFileTreeEntry = {
  name: string
  path: string
  type: 'file' | 'directory'
  ext: string
}

export type WriteFileTreePreviewMode = 'default' | 'empty' | 'loading' | 'error'

type Props = {
  rootDirectory: string
  entriesByDir: Record<string, WriteFileTreeEntry[]>
  expandedDirs?: Set<string>
  loadingDirs?: Record<string, boolean>
  selectedFilePath?: string | null
  error?: string | null
  rootLoading?: boolean
  showHeader?: boolean
  showRootLabel?: boolean
  className?: string
  onToggleDir?: (path: string) => void
  onSelectFile?: (path: string) => void
  onCreateFile?: (directoryPath?: string) => void
  onCreateDirectory?: (directoryPath?: string) => void
  onRenameEntry?: (entry: WriteFileTreeEntry) => void
  onDeleteEntry?: (entry: WriteFileTreeEntry) => void
  onRefresh?: () => void
}

const COPY = {
  writeWorkspaceFiles: 'Workspace files',
  writeCreateFile: 'New file',
  writeCreateFolder: 'New folder',
  writeRefreshWorkspace: 'Refresh workspace',
  writeCreateFileInFolder: 'New file in folder',
  writeCreateFolderInFolder: 'New folder in folder',
  writeRenameEntry: 'Rename',
  writeDeleteFile: 'Delete file',
  writeDeleteFolder: 'Delete folder',
  writeLoadingShort: '…',
  writeLoadingWorkspace: 'Loading workspace files',
  writeWorkspaceEmpty: 'No documents yet',
  writeWorkspaceEmptySub: 'Create a markdown draft, note, or image to get started.',
  writeCreateFirstFile: 'Create first file',
  writeCreateFirstFolder: 'Create first folder',
}

const WRITE_TEXT_EXTENSIONS = new Set(['.md', '.markdown', '.mdx', '.txt', '.text'])
const WRITE_IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.avif', '.ico'])
const WRITE_PDF_EXTENSIONS = new Set(['.pdf'])

const PREVIEW_ROOT = '/Users/season/writing'

function normalizePath(value: string): string {
  return value.replaceAll('\\', '/').replace(/\/+$/, '')
}

function basenameFromPath(value: string): string {
  const normalized = normalizePath(value)
  const segments = normalized.split('/').filter(Boolean)
  return segments[segments.length - 1] || normalized
}

function relativeDisplayPath(root: string, target: string): string {
  const normalizedRoot = normalizePath(root)
  const normalizedTarget = normalizePath(target)
  if (normalizedTarget === normalizedRoot) return basenameFromPath(normalizedTarget)
  const prefix = `${normalizedRoot}/`
  if (normalizedTarget.startsWith(prefix)) {
    return normalizedTarget.slice(prefix.length)
  }
  return basenameFromPath(normalizedTarget)
}

function isAssistantInternalDirectory(entry: WriteFileTreeEntry): boolean {
  return entry.type === 'directory' && entry.name === '.deepseek'
}

function isWriteWorkspaceEntry(entry: WriteFileTreeEntry): boolean {
  if (entry.type === 'directory') return true
  const ext = entry.ext.trim().toLowerCase()
  return WRITE_TEXT_EXTENSIONS.has(ext) || WRITE_IMAGE_EXTENSIONS.has(ext) || WRITE_PDF_EXTENSIONS.has(ext)
}

function isImageEntry(entry: WriteFileTreeEntry): boolean {
  return entry.type === 'file' && WRITE_IMAGE_EXTENSIONS.has(entry.ext.trim().toLowerCase())
}

function collectExpandedPaths(rootDirectory: string, selectedFilePath: string | null | undefined): Set<string> {
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

/** Sample tree for ?writeFileTreePreview=1 visual verification. */
export const WRITE_FILE_TREE_PREVIEW = {
  rootDirectory: PREVIEW_ROOT,
  selectedFilePath: `${PREVIEW_ROOT}/drafts/intro.md`,
  entriesByDir: {
    [PREVIEW_ROOT]: [
      { name: 'drafts', path: `${PREVIEW_ROOT}/drafts`, type: 'directory', ext: '' },
      { name: 'notes', path: `${PREVIEW_ROOT}/notes`, type: 'directory', ext: '' },
      { name: 'README.md', path: `${PREVIEW_ROOT}/README.md`, type: 'file', ext: '.md' },
      { name: 'hero.png', path: `${PREVIEW_ROOT}/hero.png`, type: 'file', ext: '.png' },
      { name: 'outline.pdf', path: `${PREVIEW_ROOT}/outline.pdf`, type: 'file', ext: '.pdf' },
    ],
    [`${PREVIEW_ROOT}/drafts`]: [
      { name: 'intro.md', path: `${PREVIEW_ROOT}/drafts/intro.md`, type: 'file', ext: '.md' },
      { name: 'chapter-one.md', path: `${PREVIEW_ROOT}/drafts/chapter-one.md`, type: 'file', ext: '.md' },
      { name: 'cover.jpg', path: `${PREVIEW_ROOT}/drafts/cover.jpg`, type: 'file', ext: '.jpg' },
    ],
    [`${PREVIEW_ROOT}/notes`]: [
      { name: 'ideas.txt', path: `${PREVIEW_ROOT}/notes/ideas.txt`, type: 'file', ext: '.txt' },
    ],
  } satisfies Record<string, WriteFileTreeEntry[]>,
  loadingDirs: {} as Record<string, boolean>,
  error: null as string | null,
  rootLoading: false,
}

type TreeActionButtonProps = {
  title: string
  children: ReactNode
  onClick?: () => void
  tone?: 'default' | 'accent' | 'danger'
}

function TreeActionButton({
  title,
  children,
  onClick,
  tone = 'default',
}: TreeActionButtonProps): ReactElement {
  return (
    <button
      type="button"
      className={`write-file-tree-icon-btn${tone === 'accent' ? ' is-accent' : ''}${tone === 'danger' ? ' is-danger' : ''}`}
      title={title}
      aria-label={title}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation()
        onClick?.()
      }}
    >
      {children}
    </button>
  )
}

export function WriteFileTree({
  rootDirectory,
  entriesByDir,
  expandedDirs: expandedDirsProp,
  loadingDirs = {},
  selectedFilePath = null,
  error = null,
  rootLoading = false,
  showHeader = true,
  showRootLabel = true,
  className = '',
  onToggleDir,
  onSelectFile,
  onCreateFile,
  onCreateDirectory,
  onRenameEntry,
  onDeleteEntry,
  onRefresh,
}: Props): ReactElement {
  const [expandedDirsInternal, setExpandedDirsInternal] = useState<Set<string>>(() =>
    collectExpandedPaths(rootDirectory, selectedFilePath),
  )
  const expandedDirs = expandedDirsProp ?? expandedDirsInternal

  useEffect(() => {
    if (expandedDirsProp) return
    setExpandedDirsInternal(collectExpandedPaths(rootDirectory, selectedFilePath))
  }, [expandedDirsProp, rootDirectory, selectedFilePath])

  const toggleDir = useCallback(
    (path: string): void => {
      if (onToggleDir) {
        onToggleDir(path)
        return
      }
      setExpandedDirsInternal((current) => {
        const next = new Set(current)
        if (next.has(path)) next.delete(path)
        else next.add(path)
        return next
      })
    },
    [onToggleDir],
  )

  const hasRootSnapshot = Object.prototype.hasOwnProperty.call(entriesByDir, rootDirectory)
  const rootEntries = (entriesByDir[rootDirectory] ?? []).filter(isWriteWorkspaceEntry)

  const renderEntries = (dirPath: string, depth: number): ReactElement[] => {
    const entries = (entriesByDir[dirPath] ?? []).filter(isWriteWorkspaceEntry)
    return entries.flatMap((entry) => {
      if (isAssistantInternalDirectory(entry)) return []

      const isDirectory = entry.type === 'directory'
      const expanded = isDirectory && expandedDirs.has(entry.path)
      const loading = isDirectory && loadingDirs[entry.path]
      const selected = !isDirectory && selectedFilePath === entry.path
      const imageEntry = isImageEntry(entry)

      const row = (
        <div key={entry.path}>
          <div className={`write-file-tree-row group${selected ? ' is-active' : ''}`}>
            <button
              type="button"
              className="write-file-tree-row-btn"
              style={{ paddingLeft: 10 + depth * 14 }}
              title={relativeDisplayPath(rootDirectory, entry.path)}
              onClick={() => (isDirectory ? toggleDir(entry.path) : onSelectFile?.(entry.path))}
            >
              {isDirectory ? (
                expanded ? (
                  <ChevronDown className="write-file-tree-chevron" strokeWidth={2} />
                ) : (
                  <ChevronRight className="write-file-tree-chevron" strokeWidth={2} />
                )
              ) : (
                <span className="write-file-tree-chevron-spacer" aria-hidden />
              )}
              {isDirectory ? (
                <Folder className="write-file-tree-row-icon" strokeWidth={1.75} />
              ) : imageEntry ? (
                <Image
                  className={`write-file-tree-row-icon${selected ? ' is-accent' : ' is-image'}`}
                  strokeWidth={1.8}
                />
              ) : (
                <FileText
                  className={`write-file-tree-row-icon${selected ? ' is-accent' : ' is-faint'}`}
                  strokeWidth={1.8}
                />
              )}
              <span className="write-file-tree-row-label">{entry.name}</span>
              {loading ? (
                <span className="write-file-tree-loading-short">{COPY.writeLoadingShort}</span>
              ) : null}
            </button>
            <div className="write-file-tree-row-actions">
              {isDirectory ? (
                <>
                  <TreeActionButton
                    title={COPY.writeCreateFileInFolder}
                    tone="accent"
                    onClick={() => onCreateFile?.(entry.path)}
                  >
                    <FilePlus2 className="write-file-tree-action-icon" strokeWidth={1.8} />
                  </TreeActionButton>
                  <TreeActionButton
                    title={COPY.writeCreateFolderInFolder}
                    onClick={() => onCreateDirectory?.(entry.path)}
                  >
                    <FolderPlus className="write-file-tree-action-icon" strokeWidth={1.8} />
                  </TreeActionButton>
                </>
              ) : null}
              <TreeActionButton title={COPY.writeRenameEntry} onClick={() => onRenameEntry?.(entry)}>
                <Pencil className="write-file-tree-action-icon" strokeWidth={1.85} />
              </TreeActionButton>
              <TreeActionButton
                title={isDirectory ? COPY.writeDeleteFolder : COPY.writeDeleteFile}
                tone="danger"
                onClick={() => onDeleteEntry?.(entry)}
              >
                <Trash2 className="write-file-tree-action-icon" strokeWidth={1.85} />
              </TreeActionButton>
            </div>
          </div>
          {isDirectory && expanded ? <div>{renderEntries(entry.path, depth + 1)}</div> : null}
        </div>
      )
      return row
    })
  }

  return (
    <div className={`write-file-tree${className ? ` ${className}` : ''}`}>
      {showHeader ? (
        <div className="write-file-tree-section-header">
          <span className="write-file-tree-section-label">{COPY.writeWorkspaceFiles}</span>
          <div className="write-file-tree-section-actions">
            <TreeActionButton title={COPY.writeCreateFile} tone="accent" onClick={() => onCreateFile?.()}>
              <FilePlus2 className="write-file-tree-action-icon" strokeWidth={1.75} />
            </TreeActionButton>
            <TreeActionButton title={COPY.writeCreateFolder} onClick={() => onCreateDirectory?.()}>
              <FolderPlus className="write-file-tree-action-icon" strokeWidth={1.75} />
            </TreeActionButton>
            <TreeActionButton title={COPY.writeRefreshWorkspace} onClick={() => onRefresh?.()}>
              <RefreshCw className="write-file-tree-action-icon" strokeWidth={1.75} />
            </TreeActionButton>
          </div>
        </div>
      ) : null}

      {showRootLabel ? (
        <div className="write-file-tree-root-label">
          <span className="write-file-tree-root-label-text" title={rootDirectory}>
            {basenameFromPath(rootDirectory)}
          </span>
        </div>
      ) : null}

      <div className="write-file-tree-scroll">
        {error ? (
          <div className="write-file-tree-error">{error}</div>
        ) : rootLoading || !hasRootSnapshot ? (
          <div className="write-file-tree-skeleton" aria-label={COPY.writeLoadingWorkspace}>
            {[0, 1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="write-file-tree-skeleton-row"
                style={{ width: `${92 - item * 8}%` }}
              />
            ))}
          </div>
        ) : rootEntries.length === 0 ? (
          <div className="write-file-tree-empty-panel">
            <p className="write-file-tree-empty-title">{COPY.writeWorkspaceEmpty}</p>
            <p className="write-file-tree-empty-sub">{COPY.writeWorkspaceEmptySub}</p>
            <div className="write-file-tree-empty-actions">
              <button type="button" className="write-file-tree-empty-btn" onClick={() => onCreateFile?.()}>
                <FilePlus2 className="write-file-tree-empty-btn-icon is-accent" strokeWidth={1.9} />
                {COPY.writeCreateFirstFile}
              </button>
              <button
                type="button"
                className="write-file-tree-empty-btn"
                onClick={() => onCreateDirectory?.()}
              >
                <FolderPlus className="write-file-tree-empty-btn-icon" strokeWidth={1.9} />
                {COPY.writeCreateFirstFolder}
              </button>
            </div>
          </div>
        ) : (
          <div>{renderEntries(rootDirectory, 0)}</div>
        )}
      </div>
    </div>
  )
}

function previewSnapshot(mode: WriteFileTreePreviewMode): {
  rootDirectory: string
  entriesByDir: Record<string, WriteFileTreeEntry[]>
  selectedFilePath: string | null
  loadingDirs: Record<string, boolean>
  error: string | null
  rootLoading: boolean
} {
  if (mode === 'empty') {
    return {
      rootDirectory: PREVIEW_ROOT,
      entriesByDir: { [PREVIEW_ROOT]: [] },
      selectedFilePath: null,
      loadingDirs: {},
      error: null,
      rootLoading: false,
    }
  }
  if (mode === 'loading') {
    return {
      rootDirectory: PREVIEW_ROOT,
      entriesByDir: {},
      selectedFilePath: null,
      loadingDirs: {},
      error: null,
      rootLoading: true,
    }
  }
  if (mode === 'error') {
    return {
      rootDirectory: PREVIEW_ROOT,
      entriesByDir: { [PREVIEW_ROOT]: [] },
      selectedFilePath: null,
      loadingDirs: {},
      error: 'Could not read workspace directory.',
      rootLoading: false,
    }
  }
  return {
    rootDirectory: WRITE_FILE_TREE_PREVIEW.rootDirectory,
    entriesByDir: WRITE_FILE_TREE_PREVIEW.entriesByDir,
    selectedFilePath: WRITE_FILE_TREE_PREVIEW.selectedFilePath,
    loadingDirs: WRITE_FILE_TREE_PREVIEW.loadingDirs,
    error: WRITE_FILE_TREE_PREVIEW.error,
    rootLoading: WRITE_FILE_TREE_PREVIEW.rootLoading,
  }
}

type PreviewProps = {
  mode: WriteFileTreePreviewMode
}

/** Sidebar-width preview shell for ?writeFileTreePreview URL hooks. */
export function WriteFileTreePreview({ mode }: PreviewProps): ReactElement {
  const snapshot = useMemo(() => previewSnapshot(mode), [mode])
  const [selectedFilePath, setSelectedFilePath] = useState(snapshot.selectedFilePath)
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(() =>
    collectExpandedPaths(snapshot.rootDirectory, snapshot.selectedFilePath),
  )

  useEffect(() => {
    setSelectedFilePath(snapshot.selectedFilePath)
    setExpandedDirs(collectExpandedPaths(snapshot.rootDirectory, snapshot.selectedFilePath))
  }, [snapshot.rootDirectory, snapshot.selectedFilePath])

  return (
    <div className="write-file-tree-preview-wrap">
      <WriteFileTree
        rootDirectory={snapshot.rootDirectory}
        entriesByDir={snapshot.entriesByDir}
        expandedDirs={expandedDirs}
        loadingDirs={snapshot.loadingDirs}
        selectedFilePath={selectedFilePath}
        error={snapshot.error}
        rootLoading={snapshot.rootLoading}
        onToggleDir={(path) => {
          setExpandedDirs((current) => {
            const next = new Set(current)
            if (next.has(path)) next.delete(path)
            else next.add(path)
            return next
          })
        }}
        onSelectFile={setSelectedFilePath}
      />
    </div>
  )
}
