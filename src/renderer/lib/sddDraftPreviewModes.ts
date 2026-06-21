// Shared SddDraftEditorView preview mode identifiers.

export type SddDraftEditorViewPreviewMode =
  | 'default'
  | 'dirty'
  | 'saving'
  | 'error'
  | 'upgrading'
  | 'designContext'
  | 'noDraft'
  | 'assistantOpen'
  | 'assistantTimeline'
  | 'assistantBusy'
  | 'leftCollapsed'
  | 'withNotice'
  | 'inlineAgent'
  | 'richFallback'

const ALL_MODES = new Set<SddDraftEditorViewPreviewMode>([
  'default',
  'dirty',
  'saving',
  'error',
  'upgrading',
  'designContext',
  'noDraft',
  'assistantOpen',
  'assistantTimeline',
  'assistantBusy',
  'leftCollapsed',
  'withNotice',
  'inlineAgent',
  'richFallback',
])

/** Draft-editor snapshot modes exposed via ?productionSddDraft for live SDD verification. */
export const PRODUCTION_SDD_DRAFT_SNAPSHOT_MODES = new Set<SddDraftEditorViewPreviewMode>([
  'default',
  'dirty',
  'saving',
  'error',
  'upgrading',
  'designContext',
  'noDraft',
  'leftCollapsed',
  'withNotice',
  'inlineAgent',
  'richFallback',
])

export function resolveProductionSddDraftParam(
  searchParams?: URLSearchParams | null,
): string | null {
  if (searchParams) {
    return searchParams.get('productionSddDraft')
  }
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('productionSddDraft')
}

export function resolveProductionSddDraftMode(
  searchParams?: URLSearchParams | null,
): SddDraftEditorViewPreviewMode {
  const value = resolveProductionSddDraftParam(searchParams)
  if (value && ALL_MODES.has(value as SddDraftEditorViewPreviewMode)) {
    return value as SddDraftEditorViewPreviewMode
  }
  return 'default'
}

export function resolveProductionSddDraftSnapshotMode(
  searchParams?: URLSearchParams | null,
): SddDraftEditorViewPreviewMode {
  const mode = resolveProductionSddDraftMode(searchParams)
  if (PRODUCTION_SDD_DRAFT_SNAPSHOT_MODES.has(mode)) {
    return mode
  }
  return 'default'
}

export function isProductionSddDraftAssistantMode(
  searchParams?: URLSearchParams | null,
): boolean {
  const value = resolveProductionSddDraftParam(searchParams)
  return value === 'assistantOpen' || value === 'assistantTimeline' || value === 'assistantBusy'
}
