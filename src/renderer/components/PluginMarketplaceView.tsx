// Kun PluginMarketplaceView.tsx visual port
// (../Kun/src/renderer/src/components/PluginMarketplaceView.tsx).
// Visual only: mock marketplace snapshots and preview URL hooks.

import {
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import {
  Check,
  ChevronDown,
  FolderOpen,
  Info,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Settings,
} from 'lucide-react'

export type PluginKind = 'mcp' | 'skill'
export type PluginFilter = 'all' | 'recommended' | 'installed'
export type MarketplaceNoticeTone = 'success' | 'error' | 'info'
export type McpRuntimeOverlayStatus =
  | 'connected'
  | 'configured'
  | 'drift'
  | 'error'
  | 'disabled'
  | 'offline'

export type MarketplaceNotice = {
  tone: MarketplaceNoticeTone
  message: string
}

export type MarketplaceItem = {
  id: string
  kind: PluginKind
  title: string
  description: string
  detail?: string
  group: 'recommended' | 'personal'
  sourceLabel?: string
  statusTone?: 'default' | 'success' | 'warning' | 'error'
  systemManaged?: boolean
}

export type McpRuntimeOverlaySnapshot = {
  status: McpRuntimeOverlayStatus
  connectedServers: number
  configuredServers: number
  toolCount: number
  searchMode: string
  searchActive: boolean
  indexedToolCount: number
  advertisedToolCount: number
  driftCount: number
  driftSignals: string[]
  lastError: string
}

export type SkillRootOption = {
  id: string
  label: string
  enabled: boolean
}

export type PluginMarketplaceSnapshot = {
  activeKind: PluginKind
  filter: PluginFilter
  query: string
  customOpen: boolean
  notice: MarketplaceNotice | null
  installedIds: string[]
  disabledSkillIds: string[]
  disabledMcpIds: string[]
  busyId: string | null
  skillToggleBusyId: string | null
  mcpToggleBusyId: string | null
  skillRootOptions: SkillRootOption[]
  selectedSkillRootId: string
  skillListLoading: boolean
  skillListError: string | null
  discoveredSkillCount: number
  enabledSkillCount: number
  mcpRuntimeOverlay: McpRuntimeOverlaySnapshot
  runtimeOverlayLoading: boolean
  runtimeOverlayError: string
  builtInItems: MarketplaceItem[]
  recommendedItems: MarketplaceItem[]
  personalItems: MarketplaceItem[]
}

export type PluginMarketplacePreviewMode =
  | 'default'
  | 'skill'
  | 'empty'
  | 'customOpen'
  | 'noticeSuccess'
  | 'noticeError'
  | 'mcpOverlayError'
  | 'skillLoading'
  | 'installed'

const COPY = {
  pluginTabMcp: 'MCP',
  pluginTabSkill: 'Skill',
  pluginManage: 'Manage',
  pluginCreate: 'Create',
  pluginMcpTitle: 'Connect external tools to the agent',
  pluginSkillTitle: 'Make the agent work your way',
  pluginSearchMcp: 'Search MCP',
  pluginSearchSkill: 'Search Skill',
  pluginFilterAll: 'All',
  pluginFilterRecommended: 'Recommended',
  pluginFilterInstalled: 'Added',
  pluginBuiltIn: 'Built-in',
  pluginRecommended: 'Recommended',
  pluginPersonal: 'Personal',
  pluginNoResults: 'No matching plugins.',
  pluginPersonalEmpty: 'No matching added plugins yet.',
  pluginAdd: 'Add',
  pluginAdded: 'Added',
  pluginMcpEnable: 'Enable',
  pluginMcpDisable: 'Disable',
  pluginMcpStatusDisabled: 'Disabled',
  pluginSkillEnable: 'Enable',
  pluginSkillDisable: 'Disable',
  pluginSkillStatusDisabled: 'Disabled',
  pluginMcpRestartHint:
    'After saving MCP config, a running local runtime may need a restart before the change fully applies.',
  pluginMcpRuntimeOverlay: 'Runtime overlay',
  pluginMcpRuntimeRefresh: 'Refresh',
  pluginMcpRuntimeConnected: 'Connected',
  pluginMcpRuntimeConfigured: 'Configured',
  pluginMcpRuntimeDrifted: 'Drift',
  pluginMcpRuntimeError: 'Error',
  pluginMcpRuntimeDisabled: 'Disabled',
  pluginMcpRuntimeOffline: 'Offline',
  pluginMcpRuntimeServers: (connected: number, configured: number) =>
    `${connected}/${configured} servers`,
  pluginMcpRuntimeTools: (count: number) => `${count} tools`,
  pluginMcpRuntimeSearch: (
    status: string,
    mode: string,
    indexed: number,
    advertised: number,
  ) => `Search ${status} · ${mode} · ${indexed}/${advertised} indexed`,
  pluginMcpRuntimeSearchActive: 'active',
  pluginMcpRuntimeSearchInactive: 'inactive',
  pluginMcpRuntimeDrift: (count: number) => `${count} drift signal(s)`,
  pluginMcpRuntimeLastError: (message: string) => `Last error: ${message}`,
  pluginMcpSourceConfigured: 'Configured',
  pluginMcpSourceConnected: 'Connected',
  pluginMcpSourceError: 'Error',
  pluginMcpSourceDisabled: 'Disabled',
  pluginOpenLocation: 'Open location',
  pluginSkillRootWorkspaceAgents: 'Workspace · .agents/skills',
  pluginSkillRootGlobalAgents: 'Global · ~/.agents/skills',
  pluginSkillRootNone: 'No skill directory detected',
  pluginSkillRefresh: 'Refresh',
  pluginSkillDiscoveredCountWithEnabled: (count: number, enabled: number) =>
    `${count} discovered, ${enabled} enabled`,
  pluginSkillSourceProject: 'Project',
  pluginSkillSourceGlobal: 'Global',
  pluginCustomName: 'Name, e.g. my-plugin',
  pluginCustomDescription: 'Basic description',
  pluginCustomCommand: 'Command, e.g. npx',
  pluginCustomArgs: 'Arguments, one per line',
  pluginCustomMcpConfig: 'Or paste a complete MCP JSON config snippet',
  pluginCustomSkillBody: 'Skill instructions for the agent',
  pluginAddCustom: 'Add custom',
}

const MCP_RECOMMENDED: MarketplaceItem[] = [
  {
    id: 'gui_schedule',
    kind: 'mcp',
    title: 'Navi Schedule',
    description: 'Built-in MCP tools for listing, creating, updating, and deleting scheduled tasks.',
    group: 'recommended',
    systemManaged: true,
  },
  {
    id: 'playwright',
    kind: 'mcp',
    title: 'Playwright',
    description: 'Automate real browsers and inspect page state.',
    group: 'recommended',
  },
  {
    id: 'github',
    kind: 'mcp',
    title: 'GitHub',
    description: 'Read repositories, issues, pull requests, and CI context.',
    group: 'recommended',
  },
  {
    id: 'context7',
    kind: 'mcp',
    title: 'Context7',
    description: 'Fetch current library documentation for coding tasks.',
    group: 'recommended',
  },
  {
    id: 'sequential-thinking',
    kind: 'mcp',
    title: 'Sequential Thinking',
    description: 'Break complex tasks into traceable reasoning steps.',
    group: 'recommended',
  },
  {
    id: 'memory',
    kind: 'mcp',
    title: 'Memory',
    description: 'Keep reusable project facts and preferences available across tasks.',
    group: 'recommended',
  },
  {
    id: 'brave-search',
    kind: 'mcp',
    title: 'Brave Search',
    description: 'Search the web through Brave Search. Requires your own API key.',
    group: 'recommended',
  },
]

const SKILL_RECOMMENDED: MarketplaceItem[] = [
  {
    id: 'code-review',
    kind: 'skill',
    title: 'Code Review',
    description: 'Review code changes for defects, regressions, and missing tests.',
    group: 'recommended',
  },
  {
    id: 'frontend-polish',
    kind: 'skill',
    title: 'Frontend Polish',
    description: 'Improve UI details, responsive states, and visual consistency.',
    group: 'recommended',
  },
  {
    id: 'bug-hunt',
    kind: 'skill',
    title: 'Bug Hunt',
    description: 'Reproduce and locate issues, then propose the smallest verified fix.',
    group: 'recommended',
  },
  {
    id: 'release-notes',
    kind: 'skill',
    title: 'Release Notes',
    description: 'Draft user-facing release notes and upgrade notes.',
    group: 'recommended',
  },
]

const MCP_PERSONAL: MarketplaceItem[] = [
  {
    id: 'playwright',
    kind: 'mcp',
    title: 'playwright',
    description: 'Automate real browsers and inspect page state.',
    detail: 'connected · stdio · npx · 12 tools',
    group: 'personal',
    sourceLabel: COPY.pluginMcpSourceConnected,
    statusTone: 'success',
  },
  {
    id: 'filesystem',
    kind: 'mcp',
    title: 'filesystem',
    description: 'Read and write workspace files through MCP.',
    detail: 'configured · stdio · npx',
    group: 'personal',
    sourceLabel: COPY.pluginMcpSourceConfigured,
    statusTone: 'default',
  },
]

const SKILL_PERSONAL: MarketplaceItem[] = [
  {
    id: 'design-review',
    kind: 'skill',
    title: 'design-review',
    description: 'Review UI changes against the product design system.',
    group: 'personal',
    sourceLabel: COPY.pluginSkillSourceProject,
  },
  {
    id: 'flue-debug',
    kind: 'skill',
    title: 'flue-debug',
    description: 'Trace Flue agent harness issues and runtime logs.',
    group: 'personal',
    sourceLabel: COPY.pluginSkillSourceGlobal,
  },
]

const DEFAULT_SKILL_ROOTS: SkillRootOption[] = [
  { id: 'workspace-agents', label: COPY.pluginSkillRootWorkspaceAgents, enabled: true },
  { id: 'global-agents', label: COPY.pluginSkillRootGlobalAgents, enabled: true },
]

const DEFAULT_MCP_OVERLAY: McpRuntimeOverlaySnapshot = {
  status: 'connected',
  connectedServers: 2,
  configuredServers: 3,
  toolCount: 18,
  searchMode: 'hybrid',
  searchActive: true,
  indexedToolCount: 18,
  advertisedToolCount: 18,
  driftCount: 0,
  driftSignals: [],
  lastError: '',
}

function marketplaceSourceTone(tone: MarketplaceItem['statusTone']): string {
  switch (tone) {
    case 'success':
      return 'plugin-marketplace-source-tone is-success'
    case 'warning':
      return 'plugin-marketplace-source-tone is-warning'
    case 'error':
      return 'plugin-marketplace-source-tone is-error'
    default:
      return 'plugin-marketplace-source-tone'
  }
}

function mcpRuntimeStatusLabel(status: McpRuntimeOverlayStatus): string {
  switch (status) {
    case 'connected':
      return COPY.pluginMcpRuntimeConnected
    case 'configured':
      return COPY.pluginMcpRuntimeConfigured
    case 'drift':
      return COPY.pluginMcpRuntimeDrifted
    case 'error':
      return COPY.pluginMcpRuntimeError
    case 'disabled':
      return COPY.pluginMcpRuntimeDisabled
    case 'offline':
      return COPY.pluginMcpRuntimeOffline
  }
}

function mcpRuntimeStatusTone(status: McpRuntimeOverlayStatus): string {
  switch (status) {
    case 'connected':
      return 'plugin-marketplace-runtime-status is-success'
    case 'configured':
      return 'plugin-marketplace-runtime-status is-info'
    case 'drift':
      return 'plugin-marketplace-runtime-status is-warning'
    case 'error':
      return 'plugin-marketplace-runtime-status is-error'
    case 'disabled':
    case 'offline':
      return 'plugin-marketplace-runtime-status'
  }
}

function TabButton({
  active,
  tone = 'default',
  onClick,
  children,
}: {
  active: boolean
  tone?: 'default' | 'skill'
  onClick: () => void
  children: ReactNode
}): ReactElement {
  const toneClass = tone === 'skill' ? 'is-skill' : ''
  return (
    <button
      type="button"
      onClick={onClick}
      className={`plugin-marketplace-tab-btn ${toneClass} ${active ? 'is-active' : ''}`}
    >
      {children}
    </button>
  )
}

function NoticeView({ notice }: { notice: MarketplaceNotice }): ReactElement {
  const toneClass =
    notice.tone === 'error'
      ? 'is-error'
      : notice.tone === 'success'
        ? 'is-success'
        : 'is-info'
  return <div className={`plugin-marketplace-notice ${toneClass}`}>{notice.message}</div>
}

function McpRuntimeOverlayPanel({
  overlay,
  loading,
  error,
}: {
  overlay: McpRuntimeOverlaySnapshot
  loading: boolean
  error: string
}): ReactElement {
  const status = mcpRuntimeStatusLabel(overlay.status)
  return (
    <section className="plugin-marketplace-runtime-panel">
      <div className="plugin-marketplace-runtime-panel-inner">
        <div className="plugin-marketplace-runtime-panel-copy">
          <Info className="plugin-marketplace-runtime-icon" strokeWidth={1.8} />
          <div className="plugin-marketplace-runtime-panel-body">
            <div className="plugin-marketplace-runtime-panel-title-row">
              <span className="plugin-marketplace-runtime-panel-title">
                {COPY.pluginMcpRuntimeOverlay}
              </span>
              <span className={mcpRuntimeStatusTone(overlay.status)}>{status}</span>
            </div>
            <div className="plugin-marketplace-runtime-meta">
              <span>
                {COPY.pluginMcpRuntimeServers(
                  overlay.connectedServers,
                  overlay.configuredServers,
                )}
              </span>
              <span>{COPY.pluginMcpRuntimeTools(overlay.toolCount)}</span>
              <span>
                {COPY.pluginMcpRuntimeSearch(
                  overlay.searchActive
                    ? COPY.pluginMcpRuntimeSearchActive
                    : COPY.pluginMcpRuntimeSearchInactive,
                  overlay.searchMode,
                  overlay.indexedToolCount,
                  overlay.advertisedToolCount,
                )}
              </span>
              {overlay.driftCount > 0 ? (
                <span>{COPY.pluginMcpRuntimeDrift(overlay.driftCount)}</span>
              ) : null}
            </div>
            {overlay.driftSignals.length > 0 ? (
              <div className="plugin-marketplace-runtime-drift-list">
                {overlay.driftSignals.map((signal) => (
                  <span key={signal} className="plugin-marketplace-runtime-drift-chip">
                    {signal}
                  </span>
                ))}
              </div>
            ) : null}
            {overlay.lastError ? (
              <div className="plugin-marketplace-runtime-error">
                {COPY.pluginMcpRuntimeLastError(overlay.lastError)}
              </div>
            ) : null}
            {error ? <div className="plugin-marketplace-runtime-error">{error}</div> : null}
          </div>
        </div>
        <button type="button" className="plugin-marketplace-runtime-refresh" disabled={loading}>
          {loading ? (
            <Loader2 className="plugin-marketplace-spin" strokeWidth={2} />
          ) : (
            <RefreshCw className="plugin-marketplace-runtime-refresh-icon" strokeWidth={2} />
          )}
          {COPY.pluginMcpRuntimeRefresh}
        </button>
      </div>
    </section>
  )
}

function CustomPluginPanel({ activeKind }: { activeKind: PluginKind }): ReactElement {
  return (
    <section className="plugin-marketplace-custom-panel">
      <div className="plugin-marketplace-custom-grid">
        <input
          readOnly
          defaultValue=""
          className="plugin-marketplace-input"
          placeholder={COPY.pluginCustomName}
        />
        <input
          readOnly
          defaultValue=""
          className="plugin-marketplace-input"
          placeholder={COPY.pluginCustomDescription}
        />
      </div>
      {activeKind === 'mcp' ? (
        <div className="plugin-marketplace-custom-mcp">
          <div className="plugin-marketplace-custom-grid">
            <input
              readOnly
              defaultValue="npx"
              className="plugin-marketplace-input"
              placeholder={COPY.pluginCustomCommand}
            />
            <textarea
              readOnly
              defaultValue={'-y\n@playwright/mcp@latest'}
              className="plugin-marketplace-textarea plugin-marketplace-textarea--mono"
              placeholder={COPY.pluginCustomArgs}
              spellCheck={false}
            />
          </div>
          <textarea
            readOnly
            defaultValue=""
            className="plugin-marketplace-textarea plugin-marketplace-textarea--mono plugin-marketplace-textarea--tall"
            placeholder={COPY.pluginCustomMcpConfig}
            spellCheck={false}
          />
        </div>
      ) : (
        <textarea
          readOnly
          defaultValue=""
          className="plugin-marketplace-textarea plugin-marketplace-textarea--mono plugin-marketplace-textarea--skill"
          placeholder={COPY.pluginCustomSkillBody}
          spellCheck={false}
        />
      )}
      <div className="plugin-marketplace-custom-footer">
        <button type="button" className="plugin-marketplace-primary-btn">
          <Plus className="plugin-marketplace-primary-btn-icon" strokeWidth={2} />
          {COPY.pluginAddCustom}
        </button>
      </div>
    </section>
  )
}

function PluginSection({
  title,
  emptyText,
  items,
  activeKind,
  installedIds,
  disabledSkillIds,
  disabledMcpIds,
  busyId,
  skillToggleBusyId,
  mcpToggleBusyId,
}: {
  title: string
  emptyText: string
  items: MarketplaceItem[]
  activeKind: PluginKind
  installedIds: string[]
  disabledSkillIds: string[]
  disabledMcpIds: string[]
  busyId: string | null
  skillToggleBusyId: string | null
  mcpToggleBusyId: string | null
}): ReactElement {
  return (
    <section className="plugin-marketplace-section">
      <h2 className="plugin-marketplace-section-title">{title}</h2>
      {items.length === 0 ? (
        <div className="plugin-marketplace-section-empty">{emptyText}</div>
      ) : (
        <div className="plugin-marketplace-item-grid">
          {items.map((item) => {
            const installed = installedIds.includes(item.id)
            const skillDisabled =
              item.kind === 'skill' && disabledSkillIds.includes(item.id)
            const mcpDisabled = item.kind === 'mcp' && disabledMcpIds.includes(item.id)
            const toggleBusy =
              item.kind === 'skill'
                ? skillToggleBusyId === item.id
                : mcpToggleBusyId === item.id
            const addBusy = busyId === `${item.kind}:${item.id}`
            const canToggleSkill = item.kind === 'skill' && item.group === 'personal'
            const canToggleMcp = item.kind === 'mcp' && item.group === 'personal'

            return (
              <div key={`${item.kind}:${item.id}`} className="plugin-marketplace-item-row">
                <div className="plugin-marketplace-item-copy">
                  <div className="plugin-marketplace-item-title-row">
                    <span className="plugin-marketplace-item-title">{item.title}</span>
                    {item.sourceLabel ? (
                      <span className={marketplaceSourceTone(item.statusTone)}>
                        {item.sourceLabel}
                      </span>
                    ) : null}
                    {skillDisabled ? (
                      <span className="plugin-marketplace-disabled-badge">
                        {COPY.pluginSkillStatusDisabled}
                      </span>
                    ) : null}
                    {mcpDisabled ? (
                      <span className="plugin-marketplace-disabled-badge">
                        {COPY.pluginMcpStatusDisabled}
                      </span>
                    ) : null}
                  </div>
                  <p className="plugin-marketplace-item-description">{item.description}</p>
                  {item.detail && item.detail !== item.description ? (
                    <p className="plugin-marketplace-item-detail" title={item.detail}>
                      {item.detail}
                    </p>
                  ) : null}
                </div>
                {canToggleSkill ? (
                  <button
                    type="button"
                    disabled={toggleBusy}
                    className={`plugin-marketplace-toggle-btn ${skillDisabled ? 'is-enable' : 'is-skill-active'}`}
                  >
                    {toggleBusy ? (
                      <Loader2 className="plugin-marketplace-spin" strokeWidth={2} />
                    ) : skillDisabled ? (
                      COPY.pluginSkillEnable
                    ) : (
                      COPY.pluginSkillDisable
                    )}
                  </button>
                ) : canToggleMcp ? (
                  <button
                    type="button"
                    disabled={toggleBusy}
                    className={`plugin-marketplace-toggle-btn ${mcpDisabled ? 'is-enable' : ''}`}
                  >
                    {toggleBusy ? (
                      <Loader2 className="plugin-marketplace-spin" strokeWidth={2} />
                    ) : mcpDisabled ? (
                      COPY.pluginMcpEnable
                    ) : (
                      COPY.pluginMcpDisable
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={installed || addBusy}
                    className={`plugin-marketplace-add-btn ${installed ? 'is-added' : ''}`}
                    title={installed ? COPY.pluginAdded : COPY.pluginAdd}
                  >
                    {addBusy ? (
                      <Loader2 className="plugin-marketplace-spin" strokeWidth={2} />
                    ) : installed ? (
                      <Check className="plugin-marketplace-add-icon" strokeWidth={2} />
                    ) : (
                      <Plus className="plugin-marketplace-add-icon" strokeWidth={2} />
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export function previewSnapshot(mode: PluginMarketplacePreviewMode): PluginMarketplaceSnapshot {
  const activeKind: PluginKind = mode === 'skill' || mode === 'skillLoading' ? 'skill' : 'mcp'
  const recommended =
    activeKind === 'mcp'
      ? MCP_RECOMMENDED.filter((item) => !item.systemManaged)
      : SKILL_RECOMMENDED
  const builtIn = activeKind === 'mcp' ? MCP_RECOMMENDED.filter((item) => item.systemManaged) : []
  const personal = activeKind === 'mcp' ? MCP_PERSONAL : SKILL_PERSONAL

  return {
    activeKind,
    filter: 'all',
    query: mode === 'empty' ? 'zzzz-no-match' : '',
    customOpen: mode === 'customOpen',
    notice:
      mode === 'noticeSuccess'
        ? { tone: 'success', message: 'MCP config updated: ~/.navi/mcp.json' }
        : mode === 'noticeError'
          ? { tone: 'error', message: 'Could not write MCP config. Check permissions and try again.' }
          : null,
    installedIds: mode === 'installed' ? ['github', 'context7', 'frontend-polish'] : [],
    disabledSkillIds: mode === 'installed' ? ['flue-debug'] : [],
    disabledMcpIds: mode === 'installed' ? ['filesystem'] : [],
    busyId: null,
    skillToggleBusyId: null,
    mcpToggleBusyId: null,
    skillRootOptions: DEFAULT_SKILL_ROOTS,
    selectedSkillRootId: DEFAULT_SKILL_ROOTS[0]?.id ?? '',
    skillListLoading: mode === 'skillLoading',
    skillListError: null,
    discoveredSkillCount: 6,
    enabledSkillCount: mode === 'installed' ? 5 : 6,
    mcpRuntimeOverlay:
      mode === 'mcpOverlayError'
        ? {
            ...DEFAULT_MCP_OVERLAY,
            status: 'error',
            connectedServers: 0,
            lastError: 'Runtime diagnostics request timed out.',
          }
        : DEFAULT_MCP_OVERLAY,
    runtimeOverlayLoading: false,
    runtimeOverlayError: mode === 'mcpOverlayError' ? 'Runtime diagnostics are unavailable.' : '',
    builtInItems: mode === 'empty' ? [] : builtIn,
    recommendedItems: mode === 'empty' ? [] : recommended,
    personalItems: mode === 'empty' ? [] : personal,
  }
}

type PluginMarketplaceViewProps = {
  snapshot: PluginMarketplaceSnapshot
  activeKind: PluginKind
  filter: PluginFilter
  query: string
  customOpen: boolean
  onActiveKindChange: (kind: PluginKind) => void
  onFilterChange: (filter: PluginFilter) => void
  onQueryChange: (query: string) => void
  onCustomOpenChange: (open: boolean) => void
}

export function PluginMarketplaceView({
  snapshot,
  activeKind,
  filter,
  query,
  customOpen,
  onActiveKindChange,
  onFilterChange,
  onQueryChange,
  onCustomOpenChange,
}: PluginMarketplaceViewProps): ReactElement {
  const visibleRecommended = useMemo(() => {
    const q = query.trim().toLowerCase()
    return snapshot.recommendedItems.filter((item) => {
      if (filter === 'installed' && !snapshot.installedIds.includes(item.id)) return false
      if (filter === 'recommended' && item.group !== 'recommended') return false
      if (!q) return true
      return [item.title, item.description, item.detail ?? ''].join('\n').toLowerCase().includes(q)
    })
  }, [filter, query, snapshot.installedIds, snapshot.recommendedItems])

  const visiblePersonal = useMemo(() => {
    const q = query.trim().toLowerCase()
    return snapshot.personalItems.filter((item) => {
      if (filter === 'recommended') return false
      if (filter === 'installed' && !snapshot.installedIds.includes(item.id)) return false
      if (!q) return true
      return [item.title, item.description, item.detail ?? ''].join('\n').toLowerCase().includes(q)
    })
  }, [filter, query, snapshot.installedIds, snapshot.personalItems])

  const visibleBuiltIn = useMemo(() => {
    const q = query.trim().toLowerCase()
    return snapshot.builtInItems.filter((item) => {
      if (filter === 'installed' && !snapshot.installedIds.includes(item.id)) return false
      if (!q) return true
      return [item.title, item.description].join('\n').toLowerCase().includes(q)
    })
  }, [filter, query, snapshot.builtInItems, snapshot.installedIds])

  return (
    <div className="plugin-marketplace-view ds-no-drag">
      <div className="plugin-marketplace-view-inner">
        <div className="plugin-marketplace-toolbar">
          <div className="plugin-marketplace-tabs">
            <TabButton active={activeKind === 'mcp'} onClick={() => onActiveKindChange('mcp')}>
              {COPY.pluginTabMcp}
            </TabButton>
            <TabButton
              active={activeKind === 'skill'}
              tone="skill"
              onClick={() => onActiveKindChange('skill')}
            >
              {COPY.pluginTabSkill}
            </TabButton>
          </div>
          <div className="plugin-marketplace-toolbar-actions">
            <button type="button" className="plugin-marketplace-secondary-btn">
              <Settings className="plugin-marketplace-btn-icon" strokeWidth={1.75} />
              {COPY.pluginManage}
            </button>
            <button
              type="button"
              className="plugin-marketplace-primary-btn plugin-marketplace-primary-btn--compact"
              onClick={() => onCustomOpenChange(!customOpen)}
            >
              <Plus className="plugin-marketplace-primary-btn-icon" strokeWidth={1.9} />
              {COPY.pluginCreate}
            </button>
          </div>
        </div>

        <div className="plugin-marketplace-hero">
          <h1 className="plugin-marketplace-title">
            {activeKind === 'mcp' ? COPY.pluginMcpTitle : COPY.pluginSkillTitle}
          </h1>
        </div>

        <div className="plugin-marketplace-filters">
          <label className="plugin-marketplace-search">
            <Search className="plugin-marketplace-search-icon" strokeWidth={2} />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className="plugin-marketplace-search-input"
              placeholder={
                activeKind === 'mcp' ? COPY.pluginSearchMcp : COPY.pluginSearchSkill
              }
            />
          </label>
          <label className="plugin-marketplace-filter-select-wrap">
            <select
              value={filter}
              onChange={(event) => onFilterChange(event.target.value as PluginFilter)}
              className="plugin-marketplace-filter-select"
            >
              <option value="all">{COPY.pluginFilterAll}</option>
              <option value="recommended">{COPY.pluginFilterRecommended}</option>
              <option value="installed">{COPY.pluginFilterInstalled}</option>
            </select>
            <ChevronDown className="plugin-marketplace-filter-chevron" strokeWidth={2} />
          </label>
        </div>

        {activeKind === 'skill' ? (
          <div className="plugin-marketplace-skill-toolbar">
            <select
              value={snapshot.selectedSkillRootId}
              className="plugin-marketplace-skill-root-select"
            >
              {snapshot.skillRootOptions.length === 0 ? (
                <option value="">{COPY.pluginSkillRootNone}</option>
              ) : (
                snapshot.skillRootOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.enabled
                      ? option.label
                      : `${option.label} · ${COPY.pluginSkillStatusDisabled}`}
                  </option>
                ))
              )}
            </select>
            <button type="button" className="plugin-marketplace-skill-action-btn">
              <FolderOpen className="plugin-marketplace-btn-icon" strokeWidth={2} />
              {COPY.pluginOpenLocation}
            </button>
            <button
              type="button"
              disabled={snapshot.skillListLoading}
              className="plugin-marketplace-skill-action-btn"
            >
              {snapshot.skillListLoading ? (
                <Loader2 className="plugin-marketplace-spin" strokeWidth={2} />
              ) : (
                <RefreshCw className="plugin-marketplace-btn-icon" strokeWidth={2} />
              )}
              {COPY.pluginSkillRefresh}
            </button>
            {snapshot.skillListError ? (
              <span className="plugin-marketplace-skill-error">{snapshot.skillListError}</span>
            ) : (
              <span className="plugin-marketplace-skill-meta">
                {COPY.pluginSkillDiscoveredCountWithEnabled(
                  snapshot.discoveredSkillCount,
                  snapshot.enabledSkillCount,
                )}
              </span>
            )}
          </div>
        ) : null}

        {activeKind === 'mcp' ? (
          <McpRuntimeOverlayPanel
            overlay={snapshot.mcpRuntimeOverlay}
            loading={snapshot.runtimeOverlayLoading}
            error={snapshot.runtimeOverlayError}
          />
        ) : null}

        {customOpen ? <CustomPluginPanel activeKind={activeKind} /> : null}

        {snapshot.notice ? <NoticeView notice={snapshot.notice} /> : null}

        {activeKind === 'mcp' ? (
          <PluginSection
            title={COPY.pluginBuiltIn}
            emptyText={COPY.pluginNoResults}
            items={visibleBuiltIn}
            activeKind={activeKind}
            installedIds={snapshot.installedIds}
            disabledSkillIds={snapshot.disabledSkillIds}
            disabledMcpIds={snapshot.disabledMcpIds}
            busyId={snapshot.busyId}
            skillToggleBusyId={snapshot.skillToggleBusyId}
            mcpToggleBusyId={snapshot.mcpToggleBusyId}
          />
        ) : null}

        <PluginSection
          title={COPY.pluginRecommended}
          emptyText={COPY.pluginNoResults}
          items={visibleRecommended}
          activeKind={activeKind}
          installedIds={snapshot.installedIds}
          disabledSkillIds={snapshot.disabledSkillIds}
          disabledMcpIds={snapshot.disabledMcpIds}
          busyId={snapshot.busyId}
          skillToggleBusyId={snapshot.skillToggleBusyId}
          mcpToggleBusyId={snapshot.mcpToggleBusyId}
        />

        <PluginSection
          title={COPY.pluginPersonal}
          emptyText={COPY.pluginPersonalEmpty}
          items={visiblePersonal}
          activeKind={activeKind}
          installedIds={snapshot.installedIds}
          disabledSkillIds={snapshot.disabledSkillIds}
          disabledMcpIds={snapshot.disabledMcpIds}
          busyId={snapshot.busyId}
          skillToggleBusyId={snapshot.skillToggleBusyId}
          mcpToggleBusyId={snapshot.mcpToggleBusyId}
        />

        {activeKind === 'mcp' ? (
          <div className="plugin-marketplace-restart-hint">
            <RefreshCw className="plugin-marketplace-restart-hint-icon" strokeWidth={2} />
            <span>{COPY.pluginMcpRestartHint}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function PluginMarketplaceViewPreview({
  mode = 'default',
}: {
  mode?: PluginMarketplacePreviewMode
}): ReactElement {
  const initial = useMemo(() => previewSnapshot(mode), [mode])
  const [activeKind, setActiveKind] = useState(initial.activeKind)
  const [filter, setFilter] = useState(initial.filter)
  const [query, setQuery] = useState(initial.query)
  const [customOpen, setCustomOpen] = useState(initial.customOpen)

  return (
    <div className="plugin-marketplace-view-preview">
      <PluginMarketplaceView
        snapshot={initial}
        activeKind={activeKind}
        filter={filter}
        query={query}
        customOpen={customOpen}
        onActiveKindChange={setActiveKind}
        onFilterChange={setFilter}
        onQueryChange={setQuery}
        onCustomOpenChange={setCustomOpen}
      />
    </div>
  )
}
