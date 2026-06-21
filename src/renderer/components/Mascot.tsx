// Inline SVG mascots for Navi, drawn to echo Kun's whale + small-bird figure.
// These are purely decorative (visual only) so they stay self-contained.

import type { CSSProperties } from 'react'

type MascotProps = {
  className?: string
  style?: CSSProperties
}

/**
 * Sleeping Kun whale — body curled with a closed eye and a "Zzz" mark.
 * Used as the centerpiece of the empty hero stage.
 */
export function SleepingMascot({ className, style }: MascotProps) {
  return (
    <svg viewBox="0 0 120 96" className={className} style={style} aria-hidden="true">
      {/* soft water shadow */}
      <ellipse cx="60" cy="84" rx="40" ry="6" fill="var(--mascot-water)" />
      {/* body */}
      <path
        d="M22 58 C22 40 38 30 58 30 C80 30 98 40 100 54 C101 60 96 64 90 64 L34 64 C27 64 22 62 22 58 Z"
        fill="var(--mascot-body)"
      />
      {/* belly */}
      <path
        d="M30 58 C32 50 44 46 58 46 C74 46 88 50 92 58 L30 58 Z"
        fill="var(--mascot-belly)"
        opacity="0.85"
      />
      {/* tail */}
      <path
        d="M18 56 C10 52 6 46 8 42 C12 44 16 48 20 54 Z M18 60 C10 64 6 70 8 74 C12 72 16 68 20 62 Z"
        fill="var(--mascot-body)"
      />
      {/* closed eye */}
      <path d="M44 44 q4 4 8 0" stroke="#14305f" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* spout puff */}
      <circle cx="60" cy="26" r="3" fill="var(--mascot-belly)" opacity="0.7" />
      <circle cx="68" cy="20" r="2" fill="var(--mascot-belly)" opacity="0.5" />
      {/* Zzz */}
      <text x="74" y="34" fontSize="11" fill="var(--mascot-body)" opacity="0.7" fontFamily="inherit">z</text>
    </svg>
  )
}

/**
 * Greeting bird figure — raised wing pose with a gentle wave animation
 * matching Kun's ds-kun-state-greet figure in ClawEmptyHero.
 */
export function GreetingMascot({ className, style }: MascotProps) {
  return (
    <svg viewBox="0 0 56 56" className={className} style={style} aria-hidden="true">
      <ellipse cx="28" cy="48" rx="12" ry="2.5" fill="var(--mascot-water)" opacity="0.5" />
      <path
        d="M14 34 C14 26 18 22 26 22 C34 22 40 26 40 32 C40 36 37 38 33 38 L18 38 C15 38 14 36 14 34 Z"
        fill="var(--mascot-body)"
      />
      <circle cx="30" cy="28" r="7" fill="var(--mascot-body)" />
      <path d="M34 28 l7 -2 l-7 4 z" fill="var(--mascot-beak)" />
      <circle cx="31" cy="27" r="1.4" fill="#14305f" />
      <path
        d="M18 32 C12 28 8 24 10 18 C14 20 17 24 19 30 Z"
        fill="var(--mascot-body)"
        className="greeting-mascot-wing"
      />
      <path d="M22 36 l-5 2 l5 -1 z" fill="var(--mascot-body)" opacity="0.85" />
    </svg>
  )
}

/**
 * Sitting Kun whale — upright pose with folded flippers, matching Kun's
 * ds-kun-state-sit figure in the workspace-select empty hero.
 */
export function SitMascot({ className, style }: MascotProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden="true">
      <ellipse cx="32" cy="56" rx="18" ry="3" fill="var(--mascot-water)" opacity="0.55" />
      <path
        d="M18 44 C18 30 24 22 34 22 C44 22 50 28 50 38 C50 44 46 48 40 48 L24 48 C20 48 18 46 18 44 Z"
        fill="var(--mascot-body)"
      />
      <path
        d="M22 44 C24 36 28 34 34 34 C40 34 44 36 46 44 L22 44 Z"
        fill="var(--mascot-belly)"
        opacity="0.85"
      />
      <circle cx="28" cy="32" r="10" fill="var(--mascot-body)" />
      <circle cx="31" cy="31" r="1.6" fill="#14305f" />
      <path d="M36 31 l6 -1 l-6 3 z" fill="var(--mascot-beak)" />
      <path d="M20 38 C14 36 12 32 14 28 C17 30 19 34 21 38 Z" fill="var(--mascot-body)" />
      <path d="M48 38 C54 36 56 32 54 28 C51 30 49 34 47 38 Z" fill="var(--mascot-body)" />
    </svg>
  )
}

/**
 * A small bird figure (Kun's companion) perched near the whale.
 */
export function CompanionBird({ className, style }: MascotProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} style={style} aria-hidden="true">
      <ellipse cx="20" cy="34" rx="9" ry="2" fill="var(--mascot-water)" opacity="0.5" />
      <path
        d="M10 24 C10 16 15 12 22 12 C30 12 34 17 34 23 C34 28 30 30 25 30 L14 30 C11 30 10 28 10 24 Z"
        fill="var(--mascot-body)"
      />
      <circle cx="24" cy="20" r="5" fill="var(--mascot-body)" />
      <path d="M27 20 l5 -1 l-5 3 z" fill="var(--mascot-beak)" />
      <circle cx="25" cy="19" r="1.2" fill="#14305f" />
      <path d="M14 24 l-4 -2 l4 1 z" fill="var(--mascot-body)" />
    </svg>
  )
}
