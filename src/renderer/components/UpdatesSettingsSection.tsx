// Updates settings section echoing Kun's settings-section-updates.tsx
// (../Kun/src/renderer/src/components/settings-section-updates.tsx).
// Visual only: mock channel form state and GuiUpdateControl preview snapshots.

import { useState, type ReactElement } from 'react'
import {
  GuiUpdateControl,
  GUI_UPDATE_CONTROL_PREVIEW,
  type GuiUpdateControlPreviewMode,
  type GuiUpdateInfo,
  type GuiUpdateProgress,
} from './GuiUpdateControl'
import {
  UPDATES_SETTINGS_CHANNEL_DESC,
  UPDATES_SETTINGS_CHANNEL_FRONTIER,
  UPDATES_SETTINGS_CHANNEL_LABEL,
  UPDATES_SETTINGS_CHANNEL_STABLE,
  UPDATES_SETTINGS_GUI_UPDATE_DESC,
  UPDATES_SETTINGS_GUI_UPDATE_LABEL,
  UPDATES_SETTINGS_SECTION_TITLE,
} from '../lib/updatesSettingsSection'
import { SETTINGS_SELECT_CLASS, SettingRow, SettingsCard } from './SettingsControls'

export type GuiUpdateChannel = 'frontier' | 'stable'

export type UpdatesSettingsForm = {
  guiUpdate: {
    channel: GuiUpdateChannel
  }
}

export const UPDATES_SETTINGS_PREVIEW_FORM: UpdatesSettingsForm = {
  guiUpdate: {
    channel: 'stable',
  },
}

type GuiUpdateControlProps = {
  info: GuiUpdateInfo | null
  checking: boolean
  downloading: boolean
  installing: boolean
  downloaded: boolean
  progress: GuiUpdateProgress | null
  error: string | null
  onCheck: () => Promise<void>
  onDownload: () => Promise<void>
  onInstall: () => Promise<void>
}

type Props = {
  form: UpdatesSettingsForm
  onFormChange?: (next: UpdatesSettingsForm) => void
} & GuiUpdateControlProps

export function UpdatesSettingsSection({
  form,
  onFormChange,
  info,
  checking,
  downloading,
  installing,
  downloaded,
  progress,
  error,
  onCheck,
  onDownload,
  onInstall,
}: Props): ReactElement {
  return (
    <SettingsCard title={UPDATES_SETTINGS_SECTION_TITLE}>
      <SettingRow
        title={UPDATES_SETTINGS_CHANNEL_LABEL}
        description={UPDATES_SETTINGS_CHANNEL_DESC}
        control={
          <select
            className={SETTINGS_SELECT_CLASS}
            value={form.guiUpdate.channel}
            onChange={(event) =>
              onFormChange?.({
                ...form,
                guiUpdate: { channel: event.target.value as GuiUpdateChannel },
              })
            }
          >
            <option value="frontier">{UPDATES_SETTINGS_CHANNEL_FRONTIER}</option>
            <option value="stable">{UPDATES_SETTINGS_CHANNEL_STABLE}</option>
          </select>
        }
      />
      <SettingRow
        title={UPDATES_SETTINGS_GUI_UPDATE_LABEL}
        description={UPDATES_SETTINGS_GUI_UPDATE_DESC}
        control={
          <GuiUpdateControl
            info={info}
            checking={checking}
            downloading={downloading}
            installing={installing}
            downloaded={downloaded}
            progress={progress}
            error={error}
            onCheck={onCheck}
            onDownload={onDownload}
            onInstall={onInstall}
          />
        }
      />
    </SettingsCard>
  )
}

export type UpdatesSettingsPreviewMode = GuiUpdateControlPreviewMode | 'default' | 'frontier'

const NOOP = async (): Promise<void> => undefined

export function UpdatesSettingsSectionPreview({
  mode = 'default',
}: {
  mode?: UpdatesSettingsPreviewMode
}): ReactElement {
  const [form, setForm] = useState<UpdatesSettingsForm>(
    mode === 'frontier'
      ? { guiUpdate: { channel: 'frontier' } }
      : UPDATES_SETTINGS_PREVIEW_FORM,
  )
  const controlMode: GuiUpdateControlPreviewMode =
    mode === 'default' || mode === 'frontier' ? 'available' : mode
  const controlProps = GUI_UPDATE_CONTROL_PREVIEW[controlMode]

  return (
    <UpdatesSettingsSection
      form={form}
      onFormChange={setForm}
      {...controlProps}
      onCheck={NOOP}
      onDownload={NOOP}
      onInstall={NOOP}
    />
  )
}
