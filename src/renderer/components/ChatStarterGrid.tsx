// Empty-hero suggestion cards echoing Kun's ChatStarterGrid
// (../Kun/src/renderer/src/components/chat/ChatStarterGrid.tsx). Visual only:
// clicking a card fills the composer draft via onSelectSuggestion.

import type { ReactElement } from 'react'
import { Bug, FolderOpen, Lightbulb } from 'lucide-react'

type SuggestionTone = 'blue' | 'emerald' | 'violet'

const CHAT_STARTERS: Array<{
  icon: ReactElement
  tone: SuggestionTone
  title: string
  sub: string
  prompt: string
}> = [
  {
    icon: <FolderOpen strokeWidth={1.8} />,
    tone: 'blue',
    title: "Explain this project's structure",
    sub: 'Get a quick map of folders and key files',
    prompt:
      "Please explain this project's overall structure, key folders, and how the entry files relate to each other.",
  },
  {
    icon: <Bug strokeWidth={1.8} />,
    tone: 'emerald',
    title: 'Help me find and fix a bug',
    sub: 'Analyze the cause and suggest a fix',
    prompt: 'I have a bug. Please help me locate the root cause and propose a fix.',
  },
  {
    icon: <Lightbulb strokeWidth={1.8} />,
    tone: 'violet',
    title: 'Generate an implementation plan',
    sub: 'Turn the request into a step-by-step plan',
    prompt:
      'Please break the following requirement into an implementation plan, including files to change and steps.',
  },
]

export function ChatStarterGrid({
  onSelectSuggestion,
  compact = false,
}: {
  onSelectSuggestion?: (prompt: string) => void
  compact?: boolean
}) {
  return (
    <div className={compact ? 'starter-grid is-compact' : 'starter-grid'}>
      {CHAT_STARTERS.map((starter) => (
        <button
          key={starter.title}
          type="button"
          className="starter-card"
          onClick={() => onSelectSuggestion?.(starter.prompt)}
        >
          <span className={`starter-card-icon tone-${starter.tone}`}>{starter.icon}</span>
          <span className="starter-card-copy">
            <span className="starter-card-title">{starter.title}</span>
            <span className="starter-card-sub">{starter.sub}</span>
          </span>
        </button>
      ))}
    </div>
  )
}
