// Write-mode document pane echoing Kun's WriteWorkspaceDocumentPane
// (../Kun/src/renderer/src/components/write/WriteWorkspaceDocumentPane.tsx).
// Visual only: composes ported editor/preview surfaces without TipTap runtime or IPC.

import { useState, type ReactElement, type RefObject } from 'react'
import { WriteWorkspaceStart, WRITE_WORKSPACE_START_PREVIEW } from './WriteWorkspaceStart'
import { WriteImagePreview, WRITE_IMAGE_PREVIEW_SAMPLE } from './WriteImagePreview'
import { WritePdfViewer, WRITE_PDF_VIEWER_PREVIEW_SAMPLE } from './WritePdfViewer'
import {
  WriteMarkdownEditor,
  WRITE_MARKDOWN_EDITOR_PREVIEW_SAMPLE,
} from './WriteMarkdownEditor'
import { WriteRichEditor } from './WriteRichEditor'
import {
  WriteMarkdownPreview,
  WRITE_MARKDOWN_PREVIEW_SAMPLE,
} from './WriteMarkdownPreview'
import type { WriteWorkspaceDocumentPanePreviewMode } from '../lib/writeWorkspaceDocumentPanePreviewModes'

export type { WriteWorkspaceDocumentPanePreviewMode } from '../lib/writeWorkspaceDocumentPanePreviewModes'

const COPY = {
  filePreviewLoading: 'Reading file…',
  writeUnsupportedFileType:
    'Write currently opens only Markdown, TXT, PDF, and common image files.',
  writePreviewErrorFallback: 'Markdown preview failed, showing source text instead.',
  writeLargeFileSafeMode:
    'This file is large, so Markdown live rendering has been turned off to avoid a blank Write screen.',
  writeLargeFileSafeModeSub:
    'You can still edit and save normally; the preview pane falls back to plain text.',
  writeLargeFileTruncated:
    'This file is too large for Write to load fully right now. To avoid overwriting missing content, it has been opened read-only with Markdown rendering turned off.',
}

export type WriteRenderNotice = 'none' | 'large-file' | 'truncated'

export type WriteRenderSafety = {
  livePreviewEnabled: boolean
  markdownPreviewEnabled: boolean
  readOnly: boolean
  notice: WriteRenderNotice
}

export type WriteDocumentPreviewMode = 'source' | 'live' | 'split' | 'preview'

type Props = {
  activeFilePath: string | null
  activeFileIsImage?: boolean
  activeFileIsPdf?: boolean
  activeFileIsText?: boolean
  fileLoading?: boolean
  fileContent?: string
  imageSrc?: string
  imageMimeType?: string
  fileSize?: number
  workspaceRoot?: string
  workspaceName?: string
  workspacePathLabel?: string
  renderSafety?: WriteRenderSafety
  fileGuardMessage?: string
  fileGuardDetail?: string
  previewMode?: WriteDocumentPreviewMode
  /** Kun rich-mode TipTap surface (toolbar modeMenu rich). */
  richModeActive?: boolean
  isMarkdown?: boolean
  onAskAssistant?: () => void
  onCreateDraft?: () => void
  onPickWorkspace?: () => void
  onRefreshWorkspace?: () => void
  onContentChange?: (content: string) => void
  /** Scroll-sync anchors for split mode (Kun WriteWorkspaceDocumentPane refs). */
  editorPaneRef?: RefObject<HTMLDivElement | null>
  previewPaneRef?: RefObject<HTMLDivElement | null>
}

function editorWidthClass(previewMode: WriteDocumentPreviewMode): string {
  return previewMode === 'split'
    ? 'write-document-pane-editor write-document-pane-editor-split'
    : 'write-document-pane-editor'
}

function previewWidthClass(previewMode: WriteDocumentPreviewMode): string {
  return previewMode === 'split'
    ? 'write-document-pane-preview-col write-document-pane-preview-col-split'
    : 'write-document-pane-preview-col'
}

function editorVisible(previewMode: WriteDocumentPreviewMode): boolean {
  return previewMode !== 'preview'
}

function previewVisible(previewMode: WriteDocumentPreviewMode): boolean {
  return previewMode === 'split' || previewMode === 'preview'
}

function editorAppearance(
  previewMode: WriteDocumentPreviewMode,
  renderSafety: WriteRenderSafety,
): 'source' | 'live' {
  if (previewMode === 'source') return 'source'
  if (previewMode === 'live' || previewMode === 'split' || previewMode === 'preview') {
    return renderSafety.livePreviewEnabled ? 'live' : 'source'
  }
  return 'source'
}

export function WriteWorkspaceDocumentPane({
  activeFilePath,
  activeFileIsImage = false,
  activeFileIsPdf = false,
  activeFileIsText = false,
  fileLoading = false,
  fileContent = '',
  imageSrc = WRITE_IMAGE_PREVIEW_SAMPLE.src,
  imageMimeType = WRITE_IMAGE_PREVIEW_SAMPLE.mimeType,
  fileSize = 0,
  workspaceRoot = WRITE_PDF_VIEWER_PREVIEW_SAMPLE.workspaceRoot,
  workspaceName = WRITE_WORKSPACE_START_PREVIEW.workspaceName,
  workspacePathLabel = WRITE_WORKSPACE_START_PREVIEW.workspacePathLabel,
  renderSafety = {
    livePreviewEnabled: true,
    markdownPreviewEnabled: true,
    readOnly: false,
    notice: 'none',
  },
  fileGuardMessage = '',
  fileGuardDetail = '',
  previewMode = 'split',
  richModeActive = false,
  isMarkdown = true,
  onAskAssistant,
  onCreateDraft,
  onPickWorkspace,
  onRefreshWorkspace,
  onContentChange,
  editorPaneRef,
  previewPaneRef,
}: Props): ReactElement {
  if (!activeFilePath) {
    return (
      <WriteWorkspaceStart
        workspaceName={workspaceName}
        workspacePathLabel={workspacePathLabel}
        onAskAssistant={onAskAssistant}
        onCreateDraft={onCreateDraft}
        onPickWorkspace={onPickWorkspace}
        onRefreshWorkspace={onRefreshWorkspace}
      />
    )
  }

  if (fileLoading) {
    return (
      <div className="write-document-pane-loading">
        {COPY.filePreviewLoading}
      </div>
    )
  }

  if (activeFileIsImage) {
    return (
      <WriteImagePreview
        src={imageSrc}
        filePath={activeFilePath}
        mimeType={imageMimeType}
        size={fileSize}
        workspaceRoot={workspaceRoot}
      />
    )
  }

  if (activeFileIsPdf) {
    return (
      <WritePdfViewer
        filePath={activeFilePath}
        size={fileSize}
        workspaceRoot={workspaceRoot}
      />
    )
  }

  if (!activeFileIsText) {
    return (
      <div className="write-document-pane-loading">
        {COPY.writeUnsupportedFileType}
      </div>
    )
  }

  const showEditor = richModeActive || editorVisible(previewMode)
  const showPreview = !richModeActive && previewVisible(previewMode)
  const appearance = editorAppearance(previewMode, renderSafety)

  return (
    <div className="write-document-pane-shell">
      {renderSafety.notice !== 'none' && fileGuardMessage ? (
        <div className="write-document-pane-guard">
          <div className="write-document-pane-guard-title">{fileGuardMessage}</div>
          {fileGuardDetail ? (
            <div className="write-document-pane-guard-detail">{fileGuardDetail}</div>
          ) : null}
        </div>
      ) : null}
      <div className="write-document-pane-columns">
        {showEditor ? (
          <div
            ref={editorPaneRef}
            className={`${editorWidthClass(previewMode)} write-document-pane-editor-scroll-root`}
          >
            {richModeActive && renderSafety.livePreviewEnabled ? (
              <WriteRichEditor
                value={fileContent}
                readOnly={renderSafety.readOnly}
                fallback={
                  <WriteMarkdownEditor
                    value={fileContent}
                    appearance="live"
                    readOnly={renderSafety.readOnly}
                    onChange={renderSafety.readOnly ? undefined : onContentChange}
                  />
                }
              />
            ) : (
              <WriteMarkdownEditor
                value={fileContent}
                appearance={appearance}
                readOnly={renderSafety.readOnly}
                onChange={renderSafety.readOnly ? undefined : onContentChange}
              />
            )}
          </div>
        ) : null}
        {showPreview ? (
          <div ref={previewPaneRef} className={previewWidthClass(previewMode)}>
            <WriteMarkdownPreview
              content={fileContent}
              isMarkdown={isMarkdown && renderSafety.markdownPreviewEnabled}
              previewErrorMessage={COPY.writePreviewErrorFallback}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function previewSnapshot(mode: WriteWorkspaceDocumentPanePreviewMode): {
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
  imageSrc?: string
  imageMimeType?: string
} {
  const samplePath = '/Users/season/writing/docs/launch-plan.md'

  if (mode === 'start') {
    return {
      activeFilePath: null,
      activeFileIsImage: false,
      activeFileIsPdf: false,
      activeFileIsText: false,
      fileLoading: false,
      fileContent: '',
      fileSize: 0,
      previewMode: 'split',
      renderSafety: {
        livePreviewEnabled: true,
        markdownPreviewEnabled: true,
        readOnly: false,
        notice: 'none',
      },
      fileGuardMessage: '',
      fileGuardDetail: '',
    }
  }

  if (mode === 'loading') {
    return {
      activeFilePath: samplePath,
      activeFileIsImage: false,
      activeFileIsPdf: false,
      activeFileIsText: true,
      fileLoading: true,
      fileContent: '',
      fileSize: 0,
      previewMode: 'split',
      renderSafety: {
        livePreviewEnabled: true,
        markdownPreviewEnabled: true,
        readOnly: false,
        notice: 'none',
      },
      fileGuardMessage: '',
      fileGuardDetail: '',
    }
  }

  if (mode === 'image') {
    return {
      activeFilePath: WRITE_IMAGE_PREVIEW_SAMPLE.filePath,
      activeFileIsImage: true,
      activeFileIsPdf: false,
      activeFileIsText: false,
      fileLoading: false,
      fileContent: '',
      fileSize: WRITE_IMAGE_PREVIEW_SAMPLE.size,
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
    }
  }

  if (mode === 'pdf') {
    return {
      activeFilePath: WRITE_PDF_VIEWER_PREVIEW_SAMPLE.filePath,
      activeFileIsImage: false,
      activeFileIsPdf: true,
      activeFileIsText: false,
      fileLoading: false,
      fileContent: '',
      fileSize: WRITE_PDF_VIEWER_PREVIEW_SAMPLE.size,
      previewMode: 'split',
      renderSafety: {
        livePreviewEnabled: true,
        markdownPreviewEnabled: true,
        readOnly: false,
        notice: 'none',
      },
      fileGuardMessage: '',
      fileGuardDetail: '',
    }
  }

  if (mode === 'unsupported') {
    return {
      activeFilePath: '/Users/season/writing/archive/project.zip',
      activeFileIsImage: false,
      activeFileIsPdf: false,
      activeFileIsText: false,
      fileLoading: false,
      fileContent: '',
      fileSize: 4_194_304,
      previewMode: 'split',
      renderSafety: {
        livePreviewEnabled: true,
        markdownPreviewEnabled: true,
        readOnly: false,
        notice: 'none',
      },
      fileGuardMessage: '',
      fileGuardDetail: '',
    }
  }

  if (mode === 'largeFile') {
    return {
      activeFilePath: samplePath,
      activeFileIsImage: false,
      activeFileIsPdf: false,
      activeFileIsText: true,
      fileLoading: false,
      fileContent: WRITE_MARKDOWN_EDITOR_PREVIEW_SAMPLE,
      fileSize: 420_000,
      previewMode: 'split',
      renderSafety: {
        livePreviewEnabled: false,
        markdownPreviewEnabled: false,
        readOnly: false,
        notice: 'large-file',
      },
      fileGuardMessage: COPY.writeLargeFileSafeMode,
      fileGuardDetail: COPY.writeLargeFileSafeModeSub,
    }
  }

  if (mode === 'truncated') {
    return {
      activeFilePath: samplePath,
      activeFileIsImage: false,
      activeFileIsPdf: false,
      activeFileIsText: true,
      fileLoading: false,
      fileContent: WRITE_MARKDOWN_EDITOR_PREVIEW_SAMPLE,
      fileSize: 900_000,
      previewMode: 'source',
      renderSafety: {
        livePreviewEnabled: false,
        markdownPreviewEnabled: false,
        readOnly: true,
        notice: 'truncated',
      },
      fileGuardMessage: COPY.writeLargeFileTruncated,
      fileGuardDetail: '',
    }
  }

  if (mode === 'liveDisabled') {
    return {
      activeFilePath: samplePath,
      activeFileIsImage: false,
      activeFileIsPdf: false,
      activeFileIsText: true,
      fileLoading: false,
      fileContent: WRITE_MARKDOWN_EDITOR_PREVIEW_SAMPLE,
      fileSize: 12_480,
      previewMode: 'live',
      renderSafety: {
        livePreviewEnabled: false,
        markdownPreviewEnabled: true,
        readOnly: false,
        notice: 'none',
      },
      fileGuardMessage: '',
      fileGuardDetail: '',
    }
  }

  const previewMode: WriteDocumentPreviewMode =
    mode === 'source'
      ? 'source'
      : mode === 'live'
        ? 'live'
        : mode === 'preview'
          ? 'preview'
          : mode === 'rich'
            ? 'live'
            : 'split'

  return {
    activeFilePath: samplePath,
    activeFileIsImage: false,
    activeFileIsPdf: false,
    activeFileIsText: true,
    fileLoading: false,
    fileContent: WRITE_MARKDOWN_PREVIEW_SAMPLE,
    fileSize: 12_480,
    previewMode,
    renderSafety: {
      livePreviewEnabled: previewMode === 'live' || previewMode === 'split' || mode === 'rich',
      markdownPreviewEnabled: true,
      readOnly: false,
      notice: 'none',
    },
    fileGuardMessage: '',
    fileGuardDetail: '',
  }
}

type PreviewProps = {
  mode: WriteWorkspaceDocumentPanePreviewMode
}

/** Full-page preview shell for ?writeWorkspaceDocumentPane URL hooks. */
export function WriteWorkspaceDocumentPanePreview({ mode }: PreviewProps): ReactElement {
  const snapshot = previewSnapshot(mode)
  const [fileContent, setFileContent] = useState(snapshot.fileContent)

  return (
    <div className="write-workspace-document-pane-preview">
      <div className="write-workspace-document-pane-card">
        <WriteWorkspaceDocumentPane
          activeFilePath={snapshot.activeFilePath}
          activeFileIsImage={snapshot.activeFileIsImage}
          activeFileIsPdf={snapshot.activeFileIsPdf}
          activeFileIsText={snapshot.activeFileIsText}
          fileLoading={snapshot.fileLoading}
          fileContent={fileContent}
          fileSize={snapshot.fileSize}
          workspaceRoot={WRITE_PDF_VIEWER_PREVIEW_SAMPLE.workspaceRoot}
          workspaceName={WRITE_WORKSPACE_START_PREVIEW.workspaceName}
          workspacePathLabel={WRITE_WORKSPACE_START_PREVIEW.workspacePathLabel}
          renderSafety={snapshot.renderSafety}
          fileGuardMessage={snapshot.fileGuardMessage}
          fileGuardDetail={snapshot.fileGuardDetail}
          previewMode={snapshot.previewMode}
          richModeActive={mode === 'rich'}
          imageSrc={snapshot.imageSrc}
          imageMimeType={snapshot.imageMimeType}
          onContentChange={setFileContent}
        />
      </div>
    </div>
  )
}
