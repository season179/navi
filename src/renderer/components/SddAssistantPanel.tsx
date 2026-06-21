// SDD requirement AI side panel echoing Kun's SddAssistantPanel
// (../Kun/src/renderer/src/components/sdd/SddAssistantPanel.tsx).
// Visual only: parent supplies snapshot props and optional action callbacks.

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
} from 'react'
import {
  AlertTriangle,
  ArrowUp,
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
  Square,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Markdown } from './Markdown'
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
}: {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onInterrupt: () => void
  busy?: boolean
  disabled?: boolean
}): ReactElement {
  const sendDisabled = disabled || (!busy && value.trim().length === 0)

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key !== 'Enter' || event.shiftKey || event.metaKey || event.ctrlKey) return
    event.preventDefault()
    if (busy) {
      onInterrupt()
      return
    }
    if (!sendDisabled) onSend()
  }

  return (
    <div className="sdd-assistant-composer-shell">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        placeholder={COPY.sddAssistantComposerPlaceholder}
        className="sdd-assistant-composer-input"
      />
      <div className="sdd-assistant-composer-toolbar">
        <div className="sdd-assistant-composer-toolbar-left">
          <button type="button" className="sdd-assistant-composer-plus" aria-label="Add">
            <Plus strokeWidth={2} />
          </button>
          <button type="button" className="sdd-assistant-composer-model" aria-label="Model">
            <span className="sdd-assistant-composer-model-label">claude-sonnet-4</span>
          </button>
        </div>
        <div className="sdd-assistant-composer-toolbar-right">
          <button
            type="button"
            className={`sdd-assistant-composer-send${busy ? ' is-stop' : ''}`}
            disabled={sendDisabled && !busy}
            onClick={busy ? onInterrupt : onSend}
            aria-label={busy ? 'Stop' : 'Send'}
            title={busy ? 'Stop' : 'Send'}
          >
            {busy ? <Square strokeWidth={2.4} /> : <ArrowUp strokeWidth={2.2} />}
          </button>
        </div>
      </div>
    </div>
  )
}

function SddAssistantTimeline({
  blocks,
  liveAssistant,
}: {
  blocks: SddAssistantTimelineBlock[]
  liveAssistant?: string
}): ReactElement {
  return (
    <div className="sdd-assistant-timeline ds-chat-column-inset">
      {blocks.map((block) =>
        block.kind === 'user' ? (
          <div key={block.id} className="ds-user-message">
            <div className="ds-user-message-bubble">{block.text}</div>
          </div>
        ) : (
          <div key={block.id} className="ds-chat-answer">
            <Markdown text={block.text} streaming={false} />
          </div>
        ),
      )}
      {liveAssistant?.trim() ? (
        <div className="ds-chat-answer">
          <span>{liveAssistant}</span>
        </div>
      ) : null}
    </div>
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
          <SddAssistantTimeline blocks={blocks} liveAssistant={liveAssistant} />
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
