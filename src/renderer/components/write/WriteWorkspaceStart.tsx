// Write-mode workspace start screen echoing Kun's WriteWorkspaceStart
// (../Kun/src/renderer/src/components/write/WriteWorkspaceStart.tsx).
// Visual only: parent supplies workspace labels and optional action callbacks.

import type { ReactElement } from 'react'
import {
  FilePenLine,
  FilePlus2,
  FolderOpen,
  ListTodo,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

export type WriteWorkspaceStartPreviewMode = 'default'

/** Sample workspace for ?writeWorkspaceStart=1 visual verification. */
export const WRITE_WORKSPACE_START_PREVIEW = {
  workspaceName: 'Personal essays',
  workspacePathLabel: '/Users/season/Documents/writing/personal-essays',
} as const

type Props = {
  workspaceName: string
  workspacePathLabel: string
  onAskAssistant?: () => void
  onCreateDraft?: () => void
  onPickWorkspace?: () => void
  onRefreshWorkspace?: () => void
}

export function WriteWorkspaceStart({
  workspaceName,
  workspacePathLabel,
  onAskAssistant,
  onCreateDraft,
  onPickWorkspace,
  onRefreshWorkspace,
}: Props): ReactElement {
  return (
    <div className="write-start-shell">
      <div className="write-start-grid">
        <section className="write-start-hero">
          <div className="write-start-badge">
            <Sparkles className="write-start-badge-icon" strokeWidth={1.9} />
            <span>Writing desk</span>
          </div>
          <h2 className="write-start-heading">Start from a calmer writing desk.</h2>
          <p className="write-start-copy">
            Drafts, references, and the assistant all live in this writing space. Put down one
            Markdown file, then shape the title, sections, and citations from there.
          </p>

          <div className="write-start-primary-actions">
            <button type="button" className="write-start-btn-primary" onClick={onCreateDraft}>
              <FilePlus2 className="write-start-btn-icon" strokeWidth={1.9} />
              New draft
            </button>
            <button type="button" className="write-start-btn-secondary" onClick={onAskAssistant}>
              <ListTodo className="write-start-btn-icon write-start-btn-icon-emerald" strokeWidth={1.9} />
              Ask AI for an outline
            </button>
          </div>

          <div className="write-start-shortcuts">
            <button type="button" className="write-start-shortcut-btn" onClick={onRefreshWorkspace}>
              <span className="write-start-shortcut-icon write-start-shortcut-icon-sky">
                <RefreshCw className="write-start-shortcut-icon-svg" strokeWidth={1.9} />
              </span>
              <span className="write-start-shortcut-copy">
                <span className="write-start-shortcut-title">Refresh tree</span>
                <span className="write-start-shortcut-sub">Scan workspace files again</span>
              </span>
            </button>
            <button type="button" className="write-start-shortcut-btn" onClick={onPickWorkspace}>
              <span className="write-start-shortcut-icon write-start-shortcut-icon-violet">
                <FolderOpen className="write-start-shortcut-icon-svg" strokeWidth={1.9} />
              </span>
              <span className="write-start-shortcut-copy">
                <span className="write-start-shortcut-title">Switch space</span>
                <span className="write-start-shortcut-sub write-start-shortcut-sub-truncate">
                  {workspaceName}
                </span>
              </span>
            </button>
          </div>
        </section>

        <aside className="write-start-card">
          <div className="write-start-card-header">
            <div className="write-start-card-header-copy">
              <div className="write-start-card-label">Current space</div>
              <div className="write-start-card-name">{workspaceName}</div>
            </div>
            <span className="write-start-ready-badge">Ready</span>
          </div>

          <div className="write-start-preview-panel">
            <div className="write-start-preview-header">
              <span className="write-start-preview-icon-wrap">
                <FilePenLine className="write-start-preview-icon" strokeWidth={1.9} />
              </span>
              <div className="write-start-preview-header-copy">
                <div className="write-start-preview-title">First draft</div>
                <div className="write-start-preview-sub">
                  The title, sections, and citations will unfold here.
                </div>
              </div>
            </div>
            <div className="write-start-skeleton" aria-hidden="true">
              <div className="write-start-skeleton-line write-start-skeleton-line-lg" />
              <div className="write-start-skeleton-line" />
              <div className="write-start-skeleton-line write-start-skeleton-line-md" />
              <div className="write-start-skeleton-line write-start-skeleton-line-sm" />
              <div className="write-start-skeleton-accent-wrap">
                <div className="write-start-skeleton-line write-start-skeleton-line-accent" />
              </div>
            </div>
          </div>

          <div className="write-start-path-panel">
            <div className="write-start-path-label">Space path</div>
            <div className="write-start-path-value" title={workspacePathLabel}>
              {workspacePathLabel}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
