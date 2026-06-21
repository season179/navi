// Runtime disclosure meta chips echoing Kun's RuntimeMetaChips
// (../Kun/src/renderer/src/components/chat/message-timeline-bubbles.tsx).
// Visual only: parent supplies parsed meta snapshots.

import type { ReactElement } from 'react'

export type RuntimeMetaSource = {
  title?: string
  url?: string
}

export type RuntimeMetaChipsSnapshot = {
  attachmentIds?: string[]
  activeSkillIds?: string[]
  injectedMemoryIds?: string[]
  sources?: RuntimeMetaSource[]
  childLabel?: string
}

type Props = {
  meta: RuntimeMetaChipsSnapshot
  align?: 'left' | 'right'
  hideAttachments?: boolean
  /** Kun RuntimeMetaBadges under ProcessEntryRow uses ml-7 mt-1 instead of mt-2. */
  placement?: 'default' | 'process-entry'
}

/** Sample meta for ?runtimeMetaChips=1 visual verification (user-message footer). */
export const RUNTIME_META_CHIPS_PREVIEW: RuntimeMetaChipsSnapshot = {
  activeSkillIds: ['code-review', 'typescript'],
  injectedMemoryIds: ['proj-auth-notes', 'jwt-patterns'],
  sources: [
    { title: 'JWT Best Practices', url: 'https://example.com/jwt' },
    { title: 'Auth Middleware Guide', url: 'https://example.com/auth' },
  ],
  childLabel: 'auth-refactor',
}

/** Tool-entry snapshot for ?runtimeMetaChips=tool visual verification. */
export const RUNTIME_META_CHIPS_PREVIEW_TOOL: RuntimeMetaChipsSnapshot = {
  attachmentIds: ['att-001', 'att-002', 'att-003'],
  activeSkillIds: ['shell'],
  childLabel: 'deploy-check',
  sources: [{ url: 'https://example.com/docs/cli' }],
}

/** Minimal snapshot for ?runtimeMetaChips=minimal visual verification. */
export const RUNTIME_META_CHIPS_PREVIEW_MINIMAL: RuntimeMetaChipsSnapshot = {
  activeSkillIds: ['typescript'],
}

export function RuntimeMetaChips({
  meta,
  align = 'left',
  hideAttachments = false,
  placement = 'default',
}: Props): ReactElement | null {
  const attachmentIds = meta.attachmentIds ?? []
  const activeSkillIds = meta.activeSkillIds ?? []
  const injectedMemoryIds = meta.injectedMemoryIds ?? []
  const sources = meta.sources ?? []
  const childLabel = meta.childLabel?.trim() ?? ''

  if (
    (hideAttachments || attachmentIds.length === 0) &&
    activeSkillIds.length === 0 &&
    injectedMemoryIds.length === 0 &&
    sources.length === 0 &&
    !childLabel
  ) {
    return null
  }

  return (
    <div
      className={`runtime-meta-chips${
        align === 'right' ? ' is-right' : ''
      }${placement === 'process-entry' ? ' is-process-entry' : ''}`}
    >
      {!hideAttachments && attachmentIds.length > 0 ? (
        <span
          className="runtime-meta-chip"
          title={attachmentIds.join(', ')}
        >
          Attachments {attachmentIds.length}
        </span>
      ) : null}
      {activeSkillIds.length > 0 ? (
        <span
          className="runtime-meta-chip"
          title={activeSkillIds.join(', ')}
        >
          Skills {activeSkillIds.length}
        </span>
      ) : null}
      {injectedMemoryIds.length > 0 ? (
        <span
          className="runtime-meta-chip"
          title={injectedMemoryIds.join(', ')}
        >
          Memories {injectedMemoryIds.length}
        </span>
      ) : null}
      {childLabel ? (
        <span className="runtime-meta-chip" title={childLabel}>
          Child agent{' '}
          <span className="runtime-meta-chip-mono">{childLabel}</span>
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
            Sources {index + 1}
          </a>
        ) : (
          <span
            key={`${source.title ?? 'source'}-${index}`}
            className="runtime-meta-chip"
            title={source.title}
          >
            Sources {index + 1}
          </span>
        ),
      )}
    </div>
  )
}
