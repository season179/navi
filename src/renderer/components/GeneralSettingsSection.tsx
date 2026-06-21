// General settings section echoing Kun's settings-section-general.tsx
// (../Kun/src/renderer/src/components/settings-section-general.tsx).
// Visual only: mock form state and preview modes.

import { useState, type ReactElement } from 'react'
import { ArchiveRestore, FolderOpen, Loader2 } from 'lucide-react'
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

const COPY = {
  sectionGeneral: 'General',
  language: 'Language',
  languageDesc: 'Interface language for menus and labels.',
  theme: 'Theme',
  themeDesc: 'Choose light, dark, or match your system.',
  themeSystem: 'System',
  themeLight: 'Light',
  themeDark: 'Dark',
  fontScale: 'Font size',
  fontScaleDesc: 'Adjust interface text size.',
  fontScaleSmall: 'Small',
  fontScaleMedium: 'Medium',
  fontScaleLarge: 'Large',
  fontScaleCurrent: (value: string) => `Current: ${value}`,
  workspaceRoot: 'Workspace folder',
  workspaceRootDesc: 'Default folder for new coding sessions.',
  workspaceRootPlaceholder: '/path/to/workspace',
  restoreWorkspaceDefault: 'Reset',
  browse: 'Browse',
  cursorSpotlight: 'Cursor spotlight',
  cursorSpotlightDesc: 'Highlight the pointer with a soft glow.',
  desktopBehavior: 'Desktop behavior',
  desktopOpenAtLogin: 'Open at login',
  desktopOpenAtLoginDesc: 'Launch Navi when you sign in.',
  desktopOpenAtLoginUnsupportedDesc: 'Not supported on this platform.',
  desktopStartMinimized: 'Start minimized',
  desktopStartMinimizedDesc: 'Open to the tray when launching at login.',
  desktopStartMinimizedDisabledDesc: 'Enable open at login first.',
  desktopCloseAction: 'When closing the window',
  desktopCloseActionDesc: 'Choose quit, minimize to tray, or ask each time.',
  desktopCloseAction_ask: 'Ask every time',
  desktopCloseAction_tray: 'Minimize to tray',
  desktopCloseAction_quit: 'Quit',
  turnCompleteNotification: 'Turn complete notification',
  turnCompleteNotificationDesc: 'Show a notification when the agent finishes.',
  onboardingPreview: 'Onboarding preview',
  onboardingPreviewDesc: 'Open the first-run setup flow for visual review.',
  onboardingPreviewOpen: 'Open onboarding',
  logTitle: 'Logs',
  logEnabled: 'Enable logging',
  logEnabledDesc: 'Write diagnostic logs to disk.',
  logRetention: 'Log retention',
  logRetentionDesc: 'How long to keep log files.',
  logRetentionOne: '1 day',
  logRetentionTwo: '2 days',
  logRetentionThree: '3 days',
  logRetentionFive: '5 days',
  logRetentionSeven: '7 days',
  logDir: 'Log directory',
  logDirDesc: 'Folder where log files are stored.',
  logDirOpen: 'Open folder',
  legacyImportTitle: 'Import legacy sessions',
  legacyImportDesc: 'Import conversation history from a previous Kun install.',
  legacyImportScanning: 'Scanning for legacy sessions…',
  legacyImportFound: (count: number) => `${count} new session${count === 1 ? '' : 's'} ready to import`,
  legacyImportAllPresent: 'All found sessions are already imported',
  legacyImportNoneFound: 'No legacy sessions found',
  legacyImportSourceCount: (newCount: number, total: number) =>
    `${newCount} new / ${total} total`,
  legacyImportButton: 'Import detected',
  legacyImportPick: 'Choose folder',
  legacyImportRestarting: 'Restarting…',
}

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
  if (scale === 'large') return COPY.fontScaleLarge
  if (scale === 'medium') return COPY.fontScaleMedium
  return COPY.fontScaleSmall
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
    ? COPY.legacyImportScanning
    : totalNew > 0
      ? COPY.legacyImportFound(totalNew)
      : totalFound > 0
        ? COPY.legacyImportAllPresent
        : COPY.legacyImportNoneFound

  const notice: InlineNotice | null =
    state === 'success'
      ? { tone: 'success', message: 'Imported 4 sessions, skipped 0 duplicates.' }
      : state === 'error'
        ? { tone: 'error', message: 'Could not read legacy session directory.' }
        : null

  return (
    <SettingsCard title={COPY.legacyImportTitle} className="settings-card-spaced">
      <SettingRow
        title={COPY.legacyImportTitle}
        description={COPY.legacyImportDesc}
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
                      {COPY.legacyImportSourceCount(source.newCount, source.threadCount)}
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
                {COPY.legacyImportButton}
              </button>
              <button type="button" className="settings-action-button" disabled={detecting}>
                <FolderOpen className="settings-action-button-icon" strokeWidth={1.75} />
                {COPY.legacyImportPick}
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
      <SettingsCard title={COPY.sectionGeneral}>
        <SettingRow
          title={COPY.language}
          description={COPY.languageDesc}
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
          title={COPY.theme}
          description={COPY.themeDesc}
          control={
            <select
              className={SETTINGS_SELECT_CLASS}
              value={form.theme}
              onChange={(e) => onChange({ theme: e.target.value as ThemePref })}
            >
              <option value="system">{COPY.themeSystem}</option>
              <option value="light">{COPY.themeLight}</option>
              <option value="dark">{COPY.themeDark}</option>
            </select>
          }
        />
        <SettingRow
          title={COPY.fontScale}
          description={COPY.fontScaleDesc}
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
                aria-label={COPY.fontScale}
                className="general-settings-font-scale-slider"
                onChange={(e) => {
                  const nextScale = FONT_SCALE_OPTIONS[Number(e.target.value)] ?? 'medium'
                  onChange({ uiFontScale: nextScale })
                }}
              />
              <div className="general-settings-font-scale-current">
                {COPY.fontScaleCurrent(fontScaleLabel(currentFontScale))}
              </div>
            </div>
          }
        />
        <SettingRow
          title={COPY.workspaceRoot}
          description={COPY.workspaceRootDesc}
          control={
            <div className="general-settings-workspace">
              <div className="general-settings-workspace-row">
                <input
                  className="settings-text-input"
                  value={form.workspaceRoot}
                  onChange={(e) => onChange({ workspaceRoot: e.target.value })}
                  placeholder={COPY.workspaceRootPlaceholder}
                />
                <button type="button" className="settings-action-button">
                  {COPY.restoreWorkspaceDefault}
                </button>
                <button type="button" className="settings-action-button">
                  {COPY.browse}
                </button>
              </div>
              {workspacePickerError ? (
                <p className="general-settings-workspace-error">{workspacePickerError}</p>
              ) : null}
            </div>
          }
        />
        <SettingRow
          title={COPY.cursorSpotlight}
          description={COPY.cursorSpotlightDesc}
          control={
            <Toggle
              checked={form.cursorSpotlight}
              onChange={(enabled) => onChange({ cursorSpotlight: enabled })}
            />
          }
        />
      </SettingsCard>

      <SettingsCard title={COPY.desktopBehavior} className="settings-card-spaced">
        <SettingRow
          title={COPY.desktopOpenAtLogin}
          description={
            openAtLoginSupported
              ? COPY.desktopOpenAtLoginDesc
              : COPY.desktopOpenAtLoginUnsupportedDesc
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
          title={COPY.desktopStartMinimized}
          description={
            form.appBehavior.openAtLogin && startMinimizedSupported
              ? COPY.desktopStartMinimizedDesc
              : COPY.desktopStartMinimizedDisabledDesc
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
          title={COPY.desktopCloseAction}
          description={COPY.desktopCloseActionDesc}
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
                  {COPY[`desktopCloseAction_${option}`]}
                </option>
              ))}
            </select>
          }
        />
        <SettingRow
          title={COPY.turnCompleteNotification}
          description={COPY.turnCompleteNotificationDesc}
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

      <SettingsCard title={COPY.onboardingPreview} className="settings-card-spaced">
        <SettingRow
          title={COPY.onboardingPreview}
          description={COPY.onboardingPreviewDesc}
          control={
            <button type="button" className="settings-action-button is-inline">
              {COPY.onboardingPreviewOpen}
            </button>
          }
        />
      </SettingsCard>

      <LegacySessionImportCard state={legacyImportState} />

      <SettingsCard title={COPY.logTitle} className="settings-card-spaced">
        <SettingRow
          title={COPY.logEnabled}
          description={COPY.logEnabledDesc}
          control={
            <Toggle
              checked={form.log.enabled}
              onChange={(enabled) => updateLog({ enabled })}
            />
          }
        />
        <SettingRow
          title={COPY.logRetention}
          description={COPY.logRetentionDesc}
          control={
            <select
              className={SETTINGS_SELECT_CLASS}
              value={form.log.retentionDays}
              onChange={(e) => updateLog({ retentionDays: Number(e.target.value) })}
            >
              <option value={1}>{COPY.logRetentionOne}</option>
              <option value={2}>{COPY.logRetentionTwo}</option>
              <option value={3}>{COPY.logRetentionThree}</option>
              <option value={5}>{COPY.logRetentionFive}</option>
              <option value={7}>{COPY.logRetentionSeven}</option>
            </select>
          }
        />
        <SettingRow
          title={COPY.logDir}
          description={COPY.logDirDesc}
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
                {COPY.logDirOpen}
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
