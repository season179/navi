import { createRouter, createHashHistory } from '@tanstack/react-router'
import { rootRoute } from './routes/__root'
import { homeRoute } from './routes/home'
import { inboxRoute } from './routes/inbox'
import { notesRoute } from './routes/notes'
import { archiveRoute } from './routes/archive'

const routeTree = rootRoute.addChildren([
  homeRoute,
  inboxRoute,
  notesRoute,
  archiveRoute,
])

const hashHistory = createHashHistory()

export const router = createRouter({ routeTree, history: hashHistory })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
