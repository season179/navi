// SDD requirement AI side panel echoing Kun's SddAssistantPanel
// (../Kun/src/renderer/src/components/sdd/SddAssistantPanel.tsx).
// Visual only: parent supplies snapshot props and optional action callbacks.

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from 'react'
import {
  AlertTriangle,
  FileQuestion,
  FileText,
  FlaskConical,
  Inbox,
  LayoutList,
  Lightbulb,
  ListChecks,
  Network,
  PanelRightClose,
  Plus,
  Quote,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  SpellCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Composer } from './Composer'
import {
  COMPOSER_MODEL_PICKER_GROUPS_PREVIEW,
  COMPOSER_MODEL_PICKER_PREVIEW,
  FloatingComposerModelPicker,
  type ComposerModelPickerSettings,
} from './FloatingComposerModelPicker'
import { MessageTimeline } from './MessageTimeline'
import { type MessageTurnSnapshot } from './MessageTurn'
import { SidebarTitlebarToggleButton } from './SidebarPrimitives'

type SddWorkflowStage = 'discover' | 'structure' | 'risk'

type SddFrameworkAction = {
  id: string
  stage: SddWorkflowStage
  title: string
  subtitle: string
}

type SddFrameworkGroup = {
  stage: SddWorkflowStage
  title: string
  frameworks: SddFrameworkAction[]
}

export type SddAssistantTimelineBlock = {
  id: string
  kind: 'user' | 'assistant'
  text: string
}

export type SddAssistantPanelSnapshot = {
  draftPath: string
  hasTimeline?: boolean
  blocks?: SddAssistantTimelineBlock[]
  liveAssistant?: string
  input?: string
  busy?: boolean
  canCreateConversation?: boolean
}

export type SddAssistantPanelPreviewMode = 'default' | 'timeline' | 'busy' | 'disabled'

const COPY = {
  rightPanelCollapse: 'Collapse right sidebar',
  sddAssistant: 'Requirement AI',
  writeAssistantNewConversation: 'New requirement AI conversation',
  sddAssistantEmptyTitle: 'Clarify the requirement together',
  sddAssistantEmptySub:
    'Ask AI to research, find missing questions, and shape the boundaries before moving into a plan.',
  sddAssistantComposerPlaceholder: 'Ask the requirement AI…',
}

const FRAMEWORK_ICONS: Record<string, LucideIcon> = {
  clarify: Lightbulb,
  research: Search,
  'brainstorm-ideas': Users,
  'opportunity-tree': Network,
  'triage-requests': Inbox,
  structure: ListChecks,
  wwa: LayoutList,
  'job-stories': Quote,
  prd: FileText,
  polish: SpellCheck,
  assumptions: ShieldAlert,
  'prioritize-assumptions': SlidersHorizontal,
  'pre-mortem': AlertTriangle,
  experiments: FlaskConical,
}

const STAGE_ACCENT_CLASS: Record<SddWorkflowStage, string> = {
  discover: 'is-emerald',
  structure: 'is-violet',
  risk: 'is-amber',
}

const SDD_ASSISTANT_FRAMEWORK_GROUPS: SddFrameworkGroup[] = [
  {
    stage: 'discover',
    title: 'Clarify direction',
    frameworks: [
      { id: 'clarify', stage: 'discover', title: 'Clarify', subtitle: 'Find missing questions' },
      { id: 'research', stage: 'discover', title: 'Research', subtitle: 'Fill in context and options' },
      {
        id: 'brainstorm-ideas',
        stage: 'discover',
        title: 'Brainstorm ideas',
        subtitle: 'PM · Design · Eng lenses',
      },
      {
        id: 'opportunity-tree',
        stage: 'discover',
        title: 'Opportunity tree',
        subtitle: 'Outcome → opportunity → solution',
      },
      {
        id: 'triage-requests',
        stage: 'discover',
        title: 'Triage requests',
        subtitle: 'Group themes, pick top 3',
      },
    ],
  },
  {
    stage: 'structure',
    title: 'Shape into a spec',
    frameworks: [
      {
        id: 'structure',
        stage: 'structure',
        title: 'Structure requirements',
        subtitle: 'Split into R blocks with acceptance criteria',
      },
      { id: 'wwa', stage: 'structure', title: 'WWA format', subtitle: 'Why · What · Acceptance' },
      {
        id: 'job-stories',
        stage: 'structure',
        title: 'Job stories',
        subtitle: 'Situation · motivation · outcome',
      },
      { id: 'prd', stage: 'structure', title: 'Expand to PRD', subtitle: 'Add background, goals, value' },
      { id: 'polish', stage: 'structure', title: 'Proofread', subtitle: 'Grammar · logic · flow' },
    ],
  },
  {
    stage: 'risk',
    title: 'Pre-check risks',
    frameworks: [
      {
        id: 'assumptions',
        stage: 'risk',
        title: 'Find assumptions',
        subtitle: 'Value · usability · viability · feasibility',
      },
      {
        id: 'prioritize-assumptions',
        stage: 'risk',
        title: 'Rank assumptions',
        subtitle: 'Impact × risk matrix',
      },
      {
        id: 'pre-mortem',
        stage: 'risk',
        title: 'Pre-mortem',
        subtitle: 'Imagine failure, find risks',
      },
      {
        id: 'experiments',
        stage: 'risk',
        title: 'Design experiments',
        subtitle: 'Cheap assumption tests',
      },
    ],
  },
]

export const SDD_ASSISTANT_PANEL_PREVIEW_DEFAULT: SddAssistantPanelSnapshot = {
  draftPath: 'requirements/onboarding-flow/requirement.md',
  hasTimeline: false,
  input: '',
  busy: false,
  canCreateConversation: true,
}

export const SDD_ASSISTANT_PANEL_PREVIEW_TIMELINE: SddAssistantPanelSnapshot = {
  ...SDD_ASSISTANT_PANEL_PREVIEW_DEFAULT,
  hasTimeline: true,
  blocks: [
    {
      id: 'user-1',
      kind: 'user',
      text: 'What questions are still missing from this onboarding requirement draft?',
    },
    {
      id: 'assistant-1',
      kind: 'assistant',
      text:
        'The draft covers the happy path but does not define rollback criteria for the beta cohort or how success is measured after day seven.',
    },
  ],
}

export const SDD_ASSISTANT_PANEL_PREVIEW_BUSY: SddAssistantPanelSnapshot = {
  ...SDD_ASSISTANT_PANEL_PREVIEW_TIMELINE,
  busy: true,
  liveAssistant: 'Checking the draft for missing acceptance criteria…',
}

export const SDD_ASSISTANT_PANEL_PREVIEW_DISABLED: SddAssistantPanelSnapshot = {
  ...SDD_ASSISTANT_PANEL_PREVIEW_DEFAULT,
  canCreateConversation: false,
}

function previewSnapshot(mode: SddAssistantPanelPreviewMode): SddAssistantPanelSnapshot {
  if (mode === 'timeline') return SDD_ASSISTANT_PANEL_PREVIEW_TIMELINE
  if (mode === 'busy') return SDD_ASSISTANT_PANEL_PREVIEW_BUSY
  if (mode === 'disabled') return SDD_ASSISTANT_PANEL_PREVIEW_DISABLED
  return SDD_ASSISTANT_PANEL_PREVIEW_DEFAULT
}

function SddAssistantCompactComposer({
  value,
  onChange,
  onSend,
  onInterrupt,
  busy = false,
  disabled = false,
  modelPicker,
  onModelPickerChange,
}: {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onInterrupt: () => void
  busy?: boolean
  disabled?: boolean
  modelPicker: ComposerModelPickerSettings
  onModelPickerChange: (patch: Partial<ComposerModelPickerSettings>) => void
}): ReactElement {
  return (
    <Composer
      variant="compact"
      value={value}
      onChange={onChange}
      onSend={onSend}
      onCancel={onInterrupt}
      busy={busy}
      disabled={disabled}
      placeholder={COPY.sddAssistantComposerPlaceholder}
      modelChip={
        <FloatingComposerModelPicker
          compact
          stretch
          value={modelPicker}
          groups={COMPOSER_MODEL_PICKER_GROUPS_PREVIEW}
          disabled={disabled}
          onChange={onModelPickerChange}
        />
      }
    />
  )
}

function sddAssistantBlocksToTurns(
  blocks: SddAssistantTimelineBlock[],
  options?: { busy?: boolean; liveAssistant?: string },
): MessageTurnSnapshot[] {
  const turns: MessageTurnSnapshot[] = []

  for (const block of blocks) {
    if (block.kind === 'user') {
      turns.push({
        key: block.id,
        user: {
          kind: 'user',
          id: block.id,
          text: block.text,
          canEdit: false,
          route: 'write',
        },
        assistantBlocks: [],
      })
      continue
    }

    if (turns.length === 0) {
      turns.push({
        key: block.id,
        assistantBlocks: [{ kind: 'assistant', id: block.id, text: block.text }],
      })
      continue
    }

    const last = turns[turns.length - 1]
    turns[turns.length - 1] = {
      ...last,
      assistantBlocks: [
        ...(last.assistantBlocks ?? []),
        { kind: 'assistant', id: block.id, text: block.text },
      ],
    }
  }

  const busy = options?.busy === true
  const liveText = options?.liveAssistant?.trim() ?? ''
  if (turns.length === 0) return turns

  const lastIndex = turns.length - 1
  const last = turns[lastIndex]
  turns[lastIndex] = {
    ...last,
    processing: busy,
    liveAssistant: liveText
      ? {
          kind: 'assistant',
          id: 'live-assistant',
          text: liveText,
          streaming: true,
        }
      : undefined,
    showLiveProgress: busy && !liveText,
  }

  return turns
}

function SddAssistantTimeline({
  blocks,
  liveAssistant,
  busy = false,
}: {
  blocks: SddAssistantTimelineBlock[]
  liveAssistant?: string
  busy?: boolean
}): ReactElement {
  const turns = useMemo(
    () => sddAssistantBlocksToTurns(blocks, { busy, liveAssistant }),
    [blocks, busy, liveAssistant],
  )

  return (
    <MessageTimeline
      hasContent
      activeThreadId="sdd-assistant"
      turns={turns}
      compactCards
    />
  )
}

function SddAssistantEmptyBody({
  onApplyFramework,
}: {
  onApplyFramework?: (frameworkId: string) => void
}): ReactElement {
  return (
    <div className="sdd-assistant-empty">
      <div className="sdd-assistant-empty-card">
        <div className="sdd-assistant-empty-icon">
          <FileQuestion className="sdd-assistant-empty-icon-svg" strokeWidth={1.9} />
        </div>
        <h3 className="sdd-assistant-empty-title">{COPY.sddAssistantEmptyTitle}</h3>
        <p className="sdd-assistant-empty-sub">{COPY.sddAssistantEmptySub}</p>
      </div>

      <div className="sdd-assistant-framework-groups">
        {SDD_ASSISTANT_FRAMEWORK_GROUPS.map((group) => (
          <div key={group.stage} className="sdd-assistant-framework-group">
            <span className="sdd-assistant-framework-group-label">{group.title}</span>
            {group.frameworks.map((framework) => {
              const Icon = FRAMEWORK_ICONS[framework.id] ?? Sparkles
              return (
                <button
                  key={framework.id}
                  type="button"
                  onClick={() => onApplyFramework?.(framework.id)}
                  className="sdd-assistant-action"
                >
                  <span
                    className={`sdd-assistant-action-icon ${STAGE_ACCENT_CLASS[framework.stage]}`}
                  >
                    <Icon strokeWidth={1.9} />
                  </span>
                  <span className="sdd-assistant-action-copy">
                    <span className="sdd-assistant-action-title">{framework.title}</span>
                    <span className="sdd-assistant-action-sub">{framework.subtitle}</span>
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

type PanelProps = {
  className?: string
  snapshot: SddAssistantPanelSnapshot
  onCollapse?: () => void
  onNewConversation?: () => void
  onInputChange?: (value: string) => void
  onSend?: () => void
  onInterrupt?: () => void
  onApplyFramework?: (frameworkId: string) => void
}

export function SddAssistantPanel({
  className = '',
  snapshot,
  onCollapse,
  onNewConversation,
  onInputChange,
  onSend,
  onInterrupt,
  onApplyFramework,
}: PanelProps): ReactElement {
  const {
    draftPath,
    hasTimeline = false,
    blocks = [],
    liveAssistant,
    input = '',
    busy = false,
    canCreateConversation = true,
  } = snapshot

  const showTimeline =
    hasTimeline ||
    blocks.length > 0 ||
    Boolean(liveAssistant?.trim())

  const [modelPicker, setModelPicker] = useState<ComposerModelPickerSettings>(
    COMPOSER_MODEL_PICKER_PREVIEW,
  )

  const handleModelPickerChange = useCallback((patch: Partial<ComposerModelPickerSettings>) => {
    setModelPicker((current) => ({ ...current, ...patch }))
  }, [])

  return (
    <aside
      className={`sdd-assistant-panel ds-no-drag${busy ? ' is-busy' : ''} ${className}`.trim()}
    >
      <div className="sdd-assistant-header">
        <div className="sdd-assistant-header-row">
          <SidebarTitlebarToggleButton
            onClick={() => onCollapse?.()}
            ariaLabel={COPY.rightPanelCollapse}
            title={COPY.rightPanelCollapse}
            className="sdd-assistant-header-btn"
          >
            <PanelRightClose strokeWidth={1.55} />
          </SidebarTitlebarToggleButton>
          <div className="sdd-assistant-title-pill">
            <Sparkles className="sdd-assistant-sparkle" strokeWidth={1.8} />
            <span className="sdd-assistant-title-label">{COPY.sddAssistant}</span>
          </div>
          <button
            type="button"
            onClick={onNewConversation}
            disabled={!canCreateConversation}
            className="ds-sidebar-toggle-button sdd-assistant-header-btn"
            aria-label={COPY.writeAssistantNewConversation}
            title={COPY.writeAssistantNewConversation}
          >
            <Plus strokeWidth={2.1} />
          </button>
        </div>
        <div className="sdd-assistant-draft-label-wrap">
          <div className="sdd-assistant-draft-label">{draftPath}</div>
        </div>
      </div>

      <div className="sdd-assistant-body">
        {showTimeline ? (
          <SddAssistantTimeline blocks={blocks} liveAssistant={liveAssistant} busy={busy} />
        ) : (
          <SddAssistantEmptyBody onApplyFramework={onApplyFramework} />
        )}
      </div>

      <div className="sdd-assistant-composer">
        <SddAssistantCompactComposer
          value={input}
          onChange={(value) => onInputChange?.(value)}
          onSend={() => onSend?.()}
          onInterrupt={() => onInterrupt?.()}
          busy={busy}
          disabled={!canCreateConversation && !busy}
          modelPicker={modelPicker}
          onModelPickerChange={handleModelPickerChange}
        />
      </div>
    </aside>
  )
}

type PreviewProps = {
  mode: SddAssistantPanelPreviewMode
}

/** Full panel preview shell for ?sddAssistantPanelPreview URL hooks. */
export function SddAssistantPanelPreview({ mode }: PreviewProps): ReactElement {
  const initialSnapshot = useMemo(() => previewSnapshot(mode), [mode])
  const [snapshot, setSnapshot] = useState(initialSnapshot)

  useEffect(() => {
    setSnapshot(previewSnapshot(mode))
  }, [mode])

  const handleInputChange = useCallback((value: string) => {
    setSnapshot((current) => ({ ...current, input: value }))
  }, [])

  const handleApplyFramework = useCallback((frameworkId: string) => {
    const framework = SDD_ASSISTANT_FRAMEWORK_GROUPS.flatMap((group) => group.frameworks).find(
      (item) => item.id === frameworkId,
    )
    if (!framework) return
    setSnapshot((current) => ({
      ...current,
      input: `Use the ${framework.title} framework for this requirement draft.`,
    }))
  }, [])

  return (
    <div className="sdd-assistant-panel-preview-wrap">
      <SddAssistantPanel
        className="sdd-assistant-panel-preview-panel"
        snapshot={snapshot}
        onInputChange={handleInputChange}
        onApplyFramework={handleApplyFramework}
        onSend={() => setSnapshot((current) => ({ ...current, busy: true }))}
        onInterrupt={() =>
          setSnapshot((current) => ({ ...current, busy: false, liveAssistant: undefined }))
        }
      />
    </div>
  )
}
