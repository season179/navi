// Composer `/skill` picker (plan §D4 / §D6). A `/`-triggered floating menu of
// available skills; selecting one injects a "use the X skill" hint into the
// composer draft. This is a FRONT-END ONLY shortcut — it does not call any
// backend trigger. Per §D4, navi trusts the agent: Flue already injects the
// skills catalog into the system prompt, so a natural-language hint is enough
// for the model to activate the skill. The picker just saves typing the name.
//
// Model: FloatingModelPicker — a floating panel anchored to the composer,
// filtering as the user types after the `/`. Opened when the draft is exactly a
// `/`-prefixed token at the start; closed on selection, Escape, or when the
// draft no longer matches.

import { useEffect, useMemo, useRef, useState } from 'react'
import type { SkillSummary } from '../../shared/flue'

interface SkillPickerProps {
  /** Available skills (from skills:list, scoped to the active project). */
  skills: SkillSummary[]
  /**
   * The query after the leading `/`. Empty ⇒ show all (most-relevant first).
   * The picker is shown only while the draft looks like `[/query]` at the very
   * start (the parent decides visibility; this component just filters).
   */
  query: string
  /** Fired when a skill is chosen. Parent injects the hint + closes. */
  onPick: (skill: SkillSummary) => void
  /** Fired on Escape / blur so the parent can reset. */
  onClose: () => void
}

function badgeCls(s: SkillSummary): string {
  if (s.source === 'built-in') return 'skill-badge skill-badge--built-in'
  if (s.source === 'project') return 'skill-badge skill-badge--project'
  return 'skill-badge skill-badge--global'
}

function badgeLabel(s: SkillSummary): string {
  if (s.source === 'built-in') return 'Built-in'
  if (s.source === 'project') return 'Project'
  return 'Global'
}

export function SkillPicker({ skills, query, onPick, onClose }: SkillPickerProps) {
  // Keyboard nav: up/down to move, Enter to pick, Escape to close.
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  // Only skills available right now are pickable (a disabled global or an
  // out-of-context project skill can't be activated by a hint, so offering it
  // would mislead). Sort by best match to the query.
  const available = useMemo(() => skills.filter((s) => s.availableNow), [skills])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return available
    // Prefer name starts-with, then name includes, then description includes.
    const starts = available.filter((s) => s.name.toLowerCase().startsWith(q))
    const includes = available.filter(
      (s) => !s.name.toLowerCase().startsWith(q) && s.name.toLowerCase().includes(q),
    )
    const desc = available.filter(
      (s) =>
        !s.name.toLowerCase().includes(q) && s.description.toLowerCase().includes(q),
    )
    return [...starts, ...includes, ...desc]
  }, [available, query])

  // Reset active index when the filtered set changes.
  useEffect(() => {
    setActive(0)
  }, [filtered])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && filtered[active]) {
        e.preventDefault()
        onPick(filtered[active])
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [filtered, active, onPick, onClose])

  // Keep the active row scrolled into view during keyboard nav.
  useEffect(() => {
    const root = listRef.current
    if (!root) return
    const row = root.children[active] as HTMLElement | undefined
    row?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (filtered.length === 0) {
    return (
      <div className="skill-picker">
        <div className="skill-picker-empty">No skills match “{query}”.</div>
      </div>
    )
  }

  return (
    <div className="skill-picker">
      <div className="skill-picker-hint">Pick a skill — adds a hint to your message</div>
      <div className="skill-picker-list" ref={listRef}>
        {filtered.map((s, i) => (
          <button
            key={`${s.source}:${s.name}`}
            className={i === active ? 'skill-picker-row is-active' : 'skill-picker-row'}
            onMouseEnter={() => setActive(i)}
            onClick={() => onPick(s)}
          >
            <span className="skill-picker-row-main">
              <span className="skill-picker-name">/{s.name}</span>
              <span className={badgeCls(s)}>{badgeLabel(s)}</span>
            </span>
            <span className="skill-picker-desc">{s.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
