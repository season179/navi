import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.schedule-tasks-view-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'scheduleTasksView.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
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
  formatScheduleAtSummary,
  formatScheduleDailyAtSummary,
  formatScheduleEverySummary,
  formatScheduleTaskSummary,
  resolveScheduleFilterLabel,
  resolveScheduleKindLabel,
  resolveScheduleReasoningLabel,
  resolveScheduleStatusLabel,
} = await import(out)

test('schedule tasks view copy matches Kun locale strings', () => {
  assert.equal(SCHEDULE_TASKS_TITLE, 'Scheduled tasks')
  assert.equal(
    SCHEDULE_TASKS_SUBTITLE,
    'Design scheduled tasks, or start them whenever you need.',
  )
  assert.equal(SCHEDULE_NEW_TASK_LABEL, 'New task')
  assert.equal(
    SCHEDULE_AWAKE_NOTICE,
    'Scheduled tasks only run while this computer is awake.',
  )
  assert.equal(SCHEDULE_KEEP_AWAKE_LABEL, 'Keep awake')
  assert.equal(SCHEDULE_EMPTY_TEXT, 'No scheduled tasks yet.')
  assert.equal(SCHEDULE_FILTER_EMPTY_TEXT, 'No tasks match this filter.')
  assert.equal(SCHEDULE_LOADING_LABEL, 'Loading')
  assert.equal(SCHEDULE_CREATE_TASK_TITLE, 'Create task')
  assert.equal(SCHEDULE_EDIT_TASK_TITLE, 'Edit task')
  assert.equal(SCHEDULE_DELETE_TASK_LABEL, 'Delete task')
  assert.equal(SCHEDULE_RUN_NOW_LABEL, 'Run once')
  assert.equal(SCHEDULE_OPEN_LAST_THREAD_LABEL, 'Open last run')
  assert.equal(SCHEDULE_UNTITLED_TASK_LABEL, 'Untitled task')
  assert.equal(SCHEDULE_NEXT_RUN_LABEL, 'Next run')
  assert.equal(SCHEDULE_LAST_RUN_LABEL, 'Last run')
  assert.equal(SCHEDULE_NOT_SCHEDULED_LABEL, 'Not scheduled')
  assert.equal(SCHEDULE_NEVER_RUN_LABEL, 'Never')
  assert.equal(SCHEDULE_LAST_RESULT_LABEL, 'Last result')
  assert.equal(SCHEDULE_LAST_ERROR_LABEL, 'Last error')
  assert.equal(SCHEDULE_CURRENT_STATUS_LABEL, 'Current status')
  assert.equal(SCHEDULE_EXPAND_RESULT_LABEL, 'Expand')
  assert.equal(SCHEDULE_COLLAPSE_RESULT_LABEL, 'Collapse')
  assert.equal(SCHEDULE_DEFAULTS_TITLE, 'Schedule defaults')
  assert.equal(SCHEDULE_SIDEBAR_EXPAND_LABEL, 'Expand sidebar')
  assert.equal(SCHEDULE_SIDEBAR_COLLAPSE_LABEL, 'Collapse sidebar')
  assert.equal(SCHEDULE_TASK_SECTION_CONTENT, 'Task content')
  assert.equal(SCHEDULE_TASK_SECTION_MODEL, 'Model settings')
  assert.equal(SCHEDULE_TASK_SECTION_TIMING, 'Run plan')
  assert.equal(SCHEDULE_TASK_SECTION_ENVIRONMENT, 'Environment')
  assert.equal(SCHEDULE_TASK_NAME_LABEL, 'Name')
  assert.equal(SCHEDULE_TASK_NAME_PLACEHOLDER, 'Give this task a name')
  assert.equal(SCHEDULE_TASK_PROMPT_LABEL, 'Instruction')
  assert.equal(
    SCHEDULE_TASK_PROMPT_PLACEHOLDER,
    'Describe what you want the agent to do...',
  )
  assert.equal(SCHEDULE_CLIENT_MODE_LABEL, 'Run client')
  assert.equal(SCHEDULE_CLIENT_MODE_CODE_LABEL, 'Code')
  assert.equal(SCHEDULE_CLIENT_MODE_IM_LABEL, 'IM')
  assert.equal(SCHEDULE_PROVIDER_LABEL, 'Provider')
  assert.equal(SCHEDULE_MODEL_LABEL, 'Model')
  assert.equal(SCHEDULE_REASONING_LABEL, 'Reasoning effort')
  assert.equal(SCHEDULE_RUN_AT_LABEL, 'Run time')
  assert.equal(SCHEDULE_DAILY_TIME_LABEL, 'Daily time')
  assert.equal(SCHEDULE_WORKSPACE_LABEL, 'Workspace')
  assert.equal(SCHEDULE_WORKSPACE_PLACEHOLDER, 'Use Schedule default workspace')
  assert.equal(SCHEDULE_TASK_ENABLED_LABEL, 'Enable task')
  assert.equal(SCHEDULE_ADVANCED_SETTINGS_LABEL, 'Schedule settings')
  assert.equal(SCHEDULE_CANCEL_LABEL, 'Cancel')
  assert.equal(SCHEDULE_CONFIRM_LABEL, 'Confirm')
  assert.equal(SCHEDULE_CLOSE_LABEL, 'Close')
  assert.equal(SCHEDULE_CHANGE_WORKSPACE_LABEL, 'Change working directory')
  assert.equal(SCHEDULE_SELECT_WORKSPACE_LABEL, 'Choose working directory')
})

test('schedule tasks view formatters match Kun templates', () => {
  assert.equal(resolveScheduleFilterLabel('all'), 'All')
  assert.equal(resolveScheduleFilterLabel('enabled'), 'Enabled')
  assert.equal(resolveScheduleFilterLabel('running'), 'Running')
  assert.equal(resolveScheduleFilterLabel('done'), 'Done')
  assert.equal(resolveScheduleStatusLabel('idle'), 'Idle')
  assert.equal(resolveScheduleStatusLabel('running'), 'Running')
  assert.equal(resolveScheduleStatusLabel('success'), 'Success')
  assert.equal(resolveScheduleStatusLabel('error'), 'Error')
  assert.equal(resolveScheduleReasoningLabel('auto'), 'Auto')
  assert.equal(resolveScheduleReasoningLabel('off'), 'Off')
  assert.equal(resolveScheduleReasoningLabel('low'), 'Low')
  assert.equal(resolveScheduleReasoningLabel('medium'), 'Med')
  assert.equal(resolveScheduleReasoningLabel('high'), 'High')
  assert.equal(resolveScheduleReasoningLabel('max'), 'Ultra')
  assert.equal(resolveScheduleKindLabel('daily'), 'Daily')
  assert.equal(resolveScheduleKindLabel('at'), 'One-time')
  assert.equal(resolveScheduleKindLabel('interval'), 'Interval')
  assert.equal(resolveScheduleKindLabel('manual'), 'Manual')
  assert.equal(formatScheduleAtSummary('Jun 22, 2026'), 'One-time · Jun 22, 2026')
  assert.equal(formatScheduleEverySummary(60), 'Every 60 min')
  assert.equal(formatScheduleDailyAtSummary('09:00'), 'Daily at 09:00')
  assert.equal(
    formatScheduleTaskSummary({
      kind: 'manual',
      everyMinutes: 60,
      timeOfDay: '09:00',
      atTime: '',
    }),
    'Manual',
  )
})
