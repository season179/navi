import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

function HomePage() {
  return (
    <div className="page-card">
      <h1 className="page-title">Home</h1>
      <p className="page-subtitle">Welcome back. Here's what's new.</p>

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--ds-text-muted)', marginBottom: 8 }}>
          You have 3 unread notifications in your inbox.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary">View inbox</button>
          <button className="btn btn-secondary">Dismiss all</button>
        </div>
      </div>

      <div className="card-strong">
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Recent activity</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['Note "Ideas" was updated', 'New message in Inbox', 'Archive cleaned'].map((item) => (
            <div
              key={item}
              style={{
                fontSize: 13,
                color: 'var(--ds-text-muted)',
                padding: '8px 0',
                borderBottom: '1px solid var(--ds-border-muted)',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})
