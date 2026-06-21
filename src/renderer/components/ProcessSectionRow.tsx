// Process timeline section row echoing Kun's ProcessSectionRow
// (../Kun/src/renderer/src/components/chat/message-timeline-process.tsx).
// Visual only: parent supplies section snapshots and optional toggle callbacks.

import { useState, type ReactElement } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { DiffView } from './DiffView'
import { Markdown } from './Markdown'
import {
  ProcessEntryRow,
  type ProcessEntrySnapshot,
} from './ProcessEntryRow'

export type ProcessStackEntrySnapshot = {
  id: string
  summary: string
  filePath?: string
  active?: boolean
  error?: boolean
  expanded?: boolean
  collapsible?: boolean
  detailText?: string
  detailKind?: 'text' | 'patch' | 'error'
  detailFilePath?: string
}

export type ProcessSectionSnapshot = {
  kind: 'reasoning' | 'execution'
  title: string
  processing?: boolean
  active?: boolean
  hasError?: boolean
  showActiveError?: boolean
  expanded?: boolean
  collapsible?: boolean
  forceExpanded?: boolean
  reasoningText?: string
  stackEntries?: ProcessStackEntrySnapshot[]
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
    forceOpen: section.forceExpanded === true,
    expanded: entry.expanded ?? section.expanded,
    detailText: entry.detailText,
    detailKind: entry.detailKind,
    detailFilePath: entry.detailFilePath ?? entry.filePath,
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
      <button type="button" className="process-file-reference" title="Preview file">
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
  return <pre className="process-stack-entry-text">{entry.detailText}</pre>
}

function ProcessStackEntryRow({
  entry,
  expanded,
  onToggle,
}: {
  entry: ProcessStackEntrySnapshot
  expanded: boolean
  onToggle?: () => void
}): ReactElement {
  const canToggle = entry.collapsible !== false && Boolean(entry.detailText)
  const rowActive = entry.active === true

  const row = (
    <>
      <span
        className={`process-stack-entry-summary ${
          rowActive && !entry.error ? 'ds-shiny-text' : ''
        }`}
      >
        <ProcessSummaryLine summary={entry.summary} filePath={entry.filePath} />
      </span>
      {canToggle ? (
        <button
          type="button"
          aria-label={expanded ? 'Collapse detail' : 'Expand detail'}
          aria-expanded={expanded}
          className="process-stack-entry-toggle"
          onClick={(event) => {
            event.stopPropagation()
            onToggle?.()
          }}
        >
          {expanded ? (
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
      {canToggle ? (
        <button
          type="button"
          aria-expanded={expanded}
          className={`process-stack-entry-row ${entry.error ? 'is-error' : ''}`}
          onClick={onToggle}
        >
          {row}
        </button>
      ) : (
        <div className={`process-stack-entry-row is-static ${entry.error ? 'is-error' : ''}`}>
          {row}
        </div>
      )}
      {expanded && entry.detailText ? (
        <div className="process-stack-entry-detail">
          <ProcessStackEntryDetail entry={entry} />
        </div>
      ) : null}
    </div>
  )
}

function ProcessStackRows({
  entries,
  expandedEntryId,
  onToggleEntry,
}: {
  entries: ProcessStackEntrySnapshot[]
  expandedEntryId: string | null
  onToggleEntry: (id: string) => void
}): ReactElement {
  return (
    <div className="process-stack">
      {entries.map((entry) => (
        <ProcessStackEntryRow
          key={entry.id}
          entry={entry}
          expanded={expandedEntryId === entry.id}
          onToggle={
            entry.collapsible === false ? undefined : () => onToggleEntry(entry.id)
          }
        />
      ))}
    </div>
  )
}

export function ProcessSectionRow({ section, expanded, onToggle }: Props): ReactElement {
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(() => {
    const preset = section.stackEntries?.find((entry) => entry.expanded)?.id
    return preset ?? null
  })

  const singleExecutionEntry =
    section.kind === 'execution' && section.stackEntries?.length === 1
      ? section.stackEntries[0]
      : null

  if (singleExecutionEntry) {
    const entrySnapshot = stackEntryToProcessEntry(singleExecutionEntry, {
      ...section,
      expanded: expanded ?? section.expanded,
    })
    return (
      <ProcessEntryRow
        entry={entrySnapshot}
        expanded={expanded ?? section.expanded}
        onToggle={onToggle}
      />
    )
  }

  const hasDetails =
    section.kind === 'reasoning'
      ? Boolean(section.reasoningText?.trim())
      : (section.stackEntries?.length ?? 0) > 0
  const canToggleSection =
    section.collapsible !== false && hasDetails && section.forceExpanded !== true
  const isExpanded = section.expanded === true
  const showActiveError = section.showActiveError === true
  const titleClass = section.hasError ? 'is-error' : ''
  const titleShimmer = section.active && !section.hasError ? 'ds-shiny-text' : ''

  const header = (
    <>
      {showActiveError ? (
        <span className="process-section-row-error-dot-wrap">
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
          onClick={onToggle}
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
              expandedEntryId={expandedEntryId}
              onToggleEntry={(id) =>
                setExpandedEntryId((current) => (current === id ? null : id))
              }
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
