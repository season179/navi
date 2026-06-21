import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export interface SddDraftModeContextValue {
  sddDraftActive: boolean
  openSddDraft: () => void
  closeSddDraft: () => void
}

export const SddDraftModeContext = createContext<SddDraftModeContextValue>({
  sddDraftActive: false,
  openSddDraft: () => {},
  closeSddDraft: () => {},
})

function resolveSddDraftPreview(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.has('productionSddDraft')
}

export function SddDraftModeProvider({ children }: { children: ReactNode }) {
  const [sddDraftActive, setSddDraftActive] = useState(() => resolveSddDraftPreview())

  const openSddDraft = useCallback(() => setSddDraftActive(true), [])
  const closeSddDraft = useCallback(() => setSddDraftActive(false), [])

  return (
    <SddDraftModeContext.Provider value={{ sddDraftActive, openSddDraft, closeSddDraft }}>
      {children}
    </SddDraftModeContext.Provider>
  )
}

export function useSddDraftMode() {
  return useContext(SddDraftModeContext)
}
