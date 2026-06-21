// Tiny mono "via <model>" tag echoing Kun's ModelMetaTag
// (../Kun/src/renderer/src/components/chat/message-timeline-cards.tsx).
// Visual only: parent supplies the model label string.

import type { ReactElement } from 'react'

/** Sample label for ?modelMetaTag=1 visual verification. */
export const MODEL_META_TAG_PREVIEW = 'claude-sonnet-4-20250514'

type Props = {
  label?: string
  align?: 'right' | 'left'
}

export function ModelMetaTag({ label, align = 'right' }: Props): ReactElement | null {
  if (!label?.trim()) return null

  return (
    <div
      className={`model-meta-tag${align === 'left' ? ' is-left' : ''}`}
      title={`Model for this turn: ${label}`}
    >
      <span className="model-meta-tag-label">{label}</span>
    </div>
  )
}
