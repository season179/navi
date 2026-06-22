// Dev server launch card echoing Kun's DevPreviewLaunchCard
// (../Kun/src/renderer/src/components/DevPreviewLaunchCard.tsx).
// Visual only: parent supplies the preview URL and opened state.

import type { ReactElement } from 'react'
import { Check, Globe2 } from 'lucide-react'
import {
  DEV_PREVIEW_CARD_OPEN,
  DEV_PREVIEW_CARD_OPENED,
  DEV_PREVIEW_CARD_TITLE,
  formatDevPreviewCardSubtitle,
} from '../lib/devPreviewLaunchCard'

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
        <div className="dev-preview-launch-card-title">{DEV_PREVIEW_CARD_TITLE}</div>
        <div className="dev-preview-launch-card-subtitle" title={url}>
          <span className="dev-preview-launch-card-dot" aria-hidden />
          <span className="dev-preview-launch-card-url">
            {formatDevPreviewCardSubtitle(url)}
          </span>
        </div>
      </div>
      {opened ? (
        <div className="dev-preview-launch-card-opened">
          <Check strokeWidth={2} />
          <span>{DEV_PREVIEW_CARD_OPENED}</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="dev-preview-launch-card-open-btn"
          title={DEV_PREVIEW_CARD_OPEN}
        >
          {DEV_PREVIEW_CARD_OPEN}
        </button>
      )}
    </div>
  )
}
