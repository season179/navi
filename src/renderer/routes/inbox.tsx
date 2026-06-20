import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

function InboxPage() {
  return (
    <div className="page-card">
      <h1 className="page-title">Inbox</h1>
      <p className="page-subtitle">Notifications and messages.</p>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { title: 'Welcome to Navi', desc: 'Get started with your new workspace', time: 'Just now' },
            { title: 'Note shared', desc: 'Meeting notes were shared with you', time: '2h ago' },
            { title: 'Update available', desc: 'A new version of Navi is ready', time: '1d ago' },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: '14px 0',
                borderBottom: i < 2 ? '1px solid var(--ds-border-muted)' : undefined,
                cursor: 'default',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 2,
                }}
              >
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ds-text)' }}>
                  {item.title}
                </span>
                <span style={{ fontSize: 11.5, color: 'var(--ds-text-faint)' }}>{item.time}</span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--ds-text-muted)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="empty-state">
        <div className="empty-state-title">No more notifications</div>
        <div className="empty-state-desc">You're all caught up.</div>
      </div>
    </div>
  )
}

export const inboxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inbox',
  component: InboxPage,
})
