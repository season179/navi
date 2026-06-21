// Single-block process entry row echoing Kun's ProcessEntryRow
// (../Kun/src/renderer/src/components/chat/message-timeline-process.tsx).
// Visual only: parent supplies entry snapshots and optional toggle callbacks.

import { useState, type KeyboardEvent, type ReactElement } from 'react'
import { ChevronDown, ChevronRight, Minimize2 } from 'lucide-react'
import { DiffView } from './DiffView'
import { Markdown } from './Markdown'
import {
  MessageBubble,
  MESSAGE_BUBBLE_PREVIEW_APPROVAL_DONE,
  MESSAGE_BUBBLE_PREVIEW_APPROVAL_PENDING,
  MESSAGE_BUBBLE_PREVIEW_USER_INPUT,
  type MessageBubbleSnapshot,
} from './MessageBubble'
import { ProcessSummaryText } from './ProcessFileReference'
import {
  RuntimeMetaChips,
  RUNTIME_META_CHIPS_PREVIEW,
  type RuntimeMetaChipsSnapshot,
} from './RuntimeMetaChips'

export type ProcessEntrySnapshot = {
  verb: string
  rest?: string
  filePath?: string
  /** Block id — used for live-assistant streaming shimmer like Kun. */
  blockId?: string
  active?: boolean
  /** Running tool block during processing — drives row shimmer like Kun. */
  runningTool?: boolean
  error?: boolean
  showCompactionIcon?: boolean
  wrapSummary?: boolean
  collapsible?: boolean
  forceOpen?: boolean
  expanded?: boolean
  detailText?: string
  detailKind?: 'text' | 'command' | 'patch' | 'error' | 'assistant' | 'approval' | 'user_input'
  detailFilePath?: string
  nestedBubble?: MessageBubbleSnapshot
  meta?: RuntimeMetaChipsSnapshot
  /** Process block kind — drives system-message expand rules like Kun. */
  blockKind?: 'system'
  /** When set, detailText is block.detail rather than duplicated summary text. */
  explicitDetail?: boolean
  /** Pending approval — force-opens like Kun isPendingApproval. */
  pendingApproval?: boolean
  /** Pending user_input — auto force-opens during active processing like Kun. */
  pendingUserInput?: boolean
}

/** Kun getProcessDetail skips expand affordance for short system messages. */
const SYSTEM_MESSAGE_DETAIL_THRESHOLD = 140

function normalizeProcessText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase()
}

function entryFullSummary(entry: ProcessEntrySnapshot): string {
  return [entry.verb, entry.rest].filter(Boolean).join(' ').trim()
}

function hasExplicitSystemDetail(
  summary: string,
  detailText?: string,
  explicitDetail?: boolean,
): boolean {
  if (explicitDetail === true) return true
  const detail = detailText?.trim()
  if (!detail) return false
  return normalizeProcessText(detail) !== normalizeProcessText(summary)
}

function systemEntryHasExpandableDetail(
  summary: string,
  detailText?: string,
  explicitDetail?: boolean,
): boolean {
  const detail = detailText?.trim()
  if (!detail) return false
  if (hasExplicitSystemDetail(summary, detailText, explicitDetail)) return true
  return summary.trim().length > SYSTEM_MESSAGE_DETAIL_THRESHOLD
}

/** Kun getProcessDetail — hide expand chevron when detail duplicates the summary line. */
function processEntryHasExpandableDetail(entry: ProcessEntrySnapshot): boolean {
  if (entry.nestedBubble) return true
  const detailText = entry.detailText?.trim()
  if (!detailText) return false
  if (
    entry.detailKind === 'patch' ||
    entry.detailKind === 'error' ||
    entry.detailKind === 'assistant' ||
    entry.detailKind === 'approval' ||
    entry.detailKind === 'user_input'
  ) {
    return true
  }
  const summary = entryFullSummary(entry)
  if (entry.blockKind === 'system') {
    return systemEntryHasExpandableDetail(
      summary,
      entry.detailText,
      entry.explicitDetail,
    )
  }
  return normalizeProcessText(detailText) !== normalizeProcessText(summary)
}

/** Kun ProcessEntryRow rowActive — pending approval shimmers even when not processing. */
function processEntryIsActive(
  entry: ProcessEntrySnapshot,
  processing?: boolean,
): boolean {
  if (entry.pendingApproval === true) return true
  if (processing !== true) return entry.active === true
  if (entry.runningTool === true) return true
  if (entry.pendingUserInput === true) return true
  if (entry.showCompactionIcon === true) return true
  if (entry.detailKind === 'assistant' && entry.blockId === 'live-assistant') {
    return true
  }
  return entry.active === true
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
    detailKind: 'command',
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
  compactionRunning: {
    verb: 'Compacting',
    rest: 'context window',
    showCompactionIcon: true,
    active: true,
    wrapSummary: true,
    collapsible: true,
    expanded: true,
    detailText: 'Summarizing older turns to free context space…',
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
    detailKind: 'command',
    meta: RUNTIME_META_CHIPS_PREVIEW,
  },
  redundantDetail: {
    verb: 'Read',
    rest: 'src/auth/middleware.ts',
    filePath: 'src/auth/middleware.ts',
    collapsible: true,
    expanded: false,
    detailText: 'Read src/auth/middleware.ts',
    detailKind: 'command',
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
    pendingApproval: true,
    expanded: true,
    detailKind: 'approval',
    nestedBubble: MESSAGE_BUBBLE_PREVIEW_APPROVAL_PENDING,
  },
  approvalPendingShimmer: {
    verb: 'Approve',
    rest: 'deploy to staging',
    pendingApproval: true,
    expanded: true,
    detailKind: 'approval',
    nestedBubble: MESSAGE_BUBBLE_PREVIEW_APPROVAL_PENDING,
  },
  compactionProcessing: {
    verb: 'Compacting',
    rest: 'context window',
    showCompactionIcon: true,
    wrapSummary: true,
    collapsible: true,
    expanded: true,
    detailText: 'Summarizing older turns to free context space…',
    detailKind: 'text',
  },
  streamingAssistant: {
    verb: 'Text',
    rest: '',
    blockId: 'live-assistant',
    wrapSummary: true,
    forceOpen: true,
    expanded: true,
    detailText: 'I will normalize Bearer token extraction and call verifyToken before next().',
    detailKind: 'assistant',
  },
  approvalResolved: {
    verb: 'Approved',
    rest: 'deploy to staging',
    collapsible: true,
    expanded: false,
    detailKind: 'approval',
    nestedBubble: MESSAGE_BUBBLE_PREVIEW_APPROVAL_DONE,
  },
  userInput: {
    verb: 'Request',
    rest: 'user input',
    active: true,
    pendingUserInput: true,
    expanded: true,
    detailKind: 'user_input',
    nestedBubble: MESSAGE_BUBBLE_PREVIEW_USER_INPUT,
  },
  systemShort: {
    verb: 'Workspace',
    rest: 'index refreshed successfully.',
    blockKind: 'system',
    detailText: 'Workspace index refreshed successfully.',
    detailKind: 'text',
  },
  systemLong: {
    verb: 'A',
    rest: 'background sync job refreshed the workspace index and validated that every referenced package still resolves. Two optional dependencies were skipped because they are only used in CI.',
    blockKind: 'system',
    collapsible: true,
    expanded: false,
    detailText:
      'A background sync job refreshed the workspace index and validated that every referenced package still resolves. Two optional dependencies were skipped because they are only used in CI.',
    detailKind: 'text',
  },
  systemExplicitDetail: {
    verb: 'Sync',
    rest: 'completed',
    blockKind: 'system',
    explicitDetail: true,
    collapsible: true,
    expanded: false,
    detailText:
      'Indexed 1,248 files across 42 packages. Skipped 2 optional dev-only dependencies used exclusively in CI workflows.',
    detailKind: 'text',
  },
} as const satisfies Record<string, ProcessEntrySnapshot>

export type ProcessEntryRowPreviewMode = keyof typeof PROCESS_ENTRY_ROW_PREVIEW

type Props = {
  entry: ProcessEntrySnapshot
  processing?: boolean
  expanded?: boolean
  onToggle?: () => void
}

function ProcessEntryDetail({
  entry,
  processing,
}: {
  entry: ProcessEntrySnapshot
  processing?: boolean
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
        <Markdown
          text={entry.detailText}
          streaming={
            processing === true &&
            entry.blockId === 'live-assistant'
          }
        />
      </div>
    )
  }
  if (entry.detailKind === 'command') {
    return <pre className="process-stack-entry-command-text">{entry.detailText}</pre>
  }
  return <p className="process-stack-entry-muted-text">{entry.detailText}</p>
}

export function ProcessEntryRow({
  entry,
  processing,
  expanded,
  onToggle,
}: Props): ReactElement {
  const [userOpen, setUserOpen] = useState<boolean | null>(null)
  const canExpand =
    entry.collapsible !== false && processEntryHasExpandableDetail(entry)
  const defaultOpen = entry.error === true
  const autoOpenPending =
    entry.pendingApproval === true ||
    (processing === true &&
      (entry.pendingUserInput === true || entry.showCompactionIcon === true))
  const isStreamingAssistant =
    processing === true && entry.blockId === 'live-assistant'
  const forceOpen =
    entry.forceOpen === true ||
    entry.detailKind === 'assistant' ||
    isStreamingAssistant ||
    autoOpenPending
  const isOpen = canExpand && (forceOpen || (expanded ?? (userOpen ?? defaultOpen)))
  const canToggle = canExpand && !forceOpen
  const rowActive = processEntryIsActive(entry, processing)
  const showCompactionIcon = entry.showCompactionIcon === true && !rowActive
  const summaryText = entryFullSummary(entry)
  const wrapSummary =
    entry.wrapSummary ??
    (entry.detailKind === 'assistant' ||
      (entry.blockKind === 'system' &&
        !systemEntryHasExpandableDetail(
          summaryText,
          entry.detailText,
          entry.explicitDetail,
        )))

  const handleToggle = (): void => {
    if (!canToggle) return
    if (onToggle) {
      onToggle()
      return
    }
    setUserOpen(!isOpen)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (!canToggle) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    handleToggle()
  }

  const summaryContent = (
    <>
      {showCompactionIcon ? (
        <Minimize2 className="process-entry-row-compaction-icon" strokeWidth={2} />
      ) : null}
      <span
        className={`process-entry-row-summary ${
          wrapSummary ? 'is-wrap' : 'is-truncate'
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
            <ProcessSummaryText summary={entry.rest} filePath={entry.filePath} />
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
      <div
        role={canToggle ? 'button' : undefined}
        tabIndex={canToggle ? 0 : undefined}
        aria-expanded={canToggle ? isOpen : undefined}
        className={`process-entry-row-header ${canToggle ? 'is-interactive' : 'is-static'} ${
          entry.error ? 'is-error' : ''
        }`}
        onClick={canToggle ? handleToggle : undefined}
        onKeyDown={handleKeyDown}
      >
        {summaryContent}
      </div>

      {entry.meta ? (
        <RuntimeMetaChips meta={entry.meta} placement="process-entry" />
      ) : null}

      {isOpen && (entry.detailText || entry.nestedBubble) ? (
        entry.detailKind === 'assistant' ? (
          <div className="process-entry-row-assistant-wrap">
            <ProcessEntryDetail entry={entry} processing={processing} />
          </div>
        ) : (
          <div className="ds-work-timeline-detail">
            <ProcessEntryDetail entry={entry} processing={processing} />
          </div>
        )
      ) : null}
    </div>
  )
}
