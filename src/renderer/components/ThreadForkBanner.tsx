// Thread fork banner and divider echoing Kun's ThreadForkBanner and ThreadForkPoint
// (../Kun/src/renderer/src/components/chat/message-timeline-empty.tsx).
// Visual only: parent supplies the parent conversation title when known.

import type { ReactElement } from 'react'
import { GitFork } from 'lucide-react'
import {
  formatThreadForkBannerSubtitle,
  resolveThreadForkPointLabel,
  THREAD_FORK_BANNER_TITLE,
} from '../lib/threadForkBanner'

type Props = {
  parentTitle?: string
}

/** Sample title for ?threadForkBanner=1 visual verification. */
export const THREAD_FORK_BANNER_PREVIEW_TITLE = 'Deploy auth middleware refactor'

export function ThreadForkBanner({ parentTitle }: Props): ReactElement {
  return (
    <div className="thread-fork-banner">
      <div className="thread-fork-banner-inner">
        <span className="thread-fork-banner-icon-wrap">
          <GitFork className="thread-fork-banner-icon" strokeWidth={1.85} />
        </span>
        <span className="thread-fork-banner-copy">
          <span className="thread-fork-banner-title">{THREAD_FORK_BANNER_TITLE}</span>
          <span className="thread-fork-banner-subtitle">
            {formatThreadForkBannerSubtitle(parentTitle)}
          </span>
        </span>
      </div>
    </div>
  )
}

export function ThreadForkPoint({ parentTitle }: Props): ReactElement {
  const label = resolveThreadForkPointLabel(parentTitle)

  return (
    <div className="thread-fork-point">
      <span className="thread-fork-point-line" />
      <span className="thread-fork-point-pill" title={label}>
        <GitFork className="thread-fork-point-icon" strokeWidth={1.8} />
        <span className="thread-fork-point-label">{label}</span>
      </span>
      <span className="thread-fork-point-line" />
    </div>
  )
}
