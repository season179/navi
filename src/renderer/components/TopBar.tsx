// Floating topbar pill that sits at the top of the stage. Echoes Kun's
// chat-workbench topbar: session title on the left, a cluster of round
// icon buttons on the right. Visual only.

import {
  PanelLeft,
  ListTodo,
  ClipboardList,
  FileEdit,
  Globe,
  Terminal,
  Files,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from '../theme'

type TopBarProps = {
  title: string
  subtitle?: string
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

export function TopBar({ title, subtitle, sidebarCollapsed, onToggleSidebar }: TopBarProps) {
  const { theme, toggleTheme } = useTheme()
  return (
    <header className="topbar">
      <div className="topbar-session">
        {sidebarCollapsed ? (
          <button
            className="sidebar-titlebar-toggle"
            onClick={onToggleSidebar}
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <PanelLeft />
          </button>
        ) : null}
        <div style={{ minWidth: 0 }}>
          <div className="topbar-title">{title}</div>
          {subtitle ? (
            <div className="topbar-subtitle">
              <span>Navi</span>
              <span className="dot">·</span>
              <span>{subtitle}</span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="topbar-actions">
        <button className="icon-pill" title="Todos" aria-label="Todos">
          <ListTodo />
        </button>
        <button className="icon-pill" title="Plan" aria-label="Plan">
          <ClipboardList />
        </button>
        <button className="icon-pill" title="Changes" aria-label="Changes">
          <FileEdit />
        </button>
        <button className="icon-pill" title="Terminal" aria-label="Terminal">
          <Terminal />
        </button>
        <button className="icon-pill" title="Browser" aria-label="Browser">
          <Globe />
        </button>
        <button className="icon-pill" title="Files" aria-label="Files">
          <Files />
        </button>
        <button
          className="icon-pill"
          onClick={toggleTheme}
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </button>
      </div>
    </header>
  )
}
