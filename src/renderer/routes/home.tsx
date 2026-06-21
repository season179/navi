import { useCallback, useEffect, useMemo, useState } from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { TopBar } from '../components/TopBar'
import { HeroStage } from '../components/HeroStage'
import { ChatStarterGrid } from '../components/ChatStarterGrid'
import {
  ContextCapacityPopover,
  CONTEXT_CAPACITY_PREVIEW,
} from '../components/ContextCapacityPopover'
import { Composer } from '../components/Composer'
import {
  QUEUED_MESSAGES_PREVIEW,
} from '../components/FloatingComposerQueuedMessages'
import {
  FloatingComposerExecutionPicker,
  EXECUTION_PICKER_PREVIEW,
  type ComposerExecutionSettings,
} from '../components/FloatingComposerExecutionPicker'
import {
  GitBranchPicker,
  GIT_BRANCH_PICKER_PREVIEW,
  GIT_BRANCH_PICKER_PREVIEW_ERROR,
  type GitBranchesSnapshot,
} from '../components/GitBranchPicker'
import {
  WorkspaceProjectPicker,
  WORKSPACE_PROJECT_PICKER_PREVIEW,
  WORKSPACE_PROJECT_PICKER_PREVIEW_EMPTY,
  type WorkspaceProjectsSnapshot,
} from '../components/WorkspaceProjectPicker'
import {
  ImagePreviewLightbox,
  IMAGE_PREVIEW_LIGHTBOX_SAMPLE,
} from '../components/ImagePreviewLightbox'
import {
  DevPreviewLaunchCard,
  DEV_PREVIEW_LAUNCH_CARD_PREVIEW,
} from '../components/DevPreviewLaunchCard'
import {
  ReviewPlanCard,
  REVIEW_PLAN_CARD_PREVIEW,
} from '../components/ReviewPlanCard'
import {
  ReviewSummaryCard,
  REVIEW_SUMMARY_CARD_PREVIEW,
  REVIEW_SUMMARY_CARD_PREVIEW_ERROR,
  REVIEW_SUMMARY_CARD_PREVIEW_INCORRECT,
  REVIEW_SUMMARY_CARD_PREVIEW_NO_FINDINGS,
  REVIEW_SUMMARY_CARD_PREVIEW_RUNNING,
} from '../components/ReviewSummaryCard'
import {
  WorkMetaRow,
  WORK_META_ROW_PREVIEW,
  type WorkMetaRowPreviewMode,
} from '../components/WorkMetaRow'
import {
  TurnChangeSummary,
  TURN_CHANGE_SUMMARY_PREVIEW,
  TURN_CHANGE_SUMMARY_PREVIEW_SINGLE,
  type TurnChangeSummaryPreviewMode,
} from '../components/TurnChangeSummary'
import { ModelMetaTag, MODEL_META_TAG_PREVIEW } from '../components/ModelMetaTag'
import {
  WritePromptMetaDisclosure,
  WRITE_PROMPT_META_DISCLOSURE_PREVIEW,
  WRITE_PROMPT_META_DISCLOSURE_PREVIEW_QUOTES,
} from '../components/WritePromptMetaDisclosure'
import {
  ClawInboundMessageCard,
  CLAW_INBOUND_MESSAGE_CARD_PREVIEW,
  CLAW_INBOUND_MESSAGE_CARD_PREVIEW_MINIMAL,
} from '../components/ClawInboundMessageCard'
import {
  UserFileReferenceChips,
  USER_FILE_REFERENCE_CHIPS_PREVIEW,
  USER_FILE_REFERENCE_CHIPS_PREVIEW_DIRECTORY,
} from '../components/UserFileReferenceChips'
import {
  RuntimeMetaChips,
  RUNTIME_META_CHIPS_PREVIEW,
  RUNTIME_META_CHIPS_PREVIEW_MINIMAL,
  RUNTIME_META_CHIPS_PREVIEW_TOOL,
} from '../components/RuntimeMetaChips'
import {
  MediaPreviewTile,
  MediaAttachmentGallery,
  MEDIA_PREVIEW_TILE_PREVIEW_IMAGE,
  MEDIA_PREVIEW_TILE_PREVIEW_VIDEO,
  MEDIA_PREVIEW_TILE_PREVIEW_FILE,
  MEDIA_ATTACHMENT_GALLERY_PREVIEW,
} from '../components/MediaPreviewTile'
import {
  CopyFeedbackButton,
  COPY_FEEDBACK_BUTTON_PREVIEW_TEXT,
} from '../components/CopyFeedbackButton'
import {
  UserInputBubble,
  USER_INPUT_BUBBLE_PREVIEW,
  USER_INPUT_BUBBLE_PREVIEW_CANCELLED,
  USER_INPUT_BUBBLE_PREVIEW_ERROR,
  USER_INPUT_BUBBLE_PREVIEW_FREEFORM,
  USER_INPUT_BUBBLE_PREVIEW_MULTI,
  USER_INPUT_BUBBLE_PREVIEW_SUBMITTED,
} from '../components/UserInputBubble'
import {
  GeneratedFilesPanel,
  GENERATED_FILES_PANEL_PREVIEW,
  GENERATED_FILES_PANEL_PREVIEW_MIXED,
  GENERATED_FILES_PANEL_PREVIEW_SINGLE,
} from '../components/GeneratedFilesPanel'
import {
  ToolEntry,
  TOOL_ENTRY_PREVIEW,
  TOOL_ENTRY_PREVIEW_COMMAND,
  TOOL_ENTRY_PREVIEW_ERROR,
  TOOL_ENTRY_PREVIEW_RUNNING,
  type ToolBlockSnapshot,
} from '../components/ToolEntry'
import {
  ThreadForkBanner,
  ThreadForkPoint,
  THREAD_FORK_BANNER_PREVIEW_TITLE,
} from '../components/ThreadForkBanner'
import {
  RuntimeWakeHero,
  RUNTIME_WAKE_HERO_PREVIEW_ERROR,
} from '../components/RuntimeWakeHero'
import {
  ClawEmptyHero,
  CLAW_EMPTY_HERO_PREVIEW_AGENT_NAME,
} from '../components/ClawEmptyHero'
import { PencilLine } from 'lucide-react'
import { ChatThread } from '../components/ChatThread'
import { FloatingModelPicker } from '../components/FloatingModelPicker'
import { ProvidersSettings } from '../components/providers/ProvidersSettings'
import { SkillsSettings } from '../components/skills/SkillsSettings'
import { hasUsableProvider, type SkillSummary } from '../../shared/flue'
import { useNaviList, useNaviThread } from '../flue/NaviChatContext'
import { useSidebar } from '../sidebar'
import { useSettings } from '../settings'

function statusLabel(ready: boolean, hasProvider: boolean, error?: string): string {
  if (!hasProvider) return 'needs provider'
  if (error) return 'backend error'
  if (!ready) return 'connecting…'
  return 'ready'
}

// Which settings sub-panel is shown while the settings stage is open. Open/close
// itself is owned by useSettings(); this only selects the tab.
type SettingsTab = 'providers' | 'skills'

function HomePage() {
  const { collapsed, toggle } = useSidebar()
  const { settingsOpen, openSettings, closeSettings, toggleSettings } = useSettings()
  const [draft, setDraft] = useState('')
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('providers')
  const { messages, status, busy, send, cancel, activeSelection, pickModel, pickReasoning } =
    useNaviThread()
  const {
    providerProfiles,
    defaultSelection,
    upsertProvider,
    removeProvider,
    probeProvider,
    setDefaultSelection,
    projects,
    currentProjectId,
  } = useNaviList()

  const empty = messages.length === 0
  const hasProvider = hasUsableProvider(status, providerProfiles)
  const composerDisabled = !status.ready || !hasProvider

  // Visual preview for the ported VoiceRecordingStrip (?voicePreview=1).
  const voiceRecording = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    if (!new URLSearchParams(window.location.search).has('voicePreview')) return undefined
    const startedAtMs = Date.now() - 12_500
    return {
      getLevel: () => 0.12 + 0.68 * Math.abs(Math.sin(Date.now() / 160)),
      startedAtMs,
      onStop: () => undefined,
      onSend: () => undefined,
    }
  }, [])

  // Visual preview for the ported ContextCapacityPopover (?contextCapacityPreview=1).
  const contextCapacityPreview = useMemo(() => {
    if (typeof window === 'undefined') return false
    return new URLSearchParams(window.location.search).has('contextCapacityPreview')
  }, [])

  // Visual preview for the ported FloatingComposerQueuedMessages (?queuedMessagesPreview=1).
  const queuedMessagesPreview = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    if (!new URLSearchParams(window.location.search).has('queuedMessagesPreview')) return undefined
    return QUEUED_MESSAGES_PREVIEW
  }, [])

  // Visual preview for the ported FloatingComposerExecutionPicker (?executionPickerPreview=1).
  const executionPickerPreviewMode = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('executionPickerPreview')) return null
    return params.get('executionPickerPreview') === 'danger' ? 'danger' : 'default'
  }, [])
  const [executionPickerPreview, setExecutionPickerPreview] = useState<ComposerExecutionSettings>(
    () => ({
      ...EXECUTION_PICKER_PREVIEW,
      sandboxMode:
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('executionPickerPreview') === 'danger'
          ? 'danger-full-access'
          : EXECUTION_PICKER_PREVIEW.sandboxMode,
    }),
  )

  // Visual preview for the ported GitBranchPicker (?gitBranchPickerPreview=1).
  const gitBranchPickerPreviewMode = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('gitBranchPickerPreview')) return null
    const mode = params.get('gitBranchPickerPreview')
    if (mode === 'error') return 'error'
    if (mode === 'loading') return 'loading'
    return 'default'
  }, [])
  const [gitBranchPickerPreview, setGitBranchPickerPreview] = useState<GitBranchesSnapshot>(
    () => GIT_BRANCH_PICKER_PREVIEW,
  )
  const gitBranchPickerPreviewSnapshot = useMemo(() => {
    if (!gitBranchPickerPreviewMode) return null
    if (gitBranchPickerPreviewMode === 'error') return GIT_BRANCH_PICKER_PREVIEW_ERROR
    if (gitBranchPickerPreviewMode === 'loading') return null
    return gitBranchPickerPreview
  }, [gitBranchPickerPreviewMode, gitBranchPickerPreview])

  // Visual preview for the ported WorkspaceProjectPicker (?workspaceProjectPickerPreview=1).
  const workspaceProjectPickerPreviewMode = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('workspaceProjectPickerPreview')) return null
    const mode = params.get('workspaceProjectPickerPreview')
    if (mode === 'empty') return 'empty'
    if (mode === 'acting') return 'acting'
    return 'default'
  }, [])
  const [workspaceProjectPickerPreview, setWorkspaceProjectPickerPreview] =
    useState<WorkspaceProjectsSnapshot>(() => WORKSPACE_PROJECT_PICKER_PREVIEW)
  const workspaceProjectPickerPreviewSnapshot = useMemo(() => {
    if (!workspaceProjectPickerPreviewMode) return null
    if (workspaceProjectPickerPreviewMode === 'empty') return WORKSPACE_PROJECT_PICKER_PREVIEW_EMPTY
    return workspaceProjectPickerPreview
  }, [workspaceProjectPickerPreviewMode, workspaceProjectPickerPreview])

  // Visual preview for the ported ImagePreviewLightbox (?imagePreviewLightbox=1).
  const imagePreviewLightboxPreview = useMemo(() => {
    if (typeof window === 'undefined') return false
    return new URLSearchParams(window.location.search).has('imagePreviewLightbox')
  }, [])
  const [imagePreviewLightboxDismissed, setImagePreviewLightboxDismissed] = useState(false)

  // Visual preview for the ported DevPreviewLaunchCard (?devPreviewLaunchCard=1).
  const devPreviewLaunchCardPreviewMode = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('devPreviewLaunchCard')) return null
    return params.get('devPreviewLaunchCard') === 'opened' ? 'opened' : 'default'
  }, [])
  const [devPreviewLaunchCardOpened, setDevPreviewLaunchCardOpened] = useState(false)

  // Visual preview for the ported ReviewPlanCard (?reviewPlanCard=1).
  const reviewPlanCardPreviewMode = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('reviewPlanCard')) return null
    return params.get('reviewPlanCard') === 'busy' ? 'busy' : 'default'
  }, [])
  const [reviewPlanCardBuildBusy, setReviewPlanCardBuildBusy] = useState(false)

  // Visual preview for the ported ReviewSummaryCard (?reviewSummaryCard=1).
  const reviewSummaryCardPreviewSnapshot = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('reviewSummaryCard')) return null
    const mode = params.get('reviewSummaryCard')
    if (mode === 'running') return REVIEW_SUMMARY_CARD_PREVIEW_RUNNING
    if (mode === 'error') return REVIEW_SUMMARY_CARD_PREVIEW_ERROR
    if (mode === 'incorrect') return REVIEW_SUMMARY_CARD_PREVIEW_INCORRECT
    if (mode === 'nofindings') return REVIEW_SUMMARY_CARD_PREVIEW_NO_FINDINGS
    return REVIEW_SUMMARY_CARD_PREVIEW
  }, [])

  // Visual preview for the ported WorkMetaRow (?workMetaRow=processing|processed|steps|static).
  const workMetaRowPreviewMode = useMemo((): WorkMetaRowPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('workMetaRow')) return null
    const mode = params.get('workMetaRow')
    if (mode === 'processed' || mode === 'steps' || mode === 'static') return mode
    return 'processing'
  }, [])
  const [workMetaRowExpanded, setWorkMetaRowExpanded] = useState(false)

  // Visual preview for the ported TurnChangeSummary (?turnChangeSummary=1).
  const turnChangeSummaryPreviewMode = useMemo((): TurnChangeSummaryPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('turnChangeSummary')) return null
    const mode = params.get('turnChangeSummary')
    if (mode === 'compact') return 'compact'
    if (mode === 'single') return 'single'
    return 'default'
  }, [])
  const turnChangeSummaryDefaultExpanded = useMemo(() => {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    return params.get('turnChangeSummary') === 'expanded'
  }, [])

  // Visual preview for the ported ModelMetaTag (?modelMetaTag=1|right).
  const modelMetaTagPreviewMode = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('modelMetaTag')) return null
    return params.get('modelMetaTag') === 'right' ? 'right' : 'left'
  }, [])

  // Visual preview for the ported WritePromptMetaDisclosure (?writePromptMetaDisclosure=1).
  const writePromptMetaDisclosurePreviewMode = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('writePromptMetaDisclosure')) return null
    return params.get('writePromptMetaDisclosure') === 'quotes' ? 'quotes' : 'full'
  }, [])
  const writePromptMetaDisclosureDefaultExpanded = useMemo(() => {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    return params.get('writePromptMetaDisclosure') === 'expanded'
  }, [])
  const [writePromptMetaExpanded, setWritePromptMetaExpanded] = useState(
    writePromptMetaDisclosureDefaultExpanded,
  )

  // Visual preview for the ported ClawInboundMessageCard (?clawInboundMessageCard=1).
  const clawInboundMessageCardPreviewMode = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('clawInboundMessageCard')) return null
    return params.get('clawInboundMessageCard') === 'minimal' ? 'minimal' : 'full'
  }, [])

  // Visual preview for the ported UserFileReferenceChips (?userFileReferenceChips=1).
  const userFileReferenceChipsPreviewMode = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('userFileReferenceChips')) return null
    return params.get('userFileReferenceChips') === 'directory' ? 'directory' : 'full'
  }, [])

  // Visual preview for the ported RuntimeMetaChips (?runtimeMetaChips=1|tool|minimal).
  const runtimeMetaChipsPreviewMode = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('runtimeMetaChips')) return null
    const mode = params.get('runtimeMetaChips')
    if (mode === 'tool') return 'tool'
    if (mode === 'minimal') return 'minimal'
    return 'full'
  }, [])

  // Visual preview for the ported MediaPreviewTile (?mediaPreviewTile=image|video|file).
  const mediaPreviewTilePreviewMode = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('mediaPreviewTile')) return null
    const mode = params.get('mediaPreviewTile')
    if (mode === 'video') return 'video'
    if (mode === 'file') return 'file'
    return 'image'
  }, [])

  // Visual preview for the ported MediaAttachmentGallery (?mediaAttachmentGallery=user|tool|conversation).
  const mediaAttachmentGalleryPreviewMode = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('mediaAttachmentGallery')) return null
    const mode = params.get('mediaAttachmentGallery')
    if (mode === 'tool') return 'tool'
    if (mode === 'conversation') return 'conversation'
    return 'user'
  }, [])

  // Visual preview for the ported CopyFeedbackButton (?copyFeedbackButton=1|labeled|success|error).
  const copyFeedbackButtonPreviewMode = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('copyFeedbackButton')) return null
    const mode = params.get('copyFeedbackButton')
    if (mode === 'labeled') return 'labeled'
    if (mode === 'success') return 'success'
    if (mode === 'error') return 'error'
    return 'icon'
  }, [])

  // Visual preview for the ported UserInputBubble (?userInputBubble=1|freeform|submitted|cancelled|error|multi).
  const userInputBubblePreviewSnapshot = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('userInputBubble')) return null
    const mode = params.get('userInputBubble')
    if (mode === 'freeform') return USER_INPUT_BUBBLE_PREVIEW_FREEFORM
    if (mode === 'submitted') return USER_INPUT_BUBBLE_PREVIEW_SUBMITTED
    if (mode === 'cancelled') return USER_INPUT_BUBBLE_PREVIEW_CANCELLED
    if (mode === 'error') return USER_INPUT_BUBBLE_PREVIEW_ERROR
    if (mode === 'multi') return USER_INPUT_BUBBLE_PREVIEW_MULTI
    return USER_INPUT_BUBBLE_PREVIEW
  }, [])

  // Visual preview for the ported GeneratedFilesPanel (?generatedFilesPanel=1|single|mixed).
  const generatedFilesPanelPreviewMedia = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('generatedFilesPanel')) return null
    const mode = params.get('generatedFilesPanel')
    if (mode === 'single') return GENERATED_FILES_PANEL_PREVIEW_SINGLE
    if (mode === 'mixed') return GENERATED_FILES_PANEL_PREVIEW_MIXED
    return GENERATED_FILES_PANEL_PREVIEW
  }, [])

  // Visual preview for the ported ThreadForkBanner / ThreadForkPoint
  // (?threadForkBanner=1|unknown, ?threadForkPoint=1|unknown).
  const threadForkBannerPreviewMode = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('threadForkBanner')) return null
    return params.get('threadForkBanner') === 'unknown' ? 'unknown' : 'title'
  }, [])

  const threadForkPointPreviewMode = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('threadForkPoint')) return null
    return params.get('threadForkPoint') === 'unknown' ? 'unknown' : 'title'
  }, [])

  // Visual preview for the ported RuntimeWakeHero
  // (?runtimeWakeHero=1|waking|error|quiet).
  const runtimeWakeHeroPreviewMode = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('runtimeWakeHero')) return null
    const mode = params.get('runtimeWakeHero')
    if (mode === 'error') return 'error'
    if (mode === 'quiet') return 'quiet'
    return 'waking'
  }, [])

  // Visual preview for the ported ClawEmptyHero
  // (?clawEmptyHero=1|needsInbound).
  const clawEmptyHeroPreviewMode = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('clawEmptyHero')) return null
    return params.get('clawEmptyHero') === 'needsInbound' ? 'needsInbound' : 'ready'
  }, [])

  // Visual preview for the ported ToolEntry (?toolEntry=1|running|error|command).
  const toolEntryPreview = useMemo((): {
    block: ToolBlockSnapshot
    defaultExpanded: boolean
  } | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('toolEntry')) return null
    const mode = params.get('toolEntry')
    if (mode === 'running') {
      return { block: TOOL_ENTRY_PREVIEW_RUNNING, defaultExpanded: true }
    }
    if (mode === 'error') {
      return { block: TOOL_ENTRY_PREVIEW_ERROR, defaultExpanded: true }
    }
    if (mode === 'command') {
      return { block: TOOL_ENTRY_PREVIEW_COMMAND, defaultExpanded: false }
    }
    return { block: TOOL_ENTRY_PREVIEW, defaultExpanded: true }
  }, [])

  const composerFooterPreview =
    gitBranchPickerPreviewMode != null || workspaceProjectPickerPreviewMode != null

  // The active project's cwd, for scoping project skills in the Skills panel.
  // A no-project chat (navi-default) has no path → project skills aren't listed.
  const projectPath = useMemo(() => {
    const proj = projects.find((p) => p.id === currentProjectId)
    return proj?.path || undefined
  }, [projects, currentProjectId])

  // Available skills for the composer `/skill` picker, scoped to the active
  // project. Reloaded when the project changes or when the settings stage
  // toggles (a create/enable/disable in the Skills tab may have changed the set).
  const [skills, setSkills] = useState<SkillSummary[]>([])
  const refreshSkills = useCallback(() => {
    void window.navi.flue.listSkills(projectPath).then(setSkills)
  }, [projectPath])
  useEffect(() => {
    refreshSkills()
  }, [refreshSkills, settingsOpen])

  // Open the settings stage on a specific tab. The provider entry points always
  // want the Providers tab, regardless of the last-selected one.
  const openSettingsTab = (tab: SettingsTab) => {
    setSettingsTab(tab)
    openSettings()
  }

  const handleSend = () => {
    const text = draft
    setDraft('')
    void send(text)
  }

  return (
    <>
      <TopBar
        title={empty ? 'New conversation' : 'Conversation'}
        subtitle={statusLabel(status.ready, hasProvider, status.error)}
        sidebarCollapsed={collapsed}
        onToggleSidebar={toggle}
        onOpenSettings={toggleSettings}
        settingsActive={settingsOpen}
      />

      {settingsOpen ? (
        <div className="stage-scroll">
          <div className="providers-wrap">
            <div className="settings-tabs">
              <button
                className={settingsTab === 'providers' ? 'settings-tab is-active' : 'settings-tab'}
                onClick={() => setSettingsTab('providers')}
              >
                Providers
              </button>
              <button
                className={settingsTab === 'skills' ? 'settings-tab is-active' : 'settings-tab'}
                onClick={() => setSettingsTab('skills')}
              >
                Skills
              </button>
            </div>
            {settingsTab === 'providers' ? (
              <ProvidersSettings
                providers={providerProfiles}
                statuses={status.providers}
                ready={status.ready}
                defaultSelection={defaultSelection}
                onUpsert={upsertProvider}
                onDelete={removeProvider}
                onSetDefault={setDefaultSelection}
                onProbe={probeProvider}
                onClose={closeSettings}
              />
            ) : (
              <SkillsSettings projectPath={projectPath} onClose={closeSettings} />
            )}
          </div>
        </div>
      ) : empty ? (
        <div className="stage-scroll">
          {runtimeWakeHeroPreviewMode ? (
            <div className="runtime-wake-hero-preview-wrap">
              <RuntimeWakeHero
                runtimeError={
                  runtimeWakeHeroPreviewMode === 'error'
                    ? RUNTIME_WAKE_HERO_PREVIEW_ERROR
                    : null
                }
                waking={runtimeWakeHeroPreviewMode === 'waking' ? true : false}
              />
            </div>
          ) : clawEmptyHeroPreviewMode ? (
            <ClawEmptyHero
              agentName={CLAW_EMPTY_HERO_PREVIEW_AGENT_NAME}
              hasInboundConversation={clawEmptyHeroPreviewMode !== 'needsInbound'}
            />
          ) : (
            <div className="hero">
              <HeroStage />
              <h1 className="hero-greeting">Good to see you</h1>
              <p className="hero-sub">
                Navi is your local-first companion. Start a conversation below.
              </p>
              {!hasProvider ? (
                <button
                  className="btn btn-primary connect-provider"
                  onClick={() => openSettingsTab('providers')}
                >
                  Connect a provider
                </button>
              ) : (
                <ChatStarterGrid onSelectSuggestion={setDraft} />
              )}
            </div>
          )}
        </div>
      ) : (
        <ChatThread messages={messages} />
      )}

      <Composer
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        onCancel={cancel}
        busy={busy}
        disabled={composerDisabled}
        placeholder={
          !hasProvider
            ? 'Add a provider to start chatting…'
            : !status.ready
              ? 'Connecting to Navi…'
              : 'Send a message to Navi…'
        }
        skills={skills}
        modelChip={
          <FloatingModelPicker
            providers={providerProfiles}
            statuses={status.providers}
            active={activeSelection}
            onPickModel={pickModel}
            onPickReasoning={pickReasoning}
            onConfigure={() => openSettingsTab('providers')}
          />
        }
        voiceRecording={voiceRecording}
        queuedMessages={queuedMessagesPreview}
        executionPicker={
          executionPickerPreviewMode ? (
            <FloatingComposerExecutionPicker
              value={executionPickerPreview}
              onChange={(patch) => setExecutionPickerPreview((current) => ({ ...current, ...patch }))}
            />
          ) : undefined
        }
        footerLeft={
          composerFooterPreview ? (
            <>
              {workspaceProjectPickerPreviewMode ? (
                <WorkspaceProjectPicker
                  snapshot={workspaceProjectPickerPreviewSnapshot ?? WORKSPACE_PROJECT_PICKER_PREVIEW_EMPTY}
                  acting={workspaceProjectPickerPreviewMode === 'acting'}
                  onSelect={(root) => {
                    if (workspaceProjectPickerPreviewMode !== 'default') return
                    setWorkspaceProjectPickerPreview((current) => ({
                      ...current,
                      currentRoot: root,
                    }))
                  }}
                />
              ) : null}
              {gitBranchPickerPreviewMode ? (
                <GitBranchPicker
                  snapshot={gitBranchPickerPreviewSnapshot}
                  loading={gitBranchPickerPreviewMode === 'loading'}
                  onSwitchBranch={(branch) => {
                    if (gitBranchPickerPreviewMode !== 'default') return
                    setGitBranchPickerPreview((current) => {
                      if (!current.ok) return current
                      return {
                        ...current,
                        currentBranch: branch,
                        branches: current.branches.map((entry) => ({
                          ...entry,
                          current: entry.name === branch,
                        })),
                      }
                    })
                  }}
                />
              ) : null}
            </>
          ) : undefined
        }
      />

      {contextCapacityPreview ? (
        <div className="context-capacity-preview" aria-hidden="true">
          <ContextCapacityPopover capacity={CONTEXT_CAPACITY_PREVIEW} />
        </div>
      ) : null}

      <ImagePreviewLightbox
        open={imagePreviewLightboxPreview && !imagePreviewLightboxDismissed}
        src={IMAGE_PREVIEW_LIGHTBOX_SAMPLE.src}
        alt={IMAGE_PREVIEW_LIGHTBOX_SAMPLE.alt}
        title={IMAGE_PREVIEW_LIGHTBOX_SAMPLE.title}
        downloadHref={IMAGE_PREVIEW_LIGHTBOX_SAMPLE.src}
        downloadName="preview.svg"
        onClose={() => setImagePreviewLightboxDismissed(true)}
      />

      {devPreviewLaunchCardPreviewMode ? (
        <div className="dev-preview-launch-card-preview">
          <DevPreviewLaunchCard
            url={DEV_PREVIEW_LAUNCH_CARD_PREVIEW.url}
            opened={
              devPreviewLaunchCardPreviewMode === 'opened' || devPreviewLaunchCardOpened
            }
            onOpen={() => setDevPreviewLaunchCardOpened(true)}
          />
        </div>
      ) : null}

      {reviewPlanCardPreviewMode ? (
        <div className="review-plan-card-preview">
          <ReviewPlanCard
            title={REVIEW_PLAN_CARD_PREVIEW.title}
            relativePath={REVIEW_PLAN_CARD_PREVIEW.relativePath}
            busy={reviewPlanCardPreviewMode === 'busy' || reviewPlanCardBuildBusy}
            onOpen={() => undefined}
            onBuild={() => setReviewPlanCardBuildBusy(true)}
          />
        </div>
      ) : null}

      {reviewSummaryCardPreviewSnapshot ? (
        <div className="review-summary-card-preview">
          <ReviewSummaryCard review={reviewSummaryCardPreviewSnapshot} />
        </div>
      ) : null}

      {workMetaRowPreviewMode ? (
        <div className="work-meta-row-preview">
          <WorkMetaRow
            {...WORK_META_ROW_PREVIEW[workMetaRowPreviewMode]}
            expanded={
              workMetaRowPreviewMode === 'steps'
                ? true
                : workMetaRowExpanded
            }
            onToggle={() => setWorkMetaRowExpanded((value) => !value)}
          />
        </div>
      ) : null}

      {turnChangeSummaryPreviewMode ? (
        <div className="turn-change-summary-preview">
          <TurnChangeSummary
            changes={
              turnChangeSummaryPreviewMode === 'single'
                ? TURN_CHANGE_SUMMARY_PREVIEW_SINGLE
                : TURN_CHANGE_SUMMARY_PREVIEW
            }
            compact={turnChangeSummaryPreviewMode === 'compact'}
            defaultExpanded={turnChangeSummaryDefaultExpanded}
          />
        </div>
      ) : null}

      {modelMetaTagPreviewMode ? (
        <div className="model-meta-tag-preview">
          <div className="model-meta-tag-preview-bubble">
            <div className="model-meta-tag-preview-text">
              Can you refactor the auth middleware to use JWT validation?
            </div>
            {modelMetaTagPreviewMode === 'right' ? (
              <div className="model-meta-tag-preview-footer is-right-only">
                <ModelMetaTag label={MODEL_META_TAG_PREVIEW} align="right" />
              </div>
            ) : (
              <div className="model-meta-tag-preview-footer">
                <ModelMetaTag label={MODEL_META_TAG_PREVIEW} align="left" />
                <div className="model-meta-tag-preview-actions">Copy · Edit</div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {writePromptMetaDisclosurePreviewMode ? (
        <div className="write-prompt-meta-disclosure-preview">
          <div className="write-prompt-meta-disclosure-preview-bubble">
            <div className="write-prompt-meta-disclosure-preview-text">
              {writePromptMetaDisclosurePreviewMode === 'quotes'
                ? 'Explain how this helper clamps values.'
                : WRITE_PROMPT_META_DISCLOSURE_PREVIEW.userInput}
            </div>
            <WritePromptMetaDisclosure
              display={
                writePromptMetaDisclosurePreviewMode === 'quotes'
                  ? WRITE_PROMPT_META_DISCLOSURE_PREVIEW_QUOTES
                  : WRITE_PROMPT_META_DISCLOSURE_PREVIEW
              }
              expanded={writePromptMetaExpanded}
              onToggle={() => setWritePromptMetaExpanded((value) => !value)}
            />
          </div>
        </div>
      ) : null}

      {clawInboundMessageCardPreviewMode ? (
        <div className="claw-inbound-message-card-preview">
          <ClawInboundMessageCard
            {...(clawInboundMessageCardPreviewMode === 'minimal'
              ? CLAW_INBOUND_MESSAGE_CARD_PREVIEW_MINIMAL
              : CLAW_INBOUND_MESSAGE_CARD_PREVIEW)}
          />
        </div>
      ) : null}

      {userFileReferenceChipsPreviewMode ? (
        <div className="user-file-reference-chips-preview">
          <div className="user-file-reference-chips-preview-bubble">
            <div className="user-file-reference-chips-preview-text">
              Refactor these files to use the shared JWT validation helper.
            </div>
            <UserFileReferenceChips
              references={
                userFileReferenceChipsPreviewMode === 'directory'
                  ? USER_FILE_REFERENCE_CHIPS_PREVIEW_DIRECTORY
                  : USER_FILE_REFERENCE_CHIPS_PREVIEW
              }
            />
          </div>
        </div>
      ) : null}

      {runtimeMetaChipsPreviewMode === 'tool' ? (
        <div className="runtime-meta-chips-preview-tool">
          <div className="runtime-meta-chips-preview-tool-card">
            <div className="runtime-meta-chips-preview-tool-header">
              <div className="runtime-meta-chips-preview-tool-label">Tool</div>
              <div className="runtime-meta-chips-preview-tool-summary">
                Ran npm test in the workspace root.
              </div>
              <RuntimeMetaChips meta={RUNTIME_META_CHIPS_PREVIEW_TOOL} />
            </div>
          </div>
        </div>
      ) : null}

      {runtimeMetaChipsPreviewMode && runtimeMetaChipsPreviewMode !== 'tool' ? (
        <div className="runtime-meta-chips-preview">
          <div className="runtime-meta-chips-preview-bubble">
            <div className="runtime-meta-chips-preview-text">
              Review the auth middleware and suggest improvements.
            </div>
            <RuntimeMetaChips
              meta={
                runtimeMetaChipsPreviewMode === 'minimal'
                  ? RUNTIME_META_CHIPS_PREVIEW_MINIMAL
                  : RUNTIME_META_CHIPS_PREVIEW
              }
              align="right"
              hideAttachments
            />
          </div>
        </div>
      ) : null}

      {mediaPreviewTilePreviewMode ? (
        <div className="media-preview-tile-preview">
          <div className="media-preview-tile-preview-bubble">
            <MediaPreviewTile
              media={
                mediaPreviewTilePreviewMode === 'video'
                  ? MEDIA_PREVIEW_TILE_PREVIEW_VIDEO
                  : mediaPreviewTilePreviewMode === 'file'
                    ? MEDIA_PREVIEW_TILE_PREVIEW_FILE
                    : MEDIA_PREVIEW_TILE_PREVIEW_IMAGE
              }
              previewUrl={
                mediaPreviewTilePreviewMode === 'file'
                  ? undefined
                  : mediaPreviewTilePreviewMode === 'video'
                    ? MEDIA_PREVIEW_TILE_PREVIEW_VIDEO.previewUrl
                    : MEDIA_PREVIEW_TILE_PREVIEW_IMAGE.previewUrl
              }
              variant={mediaPreviewTilePreviewMode === 'file' ? 'conversation' : 'tool'}
            />
          </div>
        </div>
      ) : null}

      {mediaAttachmentGalleryPreviewMode === 'tool' ? (
        <div className="media-attachment-gallery-preview">
          <div className="media-attachment-gallery-preview-tool-card">
            <div className="media-attachment-gallery-preview-tool-header">
              Generated a screenshot and diagram for the auth flow.
            </div>
            <MediaAttachmentGallery
              media={MEDIA_ATTACHMENT_GALLERY_PREVIEW}
              variant="tool"
            />
          </div>
        </div>
      ) : null}

      {mediaAttachmentGalleryPreviewMode &&
      mediaAttachmentGalleryPreviewMode !== 'tool' ? (
        <div className="media-attachment-gallery-preview">
          {mediaAttachmentGalleryPreviewMode === 'conversation' ? (
            <GeneratedFilesPanel media={MEDIA_ATTACHMENT_GALLERY_PREVIEW} />
          ) : (
            <div className="media-preview-tile-preview-bubble">
              <MediaAttachmentGallery
                media={MEDIA_ATTACHMENT_GALLERY_PREVIEW.slice(0, 1)}
                variant="user"
              />
            </div>
          )}
        </div>
      ) : null}

      {copyFeedbackButtonPreviewMode === 'labeled' ? (
        <div className="copy-feedback-button-preview">
          <div className="copy-feedback-button-preview-bubble">
            <div className="copy-feedback-button-preview-text">
              {COPY_FEEDBACK_BUTTON_PREVIEW_TEXT}
            </div>
            <div className="copy-feedback-button-preview-footer is-assistant">
              <span className="copy-feedback-button-preview-timestamp">
                Jun 21, 2026, 2:30 PM
              </span>
              <CopyFeedbackButton text={COPY_FEEDBACK_BUTTON_PREVIEW_TEXT} />
            </div>
          </div>
        </div>
      ) : null}

      {copyFeedbackButtonPreviewMode &&
      copyFeedbackButtonPreviewMode !== 'labeled' ? (
        <div className="copy-feedback-button-preview">
          <div className="copy-feedback-button-preview-bubble">
            <div className="copy-feedback-button-preview-text">
              {COPY_FEEDBACK_BUTTON_PREVIEW_TEXT}
            </div>
            <div className="copy-feedback-button-preview-footer">
              <ModelMetaTag label={MODEL_META_TAG_PREVIEW} align="left" />
              <div className="copy-feedback-button-preview-actions">
                <CopyFeedbackButton
                  text={COPY_FEEDBACK_BUTTON_PREVIEW_TEXT}
                  iconOnly
                  forceStatus={
                    copyFeedbackButtonPreviewMode === 'success'
                      ? 'success'
                      : copyFeedbackButtonPreviewMode === 'error'
                        ? 'error'
                        : undefined
                  }
                />
                <span
                  className="copy-feedback-button-preview-edit"
                  aria-hidden="true"
                >
                  <PencilLine
                    className="copy-feedback-button-preview-edit-icon"
                    strokeWidth={1.8}
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {userInputBubblePreviewSnapshot ? (
        <div className="user-input-bubble-preview">
          <UserInputBubble block={userInputBubblePreviewSnapshot} />
        </div>
      ) : null}

      {generatedFilesPanelPreviewMedia ? (
        <div className="generated-files-panel-preview">
          <GeneratedFilesPanel media={generatedFilesPanelPreviewMedia} />
        </div>
      ) : null}

      {toolEntryPreview ? (
        <div className="tool-entry-preview">
          <ToolEntry
            block={toolEntryPreview.block}
            defaultExpanded={toolEntryPreview.defaultExpanded}
          />
        </div>
      ) : null}

      {threadForkBannerPreviewMode || threadForkPointPreviewMode ? (
        <div className="thread-fork-preview">
          {threadForkBannerPreviewMode ? (
            <ThreadForkBanner
              parentTitle={
                threadForkBannerPreviewMode === 'unknown'
                  ? undefined
                  : THREAD_FORK_BANNER_PREVIEW_TITLE
              }
            />
          ) : null}
          {threadForkPointPreviewMode ? (
            <ThreadForkPoint
              parentTitle={
                threadForkPointPreviewMode === 'unknown'
                  ? undefined
                  : THREAD_FORK_BANNER_PREVIEW_TITLE
              }
            />
          ) : null}
        </div>
      ) : null}
    </>
  )
}

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})
