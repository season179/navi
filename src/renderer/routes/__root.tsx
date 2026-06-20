import { useCallback, useState } from 'react'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Plus, Settings, PanelLeft, Sun, Moon, MessageSquare, Trash2 } from 'lucide-react'
import { useTheme } from '../theme'
import { SidebarContext } from '../sidebar'
import { useNaviList } from '../flue/NaviChatContext'

function RootLayout() {
  const { theme, toggleTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const toggle = useCallback(() => setCollapsed((v) => !v), [])
  const { conversations, currentId, newConversation, selectConversation, deleteConversation } =
    useNaviList()

  const handleNew = () => newConversation()
  const handleSelect = (id: string) => void selectConversation(id)

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

              <div className="sidebar-section-header">
                <span>Conversations</span>
              </div>

              {conversations.length === 0 ? (
                <div className="sidebar-empty">No conversations yet</div>
              ) : (
                conversations.map((c) => (
                  <div key={c.id} className="conv-item">
                    <button
                      className={c.id === currentId ? 'cmd-row conv-open is-active' : 'cmd-row conv-open'}
                      onClick={() => handleSelect(c.id)}
                      title={c.title}
                    >
                      <MessageSquare />
                      <span className="cmd-label">{c.title}</span>
                    </button>
                    <button
                      className="conv-delete"
                      onClick={() => void deleteConversation(c.id)}
                      aria-label="Delete conversation"
                      title="Delete conversation"
                    >
                      <Trash2 />
                    </button>
                  </div>
                ))
              )}
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
