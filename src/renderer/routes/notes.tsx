import { useState } from 'react'
import { createRoute } from '@tanstack/react-router'
import { ListTodo, ClipboardList, FileEdit, Globe, Files, PanelLeft, Plus } from 'lucide-react'
import { rootRoute } from './__root'

const TOPBAR_ICONS = [ListTodo, ClipboardList, FileEdit, Globe, Files]

const NOTES = [
  { title: 'Project ideas', preview: 'A few thoughts on what to build next...', date: 'Yesterday' },
  { title: 'Meeting notes', preview: 'Discussed Q3 roadmap and team priorities.', date: '3d ago' },
  { title: 'Reading list', preview: 'Articles and papers I want to go through.', date: '1w ago' },
]

function NotesPage() {
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
            <div className="topbar-title">Notes</div>
            <div className="topbar-subtitle">
              <span>Navi</span>
              <span className="dot">·</span>
              <span>your drafts</span>
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
          <h1 className="page-title">Notes</h1>
          <p className="page-subtitle">Your personal notes.</p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button className="btn btn-primary">
              <Plus />
              New note
            </button>
            <button className="btn btn-secondary">Sort by date</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {NOTES.map((note) => (
              <div key={note.title} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                  <h3 className="card-row-title">{note.title}</h3>
                  <span className="card-row-meta">{note.date}</span>
                </div>
                <p className="card-row-desc">{note.preview}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export const notesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notes',
  component: NotesPage,
})
