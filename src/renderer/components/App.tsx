// Root app wrapper echoing Kun's App.tsx (../Kun/src/renderer/src/App.tsx).
// Visual only: AppErrorBoundary, Suspense startup shell, and lazy AppShell.

import { Suspense, lazy, useMemo, type ReactElement } from 'react'
import { AppErrorBoundary } from './AppErrorBoundary'
import type { AppShellPreviewMode, AppShellSnapshot } from './AppShell'
import { resolveSettingsSidebarPreviewCategory } from './SettingsSidebar'

const COPY = {
  loading: 'Loading navi…',
}

/** Kun's StartupShell — centered pill shown while the AppShell chunk loads. */
export function StartupShell(): ReactElement {
  return (
    <div className="app-startup-shell" role="status" aria-live="polite">
      <div className="app-startup-shell-card">
        <span className="app-startup-shell-dot" aria-hidden />
        <span>{COPY.loading}</span>
      </div>
    </div>
  )
}

const LazyAppShell = lazy(async () => {
  const module = await import('./AppShell')
  return {
    default: function LazyAppShell({ snapshot }: { snapshot: AppShellSnapshot }): ReactElement {
      return <module.AppShell snapshot={snapshot} />
    },
  }
})

function resolveDefaultSnapshot(): AppShellSnapshot {
  return {
    route: 'chat',
    platform: typeof window !== 'undefined' ? window.navigator.platform.toLowerCase() : 'darwin',
    routeFallback: false,
    initialSetupOpen: false,
    workbenchMode: 'default',
  }
}

export type AppPreviewMode = 'default' | 'startup' | 'windows' | 'settings' | 'loading'

function resolveAppShellSnapshot(mode: AppPreviewMode): AppShellSnapshot {
  const platform =
    mode === 'windows' ? 'win32' : resolveDefaultSnapshot().platform

  if (mode === 'settings') {
    return {
      route: 'settings',
      platform,
      routeFallback: false,
      initialSetupOpen: false,
      settingsCategory: resolveSettingsSidebarPreviewCategory('default'),
    }
  }

  if (mode === 'loading') {
    return {
      route: 'chat',
      platform,
      routeFallback: true,
      initialSetupOpen: false,
    }
  }

  return {
    ...resolveDefaultSnapshot(),
    platform,
  }
}

/** Root app composition matching Kun's App default export. */
export function App({ snapshot }: { snapshot?: AppShellSnapshot }): ReactElement {
  const resolvedSnapshot = snapshot ?? resolveDefaultSnapshot()

  return (
    <AppErrorBoundary>
      <Suspense fallback={<StartupShell />}>
        <LazyAppShell snapshot={resolvedSnapshot} />
      </Suspense>
    </AppErrorBoundary>
  )
}

/** Full-screen preview shell for ?appPreview URL hooks. */
export function AppPreview({ mode = 'default' }: { mode?: AppPreviewMode }): ReactElement {
  const snapshot = useMemo(() => resolveAppShellSnapshot(mode), [mode])

  if (mode === 'startup') {
    return (
      <div className="app-preview-wrap">
        <StartupShell />
      </div>
    )
  }

  return (
    <div className="app-preview-wrap">
      <App snapshot={snapshot} />
    </div>
  )
}

/** Re-export AppShell preview modes for nested preview routing. */
export type { AppShellPreviewMode }
