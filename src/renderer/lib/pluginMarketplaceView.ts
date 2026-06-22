// Kun PluginMarketplaceView chrome
// (../Kun/src/renderer/src/components/PluginMarketplaceView.tsx).
// Visual only — used for production PluginMarketplaceView and preview hooks.

export type PluginMcpRuntimeOverlayStatus =
  | 'connected'
  | 'configured'
  | 'drift'
  | 'error'
  | 'disabled'
  | 'offline'

/** English copy matching Kun's pluginTabMcp locale string. */
export const PLUGIN_TAB_MCP_LABEL = 'MCP'

/** English copy matching Kun's pluginTabSkill locale string. */
export const PLUGIN_TAB_SKILL_LABEL = 'Skill'

/** English copy matching Kun's pluginManage locale string. */
export const PLUGIN_MANAGE_LABEL = 'Manage'

/** English copy matching Kun's pluginCreate locale string. */
export const PLUGIN_CREATE_LABEL = 'Create'

/** English copy matching Kun's pluginMcpTitle locale string. */
export const PLUGIN_MCP_TITLE = 'Connect external tools to the agent'

/** English copy matching Kun's pluginSkillTitle locale string. */
export const PLUGIN_SKILL_TITLE = 'Make the agent work your way'

/** English copy matching Kun's pluginSearchMcp locale string. */
export const PLUGIN_SEARCH_MCP_PLACEHOLDER = 'Search MCP'

/** English copy matching Kun's pluginSearchSkill locale string. */
export const PLUGIN_SEARCH_SKILL_PLACEHOLDER = 'Search Skill'

/** English copy matching Kun's pluginFilterAll locale string. */
export const PLUGIN_FILTER_ALL_LABEL = 'All'

/** English copy matching Kun's pluginFilterRecommended locale string. */
export const PLUGIN_FILTER_RECOMMENDED_LABEL = 'Recommended'

/** English copy matching Kun's pluginFilterInstalled locale string. */
export const PLUGIN_FILTER_INSTALLED_LABEL = 'Added'

/** English copy matching Kun's pluginBuiltIn locale string. */
export const PLUGIN_BUILT_IN_SECTION_TITLE = 'Built-in'

/** English copy matching Kun's pluginRecommended locale string. */
export const PLUGIN_RECOMMENDED_SECTION_TITLE = 'Recommended'

/** English copy matching Kun's pluginPersonal locale string. */
export const PLUGIN_PERSONAL_SECTION_TITLE = 'Personal'

/** English copy matching Kun's pluginNoResults locale string. */
export const PLUGIN_NO_RESULTS_TEXT = 'No matching plugins.'

/** English copy matching Kun's pluginPersonalEmpty locale string. */
export const PLUGIN_PERSONAL_EMPTY_TEXT = 'No matching added plugins yet.'

/** English copy matching Kun's pluginAdd locale string. */
export const PLUGIN_ADD_LABEL = 'Add'

/** English copy matching Kun's pluginAdded locale string. */
export const PLUGIN_ADDED_LABEL = 'Added'

/** English copy matching Kun's pluginMcpEnable locale string. */
export const PLUGIN_MCP_ENABLE_LABEL = 'Enable'

/** English copy matching Kun's pluginMcpDisable locale string. */
export const PLUGIN_MCP_DISABLE_LABEL = 'Disable'

/** English copy matching Kun's pluginMcpStatusDisabled locale string. */
export const PLUGIN_MCP_STATUS_DISABLED_LABEL = 'Disabled'

/** English copy matching Kun's pluginSkillEnable locale string. */
export const PLUGIN_SKILL_ENABLE_LABEL = 'Enable'

/** English copy matching Kun's pluginSkillDisable locale string. */
export const PLUGIN_SKILL_DISABLE_LABEL = 'Disable'

/** English copy matching Kun's pluginSkillStatusDisabled locale string. */
export const PLUGIN_SKILL_STATUS_DISABLED_LABEL = 'Disabled'

/** English copy matching Kun's pluginMcpRestartHint locale string. */
export const PLUGIN_MCP_RESTART_HINT =
  'After saving MCP config, a running local runtime may need a restart before the change fully applies.'

/** English copy matching Kun's pluginMcpRuntimeOverlay locale string. */
export const PLUGIN_MCP_RUNTIME_OVERLAY_LABEL = 'Runtime overlay'

/** English copy matching Kun's pluginMcpRuntimeRefresh locale string. */
export const PLUGIN_MCP_RUNTIME_REFRESH_LABEL = 'Refresh'

/** English copy matching Kun's pluginMcpRuntimeConnected locale string. */
export const PLUGIN_MCP_RUNTIME_CONNECTED_LABEL = 'Connected'

/** English copy matching Kun's pluginMcpRuntimeConfigured locale string. */
export const PLUGIN_MCP_RUNTIME_CONFIGURED_LABEL = 'Configured'

/** English copy matching Kun's pluginMcpRuntimeDrifted locale string. */
export const PLUGIN_MCP_RUNTIME_DRIFTED_LABEL = 'Drift'

/** English copy matching Kun's pluginMcpRuntimeError locale string. */
export const PLUGIN_MCP_RUNTIME_ERROR_LABEL = 'Error'

/** English copy matching Kun's pluginMcpRuntimeDisabled locale string. */
export const PLUGIN_MCP_RUNTIME_DISABLED_LABEL = 'Disabled'

/** English copy matching Kun's pluginMcpRuntimeOffline locale string. */
export const PLUGIN_MCP_RUNTIME_OFFLINE_LABEL = 'Offline'

/** English copy matching Kun's pluginMcpRuntimeSearchActive locale string. */
export const PLUGIN_MCP_RUNTIME_SEARCH_ACTIVE_LABEL = 'active'

/** English copy matching Kun's pluginMcpRuntimeSearchInactive locale string. */
export const PLUGIN_MCP_RUNTIME_SEARCH_INACTIVE_LABEL = 'inactive'

/** English copy matching Kun's pluginMcpSourceConfigured locale string. */
export const PLUGIN_MCP_SOURCE_CONFIGURED_LABEL = 'Configured'

/** English copy matching Kun's pluginMcpSourceConnected locale string. */
export const PLUGIN_MCP_SOURCE_CONNECTED_LABEL = 'Connected'

/** English copy matching Kun's pluginMcpSourceError locale string. */
export const PLUGIN_MCP_SOURCE_ERROR_LABEL = 'Error'

/** English copy matching Kun's pluginMcpSourceDisabled locale string. */
export const PLUGIN_MCP_SOURCE_DISABLED_LABEL = 'Disabled'

/** English copy matching Kun's pluginOpenLocation locale string. */
export const PLUGIN_OPEN_LOCATION_LABEL = 'Open location'

/** English copy matching Kun's pluginSkillRootWorkspaceAgents locale string. */
export const PLUGIN_SKILL_ROOT_WORKSPACE_AGENTS_LABEL = 'Workspace · .agents/skills'

/** English copy matching Kun's pluginSkillRootGlobalAgents locale string. */
export const PLUGIN_SKILL_ROOT_GLOBAL_AGENTS_LABEL = 'Global · ~/.agents/skills'

/** English copy matching Kun's pluginSkillRootNone locale string. */
export const PLUGIN_SKILL_ROOT_NONE_LABEL = 'No skill directory detected'

/** English copy matching Kun's pluginSkillRefresh locale string. */
export const PLUGIN_SKILL_REFRESH_LABEL = 'Refresh'

/** English copy matching Kun's pluginSkillSourceProject locale string. */
export const PLUGIN_SKILL_SOURCE_PROJECT_LABEL = 'Project'

/** English copy matching Kun's pluginSkillSourceGlobal locale string. */
export const PLUGIN_SKILL_SOURCE_GLOBAL_LABEL = 'Global'

/** English copy matching Kun's pluginCustomName locale string. */
export const PLUGIN_CUSTOM_NAME_PLACEHOLDER = 'Name, e.g. my-plugin'

/** English copy matching Kun's pluginCustomDescription locale string. */
export const PLUGIN_CUSTOM_DESCRIPTION_PLACEHOLDER = 'Basic description'

/** English copy matching Kun's pluginCustomCommand locale string. */
export const PLUGIN_CUSTOM_COMMAND_PLACEHOLDER = 'Command, e.g. npx'

/** English copy matching Kun's pluginCustomArgs locale string. */
export const PLUGIN_CUSTOM_ARGS_PLACEHOLDER = 'Arguments, one per line'

/** English copy matching Kun's pluginCustomMcpConfig locale string. */
export const PLUGIN_CUSTOM_MCP_CONFIG_PLACEHOLDER =
  'Or paste a complete MCP JSON config snippet'

/** English copy matching Kun's pluginCustomSkillBody locale string. */
export const PLUGIN_CUSTOM_SKILL_BODY_PLACEHOLDER = 'Skill instructions for the agent'

/** English copy matching Kun's pluginAddCustom locale string. */
export const PLUGIN_ADD_CUSTOM_LABEL = 'Add custom'

/** Resolve MCP runtime overlay status label matching Kun's pluginMcpRuntime* keys. */
export function resolvePluginMcpRuntimeStatusLabel(
  status: PluginMcpRuntimeOverlayStatus,
): string {
  switch (status) {
    case 'connected':
      return PLUGIN_MCP_RUNTIME_CONNECTED_LABEL
    case 'configured':
      return PLUGIN_MCP_RUNTIME_CONFIGURED_LABEL
    case 'drift':
      return PLUGIN_MCP_RUNTIME_DRIFTED_LABEL
    case 'error':
      return PLUGIN_MCP_RUNTIME_ERROR_LABEL
    case 'disabled':
      return PLUGIN_MCP_RUNTIME_DISABLED_LABEL
    case 'offline':
      return PLUGIN_MCP_RUNTIME_OFFLINE_LABEL
  }
}

/** Format runtime server count matching Kun's pluginMcpRuntimeServers template. */
export function formatPluginMcpRuntimeServers(
  connected: number,
  configured: number,
): string {
  return `${connected}/${configured} servers`
}

/** Format runtime tool count matching Kun's pluginMcpRuntimeTools template. */
export function formatPluginMcpRuntimeTools(count: number): string {
  return `${count} tools`
}

/** Format runtime search summary matching Kun's pluginMcpRuntimeSearch template. */
export function formatPluginMcpRuntimeSearch(
  status: string,
  mode: string,
  indexed: number,
  advertised: number,
): string {
  return `Search ${status} · ${mode} · ${indexed}/${advertised} indexed`
}

/** Format runtime drift count matching Kun's pluginMcpRuntimeDrift template. */
export function formatPluginMcpRuntimeDrift(count: number): string {
  return `${count} drift signal(s)`
}

/** Format runtime last error matching Kun's pluginMcpRuntimeLastError template. */
export function formatPluginMcpRuntimeLastError(message: string): string {
  return `Last error: ${message}`
}

/** Format discovered skill count matching Kun's pluginSkillDiscoveredCountWithEnabled template. */
export function formatPluginSkillDiscoveredCountWithEnabled(
  count: number,
  enabled: number,
): string {
  return `${count} discovered, ${enabled} enabled`
}
