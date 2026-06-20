import { createRootRoute, Outlet, Link } from '@tanstack/react-router'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/inbox', label: 'Inbox' },
  { to: '/notes', label: 'Notes' },
  { to: '/archive', label: 'Archive' },
]

function RootLayout() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="brand">Navi</h1>
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: 'nav-link active' }}
              inactiveProps={{ className: 'nav-link' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="user-chip">Season / Local only</span>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

export const rootRoute = createRootRoute({
  component: RootLayout,
})
