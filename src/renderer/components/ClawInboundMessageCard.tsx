// Claw inbound message card echoing Kun's ClawInboundMessageCard
// (../Kun/src/renderer/src/components/chat/message-timeline-bubbles.tsx).
// Visual only: parent supplies display metadata and message text.

import type { ReactElement } from 'react'
import { MessageSquareQuote } from 'lucide-react'

export type ClawInboundMessageDisplay = {
  sourceLabel?: string
  sender?: string
  chatType?: string
  messageType?: string
  mentions?: string
}

type Props = {
  display: ClawInboundMessageDisplay
  text: string
}

function formatMetaChips(display: ClawInboundMessageDisplay): string[] {
  const chips: string[] = []
  if (display.sender) chips.push(`Sender ${display.sender}`)
  if (display.chatType) chips.push(`${display.chatType} chat`)
  if (display.messageType) chips.push(`${display.messageType} message`)
  if (display.mentions) chips.push(`Mentions ${display.mentions}`)
  return chips
}

/** Sample data for ?clawInboundMessageCard=1 visual verification. */
export const CLAW_INBOUND_MESSAGE_CARD_PREVIEW = {
  display: {
    sourceLabel: 'Telegram',
    sender: '@season',
    chatType: 'group',
    messageType: 'text',
    mentions: '@navi',
  },
  text: 'Can you summarize what we discussed yesterday about the deployment plan?',
}

/** Minimal sample without meta chips for ?clawInboundMessageCard=minimal. */
export const CLAW_INBOUND_MESSAGE_CARD_PREVIEW_MINIMAL = {
  display: {
    sourceLabel: 'Claw',
  },
  text: 'Ping — are you there?',
}

export function ClawInboundMessageCard({ display, text }: Props): ReactElement {
  const meta = formatMetaChips(display)
  const source = display.sourceLabel ?? 'Claw'

  return (
    <div className="claw-inbound-message-card">
      <div className="claw-inbound-message-card-header">
        <MessageSquareQuote className="claw-inbound-message-card-icon" strokeWidth={1.8} />
        <span>From {source}</span>
      </div>
      <div className="claw-inbound-message-card-text">{text}</div>
      {meta.length > 0 ? (
        <div className="claw-inbound-message-card-meta">
          {meta.map((item) => (
            <span key={item} className="claw-inbound-message-card-chip">
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
