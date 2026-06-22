// Kun provider-model-import-dialog.tsx visual port
// (../Kun/src/renderer/src/components/provider-model-import-dialog.tsx).
// Visual only: mock snapshots and preview URL hooks.

import { useMemo, useState, type ReactElement } from 'react'
import { Check, Search, X } from 'lucide-react'
import type { ProviderModel } from '../../../../shared/flue'

export type ProviderModelKind = 'chat' | 'image' | 'speech' | 'tts' | 'music' | 'video'

export type ProviderModelImportEntry = {
  modelId: string
  kind: ProviderModelKind
  alreadyExists: boolean
}

const PROVIDER_MODEL_KINDS: ProviderModelKind[] = [
  'chat',
  'image',
  'speech',
  'tts',
  'music',
  'video',
]

const KIND_LABELS: Record<ProviderModelKind, string> = {
  chat: 'Chat',
  image: 'Image',
  speech: 'Speech',
  tts: 'TTS',
  music: 'Music',
  video: 'Video',
}

const COPY = {
  title: 'Import models',
  subtitle: (provider: string, total: number, existing: number) =>
    `${provider} · ${total} fetched · ${existing} already configured`,
  searchPlaceholder: 'Search model ids…',
  filterAll: (count: number) => `All · ${count}`,
  hideExisting: (count: number) => `Hide configured · ${count}`,
  noneFetched: 'No models were returned from the provider.',
  noneMatch: 'No models match the current filters.',
  alreadyAdded: 'Already added',
  selectAllVisible: (count: number) => `Select all visible · ${count}`,
  clearVisible: 'Clear visible selection',
  selectedCount: (count: number) => `${count} selected`,
  cancel: 'Cancel',
  confirm: (count: number) => `Import ${count} model${count === 1 ? '' : 's'}`,
  close: 'Close',
}

function entryKey(kind: ProviderModelKind, modelId: string): string {
  return `${kind}\u0001${modelId}`
}

function inferModelKind(modelId: string): ProviderModelKind {
  const id = modelId.toLowerCase()
  if (/dall-?e|gpt-image|flux|imagen|stable-diffusion|midjourney/.test(id)) return 'image'
  if (/whisper|speech-to-text|speech/.test(id)) return 'speech'
  if (/tts|text-to-speech|eleven/.test(id)) return 'tts'
  if (/music|suno/.test(id)) return 'music'
  if (/video|sora|runway|veo/.test(id)) return 'video'
  return 'chat'
}

function buildEntries(modelIds: string[], existing: ProviderModel[]): ProviderModelImportEntry[] {
  const existingIds = new Set(existing.map((model) => model.id.trim().toLowerCase()))
  return modelIds
    .map((modelId) => modelId.trim())
    .filter(Boolean)
    .map((modelId) => ({
      modelId,
      kind: inferModelKind(modelId),
      alreadyExists: existingIds.has(modelId.toLowerCase()),
    }))
}

type ProviderModelImportDialogProps = {
  providerName?: string
  modelIds: string[]
  existing: ProviderModel[]
  onConfirm: (selectedIds: string[]) => void
  onClose: () => void
}

export function ProviderModelImportDialog({
  providerName = 'Provider',
  modelIds,
  existing,
  onConfirm,
  onClose,
}: ProviderModelImportDialogProps): ReactElement {
  const entries = useMemo(() => buildEntries(modelIds, existing), [modelIds, existing])

  const [query, setQuery] = useState('')
  const [kindFilter, setKindFilter] = useState<ProviderModelKind | 'all'>('all')
  const [hideExisting, setHideExisting] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(() => {
    const seed = new Set<string>()
    for (const entry of entries) {
      if (!entry.alreadyExists) seed.add(entryKey(entry.kind, entry.modelId))
    }
    return seed
  })

  const normalizedQuery = query.trim().toLowerCase()
  const visibleEntries = useMemo(
    () =>
      entries.filter((entry) => {
        if (kindFilter !== 'all' && entry.kind !== kindFilter) return false
        if (hideExisting && entry.alreadyExists) return false
        if (normalizedQuery && !entry.modelId.toLowerCase().includes(normalizedQuery)) return false
        return true
      }),
    [entries, kindFilter, hideExisting, normalizedQuery],
  )

  const kindCounts = useMemo(() => {
    const counts: Record<ProviderModelKind, number> = {
      chat: 0,
      image: 0,
      speech: 0,
      tts: 0,
      music: 0,
      video: 0,
    }
    for (const entry of entries) counts[entry.kind] += 1
    return counts
  }, [entries])

  const existingCount = useMemo(
    () => entries.reduce((count, entry) => (entry.alreadyExists ? count + 1 : count), 0),
    [entries],
  )

  const toggleOne = (key: string): void => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const selectAllVisible = (): void => {
    setSelected((prev) => {
      const next = new Set(prev)
      for (const entry of visibleEntries) next.add(entryKey(entry.kind, entry.modelId))
      return next
    })
  }

  const clearVisible = (): void => {
    setSelected((prev) => {
      const next = new Set(prev)
      for (const entry of visibleEntries) next.delete(entryKey(entry.kind, entry.modelId))
      return next
    })
  }

  const handleConfirm = (): void => {
    const ids: string[] = []
    for (const entry of entries) {
      if (selected.has(entryKey(entry.kind, entry.modelId))) ids.push(entry.modelId)
    }
    onConfirm(ids)
  }

  const totalSelected = selected.size
  const allVisibleSelected =
    visibleEntries.length > 0 &&
    visibleEntries.every((entry) => selected.has(entryKey(entry.kind, entry.modelId)))

  return (
    <div
      className="provider-model-import-dialog-overlay ds-no-drag"
      role="dialog"
      aria-modal="true"
      aria-label={COPY.title}
      onClick={onClose}
    >
      <section
        className="provider-model-import-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="provider-model-import-dialog-header">
          <div className="provider-model-import-dialog-heading">
            <h2 className="provider-model-import-dialog-title">{COPY.title}</h2>
            <p className="provider-model-import-dialog-subtitle">
              {COPY.subtitle(providerName, entries.length, existingCount)}
            </p>
          </div>
          <button
            type="button"
            aria-label={COPY.close}
            onClick={onClose}
            className="provider-model-import-dialog-close"
          >
            <X className="provider-model-import-dialog-close-icon" strokeWidth={1.9} />
          </button>
        </header>

        <div className="provider-model-import-dialog-filters">
          <div className="provider-model-import-dialog-search-wrap">
            <Search
              className="provider-model-import-dialog-search-icon"
              strokeWidth={1.9}
            />
            <input
              className="provider-model-import-dialog-search"
              value={query}
              placeholder={COPY.searchPlaceholder}
              aria-label={COPY.searchPlaceholder}
              spellCheck={false}
              autoFocus
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="provider-model-import-dialog-chips">
            <button
              type="button"
              aria-pressed={kindFilter === 'all'}
              onClick={() => setKindFilter('all')}
              className={
                kindFilter === 'all'
                  ? 'provider-model-import-dialog-chip is-active'
                  : 'provider-model-import-dialog-chip'
              }
            >
              {COPY.filterAll(entries.length)}
            </button>
            {PROVIDER_MODEL_KINDS.map((kind) => {
              const count = kindCounts[kind]
              if (count === 0) return null
              const active = kindFilter === kind
              return (
                <button
                  key={kind}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setKindFilter(kind)}
                  className={
                    active
                      ? 'provider-model-import-dialog-chip is-active'
                      : 'provider-model-import-dialog-chip'
                  }
                >
                  {`${KIND_LABELS[kind]} · ${count}`}
                </button>
              )
            })}
            {existingCount > 0 ? (
              <label
                className={
                  hideExisting
                    ? 'provider-model-import-dialog-chip is-active is-toggle'
                    : 'provider-model-import-dialog-chip is-toggle'
                }
              >
                <input
                  type="checkbox"
                  className="provider-model-import-dialog-chip-checkbox"
                  checked={hideExisting}
                  onChange={(event) => setHideExisting(event.target.checked)}
                />
                {COPY.hideExisting(existingCount)}
              </label>
            ) : null}
          </div>
        </div>

        <div className="provider-model-import-dialog-list-wrap">
          {visibleEntries.length === 0 ? (
            <p className="provider-model-import-dialog-empty">
              {entries.length === 0 ? COPY.noneFetched : COPY.noneMatch}
            </p>
          ) : (
            <ul className="provider-model-import-dialog-list">
              {visibleEntries.map((entry) => {
                const key = entryKey(entry.kind, entry.modelId)
                const checked = selected.has(key)
                return (
                  <li key={key}>
                    <label
                      className={
                        checked
                          ? 'provider-model-import-dialog-row is-selected'
                          : 'provider-model-import-dialog-row'
                      }
                    >
                      <input
                        type="checkbox"
                        className="provider-model-import-dialog-row-checkbox"
                        checked={checked}
                        onChange={() => toggleOne(key)}
                      />
                      <span className="provider-model-import-dialog-row-body">
                        <span className="provider-model-import-dialog-row-id">{entry.modelId}</span>
                        <span className="provider-model-import-dialog-row-meta">
                          <span className="provider-model-import-dialog-kind-badge">
                            {KIND_LABELS[entry.kind]}
                          </span>
                          {entry.alreadyExists ? (
                            <span className="provider-model-import-dialog-existing-badge">
                              {COPY.alreadyAdded}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <footer className="provider-model-import-dialog-footer">
          <div className="provider-model-import-dialog-footer-left">
            <button
              type="button"
              onClick={allVisibleSelected ? clearVisible : selectAllVisible}
              disabled={visibleEntries.length === 0}
              className="provider-model-import-dialog-footer-chip-btn"
            >
              <Check className="provider-model-import-dialog-footer-chip-icon" strokeWidth={2} />
              {allVisibleSelected ? COPY.clearVisible : COPY.selectAllVisible(visibleEntries.length)}
            </button>
            <span className="provider-model-import-dialog-selected-count">
              {COPY.selectedCount(totalSelected)}
            </span>
          </div>
          <div className="provider-model-import-dialog-footer-actions">
            <button
              type="button"
              onClick={onClose}
              className="provider-model-import-dialog-btn provider-model-import-dialog-btn--secondary"
            >
              {COPY.cancel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={totalSelected === 0}
              className="provider-model-import-dialog-btn provider-model-import-dialog-btn--primary"
            >
              {COPY.confirm(totalSelected)}
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}

export const PROVIDER_MODEL_IMPORT_PREVIEW: ProviderModelImportEntry[] = [
  { modelId: 'gpt-4.1', kind: 'chat', alreadyExists: true },
  { modelId: 'gpt-4.1-mini', kind: 'chat', alreadyExists: false },
  { modelId: 'gpt-4.1-nano', kind: 'chat', alreadyExists: false },
  { modelId: 'o3-mini', kind: 'chat', alreadyExists: false },
  { modelId: 'dall-e-3', kind: 'image', alreadyExists: false },
  { modelId: 'gpt-image-1', kind: 'image', alreadyExists: true },
  { modelId: 'whisper-1', kind: 'speech', alreadyExists: false },
  { modelId: 'tts-1-hd', kind: 'tts', alreadyExists: false },
]

export const PROVIDER_MODEL_IMPORT_PREVIEW_EMPTY: ProviderModelImportEntry[] = []

export const PROVIDER_MODEL_IMPORT_PREVIEW_ALL_EXISTING: ProviderModelImportEntry[] = [
  { modelId: 'gpt-4.1', kind: 'chat', alreadyExists: true },
  { modelId: 'gpt-4.1-mini', kind: 'chat', alreadyExists: true },
  { modelId: 'dall-e-3', kind: 'image', alreadyExists: true },
]

export type ProviderModelImportDialogPreviewMode =
  | 'default'
  | 'empty'
  | 'allExisting'
  | 'chatOnly'

function previewEntries(mode: ProviderModelImportDialogPreviewMode): ProviderModelImportEntry[] {
  if (mode === 'empty') return PROVIDER_MODEL_IMPORT_PREVIEW_EMPTY
  if (mode === 'allExisting') return PROVIDER_MODEL_IMPORT_PREVIEW_ALL_EXISTING
  if (mode === 'chatOnly') {
    return PROVIDER_MODEL_IMPORT_PREVIEW.filter((entry) => entry.kind === 'chat')
  }
  return PROVIDER_MODEL_IMPORT_PREVIEW
}

function entriesToDialogProps(entries: ProviderModelImportEntry[]): {
  modelIds: string[]
  existing: ProviderModel[]
} {
  return {
    modelIds: entries.map((entry) => entry.modelId),
    existing: entries
      .filter((entry) => entry.alreadyExists)
      .map((entry) => ({ id: entry.modelId, vision: entry.kind === 'image' })),
  }
}

/** Full-screen preview shell for ?providerModelImportDialogPreview URL hooks. */
export function ProviderModelImportDialogPreview({
  mode = 'default',
}: {
  mode?: ProviderModelImportDialogPreviewMode
}): ReactElement {
  const entries = previewEntries(mode)
  const props = entriesToDialogProps(entries)

  return (
    <ProviderModelImportDialog
      providerName="OpenAI"
      modelIds={props.modelIds}
      existing={props.existing}
      onClose={() => undefined}
      onConfirm={() => undefined}
    />
  )
}
