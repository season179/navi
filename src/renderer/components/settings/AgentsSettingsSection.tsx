// Agents settings section echoing Kun's settings-section-agents.tsx
// (../Kun/src/renderer/src/components/settings-section-agents.tsx).
// Visual only: mock form state and preview modes.

import { useRef, useState, type ReactElement } from 'react'
import { Ban, FolderOpen, Loader2, RefreshCw, Settings, Trash2 } from 'lucide-react'
import {
  AdvancedSettingsDisclosure,
  InlineNoticeView,
  ModelSelect,
  SectionJumpButton,
  SETTINGS_SELECT_CLASS,
  SettingRow,
  SettingsCard,
  SettingsSecretInput,
  Toggle,
} from './SettingsControls'
import {
  AGENTS_SETTINGS_AGENTS_QUICK_BASE,
  AGENTS_SETTINGS_AGENTS_QUICK_SKILL,
  AGENTS_SETTINGS_AGENTS_QUICK_MCP,
  AGENTS_SETTINGS_AGENTS_QUICK_PERMISSIONS,
  AGENTS_SETTINGS_AGENTS,
  AGENTS_SETTINGS_AUTO_START,
  AGENTS_SETTINGS_AUTO_START_DESC,
  AGENTS_SETTINGS_KUN_PROVIDER,
  AGENTS_SETTINGS_KUN_PROVIDER_SELECT_DESC,
  AGENTS_SETTINGS_KUN_MODEL,
  AGENTS_SETTINGS_KUN_MODEL_DESC,
  AGENTS_SETTINGS_MODEL_SELECT_CUSTOM_OPTION,
  AGENTS_SETTINGS_MODEL_SELECT_CUSTOM_PLACEHOLDER,
  AGENTS_SETTINGS_CODE_PROMPT_PREFIX,
  AGENTS_SETTINGS_CODE_PROMPT_PREFIX_DESC,
  AGENTS_SETTINGS_CODE_PROMPT_PREFIX_PLACEHOLDER,
  AGENTS_SETTINGS_KUN_ASSISTANT_ADVANCED,
  AGENTS_SETTINGS_KUN_ASSISTANT_ADVANCED_DESC,
  AGENTS_SETTINGS_PORT,
  AGENTS_SETTINGS_PORT_DESC,
  AGENTS_SETTINGS_KUN_BINARY,
  AGENTS_SETTINGS_KUN_BINARY_DESC,
  AGENTS_SETTINGS_KUN_BINARY_PLACEHOLDER,
  AGENTS_SETTINGS_KUN_DATA_DIR,
  AGENTS_SETTINGS_KUN_DATA_DIR_DESC,
  AGENTS_SETTINGS_RUNTIME_TOKEN,
  AGENTS_SETTINGS_RUNTIME_TOKEN_DESC,
  AGENTS_SETTINGS_SHOW_SECRET,
  AGENTS_SETTINGS_HIDE_SECRET,
  AGENTS_SETTINGS_KUN_INSECURE,
  AGENTS_SETTINGS_KUN_INSECURE_DESC,
  AGENTS_SETTINGS_KUN_INSECURE_FORCED_DESC,
  AGENTS_SETTINGS_KUN_TOKEN_ECONOMY,
  AGENTS_SETTINGS_KUN_TOKEN_ECONOMY_DESC,
  AGENTS_SETTINGS_KUN_TOKEN_ECONOMY_SAVINGS_LOADING,
  AGENTS_SETTINGS_KUN_TOKEN_ECONOMY_SAVINGS_EMPTY,
  AGENTS_SETTINGS_PERMISSIONS,
  AGENTS_SETTINGS_PERMISSIONS_BEHAVIOR_HINT,
  AGENTS_SETTINGS_APPROVAL_POLICY,
  AGENTS_SETTINGS_APPROVAL_POLICY_DESC,
  AGENTS_SETTINGS_APPROVAL_AUTO,
  AGENTS_SETTINGS_APPROVAL_ON_REQUEST,
  AGENTS_SETTINGS_APPROVAL_UNTRUSTED,
  AGENTS_SETTINGS_APPROVAL_SUGGEST,
  AGENTS_SETTINGS_APPROVAL_NEVER,
  AGENTS_SETTINGS_SANDBOX_MODE,
  AGENTS_SETTINGS_SANDBOX_MODE_DESC,
  AGENTS_SETTINGS_SANDBOX_WORKSPACE_WRITE,
  AGENTS_SETTINGS_SANDBOX_READ_ONLY,
  AGENTS_SETTINGS_SANDBOX_FULL_ACCESS,
  AGENTS_SETTINGS_SANDBOX_EXTERNAL,
  AGENTS_SETTINGS_COMPUTER_USE_TITLE,
  AGENTS_SETTINGS_COMPUTER_USE_HINT,
  AGENTS_SETTINGS_COMPUTER_USE_MODEL_QUALITY_TITLE,
  AGENTS_SETTINGS_COMPUTER_USE_MODEL_QUALITY_BODY,
  AGENTS_SETTINGS_COMPUTER_USE_ENABLE,
  AGENTS_SETTINGS_COMPUTER_USE_ENABLE_DESC,
  AGENTS_SETTINGS_COMPUTER_USE_MODE,
  AGENTS_SETTINGS_COMPUTER_USE_MODE_DESC,
  AGENTS_SETTINGS_COMPUTER_USE_MODE_AUTO,
  AGENTS_SETTINGS_COMPUTER_USE_MODE_ALWAYS,
  AGENTS_SETTINGS_COMPUTER_USE_MODE_OFF,
  AGENTS_SETTINGS_COMPUTER_USE_PERMISSIONS,
  AGENTS_SETTINGS_COMPUTER_USE_PERMISSIONS_DESC,
  AGENTS_SETTINGS_COMPUTER_USE_ACCESSIBILITY,
  AGENTS_SETTINGS_COMPUTER_USE_SCREEN_RECORDING,
  AGENTS_SETTINGS_COMPUTER_USE_GRANT_ACCESSIBILITY,
  AGENTS_SETTINGS_COMPUTER_USE_GRANT_SCREEN_RECORDING,
  AGENTS_SETTINGS_COMPUTER_USE_RECHECK,
  AGENTS_SETTINGS_COMPUTER_USE_PERMISSION_GRANTED,
  AGENTS_SETTINGS_COMPUTER_USE_PERMISSION_DENIED,
  AGENTS_SETTINGS_DESIGN_QUALITY_TITLE,
  AGENTS_SETTINGS_DESIGN_QUALITY_HINT,
  AGENTS_SETTINGS_DESIGN_QUALITY_ENABLE,
  AGENTS_SETTINGS_DESIGN_QUALITY_ENABLE_DESC,
  AGENTS_SETTINGS_DESIGN_QUALITY_STRICTNESS,
  AGENTS_SETTINGS_DESIGN_QUALITY_STRICTNESS_DESC,
  AGENTS_SETTINGS_DESIGN_QUALITY_STRICTNESS_RELAXED,
  AGENTS_SETTINGS_DESIGN_QUALITY_STRICTNESS_STANDARD,
  AGENTS_SETTINGS_DESIGN_QUALITY_STRICTNESS_STRICT,
  AGENTS_SETTINGS_SKILL,
  AGENTS_SETTINGS_SKILLS_DETECTED_DIRS,
  AGENTS_SETTINGS_SKILLS_DETECTED_DIRS_DESC,
  AGENTS_SETTINGS_SKILLS_DETECTED_DIRS_EMPTY,
  AGENTS_SETTINGS_LOADING,
  AGENTS_SETTINGS_SKILLS_SCOPE_PROJECT,
  AGENTS_SETTINGS_SKILLS_SCOPE_GLOBAL,
  AGENTS_SETTINGS_SKILLS_DIR_NOT_FOUND,
  AGENTS_SETTINGS_SKILLS_OPEN_ROOT,
  AGENTS_SETTINGS_SKILLS_SCAN_DIRS,
  AGENTS_SETTINGS_SKILLS_SCAN_DIRS_DESC,
  AGENTS_SETTINGS_SKILLS_ACTIONS,
  AGENTS_SETTINGS_SKILLS_ACTIONS_DESC,
  AGENTS_SETTINGS_SKILLS_OPEN_PLUGINS,
  AGENTS_SETTINGS_MCP,
  AGENTS_SETTINGS_MCP_SEARCH_ENABLED,
  AGENTS_SETTINGS_MCP_SEARCH_ENABLED_DESC,
  AGENTS_SETTINGS_MCP_ADVANCED,
  AGENTS_SETTINGS_MCP_ADVANCED_DESC,
  AGENTS_SETTINGS_MCP_SEARCH_MODE,
  AGENTS_SETTINGS_MCP_SEARCH_MODE_DESC,
  AGENTS_SETTINGS_MCP_SEARCH_MODE_AUTO,
  AGENTS_SETTINGS_MCP_SEARCH_MODE_SEARCH,
  AGENTS_SETTINGS_MCP_SEARCH_MODE_DIRECT,
  AGENTS_SETTINGS_MCP_SEARCH_LIMITS,
  AGENTS_SETTINGS_MCP_SEARCH_LIMITS_DESC,
  AGENTS_SETTINGS_MCP_SEARCH_AUTO_THRESHOLD,
  AGENTS_SETTINGS_MCP_SEARCH_TOP_K_DEFAULT,
  AGENTS_SETTINGS_MCP_SEARCH_TOP_K_MAX,
  AGENTS_SETTINGS_MCP_SEARCH_MIN_SCORE,
  AGENTS_SETTINGS_MCP_SEARCH_DIAGNOSTICS,
  AGENTS_SETTINGS_MCP_SEARCH_DIAGNOSTICS_DESC,
  AGENTS_SETTINGS_MCP_SEARCH_STATUS,
  AGENTS_SETTINGS_MCP_SEARCH_ACTIVE,
  AGENTS_SETTINGS_MCP_SEARCH_INACTIVE,
  AGENTS_SETTINGS_MCP_SEARCH_INDEXED,
  AGENTS_SETTINGS_MCP_SEARCH_ADVERTISED,
  AGENTS_SETTINGS_CONFIG_FILE_PATH,
  AGENTS_SETTINGS_MCP_PATH_DESC,
  AGENTS_SETTINGS_MCP_EDITOR,
  AGENTS_SETTINGS_MCP_EDITOR_DESC,
  AGENTS_SETTINGS_MCP_FILE_STATUS_READY,
  AGENTS_SETTINGS_MCP_FILE_STATUS_MISSING,
  AGENTS_SETTINGS_MCP_ACTIONS,
  AGENTS_SETTINGS_MCP_RUNTIME_HINT,
  AGENTS_SETTINGS_MCP_SAVE,
  AGENTS_SETTINGS_MCP_RELOAD,
  AGENTS_SETTINGS_MCP_OPEN_DIR,
  AGENTS_SETTINGS_KUN_ADVANCED,
  AGENTS_SETTINGS_KUN_ADVANCED_DETAILS,
  AGENTS_SETTINGS_KUN_ADVANCED_DETAILS_DESC,
  AGENTS_SETTINGS_KUN_TOKEN_ECONOMY_OPTIONS,
  AGENTS_SETTINGS_KUN_TOKEN_ECONOMY_OPTIONS_DESC,
  AGENTS_SETTINGS_KUN_COMPRESS_TOOL_DESCRIPTIONS,
  AGENTS_SETTINGS_KUN_COMPRESS_TOOL_RESULTS,
  AGENTS_SETTINGS_KUN_CONCISE_RESPONSES,
  AGENTS_SETTINGS_KUN_HISTORY_HYGIENE,
  AGENTS_SETTINGS_KUN_HISTORY_HYGIENE_DESC,
  AGENTS_SETTINGS_KUN_HISTORY_MAX_RESULT_LINES,
  AGENTS_SETTINGS_KUN_HISTORY_MAX_RESULT_BYTES,
  AGENTS_SETTINGS_KUN_HISTORY_MAX_RESULT_TOKENS,
  AGENTS_SETTINGS_KUN_HISTORY_MAX_ARGUMENT_BYTES,
  AGENTS_SETTINGS_KUN_HISTORY_MAX_ARGUMENT_TOKENS,
  AGENTS_SETTINGS_KUN_HISTORY_MAX_ARRAY_ITEMS,
  AGENTS_SETTINGS_KUN_MODEL_CONTEXT_PROFILE,
  AGENTS_SETTINGS_KUN_MODEL_CONTEXT_PROFILE_DESC,
  AGENTS_SETTINGS_KUN_MODEL_CONTEXT_MODEL,
  AGENTS_SETTINGS_KUN_MODEL_CONTEXT_WINDOW,
  AGENTS_SETTINGS_KUN_MODEL_CONTEXT_SOFT,
  AGENTS_SETTINGS_KUN_MODEL_CONTEXT_HARD,
  AGENTS_SETTINGS_KUN_MODEL_CONTEXT_SOURCE_BUILT_IN,
  AGENTS_SETTINGS_KUN_STORAGE_BACKEND,
  AGENTS_SETTINGS_KUN_STORAGE_BACKEND_DESC,
  AGENTS_SETTINGS_KUN_STORAGE_HYBRID,
  AGENTS_SETTINGS_KUN_STORAGE_FILE,
  AGENTS_SETTINGS_KUN_STORAGE_SQLITE_PATH,
  AGENTS_SETTINGS_KUN_STORAGE_SQLITE_PATH_DESC,
  AGENTS_SETTINGS_KUN_STORAGE_SQLITE_PATH_PLACEHOLDER,
  AGENTS_SETTINGS_KUN_COMPACTION_THRESHOLDS,
  AGENTS_SETTINGS_KUN_COMPACTION_THRESHOLDS_DESC,
  AGENTS_SETTINGS_KUN_COMPACTION_SOFT_THRESHOLD,
  AGENTS_SETTINGS_KUN_COMPACTION_HARD_THRESHOLD,
  AGENTS_SETTINGS_KUN_COMPACTION_SUMMARY,
  AGENTS_SETTINGS_KUN_COMPACTION_SUMMARY_DESC,
  AGENTS_SETTINGS_KUN_COMPACTION_SUMMARY_MODE,
  AGENTS_SETTINGS_KUN_COMPACTION_SUMMARY_HEURISTIC,
  AGENTS_SETTINGS_KUN_COMPACTION_SUMMARY_MODEL,
  AGENTS_SETTINGS_KUN_COMPACTION_SUMMARY_TIMEOUT,
  AGENTS_SETTINGS_KUN_COMPACTION_SUMMARY_MAX_TOKENS,
  AGENTS_SETTINGS_KUN_COMPACTION_SUMMARY_INPUT_BYTES,
  AGENTS_SETTINGS_KUN_STREAM_IDLE_TIMEOUT,
  AGENTS_SETTINGS_KUN_STREAM_IDLE_TIMEOUT_DESC,
  AGENTS_SETTINGS_KUN_TOOL_STORM,
  AGENTS_SETTINGS_KUN_TOOL_STORM_DESC,
  AGENTS_SETTINGS_KUN_TOOL_STORM_LIMITS,
  AGENTS_SETTINGS_KUN_TOOL_STORM_LIMITS_DESC,
  AGENTS_SETTINGS_KUN_TOOL_STORM_WINDOW_SIZE,
  AGENTS_SETTINGS_KUN_TOOL_STORM_THRESHOLD,
  AGENTS_SETTINGS_KUN_TOOL_ARGUMENT_REPAIR,
  AGENTS_SETTINGS_KUN_TOOL_ARGUMENT_REPAIR_DESC,
  AGENTS_SETTINGS_KUN_DIAGNOSTICS,
  AGENTS_SETTINGS_KUN_DIAGNOSTICS_ADVANCED,
  AGENTS_SETTINGS_KUN_DIAGNOSTICS_ADVANCED_DESC,
  AGENTS_SETTINGS_KUN_RUNTIME_CAPABILITIES,
  AGENTS_SETTINGS_KUN_RUNTIME_CAPABILITIES_DESC,
  AGENTS_SETTINGS_KUN_RUNTIME_MODEL,
  AGENTS_SETTINGS_KUN_RUNTIME_PID,
  AGENTS_SETTINGS_KUN_DIAGNOSTICS_REFRESH,
  AGENTS_SETTINGS_KUN_TOOL_DIAGNOSTICS,
  AGENTS_SETTINGS_KUN_TOOL_DIAGNOSTICS_DESC,
  AGENTS_SETTINGS_KUN_DIAGNOSTICS_PROVIDERS,
  AGENTS_SETTINGS_KUN_DIAGNOSTICS_MCP_SERVERS,
  AGENTS_SETTINGS_KUN_DIAGNOSTICS_SKILLS,
  AGENTS_SETTINGS_KUN_DIAGNOSTICS_ATTACHMENTS,
  AGENTS_SETTINGS_KUN_MEMORY_RECORDS,
  AGENTS_SETTINGS_KUN_MEMORY_RECORDS_DESC,
  AGENTS_SETTINGS_KUN_MEMORY_EMPTY,
  AGENTS_SETTINGS_KUN_MEMORY_DISABLED,
  AGENTS_SETTINGS_KUN_MEMORY_DISABLE,
  AGENTS_SETTINGS_KUN_MEMORY_DELETE,
  formatAgentsSettingsModelSelectDefaultSuffix,
  formatAgentsSettingsTokenEconomySavings,
  formatAgentsSettingsSkillsDirSkillCount,
} from '../../lib/agentsSettingsSection'


export type ApprovalPolicy = 'auto' | 'on-request' | 'untrusted' | 'suggest' | 'never'
export type SandboxMode = 'workspace-write' | 'read-only' | 'danger-full-access' | 'external-sandbox'

export type SkillRootSnapshot = {
  id: string
  path: string
  scope: 'project' | 'global'
  enabled: boolean
  exists: boolean
  skillCount: number
  label?: string
}

export type MemoryRecordSnapshot = {
  id: string
  content: string
  scope: string
  disabledAt?: number
  tags?: string[]
}

export type AgentsProviderSnapshot = {
  id: string
  name: string
  models: string[]
}

export type AgentsSettingsSnapshot = {
  autoStart: boolean
  providerId: string
  model: string
  codePromptPrefix: string
  port: number
  binaryPath: string
  dataDir: string
  runtimeToken: string
  insecure: boolean
  approvalPolicy: ApprovalPolicy
  sandboxMode: SandboxMode
  tokenEconomyEnabled: boolean
  tokenEconomySavingsTokens: number | null
  tokenEconomyLoading: boolean
  compressToolDescriptions: boolean
  compressToolResults: boolean
  conciseResponses: boolean
  computerUseEnabled: boolean
  computerUseMode: 'auto' | 'always' | 'off'
  qualityEnabled: boolean
  qualityStrictness: 'relaxed' | 'standard' | 'strict'
  skillRoots: SkillRootSnapshot[]
  skillRootsLoading: boolean
  extraSkillDirs: string
  mcpSearchEnabled: boolean
  mcpSearchMode: 'auto' | 'search' | 'direct'
  mcpAutoThreshold: number
  mcpTopKDefault: number
  mcpTopKMax: number
  mcpMinScore: number
  mcpConfigPath: string
  mcpConfigExists: boolean
  mcpConfigText: string
  mcpBusy: boolean
  mcpLoading: boolean
  mcpSearchActive: boolean
  mcpIndexedTools: number
  mcpAdvertisedTools: number
  storageBackend: 'hybrid' | 'file'
  sqlitePath: string
  compactionSoftThreshold: number
  compactionHardThreshold: number
  summaryMode: 'heuristic' | 'model'
  summaryTimeoutMs: number
  summaryMaxTokens: number
  summaryInputMaxBytes: number
  streamIdleTimeoutMs: number
  toolStormEnabled: boolean
  toolStormWindowSize: number
  toolStormThreshold: number
  toolArgumentMaxStringBytes: number
  runtimeCapabilities: Array<{ label: string; status: 'available' | 'disabled' | 'error' | 'unknown' }>
  runtimeModel: string
  runtimePid: string
  mcpConnected: number
  mcpConfigured: number
  webProvider: string
  toolProviderCount: number
  toolMcpServerCount: number
  toolSkillCount: number
  toolAttachmentCount: number
  memoryRecords: MemoryRecordSnapshot[]
  diagnosticsBusy: boolean
}

export const AGENTS_SETTINGS_PREVIEW_PROVIDERS: AgentsProviderSnapshot[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    models: ['deepseek-v4-pro', 'deepseek-v4-flash', 'deepseek-chat'],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4.1', 'gpt-4.1-mini'],
  },
]

const DEFAULT_MCP_CONFIG = `{
  "servers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/season"]
    }
  }
}`

export const AGENTS_SETTINGS_PREVIEW_DEFAULT: AgentsSettingsSnapshot = {
  autoStart: true,
  providerId: 'deepseek',
  model: 'deepseek-v4-pro',
  codePromptPrefix:
    'Always write unit tests for new code. Prefer functional components over class components.',
  port: 18765,
  binaryPath: '',
  dataDir: '/Users/season/.navi/runtime',
  runtimeToken: 'preview-token-abc123',
  insecure: false,
  approvalPolicy: 'auto',
  sandboxMode: 'danger-full-access',
  tokenEconomyEnabled: false,
  tokenEconomySavingsTokens: null,
  tokenEconomyLoading: false,
  compressToolDescriptions: true,
  compressToolResults: true,
  conciseResponses: true,
  computerUseEnabled: false,
  computerUseMode: 'auto',
  qualityEnabled: true,
  qualityStrictness: 'standard',
  skillRoots: [
    {
      id: 'project-agents',
      path: '/Users/season/Personal/navi/.agents/skills',
      scope: 'project',
      enabled: true,
      exists: true,
      skillCount: 4,
    },
    {
      id: 'global-skills',
      path: '/Users/season/.agents/skills',
      scope: 'global',
      enabled: true,
      exists: true,
      skillCount: 12,
    },
    {
      id: 'codex-skills',
      path: '/Users/season/.codex/skills',
      scope: 'global',
      enabled: false,
      exists: false,
      skillCount: 0,
    },
  ],
  skillRootsLoading: false,
  extraSkillDirs: '~/.agents/skills',
  mcpSearchEnabled: true,
  mcpSearchMode: 'auto',
  mcpAutoThreshold: 24,
  mcpTopKDefault: 5,
  mcpTopKMax: 10,
  mcpMinScore: 0.15,
  mcpConfigPath: '/Users/season/.navi/mcp.json',
  mcpConfigExists: true,
  mcpConfigText: DEFAULT_MCP_CONFIG,
  mcpBusy: false,
  mcpLoading: false,
  mcpSearchActive: true,
  mcpIndexedTools: 18,
  mcpAdvertisedTools: 5,
  storageBackend: 'hybrid',
  sqlitePath: '',
  compactionSoftThreshold: 16000,
  compactionHardThreshold: 24000,
  summaryMode: 'model',
  summaryTimeoutMs: 15000,
  summaryMaxTokens: 1200,
  summaryInputMaxBytes: 98304,
  streamIdleTimeoutMs: 45000,
  toolStormEnabled: true,
  toolStormWindowSize: 8,
  toolStormThreshold: 3,
  toolArgumentMaxStringBytes: 524288,
  runtimeCapabilities: [
    { label: 'MCP', status: 'available' },
    { label: 'Web', status: 'available' },
    { label: 'Skills', status: 'available' },
    { label: 'Subagents', status: 'available' },
    { label: 'Images', status: 'available' },
    { label: 'Memory', status: 'available' },
  ],
  runtimeModel: 'deepseek-v4-pro',
  runtimePid: '48291',
  mcpConnected: 1,
  mcpConfigured: 1,
  webProvider: 'brave',
  toolProviderCount: 2,
  toolMcpServerCount: 1,
  toolSkillCount: 16,
  toolAttachmentCount: 3,
  memoryRecords: [
    {
      id: 'mem-001',
      content: 'Prefers concise answers with code citations when discussing refactors.',
      scope: 'global',
      tags: ['style'],
    },
    {
      id: 'mem-002',
      content: 'Default workspace is ~/Personal/navi for Electron app work.',
      scope: 'project',
    },
  ],
  diagnosticsBusy: false,
}

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return new Intl.NumberFormat('en-US').format(value)
}

function formatTokenNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

function statusPillClass(status: string): string {
  if (status === 'available') return 'agents-settings-status-pill is-available'
  if (status === 'disabled') return 'agents-settings-status-pill is-disabled'
  return 'agents-settings-status-pill is-error'
}

function permissionBadgeClass(state: 'granted' | 'denied' | 'unknown'): string {
  if (state === 'granted') return 'agents-settings-permission-badge is-granted'
  if (state === 'denied') return 'agents-settings-permission-badge is-denied'
  return 'agents-settings-permission-badge is-unknown'
}

function skillRootShortLabel(path: string): string {
  const parts = path.split(/[\\/]+/).filter(Boolean)
  return parts.slice(-2).join('/') || path
}

type Props = {
  settings: AgentsSettingsSnapshot
  providers?: AgentsProviderSnapshot[]
  portError?: string | null
  assistantAdvancedOpen?: boolean
  mcpAdvancedOpen?: boolean
  runtimeAdvancedOpen?: boolean
  diagnosticsAdvancedOpen?: boolean
  showComputerUsePermissions?: boolean
  computerUseAccessibility?: 'granted' | 'denied' | 'unknown'
  computerUseScreenRecording?: 'granted' | 'denied' | 'unknown'
  onSettingsChange?: (next: AgentsSettingsSnapshot) => void
}

export function AgentsSettingsSection({
  settings,
  providers = AGENTS_SETTINGS_PREVIEW_PROVIDERS,
  portError = null,
  assistantAdvancedOpen = false,
  mcpAdvancedOpen = false,
  runtimeAdvancedOpen = false,
  diagnosticsAdvancedOpen = false,
  showComputerUsePermissions = false,
  computerUseAccessibility = 'unknown',
  computerUseScreenRecording = 'denied',
  onSettingsChange,
}: Props): ReactElement {
  const agentsSectionRef = useRef<HTMLDivElement>(null)
  const skillSectionRef = useRef<HTMLDivElement>(null)
  const mcpSectionRef = useRef<HTMLDivElement>(null)
  const permissionsSectionRef = useRef<HTMLDivElement>(null)
  const [showRuntimeToken, setShowRuntimeToken] = useState(false)

  const patch = (next: Partial<AgentsSettingsSnapshot>): void => {
    onSettingsChange?.({ ...settings, ...next })
  }

  const activeProvider =
    providers.find((item) => item.id === settings.providerId) ?? providers[0]
  const activeProviderModels = activeProvider?.models ?? []

  const scrollToSection = (target: 'agents' | 'skill' | 'mcp' | 'permissions'): void => {
    const refs = {
      agents: agentsSectionRef,
      skill: skillSectionRef,
      mcp: mcpSectionRef,
      permissions: permissionsSectionRef,
    }
    refs[target].current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const modelContext = {
    modelLabel: 'deepseek-v4-pro',
    contextWindowLabel: formatTokenNumber(1_000_000),
    softThresholdLabel: formatTokenNumber(980_000),
    hardThresholdLabel: formatTokenNumber(990_000),
    sourceLabel: AGENTS_SETTINGS_KUN_MODEL_CONTEXT_SOURCE_BUILT_IN,
  }

  return (
    <>
      <div className="agents-settings-jump-row">
        <SectionJumpButton label={AGENTS_SETTINGS_AGENTS_QUICK_BASE} onClick={() => scrollToSection('agents')} />
        <SectionJumpButton label={AGENTS_SETTINGS_AGENTS_QUICK_SKILL} onClick={() => scrollToSection('skill')} />
        <SectionJumpButton label={AGENTS_SETTINGS_AGENTS_QUICK_MCP} onClick={() => scrollToSection('mcp')} />
        <SectionJumpButton
          label={AGENTS_SETTINGS_AGENTS_QUICK_PERMISSIONS}
          onClick={() => scrollToSection('permissions')}
        />
      </div>

      <div ref={agentsSectionRef}>
        <SettingsCard title={AGENTS_SETTINGS_AGENTS}>
          <SettingRow
            title={AGENTS_SETTINGS_AUTO_START}
            description={AGENTS_SETTINGS_AUTO_START_DESC}
            control={
              <Toggle
                checked={settings.autoStart}
                onChange={(autoStart) => patch({ autoStart })}
              />
            }
          />
          <SettingRow
            title={AGENTS_SETTINGS_KUN_PROVIDER}
            description={AGENTS_SETTINGS_KUN_PROVIDER_SELECT_DESC}
            control={
              <select
                className={SETTINGS_SELECT_CLASS}
                value={activeProvider?.id ?? settings.providerId}
                onChange={(e) => patch({ providerId: e.target.value })}
              >
                {providers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            }
          />
          <SettingRow
            title={AGENTS_SETTINGS_KUN_MODEL}
            description={AGENTS_SETTINGS_KUN_MODEL_DESC}
            control={
              <ModelSelect
                value={settings.model}
                options={activeProviderModels}
                optionLabel={(model) =>
                  model === activeProviderModels[0]
                    ? formatAgentsSettingsModelSelectDefaultSuffix(model)
                    : model}
                allowCustom
                customLabel={AGENTS_SETTINGS_MODEL_SELECT_CUSTOM_OPTION}
                customPlaceholder={AGENTS_SETTINGS_MODEL_SELECT_CUSTOM_PLACEHOLDER}
                selectClassName={SETTINGS_SELECT_CLASS}
                onChange={(model) => {
                  const next = model.trim()
                  patch({ model: next || (activeProviderModels[0] ?? settings.model) })
                }}
              />
            }
          />
          <SettingRow
            title={AGENTS_SETTINGS_CODE_PROMPT_PREFIX}
            description={AGENTS_SETTINGS_CODE_PROMPT_PREFIX_DESC}
            wideControl
            control={
              <textarea
                value={settings.codePromptPrefix}
                onChange={(e) => patch({ codePromptPrefix: e.target.value })}
                placeholder={AGENTS_SETTINGS_CODE_PROMPT_PREFIX_PLACEHOLDER}
                className="agents-settings-textarea"
              />
            }
          />
          <div className="agents-settings-disclosure-wrap">
            <AdvancedSettingsDisclosure
              title={AGENTS_SETTINGS_KUN_ASSISTANT_ADVANCED}
              description={AGENTS_SETTINGS_KUN_ASSISTANT_ADVANCED_DESC}
              defaultOpen={assistantAdvancedOpen}
            >
              <div className="agents-settings-disclosure-rows">
                <SettingRow
                  title={AGENTS_SETTINGS_PORT}
                  description={AGENTS_SETTINGS_PORT_DESC}
                  control={
                    <div>
                      <input
                        type="number"
                        min={1}
                        max={65535}
                        className={`agents-settings-number-input is-compact ${portError ? 'is-error' : ''}`}
                        value={settings.port}
                        onChange={(e) => patch({ port: Number(e.target.value) })}
                      />
                      {portError ? (
                        <p className="agents-settings-field-error">{portError}</p>
                      ) : null}
                    </div>
                  }
                />
                <SettingRow
                  title={AGENTS_SETTINGS_KUN_BINARY}
                  description={AGENTS_SETTINGS_KUN_BINARY_DESC}
                  control={
                    <input
                      className="agents-settings-text-input"
                      placeholder={AGENTS_SETTINGS_KUN_BINARY_PLACEHOLDER}
                      value={settings.binaryPath}
                      onChange={(e) => patch({ binaryPath: e.target.value })}
                    />
                  }
                />
                <SettingRow
                  title={AGENTS_SETTINGS_KUN_DATA_DIR}
                  description={AGENTS_SETTINGS_KUN_DATA_DIR_DESC}
                  control={
                    <input
                      className="agents-settings-text-input"
                      value={settings.dataDir}
                      onChange={(e) => patch({ dataDir: e.target.value })}
                    />
                  }
                />
                <SettingRow
                  title={AGENTS_SETTINGS_RUNTIME_TOKEN}
                  description={AGENTS_SETTINGS_RUNTIME_TOKEN_DESC}
                  control={
                    <SettingsSecretInput
                      value={settings.runtimeToken}
                      onChange={(runtimeToken) => patch({ runtimeToken })}
                      visible={showRuntimeToken}
                      onToggleVisibility={() => setShowRuntimeToken((value) => !value)}
                      showLabel={AGENTS_SETTINGS_SHOW_SECRET}
                      hideLabel={AGENTS_SETTINGS_HIDE_SECRET}
                      className="agents-settings-secret-input"
                    />
                  }
                />
                <SettingRow
                  title={AGENTS_SETTINGS_KUN_INSECURE}
                  description={
                    settings.runtimeToken.trim()
                      ? AGENTS_SETTINGS_KUN_INSECURE_DESC
                      : AGENTS_SETTINGS_KUN_INSECURE_FORCED_DESC
                  }
                  control={
                    <Toggle
                      checked={settings.insecure}
                      disabled={!settings.runtimeToken.trim()}
                      onChange={(insecure) => patch({ insecure })}
                    />
                  }
                />
              </div>
            </AdvancedSettingsDisclosure>
          </div>
          <SettingRow
            title={AGENTS_SETTINGS_KUN_TOKEN_ECONOMY}
            description={AGENTS_SETTINGS_KUN_TOKEN_ECONOMY_DESC}
            control={
              <div className="agents-settings-token-economy-control">
                <Toggle
                  checked={settings.tokenEconomyEnabled}
                  onChange={(tokenEconomyEnabled) => patch({ tokenEconomyEnabled })}
                />
                {settings.tokenEconomyEnabled ? (
                  <div className="agents-settings-savings-pill">
                    {settings.tokenEconomySavingsTokens != null ? (
                      <span>
                        {formatAgentsSettingsTokenEconomySavings(
                          formatCompactNumber(settings.tokenEconomySavingsTokens),
                        )}
                      </span>
                    ) : settings.tokenEconomyLoading ? (
                      <span>{AGENTS_SETTINGS_KUN_TOKEN_ECONOMY_SAVINGS_LOADING}</span>
                    ) : (
                      <span>{AGENTS_SETTINGS_KUN_TOKEN_ECONOMY_SAVINGS_EMPTY}</span>
                    )}
                  </div>
                ) : null}
              </div>
            }
          />
        </SettingsCard>
      </div>

      <div className="agents-settings-section-gap" ref={permissionsSectionRef}>
        <SettingsCard title={AGENTS_SETTINGS_PERMISSIONS}>
          <div className="agents-settings-notice-wrap">
            <InlineNoticeView notice={{ tone: 'info', message: AGENTS_SETTINGS_PERMISSIONS_BEHAVIOR_HINT }} />
          </div>
          <SettingRow
            title={AGENTS_SETTINGS_APPROVAL_POLICY}
            description={AGENTS_SETTINGS_APPROVAL_POLICY_DESC}
            control={
              <select
                className={SETTINGS_SELECT_CLASS}
                value={settings.approvalPolicy}
                onChange={(e) => patch({ approvalPolicy: e.target.value as ApprovalPolicy })}
              >
                <option value="auto">{AGENTS_SETTINGS_APPROVAL_AUTO}</option>
                <option value="on-request">{AGENTS_SETTINGS_APPROVAL_ON_REQUEST}</option>
                <option value="untrusted">{AGENTS_SETTINGS_APPROVAL_UNTRUSTED}</option>
                <option value="suggest">{AGENTS_SETTINGS_APPROVAL_SUGGEST}</option>
                <option value="never">{AGENTS_SETTINGS_APPROVAL_NEVER}</option>
              </select>
            }
          />
          <SettingRow
            title={AGENTS_SETTINGS_SANDBOX_MODE}
            description={AGENTS_SETTINGS_SANDBOX_MODE_DESC}
            control={
              <select
                className={SETTINGS_SELECT_CLASS}
                value={settings.sandboxMode}
                onChange={(e) => patch({ sandboxMode: e.target.value as SandboxMode })}
              >
                <option value="workspace-write">{AGENTS_SETTINGS_SANDBOX_WORKSPACE_WRITE}</option>
                <option value="read-only">{AGENTS_SETTINGS_SANDBOX_READ_ONLY}</option>
                <option value="danger-full-access">{AGENTS_SETTINGS_SANDBOX_FULL_ACCESS}</option>
                <option value="external-sandbox">{AGENTS_SETTINGS_SANDBOX_EXTERNAL}</option>
              </select>
            }
          />
        </SettingsCard>
      </div>

      <div className="agents-settings-section-gap">
        <SettingsCard title={AGENTS_SETTINGS_COMPUTER_USE_TITLE}>
          <div className="agents-settings-notice-wrap">
            <InlineNoticeView notice={{ tone: 'info', message: AGENTS_SETTINGS_COMPUTER_USE_HINT }} />
          </div>
          <div className="agents-settings-amber-banner">
            <div className="agents-settings-amber-banner-title">{AGENTS_SETTINGS_COMPUTER_USE_MODEL_QUALITY_TITLE}</div>
            <div className="agents-settings-amber-banner-body">{AGENTS_SETTINGS_COMPUTER_USE_MODEL_QUALITY_BODY}</div>
          </div>
          <SettingRow
            title={AGENTS_SETTINGS_COMPUTER_USE_ENABLE}
            description={AGENTS_SETTINGS_COMPUTER_USE_ENABLE_DESC}
            control={
              <Toggle
                checked={settings.computerUseEnabled}
                onChange={(computerUseEnabled) => patch({ computerUseEnabled })}
              />
            }
          />
          {settings.computerUseEnabled ? (
            <>
              <SettingRow
                title={AGENTS_SETTINGS_COMPUTER_USE_MODE}
                description={AGENTS_SETTINGS_COMPUTER_USE_MODE_DESC}
                control={
                  <select
                    className={SETTINGS_SELECT_CLASS}
                    value={settings.computerUseMode}
                    onChange={(e) =>
                      patch({ computerUseMode: e.target.value as AgentsSettingsSnapshot['computerUseMode'] })
                    }
                  >
                    <option value="auto">{AGENTS_SETTINGS_COMPUTER_USE_MODE_AUTO}</option>
                    <option value="always">{AGENTS_SETTINGS_COMPUTER_USE_MODE_ALWAYS}</option>
                    <option value="off">{AGENTS_SETTINGS_COMPUTER_USE_MODE_OFF}</option>
                  </select>
                }
              />
              {showComputerUsePermissions ? (
                <SettingRow
                  title={AGENTS_SETTINGS_COMPUTER_USE_PERMISSIONS}
                  description={AGENTS_SETTINGS_COMPUTER_USE_PERMISSIONS_DESC}
                  control={
                    <div className="agents-settings-permissions-control">
                      <div className="agents-settings-permission-badges">
                        <span className={permissionBadgeClass(computerUseAccessibility)}>
                          {AGENTS_SETTINGS_COMPUTER_USE_ACCESSIBILITY}: {AGENTS_SETTINGS_COMPUTER_USE_PERMISSION_GRANTED}
                        </span>
                        <span className={permissionBadgeClass(computerUseScreenRecording)}>
                          {AGENTS_SETTINGS_COMPUTER_USE_SCREEN_RECORDING}: {AGENTS_SETTINGS_COMPUTER_USE_PERMISSION_DENIED}
                        </span>
                      </div>
                      <div className="agents-settings-permission-actions">
                        <button type="button" className="agents-settings-permission-btn">
                          {AGENTS_SETTINGS_COMPUTER_USE_GRANT_ACCESSIBILITY}
                        </button>
                        <button type="button" className="agents-settings-permission-btn">
                          {AGENTS_SETTINGS_COMPUTER_USE_GRANT_SCREEN_RECORDING}
                        </button>
                        <button type="button" className="agents-settings-permission-btn">
                          {AGENTS_SETTINGS_COMPUTER_USE_RECHECK}
                        </button>
                      </div>
                    </div>
                  }
                />
              ) : null}
            </>
          ) : null}
        </SettingsCard>
      </div>

      <div className="agents-settings-section-gap">
        <SettingsCard title={AGENTS_SETTINGS_DESIGN_QUALITY_TITLE}>
          <div className="agents-settings-notice-wrap">
            <InlineNoticeView notice={{ tone: 'info', message: AGENTS_SETTINGS_DESIGN_QUALITY_HINT }} />
          </div>
          <SettingRow
            title={AGENTS_SETTINGS_DESIGN_QUALITY_ENABLE}
            description={AGENTS_SETTINGS_DESIGN_QUALITY_ENABLE_DESC}
            control={
              <Toggle
                checked={settings.qualityEnabled}
                onChange={(qualityEnabled) => patch({ qualityEnabled })}
              />
            }
          />
          {settings.qualityEnabled ? (
            <SettingRow
              title={AGENTS_SETTINGS_DESIGN_QUALITY_STRICTNESS}
              description={AGENTS_SETTINGS_DESIGN_QUALITY_STRICTNESS_DESC}
              control={
                <select
                  className={SETTINGS_SELECT_CLASS}
                  value={settings.qualityStrictness}
                  onChange={(e) =>
                    patch({ qualityStrictness: e.target.value as AgentsSettingsSnapshot['qualityStrictness'] })
                  }
                >
                  <option value="relaxed">{AGENTS_SETTINGS_DESIGN_QUALITY_STRICTNESS_RELAXED}</option>
                  <option value="standard">{AGENTS_SETTINGS_DESIGN_QUALITY_STRICTNESS_STANDARD}</option>
                  <option value="strict">{AGENTS_SETTINGS_DESIGN_QUALITY_STRICTNESS_STRICT}</option>
                </select>
              }
            />
          ) : null}
        </SettingsCard>
      </div>

      <div className="agents-settings-section-gap" ref={skillSectionRef}>
        <SettingsCard title={AGENTS_SETTINGS_SKILL}>
          <SettingRow
            title={AGENTS_SETTINGS_SKILLS_DETECTED_DIRS}
            description={AGENTS_SETTINGS_SKILLS_DETECTED_DIRS_DESC}
            wideControl
            control={
              <div className="agents-settings-skill-roots">
                {settings.skillRootsLoading && settings.skillRoots.length === 0 ? (
                  <div className="agents-settings-skill-empty">{AGENTS_SETTINGS_LOADING}</div>
                ) : settings.skillRoots.length === 0 ? (
                  <div className="agents-settings-skill-empty">{AGENTS_SETTINGS_SKILLS_DETECTED_DIRS_EMPTY}</div>
                ) : (
                  settings.skillRoots.map((root) => (
                    <div
                      key={`${root.id}:${root.path}`}
                      className={
                        root.enabled
                          ? 'agents-settings-skill-root is-enabled'
                          : 'agents-settings-skill-root is-disabled'
                      }
                    >
                      <div className="agents-settings-skill-root-copy">
                        <div className="agents-settings-skill-root-header">
                          <span className="agents-settings-skill-root-label">
                            {root.label ?? skillRootShortLabel(root.path)}
                          </span>
                          <span className="agents-settings-skill-scope-pill">
                            {root.scope === 'project'
                              ? AGENTS_SETTINGS_SKILLS_SCOPE_PROJECT
                              : AGENTS_SETTINGS_SKILLS_SCOPE_GLOBAL}
                          </span>
                          {root.exists ? (
                            <span className="agents-settings-skill-count-pill">
                              {formatAgentsSettingsSkillsDirSkillCount(root.skillCount)}
                            </span>
                          ) : (
                            <span className="agents-settings-skill-missing-pill">
                              {AGENTS_SETTINGS_SKILLS_DIR_NOT_FOUND}
                            </span>
                          )}
                        </div>
                        <code className="agents-settings-skill-path">{root.path}</code>
                      </div>
                      <div className="agents-settings-skill-root-actions">
                        <button
                          type="button"
                          className="agents-settings-skill-open-btn"
                          aria-label={AGENTS_SETTINGS_SKILLS_OPEN_ROOT}
                          title={AGENTS_SETTINGS_SKILLS_OPEN_ROOT}
                        >
                          <FolderOpen className="agents-settings-skill-open-icon" strokeWidth={1.8} />
                        </button>
                        <Toggle
                          checked={root.enabled}
                          onChange={(enabled) => {
                            patch({
                              skillRoots: settings.skillRoots.map((item) =>
                                item.id === root.id ? { ...item, enabled } : item,
                              ),
                            })
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            }
          />
          <SettingRow
            title={AGENTS_SETTINGS_SKILLS_SCAN_DIRS}
            description={AGENTS_SETTINGS_SKILLS_SCAN_DIRS_DESC}
            wideControl
            control={
              <textarea
                value={settings.extraSkillDirs}
                onChange={(e) => patch({ extraSkillDirs: e.target.value })}
                spellCheck={false}
                placeholder="~/.agents/skills"
                className="agents-settings-textarea is-mono"
              />
            }
          />
          <SettingRow
            title={AGENTS_SETTINGS_SKILLS_ACTIONS}
            description={AGENTS_SETTINGS_SKILLS_ACTIONS_DESC}
            wideControl
            control={
              <div className="agents-settings-skill-actions">
                <button type="button" className="agents-settings-primary-btn">
                  <Settings className="agents-settings-primary-btn-icon" strokeWidth={1.75} />
                  {AGENTS_SETTINGS_SKILLS_OPEN_PLUGINS}
                </button>
              </div>
            }
          />
        </SettingsCard>
      </div>

      <div className="agents-settings-section-gap" ref={mcpSectionRef}>
        <SettingsCard title={AGENTS_SETTINGS_MCP}>
          <SettingRow
            title={AGENTS_SETTINGS_MCP_SEARCH_ENABLED}
            description={AGENTS_SETTINGS_MCP_SEARCH_ENABLED_DESC}
            control={
              <Toggle
                checked={settings.mcpSearchEnabled}
                onChange={(mcpSearchEnabled) => patch({ mcpSearchEnabled })}
              />
            }
          />
          <div className="agents-settings-disclosure-wrap">
            <AdvancedSettingsDisclosure
              title={AGENTS_SETTINGS_MCP_ADVANCED}
              description={AGENTS_SETTINGS_MCP_ADVANCED_DESC}
              defaultOpen={mcpAdvancedOpen}
            >
              <div className="agents-settings-disclosure-rows">
                <SettingRow
                  title={AGENTS_SETTINGS_MCP_SEARCH_MODE}
                  description={AGENTS_SETTINGS_MCP_SEARCH_MODE_DESC}
                  control={
                    <select
                      className={SETTINGS_SELECT_CLASS}
                      value={settings.mcpSearchMode}
                      disabled={!settings.mcpSearchEnabled}
                      onChange={(e) =>
                        patch({ mcpSearchMode: e.target.value as AgentsSettingsSnapshot['mcpSearchMode'] })
                      }
                    >
                      <option value="auto">{AGENTS_SETTINGS_MCP_SEARCH_MODE_AUTO}</option>
                      <option value="search">{AGENTS_SETTINGS_MCP_SEARCH_MODE_SEARCH}</option>
                      <option value="direct">{AGENTS_SETTINGS_MCP_SEARCH_MODE_DIRECT}</option>
                    </select>
                  }
                />
                <SettingRow
                  title={AGENTS_SETTINGS_MCP_SEARCH_LIMITS}
                  description={AGENTS_SETTINGS_MCP_SEARCH_LIMITS_DESC}
                  wideControl
                  control={
                    <div className="agents-settings-mcp-grid">
                      {[
                        ['mcpAutoThreshold', AGENTS_SETTINGS_MCP_SEARCH_AUTO_THRESHOLD, settings.mcpAutoThreshold],
                        ['mcpTopKDefault', AGENTS_SETTINGS_MCP_SEARCH_TOP_K_DEFAULT, settings.mcpTopKDefault],
                        ['mcpTopKMax', AGENTS_SETTINGS_MCP_SEARCH_TOP_K_MAX, settings.mcpTopKMax],
                        ['mcpMinScore', AGENTS_SETTINGS_MCP_SEARCH_MIN_SCORE, settings.mcpMinScore],
                      ].map(([key, label, value]) => (
                        <label key={key} className="agents-settings-field-label">
                          {label}
                          <input
                            type="number"
                            className="agents-settings-number-input"
                            value={value}
                            disabled={!settings.mcpSearchEnabled}
                            onChange={(e) => patch({ [key]: Number(e.target.value) } as Partial<AgentsSettingsSnapshot>)}
                          />
                        </label>
                      ))}
                    </div>
                  }
                />
                <SettingRow
                  title={AGENTS_SETTINGS_MCP_SEARCH_DIAGNOSTICS}
                  description={AGENTS_SETTINGS_MCP_SEARCH_DIAGNOSTICS_DESC}
                  wideControl
                  control={
                    <div className="agents-settings-diagnostics-grid is-three">
                      <div className="agents-settings-diagnostics-cell">
                        {AGENTS_SETTINGS_MCP_SEARCH_STATUS}:{' '}
                        <span className="agents-settings-mono">
                          {settings.mcpSearchActive ? AGENTS_SETTINGS_MCP_SEARCH_ACTIVE : AGENTS_SETTINGS_MCP_SEARCH_INACTIVE}
                        </span>
                      </div>
                      <div className="agents-settings-diagnostics-cell">
                        {AGENTS_SETTINGS_MCP_SEARCH_INDEXED}:{' '}
                        <span className="agents-settings-mono">{settings.mcpIndexedTools}</span>
                      </div>
                      <div className="agents-settings-diagnostics-cell">
                        {AGENTS_SETTINGS_MCP_SEARCH_ADVERTISED}:{' '}
                        <span className="agents-settings-mono">{settings.mcpAdvertisedTools}</span>
                      </div>
                    </div>
                  }
                />
                <SettingRow
                  title={AGENTS_SETTINGS_CONFIG_FILE_PATH}
                  description={AGENTS_SETTINGS_MCP_PATH_DESC}
                  control={
                    <div className="agents-settings-path-display">
                      <code className="agents-settings-path-code">{settings.mcpConfigPath}</code>
                    </div>
                  }
                />
                <SettingRow
                  title={AGENTS_SETTINGS_MCP_EDITOR}
                  description={AGENTS_SETTINGS_MCP_EDITOR_DESC}
                  wideControl
                  control={
                    <div className="agents-settings-mcp-editor">
                      <div className="agents-settings-mcp-status">
                        {settings.mcpConfigExists
                          ? AGENTS_SETTINGS_MCP_FILE_STATUS_READY
                          : AGENTS_SETTINGS_MCP_FILE_STATUS_MISSING}
                      </div>
                      <textarea
                        value={settings.mcpConfigText}
                        onChange={(e) => patch({ mcpConfigText: e.target.value })}
                        spellCheck={false}
                        className="agents-settings-textarea is-mono is-tall"
                      />
                    </div>
                  }
                />
                <SettingRow
                  title={AGENTS_SETTINGS_MCP_ACTIONS}
                  description={AGENTS_SETTINGS_MCP_RUNTIME_HINT}
                  wideControl
                  control={
                    <div className="agents-settings-mcp-actions">
                      <button
                        type="button"
                        disabled={settings.mcpBusy || settings.mcpLoading}
                        className="agents-settings-primary-btn"
                      >
                        {settings.mcpBusy ? (
                          <Loader2 className="agents-settings-primary-btn-icon is-spinning" strokeWidth={2} />
                        ) : null}
                        {AGENTS_SETTINGS_MCP_SAVE}
                      </button>
                      <button
                        type="button"
                        disabled={settings.mcpBusy || settings.mcpLoading}
                        className="agents-settings-secondary-btn"
                      >
                        <RefreshCw
                          className={`agents-settings-secondary-btn-icon ${settings.mcpLoading ? 'is-spinning' : ''}`}
                          strokeWidth={1.75}
                        />
                        {AGENTS_SETTINGS_MCP_RELOAD}
                      </button>
                      <button type="button" className="agents-settings-secondary-btn">
                        <FolderOpen className="agents-settings-secondary-btn-icon" strokeWidth={1.75} />
                        {AGENTS_SETTINGS_MCP_OPEN_DIR}
                      </button>
                    </div>
                  }
                />
              </div>
            </AdvancedSettingsDisclosure>
          </div>
        </SettingsCard>
      </div>

      <div className="agents-settings-section-gap">
        <SettingsCard title={AGENTS_SETTINGS_KUN_ADVANCED}>
          <div className="agents-settings-disclosure-wrap">
            <AdvancedSettingsDisclosure
              title={AGENTS_SETTINGS_KUN_ADVANCED_DETAILS}
              description={AGENTS_SETTINGS_KUN_ADVANCED_DETAILS_DESC}
              defaultOpen={runtimeAdvancedOpen}
            >
              <div className="agents-settings-disclosure-rows">
                <SettingRow
                  title={AGENTS_SETTINGS_KUN_TOKEN_ECONOMY_OPTIONS}
                  description={AGENTS_SETTINGS_KUN_TOKEN_ECONOMY_OPTIONS_DESC}
                  wideControl
                  control={
                    <div className="agents-settings-toggle-grid is-three">
                      {(
                        [
                          ['compressToolDescriptions', AGENTS_SETTINGS_KUN_COMPRESS_TOOL_DESCRIPTIONS, settings.compressToolDescriptions],
                          ['compressToolResults', AGENTS_SETTINGS_KUN_COMPRESS_TOOL_RESULTS, settings.compressToolResults],
                          ['conciseResponses', AGENTS_SETTINGS_KUN_CONCISE_RESPONSES, settings.conciseResponses],
                        ] as const
                      ).map(([key, label, checked]) => (
                        <label key={key} className="agents-settings-toggle-card">
                          <span>{label}</span>
                          <Toggle
                            checked={checked}
                            disabled={!settings.tokenEconomyEnabled}
                            onChange={(value) => patch({ [key]: value } as Partial<AgentsSettingsSnapshot>)}
                          />
                        </label>
                      ))}
                    </div>
                  }
                />
                <SettingRow
                  title={AGENTS_SETTINGS_KUN_MODEL_CONTEXT_PROFILE}
                  description={AGENTS_SETTINGS_KUN_MODEL_CONTEXT_PROFILE_DESC}
                  wideControl
                  control={
                    <div className="agents-settings-context-grid">
                      {[
                        [AGENTS_SETTINGS_KUN_MODEL_CONTEXT_MODEL, modelContext.modelLabel, modelContext.sourceLabel],
                        [AGENTS_SETTINGS_KUN_MODEL_CONTEXT_WINDOW, modelContext.contextWindowLabel, null],
                        [AGENTS_SETTINGS_KUN_MODEL_CONTEXT_SOFT, modelContext.softThresholdLabel, null],
                        [AGENTS_SETTINGS_KUN_MODEL_CONTEXT_HARD, modelContext.hardThresholdLabel, null],
                      ].map(([label, value, sub]) => (
                        <div key={label} className="agents-settings-context-card">
                          <div className="agents-settings-context-label">{label}</div>
                          <div className="agents-settings-context-value">{value}</div>
                          {sub ? <div className="agents-settings-context-sub">{sub}</div> : null}
                        </div>
                      ))}
                    </div>
                  }
                />
                <SettingRow
                  title={AGENTS_SETTINGS_KUN_STORAGE_BACKEND}
                  description={AGENTS_SETTINGS_KUN_STORAGE_BACKEND_DESC}
                  control={
                    <select
                      className={SETTINGS_SELECT_CLASS}
                      value={settings.storageBackend}
                      onChange={(e) =>
                        patch({ storageBackend: e.target.value as AgentsSettingsSnapshot['storageBackend'] })
                      }
                    >
                      <option value="hybrid">{AGENTS_SETTINGS_KUN_STORAGE_HYBRID}</option>
                      <option value="file">{AGENTS_SETTINGS_KUN_STORAGE_FILE}</option>
                    </select>
                  }
                />
                <SettingRow
                  title={AGENTS_SETTINGS_KUN_STREAM_IDLE_TIMEOUT}
                  description={AGENTS_SETTINGS_KUN_STREAM_IDLE_TIMEOUT_DESC}
                  control={
                    <input
                      type="number"
                      min={0}
                      max={3600000}
                      step={1000}
                      className="agents-settings-number-input is-compact"
                      value={settings.streamIdleTimeoutMs}
                      onChange={(e) => patch({ streamIdleTimeoutMs: Number(e.target.value) })}
                    />
                  }
                />
                <SettingRow
                  title={AGENTS_SETTINGS_KUN_TOOL_STORM}
                  description={AGENTS_SETTINGS_KUN_TOOL_STORM_DESC}
                  control={
                    <Toggle
                      checked={settings.toolStormEnabled}
                      onChange={(toolStormEnabled) => patch({ toolStormEnabled })}
                    />
                  }
                />
              </div>
            </AdvancedSettingsDisclosure>
          </div>
        </SettingsCard>
      </div>

      <div className="agents-settings-section-gap">
        <SettingsCard title={AGENTS_SETTINGS_KUN_DIAGNOSTICS}>
          <div className="agents-settings-disclosure-wrap">
            <AdvancedSettingsDisclosure
              title={AGENTS_SETTINGS_KUN_DIAGNOSTICS_ADVANCED}
              description={AGENTS_SETTINGS_KUN_DIAGNOSTICS_ADVANCED_DESC}
              defaultOpen={diagnosticsAdvancedOpen}
            >
              <div className="agents-settings-disclosure-rows">
                <SettingRow
                  title={AGENTS_SETTINGS_KUN_RUNTIME_CAPABILITIES}
                  description={AGENTS_SETTINGS_KUN_RUNTIME_CAPABILITIES_DESC}
                  wideControl
                  control={
                    <div className="agents-settings-runtime-diagnostics">
                      <div className="agents-settings-capability-pills">
                        {settings.runtimeCapabilities.map((item) => (
                          <span key={item.label} className={statusPillClass(item.status)}>
                            {item.label}
                            <span className="agents-settings-capability-status">{item.status}</span>
                          </span>
                        ))}
                      </div>
                      <div className="agents-settings-diagnostics-grid">
                        <div className="agents-settings-diagnostics-cell">
                          {AGENTS_SETTINGS_KUN_RUNTIME_MODEL}:{' '}
                          <span className="agents-settings-mono">{settings.runtimeModel}</span>
                        </div>
                        <div className="agents-settings-diagnostics-cell">
                          {AGENTS_SETTINGS_KUN_RUNTIME_PID}:{' '}
                          <span className="agents-settings-mono">{settings.runtimePid}</span>
                        </div>
                        <div className="agents-settings-diagnostics-cell">
                          MCP:{' '}
                          <span className="agents-settings-mono">
                            {settings.mcpConnected}/{settings.mcpConfigured}
                          </span>
                        </div>
                        <div className="agents-settings-diagnostics-cell">
                          Web: <span className="agents-settings-mono">{settings.webProvider}</span>
                        </div>
                      </div>
                      <button type="button" className="agents-settings-secondary-btn">
                        <RefreshCw
                          className={`agents-settings-secondary-btn-icon ${settings.diagnosticsBusy ? 'is-spinning' : ''}`}
                          strokeWidth={1.75}
                        />
                        {AGENTS_SETTINGS_KUN_DIAGNOSTICS_REFRESH}
                      </button>
                    </div>
                  }
                />
                <SettingRow
                  title={AGENTS_SETTINGS_KUN_TOOL_DIAGNOSTICS}
                  description={AGENTS_SETTINGS_KUN_TOOL_DIAGNOSTICS_DESC}
                  wideControl
                  control={
                    <div className="agents-settings-diagnostics-grid">
                      <div className="agents-settings-diagnostics-cell">
                        {AGENTS_SETTINGS_KUN_DIAGNOSTICS_PROVIDERS}:{' '}
                        <span className="agents-settings-mono">{settings.toolProviderCount}</span>
                      </div>
                      <div className="agents-settings-diagnostics-cell">
                        {AGENTS_SETTINGS_KUN_DIAGNOSTICS_MCP_SERVERS}:{' '}
                        <span className="agents-settings-mono">{settings.toolMcpServerCount}</span>
                      </div>
                      <div className="agents-settings-diagnostics-cell">
                        {AGENTS_SETTINGS_KUN_DIAGNOSTICS_SKILLS}:{' '}
                        <span className="agents-settings-mono">{settings.toolSkillCount}</span>
                      </div>
                      <div className="agents-settings-diagnostics-cell">
                        {AGENTS_SETTINGS_KUN_DIAGNOSTICS_ATTACHMENTS}:{' '}
                        <span className="agents-settings-mono">{settings.toolAttachmentCount}</span>
                      </div>
                    </div>
                  }
                />
                <SettingRow
                  title={AGENTS_SETTINGS_KUN_MEMORY_RECORDS}
                  description={AGENTS_SETTINGS_KUN_MEMORY_RECORDS_DESC}
                  wideControl
                  control={
                    <div className="agents-settings-memory-list">
                      {settings.memoryRecords.length === 0 ? (
                        <div className="agents-settings-skill-empty">{AGENTS_SETTINGS_KUN_MEMORY_EMPTY}</div>
                      ) : (
                        settings.memoryRecords.map((memory) => (
                          <div key={memory.id} className="agents-settings-memory-row">
                            <div className="agents-settings-memory-copy">
                              <div className="agents-settings-memory-content">{memory.content}</div>
                              <div className="agents-settings-memory-meta">
                                <span className="agents-settings-mono">{memory.scope}</span>
                                <span className="agents-settings-mono">{memory.id}</span>
                                {memory.disabledAt ? <span>{AGENTS_SETTINGS_KUN_MEMORY_DISABLED}</span> : null}
                                {memory.tags?.length ? <span>{memory.tags.join(', ')}</span> : null}
                              </div>
                            </div>
                            <div className="agents-settings-memory-actions">
                              <button
                                type="button"
                                disabled={Boolean(memory.disabledAt)}
                                className="agents-settings-icon-btn"
                                aria-label={AGENTS_SETTINGS_KUN_MEMORY_DISABLE}
                                title={AGENTS_SETTINGS_KUN_MEMORY_DISABLE}
                              >
                                <Ban className="agents-settings-icon-btn-icon" strokeWidth={1.8} />
                              </button>
                              <button
                                type="button"
                                className="agents-settings-icon-btn is-danger"
                                aria-label={AGENTS_SETTINGS_KUN_MEMORY_DELETE}
                                title={AGENTS_SETTINGS_KUN_MEMORY_DELETE}
                              >
                                <Trash2 className="agents-settings-icon-btn-icon" strokeWidth={1.8} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  }
                />
              </div>
            </AdvancedSettingsDisclosure>
          </div>
        </SettingsCard>
      </div>
    </>
  )
}

export type AgentsPreviewMode =
  | 'default'
  | 'tokenEconomy'
  | 'skillsEmpty'
  | 'computerUse'
  | 'mcpAdvanced'
  | 'advanced'
  | 'portError'
  | 'diagnostics'

export function AgentsSettingsSectionPreview({
  mode = 'default',
}: {
  mode?: AgentsPreviewMode
}): ReactElement {
  const [settings, setSettings] = useState<AgentsSettingsSnapshot>(() => {
    if (mode === 'skillsEmpty') {
      return { ...AGENTS_SETTINGS_PREVIEW_DEFAULT, skillRoots: [] }
    }
    if (mode === 'tokenEconomy') {
      return {
        ...AGENTS_SETTINGS_PREVIEW_DEFAULT,
        tokenEconomyEnabled: true,
        tokenEconomySavingsTokens: 128_400,
      }
    }
    if (mode === 'computerUse') {
      return {
        ...AGENTS_SETTINGS_PREVIEW_DEFAULT,
        computerUseEnabled: true,
      }
    }
    return AGENTS_SETTINGS_PREVIEW_DEFAULT
  })

  return (
    <AgentsSettingsSection
      settings={settings}
      portError={mode === 'portError' ? 'Port must be between 1 and 65535.' : null}
      assistantAdvancedOpen={mode === 'advanced'}
      mcpAdvancedOpen={mode === 'mcpAdvanced' || mode === 'advanced'}
      runtimeAdvancedOpen={mode === 'advanced'}
      diagnosticsAdvancedOpen={mode === 'diagnostics' || mode === 'advanced'}
      showComputerUsePermissions={mode === 'computerUse'}
      computerUseAccessibility="granted"
      computerUseScreenRecording="denied"
      onSettingsChange={setSettings}
    />
  )
}
