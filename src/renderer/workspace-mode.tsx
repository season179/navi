import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { type WorkspaceModeView } from './components/WorkspaceModeTabs'

export interface WorkspaceModeContextValue {
  /** Active Code/Write tab view, accounting for schedule override and preview hooks. */
  workspaceMode: WorkspaceModeView
  /** Production Code/Write tab selection (chat or write). */
  productionWorkspaceMode: 'chat' | 'write'
  setProductionWorkspaceMode: (mode: 'chat' | 'write') => void
  /** True when ?workspaceModeTabsPreview URL hook is active. */
  workspaceModeTabsPreviewActive: boolean
  workspaceModeTabsPreviewView: 'chat' | 'write'
  setWorkspaceModeTabsPreviewView: (mode: 'chat' | 'write') => void
}

export const WorkspaceModeContext = createContext<WorkspaceModeContextValue>({
  workspaceMode: 'chat',
  productionWorkspaceMode: 'chat',
  setProductionWorkspaceMode: () => {},
  workspaceModeTabsPreviewActive: false,
  workspaceModeTabsPreviewView: 'chat',
  setWorkspaceModeTabsPreviewView: () => {},
})

function resolveWorkspaceModeTabsPreviewMode(): WorkspaceModeView | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  if (!params.has('workspaceModeTabsPreview')) return null
  return params.get('workspaceModeTabsPreview') === 'write' ? 'write' : 'chat'
}

export function WorkspaceModeProvider({
  children,
  scheduleActive,
  clawActive = false,
}: {
  children: ReactNode
  scheduleActive: boolean
  clawActive?: boolean
}) {
  const workspaceModeTabsPreviewMode = useMemo(() => resolveWorkspaceModeTabsPreviewMode(), [])
  const [workspaceModeTabsPreviewView, setWorkspaceModeTabsPreviewView] = useState<
    'chat' | 'write'
  >(() => (workspaceModeTabsPreviewMode === 'write' ? 'write' : 'chat'))
  const [productionWorkspaceMode, setProductionWorkspaceMode] = useState<'chat' | 'write'>('chat')

  const workspaceMode = useMemo((): WorkspaceModeView => {
    if (workspaceModeTabsPreviewMode !== null) return workspaceModeTabsPreviewView
    if (scheduleActive) return 'schedule'
    if (clawActive) return 'chat'
    return productionWorkspaceMode
  }, [
    workspaceModeTabsPreviewMode,
    workspaceModeTabsPreviewView,
    scheduleActive,
    clawActive,
    productionWorkspaceMode,
  ])

  const setProductionWorkspaceModeStable = useCallback(
    (mode: 'chat' | 'write') => setProductionWorkspaceMode(mode),
    [],
  )

  return (
    <WorkspaceModeContext.Provider
      value={{
        workspaceMode,
        productionWorkspaceMode,
        setProductionWorkspaceMode: setProductionWorkspaceModeStable,
        workspaceModeTabsPreviewActive: workspaceModeTabsPreviewMode !== null,
        workspaceModeTabsPreviewView,
        setWorkspaceModeTabsPreviewView,
      }}
    >
      {children}
    </WorkspaceModeContext.Provider>
  )
}

export function useWorkspaceMode() {
  return useContext(WorkspaceModeContext)
}
