// Dev server launch card echoing Kun's DevPreviewLaunchCard
// (../Kun/src/renderer/src/components/DevPreviewLaunchCard.tsx).
// Visual only: parent supplies the preview URL and opened state.

import type { ReactElement } from 'react'
import { Check, Globe2 } from 'lucide-react'

function formatDevPreviewUrlLabel(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

type Props = {
  url: string
  opened?: boolean
  onOpen?: () => void
}

/** Sample URL for ?devPreviewLaunchCard=1 visual verification. */
export const DEV_PREVIEW_LAUNCH_CARD_PREVIEW = {
  url: 'http://localhost:5173',
}

export function DevPreviewLaunchCard({
  url,
  opened = false,
  onOpen,
}: Props): ReactElement {
  return (
    <div className="dev-preview-launch-card">
      <div className="dev-preview-launch-card-icon">
        <Globe2 strokeWidth={1.9} />
      </div>
      <div className="dev-preview-launch-card-body">
        <div className="dev-preview-launch-card-title">Web preview</div>
        <div className="dev-preview-launch-card-subtitle" title={url}>
          <span className="dev-preview-launch-card-dot" aria-hidden />
          <span className="dev-preview-launch-card-url">
            Website · {formatDevPreviewUrlLabel(url)}
          </span>
        </div>
      </div>
      {opened ? (
        <div className="dev-preview-launch-card-opened">
          <Check strokeWidth={2} />
          <span>Preview opened on the right</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="dev-preview-launch-card-open-btn"
          title="Open preview"
        >
          Open preview
        </button>
      )}
    </div>
  )
}
