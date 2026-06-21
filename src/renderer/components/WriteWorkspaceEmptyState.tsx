// Write-mode workspace empty state echoing Kun's WriteWorkspaceEmptyState
// (../Kun/src/renderer/src/components/write/WriteWorkspaceEmptyState.tsx).
// Visual only: parent supplies optional error copy and pick-workspace callback.

import type { ReactElement } from 'react'
import { FolderOpen } from 'lucide-react'

export type WriteWorkspaceEmptyStatePreviewMode = 'default' | 'error'

/** Sample error for ?writeWorkspaceEmptyState=error visual verification. */
export const WRITE_WORKSPACE_EMPTY_STATE_PREVIEW_ERROR =
  'Could not open the selected folder. Try another path or check permissions.'

type Props = {
  error?: string | null
  onPickWorkspace?: () => void
}

export function WriteWorkspaceEmptyState({
  error,
  onPickWorkspace,
}: Props): ReactElement {
  return (
    <div className="write-workspace-empty-state">
      <div className="write-workspace-empty-state-card">
        <div className="write-workspace-empty-state-icon-wrap">
          <FolderOpen className="write-workspace-empty-state-icon" strokeWidth={1.9} />
        </div>
        <h2 className="write-workspace-empty-state-title">Choose a workspace for writing</h2>
        <p className="write-workspace-empty-state-sub">
          Write mode keeps your files, preview, inline completion, and AI in one place.
        </p>
        {error ? (
          <p className="write-workspace-empty-state-error">{error}</p>
        ) : null}
        <button
          type="button"
          className="write-workspace-empty-state-btn"
          onClick={onPickWorkspace}
        >
          <FolderOpen className="write-workspace-empty-state-btn-icon" strokeWidth={1.9} />
          Select workspace
        </button>
      </div>
    </div>
  )
}
