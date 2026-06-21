import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface FocusModeContextValue {
  /** True when focus mode hides decorative mascots and empty-hero chrome. */
  focusModeEnabled: boolean
  /** Flip focus mode on or off. */
  toggleFocusMode: () => void
  /** Set focus mode explicitly. */
  setFocusModeEnabled: (enabled: boolean) => void
}

export const FocusModeContext = createContext<FocusModeContextValue>({
  focusModeEnabled: false,
  toggleFocusMode: () => {},
  setFocusModeEnabled: () => {},
})

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [focusModeEnabled, setFocusModeEnabled] = useState(false)

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-focus-mode', focusModeEnabled ? 'on' : 'off')
  }, [focusModeEnabled])

  const toggleFocusMode = () => setFocusModeEnabled((enabled) => !enabled)

  return (
    <FocusModeContext.Provider
      value={{ focusModeEnabled, toggleFocusMode, setFocusModeEnabled }}
    >
      {children}
    </FocusModeContext.Provider>
  )
}

export function useFocusMode() {
  return useContext(FocusModeContext)
}
