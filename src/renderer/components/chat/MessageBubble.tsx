// Message timeline bubble router echoing Kun's MessageBubble and UserMessageBubble
// (../Kun/src/renderer/src/components/chat/message-timeline-bubbles.tsx).
// Visual only: parent supplies block snapshots for each timeline kind.

import { memo, useEffect, useRef, useState, type ReactElement } from 'react'
import { PencilLine } from 'lucide-react'
import { Markdown } from '../common/Markdown'
import { CopyFeedbackButton, COPY_FEEDBACK_BUTTON_PREVIEW_TEXT } from '../common/CopyFeedbackButton'
import { ModelMetaTag, MODEL_META_TAG_PREVIEW } from './ModelMetaTag'
import {
  ClawInboundMessageCard,
  CLAW_INBOUND_MESSAGE_CARD_PREVIEW,
  type ClawInboundMessageDisplay,
} from '../claw/ClawInboundMessageCard'
import {
  WritePromptMetaDisclosure,
  WRITE_PROMPT_META_DISCLOSURE_PREVIEW,
  type WritePromptDisplay,
} from '../write/WritePromptMetaDisclosure'
import {
  UserFileReferenceChips,
  USER_FILE_REFERENCE_CHIPS_PREVIEW,
  type UserFileReference,
} from './UserFileReferenceChips'
import {
  RuntimeMetaChips,
  RUNTIME_META_CHIPS_PREVIEW,
  type RuntimeMetaChipsSnapshot,
} from '../runtime/RuntimeMetaChips'
import {
  MediaAttachmentGallery,
  MEDIA_ATTACHMENT_GALLERY_PREVIEW,
  type MediaReference,
} from './MediaPreviewTile'
import { ToolEntry, TOOL_ENTRY_PREVIEW, type ToolBlockSnapshot } from './ToolEntry'
import {
  UserInputBubble,
  USER_INPUT_BUBBLE_PREVIEW,
  type UserInputSnapshot,
} from './UserInputBubble'
import {
  MESSAGE_BUBBLE_REWIND_CANCEL,
  MESSAGE_BUBBLE_REWIND_EDIT_MESSAGE,
  MESSAGE_BUBBLE_REWIND_HINT,
  MESSAGE_BUBBLE_REWIND_RESEND,
} from '../../lib/messageBubbleUserEdit'
import {
  MESSAGE_BUBBLE_APPROVAL_ALLOW,
  MESSAGE_BUBBLE_APPROVAL_DENY,
  MESSAGE_BUBBLE_APPROVAL_TITLE,
  formatMessageBubbleApprovalTool,
  resolveMessageBubbleApprovalStatusLabel,
} from '../../lib/messageBubbleApproval'
import { formatMessageDateTime } from '../../lib/messageBubble'

export type UserMessageSnapshot = {
  kind: 'user'
  id: string
  text: string
  modelLabel?: string
  displayText?: string
  canEdit?: boolean
  route?: 'chat' | 'write' | 'claw'
  writePrompt?: WritePromptDisplay | null
  clawInbound?: {
    display: ClawInboundMessageDisplay
    text: string
  } | null
  fileReferences?: UserFileReference[]
  meta?: RuntimeMetaChipsSnapshot
  attachments?: MediaReference[]
}

export type AssistantMessageSnapshot = {
  kind: 'assistant'
  id: string
  text: string
  createdAt?: string
  streaming?: boolean
}

export type ReasoningMessageSnapshot = {
  kind: 'reasoning'
  id: string
  text: string
}

export type ToolMessageSnapshot = ToolBlockSnapshot & { kind: 'tool' }

export type UserInputMessageSnapshot = UserInputSnapshot & { kind: 'user_input' }

export type ApprovalMessageSnapshot = {
  kind: 'approval'
  id: string
  status: 'pending' | 'allowed' | 'denied' | 'error'
  toolName?: string
  summary: string
  errorMessage?: string
}

export type CompactionInlineSnapshot = {
  kind: 'compaction'
  id: string
  summary?: string
  detail?: string
}

export type ReviewInlineSnapshot = {
  kind: 'review'
  id: string
  title?: string
  reviewText?: string
}

export type SystemMessageSnapshot = {
  kind: 'system'
  id: string
  text: string
  severity?: 'info' | 'warning' | 'error'
  code?: string
}

export type MessageBubbleSnapshot =
  | UserMessageSnapshot
  | AssistantMessageSnapshot
  | ReasoningMessageSnapshot
  | ToolMessageSnapshot
  | UserInputMessageSnapshot
  | ApprovalMessageSnapshot
  | CompactionInlineSnapshot
  | ReviewInlineSnapshot
  | SystemMessageSnapshot

function UserAttachmentPreviews({
  attachments,
}: {
  attachments?: MediaReference[]
}): ReactElement | null {
  if (!attachments?.length) return null

  return (
    <div className="message-bubble-user-attachments">
      <MediaAttachmentGallery media={attachments} variant="user" />
    </div>
  )
}

type UserMessageBubbleProps = {
  block: UserMessageSnapshot
  forceEditing?: boolean
}

function UserMessageBubble({
  block,
  forceEditing = false,
}: UserMessageBubbleProps): ReactElement {
  const displayText = block.displayText?.trim() || block.text
  const canEdit = block.canEdit !== false
  const [editing, setEditing] = useState(forceEditing)
  const [draft, setDraft] = useState(displayText)
  const [writeMetaOpen, setWriteMetaOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditing(forceEditing)
  }, [forceEditing, block.id])

  useEffect(() => {
    setDraft(displayText)
    setWriteMetaOpen(false)
  }, [block.id, displayText])

  useEffect(() => {
    if (!editing) return
    const el = textareaRef.current
    if (!el) return
    el.focus()
    const len = el.value.length
    el.setSelectionRange(len, len)
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 360)}px`
  }, [editing])

  const showClawInboundCard =
    block.route === 'claw' && block.clawInbound != null

  const startEdit = (): void => {
    if (!canEdit) return
    setDraft(displayText)
    setEditing(true)
  }

  const cancelEdit = (): void => {
    setDraft(displayText)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="ds-user-message">
        <UserAttachmentPreviews attachments={block.attachments} />
        <div className="ds-user-message-bubble message-bubble-user-editing">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value)
              const el = event.currentTarget
              el.style.height = 'auto'
              el.style.height = `${Math.min(el.scrollHeight, 360)}px`
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault()
                cancelEdit()
              }
            }}
            rows={2}
            className="message-bubble-user-edit-textarea"
          />
          <div className="message-bubble-user-edit-footer">
            <span className="message-bubble-user-edit-hint">
              {MESSAGE_BUBBLE_REWIND_HINT}
            </span>
            <div className="message-bubble-user-edit-actions">
              <button type="button" className="message-bubble-user-edit-cancel" onClick={cancelEdit}>
                {MESSAGE_BUBBLE_REWIND_CANCEL}
              </button>
              <button
                type="button"
                className="message-bubble-user-edit-submit"
                disabled={!draft.trim()}
                onClick={() => setEditing(false)}
              >
                {MESSAGE_BUBBLE_REWIND_RESEND}
              </button>
            </div>
          </div>
        </div>
        <div className="message-bubble-user-model-row is-right-only">
          <ModelMetaTag label={block.modelLabel} />
        </div>
      </div>
    )
  }

  return (
    <div className="ds-user-message message-bubble-user group">
      <UserAttachmentPreviews attachments={block.attachments} />
      {showClawInboundCard && block.clawInbound ? (
        <ClawInboundMessageCard
          display={block.clawInbound.display}
          text={block.clawInbound.text}
        />
      ) : (
        <div className="ds-user-message-bubble">
          <div className="message-bubble-user-text">{displayText}</div>
          {block.writePrompt ? (
            <WritePromptMetaDisclosure
              display={block.writePrompt}
              expanded={writeMetaOpen}
              onToggle={() => setWriteMetaOpen((value) => !value)}
            />
          ) : null}
          {block.fileReferences?.length ? (
            <UserFileReferenceChips references={block.fileReferences} />
          ) : null}
          {block.meta ? (
            <RuntimeMetaChips meta={block.meta} align="right" hideAttachments />
          ) : null}
        </div>
      )}
      <div className="message-bubble-user-footer">
        <ModelMetaTag label={block.modelLabel} align="left" />
        <div className="message-bubble-user-actions">
          <CopyFeedbackButton text={displayText} iconOnly />
          {canEdit ? (
            <button
              type="button"
              onClick={startEdit}
              title={MESSAGE_BUBBLE_REWIND_EDIT_MESSAGE}
              aria-label={MESSAGE_BUBBLE_REWIND_EDIT_MESSAGE}
              className="message-bubble-user-edit-button"
            >
              <PencilLine className="message-bubble-user-edit-icon" strokeWidth={1.8} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

type MessageBubbleProps = {
  block: MessageBubbleSnapshot
  nested?: boolean
  forceEditing?: boolean
}

function MessageBubbleImpl({
  block,
  nested = false,
  forceEditing = false,
}: MessageBubbleProps): ReactElement {
  if (block.kind === 'user') {
    return <UserMessageBubble block={block} forceEditing={forceEditing} />
  }

  if (block.kind === 'assistant') {
    const streaming = block.streaming === true || block.id === 'live-assistant'
    const createdAtLabel = block.createdAt ? formatMessageDateTime(block.createdAt) : null

    return (
      <div className="message-bubble-assistant group/message">
        <div className="ds-markdown ds-chat-answer message-bubble-assistant-body">
          <Markdown text={block.text} streaming={streaming} />
        </div>
        {!streaming ? (
          <div className="message-bubble-assistant-footer">
            <span className="message-bubble-assistant-timestamp">{createdAtLabel ?? ''}</span>
            <CopyFeedbackButton text={block.text} />
          </div>
        ) : null}
      </div>
    )
  }

  if (block.kind === 'reasoning') {
    return (
      <div className="message-bubble-reasoning">
        <div className="ds-markdown message-bubble-reasoning-body">
          <Markdown text={block.text} streaming={false} />
        </div>
      </div>
    )
  }

  if (block.kind === 'tool') {
    const { kind: _kind, ...toolBlock } = block
    return <ToolEntry block={toolBlock} nested={nested} />
  }

  if (block.kind === 'user_input') {
    const { kind: _kind, ...userInputBlock } = block
    return <UserInputBubble block={userInputBlock} nested={nested} />
  }

  if (block.kind === 'approval') {
    const done = block.status !== 'pending'
    const statusLabel = resolveMessageBubbleApprovalStatusLabel(block.status)

    return (
      <div
        className={`message-bubble-approval${
          block.status === 'error' ? ' is-error' : ''
        }`}
      >
        <div className="message-bubble-approval-title">{MESSAGE_BUBBLE_APPROVAL_TITLE}</div>
        {block.toolName ? (
          <div className="message-bubble-approval-tool">
            {formatMessageBubbleApprovalTool(block.toolName)}
          </div>
        ) : null}
        <p className="message-bubble-approval-summary">{block.summary}</p>
        {block.errorMessage ? (
          <p className="message-bubble-approval-error">{block.errorMessage}</p>
        ) : null}
        {!done ? (
          <div className="message-bubble-approval-actions">
            <button type="button" className="message-bubble-approval-allow">
              {MESSAGE_BUBBLE_APPROVAL_ALLOW}
            </button>
            <button type="button" className="message-bubble-approval-deny">
              {MESSAGE_BUBBLE_APPROVAL_DENY}
            </button>
          </div>
        ) : (
          <p className="message-bubble-approval-status">{statusLabel}</p>
        )}
      </div>
    )
  }

  if (block.kind === 'compaction') {
    return (
      <div className="message-bubble-compaction">
        {block.detail || block.summary}
      </div>
    )
  }

  if (block.kind === 'review') {
    return (
      <div className="message-bubble-review">
        {block.reviewText || block.title}
      </div>
    )
  }

  if (block.kind === 'system') {
    const errorTone = block.severity === 'error'
    const warningTone = block.severity === 'warning'

    return (
      <div
        className={`message-bubble-system${
          errorTone ? ' is-error' : warningTone ? ' is-warning' : ''
        }`}
      >
        <p className="message-bubble-system-text">{block.text}</p>
        {block.code ? <p className="message-bubble-system-code">{block.code}</p> : null}
      </div>
    )
  }

  return <></>
}

export const MessageBubble = memo(MessageBubbleImpl)

/** Default user preview for ?messageBubblePreview=user. */
export const MESSAGE_BUBBLE_PREVIEW_USER: UserMessageSnapshot = {
  kind: 'user',
  id: 'preview-user',
  text: COPY_FEEDBACK_BUTTON_PREVIEW_TEXT,
  modelLabel: MODEL_META_TAG_PREVIEW,
}

/** Editing preview for ?messageBubblePreview=userEditing. */
export const MESSAGE_BUBBLE_PREVIEW_USER_EDITING: UserMessageSnapshot = {
  ...MESSAGE_BUBBLE_PREVIEW_USER,
  id: 'preview-user-editing',
}

/** Write meta preview for ?messageBubblePreview=userWriteMeta. */
export const MESSAGE_BUBBLE_PREVIEW_USER_WRITE_META: UserMessageSnapshot = {
  kind: 'user',
  id: 'preview-user-write-meta',
  text: WRITE_PROMPT_META_DISCLOSURE_PREVIEW.userInput,
  modelLabel: MODEL_META_TAG_PREVIEW,
  route: 'write',
  writePrompt: WRITE_PROMPT_META_DISCLOSURE_PREVIEW,
}

/** Claw inbound preview for ?messageBubblePreview=userClawInbound. */
export const MESSAGE_BUBBLE_PREVIEW_USER_CLAW_INBOUND: UserMessageSnapshot = {
  kind: 'user',
  id: 'preview-user-claw-inbound',
  text: CLAW_INBOUND_MESSAGE_CARD_PREVIEW.text,
  modelLabel: MODEL_META_TAG_PREVIEW,
  route: 'claw',
  clawInbound: CLAW_INBOUND_MESSAGE_CARD_PREVIEW,
}

/** Rich user preview for ?messageBubblePreview=userRich. */
export const MESSAGE_BUBBLE_PREVIEW_USER_RICH: UserMessageSnapshot = {
  kind: 'user',
  id: 'preview-user-rich',
  text: 'Refactor the auth middleware and add JWT validation with refresh token rotation.',
  modelLabel: MODEL_META_TAG_PREVIEW,
  fileReferences: USER_FILE_REFERENCE_CHIPS_PREVIEW,
  meta: RUNTIME_META_CHIPS_PREVIEW,
  attachments: MEDIA_ATTACHMENT_GALLERY_PREVIEW.slice(0, 2),
}

/** Assistant preview for ?messageBubblePreview=assistant. */
export const MESSAGE_BUBBLE_PREVIEW_ASSISTANT: AssistantMessageSnapshot = {
  kind: 'assistant',
  id: 'preview-assistant',
  text: `I'll refactor the middleware to strip the Bearer prefix and verify JWTs.

\`\`\`typescript
export function authMiddleware(req: Request): boolean {
  const token = req.headers.authorization?.replace(/^Bearer\\s+/, '')
  return token ? verifyJwt(token) : false
}
\`\`\`

This keeps the existing route handlers unchanged.`,
  createdAt: '2026-06-22T14:30:00.000Z',
}

/** Streaming assistant preview for ?messageBubblePreview=assistantStreaming. */
export const MESSAGE_BUBBLE_PREVIEW_ASSISTANT_STREAMING: AssistantMessageSnapshot = {
  kind: 'assistant',
  id: 'live-assistant',
  text: "I'm updating the middleware now and will add refresh token rotation next…",
  streaming: true,
}

/** Reasoning preview for ?messageBubblePreview=reasoning. */
export const MESSAGE_BUBBLE_PREVIEW_REASONING: ReasoningMessageSnapshot = {
  kind: 'reasoning',
  id: 'preview-reasoning',
  text: 'The legacy middleware accepts opaque session tokens. JWT validation needs a separate verify path and should preserve the existing error shape for route handlers.',
}

/** Tool preview for ?messageBubblePreview=tool. */
export const MESSAGE_BUBBLE_PREVIEW_TOOL: ToolMessageSnapshot = {
  kind: 'tool',
  ...TOOL_ENTRY_PREVIEW,
}

/** User input preview for ?messageBubblePreview=userInput. */
export const MESSAGE_BUBBLE_PREVIEW_USER_INPUT: UserInputMessageSnapshot = {
  kind: 'user_input',
  ...USER_INPUT_BUBBLE_PREVIEW,
}

/** Pending approval preview for ?messageBubblePreview=approvalPending. */
export const MESSAGE_BUBBLE_PREVIEW_APPROVAL_PENDING: ApprovalMessageSnapshot = {
  kind: 'approval',
  id: 'preview-approval-pending',
  status: 'pending',
  toolName: 'run_terminal_command',
  summary: 'Run npm test in the workspace root to verify the auth middleware changes.',
}

/** Done approval preview for ?messageBubblePreview=approvalDone. */
export const MESSAGE_BUBBLE_PREVIEW_APPROVAL_DONE: ApprovalMessageSnapshot = {
  kind: 'approval',
  id: 'preview-approval-done',
  status: 'allowed',
  toolName: 'run_terminal_command',
  summary: 'Run npm test in the workspace root to verify the auth middleware changes.',
}

/** Error approval preview for ?messageBubblePreview=approvalError. */
export const MESSAGE_BUBBLE_PREVIEW_APPROVAL_ERROR: ApprovalMessageSnapshot = {
  kind: 'approval',
  id: 'preview-approval-error',
  status: 'error',
  toolName: 'run_terminal_command',
  summary: 'Run npm test in the workspace root to verify the auth middleware changes.',
  errorMessage: 'Approval request timed out after 60 seconds.',
}

/** System preview for ?messageBubblePreview=system. */
export const MESSAGE_BUBBLE_PREVIEW_SYSTEM: SystemMessageSnapshot = {
  kind: 'system',
  id: 'preview-system',
  text: 'Switched to workspace /Users/season/Personal/navi.',
}

/** Warning system preview for ?messageBubblePreview=systemWarning. */
export const MESSAGE_BUBBLE_PREVIEW_SYSTEM_WARNING: SystemMessageSnapshot = {
  kind: 'system',
  id: 'preview-system-warning',
  text: 'Provider rate limit approaching — responses may slow down.',
  severity: 'warning',
}

/** Error system preview for ?messageBubblePreview=systemError. */
export const MESSAGE_BUBBLE_PREVIEW_SYSTEM_ERROR: SystemMessageSnapshot = {
  kind: 'system',
  id: 'preview-system-error',
  text: 'Runtime disconnected unexpectedly.',
  severity: 'error',
  code: 'RUNTIME_DISCONNECTED',
}

/** Inline compaction preview for ?messageBubblePreview=compaction. */
export const MESSAGE_BUBBLE_PREVIEW_COMPACTION: CompactionInlineSnapshot = {
  kind: 'compaction',
  id: 'preview-compaction-inline',
  summary: 'Compacted context',
  detail: 'Removed 18 earlier tool traces to stay within the context window.',
}

/** Inline review preview for ?messageBubblePreview=review. */
export const MESSAGE_BUBBLE_PREVIEW_REVIEW: ReviewInlineSnapshot = {
  kind: 'review',
  id: 'preview-review-inline',
  title: 'Review requested',
  reviewText: 'Please review the auth middleware changes before merging.',
}

export const MESSAGE_BUBBLE_PREVIEW = {
  user: MESSAGE_BUBBLE_PREVIEW_USER,
  userEditing: MESSAGE_BUBBLE_PREVIEW_USER_EDITING,
  userWriteMeta: MESSAGE_BUBBLE_PREVIEW_USER_WRITE_META,
  userClawInbound: MESSAGE_BUBBLE_PREVIEW_USER_CLAW_INBOUND,
  userRich: MESSAGE_BUBBLE_PREVIEW_USER_RICH,
  assistant: MESSAGE_BUBBLE_PREVIEW_ASSISTANT,
  assistantStreaming: MESSAGE_BUBBLE_PREVIEW_ASSISTANT_STREAMING,
  reasoning: MESSAGE_BUBBLE_PREVIEW_REASONING,
  tool: MESSAGE_BUBBLE_PREVIEW_TOOL,
  userInput: MESSAGE_BUBBLE_PREVIEW_USER_INPUT,
  approvalPending: MESSAGE_BUBBLE_PREVIEW_APPROVAL_PENDING,
  approvalDone: MESSAGE_BUBBLE_PREVIEW_APPROVAL_DONE,
  approvalError: MESSAGE_BUBBLE_PREVIEW_APPROVAL_ERROR,
  system: MESSAGE_BUBBLE_PREVIEW_SYSTEM,
  systemWarning: MESSAGE_BUBBLE_PREVIEW_SYSTEM_WARNING,
  systemError: MESSAGE_BUBBLE_PREVIEW_SYSTEM_ERROR,
  compaction: MESSAGE_BUBBLE_PREVIEW_COMPACTION,
  review: MESSAGE_BUBBLE_PREVIEW_REVIEW,
} as const

export type MessageBubblePreviewMode = keyof typeof MESSAGE_BUBBLE_PREVIEW

export function MessageBubblePreview({
  mode,
}: {
  mode: MessageBubblePreviewMode
}): ReactElement {
  const block = MESSAGE_BUBBLE_PREVIEW[mode]

  return (
    <div className="message-bubble-preview">
      <div className="message-bubble-preview-stage">
        <MessageBubble
          block={block}
          forceEditing={mode === 'userEditing'}
        />
      </div>
    </div>
  )
}
