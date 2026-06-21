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
import { GreetingMascot, SitMascot, SleepingMascot } from './Mascot'
import { WorkspaceModeTabs, type WorkspaceModeView } from './WorkspaceModeTabs'
import { SidebarCommandRow, SidebarFrame } from './SidebarPrimitives'
import {
  SidebarProjectsSection,
  previewWorkspaceGroups,
  type SidebarProjectsPreviewMode,
} from './SidebarProjectsSection'
import {
  ClawSidebarContent,
  type ClawImChannelSidebarSnapshot,
} from './ClawSidebar'
import {
  ConnectPhoneSidebarPanel,
  type ConnectPhoneQrStatus,
} from './ConnectPhoneView'
import { type ClawInstallTarget } from './ClawAddImDialog'

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

const COPY = {
  appName: 'Navi',
  focusMode: 'Focus',
  switchOn: 'On',
  switchOff: 'Off',
  focusModeToggleTitle: 'Focus mode',
  focusModeToggleLabel: 'Toggle focus mode',
  claw: 'Claw',
  settings: 'Settings',
  newAgent: 'New agent',
  sddNewRequirement: 'New requirement',
  plugins: 'Plugins',
  schedule: 'Schedule',
  runtimeActionNeedsConnection: 'Connect a provider first',
}

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
      role="switch"
      aria-checked={enabled}
      aria-label={COPY.focusModeToggleLabel}
      title={`${COPY.focusModeToggleTitle} · ${enabled ? COPY.switchOn : COPY.switchOff}`}
      onClick={onToggle}
      className={`sidebar-focus-toggle ${enabled ? 'is-enabled' : ''}`}
    >
      <span className="sidebar-focus-toggle-label">
        <Focus className="sidebar-focus-toggle-icon" strokeWidth={1.8} aria-hidden="true" />
        <span className="sidebar-focus-toggle-text">{COPY.focusMode}</span>
      </span>
      <span className="sidebar-focus-toggle-track" aria-hidden="true">
        <span className="sidebar-focus-toggle-thumb" />
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
        label={COPY.claw}
        onClick={onToggleConnectPhone}
        active={connectPhoneSidebarOpen}
        variant="footer"
      />
      <SidebarCommandRow
        icon={<Settings className="h-4 w-4" strokeWidth={1.75} />}
        label={COPY.settings}
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
      title={COPY.appName}
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
              label={COPY.newAgent}
              disabled={!snapshot.runtimeReady}
              disabledHint={COPY.runtimeActionNeedsConnection}
              variant="accent"
            />
            <SidebarCommandRow
              icon={<FileQuestion className="h-4 w-4" strokeWidth={1.9} />}
              label={COPY.sddNewRequirement}
              disabled={!snapshot.runtimeReady}
              disabledHint={COPY.runtimeActionNeedsConnection}
              variant="accent"
            />
          </>
        ) : null}
        <SidebarCommandRow
          icon={<LayoutGrid className="h-4 w-4" strokeWidth={1.75} />}
          label={COPY.plugins}
          active={snapshot.pluginsActive}
        />
        <SidebarCommandRow
          icon={<Clock3 className="h-4 w-4" strokeWidth={1.75} />}
          label={COPY.schedule}
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
