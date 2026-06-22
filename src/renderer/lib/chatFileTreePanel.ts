// Kun ChatFileTreePanel chrome
// (../Kun/src/renderer/src/components/chat/ChatFileTreePanel.tsx).
// Visual only — used for production ChatFileTreePanel and preview hooks.

/** English copy matching Kun's fileTreeTitle locale string. */
export const FILE_TREE_TITLE = 'Files'

/** English copy matching Kun's fileTreeRefresh locale string. */
export const FILE_TREE_REFRESH_LABEL = 'Refresh file tree'

/** English copy matching Kun's fileTreeLoading locale string. */
export const FILE_TREE_LOADING_LABEL = 'Loading files…'

/** English copy matching Kun's fileTreeEmpty locale string. */
export const FILE_TREE_EMPTY = 'This workspace has no files yet.'

/** English copy matching Kun's fileTreeAddFileReference locale string. */
export const FILE_TREE_ADD_FILE_REFERENCE_LABEL = 'Add file reference'

/** English copy matching Kun's fileTreeAddFolderReference locale string. */
export const FILE_TREE_ADD_FOLDER_REFERENCE_LABEL = 'Add folder reference'

/** English copy matching Kun's fileTreeCopyAbsolutePath locale string. */
export const FILE_TREE_COPY_ABSOLUTE_PATH_LABEL = 'Copy absolute path'

/** English copy matching Kun's fileTreeCopyRelativePath locale string. */
export const FILE_TREE_COPY_RELATIVE_PATH_LABEL = 'Copy relative path'

/** English copy matching Kun's fileTreeRevealInFinder locale string. */
export const FILE_TREE_REVEAL_IN_FINDER_LABEL = 'Reveal in Finder'

/** English copy matching Kun's fileTreeRevealInFileManager locale string. */
export const FILE_TREE_REVEAL_IN_FILE_MANAGER_LABEL = 'Reveal in file manager'

export function formatChatFileTreeUnsupportedMessage(name: string): string {
  return `${name} is not a supported text preview.`
}

export function resolveChatFileTreeRevealLabel(platform: string): string {
  const normalized = platform.toLowerCase()
  if (normalized === 'darwin' || normalized.includes('mac')) {
    return FILE_TREE_REVEAL_IN_FINDER_LABEL
  }
  return FILE_TREE_REVEAL_IN_FILE_MANAGER_LABEL
}
