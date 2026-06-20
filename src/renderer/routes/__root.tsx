import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { useTheme } from '../theme'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/inbox', label: 'Inbox' },
  { to: '/notes', label: 'Notes' },
  { to: '/archive', label: 'Archive' },
]

const sun = '\u2600'
const moon = '\u263E'

function RootLayout() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="brand">Navi</h1>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: 'nav-item active' }}
              inactiveProps={{ className: 'nav-item' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="user-chip">Season / Local only</span>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? sun : moon}
          </button>
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
