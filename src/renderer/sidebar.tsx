import { createContext, useContext } from 'react'

export interface SidebarContextValue {
  /** True when the sidebar is collapsed (hidden from the workbench grid). */
  collapsed: boolean
  /** Flip the collapsed state. */
  toggle: () => void
}

// Single source of truth for sidebar visibility. The root layout owns the
// state and provides it here; both the sidebar's own collapse button and the
// per-page "expand" affordance (the topbar toggle) drive the same value via
// `toggle`, so collapsing is always reversible. (Previously each route held
// its own dead `collapsed` state, disconnected from the root's, which made a
// collapsed sidebar unrecoverable.)
export const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggle: () => {},
})

export function useSidebar() {
  return useContext(SidebarContext)
}
