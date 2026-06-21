// Workspace-select empty hero echoing Kun's inline empty state in
// MessageTimelineEmptyHero (../Kun/src/renderer/src/components/chat/message-timeline-empty.tsx).
// Visual only: parent supplies an optional pick-workspace callback.

import type { ReactElement } from 'react'
import { SitMascot } from './Mascot'

type Props = {
  onPickWorkspace?: () => void
}

export function WorkspaceSelectEmptyHero({ onPickWorkspace }: Props): ReactElement {
  return (
    <div className="workspace-select-empty-hero">
      <SitMascot className="workspace-select-empty-hero-mascot" />
      <h1 className="workspace-select-empty-hero-title">Choose working directory</h1>
      <p className="workspace-select-empty-hero-sub">
        Pick a local working directory first, then start your first thread.
      </p>
      <button
        type="button"
        className="workspace-select-empty-hero-chip"
        onClick={onPickWorkspace}
      >
        Choose working directory
      </button>
    </div>
  )
}
