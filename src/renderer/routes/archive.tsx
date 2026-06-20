import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

function ArchivePage() {
  return (
    <div className="page-card">
      <h1 className="page-title">Archive</h1>
      <p className="page-subtitle">Items you've archived.</p>

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
  )
}

export const archiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/archive',
  component: ArchivePage,
})
