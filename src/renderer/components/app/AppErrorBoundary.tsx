// Uncaught render error fallback echoing Kun's AppErrorBoundary
// (../Kun/src/renderer/src/components/AppErrorBoundary.tsx).
// Visual only: wraps children and shows the amber card when a render error occurs.

import { Component, type ErrorInfo, type ReactElement, type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

type State = {
  error: Error | null
}

/** Sample error for ?appErrorBoundaryPreview preview hooks. */
export const APP_ERROR_BOUNDARY_PREVIEW = {
  default: new Error('Cannot read properties of undefined (reading "map")'),
  message: new Error('Failed to render conversation timeline.'),
} as const

export type AppErrorBoundaryPreviewMode = keyof typeof APP_ERROR_BOUNDARY_PREVIEW

type FallbackProps = {
  error: Error
  onReload?: () => void
}

/** Presentational error card matching Kun's AppErrorBoundary layout. */
export function AppErrorFallback({ error, onReload }: FallbackProps): ReactElement {
  const handleReload = (): void => {
    if (onReload) {
      onReload()
      return
    }
    window.location.reload()
  }

  return (
    <div className="app-error-boundary">
      <div className="app-error-boundary-card">
        <h2 className="app-error-boundary-title">Something went wrong</h2>
        <p className="app-error-boundary-message">
          {error.message || String(error)}
        </p>
        <button
          type="button"
          className="app-error-boundary-reload"
          onClick={handleReload}
        >
          Reload
        </button>
      </div>
    </div>
  )
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[AppErrorBoundary] uncaught render error:', error, info.componentStack)
  }

  override render(): ReactNode {
    if (!this.state.error) return this.props.children
    return <AppErrorFallback error={this.state.error} />
  }
}
