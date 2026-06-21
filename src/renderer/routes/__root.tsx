import { useCallback, useState } from 'react'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Plus, Settings, PanelLeft, Sun, Moon } from 'lucide-react'
import { useTheme } from '../theme'
import { SidebarContext } from '../sidebar'
import { SettingsContext } from '../settings'
import { useNaviList } from '../flue/NaviChatContext'
import { SidebarProjects } from './SidebarProjects'

function RootLayout() {
  const { theme, toggleTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const toggle = useCallback(() => setCollapsed((v) => !v), [])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const openSettings = useCallback(() => setSettingsOpen(true), [])
  const closeSettings = useCallback(() => setSettingsOpen(false), [])
  const toggleSettings = useCallback(() => setSettingsOpen((v) => !v), [])
  const { newConversation } = useNaviList()

  // Starting a fresh conversation leaves the settings view (mirrors Kun, where
  // openCode() flips route back to chat) so you land in the new chat, not on
  // the providers page.
  const handleNew = () => {
    closeSettings()
    newConversation()
  }

  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      <SettingsContext.Provider
        value={{ settingsOpen, openSettings, closeSettings, toggleSettings }}
      >
      <div className="workbench" style={{ ['--sidebar-width' as string]: collapsed ? '0px' : '264px' }}>
        {!collapsed ? (
          <aside className="sidebar">
            <div className="sidebar-header">
              <button
                className="sidebar-titlebar-toggle"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <PanelLeft />
              </button>
            </div>

            <div className="sidebar-body">
              <button className="cmd-row is-accent" onClick={handleNew}>
                <Plus />
                <span className="cmd-label">New conversation</span>
              </button>

              <SidebarProjects />
            </div>

            <div className="sidebar-footer">
              <button className="cmd-row" onClick={toggleTheme} title="Toggle theme">
                {theme === 'dark' ? <Sun /> : <Moon />}
                <span className="cmd-label">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
              </button>
              <button
                className={settingsOpen ? 'cmd-row is-active' : 'cmd-row'}
                onClick={toggleSettings}
                title="Settings"
              >
                <Settings />
                <span className="cmd-label">Settings</span>
              </button>
            </div>
          </aside>
        ) : null}

        <main className="stage">
          <Outlet />
        </main>
      </div>
      </SettingsContext.Provider>
    </SidebarContext.Provider>
  )
}

export const rootRoute = createRootRoute({
  component: RootLayout,
})
