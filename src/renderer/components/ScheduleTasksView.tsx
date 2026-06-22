// Kun ScheduleTasksView.tsx visual port
// (../Kun/src/renderer/src/components/schedule/ScheduleTasksView.tsx).
// Visual only: mock task snapshots and preview URL hooks.

import {
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import {
  Brain,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Clock3,
  Folder,
  FolderOpen,
  MessageSquare,
  MoreHorizontal,
  PanelLeft,
  PencilLine,
  Play,
  Plus,
  Power,
  Timer,
  Trash2,
  X,
} from 'lucide-react'
import {
  ScheduleDefaultsDialog,
  SCHEDULE_DEFAULTS_PREVIEW,
  SCHEDULE_DEFAULTS_PREVIEW_PROVIDERS,
} from './ScheduleDefaultsDialog'
import {
  SCHEDULE_ADVANCED_SETTINGS_LABEL,
  SCHEDULE_AWAKE_NOTICE,
  SCHEDULE_CANCEL_LABEL,
  SCHEDULE_CHANGE_WORKSPACE_LABEL,
  SCHEDULE_CLIENT_MODE_CODE_LABEL,
  SCHEDULE_CLIENT_MODE_IM_LABEL,
  SCHEDULE_CLIENT_MODE_LABEL,
  SCHEDULE_CLOSE_LABEL,
  SCHEDULE_COLLAPSE_RESULT_LABEL,
  SCHEDULE_CONFIRM_LABEL,
  SCHEDULE_CREATE_TASK_TITLE,
  SCHEDULE_CURRENT_STATUS_LABEL,
  SCHEDULE_DAILY_TIME_LABEL,
  SCHEDULE_DEFAULTS_TITLE,
  SCHEDULE_DELETE_TASK_LABEL,
  SCHEDULE_EDIT_TASK_TITLE,
  SCHEDULE_EMPTY_TEXT,
  SCHEDULE_EXPAND_RESULT_LABEL,
  SCHEDULE_FILTER_EMPTY_TEXT,
  SCHEDULE_KEEP_AWAKE_LABEL,
  SCHEDULE_LAST_ERROR_LABEL,
  SCHEDULE_LAST_RESULT_LABEL,
  SCHEDULE_LAST_RUN_LABEL,
  SCHEDULE_LOADING_LABEL,
  SCHEDULE_MODEL_LABEL,
  SCHEDULE_NEVER_RUN_LABEL,
  SCHEDULE_NEW_TASK_LABEL,
  SCHEDULE_NEXT_RUN_LABEL,
  SCHEDULE_NOT_SCHEDULED_LABEL,
  SCHEDULE_OPEN_LAST_THREAD_LABEL,
  SCHEDULE_PROVIDER_LABEL,
  SCHEDULE_REASONING_LABEL,
  SCHEDULE_RUN_AT_LABEL,
  SCHEDULE_RUN_NOW_LABEL,
  SCHEDULE_SELECT_WORKSPACE_LABEL,
  SCHEDULE_SIDEBAR_COLLAPSE_LABEL,
  SCHEDULE_SIDEBAR_EXPAND_LABEL,
  SCHEDULE_TASK_ENABLED_LABEL,
  SCHEDULE_TASK_NAME_LABEL,
  SCHEDULE_TASK_NAME_PLACEHOLDER,
  SCHEDULE_TASK_PROMPT_LABEL,
  SCHEDULE_TASK_PROMPT_PLACEHOLDER,
  SCHEDULE_TASK_SECTION_CONTENT,
  SCHEDULE_TASK_SECTION_ENVIRONMENT,
  SCHEDULE_TASK_SECTION_MODEL,
  SCHEDULE_TASK_SECTION_TIMING,
  SCHEDULE_TASKS_SUBTITLE,
  SCHEDULE_TASKS_TITLE,
  SCHEDULE_UNTITLED_TASK_LABEL,
  SCHEDULE_WORKSPACE_LABEL,
  SCHEDULE_WORKSPACE_PLACEHOLDER,
  formatScheduleTaskSummary,
  resolveScheduleFilterLabel,
  resolveScheduleKindLabel,
  resolveScheduleReasoningLabel,
  resolveScheduleStatusLabel,
} from '../lib/scheduleTasksView'

export type ScheduleKind = 'daily' | 'at' | 'interval' | 'manual'
export type ScheduleLastStatus = 'idle' | 'running' | 'success' | 'error'
export type ScheduleReasoningEffort = 'auto' | 'off' | 'low' | 'medium' | 'high' | 'max'
export type TaskFilter = 'all' | 'enabled' | 'running' | 'done'

export type ScheduledTaskSnapshot = {
  id: string
  title: string
  enabled: boolean
  prompt: string
  workspaceRoot: string
  clawChannelId: string
  providerId: string
  model: string
  reasoningEffort: ScheduleReasoningEffort
  schedule: {
    kind: ScheduleKind
    everyMinutes: number
    timeOfDay: string
    atTime: string
  }
  lastRunAt: string
  nextRunAt: string
  lastStatus: ScheduleLastStatus
  lastMessage: string
  lastThreadId: string
}

export type ScheduleTasksPreviewMode =
  | 'default'
  | 'empty'
  | 'filterEmpty'
  | 'loading'
  | 'error'
  | 'running'
  | 'expandedResult'
  | 'createDialog'
  | 'editDialog'
  | 'settingsDialog'

const SCHEDULE_FILTERS: TaskFilter[] = ['all', 'enabled', 'running', 'done']
const SCHEDULE_KIND_OPTIONS: ScheduleKind[] = ['daily', 'at', 'interval', 'manual']
const REASONING_OPTIONS: ScheduleReasoningEffort[] = [
  'auto',
  'off',
  'low',
  'medium',
  'high',
  'max',
]
const RESULT_PREVIEW_CHAR_THRESHOLD = 360
const RESULT_PREVIEW_LINE_THRESHOLD = 5

const LONG_RESULT_MESSAGE = [
  'Step 1: Reviewed 14 changed files across src/renderer and test/.',
  'Step 2: Ran typecheck — passed with no errors.',
  'Step 3: Ran unit tests — 42 passed, 0 failed.',
  'Step 4: Summarized diff for commit message draft.',
  'Step 5: Flagged two TODO comments in home.tsx for follow-up.',
  'Step 6: Generated changelog entry for the weekly release notes.',
].join('\n')

export const SCHEDULE_TASKS_PREVIEW: ScheduledTaskSnapshot[] = [
  {
    id: 'task-daily-backup',
    title: 'Daily repo backup',
    enabled: true,
    prompt: 'Summarize git status and create a backup commit if there are uncommitted changes.',
    workspaceRoot: '/Users/season/projects/navi',
    clawChannelId: '',
    providerId: 'deepseek',
    model: 'deepseek-chat',
    reasoningEffort: 'medium',
    schedule: { kind: 'daily', everyMinutes: 60, timeOfDay: '09:00', atTime: '' },
    lastRunAt: '2026-06-21T09:00:00.000Z',
    nextRunAt: '2026-06-22T09:00:00.000Z',
    lastStatus: 'success',
    lastMessage: 'Backup complete. Working tree clean.',
    lastThreadId: 'thread-backup-1',
  },
  {
    id: 'task-weekly-report',
    title: 'Weekly status report',
    enabled: true,
    prompt: 'Compile a weekly engineering summary from recent commits and open PRs.',
    workspaceRoot: '/Users/season/projects/navi',
    clawChannelId: '',
    providerId: 'openai',
    model: 'gpt-4.1-mini',
    reasoningEffort: 'high',
    schedule: { kind: 'interval', everyMinutes: 10080, timeOfDay: '09:00', atTime: '' },
    lastRunAt: '2026-06-21T14:30:00.000Z',
    nextRunAt: '',
    lastStatus: 'running',
    lastMessage: 'Gathering commit history from the last 7 days…',
    lastThreadId: '',
  },
  {
    id: 'task-one-time-deploy',
    title: 'One-time deploy check',
    enabled: true,
    prompt: 'Verify build artifacts and run smoke tests before release.',
    workspaceRoot: '/Users/season/projects/navi',
    clawChannelId: '',
    providerId: 'deepseek',
    model: 'deepseek-reasoner',
    reasoningEffort: 'max',
    schedule: {
      kind: 'at',
      everyMinutes: 60,
      timeOfDay: '09:00',
      atTime: '2026-06-22T18:00:00.000Z',
    },
    lastRunAt: '2026-06-20T18:00:00.000Z',
    nextRunAt: '2026-06-22T18:00:00.000Z',
    lastStatus: 'error',
    lastMessage: LONG_RESULT_MESSAGE,
    lastThreadId: 'thread-deploy-1',
  },
  {
    id: 'task-manual-cleanup',
    title: 'Manual workspace cleanup',
    enabled: false,
    prompt: 'Remove stale build artifacts and empty directories.',
    workspaceRoot: '/Users/season/projects/navi',
    clawChannelId: '',
    providerId: 'deepseek',
    model: 'deepseek-chat',
    reasoningEffort: 'off',
    schedule: { kind: 'manual', everyMinutes: 60, timeOfDay: '09:00', atTime: '' },
    lastRunAt: '',
    nextRunAt: '',
    lastStatus: 'idle',
    lastMessage: '',
    lastThreadId: '',
  },
]

const CREATE_DRAFT: ScheduledTaskSnapshot = {
  id: 'draft-new',
  title: '',
  enabled: true,
  prompt: '',
  workspaceRoot: '/Users/season/projects/navi',
  clawChannelId: '',
  providerId: 'deepseek',
  model: 'deepseek-chat',
  reasoningEffort: 'medium',
  schedule: { kind: 'daily', everyMinutes: 60, timeOfDay: '09:00', atTime: '' },
  lastRunAt: '',
  nextRunAt: '',
  lastStatus: 'idle',
  lastMessage: '',
  lastThreadId: '',
}

const EDIT_DRAFT: ScheduledTaskSnapshot = {
  ...SCHEDULE_TASKS_PREVIEW[0]!,
  title: 'Daily repo backup',
  prompt:
    'Summarize git status and create a backup commit if there are uncommitted changes.',
}

function formatDateTime(value: string, fallback: string): string {
  if (!value.trim()) return fallback
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return fallback
  return date.toLocaleString()
}

function scheduledTaskResultIsExpandable(message: string): boolean {
  const trimmed = message.trim()
  if (!trimmed) return false
  return (
    trimmed.length > RESULT_PREVIEW_CHAR_THRESHOLD ||
    trimmed.split(/\r?\n/u).length > RESULT_PREVIEW_LINE_THRESHOLD
  )
}

function statusToneClass(status: ScheduleLastStatus, running: boolean): string {
  if (running || status === 'running') return 'schedule-task-status--running'
  if (status === 'success') return 'schedule-task-status--success'
  if (status === 'error') return 'schedule-task-status--error'
  return 'schedule-task-status--idle'
}

function providerLabel(task: ScheduledTaskSnapshot): string {
  const providers: Record<string, string> = {
    deepseek: 'DeepSeek',
    openai: 'OpenAI',
  }
  const label = providers[task.providerId] ?? task.providerId
  return label ? `${label} / ${task.model}` : task.model
}

type ScheduleTasksViewProps = {
  tasks: ScheduledTaskSnapshot[]
  filter?: TaskFilter
  keepAwake?: boolean
  loading?: boolean
  error?: string | null
  runningTaskIds?: Set<string>
  expandedResultTaskIds?: Set<string>
  leftSidebarCollapsed?: boolean
  dialogMode?: 'create' | 'edit' | null
  settingsDialogOpen?: boolean
  onToggleLeftSidebar?: () => void
  onFilterChange?: (filter: TaskFilter) => void
  onKeepAwakeChange?: (value: boolean) => void
  onToggleResult?: (taskId: string) => void
  onCloseDialog?: () => void
  onCloseSettings?: () => void
}

export function ScheduleTasksView({
  tasks,
  filter = 'all',
  keepAwake = true,
  loading = false,
  error = null,
  runningTaskIds = new Set(),
  expandedResultTaskIds = new Set(),
  leftSidebarCollapsed = false,
  dialogMode = null,
  settingsDialogOpen = false,
  onToggleLeftSidebar,
  onFilterChange,
  onKeepAwakeChange,
  onToggleResult,
  onCloseDialog,
  onCloseSettings,
}: ScheduleTasksViewProps): ReactElement {
  const visibleTasks = useMemo(() => {
    const filtered = tasks.filter((task) => {
      if (filter === 'enabled') return task.enabled
      if (filter === 'running') return task.lastStatus === 'running'
      if (filter === 'done') return task.lastStatus === 'success' || task.lastStatus === 'error'
      return true
    })
    return filtered
  }, [filter, tasks])

  const dialogDraft = dialogMode === 'edit' ? EDIT_DRAFT : CREATE_DRAFT

  return (
    <div className="schedule-tasks-view ds-drag">
      <div className="schedule-tasks-view-inset">
        <header className="schedule-tasks-view-topbar">
          <div className="schedule-tasks-view-topbar-grid">
            <div
              className={`schedule-tasks-view-topbar-left${
                leftSidebarCollapsed ? ' schedule-tasks-view-topbar-left--collapsed' : ''
              }`}
            >
              <button
                type="button"
                className="sidebar-titlebar-toggle"
                onClick={onToggleLeftSidebar}
                title={
                  leftSidebarCollapsed
                    ? SCHEDULE_SIDEBAR_EXPAND_LABEL
                    : SCHEDULE_SIDEBAR_COLLAPSE_LABEL
                }
                aria-label={
                  leftSidebarCollapsed
                    ? SCHEDULE_SIDEBAR_EXPAND_LABEL
                    : SCHEDULE_SIDEBAR_COLLAPSE_LABEL
                }
              >
                <PanelLeft strokeWidth={1.55} />
              </button>
              <h1 className="schedule-tasks-view-title">{SCHEDULE_TASKS_TITLE}</h1>
            </div>
          </div>
        </header>
      </div>

      <main className="schedule-tasks-view-main ds-no-drag">
        <div className="schedule-tasks-view-content">
          <div className="schedule-tasks-view-toolbar">
            <p className="schedule-tasks-view-subtitle">{SCHEDULE_TASKS_SUBTITLE}</p>
            <div className="schedule-tasks-view-toolbar-actions">
              <select
                value={filter}
                onChange={(event) => onFilterChange?.(event.target.value as TaskFilter)}
                className="schedule-tasks-view-filter"
              >
                {SCHEDULE_FILTERS.map((item) => (
                  <option key={item} value={item}>
                    {resolveScheduleFilterLabel(item)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="schedule-tasks-view-icon-btn"
                title={SCHEDULE_DEFAULTS_TITLE}
                aria-label={SCHEDULE_DEFAULTS_TITLE}
              >
                <MoreHorizontal className="schedule-tasks-view-icon" strokeWidth={1.8} />
              </button>
              <button type="button" className="schedule-tasks-view-new-btn">
                <Plus className="schedule-tasks-view-new-btn-icon" strokeWidth={2} />
                {SCHEDULE_NEW_TASK_LABEL}
              </button>
            </div>
          </div>

          <div className="schedule-tasks-view-awake">
            <div className="schedule-tasks-view-awake-copy">
              <Clock3 className="schedule-tasks-view-awake-icon" strokeWidth={1.75} />
              <span>{SCHEDULE_AWAKE_NOTICE}</span>
            </div>
            <label className="schedule-tasks-view-awake-toggle">
              {SCHEDULE_KEEP_AWAKE_LABEL}
              <input
                type="checkbox"
                checked={keepAwake}
                onChange={(event) => onKeepAwakeChange?.(event.target.checked)}
                className="sr-only"
              />
              <span
                className={`schedule-tasks-view-toggle-track${
                  keepAwake ? ' is-on' : ''
                }`}
              >
                <span className="schedule-tasks-view-toggle-thumb" />
              </span>
            </label>
          </div>

          {loading ? (
            <div className="schedule-tasks-view-loading">{SCHEDULE_LOADING_LABEL}</div>
          ) : error ? (
            <div className="schedule-tasks-view-error">{error}</div>
          ) : visibleTasks.length === 0 ? (
            <div className="schedule-tasks-view-empty">
              {tasks.length === 0 ? SCHEDULE_EMPTY_TEXT : SCHEDULE_FILTER_EMPTY_TEXT}
            </div>
          ) : (
            <div className="schedule-tasks-view-list">
              {visibleTasks.map((task) => {
                const running =
                  runningTaskIds.has(task.id) || task.lastStatus === 'running'
                const expanded = expandedResultTaskIds.has(task.id)
                const expandable = scheduledTaskResultIsExpandable(task.lastMessage)
                return (
                  <article key={task.id} className="schedule-task-card">
                    <div className="schedule-task-card-header">
                      <div className="schedule-task-card-copy">
                        <div className="schedule-task-card-title-row">
                          <h2 className="schedule-task-card-title">
                            {task.title || SCHEDULE_UNTITLED_TASK_LABEL}
                          </h2>
                          <span
                            className={`schedule-task-status ${statusToneClass(task.lastStatus, running)}`}
                          >
                            {running
                              ? resolveScheduleStatusLabel('running')
                              : resolveScheduleStatusLabel(task.lastStatus)}
                          </span>
                        </div>
                        <div className="schedule-task-card-meta">
                          <span>{formatScheduleTaskSummary(task.schedule)}</span>
                          <span>
                            {SCHEDULE_NEXT_RUN_LABEL}:{' '}
                            {formatDateTime(task.nextRunAt, SCHEDULE_NOT_SCHEDULED_LABEL)}
                          </span>
                          <span>
                            {SCHEDULE_LAST_RUN_LABEL}:{' '}
                            {formatDateTime(task.lastRunAt, SCHEDULE_NEVER_RUN_LABEL)}
                          </span>
                          <span>
                            {providerLabel(task)} ·{' '}
                            {resolveScheduleReasoningLabel(task.reasoningEffort)}
                          </span>
                        </div>
                      </div>
                      <div className="schedule-task-card-actions">
                        {task.lastThreadId ? (
                          <button
                            type="button"
                            className="schedule-task-card-action"
                            title={SCHEDULE_OPEN_LAST_THREAD_LABEL}
                            aria-label={SCHEDULE_OPEN_LAST_THREAD_LABEL}
                          >
                            <MessageSquare className="schedule-task-card-action-icon" strokeWidth={1.8} />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="schedule-task-card-action"
                          disabled={running}
                          title={SCHEDULE_RUN_NOW_LABEL}
                          aria-label={SCHEDULE_RUN_NOW_LABEL}
                        >
                          <Play className="schedule-task-card-action-icon" strokeWidth={1.8} />
                        </button>
                        <button
                          type="button"
                          className="schedule-task-card-action"
                          title={SCHEDULE_EDIT_TASK_TITLE}
                          aria-label={SCHEDULE_EDIT_TASK_TITLE}
                        >
                          <PencilLine className="schedule-task-card-action-icon" strokeWidth={1.8} />
                        </button>
                        <button
                          type="button"
                          className="schedule-task-card-action schedule-task-card-action--danger"
                          title={SCHEDULE_DELETE_TASK_LABEL}
                          aria-label={SCHEDULE_DELETE_TASK_LABEL}
                        >
                          <Trash2 className="schedule-task-card-action-icon" strokeWidth={1.8} />
                        </button>
                        <label className="schedule-task-card-enable">
                          <input
                            type="checkbox"
                            checked={task.enabled}
                            readOnly
                            className="sr-only"
                          />
                          <span
                            className={`schedule-tasks-view-toggle-track${
                              task.enabled ? ' is-on' : ''
                            }`}
                          >
                            <span className="schedule-tasks-view-toggle-thumb" />
                          </span>
                        </label>
                      </div>
                    </div>
                    {task.lastMessage ? (
                      <div className="schedule-task-result">
                        <div className="schedule-task-result-header">
                          <span className="schedule-task-result-label">
                            {task.lastStatus === 'error'
                              ? SCHEDULE_LAST_ERROR_LABEL
                              : task.lastStatus === 'running'
                                ? SCHEDULE_CURRENT_STATUS_LABEL
                                : SCHEDULE_LAST_RESULT_LABEL}
                          </span>
                          {expandable ? (
                            <button
                              type="button"
                              onClick={() => onToggleResult?.(task.id)}
                              className="schedule-task-result-expand"
                              aria-expanded={expanded}
                            >
                              {expanded ? (
                                <ChevronUp className="schedule-task-result-expand-icon" strokeWidth={1.8} />
                              ) : (
                                <ChevronDown className="schedule-task-result-expand-icon" strokeWidth={1.8} />
                              )}
                              {expanded
                                ? SCHEDULE_COLLAPSE_RESULT_LABEL
                                : SCHEDULE_EXPAND_RESULT_LABEL}
                            </button>
                          ) : null}
                        </div>
                        <div
                          className={`schedule-task-result-body${
                            expanded ? ' schedule-task-result-body--expanded' : ''
                          }`}
                        >
                          {task.lastMessage}
                        </div>
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {dialogMode ? (
        <ScheduleTaskDialog
          mode={dialogMode}
          draft={dialogDraft}
          onClose={() => onCloseDialog?.()}
        />
      ) : null}

      {settingsDialogOpen ? (
        <ScheduleDefaultsDialog
          schedule={SCHEDULE_DEFAULTS_PREVIEW}
          modelProviders={SCHEDULE_DEFAULTS_PREVIEW_PROVIDERS}
          onClose={() => onCloseSettings?.()}
          onSave={() => onCloseSettings?.()}
        />
      ) : null}
    </div>
  )
}

function ScheduleTaskDialog({
  mode,
  draft,
  onClose,
}: {
  mode: 'create' | 'edit'
  draft: ScheduledTaskSnapshot
  onClose: () => void
}): ReactElement {
  const title = mode === 'create' ? SCHEDULE_CREATE_TASK_TITLE : SCHEDULE_EDIT_TASK_TITLE

  return (
    <div className="schedule-task-dialog-overlay ds-no-drag" onMouseDown={onClose}>
      <form
        className="schedule-task-dialog"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="schedule-task-dialog-header">
          <h2 className="schedule-task-dialog-title">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="schedule-task-dialog-close"
            aria-label={SCHEDULE_CLOSE_LABEL}
            title={SCHEDULE_CLOSE_LABEL}
          >
            <X className="schedule-task-dialog-close-icon" strokeWidth={1.7} />
          </button>
        </div>

        <div className="schedule-task-dialog-body">
          <ScheduleDialogSection
            icon={<Timer className="schedule-task-dialog-section-icon" strokeWidth={1.8} />}
            title={SCHEDULE_TASK_SECTION_CONTENT}
          >
            <label className="schedule-task-dialog-field">
              <FieldLabel required>{SCHEDULE_TASK_NAME_LABEL}</FieldLabel>
              <div className="schedule-task-dialog-input-wrap">
                <input
                  defaultValue={draft.title}
                  maxLength={50}
                  placeholder={SCHEDULE_TASK_NAME_PLACEHOLDER}
                  className="schedule-task-dialog-input schedule-task-dialog-input--counter"
                />
                <span className="schedule-task-dialog-counter">{draft.title.length}/50</span>
              </div>
            </label>
            <label className="schedule-task-dialog-field">
              <FieldLabel required>{SCHEDULE_TASK_PROMPT_LABEL}</FieldLabel>
              <div className="schedule-task-dialog-textarea-wrap">
                <textarea
                  defaultValue={draft.prompt}
                  maxLength={8000}
                  placeholder={SCHEDULE_TASK_PROMPT_PLACEHOLDER}
                  className="schedule-task-dialog-textarea"
                />
                <span className="schedule-task-dialog-counter schedule-task-dialog-counter--bottom">
                  {draft.prompt.length}/8000
                </span>
              </div>
            </label>
          </ScheduleDialogSection>

          <ScheduleDialogSection
            icon={<Brain className="schedule-task-dialog-section-icon" strokeWidth={1.8} />}
            title={SCHEDULE_TASK_SECTION_MODEL}
          >
            <div className="schedule-task-dialog-field">
              <FieldLabel>{SCHEDULE_CLIENT_MODE_LABEL}</FieldLabel>
              <div className="schedule-task-dialog-segments schedule-task-dialog-segments--two">
                <SegmentButton selected>{SCHEDULE_CLIENT_MODE_CODE_LABEL}</SegmentButton>
                <SegmentButton>{SCHEDULE_CLIENT_MODE_IM_LABEL}</SegmentButton>
              </div>
            </div>
            <div className="schedule-task-dialog-model-grid">
              <label className="schedule-task-dialog-field">
                <FieldLabel required>{SCHEDULE_PROVIDER_LABEL}</FieldLabel>
                <select defaultValue={draft.providerId} className="schedule-task-dialog-input">
                  <option value="deepseek">DeepSeek</option>
                  <option value="openai">OpenAI</option>
                </select>
              </label>
              <label className="schedule-task-dialog-field">
                <FieldLabel required>{SCHEDULE_MODEL_LABEL}</FieldLabel>
                <select defaultValue={draft.model} className="schedule-task-dialog-input">
                  <option value="deepseek-chat">deepseek-chat</option>
                  <option value="deepseek-reasoner">deepseek-reasoner</option>
                </select>
              </label>
              <div className="schedule-task-dialog-field schedule-task-dialog-field--reasoning">
                <FieldLabel>{SCHEDULE_REASONING_LABEL}</FieldLabel>
                <div className="schedule-task-dialog-segments schedule-task-dialog-segments--reasoning">
                  {REASONING_OPTIONS.map((effort) => (
                    <SegmentButton key={effort} selected={draft.reasoningEffort === effort}>
                      {resolveScheduleReasoningLabel(effort)}
                    </SegmentButton>
                  ))}
                </div>
              </div>
            </div>
          </ScheduleDialogSection>

          <ScheduleDialogSection
            icon={<CalendarClock className="schedule-task-dialog-section-icon" strokeWidth={1.8} />}
            title={SCHEDULE_TASK_SECTION_TIMING}
          >
            <div className="schedule-task-dialog-timing-grid">
              <div className="schedule-task-dialog-field">
                <FieldLabel required>{SCHEDULE_RUN_AT_LABEL}</FieldLabel>
                <div className="schedule-task-dialog-segments schedule-task-dialog-segments--kinds">
                  {SCHEDULE_KIND_OPTIONS.map((kind) => (
                    <SegmentButton key={kind} selected={draft.schedule.kind === kind}>
                      {resolveScheduleKindLabel(kind)}
                    </SegmentButton>
                  ))}
                </div>
              </div>
              <div className="schedule-task-dialog-field">
                <FieldLabel>{SCHEDULE_DAILY_TIME_LABEL}</FieldLabel>
                <div className="schedule-task-dialog-time-grid">
                  <select defaultValue="09" className="schedule-task-dialog-input">
                    <option value="09">09</option>
                    <option value="10">10</option>
                  </select>
                  <select defaultValue="00" className="schedule-task-dialog-input">
                    <option value="00">00</option>
                    <option value="30">30</option>
                  </select>
                </div>
              </div>
            </div>
          </ScheduleDialogSection>

          <ScheduleDialogSection
            icon={<Folder className="schedule-task-dialog-section-icon" strokeWidth={1.8} />}
            title={SCHEDULE_TASK_SECTION_ENVIRONMENT}
          >
            <div className="schedule-task-dialog-env-grid">
              <label className="schedule-task-dialog-field">
                <FieldLabel>{SCHEDULE_WORKSPACE_LABEL}</FieldLabel>
                <div className="schedule-task-dialog-workspace-grid">
                  <input
                    defaultValue={draft.workspaceRoot}
                    placeholder={SCHEDULE_WORKSPACE_PLACEHOLDER}
                    className="schedule-task-dialog-input"
                  />
                  <button type="button" className="schedule-task-dialog-workspace-btn">
                    <FolderOpen className="schedule-task-dialog-workspace-btn-icon" strokeWidth={1.75} />
                    {draft.workspaceRoot.trim()
                      ? SCHEDULE_CHANGE_WORKSPACE_LABEL
                      : SCHEDULE_SELECT_WORKSPACE_LABEL}
                  </button>
                </div>
              </label>
              <div className="schedule-task-dialog-field">
                <FieldLabel>{SCHEDULE_TASK_ENABLED_LABEL}</FieldLabel>
                <button
                  type="button"
                  className="schedule-task-dialog-enable-btn"
                  aria-pressed={draft.enabled}
                >
                  <span className="schedule-task-dialog-enable-copy">
                    <Power className="schedule-task-dialog-enable-icon" strokeWidth={1.8} />
                    {SCHEDULE_TASK_ENABLED_LABEL}
                  </span>
                  <span
                    className={`schedule-tasks-view-toggle-track${
                      draft.enabled ? ' is-on' : ''
                    }`}
                  >
                    <span className="schedule-tasks-view-toggle-thumb" />
                  </span>
                </button>
              </div>
            </div>
          </ScheduleDialogSection>
        </div>

        <div className="schedule-task-dialog-footer">
          <button type="button" className="schedule-task-dialog-footer-link">
            <MoreHorizontal className="schedule-task-dialog-footer-link-icon" strokeWidth={1.8} />
            {SCHEDULE_ADVANCED_SETTINGS_LABEL}
          </button>
          <div className="schedule-task-dialog-footer-actions">
            <button type="button" onClick={onClose} className="schedule-task-dialog-btn schedule-task-dialog-btn--secondary">
              {SCHEDULE_CANCEL_LABEL}
            </button>
            <button type="submit" className="schedule-task-dialog-btn schedule-task-dialog-btn--primary">
              {SCHEDULE_CONFIRM_LABEL}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

function ScheduleDialogSection({
  icon,
  title,
  children,
}: {
  icon: ReactElement
  title: string
  children: ReactNode
}): ReactElement {
  return (
    <section className="schedule-task-dialog-section">
      <div className="schedule-task-dialog-section-heading">
        <span className="schedule-task-dialog-section-badge">{icon}</span>
        <span>{title}</span>
      </div>
      {children}
    </section>
  )
}

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode
  required?: boolean
}): ReactElement {
  return (
    <span className="schedule-task-dialog-label">
      <span>{children}</span>
      {required ? <span className="schedule-task-dialog-required">*</span> : null}
    </span>
  )
}

function SegmentButton({
  selected = false,
  children,
}: {
  selected?: boolean
  children: ReactNode
}): ReactElement {
  return (
    <button
      type="button"
      className={`schedule-task-dialog-segment${selected ? ' is-selected' : ''}`}
    >
      <span>{children}</span>
    </button>
  )
}

function previewState(mode: ScheduleTasksPreviewMode): {
  tasks: ScheduledTaskSnapshot[]
  filter: TaskFilter
  loading: boolean
  error: string | null
  runningTaskIds: Set<string>
  expandedResultTaskIds: Set<string>
  dialogMode: 'create' | 'edit' | null
  settingsDialogOpen: boolean
} {
  if (mode === 'empty') {
    return {
      tasks: [],
      filter: 'all',
      loading: false,
      error: null,
      runningTaskIds: new Set(),
      expandedResultTaskIds: new Set(),
      dialogMode: null,
      settingsDialogOpen: false,
    }
  }
  if (mode === 'filterEmpty') {
    return {
      tasks: SCHEDULE_TASKS_PREVIEW,
      filter: 'running',
      loading: false,
      error: null,
      runningTaskIds: new Set(),
      expandedResultTaskIds: new Set(),
      dialogMode: null,
      settingsDialogOpen: false,
    }
  }
  if (mode === 'loading') {
    return {
      tasks: [],
      filter: 'all',
      loading: true,
      error: null,
      runningTaskIds: new Set(),
      expandedResultTaskIds: new Set(),
      dialogMode: null,
      settingsDialogOpen: false,
    }
  }
  if (mode === 'error') {
    return {
      tasks: [],
      filter: 'all',
      loading: false,
      error: 'Failed to load schedule settings from runtime.',
      runningTaskIds: new Set(),
      expandedResultTaskIds: new Set(),
      dialogMode: null,
      settingsDialogOpen: false,
    }
  }
  if (mode === 'running') {
    return {
      tasks: SCHEDULE_TASKS_PREVIEW,
      filter: 'all',
      loading: false,
      error: null,
      runningTaskIds: new Set(['task-weekly-report']),
      expandedResultTaskIds: new Set(),
      dialogMode: null,
      settingsDialogOpen: false,
    }
  }
  if (mode === 'expandedResult') {
    return {
      tasks: SCHEDULE_TASKS_PREVIEW,
      filter: 'all',
      loading: false,
      error: null,
      runningTaskIds: new Set(),
      expandedResultTaskIds: new Set(['task-one-time-deploy']),
      dialogMode: null,
      settingsDialogOpen: false,
    }
  }
  if (mode === 'createDialog') {
    return {
      tasks: SCHEDULE_TASKS_PREVIEW,
      filter: 'all',
      loading: false,
      error: null,
      runningTaskIds: new Set(),
      expandedResultTaskIds: new Set(),
      dialogMode: 'create',
      settingsDialogOpen: false,
    }
  }
  if (mode === 'editDialog') {
    return {
      tasks: SCHEDULE_TASKS_PREVIEW,
      filter: 'all',
      loading: false,
      error: null,
      runningTaskIds: new Set(),
      expandedResultTaskIds: new Set(),
      dialogMode: 'edit',
      settingsDialogOpen: false,
    }
  }
  if (mode === 'settingsDialog') {
    return {
      tasks: SCHEDULE_TASKS_PREVIEW,
      filter: 'all',
      loading: false,
      error: null,
      runningTaskIds: new Set(),
      expandedResultTaskIds: new Set(),
      dialogMode: null,
      settingsDialogOpen: true,
    }
  }
  return {
    tasks: SCHEDULE_TASKS_PREVIEW,
    filter: 'all',
    loading: false,
    error: null,
    runningTaskIds: new Set(),
    expandedResultTaskIds: new Set(),
    dialogMode: null,
    settingsDialogOpen: false,
  }
}

/** Full-page preview shell for ?scheduleTasksViewPreview URL hooks. */
export function ScheduleTasksViewPreview({
  mode = 'default',
}: {
  mode?: ScheduleTasksPreviewMode
}): ReactElement {
  const initial = useMemo(() => previewState(mode), [mode])
  const [filter, setFilter] = useState(initial.filter)
  const [keepAwake, setKeepAwake] = useState(true)
  const [expandedResultTaskIds, setExpandedResultTaskIds] = useState(
    initial.expandedResultTaskIds,
  )
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)

  return (
    <div className="schedule-tasks-view-preview">
      <ScheduleTasksView
        tasks={initial.tasks}
        filter={filter}
        keepAwake={keepAwake}
        loading={initial.loading}
        error={initial.error}
        runningTaskIds={initial.runningTaskIds}
        expandedResultTaskIds={expandedResultTaskIds}
        leftSidebarCollapsed={leftSidebarCollapsed}
        dialogMode={initial.dialogMode}
        settingsDialogOpen={initial.settingsDialogOpen}
        onToggleLeftSidebar={() => setLeftSidebarCollapsed((current) => !current)}
        onFilterChange={setFilter}
        onKeepAwakeChange={setKeepAwake}
        onToggleResult={(taskId) => {
          setExpandedResultTaskIds((current) => {
            const next = new Set(current)
            if (next.has(taskId)) next.delete(taskId)
            else next.add(taskId)
            return next
          })
        }}
      />
    </div>
  )
}

/** Production shell for sidebar Schedule route — mock snapshots for visual parity. */
export function ScheduleTasksProductionView({
  leftSidebarCollapsed,
  onToggleLeftSidebar,
}: {
  leftSidebarCollapsed: boolean
  onToggleLeftSidebar: () => void
}): ReactElement {
  const initial = useMemo(() => previewState('default'), [])
  const [filter, setFilter] = useState(initial.filter)
  const [keepAwake, setKeepAwake] = useState(true)
  const [expandedResultTaskIds, setExpandedResultTaskIds] = useState(
    initial.expandedResultTaskIds,
  )

  return (
    <ScheduleTasksView
      tasks={initial.tasks}
      filter={filter}
      keepAwake={keepAwake}
      loading={initial.loading}
      error={initial.error}
      runningTaskIds={initial.runningTaskIds}
      expandedResultTaskIds={expandedResultTaskIds}
      leftSidebarCollapsed={leftSidebarCollapsed}
      dialogMode={initial.dialogMode}
      settingsDialogOpen={initial.settingsDialogOpen}
      onToggleLeftSidebar={onToggleLeftSidebar}
      onFilterChange={setFilter}
      onKeepAwakeChange={setKeepAwake}
      onToggleResult={(taskId) => {
        setExpandedResultTaskIds((current) => {
          const next = new Set(current)
          if (next.has(taskId)) next.delete(taskId)
          else next.add(taskId)
          return next
        })
      }}
    />
  )
}
