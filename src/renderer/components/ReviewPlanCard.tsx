// Inline "Review Plan" card echoing Kun's ReviewPlanCard
// (../Kun/src/renderer/src/components/chat/message-timeline-cards.tsx).
// Visual only: parent supplies title, path, and optional action handlers.

import type { ReactElement } from 'react'
import { FileEdit, Hammer, ListTodo } from 'lucide-react'

type Props = {
  title: string
  relativePath: string
  busy?: boolean
  onOpen?: () => void
  onBuild?: () => void
}

/** Sample data for ?reviewPlanCard=1 visual verification. */
export const REVIEW_PLAN_CARD_PREVIEW = {
  title: 'Refactor auth middleware',
  relativePath: 'docs/plans/refactor-auth-middleware.md',
}

export function ReviewPlanCard({
  title,
  relativePath,
  busy = false,
  onOpen,
  onBuild,
}: Props): ReactElement {
  return (
    <div className="review-plan-card" title={relativePath}>
      <div className="review-plan-card-icon">
        <ListTodo strokeWidth={1.9} />
      </div>
      <div className="review-plan-card-body">
        <div className="review-plan-card-title">{title}</div>
        <div className="review-plan-card-hint">
          Plan ready — review or edit it on the right.
        </div>
      </div>
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="review-plan-card-open-btn"
        >
          <FileEdit strokeWidth={1.9} />
          Open
        </button>
      ) : null}
      {onBuild ? (
        <button
          type="button"
          onClick={onBuild}
          disabled={busy}
          className="review-plan-card-build-btn"
        >
          <Hammer strokeWidth={1.9} />
          Build
        </button>
      ) : null}
    </div>
  )
}
