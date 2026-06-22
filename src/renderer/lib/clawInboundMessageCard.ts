// Kun ClawInboundMessageCard chrome
// (../Kun/src/renderer/src/components/chat/message-timeline-bubbles.tsx).
// Visual only — used for production ClawInboundMessageCard and preview hooks.

/** English copy matching Kun's claw locale string (default inbound source). */
export const CLAW_INBOUND_DEFAULT_SOURCE = 'Connect phone'

/** English copy matching Kun's clawTimelineInbound locale string. */
export const CLAW_INBOUND_HEADER_TEMPLATE = 'From {{source}}'

/** English copy matching Kun's clawTimelineSender locale string. */
export const CLAW_INBOUND_SENDER_TEMPLATE = 'Sender {{sender}}'

/** English copy matching Kun's clawTimelineChatType locale string. */
export const CLAW_INBOUND_CHAT_TYPE_TEMPLATE = '{{chatType}} chat'

/** English copy matching Kun's clawTimelineMessageType locale string. */
export const CLAW_INBOUND_MESSAGE_TYPE_TEMPLATE = '{{messageType}} message'

/** English copy matching Kun's clawTimelineMentions locale string. */
export const CLAW_INBOUND_MENTIONS_TEMPLATE = 'Mentions {{mentions}}'

export type ClawInboundMessageDisplay = {
  sourceLabel?: string
  sender?: string
  chatType?: string
  messageType?: string
  mentions?: string
}

export function formatClawInboundHeader(sourceLabel?: string): string {
  const source = sourceLabel?.trim() || CLAW_INBOUND_DEFAULT_SOURCE
  return CLAW_INBOUND_HEADER_TEMPLATE.replace('{{source}}', source)
}

export function formatClawInboundMetaChips(display: ClawInboundMessageDisplay): string[] {
  const chips: string[] = []
  if (display.sender?.trim()) {
    chips.push(
      CLAW_INBOUND_SENDER_TEMPLATE.replace('{{sender}}', display.sender.trim()),
    )
  }
  if (display.chatType?.trim()) {
    chips.push(
      CLAW_INBOUND_CHAT_TYPE_TEMPLATE.replace('{{chatType}}', display.chatType.trim()),
    )
  }
  if (display.messageType?.trim()) {
    chips.push(
      CLAW_INBOUND_MESSAGE_TYPE_TEMPLATE.replace(
        '{{messageType}}',
        display.messageType.trim(),
      ),
    )
  }
  if (display.mentions?.trim()) {
    chips.push(
      CLAW_INBOUND_MENTIONS_TEMPLATE.replace('{{mentions}}', display.mentions.trim()),
    )
  }
  return chips
}
