// Claw route empty hero echoing Kun's ClawEmptyHero
// (../Kun/src/renderer/src/components/chat/message-timeline-empty.tsx).
// Visual only: parent supplies agent name and inbound-conversation state.

import type { ReactElement } from 'react'
import { GreetingMascot } from './Mascot'

type Props = {
  agentName?: string
  hasInboundConversation?: boolean
}

/** Sample agent name for ?clawEmptyHero=1 visual verification. */
export const CLAW_EMPTY_HERO_PREVIEW_AGENT_NAME = 'Navi Phone Agent'

function resolveAgentName(agentName?: string): string {
  const trimmed = agentName?.trim() ?? ''
  return trimmed || 'this assistant'
}

function heroSubtitle(hasInboundConversation: boolean): string {
  if (hasInboundConversation) {
    return 'Start chatting.'
  }
  return 'Send the first message in Feishu / Lark or WeChat to establish the conversation, then continue locally. Otherwise local messages cannot sync back to the matching channel.'
}

export function ClawEmptyHero({
  agentName,
  hasInboundConversation = true,
}: Props): ReactElement {
  const name = resolveAgentName(agentName)

  return (
    <div className="claw-empty-hero">
      <div className="claw-empty-hero-card">
        <div className="claw-empty-hero-inner">
          <div className="claw-empty-hero-icon-wrap">
            <GreetingMascot className="claw-empty-hero-mascot" />
          </div>

          <h1 className="claw-empty-hero-title">
            Start a conversation with {name}
          </h1>
          <p className="claw-empty-hero-sub">
            {heroSubtitle(hasInboundConversation)}
          </p>
        </div>
      </div>
    </div>
  )
}
