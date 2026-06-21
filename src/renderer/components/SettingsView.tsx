// Settings route shell echoing Kun's SettingsView
// (../Kun/src/renderer/src/components/SettingsView.tsx).
// Visual only: composes the ported sidebar and section previews with mock save state.

import { useMemo, useState, type Dispatch, type ReactElement, type SetStateAction } from 'react'
import {
  SettingsSidebar,
  SettingsSidebarPreviewContent,
  resolveSettingsSidebarPreviewCategory,
  type SettingsCategory,
} from './SettingsSidebar'
import {
  WriteDebugLogModal,
  type WriteInlineCompletionDebugEntry,
} from './WriteDebugLogModal'

export type SettingsViewSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export type SettingsViewPreviewMode =
  | SettingsCategory
  | 'default'
  | 'noApiKey'
  | 'saving'
  | 'saved'
  | 'error'
  | 'portError'
  | 'writeDebugModal'

const COPY = {
  title: 'Settings',
  subtitle: 'Manage API access, interface preferences, default folders, and assistant behavior.',
  autoApplyHint: 'Changes apply automatically',
  applying: 'Applying…',
  applied: 'Applied',
  applyFailed: 'Could not apply',
  autoApplyBlocked: 'Fix the port to apply changes',
  retrySave: 'Retry',
  apiKeyRequiredTitle: 'API key required',
  apiKeyRequiredBody:
    'Add an API key in Providers first. Once entered, the app can start the local AI assistant service for you.',
  applyErrorMessage: 'Could not write settings to disk. Check permissions and try again.',
}

const WRITE_DEBUG_ENTRIES: WriteInlineCompletionDebugEntry[] = [
  {
    id: 'entry-1',
    createdAt: '2026-06-22T14:32:18.000Z',
    durationMs: 842,
    ok: true,
    model: 'deepseek-v4-pro',
    mode: 'completion',
    currentFilePath: '/Users/season/projects/blog/draft.md',
    prompt:
      'You are helping complete markdown prose.\n\n## Current paragraph\n\nThe morning light filtered through',
    suffix: ' the blinds and landed on the desk in soft stripes.',
    rawResponse: ' the blinds and landed on the desk in soft stripes.',
    completion: ' the blinds and landed on the desk in soft stripes.',
    referenceCount: 2,
    recentEditCount: 4,
  },
]

function isSettingsCategory(mode: SettingsViewPreviewMode): mode is SettingsCategory {
  return (
    mode !== 'default' &&
    mode !== 'noApiKey' &&
    mode !== 'saving' &&
    mode !== 'saved' &&
    mode !== 'error' &&
    mode !== 'portError' &&
    mode !== 'writeDebugModal'
  )
}

function resolvePreviewCategory(mode: SettingsViewPreviewMode): SettingsCategory {
  if (mode === 'writeDebugModal') return 'write'
  if (isSettingsCategory(mode)) return mode
  return resolveSettingsSidebarPreviewCategory('default')
}

function resolvePreviewSaveStatus(mode: SettingsViewPreviewMode): SettingsViewSaveStatus {
  if (mode === 'saving') return 'saving'
  if (mode === 'saved') return 'saved'
  if (mode === 'error') return 'error'
  return 'idle'
}

function resolvePreviewHasApiKey(mode: SettingsViewPreviewMode): boolean {
  return mode !== 'noApiKey'
}

function resolvePreviewPortError(mode: SettingsViewPreviewMode): boolean {
  return mode === 'portError'
}

type SettingsViewProps = {
  category: SettingsCategory
  setCategory: Dispatch<SetStateAction<SettingsCategory>>
  saveStatus?: SettingsViewSaveStatus
  saveError?: string | null
  portError?: boolean
  hasApiKey?: boolean
  writeDebugModalOpen?: boolean
  onCloseWriteDebugModal?: () => void
  onGoBack?: () => void
}

export function SettingsView({
  category,
  setCategory,
  saveStatus = 'idle',
  saveError = null,
  portError = false,
  hasApiKey = true,
  writeDebugModalOpen = false,
  onCloseWriteDebugModal,
  onGoBack,
}: SettingsViewProps): ReactElement {
  const statusLabel = portError
    ? COPY.autoApplyBlocked
    : saveStatus === 'saving'
      ? COPY.applying
      : saveStatus === 'saved'
        ? COPY.applied
        : saveStatus === 'error'
          ? COPY.applyFailed
          : COPY.autoApplyHint

  const statusClass =
    portError || saveStatus === 'error'
      ? saveStatus === 'error' && !portError
        ? 'is-error'
        : 'is-warning'
      : saveStatus === 'saved'
        ? 'is-success'
        : 'is-idle'

  return (
    <div className="settings-view ds-drag">
      <SettingsSidebar category={category} setCategory={setCategory} goBack={onGoBack ?? (() => undefined)} />

      <div className="settings-view-main ds-no-drag">
        <div className="settings-view-inner">
          {!hasApiKey ? (
            <div className="settings-view-api-key-banner" role="status">
              <div className="settings-view-api-key-banner-title">{COPY.apiKeyRequiredTitle}</div>
              <p className="settings-view-api-key-banner-body">{COPY.apiKeyRequiredBody}</p>
            </div>
          ) : null}

          <div className="settings-view-header">
            <div>
              <h1 className="settings-view-title">{COPY.title}</h1>
              <p className="settings-view-subtitle">{COPY.subtitle}</p>
            </div>
            <span
              className={`settings-view-save-status ${statusClass}`}
              title={saveStatus === 'error' && saveError ? saveError : undefined}
            >
              {statusLabel}
            </span>
          </div>

          {saveStatus === 'error' && saveError ? (
            <div className="settings-view-inline-error" role="alert">
              {saveError}
            </div>
          ) : null}

          <SettingsSidebarPreviewContent category={category} showHeader={false} />
        </div>
      </div>

      {saveStatus === 'error' && saveError ? (
        <div className="settings-view-error-toast ds-no-drag" role="alert">
          <div className="settings-view-error-toast-copy">
            <div className="settings-view-error-toast-title">{COPY.applyFailed}</div>
            <div className="settings-view-error-toast-message">{saveError}</div>
          </div>
          <button
            type="button"
            className="settings-view-error-toast-retry"
            disabled={portError}
          >
            {COPY.retrySave}
          </button>
        </div>
      ) : null}

      {writeDebugModalOpen ? (
        <WriteDebugLogModal
          completionEntries={WRITE_DEBUG_ENTRIES}
          completionSelectedId={WRITE_DEBUG_ENTRIES[0]?.id ?? null}
          loading={false}
          error={null}
          onSelectCompletion={() => undefined}
          onRefresh={() => undefined}
          onClear={() => undefined}
          onClose={onCloseWriteDebugModal ?? (() => undefined)}
        />
      ) : null}
    </div>
  )
}

/** Full-screen preview shell for ?settingsViewPreview URL hooks. */
export function SettingsViewPreview({
  mode = 'default',
}: {
  mode?: SettingsViewPreviewMode
}): ReactElement {
  const [category, setCategory] = useState<SettingsCategory>(() => resolvePreviewCategory(mode))
  const [writeDebugModalOpen, setWriteDebugModalOpen] = useState(mode === 'writeDebugModal')

  const saveStatus = useMemo(() => resolvePreviewSaveStatus(mode), [mode])
  const hasApiKey = useMemo(() => resolvePreviewHasApiKey(mode), [mode])
  const portError = useMemo(() => resolvePreviewPortError(mode), [mode])
  const saveError = saveStatus === 'error' ? COPY.applyErrorMessage : null

  return (
    <SettingsView
      category={category}
      setCategory={setCategory}
      saveStatus={saveStatus}
      saveError={saveError}
      portError={portError}
      hasApiKey={hasApiKey}
      writeDebugModalOpen={writeDebugModalOpen}
      onCloseWriteDebugModal={() => setWriteDebugModalOpen(false)}
    />
  )
}
