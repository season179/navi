import { COMPOSER_QUEUE_MESSAGE_LABEL } from './composerBusyState'
import { COMPOSER_GOAL_SET_CURRENT_INPUT } from './composerGoal'

/** English copy matching Kun's send locale string. */
export const COMPOSER_SEND_LABEL = 'Send'

/** English copy matching Kun's slashCommandApply locale string. */
export const COMPOSER_SLASH_COMMAND_APPLY_LABEL = 'Apply command'

export type ComposerPrimaryActionOptions = {
  busy?: boolean
  canSend?: boolean
  slashMenuOpen?: boolean
  highlightedSlashCommandDisabled?: boolean
  goalPanelOpen?: boolean
  goalPanelDraftObjective?: string
}

export type ComposerPrimaryActionState = {
  label: string
  disabled: boolean
}

/** Resolves send-button label and disabled state matching Kun's FloatingComposer primaryActionLabel logic. */
export function resolveComposerPrimaryActionState(
  options: ComposerPrimaryActionOptions = {},
): ComposerPrimaryActionState {
  const {
    busy = false,
    canSend = false,
    slashMenuOpen = false,
    highlightedSlashCommandDisabled = false,
    goalPanelOpen = false,
    goalPanelDraftObjective = '',
  } = options

  if (slashMenuOpen) {
    return {
      label: COMPOSER_SLASH_COMMAND_APPLY_LABEL,
      disabled: highlightedSlashCommandDisabled,
    }
  }

  const canSetGoalPanelDraft = goalPanelOpen && goalPanelDraftObjective.length > 0
  if (canSetGoalPanelDraft) {
    return {
      label: COMPOSER_GOAL_SET_CURRENT_INPUT,
      disabled: false,
    }
  }

  if (busy) {
    return {
      label: COMPOSER_QUEUE_MESSAGE_LABEL,
      disabled: !canSend,
    }
  }

  return {
    label: COMPOSER_SEND_LABEL,
    disabled: !canSend,
  }
}

export type ComposerPrimaryActionPreviewMode = 'send' | 'queue' | 'slashApply' | 'goalSet'

/** Routes primary-action preview copy from ?composerPrimaryActionPreview query values. */
export function resolveComposerPrimaryActionPreview(
  mode: ComposerPrimaryActionPreviewMode = 'send',
): ComposerPrimaryActionState {
  switch (mode) {
    case 'queue':
      return resolveComposerPrimaryActionState({ busy: true, canSend: true })
    case 'slashApply':
      return resolveComposerPrimaryActionState({ slashMenuOpen: true })
    case 'goalSet':
      return resolveComposerPrimaryActionState({
        goalPanelOpen: true,
        goalPanelDraftObjective: 'Ship the goal UX',
      })
    default:
      return resolveComposerPrimaryActionState({ canSend: true })
  }
}
