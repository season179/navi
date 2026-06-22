// Bottom terminal drawer echoing Kun's TerminalPanel
// (../Kun/src/renderer/src/components/terminal/TerminalPanel.tsx).
// Visual only: mock shell output stands in for xterm; parent supplies preview state.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react'
import { createPortal } from 'react-dom'
import {
  PanelRightClose,
  PanelsTopLeft,
  PencilLine,
  Plus,
  RotateCw,
  TerminalSquare,
  X,
} from 'lucide-react'
import {
  formatTerminalTabTitle,
  TERMINAL_CLOSE_ALL_TABS_LABEL,
  TERMINAL_CLOSE_OTHER_TABS_LABEL,
  TERMINAL_CLOSE_TAB_LABEL,
  TERMINAL_EXIT_MESSAGE,
  TERMINAL_NEW_TAB_LABEL,
  TERMINAL_PANEL_COLLAPSE_LABEL,
  TERMINAL_PANEL_TITLE,
  TERMINAL_RENAME_TAB_LABEL,
  TERMINAL_RESTART_LABEL,
  TERMINAL_TAB_MENU_TITLE,
  TERMINAL_UNAVAILABLE_LABEL,
} from '../lib/terminalPanel'

export type TerminalPreviewMode = 'default' | 'single' | 'error' | 'exited'

export type TerminalTabSnapshot = {
  id: string
  index: number
  title?: string
}

type Props = {
  className?: string
  height?: number
  tabs?: TerminalTabSnapshot[]
  activeTabId?: string
  error?: string | null
  exited?: boolean
  onCollapse?: () => void
}

type TabContextMenuState = {
  tabId: string
  x: number
  y: number
}

const MAX_TABS = 8
const INITIAL_TAB_ID = 'main'

/** Default tabs for ?terminalPanelPreview=1 visual verification. */
export const TERMINAL_PANEL_PREVIEW_TABS: TerminalTabSnapshot[] = [
  { id: INITIAL_TAB_ID, index: 1 },
  { id: 'tab-2', index: 2, title: 'npm run dev' },
]

const MOCK_SHELL_LINES = [
  { tone: 'prompt' as const, text: 'season@mac navi % npm run dev' },
  { tone: 'muted' as const, text: '' },
  { tone: 'muted' as const, text: '> navi@0.0.1 dev' },
  { tone: 'muted' as const, text: '> electron .' },
  { tone: 'muted' as const, text: '' },
  { tone: 'success' as const, text: '[electron] App ready' },
  { tone: 'muted' as const, text: '' },
  { tone: 'prompt' as const, text: 'season@mac navi % ' },
]

function getTabTitle(tab: TerminalTabSnapshot): string {
  return tab.title?.trim() || formatTerminalTabTitle(tab.index)
}

function clampMenuPosition(x: number, y: number, width: number, height: number) {
  return {
    x: Math.min(Math.max(x, 8), window.innerWidth - width),
    y: Math.min(Math.max(y, 8), window.innerHeight - height),
  }
}

function TerminalMockSurface(): ReactElement {
  return (
    <pre className="terminal-panel-mock-output" aria-hidden="true">
      {MOCK_SHELL_LINES.map((line, index) => (
        <span key={index} className={`terminal-panel-mock-line is-${line.tone}`}>
          {line.text || '\u00a0'}
          {'\n'}
        </span>
      ))}
    </pre>
  )
}

function TerminalTabContextMenu({
  state,
  tabCount,
  onRename,
  onCloseOthers,
  onCloseAll,
}: {
  state: TabContextMenuState
  tabCount: number
  onRename: () => void
  onCloseOthers: () => void
  onCloseAll: () => void
}): ReactElement {
  return (
    <div
      role="menu"
      aria-label={TERMINAL_TAB_MENU_TITLE}
      className="terminal-panel-tab-menu"
      style={{ left: state.x, top: state.y }}
      onPointerDown={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <button type="button" role="menuitem" className="terminal-panel-tab-menu-item" onClick={onRename}>
        <PencilLine className="terminal-panel-tab-menu-icon" strokeWidth={1.9} />
        <span>{TERMINAL_RENAME_TAB_LABEL}</span>
      </button>
      <div className="terminal-panel-tab-menu-divider" />
      <button
        type="button"
        role="menuitem"
        className="terminal-panel-tab-menu-item"
        disabled={tabCount <= 1}
        onClick={onCloseOthers}
      >
        <PanelRightClose className="terminal-panel-tab-menu-icon" strokeWidth={1.9} />
        <span>{TERMINAL_CLOSE_OTHER_TABS_LABEL}</span>
      </button>
      <button
        type="button"
        role="menuitem"
        className="terminal-panel-tab-menu-item is-danger"
        onClick={onCloseAll}
      >
        <PanelsTopLeft className="terminal-panel-tab-menu-icon" strokeWidth={1.9} />
        <span>{TERMINAL_CLOSE_ALL_TABS_LABEL}</span>
      </button>
    </div>
  )
}

export function TerminalPanel({
  className = '',
  height,
  tabs: tabsProp = TERMINAL_PANEL_PREVIEW_TABS,
  activeTabId: activeTabIdProp,
  error = null,
  exited = false,
  onCollapse,
}: Props): ReactElement {
  const [tabs, setTabs] = useState<TerminalTabSnapshot[]>(() => tabsProp)
  const [activeTabId, setActiveTabId] = useState(
    () => activeTabIdProp ?? tabsProp[0]?.id ?? INITIAL_TAB_ID,
  )
  const [contextMenu, setContextMenu] = useState<TabContextMenuState | null>(null)
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement | null>(null)
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => {
    setTabs(tabsProp)
    setActiveTabId(activeTabIdProp ?? tabsProp[0]?.id ?? INITIAL_TAB_ID)
  }, [activeTabIdProp, tabsProp])

  useEffect(() => {
    if (!renamingTabId) return
    renameInputRef.current?.focus()
    renameInputRef.current?.select()
  }, [renamingTabId])

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0]

  const openTabContextMenu = useCallback(
    (event: ReactMouseEvent | ReactPointerEvent, tabId: string) => {
      event.preventDefault()
      event.stopPropagation()
      const tabButton = tabButtonRefs.current[tabId]
      const tabRect = tabButton?.getBoundingClientRect()
      const pointerX = event.clientX > 0 ? event.clientX : (tabRect?.left ?? 0)
      const pointerY = event.clientY > 0 ? event.clientY : (tabRect?.bottom ?? 0)
      const position = clampMenuPosition(pointerX, pointerY, 220, 132)
      setActiveTabId(tabId)
      setContextMenu({ tabId, ...position })
    },
    [],
  )

  const handleNewTab = () => {
    if (tabs.length >= MAX_TABS) return
    const nextIndex = tabs.reduce((max, tab) => Math.max(max, tab.index), 0) + 1
    const nextTab = { id: `tab-${nextIndex}`, index: nextIndex }
    setTabs((current) => [...current, nextTab])
    setActiveTabId(nextTab.id)
  }

  const handleCloseTab = (tabId: string) => {
    if (tabs.length <= 1) return
    const closingIndex = tabs.findIndex((tab) => tab.id === tabId)
    const nextTabs = tabs.filter((tab) => tab.id !== tabId)
    setTabs(nextTabs)
    if (activeTabId === tabId) {
      const nextTab = tabs[closingIndex + 1] ?? tabs[closingIndex - 1] ?? tabs[0]
      if (nextTab && nextTab.id !== tabId) setActiveTabId(nextTab.id)
    }
  }

  const startRenameTab = (tabId: string) => {
    const tab = tabs.find((item) => item.id === tabId)
    if (!tab) return
    setContextMenu(null)
    setRenamingTabId(tabId)
    setRenameValue(getTabTitle(tab))
  }

  const commitRenameTab = () => {
    if (!renamingTabId) return
    const nextTitle = renameValue.trim()
    setTabs((current) =>
      current.map((tab) =>
        tab.id === renamingTabId ? { ...tab, title: nextTitle || undefined } : tab,
      ),
    )
    setRenamingTabId(null)
    setRenameValue('')
  }

  const cancelRenameTab = () => {
    setRenamingTabId(null)
    setRenameValue('')
  }

  const handleCloseOtherTabs = (tabId: string) => {
    const keptTab = tabs.find((tab) => tab.id === tabId)
    if (!keptTab) return
    setTabs([keptTab])
    setActiveTabId(tabId)
    setContextMenu(null)
    if (renamingTabId && renamingTabId !== tabId) cancelRenameTab()
  }

  const handleCloseAllTabs = () => {
    setContextMenu(null)
    cancelRenameTab()
    setTabs([{ id: INITIAL_TAB_ID, index: 1 }])
    setActiveTabId(INITIAL_TAB_ID)
    onCollapse?.()
  }

  return (
    <aside
      className={`terminal-panel ds-no-drag ${className}`.trim()}
      style={height ? { height } : undefined}
    >
      <div className="terminal-panel-header">
        <div
          className="terminal-panel-tablist"
          role="tablist"
          aria-label={TERMINAL_PANEL_TITLE}
          onPointerDownCapture={(event) => {
            if (!activeTab || event.button !== 2) return
            openTabContextMenu(event, activeTab.id)
          }}
          onContextMenu={(event) => {
            if (!activeTab) return
            openTabContextMenu(event, activeTab.id)
          }}
        >
          {tabs.map((tab) => {
            const active = tab.id === activeTabId
            return (
              <div
                key={tab.id}
                className={`terminal-panel-tab ${active ? 'is-active' : ''}`.trim()}
                onContextMenu={(event) => openTabContextMenu(event, tab.id)}
              >
                {renamingTabId === tab.id ? (
                  <input
                    ref={renameInputRef}
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    onBlur={commitRenameTab}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        commitRenameTab()
                      }
                      if (event.key === 'Escape') {
                        event.preventDefault()
                        cancelRenameTab()
                      }
                    }}
                    className="terminal-panel-tab-rename-input"
                    aria-label={TERMINAL_RENAME_TAB_LABEL}
                  />
                ) : (
                  <button
                    type="button"
                    role="tab"
                    ref={(node) => {
                      tabButtonRefs.current[tab.id] = node
                    }}
                    aria-selected={active}
                    onClick={() => setActiveTabId(tab.id)}
                    onPointerDownCapture={(event) => {
                      if (event.button !== 2) return
                      openTabContextMenu(event, tab.id)
                    }}
                    onContextMenu={(event) => openTabContextMenu(event, tab.id)}
                    className="terminal-panel-tab-button"
                  >
                    <TerminalSquare className="terminal-panel-tab-icon" strokeWidth={1.8} />
                    <span className="terminal-panel-tab-label">{getTabTitle(tab)}</span>
                  </button>
                )}
                {tabs.length > 1 ? (
                  <button
                    type="button"
                    aria-label={TERMINAL_CLOSE_TAB_LABEL}
                    title={TERMINAL_CLOSE_TAB_LABEL}
                    onClick={(event) => {
                      event.stopPropagation()
                      handleCloseTab(tab.id)
                    }}
                    className="terminal-panel-tab-close"
                  >
                    <X className="terminal-panel-tab-close-icon" strokeWidth={1.8} />
                  </button>
                ) : null}
              </div>
            )
          })}
          <button
            type="button"
            onClick={handleNewTab}
            disabled={tabs.length >= MAX_TABS}
            className="terminal-panel-new-tab"
            aria-label={TERMINAL_NEW_TAB_LABEL}
            title={TERMINAL_NEW_TAB_LABEL}
          >
            <Plus className="terminal-panel-new-tab-icon" strokeWidth={1.8} />
          </button>
        </div>
        <div className="terminal-panel-toolbar">
          <button
            type="button"
            className="terminal-panel-toolbar-btn"
            aria-label={TERMINAL_RESTART_LABEL}
            title={TERMINAL_RESTART_LABEL}
          >
            <RotateCw className="terminal-panel-toolbar-icon" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={onCollapse}
            className="terminal-panel-toolbar-btn"
            aria-label={TERMINAL_PANEL_COLLAPSE_LABEL}
            title={TERMINAL_PANEL_COLLAPSE_LABEL}
          >
            <X className="terminal-panel-toolbar-icon" strokeWidth={1.85} />
          </button>
        </div>
        {contextMenu
          ? createPortal(
              <TerminalTabContextMenu
                state={contextMenu}
                tabCount={tabs.length}
                onRename={() => startRenameTab(contextMenu.tabId)}
                onCloseOthers={() => handleCloseOtherTabs(contextMenu.tabId)}
                onCloseAll={handleCloseAllTabs}
              />,
              document.body,
            )
          : null}
      </div>

      <div className="terminal-panel-body">
        {!error ? <TerminalMockSurface /> : null}
        {error ? (
          <div className="terminal-panel-error-overlay">
            <div>
              <div className="terminal-panel-error-title">{TERMINAL_UNAVAILABLE_LABEL}</div>
              <div className="terminal-panel-error-detail">{error}</div>
              <button type="button" className="terminal-panel-error-restart">
                {TERMINAL_RESTART_LABEL}
              </button>
            </div>
          </div>
        ) : null}
        {exited && !error ? (
          <div className="terminal-panel-exited-overlay">
            <button type="button" className="terminal-panel-exited-restart">
              {TERMINAL_EXIT_MESSAGE}
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
