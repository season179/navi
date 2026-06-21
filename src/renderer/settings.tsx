import { createContext, useContext } from 'react'

export interface SettingsContextValue {
  /** True when the settings (providers) view replaces the chat stage. */
  settingsOpen: boolean
  /** Show the settings view. */
  openSettings: () => void
  /** Return to the chat view. */
  closeSettings: () => void
  /** Flip the settings open state. */
  toggleSettings: () => void
}

// Single source of truth for whether the settings view is showing. The root
// layout owns the state and provides it here; both the sidebar footer's
// Settings button (which lives in the root layout, outside the route) and the
// per-page affordances inside HomePage (the topbar gear, the model picker's
// "configure providers", the "connect a provider" hero button) drive the same
// value. (Previously the flag was `useState` local to HomePage, so the sidebar
// button had no way to reach it and was dead.) Mirrors Kun's `route ===
// 'settings'` view-state flag — navi has only two top-level views, so a boolean
// stands in for Kun's AppRoute, and closing always returns to chat (no need for
// Kun's settingsReturnRoute).
export const SettingsContext = createContext<SettingsContextValue>({
  settingsOpen: false,
  openSettings: () => {},
  closeSettings: () => {},
  toggleSettings: () => {},
})

export function useSettings() {
  return useContext(SettingsContext)
}
