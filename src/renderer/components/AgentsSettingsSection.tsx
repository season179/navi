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

const COPY = {
  agentsQuickBase: 'Assistant',
  agentsQuickSkill: 'Skills',
  agentsQuickMcp: 'External tools',
  agentsQuickPermissions: 'Access',
  agents: 'AI assistant',
  autoStart: 'Auto-start AI assistant service',
  autoStartDesc:
    'Recommended. The app starts the local assistant service automatically when chats, writing, or phone connections need it.',
  kunProvider: 'Model provider',
  kunProviderSelectDesc: 'Choose one of the configured providers from the Providers tab.',
  kunModel: 'Default model',
  kunModelDesc: 'Default model ID used by the AI assistant when a request does not choose one.',
  modelSelectDefaultSuffix: (model: string) => `${model} (default)`,
  modelSelectCustomOption: 'Custom model…',
  modelSelectCustomPlaceholder: 'Enter a model ID',
  codePromptPrefix: 'Code prompt prefix',
  codePromptPrefixDesc:
    'These instructions are injected before every Code mode conversation. Use for global rules, coding conventions, or persistent preferences.',
  codePromptPrefixPlaceholder:
    'Example: Always write unit tests for new code. Prefer functional components over class components. Use TypeScript strict mode conventions.',
  kunAssistantAdvanced: 'Assistant advanced settings',
  kunAssistantAdvancedDesc:
    'Model, assistant-only API, local port, and data path settings for advanced users.',
  port: 'Local port',
  portDesc: 'Port used by the local AI assistant service. Most users do not need to change it.',
  kunBinary: 'Custom assistant program path',
  kunBinaryDesc:
    'Usually leave this empty so the app uses the bundled assistant service. Set a path only for local development or debugging.',
  kunBinaryPlaceholder: 'e.g. /usr/local/bin/kun (optional)',
  kunDataDir: 'Assistant data folder',
  kunDataDirDesc:
    'Stores sessions, cache data, and the configuration synced from the app to the assistant service.',
  runtimeToken: 'Local access token (optional)',
  runtimeTokenDesc: 'Optional token required for other local programs to connect to the assistant service.',
  showSecret: 'Show',
  hideSecret: 'Hide',
  kunInsecure: 'Allow local access without a token',
  kunInsecureDesc:
    'For local development only. Other local programs can connect to the assistant service without an access token.',
  kunInsecureForcedDesc:
    'Local access protection is off because no access token is set. Add a token to control this switch again.',
  kunTokenEconomy: 'Reduce context usage',
  kunTokenEconomyDesc:
    'Reduce model context use by compacting safe tool descriptions and tool results without changing stored chat history.',
  kunTokenEconomySavings: (tokens: string) => `Saved about ${tokens} tokens`,
  kunTokenEconomySavingsLoading: 'Loading savings…',
  kunTokenEconomySavingsEmpty: 'Saved tokens will start accumulating after the next request.',
  permissions: 'Permissions',
  permissionsBehaviorHint:
    'Full access only controls which files and commands the AI assistant may reach. Confirmation is separate. By default, full access + automatic execution auto-allows approval requests.',
  approvalPolicy: 'Confirm before tool actions',
  approvalPolicyDesc:
    'Controls whether the AI assistant must ask before editing files, running commands, or using other tools. Changes apply on the next turn.',
  approvalAuto: 'Run automatically',
  approvalOnRequest: 'Ask when needed',
  approvalUntrusted: 'Ask for sensitive actions',
  approvalSuggest: 'Suggest only; do not change files',
  approvalNever: 'Do not run tools',
  sandboxMode: 'File access range',
  sandboxModeDesc:
    'Controls which local files the AI assistant can read or change, and whether it can run terminal commands.',
  sandboxWorkspaceWrite: 'Can edit workspace',
  sandboxReadOnly: 'Can only read files',
  sandboxFullAccess: 'Can access all files',
  sandboxExternal: 'External sandbox',
  computerUseTitle: 'Computer use (screen control)',
  computerUseHint:
    'Lets the agent see your screen and move the mouse / type on your behalf. It controls your real computer — enable only when you intend to supervise it, and you can stop a run at any time.',
  computerUseModelQualityTitle: 'Model quality note',
  computerUseModelQualityBody:
    'Chinese-mainland multimodal models currently struggle with screenshot-driven visual grounding and multi-step desktop control. For real use, prefer Claude or GPT-class vision models.',
  computerUseEnable: 'Enable computer use',
  computerUseEnableDesc:
    'Registers the computer_use tool so the agent can take screenshots and drive the mouse and keyboard.',
  computerUseMode: 'Availability',
  computerUseModeDesc:
    'Auto exposes the tool only to vision models. Always exposes it to every model. Off keeps it registered but hidden.',
  computerUseModeAuto: 'Auto (vision models only)',
  computerUseModeAlways: 'Always',
  computerUseModeOff: 'Off',
  computerUsePermissions: 'System permissions',
  computerUsePermissionsDesc:
    'macOS requires Accessibility (for mouse/keyboard) and Screen Recording (for screenshots). Grant both, then re-check.',
  computerUseAccessibility: 'Accessibility',
  computerUseScreenRecording: 'Screen Recording',
  computerUseGrantAccessibility: 'Grant Accessibility',
  computerUseGrantScreenRecording: 'Open Screen Recording settings',
  computerUseRecheck: 'Re-check',
  computerUsePermissionGranted: 'granted',
  computerUsePermissionDenied: 'not granted',
  designQualityTitle: 'Design quality',
  designQualityHint:
    'After the agent writes or edits a frontend file, Kun automatically scans for AI-generated design tells and craft issues and folds the findings back to the model.',
  designQualityEnable: 'Enable design self-check',
  designQualityEnableDesc: 'On by default. When off, writing/editing frontend files runs no design-quality scan.',
  designQualityStrictness: 'Strictness',
  designQualityStrictnessDesc:
    'Relaxed: only the most reliable AI tells. Standard: tells + general craft issues. Strict: adds heuristic rules.',
  designQualityStrictnessRelaxed: 'Relaxed',
  designQualityStrictnessStandard: 'Standard',
  designQualityStrictnessStrict: 'Strict',
  skill: 'Skills',
  skillsDetectedDirs: 'Skill directories',
  skillsDetectedDirsDesc:
    'Auto-detected .agents / .claude / .codex / skills folders (workspace + global) plus your extra folders below.',
  skillsDetectedDirsEmpty: 'No skill directories detected. Set a workspace, or add a folder below.',
  loading: 'Loading…',
  skillsScopeProject: 'Workspace',
  skillsScopeGlobal: 'Global',
  skillsDirNotFound: 'Not found',
  skillsDirSkillCount: (count: number) => `${count} skills`,
  skillsOpenRoot: 'Open directory',
  skillsScanDirs: 'Extra skill folders',
  skillsScanDirsDesc:
    'One local path per line. Phone connections and scheduled tasks can also use skills from these folders.',
  skillsActions: 'Skill management',
  skillsActionsDesc:
    'Create, install, and edit skills from Plugins > Skills. Settings keeps only folder-level options.',
  skillsOpenPlugins: 'Open Plugins',
  mcp: 'External tools',
  mcpSearchEnabled: 'Smart external tool selection',
  mcpSearchEnabledDesc:
    'When many external tools are connected, give the model only the most relevant tools to reduce pauses and context use.',
  mcpAdvanced: 'External tools advanced settings',
  mcpAdvancedDesc: 'Selection mode, candidate counts, connection config file, and save actions.',
  mcpSearchMode: 'Tool selection method',
  mcpSearchModeDesc:
    'Auto filters when many tools are connected; Always filter searches every time; Direct gives every tool to the model.',
  mcpSearchModeAuto: 'Auto (recommended)',
  mcpSearchModeSearch: 'Always filter',
  mcpSearchModeDirect: 'Direct (all tools)',
  mcpSearchLimits: 'Filter counts',
  mcpSearchLimitsDesc:
    'Control how many tools trigger filtering and how many candidate tools are offered each time.',
  mcpSearchAutoThreshold: 'Start filtering after this many tools',
  mcpSearchTopKDefault: 'Default candidates',
  mcpSearchTopKMax: 'Maximum candidates',
  mcpSearchMinScore: 'Minimum match',
  mcpSearchDiagnostics: 'Tool selection status',
  mcpSearchDiagnosticsDesc: 'See whether external tool filtering is active and how many tools are available.',
  mcpSearchStatus: 'Status',
  mcpSearchActive: 'active',
  mcpSearchInactive: 'inactive',
  mcpSearchIndexed: 'Filterable tools',
  mcpSearchAdvertised: 'Offered to model',
  configFilePath: 'Config file path',
  mcpPathDesc: 'Location of the external tool connection config file.',
  mcpEditor: 'External tool config',
  mcpEditorDesc:
    'Edit MCP external tool server connections here. Model, API key, and service URL do not live in this file.',
  mcpFileStatusReady: 'The current content was loaded from the config file.',
  mcpFileStatusMissing: 'The config file does not exist yet. It will be created on first save.',
  mcpActions: 'External tool actions',
  mcpRuntimeHint: 'If saved changes do not take effect, restart the local assistant service or reopen the app.',
  mcpSave: 'Save config',
  mcpReload: 'Reload',
  mcpOpenDir: 'Open config directory',
  kunAdvanced: 'Advanced runtime settings',
  kunAdvancedDetails: 'Storage, model context, and tool guards',
  kunAdvancedDetailsDesc:
    'These options affect how the assistant runs internally. Per-model context policy comes from models.profiles.',
  kunTokenEconomyOptions: 'What to compact',
  kunTokenEconomyOptionsDesc:
    'When context reduction is on, choose which request content is compacted before it reaches the model.',
  kunCompressToolDescriptions: 'Tool descriptions',
  kunCompressToolResults: 'Tool results',
  kunConciseResponses: 'Shorter replies',
  kunHistoryHygiene: 'Long history guard',
  kunHistoryHygieneDesc:
    'Before each model request, cap long tool results and tool arguments. Original chat history is kept unchanged.',
  kunHistoryMaxResultLines: 'Tool result lines',
  kunHistoryMaxResultBytes: 'Tool result bytes',
  kunHistoryMaxResultTokens: 'Tool result tokens',
  kunHistoryMaxArgumentBytes: 'Tool argument bytes',
  kunHistoryMaxArgumentTokens: 'Tool argument tokens',
  kunHistoryMaxArrayItems: 'Array items kept',
  kunModelContextProfile: 'Current model context policy',
  kunModelContextProfileDesc:
    'Model windows and per-model compaction thresholds come from models.profiles in local config.json.',
  kunModelContextModel: 'Model',
  kunModelContextWindow: 'Context window tokens',
  kunModelContextSoft: 'Model start compaction tokens',
  kunModelContextHard: 'Model force compaction tokens',
  kunModelContextSourceBuiltIn: 'Built-in model config',
  kunStorageBackend: 'Conversation storage',
  kunStorageBackendDesc:
    'Hybrid storage uses SQLite to speed up indexes. Pure JSONL does not use SQLite.',
  kunStorageHybrid: 'Hybrid storage (recommended)',
  kunStorageFile: 'Pure JSONL file storage',
  kunStorageSqlitePath: 'SQLite index path',
  kunStorageSqlitePathDesc:
    'Optional. Leave empty to create the index under the assistant data folder.',
  kunStorageSqlitePathPlaceholder: 'Leave empty to manage automatically',
  kunCompactionThresholds: 'Unknown-model fallback compaction thresholds',
  kunCompactionThresholdsDesc:
    'These values are used only when the current model does not match models.profiles.',
  kunCompactionSoftThreshold: 'Fallback start compaction tokens',
  kunCompactionHardThreshold: 'Fallback force compaction tokens',
  kunCompactionSummary: 'Compaction summary',
  kunCompactionSummaryDesc:
    'Local summaries are fast and free. Model summaries read more naturally but use an extra model request.',
  kunCompactionSummaryMode: 'Summary mode',
  kunCompactionSummaryHeuristic: 'Local rules (recommended)',
  kunCompactionSummaryModel: 'Model generated',
  kunCompactionSummaryTimeout: 'Summary timeout ms',
  kunCompactionSummaryMaxTokens: 'Summary max tokens',
  kunCompactionSummaryInputBytes: 'Summary input bytes',
  kunStreamIdleTimeout: 'Stream idle timeout (ms)',
  kunStreamIdleTimeoutDesc:
    'Fail the turn if the model sends no data for this many milliseconds. Default 45000.',
  kunToolStorm: 'Repeated tool-call protection',
  kunToolStormDesc:
    'When the model repeats the exact same tool call in one turn, suppress the duplicate and ask it to change approach.',
  kunToolStormLimits: 'Repeat detection',
  kunToolStormLimitsDesc:
    'A larger window watches more recent tool calls. A lower threshold suppresses repeated calls sooner.',
  kunToolStormWindowSize: 'Watch window',
  kunToolStormThreshold: 'Repeat threshold',
  kunToolArgumentRepair: 'Tool argument max string',
  kunToolArgumentRepairDesc:
    'Single string arguments longer than this byte count are truncated before tool execution.',
  kunDiagnostics: 'Assistant status',
  kunDiagnosticsAdvanced: 'View detailed status',
  kunDiagnosticsAdvancedDesc: 'Runtime abilities, tool connections, and memory records.',
  kunRuntimeCapabilities: 'Available abilities',
  kunRuntimeCapabilitiesDesc:
    'Check whether the local AI assistant service currently has web, skills, attachments, and memory available.',
  kunRuntimeModel: 'Model',
  kunRuntimePid: 'Process ID',
  kunDiagnosticsRefresh: 'Refresh diagnostics',
  kunToolDiagnostics: 'Tool status',
  kunToolDiagnosticsDesc:
    'Check connected tool sources, external tool services, skills, attachments, and memory.',
  kunDiagnosticsProviders: 'Tool sources',
  kunDiagnosticsMcpServers: 'External tool services',
  kunDiagnosticsSkills: 'Skills',
  kunDiagnosticsAttachments: 'Attachments',
  kunMemoryRecords: 'Saved memories',
  kunMemoryRecordsDesc:
    'Review memories available to this workspace, then disable or delete anything you do not want reused.',
  kunMemoryEmpty: 'No memory records are visible for this workspace.',
  kunMemoryDisabled: 'disabled',
  kunMemoryDisable: 'Disable memory',
  kunMemoryDelete: 'Delete memory',
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
    sourceLabel: COPY.kunModelContextSourceBuiltIn,
  }

  return (
    <>
      <div className="agents-settings-jump-row">
        <SectionJumpButton label={COPY.agentsQuickBase} onClick={() => scrollToSection('agents')} />
        <SectionJumpButton label={COPY.agentsQuickSkill} onClick={() => scrollToSection('skill')} />
        <SectionJumpButton label={COPY.agentsQuickMcp} onClick={() => scrollToSection('mcp')} />
        <SectionJumpButton
          label={COPY.agentsQuickPermissions}
          onClick={() => scrollToSection('permissions')}
        />
      </div>

      <div ref={agentsSectionRef}>
        <SettingsCard title={COPY.agents}>
          <SettingRow
            title={COPY.autoStart}
            description={COPY.autoStartDesc}
            control={
              <Toggle
                checked={settings.autoStart}
                onChange={(autoStart) => patch({ autoStart })}
              />
            }
          />
          <SettingRow
            title={COPY.kunProvider}
            description={COPY.kunProviderSelectDesc}
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
            title={COPY.kunModel}
            description={COPY.kunModelDesc}
            control={
              <ModelSelect
                value={settings.model}
                options={activeProviderModels}
                optionLabel={(model) =>
                  model === activeProviderModels[0]
                    ? COPY.modelSelectDefaultSuffix(model)
                    : model}
                allowCustom
                customLabel={COPY.modelSelectCustomOption}
                customPlaceholder={COPY.modelSelectCustomPlaceholder}
                selectClassName={SETTINGS_SELECT_CLASS}
                onChange={(model) => {
                  const next = model.trim()
                  patch({ model: next || (activeProviderModels[0] ?? settings.model) })
                }}
              />
            }
          />
          <SettingRow
            title={COPY.codePromptPrefix}
            description={COPY.codePromptPrefixDesc}
            wideControl
            control={
              <textarea
                value={settings.codePromptPrefix}
                onChange={(e) => patch({ codePromptPrefix: e.target.value })}
                placeholder={COPY.codePromptPrefixPlaceholder}
                className="agents-settings-textarea"
              />
            }
          />
          <div className="agents-settings-disclosure-wrap">
            <AdvancedSettingsDisclosure
              title={COPY.kunAssistantAdvanced}
              description={COPY.kunAssistantAdvancedDesc}
              defaultOpen={assistantAdvancedOpen}
            >
              <div className="agents-settings-disclosure-rows">
                <SettingRow
                  title={COPY.port}
                  description={COPY.portDesc}
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
                  title={COPY.kunBinary}
                  description={COPY.kunBinaryDesc}
                  control={
                    <input
                      className="agents-settings-text-input"
                      placeholder={COPY.kunBinaryPlaceholder}
                      value={settings.binaryPath}
                      onChange={(e) => patch({ binaryPath: e.target.value })}
                    />
                  }
                />
                <SettingRow
                  title={COPY.kunDataDir}
                  description={COPY.kunDataDirDesc}
                  control={
                    <input
                      className="agents-settings-text-input"
                      value={settings.dataDir}
                      onChange={(e) => patch({ dataDir: e.target.value })}
                    />
                  }
                />
                <SettingRow
                  title={COPY.runtimeToken}
                  description={COPY.runtimeTokenDesc}
                  control={
                    <SettingsSecretInput
                      value={settings.runtimeToken}
                      onChange={(runtimeToken) => patch({ runtimeToken })}
                      visible={showRuntimeToken}
                      onToggleVisibility={() => setShowRuntimeToken((value) => !value)}
                      showLabel={COPY.showSecret}
                      hideLabel={COPY.hideSecret}
                      className="agents-settings-secret-input"
                    />
                  }
                />
                <SettingRow
                  title={COPY.kunInsecure}
                  description={
                    settings.runtimeToken.trim()
                      ? COPY.kunInsecureDesc
                      : COPY.kunInsecureForcedDesc
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
            title={COPY.kunTokenEconomy}
            description={COPY.kunTokenEconomyDesc}
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
                        {COPY.kunTokenEconomySavings(
                          formatCompactNumber(settings.tokenEconomySavingsTokens),
                        )}
                      </span>
                    ) : settings.tokenEconomyLoading ? (
                      <span>{COPY.kunTokenEconomySavingsLoading}</span>
                    ) : (
                      <span>{COPY.kunTokenEconomySavingsEmpty}</span>
                    )}
                  </div>
                ) : null}
              </div>
            }
          />
        </SettingsCard>
      </div>

      <div className="agents-settings-section-gap" ref={permissionsSectionRef}>
        <SettingsCard title={COPY.permissions}>
          <div className="agents-settings-notice-wrap">
            <InlineNoticeView notice={{ tone: 'info', message: COPY.permissionsBehaviorHint }} />
          </div>
          <SettingRow
            title={COPY.approvalPolicy}
            description={COPY.approvalPolicyDesc}
            control={
              <select
                className={SETTINGS_SELECT_CLASS}
                value={settings.approvalPolicy}
                onChange={(e) => patch({ approvalPolicy: e.target.value as ApprovalPolicy })}
              >
                <option value="auto">{COPY.approvalAuto}</option>
                <option value="on-request">{COPY.approvalOnRequest}</option>
                <option value="untrusted">{COPY.approvalUntrusted}</option>
                <option value="suggest">{COPY.approvalSuggest}</option>
                <option value="never">{COPY.approvalNever}</option>
              </select>
            }
          />
          <SettingRow
            title={COPY.sandboxMode}
            description={COPY.sandboxModeDesc}
            control={
              <select
                className={SETTINGS_SELECT_CLASS}
                value={settings.sandboxMode}
                onChange={(e) => patch({ sandboxMode: e.target.value as SandboxMode })}
              >
                <option value="workspace-write">{COPY.sandboxWorkspaceWrite}</option>
                <option value="read-only">{COPY.sandboxReadOnly}</option>
                <option value="danger-full-access">{COPY.sandboxFullAccess}</option>
                <option value="external-sandbox">{COPY.sandboxExternal}</option>
              </select>
            }
          />
        </SettingsCard>
      </div>

      <div className="agents-settings-section-gap">
        <SettingsCard title={COPY.computerUseTitle}>
          <div className="agents-settings-notice-wrap">
            <InlineNoticeView notice={{ tone: 'info', message: COPY.computerUseHint }} />
          </div>
          <div className="agents-settings-amber-banner">
            <div className="agents-settings-amber-banner-title">{COPY.computerUseModelQualityTitle}</div>
            <div className="agents-settings-amber-banner-body">{COPY.computerUseModelQualityBody}</div>
          </div>
          <SettingRow
            title={COPY.computerUseEnable}
            description={COPY.computerUseEnableDesc}
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
                title={COPY.computerUseMode}
                description={COPY.computerUseModeDesc}
                control={
                  <select
                    className={SETTINGS_SELECT_CLASS}
                    value={settings.computerUseMode}
                    onChange={(e) =>
                      patch({ computerUseMode: e.target.value as AgentsSettingsSnapshot['computerUseMode'] })
                    }
                  >
                    <option value="auto">{COPY.computerUseModeAuto}</option>
                    <option value="always">{COPY.computerUseModeAlways}</option>
                    <option value="off">{COPY.computerUseModeOff}</option>
                  </select>
                }
              />
              {showComputerUsePermissions ? (
                <SettingRow
                  title={COPY.computerUsePermissions}
                  description={COPY.computerUsePermissionsDesc}
                  control={
                    <div className="agents-settings-permissions-control">
                      <div className="agents-settings-permission-badges">
                        <span className={permissionBadgeClass(computerUseAccessibility)}>
                          {COPY.computerUseAccessibility}: {COPY.computerUsePermissionGranted}
                        </span>
                        <span className={permissionBadgeClass(computerUseScreenRecording)}>
                          {COPY.computerUseScreenRecording}: {COPY.computerUsePermissionDenied}
                        </span>
                      </div>
                      <div className="agents-settings-permission-actions">
                        <button type="button" className="agents-settings-permission-btn">
                          {COPY.computerUseGrantAccessibility}
                        </button>
                        <button type="button" className="agents-settings-permission-btn">
                          {COPY.computerUseGrantScreenRecording}
                        </button>
                        <button type="button" className="agents-settings-permission-btn">
                          {COPY.computerUseRecheck}
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
        <SettingsCard title={COPY.designQualityTitle}>
          <div className="agents-settings-notice-wrap">
            <InlineNoticeView notice={{ tone: 'info', message: COPY.designQualityHint }} />
          </div>
          <SettingRow
            title={COPY.designQualityEnable}
            description={COPY.designQualityEnableDesc}
            control={
              <Toggle
                checked={settings.qualityEnabled}
                onChange={(qualityEnabled) => patch({ qualityEnabled })}
              />
            }
          />
          {settings.qualityEnabled ? (
            <SettingRow
              title={COPY.designQualityStrictness}
              description={COPY.designQualityStrictnessDesc}
              control={
                <select
                  className={SETTINGS_SELECT_CLASS}
                  value={settings.qualityStrictness}
                  onChange={(e) =>
                    patch({ qualityStrictness: e.target.value as AgentsSettingsSnapshot['qualityStrictness'] })
                  }
                >
                  <option value="relaxed">{COPY.designQualityStrictnessRelaxed}</option>
                  <option value="standard">{COPY.designQualityStrictnessStandard}</option>
                  <option value="strict">{COPY.designQualityStrictnessStrict}</option>
                </select>
              }
            />
          ) : null}
        </SettingsCard>
      </div>

      <div className="agents-settings-section-gap" ref={skillSectionRef}>
        <SettingsCard title={COPY.skill}>
          <SettingRow
            title={COPY.skillsDetectedDirs}
            description={COPY.skillsDetectedDirsDesc}
            wideControl
            control={
              <div className="agents-settings-skill-roots">
                {settings.skillRootsLoading && settings.skillRoots.length === 0 ? (
                  <div className="agents-settings-skill-empty">{COPY.loading}</div>
                ) : settings.skillRoots.length === 0 ? (
                  <div className="agents-settings-skill-empty">{COPY.skillsDetectedDirsEmpty}</div>
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
                              ? COPY.skillsScopeProject
                              : COPY.skillsScopeGlobal}
                          </span>
                          {root.exists ? (
                            <span className="agents-settings-skill-count-pill">
                              {COPY.skillsDirSkillCount(root.skillCount)}
                            </span>
                          ) : (
                            <span className="agents-settings-skill-missing-pill">
                              {COPY.skillsDirNotFound}
                            </span>
                          )}
                        </div>
                        <code className="agents-settings-skill-path">{root.path}</code>
                      </div>
                      <div className="agents-settings-skill-root-actions">
                        <button
                          type="button"
                          className="agents-settings-skill-open-btn"
                          aria-label={COPY.skillsOpenRoot}
                          title={COPY.skillsOpenRoot}
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
            title={COPY.skillsScanDirs}
            description={COPY.skillsScanDirsDesc}
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
            title={COPY.skillsActions}
            description={COPY.skillsActionsDesc}
            wideControl
            control={
              <div className="agents-settings-skill-actions">
                <button type="button" className="agents-settings-primary-btn">
                  <Settings className="agents-settings-primary-btn-icon" strokeWidth={1.75} />
                  {COPY.skillsOpenPlugins}
                </button>
              </div>
            }
          />
        </SettingsCard>
      </div>

      <div className="agents-settings-section-gap" ref={mcpSectionRef}>
        <SettingsCard title={COPY.mcp}>
          <SettingRow
            title={COPY.mcpSearchEnabled}
            description={COPY.mcpSearchEnabledDesc}
            control={
              <Toggle
                checked={settings.mcpSearchEnabled}
                onChange={(mcpSearchEnabled) => patch({ mcpSearchEnabled })}
              />
            }
          />
          <div className="agents-settings-disclosure-wrap">
            <AdvancedSettingsDisclosure
              title={COPY.mcpAdvanced}
              description={COPY.mcpAdvancedDesc}
              defaultOpen={mcpAdvancedOpen}
            >
              <div className="agents-settings-disclosure-rows">
                <SettingRow
                  title={COPY.mcpSearchMode}
                  description={COPY.mcpSearchModeDesc}
                  control={
                    <select
                      className={SETTINGS_SELECT_CLASS}
                      value={settings.mcpSearchMode}
                      disabled={!settings.mcpSearchEnabled}
                      onChange={(e) =>
                        patch({ mcpSearchMode: e.target.value as AgentsSettingsSnapshot['mcpSearchMode'] })
                      }
                    >
                      <option value="auto">{COPY.mcpSearchModeAuto}</option>
                      <option value="search">{COPY.mcpSearchModeSearch}</option>
                      <option value="direct">{COPY.mcpSearchModeDirect}</option>
                    </select>
                  }
                />
                <SettingRow
                  title={COPY.mcpSearchLimits}
                  description={COPY.mcpSearchLimitsDesc}
                  wideControl
                  control={
                    <div className="agents-settings-mcp-grid">
                      {[
                        ['mcpAutoThreshold', COPY.mcpSearchAutoThreshold, settings.mcpAutoThreshold],
                        ['mcpTopKDefault', COPY.mcpSearchTopKDefault, settings.mcpTopKDefault],
                        ['mcpTopKMax', COPY.mcpSearchTopKMax, settings.mcpTopKMax],
                        ['mcpMinScore', COPY.mcpSearchMinScore, settings.mcpMinScore],
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
                  title={COPY.mcpSearchDiagnostics}
                  description={COPY.mcpSearchDiagnosticsDesc}
                  wideControl
                  control={
                    <div className="agents-settings-diagnostics-grid is-three">
                      <div className="agents-settings-diagnostics-cell">
                        {COPY.mcpSearchStatus}:{' '}
                        <span className="agents-settings-mono">
                          {settings.mcpSearchActive ? COPY.mcpSearchActive : COPY.mcpSearchInactive}
                        </span>
                      </div>
                      <div className="agents-settings-diagnostics-cell">
                        {COPY.mcpSearchIndexed}:{' '}
                        <span className="agents-settings-mono">{settings.mcpIndexedTools}</span>
                      </div>
                      <div className="agents-settings-diagnostics-cell">
                        {COPY.mcpSearchAdvertised}:{' '}
                        <span className="agents-settings-mono">{settings.mcpAdvertisedTools}</span>
                      </div>
                    </div>
                  }
                />
                <SettingRow
                  title={COPY.configFilePath}
                  description={COPY.mcpPathDesc}
                  control={
                    <div className="agents-settings-path-display">
                      <code className="agents-settings-path-code">{settings.mcpConfigPath}</code>
                    </div>
                  }
                />
                <SettingRow
                  title={COPY.mcpEditor}
                  description={COPY.mcpEditorDesc}
                  wideControl
                  control={
                    <div className="agents-settings-mcp-editor">
                      <div className="agents-settings-mcp-status">
                        {settings.mcpConfigExists
                          ? COPY.mcpFileStatusReady
                          : COPY.mcpFileStatusMissing}
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
                  title={COPY.mcpActions}
                  description={COPY.mcpRuntimeHint}
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
                        {COPY.mcpSave}
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
                        {COPY.mcpReload}
                      </button>
                      <button type="button" className="agents-settings-secondary-btn">
                        <FolderOpen className="agents-settings-secondary-btn-icon" strokeWidth={1.75} />
                        {COPY.mcpOpenDir}
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
        <SettingsCard title={COPY.kunAdvanced}>
          <div className="agents-settings-disclosure-wrap">
            <AdvancedSettingsDisclosure
              title={COPY.kunAdvancedDetails}
              description={COPY.kunAdvancedDetailsDesc}
              defaultOpen={runtimeAdvancedOpen}
            >
              <div className="agents-settings-disclosure-rows">
                <SettingRow
                  title={COPY.kunTokenEconomyOptions}
                  description={COPY.kunTokenEconomyOptionsDesc}
                  wideControl
                  control={
                    <div className="agents-settings-toggle-grid is-three">
                      {(
                        [
                          ['compressToolDescriptions', COPY.kunCompressToolDescriptions, settings.compressToolDescriptions],
                          ['compressToolResults', COPY.kunCompressToolResults, settings.compressToolResults],
                          ['conciseResponses', COPY.kunConciseResponses, settings.conciseResponses],
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
                  title={COPY.kunModelContextProfile}
                  description={COPY.kunModelContextProfileDesc}
                  wideControl
                  control={
                    <div className="agents-settings-context-grid">
                      {[
                        [COPY.kunModelContextModel, modelContext.modelLabel, modelContext.sourceLabel],
                        [COPY.kunModelContextWindow, modelContext.contextWindowLabel, null],
                        [COPY.kunModelContextSoft, modelContext.softThresholdLabel, null],
                        [COPY.kunModelContextHard, modelContext.hardThresholdLabel, null],
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
                  title={COPY.kunStorageBackend}
                  description={COPY.kunStorageBackendDesc}
                  control={
                    <select
                      className={SETTINGS_SELECT_CLASS}
                      value={settings.storageBackend}
                      onChange={(e) =>
                        patch({ storageBackend: e.target.value as AgentsSettingsSnapshot['storageBackend'] })
                      }
                    >
                      <option value="hybrid">{COPY.kunStorageHybrid}</option>
                      <option value="file">{COPY.kunStorageFile}</option>
                    </select>
                  }
                />
                <SettingRow
                  title={COPY.kunStreamIdleTimeout}
                  description={COPY.kunStreamIdleTimeoutDesc}
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
                  title={COPY.kunToolStorm}
                  description={COPY.kunToolStormDesc}
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
        <SettingsCard title={COPY.kunDiagnostics}>
          <div className="agents-settings-disclosure-wrap">
            <AdvancedSettingsDisclosure
              title={COPY.kunDiagnosticsAdvanced}
              description={COPY.kunDiagnosticsAdvancedDesc}
              defaultOpen={diagnosticsAdvancedOpen}
            >
              <div className="agents-settings-disclosure-rows">
                <SettingRow
                  title={COPY.kunRuntimeCapabilities}
                  description={COPY.kunRuntimeCapabilitiesDesc}
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
                          {COPY.kunRuntimeModel}:{' '}
                          <span className="agents-settings-mono">{settings.runtimeModel}</span>
                        </div>
                        <div className="agents-settings-diagnostics-cell">
                          {COPY.kunRuntimePid}:{' '}
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
                        {COPY.kunDiagnosticsRefresh}
                      </button>
                    </div>
                  }
                />
                <SettingRow
                  title={COPY.kunToolDiagnostics}
                  description={COPY.kunToolDiagnosticsDesc}
                  wideControl
                  control={
                    <div className="agents-settings-diagnostics-grid">
                      <div className="agents-settings-diagnostics-cell">
                        {COPY.kunDiagnosticsProviders}:{' '}
                        <span className="agents-settings-mono">{settings.toolProviderCount}</span>
                      </div>
                      <div className="agents-settings-diagnostics-cell">
                        {COPY.kunDiagnosticsMcpServers}:{' '}
                        <span className="agents-settings-mono">{settings.toolMcpServerCount}</span>
                      </div>
                      <div className="agents-settings-diagnostics-cell">
                        {COPY.kunDiagnosticsSkills}:{' '}
                        <span className="agents-settings-mono">{settings.toolSkillCount}</span>
                      </div>
                      <div className="agents-settings-diagnostics-cell">
                        {COPY.kunDiagnosticsAttachments}:{' '}
                        <span className="agents-settings-mono">{settings.toolAttachmentCount}</span>
                      </div>
                    </div>
                  }
                />
                <SettingRow
                  title={COPY.kunMemoryRecords}
                  description={COPY.kunMemoryRecordsDesc}
                  wideControl
                  control={
                    <div className="agents-settings-memory-list">
                      {settings.memoryRecords.length === 0 ? (
                        <div className="agents-settings-skill-empty">{COPY.kunMemoryEmpty}</div>
                      ) : (
                        settings.memoryRecords.map((memory) => (
                          <div key={memory.id} className="agents-settings-memory-row">
                            <div className="agents-settings-memory-copy">
                              <div className="agents-settings-memory-content">{memory.content}</div>
                              <div className="agents-settings-memory-meta">
                                <span className="agents-settings-mono">{memory.scope}</span>
                                <span className="agents-settings-mono">{memory.id}</span>
                                {memory.disabledAt ? <span>{COPY.kunMemoryDisabled}</span> : null}
                                {memory.tags?.length ? <span>{memory.tags.join(', ')}</span> : null}
                              </div>
                            </div>
                            <div className="agents-settings-memory-actions">
                              <button
                                type="button"
                                disabled={Boolean(memory.disabledAt)}
                                className="agents-settings-icon-btn"
                                aria-label={COPY.kunMemoryDisable}
                                title={COPY.kunMemoryDisable}
                              >
                                <Ban className="agents-settings-icon-btn-icon" strokeWidth={1.8} />
                              </button>
                              <button
                                type="button"
                                className="agents-settings-icon-btn is-danger"
                                aria-label={COPY.kunMemoryDelete}
                                title={COPY.kunMemoryDelete}
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
