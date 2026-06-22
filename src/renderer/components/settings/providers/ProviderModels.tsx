// Per-provider model list editor inside the provider detail pane. Visual styling
// matches Kun's ProviderModelsManager (settings-section-provider-models.tsx);
// navi keeps a simpler ProviderModel[] API for live provider management.

import { useMemo, useState, type ReactElement, type ReactNode } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import type { ProviderModel } from '../../../../shared/flue'
import { Toggle } from '../SettingsControls'

const MODEL_LIST_PAGE_SIZE = 8

interface ProviderModelsProps {
  models: ProviderModel[]
  /** Catalog ids hide context/maxTokens fields (the catalog owns those values). */
  catalog: boolean
  onChange: (models: ProviderModel[]) => void
}

const COPY = {
  listDesc: 'Models available from this provider. Add ids manually or fetch the provider list.',
  empty: 'No models configured yet.',
  searchPlaceholder: 'Search models…',
  searchEmpty: (query: string) => `No models match “${query}”.`,
  addModel: 'Add model',
  addTitle: 'Add model',
  idLabel: 'Model ID',
  idPlaceholder: 'e.g. glm-5.2',
  idHint: 'Use the provider’s exact model identifier.',
  visionLabel: 'Vision input',
  visionDesc: 'Accepts image attachments in chat.',
  save: 'Save model',
  cancel: 'Cancel',
  deleteAction: (model: string) => `Remove ${model}`,
  editAction: (model: string) => `Edit ${model}`,
  contextBadge: (size: string) => `${size} context`,
  visionBadge: 'Vision',
  chatKind: 'Chat',
  pageCount: (visible: number, total: number) => `${visible} of ${total} models`,
  pageIndicator: (page: number, total: number) => `${page} / ${total}`,
  pagePrev: 'Previous page',
  pageNext: 'Next page',
}

function formatContextWindow(tokens?: number): string | null {
  if (!tokens || tokens <= 0) return null
  if (tokens >= 1_000_000) return `${Math.round(tokens / 1_000_000)}M`
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`
  return String(tokens)
}

function ModelBadge({
  tone = 'muted',
  icon,
  children,
}: {
  tone?: 'muted' | 'warning' | 'faint'
  icon?: ReactNode
  children: ReactNode
}): ReactElement {
  const toneClass =
    tone === 'warning'
      ? 'provider-models-manager-badge is-warning'
      : tone === 'faint'
        ? 'provider-models-manager-badge is-faint'
        : 'provider-models-manager-badge'
  return (
    <span className={toneClass}>
      {icon}
      {children}
    </span>
  )
}

function ModelName({ modelId }: { modelId: string }): ReactElement {
  return (
    <span className="provider-models-manager-name" title={modelId}>
      <span className="provider-models-manager-name-text">{modelId}</span>
      <span aria-hidden="true" className="provider-models-manager-name-tooltip">
        {modelId}
      </span>
    </span>
  )
}

export function ProviderModels({ models, catalog, onChange }: ProviderModelsProps) {
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingOriginalId, setEditingOriginalId] = useState<string | null>(null)
  const [draftId, setDraftId] = useState('')
  const [draftVision, setDraftVision] = useState(false)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)

  const showListTools = models.length > MODEL_LIST_PAGE_SIZE
  const normalizedQuery = query.trim().toLowerCase()
  const filteredModels = useMemo(() => {
    if (!showListTools || !normalizedQuery) return models
    return models.filter((model) => {
      const label = (model.label ?? model.id).toLowerCase()
      return label.includes(normalizedQuery) || model.id.toLowerCase().includes(normalizedQuery)
    })
  }, [models, normalizedQuery, showListTools])

  const pageCount = Math.max(1, Math.ceil(filteredModels.length / MODEL_LIST_PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const visibleModels = showListTools
    ? filteredModels.slice(
        safePage * MODEL_LIST_PAGE_SIZE,
        safePage * MODEL_LIST_PAGE_SIZE + MODEL_LIST_PAGE_SIZE,
      )
    : filteredModels

  const removeModel = (targetId: string): void => {
    onChange(models.filter((model) => model.id !== targetId))
  }

  const openAddEditor = (): void => {
    setEditingOriginalId(null)
    setDraftId('')
    setDraftVision(false)
    setEditorOpen(true)
  }

  const openEditEditor = (model: ProviderModel): void => {
    setEditingOriginalId(model.id)
    setDraftId(model.id)
    setDraftVision(Boolean(model.vision))
    setEditorOpen(true)
  }

  const closeEditor = (): void => {
    setEditorOpen(false)
    setEditingOriginalId(null)
    setDraftId('')
    setDraftVision(false)
  }

  const saveModel = (): void => {
    const trimmed = draftId.trim()
    if (!trimmed) return
    const duplicate = models.some(
      (model) => model.id === trimmed && model.id !== editingOriginalId,
    )
    if (duplicate) return

    if (editingOriginalId) {
      onChange(
        models.map((model) =>
          model.id === editingOriginalId
            ? {
                ...model,
                id: trimmed,
                ...(draftVision ? { vision: true } : { vision: undefined }),
              }
            : model,
        ),
      )
    } else {
      onChange([...models, { id: trimmed, ...(draftVision ? { vision: true } : {}) }])
    }
    closeEditor()
  }

  const saveDisabled =
    !draftId.trim() ||
    models.some((model) => model.id === draftId.trim() && model.id !== editingOriginalId)

  return (
    <div className="provider-models-manager">
      <p className="provider-models-manager-desc">{COPY.listDesc}</p>
      {models.length === 0 && !editorOpen ? (
        <p className="provider-models-manager-empty">{COPY.empty}</p>
      ) : (
        <>
          {showListTools ? (
            <div className="provider-models-manager-search-wrap">
              <Search className="provider-models-manager-search-icon" strokeWidth={1.9} />
              <input
                className="provider-models-manager-search"
                value={query}
                placeholder={COPY.searchPlaceholder}
                aria-label={COPY.searchPlaceholder}
                spellCheck={false}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(0)
                }}
              />
            </div>
          ) : null}
          {filteredModels.length === 0 ? (
            <p className="provider-models-manager-empty">{COPY.searchEmpty(query.trim())}</p>
          ) : (
            <ul className="provider-models-manager-list">
              {visibleModels.map((model) => {
                const displayId = model.label ?? model.id
                const contextLabel =
                  !catalog && model.contextWindow
                    ? formatContextWindow(model.contextWindow)
                    : null
                return (
                  <li key={model.id} className="provider-models-manager-row">
                    <span className="provider-models-manager-row-body">
                      <ModelName modelId={displayId} />
                      <span className="provider-models-manager-row-badges">
                        <ModelBadge tone="faint">{COPY.chatKind}</ModelBadge>
                        {contextLabel ? (
                          <ModelBadge>{COPY.contextBadge(contextLabel)}</ModelBadge>
                        ) : null}
                        {model.vision ? (
                          <ModelBadge
                            icon={
                              <Eye className="provider-models-manager-badge-icon" strokeWidth={1.9} />
                            }
                          >
                            {COPY.visionBadge}
                          </ModelBadge>
                        ) : null}
                      </span>
                    </span>
                    <span className="provider-models-manager-row-actions">
                      <button
                        type="button"
                        aria-label={COPY.editAction(displayId)}
                        className="provider-models-manager-row-action"
                        onClick={() => openEditEditor(model)}
                      >
                        <Pencil className="provider-models-manager-row-action-icon" strokeWidth={1.9} />
                      </button>
                      <button
                        type="button"
                        aria-label={COPY.deleteAction(displayId)}
                        className="provider-models-manager-row-action is-danger"
                        onClick={() => removeModel(model.id)}
                      >
                        <Trash2 className="provider-models-manager-row-action-icon" strokeWidth={1.9} />
                      </button>
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
          {showListTools && filteredModels.length > MODEL_LIST_PAGE_SIZE ? (
            <div className="provider-models-manager-pagination">
              <span className="provider-models-manager-pagination-count">
                {COPY.pageCount(visibleModels.length, filteredModels.length)}
              </span>
              <div className="provider-models-manager-pagination-controls">
                <button
                  type="button"
                  disabled={safePage === 0}
                  aria-label={COPY.pagePrev}
                  onClick={() => setPage(Math.max(0, safePage - 1))}
                  className="provider-models-manager-page-btn"
                >
                  <ChevronLeft className="provider-models-manager-page-btn-icon" strokeWidth={1.9} />
                </button>
                <span className="provider-models-manager-page-indicator">
                  {COPY.pageIndicator(safePage + 1, pageCount)}
                </span>
                <button
                  type="button"
                  disabled={safePage >= pageCount - 1}
                  aria-label={COPY.pageNext}
                  onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))}
                  className="provider-models-manager-page-btn"
                >
                  <ChevronRight className="provider-models-manager-page-btn-icon" strokeWidth={1.9} />
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}

      {editorOpen ? (
        <div className="provider-models-manager-editor">
          <div className="provider-models-manager-editor-title">
            {editingOriginalId ? COPY.editAction(editingOriginalId) : COPY.addTitle}
          </div>
          <label className="provider-models-manager-field">
            <span className="provider-models-manager-field-label">{COPY.idLabel}</span>
            <input
              className="provider-models-manager-text-input is-mono"
              value={draftId}
              placeholder={COPY.idPlaceholder}
              spellCheck={false}
              autoFocus
              onChange={(event) => setDraftId(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') saveModel()
              }}
            />
            <span className="provider-models-manager-field-hint">{COPY.idHint}</span>
          </label>
          <div className="provider-models-manager-toggle-grid">
            <div className="provider-models-manager-toggle-field">
              <div className="provider-models-manager-toggle-field-copy">
                <span className="provider-models-manager-toggle-field-label">
                  {COPY.visionLabel}
                </span>
                <span className="provider-models-manager-toggle-field-desc">{COPY.visionDesc}</span>
              </div>
              <Toggle checked={draftVision} onChange={setDraftVision} />
            </div>
          </div>
          <div className="provider-models-manager-editor-actions">
            <button
              type="button"
              className="provider-models-manager-save-btn"
              disabled={saveDisabled}
              onClick={saveModel}
            >
              {COPY.save}
            </button>
            <button
              type="button"
              className="provider-models-manager-cancel-btn"
              onClick={closeEditor}
            >
              {COPY.cancel}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="provider-models-manager-add-btn" onClick={openAddEditor}>
          <Plus className="provider-models-manager-add-btn-icon" strokeWidth={2} />
          {COPY.addModel}
        </button>
      )}
    </div>
  )
}
