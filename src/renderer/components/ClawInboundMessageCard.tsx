// Claw inbound message card echoing Kun's ClawInboundMessageCard
// (../Kun/src/renderer/src/components/chat/message-timeline-bubbles.tsx).
// Visual only: parent supplies display metadata and message text.

import type { ReactElement } from 'react'
import { MessageSquareQuote } from 'lucide-react'
import {
  formatClawInboundHeader,
  formatClawInboundMetaChips,
  type ClawInboundMessageDisplay,
} from '../lib/clawInboundMessageCard'

export type { ClawInboundMessageDisplay }

type Props = {
  display: ClawInboundMessageDisplay
  text: string
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
  display: {},
  text: 'Ping — are you there?',
}

export function ClawInboundMessageCard({ display, text }: Props): ReactElement {
  const meta = formatClawInboundMetaChips(display)

  return (
    <div className="claw-inbound-message-card">
      <div className="claw-inbound-message-card-header">
        <MessageSquareQuote className="claw-inbound-message-card-icon" strokeWidth={1.8} />
        <span>{formatClawInboundHeader(display.sourceLabel)}</span>
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
