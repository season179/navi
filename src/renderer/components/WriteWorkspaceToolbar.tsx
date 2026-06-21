// Write-mode document toolbar echoing Kun's WriteWorkspaceToolbar
// (../Kun/src/renderer/src/components/write/WriteWorkspaceToolbar.tsx).
// Visual only: parent supplies file snapshots and optional preview flags.

import { useMemo, useRef, useState, type ReactElement } from 'react'
import {
  BookOpen,
  ChevronDown,
  Columns2,
  Copy,
  Download,
  Eye,
  FileCode2,
  FilePenLine,
  FileText,
  Loader2,
  PanelLeft,
  Save,
  Sparkles,
  Type,
} from 'lucide-react'
import { WriteFontSizeControl } from './WriteFontSizeControl'
import type { WriteWorkspaceToolbarPreviewMode } from '../lib/writeWorkspaceToolbarPreviewModes'

export type { WriteWorkspaceToolbarPreviewMode } from '../lib/writeWorkspaceToolbarPreviewModes'

export type WritePreviewMode = 'live' | 'rich' | 'source' | 'split' | 'preview'
export type WriteSaveStatus = 'saved' | 'dirty' | 'saving' | 'error'
export type WriteExportFormat = 'html' | 'pdf' | 'doc' | 'docx'

export type WriteModeMenuItem = {
  mode: WritePreviewMode
  shortLabel: string
  icon: ReactElement
  active: boolean
}

const WRITE_EXPORT_FORMATS: WriteExportFormat[] = ['html', 'pdf', 'doc', 'docx']

const COPY = {
  sidebarExpand: 'Expand sidebar',
  sidebarCollapse: 'Collapse sidebar',
  writeModeLive: 'Live edit',
  writeModeLiveShort: 'Live',
  writeModePreview: 'Preview mode',
  writeModeRich: 'Rich text',
  writeModeSource: 'Source',
  writeModeSplit: 'Split',
  writeToggleAssistant: 'Toggle writing assistant',
  writeSaveFile: 'Save file',
  writePdfSaveDisabled: 'PDF preview is read-only',
  writeImageSaveDisabled: 'Images cannot be saved here',
  writeReadOnlySaveDisabled: 'Read-only',
  writeReadOnly: 'Read-only',
  writePdfPreview: 'PDF preview',
  writeExport: 'Export',
  writeExporting: 'Exporting…',
  writeCopyRichText: 'Copy rich text',
  writeExportHtml: 'Export HTML',
  writeExportPdf: 'Export PDF',
  writeExportDoc: 'Export Word (.doc)',
  writeExportDocx: 'Export Word (.docx)',
  writeSaving: 'Saving…',
  writeUnsaved: 'Unsaved',
  writeSaveError: 'Save failed',
  writeSaved: 'Saved',
  writeReviewPending: 'Review pending',
}

/** Sample file metadata for ?writeWorkspaceToolbar preview hooks. */
export const WRITE_WORKSPACE_TOOLBAR_PREVIEW = {
  activeFileName: 'morning-pages.md',
  activeFileLabel: 'Personal essays · morning-pages.md',
  activeFilePath: '/Users/season/Documents/writing/personal-essays/morning-pages.md',
  documentStatsLabel: '1,842 chars',
} as const

export const WRITE_WORKSPACE_TOOLBAR_PREVIEW_PDF = {
  activeFileName: 'design-brief.pdf',
  activeFileLabel: 'References · design-brief.pdf',
  activeFilePath: '/Users/season/Documents/writing/references/design-brief.pdf',
} as const

export const WRITE_WORKSPACE_TOOLBAR_PREVIEW_IMAGE = {
  activeFileName: 'cover-sketch.png',
  activeFileLabel: 'Assets · cover-sketch.png',
  activeFilePath: '/Users/season/Documents/writing/assets/cover-sketch.png',
} as const

function exportFormatLabel(format: WriteExportFormat): string {
  if (format === 'html') return COPY.writeExportHtml
  if (format === 'pdf') return COPY.writeExportPdf
  if (format === 'doc') return COPY.writeExportDoc
  return COPY.writeExportDocx
}

function formatSaveLabel(status: WriteSaveStatus): string {
  if (status === 'saving') return COPY.writeSaving
  if (status === 'dirty') return COPY.writeUnsaved
  if (status === 'error') return COPY.writeSaveError
  return COPY.writeSaved
}

export function buildModeMenuItems(previewMode: WritePreviewMode): WriteModeMenuItem[] {
  const richModeActive = previewMode === 'rich'
  const sourceModeActive = previewMode === 'source'
  return [
    {
      mode: 'rich',
      shortLabel: COPY.writeModeRich,
      icon: <Type className="write-workspace-toolbar-icon" strokeWidth={1.85} />,
      active: richModeActive,
    },
    {
      mode: 'source',
      shortLabel: COPY.writeModeSource,
      icon: <FileCode2 className="write-workspace-toolbar-icon" strokeWidth={1.85} />,
      active: sourceModeActive,
    },
    {
      mode: 'split',
      shortLabel: COPY.writeModeSplit,
      icon: <Columns2 className="write-workspace-toolbar-icon" strokeWidth={1.85} />,
      active: previewMode === 'split',
    },
    {
      mode: 'preview',
      shortLabel: COPY.writeModePreview,
      icon: <Eye className="write-workspace-toolbar-icon" strokeWidth={1.85} />,
      active: previewMode === 'preview',
    },
  ]
}

type Props = {
  activeFileIsImage?: boolean
  activeFileIsPdf?: boolean
  activeFileIsText?: boolean
  activeFileLabel: string
  activeFileName: string
  activeFilePath?: string
  documentStatsLabel?: string | null
  assistantOpen?: boolean
  exportInFlight?: boolean
  exportMenuOpen?: boolean
  leftSidebarCollapsed?: boolean
  liveModeActive?: boolean
  modeMenuItems?: WriteModeMenuItem[]
  modeMenuOpen?: boolean
  previewMode?: WritePreviewMode
  readOnly?: boolean
  saveLabel?: string
  saveStatus?: WriteSaveStatus
  reviewActive?: boolean
  onToggleLeftSidebar?: () => void
  onToggleAssistant?: () => void
  onToggleExportMenu?: () => void
  onToggleModeMenu?: () => void
  onSetPreviewMode?: (mode: WritePreviewMode) => void
  onSave?: () => void
  onCopyRichText?: () => void
  onExportFile?: (format: WriteExportFormat) => void
}

export function WriteWorkspaceToolbar({
  activeFileIsImage = false,
  activeFileIsPdf = false,
  activeFileIsText = true,
  activeFileLabel,
  activeFileName,
  activeFilePath = '',
  documentStatsLabel = null,
  assistantOpen = false,
  exportInFlight = false,
  exportMenuOpen = false,
  leftSidebarCollapsed = false,
  liveModeActive = true,
  modeMenuItems,
  modeMenuOpen = false,
  previewMode = 'live',
  readOnly = false,
  saveLabel,
  saveStatus = 'saved',
  reviewActive = false,
  onToggleLeftSidebar,
  onToggleAssistant,
  onToggleExportMenu,
  onToggleModeMenu,
  onSetPreviewMode,
  onSave,
  onCopyRichText,
  onExportFile,
}: Props): ReactElement {
  const exportMenuRef = useRef<HTMLDivElement>(null)
  const modeMenuRef = useRef<HTMLDivElement>(null)
  const items = modeMenuItems ?? buildModeMenuItems(previewMode)
  const resolvedSaveLabel = saveLabel ?? formatSaveLabel(saveStatus)

  if (activeFileIsPdf) {
    return (
      <div className="write-workspace-toolbar-inset">
        <header className="write-workspace-toolbar write-workspace-toolbar-pdf">
          <div className="write-pdf-topbar-grid">
            <div
              className={`write-workspace-toolbar-file ${leftSidebarCollapsed ? 'write-workspace-toolbar-file-collapsed' : ''}`}
            >
              <button
                type="button"
                className="sidebar-titlebar-toggle"
                onClick={onToggleLeftSidebar}
                title={leftSidebarCollapsed ? COPY.sidebarExpand : COPY.sidebarCollapse}
                aria-label={leftSidebarCollapsed ? COPY.sidebarExpand : COPY.sidebarCollapse}
              >
                <PanelLeft strokeWidth={1.55} />
              </button>
              <span className="write-pdf-topbar-file-icon">
                <FileText className="write-workspace-toolbar-icon" strokeWidth={1.9} />
              </span>
              <div className="write-workspace-toolbar-file-copy">
                <div className="write-workspace-toolbar-file-name">{activeFileName}</div>
                <div className="write-workspace-toolbar-file-label">{activeFileLabel}</div>
              </div>
            </div>

            <div className="write-pdf-topbar-status">
              <BookOpen className="write-workspace-toolbar-icon" strokeWidth={1.85} />
              <span>{COPY.writePdfPreview}</span>
              <span className="write-pdf-topbar-dot" aria-hidden="true" />
              <span>{COPY.writeReadOnly}</span>
            </div>

            <div className="write-pdf-topbar-actions">
              <button
                type="button"
                onClick={onToggleAssistant}
                className={`write-workspace-toolbar-icon-btn ${assistantOpen ? 'write-workspace-toolbar-icon-btn-active' : ''}`}
                title={COPY.writeToggleAssistant}
                aria-label={COPY.writeToggleAssistant}
              >
                <Sparkles className="write-workspace-toolbar-icon" strokeWidth={1.85} />
              </button>
            </div>
          </div>
        </header>
      </div>
    )
  }

  return (
    <div className="write-workspace-toolbar-inset">
      <header className="write-workspace-toolbar">
        <div className="write-workspace-toolbar-grid">
          <div
            className={`write-workspace-toolbar-file ${leftSidebarCollapsed ? 'write-workspace-toolbar-file-collapsed' : ''}`}
          >
            <button
              type="button"
              className="sidebar-titlebar-toggle"
              onClick={onToggleLeftSidebar}
              title={leftSidebarCollapsed ? COPY.sidebarExpand : COPY.sidebarCollapse}
              aria-label={leftSidebarCollapsed ? COPY.sidebarExpand : COPY.sidebarCollapse}
            >
              <PanelLeft strokeWidth={1.55} />
            </button>
            <span className="write-workspace-toolbar-file-badge">
              <FilePenLine className="write-workspace-toolbar-icon" strokeWidth={1.9} />
            </span>
            <div className="write-workspace-toolbar-file-copy">
              <div className="write-workspace-toolbar-file-name">{activeFileName}</div>
              <div className="write-workspace-toolbar-file-meta">
                <span className="write-workspace-toolbar-file-label">{activeFileLabel}</span>
                {documentStatsLabel ? (
                  <span className="write-workspace-toolbar-stats-pill">{documentStatsLabel}</span>
                ) : null}
              </div>
            </div>
          </div>

          <div ref={modeMenuRef} className="write-workspace-toolbar-modes">
            <button
              type="button"
              onClick={() => onSetPreviewMode?.('live')}
              disabled={!activeFileIsText}
              className={`write-workspace-toolbar-mode-btn ${liveModeActive ? 'write-workspace-toolbar-mode-btn-active' : ''} ${!activeFileIsText ? 'write-workspace-toolbar-mode-btn-disabled' : ''}`}
              title={COPY.writeModeLive}
              aria-label={COPY.writeModeLive}
            >
              <FileCode2 className="write-workspace-toolbar-icon" strokeWidth={1.85} />
              <span className="write-workspace-toolbar-mode-label">{COPY.writeModeLiveShort}</span>
            </button>
            <button
              type="button"
              onClick={onToggleModeMenu}
              disabled={!activeFileIsText}
              className={`write-workspace-toolbar-mode-btn write-workspace-toolbar-mode-menu-btn ${modeMenuOpen || !liveModeActive ? 'write-workspace-toolbar-mode-btn-active' : ''} ${!activeFileIsText ? 'write-workspace-toolbar-mode-btn-disabled' : ''}`}
              title={COPY.writeModePreview}
              aria-label={COPY.writeModePreview}
              aria-haspopup="menu"
              aria-expanded={modeMenuOpen}
            >
              <ChevronDown
                className={`write-workspace-toolbar-icon write-workspace-toolbar-chevron ${modeMenuOpen ? 'write-workspace-toolbar-chevron-open' : ''}`}
                strokeWidth={1.9}
              />
            </button>
            {modeMenuOpen ? (
              <div role="menu" className="write-workspace-toolbar-mode-menu">
                {items.map((item) => (
                  <button
                    key={item.mode}
                    type="button"
                    role="menuitem"
                    disabled={!activeFileIsText}
                    onClick={() => {
                      onSetPreviewMode?.(item.mode)
                      onToggleModeMenu?.()
                    }}
                    className={`write-workspace-toolbar-mode-menu-item ${item.active ? 'write-workspace-toolbar-mode-menu-item-active' : ''} ${!activeFileIsText ? 'write-workspace-toolbar-mode-menu-item-disabled' : ''}`}
                  >
                    <span className="write-workspace-toolbar-mode-menu-item-left">
                      {item.icon}
                      <span>{item.shortLabel}</span>
                    </span>
                    {item.active ? (
                      <span className="write-workspace-toolbar-mode-menu-on">ON</span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="write-workspace-toolbar-actions">
            {activeFileIsText ? <WriteFontSizeControl /> : null}
            <button
              type="button"
              onClick={onToggleAssistant}
              className={`write-workspace-toolbar-icon-btn ${assistantOpen ? 'write-workspace-toolbar-icon-btn-active' : ''}`}
              title={COPY.writeToggleAssistant}
              aria-label={COPY.writeToggleAssistant}
            >
              <Sparkles className="write-workspace-toolbar-icon" strokeWidth={1.85} />
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={!activeFilePath || !activeFileIsText || readOnly}
              className="write-workspace-toolbar-icon-btn"
              title={
                activeFileIsPdf
                  ? COPY.writePdfSaveDisabled
                  : activeFileIsImage
                    ? COPY.writeImageSaveDisabled
                    : readOnly
                      ? COPY.writeReadOnlySaveDisabled
                      : COPY.writeSaveFile
              }
              aria-label={
                activeFileIsPdf
                  ? COPY.writePdfSaveDisabled
                  : activeFileIsImage
                    ? COPY.writeImageSaveDisabled
                    : readOnly
                      ? COPY.writeReadOnlySaveDisabled
                      : COPY.writeSaveFile
              }
            >
              <Save className="write-workspace-toolbar-icon" strokeWidth={1.85} />
            </button>
            <span
              className={`write-workspace-toolbar-save-pill ${
                reviewActive
                  ? 'write-workspace-toolbar-save-pill-review'
                  : readOnly
                    ? 'write-workspace-toolbar-save-pill-readonly'
                    : saveStatus === 'error'
                      ? 'write-workspace-toolbar-save-pill-error'
                      : saveStatus === 'dirty'
                        ? 'write-workspace-toolbar-save-pill-dirty'
                        : saveStatus === 'saving'
                          ? 'write-workspace-toolbar-save-pill-saving'
                          : 'write-workspace-toolbar-save-pill-saved'
              }`}
            >
              {reviewActive ? COPY.writeReviewPending : resolvedSaveLabel}
            </span>
            <div ref={exportMenuRef} className="write-workspace-toolbar-export-wrap">
              <button
                type="button"
                onClick={onToggleExportMenu}
                disabled={!activeFilePath || !activeFileIsText || exportInFlight}
                className={`write-workspace-toolbar-menu-btn ${exportMenuOpen ? 'write-workspace-toolbar-menu-btn-active' : ''}`}
                title={exportInFlight ? COPY.writeExporting : COPY.writeExport}
                aria-label={exportInFlight ? COPY.writeExporting : COPY.writeExport}
                aria-haspopup="menu"
                aria-expanded={exportMenuOpen}
              >
                {exportInFlight ? (
                  <Loader2 className="write-workspace-toolbar-icon write-workspace-toolbar-spin" strokeWidth={1.85} />
                ) : (
                  <Download className="write-workspace-toolbar-icon" strokeWidth={1.85} />
                )}
                <span className="write-workspace-toolbar-export-label">{COPY.writeExport}</span>
                <ChevronDown className="write-workspace-toolbar-export-chevron" strokeWidth={1.9} />
              </button>
              {exportMenuOpen ? (
                <div role="menu" className="write-workspace-toolbar-export-menu">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={onCopyRichText}
                    className="write-workspace-toolbar-export-menu-item"
                  >
                    <span>{COPY.writeCopyRichText}</span>
                    <Copy className="write-workspace-toolbar-export-menu-icon" strokeWidth={1.9} />
                  </button>
                  <div className="write-workspace-toolbar-export-divider" />
                  {WRITE_EXPORT_FORMATS.map((format) => (
                    <button
                      key={format}
                      type="button"
                      role="menuitem"
                      onClick={() => onExportFile?.(format)}
                      className="write-workspace-toolbar-export-menu-item"
                    >
                      <span>{exportFormatLabel(format)}</span>
                      <span className="write-workspace-toolbar-export-format">{format}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}

type PreviewProps = {
  mode: WriteWorkspaceToolbarPreviewMode
}

function previewState(mode: WriteWorkspaceToolbarPreviewMode): {
  activeFileIsPdf: boolean
  activeFileIsImage: boolean
  activeFileIsText: boolean
  activeFileName: string
  activeFileLabel: string
  activeFilePath: string
  documentStatsLabel: string | null
  saveStatus: WriteSaveStatus
  readOnly: boolean
  reviewActive: boolean
  assistantOpen: boolean
  exportMenuOpen: boolean
  modeMenuOpen: boolean
  exportInFlight: boolean
  previewMode: WritePreviewMode
  liveModeActive: boolean
} {
  if (mode === 'pdf') {
    return {
      activeFileIsPdf: true,
      activeFileIsImage: false,
      activeFileIsText: false,
      activeFileName: WRITE_WORKSPACE_TOOLBAR_PREVIEW_PDF.activeFileName,
      activeFileLabel: WRITE_WORKSPACE_TOOLBAR_PREVIEW_PDF.activeFileLabel,
      activeFilePath: WRITE_WORKSPACE_TOOLBAR_PREVIEW_PDF.activeFilePath,
      documentStatsLabel: null,
      saveStatus: 'saved',
      readOnly: true,
      reviewActive: false,
      assistantOpen: false,
      exportMenuOpen: false,
      modeMenuOpen: false,
      exportInFlight: false,
      previewMode: 'preview',
      liveModeActive: false,
    }
  }

  if (mode === 'image') {
    return {
      activeFileIsPdf: false,
      activeFileIsImage: true,
      activeFileIsText: false,
      activeFileName: WRITE_WORKSPACE_TOOLBAR_PREVIEW_IMAGE.activeFileName,
      activeFileLabel: WRITE_WORKSPACE_TOOLBAR_PREVIEW_IMAGE.activeFileLabel,
      activeFilePath: WRITE_WORKSPACE_TOOLBAR_PREVIEW_IMAGE.activeFilePath,
      documentStatsLabel: null,
      saveStatus: 'saved',
      readOnly: false,
      reviewActive: false,
      assistantOpen: false,
      exportMenuOpen: false,
      modeMenuOpen: false,
      exportInFlight: false,
      previewMode: 'live',
      liveModeActive: true,
    }
  }

  const previewMode: WritePreviewMode =
    mode === 'rich' || mode === 'modeMenu'
      ? 'rich'
      : mode === 'source'
        ? 'source'
        : mode === 'split'
          ? 'split'
          : mode === 'exportMenu'
            ? 'live'
            : 'live'

  return {
    activeFileIsPdf: false,
    activeFileIsImage: false,
    activeFileIsText: true,
    activeFileName: WRITE_WORKSPACE_TOOLBAR_PREVIEW.activeFileName,
    activeFileLabel: WRITE_WORKSPACE_TOOLBAR_PREVIEW.activeFileLabel,
    activeFilePath: WRITE_WORKSPACE_TOOLBAR_PREVIEW.activeFilePath,
    documentStatsLabel: WRITE_WORKSPACE_TOOLBAR_PREVIEW.documentStatsLabel,
    saveStatus:
      mode === 'dirty'
        ? 'dirty'
        : mode === 'saving'
          ? 'saving'
          : mode === 'error'
            ? 'error'
            : 'saved',
    readOnly: mode === 'readonly',
    reviewActive: mode === 'review',
    assistantOpen: mode === 'assistant',
    exportMenuOpen: mode === 'exportMenu',
    modeMenuOpen: mode === 'modeMenu',
    exportInFlight: mode === 'exporting',
    previewMode,
    liveModeActive: previewMode === 'live',
  }
}

/** Full-width preview shell for ?writeWorkspaceToolbar URL hooks. */
export function WriteWorkspaceToolbarPreview({ mode }: PreviewProps): ReactElement {
  const initial = useMemo(() => previewState(mode), [mode])
  const [assistantOpen, setAssistantOpen] = useState(initial.assistantOpen)
  const [exportMenuOpen, setExportMenuOpen] = useState(initial.exportMenuOpen)
  const [modeMenuOpen, setModeMenuOpen] = useState(initial.modeMenuOpen)
  const [previewMode, setPreviewMode] = useState<WritePreviewMode>(initial.previewMode)
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)

  const liveModeActive = previewMode === 'live'
  const modeMenuItems = buildModeMenuItems(previewMode)

  return (
    <div className="write-workspace-toolbar-preview">
      <WriteWorkspaceToolbar
        activeFileIsPdf={initial.activeFileIsPdf}
        activeFileIsImage={initial.activeFileIsImage}
        activeFileIsText={initial.activeFileIsText}
        activeFileName={initial.activeFileName}
        activeFileLabel={initial.activeFileLabel}
        activeFilePath={initial.activeFilePath}
        documentStatsLabel={initial.documentStatsLabel}
        assistantOpen={assistantOpen}
        exportInFlight={initial.exportInFlight}
        exportMenuOpen={exportMenuOpen}
        leftSidebarCollapsed={leftSidebarCollapsed}
        liveModeActive={liveModeActive}
        modeMenuItems={modeMenuItems}
        modeMenuOpen={modeMenuOpen}
        previewMode={previewMode}
        readOnly={initial.readOnly}
        saveStatus={initial.saveStatus}
        reviewActive={initial.reviewActive}
        onToggleLeftSidebar={() => setLeftSidebarCollapsed((open) => !open)}
        onToggleAssistant={() => setAssistantOpen((open) => !open)}
        onToggleExportMenu={() => setExportMenuOpen((open) => !open)}
        onToggleModeMenu={() => setModeMenuOpen((open) => !open)}
        onSetPreviewMode={setPreviewMode}
      />
      <div className="write-workspace-toolbar-preview-body">
        <p className="write-workspace-toolbar-preview-hint">
          Write document toolbar — mode: {mode}
        </p>
      </div>
    </div>
  )
}
