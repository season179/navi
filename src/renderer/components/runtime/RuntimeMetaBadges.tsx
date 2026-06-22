// Process-entry runtime meta badges echoing Kun's RuntimeMetaBadges
// (../Kun/src/renderer/src/components/chat/message-timeline-process.tsx).
// Visual only: parent supplies parsed meta snapshots.

import type { ReactElement } from 'react'
import {
  RUNTIME_META_CHILD_AGENT,
  formatRuntimeMetaActiveSkillsLabel,
  formatRuntimeMetaAttachmentsLabel,
  formatRuntimeMetaInjectedMemoriesLabel,
  formatRuntimeMetaSourcesLabel,
} from '../../lib/runtimeMetaChips'
import {
  type RuntimeMetaChipsSnapshot,
  RUNTIME_META_CHIPS_PREVIEW,
} from './RuntimeMetaChips'

type Props = {
  meta: RuntimeMetaChipsSnapshot
}

/** Re-export preview snapshot for process-entry row hooks. */
export const RUNTIME_META_BADGES_PREVIEW = RUNTIME_META_CHIPS_PREVIEW

export function RuntimeMetaBadges({ meta }: Props): ReactElement | null {
  const attachmentIds = meta.attachmentIds ?? []
  const activeSkillIds = meta.activeSkillIds ?? []
  const injectedMemoryIds = meta.injectedMemoryIds ?? []
  const sources = meta.sources ?? []
  const childLabel = meta.childLabel?.trim() ?? ''

  if (
    attachmentIds.length === 0 &&
    activeSkillIds.length === 0 &&
    injectedMemoryIds.length === 0 &&
    sources.length === 0 &&
    !childLabel
  ) {
    return null
  }

  return (
    <div className="runtime-meta-badges">
      {childLabel ? (
        <span className="runtime-meta-chip" title={childLabel}>
          {RUNTIME_META_CHILD_AGENT}{' '}
          <span className="runtime-meta-chip-mono is-child">{childLabel}</span>
        </span>
      ) : null}
      {activeSkillIds.length > 0 ? (
        <span
          className="runtime-meta-chip"
          title={activeSkillIds.join(', ')}
        >
          {formatRuntimeMetaActiveSkillsLabel(activeSkillIds.length)}
        </span>
      ) : null}
      {injectedMemoryIds.length > 0 ? (
        <span
          className="runtime-meta-chip"
          title={injectedMemoryIds.join(', ')}
        >
          {formatRuntimeMetaInjectedMemoriesLabel(injectedMemoryIds.length)}
        </span>
      ) : null}
      {attachmentIds.length > 0 ? (
        <span
          className="runtime-meta-chip"
          title={attachmentIds.join(', ')}
        >
          {formatRuntimeMetaAttachmentsLabel(attachmentIds.length)}
        </span>
      ) : null}
      {sources.slice(0, 4).map((source, index) =>
        source.url ? (
          <a
            key={`${source.url}-${index}`}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="runtime-meta-chip"
            title={source.url}
          >
            {formatRuntimeMetaSourcesLabel(index)}
            <span className="runtime-meta-badge-source-title">
              {source.title || source.url}
            </span>
          </a>
        ) : (
          <span
            key={`${source.title ?? 'source'}-${index}`}
            className="runtime-meta-chip"
            title={source.title}
          >
            {formatRuntimeMetaSourcesLabel(index)}
          </span>
        ),
      )}
    </div>
  )
}
