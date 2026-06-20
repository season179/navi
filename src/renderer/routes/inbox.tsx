import { useState } from 'react'
import { createRoute } from '@tanstack/react-router'
import { ListTodo, ClipboardList, FileEdit, Globe, Files, PanelLeft } from 'lucide-react'
import { rootRoute } from './__root'

const TOPBAR_ICONS = [ListTodo, ClipboardList, FileEdit, Globe, Files]

const ITEMS = [
  { title: 'Welcome to Navi', desc: 'Get started with your new workspace', time: 'Just now' },
  { title: 'Note shared', desc: 'Meeting notes were shared with you', time: '2h ago' },
  { title: 'Update available', desc: 'A new version of Navi is ready', time: '1d ago' },
]

function InboxPage() {
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
            <div className="topbar-title">Inbox</div>
            <div className="topbar-subtitle">
              <span>Navi</span>
              <span className="dot">·</span>
              <span>notifications</span>
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
          <h1 className="page-title">Inbox</h1>
          <p className="page-subtitle">Notifications and messages.</p>
          <div className="card" style={{ marginBottom: 16 }}>
            {ITEMS.map((item, i) => (
              <div key={i} className={i > 0 ? 'card-row' : 'card-row'}>
                <div style={{ minWidth: 0 }}>
                  <div className="card-row-title">{item.title}</div>
                  <div className="card-row-desc">{item.desc}</div>
                </div>
                <span className="card-row-meta">{item.time}</span>
              </div>
            ))}
          </div>
          <div className="empty-state">
            <div className="empty-state-title">No more notifications</div>
            <div className="empty-state-desc">You're all caught up.</div>
          </div>
        </div>
      </div>
    </>
  )
}

export const inboxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inbox',
  component: InboxPage,
})
