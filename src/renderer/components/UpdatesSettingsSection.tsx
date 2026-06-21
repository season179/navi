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

const COPY = {
  sectionUpdates: 'Version & updates',
  guiUpdateChannel: 'Update channel',
  guiUpdateChannelDesc:
    'Stable is the default; Frontier is only used after you switch to it. Stable only receives formal stable releases.',
  guiUpdateChannelFrontier: 'Frontier',
  guiUpdateChannelStable: 'Stable',
  guiUpdate: 'GUI updates',
  guiUpdateDesc:
    'Check the selected release channel for GUI updates, then download and install in the app.',
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
    <SettingsCard title={COPY.sectionUpdates}>
      <SettingRow
        title={COPY.guiUpdateChannel}
        description={COPY.guiUpdateChannelDesc}
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
            <option value="frontier">{COPY.guiUpdateChannelFrontier}</option>
            <option value="stable">{COPY.guiUpdateChannelStable}</option>
          </select>
        }
      />
      <SettingRow
        title={COPY.guiUpdate}
        description={COPY.guiUpdateDesc}
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
