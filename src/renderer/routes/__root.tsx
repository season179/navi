import { useCallback, useMemo, useState } from 'react'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Plus, Settings, Sun, Moon } from 'lucide-react'
import { useTheme } from '../theme'
import { SidebarContext } from '../sidebar'
import { SettingsContext } from '../settings'
import { useNaviList, useNaviThread } from '../flue/NaviChatContext'
import {
  RuntimeStatusBanner,
  RUNTIME_STATUS_BANNER_PREVIEW,
  type RuntimeStatusBannerPreviewMode,
  type RuntimeStatusSnapshot,
} from '../components/RuntimeStatusBanner'
import { SidebarProjects } from './SidebarProjects'
import {
  WorkspaceModeTabs,
  type WorkspaceModeView,
} from '../components/WorkspaceModeTabs'
import { SidebarCommandRow, SidebarFrame } from '../components/SidebarPrimitives'
import {
  WindowsTitleBar,
  supportsDesktopTitleBar,
} from '../components/WindowsTitleBar'

function resolveProductionPlatform(): string {
  if (typeof window === 'undefined') return 'darwin'
  return window.navigator.platform.toLowerCase()
}

function RootLayout() {
  const { theme, toggleTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const toggle = useCallback(() => setCollapsed((v) => !v), [])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const openSettings = useCallback(() => setSettingsOpen(true), [])
  const closeSettings = useCallback(() => setSettingsOpen(false), [])
  const toggleSettings = useCallback(() => setSettingsOpen((v) => !v), [])
  const { newConversation } = useNaviList()
  const { status } = useNaviThread()

  const handleNew = useCallback(() => {
    closeSettings()
    newConversation()
  }, [closeSettings, newConversation])

  const workspaceModeTabsPreviewMode = useMemo((): WorkspaceModeView | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('workspaceModeTabsPreview')) return null
    return params.get('workspaceModeTabsPreview') === 'write' ? 'write' : 'chat'
  }, [])
  const [workspaceModeTabsPreviewView, setWorkspaceModeTabsPreviewView] =
    useState<WorkspaceModeView>(() => workspaceModeTabsPreviewMode ?? 'chat')
  const [productionWorkspaceMode, setProductionWorkspaceMode] =
    useState<WorkspaceModeView>('chat')

  const platform = useMemo(() => resolveProductionPlatform(), [])
  const hasDesktopTitleBar = supportsDesktopTitleBar(platform)
  const appShellFrameClass = hasDesktopTitleBar
    ? 'app-shell-frame app-shell-frame--desktop'
    : 'app-shell-frame'

  const titleBarActions = useMemo(
    () => ({
      createThread: handleNew,
      openSettings: toggleSettings,
    }),
    [handleNew, toggleSettings],
  )

  const runtimeStatusBannerPreviewMode = useMemo((): RuntimeStatusBannerPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('runtimeStatusBanner')) return null
    const mode = params.get('runtimeStatusBanner')
    if (mode === 'restartingAttempt') return 'restartingAttempt'
    if (mode === 'crashed') return 'crashed'
    if (mode === 'rolledBack') return 'rolledBack'
    return 'restarting'
  }, [])

  const productionRuntimeStatus = useMemo((): RuntimeStatusSnapshot | null => {
    if (runtimeStatusBannerPreviewMode) {
      return RUNTIME_STATUS_BANNER_PREVIEW[runtimeStatusBannerPreviewMode]
    }
    if (!status.ready && !status.error) {
      return {
        state: 'restarting',
        at: 'flue-connecting',
      }
    }
    return null
  }, [runtimeStatusBannerPreviewMode, status.error, status.ready])

  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      <SettingsContext.Provider
        value={{ settingsOpen, openSettings, closeSettings, toggleSettings }}
      >
        <div className={appShellFrameClass}>
          {hasDesktopTitleBar ? (
            <WindowsTitleBar platform={platform} actions={titleBarActions} />
          ) : null}
          <div className="app-shell-body">
            {productionRuntimeStatus ? (
              <RuntimeStatusBanner status={productionRuntimeStatus} />
            ) : null}
            <div
              className="workbench production-workbench"
              style={{ ['--sidebar-width' as string]: collapsed ? '0px' : '264px' }}
            >
          {!collapsed ? (
            <div className="production-sidebar-host">
              <SidebarFrame
                title="Collapse sidebar"
                onCollapse={() => setCollapsed(true)}
                footer={
                  <>
                    <SidebarCommandRow
                      icon={
                        theme === 'dark' ? (
                          <Sun className="h-4 w-4" strokeWidth={1.75} />
                        ) : (
                          <Moon className="h-4 w-4" strokeWidth={1.75} />
                        )
                      }
                      label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                      onClick={toggleTheme}
                      variant="footer"
                    />
                    <SidebarCommandRow
                      icon={<Settings className="h-4 w-4" strokeWidth={1.75} />}
                      label="Settings"
                      onClick={toggleSettings}
                      active={settingsOpen}
                      variant="footer"
                    />
                  </>
                }
              >
                <div className="ds-no-drag flex flex-col px-1">
                  <WorkspaceModeTabs
                    activeView={
                      workspaceModeTabsPreviewMode !== null
                        ? workspaceModeTabsPreviewView
                        : productionWorkspaceMode
                    }
                    onCodeOpen={() => {
                      if (workspaceModeTabsPreviewMode) {
                        setWorkspaceModeTabsPreviewView('chat')
                        return
                      }
                      setProductionWorkspaceMode('chat')
                    }}
                    onWriteOpen={() => {
                      if (workspaceModeTabsPreviewMode) {
                        setWorkspaceModeTabsPreviewView('write')
                        return
                      }
                      setProductionWorkspaceMode('write')
                    }}
                  />
                </div>

                <div className="ds-no-drag flex flex-col px-1">
                  <SidebarCommandRow
                    icon={<Plus className="h-4 w-4" strokeWidth={2} />}
                    label="New conversation"
                    onClick={handleNew}
                    variant="accent"
                  />
                </div>

                <SidebarProjects />
              </SidebarFrame>
            </div>
          ) : null}

          <main className="stage ds-stage-surface ds-chat-stage workbench-chat-stage">
            <Outlet />
          </main>
            </div>
          </div>
        </div>
      </SettingsContext.Provider>
    </SidebarContext.Provider>
  )
}

export const rootRoute = createRootRoute({
  component: RootLayout,
})
