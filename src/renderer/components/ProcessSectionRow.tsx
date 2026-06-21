// Process timeline section row echoing Kun's ProcessSectionRow
// (../Kun/src/renderer/src/components/chat/message-timeline-process.tsx).
// Visual only: parent supplies section snapshots and optional toggle callbacks.

import { useState, type KeyboardEvent, type MouseEvent, type ReactElement } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { DiffView } from './DiffView'
import { Markdown } from './Markdown'
import {
  MessageBubble,
  MESSAGE_BUBBLE_PREVIEW_APPROVAL_PENDING,
  MESSAGE_BUBBLE_PREVIEW_USER_INPUT,
  type MessageBubbleSnapshot,
} from './MessageBubble'
import {
  ProcessEntryRow,
  type ProcessEntrySnapshot,
} from './ProcessEntryRow'
import { type RuntimeMetaChipsSnapshot, RUNTIME_META_CHIPS_PREVIEW } from './RuntimeMetaChips'

export type ProcessStackEntrySnapshot = {
  id: string
  summary: string
  filePath?: string
  active?: boolean
  error?: boolean
  expanded?: boolean
  collapsible?: boolean
  forceOpen?: boolean
  detailText?: string
  detailKind?: 'text' | 'command' | 'patch' | 'error' | 'assistant' | 'approval' | 'user_input'
  detailFilePath?: string
  nestedBubble?: MessageBubbleSnapshot
  meta?: RuntimeMetaChipsSnapshot
  showCompactionIcon?: boolean
}

export type ProcessOutputEntrySnapshot = {
  id: string
  text: string
  streaming?: boolean
}

export type ProcessSectionSnapshot = {
  kind: 'reasoning' | 'execution' | 'output'
  title: string
  processing?: boolean
  active?: boolean
  hasError?: boolean
  showActiveError?: boolean
  hasPendingApproval?: boolean
  hasRequestUserInput?: boolean
  expanded?: boolean
  collapsible?: boolean
  forceExpanded?: boolean
  reasoningText?: string
  stackEntries?: ProcessStackEntrySnapshot[]
  outputEntries?: ProcessOutputEntrySnapshot[]
}

function entryAutoForceOpen(
  entry: ProcessStackEntrySnapshot,
  processing?: boolean,
): boolean {
  if (entry.active !== true) return false
  if (entry.detailKind === 'approval' || entry.detailKind === 'user_input') {
    return true
  }
  return processing === true && entry.showCompactionIcon === true
}

function sectionHasPendingApproval(section: ProcessSectionSnapshot): boolean {
  if (section.hasPendingApproval === true) return true
  return (
    section.stackEntries?.some(
      (entry) => entry.detailKind === 'approval' && entry.active === true,
    ) ?? false
  )
}

function sectionHasRequestUserInput(section: ProcessSectionSnapshot): boolean {
  if (section.hasRequestUserInput === true) return true
  return (
    section.processing === true &&
    (section.stackEntries?.some(
      (entry) => entry.detailKind === 'user_input' && entry.active === true,
    ) ??
      false)
  )
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

/** Sample snapshots for ?processSectionRow preview hooks. */
export const PROCESS_SECTION_ROW_PREVIEW = {
  reasoning: {
    kind: 'reasoning',
    title: 'Thinking',
    collapsible: true,
    expanded: false,
    reasoningText:
      'Let me inspect the auth middleware and see how tokens are validated today.',
  },
  reasoningExpanded: {
    kind: 'reasoning',
    title: 'Thought for 4.2s',
    collapsible: true,
    expanded: true,
    reasoningText:
      'The middleware currently reads the Authorization header directly. I should normalize Bearer token extraction and call verifyToken before next().',
  },
  reasoningActive: {
    kind: 'reasoning',
    title: 'Thinking…',
    active: true,
    processing: true,
    collapsible: true,
    expanded: true,
    reasoningText:
      'Checking file imports and existing token validation helpers in the auth package…',
  },
  execution: {
    kind: 'execution',
    title: 'Edited 2 files · Ran 1 command',
    collapsible: true,
    expanded: false,
    stackEntries: [
      {
        id: 'read',
        summary: 'Read src/auth/middleware.ts',
        filePath: 'src/auth/middleware.ts',
      },
      {
        id: 'edit',
        summary: 'Edit src/auth/middleware.ts',
        filePath: 'src/auth/middleware.ts',
      },
      {
        id: 'test',
        summary: 'Run npm test',
      },
    ],
  },
  executionSingle: {
    kind: 'execution',
    title: 'Edit src/auth/middleware.ts',
    collapsible: true,
    expanded: false,
    stackEntries: [
      {
        id: 'edit',
        summary: 'Edit src/auth/middleware.ts',
        filePath: 'src/auth/middleware.ts',
        collapsible: true,
        expanded: false,
        detailText: PREVIEW_PATCH,
        detailKind: 'patch',
        detailFilePath: 'src/auth/middleware.ts',
        meta: RUNTIME_META_CHIPS_PREVIEW,
      },
    ],
  },
  executionExpanded: {
    kind: 'execution',
    title: 'Edited 2 files · Ran 1 command',
    collapsible: true,
    expanded: true,
    stackEntries: [
      {
        id: 'read',
        summary: 'Read src/auth/middleware.ts',
        filePath: 'src/auth/middleware.ts',
        collapsible: true,
        expanded: false,
        detailText: 'Opened middleware.ts to inspect current token handling.',
        detailKind: 'command',
      },
      {
        id: 'edit',
        summary: 'Edit src/auth/middleware.ts',
        filePath: 'src/auth/middleware.ts',
        collapsible: true,
        expanded: true,
        detailKind: 'patch',
        detailText: PREVIEW_PATCH,
        detailFilePath: 'src/auth/middleware.ts',
      },
      {
        id: 'test',
        summary: 'Run npm test',
        collapsible: true,
        expanded: false,
        detailText: 'npm test\n\n✓ auth middleware tests passed',
        detailKind: 'command',
      },
    ],
  },
  error: {
    kind: 'execution',
    title: 'Edited 1 file · Ran 1 command',
    hasError: true,
    showActiveError: true,
    active: true,
    collapsible: true,
    expanded: true,
    forceExpanded: true,
    stackEntries: [
      {
        id: 'test',
        summary: 'Run npm test',
        error: true,
        collapsible: false,
        expanded: true,
        detailKind: 'error',
        detailText: 'Command failed with exit code 1\n\n✗ session store persistence test failed',
      },
    ],
  },
  executionAutoOpen: {
    kind: 'execution',
    title: 'Edited 1 file · Ran 1 command',
    collapsible: true,
    expanded: true,
    stackEntries: [
      {
        id: 'read',
        summary: 'Read src/auth/middleware.ts',
        filePath: 'src/auth/middleware.ts',
      },
      {
        id: 'test',
        summary: 'Run npm test',
        error: true,
        detailKind: 'error',
        detailText: 'Command failed with exit code 1\n\n✗ session store persistence test failed',
      },
      {
        id: 'edit',
        summary: 'Edit src/auth/middleware.ts',
        filePath: 'src/auth/middleware.ts',
        collapsible: true,
        detailKind: 'patch',
        detailText: PREVIEW_PATCH,
        detailFilePath: 'src/auth/middleware.ts',
      },
    ],
  },
  executionForceOpen: {
    kind: 'execution',
    title: 'Waiting for approval',
    processing: true,
    active: true,
    collapsible: true,
    expanded: true,
    stackEntries: [
      {
        id: 'approval',
        summary: 'Approve deploy to staging',
        active: true,
        forceOpen: true,
        detailKind: 'approval',
        nestedBubble: {
          ...MESSAGE_BUBBLE_PREVIEW_APPROVAL_PENDING,
          summary: 'Run npm run deploy:staging against the preview cluster.',
        },
      },
      {
        id: 'read',
        summary: 'Read package.json',
        filePath: 'package.json',
      },
    ],
  },
  executionApproval: {
    kind: 'execution',
    title: 'Waiting for approval',
    processing: true,
    active: true,
    collapsible: true,
    expanded: true,
    stackEntries: [
      {
        id: 'approval',
        summary: 'Approve deploy to staging',
        active: true,
        forceOpen: true,
        detailKind: 'approval',
        nestedBubble: MESSAGE_BUBBLE_PREVIEW_APPROVAL_PENDING,
      },
      {
        id: 'read',
        summary: 'Read package.json',
        filePath: 'package.json',
      },
    ],
  },
  executionUserInput: {
    kind: 'execution',
    title: 'Waiting for input',
    processing: true,
    active: true,
    collapsible: true,
    expanded: true,
    stackEntries: [
      {
        id: 'user-input',
        summary: 'Request user input',
        active: true,
        forceOpen: true,
        detailKind: 'user_input',
        nestedBubble: MESSAGE_BUBBLE_PREVIEW_USER_INPUT,
      },
      {
        id: 'read',
        summary: 'Read package.json',
        filePath: 'package.json',
      },
    ],
  },
  output: {
    kind: 'output',
    title: '',
    outputEntries: [
      {
        id: 'assistant-1',
        text: 'I will update the auth middleware to normalize Bearer tokens and attach the verified user before calling `next()`.',
      },
    ],
  },
  outputStreaming: {
    kind: 'output',
    title: '',
    outputEntries: [
      {
        id: 'live-assistant',
        text: 'Updating the middleware now — extracting the Bearer prefix and calling verifyToken…',
        streaming: true,
      },
    ],
  },
} as const satisfies Record<string, ProcessSectionSnapshot>

export type ProcessSectionRowPreviewMode = keyof typeof PROCESS_SECTION_ROW_PREVIEW

type Props = {
  section: ProcessSectionSnapshot
  expanded?: boolean
  onToggle?: () => void
}

function splitSummaryVerb(summary: string): { verb: string; rest: string } {
  const trimmed = summary.trim()
  if (!trimmed) return { verb: '', rest: '' }
  const space = trimmed.search(/\s/)
  if (space < 0) return { verb: trimmed, rest: '' }
  return { verb: trimmed.slice(0, space), rest: trimmed.slice(space + 1).trim() }
}

function stackEntryToProcessEntry(
  entry: ProcessStackEntrySnapshot,
  section: ProcessSectionSnapshot,
): ProcessEntrySnapshot {
  const { verb, rest } = splitSummaryVerb(entry.summary)
  return {
    verb,
    rest: rest || undefined,
    filePath: entry.filePath,
    active: entry.active ?? section.active,
    error: entry.error ?? section.hasError,
    collapsible: entry.collapsible,
    forceOpen:
      entry.forceOpen === true ||
      section.forceExpanded === true ||
      entry.detailKind === 'assistant',
    expanded: entry.expanded ?? section.expanded,
    detailText: entry.detailText,
    detailKind: entry.detailKind,
    detailFilePath: entry.detailFilePath ?? entry.filePath,
    nestedBubble: entry.nestedBubble,
    meta: entry.meta,
    showCompactionIcon: entry.showCompactionIcon,
  }
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
      <button
        type="button"
        className="ds-process-file-reference"
        title="Preview file"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {filePath}
      </button>
      {summary.slice(index + filePath.length)}
    </>
  )
}

function ProcessStackEntryDetail({
  entry,
}: {
  entry: ProcessStackEntrySnapshot
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
        <Markdown text={entry.detailText} streaming={entry.active === true} />
      </div>
    )
  }
  if (entry.detailKind === 'command') {
    return <pre className="process-stack-entry-command-text">{entry.detailText}</pre>
  }
  return <p className="process-stack-entry-muted-text">{entry.detailText}</p>
}

function ProcessStackEntryRow({
  entry,
  open,
  canToggle,
  onToggle,
}: {
  entry: ProcessStackEntrySnapshot
  open: boolean
  canToggle: boolean
  onToggle: () => void
}): ReactElement {
  const canExpand =
    (Boolean(entry.detailText) || Boolean(entry.nestedBubble)) &&
    entry.collapsible !== false
  const rowActive = entry.active === true

  const handleToggleButton = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
    onToggle()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (!canToggle) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onToggle()
  }

  const row = (
    <>
      <span
        className={`process-stack-entry-summary ${
          rowActive && !entry.error ? 'ds-shiny-text' : ''
        }`}
      >
        <ProcessSummaryLine summary={entry.summary} filePath={entry.filePath} />
      </span>
      {canExpand ? (
        <button
          type="button"
          aria-label={open ? 'Collapse detail' : 'Expand detail'}
          aria-expanded={open}
          disabled={!canToggle}
          className={`process-stack-entry-toggle ${canToggle ? '' : 'is-static'}`}
          onClick={handleToggleButton}
        >
          {open ? (
            <ChevronDown className="process-stack-entry-chevron" strokeWidth={2} />
          ) : (
            <ChevronRight className="process-stack-entry-chevron" strokeWidth={2} />
          )}
        </button>
      ) : null}
    </>
  )

  return (
    <div className="process-stack-entry">
      <div
        role={canToggle ? 'button' : undefined}
        tabIndex={canToggle ? 0 : undefined}
        aria-expanded={canToggle ? open : undefined}
        className={`process-stack-entry-row ${canToggle ? 'is-interactive' : 'is-static'} ${
          entry.error ? 'is-error' : ''
        }`}
        onClick={canToggle ? onToggle : undefined}
        onKeyDown={handleKeyDown}
      >
        {row}
      </div>
      {open && (entry.detailText || entry.nestedBubble) ? (
        entry.detailKind === 'assistant' ? (
          <div className="process-stack-entry-assistant">
            <ProcessStackEntryDetail entry={entry} />
          </div>
        ) : (
          <div className="process-stack-entry-detail ds-work-timeline-detail">
            <ProcessStackEntryDetail entry={entry} />
          </div>
        )
      ) : null}
    </div>
  )
}

function ProcessOutputDetail({
  entry,
}: {
  entry: ProcessOutputEntrySnapshot
}): ReactElement {
  return (
    <div className="process-entry-row-assistant ds-markdown">
      <Markdown text={entry.text} streaming={entry.streaming === true} />
    </div>
  )
}

function ProcessStackRows({
  entries,
  processing,
}: {
  entries: ProcessStackEntrySnapshot[]
  processing?: boolean
}): ReactElement {
  const [openBlockId, setOpenBlockId] = useState<string | null>(() => {
    const preset = entries.find((entry) => entry.expanded)?.id
    return preset ?? null
  })
  const [closedBlockIds, setClosedBlockIds] = useState<ReadonlySet<string>>(() => new Set())

  return (
    <div className="ds-work-stack">
      {entries.map((entry) => {
        const hasDetail = Boolean(entry.detailText) || Boolean(entry.nestedBubble)
        const staticOpen = hasDetail && entry.collapsible === false
        const defaultOpen = entry.error === true
        const forceOpen =
          entry.forceOpen === true || entryAutoForceOpen(entry, processing)
        const userClosed = closedBlockIds.has(entry.id)
        const userOpened = openBlockId === entry.id
        const open =
          hasDetail &&
          (staticOpen || forceOpen || userOpened || (defaultOpen && !userClosed))
        const canExpand = hasDetail && !staticOpen
        const canToggle = canExpand && !forceOpen
        const handleToggle = (): void => {
          if (!canToggle) return
          if (open) {
            setOpenBlockId((id) => (id === entry.id ? null : id))
            if (defaultOpen) {
              setClosedBlockIds((ids) => {
                const next = new Set(ids)
                next.add(entry.id)
                return next
              })
            }
            return
          }
          setClosedBlockIds((ids) => {
            if (!ids.has(entry.id)) return ids
            const next = new Set(ids)
            next.delete(entry.id)
            return next
          })
          setOpenBlockId(entry.id)
        }

        return (
          <ProcessStackEntryRow
            key={entry.id}
            entry={entry}
            open={open}
            canToggle={canToggle}
            onToggle={handleToggle}
          />
        )
      })}
    </div>
  )
}

export function ProcessSectionRow({ section, expanded, onToggle }: Props): ReactElement {
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null)
  const singleExecutionEntry =
    section.kind === 'execution' && section.stackEntries?.length === 1
      ? section.stackEntries[0]
      : null

  if (section.kind === 'output') {
    const outputEntries =
      section.outputEntries?.filter((entry) => entry.text.trim().length > 0) ?? []
    if (outputEntries.length === 0) return <></>
    return (
      <div className="process-section-row-output">
        {outputEntries.map((entry) => (
          <ProcessOutputDetail key={entry.id} entry={entry} />
        ))}
      </div>
    )
  }

  if (singleExecutionEntry) {
    const entrySnapshot = stackEntryToProcessEntry(singleExecutionEntry, section)
    return (
      <ProcessEntryRow entry={entrySnapshot} expanded={expanded} onToggle={onToggle} />
    )
  }

  const hasDetails =
    section.kind === 'reasoning'
      ? Boolean(section.reasoningText?.trim())
      : (section.stackEntries?.length ?? 0) > 0
  const pendingApproval = sectionHasPendingApproval(section)
  const requestUserInput = sectionHasRequestUserInput(section)
  const defaultExpanded =
    section.hasError === true ||
    pendingApproval ||
    (section.active === true && section.kind === 'reasoning') ||
    (section.processing === true &&
      section.kind === 'execution' &&
      requestUserInput) ||
    section.expanded === true
  const forceExpanded = section.forceExpanded === true || pendingApproval
  const isControlled = expanded !== undefined
  const isExpanded =
    hasDetails &&
    (forceExpanded || (isControlled ? expanded : (userExpanded ?? defaultExpanded)))
  const canToggleSection =
    section.collapsible !== false && hasDetails && !forceExpanded

  const handleSectionToggle = (): void => {
    if (!canToggleSection || forceExpanded) return
    if (onToggle) {
      onToggle()
      return
    }
    if (isControlled) return
    setUserExpanded(!(userExpanded ?? defaultExpanded))
  }
  const showActiveError = section.showActiveError === true
  const titleClass = section.hasError ? 'is-error' : ''
  const titleShimmer = section.active && !section.hasError ? 'ds-shiny-text' : ''

  const header = (
    <>
      {showActiveError ? (
        <span className="ds-work-logo-slot ds-work-logo-slot-sm process-section-row-error-dot-wrap">
          <span className="process-section-row-error-dot" />
        </span>
      ) : null}
      <span className={titleShimmer}>{section.title}</span>
      {canToggleSection ? (
        isExpanded ? (
          <ChevronDown className="process-section-row-chevron is-expanded" strokeWidth={1.8} />
        ) : (
          <ChevronRight className="process-section-row-chevron" strokeWidth={1.8} />
        )
      ) : null}
    </>
  )

  return (
    <div className="process-section-row">
      {canToggleSection ? (
        <button
          type="button"
          aria-expanded={isExpanded}
          className={`process-section-row-toggle ${titleClass}`}
          onClick={handleSectionToggle}
        >
          {header}
        </button>
      ) : (
        <div className={`process-section-row-label ${titleClass}`}>{header}</div>
      )}

      {isExpanded && hasDetails ? (
        <div className="process-section-row-detail">
          {section.kind === 'reasoning' && section.reasoningText ? (
            <div className="process-section-row-reasoning ds-markdown">
              <Markdown
                text={section.reasoningText}
                streaming={Boolean(section.active && section.processing)}
              />
            </div>
          ) : section.stackEntries ? (
            <ProcessStackRows
              entries={section.stackEntries}
              processing={section.processing}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
