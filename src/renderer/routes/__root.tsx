import { useState } from 'react'
import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import {
  Plus,
  FileQuestion,
  LayoutGrid,
  Clock3,
  Focus,
  Settings,
  PanelLeft,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from '../theme'
import { SidebarMascot } from '../components/Mascot'

type NavItem = {
  to: string
  label: string
  icon: typeof Plus
}

const PRIMARY_COMMANDS: NavItem[] = [
  { to: '/', label: 'New chat', icon: Plus },
  { to: '/notes', label: 'New note', icon: FileQuestion },
]

const SECONDARY_COMMANDS: NavItem[] = [
  { to: '/inbox', label: 'Inbox', icon: LayoutGrid },
  { to: '/archive', label: 'Schedule', icon: Clock3 },
]

function useActivePath(): (to: string) => boolean {
  const hash = typeof window !== 'undefined' ? window.location.hash : ''
  return (to: string) => {
    if (to === '/') return hash === '' || hash === '#/'
    return hash === `#${to}` || hash.startsWith(`#${to}`)
  }
}

function RootLayout() {
  const { theme, toggleTheme } = useTheme()
  const isActive = useActivePath()
  const [focusMode, setFocusMode] = useState(false)

  return (
    <div className="workbench" style={{ ['--sidebar-width' as string]: focusMode ? '0px' : '264px' }}>
      {!focusMode ? (
        <aside className="sidebar">
          <div className="sidebar-header">
            <button
              className="sidebar-titlebar-toggle"
              onClick={() => setFocusMode(true)}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelLeft />
            </button>
          </div>

          <div className="sidebar-body">
            {PRIMARY_COMMANDS.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.to} to={item.to} className="cmd-row is-accent">
                  <Icon />
                  <span className="cmd-label">{item.label}</span>
                </Link>
              )
            })}

            <div className="sidebar-section-header">
              <span>Workspace</span>
            </div>

            {SECONDARY_COMMANDS.map((item) => {
              const Icon = item.icon
              const active = isActive(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={active ? 'cmd-row is-active' : 'cmd-row'}
                >
                  <Icon />
                  <span className="cmd-label">{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="sidebar-footer">
            <div className="sidebar-footer-top">
              <span className="sidebar-mascot">
                <SidebarMascot />
              </span>
              <button
                className={focusMode ? 'focus-toggle is-on' : 'focus-toggle'}
                onClick={() => setFocusMode((v) => !v)}
                aria-pressed={focusMode}
                title="Focus mode"
              >
                <Focus />
                <span>Focus</span>
                <span className="focus-knob" />
              </button>
            </div>
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
  )
}

export const rootRoute = createRootRoute({
  component: RootLayout,
})
