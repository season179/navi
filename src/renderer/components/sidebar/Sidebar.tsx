// Main chat sidebar echoing Kun's Sidebar
// (../Kun/src/renderer/src/components/chat/Sidebar.tsx).
// Visual only: composes WorkspaceModeTabs, SidebarProjectsSection, ClawSidebarContent,
// ConnectPhoneSidebarPanel, and footer chrome with mock preview snapshots.

import { useEffect, useMemo, useState, type ReactElement } from 'react'
import {
  Clock3,
  FileQuestion,
  Focus,
  LayoutGrid,
  Plus,
  Settings,
  Smartphone,
} from 'lucide-react'
import { GreetingMascot, SitMascot, SleepingMascot } from '../common/Mascot'
import { WorkspaceModeTabs, type WorkspaceModeView } from '../workbench/WorkspaceModeTabs'
import { SidebarCommandRow, SidebarFrame } from './SidebarPrimitives'
import {
  SidebarProjectsSection,
  previewWorkspaceGroups,
  type SidebarProjectsPreviewMode,
} from './SidebarProjectsSection'
import {
  ClawSidebarContent,
  type ClawImChannelSidebarSnapshot,
} from '../claw/ClawSidebar'
import {
  ConnectPhoneSidebarPanel,
  type ConnectPhoneQrStatus,
} from '../claw/ConnectPhoneView'
import { type ClawInstallTarget } from '../claw/ClawAddImDialog'
import {
  SIDEBAR_APP_NAME,
  SIDEBAR_CLAW_LABEL,
  SIDEBAR_FOCUS_MODE_LABEL,
  SIDEBAR_FOCUS_MODE_TOGGLE_ARIA_LABEL,
  SIDEBAR_NEW_AGENT_LABEL,
  SIDEBAR_PLUGINS_LABEL,
  SIDEBAR_RUNTIME_ACTION_NEEDS_CONNECTION,
  SIDEBAR_SCHEDULE_LABEL,
  SIDEBAR_SDD_NEW_REQUIREMENT_LABEL,
  SIDEBAR_SETTINGS_LABEL,
  formatFocusModeToggleTitle,
} from '../../lib/sidebar'

export type SidebarPreviewMode =
  | 'default'
  | 'empty'
  | 'search'
  | 'multiWorkspace'
  | 'running'
  | 'forked'
  | 'claw'
  | 'connectPhone'
  | 'focusMode'
  | 'schedule'
  | 'renameDialog'
  | 'contextMenu'

const SIDEBAR_MASCOT_INTERVAL_MS = 10000

const PREVIEW_CLAW_CHANNELS: ClawImChannelSidebarSnapshot[] = [
  {
    id: 'feishu-team',
    provider: 'feishu',
    label: 'Team Feishu',
    enabled: true,
    model: 'auto',
    threadId: 'thread-feishu-1',
    updatedAt: '2026-06-22T12:00:00.000Z',
    conversations: [
      {
        chatId: 'oc_team_ops',
        senderName: 'Season',
        localThreadId: 'thread-feishu-1',
        updatedAt: '2026-06-22T11:58:00.000Z',
      },
    ],
  },
  {
    id: 'weixin-support',
    provider: 'weixin',
    label: 'WeChat Support',
    enabled: true,
    model: 'auto',
    threadId: 'thread-wx-1',
    updatedAt: '2026-06-21T18:28:00.000Z',
    conversations: [
      {
        chatId: 'wx_group_42',
        senderName: 'Alex',
        localThreadId: '',
        updatedAt: '2026-06-21T18:28:00.000Z',
      },
    ],
  },
]

type KunStateFigureKind = 'greet' | 'sleep' | 'sit'

const SIDEBAR_MASCOT_KINDS: readonly KunStateFigureKind[] = ['sit', 'greet', 'sleep']

function KunStateFigure({
  kind,
  className = '',
}: {
  kind: KunStateFigureKind
  className?: string
}): ReactElement {
  const figure =
    kind === 'greet' ? (
      <GreetingMascot className="ds-kun-state-figure" />
    ) : kind === 'sleep' ? (
      <SleepingMascot className="ds-kun-state-figure" />
    ) : (
      <SitMascot className="ds-kun-state-figure" />
    )

  return (
    <span
      className={['ds-kun-state', `ds-kun-state-${kind}`, className].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      {figure}
    </span>
  )
}

export function SidebarMascot(): ReactElement {
  const [kindIndex, setKindIndex] = useState(() =>
    Math.floor(Math.random() * SIDEBAR_MASCOT_KINDS.length),
  )

  useEffect(() => {
    const interval = window.setInterval(() => {
      setKindIndex((current) => (current + 1) % SIDEBAR_MASCOT_KINDS.length)
    }, SIDEBAR_MASCOT_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [])

  const kind = SIDEBAR_MASCOT_KINDS[kindIndex] ?? 'sit'
  return <KunStateFigure key={kind} kind={kind} className="ds-sidebar-mascot" />
}

export function FocusModeToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: () => void
}): ReactElement {
  return (
    <button
      type="button"
      data-cursor-spotlight-target
      role="switch"
      aria-checked={enabled}
      aria-label={SIDEBAR_FOCUS_MODE_TOGGLE_ARIA_LABEL}
      title={formatFocusModeToggleTitle(enabled)}
      onClick={onToggle}
      className={`group inline-flex h-8 w-[112px] shrink-0 items-center justify-between overflow-hidden rounded-[10px] border px-2.5 text-[12px] font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-accent/25 ${
        enabled
          ? 'border-accent/35 bg-[var(--ds-sidebar-row-active)] text-[#1f1f1f] shadow-[0_1px_3px_rgba(20,47,95,0.07),inset_0_0_0_1px_var(--ds-sidebar-row-ring),inset_0_1px_0_rgba(255,255,255,0.72)] dark:text-white'
          : 'border-[var(--ds-sidebar-divider)] bg-[var(--ds-sidebar-field-bg)] text-[#5c6675] shadow-[inset_0_1px_0_rgba(255,255,255,0.46)] hover:bg-[var(--ds-sidebar-row-hover)] hover:text-[#1f2733] dark:text-white/62 dark:shadow-none dark:hover:text-white'
      }`}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <Focus className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
        <span className="min-w-0 truncate">{SIDEBAR_FOCUS_MODE_LABEL}</span>
      </span>
      <span
        className={`relative h-4 w-7 shrink-0 rounded-full transition ${
          enabled
            ? 'bg-accent/80 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]'
            : 'bg-slate-300/75 shadow-[inset_0_0_0_1px_rgba(100,116,139,0.16)] dark:bg-white/[0.14] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
        }`}
        aria-hidden="true"
      >
        <span
          className={`absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white shadow-[0_1px_3px_rgba(20,47,95,0.24)] transition-transform ${
            enabled ? 'translate-x-3' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  )
}

type SidebarSnapshot = {
  activeView: WorkspaceModeView
  connectPhoneSidebarOpen: boolean
  pluginsActive: boolean
  focusModeEnabled: boolean
  runtimeReady: boolean
  activeThreadId: string | null
  projectsMode: SidebarProjectsPreviewMode
  clawChannels: ClawImChannelSidebarSnapshot[]
  activeClawChannelId: string
  connectPhoneTarget: ClawInstallTarget
  connectPhoneQrStatus: ConnectPhoneQrStatus
}

function previewSnapshot(mode: SidebarPreviewMode): SidebarSnapshot {
  const projectsModes: SidebarProjectsPreviewMode[] = [
    'default',
    'empty',
    'search',
    'multiWorkspace',
    'running',
    'forked',
    'renameDialog',
    'contextMenu',
  ]
  const projectsMode = projectsModes.includes(mode as SidebarProjectsPreviewMode)
    ? (mode as SidebarProjectsPreviewMode)
    : 'default'

  const base: SidebarSnapshot = {
    activeView: 'chat',
    connectPhoneSidebarOpen: false,
    pluginsActive: false,
    focusModeEnabled: false,
    runtimeReady: true,
    activeThreadId: 'thread-1',
    projectsMode,
    clawChannels: PREVIEW_CLAW_CHANNELS,
    activeClawChannelId: 'weixin-support',
    connectPhoneTarget: 'feishu',
    connectPhoneQrStatus: 'idle',
  }

  if (mode === 'claw') return { ...base, activeView: 'claw' }
  if (mode === 'schedule') return { ...base, activeView: 'schedule' }
  if (mode === 'focusMode') return { ...base, focusModeEnabled: true }
  if (mode === 'connectPhone') {
    return {
      ...base,
      connectPhoneSidebarOpen: true,
      connectPhoneQrStatus: 'showing',
    }
  }
  return base
}

function SidebarFooter({
  focusModeEnabled,
  connectPhoneSidebarOpen,
  onFocusModeChange,
  onToggleConnectPhone,
}: {
  focusModeEnabled: boolean
  connectPhoneSidebarOpen: boolean
  onFocusModeChange?: (enabled: boolean) => void
  onToggleConnectPhone?: () => void
}): ReactElement {
  return (
    <div className="space-y-1">
      <div className="flex min-h-[42px] items-center justify-center gap-2.5 pb-1">
        {!focusModeEnabled ? (
          <span className="flex h-[46px] w-[56px] shrink-0 items-center justify-center">
            <SidebarMascot />
          </span>
        ) : null}
        <FocusModeToggle
          enabled={focusModeEnabled}
          onToggle={() => onFocusModeChange?.(!focusModeEnabled)}
        />
      </div>
      <SidebarCommandRow
        icon={<Smartphone className="h-4 w-4" strokeWidth={1.75} />}
        label={SIDEBAR_CLAW_LABEL}
        onClick={onToggleConnectPhone}
        active={connectPhoneSidebarOpen}
        variant="footer"
      />
      <SidebarCommandRow
        icon={<Settings className="h-4 w-4" strokeWidth={1.75} />}
        label={SIDEBAR_SETTINGS_LABEL}
        variant="footer"
      />
    </div>
  )
}

export function Sidebar({
  snapshot,
  onFocusModeChange,
  onToggleConnectPhone,
}: {
  snapshot: SidebarSnapshot
  onFocusModeChange?: (enabled: boolean) => void
  onToggleConnectPhone?: () => void
}): ReactElement {
  const groups = useMemo(
    () => previewWorkspaceGroups(snapshot.projectsMode),
    [snapshot.projectsMode],
  )

  return (
    <SidebarFrame
      title={SIDEBAR_APP_NAME}
      footer={
        <SidebarFooter
          focusModeEnabled={snapshot.focusModeEnabled}
          connectPhoneSidebarOpen={snapshot.connectPhoneSidebarOpen}
          onFocusModeChange={onFocusModeChange}
          onToggleConnectPhone={onToggleConnectPhone}
        />
      }
    >
      <div className="ds-no-drag flex flex-col px-1">
        <WorkspaceModeTabs
          activeView={snapshot.activeView}
          onCodeOpen={() => undefined}
          onWriteOpen={() => undefined}
        />

        {snapshot.activeView !== 'claw' && snapshot.activeView !== 'schedule' ? (
          <>
            <SidebarCommandRow
              icon={<Plus className="h-4 w-4" strokeWidth={2} />}
              label={SIDEBAR_NEW_AGENT_LABEL}
              disabled={!snapshot.runtimeReady}
              disabledHint={SIDEBAR_RUNTIME_ACTION_NEEDS_CONNECTION}
              variant="accent"
            />
            <SidebarCommandRow
              icon={<FileQuestion className="h-4 w-4" strokeWidth={1.9} />}
              label={SIDEBAR_SDD_NEW_REQUIREMENT_LABEL}
              disabled={!snapshot.runtimeReady}
              disabledHint={SIDEBAR_RUNTIME_ACTION_NEEDS_CONNECTION}
              variant="accent"
            />
          </>
        ) : null}
        <SidebarCommandRow
          icon={<LayoutGrid className="h-4 w-4" strokeWidth={1.75} />}
          label={SIDEBAR_PLUGINS_LABEL}
          active={snapshot.pluginsActive}
        />
        <SidebarCommandRow
          icon={<Clock3 className="h-4 w-4" strokeWidth={1.75} />}
          label={SIDEBAR_SCHEDULE_LABEL}
          active={snapshot.activeView === 'schedule'}
        />
      </div>

      <div className="ds-no-drag mx-1 my-1" />

      {snapshot.connectPhoneSidebarOpen ? (
        <ConnectPhoneSidebarPanel
          channels={snapshot.clawChannels.filter((channel) => channel.provider === 'feishu')}
          target={snapshot.connectPhoneTarget}
          qrStatus={snapshot.connectPhoneQrStatus}
          qrTimeLeft={42}
          userCode=""
          qrError=""
          saving={false}
          disconnecting={false}
          disconnectError=""
        />
      ) : snapshot.activeView === 'claw' ? (
        <ClawSidebarContent
          channels={snapshot.clawChannels}
          activeChannelId={snapshot.activeClawChannelId}
          activeThreadId={snapshot.activeThreadId}
        />
      ) : (
        <SidebarProjectsSection
          groups={groups}
          activeThreadId={snapshot.activeThreadId}
          searchQuery={snapshot.projectsMode === 'search' ? 'sidebar' : ''}
          searchVisible={snapshot.projectsMode === 'search'}
          showRenameDialog={snapshot.projectsMode === 'renameDialog'}
          showContextMenu={snapshot.projectsMode === 'contextMenu'}
        />
      )}
    </SidebarFrame>
  )
}

/** Full sidebar preview shell for ?sidebarPreview URL hooks. */
export function SidebarPreview({ mode }: { mode: SidebarPreviewMode }): ReactElement {
  const initial = useMemo(() => previewSnapshot(mode), [mode])
  const [focusModeEnabled, setFocusModeEnabled] = useState(initial.focusModeEnabled)
  const [connectPhoneSidebarOpen, setConnectPhoneSidebarOpen] = useState(
    initial.connectPhoneSidebarOpen,
  )

  const snapshot: SidebarSnapshot = {
    ...initial,
    focusModeEnabled,
    connectPhoneSidebarOpen,
  }

  return (
    <div className="chat-sidebar-preview-wrap">
      <aside className="chat-sidebar-preview-shell">
        <Sidebar
          snapshot={snapshot}
          onFocusModeChange={setFocusModeEnabled}
          onToggleConnectPhone={() => setConnectPhoneSidebarOpen((open) => !open)}
        />
      </aside>
    </div>
  )
}
