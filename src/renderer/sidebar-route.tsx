import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export type SidebarRoute = 'chat' | 'schedule' | 'plugins' | 'claw'

export interface SidebarRouteContextValue {
  route: SidebarRoute
  pluginsActive: boolean
  scheduleActive: boolean
  clawActive: boolean
  openChatRoute: () => void
  openScheduleRoute: () => void
  openPluginsRoute: () => void
  openClawRoute: () => void
}

export const SidebarRouteContext = createContext<SidebarRouteContextValue>({
  route: 'chat',
  pluginsActive: false,
  scheduleActive: false,
  clawActive: false,
  openChatRoute: () => {},
  openScheduleRoute: () => {},
  openPluginsRoute: () => {},
  openClawRoute: () => {},
})

function resolveClawRoutePreview(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).has('clawRoute')
}

export function SidebarRouteProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<SidebarRoute>(() =>
    resolveClawRoutePreview() ? 'claw' : 'chat',
  )

  const openChatRoute = useCallback(() => setRoute('chat'), [])
  const openScheduleRoute = useCallback(() => setRoute('schedule'), [])
  const openPluginsRoute = useCallback(() => setRoute('plugins'), [])
  const openClawRoute = useCallback(() => setRoute('claw'), [])

  return (
    <SidebarRouteContext.Provider
      value={{
        route,
        pluginsActive: route === 'plugins',
        scheduleActive: route === 'schedule',
        clawActive: route === 'claw',
        openChatRoute,
        openScheduleRoute,
        openPluginsRoute,
        openClawRoute,
      }}
    >
      {children}
    </SidebarRouteContext.Provider>
  )
}

export function useSidebarRoute() {
  return useContext(SidebarRouteContext)
}
