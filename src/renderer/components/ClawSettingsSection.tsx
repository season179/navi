// Claw settings section echoing Kun's settings-section-claw.tsx
// (../Kun/src/renderer/src/components/settings-section-claw.tsx).
// Visual only: mock form state and preview modes.

import { useState, type ReactElement } from 'react'
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
    label: 'Short description',
    placeholder: 'Example: Handles project questions in the team chat',
    rows: 2,
  },
  {
    key: 'identity',
    label: 'Role definition',
    placeholder: 'Define who this agent is, its role, scope, and boundaries.',
    rows: 4,
  },
  {
    key: 'personality',
    label: 'Personality',
    placeholder: 'Define tone, style, patience, and when it should ask follow-up questions.',
    rows: 3,
  },
  {
    key: 'userContext',
    label: 'User context',
    placeholder: 'Long-lived user, team, or workflow context this phone agent should remember.',
    rows: 3,
  },
  {
    key: 'replyRules',
    label: 'Reply rules',
    placeholder: 'Define reply format, length, risk checks, or confirmation rules.',
    rows: 4,
  },
]

const COPY = {
  clawRuntime: 'Phone connection',
  clawEnabled: 'Enable phone connection',
  clawEnabledDesc:
    'When enabled, the Feishu / Lark phone bridge and local IM webhook can run in the background. Turning it off does not affect normal GUI chats.',
  clawDefaultWorkspace: 'Default phone workspace',
  clawDefaultWorkspaceDesc:
    'Leave this empty to use the GUI default working directory. Individual phone connections can still override it.',
  clawDefaultWorkspacePlaceholder: (path: string) => `Leave empty to inherit: ${path}`,
  clawDefaultWorkspaceReset: 'Use GUI default',
  browse: 'Browse',
  clawManageAgents: 'Connected phone agents',
  clawManageAgentsEmpty:
    'No phone agent has been connected yet. Use Connect phone to bind Feishu / Lark first.',
  clawManageAgentMeta: (provider: string, model: string, workspace: string) =>
    `${provider} · ${model} · ${workspace}`,
  clawManageAgentEnabled: 'Enabled',
  clawManageAgentDisabled: 'Disabled',
  clawFeishuStream: 'Enable streaming output',
  clawFeishuStreamDesc:
    'Stream the reply character-by-character in a live SDK card, instead of sending a one-shot message after the run completes.',
  clawManageAgentName: 'Agent name',
  clawManageAgentNamePlaceholder: 'Name shown in the IM sidebar',
  clawModel: 'Model',
  clawWorkspaceOverride: 'Workspace override',
  clawWorkspaceInherit: (path: string) => `Use default workspace: ${path}`,
  clawManageAgentDescription: 'Short description',
  clawManageAgentDescriptionPlaceholder: 'Example: Handles project questions in the team chat',
  clawManageAgentIdentity: 'Role definition',
  clawManageAgentIdentityPlaceholder:
    'Define who this agent is, its role, scope, and boundaries.',
  clawManageAgentPersonality: 'Personality',
  clawManageAgentPersonalityPlaceholder:
    'Define tone, style, patience, and when it should ask follow-up questions.',
  clawManageAgentUserContext: 'User context',
  clawManageAgentUserContextPlaceholder:
    'Long-lived user, team, or workflow context this phone agent should remember.',
  clawManageAgentReplyRules: 'Reply rules',
  clawManageAgentReplyRulesPlaceholder:
    'Define reply format, length, risk checks, or confirmation rules.',
}

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
      <SettingsCard title={COPY.clawRuntime}>
        <SettingRow
          title={COPY.clawEnabled}
          description={COPY.clawEnabledDesc}
          control={
            <Toggle
              checked={settings.enabled}
              onChange={(value) => updateSettings({ enabled: value })}
            />
          }
        />
        <SettingRow
          title={COPY.clawDefaultWorkspace}
          description={COPY.clawDefaultWorkspaceDesc}
          control={
            <div className="claw-settings-workspace">
              <div className="claw-settings-workspace-row">
                <input
                  className="settings-text-input"
                  value={settings.workspaceRoot}
                  onChange={(e) => updateSettings({ workspaceRoot: e.target.value })}
                  placeholder={COPY.clawDefaultWorkspacePlaceholder(settings.defaultWorkspaceRoot)}
                />
                <button
                  type="button"
                  className="settings-action-button"
                  onClick={() => updateSettings({ workspaceRoot: '' })}
                >
                  {COPY.clawDefaultWorkspaceReset}
                </button>
                <button type="button" className="settings-action-button">
                  {COPY.browse}
                </button>
              </div>
              {workspacePickerError ? (
                <p className="claw-settings-workspace-error">{workspacePickerError}</p>
              ) : null}
            </div>
          }
        />
      </SettingsCard>

      <SettingsCard title={COPY.clawManageAgents} className="settings-card-spaced">
        {settings.channels.length === 0 ? (
          <div className="claw-settings-agents-empty">{COPY.clawManageAgentsEmpty}</div>
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
                      {COPY.clawManageAgentMeta('Feishu / Lark', channel.model, workspace)}
                    </div>
                  </div>
                  <div className="claw-settings-agent-toggle">
                    <span className="claw-settings-agent-toggle-label">
                      {channel.enabled ? COPY.clawManageAgentEnabled : COPY.clawManageAgentDisabled}
                    </span>
                    <Toggle
                      checked={channel.enabled}
                      onChange={(value) => updateChannel(channel.id, { enabled: value })}
                    />
                  </div>
                </div>

                {channel.provider === 'feishu' ? (
                  <SettingRow
                    title={COPY.clawFeishuStream}
                    description={COPY.clawFeishuStreamDesc}
                    control={
                      <div className="claw-settings-agent-toggle">
                        <span className="claw-settings-agent-toggle-label">
                          {channel.feishuStream
                            ? COPY.clawManageAgentEnabled
                            : COPY.clawManageAgentDisabled}
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
                    <span className="claw-settings-field-label">{COPY.clawManageAgentName}</span>
                    <input
                      className="settings-text-input"
                      value={channel.agentProfile.name}
                      onChange={(e) => updateChannelProfile(channel, { name: e.target.value })}
                      placeholder={COPY.clawManageAgentNamePlaceholder}
                    />
                  </label>
                  <label className="claw-settings-field">
                    <span className="claw-settings-field-label">{COPY.clawModel}</span>
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
                    <span className="claw-settings-field-label">{COPY.clawWorkspaceOverride}</span>
                    <input
                      className="settings-text-input"
                      value={channel.workspaceRoot}
                      onChange={(e) => updateChannel(channel.id, { workspaceRoot: e.target.value })}
                      placeholder={COPY.clawWorkspaceInherit(
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
