import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

function NotesPage() {
  return (
    <div className="page">
      <h2>Notes</h2>
      <p>Your notes will be listed here.</p>
    </div>
  )
}

export const notesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notes',
  component: NotesPage,
})
