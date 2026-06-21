// Kun-matching WriteInlineAgent preview prop bundles for standalone and orchestrator hooks.

import {
  WRITE_SETTINGS_PREVIEW_DEFAULT,
  type WriteAgentPresetSnapshot,
  type WriteQuickActionSnapshot,
} from '../components/WriteSettingsSection'
import type { WriteInlineAgentPreviewMode } from './writeInlineAgentPreviewModes'

export type WriteInlineAgentPreviewState = {
  askOnly: boolean
  preferAbove: boolean
  inFlight: boolean
  formattingEnabled: boolean
  defaultBlockMenuOpen: boolean
  agentPresets: WriteAgentPresetSnapshot[]
  quickActions: WriteQuickActionSnapshot[]
  infographicEnabled: boolean
  designDraftEnabled: boolean
  prototypeEnabled: boolean
  imageMode: boolean
  initialValue: string
  initialActiveAgentId: string
}

export function resolveWriteInlineAgentPreviewState(
  mode: WriteInlineAgentPreviewMode,
): WriteInlineAgentPreviewState {
  const agentPresets =
    mode === 'emptyAgents' ? [] : WRITE_SETTINGS_PREVIEW_DEFAULT.agentPresets
  const quickActions = WRITE_SETTINGS_PREVIEW_DEFAULT.selectionAssist.quickActions

  return {
    askOnly: mode === 'askOnly' || mode === 'preferAbove',
    preferAbove: mode === 'preferAbove',
    inFlight: mode === 'inFlight',
    formattingEnabled: mode !== 'imageMode' && mode !== 'askOnly' && mode !== 'preferAbove',
    defaultBlockMenuOpen: mode === 'blockMenu',
    agentPresets: mode === 'imageMode' ? [] : agentPresets,
    quickActions: mode === 'imageMode' ? [] : quickActions,
    infographicEnabled: mode === 'skills',
    designDraftEnabled: mode === 'skills' || mode === 'imageMode',
    prototypeEnabled: mode === 'skills' || mode === 'imageMode',
    imageMode: mode === 'imageMode',
    initialValue: mode === 'inFlight' ? 'Tighten this paragraph' : '',
    initialActiveAgentId:
      mode === 'default' ? WRITE_SETTINGS_PREVIEW_DEFAULT.agentPresets[0]?.id ?? '' : '',
  }
}
