import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export type SidebarRoute = 'chat' | 'schedule' | 'plugins'

export interface SidebarRouteContextValue {
  route: SidebarRoute
  pluginsActive: boolean
  scheduleActive: boolean
  openChatRoute: () => void
  openScheduleRoute: () => void
  openPluginsRoute: () => void
}

export const SidebarRouteContext = createContext<SidebarRouteContextValue>({
  route: 'chat',
  pluginsActive: false,
  scheduleActive: false,
  openChatRoute: () => {},
  openScheduleRoute: () => {},
  openPluginsRoute: () => {},
})

export function SidebarRouteProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<SidebarRoute>('chat')

  const openChatRoute = useCallback(() => setRoute('chat'), [])
  const openScheduleRoute = useCallback(() => setRoute('schedule'), [])
  const openPluginsRoute = useCallback(() => setRoute('plugins'), [])

  return (
    <SidebarRouteContext.Provider
      value={{
        route,
        pluginsActive: route === 'plugins',
        scheduleActive: route === 'schedule',
        openChatRoute,
        openScheduleRoute,
        openPluginsRoute,
      }}
    >
      {children}
    </SidebarRouteContext.Provider>
  )
}

export function useSidebarRoute() {
  return useContext(SidebarRouteContext)
}
