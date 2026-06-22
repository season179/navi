// Kun ScheduleDefaultsDialog.tsx visual port
// (../Kun/src/renderer/src/components/schedule/ScheduleDefaultsDialog.tsx).
// Visual only: mock schedule snapshots and preview URL hooks.

import { useMemo, useState, type ReactElement } from 'react'
import { X } from 'lucide-react'
import {
  SCHEDULE_CANCEL_LABEL,
  SCHEDULE_CLOSE_LABEL,
  SCHEDULE_CONFIRM_LABEL,
  SCHEDULE_DEFAULT_SKILLS_LABEL,
  SCHEDULE_DEFAULT_SKILLS_PLACEHOLDER,
  SCHEDULE_DEFAULT_WORKSPACE_LABEL,
  SCHEDULE_DEFAULTS_TITLE,
  SCHEDULE_EXTRA_SKILL_DIRS_LABEL,
  SCHEDULE_EXTRA_SKILL_DIRS_PLACEHOLDER,
  SCHEDULE_GLOBAL_ENABLED_LABEL,
  SCHEDULE_MODEL_LABEL,
  SCHEDULE_PROMPT_PREFIX_LABEL,
  SCHEDULE_PROMPT_PREFIX_PLACEHOLDER,
  SCHEDULE_PROVIDER_LABEL,
  SCHEDULE_WORKSPACE_PLACEHOLDER,
} from '../../lib/scheduleTasksView'

export type ScheduleDefaultsSnapshot = {
  enabled: boolean
  defaultWorkspaceRoot: string
  providerId: string
  model: string
  promptPrefix: string
  defaultNames: string
  extraDirs: string
}

export type ScheduleModelProviderOption = {
  providerId: string
  label: string
  modelIds: string[]
}

const DEFAULT_SCHEDULE_MODEL = 'deepseek-chat'

export const SCHEDULE_DEFAULTS_PREVIEW: ScheduleDefaultsSnapshot = {
  enabled: true,
  defaultWorkspaceRoot: '/Users/season/projects/navi',
  providerId: 'deepseek',
  model: 'deepseek-chat',
  promptPrefix: 'You are running as a scheduled background agent. Be concise and actionable.',
  defaultNames: 'commit, review, summarize',
  extraDirs: '/Users/season/.agents/skills\n/Users/season/projects/shared-skills',
}

export const SCHEDULE_DEFAULTS_PREVIEW_DISABLED: ScheduleDefaultsSnapshot = {
  ...SCHEDULE_DEFAULTS_PREVIEW,
  enabled: false,
}

export const SCHEDULE_DEFAULTS_PREVIEW_EMPTY: ScheduleDefaultsSnapshot = {
  enabled: true,
  defaultWorkspaceRoot: '',
  providerId: '',
  model: DEFAULT_SCHEDULE_MODEL,
  promptPrefix: '',
  defaultNames: '',
  extraDirs: '',
}

export const SCHEDULE_DEFAULTS_PREVIEW_PROVIDERS: ScheduleModelProviderOption[] = [
  {
    providerId: 'deepseek',
    label: 'DeepSeek',
    modelIds: ['deepseek-chat', 'deepseek-reasoner'],
  },
  {
    providerId: 'openai',
    label: 'OpenAI',
    modelIds: ['gpt-4.1-mini', 'gpt-4.1'],
  },
]

function modelIdsEqual(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase()
}

function firstConcreteModel(
  modelIds: readonly string[],
  fallback = DEFAULT_SCHEDULE_MODEL
): string {
  return (
    modelIds.find((model) => model.trim() && model.trim().toLowerCase() !== 'auto') ??
    fallback
  )
}

function resolveDefaultsModelSelection(
  providers: readonly ScheduleModelProviderOption[],
  providerId: string | undefined,
  model: string | undefined
): { providerId: string; model: string } {
  const requestedProviderId = providerId?.trim() ?? ''
  const requestedModel = model?.trim() ?? ''
  const providerById = providers.find((provider) => provider.providerId === requestedProviderId)
  const providerByModel =
    requestedModel && requestedModel.toLowerCase() !== 'auto'
      ? providers.find((provider) =>
          provider.modelIds.some((id) => modelIdsEqual(id, requestedModel))
        )
      : undefined
  const provider = providerById ?? providerByModel ?? providers[0]
  if (!provider) {
    return {
      providerId: requestedProviderId,
      model:
        requestedModel && requestedModel.toLowerCase() !== 'auto'
          ? requestedModel
          : DEFAULT_SCHEDULE_MODEL,
    }
  }
  return {
    providerId: provider.providerId,
    model:
      requestedModel &&
      requestedModel.toLowerCase() !== 'auto' &&
      provider.modelIds.some((id) => modelIdsEqual(id, requestedModel))
        ? requestedModel
        : firstConcreteModel(provider.modelIds),
  }
}

type ScheduleDefaultsDialogProps = {
  schedule: ScheduleDefaultsSnapshot
  modelProviders: ScheduleModelProviderOption[]
  onClose?: () => void
  onSave?: (snapshot: ScheduleDefaultsSnapshot) => void | Promise<void>
}

export function ScheduleDefaultsDialog({
  schedule,
  modelProviders,
  onClose,
  onSave,
}: ScheduleDefaultsDialogProps): ReactElement {
  const [draft, setDraft] = useState(schedule)

  const fallbackProviders = useMemo(
    () =>
      modelProviders.length > 0
        ? modelProviders
        : [
            {
              providerId: draft.providerId,
              label: draft.providerId || 'Default',
              modelIds: [DEFAULT_SCHEDULE_MODEL],
            },
          ],
    [draft.providerId, modelProviders]
  )

  const selection = resolveDefaultsModelSelection(
    fallbackProviders,
    draft.providerId,
    draft.model
  )
  const selectedProvider =
    fallbackProviders.find((provider) => provider.providerId === selection.providerId) ?? null
  const selectedModelIds = selectedProvider?.modelIds ?? [selection.model]

  const update = (patch: Partial<ScheduleDefaultsSnapshot>): void => {
    setDraft((current) => ({ ...current, ...patch }))
  }

  const updateProvider = (providerId: string): void => {
    const next = resolveDefaultsModelSelection(fallbackProviders, providerId, '')
    update({ providerId: next.providerId, model: next.model })
  }

  const updateModel = (model: string): void => {
    const next = resolveDefaultsModelSelection(fallbackProviders, selection.providerId, model)
    update({ providerId: next.providerId, model: next.model })
  }

  const save = (): void => {
    const nextSelection = resolveDefaultsModelSelection(
      fallbackProviders,
      draft.providerId,
      draft.model
    )
    void onSave?.({
      ...draft,
      providerId: nextSelection.providerId,
      model: nextSelection.model,
    })
  }

  return (
    <div
      className="schedule-defaults-dialog-overlay ds-no-drag"
      onMouseDown={() => onClose?.()}
    >
      <div
        className="schedule-defaults-dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="schedule-defaults-dialog-header">
          <h2 className="schedule-defaults-dialog-title">{SCHEDULE_DEFAULTS_TITLE}</h2>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="schedule-defaults-dialog-close"
            aria-label={SCHEDULE_CLOSE_LABEL}
            title={SCHEDULE_CLOSE_LABEL}
          >
            <X className="schedule-defaults-dialog-close-icon" strokeWidth={1.7} />
          </button>
        </div>

        <div className="schedule-defaults-dialog-toggle-row">
          <span className="schedule-defaults-dialog-toggle-label">
            {SCHEDULE_GLOBAL_ENABLED_LABEL}
          </span>
          <label className="schedule-defaults-dialog-toggle">
            <input
              type="checkbox"
              checked={draft.enabled}
              onChange={(event) => update({ enabled: event.target.checked })}
              className="sr-only"
            />
            <span
              className={`schedule-defaults-dialog-toggle-track${
                draft.enabled ? ' is-on' : ''
              }`}
            >
              <span className="schedule-defaults-dialog-toggle-thumb" />
            </span>
          </label>
        </div>

        <div className="schedule-defaults-dialog-grid schedule-defaults-dialog-grid--two">
          <label className="schedule-defaults-dialog-field">
            {SCHEDULE_PROVIDER_LABEL}
            <select
              value={selection.providerId}
              onChange={(event) => updateProvider(event.target.value)}
              className="schedule-defaults-dialog-input"
            >
              {fallbackProviders.map((provider) => (
                <option key={provider.providerId || provider.label} value={provider.providerId}>
                  {provider.label}
                </option>
              ))}
            </select>
          </label>
          <label className="schedule-defaults-dialog-field">
            {SCHEDULE_MODEL_LABEL}
            <select
              value={selection.model}
              onChange={(event) => updateModel(event.target.value)}
              className="schedule-defaults-dialog-input"
            >
              {selectedModelIds.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="schedule-defaults-dialog-field schedule-defaults-dialog-field--full">
          {SCHEDULE_DEFAULT_WORKSPACE_LABEL}
          <input
            value={draft.defaultWorkspaceRoot}
            onChange={(event) => update({ defaultWorkspaceRoot: event.target.value })}
            placeholder={SCHEDULE_WORKSPACE_PLACEHOLDER}
            className="schedule-defaults-dialog-input"
          />
        </label>

        <label className="schedule-defaults-dialog-field schedule-defaults-dialog-field--full">
          {SCHEDULE_PROMPT_PREFIX_LABEL}
          <textarea
            value={draft.promptPrefix}
            onChange={(event) => update({ promptPrefix: event.target.value })}
            placeholder={SCHEDULE_PROMPT_PREFIX_PLACEHOLDER}
            className="schedule-defaults-dialog-textarea schedule-defaults-dialog-textarea--tall"
          />
        </label>

        <div className="schedule-defaults-dialog-grid schedule-defaults-dialog-grid--two">
          <label className="schedule-defaults-dialog-field">
            {SCHEDULE_DEFAULT_SKILLS_LABEL}
            <textarea
              value={draft.defaultNames}
              onChange={(event) => update({ defaultNames: event.target.value })}
              placeholder={SCHEDULE_DEFAULT_SKILLS_PLACEHOLDER}
              className="schedule-defaults-dialog-textarea"
            />
          </label>
          <label className="schedule-defaults-dialog-field">
            {SCHEDULE_EXTRA_SKILL_DIRS_LABEL}
            <textarea
              value={draft.extraDirs}
              onChange={(event) => update({ extraDirs: event.target.value })}
              placeholder={SCHEDULE_EXTRA_SKILL_DIRS_PLACEHOLDER}
              className="schedule-defaults-dialog-textarea"
            />
          </label>
        </div>

        <div className="schedule-defaults-dialog-footer">
          <button
            type="button"
            onClick={() => onClose?.()}
            className="schedule-defaults-dialog-btn schedule-defaults-dialog-btn--secondary"
          >
            {SCHEDULE_CANCEL_LABEL}
          </button>
          <button
            type="button"
            onClick={save}
            className="schedule-defaults-dialog-btn schedule-defaults-dialog-btn--primary"
          >
            {SCHEDULE_CONFIRM_LABEL}
          </button>
        </div>
      </div>
    </div>
  )
}

export type ScheduleDefaultsDialogPreviewMode = 'default' | 'disabled' | 'empty' | 'singleProvider'

function previewSnapshot(mode: ScheduleDefaultsDialogPreviewMode): {
  schedule: ScheduleDefaultsSnapshot
  providers: ScheduleModelProviderOption[]
} {
  if (mode === 'disabled') {
    return {
      schedule: SCHEDULE_DEFAULTS_PREVIEW_DISABLED,
      providers: SCHEDULE_DEFAULTS_PREVIEW_PROVIDERS,
    }
  }
  if (mode === 'empty') {
    return {
      schedule: SCHEDULE_DEFAULTS_PREVIEW_EMPTY,
      providers: [],
    }
  }
  if (mode === 'singleProvider') {
    return {
      schedule: SCHEDULE_DEFAULTS_PREVIEW,
      providers: [SCHEDULE_DEFAULTS_PREVIEW_PROVIDERS[0]!],
    }
  }
  return {
    schedule: SCHEDULE_DEFAULTS_PREVIEW,
    providers: SCHEDULE_DEFAULTS_PREVIEW_PROVIDERS,
  }
}

/** Full-screen preview shell for ?scheduleDefaultsDialogPreview URL hooks. */
export function ScheduleDefaultsDialogPreview({
  mode = 'default',
}: {
  mode?: ScheduleDefaultsDialogPreviewMode
}): ReactElement {
  const snapshot = previewSnapshot(mode)

  return (
    <ScheduleDefaultsDialog
      schedule={snapshot.schedule}
      modelProviders={snapshot.providers}
      onClose={() => undefined}
      onSave={() => undefined}
    />
  )
}
