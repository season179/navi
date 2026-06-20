import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

function InboxPage() {
  return (
    <div className="page">
      <h2>Inbox</h2>
      <p>Notifications and messages will appear here.</p>
    </div>
  )
}

export const inboxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inbox',
  component: InboxPage,
})
