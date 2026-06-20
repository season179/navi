// A static "mini workbench" hero stage echoing Kun's empty-state illustration:
// a faux app window with a traffic-light titlebar, a nav rail, a canvas of
// placeholder threads, and the sleeping whale mascot resting in the center.

import { SleepingMascot } from './Mascot'

export function HeroStage() {
  return (
    <div className="hero-stage" aria-hidden="true">
      <svg viewBox="0 0 420 240" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="navi-stage-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--stage-canvas-top)" />
            <stop offset="100%" stopColor="var(--stage-canvas-bottom)" />
          </linearGradient>
          <linearGradient id="navi-stage-frame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ds-surface-elevated)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--ds-surface-elevated)" stopOpacity="0.7" />
          </linearGradient>
          <radialGradient id="navi-stage-glow" cx="50%" cy="58%" r="42%">
            <stop offset="0%" stopColor="var(--mascot-water)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--mascot-water)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* outer frame / app window */}
        <rect x="40" y="20" width="340" height="200" rx="20" fill="url(#navi-stage-frame)" stroke="var(--ds-border-muted)" strokeWidth="1" />

        {/* titlebar */}
        <rect x="40" y="20" width="340" height="26" rx="20" fill="var(--stage-canvas-top)" opacity="0.6" />
        <circle cx="56" cy="33" r="4" fill="#ff5f57" />
        <circle cx="70" cy="33" r="4" fill="#febc2e" />
        <circle cx="84" cy="33" r="4" fill="#28c840" />

        {/* left nav rail */}
        <rect x="40" y="46" width="46" height="174" rx="0" fill="var(--stage-nav)" opacity="0.7" />
        <rect x="52" y="60" width="22" height="6" rx="3" fill="var(--stage-nav-active)" />
        <rect x="52" y="74" width="22" height="6" rx="3" fill="var(--stage-nav)" opacity="0.6" />
        <rect x="52" y="88" width="22" height="6" rx="3" fill="var(--stage-nav)" opacity="0.6" />
        <rect x="52" y="102" width="22" height="6" rx="3" fill="var(--stage-nav)" opacity="0.6" />

        {/* canvas area with placeholder threads */}
        <rect x="98" y="60" width="140" height="10" rx="5" fill="var(--stage-thread)" />
        <rect x="98" y="80" width="200" height="8" rx="4" fill="var(--stage-thread)" opacity="0.6" />
        <rect x="98" y="96" width="170" height="8" rx="4" fill="var(--stage-thread)" opacity="0.45" />
        <rect x="98" y="120" width="120" height="10" rx="5" fill="var(--stage-thread)" opacity="0.7" />
        <rect x="98" y="140" width="180" height="8" rx="4" fill="var(--stage-thread)" opacity="0.5" />

        {/* composer bar at bottom of frame */}
        <rect x="98" y="178" width="262" height="22" rx="11" fill="var(--stage-composer)" stroke="var(--ds-border-muted)" strokeWidth="1" />
        <circle cx="346" cy="189" r="6" fill="var(--ds-accent)" />

        {/* central glow + mascot */}
        <ellipse cx="230" cy="150" rx="80" ry="48" fill="url(#navi-stage-glow)" />
      </svg>

      {/* Mascot overlaid in the center, gently bobbing */}
      <div
        className="mascot-bob"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '120px',
          transform: 'translate(-50%, -42%)',
        }}
      >
        <SleepingMascot style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
    </div>
  )
}
