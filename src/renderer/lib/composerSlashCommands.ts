// Maps navi skills into Kun FloatingComposer slash-menu rows for production
// Composer. Visual only — picking a row injects a natural-language hint.

import type { SkillSummary, SkillSource } from '../../shared/flue'

export interface SkillSlashCommandData {
  id: string
  skillName: string
  title: string
  description: string
  badge: string
  scopeLabel: string
  disabled: boolean
}

function scopeLabel(source: SkillSource): string {
  if (source === 'built-in') return 'Built-in'
  if (source === 'project') return 'Project'
  return 'Global'
}

/** Filter available skills into slash-menu rows matching the typed `/query`. */
export function filterSkillSlashCommands(
  skills: SkillSummary[],
  query: string,
): SkillSlashCommandData[] {
  const available = skills.filter((skill) => skill.availableNow)
  const q = query.trim().toLowerCase()

  const filtered = !q
    ? available
    : (() => {
        const starts = available.filter((skill) => skill.name.toLowerCase().startsWith(q))
        const includes = available.filter(
          (skill) =>
            !skill.name.toLowerCase().startsWith(q) && skill.name.toLowerCase().includes(q),
        )
        const desc = available.filter(
          (skill) =>
            !skill.name.toLowerCase().includes(q) &&
            skill.description.toLowerCase().includes(q),
        )
        return [...starts, ...includes, ...desc]
      })()

  return filtered.map((skill) => ({
    id: `skill:${skill.name}`,
    skillName: skill.name,
    title: skill.name,
    description: skill.description,
    badge: `/skill:${skill.name}`,
    scopeLabel: scopeLabel(skill.source),
    disabled: !skill.availableNow,
  }))
}
