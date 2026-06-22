// Collapsible turn-level file-change summary echoing Kun's TurnChangeSummary
// (../Kun/src/renderer/src/components/chat/message-timeline-cards.tsx).
// Visual only: parent supplies change snapshots with optional unified diffs.

import {
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type RefObject,
} from 'react'
import { ChevronDown, ChevronRight, FileEdit } from 'lucide-react'
import { useDeferredRender } from '../../hooks/use-deferred-render'
import { countDiffStats, sumDiffStats } from '../../lib/diff-stats'
import {
  resolveTurnChangeFileLabel,
  resolveTurnChangeSummaryTitle,
} from '../../lib/turnChangeSummary'
import { DiffView } from '../common/DiffView'

export type TurnChangeSnapshot = {
  id: string
  filePath?: string
  detail?: string
}

export type TurnChangeSummaryPreviewMode = 'default' | 'compact' | 'single'

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

/** Sample changes for ?turnChangeSummary=1 visual verification. */
export const TURN_CHANGE_SUMMARY_PREVIEW: TurnChangeSnapshot[] = [
  {
    id: 'change-auth',
    filePath: 'src/auth/middleware.ts',
    detail: PREVIEW_PATCH_AUTH,
  },
  {
    id: 'change-session',
    filePath: 'src/session/store.ts',
    detail: PREVIEW_PATCH_SESSION,
  },
]

export const TURN_CHANGE_SUMMARY_PREVIEW_SINGLE: TurnChangeSnapshot[] = [
  TURN_CHANGE_SUMMARY_PREVIEW[0],
]

type Props = {
  changes: TurnChangeSnapshot[]
  compact?: boolean
  defaultExpanded?: boolean
  viewportRef?: RefObject<HTMLDivElement | null>
}

export function TurnChangeSummary({
  changes,
  compact = false,
  defaultExpanded = false,
  viewportRef,
}: Props): ReactElement {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [activeId, setActiveId] = useState<string | null>(
    () => changes.find((change) => change.detail?.trim())?.id ?? changes[0]?.id ?? null,
  )

  useEffect(() => {
    if (changes.length === 0) {
      setActiveId(null)
      return
    }
    setActiveId((current) => {
      if (current && changes.some((change) => change.id === current)) return current
      return changes.find((change) => change.detail?.trim())?.id ?? changes[0]?.id ?? null
    })
  }, [changes])

  const totals = useMemo(
    () => sumDiffStats(changes.map((change) => change.detail)),
    [changes],
  )
  const title = resolveTurnChangeSummaryTitle(changes.length)
  const { ref: deferredBodyRef, shouldRender: shouldRenderBody } =
    useDeferredRender<HTMLDivElement>({
      enabled: expanded,
      root: viewportRef,
    })

  return (
    <section className={`turn-change-summary ${compact ? 'is-compact' : ''}`}>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="turn-change-summary-toggle"
      >
        <span className="turn-change-summary-icon">
          <FileEdit strokeWidth={1.85} />
        </span>
        <span className="turn-change-summary-heading">
          <span className="turn-change-summary-title">{title}</span>
          {totals ? (
            <span className="turn-change-summary-totals">
              <span className="turn-change-summary-added">+{totals.added}</span>
              <span className="turn-change-summary-total-sep">·</span>
              <span className="turn-change-summary-removed">-{totals.removed}</span>
            </span>
          ) : null}
        </span>
        {expanded ? (
          <ChevronDown className="turn-change-summary-chevron" strokeWidth={1.8} />
        ) : (
          <ChevronRight className="turn-change-summary-chevron" strokeWidth={1.8} />
        )}
      </button>

      {expanded ? (
        <div
          ref={deferredBodyRef}
          className="turn-change-summary-body"
          style={{
            contentVisibility: 'auto',
            containIntrinsicSize: compact ? 'auto 180px' : 'auto 280px',
          }}
        >
          {shouldRenderBody
            ? changes.map((change) => {
            const stats = countDiffStats(change.detail)
            const open = activeId === change.id
            const primary = resolveTurnChangeFileLabel(change.filePath)

            return (
              <div key={change.id} className="turn-change-summary-item">
                <button
                  type="button"
                  onClick={() => setActiveId(open ? null : change.id)}
                  aria-expanded={open}
                  className={`turn-change-summary-item-toggle ${open ? 'is-open' : ''}`}
                >
                  <span className="turn-change-summary-item-path" title={primary}>
                    {primary}
                  </span>
                  {stats ? (
                    <span className="turn-change-summary-item-stats">
                      <span className="turn-change-summary-added">+{stats.added}</span>
                      <span className="turn-change-summary-removed">-{stats.removed}</span>
                    </span>
                  ) : null}
                  {open ? (
                    <ChevronDown className="turn-change-summary-item-chevron" strokeWidth={1.8} />
                  ) : (
                    <ChevronRight className="turn-change-summary-item-chevron" strokeWidth={1.8} />
                  )}
                </button>

                {open && change.detail ? (
                  <div className="turn-change-summary-diff-wrap">
                    <DiffView
                      patch={change.detail}
                      filePath={change.filePath}
                      maxHeight={compact ? 148 : 260}
                      className="turn-change-summary-diff"
                    />
                  </div>
                ) : null}
              </div>
            )
          })
            : null}
        </div>
      ) : null}
    </section>
  )
}
