// Kun settings-section-provider-models.tsx visual port
// (../Kun/src/renderer/src/components/settings-section-provider-models.tsx).
// Visual only: mock snapshots and preview URL hooks.

import { useEffect, useMemo, useState, type ReactElement, type ReactNode } from 'react'
import {
  AudioLines,
  Brain,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Eye,
  Image as ImageIcon,
  MessageSquareText,
  Mic,
  Music2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { SETTINGS_SELECT_CLASS, Toggle } from '../SettingsControls'

export type ProviderModelKind = 'chat' | 'image' | 'speech' | 'tts' | 'music' | 'video'

export type ProviderModelEntrySnapshot = {
  kind: ProviderModelKind
  modelId: string
  contextWindow?: string
  vision?: boolean
  reasoning?: boolean
  noTools?: boolean
  defaultProfile?: boolean
}

export type ProviderModelsEditorSnapshot = {
  mode: 'add' | 'edit'
  kind: ProviderModelKind
  modelId: string
  originalModelId?: string
  contextText?: string
  visionInput?: boolean
  supportsToolCalling?: boolean
  reasoningEnabled?: boolean
  reasoningEfforts?: string[]
  reasoningDefaultEffort?: string
  reasoningProtocol?: string
  endpointFormat?: string
  aliasesText?: string
  showNonTextWarning?: boolean
}

export type ProviderModelsManagerSnapshot = {
  models: ProviderModelEntrySnapshot[]
  providerEndpointFormat?: string
  initialEditor?: ProviderModelsEditorSnapshot | null
  initialQuery?: string
  initialPage?: number
  initialSelected?: string[]
}

const MODEL_LIST_PAGE_SIZE = 8

const KIND_LABELS: Record<ProviderModelKind, string> = {
  chat: 'Chat',
  image: 'Image',
  speech: 'Speech',
  tts: 'TTS',
  music: 'Music',
  video: 'Video',
}

const MODEL_KIND_META: Array<{
  kind: ProviderModelKind
  icon: typeof MessageSquareText
  title: string
  desc: string
}> = [
  { kind: 'chat', icon: MessageSquareText, title: 'Chat', desc: 'Text and multimodal chat models' },
  { kind: 'image', icon: ImageIcon, title: 'Image', desc: 'Image generation models' },
  { kind: 'speech', icon: Mic, title: 'Speech', desc: 'Speech-to-text models' },
  { kind: 'tts', icon: AudioLines, title: 'TTS', desc: 'Text-to-speech models' },
  { kind: 'music', icon: Music2, title: 'Music', desc: 'Music generation models' },
  { kind: 'video', icon: Clapperboard, title: 'Video', desc: 'Video generation models' },
]

const CONTEXT_PRESETS = ['8K', '32K', '128K', '200K', '1M']

const REASONING_EFFORTS = ['auto', 'off', 'low', 'medium', 'high', 'max']

const REASONING_EFFORT_LABELS: Record<string, string> = {
  auto: 'Auto',
  off: 'Off',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  max: 'Max',
}

const REASONING_PROTOCOLS = [
  { value: 'deepseek-chat-completions', label: 'DeepSeek chat completions' },
  { value: 'glm-chat-completions', label: 'GLM chat completions' },
  { value: 'mimo-chat-completions', label: 'MiMo chat completions' },
  { value: 'openai-responses', label: 'OpenAI Responses API' },
  { value: 'anthropic-thinking', label: 'Anthropic extended thinking' },
  { value: 'none', label: 'None' },
]

const ENDPOINT_FORMATS = [
  { value: 'chat_completions', label: 'Chat completions (/v1/chat/completions)' },
  { value: 'responses', label: 'Responses API (/v1/responses)' },
  { value: 'messages', label: 'Messages API (/v1/messages)' },
  { value: 'custom_endpoint', label: 'Custom endpoint' },
]

const COPY = {
  listDesc: 'Models available for chat and capability routing.',
  empty: 'No models yet. Add one manually or fetch from the API.',
  searchPlaceholder: 'Search model ids…',
  searchEmpty: (query: string) => `No models match "${query}".`,
  batchSelectVisible: (count: number) => `Select all visible · ${count}`,
  batchClearVisible: 'Clear visible selection',
  batchSelectedCount: (count: number) => `${count} selected`,
  batchDelete: (count: number) => `Delete ${count}`,
  pageCount: (shown: number, total: number) => `${shown} of ${total} models`,
  pageIndicator: (page: number, total: number) => `${page} / ${total}`,
  pagePrev: 'Previous page',
  pageNext: 'Next page',
  add: 'Add model',
  addTitle: 'Add model',
  editTitle: (model: string) => `Edit ${model}`,
  kindLabel: 'Model kind',
  idLabel: 'Model ID',
  idPlaceholder: 'e.g. gpt-4.1',
  idHint: 'Use the provider’s exact model identifier.',
  nonTextWarning: 'This model id looks like a non-text model. Double-check the kind.',
  contextLabel: 'Context window',
  contextPlaceholder: '128K',
  contextParsed: (tokens: string) => `${tokens} tokens`,
  contextHint: 'Optional. Used for context capacity estimates.',
  visionLabel: 'Vision input',
  visionDesc: 'Accepts image attachments in chat.',
  toolsLabel: 'Tool calling',
  toolsDesc: 'Supports function / tool use in chat.',
  reasoningLabel: 'Reasoning',
  reasoningDesc: 'Model supports extended reasoning modes.',
  reasoningEfforts: 'Available effort levels',
  reasoningDefault: 'Default effort',
  reasoningProtocol: 'Reasoning protocol',
  reasoningProtocolHint: 'How reasoning requests are sent to the provider.',
  endpointFormatLabel: 'Endpoint format override',
  endpointInherit: (format: string) => `Inherit from provider (${format})`,
  endpointFormatHint: 'Override the provider default for this model only.',
  aliasesLabel: 'Aliases',
  aliasesPlaceholder: 'alias-one, alias-two',
  aliasesHint: 'Optional alternate ids, comma or space separated.',
  save: 'Save model',
  cancel: 'Cancel',
  editAction: (model: string) => `Edit ${model}`,
  deleteAction: (model: string) => `Delete ${model}`,
  batchToggleRow: (model: string) => `Select ${model}`,
  contextBadge: (size: string) => `${size} context`,
  visionBadge: 'Vision',
  reasoningBadge: 'Reasoning',
  noToolsBadge: 'No tools',
  defaultProfileBadge: 'Default profile',
}

function entryKey(kind: ProviderModelKind, modelId: string): string {
  return `${kind}:${modelId.trim().toLowerCase()}`
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

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}): ReactElement {
  return (
    <div className="provider-models-manager-toggle-field">
      <div className="provider-models-manager-toggle-field-copy">
        <span className="provider-models-manager-toggle-field-label">{label}</span>
        <span className="provider-models-manager-toggle-field-desc">{description}</span>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

type Props = {
  snapshot: ProviderModelsManagerSnapshot
}

export function ProviderModelsManager({ snapshot }: Props): ReactElement {
  const [editor, setEditor] = useState<ProviderModelsEditorSnapshot | null>(
    snapshot.initialEditor ?? null,
  )
  const [query, setQuery] = useState(snapshot.initialQuery ?? '')
  const [page, setPage] = useState(snapshot.initialPage ?? 0)
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(snapshot.initialSelected ?? []),
  )

  useEffect(() => {
    setSelected(new Set(snapshot.initialSelected ?? []))
    setQuery(snapshot.initialQuery ?? '')
    setPage(snapshot.initialPage ?? 0)
    setEditor(snapshot.initialEditor ?? null)
  }, [snapshot])

  const modelEntries = snapshot.models
  const showListTools = modelEntries.length > MODEL_LIST_PAGE_SIZE
  const normalizedQuery = query.trim().toLowerCase()
  const filteredEntries =
    showListTools && normalizedQuery
      ? modelEntries.filter(({ modelId }) => modelId.toLowerCase().includes(normalizedQuery))
      : modelEntries
  const pageCount = Math.max(1, Math.ceil(filteredEntries.length / MODEL_LIST_PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const visibleEntries = showListTools
    ? filteredEntries.slice(
        safePage * MODEL_LIST_PAGE_SIZE,
        safePage * MODEL_LIST_PAGE_SIZE + MODEL_LIST_PAGE_SIZE,
      )
    : filteredEntries
  const allVisibleSelected =
    visibleEntries.length > 0 &&
    visibleEntries.every(({ kind, modelId }) => selected.has(entryKey(kind, modelId)))
  const editingKey =
    editor?.mode === 'edit' && editor.originalModelId
      ? entryKey(editor.kind, editor.originalModelId)
      : ''

  const selectVisible = (): void => {
    setSelected((prev) => {
      const next = new Set(prev)
      for (const { kind, modelId } of visibleEntries) next.add(entryKey(kind, modelId))
      return next
    })
  }

  const clearVisible = (): void => {
    setSelected((prev) => {
      const next = new Set(prev)
      for (const { kind, modelId } of visibleEntries) next.delete(entryKey(kind, modelId))
      return next
    })
  }

  const toggleSelected = (kind: ProviderModelKind, modelId: string): void => {
    const key = entryKey(kind, modelId)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const openAddEditor = (): void => {
    setEditor({
      mode: 'add',
      kind: 'chat',
      modelId: '',
      contextText: '',
      visionInput: false,
      supportsToolCalling: true,
      reasoningEnabled: false,
      reasoningEfforts: ['medium', 'high'],
      reasoningDefaultEffort: 'medium',
      reasoningProtocol: 'openai-responses',
      endpointFormat: '',
      aliasesText: '',
    })
  }

  const openEditEditor = (entry: ProviderModelEntrySnapshot): void => {
    setEditor({
      mode: 'edit',
      kind: entry.kind,
      modelId: entry.modelId,
      originalModelId: entry.modelId,
      contextText: entry.contextWindow ?? '',
      visionInput: Boolean(entry.vision),
      supportsToolCalling: !entry.noTools,
      reasoningEnabled: Boolean(entry.reasoning),
      reasoningEfforts: entry.reasoning ? ['medium', 'high'] : [],
      reasoningDefaultEffort: 'medium',
      reasoningProtocol: 'openai-responses',
      endpointFormat: '',
      aliasesText: '',
    })
  }

  const parsedContextTokens = editor?.contextText?.trim() || null

  return (
    <div className="provider-models-manager">
      <p className="provider-models-manager-desc">{COPY.listDesc}</p>
      {modelEntries.length === 0 ? (
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
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(0)
                }}
              />
            </div>
          ) : null}
          {showListTools && visibleEntries.length > 0 ? (
            <div className="provider-models-manager-batch-bar">
              <div className="provider-models-manager-batch-left">
                <button
                  type="button"
                  onClick={allVisibleSelected ? clearVisible : selectVisible}
                  className="provider-models-manager-batch-btn"
                >
                  {allVisibleSelected
                    ? COPY.batchClearVisible
                    : COPY.batchSelectVisible(visibleEntries.length)}
                </button>
                {selected.size > 0 ? (
                  <span className="provider-models-manager-batch-count">
                    {COPY.batchSelectedCount(selected.size)}
                  </span>
                ) : null}
              </div>
              {selected.size > 0 ? (
                <button type="button" className="provider-models-manager-batch-delete">
                  <Trash2 className="provider-models-manager-batch-delete-icon" strokeWidth={2} />
                  {COPY.batchDelete(selected.size)}
                </button>
              ) : null}
            </div>
          ) : null}
          {filteredEntries.length === 0 ? (
            <p className="provider-models-manager-empty">{COPY.searchEmpty(query.trim())}</p>
          ) : (
            <ul className="provider-models-manager-list">
              {visibleEntries.map((entry) => {
                const active = editingKey === entryKey(entry.kind, entry.modelId)
                const isSelected = selected.has(entryKey(entry.kind, entry.modelId))
                return (
                  <li
                    key={entryKey(entry.kind, entry.modelId)}
                    className={`provider-models-manager-row${active ? ' is-active' : ''}${isSelected ? ' is-selected' : ''}`}
                  >
                    {showListTools ? (
                      <input
                        type="checkbox"
                        className="provider-models-manager-row-checkbox"
                        aria-label={COPY.batchToggleRow(entry.modelId)}
                        checked={isSelected}
                        onChange={() => toggleSelected(entry.kind, entry.modelId)}
                      />
                    ) : null}
                    <span className="provider-models-manager-row-body">
                      <ModelName modelId={entry.modelId} />
                      <span className="provider-models-manager-row-badges">
                        <ModelBadge tone={entry.kind === 'chat' ? 'faint' : 'muted'}>
                          {KIND_LABELS[entry.kind]}
                        </ModelBadge>
                        {entry.kind === 'chat' ? (
                          <>
                            {entry.contextWindow ? (
                              <ModelBadge>{COPY.contextBadge(entry.contextWindow)}</ModelBadge>
                            ) : null}
                            {entry.vision ? (
                              <ModelBadge
                                icon={<Eye className="provider-models-manager-badge-icon" strokeWidth={1.9} />}
                              >
                                {COPY.visionBadge}
                              </ModelBadge>
                            ) : null}
                            {entry.reasoning ? (
                              <ModelBadge
                                icon={<Brain className="provider-models-manager-badge-icon" strokeWidth={1.9} />}
                              >
                                {COPY.reasoningBadge}
                              </ModelBadge>
                            ) : null}
                            {entry.noTools ? (
                              <ModelBadge tone="warning">{COPY.noToolsBadge}</ModelBadge>
                            ) : null}
                            {entry.defaultProfile ? (
                              <ModelBadge tone="faint">{COPY.defaultProfileBadge}</ModelBadge>
                            ) : null}
                          </>
                        ) : null}
                      </span>
                    </span>
                    <span className="provider-models-manager-row-actions">
                      <button
                        type="button"
                        aria-label={COPY.editAction(entry.modelId)}
                        onClick={() => openEditEditor(entry)}
                        className="provider-models-manager-row-action"
                      >
                        <Pencil className="provider-models-manager-row-action-icon" strokeWidth={1.9} />
                      </button>
                      <button
                        type="button"
                        aria-label={COPY.deleteAction(entry.modelId)}
                        className="provider-models-manager-row-action is-danger"
                      >
                        <Trash2 className="provider-models-manager-row-action-icon" strokeWidth={1.9} />
                      </button>
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
          {showListTools && filteredEntries.length > MODEL_LIST_PAGE_SIZE ? (
            <div className="provider-models-manager-pagination">
              <span className="provider-models-manager-pagination-count">
                {COPY.pageCount(visibleEntries.length, filteredEntries.length)}
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
      {editor === null ? (
        <button type="button" onClick={openAddEditor} className="provider-models-manager-add-btn">
          <Plus className="provider-models-manager-add-btn-icon" strokeWidth={1.9} />
          {COPY.add}
        </button>
      ) : (
        <div className="provider-models-manager-editor">
          <h4 className="provider-models-manager-editor-title">
            {editor.mode === 'add'
              ? COPY.addTitle
              : COPY.editTitle(editor.originalModelId ?? editor.modelId)}
          </h4>
          {editor.mode === 'add' ? (
            <div className="provider-models-manager-kind-grid-wrap">
              <span className="provider-models-manager-field-label">{COPY.kindLabel}</span>
              <div className="provider-models-manager-kind-grid">
                {MODEL_KIND_META.map(({ kind, icon: Icon, title, desc }) => {
                  const selected = editor.kind === kind
                  return (
                    <button
                      key={kind}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setEditor({ ...editor, kind })}
                      className={`provider-models-manager-kind-card${selected ? ' is-selected' : ''}`}
                    >
                      <span className="provider-models-manager-kind-card-title">
                        <Icon className="provider-models-manager-kind-card-icon" strokeWidth={1.9} />
                        {title}
                      </span>
                      <span className="provider-models-manager-kind-card-desc">{desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
          <label className="provider-models-manager-field">
            {COPY.idLabel}
            <input
              className="provider-models-manager-text-input is-mono"
              value={editor.modelId}
              placeholder={COPY.idPlaceholder}
              spellCheck={false}
              autoFocus
              onChange={(e) => setEditor({ ...editor, modelId: e.target.value })}
            />
            <span className="provider-models-manager-field-hint">{COPY.idHint}</span>
            {editor.showNonTextWarning ? (
              <span className="provider-models-manager-field-warning">{COPY.nonTextWarning}</span>
            ) : null}
          </label>
          {editor.kind === 'chat' ? (
            <>
              <div className="provider-models-manager-context-wrap">
                <span className="provider-models-manager-field-label">{COPY.contextLabel}</span>
                <div className="provider-models-manager-context-chips">
                  {CONTEXT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEditor({ ...editor, contextText: preset })}
                      className={`provider-models-manager-chip${parsedContextTokens === preset ? ' is-active' : ''}`}
                    >
                      {preset}
                    </button>
                  ))}
                  <input
                    className="provider-models-manager-context-input"
                    value={editor.contextText ?? ''}
                    placeholder={COPY.contextPlaceholder}
                    spellCheck={false}
                    onChange={(e) => setEditor({ ...editor, contextText: e.target.value })}
                  />
                  {parsedContextTokens ? (
                    <span className="provider-models-manager-context-parsed">
                      {COPY.contextParsed(parsedContextTokens)}
                    </span>
                  ) : null}
                </div>
                <span className="provider-models-manager-field-hint">{COPY.contextHint}</span>
              </div>
              <div className="provider-models-manager-toggle-grid">
                <ToggleField
                  label={COPY.visionLabel}
                  description={COPY.visionDesc}
                  checked={Boolean(editor.visionInput)}
                  onChange={(value) => setEditor({ ...editor, visionInput: value })}
                />
                <ToggleField
                  label={COPY.toolsLabel}
                  description={COPY.toolsDesc}
                  checked={Boolean(editor.supportsToolCalling)}
                  onChange={(value) => setEditor({ ...editor, supportsToolCalling: value })}
                />
              </div>
              <div className="provider-models-manager-reasoning-wrap">
                <ToggleField
                  label={COPY.reasoningLabel}
                  description={COPY.reasoningDesc}
                  checked={Boolean(editor.reasoningEnabled)}
                  onChange={(value) => setEditor({ ...editor, reasoningEnabled: value })}
                />
                {editor.reasoningEnabled ? (
                  <div className="provider-models-manager-reasoning-panel">
                    <div className="provider-models-manager-reasoning-efforts">
                      <span className="provider-models-manager-field-label">{COPY.reasoningEfforts}</span>
                      <div className="provider-models-manager-context-chips">
                        {REASONING_EFFORTS.map((effort) => {
                          const selected = editor.reasoningEfforts?.includes(effort) ?? false
                          return (
                            <button
                              key={effort}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => {
                                const efforts = editor.reasoningEfforts ?? []
                                setEditor({
                                  ...editor,
                                  reasoningEfforts: selected
                                    ? efforts.filter((item) => item !== effort)
                                    : [...efforts, effort],
                                })
                              }}
                              className={`provider-models-manager-chip${selected ? ' is-active' : ''}`}
                            >
                              {REASONING_EFFORT_LABELS[effort]}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div className="provider-models-manager-reasoning-selects">
                      <label className="provider-models-manager-field">
                        {COPY.reasoningDefault}
                        <select
                          className={SETTINGS_SELECT_CLASS}
                          value={editor.reasoningDefaultEffort ?? 'medium'}
                          onChange={(e) =>
                            setEditor({ ...editor, reasoningDefaultEffort: e.target.value })
                          }
                        >
                          {(editor.reasoningEfforts?.length ? editor.reasoningEfforts : REASONING_EFFORTS).map(
                            (effort) => (
                              <option key={effort} value={effort}>
                                {REASONING_EFFORT_LABELS[effort]}
                              </option>
                            ),
                          )}
                        </select>
                      </label>
                      <label className="provider-models-manager-field">
                        {COPY.reasoningProtocol}
                        <select
                          className={SETTINGS_SELECT_CLASS}
                          value={editor.reasoningProtocol ?? 'openai-responses'}
                          onChange={(e) =>
                            setEditor({ ...editor, reasoningProtocol: e.target.value })
                          }
                        >
                          {REASONING_PROTOCOLS.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <span className="provider-models-manager-field-hint">{COPY.reasoningProtocolHint}</span>
                  </div>
                ) : null}
              </div>
              <label className="provider-models-manager-field">
                {COPY.endpointFormatLabel}
                <select
                  className={SETTINGS_SELECT_CLASS}
                  value={editor.endpointFormat ?? ''}
                  onChange={(e) => setEditor({ ...editor, endpointFormat: e.target.value })}
                >
                  <option value="">
                    {COPY.endpointInherit(snapshot.providerEndpointFormat ?? 'Chat completions')}
                  </option>
                  {ENDPOINT_FORMATS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <span className="provider-models-manager-field-hint">{COPY.endpointFormatHint}</span>
              </label>
              <label className="provider-models-manager-field">
                {COPY.aliasesLabel}
                <input
                  className="provider-models-manager-text-input is-mono"
                  value={editor.aliasesText ?? ''}
                  placeholder={COPY.aliasesPlaceholder}
                  spellCheck={false}
                  onChange={(e) => setEditor({ ...editor, aliasesText: e.target.value })}
                />
                <span className="provider-models-manager-field-hint">{COPY.aliasesHint}</span>
              </label>
            </>
          ) : null}
          <div className="provider-models-manager-editor-actions">
            <button type="button" className="provider-models-manager-save-btn">
              {COPY.save}
            </button>
            <button
              type="button"
              onClick={() => setEditor(null)}
              className="provider-models-manager-cancel-btn"
            >
              {COPY.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const DEFAULT_MODELS: ProviderModelEntrySnapshot[] = [
  { kind: 'chat', modelId: 'deepseek-chat', contextWindow: '128K' },
  {
    kind: 'chat',
    modelId: 'deepseek-reasoner',
    contextWindow: '128K',
    reasoning: true,
  },
]

const MANY_MODELS: ProviderModelEntrySnapshot[] = [
  ...DEFAULT_MODELS,
  { kind: 'chat', modelId: 'gpt-4.1', contextWindow: '128K', vision: true },
  { kind: 'chat', modelId: 'gpt-4.1-mini', contextWindow: '128K', vision: true },
  { kind: 'chat', modelId: 'gpt-4o', contextWindow: '128K', vision: true },
  { kind: 'chat', modelId: 'o3-mini', contextWindow: '200K', reasoning: true },
  { kind: 'chat', modelId: 'claude-sonnet-4-20250514', contextWindow: '200K', vision: true, reasoning: true },
  { kind: 'chat', modelId: 'gemini-2.5-pro', contextWindow: '1M', vision: true },
  { kind: 'chat', modelId: 'glm-4-plus', contextWindow: '128K', noTools: true },
  { kind: 'image', modelId: 'dall-e-3' },
  { kind: 'speech', modelId: 'whisper-1' },
  { kind: 'tts', modelId: 'tts-1-hd' },
]

function snapshotForMode(mode: ProviderModelsManagerPreviewMode): ProviderModelsManagerSnapshot {
  switch (mode) {
    case 'empty':
      return { models: [], providerEndpointFormat: 'Chat completions' }
    case 'many':
      return {
        models: MANY_MODELS,
        providerEndpointFormat: 'Chat completions (/v1/chat/completions)',
        initialPage: 0,
      }
    case 'selected':
      return {
        models: MANY_MODELS,
        providerEndpointFormat: 'Chat completions (/v1/chat/completions)',
        initialSelected: MANY_MODELS.slice(0, 3).map(({ kind, modelId }) => entryKey(kind, modelId)),
      }
    case 'add':
      return {
        models: DEFAULT_MODELS,
        providerEndpointFormat: 'Chat completions (/v1/chat/completions)',
        initialEditor: {
          mode: 'add',
          kind: 'chat',
          modelId: '',
          contextText: '',
          visionInput: false,
          supportsToolCalling: true,
          reasoningEnabled: false,
          reasoningEfforts: ['medium', 'high'],
          reasoningDefaultEffort: 'medium',
          reasoningProtocol: 'openai-responses',
        },
      }
    case 'edit':
      return {
        models: DEFAULT_MODELS,
        providerEndpointFormat: 'Chat completions (/v1/chat/completions)',
        initialEditor: {
          mode: 'edit',
          kind: 'chat',
          modelId: 'deepseek-reasoner',
          originalModelId: 'deepseek-reasoner',
          contextText: '128K',
          visionInput: false,
          supportsToolCalling: true,
          reasoningEnabled: true,
          reasoningEfforts: ['medium', 'high'],
          reasoningDefaultEffort: 'medium',
          reasoningProtocol: 'openai-responses',
        },
      }
    case 'search':
      return {
        models: MANY_MODELS,
        providerEndpointFormat: 'Chat completions (/v1/chat/completions)',
        initialQuery: 'gpt',
      }
    default:
      return {
        models: DEFAULT_MODELS,
        providerEndpointFormat: 'Chat completions (/v1/chat/completions)',
      }
  }
}

export type ProviderModelsManagerPreviewMode =
  | 'default'
  | 'empty'
  | 'many'
  | 'add'
  | 'edit'
  | 'search'
  | 'selected'

/** Full-screen preview shell for ?providerModelsManagerPreview URL hooks. */
export function ProviderModelsManagerPreview({
  mode = 'default',
}: {
  mode?: ProviderModelsManagerPreviewMode
}): ReactElement {
  const snapshot = useMemo(() => snapshotForMode(mode), [mode])
  return (
    <div className="provider-models-manager-preview-wrap">
      <div className="provider-models-manager-preview-card">
        <ProviderModelsManager snapshot={snapshot} />
      </div>
    </div>
  )
}

/** Build model entries from a provider settings snapshot for inline use. */
export function providerModelEntriesFromIds(
  models: string[],
  modelProfiles?: Record<string, { reasoning?: boolean; vision?: boolean }>,
): ProviderModelEntrySnapshot[] {
  return models.map((modelId) => ({
    kind: 'chat' as const,
    modelId,
    contextWindow: '128K',
    vision: modelProfiles?.[modelId]?.vision,
    reasoning: modelProfiles?.[modelId]?.reasoning,
  }))
}
