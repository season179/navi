// Workspace-select empty hero echoing Kun's inline empty state in
// MessageTimelineEmptyHero (../Kun/src/renderer/src/components/chat/message-timeline-empty.tsx).
// Visual only: parent supplies an optional pick-workspace callback.

import type { ReactElement } from 'react'
import {
  WORKSPACE_SELECT_EMPTY_HERO_BUTTON,
  WORKSPACE_SELECT_EMPTY_HERO_SUB,
  WORKSPACE_SELECT_EMPTY_HERO_TITLE,
} from '../lib/workspaceSelectEmptyHero'
import { SitMascot } from './Mascot'

type Props = {
  onPickWorkspace?: () => void
}

export function WorkspaceSelectEmptyHero({ onPickWorkspace }: Props): ReactElement {
  return (
    <div className="workspace-select-empty-hero">
      <SitMascot className="workspace-select-empty-hero-mascot" />
      <h1 className="workspace-select-empty-hero-title">{WORKSPACE_SELECT_EMPTY_HERO_TITLE}</h1>
      <p className="workspace-select-empty-hero-sub">{WORKSPACE_SELECT_EMPTY_HERO_SUB}</p>
      <button
        type="button"
        className="workspace-select-empty-hero-chip"
        onClick={onPickWorkspace}
      >
        {WORKSPACE_SELECT_EMPTY_HERO_BUTTON}
      </button>
    </div>
  )
}
