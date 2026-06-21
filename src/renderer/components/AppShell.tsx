// App shell orchestrator echoing Kun's AppShell
// (../Kun/src/renderer/src/AppShell.tsx).
// Visual only: composes WindowsTitleBar, RuntimeStatusBanner, route content,
// RouteFallback loading state, and InitialSetupDialog overlay.

import { useMemo, useState, type ReactElement } from 'react'
import {
  WindowsTitleBar,
  supportsDesktopTitleBar,
} from './WindowsTitleBar'
import {
  RuntimeStatusBanner,
  RUNTIME_STATUS_BANNER_PREVIEW,
  type RuntimeStatusSnapshot,
} from './RuntimeStatusBanner'
import {
  Workbench,
  getWorkbenchPreviewSnapshot,
  type WorkbenchPreviewMode,
} from './Workbench'
import {
  SettingsView,
} from './SettingsView'
import {
  resolveSettingsSidebarPreviewCategory,
  type SettingsCategory,
} from './SettingsSidebar'
import {
  InitialSetupDialog,
  INITIAL_SETUP_PREVIEW,
  type InitialSetupSnapshot,
} from './InitialSetupDialog'

export type AppShellRoute = 'chat' | 'settings'

export type AppShellSnapshot = {
  route: AppShellRoute
  platform: string
  routeFallback: boolean
  initialSetupOpen: boolean
  initialSetupSnapshot?: InitialSetupSnapshot
  runtimeStatus?: RuntimeStatusSnapshot | null
  workbenchMode?: WorkbenchPreviewMode
  settingsCategory?: SettingsCategory
}

export type AppShellPreviewMode =
  | 'default'
  | 'windows'
  | 'linux'
  | 'settings'
  | 'windowsSettings'
  | 'loading'
  | 'initialSetup'
  | 'windowsInitialSetup'
  | 'runtimeStatus'
  | 'windowsRuntimeStatus'

const COPY = {
  loading: 'Loading…',
}

function RouteFallback(): ReactElement {
  return (
    <div className="app-shell-route-fallback" role="status" aria-live="polite">
      <div className="app-shell-route-fallback-card">
        <span className="app-shell-route-fallback-dot" aria-hidden />
        <span>{COPY.loading}</span>
      </div>
    </div>
  )
}

function AppShellSettingsContent({
  category: initialCategory,
}: {
  category: SettingsCategory
}): ReactElement {
  const [category, setCategory] = useState<SettingsCategory>(initialCategory)

  return (
    <SettingsView
      category={category}
      setCategory={setCategory}
      onGoBack={() => undefined}
    />
  )
}

function AppShellRouteContent({ snapshot }: { snapshot: AppShellSnapshot }): ReactElement {
  if (snapshot.routeFallback) {
    return <RouteFallback />
  }

  if (snapshot.route === 'settings') {
    return (
      <AppShellSettingsContent
        category={snapshot.settingsCategory ?? resolveSettingsSidebarPreviewCategory('default')}
      />
    )
  }

  return (
    <Workbench snapshot={getWorkbenchPreviewSnapshot(snapshot.workbenchMode ?? 'default')} />
  )
}

export function AppShell({ snapshot }: { snapshot: AppShellSnapshot }): ReactElement {
  const hasDesktopTitleBar = supportsDesktopTitleBar(snapshot.platform)
  const frameClass = hasDesktopTitleBar
    ? 'app-shell-frame app-shell-frame--desktop'
    : 'app-shell-frame'

  return (
    <div className={frameClass}>
      {hasDesktopTitleBar ? <WindowsTitleBar platform={snapshot.platform} /> : null}
      <div className="app-shell-body">
        {snapshot.runtimeStatus ? (
          <RuntimeStatusBanner status={snapshot.runtimeStatus} />
        ) : null}
        <div className="app-shell-route">
          <AppShellRouteContent snapshot={snapshot} />
        </div>
      </div>
      {snapshot.initialSetupOpen ? (
        <InitialSetupDialog
          snapshot={snapshot.initialSetupSnapshot ?? INITIAL_SETUP_PREVIEW}
          onClose={() => undefined}
          onSave={() => undefined}
        />
      ) : null}
    </div>
  )
}

function resolvePreviewPlatform(mode: AppShellPreviewMode): string {
  if (mode === 'linux') return 'linux'
  if (
    mode === 'windows' ||
    mode === 'windowsSettings' ||
    mode === 'windowsInitialSetup' ||
    mode === 'windowsRuntimeStatus'
  ) {
    return 'win32'
  }
  return 'darwin'
}

function resolvePreviewSnapshot(mode: AppShellPreviewMode): AppShellSnapshot {
  const platform = resolvePreviewPlatform(mode)

  switch (mode) {
    case 'settings':
      return {
        route: 'settings',
        platform,
        routeFallback: false,
        initialSetupOpen: false,
        settingsCategory: resolveSettingsSidebarPreviewCategory('default'),
      }
    case 'windowsSettings':
      return {
        route: 'settings',
        platform,
        routeFallback: false,
        initialSetupOpen: false,
        settingsCategory: resolveSettingsSidebarPreviewCategory('providers'),
      }
    case 'loading':
      return {
        route: 'chat',
        platform,
        routeFallback: true,
        initialSetupOpen: false,
      }
    case 'initialSetup':
      return {
        route: 'chat',
        platform,
        routeFallback: false,
        initialSetupOpen: true,
        initialSetupSnapshot: INITIAL_SETUP_PREVIEW,
      }
    case 'windowsInitialSetup':
      return {
        route: 'chat',
        platform,
        routeFallback: false,
        initialSetupOpen: true,
        initialSetupSnapshot: INITIAL_SETUP_PREVIEW,
        workbenchMode: 'empty',
      }
    case 'runtimeStatus':
      return {
        route: 'chat',
        platform,
        routeFallback: false,
        initialSetupOpen: false,
        runtimeStatus: RUNTIME_STATUS_BANNER_PREVIEW.restartingAttempt,
        workbenchMode: 'default',
      }
    case 'windowsRuntimeStatus':
      return {
        route: 'chat',
        platform,
        routeFallback: false,
        initialSetupOpen: false,
        runtimeStatus: RUNTIME_STATUS_BANNER_PREVIEW.rolledBack,
        workbenchMode: 'default',
      }
    case 'windows':
    case 'linux':
      return {
        route: 'chat',
        platform,
        routeFallback: false,
        initialSetupOpen: false,
        workbenchMode: 'default',
      }
    case 'default':
    default:
      return {
        route: 'chat',
        platform,
        routeFallback: false,
        initialSetupOpen: false,
        workbenchMode: 'default',
      }
  }
}

/** Full-screen preview shell for ?appShellPreview URL hooks. */
export function AppShellPreview({
  mode = 'default',
}: {
  mode?: AppShellPreviewMode
}): ReactElement {
  const snapshot = useMemo(() => resolvePreviewSnapshot(mode), [mode])

  return (
    <div className="app-shell-preview-wrap">
      <AppShell snapshot={snapshot} />
    </div>
  )
}
