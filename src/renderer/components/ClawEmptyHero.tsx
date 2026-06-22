// Claw route empty hero echoing Kun's ClawEmptyHero
// (../Kun/src/renderer/src/components/chat/message-timeline-empty.tsx).
// Visual only: parent supplies agent name and inbound-conversation state.

import type { ReactElement } from 'react'
import {
  formatClawEmptyHeroTitle,
  resolveClawEmptyHeroSubtitle,
} from '../lib/clawEmptyHero'
import { GreetingMascot } from './Mascot'

type Props = {
  agentName?: string
  hasInboundConversation?: boolean
}

/** Sample agent name for ?clawEmptyHero=1 visual verification. */
export const CLAW_EMPTY_HERO_PREVIEW_AGENT_NAME = 'Navi Phone Agent'

export function ClawEmptyHero({
  agentName,
  hasInboundConversation = true,
}: Props): ReactElement {
  return (
    <div className="claw-empty-hero">
      <div className="claw-empty-hero-card">
        <div className="claw-empty-hero-inner">
          <div className="claw-empty-hero-icon-wrap">
            <GreetingMascot className="claw-empty-hero-mascot" />
          </div>

          <h1 className="claw-empty-hero-title">
            {formatClawEmptyHeroTitle(agentName)}
          </h1>
          <p className="claw-empty-hero-sub">
            {resolveClawEmptyHeroSubtitle(hasInboundConversation)}
          </p>
        </div>
      </div>
    </div>
  )
}
