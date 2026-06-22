// Workbench topbar action cluster echoing Kun's WorkbenchTopBar
// (../Kun/src/renderer/src/components/chat/WorkbenchTopBar.tsx).
// Visual only: parent supplies panel/editor snapshots and optional preview flags.

import { Fragment, useEffect, useRef, useState, type ReactElement } from 'react'
import {
  ArrowUpCircle,
  Check,
  ChevronDown,
  ClipboardList,
  Code2,
  ExternalLink,
  FileEdit,
  Files,
  FolderOpen,
  Globe2,
  ListTodo,
  Loader2,
  MessageCircleMore,
  RefreshCw,
  Terminal,
} from 'lucide-react'
import {
  WORKBENCH_EDITOR_LINE_BADGE,
  WORKBENCH_EDITOR_PICKER_MENU_TITLE,
  WORKBENCH_EDITOR_PICKER_TITLE,
  WORKBENCH_GUI_UPDATE_INSTALL_LABEL,
  WORKBENCH_RIGHT_PANEL_BROWSER_LABEL,
  WORKBENCH_RIGHT_PANEL_CHANGES_LABEL,
  WORKBENCH_RIGHT_PANEL_FILES_LABEL,
  WORKBENCH_RIGHT_PANEL_PLAN_LABEL,
  WORKBENCH_RIGHT_PANEL_TERMINAL_LABEL,
  WORKBENCH_RIGHT_PANEL_TODO_LABEL,
  WORKBENCH_SIDE_PANEL_OPEN_LABEL,
  formatEditorPickerTitleWithEditor,
  formatGuiUpdateAvailable,
  formatGuiUpdateAvailableManual,
  formatGuiUpdateTopbarAvailable,
  formatGuiUpdateTopbarDownloading,
  formatGuiUpdateTopbarManual,
} from '../lib/workbenchTopBar'

export type RightPanelMode =
  | 'todo'
  | 'changes'
  | 'browser'
  | 'file'
  | 'plan'
  | 'sdd-ai'
  | null

export type WorkbenchEditorInfo = {
  id: string
  label: string
  kind: 'code' | 'terminal' | 'viewer'
  supportsLine?: boolean
}

export type WorkbenchGuiUpdatePreview = {
  label: string
  title: string
  status: 'available' | 'downloading' | 'downloaded' | 'manual'
  percent?: number
}

type Props = {
  rightPanelMode?: RightPanelMode
  onToggleRightPanelMode?: (mode: Exclude<RightPanelMode, null>) => void
  planPanelEnabled?: boolean
  terminalOpen?: boolean
  onToggleTerminal?: () => void
  sideChatCount?: number
  sideChatRunningCount?: number
  sideChatOpen?: boolean
  sideChatEnabled?: boolean
  fileTreeOpen?: boolean
  fileTreeEnabled?: boolean
  onToggleFileTree?: () => void
  onOpenSideChat?: () => void
  editors?: WorkbenchEditorInfo[]
  selectedEditorId?: string
  onSelectEditor?: (editorId: string) => void
  guiUpdate?: WorkbenchGuiUpdatePreview | null
  className?: string
}

/** Sample editors for ?workbenchTopBarPreview hooks. */
export const WORKBENCH_TOP_BAR_PREVIEW_EDITORS: WorkbenchEditorInfo[] = [
  { id: 'cursor', label: 'Cursor', kind: 'code', supportsLine: true },
  { id: 'vscode', label: 'Visual Studio Code', kind: 'code', supportsLine: true },
  { id: 'terminal', label: 'Terminal', kind: 'terminal' },
  { id: 'finder', label: 'Finder', kind: 'viewer' },
]

export const WORKBENCH_TOP_BAR_PREVIEW_GUI_UPDATE = {
  available: {
    label: formatGuiUpdateTopbarAvailable('0.9.2'),
    title: formatGuiUpdateAvailable('0.9.1', '0.9.2'),
    status: 'available',
  },
  downloading: {
    label: formatGuiUpdateTopbarDownloading(42),
    title: formatGuiUpdateAvailable('0.9.1', '0.9.2'),
    status: 'downloading',
    percent: 42,
  },
  downloaded: {
    label: WORKBENCH_GUI_UPDATE_INSTALL_LABEL,
    title: formatGuiUpdateAvailable('0.9.1', '0.9.2'),
    status: 'downloaded',
  },
  manual: {
    label: formatGuiUpdateTopbarManual('0.9.2'),
    title: formatGuiUpdateAvailableManual('0.9.1', '0.9.2'),
    status: 'manual',
  },
} satisfies Record<string, WorkbenchGuiUpdatePreview>

export type WorkbenchTopBarPreviewMode =
  | 'default'
  | 'update'
  | 'downloading'
  | 'downloaded'
  | 'manual'
  | 'sidechat'
  | 'sidechatRunning'
  | 'active'

function renderEditorIcon(
  editor: WorkbenchEditorInfo | null | undefined,
  className: string,
): ReactElement {
  const Icon =
    editor?.kind === 'terminal' ? Terminal : editor?.kind === 'viewer' ? FolderOpen : Code2
  return <Icon className={className} strokeWidth={1.8} />
}

function renderGuiUpdateIcon(
  guiUpdate: WorkbenchGuiUpdatePreview,
  busy: boolean,
): ReactElement {
  if (busy || guiUpdate.status === 'downloading') {
    return <Loader2 className="workbench-topbar-gui-update-icon workbench-topbar-gui-update-icon-spin" strokeWidth={2} />
  }
  if (guiUpdate.status === 'downloaded') {
    return <RefreshCw className="workbench-topbar-gui-update-icon" strokeWidth={1.85} />
  }
  if (guiUpdate.status === 'manual') {
    return <ExternalLink className="workbench-topbar-gui-update-icon" strokeWidth={1.85} />
  }
  return <ArrowUpCircle className="workbench-topbar-gui-update-icon" strokeWidth={1.85} />
}

export function WorkbenchTopBar({
  rightPanelMode = null,
  onToggleRightPanelMode,
  planPanelEnabled = false,
  terminalOpen = false,
  onToggleTerminal,
  sideChatCount = 0,
  sideChatRunningCount = 0,
  sideChatOpen = false,
  sideChatEnabled = true,
  fileTreeOpen = false,
  fileTreeEnabled = true,
  onToggleFileTree,
  onOpenSideChat,
  editors = WORKBENCH_TOP_BAR_PREVIEW_EDITORS,
  selectedEditorId,
  onSelectEditor,
  guiUpdate = null,
  className = '',
}: Props): ReactElement {
  const [editorMenuOpen, setEditorMenuOpen] = useState(false)
  const [internalEditorId, setInternalEditorId] = useState(
    () => selectedEditorId ?? editors[0]?.id ?? '',
  )
  const editorMenuRef = useRef<HTMLDivElement>(null)

  const effectiveEditorId = selectedEditorId ?? internalEditorId
  const selectedEditor = editors.find((editor) => editor.id === effectiveEditorId) ?? editors[0]

  const items = [
    { mode: 'todo' as const, label: WORKBENCH_RIGHT_PANEL_TODO_LABEL, icon: ListTodo },
    ...(planPanelEnabled
      ? [{ mode: 'plan' as const, label: WORKBENCH_RIGHT_PANEL_PLAN_LABEL, icon: ClipboardList }]
      : []),
    { mode: 'changes' as const, label: WORKBENCH_RIGHT_PANEL_CHANGES_LABEL, icon: FileEdit },
    { mode: 'browser' as const, label: WORKBENCH_RIGHT_PANEL_BROWSER_LABEL, icon: Globe2 },
  ]

  const guiUpdateBusy = guiUpdate?.status === 'downloading'

  useEffect(() => {
    if (!editorMenuOpen) return
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target
      if (target instanceof Node && editorMenuRef.current?.contains(target)) return
      setEditorMenuOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [editorMenuOpen])

  const chooseEditor = (editor: WorkbenchEditorInfo): void => {
    setInternalEditorId(editor.id)
    onSelectEditor?.(editor.id)
    setEditorMenuOpen(false)
  }

  const togglePanel = (mode: Exclude<RightPanelMode, null>): void => {
    onToggleRightPanelMode?.(mode)
  }

  return (
    <div className={['workbench-topbar', className].filter(Boolean).join(' ')}>
      {guiUpdate ? (
        <button
          type="button"
          disabled={guiUpdateBusy}
          className="workbench-topbar-gui-update-button"
          aria-label={guiUpdate.title}
          title={guiUpdate.title}
        >
          {renderGuiUpdateIcon(guiUpdate, guiUpdateBusy)}
          <span className="workbench-topbar-gui-update-label">{guiUpdate.label}</span>
        </button>
      ) : null}

      <div ref={editorMenuRef} className="workbench-topbar-editor-picker">
        <button
          type="button"
          onClick={() => setEditorMenuOpen((value) => !value)}
          className="workbench-topbar-icon-button workbench-topbar-editor-trigger"
          aria-label={WORKBENCH_EDITOR_PICKER_TITLE}
          aria-expanded={editorMenuOpen}
          title={
            selectedEditor
              ? formatEditorPickerTitleWithEditor(selectedEditor.label)
              : WORKBENCH_EDITOR_PICKER_TITLE
          }
        >
          {renderEditorIcon(selectedEditor, 'workbench-topbar-editor-icon')}
          <ChevronDown className="workbench-topbar-editor-chevron" strokeWidth={1.9} />
        </button>

        {editorMenuOpen ? (
          <div className="workbench-topbar-editor-menu">
            <div className="workbench-topbar-editor-menu-title">{WORKBENCH_EDITOR_PICKER_MENU_TITLE}</div>
            {editors.map((editor) => {
              const active = editor.id === selectedEditor?.id
              return (
                <button
                  key={editor.id}
                  type="button"
                  onClick={() => chooseEditor(editor)}
                  className={
                    active
                      ? 'workbench-topbar-editor-row is-active'
                      : 'workbench-topbar-editor-row'
                  }
                >
                  {renderEditorIcon(editor, 'workbench-topbar-editor-row-icon')}
                  <span className="workbench-topbar-editor-row-label">{editor.label}</span>
                  {editor.supportsLine ? (
                    <span className="workbench-topbar-editor-line-badge">{WORKBENCH_EDITOR_LINE_BADGE}</span>
                  ) : null}
                  {active ? (
                    <Check className="workbench-topbar-editor-check" strokeWidth={2} />
                  ) : null}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>

      {onOpenSideChat ? (
        <button
          type="button"
          onClick={onOpenSideChat}
          disabled={!sideChatEnabled}
          className={
            sideChatOpen
              ? 'workbench-topbar-icon-button is-active workbench-topbar-sidechat-button'
              : 'workbench-topbar-icon-button workbench-topbar-sidechat-button'
          }
          aria-label={WORKBENCH_SIDE_PANEL_OPEN_LABEL}
          aria-pressed={sideChatOpen}
          title={WORKBENCH_SIDE_PANEL_OPEN_LABEL}
        >
          <MessageCircleMore className="workbench-topbar-panel-icon" strokeWidth={1.75} />
          {sideChatCount > 0 ? (
            <span className="workbench-topbar-sidechat-badge">{Math.min(sideChatCount, 9)}</span>
          ) : null}
          {sideChatRunningCount > 0 ? (
            <span className="workbench-topbar-sidechat-running" />
          ) : null}
        </button>
      ) : null}

      {items.map((item) => {
        const active = rightPanelMode === item.mode
        const Icon = item.icon
        const isChanges = item.mode === 'changes'
        return (
          <Fragment key={item.mode}>
            <button
              type="button"
              onClick={() => togglePanel(item.mode)}
              className={
                active
                  ? 'workbench-topbar-icon-button is-active'
                  : 'workbench-topbar-icon-button'
              }
              aria-label={item.label}
              aria-pressed={active}
              title={item.label}
            >
              <Icon className="workbench-topbar-panel-icon" strokeWidth={1.75} />
            </button>
            {isChanges && onToggleTerminal ? (
              <button
                type="button"
                onClick={onToggleTerminal}
                className={
                  terminalOpen
                    ? 'workbench-topbar-icon-button is-active'
                    : 'workbench-topbar-icon-button'
                }
                aria-label={WORKBENCH_RIGHT_PANEL_TERMINAL_LABEL}
                aria-pressed={terminalOpen}
                title={WORKBENCH_RIGHT_PANEL_TERMINAL_LABEL}
              >
                <Terminal className="workbench-topbar-panel-icon" strokeWidth={1.75} />
              </button>
            ) : null}
          </Fragment>
        )
      })}

      {onToggleFileTree ? (
        <button
          type="button"
          onClick={onToggleFileTree}
          disabled={!fileTreeEnabled}
          className={
            fileTreeOpen
              ? 'workbench-topbar-icon-button is-active'
              : 'workbench-topbar-icon-button'
          }
          aria-label={WORKBENCH_RIGHT_PANEL_FILES_LABEL}
          aria-pressed={fileTreeOpen}
          title={WORKBENCH_RIGHT_PANEL_FILES_LABEL}
        >
          <Files className="workbench-topbar-panel-icon" strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  )
}
