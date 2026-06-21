// Multi-entry process stack rows echoing Kun's ProcessStackRows
// (../Kun/src/renderer/src/components/chat/message-timeline-process.tsx).
// Visual only: parent supplies stack entry snapshots and processing state.

import { useState, type KeyboardEvent, type MouseEvent, type ReactElement } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ProcessEntryDetail } from './ProcessEntryDetail'
import { ProcessSummaryText } from './ProcessFileReference'
import { type ProcessStackEntrySnapshot } from './ProcessSectionRow'

/** Kun getProcessDetail skips expand affordance for short system messages. */
const SYSTEM_MESSAGE_DETAIL_THRESHOLD = 140

function normalizeProcessText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase()
}

function hasExplicitSystemDetail(
  summary: string,
  detailText?: string,
  explicitDetail?: boolean,
): boolean {
  if (explicitDetail === true) return true
  const detail = detailText?.trim()
  if (!detail) return false
  return normalizeProcessText(detail) !== normalizeProcessText(summary)
}

/** Shared with ProcessSectionRow single-entry delegation. */
export function systemEntryHasExpandableDetail(
  summary: string,
  detailText?: string,
  explicitDetail?: boolean,
): boolean {
  const detail = detailText?.trim()
  if (!detail) return false
  if (hasExplicitSystemDetail(summary, detailText, explicitDetail)) return true
  return summary.trim().length > SYSTEM_MESSAGE_DETAIL_THRESHOLD
}

/** Kun getProcessDetail — hide expand chevron when detail duplicates the summary line. */
function stackEntryHasExpandableDetail(entry: ProcessStackEntrySnapshot): boolean {
  if (entry.nestedBubble) return true
  const detailText = entry.detailText?.trim()
  if (!detailText) return false
  if (
    entry.detailKind === 'patch' ||
    entry.detailKind === 'error' ||
    entry.detailKind === 'assistant' ||
    entry.detailKind === 'reasoning' ||
    entry.detailKind === 'approval' ||
    entry.detailKind === 'user_input'
  ) {
    return true
  }
  if (entry.blockKind === 'system') {
    return systemEntryHasExpandableDetail(
      entry.summary,
      entry.detailText,
      entry.explicitDetail,
    )
  }
  return normalizeProcessText(detailText) !== normalizeProcessText(entry.summary)
}

/** Kun processBlockIsActive — row shimmer during running/pending process blocks. */
function stackEntryIsActive(
  entry: ProcessStackEntrySnapshot,
  processing?: boolean,
): boolean {
  if (processing !== true) return entry.active === true
  if (entry.runningTool === true) return true
  if (entry.pendingApproval === true) return true
  if (entry.pendingUserInput === true) return true
  if (entry.requestUserInput === true) return true
  if (entry.showCompactionIcon === true) return true
  if (entry.detailKind === 'assistant' && entry.id === 'live-assistant') {
    return true
  }
  return entry.active === true
}

function entryAutoForceOpen(
  entry: ProcessStackEntrySnapshot,
  processing?: boolean,
): boolean {
  if (entry.pendingApproval === true) return true
  if (processing !== true) return false
  if (entry.requestUserInput === true) return true
  if (entry.pendingUserInput === true) return true
  return entry.showCompactionIcon === true
}

function stackEntryShowsFileReference(entry: ProcessStackEntrySnapshot): boolean {
  if (entry.toolBlock === false || entry.blockKind === 'system') return false
  if (entry.toolBlock === true) return Boolean(entry.filePath)
  return (
    entry.detailKind === 'patch' ||
    entry.detailKind === 'command' ||
    Boolean(entry.filePath)
  )
}

function ProcessStackEntryRow({
  entry,
  open,
  canToggle,
  onToggle,
  processing,
}: {
  entry: ProcessStackEntrySnapshot
  open: boolean
  canToggle: boolean
  onToggle: () => void
  processing?: boolean
}): ReactElement {
  const canExpand =
    stackEntryHasExpandableDetail(entry) && entry.collapsible !== false
  const rowActive = stackEntryIsActive(entry, processing)

  const handleToggleButton = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
    onToggle()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (!canToggle) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onToggle()
  }

  const row = (
    <>
      <span
        className={`process-stack-entry-summary ${
          rowActive && !entry.error ? 'ds-shiny-text' : ''
        }`}
      >
        <ProcessSummaryText
          summary={entry.summary}
          filePath={entry.filePath}
          enableFileReference={stackEntryShowsFileReference(entry)}
        />
      </span>
      {canExpand ? (
        <button
          type="button"
          aria-label={open ? 'Collapse detail' : 'Expand detail'}
          aria-expanded={open}
          disabled={!canToggle}
          className={`process-stack-entry-toggle ${canToggle ? '' : 'is-static'}`}
          onClick={handleToggleButton}
        >
          {open ? (
            <ChevronDown className="process-stack-entry-chevron" strokeWidth={2} />
          ) : (
            <ChevronRight className="process-stack-entry-chevron" strokeWidth={2} />
          )}
        </button>
      ) : null}
    </>
  )

  return (
    <div className="process-stack-entry">
      <div
        role={canToggle ? 'button' : undefined}
        tabIndex={canToggle ? 0 : undefined}
        aria-expanded={canToggle ? open : undefined}
        className={`process-stack-entry-row ${canToggle ? 'is-interactive' : 'is-static'} ${
          entry.error ? 'is-error' : ''
        }`}
        onClick={canToggle ? onToggle : undefined}
        onKeyDown={handleKeyDown}
      >
        {row}
      </div>
      {open && (entry.detailText || entry.nestedBubble) ? (
        entry.detailKind === 'assistant' ? (
          <div className="process-stack-entry-assistant">
            <ProcessEntryDetail
              entry={entry}
              processing={processing}
              streamBlockId={entry.id}
            />
          </div>
        ) : (
          <div className="process-stack-entry-detail-inset ds-work-timeline-detail">
            <ProcessEntryDetail
              entry={entry}
              processing={processing}
              streamBlockId={entry.id}
            />
          </div>
        )
      ) : null}
    </div>
  )
}

export function ProcessStackRows({
  entries,
  processing,
}: {
  entries: ProcessStackEntrySnapshot[]
  processing?: boolean
}): ReactElement {
  const [openBlockId, setOpenBlockId] = useState<string | null>(() => {
    const preset = entries.find((entry) => entry.expanded)?.id
    return preset ?? null
  })
  const [closedBlockIds, setClosedBlockIds] = useState<ReadonlySet<string>>(() => new Set())

  return (
    <div className="ds-work-stack">
      {entries.map((entry) => {
        const hasDetail = stackEntryHasExpandableDetail(entry)
        const staticOpen = hasDetail && entry.collapsible === false
        const defaultOpen = entry.error === true
        const forceOpen =
          entry.forceOpen === true || entryAutoForceOpen(entry, processing)
        const userClosed = closedBlockIds.has(entry.id)
        const userOpened = openBlockId === entry.id
        const open =
          hasDetail &&
          (staticOpen || forceOpen || userOpened || (defaultOpen && !userClosed))
        const canExpand = hasDetail && !staticOpen
        const canToggle = canExpand && !forceOpen
        const handleToggle = (): void => {
          if (!canToggle) return
          if (open) {
            setOpenBlockId((id) => (id === entry.id ? null : id))
            if (defaultOpen) {
              setClosedBlockIds((ids) => {
                const next = new Set(ids)
                next.add(entry.id)
                return next
              })
            }
            return
          }
          setClosedBlockIds((ids) => {
            if (!ids.has(entry.id)) return ids
            const next = new Set(ids)
            next.delete(entry.id)
            return next
          })
          setOpenBlockId(entry.id)
        }

        return (
          <ProcessStackEntryRow
            key={entry.id}
            entry={entry}
            open={open}
            canToggle={canToggle}
            onToggle={handleToggle}
            processing={processing}
          />
        )
      })}
    </div>
  )
}
