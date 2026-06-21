// Maps navi skills into Kun FloatingComposer slash-menu rows for production
// Composer. Visual only — picking a row injects a natural-language hint.

import type { SkillSummary, SkillSource } from '../../shared/flue'

/** English copy matching Kun's slashCommandMenuTitle locale string. */
export const COMPOSER_SLASH_COMMAND_MENU_TITLE = 'Commands'

export type ComposerSlashCommandPreviewIcon =
  | 'plus'
  | 'search'
  | 'listTodo'
  | 'target'
  | 'archive'
  | 'searchCode'

export type ComposerSlashCommandPreviewRow = {
  id: string
  title: string
  description: string
  badge: string
  icon: ComposerSlashCommandPreviewIcon
  active?: boolean
}

/** Mock slash commands for ?composerSlashCommandsPreview visual verification. */
export const COMPOSER_SLASH_COMMANDS_PREVIEW: ComposerSlashCommandPreviewRow[] = [
  {
    id: 'new',
    title: 'New session',
    description: 'Create a new session for the current project immediately.',
    badge: '/new',
    icon: 'plus',
    active: true,
  },
  {
    id: 'research',
    title: 'Deep research',
    description:
      'Prepare an iterative research brief with source tracking, cross-checks, and report-ready output.',
    badge: '/research',
    icon: 'search',
  },
  {
    id: 'plan',
    title: 'Plan',
    description: 'Add a Plan marker to the composer before sending.',
    badge: '/plan',
    icon: 'listTodo',
  },
  {
    id: 'review',
    title: 'Code review',
    description: 'Review current changes, a branch diff, a commit, or custom instructions.',
    badge: '/review',
    icon: 'searchCode',
  },
  {
    id: 'goal',
    title: 'Goal',
    description: 'Set or manage the long-running goal for this thread.',
    badge: '/goal',
    icon: 'target',
  },
  {
    id: 'compact',
    title: 'Compact this thread',
    description: 'Ask the runtime to summarize context for the active thread.',
    badge: '/compact',
    icon: 'archive',
  },
]

/** Draft shown when verifying slash-command overlay in production Composer. */
export const COMPOSER_SLASH_COMMANDS_PREVIEW_DRAFT = '/res'

export type ComposerSlashCommandsPreviewState = {
  draft: string
  commands: ComposerSlashCommandPreviewRow[]
}

/** Routes ?composerSlashCommandsPreview=1 production preview hooks. */
export function resolveComposerSlashCommandsPreview(
  _mode: string | null = 'default',
): ComposerSlashCommandsPreviewState {
  return {
    draft: COMPOSER_SLASH_COMMANDS_PREVIEW_DRAFT,
    commands: COMPOSER_SLASH_COMMANDS_PREVIEW,
  }
}

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
