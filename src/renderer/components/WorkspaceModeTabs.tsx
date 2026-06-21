// Code / Write mode tabs echoing Kun's WorkspaceModeTabs
// (../Kun/src/renderer/src/components/chat/WorkspaceModeTabs.tsx).
// Visual only: parent supplies active view and open callbacks.

import { type ReactElement } from 'react'
import { Code2, PencilLine } from 'lucide-react'

export type WorkspaceModeView = 'chat' | 'write' | 'claw' | 'schedule'

type Props = {
  activeView: WorkspaceModeView
  onCodeOpen: () => void
  onWriteOpen: () => void
}

const COPY = {
  code: 'Code',
  write: 'Write',
  tablistLabel: 'Code / Write',
}

export function WorkspaceModeTabs({
  activeView,
  onCodeOpen,
  onWriteOpen,
}: Props): ReactElement {
  const codeActive = activeView === 'chat'
  const writeActive = activeView === 'write'

  return (
    <div
      role="tablist"
      aria-label={COPY.tablistLabel}
      className="workspace-mode-tabs"
    >
      <button
        type="button"
        role="tab"
        aria-selected={codeActive}
        onClick={onCodeOpen}
        className={codeActive ? 'workspace-mode-tab is-active' : 'workspace-mode-tab'}
      >
        <Code2
          className="workspace-mode-tab-icon"
          strokeWidth={1.9}
          aria-hidden="true"
        />
        <span className="workspace-mode-tab-label">{COPY.code}</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={writeActive}
        onClick={onWriteOpen}
        className={writeActive ? 'workspace-mode-tab is-active' : 'workspace-mode-tab'}
      >
        <PencilLine
          className="workspace-mode-tab-icon"
          strokeWidth={1.9}
          aria-hidden="true"
        />
        <span className="workspace-mode-tab-label">{COPY.write}</span>
      </button>
    </div>
  )
}
