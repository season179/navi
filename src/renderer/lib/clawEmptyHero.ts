// Kun ClawEmptyHero chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-empty.tsx).
// Visual only — used for production ClawEmptyHero and preview hooks.

/** English copy matching Kun's clawEmptyHeroFallbackName locale string. */
export const CLAW_EMPTY_HERO_FALLBACK_NAME = 'this assistant'

/** English copy matching Kun's clawEmptyHeroTitle locale string. */
export const CLAW_EMPTY_HERO_TITLE_TEMPLATE = 'Start a conversation with {{name}}'

/** English copy matching Kun's clawEmptyHeroSub locale string. */
export const CLAW_EMPTY_HERO_SUB = 'Start chatting.'

/** English copy matching Kun's clawEmptyHeroNeedsInbound locale string. */
export const CLAW_EMPTY_HERO_NEEDS_INBOUND =
  'Send the first message in Feishu / Lark or WeChat to establish the conversation, then continue locally. Otherwise local messages cannot sync back to the matching channel.'

export function resolveClawEmptyHeroAgentName(agentName?: string): string {
  const trimmed = agentName?.trim() ?? ''
  return trimmed || CLAW_EMPTY_HERO_FALLBACK_NAME
}

export function formatClawEmptyHeroTitle(agentName?: string): string {
  const name = resolveClawEmptyHeroAgentName(agentName)
  return CLAW_EMPTY_HERO_TITLE_TEMPLATE.replace('{{name}}', name)
}

export function resolveClawEmptyHeroSubtitle(hasInboundConversation: boolean): string {
  return hasInboundConversation ? CLAW_EMPTY_HERO_SUB : CLAW_EMPTY_HERO_NEEDS_INBOUND
}
