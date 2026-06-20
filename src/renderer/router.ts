import { createRouter, createHashHistory } from '@tanstack/react-router'
import { rootRoute } from './routes/__root'
import { homeRoute } from './routes/home'

const routeTree = rootRoute.addChildren([homeRoute])

export const router = createRouter({
  routeTree,
  history: createHashHistory(),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
