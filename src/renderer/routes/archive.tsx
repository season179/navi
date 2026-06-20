import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

function ArchivePage() {
  return (
    <div className="page">
      <h2>Archive</h2>
      <p>Archived items will appear here.</p>
    </div>
  )
}

export const archiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/archive',
  component: ArchivePage,
})
