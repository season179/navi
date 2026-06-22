// Memory settings section echoing Kun's settings-section-memory.tsx
// (../Kun/src/renderer/src/components/settings-section-memory.tsx).
// Visual only: mock memory snapshots and preview modes.

import { useMemo, useState, type ReactElement } from 'react'
import { Ban, BrainCircuit, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  MEMORY_SETTINGS_ACTIVE_COUNT_LABEL,
  MEMORY_SETTINGS_CANCEL_LABEL,
  MEMORY_SETTINGS_CONFIDENCE_LABEL,
  MEMORY_SETTINGS_CONTENT_PLACEHOLDER,
  MEMORY_SETTINGS_CREATE_LABEL,
  MEMORY_SETTINGS_CREATE_TITLE,
  MEMORY_SETTINGS_DELETE_LABEL,
  MEMORY_SETTINGS_DISABLE_LABEL,
  MEMORY_SETTINGS_DISABLED_HINT,
  MEMORY_SETTINGS_DISABLED_LABEL,
  MEMORY_SETTINGS_EDIT_LABEL,
  MEMORY_SETTINGS_EDIT_TITLE,
  MEMORY_SETTINGS_EMPTY_TEXT,
  MEMORY_SETTINGS_ENABLE_DESC,
  MEMORY_SETTINGS_ENABLE_LABEL,
  MEMORY_SETTINGS_ENABLED_LABEL,
  MEMORY_SETTINGS_LAST_INJECTED_DESC,
  MEMORY_SETTINGS_LAST_INJECTED_LABEL,
  MEMORY_SETTINGS_OFF_LABEL,
  MEMORY_SETTINGS_ON_LABEL,
  MEMORY_SETTINGS_OVERVIEW_DESC,
  MEMORY_SETTINGS_OVERVIEW_LABEL,
  MEMORY_SETTINGS_RECORDS_DESC,
  MEMORY_SETTINGS_RECORDS_LABEL,
  MEMORY_SETTINGS_SAVE_LABEL,
  MEMORY_SETTINGS_SCOPE_PROJECT,
  MEMORY_SETTINGS_SCOPE_USER,
  MEMORY_SETTINGS_SCOPE_WORKSPACE,
  MEMORY_SETTINGS_SECTION_TITLE,
  MEMORY_SETTINGS_TAGS_PLACEHOLDER,
  MEMORY_SETTINGS_TOMBSTONE_COUNT_LABEL,
  resolveMemorySettingsScopeLabel,
} from '../lib/memorySettingsSection'
import { SettingRow, SettingsCard, Toggle } from './SettingsControls'

export type MemoryScope = 'user' | 'workspace' | 'project'

export type MemoryRecordSnapshot = {
  id: string
  content: string
  scope: MemoryScope
  tags?: string[]
  confidence?: number
  disabledAt?: string | null
}

export type MemoryDiagnosticsSnapshot = {
  activeCount?: number
  tombstoneCount?: number
  enabled?: boolean
  lastInjectedIds?: string[]
}

type MemoryDraft = {
  content: string
  scope: MemoryScope
  tags: string
  confidence: number
}

const EMPTY_DRAFT: MemoryDraft = {
  content: '',
  scope: 'workspace',
  tags: '',
  confidence: 1,
}

export const MEMORY_PREVIEW_RECORDS: MemoryRecordSnapshot[] = [
  {
    id: 'mem-a1b2c3d4',
    content: 'Prefer TypeScript with 2-space indentation and explicit return types on exported functions.',
    scope: 'workspace',
    tags: ['style', 'typescript'],
    confidence: 0.95,
  },
  {
    id: 'mem-e5f6g7h8',
    content: 'Use Kun as the reference for UI/UX patterns when porting components to navi.',
    scope: 'project',
    tags: ['ui'],
    confidence: 1,
  },
  {
    id: 'mem-i9j0k1l2',
    content: 'Season goes by the nickname Season; warm, companion-like tone in assistant replies.',
    scope: 'user',
    confidence: 0.85,
  },
]

export const MEMORY_PREVIEW_DIAGNOSTICS: MemoryDiagnosticsSnapshot = {
  activeCount: 3,
  tombstoneCount: 1,
  enabled: true,
  lastInjectedIds: ['mem-a1b2c3d4', 'mem-e5f6g7h8'],
}

type Props = {
  memoryEnabled?: boolean
  onMemoryEnabledChange?: (enabled: boolean) => void
  records?: MemoryRecordSnapshot[]
  diagnostics?: MemoryDiagnosticsSnapshot | null
  initialScopeFilter?: 'all' | MemoryScope
  initialCreating?: boolean
  initialEditingId?: string | null
  initialDraft?: Partial<MemoryDraft>
}

export function MemorySettingsSection({
  memoryEnabled = true,
  onMemoryEnabledChange,
  records = MEMORY_PREVIEW_RECORDS,
  diagnostics = MEMORY_PREVIEW_DIAGNOSTICS,
  initialScopeFilter = 'all',
  initialCreating = false,
  initialEditingId = null,
  initialDraft,
}: Props): ReactElement {
  const [enabled, setEnabled] = useState(memoryEnabled)
  const [editingId, setEditingId] = useState<string | null>(initialEditingId)
  const [draft, setDraft] = useState<MemoryDraft>({
    ...EMPTY_DRAFT,
    ...initialDraft,
  })
  const [creating, setCreating] = useState(initialCreating)
  const [scopeFilter, setScopeFilter] = useState<'all' | MemoryScope>(initialScopeFilter)
  const [localRecords, setLocalRecords] = useState(records)

  const filteredRecords = useMemo(() => {
    if (scopeFilter === 'all') return localRecords
    return localRecords.filter((record) => record.scope === scopeFilter)
  }, [localRecords, scopeFilter])

  const beginCreate = (): void => {
    setEditingId(null)
    setDraft(EMPTY_DRAFT)
    setCreating(true)
  }

  const beginEdit = (record: MemoryRecordSnapshot): void => {
    setCreating(false)
    setEditingId(record.id)
    setDraft({
      content: record.content,
      scope: record.scope,
      tags: (record.tags ?? []).join(', '),
      confidence: record.confidence ?? 1,
    })
  }

  const cancelEditor = (): void => {
    setEditingId(null)
    setCreating(false)
    setDraft(EMPTY_DRAFT)
  }

  const saveDraft = (): void => {
    const trimmed = draft.content.trim()
    if (!trimmed) return
    if (creating) {
      setLocalRecords((current) => [
        {
          id: `mem-${Date.now().toString(36)}`,
          content: trimmed,
          scope: draft.scope,
          tags: draft.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          confidence: draft.confidence,
        },
        ...current,
      ])
    } else if (editingId) {
      setLocalRecords((current) =>
        current.map((record) =>
          record.id === editingId
            ? {
                ...record,
                content: trimmed,
                tags: draft.tags
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean),
                confidence: draft.confidence,
              }
            : record,
        ),
      )
    }
    cancelEditor()
  }

  const disableRecord = (id: string): void => {
    setLocalRecords((current) =>
      current.map((record) =>
        record.id === id
          ? { ...record, disabledAt: record.disabledAt ?? new Date().toISOString() }
          : record,
      ),
    )
  }

  const deleteRecord = (id: string): void => {
    setLocalRecords((current) => current.filter((record) => record.id !== id))
  }

  const handleEnabledChange = (checked: boolean): void => {
    setEnabled(checked)
    onMemoryEnabledChange?.(checked)
  }

  const memoryDisabled = diagnostics?.enabled === false || !enabled

  return (
    <SettingsCard title={MEMORY_SETTINGS_SECTION_TITLE}>
      <SettingRow
        title={MEMORY_SETTINGS_ENABLE_LABEL}
        description={MEMORY_SETTINGS_ENABLE_DESC}
        control={
          <Toggle checked={enabled} onChange={handleEnabledChange} />
        }
      />
      <SettingRow
        title={MEMORY_SETTINGS_OVERVIEW_LABEL}
        description={MEMORY_SETTINGS_OVERVIEW_DESC}
        wideControl
        control={
          <div className="memory-overview-grid">
            <div className="memory-stat-card">
              <div className="memory-stat-label">{MEMORY_SETTINGS_ACTIVE_COUNT_LABEL}</div>
              <div className="memory-stat-value">
                {diagnostics?.activeCount ?? localRecords.length}
              </div>
            </div>
            <div className="memory-stat-card">
              <div className="memory-stat-label">{MEMORY_SETTINGS_TOMBSTONE_COUNT_LABEL}</div>
              <div className="memory-stat-value">{diagnostics?.tombstoneCount ?? 0}</div>
            </div>
            <div className="memory-stat-card">
              <div className="memory-stat-label">{MEMORY_SETTINGS_ENABLED_LABEL}</div>
              <div className="memory-stat-value">
                {memoryDisabled ? MEMORY_SETTINGS_OFF_LABEL : MEMORY_SETTINGS_ON_LABEL}
              </div>
            </div>
          </div>
        }
      />

      <SettingRow
        title={MEMORY_SETTINGS_RECORDS_LABEL}
        description={MEMORY_SETTINGS_RECORDS_DESC}
        wideControl
        control={
          <div className="memory-records-panel">
            {memoryDisabled ? (
              <div className="memory-disabled-hint">{MEMORY_SETTINGS_DISABLED_HINT}</div>
            ) : null}

            <div className="memory-records-toolbar">
              <div className="memory-scope-filters">
                {(['all', 'user', 'workspace', 'project'] as const).map((scope) => (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => setScopeFilter(scope)}
                    className={
                      scopeFilter === scope
                        ? 'memory-scope-filter is-active'
                        : 'memory-scope-filter'
                    }
                  >
                    {resolveMemorySettingsScopeLabel(scope)}
                  </button>
                ))}
              </div>
              <button type="button" onClick={beginCreate} className="memory-create-btn">
                <Plus className="memory-create-icon" strokeWidth={2} />
                {MEMORY_SETTINGS_CREATE_LABEL}
              </button>
            </div>

            {(creating || editingId !== null) && (
              <div className="memory-editor">
                <div className="memory-editor-title">
                  <Pencil className="memory-editor-icon" strokeWidth={1.8} />
                  {creating ? MEMORY_SETTINGS_CREATE_TITLE : MEMORY_SETTINGS_EDIT_TITLE}
                </div>
                <textarea
                  value={draft.content}
                  onChange={(e) => setDraft((prev) => ({ ...prev, content: e.target.value }))}
                  rows={3}
                  placeholder={MEMORY_SETTINGS_CONTENT_PLACEHOLDER}
                  className="memory-editor-textarea"
                />
                <div className="memory-editor-fields">
                  {creating ? (
                    <select
                      value={draft.scope}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          scope: e.target.value as MemoryScope,
                        }))
                      }
                      className="memory-editor-select"
                    >
                      <option value="user">{MEMORY_SETTINGS_SCOPE_USER}</option>
                      <option value="workspace">{MEMORY_SETTINGS_SCOPE_WORKSPACE}</option>
                      <option value="project">{MEMORY_SETTINGS_SCOPE_PROJECT}</option>
                    </select>
                  ) : null}
                  <input
                    type="text"
                    value={draft.tags}
                    onChange={(e) => setDraft((prev) => ({ ...prev, tags: e.target.value }))}
                    placeholder={MEMORY_SETTINGS_TAGS_PLACEHOLDER}
                    className="memory-editor-tags"
                  />
                  <div className="memory-editor-confidence">
                    <span>{MEMORY_SETTINGS_CONFIDENCE_LABEL}</span>
                    <input
                      type="number"
                      min={0}
                      max={1}
                      step={0.1}
                      value={draft.confidence}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          confidence: Number(e.target.value) || 0,
                        }))
                      }
                      className="memory-editor-confidence-input"
                    />
                  </div>
                </div>
                <div className="memory-editor-actions">
                  <button type="button" onClick={cancelEditor} className="memory-editor-cancel">
                    {MEMORY_SETTINGS_CANCEL_LABEL}
                  </button>
                  <button
                    type="button"
                    onClick={saveDraft}
                    disabled={!draft.content.trim()}
                    className="memory-editor-save"
                  >
                    {MEMORY_SETTINGS_SAVE_LABEL}
                  </button>
                </div>
              </div>
            )}

            {filteredRecords.length === 0 && !creating && editingId === null ? (
              <div className="memory-empty">
                <BrainCircuit className="memory-empty-icon" strokeWidth={1.5} />
                <div className="memory-empty-text">{MEMORY_SETTINGS_EMPTY_TEXT}</div>
              </div>
            ) : (
              filteredRecords.map((memory) =>
                editingId === memory.id ? null : (
                  <div
                    key={memory.id}
                    className={
                      memory.disabledAt
                        ? 'memory-record is-disabled'
                        : 'memory-record'
                    }
                  >
                    <div className="memory-record-main">
                      <div className="memory-record-content">{memory.content}</div>
                      <div className="memory-record-meta">
                        <span className="memory-record-scope">{memory.scope}</span>
                        {memory.confidence !== undefined && memory.confidence !== 1 ? (
                          <span className="memory-record-confidence">
                            ★ {memory.confidence.toFixed(2)}
                          </span>
                        ) : null}
                        {memory.tags?.length ? (
                          <span>{memory.tags.join(' · ')}</span>
                        ) : null}
                        {memory.disabledAt ? (
                          <span className="memory-record-disabled-label">{MEMORY_SETTINGS_DISABLED_LABEL}</span>
                        ) : null}
                        <span className="memory-record-id">{memory.id.slice(0, 8)}</span>
                      </div>
                    </div>
                    <div className="memory-record-actions">
                      <button
                        type="button"
                        onClick={() => beginEdit(memory)}
                        className="memory-record-action"
                        aria-label={MEMORY_SETTINGS_EDIT_LABEL}
                        title={MEMORY_SETTINGS_EDIT_LABEL}
                      >
                        <Pencil className="memory-record-action-icon" strokeWidth={1.8} />
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(memory.disabledAt)}
                        onClick={() => disableRecord(memory.id)}
                        className="memory-record-action"
                        aria-label={MEMORY_SETTINGS_DISABLE_LABEL}
                        title={MEMORY_SETTINGS_DISABLE_LABEL}
                      >
                        <Ban className="memory-record-action-icon" strokeWidth={1.8} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRecord(memory.id)}
                        className="memory-record-action memory-record-action-delete"
                        aria-label={MEMORY_SETTINGS_DELETE_LABEL}
                        title={MEMORY_SETTINGS_DELETE_LABEL}
                      >
                        <Trash2 className="memory-record-action-icon" strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>
                ),
              )
            )}
          </div>
        }
      />

      {diagnostics?.lastInjectedIds?.length ? (
        <SettingRow
          title={MEMORY_SETTINGS_LAST_INJECTED_LABEL}
          description={MEMORY_SETTINGS_LAST_INJECTED_DESC}
          wideControl
          control={
            <div className="memory-injected-ids">
              {diagnostics.lastInjectedIds.map((id) => (
                <span key={id} className="memory-injected-id">
                  {id.slice(0, 12)}
                </span>
              ))}
            </div>
          }
        />
      ) : null}
    </SettingsCard>
  )
}

export type MemoryPreviewMode =
  | 'default'
  | 'empty'
  | 'disabled'
  | 'creating'
  | 'disabledRecord'
  | 'injected'

export function MemorySettingsSectionPreview({
  mode = 'default',
}: {
  mode?: MemoryPreviewMode
}): ReactElement {
  if (mode === 'empty') {
    return (
      <MemorySettingsSection
        records={[]}
        diagnostics={{ activeCount: 0, tombstoneCount: 0, enabled: true }}
      />
    )
  }

  if (mode === 'disabled') {
    return (
      <MemorySettingsSection
        memoryEnabled={false}
        records={MEMORY_PREVIEW_RECORDS}
        diagnostics={{ ...MEMORY_PREVIEW_DIAGNOSTICS, enabled: false }}
      />
    )
  }

  if (mode === 'creating') {
    return (
      <MemorySettingsSection
        initialCreating
        initialDraft={{
          content: 'Prefer explicit return types on exported functions.',
          tags: 'typescript, style',
          confidence: 0.9,
        }}
      />
    )
  }

  if (mode === 'disabledRecord') {
    return (
      <MemorySettingsSection
        records={MEMORY_PREVIEW_RECORDS.map((record, index) =>
          index === 0 ? { ...record, disabledAt: new Date().toISOString() } : record,
        )}
      />
    )
  }

  if (mode === 'injected') {
    return (
      <MemorySettingsSection
        diagnostics={{
          ...MEMORY_PREVIEW_DIAGNOSTICS,
          lastInjectedIds: ['mem-a1b2c3d4', 'mem-e5f6g7h8', 'mem-i9j0k1l2'],
        }}
      />
    )
  }

  return <MemorySettingsSection />
}
