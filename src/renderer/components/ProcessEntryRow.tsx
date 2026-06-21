// Single-block process entry row echoing Kun's ProcessEntryRow
// (../Kun/src/renderer/src/components/chat/message-timeline-process.tsx).
// Visual only: parent supplies entry snapshots and optional toggle callbacks.

import { useState, type ReactElement } from 'react'
import { ChevronDown, ChevronRight, Minimize2 } from 'lucide-react'
import { DiffView } from './DiffView'
import { Markdown } from './Markdown'
import {
  MessageBubble,
  MESSAGE_BUBBLE_PREVIEW_APPROVAL_PENDING,
  MESSAGE_BUBBLE_PREVIEW_USER_INPUT,
  type MessageBubbleSnapshot,
} from './MessageBubble'
import {
  RuntimeMetaChips,
  RUNTIME_META_CHIPS_PREVIEW,
  type RuntimeMetaChipsSnapshot,
} from './RuntimeMetaChips'

export type ProcessEntrySnapshot = {
  verb: string
  rest?: string
  filePath?: string
  active?: boolean
  error?: boolean
  showCompactionIcon?: boolean
  wrapSummary?: boolean
  collapsible?: boolean
  forceOpen?: boolean
  expanded?: boolean
  detailText?: string
  detailKind?: 'text' | 'patch' | 'error' | 'assistant' | 'approval' | 'user_input'
  detailFilePath?: string
  nestedBubble?: MessageBubbleSnapshot
  meta?: RuntimeMetaChipsSnapshot
}

const PREVIEW_PATCH = `--- a/src/auth/middleware.ts
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

/** Sample snapshots for ?processEntryRow preview hooks. */
export const PROCESS_ENTRY_ROW_PREVIEW = {
  default: {
    verb: 'Edit',
    rest: 'src/auth/middleware.ts',
    filePath: 'src/auth/middleware.ts',
    collapsible: true,
    expanded: false,
    detailText: PREVIEW_PATCH,
    detailKind: 'patch',
    detailFilePath: 'src/auth/middleware.ts',
  },
  expanded: {
    verb: 'Edit',
    rest: 'src/auth/middleware.ts',
    filePath: 'src/auth/middleware.ts',
    collapsible: true,
    expanded: true,
    detailText: PREVIEW_PATCH,
    detailKind: 'patch',
    detailFilePath: 'src/auth/middleware.ts',
  },
  active: {
    verb: 'Run',
    rest: 'npm test',
    active: true,
    collapsible: true,
    expanded: true,
    detailText: 'npm test\n\nRunning auth middleware tests…',
    detailKind: 'text',
  },
  compaction: {
    verb: 'Compacted',
    rest: '12,480 tokens released',
    showCompactionIcon: true,
    wrapSummary: true,
    collapsible: true,
    expanded: false,
    detailText:
      'Folded older turns into a summary checkpoint to stay within the context window.',
    detailKind: 'text',
  },
  error: {
    verb: 'Run',
    rest: 'npm test',
    error: true,
    active: true,
    collapsible: false,
    forceOpen: true,
    expanded: true,
    detailText: 'Command failed with exit code 1\n\n✗ session store persistence test failed',
    detailKind: 'error',
  },
  meta: {
    verb: 'Read',
    rest: 'src/auth/middleware.ts',
    filePath: 'src/auth/middleware.ts',
    collapsible: true,
    expanded: false,
    detailText: 'Opened middleware.ts to inspect current token handling.',
    detailKind: 'text',
    meta: RUNTIME_META_CHIPS_PREVIEW,
  },
  assistant: {
    verb: 'Text',
    rest: '',
    wrapSummary: true,
    forceOpen: true,
    expanded: true,
    detailText: 'I will normalize Bearer token extraction and call verifyToken before next().',
    detailKind: 'assistant',
  },
  approval: {
    verb: 'Approve',
    rest: 'deploy to staging',
    active: true,
    forceOpen: true,
    expanded: true,
    detailKind: 'approval',
    nestedBubble: MESSAGE_BUBBLE_PREVIEW_APPROVAL_PENDING,
  },
  userInput: {
    verb: 'Request',
    rest: 'user input',
    active: true,
    forceOpen: true,
    expanded: true,
    detailKind: 'user_input',
    nestedBubble: MESSAGE_BUBBLE_PREVIEW_USER_INPUT,
  },
} as const satisfies Record<string, ProcessEntrySnapshot>

export type ProcessEntryRowPreviewMode = keyof typeof PROCESS_ENTRY_ROW_PREVIEW

type Props = {
  entry: ProcessEntrySnapshot
  expanded?: boolean
  onToggle?: () => void
}

function ProcessSummaryLine({
  summary,
  filePath,
}: {
  summary: string
  filePath?: string
}): ReactElement {
  if (!filePath) return <>{summary}</>
  const index = summary.indexOf(filePath)
  if (index < 0) return <>{summary}</>
  return (
    <>
      {summary.slice(0, index)}
      <button type="button" className="process-file-reference" title="Preview file">
        {filePath}
      </button>
      {summary.slice(index + filePath.length)}
    </>
  )
}

function ProcessEntryDetail({
  entry,
}: {
  entry: ProcessEntrySnapshot
}): ReactElement | null {
  if (entry.detailKind === 'approval' || entry.detailKind === 'user_input') {
    if (!entry.nestedBubble) return null
    return <MessageBubble block={entry.nestedBubble} nested />
  }
  if (!entry.detailText) return null
  if (entry.detailKind === 'patch') {
    return (
      <DiffView
        patch={entry.detailText}
        filePath={entry.detailFilePath ?? entry.filePath}
      />
    )
  }
  if (entry.detailKind === 'error') {
    return (
      <div className="process-stack-entry-error-panel">
        {entry.detailFilePath ?? entry.filePath ? (
          <div className="process-stack-entry-error-path">
            {entry.detailFilePath ?? entry.filePath}
          </div>
        ) : null}
        <pre className="process-stack-entry-error-text">{entry.detailText}</pre>
      </div>
    )
  }
  if (entry.detailKind === 'assistant') {
    return (
      <div className="process-entry-row-assistant ds-markdown">
        <Markdown text={entry.detailText} streaming={false} />
      </div>
    )
  }
  return <p className="process-stack-entry-muted-text">{entry.detailText}</p>
}

export function ProcessEntryRow({ entry, expanded, onToggle }: Props): ReactElement {
  const [internalExpanded, setInternalExpanded] = useState(entry.expanded === true)
  const canExpand =
    entry.collapsible !== false &&
    (Boolean(entry.detailText) || Boolean(entry.nestedBubble))
  const forceOpen = entry.forceOpen === true
  const isOpen = canExpand && (forceOpen || (expanded ?? internalExpanded))
  const canToggle = canExpand && !forceOpen
  const rowActive = entry.active === true
  const showCompactionIcon = entry.showCompactionIcon === true && !rowActive

  const handleToggle = (): void => {
    if (!canToggle) return
    if (onToggle) {
      onToggle()
      return
    }
    setInternalExpanded((value) => !value)
  }

  const summaryContent = (
    <>
      {showCompactionIcon ? (
        <Minimize2 className="process-entry-row-compaction-icon" strokeWidth={2} />
      ) : null}
      <span
        className={`process-entry-row-summary ${
          entry.wrapSummary ? 'is-wrap' : 'is-truncate'
        } ${rowActive && !entry.error ? 'ds-shiny-text' : ''}`}
      >
        <span
          className={`process-entry-row-verb ${
            entry.error ? '' : rowActive ? '' : 'is-muted'
          }`}
        >
          {entry.verb}
        </span>
        {entry.rest ? (
          <span className="process-entry-row-rest">
            <ProcessSummaryLine summary={entry.rest} filePath={entry.filePath} />
          </span>
        ) : null}
      </span>
      {canExpand ? (
        <button
          type="button"
          aria-label={isOpen ? 'Collapse detail' : 'Expand detail'}
          aria-expanded={isOpen}
          disabled={!canToggle}
          className={`process-entry-row-toggle ${canToggle ? 'is-clickable' : ''}`}
          onClick={(event) => {
            event.stopPropagation()
            handleToggle()
          }}
        >
          {isOpen ? (
            <ChevronDown className="process-entry-row-chevron" strokeWidth={2} />
          ) : (
            <ChevronRight className="process-entry-row-chevron" strokeWidth={2} />
          )}
        </button>
      ) : null}
    </>
  )

  return (
    <div className="process-entry-row">
      {canToggle ? (
        <button
          type="button"
          aria-expanded={isOpen}
          className={`process-entry-row-header ${entry.error ? 'is-error' : ''}`}
          onClick={handleToggle}
        >
          {summaryContent}
        </button>
      ) : (
        <div className={`process-entry-row-header is-static ${entry.error ? 'is-error' : ''}`}>
          {summaryContent}
        </div>
      )}

      {entry.meta ? (
        <RuntimeMetaChips meta={entry.meta} placement="process-entry" />
      ) : null}

      {isOpen && (entry.detailText || entry.nestedBubble) ? (
        <div
          className={
            entry.detailKind === 'assistant'
              ? 'process-entry-row-detail is-assistant'
              : 'process-entry-row-detail'
          }
        >
          <ProcessEntryDetail entry={entry} />
        </div>
      ) : null}
    </div>
  )
}
