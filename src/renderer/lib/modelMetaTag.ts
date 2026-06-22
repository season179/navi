// Kun ModelMetaTag chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-cards.tsx).
// Visual only — used for production ModelMetaTag and preview hooks.

/** English copy matching Kun's turnModelBadgeTitle locale string. */
export const MODEL_META_TAG_TITLE_TEMPLATE = 'Model for this turn: {{model}}'

export function formatModelMetaTagTitle(model: string): string {
  return MODEL_META_TAG_TITLE_TEMPLATE.replace('{{model}}', model)
}
