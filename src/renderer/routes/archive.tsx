import { useState } from 'react'
import { createRoute } from '@tanstack/react-router'
import { ListTodo, ClipboardList, FileEdit, Globe, Files, PanelLeft } from 'lucide-react'
import { rootRoute } from './__root'

const TOPBAR_ICONS = [ListTodo, ClipboardList, FileEdit, Globe, Files]

function ArchivePage() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <header className="topbar">
        <div className="topbar-session">
          {collapsed ? (
            <button
              className="sidebar-titlebar-toggle"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <PanelLeft />
            </button>
          ) : null}
          <div style={{ minWidth: 0 }}>
            <div className="topbar-title">Archive</div>
            <div className="topbar-subtitle">
              <span>Navi</span>
              <span className="dot">·</span>
              <span>archived</span>
            </div>
          </div>
        </div>
        <div className="topbar-actions">
          {TOPBAR_ICONS.map((Icon, i) => (
            <button key={i} className="icon-pill" aria-label="action">
              <Icon />
            </button>
          ))}
        </div>
      </header>
      <div className="page">
        <div className="page-inner">
          <h1 className="page-title">Archive</h1>
          <p className="page-subtitle">Items you've archived.</p>
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-title">Archive is empty</div>
              <div className="empty-state-desc">
                Archive notes and messages to keep your workspace tidy.
              </div>
              <button className="btn btn-secondary" disabled>
                Restore all
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export const archiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/archive',
  component: ArchivePage,
})
