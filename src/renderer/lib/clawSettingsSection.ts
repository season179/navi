// Kun ClawSettingsSection chrome
// (../Kun/src/renderer/src/components/settings-section-claw.tsx).
// Visual only — used for production ClawSettingsSection and preview hooks.

/** English copy matching Kun's clawRuntime locale string. */
export const CLAW_SETTINGS_RUNTIME_TITLE = 'Phone connection'

/** English copy matching Kun's clawEnabled locale string. */
export const CLAW_SETTINGS_ENABLED_LABEL = 'Enable phone connection'

/** English copy matching Kun's clawEnabledDesc locale string. */
export const CLAW_SETTINGS_ENABLED_DESC =
  'When enabled, the Feishu / Lark phone bridge and local IM webhook can run in the background. Turning it off does not affect normal GUI chats.'

/** English copy matching Kun's clawDefaultWorkspace locale string. */
export const CLAW_SETTINGS_DEFAULT_WORKSPACE_LABEL = 'Default phone workspace'

/** English copy matching Kun's clawDefaultWorkspaceDesc locale string. */
export const CLAW_SETTINGS_DEFAULT_WORKSPACE_DESC =
  'Leave this empty to use the GUI default working directory. Individual phone connections can still override it.'

/** Format Kun's clawDefaultWorkspacePlaceholder locale string. */
export function formatClawSettingsDefaultWorkspacePlaceholder(path: string): string {
  return `Leave empty to inherit: ${path}`
}

/** English copy matching Kun's clawDefaultWorkspaceReset locale string. */
export const CLAW_SETTINGS_DEFAULT_WORKSPACE_RESET_LABEL = 'Use GUI default'

/** English copy matching Kun's clawManageAgents locale string. */
export const CLAW_SETTINGS_MANAGE_AGENTS_TITLE = 'Connected phone agents'

/** English copy matching Kun's clawManageAgentsEmpty locale string. */
export const CLAW_SETTINGS_MANAGE_AGENTS_EMPTY =
  'No phone agent has been connected yet. Use Connect phone to bind Feishu / Lark first.'

/** Format Kun's clawManageAgentMeta locale string. */
export function formatClawSettingsManageAgentMeta(
  provider: string,
  model: string,
  workspace: string,
): string {
  return `${provider} · ${model} · ${workspace}`
}

/** English copy matching Kun's clawManageAgentEnabled locale string. */
export const CLAW_SETTINGS_MANAGE_AGENT_ENABLED_LABEL = 'Enabled'

/** English copy matching Kun's clawManageAgentDisabled locale string. */
export const CLAW_SETTINGS_MANAGE_AGENT_DISABLED_LABEL = 'Disabled'

/** English copy matching Kun's clawFeishuStream locale string. */
export const CLAW_SETTINGS_FEISHU_STREAM_LABEL = 'Enable streaming output'

/** English copy matching Kun's clawFeishuStreamDesc locale string. */
export const CLAW_SETTINGS_FEISHU_STREAM_DESC =
  'Stream the reply character-by-character in a live SDK card, instead of sending a one-shot message after the run completes.'

/** English copy matching Kun's clawManageAgentName locale string. */
export const CLAW_SETTINGS_MANAGE_AGENT_NAME_LABEL = 'Agent name'

/** English copy matching Kun's clawManageAgentNamePlaceholder locale string. */
export const CLAW_SETTINGS_MANAGE_AGENT_NAME_PLACEHOLDER = 'Name shown in the IM sidebar'

/** English copy matching Kun's clawModel locale string. */
export const CLAW_SETTINGS_MODEL_LABEL = 'Model'

/** English copy matching Kun's clawWorkspaceOverride locale string. */
export const CLAW_SETTINGS_WORKSPACE_OVERRIDE_LABEL = 'Workspace override'

/** Format Kun's clawWorkspaceInherit locale string. */
export function formatClawSettingsWorkspaceInherit(path: string): string {
  return `Use default workspace: ${path}`
}

/** English copy matching Kun's clawManageAgentDescription locale string. */
export const CLAW_SETTINGS_MANAGE_AGENT_DESCRIPTION_LABEL = 'Short description'

/** English copy matching Kun's clawManageAgentDescriptionPlaceholder locale string. */
export const CLAW_SETTINGS_MANAGE_AGENT_DESCRIPTION_PLACEHOLDER =
  'Example: Handles project questions in the team chat'

/** English copy matching Kun's clawManageAgentIdentity locale string. */
export const CLAW_SETTINGS_MANAGE_AGENT_IDENTITY_LABEL = 'Role definition'

/** English copy matching Kun's clawManageAgentIdentityPlaceholder locale string. */
export const CLAW_SETTINGS_MANAGE_AGENT_IDENTITY_PLACEHOLDER =
  'Define who this agent is, its role, scope, and boundaries.'

/** English copy matching Kun's clawManageAgentPersonality locale string. */
export const CLAW_SETTINGS_MANAGE_AGENT_PERSONALITY_LABEL = 'Personality'

/** English copy matching Kun's clawManageAgentPersonalityPlaceholder locale string. */
export const CLAW_SETTINGS_MANAGE_AGENT_PERSONALITY_PLACEHOLDER =
  'Define tone, style, patience, and when it should ask follow-up questions.'

/** English copy matching Kun's clawManageAgentUserContext locale string. */
export const CLAW_SETTINGS_MANAGE_AGENT_USER_CONTEXT_LABEL = 'User context'

/** English copy matching Kun's clawManageAgentUserContextPlaceholder locale string. */
export const CLAW_SETTINGS_MANAGE_AGENT_USER_CONTEXT_PLACEHOLDER =
  'Long-lived user, team, or workflow context this phone agent should remember.'

/** English copy matching Kun's clawManageAgentReplyRules locale string. */
export const CLAW_SETTINGS_MANAGE_AGENT_REPLY_RULES_LABEL = 'Reply rules'

/** English copy matching Kun's clawManageAgentReplyRulesPlaceholder locale string. */
export const CLAW_SETTINGS_MANAGE_AGENT_REPLY_RULES_PLACEHOLDER =
  'Define reply format, length, risk checks, or confirmation rules.'
