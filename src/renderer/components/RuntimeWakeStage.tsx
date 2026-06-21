// Mini workbench stage echoing Kun's KunHeroStage
// (../Kun/src/renderer/src/components/chat/KunHeroStage.tsx).
// Visual only: `waking` enables the loading animation (Zzz, sonar, bubbles, typing caret).

import type { ReactElement } from 'react'
import { PanelTop } from 'lucide-react'
import { SleepingMascot } from './Mascot'

type Props = {
  waking?: boolean
}

export function RuntimeWakeStage({ waking = false }: Props): ReactElement {
  return (
    <div
      className={waking ? 'runtime-wake-stage is-waking' : 'runtime-wake-stage'}
      aria-hidden="true"
    >
      <div className="runtime-wake-shell">
        <div className="runtime-wake-titlebar">
          <span className="runtime-wake-dot is-red" />
          <span className="runtime-wake-dot is-yellow" />
          <span className="runtime-wake-dot is-green" />
          <PanelTop className="runtime-wake-titlebar-icon" strokeWidth={1.7} />
        </div>
        <div className="runtime-wake-body">
          <div className="runtime-wake-nav">
            <span className="is-active" />
            <span />
            <span />
            <span />
          </div>
          <div className="runtime-wake-canvas">
            <span className="runtime-wake-thread is-one" />
            <span className="runtime-wake-thread is-two" />
            <span className="runtime-wake-thread is-three" />
            {waking ? (
              <span className="runtime-wake-bubbles">
                <i />
                <i />
                <i />
                <i />
              </span>
            ) : null}
          </div>
        </div>
        <span className="runtime-wake-flow is-left" />
        <span className="runtime-wake-flow is-right" />
        <div className="runtime-wake-composer">
          <span />
          {waking ? <i className="runtime-wake-caret" /> : null}
          <span />
        </div>
        <div className="runtime-wake-core">
          {waking ? (
            <>
              <span className="runtime-wake-sonar is-one" />
              <span className="runtime-wake-sonar is-two" />
            </>
          ) : null}
          <span className="runtime-wake-ring" />
          <span className="runtime-wake-mascot-bob">
            <SleepingMascot className="runtime-wake-mascot" />
            {waking ? (
              <span className="runtime-wake-zzz">
                <i>z</i>
                <i>z</i>
                <i>z</i>
              </span>
            ) : null}
          </span>
        </div>
      </div>
    </div>
  )
}
