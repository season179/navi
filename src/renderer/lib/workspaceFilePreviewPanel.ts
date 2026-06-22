// Kun WorkspaceFilePreviewPanel chrome
// (../Kun/src/renderer/src/components/WorkspaceFilePreviewPanel.tsx).
// Visual only — used for production WorkspaceFilePreviewPanel and preview hooks.

/** English copy matching Kun's rightPanelCollapse locale string. */
export const WORKSPACE_FILE_PREVIEW_COLLAPSE_LABEL = 'Collapse right sidebar'

/** English copy matching Kun's filePreviewTitle locale string. */
export const WORKSPACE_FILE_PREVIEW_TITLE = 'File preview'

/** English copy matching Kun's filePreviewEmpty locale string. */
export const WORKSPACE_FILE_PREVIEW_EMPTY_LABEL = 'No file selected'

/** English copy matching Kun's filePreviewLoading locale string. */
export const WORKSPACE_FILE_PREVIEW_LOADING_LABEL = 'Reading file…'

/** English copy matching Kun's filePreviewFailed locale string. */
export const WORKSPACE_FILE_PREVIEW_FAILED_LABEL = 'Could not read the file.'

/** English copy matching Kun's filePreviewUnsupported locale string. */
export const WORKSPACE_FILE_PREVIEW_UNSUPPORTED_LABEL =
  'Preview is not supported for this file. Choose a text file.'

/** English copy matching Kun's filePreviewOpenEditor locale string. */
export const WORKSPACE_FILE_PREVIEW_OPEN_EDITOR_LABEL = 'Open in editor'

/** English copy matching Kun's filePreviewCopyPath locale string. */
export const WORKSPACE_FILE_PREVIEW_COPY_PATH_LABEL = 'Copy path'

/** English copy matching Kun's filePreviewCopyContent locale string. */
export const WORKSPACE_FILE_PREVIEW_COPY_CONTENT_LABEL = 'Copy full file'

/** English copy matching Kun's filePreviewClose locale string. */
export const WORKSPACE_FILE_PREVIEW_CLOSE_LABEL = 'Close file preview'

/** English copy matching Kun's filePreviewOpenFiles locale string. */
export const WORKSPACE_FILE_PREVIEW_OPEN_FILES_LABEL = 'Open files'

/** English copy matching Kun's filePreviewCloseTab locale string. */
export const WORKSPACE_FILE_PREVIEW_CLOSE_TAB_TEMPLATE = 'Close {{file}}'

/** English copy matching Kun's filePreviewRenderMarkdown locale string. */
export const WORKSPACE_FILE_PREVIEW_RENDER_MARKDOWN_LABEL = 'Render Markdown'

/** English copy matching Kun's filePreviewShowSource locale string. */
export const WORKSPACE_FILE_PREVIEW_SHOW_SOURCE_LABEL = 'Show Markdown source'

/** English copy matching Kun's filePreviewTruncated locale string. */
export const WORKSPACE_FILE_PREVIEW_TRUNCATED_LABEL = 'Truncated'

/** English copy matching Kun's copySuccess locale string. */
export const WORKSPACE_FILE_PREVIEW_COPY_SUCCESS_LABEL = 'Copied'

export function formatWorkspaceFilePreviewCloseTab(file: string): string {
  return WORKSPACE_FILE_PREVIEW_CLOSE_TAB_TEMPLATE.replace('{{file}}', file)
}
