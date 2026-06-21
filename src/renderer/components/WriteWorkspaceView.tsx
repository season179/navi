// Write-mode workspace shell echoing Kun's WriteWorkspaceView
// (../Kun/src/renderer/src/components/write/WriteWorkspaceView.tsx).
// Visual only: composes toolbar, document pane, inline agent, and toast notices.

import { useMemo, useRef, useState, type ReactElement } from 'react'
import { WriteWorkspaceEmptyState } from './WriteWorkspaceEmptyState'
import {
  WriteWorkspaceToolbar,
  WRITE_WORKSPACE_TOOLBAR_PREVIEW,
  WRITE_WORKSPACE_TOOLBAR_PREVIEW_IMAGE,
  WRITE_WORKSPACE_TOOLBAR_PREVIEW_PDF,
  buildModeMenuItems,
  type WritePreviewMode,
  type WriteSaveStatus,
} from './WriteWorkspaceToolbar'
import {
  WriteWorkspaceDocumentPane,
  type WriteDocumentPreviewMode,
  type WriteRenderSafety,
} from './WriteWorkspaceDocumentPane'
import { WRITE_WORKSPACE_START_PREVIEW } from './WriteWorkspaceStart'
import { WRITE_PDF_VIEWER_PREVIEW_SAMPLE } from './WritePdfViewer'
import { WRITE_IMAGE_PREVIEW_SAMPLE } from './WriteImagePreview'
import { WRITE_MARKDOWN_PREVIEW_SAMPLE } from './WriteMarkdownPreview'
import {
  WriteInlineAgent,
  type WriteBlockType,
  type WriteInlineAgentPosition,
} from './WriteInlineAgent'
import { WRITE_SETTINGS_PREVIEW_DEFAULT } from './WriteSettingsSection'

export type WriteWorkspaceViewPreviewMode =
  | 'empty'
  | 'emptyError'
  | 'start'
  | 'split'
  | 'live'
  | 'source'
  | 'preview'
  | 'pdf'
  | 'image'
  | 'inlineAgent'
  | 'error'
  | 'exportSuccess'
  | 'exportError'
  | 'dirty'
  | 'saving'

type WriteNotice = {
  tone: 'success' | 'error'
  message: string
}

type WorkspaceSnapshot = {
  workspaceReady: boolean
  workspaceError: string | null
  activeFilePath: string | null
  activeFileIsImage: boolean
  activeFileIsPdf: boolean
  activeFileIsText: boolean
  fileLoading: boolean
  fileContent: string
  fileSize: number
  previewMode: WriteDocumentPreviewMode
  renderSafety: WriteRenderSafety
  fileGuardMessage: string
  fileGuardDetail: string
  imageSrc: string
  imageMimeType: string
  activeFileName: string
  activeFileLabel: string
  activeFilePathLabel: string
  documentStatsLabel: string | null
  saveStatus: WriteSaveStatus
  readOnly: boolean
  showInlineAgent: boolean
  fileError: string | null
  exportNotice: WriteNotice | null
}

const SAMPLE_PATH = '/Users/season/writing/docs/launch-plan.md'

function previewSnapshot(mode: WriteWorkspaceViewPreviewMode): WorkspaceSnapshot {
  const baseText: Omit<
    WorkspaceSnapshot,
    | 'workspaceReady'
    | 'workspaceError'
    | 'activeFilePath'
    | 'activeFileIsImage'
    | 'activeFileIsPdf'
    | 'activeFileIsText'
    | 'fileLoading'
    | 'previewMode'
    | 'renderSafety'
    | 'fileGuardMessage'
    | 'fileGuardDetail'
    | 'imageSrc'
    | 'imageMimeType'
    | 'activeFileName'
    | 'activeFileLabel'
    | 'activeFilePathLabel'
    | 'documentStatsLabel'
    | 'saveStatus'
    | 'readOnly'
    | 'showInlineAgent'
    | 'fileError'
    | 'exportNotice'
  > = {
    fileContent: WRITE_MARKDOWN_PREVIEW_SAMPLE,
    fileSize: 12_480,
  }

  if (mode === 'empty') {
    return {
      workspaceReady: false,
      workspaceError: null,
      activeFilePath: null,
      activeFileIsImage: false,
      activeFileIsPdf: false,
      activeFileIsText: false,
      fileLoading: false,
      previewMode: 'split',
      renderSafety: {
        livePreviewEnabled: true,
        markdownPreviewEnabled: true,
        readOnly: false,
        notice: 'none',
      },
      fileGuardMessage: '',
      fileGuardDetail: '',
      imageSrc: WRITE_IMAGE_PREVIEW_SAMPLE.src,
      imageMimeType: WRITE_IMAGE_PREVIEW_SAMPLE.mimeType,
      activeFileName: '',
      activeFileLabel: '',
      activeFilePathLabel: '',
      documentStatsLabel: null,
      saveStatus: 'saved',
      readOnly: false,
      showInlineAgent: false,
      fileError: null,
      exportNotice: null,
      ...baseText,
    }
  }

  if (mode === 'emptyError') {
    return {
      ...previewSnapshot('empty'),
      workspaceError: 'Could not open the selected folder. Try another path or check permissions.',
    }
  }

  if (mode === 'start') {
    return {
      workspaceReady: true,
      workspaceError: null,
      activeFilePath: null,
      activeFileIsImage: false,
      activeFileIsPdf: false,
      activeFileIsText: false,
      fileLoading: false,
      previewMode: 'split',
      renderSafety: {
        livePreviewEnabled: true,
        markdownPreviewEnabled: true,
        readOnly: false,
        notice: 'none',
      },
      fileGuardMessage: '',
      fileGuardDetail: '',
      imageSrc: WRITE_IMAGE_PREVIEW_SAMPLE.src,
      imageMimeType: WRITE_IMAGE_PREVIEW_SAMPLE.mimeType,
      activeFileName: '',
      activeFileLabel: '',
      activeFilePathLabel: '',
      documentStatsLabel: null,
      saveStatus: 'saved',
      readOnly: false,
      showInlineAgent: false,
      fileError: null,
      exportNotice: null,
      ...baseText,
    }
  }

  if (mode === 'pdf') {
    return {
      workspaceReady: true,
      workspaceError: null,
      activeFilePath: WRITE_WORKSPACE_TOOLBAR_PREVIEW_PDF.activeFilePath,
      activeFileIsImage: false,
      activeFileIsPdf: true,
      activeFileIsText: false,
      fileLoading: false,
      previewMode: 'preview',
      renderSafety: {
        livePreviewEnabled: false,
        markdownPreviewEnabled: false,
        readOnly: true,
        notice: 'none',
      },
      fileGuardMessage: '',
      fileGuardDetail: '',
      imageSrc: WRITE_IMAGE_PREVIEW_SAMPLE.src,
      imageMimeType: WRITE_IMAGE_PREVIEW_SAMPLE.mimeType,
      activeFileName: WRITE_WORKSPACE_TOOLBAR_PREVIEW_PDF.activeFileName,
      activeFileLabel: WRITE_WORKSPACE_TOOLBAR_PREVIEW_PDF.activeFileLabel,
      activeFilePathLabel: WRITE_WORKSPACE_TOOLBAR_PREVIEW_PDF.activeFilePath,
      documentStatsLabel: null,
      saveStatus: 'saved',
      readOnly: true,
      showInlineAgent: false,
      fileError: null,
      exportNotice: null,
      ...baseText,
    }
  }

  if (mode === 'image') {
    return {
      workspaceReady: true,
      workspaceError: null,
      activeFilePath: WRITE_WORKSPACE_TOOLBAR_PREVIEW_IMAGE.activeFilePath,
      activeFileIsImage: true,
      activeFileIsPdf: false,
      activeFileIsText: false,
      fileLoading: false,
      previewMode: 'live',
      renderSafety: {
        livePreviewEnabled: true,
        markdownPreviewEnabled: true,
        readOnly: false,
        notice: 'none',
      },
      fileGuardMessage: '',
      fileGuardDetail: '',
      imageSrc: WRITE_IMAGE_PREVIEW_SAMPLE.src,
      imageMimeType: WRITE_IMAGE_PREVIEW_SAMPLE.mimeType,
      activeFileName: WRITE_WORKSPACE_TOOLBAR_PREVIEW_IMAGE.activeFileName,
      activeFileLabel: WRITE_WORKSPACE_TOOLBAR_PREVIEW_IMAGE.activeFileLabel,
      activeFilePathLabel: WRITE_WORKSPACE_TOOLBAR_PREVIEW_IMAGE.activeFilePath,
      documentStatsLabel: null,
      saveStatus: 'saved',
      readOnly: false,
      showInlineAgent: false,
      fileError: null,
      exportNotice: null,
      ...baseText,
    }
  }

  const previewMode: WriteDocumentPreviewMode =
    mode === 'source'
      ? 'source'
      : mode === 'preview'
        ? 'preview'
        : mode === 'live'
          ? 'live'
          : 'split'

  return {
    workspaceReady: true,
    workspaceError: null,
    activeFilePath: SAMPLE_PATH,
    activeFileIsImage: false,
    activeFileIsPdf: false,
    activeFileIsText: true,
    fileLoading: false,
    previewMode,
    renderSafety: {
      livePreviewEnabled: previewMode === 'live' || previewMode === 'split',
      markdownPreviewEnabled: true,
      readOnly: false,
      notice: 'none',
    },
    fileGuardMessage: '',
    fileGuardDetail: '',
    imageSrc: WRITE_IMAGE_PREVIEW_SAMPLE.src,
    imageMimeType: WRITE_IMAGE_PREVIEW_SAMPLE.mimeType,
    activeFileName: WRITE_WORKSPACE_TOOLBAR_PREVIEW.activeFileName,
    activeFileLabel: WRITE_WORKSPACE_TOOLBAR_PREVIEW.activeFileLabel,
    activeFilePathLabel: SAMPLE_PATH,
    documentStatsLabel: WRITE_WORKSPACE_TOOLBAR_PREVIEW.documentStatsLabel,
    saveStatus: mode === 'dirty' ? 'dirty' : mode === 'saving' ? 'saving' : 'saved',
    readOnly: false,
    showInlineAgent: mode === 'inlineAgent',
    fileError: mode === 'error' ? 'Could not save the file. Check disk space and try again.' : null,
    exportNotice:
      mode === 'exportSuccess'
        ? { tone: 'success', message: 'Exported morning-pages.md as HTML.' }
        : mode === 'exportError'
          ? { tone: 'error', message: 'Export failed. The file may be open elsewhere.' }
          : null,
    ...baseText,
  }
}

function toolbarPreviewMode(previewMode: WriteDocumentPreviewMode): WritePreviewMode {
  if (previewMode === 'source') return 'source'
  if (previewMode === 'preview') return 'preview'
  if (previewMode === 'split') return 'split'
  return 'live'
}

function inlineAgentPosition(): WriteInlineAgentPosition {
  if (typeof window === 'undefined') {
    return { left: 120, width: 420, anchorTop: 360, anchorBottom: 388 }
  }
  const width = Math.min(420, Math.max(280, window.innerWidth - 96))
  const left = Math.max(48, (window.innerWidth - width) / 2)
  return { left, width, anchorTop: 360, anchorBottom: 388 }
}

type ViewProps = {
  workspaceReady?: boolean
  workspaceError?: string | null
  activeFilePath?: string | null
  activeFileIsImage?: boolean
  activeFileIsPdf?: boolean
  activeFileIsText?: boolean
  fileLoading?: boolean
  fileContent?: string
  fileSize?: number
  previewMode?: WriteDocumentPreviewMode
  renderSafety?: WriteRenderSafety
  fileGuardMessage?: string
  fileGuardDetail?: string
  imageSrc?: string
  imageMimeType?: string
  activeFileName?: string
  activeFileLabel?: string
  documentStatsLabel?: string | null
  saveStatus?: WriteSaveStatus
  readOnly?: boolean
  showInlineAgent?: boolean
  fileError?: string | null
  exportNotice?: WriteNotice | null
  leftSidebarCollapsed?: boolean
  onToggleLeftSidebar?: () => void
  onPickWorkspace?: () => void
}

export function WriteWorkspaceView({
  workspaceReady = true,
  workspaceError = null,
  activeFilePath = SAMPLE_PATH,
  activeFileIsImage = false,
  activeFileIsPdf = false,
  activeFileIsText = true,
  fileLoading = false,
  fileContent = WRITE_MARKDOWN_PREVIEW_SAMPLE,
  fileSize = 12_480,
  previewMode = 'split',
  renderSafety = {
    livePreviewEnabled: true,
    markdownPreviewEnabled: true,
    readOnly: false,
    notice: 'none',
  },
  fileGuardMessage = '',
  fileGuardDetail = '',
  imageSrc = WRITE_IMAGE_PREVIEW_SAMPLE.src,
  imageMimeType = WRITE_IMAGE_PREVIEW_SAMPLE.mimeType,
  activeFileName = WRITE_WORKSPACE_TOOLBAR_PREVIEW.activeFileName,
  activeFileLabel = WRITE_WORKSPACE_TOOLBAR_PREVIEW.activeFileLabel,
  documentStatsLabel = WRITE_WORKSPACE_TOOLBAR_PREVIEW.documentStatsLabel,
  saveStatus = 'saved',
  readOnly = false,
  showInlineAgent = false,
  fileError = null,
  exportNotice = null,
  leftSidebarCollapsed = false,
  onToggleLeftSidebar,
  onPickWorkspace,
}: ViewProps): ReactElement {
  const [content, setContent] = useState(fileContent)
  const [toolbarPreviewModeState, setToolbarPreviewModeState] = useState<WritePreviewMode>(
    toolbarPreviewMode(previewMode),
  )
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [modeMenuOpen, setModeMenuOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [inlineValue, setInlineValue] = useState('')
  const [blockType, setBlockType] = useState<WriteBlockType>('paragraph')
  const [activeAgentId, setActiveAgentId] = useState(
    WRITE_SETTINGS_PREVIEW_DEFAULT.agentPresets[0]?.id ?? '',
  )

  const liveModeActive = toolbarPreviewModeState === 'live'
  const modeMenuItems = buildModeMenuItems(toolbarPreviewModeState)
  const inlinePosition = useMemo(() => inlineAgentPosition(), [])

  if (!workspaceReady) {
    return (
      <WriteWorkspaceEmptyState error={workspaceError} onPickWorkspace={onPickWorkspace} />
    )
  }

  return (
    <div className="write-workspace-view">
      <WriteWorkspaceToolbar
        activeFileIsPdf={activeFileIsPdf}
        activeFileIsImage={activeFileIsImage}
        activeFileIsText={activeFileIsText}
        activeFileName={activeFileName}
        activeFileLabel={activeFileLabel}
        activeFilePath={activeFilePath ?? ''}
        documentStatsLabel={documentStatsLabel}
        assistantOpen={assistantOpen}
        exportInFlight={false}
        exportMenuOpen={exportMenuOpen}
        leftSidebarCollapsed={leftSidebarCollapsed}
        liveModeActive={liveModeActive}
        modeMenuItems={modeMenuItems}
        modeMenuOpen={modeMenuOpen}
        previewMode={toolbarPreviewModeState}
        readOnly={readOnly}
        saveStatus={saveStatus}
        reviewActive={false}
        onToggleLeftSidebar={onToggleLeftSidebar}
        onToggleAssistant={() => setAssistantOpen((open) => !open)}
        onToggleExportMenu={() => setExportMenuOpen((open) => !open)}
        onToggleModeMenu={() => setModeMenuOpen((open) => !open)}
        onSetPreviewMode={setToolbarPreviewModeState}
      />
      <div className="write-workspace-view-body">
        <div className="write-workspace-view-card">
          <WriteWorkspaceDocumentPane
            activeFilePath={activeFilePath}
            activeFileIsImage={activeFileIsImage}
            activeFileIsPdf={activeFileIsPdf}
            activeFileIsText={activeFileIsText}
            fileLoading={fileLoading}
            fileContent={content}
            fileSize={fileSize}
            workspaceRoot={WRITE_PDF_VIEWER_PREVIEW_SAMPLE.workspaceRoot}
            workspaceName={WRITE_WORKSPACE_START_PREVIEW.workspaceName}
            workspacePathLabel={WRITE_WORKSPACE_START_PREVIEW.workspacePathLabel}
            renderSafety={renderSafety}
            fileGuardMessage={fileGuardMessage}
            fileGuardDetail={fileGuardDetail}
            previewMode={previewMode}
            imageSrc={imageSrc}
            imageMimeType={imageMimeType}
            onContentChange={setContent}
            onPickWorkspace={onPickWorkspace}
          />
        </div>
      </div>
      {showInlineAgent && activeFilePath && (activeFileIsText || activeFileIsPdf) ? (
        <WriteInlineAgent
          action={inlinePosition}
          value={inlineValue}
          inFlight={false}
          textareaRef={textareaRef}
          onValueChange={setInlineValue}
          onSubmitPrompt={() => undefined}
          onApplyEdit={() => undefined}
          askOnly={activeFileIsPdf}
          preferAbove={activeFileIsPdf}
          formattingEnabled={activeFileIsText && !readOnly}
          onApplyFormat={() => undefined}
          blockType={blockType}
          onSetBlockType={setBlockType}
          quickActions={WRITE_SETTINGS_PREVIEW_DEFAULT.selectionAssist.quickActions}
          onQuickAction={() => undefined}
          agentPresets={WRITE_SETTINGS_PREVIEW_DEFAULT.agentPresets}
          activeAgentId={activeAgentId}
          onSelectAgent={setActiveAgentId}
          onOpenAgentSettings={() => undefined}
          onQuoteSelection={() => undefined}
          infographicEnabled={activeFileIsText && !readOnly}
          onGenerateInfographic={() => undefined}
        />
      ) : null}
      {fileError ? (
        <div className="write-workspace-view-toast write-workspace-view-toast-error">
          {fileError}
        </div>
      ) : null}
      {exportNotice ? (
        <div
          className={`write-workspace-view-toast ${
            exportNotice.tone === 'error'
              ? 'write-workspace-view-toast-error'
              : 'write-workspace-view-toast-success'
          }`}
          style={{ bottom: fileError ? 68 : 20 }}
        >
          {exportNotice.message}
        </div>
      ) : null}
    </div>
  )
}

type PreviewProps = {
  mode: WriteWorkspaceViewPreviewMode
}

/** Production shell for Write workspace tab — mock snapshots for visual parity. */
export function WriteWorkspaceProductionView({
  leftSidebarCollapsed,
  onToggleLeftSidebar,
}: {
  leftSidebarCollapsed: boolean
  onToggleLeftSidebar: () => void
}): ReactElement {
  const snapshot = useMemo(() => previewSnapshot('split'), [])

  return (
    <div className="production-write-stage">
      <WriteWorkspaceView
        workspaceReady={snapshot.workspaceReady}
        workspaceError={snapshot.workspaceError}
        activeFilePath={snapshot.activeFilePath}
        activeFileIsImage={snapshot.activeFileIsImage}
        activeFileIsPdf={snapshot.activeFileIsPdf}
        activeFileIsText={snapshot.activeFileIsText}
        fileLoading={snapshot.fileLoading}
        fileContent={snapshot.fileContent}
        fileSize={snapshot.fileSize}
        previewMode={snapshot.previewMode}
        renderSafety={snapshot.renderSafety}
        fileGuardMessage={snapshot.fileGuardMessage}
        fileGuardDetail={snapshot.fileGuardDetail}
        imageSrc={snapshot.imageSrc}
        imageMimeType={snapshot.imageMimeType}
        activeFileName={snapshot.activeFileName}
        activeFileLabel={snapshot.activeFileLabel}
        documentStatsLabel={snapshot.documentStatsLabel}
        saveStatus={snapshot.saveStatus}
        readOnly={snapshot.readOnly}
        showInlineAgent={snapshot.showInlineAgent}
        fileError={snapshot.fileError}
        exportNotice={snapshot.exportNotice}
        leftSidebarCollapsed={leftSidebarCollapsed}
        onToggleLeftSidebar={onToggleLeftSidebar}
        onPickWorkspace={() => undefined}
      />
    </div>
  )
}

/** Full-page preview shell for ?writeWorkspaceView URL hooks. */
export function WriteWorkspaceViewPreview({ mode }: PreviewProps): ReactElement {
  const snapshot = useMemo(() => previewSnapshot(mode), [mode])
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)

  return (
    <div className="write-workspace-view-preview">
      <WriteWorkspaceView
        workspaceReady={snapshot.workspaceReady}
        workspaceError={snapshot.workspaceError}
        activeFilePath={snapshot.activeFilePath}
        activeFileIsImage={snapshot.activeFileIsImage}
        activeFileIsPdf={snapshot.activeFileIsPdf}
        activeFileIsText={snapshot.activeFileIsText}
        fileLoading={snapshot.fileLoading}
        fileContent={snapshot.fileContent}
        fileSize={snapshot.fileSize}
        previewMode={snapshot.previewMode}
        renderSafety={snapshot.renderSafety}
        fileGuardMessage={snapshot.fileGuardMessage}
        fileGuardDetail={snapshot.fileGuardDetail}
        imageSrc={snapshot.imageSrc}
        imageMimeType={snapshot.imageMimeType}
        activeFileName={snapshot.activeFileName}
        activeFileLabel={snapshot.activeFileLabel}
        documentStatsLabel={snapshot.documentStatsLabel}
        saveStatus={snapshot.saveStatus}
        readOnly={snapshot.readOnly}
        showInlineAgent={snapshot.showInlineAgent}
        fileError={snapshot.fileError}
        exportNotice={snapshot.exportNotice}
        leftSidebarCollapsed={leftSidebarCollapsed}
        onToggleLeftSidebar={() => setLeftSidebarCollapsed((open) => !open)}
        onPickWorkspace={() => undefined}
      />
    </div>
  )
}
