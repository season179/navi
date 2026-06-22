// Kun RuntimeMetaChips / RuntimeMetaBadges chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-bubbles.tsx,
//  ../Kun/src/renderer/src/components/chat/message-timeline-process.tsx).
// Visual only — used for production RuntimeMetaChips, RuntimeMetaBadges, and preview hooks.

/** English copy matching Kun's toolAttachments locale string. */
export const RUNTIME_META_ATTACHMENTS = 'Attachments'

/** English copy matching Kun's toolActiveSkills locale string. */
export const RUNTIME_META_ACTIVE_SKILLS = 'Skills'

/** English copy matching Kun's toolInjectedMemories locale string. */
export const RUNTIME_META_INJECTED_MEMORIES = 'Memories'

/** English copy matching Kun's toolChildAgent locale string. */
export const RUNTIME_META_CHILD_AGENT = 'Child agent'

/** English copy matching Kun's toolSources locale string. */
export const RUNTIME_META_SOURCES = 'Sources'

export function formatRuntimeMetaAttachmentsLabel(count: number): string {
  return `${RUNTIME_META_ATTACHMENTS} ${count}`
}

export function formatRuntimeMetaActiveSkillsLabel(count: number): string {
  return `${RUNTIME_META_ACTIVE_SKILLS} ${count}`
}

export function formatRuntimeMetaInjectedMemoriesLabel(count: number): string {
  return `${RUNTIME_META_INJECTED_MEMORIES} ${count}`
}

export function formatRuntimeMetaSourcesLabel(index: number): string {
  return `${RUNTIME_META_SOURCES} ${index + 1}`
}
