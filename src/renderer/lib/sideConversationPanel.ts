// Kun SideConversationPanel chrome
// (../Kun/src/renderer/src/components/chat/SideConversationPanel.tsx).
// Visual only — used for production SideConversationPanel and preview hooks.

/** English copy matching Kun's sidePanelTitle locale string. */
export const SIDE_PANEL_TITLE = 'Side conversations'

/** English copy matching Kun's sidePanelNew locale string. */
export const SIDE_PANEL_NEW_LABEL = 'New side chat'

/** English copy matching Kun's sidePanelParentLabel locale string. */
export const SIDE_PANEL_PARENT_LABEL_TEMPLATE = 'From "{{title}}"'

/** English copy matching Kun's sidePanelParentMissing locale string. */
export const SIDE_PANEL_PARENT_MISSING = 'Side panel'

/** English copy matching Kun's sidePanelHide locale string. */
export const SIDE_PANEL_HIDE_LABEL = 'Hide side panel'

/** English copy matching Kun's sidePanelMinimize locale string. */
export const SIDE_PANEL_MINIMIZE_LABEL = 'Minimize side chat'

/** English copy matching Kun's sidePanelExpand locale string. */
export const SIDE_PANEL_EXPAND_LABEL = 'Expand side panel'

/** English copy matching Kun's sidePanelMore locale string. */
export const SIDE_PANEL_MORE_LABEL = 'More side chat actions'

/** English copy matching Kun's sidePanelPromote locale string. */
export const SIDE_PANEL_PROMOTE_LABEL = 'Promote'

/** English copy matching Kun's sidePanelDiscardTitle locale string. */
export const SIDE_PANEL_DISCARD_TITLE = 'Delete the underlying side thread.'

/** English copy matching Kun's sidePanelInheritedAt locale string. */
export const SIDE_PANEL_INHERITED_AT_TEMPLATE = 'Context from {{time}}'

/** English copy matching Kun's sidePanelThinking locale string. */
export const SIDE_PANEL_THINKING_LABEL = 'Thinking...'

/** English copy matching Kun's sidePanelEmpty locale string. */
export const SIDE_PANEL_EMPTY = 'No side conversation yet. Use /btw to open one.'

/** English copy matching Kun's sidePanelDraftEmpty locale string. */
export const SIDE_PANEL_DRAFT_EMPTY =
  'Ask a temporary question. A side thread is created only after you send.'

/** English copy matching Kun's sidePanelComposerPlaceholder locale string. */
export const SIDE_PANEL_COMPOSER_PLACEHOLDER = 'Ask in side chat'

export function formatSidePanelParentLabel(title: string): string {
  return SIDE_PANEL_PARENT_LABEL_TEMPLATE.replace('{{title}}', title)
}

export function formatSidePanelInheritedAt(time: string): string {
  return SIDE_PANEL_INHERITED_AT_TEMPLATE.replace('{{time}}', time)
}
