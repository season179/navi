// Write debug log modal echoing Kun's settings-debug-log.tsx
// (../Kun/src/renderer/src/components/settings-debug-log.tsx).
// Visual only: mock completion snapshots and preview modes.

import { useState, type ReactElement } from 'react'
import { Loader2, RefreshCw, Trash2 } from 'lucide-react'

export type WriteInlineCompletionMode = 'completion' | 'selection-assist'

export type WriteInlineCompletionDebugEntry = {
  id: string
  createdAt: string
  durationMs: number
  ok: boolean
  model: string
  mode: WriteInlineCompletionMode
  currentFilePath?: string
  prompt: string
  suffix: string
  rawResponse: string
  completion: string
  errorMessage?: string
  referenceCount: number
  recentEditCount?: number
}

const COPY = {
  writeDebugLogTitle: 'Write debug log',
  writeDebugLogModalDesc:
    'Inspect the context sent for writing suggestions, raw model responses, and parsed output.',
  writeInlineEditDebugRefresh: 'Refresh',
  writeInlineEditDebugClear: 'Clear',
  close: 'Close',
  writeCompletionDebugEmpty:
    'No writing suggestion calls yet. Trigger inline completion and entries will appear here.',
  writeInlineEditDebugOk: 'OK',
  writeInlineEditDebugFailed: 'Failed',
  writeInlineEditDebugModel: 'Model',
  writeInlineEditDebugContext: 'Context',
  writeInlineEditDebugFile: 'File',
  writeInlineEditDebugPrompt: 'Content sent to the model',
  writeInlineEditDebugSuffix: 'Text after the cursor',
  writeCompletionDebugCompletion: 'Parsed output',
  writeInlineEditDebugRawResponse: 'Raw model response',
  writeCompletionDebugContextCounts: (references: number, edits: number): string =>
    `${references} RAG snippets / ${edits} recent edits`,
}

const MOCK_ENTRIES: WriteInlineCompletionDebugEntry[] = [
  {
    id: 'entry-1',
    createdAt: '2026-06-22T14:32:18.000Z',
    durationMs: 842,
    ok: true,
    model: 'deepseek-v4-pro',
    mode: 'completion',
    currentFilePath: '/Users/season/projects/blog/draft.md',
    prompt:
      'You are helping complete markdown prose.\n\n## Current paragraph\n\nThe morning light filtered through',
    suffix: ' the blinds and landed on the desk in soft stripes.',
    rawResponse: ' the blinds and landed on the desk in soft stripes.',
    completion: ' the blinds and landed on the desk in soft stripes.',
    referenceCount: 2,
    recentEditCount: 4,
  },
  {
    id: 'entry-2',
    createdAt: '2026-06-22T14:28:04.000Z',
    durationMs: 1264,
    ok: true,
    model: 'deepseek-v4-pro',
    mode: 'selection-assist',
    currentFilePath: '/Users/season/projects/blog/outline.md',
    prompt:
      'Rewrite the selected passage to be more concise while keeping the same meaning.\n\nSelection:\n\nIt is worth noting that the overall performance characteristics of the system were generally acceptable under most conditions.',
    suffix: '',
    rawResponse: 'Overall, the system performed acceptably in most conditions.',
    completion: 'Overall, the system performed acceptably in most conditions.',
    referenceCount: 0,
    recentEditCount: 1,
  },
  {
    id: 'entry-3',
    createdAt: '2026-06-22T14:21:51.000Z',
    durationMs: 318,
    ok: false,
    model: 'deepseek-v4-pro',
    mode: 'completion',
    currentFilePath: '/Users/season/projects/notes/todo.md',
    prompt: 'Complete the bullet list item:\n\n- Ship the write-mode toolbar polish',
    suffix: '',
    rawResponse: '',
    completion: '',
    errorMessage: 'Provider request failed: 429 Too Many Requests',
    referenceCount: 1,
    recentEditCount: 0,
  },
]

function formatWriteEditDebugTime(value: string): string {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : value
}

function translate(
  key: keyof typeof COPY,
  values?: Record<string, unknown>
): string {
  const value = COPY[key]
  if (typeof value === 'function') {
    return value(
      Number(values?.references ?? 0),
      Number(values?.edits ?? 0)
    )
  }
  return value
}

function WriteInlineEditDebugText({
  label,
  value,
}: {
  label: string
  value: string
}): ReactElement {
  return (
    <div className="write-debug-log-text-block">
      <div className="write-debug-log-text-label">{label}</div>
      <pre className="write-debug-log-text-pre">{value || '—'}</pre>
    </div>
  )
}

export function WriteDebugLogModal({
  completionEntries,
  completionSelectedId,
  loading,
  error,
  onSelectCompletion,
  onRefresh,
  onClear,
  onClose,
}: {
  completionEntries: WriteInlineCompletionDebugEntry[]
  completionSelectedId: string | null
  loading: boolean
  error: string | null
  onSelectCompletion: (id: string | null) => void
  onRefresh: () => void
  onClear: () => void
  onClose: () => void
}): ReactElement {
  const completionSelected =
    completionEntries.find((entry) => entry.id === completionSelectedId) ??
    completionEntries[0] ??
    null

  return (
    <div className="write-debug-log-overlay">
      <div className="write-debug-log-modal">
        <div className="write-debug-log-header">
          <div className="write-debug-log-header-copy">
            <h2 className="write-debug-log-title">{COPY.writeDebugLogTitle}</h2>
            <p className="write-debug-log-desc">{COPY.writeDebugLogModalDesc}</p>
          </div>
          <div className="write-debug-log-header-actions">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="write-debug-log-action-btn"
            >
              {loading ? (
                <Loader2 className="write-debug-log-action-icon is-spinning" strokeWidth={2} />
              ) : (
                <RefreshCw className="write-debug-log-action-icon" strokeWidth={1.75} />
              )}
              {COPY.writeInlineEditDebugRefresh}
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={loading || completionEntries.length === 0}
              className="write-debug-log-action-btn"
            >
              <Trash2 className="write-debug-log-action-icon" strokeWidth={1.75} />
              {COPY.writeInlineEditDebugClear}
            </button>
            <button type="button" onClick={onClose} className="write-debug-log-action-btn">
              {COPY.close}
            </button>
          </div>
        </div>

        {error ? <div className="write-debug-log-error-banner">{error}</div> : null}

        {completionEntries.length === 0 ? (
          <div className="write-debug-log-empty">{COPY.writeCompletionDebugEmpty}</div>
        ) : (
          <div className="write-debug-log-body">
            <div className="write-debug-log-list">
              {completionEntries.map((entry) => (
                <WriteDebugLogListButton
                  key={entry.id}
                  active={completionSelected?.id === entry.id}
                  ok={entry.ok}
                  title={`${entry.mode} · ${entry.completion || entry.errorMessage || entry.model}`}
                  subtitle={formatWriteEditDebugTime(entry.createdAt)}
                  durationMs={entry.durationMs}
                  onClick={() => onSelectCompletion(entry.id)}
                />
              ))}
            </div>
            <div className="write-debug-log-detail">
              {completionSelected ? (
                <WriteCompletionDebugDetail entry={completionSelected} />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function WriteDebugLogListButton({
  active,
  ok,
  title,
  subtitle,
  durationMs,
  onClick,
}: {
  active: boolean
  ok: boolean
  title: string
  subtitle: string
  durationMs: number
  onClick: () => void
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`write-debug-log-list-btn${active ? ' is-active' : ''}`}
    >
      <div className="write-debug-log-list-meta">
        <span className={`write-debug-log-status-pill${ok ? ' is-ok' : ' is-failed'}`}>
          {ok ? COPY.writeInlineEditDebugOk : COPY.writeInlineEditDebugFailed}
        </span>
        <span className="write-debug-log-duration">{durationMs}ms</span>
      </div>
      <div className="write-debug-log-list-title">{title}</div>
      <div className="write-debug-log-list-subtitle">{subtitle}</div>
    </button>
  )
}

function WriteCompletionDebugDetail({
  entry,
}: {
  entry: WriteInlineCompletionDebugEntry
}): ReactElement {
  return (
    <div className="write-debug-log-detail-stack">
      <WriteDebugMeta
        filePath={entry.currentFilePath}
        model={`${entry.model} · ${entry.mode}`}
        context={translate('writeCompletionDebugContextCounts', {
          references: entry.referenceCount,
          edits: entry.recentEditCount ?? 0,
        })}
        error={entry.errorMessage}
      />
      <WriteInlineEditDebugText label={COPY.writeInlineEditDebugPrompt} value={entry.prompt} />
      <WriteInlineEditDebugText label={COPY.writeInlineEditDebugSuffix} value={entry.suffix} />
      <WriteInlineEditDebugText
        label={COPY.writeCompletionDebugCompletion}
        value={entry.completion}
      />
      <WriteInlineEditDebugText
        label={COPY.writeInlineEditDebugRawResponse}
        value={entry.rawResponse}
      />
    </div>
  )
}

function WriteDebugMeta({
  filePath,
  model,
  context,
  error,
}: {
  filePath?: string
  model: string
  context: string
  error?: string
}): ReactElement {
  return (
    <div className="write-debug-log-meta-grid">
      <div className="write-debug-log-meta-card">
        <span className="write-debug-log-meta-label">{COPY.writeInlineEditDebugModel}</span>
        <span className="write-debug-log-meta-value">{model}</span>
      </div>
      <div className="write-debug-log-meta-card">
        <span className="write-debug-log-meta-label">{COPY.writeInlineEditDebugContext}</span>
        <span className="write-debug-log-meta-value">{context}</span>
      </div>
      <div className="write-debug-log-meta-card is-wide">
        <span className="write-debug-log-meta-label">{COPY.writeInlineEditDebugFile}</span>
        <span className="write-debug-log-meta-value is-mono">{filePath || '—'}</span>
      </div>
      {error ? <div className="write-debug-log-meta-error is-wide">{error}</div> : null}
    </div>
  )
}

export type WriteDebugLogModalPreviewMode =
  | 'default'
  | 'empty'
  | 'error'
  | 'loading'
  | 'failed'

function previewSnapshot(mode: WriteDebugLogModalPreviewMode): {
  entries: WriteInlineCompletionDebugEntry[]
  selectedId: string | null
  loading: boolean
  error: string | null
} {
  if (mode === 'empty') {
    return { entries: [], selectedId: null, loading: false, error: null }
  }
  if (mode === 'error') {
    return {
      entries: MOCK_ENTRIES,
      selectedId: 'entry-1',
      loading: false,
      error: 'Failed to load debug entries: runtime unavailable.',
    }
  }
  if (mode === 'loading') {
    return { entries: MOCK_ENTRIES, selectedId: 'entry-1', loading: true, error: null }
  }
  if (mode === 'failed') {
    return { entries: MOCK_ENTRIES, selectedId: 'entry-3', loading: false, error: null }
  }
  return { entries: MOCK_ENTRIES, selectedId: 'entry-1', loading: false, error: null }
}

/** Full-screen preview shell for ?writeDebugLogPreview URL hooks. */
export function WriteDebugLogModalPreview({
  mode = 'default',
}: {
  mode?: WriteDebugLogModalPreviewMode
}): ReactElement {
  const snapshot = previewSnapshot(mode)
  const [entries, setEntries] = useState(snapshot.entries)
  const [selectedId, setSelectedId] = useState(snapshot.selectedId)
  const [loading, setLoading] = useState(snapshot.loading)
  const [error, setError] = useState(snapshot.error)

  return (
    <WriteDebugLogModal
      completionEntries={entries}
      completionSelectedId={selectedId}
      loading={loading}
      error={error}
      onSelectCompletion={setSelectedId}
      onRefresh={() => {
        setLoading(true)
        window.setTimeout(() => setLoading(false), 900)
      }}
      onClear={() => {
        setEntries([])
        setSelectedId(null)
      }}
      onClose={() => {
        window.history.replaceState({}, '', window.location.pathname)
      }}
    />
  )
}
