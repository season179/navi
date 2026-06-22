import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'node_modules', '.plugin-marketplace-view-test.mjs')

buildSync({
  entryPoints: [join(ROOT, 'src', 'renderer', 'lib', 'pluginMarketplaceView.ts')],
  outfile: out,
  bundle: true,
  platform: 'node',
  format: 'esm',
})

const {
  PLUGIN_ADD_CUSTOM_LABEL,
  PLUGIN_ADDED_LABEL,
  PLUGIN_ADD_LABEL,
  PLUGIN_BUILT_IN_SECTION_TITLE,
  PLUGIN_CREATE_LABEL,
  PLUGIN_CUSTOM_ARGS_PLACEHOLDER,
  PLUGIN_CUSTOM_COMMAND_PLACEHOLDER,
  PLUGIN_CUSTOM_DESCRIPTION_PLACEHOLDER,
  PLUGIN_CUSTOM_MCP_CONFIG_PLACEHOLDER,
  PLUGIN_CUSTOM_NAME_PLACEHOLDER,
  PLUGIN_CUSTOM_SKILL_BODY_PLACEHOLDER,
  PLUGIN_FILTER_ALL_LABEL,
  PLUGIN_FILTER_INSTALLED_LABEL,
  PLUGIN_FILTER_RECOMMENDED_LABEL,
  PLUGIN_MANAGE_LABEL,
  PLUGIN_MCP_DISABLE_LABEL,
  PLUGIN_MCP_ENABLE_LABEL,
  PLUGIN_MCP_RESTART_HINT,
  PLUGIN_MCP_RUNTIME_CONNECTED_LABEL,
  PLUGIN_MCP_RUNTIME_OVERLAY_LABEL,
  PLUGIN_MCP_RUNTIME_REFRESH_LABEL,
  PLUGIN_MCP_RUNTIME_SEARCH_ACTIVE_LABEL,
  PLUGIN_MCP_RUNTIME_SEARCH_INACTIVE_LABEL,
  PLUGIN_MCP_SOURCE_CONNECTED_LABEL,
  PLUGIN_MCP_STATUS_DISABLED_LABEL,
  PLUGIN_MCP_TITLE,
  PLUGIN_NO_RESULTS_TEXT,
  PLUGIN_OPEN_LOCATION_LABEL,
  PLUGIN_PERSONAL_EMPTY_TEXT,
  PLUGIN_PERSONAL_SECTION_TITLE,
  PLUGIN_RECOMMENDED_SECTION_TITLE,
  PLUGIN_SEARCH_MCP_PLACEHOLDER,
  PLUGIN_SEARCH_SKILL_PLACEHOLDER,
  PLUGIN_SKILL_DISABLE_LABEL,
  PLUGIN_SKILL_ENABLE_LABEL,
  PLUGIN_SKILL_REFRESH_LABEL,
  PLUGIN_SKILL_ROOT_GLOBAL_AGENTS_LABEL,
  PLUGIN_SKILL_ROOT_NONE_LABEL,
  PLUGIN_SKILL_ROOT_WORKSPACE_AGENTS_LABEL,
  PLUGIN_SKILL_SOURCE_GLOBAL_LABEL,
  PLUGIN_SKILL_SOURCE_PROJECT_LABEL,
  PLUGIN_SKILL_STATUS_DISABLED_LABEL,
  PLUGIN_SKILL_TITLE,
  PLUGIN_TAB_MCP_LABEL,
  PLUGIN_TAB_SKILL_LABEL,
  formatPluginMcpRuntimeDrift,
  formatPluginMcpRuntimeLastError,
  formatPluginMcpRuntimeSearch,
  formatPluginMcpRuntimeServers,
  formatPluginMcpRuntimeTools,
  formatPluginSkillDiscoveredCountWithEnabled,
  resolvePluginMcpRuntimeStatusLabel,
} = await import(out)

test('plugin marketplace view copy matches Kun locale strings', () => {
  assert.equal(PLUGIN_TAB_MCP_LABEL, 'MCP')
  assert.equal(PLUGIN_TAB_SKILL_LABEL, 'Skill')
  assert.equal(PLUGIN_MANAGE_LABEL, 'Manage')
  assert.equal(PLUGIN_CREATE_LABEL, 'Create')
  assert.equal(PLUGIN_MCP_TITLE, 'Connect external tools to the agent')
  assert.equal(PLUGIN_SKILL_TITLE, 'Make the agent work your way')
  assert.equal(PLUGIN_SEARCH_MCP_PLACEHOLDER, 'Search MCP')
  assert.equal(PLUGIN_SEARCH_SKILL_PLACEHOLDER, 'Search Skill')
  assert.equal(PLUGIN_FILTER_ALL_LABEL, 'All')
  assert.equal(PLUGIN_FILTER_RECOMMENDED_LABEL, 'Recommended')
  assert.equal(PLUGIN_FILTER_INSTALLED_LABEL, 'Added')
  assert.equal(PLUGIN_BUILT_IN_SECTION_TITLE, 'Built-in')
  assert.equal(PLUGIN_RECOMMENDED_SECTION_TITLE, 'Recommended')
  assert.equal(PLUGIN_PERSONAL_SECTION_TITLE, 'Personal')
  assert.equal(PLUGIN_NO_RESULTS_TEXT, 'No matching plugins.')
  assert.equal(PLUGIN_PERSONAL_EMPTY_TEXT, 'No matching added plugins yet.')
  assert.equal(PLUGIN_ADD_LABEL, 'Add')
  assert.equal(PLUGIN_ADDED_LABEL, 'Added')
  assert.equal(PLUGIN_MCP_ENABLE_LABEL, 'Enable')
  assert.equal(PLUGIN_MCP_DISABLE_LABEL, 'Disable')
  assert.equal(PLUGIN_MCP_STATUS_DISABLED_LABEL, 'Disabled')
  assert.equal(PLUGIN_SKILL_ENABLE_LABEL, 'Enable')
  assert.equal(PLUGIN_SKILL_DISABLE_LABEL, 'Disable')
  assert.equal(PLUGIN_SKILL_STATUS_DISABLED_LABEL, 'Disabled')
  assert.equal(
    PLUGIN_MCP_RESTART_HINT,
    'After saving MCP config, a running local runtime may need a restart before the change fully applies.',
  )
  assert.equal(PLUGIN_MCP_RUNTIME_OVERLAY_LABEL, 'Runtime overlay')
  assert.equal(PLUGIN_MCP_RUNTIME_REFRESH_LABEL, 'Refresh')
  assert.equal(PLUGIN_MCP_RUNTIME_CONNECTED_LABEL, 'Connected')
  assert.equal(PLUGIN_MCP_RUNTIME_SEARCH_ACTIVE_LABEL, 'active')
  assert.equal(PLUGIN_MCP_RUNTIME_SEARCH_INACTIVE_LABEL, 'inactive')
  assert.equal(PLUGIN_MCP_SOURCE_CONNECTED_LABEL, 'Connected')
  assert.equal(PLUGIN_OPEN_LOCATION_LABEL, 'Open location')
  assert.equal(
    PLUGIN_SKILL_ROOT_WORKSPACE_AGENTS_LABEL,
    'Workspace · .agents/skills',
  )
  assert.equal(PLUGIN_SKILL_ROOT_GLOBAL_AGENTS_LABEL, 'Global · ~/.agents/skills')
  assert.equal(PLUGIN_SKILL_ROOT_NONE_LABEL, 'No skill directory detected')
  assert.equal(PLUGIN_SKILL_REFRESH_LABEL, 'Refresh')
  assert.equal(PLUGIN_SKILL_SOURCE_PROJECT_LABEL, 'Project')
  assert.equal(PLUGIN_SKILL_SOURCE_GLOBAL_LABEL, 'Global')
  assert.equal(PLUGIN_CUSTOM_NAME_PLACEHOLDER, 'Name, e.g. my-plugin')
  assert.equal(PLUGIN_CUSTOM_DESCRIPTION_PLACEHOLDER, 'Basic description')
  assert.equal(PLUGIN_CUSTOM_COMMAND_PLACEHOLDER, 'Command, e.g. npx')
  assert.equal(PLUGIN_CUSTOM_ARGS_PLACEHOLDER, 'Arguments, one per line')
  assert.equal(
    PLUGIN_CUSTOM_MCP_CONFIG_PLACEHOLDER,
    'Or paste a complete MCP JSON config snippet',
  )
  assert.equal(
    PLUGIN_CUSTOM_SKILL_BODY_PLACEHOLDER,
    'Skill instructions for the agent',
  )
  assert.equal(PLUGIN_ADD_CUSTOM_LABEL, 'Add custom')
})

test('plugin marketplace view formatters match Kun behavior', () => {
  assert.equal(resolvePluginMcpRuntimeStatusLabel('connected'), 'Connected')
  assert.equal(resolvePluginMcpRuntimeStatusLabel('drift'), 'Drift')
  assert.equal(formatPluginMcpRuntimeServers(2, 3), '2/3 servers')
  assert.equal(formatPluginMcpRuntimeTools(18), '18 tools')
  assert.equal(
    formatPluginMcpRuntimeSearch('active', 'hybrid', 18, 18),
    'Search active · hybrid · 18/18 indexed',
  )
  assert.equal(formatPluginMcpRuntimeDrift(2), '2 drift signal(s)')
  assert.equal(
    formatPluginMcpRuntimeLastError('connection refused'),
    'Last error: connection refused',
  )
  assert.equal(formatPluginSkillDiscoveredCountWithEnabled(6, 4), '6 discovered, 4 enabled')
})
