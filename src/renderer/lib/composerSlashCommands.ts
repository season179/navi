// Maps navi skills into Kun FloatingComposer slash-menu rows for production
// Composer. Visual only — picking a row injects a natural-language hint.

import type { SkillSummary, SkillSource } from '../../shared/flue'

/** English copy matching Kun's slashCommandMenuTitle locale string. */
export const COMPOSER_SLASH_COMMAND_MENU_TITLE = 'Commands'

/** English copy matching Kun's slashCommandEmpty locale string. */
export const COMPOSER_SLASH_COMMAND_EMPTY =
  'No matching command. Keep typing to send the raw text instead.'

export type ComposerSlashCommandPreviewIcon =
  | 'plus'
  | 'search'
  | 'listTodo'
  | 'target'
  | 'archive'
  | 'searchCode'
  | 'sparkles'

export type ComposerSlashCommandPreviewRow = {
  id: string
  title: string
  description: string
  badge: string
  icon: ComposerSlashCommandPreviewIcon
  scopeLabel?: string
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

/** Mock skill slash rows for ?composerSlashCommandsPreview=skills scope-label verification. */
export const COMPOSER_SLASH_COMMANDS_SKILLS_PREVIEW: ComposerSlashCommandPreviewRow[] = [
  {
    id: 'skill:release-notes',
    title: 'release-notes',
    description: 'Draft release notes from recent commits',
    badge: '/skill:release-notes',
    scopeLabel: 'Built-in',
    icon: 'sparkles',
    active: true,
  },
  {
    id: 'skill:code-review',
    title: 'code-review',
    description: 'Review code changes in the workspace',
    badge: '/skill:code-review',
    scopeLabel: 'Project',
    icon: 'sparkles',
  },
]

/** Draft shown when verifying skill slash rows with scope labels. */
export const COMPOSER_SLASH_COMMANDS_SKILLS_PREVIEW_DRAFT = '/release'

export type ComposerSlashCommandsPreviewState = {
  draft: string
  commands: ComposerSlashCommandPreviewRow[]
}

/** Routes ?composerSlashCommandsPreview production preview hooks. */
export function resolveComposerSlashCommandsPreview(
  mode: string | null = 'default',
): ComposerSlashCommandsPreviewState {
  if (mode === 'skills') {
    return {
      draft: COMPOSER_SLASH_COMMANDS_SKILLS_PREVIEW_DRAFT,
      commands: COMPOSER_SLASH_COMMANDS_SKILLS_PREVIEW,
    }
  }
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
