// Claw settings section echoing Kun's settings-section-claw.tsx
// (../Kun/src/renderer/src/components/settings-section-claw.tsx).
// Visual only: mock form state and preview modes.

import { useState, type ReactElement } from 'react'
import {
  CLAW_SETTINGS_DEFAULT_WORKSPACE_DESC,
  CLAW_SETTINGS_DEFAULT_WORKSPACE_LABEL,
  CLAW_SETTINGS_DEFAULT_WORKSPACE_RESET_LABEL,
  CLAW_SETTINGS_ENABLED_DESC,
  CLAW_SETTINGS_ENABLED_LABEL,
  CLAW_SETTINGS_FEISHU_STREAM_DESC,
  CLAW_SETTINGS_FEISHU_STREAM_LABEL,
  CLAW_SETTINGS_MANAGE_AGENT_DESCRIPTION_LABEL,
  CLAW_SETTINGS_MANAGE_AGENT_DESCRIPTION_PLACEHOLDER,
  CLAW_SETTINGS_MANAGE_AGENT_DISABLED_LABEL,
  CLAW_SETTINGS_MANAGE_AGENT_ENABLED_LABEL,
  CLAW_SETTINGS_MANAGE_AGENT_IDENTITY_LABEL,
  CLAW_SETTINGS_MANAGE_AGENT_IDENTITY_PLACEHOLDER,
  CLAW_SETTINGS_MANAGE_AGENT_NAME_LABEL,
  CLAW_SETTINGS_MANAGE_AGENT_NAME_PLACEHOLDER,
  CLAW_SETTINGS_MANAGE_AGENT_PERSONALITY_LABEL,
  CLAW_SETTINGS_MANAGE_AGENT_PERSONALITY_PLACEHOLDER,
  CLAW_SETTINGS_MANAGE_AGENT_REPLY_RULES_LABEL,
  CLAW_SETTINGS_MANAGE_AGENT_REPLY_RULES_PLACEHOLDER,
  CLAW_SETTINGS_MANAGE_AGENT_USER_CONTEXT_LABEL,
  CLAW_SETTINGS_MANAGE_AGENT_USER_CONTEXT_PLACEHOLDER,
  CLAW_SETTINGS_MANAGE_AGENTS_EMPTY,
  CLAW_SETTINGS_MANAGE_AGENTS_TITLE,
  CLAW_SETTINGS_MODEL_LABEL,
  CLAW_SETTINGS_RUNTIME_TITLE,
  CLAW_SETTINGS_WORKSPACE_OVERRIDE_LABEL,
  formatClawSettingsDefaultWorkspacePlaceholder,
  formatClawSettingsManageAgentMeta,
  formatClawSettingsWorkspaceInherit,
} from '../../lib/clawSettingsSection'
import { GENERAL_SETTINGS_BROWSE_LABEL } from '../../lib/generalSettingsSection'
import {
  SETTINGS_SELECT_CLASS,
  SettingRow,
  SettingsCard,
  Toggle,
} from './SettingsControls'

export const DEFAULT_CLAW_MODEL = 'auto'

export type ClawImAgentProfileSnapshot = {
  name: string
  description: string
  identity: string
  personality: string
  userContext: string
  replyRules: string
}

export type ClawImChannelSnapshot = {
  id: string
  provider: 'feishu' | 'weixin'
  label: string
  enabled: boolean
  model: string
  workspaceRoot: string
  feishuStream?: boolean
  agentProfile: ClawImAgentProfileSnapshot
}

export type ClawSettingsSnapshot = {
  enabled: boolean
  workspaceRoot: string
  defaultWorkspaceRoot: string
  channels: ClawImChannelSnapshot[]
}

const CLAW_MODEL_OPTIONS = ['auto', 'deepseek-v4-pro', 'deepseek-v4-flash'] as const

type AgentProfileField = keyof ClawImAgentProfileSnapshot

const PROFILE_FIELDS: Array<{
  key: AgentProfileField
  label: string
  placeholder: string
  rows: number
}> = [
  {
    key: 'description',
    label: CLAW_SETTINGS_MANAGE_AGENT_DESCRIPTION_LABEL,
    placeholder: CLAW_SETTINGS_MANAGE_AGENT_DESCRIPTION_PLACEHOLDER,
    rows: 2,
  },
  {
    key: 'identity',
    label: CLAW_SETTINGS_MANAGE_AGENT_IDENTITY_LABEL,
    placeholder: CLAW_SETTINGS_MANAGE_AGENT_IDENTITY_PLACEHOLDER,
    rows: 4,
  },
  {
    key: 'personality',
    label: CLAW_SETTINGS_MANAGE_AGENT_PERSONALITY_LABEL,
    placeholder: CLAW_SETTINGS_MANAGE_AGENT_PERSONALITY_PLACEHOLDER,
    rows: 3,
  },
  {
    key: 'userContext',
    label: CLAW_SETTINGS_MANAGE_AGENT_USER_CONTEXT_LABEL,
    placeholder: CLAW_SETTINGS_MANAGE_AGENT_USER_CONTEXT_PLACEHOLDER,
    rows: 3,
  },
  {
    key: 'replyRules',
    label: CLAW_SETTINGS_MANAGE_AGENT_REPLY_RULES_LABEL,
    placeholder: CLAW_SETTINGS_MANAGE_AGENT_REPLY_RULES_PLACEHOLDER,
    rows: 4,
  },
]

export const CLAW_SETTINGS_PREVIEW_DEFAULT: ClawSettingsSnapshot = {
  enabled: true,
  workspaceRoot: '',
  defaultWorkspaceRoot: '/Users/season/Personal/navi',
  channels: [
    {
      id: 'feishu-team-chat',
      provider: 'feishu',
      label: 'Team chat',
      enabled: true,
      model: 'deepseek-v4-pro',
      workspaceRoot: '',
      feishuStream: true,
      agentProfile: {
        name: 'Navi assistant',
        description: 'Handles project questions in the team chat',
        identity:
          'You are a helpful engineering assistant embedded in the team Feishu channel.',
        personality: 'Concise, friendly, and proactive about asking clarifying questions.',
        userContext: 'Season builds personal Electron apps and prefers direct, practical answers.',
        replyRules: 'Keep replies under 6 sentences unless asked for detail. Confirm risky actions.',
      },
    },
  ],
}

export const CLAW_SETTINGS_PREVIEW_EMPTY: ClawSettingsSnapshot = {
  ...CLAW_SETTINGS_PREVIEW_DEFAULT,
  channels: [],
}

export const CLAW_SETTINGS_PREVIEW_MULTI: ClawSettingsSnapshot = {
  ...CLAW_SETTINGS_PREVIEW_DEFAULT,
  channels: [
    CLAW_SETTINGS_PREVIEW_DEFAULT.channels[0],
    {
      id: 'feishu-dm',
      provider: 'feishu',
      label: 'Direct messages',
      enabled: false,
      model: 'auto',
      workspaceRoot: '/Users/season/Personal/Kun',
      feishuStream: false,
      agentProfile: {
        name: 'DM helper',
        description: 'Private follow-ups and quick status checks',
        identity: 'You are a lightweight assistant for one-on-one Feishu messages.',
        personality: 'Brief and informal.',
        userContext: '',
        replyRules: 'Prefer bullet lists for status updates.',
      },
    },
  ],
}

function channelEffectiveWorkspace(settings: ClawSettingsSnapshot, channel: ClawImChannelSnapshot): string {
  return channel.workspaceRoot.trim() || settings.workspaceRoot.trim() || settings.defaultWorkspaceRoot
}

function mergeClawModelOptions(currentModel: string): string[] {
  const options = new Set<string>([DEFAULT_CLAW_MODEL])
  for (const modelId of CLAW_MODEL_OPTIONS) {
    if (modelId !== DEFAULT_CLAW_MODEL) options.add(modelId)
  }
  const current = currentModel.trim()
  if (current && current !== DEFAULT_CLAW_MODEL) options.add(current)
  return [...options]
}

type Props = {
  settings: ClawSettingsSnapshot
  workspacePickerError?: string | null
  onSettingsChange?: (next: ClawSettingsSnapshot) => void
}

export function ClawSettingsSection({
  settings,
  workspacePickerError = null,
  onSettingsChange,
}: Props): ReactElement {
  const updateSettings = (patch: Partial<ClawSettingsSnapshot>): void => {
    onSettingsChange?.({ ...settings, ...patch })
  }

  const updateChannel = (channelId: string, patch: Partial<ClawImChannelSnapshot>): void => {
    updateSettings({
      channels: settings.channels.map((channel) =>
        channel.id === channelId ? { ...channel, ...patch } : channel,
      ),
    })
  }

  const updateChannelProfile = (
    channel: ClawImChannelSnapshot,
    patch: Partial<ClawImAgentProfileSnapshot>,
  ): void => {
    const nextProfile = { ...channel.agentProfile, ...patch }
    updateChannel(channel.id, {
      label: nextProfile.name.trim() || channel.label,
      agentProfile: nextProfile,
    })
  }

  return (
    <>
      <SettingsCard title={CLAW_SETTINGS_RUNTIME_TITLE}>
        <SettingRow
          title={CLAW_SETTINGS_ENABLED_LABEL}
          description={CLAW_SETTINGS_ENABLED_DESC}
          control={
            <Toggle
              checked={settings.enabled}
              onChange={(value) => updateSettings({ enabled: value })}
            />
          }
        />
        <SettingRow
          title={CLAW_SETTINGS_DEFAULT_WORKSPACE_LABEL}
          description={CLAW_SETTINGS_DEFAULT_WORKSPACE_DESC}
          control={
            <div className="claw-settings-workspace">
              <div className="claw-settings-workspace-row">
                <input
                  className="settings-text-input"
                  value={settings.workspaceRoot}
                  onChange={(e) => updateSettings({ workspaceRoot: e.target.value })}
                  placeholder={formatClawSettingsDefaultWorkspacePlaceholder(
                    settings.defaultWorkspaceRoot,
                  )}
                />
                <button
                  type="button"
                  className="settings-action-button"
                  onClick={() => updateSettings({ workspaceRoot: '' })}
                >
                  {CLAW_SETTINGS_DEFAULT_WORKSPACE_RESET_LABEL}
                </button>
                <button type="button" className="settings-action-button">
                  {GENERAL_SETTINGS_BROWSE_LABEL}
                </button>
              </div>
              {workspacePickerError ? (
                <p className="claw-settings-workspace-error">{workspacePickerError}</p>
              ) : null}
            </div>
          }
        />
      </SettingsCard>

      <SettingsCard title={CLAW_SETTINGS_MANAGE_AGENTS_TITLE} className="settings-card-spaced">
        {settings.channels.length === 0 ? (
          <div className="claw-settings-agents-empty">{CLAW_SETTINGS_MANAGE_AGENTS_EMPTY}</div>
        ) : (
          settings.channels.map((channel) => {
            const name = channel.agentProfile.name.trim() || channel.label
            const workspace = channelEffectiveWorkspace(settings, channel)
            return (
              <div key={channel.id} className="claw-settings-agent">
                <div className="claw-settings-agent-header">
                  <div className="claw-settings-agent-header-copy">
                    <div className="claw-settings-agent-name">{name}</div>
                    <div className="claw-settings-agent-meta">
                      {formatClawSettingsManageAgentMeta('Feishu / Lark', channel.model, workspace)}
                    </div>
                  </div>
                  <div className="claw-settings-agent-toggle">
                    <span className="claw-settings-agent-toggle-label">
                      {channel.enabled
                        ? CLAW_SETTINGS_MANAGE_AGENT_ENABLED_LABEL
                        : CLAW_SETTINGS_MANAGE_AGENT_DISABLED_LABEL}
                    </span>
                    <Toggle
                      checked={channel.enabled}
                      onChange={(value) => updateChannel(channel.id, { enabled: value })}
                    />
                  </div>
                </div>

                {channel.provider === 'feishu' ? (
                  <SettingRow
                    title={CLAW_SETTINGS_FEISHU_STREAM_LABEL}
                    description={CLAW_SETTINGS_FEISHU_STREAM_DESC}
                    control={
                      <div className="claw-settings-agent-toggle">
                        <span className="claw-settings-agent-toggle-label">
                          {channel.feishuStream
                            ? CLAW_SETTINGS_MANAGE_AGENT_ENABLED_LABEL
                            : CLAW_SETTINGS_MANAGE_AGENT_DISABLED_LABEL}
                        </span>
                        <Toggle
                          checked={channel.feishuStream === true}
                          onChange={(value) => updateChannel(channel.id, { feishuStream: value })}
                        />
                      </div>
                    }
                  />
                ) : null}

                <div className="claw-settings-agent-grid">
                  <label className="claw-settings-field">
                    <span className="claw-settings-field-label">
                      {CLAW_SETTINGS_MANAGE_AGENT_NAME_LABEL}
                    </span>
                    <input
                      className="settings-text-input"
                      value={channel.agentProfile.name}
                      onChange={(e) => updateChannelProfile(channel, { name: e.target.value })}
                      placeholder={CLAW_SETTINGS_MANAGE_AGENT_NAME_PLACEHOLDER}
                    />
                  </label>
                  <label className="claw-settings-field">
                    <span className="claw-settings-field-label">{CLAW_SETTINGS_MODEL_LABEL}</span>
                    <select
                      className={SETTINGS_SELECT_CLASS}
                      value={channel.model}
                      onChange={(e) => updateChannel(channel.id, { model: e.target.value })}
                    >
                      {mergeClawModelOptions(channel.model).map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="claw-settings-field is-wide">
                    <span className="claw-settings-field-label">
                      {CLAW_SETTINGS_WORKSPACE_OVERRIDE_LABEL}
                    </span>
                    <input
                      className="settings-text-input"
                      value={channel.workspaceRoot}
                      onChange={(e) => updateChannel(channel.id, { workspaceRoot: e.target.value })}
                      placeholder={formatClawSettingsWorkspaceInherit(
                        settings.workspaceRoot.trim() || settings.defaultWorkspaceRoot,
                      )}
                    />
                  </label>
                </div>

                <div className="claw-settings-profile-fields">
                  {PROFILE_FIELDS.map((field) => (
                    <label key={field.key} className="claw-settings-field">
                      <span className="claw-settings-field-label">{field.label}</span>
                      <textarea
                        className="claw-settings-textarea"
                        rows={field.rows}
                        value={channel.agentProfile[field.key]}
                        onChange={(e) =>
                          updateChannelProfile(channel, { [field.key]: e.target.value })
                        }
                        placeholder={field.placeholder}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </SettingsCard>
    </>
  )
}

export type ClawPreviewMode = 'default' | 'empty' | 'disabled' | 'workspaceError' | 'multi'

export function ClawSettingsSectionPreview({
  mode = 'default',
}: {
  mode?: ClawPreviewMode
}): ReactElement {
  const initialSettings =
    mode === 'empty'
      ? CLAW_SETTINGS_PREVIEW_EMPTY
      : mode === 'multi'
        ? CLAW_SETTINGS_PREVIEW_MULTI
        : CLAW_SETTINGS_PREVIEW_DEFAULT

  const [settings, setSettings] = useState<ClawSettingsSnapshot>(() =>
    mode === 'disabled' ? { ...initialSettings, enabled: false } : initialSettings,
  )

  return (
    <ClawSettingsSection
      settings={settings}
      workspacePickerError={
        mode === 'workspaceError' ? 'Could not open workspace picker: permission denied.' : null
      }
      onSettingsChange={setSettings}
    />
  )
}
