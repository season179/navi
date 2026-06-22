// Tool timeline entry echoing Kun's ToolEntry
// (../Kun/src/renderer/src/components/chat/message-timeline-bubbles.tsx).
// Visual only: parent supplies a tool block snapshot.

import { useEffect, useState, type ReactElement } from 'react'
import { ChevronDown, ChevronRight, FileEdit, Terminal, Wrench } from 'lucide-react'
import { extractUnifiedDiffText } from '../lib/diff-stats'
import { DiffView } from './DiffView'
import {
  MediaAttachmentGallery,
  MEDIA_ATTACHMENT_GALLERY_PREVIEW,
  type MediaReference,
} from './MediaPreviewTile'
import {
  resolveToolEntryKindLabel,
  resolveToolEntrySessionStatusLabel,
  TOOL_ENTRY_STATUS_RUNNING,
  type ToolEntryKind,
} from '../lib/toolEntry'
import { RuntimeMetaChips, type RuntimeMetaChipsSnapshot } from './RuntimeMetaChips'

export type ToolBlockStatus = 'done' | 'running' | 'error'

export type ToolBlockKind = ToolEntryKind

export type ToolBlockSnapshot = {
  id: string
  status: ToolBlockStatus
  toolKind: ToolBlockKind
  summary: string
  filePath?: string
  detail?: string
  meta?: RuntimeMetaChipsSnapshot & {
    exit_code?: number
    duration_ms?: number
    session_id?: string
    status?: string
  }
  attachments?: MediaReference[]
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

const PREVIEW_COMMAND_OUTPUT = `npm test

> navi@0.0.1 test
> node --test "test/**/*.test.mjs"

✓ auth middleware tests passed
✗ session store persistence test failed
  Expected 2 sessions, received 1`

/** Default file-change preview for ?toolEntry=1 visual verification. */
export const TOOL_ENTRY_PREVIEW: ToolBlockSnapshot = {
  id: 'preview-tool-file',
  status: 'done',
  toolKind: 'file_change',
  filePath: 'src/auth/middleware.ts',
  summary: 'Updated auth middleware to strip Bearer prefix before verification.',
  detail: PREVIEW_PATCH_AUTH,
  meta: {
    duration_ms: 4200,
    activeSkillIds: ['typescript'],
  },
}

/** Running preview for ?toolEntry=running. */
export const TOOL_ENTRY_PREVIEW_RUNNING: ToolBlockSnapshot = {
  id: 'preview-tool-running',
  status: 'running',
  toolKind: 'generic',
  summary: 'Searching the workspace for session token references…',
}

/** Error preview for ?toolEntry=error. */
export const TOOL_ENTRY_PREVIEW_ERROR: ToolBlockSnapshot = {
  id: 'preview-tool-error',
  status: 'error',
  toolKind: 'command_execution',
  summary: 'npm test failed in the workspace root.',
  detail: PREVIEW_COMMAND_OUTPUT,
  meta: {
    exit_code: 1,
    duration_ms: 18_400,
    activeSkillIds: ['shell'],
  },
}

/** Command preview for ?toolEntry=command. */
export const TOOL_ENTRY_PREVIEW_COMMAND: ToolBlockSnapshot = {
  id: 'preview-tool-command',
  status: 'done',
  toolKind: 'command_execution',
  summary: 'Ran npm test in the workspace root.',
  detail: PREVIEW_COMMAND_OUTPUT,
  meta: {
    exit_code: 0,
    duration_ms: 12_800,
    session_id: 'sess-preview-001',
    status: 'done',
    attachmentIds: ['att-001', 'att-002'],
    activeSkillIds: ['shell'],
    childLabel: 'deploy-check',
    sources: [{ url: 'https://example.com/docs/cli' }],
  },
  attachments: MEDIA_ATTACHMENT_GALLERY_PREVIEW,
}

type Props = {
  block: ToolBlockSnapshot
  nested?: boolean
  defaultExpanded?: boolean
}

function ToolAttachmentPreviews({
  attachments,
}: {
  attachments?: MediaReference[]
}): ReactElement | null {
  if (!attachments?.length) return null
  return <MediaAttachmentGallery media={attachments} variant="tool" />
}

export function ToolEntry({
  block,
  defaultExpanded,
}: Props): ReactElement {
  const [open, setOpen] = useState(
    () => defaultExpanded ?? (block.status === 'error' || block.status === 'running'),
  )

  useEffect(() => {
    if (block.status === 'running') {
      setOpen(true)
    }
  }, [block.status, block.id])

  const effectiveOpen = block.status === 'running' ? true : open

  const toneClass =
    block.status === 'error'
      ? ' is-error'
      : block.status === 'running'
        ? ' is-running'
        : ''

  const Icon =
    block.toolKind === 'file_change'
      ? FileEdit
      : block.toolKind === 'command_execution'
        ? Terminal
        : Wrench

  const exitCode = block.meta?.exit_code
  const durationMs = block.meta?.duration_ms
  const sessionId = block.meta?.session_id?.trim()
  const sessionStatus = block.meta?.status?.trim()

  const hasDetail = !!(block.detail && block.detail.trim().length > 0)
  const patchText =
    block.toolKind === 'file_change'
      ? extractUnifiedDiffText(block.detail)
      : undefined
  const canExpand = hasDetail || block.status === 'running'

  return (
    <div className={`tool-entry${toneClass}`}>
      <button
        type="button"
        onClick={() => {
          if (!canExpand || block.status === 'running') return
          setOpen((value) => !value)
        }}
        className={`tool-entry-toggle${
          canExpand && block.status !== 'running' ? ' is-expandable' : ''
        }`}
      >
        <Icon className="tool-entry-icon" strokeWidth={1.75} />
        <div className="tool-entry-main">
          <div className="tool-entry-badges">
            <span className="tool-entry-kind">{resolveToolEntryKindLabel(block.toolKind)}</span>
            {block.status === 'running' ? (
              <span className="tool-entry-badge is-running">{TOOL_ENTRY_STATUS_RUNNING}</span>
            ) : null}
            {typeof exitCode === 'number' ? (
              <span
                className={`tool-entry-badge is-exit${
                  exitCode === 0 ? ' is-success' : ' is-failure'
                }`}
              >
                exit {exitCode}
              </span>
            ) : null}
            {sessionId ? (
              <span
                className="tool-entry-badge is-session"
                title={sessionId}
              >
                {resolveToolEntrySessionStatusLabel(sessionStatus)}{' '}
                {sessionId.slice(0, 12)}
              </span>
            ) : null}
            {typeof durationMs === 'number' ? (
              <span className="tool-entry-badge is-duration">
                {formatDuration(durationMs)}
              </span>
            ) : null}
          </div>
          <div className="tool-entry-summary">
            {block.filePath ? (
              <span className="tool-entry-file-path">{block.filePath} — </span>
            ) : null}
            <span>{block.summary}</span>
          </div>
          {block.meta ? <RuntimeMetaChips meta={block.meta} /> : null}
        </div>
        {canExpand ? (
          effectiveOpen ? (
            <ChevronDown className="tool-entry-chevron" strokeWidth={1.75} />
          ) : (
            <ChevronRight className="tool-entry-chevron" strokeWidth={1.75} />
          )
        ) : null}
      </button>
      <ToolAttachmentPreviews attachments={block.attachments} />
      {effectiveOpen && hasDetail ? (
        <div className="tool-entry-detail ds-panel-strip">
          {patchText !== undefined ? (
            <DiffView patch={patchText} filePath={block.filePath} />
          ) : (
            <pre className="tool-entry-detail-pre">{block.detail}</pre>
          )}
        </div>
      ) : null}
    </div>
  )
}
