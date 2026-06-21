// Right-side change inspector echoing Kun's ChangeInspector
// (../Kun/src/renderer/src/components/ChangeInspector.tsx).
// Visual only: parent supplies file-change snapshots and selection callbacks.

import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { FileEdit, PanelRightClose } from 'lucide-react'
import {
  countDiffStats,
  extractDiffFilePath,
  formatFilePathForDisplay,
} from '../lib/diff-stats'
import { DiffView } from './DiffView'

export type ChangeInspectorStatus = 'done' | 'running' | 'error'

export type ChangeInspectorItem = {
  id: string
  filePath?: string
  detail: string
  status?: ChangeInspectorStatus
}

type Props = {
  items: ChangeInspectorItem[]
  workspaceRoot?: string
  selectedId?: string | null
  className?: string
  onCollapse?: () => void
  onSelect?: (id: string | null) => void
}

const COPY = {
  rightPanelCollapse: 'Collapse panel',
  inspectorTitle: 'Changes',
  inspectorEmpty: 'No file changes in this thread yet.',
  inspectorEmptyTitle: 'No changes yet',
  inspectorSummaryFiles: (count: number) =>
    count === 1 ? '1 file change' : `${count} file changes`,
  inspectorSelectHint: 'Select a changed file to view its diff.',
  inspectorStatusRunning: 'running',
  toolActionFile: 'Edited file',
}

const PREVIEW_PATCH_AUTH = `--- a/src/auth/middleware.ts
+++ b/src/auth/middleware.ts
@@ -12,7 +12,9 @@ export function authMiddleware(req, res, next) {
-  const token = req.headers.authorization
+  const token = req.headers.authorization?.replace(/^Bearer\\s+/, '')
   if (!token) {
     return res.status(401).json({ error: 'Unauthorized' })
   }
+  req.user = verifyToken(token)
   next()
 }`

const PREVIEW_PATCH_SESSION = `--- a/src/session/store.ts
+++ b/src/session/store.ts
@@ -44,6 +44,10 @@ export class SessionStore {
   get(id: string) {
     return this.map.get(id)
   }
+
+  touch(id: string) {
+    this.map.set(id, { ...this.map.get(id)!, updatedAt: Date.now() })
+  }
 }`

const PREVIEW_PATCH_CONFIG = `--- a/src/config/runtime.ts
+++ b/src/config/runtime.ts
@@ -8,7 +8,7 @@ export const runtimeConfig = {
-  refreshIntervalMs: 30_000,
+  refreshIntervalMs: 60_000,
   maxRetries: 3,
 }`

/** Sample items for ?changeInspectorPreview=1 visual verification. */
export const CHANGE_INSPECTOR_PREVIEW_ITEMS: ChangeInspectorItem[] = [
  {
    id: 'change-auth',
    filePath: 'src/auth/middleware.ts',
    detail: PREVIEW_PATCH_AUTH,
    status: 'done',
  },
  {
    id: 'change-session',
    filePath: 'src/session/store.ts',
    detail: PREVIEW_PATCH_SESSION,
    status: 'done',
  },
  {
    id: 'change-config',
    filePath: 'src/config/runtime.ts',
    detail: PREVIEW_PATCH_CONFIG,
    status: 'running',
  },
]

export type ChangeInspectorPreviewMode = 'default' | 'empty' | 'single'

export function ChangeInspector({
  items,
  workspaceRoot,
  selectedId: selectedIdProp,
  className = '',
  onCollapse,
  onSelect,
}: Props): ReactElement {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null)
  const selectedId = selectedIdProp ?? internalSelectedId
  const setSelectedId = onSelect ?? setInternalSelectedId

  const fileChanges = useMemo(() => {
    return items.map((item) => ({
      ...item,
      detail: item.detail.trim(),
      filePath: extractDiffFilePath(item.detail, item.filePath),
    }))
  }, [items])

  useEffect(() => {
    if (fileChanges.length === 0) {
      if (selectedId !== null) setSelectedId(null)
      return
    }
    if (selectedId && !fileChanges.some((item) => item.id === selectedId)) {
      setSelectedId(fileChanges[fileChanges.length - 1]?.id ?? null)
    }
  }, [fileChanges, selectedId, setSelectedId])

  const active =
    fileChanges.find((item) => item.id === selectedId) ??
    fileChanges[fileChanges.length - 1]

  return (
    <aside className={`change-inspector ${className}`.trim()}>
      <div className="change-inspector-header">
        <button
          type="button"
          onClick={onCollapse}
          className="ds-sidebar-toggle-button change-inspector-collapse-btn"
          aria-label={COPY.rightPanelCollapse}
          title={COPY.rightPanelCollapse}
        >
          <PanelRightClose className="change-inspector-collapse-icon" strokeWidth={1.85} />
        </button>
        <div className="change-inspector-heading">
          <div className="change-inspector-title">{COPY.inspectorTitle}</div>
          <div className="change-inspector-summary">
            {fileChanges.length > 0
              ? COPY.inspectorSummaryFiles(fileChanges.length)
              : COPY.inspectorEmpty}
          </div>
        </div>
      </div>

      <div className="change-inspector-body">
        {fileChanges.length === 0 ? (
          <div className="change-inspector-empty">
            <FileEdit className="change-inspector-empty-icon" strokeWidth={1.25} />
            <div className="change-inspector-empty-title">{COPY.inspectorEmptyTitle}</div>
            <div className="change-inspector-empty-copy">{COPY.inspectorEmpty}</div>
          </div>
        ) : (
          <>
            <div className="change-inspector-list-wrap">
              <ul className="change-inspector-list">
                {fileChanges.map((item) => {
                  const stats = countDiffStats(item.detail)
                  const displayPath = formatFilePathForDisplay(item.filePath, workspaceRoot)
                  const isActive = active?.id === item.id
                  return (
                    <li key={item.id} className="change-inspector-list-item">
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={
                          isActive
                            ? 'change-inspector-row is-active'
                            : 'change-inspector-row'
                        }
                      >
                        <FileEdit
                          className={
                            item.status === 'error'
                              ? 'change-inspector-row-icon change-inspector-row-icon-error'
                              : 'change-inspector-row-icon'
                          }
                          strokeWidth={1.75}
                        />
                        <div className="change-inspector-row-content">
                          <div className="change-inspector-row-path">
                            {displayPath ?? COPY.toolActionFile}
                          </div>
                          {stats ? (
                            <div className="change-inspector-row-stats">
                              <span className="change-inspector-stat-added">+{stats.added}</span>
                              <span className="change-inspector-stat-removed">-{stats.removed}</span>
                            </div>
                          ) : null}
                        </div>
                        {item.status === 'running' ? (
                          <span className="change-inspector-running-badge">
                            {COPY.inspectorStatusRunning}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="change-inspector-diff-wrap ds-panel-strip">
              {active?.detail ? (
                <DiffView
                  patch={active.detail}
                  maxHeight={9999}
                  className="change-inspector-diff"
                />
              ) : (
                <div className="change-inspector-diff-placeholder ds-surface-soft">
                  {COPY.inspectorSelectHint}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
