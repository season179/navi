import { useCallback, useState } from 'react'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Plus, Settings, PanelLeft, Sun, Moon } from 'lucide-react'
import { useTheme } from '../theme'
import { SidebarContext } from '../sidebar'
import { useNaviList } from '../flue/NaviChatContext'
import { SidebarProjects } from './SidebarProjects'

function RootLayout() {
  const { theme, toggleTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const toggle = useCallback(() => setCollapsed((v) => !v), [])
  const { newConversation } = useNaviList()

  const handleNew = () => newConversation()

  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
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
              <button className="cmd-row" title="Settings">
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
    </SidebarContext.Provider>
  )
}

export const rootRoute = createRootRoute({
  component: RootLayout,
})
