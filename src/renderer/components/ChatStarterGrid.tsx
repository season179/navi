// Empty-hero suggestion cards echoing Kun's ChatStarterGrid
// (../Kun/src/renderer/src/components/chat/ChatStarterGrid.tsx). Visual only:
// clicking a card fills the composer draft via onSelectSuggestion.

import type { ReactElement } from 'react'
import { Bug, FolderOpen, Lightbulb } from 'lucide-react'
import {
  CHAT_STARTER_SUGGESTIONS,
  type ChatStarterTone,
} from '../lib/chatStarterGrid'

const CHAT_STARTER_ICONS: Record<ChatStarterTone, ReactElement> = {
  blue: <FolderOpen strokeWidth={1.8} />,
  emerald: <Bug strokeWidth={1.8} />,
  violet: <Lightbulb strokeWidth={1.8} />,
}

export function ChatStarterGrid({
  onSelectSuggestion,
  compact = false,
}: {
  onSelectSuggestion?: (prompt: string) => void
  compact?: boolean
}) {
  return (
    <div className={compact ? 'starter-grid is-compact' : 'starter-grid'}>
      {CHAT_STARTER_SUGGESTIONS.map((starter) => (
        <button
          key={starter.title}
          type="button"
          className="starter-card"
          onClick={() => onSelectSuggestion?.(starter.prompt)}
        >
          <span className={`starter-card-icon tone-${starter.tone}`}>
            {CHAT_STARTER_ICONS[starter.tone]}
          </span>
          <span className="starter-card-copy">
            <span className="starter-card-title">{starter.title}</span>
            <span className="starter-card-sub">{starter.sub}</span>
          </span>
        </button>
      ))}
    </div>
  )
}
