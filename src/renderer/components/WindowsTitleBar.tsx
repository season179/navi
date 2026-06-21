// Kun WindowsTitleBar.tsx visual port — custom title bar for Windows/Linux.
// Visual only: mock menu actions and preview URL hooks.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react'

export type WindowsTitleBarPreviewMode = 'default' | 'menuOpen' | 'maximized' | 'linux'

type MenuAction = () => void | Promise<void>

export type WindowsTitleBarMenuItem =
  | {
      kind?: 'item'
      id: string
      label: string
      shortcut?: string
      onSelect: MenuAction
    }
  | {
      kind: 'separator'
      id: string
    }

export type WindowsTitleBarMenuSection = {
  id: string
  label: string
  items: WindowsTitleBarMenuItem[]
}

export type WindowsTitleBarActions = {
  createThread: MenuAction
  chooseWorkspace: MenuAction
  openSettings: MenuAction
  runDesktopCommand: (command: string) => void | Promise<void>
  openLogDir: MenuAction
  showAbout: MenuAction
}

const COPY = {
  windowsMenuAriaLabel: 'Application menu',
  windowsMenuFile: 'File',
  windowsMenuEdit: 'Edit',
  windowsMenuView: 'View',
  windowsMenuWindow: 'Window',
  windowsMenuHelp: 'Help',
  windowsMenuNewChat: 'New chat',
  windowsMenuChooseWorkspace: 'Choose workspace…',
  windowsMenuSettings: 'Settings',
  windowsMenuQuit: 'Quit',
  windowsMenuUndo: 'Undo',
  windowsMenuRedo: 'Redo',
  windowsMenuCut: 'Cut',
  windowsMenuCopy: 'Copy',
  windowsMenuPaste: 'Paste',
  windowsMenuSelectAll: 'Select all',
  windowsMenuReload: 'Reload',
  windowsMenuZoomIn: 'Zoom in',
  windowsMenuZoomOut: 'Zoom out',
  windowsMenuResetZoom: 'Reset zoom',
  windowsMenuDevTools: 'Developer tools',
  windowsMenuMinimize: 'Minimize',
  windowsMenuToggleMaximize: 'Maximize',
  windowsMenuClose: 'Close',
  windowsMenuAbout: 'About Navi',
  windowsMenuOpenLogDir: 'Open log folder',
  windowsMenuAboutMessage: 'Navi {{version}}',
  windowsMenuUnknownVersion: 'dev',
}

const DEFAULT_SHORTCUTS: Record<string, string> = {
  'new-chat': 'Ctrl+N',
  'choose-workspace': 'Ctrl+O',
  settings: 'Ctrl+,',
  quit: 'Alt+F4',
  undo: 'Ctrl+Z',
  redo: 'Ctrl+Y',
  cut: 'Ctrl+X',
  copy: 'Ctrl+C',
  paste: 'Ctrl+V',
  'select-all': 'Ctrl+A',
  reload: 'Ctrl+R',
  'zoom-in': 'Ctrl++',
  'zoom-out': 'Ctrl+-',
  'reset-zoom': 'Ctrl+0',
  'toggle-devtools': 'Ctrl+Shift+I',
  close: 'Ctrl+W',
}

export function supportsDesktopTitleBar(platform: string): boolean {
  return platform === 'win32' || platform === 'linux'
}

export function buildWindowsTitleBarMenuSections(
  actions: WindowsTitleBarActions,
  shortcuts: Record<string, string> = DEFAULT_SHORTCUTS,
): WindowsTitleBarMenuSection[] {
  const command = (desktopCommand: string): MenuAction =>
    () => actions.runDesktopCommand(desktopCommand)
  const shortcut = (commandId: string): string | undefined => shortcuts[commandId]

  return [
    {
      id: 'file',
      label: COPY.windowsMenuFile,
      items: [
        {
          id: 'new-chat',
          label: COPY.windowsMenuNewChat,
          shortcut: shortcut('new-chat'),
          onSelect: actions.createThread,
        },
        {
          id: 'choose-workspace',
          label: COPY.windowsMenuChooseWorkspace,
          shortcut: shortcut('choose-workspace'),
          onSelect: actions.chooseWorkspace,
        },
        { kind: 'separator', id: 'file-1' },
        {
          id: 'settings',
          label: COPY.windowsMenuSettings,
          shortcut: shortcut('settings'),
          onSelect: actions.openSettings,
        },
        { kind: 'separator', id: 'file-2' },
        {
          id: 'quit',
          label: COPY.windowsMenuQuit,
          shortcut: shortcut('quit'),
          onSelect: command('quit'),
        },
      ],
    },
    {
      id: 'edit',
      label: COPY.windowsMenuEdit,
      items: [
        {
          id: 'undo',
          label: COPY.windowsMenuUndo,
          shortcut: shortcut('undo'),
          onSelect: command('undo'),
        },
        {
          id: 'redo',
          label: COPY.windowsMenuRedo,
          shortcut: shortcut('redo'),
          onSelect: command('redo'),
        },
        { kind: 'separator', id: 'edit-1' },
        {
          id: 'cut',
          label: COPY.windowsMenuCut,
          shortcut: shortcut('cut'),
          onSelect: command('cut'),
        },
        {
          id: 'copy',
          label: COPY.windowsMenuCopy,
          shortcut: shortcut('copy'),
          onSelect: command('copy'),
        },
        {
          id: 'paste',
          label: COPY.windowsMenuPaste,
          shortcut: shortcut('paste'),
          onSelect: command('paste'),
        },
        { kind: 'separator', id: 'edit-2' },
        {
          id: 'select-all',
          label: COPY.windowsMenuSelectAll,
          shortcut: shortcut('select-all'),
          onSelect: command('selectAll'),
        },
      ],
    },
    {
      id: 'view',
      label: COPY.windowsMenuView,
      items: [
        {
          id: 'reload',
          label: COPY.windowsMenuReload,
          shortcut: shortcut('reload'),
          onSelect: command('reload'),
        },
        { kind: 'separator', id: 'view-1' },
        {
          id: 'zoom-in',
          label: COPY.windowsMenuZoomIn,
          shortcut: shortcut('zoom-in'),
          onSelect: command('zoomIn'),
        },
        {
          id: 'zoom-out',
          label: COPY.windowsMenuZoomOut,
          shortcut: shortcut('zoom-out'),
          onSelect: command('zoomOut'),
        },
        {
          id: 'reset-zoom',
          label: COPY.windowsMenuResetZoom,
          shortcut: shortcut('reset-zoom'),
          onSelect: command('resetZoom'),
        },
        { kind: 'separator', id: 'view-2' },
        {
          id: 'devtools',
          label: COPY.windowsMenuDevTools,
          shortcut: shortcut('toggle-devtools'),
          onSelect: command('toggleDevTools'),
        },
      ],
    },
    {
      id: 'window',
      label: COPY.windowsMenuWindow,
      items: [
        {
          id: 'minimize',
          label: COPY.windowsMenuMinimize,
          onSelect: command('minimize'),
        },
        {
          id: 'maximize',
          label: COPY.windowsMenuToggleMaximize,
          onSelect: command('toggleMaximize'),
        },
        {
          id: 'close',
          label: COPY.windowsMenuClose,
          shortcut: shortcut('close'),
          onSelect: command('close'),
        },
      ],
    },
    {
      id: 'help',
      label: COPY.windowsMenuHelp,
      items: [
        { id: 'about', label: COPY.windowsMenuAbout, onSelect: actions.showAbout },
        { id: 'open-log-dir', label: COPY.windowsMenuOpenLogDir, onSelect: actions.openLogDir },
      ],
    },
  ]
}

function MinimizeIcon(): ReactElement {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M1 5h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function MaximizeIcon(): ReactElement {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function RestoreIcon(): ReactElement {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M3.5 2.5V1.8a.8.8 0 0 1 .8-.8h4.4a.8.8 0 0 1 .8.8v4.4a.8.8 0 0 1-.8.8H8"
        stroke="currentColor"
        strokeWidth="1.1"
      />
    </svg>
  )
}

function CloseIcon(): ReactElement {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path
        d="M1.5 1.5l7 7M8.5 1.5l-7 7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function NaviTitleBarIcon(): ReactElement {
  return (
    <svg
      className="ds-windows-titlebar-icon"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="16" height="16" rx="4" fill="rgba(59,130,216,0.14)" />
      <path
        d="M9 4.5v9M9 9l3.5-2.5M9 9L5.5 6.5"
        stroke="#2563eb"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type WindowsTitleBarProps = {
  platform?: string
  actions?: Partial<WindowsTitleBarActions>
  initialMenuId?: string | null
  forceMaximized?: boolean
}

export function WindowsTitleBar({
  platform = 'win32',
  actions,
  initialMenuId = null,
  forceMaximized,
}: WindowsTitleBarProps): ReactElement | null {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(initialMenuId)
  const [isMaximized, setIsMaximized] = useState(forceMaximized ?? false)
  const rootRef = useRef<HTMLDivElement>(null)

  const defaultActions = useMemo<WindowsTitleBarActions>(
    () => ({
      createThread: () => undefined,
      chooseWorkspace: () => undefined,
      openSettings: () => undefined,
      runDesktopCommand: () => undefined,
      openLogDir: () => undefined,
      showAbout: () => undefined,
    }),
    [],
  )

  const resolvedActions = useMemo<WindowsTitleBarActions>(
    () => ({
      ...defaultActions,
      ...actions,
    }),
    [actions, defaultActions],
  )

  const menus = useMemo(
    () => buildWindowsTitleBarMenuSections(resolvedActions),
    [resolvedActions],
  )

  useEffect(() => {
    setActiveMenuId(initialMenuId)
  }, [initialMenuId])

  useEffect(() => {
    if (forceMaximized !== undefined) {
      setIsMaximized(forceMaximized)
      return
    }
    const checkMaximized = (): void => {
      const isMax =
        window.outerWidth >= window.screen.availWidth &&
        window.outerHeight >= window.screen.availHeight
      setIsMaximized(isMax)
    }
    checkMaximized()
    window.addEventListener('resize', checkMaximized)
    return () => window.removeEventListener('resize', checkMaximized)
  }, [forceMaximized])

  useEffect(() => {
    if (!activeMenuId) return
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target
      if (target instanceof Node && rootRef.current?.contains(target)) return
      setActiveMenuId(null)
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setActiveMenuId(null)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activeMenuId])

  const handleMinimize = useCallback((): void => {
    void resolvedActions.runDesktopCommand('minimize')
  }, [resolvedActions])

  const handleToggleMaximize = useCallback((): void => {
    void resolvedActions.runDesktopCommand('toggleMaximize')
    if (forceMaximized === undefined) {
      setIsMaximized((value) => !value)
    }
  }, [forceMaximized, resolvedActions])

  const handleClose = useCallback((): void => {
    void resolvedActions.runDesktopCommand('close')
  }, [resolvedActions])

  if (!supportsDesktopTitleBar(platform)) return null

  const runMenuAction = (item: Exclude<WindowsTitleBarMenuItem, { kind: 'separator' }>): void => {
    setActiveMenuId(null)
    void item.onSelect()
  }

  return (
    <div ref={rootRef} className="ds-windows-titlebar ds-drag">
      <div className="ds-windows-titlebar-content">
        <NaviTitleBarIcon />
        <nav className="ds-windows-menu ds-no-drag" aria-label={COPY.windowsMenuAriaLabel}>
          {menus.map((menu) => {
            const open = activeMenuId === menu.id
            return (
              <div key={menu.id} className="ds-windows-menu-slot">
                <button
                  type="button"
                  data-cursor-spotlight-target
                  className={`ds-windows-menu-button ${open ? 'is-open' : ''}`}
                  aria-haspopup="menu"
                  aria-expanded={open}
                  onClick={() => setActiveMenuId(open ? null : menu.id)}
                  onMouseEnter={() => {
                    if (activeMenuId) setActiveMenuId(menu.id)
                  }}
                >
                  {menu.label}
                </button>
                {open ? (
                  <div className="ds-windows-menu-popover" role="menu" aria-label={menu.label}>
                    {menu.items.map((item) => {
                      if (item.kind === 'separator') {
                        return (
                          <div
                            key={item.id}
                            className="ds-windows-menu-separator"
                            role="separator"
                          />
                        )
                      }
                      return (
                        <button
                          key={item.id}
                          type="button"
                          data-cursor-spotlight-target
                          role="menuitem"
                          className="ds-windows-menu-item"
                          onClick={() => runMenuAction(item)}
                        >
                          <span className="truncate">{item.label}</span>
                          {item.shortcut ? (
                            <span className="ds-windows-menu-shortcut">{item.shortcut}</span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )
          })}
        </nav>
      </div>
      <div className="ds-window-controls ds-no-drag">
        <button
          type="button"
          className="ds-window-control-btn"
          aria-label={COPY.windowsMenuMinimize}
          onClick={handleMinimize}
        >
          <MinimizeIcon />
        </button>
        <button
          type="button"
          className="ds-window-control-btn"
          aria-label={COPY.windowsMenuToggleMaximize}
          onClick={handleToggleMaximize}
        >
          {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
        </button>
        <button
          type="button"
          className="ds-window-control-btn ds-window-control-btn--close"
          aria-label={COPY.windowsMenuClose}
          onClick={handleClose}
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  )
}

function previewPlatform(mode: WindowsTitleBarPreviewMode): string {
  return mode === 'linux' ? 'linux' : 'win32'
}

/** Full-frame preview shell for ?windowsTitleBarPreview URL hooks. */
export function WindowsTitleBarPreview({
  mode,
}: {
  mode: WindowsTitleBarPreviewMode
}): ReactElement {
  return (
    <div className="windows-titlebar-preview-wrap">
      <WindowsTitleBar
        platform={previewPlatform(mode)}
        initialMenuId={mode === 'menuOpen' ? 'file' : null}
        forceMaximized={mode === 'maximized'}
      />
      <div className="windows-titlebar-preview-body">
        <p className="windows-titlebar-preview-copy">
          Custom title bar for Windows and Linux — menu bar, drag region, and window controls.
        </p>
      </div>
    </div>
  )
}
