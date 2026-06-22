// General settings section echoing Kun's settings-section-general.tsx
// (../Kun/src/renderer/src/components/settings-section-general.tsx).
// Visual only: mock form state and preview modes.

import { useState, type ReactElement } from 'react'
import { ArchiveRestore, FolderOpen, Loader2 } from 'lucide-react'
import {
  GENERAL_SETTINGS_BROWSE_LABEL,
  GENERAL_SETTINGS_CLOSE_ACTION_DESC,
  GENERAL_SETTINGS_CLOSE_ACTION_LABEL,
  GENERAL_SETTINGS_CURSOR_SPOTLIGHT_DESC,
  GENERAL_SETTINGS_CURSOR_SPOTLIGHT_LABEL,
  GENERAL_SETTINGS_DESKTOP_BEHAVIOR_TITLE,
  GENERAL_SETTINGS_FONT_SCALE_DESC,
  GENERAL_SETTINGS_FONT_SCALE_LABEL,
  GENERAL_SETTINGS_LANGUAGE_DESC,
  GENERAL_SETTINGS_LANGUAGE_LABEL,
  GENERAL_SETTINGS_LEGACY_IMPORT_ALL_PRESENT,
  GENERAL_SETTINGS_LEGACY_IMPORT_BUTTON,
  GENERAL_SETTINGS_LEGACY_IMPORT_DESC,
  GENERAL_SETTINGS_LEGACY_IMPORT_NONE_FOUND,
  GENERAL_SETTINGS_LEGACY_IMPORT_PICK,
  GENERAL_SETTINGS_LEGACY_IMPORT_RESTARTING,
  GENERAL_SETTINGS_LEGACY_IMPORT_SCANNING,
  GENERAL_SETTINGS_LEGACY_IMPORT_TITLE,
  GENERAL_SETTINGS_LOG_DIR_DESC,
  GENERAL_SETTINGS_LOG_DIR_LABEL,
  GENERAL_SETTINGS_LOG_DIR_OPEN,
  GENERAL_SETTINGS_LOG_ENABLED_DESC,
  GENERAL_SETTINGS_LOG_ENABLED_LABEL,
  GENERAL_SETTINGS_LOG_RETENTION_DESC,
  GENERAL_SETTINGS_LOG_RETENTION_FIVE,
  GENERAL_SETTINGS_LOG_RETENTION_LABEL,
  GENERAL_SETTINGS_LOG_RETENTION_ONE,
  GENERAL_SETTINGS_LOG_RETENTION_SEVEN,
  GENERAL_SETTINGS_LOG_RETENTION_THREE,
  GENERAL_SETTINGS_LOG_RETENTION_TWO,
  GENERAL_SETTINGS_LOG_TITLE,
  GENERAL_SETTINGS_ONBOARDING_PREVIEW_DESC,
  GENERAL_SETTINGS_ONBOARDING_PREVIEW_OPEN,
  GENERAL_SETTINGS_ONBOARDING_PREVIEW_TITLE,
  GENERAL_SETTINGS_OPEN_AT_LOGIN_DESC,
  GENERAL_SETTINGS_OPEN_AT_LOGIN_LABEL,
  GENERAL_SETTINGS_OPEN_AT_LOGIN_UNSUPPORTED_DESC,
  GENERAL_SETTINGS_RESTORE_WORKSPACE_DEFAULT,
  GENERAL_SETTINGS_SECTION_TITLE,
  GENERAL_SETTINGS_START_MINIMIZED_DESC,
  GENERAL_SETTINGS_START_MINIMIZED_DISABLED_DESC,
  GENERAL_SETTINGS_START_MINIMIZED_LABEL,
  GENERAL_SETTINGS_THEME_DARK,
  GENERAL_SETTINGS_THEME_DESC,
  GENERAL_SETTINGS_THEME_LABEL,
  GENERAL_SETTINGS_THEME_LIGHT,
  GENERAL_SETTINGS_THEME_SYSTEM,
  GENERAL_SETTINGS_TURN_COMPLETE_NOTIFICATION_DESC,
  GENERAL_SETTINGS_TURN_COMPLETE_NOTIFICATION_LABEL,
  GENERAL_SETTINGS_WORKSPACE_ROOT_DESC,
  GENERAL_SETTINGS_WORKSPACE_ROOT_LABEL,
  GENERAL_SETTINGS_WORKSPACE_ROOT_PLACEHOLDER,
  formatGeneralSettingsFontScaleCurrent,
  formatGeneralSettingsLegacyImportFound,
  formatGeneralSettingsLegacyImportSourceCount,
  resolveGeneralSettingsCloseActionLabel,
  resolveGeneralSettingsFontScaleLabel,
} from '../../lib/generalSettingsSection'
import {
  InlineNoticeView,
  SETTINGS_SELECT_CLASS,
  SettingRow,
  SettingsCard,
  Toggle,
  type InlineNotice,
} from './SettingsControls'

type ThemePref = 'system' | 'light' | 'dark'
type LocalePref = 'en' | 'zh'
type FontScale = 'small' | 'medium' | 'large'
type CloseAction = 'ask' | 'tray' | 'quit'

export type GeneralSettingsForm = {
  locale: LocalePref
  theme: ThemePref
  uiFontScale: FontScale
  workspaceRoot: string
  cursorSpotlight: boolean
  appBehavior: {
    openAtLogin: boolean
    startMinimized: boolean
    closeAction: CloseAction
  }
  notifications: {
    turnComplete: boolean
  }
  log: {
    enabled: boolean
    retentionDays: number
  }
}

export const GENERAL_SETTINGS_PREVIEW_FORM: GeneralSettingsForm = {
  locale: 'en',
  theme: 'system',
  uiFontScale: 'medium',
  workspaceRoot: '/Users/season/Projects/demo',
  cursorSpotlight: true,
  appBehavior: {
    openAtLogin: true,
    startMinimized: false,
    closeAction: 'ask',
  },
  notifications: {
    turnComplete: true,
  },
  log: {
    enabled: true,
    retentionDays: 7,
  },
}

const FONT_SCALE_OPTIONS: FontScale[] = ['small', 'medium', 'large']
const CLOSE_ACTION_OPTIONS: CloseAction[] = ['ask', 'tray', 'quit']

type LegacySource = {
  id: string
  path: string
  threadCount: number
  newCount: number
}

export type LegacyImportPreviewState =
  | 'scanning'
  | 'found'
  | 'allPresent'
  | 'none'
  | 'success'
  | 'error'

const LEGACY_SOURCES_PREVIEW: LegacySource[] = [
  {
    id: 'kun-default',
    path: '/Users/season/Library/Application Support/Kun/sessions',
    threadCount: 12,
    newCount: 4,
  },
  {
    id: 'kun-archive',
    path: '/Users/season/.kun/archive',
    threadCount: 3,
    newCount: 0,
  },
]

function fontScaleLabel(scale: FontScale): string {
  return resolveGeneralSettingsFontScaleLabel(scale)
}

function LegacySessionImportCard({
  state = 'found',
}: {
  state?: LegacyImportPreviewState
}): ReactElement {
  const detecting = state === 'scanning'
  const sources =
    state === 'none' || state === 'scanning'
      ? []
      : state === 'allPresent'
        ? LEGACY_SOURCES_PREVIEW.map((source) => ({ ...source, newCount: 0 }))
        : LEGACY_SOURCES_PREVIEW

  const totalNew = sources.reduce((sum, source) => sum + source.newCount, 0)
  const totalFound = sources.reduce((sum, source) => sum + source.threadCount, 0)

  const statusText = detecting
    ? GENERAL_SETTINGS_LEGACY_IMPORT_SCANNING
    : totalNew > 0
      ? formatGeneralSettingsLegacyImportFound(totalNew)
      : totalFound > 0
        ? GENERAL_SETTINGS_LEGACY_IMPORT_ALL_PRESENT
        : GENERAL_SETTINGS_LEGACY_IMPORT_NONE_FOUND

  const notice: InlineNotice | null =
    state === 'success'
      ? { tone: 'success', message: 'Imported 4 sessions, skipped 0 duplicates.' }
      : state === 'error'
        ? { tone: 'error', message: 'Could not read legacy session directory.' }
        : null

  return (
    <SettingsCard title={GENERAL_SETTINGS_LEGACY_IMPORT_TITLE} className="settings-card-spaced">
      <SettingRow
        title={GENERAL_SETTINGS_LEGACY_IMPORT_TITLE}
        description={GENERAL_SETTINGS_LEGACY_IMPORT_DESC}
        wideControl
        control={
          <div className="general-settings-legacy-control">
            <div className="general-settings-legacy-status">
              {detecting ? (
                <Loader2 className="general-settings-legacy-spinner" strokeWidth={2} />
              ) : null}
              <span>{statusText}</span>
            </div>

            {sources.length > 0 ? (
              <ul className="general-settings-legacy-sources">
                {sources.map((source) => (
                  <li key={source.id} className="general-settings-legacy-source">
                    <span className="general-settings-legacy-source-count">
                      {formatGeneralSettingsLegacyImportSourceCount(
                        source.newCount,
                        source.threadCount,
                      )}
                    </span>
                    <code className="general-settings-legacy-source-path">{source.path}</code>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="general-settings-legacy-actions">
              <button
                type="button"
                className="settings-action-button"
                disabled={detecting || totalNew === 0}
              >
                <ArchiveRestore className="settings-action-button-icon" strokeWidth={1.75} />
                {GENERAL_SETTINGS_LEGACY_IMPORT_BUTTON}
              </button>
              <button type="button" className="settings-action-button" disabled={detecting}>
                <FolderOpen className="settings-action-button-icon" strokeWidth={1.75} />
                {GENERAL_SETTINGS_LEGACY_IMPORT_PICK}
              </button>
            </div>

            {notice ? <InlineNoticeView notice={notice} /> : null}
          </div>
        }
      />
    </SettingsCard>
  )
}

type GeneralSettingsSectionProps = {
  form: GeneralSettingsForm
  onChange: (patch: Partial<GeneralSettingsForm>) => void
  workspacePickerError?: string | null
  logPath?: string
  logDirOpenError?: string | null
  legacyImportState?: LegacyImportPreviewState
  openAtLoginSupported?: boolean
  startMinimizedSupported?: boolean
}

export function GeneralSettingsSection({
  form,
  onChange,
  workspacePickerError = null,
  logPath = '/Users/season/Library/Logs/Navi',
  logDirOpenError = null,
  legacyImportState = 'found',
  openAtLoginSupported = true,
  startMinimizedSupported = true,
}: GeneralSettingsSectionProps): ReactElement {
  const fontScaleIndex = Math.max(0, FONT_SCALE_OPTIONS.indexOf(form.uiFontScale))
  const currentFontScale = FONT_SCALE_OPTIONS[fontScaleIndex] ?? 'medium'
  const closeAction = form.appBehavior.closeAction

  const updateBehavior = (patch: Partial<GeneralSettingsForm['appBehavior']>) => {
    onChange({ appBehavior: { ...form.appBehavior, ...patch } })
  }

  const updateLog = (patch: Partial<GeneralSettingsForm['log']>) => {
    onChange({ log: { ...form.log, ...patch } })
  }

  return (
    <>
      <SettingsCard title={GENERAL_SETTINGS_SECTION_TITLE}>
        <SettingRow
          title={GENERAL_SETTINGS_LANGUAGE_LABEL}
          description={GENERAL_SETTINGS_LANGUAGE_DESC}
          control={
            <select
              className={SETTINGS_SELECT_CLASS}
              value={form.locale}
              onChange={(e) => onChange({ locale: e.target.value as LocalePref })}
            >
              <option value="en">English</option>
              <option value="zh">简体中文</option>
            </select>
          }
        />
        <SettingRow
          title={GENERAL_SETTINGS_THEME_LABEL}
          description={GENERAL_SETTINGS_THEME_DESC}
          control={
            <select
              className={SETTINGS_SELECT_CLASS}
              value={form.theme}
              onChange={(e) => onChange({ theme: e.target.value as ThemePref })}
            >
              <option value="system">{GENERAL_SETTINGS_THEME_SYSTEM}</option>
              <option value="light">{GENERAL_SETTINGS_THEME_LIGHT}</option>
              <option value="dark">{GENERAL_SETTINGS_THEME_DARK}</option>
            </select>
          }
        />
        <SettingRow
          title={GENERAL_SETTINGS_FONT_SCALE_LABEL}
          description={GENERAL_SETTINGS_FONT_SCALE_DESC}
          control={
            <div className="general-settings-font-scale">
              <div className="general-settings-font-scale-labels">
                {FONT_SCALE_OPTIONS.map((scale) => (
                  <span key={scale}>{fontScaleLabel(scale)}</span>
                ))}
              </div>
              <input
                type="range"
                min={0}
                max={FONT_SCALE_OPTIONS.length - 1}
                step={1}
                value={fontScaleIndex}
                aria-label={GENERAL_SETTINGS_FONT_SCALE_LABEL}
                className="general-settings-font-scale-slider"
                onChange={(e) => {
                  const nextScale = FONT_SCALE_OPTIONS[Number(e.target.value)] ?? 'medium'
                  onChange({ uiFontScale: nextScale })
                }}
              />
              <div className="general-settings-font-scale-current">
                {formatGeneralSettingsFontScaleCurrent(fontScaleLabel(currentFontScale))}
              </div>
            </div>
          }
        />
        <SettingRow
          title={GENERAL_SETTINGS_WORKSPACE_ROOT_LABEL}
          description={GENERAL_SETTINGS_WORKSPACE_ROOT_DESC}
          control={
            <div className="general-settings-workspace">
              <div className="general-settings-workspace-row">
                <input
                  className="settings-text-input"
                  value={form.workspaceRoot}
                  onChange={(e) => onChange({ workspaceRoot: e.target.value })}
                  placeholder={GENERAL_SETTINGS_WORKSPACE_ROOT_PLACEHOLDER}
                />
                <button type="button" className="settings-action-button">
                  {GENERAL_SETTINGS_RESTORE_WORKSPACE_DEFAULT}
                </button>
                <button type="button" className="settings-action-button">
                  {GENERAL_SETTINGS_BROWSE_LABEL}
                </button>
              </div>
              {workspacePickerError ? (
                <p className="general-settings-workspace-error">{workspacePickerError}</p>
              ) : null}
            </div>
          }
        />
        <SettingRow
          title={GENERAL_SETTINGS_CURSOR_SPOTLIGHT_LABEL}
          description={GENERAL_SETTINGS_CURSOR_SPOTLIGHT_DESC}
          control={
            <Toggle
              checked={form.cursorSpotlight}
              onChange={(enabled) => onChange({ cursorSpotlight: enabled })}
            />
          }
        />
      </SettingsCard>

      <SettingsCard title={GENERAL_SETTINGS_DESKTOP_BEHAVIOR_TITLE} className="settings-card-spaced">
        <SettingRow
          title={GENERAL_SETTINGS_OPEN_AT_LOGIN_LABEL}
          description={
            openAtLoginSupported
              ? GENERAL_SETTINGS_OPEN_AT_LOGIN_DESC
              : GENERAL_SETTINGS_OPEN_AT_LOGIN_UNSUPPORTED_DESC
          }
          control={
            <Toggle
              checked={form.appBehavior.openAtLogin}
              disabled={!openAtLoginSupported}
              onChange={(enabled) =>
                updateBehavior({
                  openAtLogin: enabled,
                  startMinimized: enabled ? form.appBehavior.startMinimized : false,
                })
              }
            />
          }
        />
        <SettingRow
          title={GENERAL_SETTINGS_START_MINIMIZED_LABEL}
          description={
            form.appBehavior.openAtLogin && startMinimizedSupported
              ? GENERAL_SETTINGS_START_MINIMIZED_DESC
              : GENERAL_SETTINGS_START_MINIMIZED_DISABLED_DESC
          }
          control={
            <Toggle
              checked={form.appBehavior.startMinimized}
              disabled={!form.appBehavior.openAtLogin || !startMinimizedSupported}
              onChange={(enabled) => updateBehavior({ startMinimized: enabled })}
            />
          }
        />
        <SettingRow
          title={GENERAL_SETTINGS_CLOSE_ACTION_LABEL}
          description={GENERAL_SETTINGS_CLOSE_ACTION_DESC}
          control={
            <select
              className={SETTINGS_SELECT_CLASS}
              value={closeAction}
              onChange={(e) =>
                updateBehavior({ closeAction: e.target.value as CloseAction })
              }
            >
              {CLOSE_ACTION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {resolveGeneralSettingsCloseActionLabel(option)}
                </option>
              ))}
            </select>
          }
        />
        <SettingRow
          title={GENERAL_SETTINGS_TURN_COMPLETE_NOTIFICATION_LABEL}
          description={GENERAL_SETTINGS_TURN_COMPLETE_NOTIFICATION_DESC}
          control={
            <Toggle
              checked={form.notifications.turnComplete}
              onChange={(enabled) =>
                onChange({ notifications: { turnComplete: enabled } })
              }
            />
          }
        />
      </SettingsCard>

      <SettingsCard title={GENERAL_SETTINGS_ONBOARDING_PREVIEW_TITLE} className="settings-card-spaced">
        <SettingRow
          title={GENERAL_SETTINGS_ONBOARDING_PREVIEW_TITLE}
          description={GENERAL_SETTINGS_ONBOARDING_PREVIEW_DESC}
          control={
            <button type="button" className="settings-action-button is-inline">
              {GENERAL_SETTINGS_ONBOARDING_PREVIEW_OPEN}
            </button>
          }
        />
      </SettingsCard>

      <LegacySessionImportCard state={legacyImportState} />

      <SettingsCard title={GENERAL_SETTINGS_LOG_TITLE} className="settings-card-spaced">
        <SettingRow
          title={GENERAL_SETTINGS_LOG_ENABLED_LABEL}
          description={GENERAL_SETTINGS_LOG_ENABLED_DESC}
          control={
            <Toggle
              checked={form.log.enabled}
              onChange={(enabled) => updateLog({ enabled })}
            />
          }
        />
        <SettingRow
          title={GENERAL_SETTINGS_LOG_RETENTION_LABEL}
          description={GENERAL_SETTINGS_LOG_RETENTION_DESC}
          control={
            <select
              className={SETTINGS_SELECT_CLASS}
              value={form.log.retentionDays}
              onChange={(e) => updateLog({ retentionDays: Number(e.target.value) })}
            >
              <option value={1}>{GENERAL_SETTINGS_LOG_RETENTION_ONE}</option>
              <option value={2}>{GENERAL_SETTINGS_LOG_RETENTION_TWO}</option>
              <option value={3}>{GENERAL_SETTINGS_LOG_RETENTION_THREE}</option>
              <option value={5}>{GENERAL_SETTINGS_LOG_RETENTION_FIVE}</option>
              <option value={7}>{GENERAL_SETTINGS_LOG_RETENTION_SEVEN}</option>
            </select>
          }
        />
        <SettingRow
          title={GENERAL_SETTINGS_LOG_DIR_LABEL}
          description={GENERAL_SETTINGS_LOG_DIR_DESC}
          wideControl
          control={
            <div className="general-settings-log-control">
              {logPath ? (
                <code className="general-settings-log-path">{logPath}</code>
              ) : (
                <span className="general-settings-log-empty">…</span>
              )}
              <button type="button" className="settings-action-button is-compact">
                <FolderOpen className="settings-action-button-icon" strokeWidth={1.75} />
                {GENERAL_SETTINGS_LOG_DIR_OPEN}
              </button>
              {logDirOpenError ? (
                <p className="general-settings-log-error">{logDirOpenError}</p>
              ) : null}
            </div>
          }
        />
      </SettingsCard>
    </>
  )
}

export type GeneralSettingsPreviewMode =
  | 'default'
  | 'workspaceError'
  | 'legacyScanning'
  | 'legacyFound'
  | 'legacyEmpty'
  | 'legacySuccess'
  | 'legacyError'
  | 'logError'
  | 'unsupportedPlatform'

export function GeneralSettingsSectionPreview({
  mode = 'default',
}: {
  mode?: GeneralSettingsPreviewMode
}): ReactElement {
  const [form, setForm] = useState(GENERAL_SETTINGS_PREVIEW_FORM)

  const patchForm = (patch: Partial<GeneralSettingsForm>) => {
    setForm((current) => ({
      ...current,
      ...patch,
      appBehavior: patch.appBehavior
        ? { ...current.appBehavior, ...patch.appBehavior }
        : current.appBehavior,
      notifications: patch.notifications
        ? { ...current.notifications, ...patch.notifications }
        : current.notifications,
      log: patch.log ? { ...current.log, ...patch.log } : current.log,
    }))
  }

  const legacyImportState: LegacyImportPreviewState =
    mode === 'legacyScanning'
      ? 'scanning'
      : mode === 'legacyEmpty'
        ? 'none'
        : mode === 'legacySuccess'
          ? 'success'
          : mode === 'legacyError'
            ? 'error'
            : 'found'

  return (
    <GeneralSettingsSection
      form={form}
      onChange={patchForm}
      workspacePickerError={
        mode === 'workspaceError' ? 'Could not access the selected folder.' : null
      }
      logPath={mode === 'default' || mode === 'logError' ? '/Users/season/Library/Logs/Navi' : ''}
      logDirOpenError={mode === 'logError' ? 'Failed to open log directory.' : null}
      legacyImportState={legacyImportState}
      openAtLoginSupported={mode !== 'unsupportedPlatform'}
      startMinimizedSupported={mode !== 'unsupportedPlatform'}
    />
  )
}
