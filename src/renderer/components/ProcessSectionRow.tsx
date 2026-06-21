// Process timeline section row echoing Kun's ProcessSectionRow
// (../Kun/src/renderer/src/components/chat/message-timeline-process.tsx).
// Visual only: parent supplies section snapshots and optional toggle callbacks.

import { useState, type ReactElement, type RefObject } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useDeferredRender } from '../hooks/use-deferred-render'
import { Markdown } from './Markdown'
import {
  MESSAGE_BUBBLE_PREVIEW_APPROVAL_DONE,
  MESSAGE_BUBBLE_PREVIEW_APPROVAL_PENDING,
  MESSAGE_BUBBLE_PREVIEW_USER_INPUT,
  type MessageBubbleSnapshot,
} from './MessageBubble'
import { ProcessEntryDetail } from './ProcessEntryDetail'
import { ProcessEntryRow, type ProcessEntrySnapshot } from './ProcessEntryRow'
import { ProcessStackRows, systemEntryHasExpandableDetail } from './ProcessStackRows'
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
  detailKind?:
    | 'text'
    | 'command'
    | 'patch'
    | 'error'
    | 'assistant'
    | 'approval'
    | 'user_input'
    | 'reasoning'
  detailFilePath?: string
  nestedBubble?: MessageBubbleSnapshot
  meta?: RuntimeMetaChipsSnapshot
  /** Process block kind — drives system-message expand rules like Kun. */
  blockKind?: 'system'
  /** When set, detailText is block.detail rather than duplicated summary text. */
  explicitDetail?: boolean
  showCompactionIcon?: boolean
  /** Running request_user_input tool — auto force-opens during processing like Kun. */
  requestUserInput?: boolean
  /** Pending approval block — force-opens even when not active, like Kun isPendingApproval. */
  pendingApproval?: boolean
  /** Pending user_input block — auto force-opens during processing like Kun. */
  pendingUserInput?: boolean
  /** Running tool block during processing — drives row shimmer like Kun. */
  runningTool?: boolean
  /** When false, suppresses inline file-reference links like Kun non-tool blocks. */
  toolBlock?: boolean
  /** Wrap summary text instead of truncating — used for assistant/system rows. */
  wrapSummary?: boolean
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
  /** When >1, reasoning title becomes "Thought (N steps)" like Kun. */
  reasoningStepCount?: number
  stackEntries?: ProcessStackEntrySnapshot[]
  outputEntries?: ProcessOutputEntrySnapshot[]
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.max(1, Math.round(ms))}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)}s`
  if (ms < 3_600_000) {
    const totalSeconds = Math.round(ms / 1000)
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m}m ${s}s`
  }
  if (ms < 86_400_000) {
    const totalMinutes = Math.round(ms / 60_000)
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return `${h}h ${m}m`
  }
  const totalHours = Math.round(ms / 3_600_000)
  const d = Math.floor(totalHours / 24)
  const h = totalHours % 24
  return `${d}d ${h}h`
}

function describeReasoningSectionTitle(
  section: ProcessSectionSnapshot,
  opts: {
    singleReasoningSection: boolean
    reasoningDurationMs?: number
  },
): string {
  if (section.processing === true && section.active === true) {
    return 'Thinking…'
  }
  if (
    opts.singleReasoningSection &&
    typeof opts.reasoningDurationMs === 'number' &&
    opts.reasoningDurationMs >= 1000
  ) {
    return `Thought for ${formatDuration(opts.reasoningDurationMs)}`
  }
  const stepCount = section.reasoningStepCount ?? 1
  if (stepCount > 1) {
    return `Thought (${stepCount} steps)`
  }
  return 'Thinking'
}

type StackEntrySummaryKind =
  | 'file_change'
  | 'command_execution'
  | 'tool'
  | 'approval'

function classifyStackEntry(entry: ProcessStackEntrySnapshot): StackEntrySummaryKind {
  if (entry.detailKind === 'approval' || entry.pendingApproval === true) {
    return 'approval'
  }
  if (entry.detailKind === 'patch') {
    return 'file_change'
  }
  if (entry.detailKind === 'command') {
    return 'command_execution'
  }
  const verb = entry.summary.trim().split(/\s+/)[0]?.toLowerCase() ?? ''
  if (verb === 'edit' || verb === 'write') {
    return 'file_change'
  }
  if (verb === 'read' && entry.filePath) {
    return 'file_change'
  }
  if (verb === 'run' || verb === 'bash' || verb === 'shell') {
    return 'command_execution'
  }
  return 'tool'
}

/** Kun summarizeExecutionSection — grouped multi-entry execution section titles. */
function summarizeExecutionSection(entries: ProcessStackEntrySnapshot[]): string {
  let fileCount = 0
  let commandCount = 0
  let toolCount = 0
  let approvalCount = 0

  for (const entry of entries) {
    switch (classifyStackEntry(entry)) {
      case 'approval':
        approvalCount += 1
        break
      case 'file_change':
        fileCount += 1
        break
      case 'command_execution':
        commandCount += 1
        break
      default:
        toolCount += 1
    }
  }

  const parts: string[] = []
  if (fileCount > 0) {
    parts.push(fileCount === 1 ? 'Edited 1 file' : `Edited ${fileCount} files`)
  }
  if (commandCount > 0) {
    parts.push(commandCount === 1 ? 'Ran 1 command' : `Ran ${commandCount} commands`)
  }
  if (toolCount > 0) {
    parts.push(toolCount === 1 ? 'Used 1 tool' : `Used ${toolCount} tools`)
  }
  if (approvalCount > 0) {
    parts.push(approvalCount === 1 ? '1 approval' : `${approvalCount} approvals`)
  }

  if (parts.length > 0) return parts.join(' · ')
  return `Work process (${entries.length} steps)`
}

function resolveProcessSectionTitle(
  section: ProcessSectionSnapshot,
  opts?: {
    singleReasoningSection?: boolean
    reasoningDurationMs?: number
  },
): string {
  if (
    section.kind === 'reasoning' &&
    opts?.singleReasoningSection !== undefined
  ) {
    return describeReasoningSectionTitle(section, {
      singleReasoningSection: opts.singleReasoningSection,
      reasoningDurationMs: opts.reasoningDurationMs,
    })
  }
  if (section.kind === 'execution') {
    const entries = section.stackEntries ?? []
    if (entries.length > 1) {
      return summarizeExecutionSection(entries)
    }
  }
  return section.title
}

function sectionHasPendingApproval(section: ProcessSectionSnapshot): boolean {
  if (section.hasPendingApproval === true) return true
  return (
    section.stackEntries?.some((entry) => entry.pendingApproval === true) ?? false
  )
}

function sectionHasRequestUserInput(section: ProcessSectionSnapshot): boolean {
  if (section.hasRequestUserInput === true) return true
  return (
    section.processing === true &&
    (section.stackEntries?.some(
      (entry) =>
        entry.requestUserInput === true ||
        entry.pendingUserInput === true,
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
  reasoningSteps: {
    kind: 'reasoning',
    title: 'Thinking',
    reasoningStepCount: 3,
    collapsible: true,
    expanded: false,
    reasoningText:
      'First I checked imports, then traced token validation, then planned the middleware edit.',
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
        pendingApproval: true,
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
        pendingApproval: true,
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
  executionApprovalResolved: {
    kind: 'execution',
    title: 'Approved deploy · Read 1 file',
    collapsible: true,
    expanded: false,
    stackEntries: [
      {
        id: 'approval',
        summary: 'Approved deploy to staging',
        collapsible: true,
        expanded: false,
        detailKind: 'approval',
        nestedBubble: MESSAGE_BUBBLE_PREVIEW_APPROVAL_DONE,
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
        pendingUserInput: true,
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
  executionRedundantDetail: {
    kind: 'execution',
    title: 'Edited 1 file · Ran 1 command',
    collapsible: true,
    expanded: true,
    stackEntries: [
      {
        id: 'read',
        summary: 'Read src/auth/middleware.ts',
        filePath: 'src/auth/middleware.ts',
        detailText: 'Read src/auth/middleware.ts',
        detailKind: 'command',
      },
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
  executionSystemMessages: {
    kind: 'execution',
    title: 'Used 2 tools',
    collapsible: true,
    expanded: true,
    stackEntries: [
      {
        id: 'system-short',
        summary: 'Workspace index refreshed successfully.',
        blockKind: 'system',
        detailText: 'Workspace index refreshed successfully.',
        detailKind: 'text',
      },
      {
        id: 'system-long',
        summary:
          'A background sync job refreshed the workspace index and validated that every referenced package still resolves. Two optional dependencies were skipped because they are only used in CI.',
        blockKind: 'system',
        collapsible: true,
        expanded: false,
        detailText:
          'A background sync job refreshed the workspace index and validated that every referenced package still resolves. Two optional dependencies were skipped because they are only used in CI.',
        detailKind: 'text',
      },
    ],
  },
  executionRequestInput: {
    kind: 'execution',
    title: 'Waiting for input',
    processing: true,
    active: true,
    hasRequestUserInput: true,
    collapsible: true,
    expanded: true,
    stackEntries: [
      {
        id: 'request-input-tool',
        summary: 'Request user input: Which database should I use?',
        active: true,
        requestUserInput: true,
        collapsible: true,
        detailText:
          'The project supports SQLite and Postgres. Which database should I configure for local development?',
        detailKind: 'text',
      },
      {
        id: 'read',
        summary: 'Read package.json',
        filePath: 'package.json',
      },
    ],
  },
  executionPendingShimmer: {
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
        pendingApproval: true,
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
  viewportRef?: RefObject<HTMLDivElement | null>
  /** When set with singleReasoningSection, reasoning titles match Kun's describeProcessSection. */
  reasoningDurationMs?: number
  singleReasoningSection?: boolean
}

function splitSummaryVerb(summary: string): { verb: string; rest: string } {
  const trimmed = summary.trim()
  if (!trimmed) return { verb: '', rest: '' }
  const space = trimmed.search(/\s/)
  if (space < 0) return { verb: trimmed, rest: '' }
  return { verb: trimmed.slice(0, space), rest: trimmed.slice(space + 1).trim() }
}

function sectionHasError(section: ProcessSectionSnapshot): boolean {
  if (section.hasError === true) return true
  return section.stackEntries?.some((entry) => entry.error === true) ?? false
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
    blockId: entry.id,
    runningTool: entry.runningTool,
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
    pendingApproval: entry.pendingApproval,
    pendingUserInput: entry.pendingUserInput,
    blockKind: entry.blockKind,
    explicitDetail: entry.explicitDetail,
    toolBlock: entry.toolBlock,
    wrapSummary:
      entry.wrapSummary === true ||
      entry.detailKind === 'assistant' ||
      (entry.blockKind === 'system' &&
        !systemEntryHasExpandableDetail(
          entry.summary,
          entry.detailText,
          entry.explicitDetail,
        )) ||
      (entry.collapsible === false && !entry.detailText && !entry.nestedBubble),
  }
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

export function ProcessSectionRow({
  section,
  expanded,
  onToggle,
  viewportRef,
  reasoningDurationMs,
  singleReasoningSection,
}: Props): ReactElement {
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
      <ProcessEntryRow
        entry={entrySnapshot}
        processing={section.processing}
        expanded={expanded}
        onToggle={onToggle}
      />
    )
  }

  const hasDetails =
    section.kind === 'reasoning'
      ? Boolean(section.reasoningText?.trim())
      : (section.stackEntries?.length ?? 0) > 0
  const pendingApproval = sectionHasPendingApproval(section)
  const requestUserInput = sectionHasRequestUserInput(section)
  const hasError = sectionHasError(section)
  const defaultExpanded =
    hasError ||
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
  const showActiveError = section.active === true && hasError
  const titleClass = hasError ? 'is-error' : ''
  const titleShimmer = section.active && !hasError ? 'ds-shiny-text' : ''
  const displayTitle = resolveProcessSectionTitle(section, {
    singleReasoningSection,
    reasoningDurationMs,
  })
  const { ref: deferredDetailRef, shouldRender: shouldRenderDetail } =
    useDeferredRender<HTMLDivElement>({
      enabled: isExpanded && hasDetails,
      immediate: Boolean(section.active) || section.kind === 'execution',
      root: viewportRef,
    })

  const header = (
    <>
      {showActiveError ? (
        <span className="ds-work-logo-slot ds-work-logo-slot-sm process-section-row-error-dot-wrap">
          <span className="process-section-row-error-dot" />
        </span>
      ) : null}
      <span className={titleShimmer}>{displayTitle}</span>
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
        <div
          ref={deferredDetailRef}
          className="process-section-row-detail"
          style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 220px' }}
        >
          {shouldRenderDetail ? (
            section.kind === 'reasoning' && section.reasoningText ? (
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
            ) : null
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
