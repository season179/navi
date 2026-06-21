// Message timeline empty hero orchestrator echoing Kun's MessageTimelineEmptyHero
// (../Kun/src/renderer/src/components/chat/message-timeline-empty.tsx).
// Routes between already-ported empty-state sub-components.

import type { ReactElement } from 'react'
import { ClawEmptyHero, CLAW_EMPTY_HERO_PREVIEW_AGENT_NAME } from './ClawEmptyHero'
import { InitialSessionUsageHeatmap } from './InitialSessionUsageHeatmap'
import { RUNTIME_WAKE_HERO_PREVIEW_ERROR, RuntimeWakeHero } from './RuntimeWakeHero'
import { WorkspaceSelectEmptyHero } from './WorkspaceSelectEmptyHero'

export type MessageTimelineEmptyHeroRoute = 'chat' | 'claw'

type HeatmapPreviewMode = 'populated' | 'loading' | 'empty' | 'error' | 'collapsed' | 'models'

type Props = {
  route?: MessageTimelineEmptyHeroRoute
  ready?: boolean
  hasWorkspace?: boolean
  runtimeError?: string | null
  agentName?: string
  hasInboundConversation?: boolean
  focusModeEnabled?: boolean
  heatmapPreviewMode?: HeatmapPreviewMode
  onPickWorkspace?: () => void
  onRetry?: () => void
  onOpenSettings?: () => void
  onSelectSuggestion?: (prompt: string) => void
}

export function MessageTimelineEmptyHero({
  route = 'chat',
  ready = true,
  hasWorkspace = true,
  runtimeError,
  agentName,
  hasInboundConversation = true,
  focusModeEnabled = false,
  heatmapPreviewMode = 'populated',
  onPickWorkspace,
  onRetry,
  onOpenSettings,
  onSelectSuggestion,
}: Props): ReactElement {
  void onSelectSuggestion

  if (!ready) {
    return (
      <RuntimeWakeHero
        runtimeError={runtimeError}
        onRetry={onRetry}
        onOpenSettings={onOpenSettings}
      />
    )
  }

  if (!hasWorkspace) {
    return <WorkspaceSelectEmptyHero onPickWorkspace={onPickWorkspace} />
  }

  if (route === 'claw') {
    return (
      <ClawEmptyHero
        agentName={agentName}
        hasInboundConversation={hasInboundConversation}
      />
    )
  }

  return (
    <InitialSessionUsageHeatmap
      previewMode={heatmapPreviewMode}
      hideHero={focusModeEnabled}
    />
  )
}

export type MessageTimelineEmptyHeroPreviewMode =
  | 'waking'
  | 'error'
  | 'noWorkspace'
  | 'claw'
  | 'clawNeedsInbound'
  | 'chat'
  | 'chatFocus'
  | 'chatLoading'
  | 'chatEmpty'
  | 'chatError'
  | 'chatCollapsed'
  | 'chatModels'

type PreviewProps = {
  mode: MessageTimelineEmptyHeroPreviewMode
}

function resolvePreviewProps(mode: MessageTimelineEmptyHeroPreviewMode): Props {
  switch (mode) {
    case 'waking':
      return { ready: false }
    case 'error':
      return { ready: false, runtimeError: RUNTIME_WAKE_HERO_PREVIEW_ERROR }
    case 'noWorkspace':
      return { ready: true, hasWorkspace: false }
    case 'claw':
      return {
        ready: true,
        hasWorkspace: true,
        route: 'claw',
        agentName: CLAW_EMPTY_HERO_PREVIEW_AGENT_NAME,
        hasInboundConversation: true,
      }
    case 'clawNeedsInbound':
      return {
        ready: true,
        hasWorkspace: true,
        route: 'claw',
        agentName: CLAW_EMPTY_HERO_PREVIEW_AGENT_NAME,
        hasInboundConversation: false,
      }
    case 'chatFocus':
      return {
        ready: true,
        hasWorkspace: true,
        route: 'chat',
        focusModeEnabled: true,
      }
    case 'chatLoading':
      return {
        ready: true,
        hasWorkspace: true,
        route: 'chat',
        heatmapPreviewMode: 'loading',
      }
    case 'chatEmpty':
      return {
        ready: true,
        hasWorkspace: true,
        route: 'chat',
        heatmapPreviewMode: 'empty',
      }
    case 'chatError':
      return {
        ready: true,
        hasWorkspace: true,
        route: 'chat',
        heatmapPreviewMode: 'error',
      }
    case 'chatCollapsed':
      return {
        ready: true,
        hasWorkspace: true,
        route: 'chat',
        heatmapPreviewMode: 'collapsed',
      }
    case 'chatModels':
      return {
        ready: true,
        hasWorkspace: true,
        route: 'chat',
        heatmapPreviewMode: 'models',
      }
    case 'chat':
    default:
      return {
        ready: true,
        hasWorkspace: true,
        route: 'chat',
        heatmapPreviewMode: 'populated',
      }
  }
}

export function MessageTimelineEmptyHeroPreview({ mode }: PreviewProps): ReactElement {
  const props = resolvePreviewProps(mode)
  return (
    <div className="message-timeline-empty-hero-preview-wrap">
      <MessageTimelineEmptyHero {...props} />
    </div>
  )
}
