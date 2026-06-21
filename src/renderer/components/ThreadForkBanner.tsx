// Thread fork banner and divider echoing Kun's ThreadForkBanner and ThreadForkPoint
// (../Kun/src/renderer/src/components/chat/message-timeline-empty.tsx).
// Visual only: parent supplies the parent conversation title when known.

import type { ReactElement } from 'react'
import { GitFork } from 'lucide-react'

type Props = {
  parentTitle?: string
}

/** Sample title for ?threadForkBanner=1 visual verification. */
export const THREAD_FORK_BANNER_PREVIEW_TITLE = 'Deploy auth middleware refactor'

function bannerSubtitle(parentTitle?: string): string {
  if (parentTitle?.trim()) {
    return `Continues from ${parentTitle.trim()}. Earlier messages are inherited; new turns stay in this branch.`
  }
  return 'Earlier messages are inherited; new turns stay in this branch.'
}

function forkPointLabel(parentTitle?: string): string {
  if (parentTitle?.trim()) {
    return `Branch from ${parentTitle.trim()} starts here`
  }
  return 'Branch starts here'
}

export function ThreadForkBanner({ parentTitle }: Props): ReactElement {
  return (
    <div className="thread-fork-banner">
      <div className="thread-fork-banner-inner">
        <span className="thread-fork-banner-icon-wrap">
          <GitFork className="thread-fork-banner-icon" strokeWidth={1.85} />
        </span>
        <span className="thread-fork-banner-copy">
          <span className="thread-fork-banner-title">Forked conversation</span>
          <span className="thread-fork-banner-subtitle">{bannerSubtitle(parentTitle)}</span>
        </span>
      </div>
    </div>
  )
}

export function ThreadForkPoint({ parentTitle }: Props): ReactElement {
  const label = forkPointLabel(parentTitle)

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
