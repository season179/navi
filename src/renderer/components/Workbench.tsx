// Workbench orchestrator echoing Kun's Workbench
// (../Kun/src/renderer/src/components/Workbench.tsx).
// Visual only: composes Sidebar, SessionHeader, WorkbenchTopBar, MessageTimeline,
// Composer, right panels, terminal drawer, and side conversation overlay.

import { useMemo, useState, type ReactElement } from 'react'
import { ChevronDown } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { SidebarTitlebarToggleButton } from './SidebarPrimitives'
import {
  SessionHeader,
  SESSION_HEADER_PREVIEW,
  type SessionHeaderSnapshot,
} from './SessionHeader'
import {
  WorkbenchTopBar,
  type RightPanelMode,
} from './WorkbenchTopBar'
import {
  MessageTimeline,
  resolveMessageTimelinePreviewSnapshot,
  type MessageTimelinePreviewMode,
} from './MessageTimeline'
import { RuntimeBanner, RUNTIME_BANNER_PREVIEW } from './RuntimeBanner'
import { Composer } from './Composer'
import {
  FloatingComposerExecutionPicker,
  EXECUTION_PICKER_PREVIEW,
} from './FloatingComposerExecutionPicker'
import { GitBranchPicker, GIT_BRANCH_PICKER_PREVIEW } from './GitBranchPicker'
import {
  WorkspaceProjectPicker,
  WORKSPACE_PROJECT_PICKER_PREVIEW,
} from './WorkspaceProjectPicker'
import {
  TodoPanel,
  TODO_PANEL_PREVIEW_ITEMS,
} from './TodoPanel'
import {
  ChangeInspector,
  CHANGE_INSPECTOR_PREVIEW_ITEMS,
} from './ChangeInspector'
import {
  DevBrowserPanel,
  DEV_BROWSER_PANEL_PREVIEW,
} from './DevBrowserPanel'
import { PlanPanel, PLAN_PANEL_PREVIEW } from './PlanPanel'
import {
  WorkspaceFilePreviewPanel,
  WORKSPACE_FILE_PREVIEW_RESULT,
  WORKSPACE_FILE_PREVIEW_TARGET,
  WORKSPACE_FILE_PREVIEW_TARGETS,
} from './WorkspaceFilePreviewPanel'
import {
  ChatFileTreePanel,
  CHAT_FILE_TREE_PREVIEW,
} from './ChatFileTreePanel'
import { TerminalPanel, TERMINAL_PANEL_PREVIEW_TABS } from './TerminalPanel'
import {
  SideConversationPanel,
  SIDE_CONVERSATION_PANEL_PREVIEW_SIDES,
} from './SideConversationPanel'
import { IkunCameoLayer, KunCelebrationLayer } from './AnimatedWorkLogo'
import type { ClawImChannelSidebarSnapshot } from './ClawSidebar'
import type { ClawInstallTarget } from './ClawAddImDialog'
import type { ConnectPhoneQrStatus } from './ConnectPhoneView'

const LEFT_SIDEBAR_WIDTH = 304
const RIGHT_SIDEBAR_WIDTH = 360
const FILE_TREE_SIDEBAR_WIDTH = 320
const TERMINAL_HEIGHT = 360

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
        chatId: 'wx_support_ops',
        senderName: 'Support Bot',
        localThreadId: 'thread-wx-1',
        updatedAt: '2026-06-21T18:20:00.000Z',
      },
    ],
  },
]

type SidebarPreviewSnapshot = {
  activeView: 'chat' | 'write' | 'claw' | 'schedule'
  connectPhoneSidebarOpen: boolean
  pluginsActive: boolean
  focusModeEnabled: boolean
  runtimeReady: boolean
  activeThreadId: string | null
  projectsMode:
    | 'default'
    | 'empty'
    | 'search'
    | 'multiWorkspace'
    | 'running'
    | 'forked'
    | 'renameDialog'
    | 'contextMenu'
  clawChannels: ClawImChannelSidebarSnapshot[]
  activeClawChannelId: string
  connectPhoneTarget: ClawInstallTarget
  connectPhoneQrStatus: ConnectPhoneQrStatus
}

const DEFAULT_SIDEBAR_SNAPSHOT: SidebarPreviewSnapshot = {
  activeView: 'chat',
  connectPhoneSidebarOpen: false,
  pluginsActive: false,
  focusModeEnabled: false,
  runtimeReady: true,
  activeThreadId: 'thread-1',
  projectsMode: 'default',
  clawChannels: PREVIEW_CLAW_CHANNELS,
  activeClawChannelId: 'weixin-support',
  connectPhoneTarget: 'feishu',
  connectPhoneQrStatus: 'idle',
}

export type WorkbenchPreviewMode =
  | 'default'
  | 'empty'
  | 'busy'
  | 'multi'
  | 'rich'
  | 'collapsedSidebar'
  | 'todo'
  | 'changes'
  | 'browser'
  | 'plan'
  | 'file'
  | 'terminal'
  | 'fileTree'
  | 'sidechat'
  | 'runtimeError'

type WorkbenchLayoutSnapshot = {
  leftSidebarCollapsed: boolean
  rightPanelMode: RightPanelMode
  terminalOpen: boolean
  fileTreeOpen: boolean
  sideChatOpen: boolean
  runtimeError: boolean
  timelineMode: MessageTimelinePreviewMode
  busy: boolean
  sessionHeader: SessionHeaderSnapshot
}

function resolveWorkbenchLayout(mode: WorkbenchPreviewMode): WorkbenchLayoutSnapshot {
  const base: WorkbenchLayoutSnapshot = {
    leftSidebarCollapsed: false,
    rightPanelMode: null,
    terminalOpen: false,
    fileTreeOpen: false,
    sideChatOpen: false,
    runtimeError: false,
    timelineMode: 'single',
    busy: false,
    sessionHeader: SESSION_HEADER_PREVIEW.default,
  }

  switch (mode) {
    case 'empty':
      return { ...base, timelineMode: 'empty' }
    case 'busy':
      return { ...base, timelineMode: 'processing', busy: true }
    case 'multi':
      return { ...base, timelineMode: 'multi' }
    case 'rich':
      return { ...base, timelineMode: 'rich' }
    case 'collapsedSidebar':
      return { ...base, leftSidebarCollapsed: true }
    case 'todo':
      return { ...base, rightPanelMode: 'todo' }
    case 'changes':
      return { ...base, rightPanelMode: 'changes' }
    case 'browser':
      return { ...base, rightPanelMode: 'browser' }
    case 'plan':
      return { ...base, rightPanelMode: 'plan' }
    case 'file':
      return { ...base, rightPanelMode: 'file' }
    case 'terminal':
      return { ...base, terminalOpen: true }
    case 'fileTree':
      return { ...base, fileTreeOpen: true }
    case 'sidechat':
      return { ...base, sideChatOpen: true }
    case 'runtimeError':
      return {
        ...base,
        runtimeError: true,
        timelineMode: 'empty',
      }
    case 'default':
    default:
      return base
  }
}

function WorkbenchComposerFooter(): ReactElement {
  return (
    <div className="workbench-composer-footer">
      <WorkspaceProjectPicker snapshot={WORKSPACE_PROJECT_PICKER_PREVIEW} />
      <GitBranchPicker snapshot={GIT_BRANCH_PICKER_PREVIEW} />
    </div>
  )
}

function WorkbenchModelChip(): ReactElement {
  return (
    <button type="button" className="model-chip" aria-label="Model">
      Claude Sonnet 4
      <span className="model-chip-reasoning">medium</span>
      <ChevronDown aria-hidden="true" />
    </button>
  )
}

function WorkbenchComposer({
  busy,
}: {
  busy: boolean
}): ReactElement {
  const [input, setInput] = useState('')
  const [execution, setExecution] = useState(EXECUTION_PICKER_PREVIEW)

  return (
    <div className="ds-floating-composer workbench-composer-shell">
      <Composer
        value={input}
        onChange={setInput}
        onSend={() => undefined}
        onCancel={() => undefined}
        busy={busy}
        placeholder="Send a message to Navi…"
        modelChip={<WorkbenchModelChip />}
        executionPicker={
          <FloatingComposerExecutionPicker
            value={execution}
            onChange={(patch) => setExecution((current) => ({ ...current, ...patch }))}
          />
        }
        footerLeft={<WorkbenchComposerFooter />}
      />
    </div>
  )
}

function renderRightPanel(
  mode: RightPanelMode,
  onCollapse: () => void,
): ReactElement | null {
  switch (mode) {
    case 'todo':
      return (
        <TodoPanel
          items={TODO_PANEL_PREVIEW_ITEMS}
          className="h-full max-h-full w-full"
          onCollapse={onCollapse}
        />
      )
    case 'changes':
      return (
        <ChangeInspector
          items={CHANGE_INSPECTOR_PREVIEW_ITEMS}
          className="h-full max-h-full w-full flex-col"
          onCollapse={onCollapse}
        />
      )
    case 'browser':
      return (
        <DevBrowserPanel
          {...DEV_BROWSER_PANEL_PREVIEW}
          className="h-full max-h-full w-full flex-col"
          onCollapse={onCollapse}
        />
      )
    case 'plan':
      return (
        <PlanPanel
          {...PLAN_PANEL_PREVIEW}
          className="h-full max-h-full w-full"
          onCollapse={onCollapse}
        />
      )
    case 'file':
      return (
        <WorkspaceFilePreviewPanel
          target={WORKSPACE_FILE_PREVIEW_TARGET}
          openTargets={WORKSPACE_FILE_PREVIEW_TARGETS}
          result={WORKSPACE_FILE_PREVIEW_RESULT}
          className="h-full max-h-full w-full"
          onCollapse={onCollapse}
        />
      )
    default:
      return null
  }
}

type WorkbenchProps = {
  snapshot: WorkbenchLayoutSnapshot
  sidebarSnapshot?: SidebarPreviewSnapshot
}

export function Workbench({
  snapshot,
  sidebarSnapshot = DEFAULT_SIDEBAR_SNAPSHOT,
}: WorkbenchProps): ReactElement {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(
    snapshot.leftSidebarCollapsed,
  )
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>(
    snapshot.rightPanelMode,
  )
  const [terminalOpen, setTerminalOpen] = useState(snapshot.terminalOpen)
  const [fileTreeOpen, setFileTreeOpen] = useState(snapshot.fileTreeOpen)
  const [sideChatOpen, setSideChatOpen] = useState(snapshot.sideChatOpen)
  const [focusModeEnabled, setFocusModeEnabled] = useState(
    sidebarSnapshot.focusModeEnabled,
  )
  const [connectPhoneSidebarOpen, setConnectPhoneSidebarOpen] = useState(
    sidebarSnapshot.connectPhoneSidebarOpen,
  )

  const timelineSnapshot = useMemo(
    () => resolveMessageTimelinePreviewSnapshot(snapshot.timelineMode),
    [snapshot.timelineMode],
  )

  const sidebar = {
    ...sidebarSnapshot,
    focusModeEnabled,
    connectPhoneSidebarOpen,
  }

  const rightPanelVisible = rightPanelMode !== null
  const fileTreeOffset = fileTreeOpen ? FILE_TREE_SIDEBAR_WIDTH : 0
  const sideChatRightOffset =
    (rightPanelVisible ? RIGHT_SIDEBAR_WIDTH + 24 : 24) + fileTreeOffset

  const toggleRightPanel = (mode: Exclude<RightPanelMode, null>): void => {
    setRightPanelMode((current) => (current === mode ? null : mode))
  }

  return (
    <div className="ds-workbench-shell">
      {!leftSidebarCollapsed ? (
        <>
          <div className="workbench-left-sidebar" style={{ width: LEFT_SIDEBAR_WIDTH }}>
            <Sidebar
              snapshot={sidebar}
              onFocusModeChange={setFocusModeEnabled}
              onToggleConnectPhone={() => setConnectPhoneSidebarOpen((open) => !open)}
            />
          </div>
          <div
            role="separator"
            aria-orientation="vertical"
            className="ds-workbench-divider ds-no-drag"
          />
        </>
      ) : null}

      <main className="ds-stage-surface workbench-main">
        {snapshot.runtimeError ? (
          <RuntimeBanner snapshot={RUNTIME_BANNER_PREVIEW.default} />
        ) : null}

        <div className="workbench-main-row">
          <div className="workbench-chat-column">
            <section className="ds-chat-stage workbench-chat-stage">
              <div className="ds-stage-inset workbench-chat-stage-inset">
                <header className="chat-topbar ds-topbar-surface workbench-chat-topbar">
                  <div className="chat-topbar-grid">
                    <div
                      className={`chat-topbar-session ${
                        leftSidebarCollapsed ? 'ds-window-controls-safe-inset' : ''
                      }`}
                    >
                      <SidebarTitlebarToggleButton
                        onClick={() => setLeftSidebarCollapsed((value) => !value)}
                        title={leftSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                      />
                      <SessionHeader
                        snapshot={snapshot.sessionHeader}
                        compact
                        busy={snapshot.busy}
                        className="workbench-session-header"
                      />
                    </div>
                    <div className="chat-topbar-actions">
                      {snapshot.busy ? (
                        <span className="workbench-running-pill">Running</span>
                      ) : null}
                      <WorkbenchTopBar
                        rightPanelMode={rightPanelMode}
                        onToggleRightPanelMode={toggleRightPanel}
                        planPanelEnabled
                        terminalOpen={terminalOpen}
                        onToggleTerminal={() => setTerminalOpen((value) => !value)}
                        sideChatCount={sideChatOpen ? 1 : 0}
                        sideChatRunningCount={0}
                        sideChatOpen={sideChatOpen}
                        sideChatEnabled
                        fileTreeOpen={fileTreeOpen}
                        fileTreeEnabled
                        onToggleFileTree={() => setFileTreeOpen((value) => !value)}
                        onOpenSideChat={() => setSideChatOpen((value) => !value)}
                      />
                    </div>
                  </div>
                </header>

                <div className="workbench-timeline-wrap">
                  <MessageTimeline {...timelineSnapshot} busy={snapshot.busy} />
                  {!focusModeEnabled ? (
                    <>
                      <IkunCameoLayer />
                      <KunCelebrationLayer active={snapshot.busy} suppressed={snapshot.runtimeError} />
                    </>
                  ) : null}
                </div>

                <div className="workbench-composer-wrap">
                  <WorkbenchComposer busy={snapshot.busy} />
                </div>
              </div>

              {terminalOpen ? (
                <div className="workbench-terminal-wrap">
                  <div
                    role="separator"
                    aria-orientation="horizontal"
                    className="workbench-terminal-divider"
                  />
                  <TerminalPanel
                    height={TERMINAL_HEIGHT}
                    tabs={TERMINAL_PANEL_PREVIEW_TABS}
                    className="w-full"
                    onCollapse={() => setTerminalOpen(false)}
                  />
                </div>
              ) : null}
            </section>

            {sideChatOpen ? (
              <SideConversationPanel
                rightOffset={sideChatRightOffset}
                parentTitle={snapshot.sessionHeader.title}
                sides={SIDE_CONVERSATION_PANEL_PREVIEW_SIDES}
                activeSideId={SIDE_CONVERSATION_PANEL_PREVIEW_SIDES[0]?.threadId ?? null}
                onClose={() => setSideChatOpen(false)}
                onMinimize={() => setSideChatOpen(false)}
              />
            ) : null}
          </div>

          {rightPanelVisible ? (
            <>
              <div
                role="separator"
                aria-orientation="vertical"
                className="ds-workbench-divider ds-no-drag"
              />
              <div className="workbench-right-panel" style={{ width: RIGHT_SIDEBAR_WIDTH }}>
                {renderRightPanel(rightPanelMode, () => setRightPanelMode(null))}
              </div>
            </>
          ) : null}

          {fileTreeOpen ? (
            <>
              <div
                role="separator"
                aria-orientation="vertical"
                className="ds-workbench-divider ds-no-drag"
              />
              <aside
                className="workbench-file-tree-panel ds-no-drag"
                style={{ width: FILE_TREE_SIDEBAR_WIDTH }}
              >
                <ChatFileTreePanel
                  workspaceRoot={CHAT_FILE_TREE_PREVIEW.workspaceRoot}
                  entries={CHAT_FILE_TREE_PREVIEW.entries}
                  selectedPath={CHAT_FILE_TREE_PREVIEW.selectedPath}
                  fill
                />
              </aside>
            </>
          ) : null}
        </div>
      </main>
    </div>
  )
}

export function WorkbenchPreview({ mode }: { mode: WorkbenchPreviewMode }): ReactElement {
  const snapshot = useMemo(() => resolveWorkbenchLayout(mode), [mode])

  return (
    <div className="workbench-preview-wrap">
      <Workbench snapshot={snapshot} />
    </div>
  )
}
