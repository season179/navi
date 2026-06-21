// Kun FloatingComposer.tsx visual port
// (../Kun/src/renderer/src/components/chat/FloatingComposer.tsx).
// Visual only: mock snapshots and preview URL hooks; composes already-ported
// sub-components (queued messages, context capacity, branch/project pickers, etc.).

import {
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import {
  Archive,
  BarChart3,
  FileEdit,
  FileText,
  Folder,
  GitBranch,
  ImagePlus,
  ListTodo,
  Loader2,
  Mic,
  PauseCircle,
  Pencil,
  PlayCircle,
  Plus,
  Search,
  SearchCode,
  Send,
  Square,
  Target,
  Trash2,
  X,
} from 'lucide-react'
import {
  ContextCapacityPopover,
  CONTEXT_CAPACITY_PREVIEW,
  type ContextCapacity,
} from './ContextCapacityPopover'
import {
  FloatingComposerQueuedMessages,
  QUEUED_MESSAGES_PREVIEW,
  type QueuedComposerMessage,
} from './FloatingComposerQueuedMessages'
import {
  EXECUTION_PICKER_PREVIEW,
  FloatingComposerExecutionPicker,
  type ComposerExecutionSettings,
} from './FloatingComposerExecutionPicker'
import {
  COMPOSER_MODEL_PICKER_GROUPS_PREVIEW,
  COMPOSER_MODEL_PICKER_PREVIEW,
  FloatingComposerModelPicker,
  type ComposerModelPickerSettings,
} from './FloatingComposerModelPicker'
import { GitBranchPicker, GIT_BRANCH_PICKER_PREVIEW } from './GitBranchPicker'
import { ImagePreviewLightbox } from './ImagePreviewLightbox'
import { VoiceRecordingStrip } from './VoiceRecordingStrip'
import {
  WorkspaceProjectPicker,
  WORKSPACE_PROJECT_PICKER_PREVIEW,
} from './WorkspaceProjectPicker'
import {
  COMPOSER_CHANGE_SUMMARY_PREVIEW,
  COMPOSER_CHANGE_SUMMARY_VISIBLE_LIMIT,
  formatComposerChangedFilesMore,
  formatComposerChangedFilesTitle,
  type ComposerChangedFile,
} from '../lib/composerChangeSummary'
import {
  COMPOSER_FILE_MENTION_EMPTY,
  COMPOSER_FILE_MENTION_LOADING,
  COMPOSER_FILE_MENTION_MENU_TITLE,
  COMPOSER_FILE_REFERENCES_PREVIEW,
  type ComposerFileReferenceChip,
} from '../lib/composerFileReferences'
import {
  COMPOSER_ATTACHMENTS_PREVIEW,
  COMPOSER_ATTACHMENT_MODEL_UNSUPPORTED_PREVIEW,
  COMPOSER_ATTACHMENT_UNAVAILABLE_PREVIEW,
  type ComposerImageAttachment,
} from '../lib/composerAttachments'
import { COMPOSER_GOAL_PREVIEW, type ComposerGoal } from '../lib/composerGoal'
import {
  COMPOSER_QUEUE_MESSAGE_LABEL,
  COMPOSER_QUEUE_PLACEHOLDER,
  COMPOSER_STOP_LABEL,
} from '../lib/composerBusyState'
import { COMPOSER_PLAN_MODE_PLACEHOLDER } from '../lib/composerPlanMode'
import {
  COMPOSER_SESSION_USAGE_LOADING,
  COMPOSER_SESSION_USAGE_UNAVAILABLE,
  COMPOSER_THREAD_USAGE_PREVIEW,
  formatComposerCompactNumber,
  formatComposerCost,
  formatComposerPercent,
  formatComposerSessionUsageCache,
  formatComposerSessionUsageContextSavings,
  formatComposerSessionUsageContextSavingsTitle,
  formatComposerSessionUsageCost,
  formatComposerSessionUsageTokens,
  formatComposerSessionUsageTurns,
  formatComposerThreadUsageTitle,
  primaryComposerCacheHitRate,
  type ComposerThreadUsage,
} from '../lib/composerThreadUsage'
import {
  COMPOSER_FOOTER_HINT_SLASH,
  COMPOSER_FOOTER_HINT_WORKTREE,
} from '../lib/composerFooterHint'
import {
  COMPOSER_DICTATION_ERROR_PREVIEW,
  COMPOSER_VOICE_START_LABEL,
  COMPOSER_VOICE_TRANSCRIBING_LABEL,
} from '../lib/composerVoiceDictation'
import {
  COMPOSER_SLASH_COMMAND_MENU_TITLE,
  COMPOSER_SLASH_COMMANDS_PREVIEW,
  type ComposerSlashCommandPreviewIcon,
  type ComposerSlashCommandPreviewRow,
} from '../lib/composerSlashCommands'

export type { ComposerChangedFile } from '../lib/composerChangeSummary'
export { COMPOSER_CHANGE_SUMMARY_PREVIEW } from '../lib/composerChangeSummary'
export type { ComposerFileReferenceChip } from '../lib/composerFileReferences'
export { COMPOSER_FILE_REFERENCES_PREVIEW } from '../lib/composerFileReferences'
export type { ComposerImageAttachment } from '../lib/composerAttachments'
export { COMPOSER_ATTACHMENTS_PREVIEW } from '../lib/composerAttachments'
export type { ComposerGoal } from '../lib/composerGoal'
export { COMPOSER_GOAL_PREVIEW } from '../lib/composerGoal'

export type FloatingComposerPreviewMode =
  | 'default'
  | 'queued'
  | 'plusMenu'
  | 'slashCommands'
  | 'fileMention'
  | 'fileMentionLoading'
  | 'fileMentionEmpty'
  | 'goalFloater'
  | 'goalPanel'
  | 'attachments'
  | 'changeSummary'
  | 'recording'
  | 'busy'
  | 'contextCapacity'
  | 'planMode'
  | 'modelPicker'
  | 'modelPickerSubmenu'
  | 'modelPickerNoProviders'
  | 'worktreeHint'
  | 'dictationError'
  | 'voiceTranscribing'
  | 'attachmentError'
  | 'attachmentErrorUnsupported'

export type ComposerSlashCommandItem = {
  id: string
  title: string
  description: string
  badge: string
  scopeLabel?: string
  icon: ReactNode
  active?: boolean
  disabled?: boolean
  skillName?: string
}

type SlashCommandPreview = ComposerSlashCommandItem

export type ComposerFileMentionItem = {
  relativePath: string
  isDirectory?: boolean
  active?: boolean
}

type FileMentionPreview = ComposerFileMentionItem

type FileReferencePreview = ComposerFileReferenceChip

type ChangedFilePreview = ComposerChangedFile

export type FloatingComposerSnapshot = {
  input: string
  mode: 'plan' | 'agent'
  busy: boolean
  focused: boolean
  queuedMessages: QueuedComposerMessage[]
  showPlusMenu: boolean
  showSlashMenu: boolean
  showFileMentionMenu: boolean
  fileMentionLoading: boolean
  showGoalFloater: boolean
  showGoalPanel: boolean
  showChangeSummary: boolean
  showContextCapacity: boolean
  contextCapacityOpen: boolean
  contextCapacity: ContextCapacity
  recording: boolean
  planBadge: boolean
  goalBadge: boolean
  goal: ComposerGoal | null
  slashCommands: SlashCommandPreview[]
  fileMentions: FileMentionPreview[]
  fileReferences: FileReferencePreview[]
  attachments: ComposerImageAttachment[]
  changedFiles: ChangedFilePreview[]
  changedStats: { added: number; removed: number }
  execution: ComposerExecutionSettings
  modelPicker: ComposerModelPickerSettings
  modelPickerGroups: typeof COMPOSER_MODEL_PICKER_GROUPS_PREVIEW
  showModelPickerMenu: boolean
  modelPickerActiveProviderId: string | null
  modelPickerNoProviders: boolean
  threadUsage: ComposerThreadUsage | null
  footerHint: string | null
  dictationError: string | null
  voiceTranscribing: boolean
  attachmentUploadError: string | null
}

const SLASH_COMMAND_PREVIEW_ICONS: Record<ComposerSlashCommandPreviewIcon, ReactNode> = {
  plus: <Plus strokeWidth={1.9} />,
  search: <Search strokeWidth={1.9} />,
  listTodo: <ListTodo strokeWidth={1.9} />,
  target: <Target strokeWidth={1.9} />,
  archive: <Archive strokeWidth={1.9} />,
  searchCode: <SearchCode strokeWidth={1.9} />,
}

function mapComposerSlashCommandPreviewRows(
  rows: ComposerSlashCommandPreviewRow[],
): SlashCommandPreview[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    badge: row.badge,
    icon: SLASH_COMMAND_PREVIEW_ICONS[row.icon],
    active: row.active,
  }))
}

export function buildComposerSlashCommandsPreview(
  activeIndex = 0,
): ComposerSlashCommandItem[] {
  return COMPOSER_SLASH_COMMANDS_PREVIEW.map((row, index) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    badge: row.badge,
    icon: SLASH_COMMAND_PREVIEW_ICONS[row.icon],
    active: index === activeIndex,
  }))
}

const SLASH_COMMANDS_PREVIEW: SlashCommandPreview[] =
  mapComposerSlashCommandPreviewRows(COMPOSER_SLASH_COMMANDS_PREVIEW)

const FILE_MENTIONS_PREVIEW: FileMentionPreview[] = [
  { relativePath: 'src/renderer/components/FloatingComposer.tsx', active: true },
  { relativePath: 'src/renderer/styles/app.css' },
  { relativePath: 'src/renderer/routes', isDirectory: true },
]

const FILE_REFERENCES_PREVIEW: FileReferencePreview[] = COMPOSER_FILE_REFERENCES_PREVIEW

const ATTACHMENTS_PREVIEW: ComposerImageAttachment[] = COMPOSER_ATTACHMENTS_PREVIEW


const CHANGED_FILES_PREVIEW: ChangedFilePreview[] = COMPOSER_CHANGE_SUMMARY_PREVIEW.files

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function ComposerImageAttachmentPreview({
  attachment,
  onRemoveAttachment,
}: {
  attachment: ComposerImageAttachment
  onRemoveAttachment?: (id: string) => void
}): ReactElement {
  const [open, setOpen] = useState(false)

  return (
    <span className="floating-composer-image-attachment" title={attachment.name}>
      <button
        type="button"
        className="floating-composer-image-attachment-open"
        onClick={() => setOpen(true)}
        aria-label={`Open preview for ${attachment.name}`}
      >
        <img src={attachment.previewUrl} alt={attachment.name} />
      </button>
      {onRemoveAttachment ? (
        <button
          type="button"
          className="floating-composer-image-attachment-remove"
          onClick={() => onRemoveAttachment(attachment.id)}
          aria-label="Remove attachment"
        >
          <X strokeWidth={2.2} />
        </button>
      ) : null}
      <ImagePreviewLightbox
        open={open}
        src={attachment.previewUrl}
        alt={attachment.name}
        title={attachment.name}
        downloadHref={attachment.previewUrl}
        downloadName={attachment.name}
        onClose={() => setOpen(false)}
      />
    </span>
  )
}

export function ComposerPlusMenu({
  planMode = false,
  goalActive = true,
  worktreeMode = false,
  showAddImage = true,
}: {
  planMode?: boolean
  goalActive?: boolean
  worktreeMode?: boolean
  showAddImage?: boolean
} = {}): ReactElement {
  return (
    <div className="floating-composer-plus-menu" role="menu" aria-label="Composer menu">
      {showAddImage ? (
        <>
          <button type="button" className="floating-composer-plus-menu-item" role="menuitem">
            <ImagePlus strokeWidth={1.9} />
            <span>Add image</span>
          </button>
          <div className="floating-composer-plus-menu-divider" aria-hidden />
        </>
      ) : null}
      <button type="button" className="floating-composer-plus-menu-item" role="menuitem">
        <ListTodo strokeWidth={1.9} />
        <span>Plan mode</span>
        <span
          className="floating-composer-toggle-switch"
          role="switch"
          aria-checked={planMode}
          data-checked={planMode ? 'true' : 'false'}
        />
      </button>
      <button type="button" className="floating-composer-plus-menu-item" role="menuitem">
        <Target strokeWidth={1.9} />
        <span>Pursue a goal</span>
        <span
          className="floating-composer-toggle-switch"
          role="switch"
          aria-checked={goalActive}
          data-checked={goalActive ? 'true' : 'false'}
        />
      </button>
      <button type="button" className="floating-composer-plus-menu-item" role="menuitem">
        <GitBranch strokeWidth={1.9} />
        <span>Worktree mode</span>
        <span
          className="floating-composer-toggle-switch"
          role="switch"
          aria-checked={worktreeMode}
          data-checked={worktreeMode ? 'true' : 'false'}
        />
      </button>
    </div>
  )
}

export function ComposerSlashMenu({
  commands,
  onPick,
  onHover,
  emptyMessage = 'No commands match.',
}: {
  commands: ComposerSlashCommandItem[]
  onPick?: (command: ComposerSlashCommandItem) => void
  onHover?: (index: number) => void
  emptyMessage?: string
}): ReactElement {
  return (
    <div className="floating-composer-slash-menu">
      <div className="floating-composer-slash-menu-title">{COMPOSER_SLASH_COMMAND_MENU_TITLE}</div>
      {commands.length > 0 ? (
        <div className="floating-composer-slash-menu-list">
          {commands.map((command, index) => (
            <button
              key={command.id}
              type="button"
              disabled={command.disabled}
              className={
                command.active && !command.disabled
                  ? 'floating-composer-slash-item is-active'
                  : 'floating-composer-slash-item'
              }
              onMouseEnter={() => onHover?.(index)}
              onClick={() => {
                if (command.disabled) return
                onPick?.(command)
              }}
            >
              <span className="floating-composer-slash-icon">{command.icon}</span>
              <span className="floating-composer-slash-copy">
                <span className="floating-composer-slash-title">{command.title}</span>
                <span className="floating-composer-slash-desc">{command.description}</span>
              </span>
              <span className="floating-composer-slash-badge">{command.badge}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="floating-composer-slash-empty">{emptyMessage}</div>
      )}
    </div>
  )
}

export function ComposerFileMentionMenu({
  items,
  loading = false,
  onPick,
  onHover,
}: {
  items: ComposerFileMentionItem[]
  loading?: boolean
  onPick?: (item: ComposerFileMentionItem) => void
  onHover?: (index: number) => void
}): ReactElement {
  const emptyMessage = loading
    ? COMPOSER_FILE_MENTION_LOADING
    : COMPOSER_FILE_MENTION_EMPTY

  return (
    <div className="floating-composer-file-mention-menu">
      <div className="floating-composer-file-mention-title">
        <FileText strokeWidth={1.9} />
        <span>{COMPOSER_FILE_MENTION_MENU_TITLE}</span>
        {loading ? (
          <Loader2 strokeWidth={1.9} className="floating-composer-file-mention-spinner" />
        ) : null}
      </div>
      {items.length > 0 ? (
        <div className="floating-composer-file-mention-list">
          {items.map((item, index) => (
            <button
              key={item.relativePath}
              type="button"
              className={
                item.active
                  ? 'floating-composer-file-mention-item is-active'
                  : 'floating-composer-file-mention-item'
              }
              onMouseEnter={() => onHover?.(index)}
              onClick={() => onPick?.(item)}
            >
              {item.isDirectory ? (
                <Folder strokeWidth={1.8} />
              ) : (
                <FileText strokeWidth={1.8} />
              )}
              <span className="floating-composer-file-mention-path">
                {item.isDirectory ? `${item.relativePath}/` : item.relativePath}
              </span>
              <span className="floating-composer-file-mention-token">
                @{item.isDirectory ? `${item.relativePath}/` : item.relativePath}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="floating-composer-slash-empty">{emptyMessage}</div>
      )}
    </div>
  )
}

export function ComposerGoalFloater({ goal }: { goal: ComposerGoal }): ReactElement {
  return (
    <div className="floating-composer-goal-floater">
      <div className="floating-composer-goal-floater-card">
        <Target strokeWidth={1.9} />
        <div className="floating-composer-goal-floater-copy">
          <span className="floating-composer-goal-floater-label">Goal</span>
          <span className="floating-composer-goal-floater-objective">{goal.objective}</span>
          <span className="floating-composer-goal-floater-elapsed">· {goal.elapsedLabel}</span>
        </div>
        <div className="floating-composer-goal-floater-actions">
          <button type="button" aria-label="Edit goal">
            <Pencil strokeWidth={1.9} />
          </button>
          <button type="button" aria-label={goal.status === 'active' ? 'Pause goal' : 'Resume goal'}>
            {goal.status === 'active' ? (
              <PauseCircle strokeWidth={1.9} />
            ) : (
              <PlayCircle strokeWidth={1.9} />
            )}
          </button>
          <button type="button" aria-label="Clear goal">
            <Trash2 strokeWidth={1.9} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function ComposerGoalPanel({ goal }: { goal: ComposerGoal | null }): ReactElement {
  return (
    <div className="floating-composer-goal-panel">
      <div className="floating-composer-goal-panel-header">
        <span className="floating-composer-goal-panel-icon">
          <Target strokeWidth={1.9} />
        </span>
        <div className="floating-composer-goal-panel-copy">
          <div className="floating-composer-goal-panel-title-row">
            <div className="floating-composer-goal-panel-title">
              {goal ? goal.objective : 'No active goal'}
            </div>
            {goal ? (
              <span className="floating-composer-goal-panel-status">
                {goal.status === 'active' ? 'Active' : 'Paused'}
              </span>
            ) : null}
          </div>
          <div className="floating-composer-goal-panel-actions">
            <button type="button" className="floating-composer-goal-panel-set">
              Set current input as goal
            </button>
            {goal?.status === 'active' ? (
              <button type="button" className="floating-composer-goal-panel-icon-btn" aria-label="Pause goal">
                <PauseCircle strokeWidth={1.9} />
              </button>
            ) : goal ? (
              <button type="button" className="floating-composer-goal-panel-icon-btn" aria-label="Resume goal">
                <PlayCircle strokeWidth={1.9} />
              </button>
            ) : null}
            {goal ? (
              <button type="button" className="floating-composer-goal-panel-icon-btn" aria-label="Clear goal">
                <Trash2 strokeWidth={1.9} />
              </button>
            ) : null}
          </div>
        </div>
        <button type="button" className="floating-composer-goal-panel-close" aria-label="Close">
          <X strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

export function ComposerFileReferenceChips({
  references,
  onRemove,
}: {
  references: ComposerFileReferenceChip[]
  onRemove?: (relativePath: string) => void
}): ReactElement | null {
  if (references.length === 0) return null

  return (
    <div className="floating-composer-file-ref-row">
      {references.map((reference) => {
        const displayPath = reference.isDirectory
          ? `${reference.relativePath}/`
          : reference.relativePath
        return (
          <span key={displayPath} className="floating-composer-file-ref-chip" title={displayPath}>
            {reference.isDirectory ? (
              <Folder strokeWidth={1.8} />
            ) : (
              <FileText strokeWidth={1.8} />
            )}
            <span>{displayPath}</span>
            {onRemove ? (
              <button
                type="button"
                aria-label="Remove file reference"
                onClick={() => onRemove(reference.relativePath)}
              >
                <X strokeWidth={2} />
              </button>
            ) : (
              <button type="button" aria-label="Remove file reference">
                <X strokeWidth={2} />
              </button>
            )}
          </span>
        )
      })}
    </div>
  )
}

export function ComposerChangeSummary({
  files,
  stats,
}: {
  files: ComposerChangedFile[]
  stats: { added: number; removed: number }
}): ReactElement {
  const visibleFiles = files.slice(0, COMPOSER_CHANGE_SUMMARY_VISIBLE_LIMIT)
  const hiddenFileCount = Math.max(0, files.length - visibleFiles.length)

  return (
    <div className="floating-composer-change-summary">
      <span className="floating-composer-change-summary-icon">
        <FileEdit strokeWidth={1.8} />
      </span>
      <div className="floating-composer-change-summary-copy">
        <div className="floating-composer-change-summary-title">
          <span>{formatComposerChangedFilesTitle(files.length)}</span>
          <span className="floating-composer-change-summary-added">+{stats.added}</span>
          <span className="floating-composer-change-summary-removed">-{stats.removed}</span>
        </div>
        <div className="floating-composer-change-summary-files">
          {visibleFiles.map((file) => (
            <span key={file.path} title={file.path}>
              {file.path}
            </span>
          ))}
          {hiddenFileCount > 0 ? (
            <span className="floating-composer-change-summary-more">
              {formatComposerChangedFilesMore(hiddenFileCount)}
            </span>
          ) : null}
        </div>
      </div>
      <div className="floating-composer-change-summary-actions">
        <button type="button">Open changes</button>
        <button type="button">
          <SearchCode strokeWidth={1.8} />
          Review changes
        </button>
      </div>
    </div>
  )
}

export function ComposerThreadUsageFooter({
  usage,
  loading = false,
}: {
  usage: ComposerThreadUsage | null
  loading?: boolean
}): ReactElement {
  const title = usage
    ? formatComposerThreadUsageTitle(usage)
    : loading
      ? COMPOSER_SESSION_USAGE_LOADING
      : COMPOSER_SESSION_USAGE_UNAVAILABLE

  return (
    <div className="ds-composer-usage ds-no-drag floating-composer-usage" title={title}>
      <BarChart3 strokeWidth={1.9} />
      {usage ? (
        <>
          <span className="ds-composer-usage-tokens">
            {formatComposerSessionUsageTokens(formatComposerCompactNumber(usage.totalTokens))}
          </span>
          <span className="ds-composer-usage-cost-separator floating-composer-usage-sep">·</span>
          <span className="ds-composer-usage-cost">
            {formatComposerSessionUsageCost(formatComposerCost(usage.costUsd, usage.costCny))}
          </span>
          {usage.tokenEconomySavingsTokens > 0 ? (
            <>
              <span className="ds-composer-usage-context-savings-separator floating-composer-usage-sep">
                ·
              </span>
              <span
                className="ds-composer-usage-context-savings floating-composer-usage-savings"
                title={formatComposerSessionUsageContextSavingsTitle(
                  formatComposerCompactNumber(usage.tokenEconomySavingsTokens),
                )}
              >
                {formatComposerSessionUsageContextSavings(
                  formatComposerCompactNumber(usage.tokenEconomySavingsTokens),
                )}
              </span>
            </>
          ) : null}
          {usage.turns > 1 ? (
            <>
              <span className="ds-composer-usage-cache-separator floating-composer-usage-sep">
                ·
              </span>
              <span className="ds-composer-usage-cache">
                {formatComposerSessionUsageCache(
                  formatComposerPercent(primaryComposerCacheHitRate(usage)),
                )}
              </span>
            </>
          ) : null}
          <span className="ds-composer-usage-turns-separator floating-composer-usage-sep">·</span>
          <span className="ds-composer-usage-turns">
            {formatComposerSessionUsageTurns(usage.turns)}
          </span>
        </>
      ) : (
        <span>{loading ? COMPOSER_SESSION_USAGE_LOADING : COMPOSER_SESSION_USAGE_UNAVAILABLE}</span>
      )}
    </div>
  )
}

export function resolveFloatingComposerSnapshot(
  mode: FloatingComposerPreviewMode = 'default',
): FloatingComposerSnapshot {
  const base: FloatingComposerSnapshot = {
    input: 'Help me finish porting the Kun composer visuals.',
    mode: 'agent',
    busy: false,
    focused: true,
    queuedMessages: [],
    showPlusMenu: false,
    showSlashMenu: false,
    showFileMentionMenu: false,
    fileMentionLoading: false,
    showGoalFloater: false,
    showGoalPanel: false,
    showChangeSummary: false,
    showContextCapacity: false,
    contextCapacityOpen: false,
    contextCapacity: CONTEXT_CAPACITY_PREVIEW,
    recording: false,
    planBadge: false,
    goalBadge: false,
    goal: null,
    slashCommands: SLASH_COMMANDS_PREVIEW,
    fileMentions: FILE_MENTIONS_PREVIEW,
    fileReferences: [],
    attachments: [],
    changedFiles: CHANGED_FILES_PREVIEW,
    changedStats: { added: 428, removed: 12 },
    execution: EXECUTION_PICKER_PREVIEW,
    modelPicker: COMPOSER_MODEL_PICKER_PREVIEW,
    modelPickerGroups: COMPOSER_MODEL_PICKER_GROUPS_PREVIEW,
    showModelPickerMenu: false,
    modelPickerActiveProviderId: null,
    modelPickerNoProviders: false,
    threadUsage: COMPOSER_THREAD_USAGE_PREVIEW,
    footerHint: COMPOSER_FOOTER_HINT_SLASH,
    dictationError: null,
    voiceTranscribing: false,
    attachmentUploadError: null,
  }

  switch (mode) {
    case 'queued':
      return { ...base, queuedMessages: QUEUED_MESSAGES_PREVIEW, busy: true }
    case 'plusMenu':
      return { ...base, showPlusMenu: true }
    case 'slashCommands':
      return { ...base, input: '/res', showSlashMenu: true }
    case 'fileMention':
      return { ...base, input: 'Check @src/rend', showFileMentionMenu: true }
    case 'fileMentionLoading':
      return {
        ...base,
        input: 'Check @src/rend',
        showFileMentionMenu: true,
        fileMentionLoading: true,
        fileMentions: [],
      }
    case 'fileMentionEmpty':
      return {
        ...base,
        input: 'Check @zzz-no-match',
        showFileMentionMenu: true,
        fileMentions: [],
      }
    case 'goalFloater':
      return { ...base, showGoalFloater: true, goal: COMPOSER_GOAL_PREVIEW, goalBadge: true }
    case 'goalPanel':
      return { ...base, showGoalPanel: true, goal: COMPOSER_GOAL_PREVIEW, goalBadge: true }
    case 'attachments':
      return {
        ...base,
        attachments: ATTACHMENTS_PREVIEW,
        fileReferences: FILE_REFERENCES_PREVIEW,
      }
    case 'changeSummary':
      return { ...base, showChangeSummary: true }
    case 'recording':
      return { ...base, recording: true, input: '' }
    case 'busy':
      return { ...base, busy: true }
    case 'contextCapacity':
      return { ...base, showContextCapacity: true, contextCapacityOpen: true }
    case 'planMode':
      return {
        ...base,
        mode: 'plan',
        planBadge: true,
        input: COMPOSER_PLAN_MODE_PLACEHOLDER,
      }
    case 'modelPicker':
      return { ...base, showModelPickerMenu: true }
    case 'modelPickerSubmenu':
      return {
        ...base,
        showModelPickerMenu: true,
        modelPickerActiveProviderId: 'anthropic',
      }
    case 'modelPickerNoProviders':
      return {
        ...base,
        modelPickerNoProviders: true,
        showModelPickerMenu: true,
        modelPickerGroups: [],
      }
    case 'worktreeHint':
      return { ...base, footerHint: COMPOSER_FOOTER_HINT_WORKTREE }
    case 'dictationError':
      return { ...base, dictationError: COMPOSER_DICTATION_ERROR_PREVIEW }
    case 'voiceTranscribing':
      return { ...base, voiceTranscribing: true }
    case 'attachmentError':
      return { ...base, attachmentUploadError: COMPOSER_ATTACHMENT_UNAVAILABLE_PREVIEW }
    case 'attachmentErrorUnsupported':
      return {
        ...base,
        attachments: ATTACHMENTS_PREVIEW.slice(0, 1),
        attachmentUploadError: COMPOSER_ATTACHMENT_MODEL_UNSUPPORTED_PREVIEW,
      }
    default:
      return base
  }
}

export function FloatingComposer({
  snapshot,
}: {
  snapshot: FloatingComposerSnapshot
}): ReactElement {
  const [execution, setExecution] = useState(snapshot.execution)
  const [modelPicker, setModelPicker] = useState(snapshot.modelPicker)
  const [menuOpen, setMenuOpen] = useState(snapshot.showPlusMenu)

  const shellClass = [
    'ds-composer-shell',
    'ds-chat-composer',
    'ds-frosted',
    'ds-no-drag',
    'floating-composer-shell',
    snapshot.focused ? 'ds-chat-composer-focus' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const showToolbarStart = true

  return (
    <div className="ds-floating-composer ds-no-drag ds-chat-column-inset floating-composer-root">
      <FloatingComposerQueuedMessages messages={snapshot.queuedMessages} />

      <div className="floating-composer-relative">
        {snapshot.showGoalFloater && snapshot.goal ? (
          <ComposerGoalFloater goal={snapshot.goal} />
        ) : null}

        {menuOpen || snapshot.showPlusMenu ? <ComposerPlusMenu /> : null}

        {snapshot.showSlashMenu ? (
          <ComposerSlashMenu commands={snapshot.slashCommands} />
        ) : null}

        {snapshot.showFileMentionMenu ? (
          <ComposerFileMentionMenu
            items={snapshot.fileMentions}
            loading={snapshot.fileMentionLoading}
          />
        ) : null}

        {snapshot.showGoalPanel ? (
          <ComposerGoalPanel goal={snapshot.goal} />
        ) : null}

        <div className={shellClass}>
          {snapshot.showChangeSummary ? (
            <ComposerChangeSummary
              files={snapshot.changedFiles}
              stats={snapshot.changedStats}
            />
          ) : null}

          <textarea
            rows={1}
            className="floating-composer-textarea"
            placeholder={
              snapshot.busy ? COMPOSER_QUEUE_PLACEHOLDER : 'Send a message…'
            }
            value={snapshot.input}
            readOnly
            aria-label="Message"
          />

          {snapshot.fileReferences.length > 0 ? (
            <ComposerFileReferenceChips references={snapshot.fileReferences} />
          ) : null}

          {snapshot.attachments.length > 0 || snapshot.attachmentUploadError ? (
            <div className="floating-composer-attachment-row">
              {snapshot.attachments.map((attachment) => (
                <ComposerImageAttachmentPreview key={attachment.id} attachment={attachment} />
              ))}
              {snapshot.attachmentUploadError ? (
                <span className="floating-composer-attachment-error">
                  {snapshot.attachmentUploadError}
                </span>
              ) : null}
            </div>
          ) : null}

          {!snapshot.recording && snapshot.dictationError ? (
            <div className="floating-composer-dictation-error">
              <span>{snapshot.dictationError}</span>
            </div>
          ) : null}

          <div className="ds-composer-toolbar floating-composer-toolbar">
            {showToolbarStart ? (
              <div className="floating-composer-toolbar-start">
                <button
                  type="button"
                  className={`floating-composer-plus-btn${menuOpen ? ' is-open' : ''}`}
                  aria-label="Composer menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  <Plus strokeWidth={1.8} />
                </button>
                {snapshot.planBadge ? (
                  <span className="floating-composer-mode-badge">
                    <ListTodo strokeWidth={1.9} />
                    <span>Plan mode</span>
                  </span>
                ) : null}
                {snapshot.goalBadge ? (
                  <span className="floating-composer-mode-badge">
                    <Target strokeWidth={1.9} />
                    <span>Goal</span>
                  </span>
                ) : null}
              </div>
            ) : null}

            <div
              className={
                snapshot.recording
                  ? 'floating-composer-toolbar-end is-recording'
                  : 'floating-composer-toolbar-end'
              }
            >
              {snapshot.recording ? (
                <>
                  <VoiceRecordingStrip getLevel={() => 0.45} startedAtMs={Date.now() - 12_000} />
                  <button type="button" className="floating-composer-voice-stop" aria-label="Stop recording">
                    <Square strokeWidth={2.4} />
                  </button>
                  <button type="button" className="floating-composer-send-btn" aria-label="Send recording">
                    <Send strokeWidth={2.2} />
                  </button>
                </>
              ) : (
                <>
                  {snapshot.showContextCapacity ? (
                    <div className="floating-composer-context-wrap">
                      <button
                        type="button"
                        className="floating-composer-context-chip"
                        aria-expanded={snapshot.contextCapacityOpen}
                      >
                        <span className="floating-composer-context-bar" aria-hidden>
                          <span
                            style={{
                              width: `${Math.min(100, snapshot.contextCapacity.usedRatio * 100)}%`,
                              background:
                                snapshot.contextCapacity.usedRatio >= 0.9
                                  ? '#d9544e'
                                  : snapshot.contextCapacity.usedRatio >= 0.75
                                    ? '#d9920f'
                                    : 'var(--ds-accent)',
                            }}
                          />
                        </span>
                        <span>{formatPercent(snapshot.contextCapacity.usedRatio)}</span>
                      </button>
                      {snapshot.contextCapacityOpen ? (
                        <div className="floating-composer-context-popover">
                          <ContextCapacityPopover capacity={snapshot.contextCapacity} />
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <FloatingComposerModelPicker
                    value={modelPicker}
                    groups={snapshot.modelPickerGroups}
                    needsProviderSetup={snapshot.modelPickerNoProviders}
                    menuOpen={snapshot.showModelPickerMenu || undefined}
                    activeProviderId={snapshot.modelPickerActiveProviderId}
                    onChange={(patch) => setModelPicker((current) => ({ ...current, ...patch }))}
                    onConfigureProviders={() => undefined}
                  />

                  <FloatingComposerExecutionPicker
                    value={execution}
                    onChange={(patch) => setExecution((current) => ({ ...current, ...patch }))}
                  />

                  <button
                    type="button"
                    className="floating-composer-mic-btn"
                    aria-label={
                      snapshot.voiceTranscribing
                        ? COMPOSER_VOICE_TRANSCRIBING_LABEL
                        : COMPOSER_VOICE_START_LABEL
                    }
                    title={
                      snapshot.voiceTranscribing
                        ? COMPOSER_VOICE_TRANSCRIBING_LABEL
                        : COMPOSER_VOICE_START_LABEL
                    }
                    disabled={snapshot.voiceTranscribing}
                  >
                    {snapshot.voiceTranscribing ? (
                      <Loader2 strokeWidth={2.2} className="floating-composer-mic-spinner" />
                    ) : (
                      <Mic strokeWidth={2} />
                    )}
                  </button>

                  {snapshot.busy ? (
                    <button
                      type="button"
                      className="floating-composer-stop-btn"
                      aria-label={COMPOSER_STOP_LABEL}
                      title={COMPOSER_STOP_LABEL}
                    >
                      <Square strokeWidth={2.4} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="floating-composer-send-btn"
                    aria-label={
                      snapshot.busy ? COMPOSER_QUEUE_MESSAGE_LABEL : 'Send'
                    }
                    title={snapshot.busy ? COMPOSER_QUEUE_MESSAGE_LABEL : 'Send'}
                  >
                    <Send strokeWidth={2.2} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="ds-composer-footer floating-composer-footer">
        <div className="ds-composer-footer-left">
          <WorkspaceProjectPicker snapshot={WORKSPACE_PROJECT_PICKER_PREVIEW} />
          <GitBranchPicker snapshot={GIT_BRANCH_PICKER_PREVIEW} />
          {snapshot.threadUsage ? (
            <ComposerThreadUsageFooter usage={snapshot.threadUsage} />
          ) : null}
        </div>
        {snapshot.footerHint ? (
          <div className="ds-composer-footer-hint">
            <span>{snapshot.footerHint}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function FloatingComposerPreview({
  mode = 'default',
}: {
  mode?: FloatingComposerPreviewMode
}): ReactElement {
  const snapshot = useMemo(() => resolveFloatingComposerSnapshot(mode), [mode])

  return (
    <div className="floating-composer-preview-wrap">
      <FloatingComposer snapshot={snapshot} />
    </div>
  )
}
