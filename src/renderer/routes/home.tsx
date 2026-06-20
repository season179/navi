import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

function HomePage() {
  return (
    <div className="page">
      <h2>Home</h2>
      <p>Welcome to Navi.</p>
    </div>
  )
}

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})
