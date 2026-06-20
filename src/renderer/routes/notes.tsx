import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

function NotesPage() {
  return (
    <div className="page-card">
      <h1 className="page-title">Notes</h1>
      <p className="page-subtitle">Your personal notes.</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button className="btn btn-primary">New note</button>
        <button className="btn btn-secondary">Sort by date</button>
      </div>

      {[
        { title: 'Project ideas', preview: 'A few thoughts on what to build next...', date: 'Yesterday' },
        { title: 'Meeting notes', preview: 'Discussed Q3 roadmap and team priorities.', date: '3d ago' },
        { title: 'Reading list', preview: 'Articles and papers I want to go through.', date: '1w ago' },
      ].map((note, i) => (
        <div
          key={i}
          className="card"
          style={{
            marginBottom: 10,
            cursor: 'default',
            transition: 'box-shadow 0.14s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 4,
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ds-text)' }}>
              {note.title}
            </h3>
            <span style={{ fontSize: 11.5, color: 'var(--ds-text-faint)', flexShrink: 0 }}>
              {note.date}
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--ds-text-muted)', lineHeight: 1.5 }}>
            {note.preview}
          </p>
        </div>
      ))}
    </div>
  )
}

export const notesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notes',
  component: NotesPage,
})
