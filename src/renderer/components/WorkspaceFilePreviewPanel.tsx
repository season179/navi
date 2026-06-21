// Right-side workspace file preview panel echoing Kun's WorkspaceFilePreviewPanel
// (../Kun/src/renderer/src/components/WorkspaceFilePreviewPanel.tsx).
// Visual only: parent supplies file snapshots and optional action callbacks.

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'
import {
  Check,
  ChevronRight,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  FileCode2,
  Loader2,
  PanelRightClose,
  X,
} from 'lucide-react'
import { formatFilePathForDisplay } from '../lib/diff-stats'
import {
  highlightCodeHtml,
  languageFromFilePath,
  renderFallbackCodeHtml,
} from '../lib/code-highlighting'
import { Markdown } from './Markdown'

export type WorkspaceFileTarget = {
  path: string
  workspaceRoot?: string
  line?: number
  column?: number
}

export type WorkspaceFilePreviewResult =
  | {
      ok: true
      path: string
      content: string
      size: number
      line?: number
      column?: number
      truncated?: boolean
    }
  | {
      ok: false
      message: string
    }

export type WorkspaceFilePreviewMode =
  | 'default'
  | 'markdown'
  | 'empty'
  | 'loading'
  | 'error'
  | 'multitab'

type Props = {
  target?: WorkspaceFileTarget | null
  openTargets?: WorkspaceFileTarget[]
  workspaceRoot?: string
  result?: WorkspaceFilePreviewResult | null
  loading?: boolean
  className?: string
  onSelectTarget?: (target: WorkspaceFileTarget) => void
  onCloseTarget?: (target: WorkspaceFileTarget) => void
  onCollapse?: () => void
}

const COPY_RESET_MS = 1400

const COPY = {
  rightPanelCollapse: 'Collapse panel',
  filePreviewOpenFiles: 'Open files',
  filePreviewCloseTab: (file: string) => `Close ${file}`,
  filePreviewEmpty: 'Select a file to preview',
  filePreviewTitle: 'File preview',
  filePreviewShowSource: 'Show source',
  filePreviewRenderMarkdown: 'Render markdown',
  filePreviewOpenEditor: 'Open in editor',
  filePreviewCopyContent: 'Copy content',
  copySuccess: 'Copied',
  filePreviewLoading: 'Loading file…',
  filePreviewTruncated: 'Preview truncated — open in editor for the full file.',
  filePreviewFailed: 'Could not load file preview.',
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileNameFromPath(path: string): string {
  return path.split(/[/\\]/).filter(Boolean).pop() ?? path
}

function splitPath(path: string): string[] {
  return path.split(/[/\\]/).filter(Boolean)
}

function relativePathSegments(path: string, workspaceRoot: string): string[] {
  const normalizedPath = path.replaceAll('\\', '/')
  const normalizedRoot = workspaceRoot.replaceAll('\\', '/').replace(/\/+$/, '')
  if (normalizedRoot && normalizedPath.startsWith(`${normalizedRoot}/`)) {
    return splitPath(normalizedPath.slice(normalizedRoot.length + 1))
  }
  return [fileNameFromPath(path)]
}

function extensionBadge(path: string, language: string): string {
  const fileName = fileNameFromPath(path)
  const ext = fileName.includes('.') ? fileName.split('.').pop() ?? '' : ''
  const value = ext || language || 'txt'
  return value.slice(0, 3).toUpperCase()
}

function targetKey(target: WorkspaceFileTarget | null | undefined): string {
  if (!target?.path) return ''
  return `${target.workspaceRoot ?? ''}\n${target.path}`.replaceAll('\\', '/').toLowerCase()
}

function isMarkdownPreviewPath(path: string): boolean {
  return /\.(md|markdown|mdx)$/i.test(path)
}

export const WORKSPACE_FILE_PREVIEW_WORKSPACE = '/Users/season/Personal/navi'

const PREVIEW_TS_CONTENT = `export function formatBytes(bytes: number): string {
  if (bytes < 1024) return \`\${bytes} B\`
  if (bytes < 1024 * 1024) return \`\${(bytes / 1024).toFixed(1)} KB\`
  return \`\${(bytes / (1024 * 1024)).toFixed(1)} MB\`
}

export function fileNameFromPath(path: string): string {
  return path.split(/[/\\\\]/).filter(Boolean).pop() ?? path
}`

const PREVIEW_DIFF_CONTENT = `export function countDiffStats(patch: string) {
  let added = 0
  let removed = 0
  for (const line of patch.split('\\n')) {
    if (line.startsWith('+') && !line.startsWith('+++')) added += 1
    if (line.startsWith('-') && !line.startsWith('---')) removed += 1
  }
  return { added, removed }
}`

const PREVIEW_MD_CONTENT = `# Workspace File Preview

This panel shows **markdown** files with rendered preview.

## Features

- Tab bar with file badges
- Breadcrumb navigation
- Toggle between source and rendered view
- Syntax highlighting for code files

\`\`\`typescript
const preview = true
\`\`\`
`

export const WORKSPACE_FILE_PREVIEW_TARGET: WorkspaceFileTarget = {
  path: 'src/renderer/components/Composer.tsx',
  workspaceRoot: WORKSPACE_FILE_PREVIEW_WORKSPACE,
  line: 42,
}

export const WORKSPACE_FILE_PREVIEW_TARGETS: WorkspaceFileTarget[] = [
  WORKSPACE_FILE_PREVIEW_TARGET,
  {
    path: 'src/renderer/lib/diff-stats.ts',
    workspaceRoot: WORKSPACE_FILE_PREVIEW_WORKSPACE,
  },
]

export const WORKSPACE_FILE_PREVIEW_MD_TARGET: WorkspaceFileTarget = {
  path: 'docs/preview.md',
  workspaceRoot: WORKSPACE_FILE_PREVIEW_WORKSPACE,
}

export const WORKSPACE_FILE_PREVIEW_RESULT: WorkspaceFilePreviewResult = {
  ok: true,
  path: WORKSPACE_FILE_PREVIEW_TARGET.path,
  content: PREVIEW_TS_CONTENT,
  size: PREVIEW_TS_CONTENT.length,
  line: 5,
}

export const WORKSPACE_FILE_PREVIEW_DIFF_RESULT: WorkspaceFilePreviewResult = {
  ok: true,
  path: 'src/renderer/lib/diff-stats.ts',
  content: PREVIEW_DIFF_CONTENT,
  size: PREVIEW_DIFF_CONTENT.length,
}

export const WORKSPACE_FILE_PREVIEW_MD_RESULT: WorkspaceFilePreviewResult = {
  ok: true,
  path: WORKSPACE_FILE_PREVIEW_MD_TARGET.path,
  content: PREVIEW_MD_CONTENT,
  size: PREVIEW_MD_CONTENT.length,
}

export function WorkspaceFilePreviewPanel({
  target = null,
  openTargets,
  workspaceRoot = '',
  result = null,
  loading = false,
  className = '',
  onSelectTarget,
  onCloseTarget,
  onCollapse,
}: Props): ReactElement {
  const [copied, setCopied] = useState(false)
  const [markdownRendered, setMarkdownRendered] = useState(true)
  const [highlightHtml, setHighlightHtml] = useState(() => renderFallbackCodeHtml(''))
  const scrollRef = useRef<HTMLDivElement>(null)
  const copyResetRef = useRef<number | null>(null)

  const tabs = openTargets ?? (target ? [target] : [])
  const activeTargetKey = targetKey(target)

  const displayPath = useMemo(() => {
    const root = target?.workspaceRoot ?? workspaceRoot
    if (result?.ok) {
      return formatFilePathForDisplay(result.path, root) ?? fileNameFromPath(result.path)
    }
    return target?.path
      ? formatFilePathForDisplay(target.path, root) ?? fileNameFromPath(target.path)
      : ''
  }, [result, target, workspaceRoot])

  const language = useMemo(() => {
    if (result?.ok) return languageFromFilePath(result.path)
    return target?.path ? languageFromFilePath(target.path) : ''
  }, [result, target])

  const isMarkdownFile = isMarkdownPreviewPath(result?.ok ? result.path : target?.path ?? '')
  const lines = useMemo(() => (result?.ok ? result.content.split('\n') : []), [result])

  const breadcrumbSegments = useMemo(() => {
    const path = result?.ok ? result.path : target?.path ?? ''
    if (!path) return []
    return relativePathSegments(path, target?.workspaceRoot ?? workspaceRoot)
  }, [result, target, workspaceRoot])

  const currentFileName = displayPath ? fileNameFromPath(displayPath) : COPY.filePreviewTitle
  const badge = extensionBadge(result?.ok ? result.path : target?.path ?? '', language)

  const activeLine =
    result?.ok && result.line && result.line >= 1 && result.line <= lines.length
      ? result.line
      : null

  const codeSurfaceStyle = activeLine
    ? ({
        '--ds-file-preview-active-line': activeLine - 1,
      } as CSSProperties)
    : undefined

  useEffect(() => {
    if (!result?.ok || !result.line) return
    const id = window.requestAnimationFrame(() => {
      const row = scrollRef.current?.querySelector(`[data-line="${result.line}"]`)
      row?.scrollIntoView({ block: 'center' })
    })
    return () => window.cancelAnimationFrame(id)
  }, [result])

  useEffect(
    () => () => {
      if (copyResetRef.current !== null) window.clearTimeout(copyResetRef.current)
    },
    [],
  )

  useEffect(() => {
    if (!result?.ok) {
      setHighlightHtml(renderFallbackCodeHtml(''))
      return
    }

    let cancelled = false
    const fallback = renderFallbackCodeHtml(result.content)
    setHighlightHtml(fallback)

    void highlightCodeHtml(result.content, language).then((html) => {
      if (!cancelled) setHighlightHtml(html)
    })

    return () => {
      cancelled = true
    }
  }, [result, language])

  const copyContent = async (): Promise<void> => {
    if (!result?.ok || !navigator?.clipboard?.writeText) return
    try {
      await navigator.clipboard.writeText(result.content)
      setCopied(true)
      if (copyResetRef.current !== null) window.clearTimeout(copyResetRef.current)
      copyResetRef.current = window.setTimeout(() => setCopied(false), COPY_RESET_MS)
    } catch {
      setCopied(false)
    }
  }

  return (
    <aside className={`workspace-file-preview-panel ds-code-sidebar ${className}`.trim()}>
      <div className="ds-code-sidebar-topbar">
        <div
          className="ds-code-sidebar-tabs"
          role="tablist"
          aria-label={COPY.filePreviewOpenFiles}
        >
          {(tabs.length ? tabs : target ? [target] : []).map((item) => {
            const active = targetKey(item) === activeTargetKey
            const itemPath = item.path
            const itemRoot = item.workspaceRoot ?? workspaceRoot
            const itemLabel = fileNameFromPath(itemPath)
            const itemBadge = extensionBadge(itemPath, languageFromFilePath(itemPath))
            const itemTitle = formatFilePathForDisplay(itemPath, itemRoot) ?? itemPath
            return (
              <div
                key={targetKey(item)}
                role="tab"
                tabIndex={0}
                aria-selected={active}
                onClick={() => onSelectTarget?.(item)}
                className={`ds-code-sidebar-tab ${active ? 'is-active' : ''}`}
                title={itemTitle}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  onSelectTarget?.(item)
                }}
              >
                <span className="ds-code-sidebar-file-badge">{itemBadge}</span>
                <span className="workspace-file-preview-tab-label">{itemLabel}</span>
                {onCloseTarget ? (
                  <button
                    type="button"
                    aria-label={COPY.filePreviewCloseTab(itemLabel)}
                    title={COPY.filePreviewCloseTab(itemLabel)}
                    className="ds-code-sidebar-tab-close"
                    onClick={(event) => {
                      event.stopPropagation()
                      onCloseTarget(item)
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return
                      event.preventDefault()
                      event.stopPropagation()
                      onCloseTarget(item)
                    }}
                  >
                    <X className="workspace-file-preview-tab-close-icon" strokeWidth={2} />
                  </button>
                ) : null}
              </div>
            )
          })}
          {!tabs.length && !target ? (
            <div
              role="tab"
              aria-selected={false}
              className="ds-code-sidebar-tab"
              title={COPY.filePreviewEmpty}
            >
              <span className="ds-code-sidebar-file-badge">{badge}</span>
              <span className="workspace-file-preview-tab-label">{currentFileName}</span>
            </div>
          ) : null}
        </div>

        <div className="ds-code-sidebar-actions">
          {isMarkdownFile ? (
            <button
              type="button"
              onClick={() => setMarkdownRendered((value) => !value)}
              disabled={!result?.ok}
              className="ds-code-sidebar-icon-button"
              title={markdownRendered ? COPY.filePreviewShowSource : COPY.filePreviewRenderMarkdown}
              aria-label={
                markdownRendered ? COPY.filePreviewShowSource : COPY.filePreviewRenderMarkdown
              }
              aria-pressed={markdownRendered}
            >
              {markdownRendered ? (
                <Code2 className="workspace-file-preview-action-icon" strokeWidth={1.75} />
              ) : (
                <Eye className="workspace-file-preview-action-icon" strokeWidth={1.75} />
              )}
            </button>
          ) : null}
          <button
            type="button"
            disabled={!target}
            className="ds-code-sidebar-icon-button"
            title={COPY.filePreviewOpenEditor}
            aria-label={COPY.filePreviewOpenEditor}
          >
            <ExternalLink className="workspace-file-preview-action-icon" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => void copyContent()}
            disabled={!result?.ok}
            className="ds-code-sidebar-icon-button"
            title={copied ? COPY.copySuccess : COPY.filePreviewCopyContent}
            aria-label={copied ? COPY.copySuccess : COPY.filePreviewCopyContent}
          >
            {copied ? (
              <Check className="workspace-file-preview-copy-success-icon" strokeWidth={2} />
            ) : (
              <Copy className="workspace-file-preview-action-icon" strokeWidth={1.75} />
            )}
          </button>
          <button
            type="button"
            onClick={onCollapse}
            className="ds-code-sidebar-icon-button"
            title={COPY.rightPanelCollapse}
            aria-label={COPY.rightPanelCollapse}
          >
            <PanelRightClose className="workspace-file-preview-action-icon" strokeWidth={1.85} />
          </button>
        </div>
      </div>

      <div className="ds-code-sidebar-breadcrumbs">
        <div className="workspace-file-preview-breadcrumbs">
          {breadcrumbSegments.length ? (
            breadcrumbSegments.map((segment, index) => (
              <span key={`${segment}-${index}`} className="workspace-file-preview-breadcrumb-item">
                {index > 0 ? (
                  <ChevronRight
                    className="workspace-file-preview-breadcrumb-chevron"
                    strokeWidth={1.8}
                  />
                ) : null}
                <span
                  className={
                    index === breadcrumbSegments.length - 1
                      ? 'workspace-file-preview-breadcrumb-current'
                      : 'workspace-file-preview-breadcrumb-muted'
                  }
                  title={segment}
                >
                  {segment}
                </span>
              </span>
            ))
          ) : (
            <span className="workspace-file-preview-breadcrumb-muted">{COPY.filePreviewEmpty}</span>
          )}
        </div>
        {result?.ok ? (
          <span className="workspace-file-preview-meta">
            {formatBytes(result.size)}
            {language ? ` · ${language}` : ''}
          </span>
        ) : null}
      </div>

      <div className="workspace-file-preview-body">
        {!target ? (
          <div className="workspace-file-preview-empty">
            <div className="workspace-file-preview-empty-inner">
              <div className="workspace-file-preview-empty-icon-wrap">
                <FileCode2 className="workspace-file-preview-empty-icon" strokeWidth={1.7} />
              </div>
              {COPY.filePreviewEmpty}
            </div>
          </div>
        ) : loading ? (
          <div className="workspace-file-preview-loading">
            <Loader2 className="workspace-file-preview-loading-icon" strokeWidth={1.8} />
            {COPY.filePreviewLoading}
          </div>
        ) : result?.ok ? (
          <div className="workspace-file-preview-content">
            {result.truncated ? (
              <div className="workspace-file-preview-truncated">{COPY.filePreviewTruncated}</div>
            ) : null}
            {isMarkdownFile && markdownRendered ? (
              <div className="ds-file-preview-markdown">
                <div className="ds-markdown workspace-file-preview-markdown">
                  <Markdown text={result.content} streaming={false} />
                </div>
              </div>
            ) : (
              <div ref={scrollRef} className="ds-file-preview-scroll workspace-file-preview-scroll">
                <div className="ds-file-preview-code-surface" style={codeSurfaceStyle}>
                  {activeLine ? (
                    <div className="ds-file-preview-active-line" aria-hidden="true" />
                  ) : null}
                  <div className="ds-file-preview-gutter">
                    {lines.map((_, index) => {
                      const lineNo = index + 1
                      return (
                        <div
                          key={lineNo}
                          data-line={lineNo}
                          className={`ds-file-preview-line-number ${activeLine === lineNo ? 'is-active' : ''}`}
                        >
                          {lineNo}
                        </div>
                      )
                    })}
                  </div>
                  <div
                    className="ds-file-preview-code-html"
                    dangerouslySetInnerHTML={{ __html: highlightHtml }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="workspace-file-preview-error">
            {result?.message ?? COPY.filePreviewFailed}
          </div>
        )}
      </div>
    </aside>
  )
}
