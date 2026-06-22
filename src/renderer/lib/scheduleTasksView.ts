// Kun ScheduleTasksView chrome
// (../Kun/src/renderer/src/components/schedule/ScheduleTasksView.tsx).
// Visual only — used for production ScheduleTasksView and preview hooks.

export type ScheduleKind = 'daily' | 'at' | 'interval' | 'manual'
export type ScheduleLastStatus = 'idle' | 'running' | 'success' | 'error'
export type ScheduleReasoningEffort = 'auto' | 'off' | 'low' | 'medium' | 'high' | 'max'
export type ScheduleTaskFilter = 'all' | 'enabled' | 'running' | 'done'

/** English copy matching Kun's schedule locale string. */
export const SCHEDULE_TASKS_TITLE = 'Scheduled tasks'

/** English copy matching Kun's scheduleSubtitle locale string. */
export const SCHEDULE_TASKS_SUBTITLE =
  'Design scheduled tasks, or start them whenever you need.'

/** English copy matching Kun's scheduleNewTask locale string. */
export const SCHEDULE_NEW_TASK_LABEL = 'New task'

/** English copy matching Kun's scheduleAwakeNotice locale string. */
export const SCHEDULE_AWAKE_NOTICE =
  'Scheduled tasks only run while this computer is awake.'

/** English copy matching Kun's scheduleKeepAwake locale string. */
export const SCHEDULE_KEEP_AWAKE_LABEL = 'Keep awake'

/** English copy matching Kun's scheduleEmpty locale string. */
export const SCHEDULE_EMPTY_TEXT = 'No scheduled tasks yet.'

/** English copy matching Kun's scheduleFilterEmpty locale string. */
export const SCHEDULE_FILTER_EMPTY_TEXT = 'No tasks match this filter.'

/** English copy matching Kun's loading locale string. */
export const SCHEDULE_LOADING_LABEL = 'Loading'

/** English copy matching Kun's scheduleCreateTask locale string. */
export const SCHEDULE_CREATE_TASK_TITLE = 'Create task'

/** English copy matching Kun's scheduleEditTask locale string. */
export const SCHEDULE_EDIT_TASK_TITLE = 'Edit task'

/** English copy matching Kun's scheduleDeleteTask locale string. */
export const SCHEDULE_DELETE_TASK_LABEL = 'Delete task'

/** English copy matching Kun's scheduleRunNow locale string. */
export const SCHEDULE_RUN_NOW_LABEL = 'Run once'

/** English copy matching Kun's scheduleOpenLastThread locale string. */
export const SCHEDULE_OPEN_LAST_THREAD_LABEL = 'Open last run'

/** English copy matching Kun's scheduleUntitled locale string. */
export const SCHEDULE_UNTITLED_TASK_LABEL = 'Untitled task'

/** English copy matching Kun's scheduleNextRun locale string. */
export const SCHEDULE_NEXT_RUN_LABEL = 'Next run'

/** English copy matching Kun's scheduleLastRun locale string. */
export const SCHEDULE_LAST_RUN_LABEL = 'Last run'

/** English copy matching Kun's scheduleNotScheduled locale string. */
export const SCHEDULE_NOT_SCHEDULED_LABEL = 'Not scheduled'

/** English copy matching Kun's scheduleNeverRun locale string. */
export const SCHEDULE_NEVER_RUN_LABEL = 'Never'

/** English copy matching Kun's scheduleLastResult locale string. */
export const SCHEDULE_LAST_RESULT_LABEL = 'Last result'

/** English copy matching Kun's scheduleLastError locale string. */
export const SCHEDULE_LAST_ERROR_LABEL = 'Last error'

/** English copy matching Kun's scheduleCurrentStatus locale string. */
export const SCHEDULE_CURRENT_STATUS_LABEL = 'Current status'

/** English copy matching Kun's scheduleExpandResult locale string. */
export const SCHEDULE_EXPAND_RESULT_LABEL = 'Expand'

/** English copy matching Kun's scheduleCollapseResult locale string. */
export const SCHEDULE_COLLAPSE_RESULT_LABEL = 'Collapse'

/** English copy matching Kun's scheduleDefaultsTitle locale string. */
export const SCHEDULE_DEFAULTS_TITLE = 'Schedule defaults'

/** English copy matching Kun's sidebarExpand locale string. */
export const SCHEDULE_SIDEBAR_EXPAND_LABEL = 'Expand sidebar'

/** English copy matching Kun's sidebarCollapse locale string. */
export const SCHEDULE_SIDEBAR_COLLAPSE_LABEL = 'Collapse sidebar'

/** English copy matching Kun's scheduleTaskSectionContent locale string. */
export const SCHEDULE_TASK_SECTION_CONTENT = 'Task content'

/** English copy matching Kun's scheduleTaskSectionModel locale string. */
export const SCHEDULE_TASK_SECTION_MODEL = 'Model settings'

/** English copy matching Kun's scheduleTaskSectionTiming locale string. */
export const SCHEDULE_TASK_SECTION_TIMING = 'Run plan'

/** English copy matching Kun's scheduleTaskSectionEnvironment locale string. */
export const SCHEDULE_TASK_SECTION_ENVIRONMENT = 'Environment'

/** English copy matching Kun's scheduleTaskName locale string. */
export const SCHEDULE_TASK_NAME_LABEL = 'Name'

/** English copy matching Kun's scheduleTaskNamePlaceholder locale string. */
export const SCHEDULE_TASK_NAME_PLACEHOLDER = 'Give this task a name'

/** English copy matching Kun's scheduleTaskPrompt locale string. */
export const SCHEDULE_TASK_PROMPT_LABEL = 'Instruction'

/** English copy matching Kun's scheduleTaskPromptPlaceholder locale string. */
export const SCHEDULE_TASK_PROMPT_PLACEHOLDER =
  'Describe what you want the agent to do...'

/** English copy matching Kun's scheduleClientMode locale string. */
export const SCHEDULE_CLIENT_MODE_LABEL = 'Run client'

/** English copy matching Kun's scheduleClientModeCode locale string. */
export const SCHEDULE_CLIENT_MODE_CODE_LABEL = 'Code'

/** English copy matching Kun's scheduleClientModeIm locale string. */
export const SCHEDULE_CLIENT_MODE_IM_LABEL = 'IM'

/** English copy matching Kun's scheduleClientModeImUnavailable locale string. */
export const SCHEDULE_CLIENT_MODE_IM_UNAVAILABLE =
  'Add and enable an IM connection before using IM mode.'

/** English copy matching Kun's scheduleProvider locale string. */
export const SCHEDULE_PROVIDER_LABEL = 'Provider'

/** English copy matching Kun's scheduleModel locale string. */
export const SCHEDULE_MODEL_LABEL = 'Model'

/** English copy matching Kun's scheduleReasoning locale string. */
export const SCHEDULE_REASONING_LABEL = 'Reasoning effort'

/** English copy matching Kun's scheduleRunAt locale string. */
export const SCHEDULE_RUN_AT_LABEL = 'Run time'

/** English copy matching Kun's scheduleDailyTime locale string. */
export const SCHEDULE_DAILY_TIME_LABEL = 'Daily time'

/** English copy matching Kun's scheduleManualHint locale string. */
export const SCHEDULE_MANUAL_HINT =
  'Manual tasks only run when you press Run once.'

/** English copy matching Kun's scheduleWorkspace locale string. */
export const SCHEDULE_WORKSPACE_LABEL = 'Workspace'

/** English copy matching Kun's scheduleWorkspacePlaceholder locale string. */
export const SCHEDULE_WORKSPACE_PLACEHOLDER = 'Use Schedule default workspace'

/** English copy matching Kun's scheduleTaskEnabled locale string. */
export const SCHEDULE_TASK_ENABLED_LABEL = 'Enable task'

/** English copy matching Kun's scheduleAdvancedSettings locale string. */
export const SCHEDULE_ADVANCED_SETTINGS_LABEL = 'Schedule settings'

/** English copy matching Kun's cancel locale string. */
export const SCHEDULE_CANCEL_LABEL = 'Cancel'

/** English copy matching Kun's confirm locale string. */
export const SCHEDULE_CONFIRM_LABEL = 'Confirm'

/** English copy matching Kun's close locale string. */
export const SCHEDULE_CLOSE_LABEL = 'Close'

/** English copy matching Kun's changeWorkspace locale string. */
export const SCHEDULE_CHANGE_WORKSPACE_LABEL = 'Change working directory'

/** English copy matching Kun's selectWorkspace locale string. */
export const SCHEDULE_SELECT_WORKSPACE_LABEL = 'Choose working directory'

/** English copy matching Kun's scheduleAt locale string template. */
export const SCHEDULE_AT_TEMPLATE = 'One-time · {{datetime}}'

/** English copy matching Kun's scheduleEvery locale string template. */
export const SCHEDULE_EVERY_TEMPLATE = 'Every {{minutes}} min'

/** English copy matching Kun's scheduleDailyAt locale string template. */
export const SCHEDULE_DAILY_AT_TEMPLATE = 'Daily at {{time}}'

/** English copy matching Kun's scheduleManual locale string. */
export const SCHEDULE_MANUAL_LABEL = 'Manual'

const SCHEDULE_FILTER_LABELS: Record<ScheduleTaskFilter, string> = {
  all: 'All',
  enabled: 'Enabled',
  running: 'Running',
  done: 'Done',
}

const SCHEDULE_STATUS_LABELS: Record<ScheduleLastStatus, string> = {
  idle: 'Idle',
  running: 'Running',
  success: 'Success',
  error: 'Error',
}

const SCHEDULE_REASONING_LABELS: Record<ScheduleReasoningEffort, string> = {
  auto: 'Auto',
  off: 'Off',
  low: 'Low',
  medium: 'Med',
  high: 'High',
  max: 'Ultra',
}

const SCHEDULE_KIND_LABELS: Record<ScheduleKind, string> = {
  daily: 'Daily',
  at: 'One-time',
  interval: 'Interval',
  manual: 'Manual',
}

/** Resolve filter chip label matching Kun's scheduleFilter_* keys. */
export function resolveScheduleFilterLabel(filter: ScheduleTaskFilter): string {
  return SCHEDULE_FILTER_LABELS[filter]
}

/** Resolve status badge label matching Kun's scheduleStatus_* keys. */
export function resolveScheduleStatusLabel(status: ScheduleLastStatus): string {
  return SCHEDULE_STATUS_LABELS[status]
}

/** Resolve reasoning effort label matching Kun's scheduleReasoning_* keys. */
export function resolveScheduleReasoningLabel(
  value: ScheduleReasoningEffort,
): string {
  return SCHEDULE_REASONING_LABELS[value]
}

/** Resolve schedule kind label matching Kun's scheduleKind_* keys. */
export function resolveScheduleKindLabel(kind: ScheduleKind): string {
  return SCHEDULE_KIND_LABELS[kind]
}

/** Format one-time schedule summary matching Kun's scheduleAt template. */
export function formatScheduleAtSummary(datetime: string): string {
  return SCHEDULE_AT_TEMPLATE.replace('{{datetime}}', datetime)
}

/** Format interval schedule summary matching Kun's scheduleEvery template. */
export function formatScheduleEverySummary(minutes: number): string {
  return SCHEDULE_EVERY_TEMPLATE.replace('{{minutes}}', String(minutes))
}

/** Format daily schedule summary matching Kun's scheduleDailyAt template. */
export function formatScheduleDailyAtSummary(time: string): string {
  return SCHEDULE_DAILY_AT_TEMPLATE.replace('{{time}}', time)
}

/** Resolve schedule task summary matching Kun's scheduleAt/Every/DailyAt/Manual keys. */
export function formatScheduleTaskSummary(input: {
  kind: ScheduleKind
  everyMinutes: number
  timeOfDay: string
  atTime: string
}): string {
  if (input.kind === 'at') {
    const datetime = input.atTime
      ? new Date(input.atTime).toLocaleString()
      : '-'
    return formatScheduleAtSummary(datetime)
  }
  if (input.kind === 'interval') {
    return formatScheduleEverySummary(input.everyMinutes)
  }
  if (input.kind === 'daily') {
    return formatScheduleDailyAtSummary(input.timeOfDay)
  }
  return SCHEDULE_MANUAL_LABEL
}
