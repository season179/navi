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
  ProcessSectionRow,
  PROCESS_SECTION_ROW_PREVIEW,
  type ProcessSectionRowPreviewMode,
} from '../components/ProcessSectionRow'
import {
  ProcessEntryRow,
  PROCESS_ENTRY_ROW_PREVIEW,
  type ProcessEntryRowPreviewMode,
} from '../components/ProcessEntryRow'
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
  RuntimeStatusBanner,
  RUNTIME_STATUS_BANNER_PREVIEW,
  type RuntimeStatusBannerPreviewMode,
} from '../components/RuntimeStatusBanner'
import {
  RuntimeBanner,
  RUNTIME_BANNER_PREVIEW,
  type RuntimeBannerPreviewMode,
} from '../components/RuntimeBanner'
import {
  SessionHeader,
  SESSION_HEADER_PREVIEW,
  SESSION_HEADER_PREVIEW_EMPTY,
  type SessionHeaderPreviewMode,
} from '../components/SessionHeader'
import {
  WorkbenchTopBar,
  WORKBENCH_TOP_BAR_PREVIEW_GUI_UPDATE,
  type RightPanelMode,
  type WorkbenchTopBarPreviewMode,
} from '../components/WorkbenchTopBar'
import {
  TodoPanel,
  TODO_PANEL_PREVIEW_ITEMS,
  type ThreadTodoItem,
  type TodoPanelPreviewMode,
} from '../components/TodoPanel'
import {
  ChangeInspector,
  CHANGE_INSPECTOR_PREVIEW_ITEMS,
  type ChangeInspectorItem,
  type ChangeInspectorPreviewMode,
} from '../components/ChangeInspector'
import {
  DevBrowserPanel,
  DEV_BROWSER_PANEL_PREVIEW,
  type DevBrowserPanelPreviewState,
  type DevBrowserPreviewMode,
} from '../components/DevBrowserPanel'
import {
  PlanPanel,
  PLAN_PANEL_PREVIEW,
  PREVIEW_COVERAGE,
  PREVIEW_DRIFT,
  type PlanPanelPreviewMode,
} from '../components/PlanPanel'
import {
  ChatFileTreePanel,
  CHAT_FILE_TREE_PREVIEW,
  type ChatFileTreePreviewMode,
} from '../components/ChatFileTreePanel'
import {
  TerminalPanel,
  TERMINAL_PANEL_PREVIEW_TABS,
  type TerminalPreviewMode,
} from '../components/TerminalPanel'
import {
  SideConversationPanel,
  SIDE_CONVERSATION_PANEL_PREVIEW_ERROR,
  SIDE_CONVERSATION_PANEL_PREVIEW_RUNNING,
  SIDE_CONVERSATION_PANEL_PREVIEW_SIDES,
  type SideConversationPanelPreviewMode,
  type SideConversationSnapshot,
} from '../components/SideConversationPanel'
import {
  WorkspaceFilePreviewPanel,
  WORKSPACE_FILE_PREVIEW_DIFF_RESULT,
  WORKSPACE_FILE_PREVIEW_MD_RESULT,
  WORKSPACE_FILE_PREVIEW_MD_TARGET,
  WORKSPACE_FILE_PREVIEW_RESULT,
  WORKSPACE_FILE_PREVIEW_TARGET,
  WORKSPACE_FILE_PREVIEW_TARGETS,
  WORKSPACE_FILE_PREVIEW_WORKSPACE,
  type WorkspaceFilePreviewMode,
  type WorkspaceFilePreviewResult,
  type WorkspaceFileTarget,
} from '../components/WorkspaceFilePreviewPanel'
import {
  AppErrorFallback,
  APP_ERROR_BOUNDARY_PREVIEW,
  type AppErrorBoundaryPreviewMode,
} from '../components/AppErrorBoundary'
import {
  GuiUpdateControl,
  GUI_UPDATE_CONTROL_PREVIEW,
  type GuiUpdateControlPreviewMode,
} from '../components/GuiUpdateControl'
import {
  SettingsSidebar,
  SettingsSidebarPreviewContent,
  resolveSettingsSidebarPreviewCategory,
  type SettingsCategory,
  type SettingsSidebarPreviewMode,
} from '../components/SettingsSidebar'
import {
  SettingsControlsPreview,
  type SettingsControlsPreviewMode,
} from '../components/SettingsControls'
import {
  GeneralSettingsSectionPreview,
  type GeneralSettingsPreviewMode,
} from '../components/GeneralSettingsSection'
import {
  KeyboardShortcutsSettingsSectionPreview,
  type KeyboardShortcutsPreviewMode,
} from '../components/KeyboardShortcutsSettingsSection'
import {
  EasterEggSettingsSectionPreview,
  type EasterEggPreviewMode,
} from '../components/EasterEggSettingsSection'
import {
  ArchivedThreadsSettingsSectionPreview,
  type ArchivedThreadsPreviewMode,
} from '../components/ArchivedThreadsSettingsSection'
import {
  UpdatesSettingsSectionPreview,
  type UpdatesSettingsPreviewMode,
} from '../components/UpdatesSettingsSection'
import {
  LlmDebugSettingsSectionPreview,
  type LlmDebugPreviewMode,
} from '../components/LlmDebugSettingsSection'
import {
  MemorySettingsSectionPreview,
  type MemoryPreviewMode,
} from '../components/MemorySettingsSection'
import {
  SpeechToTextSettingsSectionPreview,
  type SpeechToTextPreviewMode,
} from '../components/SpeechToTextSettingsSection'
import {
  ImageGenerationSettingsSectionPreview,
  type ImageGenerationPreviewMode,
} from '../components/ImageGenerationSettingsSection'
import {
  MediaGenerationSettingsSectionPreview,
  type MediaGenerationPreviewMode,
} from '../components/MediaGenerationSettingsSection'
import {
  WorktreeSettingsSectionPreview,
  type WorktreePreviewMode,
} from '../components/WorktreeSettingsSection'
import {
  ClawSettingsSectionPreview,
  type ClawPreviewMode,
} from '../components/ClawSettingsSection'
import {
  WriteSettingsSectionPreview,
  type WritePreviewMode,
} from '../components/WriteSettingsSection'
import {
  ProvidersSettingsSectionPreview,
  type ProvidersPreviewMode,
} from '../components/ProvidersSettingsSection'
import {
  AgentsSettingsSectionPreview,
  type AgentsPreviewMode,
} from '../components/AgentsSettingsSection'
import {
  ClawEmptyHero,
  CLAW_EMPTY_HERO_PREVIEW_AGENT_NAME,
} from '../components/ClawEmptyHero'
import { WorkspaceSelectEmptyHero } from '../components/WorkspaceSelectEmptyHero'
import {
  WriteWorkspaceEmptyState,
  WRITE_WORKSPACE_EMPTY_STATE_PREVIEW_ERROR,
  type WriteWorkspaceEmptyStatePreviewMode,
} from '../components/WriteWorkspaceEmptyState'
import {
  WriteWorkspaceStart,
  WRITE_WORKSPACE_START_PREVIEW,
} from '../components/WriteWorkspaceStart'
import {
  WriteFontSizeControlPreview,
  type WriteFontSizeControlPreviewMode,
} from '../components/WriteFontSizeControl'
import {
  WriteWorkspaceToolbarPreview,
  type WriteWorkspaceToolbarPreviewMode,
} from '../components/WriteWorkspaceToolbar'
import {
  WriteImagePreviewPreview,
  type WriteImagePreviewPreviewMode,
} from '../components/WriteImagePreview'
import {
  WriteFileTreePreview,
  type WriteFileTreePreviewMode,
} from '../components/WriteFileTree'
import {
  WriteSidebarPreview,
  type WriteSidebarPreviewMode,
} from '../components/WriteSidebar'
import {
  WriteInlineAgentPreview,
  type WriteInlineAgentPreviewMode,
} from '../components/WriteInlineAgent'
import {
  WriteAssistantPanelPreview,
  type WriteAssistantPanelPreviewMode,
} from '../components/WriteAssistantPanel'
import {
  WriteMarkdownPreviewPreview,
  type WriteMarkdownPreviewPreviewMode,
} from '../components/WriteMarkdownPreview'
import {
  WritePdfViewerPreview,
  type WritePdfViewerPreviewMode,
} from '../components/WritePdfViewer'
import {
  WriteMarkdownEditorPreview,
  type WriteMarkdownEditorPreviewMode,
} from '../components/WriteMarkdownEditor'
import {
  WriteWorkspaceDocumentPanePreview,
  type WriteWorkspaceDocumentPanePreviewMode,
} from '../components/WriteWorkspaceDocumentPane'
import {
  WriteWorkspaceViewPreview,
  type WriteWorkspaceViewPreviewMode,
} from '../components/WriteWorkspaceView'
import {
  WriteDebugLogModalPreview,
  type WriteDebugLogModalPreviewMode,
} from '../components/WriteDebugLogModal'
import {
  ClawSidebarPreview,
  type ClawSidebarPreviewMode,
} from '../components/ClawSidebar'
import {
  ClawAddImDialogPreview,
  type ClawAddImDialogPreviewMode,
} from '../components/ClawAddImDialog'
import {
  WindowsTitleBarPreview,
  type WindowsTitleBarPreviewMode,
} from '../components/WindowsTitleBar'
import {
  ScheduleDefaultsDialogPreview,
  type ScheduleDefaultsDialogPreviewMode,
} from '../components/ScheduleDefaultsDialog'
import {
  ScheduleTasksViewPreview,
  type ScheduleTasksPreviewMode,
} from '../components/ScheduleTasksView'
import {
  SettingsViewPreview,
  type SettingsViewPreviewMode,
} from '../components/SettingsView'
import { InitialSessionUsageHeatmap } from '../components/InitialSessionUsageHeatmap'
import { PencilLine, PanelLeft } from 'lucide-react'
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

  // Visual preview for the ported ProcessSectionRow
  // (?processSectionRow=reasoning|reasoningExpanded|reasoningActive|execution|executionExpanded|error).
  const processSectionRowPreviewMode = useMemo((): ProcessSectionRowPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('processSectionRow')) return null
    const mode = params.get('processSectionRow')
    if (mode === 'reasoningExpanded') return 'reasoningExpanded'
    if (mode === 'reasoningActive') return 'reasoningActive'
    if (mode === 'execution') return 'execution'
    if (mode === 'executionExpanded') return 'executionExpanded'
    if (mode === 'error') return 'error'
    return 'reasoning'
  }, [])
  const [processSectionRowExpanded, setProcessSectionRowExpanded] = useState(false)

  // Visual preview for the ported ProcessEntryRow
  // (?processEntryRow=default|expanded|active|compaction|error|meta|assistant).
  const processEntryRowPreviewMode = useMemo((): ProcessEntryRowPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('processEntryRow')) return null
    const mode = params.get('processEntryRow')
    if (mode === 'expanded') return 'expanded'
    if (mode === 'active') return 'active'
    if (mode === 'compaction') return 'compaction'
    if (mode === 'error') return 'error'
    if (mode === 'meta') return 'meta'
    if (mode === 'assistant') return 'assistant'
    return 'default'
  }, [])
  const [processEntryRowExpanded, setProcessEntryRowExpanded] = useState(false)

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

  // Visual preview for the ported WorkspaceSelectEmptyHero
  // (?workspaceSelectEmptyHero=1).
  const workspaceSelectEmptyHeroPreview = useMemo(() => {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    return params.has('workspaceSelectEmptyHero')
  }, [])

  // Visual preview for the ported WriteWorkspaceEmptyState
  // (?writeWorkspaceEmptyState=1|error).
  const writeWorkspaceEmptyStatePreviewMode =
    useMemo((): WriteWorkspaceEmptyStatePreviewMode | null => {
      if (typeof window === 'undefined') return null
      const params = new URLSearchParams(window.location.search)
      if (!params.has('writeWorkspaceEmptyState')) return null
      return params.get('writeWorkspaceEmptyState') === 'error' ? 'error' : 'default'
    }, [])

  // Visual preview for the ported WriteWorkspaceStart (?writeWorkspaceStart=1).
  const writeWorkspaceStartPreview = useMemo(() => {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    return params.has('writeWorkspaceStart')
  }, [])

  // Visual preview for the ported WriteFontSizeControl
  // (?writeFontSizeControl=1|min|max).
  const writeFontSizeControlPreviewMode =
    useMemo((): WriteFontSizeControlPreviewMode | null => {
      if (typeof window === 'undefined') return null
      const params = new URLSearchParams(window.location.search)
      if (!params.has('writeFontSizeControl')) return null
      const value = params.get('writeFontSizeControl')
      if (value === 'min') return 'min'
      if (value === 'max') return 'max'
      return 'default'
    }, [])

  // Visual preview for the ported WriteWorkspaceToolbar
  // (?writeWorkspaceToolbar=1|pdf|dirty|saving|error|readonly|exportMenu|modeMenu|assistant|review|image).
  const writeWorkspaceToolbarPreviewMode =
    useMemo((): WriteWorkspaceToolbarPreviewMode | null => {
      if (typeof window === 'undefined') return null
      const params = new URLSearchParams(window.location.search)
      if (!params.has('writeWorkspaceToolbar')) return null
      const value = params.get('writeWorkspaceToolbar')
      if (value === 'pdf') return 'pdf'
      if (value === 'dirty') return 'dirty'
      if (value === 'saving') return 'saving'
      if (value === 'error') return 'error'
      if (value === 'readonly') return 'readonly'
      if (value === 'exportMenu') return 'exportMenu'
      if (value === 'modeMenu') return 'modeMenu'
      if (value === 'assistant') return 'assistant'
      if (value === 'review') return 'review'
      if (value === 'image') return 'image'
      return 'default'
    }, [])

  // Visual preview for the ported WriteImagePreview
  // (?writeImagePreview=1|actual|zoomed).
  const writeImagePreviewPreviewMode =
    useMemo((): WriteImagePreviewPreviewMode | null => {
      if (typeof window === 'undefined') return null
      const params = new URLSearchParams(window.location.search)
      if (!params.has('writeImagePreview')) return null
      const value = params.get('writeImagePreview')
      if (value === 'actual') return 'actual'
      if (value === 'zoomed') return 'zoomed'
      return 'default'
    }, [])

  // Visual preview for the ported WriteFileTree
  // (?writeFileTreePreview=1|empty|loading|error).
  const writeFileTreePreviewMode = useMemo((): WriteFileTreePreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('writeFileTreePreview')) return null
    const value = params.get('writeFileTreePreview')
    if (value === 'empty') return 'empty'
    if (value === 'loading') return 'loading'
    if (value === 'error') return 'error'
    return 'default'
  }, [])

  // Visual preview for the ported WriteSidebar
  // (?writeSidebarPreview=1|empty|multi|error|createFile|deleteFile).
  const writeSidebarPreviewMode = useMemo((): WriteSidebarPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('writeSidebarPreview')) return null
    const value = params.get('writeSidebarPreview')
    if (value === 'empty') return 'empty'
    if (value === 'multi') return 'multi'
    if (value === 'error') return 'error'
    if (value === 'createFile') return 'createFile'
    if (value === 'deleteFile') return 'deleteFile'
    return 'default'
  }, [])

  // Visual preview for the ported WriteInlineAgent
  // (?writeInlineAgent=1|blockMenu|emptyAgents|askOnly|inFlight|skills|imageMode).
  const writeInlineAgentPreviewMode = useMemo((): WriteInlineAgentPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('writeInlineAgent')) return null
    const value = params.get('writeInlineAgent')
    if (value === 'blockMenu') return 'blockMenu'
    if (value === 'emptyAgents') return 'emptyAgents'
    if (value === 'askOnly') return 'askOnly'
    if (value === 'inFlight') return 'inFlight'
    if (value === 'skills') return 'skills'
    if (value === 'imageMode') return 'imageMode'
    return 'default'
  }, [])

  // Visual preview for the ported WriteAssistantPanel
  // (?writeAssistantPanelPreview=1|timeline|quoted|pdf|noFile|streaming).
  const writeAssistantPanelPreviewMode = useMemo((): WriteAssistantPanelPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('writeAssistantPanelPreview')) return null
    const value = params.get('writeAssistantPanelPreview')
    if (value === 'timeline') return 'timeline'
    if (value === 'quoted') return 'quoted'
    if (value === 'pdf') return 'pdf'
    if (value === 'noFile') return 'noFile'
    if (value === 'streaming') return 'streaming'
    return 'default'
  }, [])

  // Visual preview for the ported WriteMarkdownPreview
  // (?writeMarkdownPreview=1|plain|error).
  const writeMarkdownPreviewPreviewMode = useMemo((): WriteMarkdownPreviewPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('writeMarkdownPreview')) return null
    const value = params.get('writeMarkdownPreview')
    if (value === 'plain') return 'plain'
    if (value === 'error') return 'error'
    return 'default'
  }, [])

  // Visual preview for the ported WriteMarkdownEditor
  // (?writeMarkdownEditor=1|source|readonly|diffReview).
  const writeMarkdownEditorPreviewMode = useMemo((): WriteMarkdownEditorPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('writeMarkdownEditor')) return null
    const value = params.get('writeMarkdownEditor')
    if (value === 'source') return 'source'
    if (value === 'readonly') return 'readonly'
    if (value === 'diffReview') return 'diffReview'
    return 'default'
  }, [])

  // Visual preview for the ported WritePdfViewer
  // (?writePdfViewer=1|loading|error|noText|selection).
  const writePdfViewerPreviewMode = useMemo((): WritePdfViewerPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('writePdfViewer')) return null
    const value = params.get('writePdfViewer')
    if (value === 'loading') return 'loading'
    if (value === 'error') return 'error'
    if (value === 'noText') return 'noText'
    if (value === 'selection') return 'selection'
    return 'default'
  }, [])

  // Visual preview for the ported WriteWorkspaceDocumentPane
  // (?writeWorkspaceDocumentPane=start|loading|image|pdf|unsupported|source|live|split|preview|largeFile|truncated).
  const writeWorkspaceDocumentPanePreviewMode =
    useMemo((): WriteWorkspaceDocumentPanePreviewMode | null => {
      if (typeof window === 'undefined') return null
      const params = new URLSearchParams(window.location.search)
      if (!params.has('writeWorkspaceDocumentPane')) return null
      const value = params.get('writeWorkspaceDocumentPane')
      if (value === 'start') return 'start'
      if (value === 'loading') return 'loading'
      if (value === 'image') return 'image'
      if (value === 'pdf') return 'pdf'
      if (value === 'unsupported') return 'unsupported'
      if (value === 'source') return 'source'
      if (value === 'live') return 'live'
      if (value === 'split') return 'split'
      if (value === 'preview') return 'preview'
      if (value === 'largeFile') return 'largeFile'
      if (value === 'truncated') return 'truncated'
      return 'split'
    }, [])

  // Visual preview for the ported WriteWorkspaceView
  // (?writeWorkspaceView=empty|emptyError|start|split|live|source|preview|pdf|image|inlineAgent|error|exportSuccess|exportError|dirty|saving).
  const writeWorkspaceViewPreviewMode = useMemo((): WriteWorkspaceViewPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('writeWorkspaceView')) return null
    const value = params.get('writeWorkspaceView')
    if (value === 'empty') return 'empty'
    if (value === 'emptyError') return 'emptyError'
    if (value === 'start') return 'start'
    if (value === 'live') return 'live'
    if (value === 'source') return 'source'
    if (value === 'preview') return 'preview'
    if (value === 'pdf') return 'pdf'
    if (value === 'image') return 'image'
    if (value === 'inlineAgent') return 'inlineAgent'
    if (value === 'error') return 'error'
    if (value === 'exportSuccess') return 'exportSuccess'
    if (value === 'exportError') return 'exportError'
    if (value === 'dirty') return 'dirty'
    if (value === 'saving') return 'saving'
    return 'split'
  }, [])

  // Visual preview for the ported ClawSidebar
  // (?clawSidebarPreview=1|empty|disabled|running).
  const clawSidebarPreviewMode = useMemo((): ClawSidebarPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('clawSidebarPreview')) return null
    const value = params.get('clawSidebarPreview')
    if (value === 'empty') return 'empty'
    if (value === 'disabled') return 'disabled'
    if (value === 'running') return 'running'
    return 'default'
  }, [])

  // Visual preview for the ported ClawAddImDialog
  // (?clawAddImDialogPreview=1|prompt|connection|qrLoading|qrShowing|qrSuccess|qrError|manage|edit|empty|manageEmpty|busy|error).
  const clawAddImDialogPreviewMode = useMemo((): ClawAddImDialogPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('clawAddImDialogPreview')) return null
    const value = params.get('clawAddImDialogPreview')
    if (value === 'prompt') return 'prompt'
    if (value === 'connection') return 'connection'
    if (value === 'qrLoading') return 'qrLoading'
    if (value === 'qrShowing') return 'qrShowing'
    if (value === 'qrSuccess') return 'qrSuccess'
    if (value === 'qrError') return 'qrError'
    if (value === 'manage') return 'manage'
    if (value === 'edit') return 'edit'
    if (value === 'empty') return 'empty'
    if (value === 'manageEmpty') return 'manageEmpty'
    if (value === 'busy') return 'busy'
    if (value === 'error') return 'error'
    return 'add'
  }, [])

  // Visual preview for the ported ScheduleDefaultsDialog
  // (?scheduleDefaultsDialogPreview=1|disabled|empty|singleProvider).
  const scheduleDefaultsDialogPreviewMode =
    useMemo((): ScheduleDefaultsDialogPreviewMode | null => {
      if (typeof window === 'undefined') return null
      const params = new URLSearchParams(window.location.search)
      if (!params.has('scheduleDefaultsDialogPreview')) return null
      const value = params.get('scheduleDefaultsDialogPreview')
      if (value === 'disabled') return 'disabled'
      if (value === 'empty') return 'empty'
      if (value === 'singleProvider') return 'singleProvider'
      return 'default'
    }, [])

  // Visual preview for the ported SettingsView
  // (?settingsViewPreview=1|general|providers|noApiKey|saving|saved|error|portError|writeDebugModal).
  const settingsViewPreviewMode = useMemo((): SettingsViewPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('settingsViewPreview')) return null
    const value = params.get('settingsViewPreview')
    if (!value || value === '1' || value === 'default') return 'default'
    if (value === 'noApiKey') return 'noApiKey'
    if (value === 'saving') return 'saving'
    if (value === 'saved') return 'saved'
    if (value === 'error') return 'error'
    if (value === 'portError') return 'portError'
    if (value === 'writeDebugModal') return 'writeDebugModal'
    return value as SettingsViewPreviewMode
  }, [])

  // Visual preview for the ported ScheduleTasksView
  // (?scheduleTasksViewPreview=1|empty|filterEmpty|loading|error|running|expandedResult|createDialog|editDialog|settingsDialog).
  const scheduleTasksViewPreviewMode = useMemo((): ScheduleTasksPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('scheduleTasksViewPreview')) return null
    const value = params.get('scheduleTasksViewPreview')
    if (value === 'empty') return 'empty'
    if (value === 'filterEmpty') return 'filterEmpty'
    if (value === 'loading') return 'loading'
    if (value === 'error') return 'error'
    if (value === 'running') return 'running'
    if (value === 'expandedResult') return 'expandedResult'
    if (value === 'createDialog') return 'createDialog'
    if (value === 'editDialog') return 'editDialog'
    if (value === 'settingsDialog') return 'settingsDialog'
    return 'default'
  }, [])

  // Visual preview for the ported WindowsTitleBar
  // (?windowsTitleBarPreview=1|menuOpen|maximized|linux).
  const windowsTitleBarPreviewMode = useMemo((): WindowsTitleBarPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('windowsTitleBarPreview')) return null
    const value = params.get('windowsTitleBarPreview')
    if (value === 'menuOpen') return 'menuOpen'
    if (value === 'maximized') return 'maximized'
    if (value === 'linux') return 'linux'
    return 'default'
  }, [])

  // Visual preview for the ported WriteDebugLogModal
  // (?writeDebugLogPreview=1|empty|error|loading|failed).
  const writeDebugLogPreviewMode = useMemo((): WriteDebugLogModalPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('writeDebugLogPreview')) return null
    const value = params.get('writeDebugLogPreview')
    if (value === 'empty') return 'empty'
    if (value === 'error') return 'error'
    if (value === 'loading') return 'loading'
    if (value === 'failed') return 'failed'
    return 'default'
  }, [])

  // Visual preview for the ported InitialSessionUsageHeatmap
  // (?initialSessionUsageHeatmap=populated|loading|empty|error|collapsed|models).
  const initialSessionUsageHeatmapPreviewMode = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('initialSessionUsageHeatmap')) return null
    const mode = params.get('initialSessionUsageHeatmap')
    if (mode === 'loading') return 'loading'
    if (mode === 'empty') return 'empty'
    if (mode === 'error') return 'error'
    if (mode === 'collapsed') return 'collapsed'
    if (mode === 'models') return 'models'
    return 'populated'
  }, [])

  // Visual preview for the ported RuntimeStatusBanner
  // (?runtimeStatusBanner=restarting|restartingAttempt|crashed|rolledBack).
  const runtimeStatusBannerPreviewMode = useMemo((): RuntimeStatusBannerPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('runtimeStatusBanner')) return null
    const mode = params.get('runtimeStatusBanner')
    if (mode === 'restartingAttempt') return 'restartingAttempt'
    if (mode === 'crashed') return 'crashed'
    if (mode === 'rolledBack') return 'rolledBack'
    return 'restarting'
  }, [])

  // Visual preview for the ported RuntimeBanner
  // (?runtimeBanner=1|expanded|offline|logPath).
  const runtimeBannerPreviewMode = useMemo((): RuntimeBannerPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('runtimeBanner')) return null
    const mode = params.get('runtimeBanner')
    if (mode === 'expanded') return 'expanded'
    if (mode === 'offline') return 'offline'
    if (mode === 'logPath') return 'logPath'
    return 'default'
  }, [])

  // Visual preview for the ported SessionHeader
  // (?sessionHeaderPreview=1|compact|fork|busy|empty|editing).
  const sessionHeaderPreviewMode = useMemo((): SessionHeaderPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('sessionHeaderPreview')) return null
    const mode = params.get('sessionHeaderPreview')
    if (mode === 'compact') return 'compact'
    if (mode === 'fork') return 'fork'
    if (mode === 'busy') return 'busy'
    if (mode === 'empty') return 'empty'
    if (mode === 'editing') return 'editing'
    return 'default'
  }, [])

  // Visual preview for the ported WorkbenchTopBar
  // (?workbenchTopBarPreview=1|update|downloading|downloaded|manual|sidechat|sidechatRunning|active).
  const workbenchTopBarPreviewMode = useMemo((): WorkbenchTopBarPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('workbenchTopBarPreview')) return null
    const mode = params.get('workbenchTopBarPreview')
    if (mode === 'update') return 'update'
    if (mode === 'downloading') return 'downloading'
    if (mode === 'downloaded') return 'downloaded'
    if (mode === 'manual') return 'manual'
    if (mode === 'sidechat') return 'sidechat'
    if (mode === 'sidechatRunning') return 'sidechatRunning'
    if (mode === 'active') return 'active'
    return 'default'
  }, [])
  const [workbenchTopBarPanelMode, setWorkbenchTopBarPanelMode] =
    useState<RightPanelMode>(() =>
      workbenchTopBarPreviewMode === 'active' ? 'changes' : null,
    )
  const [workbenchTopBarTerminalOpen, setWorkbenchTopBarTerminalOpen] = useState(
    () => workbenchTopBarPreviewMode === 'active',
  )
  const [workbenchTopBarFileTreeOpen, setWorkbenchTopBarFileTreeOpen] = useState(false)
  const [workbenchTopBarSideChatOpen, setWorkbenchTopBarSideChatOpen] = useState(
    () =>
      workbenchTopBarPreviewMode === 'sidechat' ||
      workbenchTopBarPreviewMode === 'sidechatRunning',
  )

  const workbenchTopBarPreviewProps = useMemo(() => {
    if (!workbenchTopBarPreviewMode) return null
    const guiUpdate =
      workbenchTopBarPreviewMode === 'update'
        ? WORKBENCH_TOP_BAR_PREVIEW_GUI_UPDATE.available
        : workbenchTopBarPreviewMode === 'downloading'
          ? WORKBENCH_TOP_BAR_PREVIEW_GUI_UPDATE.downloading
          : workbenchTopBarPreviewMode === 'downloaded'
            ? WORKBENCH_TOP_BAR_PREVIEW_GUI_UPDATE.downloaded
            : workbenchTopBarPreviewMode === 'manual'
              ? WORKBENCH_TOP_BAR_PREVIEW_GUI_UPDATE.manual
              : null
    const sideChatCount =
      workbenchTopBarPreviewMode === 'sidechat' ||
      workbenchTopBarPreviewMode === 'sidechatRunning'
        ? 3
        : 0
    const sideChatRunningCount =
      workbenchTopBarPreviewMode === 'sidechatRunning' ? 1 : 0
    return { guiUpdate, sideChatCount, sideChatRunningCount }
  }, [workbenchTopBarPreviewMode])

  // Visual preview for the ported TodoPanel (?todoPanelPreview=1|empty).
  const todoPanelPreviewMode = useMemo((): TodoPanelPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('todoPanelPreview')) return null
    return params.get('todoPanelPreview') === 'empty' ? 'empty' : 'default'
  }, [])
  const [todoPanelPreviewItems, setTodoPanelPreviewItems] = useState<ThreadTodoItem[]>(
    () => TODO_PANEL_PREVIEW_ITEMS,
  )
  useEffect(() => {
    if (todoPanelPreviewMode === 'empty') {
      setTodoPanelPreviewItems([])
      return
    }
    if (todoPanelPreviewMode) {
      setTodoPanelPreviewItems(TODO_PANEL_PREVIEW_ITEMS)
    }
  }, [todoPanelPreviewMode])

  // Visual preview for the ported ChangeInspector (?changeInspectorPreview=1|empty|single).
  const changeInspectorPreviewMode = useMemo((): ChangeInspectorPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('changeInspectorPreview')) return null
    const mode = params.get('changeInspectorPreview')
    if (mode === 'empty') return 'empty'
    if (mode === 'single') return 'single'
    return 'default'
  }, [])
  const [changeInspectorPreviewItems, setChangeInspectorPreviewItems] = useState<
    ChangeInspectorItem[]
  >(() => CHANGE_INSPECTOR_PREVIEW_ITEMS)
  const [changeInspectorPreviewSelectedId, setChangeInspectorPreviewSelectedId] = useState<
    string | null
  >(() => CHANGE_INSPECTOR_PREVIEW_ITEMS[0]?.id ?? null)
  useEffect(() => {
    if (changeInspectorPreviewMode === 'empty') {
      setChangeInspectorPreviewItems([])
      setChangeInspectorPreviewSelectedId(null)
      return
    }
    if (changeInspectorPreviewMode === 'single') {
      const single = CHANGE_INSPECTOR_PREVIEW_ITEMS.slice(0, 1)
      setChangeInspectorPreviewItems(single)
      setChangeInspectorPreviewSelectedId(single[0]?.id ?? null)
      return
    }
    if (changeInspectorPreviewMode) {
      setChangeInspectorPreviewItems(CHANGE_INSPECTOR_PREVIEW_ITEMS)
      setChangeInspectorPreviewSelectedId(CHANGE_INSPECTOR_PREVIEW_ITEMS[0]?.id ?? null)
    }
  }, [changeInspectorPreviewMode])

  // Visual preview for the ported DevBrowserPanel (?devBrowserPanelPreview=1|empty|loading|error).
  const devBrowserPanelPreviewMode = useMemo((): DevBrowserPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('devBrowserPanelPreview')) return null
    const mode = params.get('devBrowserPanelPreview')
    if (mode === 'empty') return 'empty'
    if (mode === 'loading') return 'loading'
    if (mode === 'error') return 'error'
    return 'default'
  }, [])
  const [devBrowserPanelPreview, setDevBrowserPanelPreview] = useState<DevBrowserPanelPreviewState>(
    () => ({ ...DEV_BROWSER_PANEL_PREVIEW }),
  )
  useEffect(() => {
    if (devBrowserPanelPreviewMode === 'empty') {
      setDevBrowserPanelPreview({
        activeUrl: null,
        draftUrl: '',
        pageTitle: '',
        loading: false,
        loadError: null,
        autoFollow: true,
        canGoBack: false,
        canGoForward: false,
        detectedUrls: DEV_BROWSER_PANEL_PREVIEW.detectedUrls,
      })
      return
    }
    if (devBrowserPanelPreviewMode === 'loading') {
      setDevBrowserPanelPreview({
        ...DEV_BROWSER_PANEL_PREVIEW,
        loading: true,
      })
      return
    }
    if (devBrowserPanelPreviewMode === 'error') {
      setDevBrowserPanelPreview({
        ...DEV_BROWSER_PANEL_PREVIEW,
        loadError: 'Page failed to load',
      })
      return
    }
    if (devBrowserPanelPreviewMode) {
      setDevBrowserPanelPreview({ ...DEV_BROWSER_PANEL_PREVIEW })
    }
  }, [devBrowserPanelPreviewMode])

  // Visual preview for the ported PlanPanel (?planPanelPreview=1|empty|noworkspace|dirty|saving|coverage|drift|error).
  const planPanelPreviewMode = useMemo((): PlanPanelPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('planPanelPreview')) return null
    const mode = params.get('planPanelPreview')
    if (
      mode === 'empty' ||
      mode === 'noworkspace' ||
      mode === 'dirty' ||
      mode === 'saving' ||
      mode === 'coverage' ||
      mode === 'drift' ||
      mode === 'error'
    ) {
      return mode
    }
    return 'default'
  }, [])
  const planPanelPreviewProps = useMemo(() => {
    if (!planPanelPreviewMode) return null
    if (planPanelPreviewMode === 'noworkspace') {
      return {
        workspaceRoot: '',
        activePlan: null,
        saveStatus: 'saved' as const,
        operationStatus: 'idle' as const,
        error: null,
        coverage: null,
      }
    }
    if (planPanelPreviewMode === 'empty') {
      return {
        workspaceRoot: PLAN_PANEL_PREVIEW.workspaceRoot,
        activePlan: null,
        saveStatus: 'saved' as const,
        operationStatus: 'idle' as const,
        error: null,
        coverage: null,
      }
    }
    if (planPanelPreviewMode === 'dirty') {
      return {
        ...PLAN_PANEL_PREVIEW,
        saveStatus: 'dirty' as const,
      }
    }
    if (planPanelPreviewMode === 'saving') {
      return {
        ...PLAN_PANEL_PREVIEW,
        saveStatus: 'saving' as const,
      }
    }
    if (planPanelPreviewMode === 'coverage') {
      return {
        ...PLAN_PANEL_PREVIEW,
        coverage: PREVIEW_COVERAGE,
      }
    }
    if (planPanelPreviewMode === 'drift') {
      return {
        ...PLAN_PANEL_PREVIEW,
        coverage: PREVIEW_DRIFT,
      }
    }
    if (planPanelPreviewMode === 'error') {
      return {
        ...PLAN_PANEL_PREVIEW,
        error: 'Could not start the agent turn for this plan.',
      }
    }
    return { ...PLAN_PANEL_PREVIEW }
  }, [planPanelPreviewMode])

  // Visual preview for the ported ChatFileTreePanel (?chatFileTreePanelPreview=1|loading|empty|error).
  const chatFileTreePanelPreviewMode = useMemo((): ChatFileTreePreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('chatFileTreePanelPreview')) return null
    const mode = params.get('chatFileTreePanelPreview')
    if (mode === 'loading' || mode === 'empty' || mode === 'error' || mode === 'noworkspace') {
      return mode
    }
    return 'default'
  }, [])
  const [chatFileTreePanelPreviewSelectedPath, setChatFileTreePanelPreviewSelectedPath] =
    useState<string | null>(() => CHAT_FILE_TREE_PREVIEW.selectedPath)
  const chatFileTreePanelPreviewProps = useMemo(() => {
    if (!chatFileTreePanelPreviewMode) return null
    if (chatFileTreePanelPreviewMode === 'noworkspace') {
      return {
        workspaceRoot: '',
        entries: [] as typeof CHAT_FILE_TREE_PREVIEW.entries,
        loading: false,
        error: null as string | null,
      }
    }
    if (chatFileTreePanelPreviewMode === 'loading') {
      return {
        workspaceRoot: CHAT_FILE_TREE_PREVIEW.workspaceRoot,
        entries: [],
        loading: true,
        error: null,
      }
    }
    if (chatFileTreePanelPreviewMode === 'empty') {
      return {
        workspaceRoot: CHAT_FILE_TREE_PREVIEW.workspaceRoot,
        entries: [],
        loading: false,
        error: null,
      }
    }
    if (chatFileTreePanelPreviewMode === 'error') {
      return {
        workspaceRoot: CHAT_FILE_TREE_PREVIEW.workspaceRoot,
        entries: [],
        loading: false,
        error: 'Could not read workspace directory.',
      }
    }
    return {
      workspaceRoot: CHAT_FILE_TREE_PREVIEW.workspaceRoot,
      entries: CHAT_FILE_TREE_PREVIEW.entries,
      loading: false,
      error: null,
    }
  }, [chatFileTreePanelPreviewMode])

  // Visual preview for the ported TerminalPanel (?terminalPanelPreview=1|single|error|exited).
  const terminalPanelPreviewMode = useMemo((): TerminalPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('terminalPanelPreview')) return null
    const mode = params.get('terminalPanelPreview')
    if (mode === 'single' || mode === 'error' || mode === 'exited') return mode
    return 'default'
  }, [])
  const terminalPanelPreviewProps = useMemo(() => {
    if (!terminalPanelPreviewMode) return null
    if (terminalPanelPreviewMode === 'single') {
      return {
        tabs: TERMINAL_PANEL_PREVIEW_TABS.slice(0, 1),
        error: null as string | null,
        exited: false,
      }
    }
    if (terminalPanelPreviewMode === 'error') {
      return {
        tabs: TERMINAL_PANEL_PREVIEW_TABS,
        error: 'Could not spawn shell in workspace.',
        exited: false,
      }
    }
    if (terminalPanelPreviewMode === 'exited') {
      return {
        tabs: TERMINAL_PANEL_PREVIEW_TABS,
        error: null as string | null,
        exited: true,
      }
    }
    return {
      tabs: TERMINAL_PANEL_PREVIEW_TABS,
      error: null as string | null,
      exited: false,
    }
  }, [terminalPanelPreviewMode])
  const [terminalPanelPreviewOpen, setTerminalPanelPreviewOpen] = useState(true)

  // Visual preview for the ported SideConversationPanel (?sideConversationPanelPreview=1|draft|minimized|running|error).
  const sideConversationPanelPreviewMode = useMemo((): SideConversationPanelPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('sideConversationPanelPreview')) return null
    const mode = params.get('sideConversationPanelPreview')
    if (
      mode === 'draft' ||
      mode === 'minimized' ||
      mode === 'running' ||
      mode === 'error'
    ) {
      return mode
    }
    return 'default'
  }, [])
  const sideConversationPanelPreviewProps = useMemo(() => {
    if (!sideConversationPanelPreviewMode) return null
    if (sideConversationPanelPreviewMode === 'draft') {
      return {
        sides: [] as SideConversationSnapshot[],
        activeSideId: null as string | null,
        showDraft: true,
        minimized: false,
      }
    }
    if (sideConversationPanelPreviewMode === 'minimized') {
      return {
        sides: SIDE_CONVERSATION_PANEL_PREVIEW_SIDES,
        activeSideId: SIDE_CONVERSATION_PANEL_PREVIEW_SIDES[0]?.threadId ?? null,
        showDraft: false,
        minimized: true,
      }
    }
    if (sideConversationPanelPreviewMode === 'running') {
      return {
        sides: [SIDE_CONVERSATION_PANEL_PREVIEW_RUNNING],
        activeSideId: SIDE_CONVERSATION_PANEL_PREVIEW_RUNNING.threadId,
        showDraft: false,
        minimized: false,
      }
    }
    if (sideConversationPanelPreviewMode === 'error') {
      return {
        sides: [SIDE_CONVERSATION_PANEL_PREVIEW_ERROR],
        activeSideId: SIDE_CONVERSATION_PANEL_PREVIEW_ERROR.threadId,
        showDraft: false,
        minimized: false,
      }
    }
    return {
      sides: SIDE_CONVERSATION_PANEL_PREVIEW_SIDES,
      activeSideId: SIDE_CONVERSATION_PANEL_PREVIEW_SIDES[0]?.threadId ?? null,
      showDraft: false,
      minimized: false,
    }
  }, [sideConversationPanelPreviewMode])
  const [sideConversationPanelPreviewActiveId, setSideConversationPanelPreviewActiveId] =
    useState<string | null>(() => SIDE_CONVERSATION_PANEL_PREVIEW_SIDES[0]?.threadId ?? null)
  const [sideConversationPanelPreviewMinimized, setSideConversationPanelPreviewMinimized] =
    useState(false)
  const [sideConversationPanelPreviewOpen, setSideConversationPanelPreviewOpen] = useState(true)
  useEffect(() => {
    if (!sideConversationPanelPreviewProps) return
    setSideConversationPanelPreviewActiveId(sideConversationPanelPreviewProps.activeSideId)
    setSideConversationPanelPreviewMinimized(sideConversationPanelPreviewProps.minimized)
    setSideConversationPanelPreviewOpen(true)
  }, [sideConversationPanelPreviewProps])

  // Visual preview for the ported WorkspaceFilePreviewPanel (?workspaceFilePreviewPanel=1|markdown|empty|loading|error|multitab).
  const workspaceFilePreviewPanelMode = useMemo((): WorkspaceFilePreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('workspaceFilePreviewPanel')) return null
    const mode = params.get('workspaceFilePreviewPanel')
    if (
      mode === 'markdown' ||
      mode === 'empty' ||
      mode === 'loading' ||
      mode === 'error' ||
      mode === 'multitab'
    ) {
      return mode
    }
    return 'default'
  }, [])
  const workspaceFilePreviewPanelProps = useMemo(() => {
    if (!workspaceFilePreviewPanelMode) return null
    if (workspaceFilePreviewPanelMode === 'empty') {
      return {
        target: null as WorkspaceFileTarget | null,
        openTargets: [] as WorkspaceFileTarget[],
        result: null as WorkspaceFilePreviewResult | null,
        loading: false,
      }
    }
    if (workspaceFilePreviewPanelMode === 'loading') {
      return {
        target: WORKSPACE_FILE_PREVIEW_TARGET,
        openTargets: [WORKSPACE_FILE_PREVIEW_TARGET],
        result: null as WorkspaceFilePreviewResult | null,
        loading: true,
      }
    }
    if (workspaceFilePreviewPanelMode === 'error') {
      return {
        target: WORKSPACE_FILE_PREVIEW_TARGET,
        openTargets: [WORKSPACE_FILE_PREVIEW_TARGET],
        result: {
          ok: false,
          message: 'Could not read workspace file preview.',
        } as WorkspaceFilePreviewResult,
        loading: false,
      }
    }
    if (workspaceFilePreviewPanelMode === 'markdown') {
      return {
        target: WORKSPACE_FILE_PREVIEW_MD_TARGET,
        openTargets: [WORKSPACE_FILE_PREVIEW_MD_TARGET],
        result: WORKSPACE_FILE_PREVIEW_MD_RESULT,
        loading: false,
      }
    }
    if (workspaceFilePreviewPanelMode === 'multitab') {
      return {
        target: WORKSPACE_FILE_PREVIEW_TARGET,
        openTargets: WORKSPACE_FILE_PREVIEW_TARGETS,
        result: WORKSPACE_FILE_PREVIEW_RESULT,
        loading: false,
      }
    }
    return {
      target: WORKSPACE_FILE_PREVIEW_TARGET,
      openTargets: [WORKSPACE_FILE_PREVIEW_TARGET],
      result: WORKSPACE_FILE_PREVIEW_RESULT,
      loading: false,
    }
  }, [workspaceFilePreviewPanelMode])
  const [workspaceFilePreviewPanelTarget, setWorkspaceFilePreviewPanelTarget] =
    useState<WorkspaceFileTarget | null>(() => WORKSPACE_FILE_PREVIEW_TARGET)
  const [workspaceFilePreviewPanelOpenTargets, setWorkspaceFilePreviewPanelOpenTargets] =
    useState<WorkspaceFileTarget[]>(() => WORKSPACE_FILE_PREVIEW_TARGETS)
  const [workspaceFilePreviewPanelResult, setWorkspaceFilePreviewPanelResult] =
    useState<WorkspaceFilePreviewResult | null>(() => WORKSPACE_FILE_PREVIEW_RESULT)
  const [workspaceFilePreviewPanelOpen, setWorkspaceFilePreviewPanelOpen] = useState(true)
  useEffect(() => {
    if (!workspaceFilePreviewPanelProps) return
    setWorkspaceFilePreviewPanelTarget(workspaceFilePreviewPanelProps.target)
    setWorkspaceFilePreviewPanelOpenTargets(workspaceFilePreviewPanelProps.openTargets)
    setWorkspaceFilePreviewPanelResult(workspaceFilePreviewPanelProps.result)
    setWorkspaceFilePreviewPanelOpen(true)
  }, [workspaceFilePreviewPanelProps])
  const handleWorkspaceFilePreviewSelectTarget = useCallback((next: WorkspaceFileTarget) => {
    setWorkspaceFilePreviewPanelTarget(next)
    if (next.path.endsWith('.md')) {
      setWorkspaceFilePreviewPanelResult(WORKSPACE_FILE_PREVIEW_MD_RESULT)
      return
    }
    if (next.path.includes('diff-stats')) {
      setWorkspaceFilePreviewPanelResult(WORKSPACE_FILE_PREVIEW_DIFF_RESULT)
      return
    }
    setWorkspaceFilePreviewPanelResult(WORKSPACE_FILE_PREVIEW_RESULT)
  }, [])
  const handleWorkspaceFilePreviewCloseTarget = useCallback((closing: WorkspaceFileTarget) => {
    setWorkspaceFilePreviewPanelOpenTargets((current) => {
      const next = current.filter(
        (item) =>
          `${item.workspaceRoot ?? ''}\n${item.path}`.replaceAll('\\', '/').toLowerCase() !==
          `${closing.workspaceRoot ?? ''}\n${closing.path}`.replaceAll('\\', '/').toLowerCase(),
      )
      if (
        workspaceFilePreviewPanelTarget &&
        `${workspaceFilePreviewPanelTarget.workspaceRoot ?? ''}\n${workspaceFilePreviewPanelTarget.path}`
          .replaceAll('\\', '/')
          .toLowerCase() ===
          `${closing.workspaceRoot ?? ''}\n${closing.path}`.replaceAll('\\', '/').toLowerCase()
      ) {
        setWorkspaceFilePreviewPanelTarget(next[next.length - 1] ?? null)
        setWorkspaceFilePreviewPanelResult(
          next.length ? WORKSPACE_FILE_PREVIEW_RESULT : null,
        )
      }
      return next
    })
  }, [workspaceFilePreviewPanelTarget])

  // Visual preview for the ported AppErrorBoundary (?appErrorBoundaryPreview=1|message).
  const appErrorBoundaryPreviewMode = useMemo((): AppErrorBoundaryPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('appErrorBoundaryPreview')) return null
    return params.get('appErrorBoundaryPreview') === 'message' ? 'message' : 'default'
  }, [])

  // Visual preview for the ported SettingsSidebar (?settingsSidebarPreview=1|providers|updates|…).
  const settingsSidebarPreviewMode = useMemo((): SettingsSidebarPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('settingsSidebarPreview')) return null
    const mode = params.get('settingsSidebarPreview')
    if (!mode || mode === '1' || mode === 'default') return 'default'
    return mode as SettingsSidebarPreviewMode
  }, [])
  const [settingsSidebarPreviewCategory, setSettingsSidebarPreviewCategory] =
    useState<SettingsCategory>(() =>
      resolveSettingsSidebarPreviewCategory(settingsSidebarPreviewMode),
    )

  // Visual preview for the ported GeneralSettingsSection (?generalSettingsPreview=1|workspaceError|legacyScanning|…).
  const generalSettingsPreviewMode = useMemo((): GeneralSettingsPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('generalSettingsPreview')) return null
    const mode = params.get('generalSettingsPreview')
    if (!mode || mode === '1' || mode === 'default') return 'default'
    return mode as GeneralSettingsPreviewMode
  }, [])

  // Visual preview for the ported KeyboardShortcutsSettingsSection (?keyboardShortcutsPreview=1|capturing|conflict|…).
  const keyboardShortcutsPreviewMode = useMemo((): KeyboardShortcutsPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('keyboardShortcutsPreview')) return null
    const mode = params.get('keyboardShortcutsPreview')
    if (!mode || mode === '1' || mode === 'default') return 'default'
    return mode as KeyboardShortcutsPreviewMode
  }, [])

  // Visual preview for the ported EasterEggSettingsSection (?easterEggPreview=1|empty|pluginActive|…).
  const easterEggPreviewMode = useMemo((): EasterEggPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('easterEggPreview')) return null
    const mode = params.get('easterEggPreview')
    if (!mode || mode === '1' || mode === 'default') return 'default'
    return mode as EasterEggPreviewMode
  }, [])

  // Visual preview for the ported ArchivedThreadsSettingsSection (?archivedThreadsPreview=1|empty|search|…).
  const archivedThreadsPreviewMode = useMemo((): ArchivedThreadsPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('archivedThreadsPreview')) return null
    const mode = params.get('archivedThreadsPreview')
    if (!mode || mode === '1' || mode === 'default') return 'default'
    return mode as ArchivedThreadsPreviewMode
  }, [])

  // Visual preview for the ported UpdatesSettingsSection (?updatesSettingsPreview=1|available|downloading|…).
  const updatesSettingsPreviewMode = useMemo((): UpdatesSettingsPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('updatesSettingsPreview')) return null
    const mode = params.get('updatesSettingsPreview')
    if (!mode || mode === '1' || mode === 'default') return 'default'
    return mode as UpdatesSettingsPreviewMode
  }, [])

  // Visual preview for the ported LlmDebugSettingsSection (?llmDebugPreview=1|empty|error|expanded|loading).
  const llmDebugPreviewMode = useMemo((): LlmDebugPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('llmDebugPreview')) return null
    const mode = params.get('llmDebugPreview')
    if (!mode || mode === '1' || mode === 'default') return 'default'
    return mode as LlmDebugPreviewMode
  }, [])

  // Visual preview for the ported MemorySettingsSection (?memoryPreview=1|empty|disabled|creating|…).
  const memoryPreviewMode = useMemo((): MemoryPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('memoryPreview')) return null
    const mode = params.get('memoryPreview')
    if (!mode || mode === '1' || mode === 'default') return 'default'
    return mode as MemoryPreviewMode
  }, [])

  // Visual preview for the ported SpeechToTextSettingsSection (?speechToTextPreview=1|disabled|custom|…).
  const speechToTextPreviewMode = useMemo((): SpeechToTextPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('speechToTextPreview')) return null
    const mode = params.get('speechToTextPreview')
    if (!mode || mode === '1' || mode === 'default') return 'default'
    return mode as SpeechToTextPreviewMode
  }, [])

  // Visual preview for the ported ImageGenerationSettingsSection (?imageGenerationPreview=1|disabled|custom|…).
  const imageGenerationPreviewMode = useMemo((): ImageGenerationPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('imageGenerationPreview')) return null
    const mode = params.get('imageGenerationPreview')
    if (!mode || mode === '1' || mode === 'default') return 'default'
    return mode as ImageGenerationPreviewMode
  }, [])

  // Visual preview for the ported MediaGenerationSettingsSection (?mediaGenerationPreview=1|disabled|ttsCustom|…).
  const mediaGenerationPreviewMode = useMemo((): MediaGenerationPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('mediaGenerationPreview')) return null
    const mode = params.get('mediaGenerationPreview')
    if (!mode || mode === '1' || mode === 'default') return 'default'
    return mode as MediaGenerationPreviewMode
  }, [])

  // Visual preview for the ported WorktreeSettingsSection (?worktreePreview=1|empty|loading|error|…).
  const worktreePreviewMode = useMemo((): WorktreePreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('worktreePreview')) return null
    const mode = params.get('worktreePreview')
    if (!mode || mode === '1' || mode === 'default') return 'default'
    return mode as WorktreePreviewMode
  }, [])

  // Visual preview for the ported ClawSettingsSection (?clawPreview=1|empty|disabled|workspaceError|multi).
  const clawPreviewMode = useMemo((): ClawPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('clawPreview')) return null
    const mode = params.get('clawPreview')
    if (!mode || mode === '1' || mode === 'default') return 'default'
    return mode as ClawPreviewMode
  }, [])

  // Visual preview for the ported WriteSettingsSection (?writePreview=1|disabled|customFont|advanced|…).
  const writePreviewMode = useMemo((): WritePreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('writePreview')) return null
    const mode = params.get('writePreview')
    if (!mode || mode === '1' || mode === 'default') return 'default'
    return mode as WritePreviewMode
  }, [])

  // Visual preview for the ported ProvidersSettingsSection (?providersPreview=1|missingKey|draft|…).
  const providersPreviewMode = useMemo((): ProvidersPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('providersPreview')) return null
    const mode = params.get('providersPreview')
    if (!mode || mode === '1' || mode === 'default') return 'default'
    return mode as ProvidersPreviewMode
  }, [])

  // Visual preview for the ported AgentsSettingsSection (?agentsPreview=1|tokenEconomy|computerUse|…).
  const agentsPreviewMode = useMemo((): AgentsPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('agentsPreview')) return null
    const mode = params.get('agentsPreview')
    if (!mode || mode === '1' || mode === 'default') return 'default'
    return mode as AgentsPreviewMode
  }, [])

  // Visual preview for the ported SettingsControls (?settingsControlsPreview=1|notices|modelSelect|…).
  const settingsControlsPreviewMode = useMemo((): SettingsControlsPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('settingsControlsPreview')) return null
    const mode = params.get('settingsControlsPreview')
    if (!mode || mode === '1' || mode === 'default') return 'default'
    return mode as SettingsControlsPreviewMode
  }, [])

  // Visual preview for the ported GuiUpdateControl (?guiUpdateControlPreview=1|current|downloading|…).
  const guiUpdateControlPreviewMode = useMemo((): GuiUpdateControlPreviewMode | null => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has('guiUpdateControlPreview')) return null
    const mode = params.get('guiUpdateControlPreview')
    if (mode && mode in GUI_UPDATE_CONTROL_PREVIEW) {
      return mode as GuiUpdateControlPreviewMode
    }
    return 'available'
  }, [])

  const renderWorkbenchTopBarPreview = () => {
    if (!workbenchTopBarPreviewMode || !workbenchTopBarPreviewProps) return null
    return (
      <WorkbenchTopBar
        rightPanelMode={workbenchTopBarPanelMode}
        onToggleRightPanelMode={(mode) =>
          setWorkbenchTopBarPanelMode((current) => (current === mode ? null : mode))
        }
        planPanelEnabled
        terminalOpen={workbenchTopBarTerminalOpen}
        onToggleTerminal={() => setWorkbenchTopBarTerminalOpen((value) => !value)}
        sideChatCount={workbenchTopBarPreviewProps.sideChatCount}
        sideChatRunningCount={workbenchTopBarPreviewProps.sideChatRunningCount}
        sideChatOpen={workbenchTopBarSideChatOpen}
        onOpenSideChat={() => setWorkbenchTopBarSideChatOpen((value) => !value)}
        fileTreeOpen={workbenchTopBarFileTreeOpen}
        onToggleFileTree={() => setWorkbenchTopBarFileTreeOpen((value) => !value)}
        guiUpdate={workbenchTopBarPreviewProps.guiUpdate}
      />
    )
  }

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

  const sessionHeaderPreviewSnapshot = useMemo(() => {
    if (!sessionHeaderPreviewMode) return null
    if (sessionHeaderPreviewMode === 'empty') return null
    if (sessionHeaderPreviewMode === 'fork') return SESSION_HEADER_PREVIEW.fork
    return SESSION_HEADER_PREVIEW.default
  }, [sessionHeaderPreviewMode])

  if (appErrorBoundaryPreviewMode) {
    return (
      <AppErrorFallback error={APP_ERROR_BOUNDARY_PREVIEW[appErrorBoundaryPreviewMode]} />
    )
  }

  if (writeWorkspaceEmptyStatePreviewMode) {
    return (
      <div className="write-workspace-empty-state-preview">
        <WriteWorkspaceEmptyState
          error={
            writeWorkspaceEmptyStatePreviewMode === 'error'
              ? WRITE_WORKSPACE_EMPTY_STATE_PREVIEW_ERROR
              : null
          }
        />
      </div>
    )
  }

  if (writeWorkspaceStartPreview) {
    return (
      <div className="write-workspace-start-preview">
        <WriteWorkspaceStart
          workspaceName={WRITE_WORKSPACE_START_PREVIEW.workspaceName}
          workspacePathLabel={WRITE_WORKSPACE_START_PREVIEW.workspacePathLabel}
        />
      </div>
    )
  }

  if (writeFontSizeControlPreviewMode) {
    return <WriteFontSizeControlPreview mode={writeFontSizeControlPreviewMode} />
  }

  if (writeWorkspaceToolbarPreviewMode) {
    return <WriteWorkspaceToolbarPreview mode={writeWorkspaceToolbarPreviewMode} />
  }

  if (writeImagePreviewPreviewMode) {
    return <WriteImagePreviewPreview mode={writeImagePreviewPreviewMode} />
  }

  if (writeSidebarPreviewMode) {
    return <WriteSidebarPreview mode={writeSidebarPreviewMode} />
  }

  if (writeAssistantPanelPreviewMode) {
    return <WriteAssistantPanelPreview mode={writeAssistantPanelPreviewMode} />
  }

  if (writeMarkdownPreviewPreviewMode) {
    return <WriteMarkdownPreviewPreview mode={writeMarkdownPreviewPreviewMode} />
  }

  if (writeMarkdownEditorPreviewMode) {
    return <WriteMarkdownEditorPreview mode={writeMarkdownEditorPreviewMode} />
  }

  if (writePdfViewerPreviewMode) {
    return <WritePdfViewerPreview mode={writePdfViewerPreviewMode} />
  }

  if (clawSidebarPreviewMode) {
    return <ClawSidebarPreview mode={clawSidebarPreviewMode} />
  }

  if (clawAddImDialogPreviewMode) {
    return <ClawAddImDialogPreview mode={clawAddImDialogPreviewMode} />
  }

  if (settingsViewPreviewMode) {
    return <SettingsViewPreview mode={settingsViewPreviewMode} />
  }

  if (scheduleTasksViewPreviewMode) {
    return <ScheduleTasksViewPreview mode={scheduleTasksViewPreviewMode} />
  }

  if (scheduleDefaultsDialogPreviewMode) {
    return <ScheduleDefaultsDialogPreview mode={scheduleDefaultsDialogPreviewMode} />
  }

  if (windowsTitleBarPreviewMode) {
    return <WindowsTitleBarPreview mode={windowsTitleBarPreviewMode} />
  }

  if (writeDebugLogPreviewMode) {
    return <WriteDebugLogModalPreview mode={writeDebugLogPreviewMode} />
  }

  if (writeWorkspaceViewPreviewMode) {
    return <WriteWorkspaceViewPreview mode={writeWorkspaceViewPreviewMode} />
  }

  if (writeWorkspaceDocumentPanePreviewMode) {
    return <WriteWorkspaceDocumentPanePreview mode={writeWorkspaceDocumentPanePreviewMode} />
  }

  if (writeInlineAgentPreviewMode) {
    return <WriteInlineAgentPreview mode={writeInlineAgentPreviewMode} />
  }

  if (writeFileTreePreviewMode) {
    return <WriteFileTreePreview mode={writeFileTreePreviewMode} />
  }

  if (generalSettingsPreviewMode) {
    return (
      <div className="general-settings-preview">
        <div className="general-settings-preview-inner">
          <h1 className="general-settings-preview-title">General settings</h1>
          <p className="general-settings-preview-subtitle">
            General category from Kun settings-section-general.tsx.
          </p>
          <div className="general-settings-preview-stack">
            <GeneralSettingsSectionPreview mode={generalSettingsPreviewMode} />
          </div>
        </div>
      </div>
    )
  }

  if (keyboardShortcutsPreviewMode) {
    return (
      <div className="keyboard-shortcuts-preview">
        <div className="keyboard-shortcuts-preview-inner">
          <h1 className="keyboard-shortcuts-preview-title">Keyboard shortcuts</h1>
          <p className="keyboard-shortcuts-preview-subtitle">
            Shortcuts category from Kun settings-section-shortcuts.tsx.
          </p>
          <div className="keyboard-shortcuts-preview-stack">
            <KeyboardShortcutsSettingsSectionPreview mode={keyboardShortcutsPreviewMode} />
          </div>
        </div>
      </div>
    )
  }

  if (easterEggPreviewMode) {
    return (
      <div className="easter-egg-preview">
        <div className="easter-egg-preview-inner">
          <h1 className="easter-egg-preview-title">Mode workshop</h1>
          <p className="easter-egg-preview-subtitle">
            Easter egg category from Kun settings-section-easter-egg.tsx.
          </p>
          <div className="easter-egg-preview-stack">
            <EasterEggSettingsSectionPreview mode={easterEggPreviewMode} />
          </div>
        </div>
      </div>
    )
  }

  if (archivedThreadsPreviewMode) {
    return (
      <div className="archived-threads-preview">
        <div className="archived-threads-preview-inner">
          <h1 className="archived-threads-preview-title">Archives</h1>
          <p className="archived-threads-preview-subtitle">
            Archives category from Kun settings-section-archives.tsx.
          </p>
          <div className="archived-threads-preview-stack">
            <ArchivedThreadsSettingsSectionPreview mode={archivedThreadsPreviewMode} />
          </div>
        </div>
      </div>
    )
  }

  if (updatesSettingsPreviewMode) {
    return (
      <div className="updates-settings-preview">
        <div className="updates-settings-preview-inner">
          <h1 className="updates-settings-preview-title">Version & updates</h1>
          <p className="updates-settings-preview-subtitle">
            Updates category from Kun settings-section-updates.tsx.
          </p>
          <div className="updates-settings-preview-stack">
            <UpdatesSettingsSectionPreview mode={updatesSettingsPreviewMode} />
          </div>
        </div>
      </div>
    )
  }

  if (llmDebugPreviewMode) {
    return (
      <div className="llm-debug-preview">
        <div className="llm-debug-preview-inner">
          <h1 className="llm-debug-preview-title">LLM request troubleshooting</h1>
          <p className="llm-debug-preview-subtitle">
            Debug category from Kun settings-section-llm-debug.tsx.
          </p>
          <div className="llm-debug-preview-stack">
            <LlmDebugSettingsSectionPreview mode={llmDebugPreviewMode} />
          </div>
        </div>
      </div>
    )
  }

  if (memoryPreviewMode) {
    return (
      <div className="memory-preview">
        <div className="memory-preview-inner">
          <h1 className="memory-preview-title">Long-term memory</h1>
          <p className="memory-preview-subtitle">
            Memory category from Kun settings-section-memory.tsx.
          </p>
          <div className="memory-preview-stack">
            <MemorySettingsSectionPreview mode={memoryPreviewMode} />
          </div>
        </div>
      </div>
    )
  }

  if (speechToTextPreviewMode) {
    return (
      <div className="speech-to-text-preview">
        <div className="speech-to-text-preview-inner">
          <h1 className="speech-to-text-preview-title">Speech to text</h1>
          <p className="speech-to-text-preview-subtitle">
            Speech to text category from Kun settings-section-speech-to-text.tsx.
          </p>
          <div className="speech-to-text-preview-stack">
            <SpeechToTextSettingsSectionPreview mode={speechToTextPreviewMode} />
          </div>
        </div>
      </div>
    )
  }

  if (imageGenerationPreviewMode) {
    return (
      <div className="image-generation-preview">
        <div className="image-generation-preview-inner">
          <h1 className="image-generation-preview-title">Image generation</h1>
          <p className="image-generation-preview-subtitle">
            Image generation category from Kun settings-section-image-generation.tsx.
          </p>
          <div className="image-generation-preview-stack">
            <ImageGenerationSettingsSectionPreview mode={imageGenerationPreviewMode} />
          </div>
        </div>
      </div>
    )
  }

  if (mediaGenerationPreviewMode) {
    return (
      <div className="media-generation-preview">
        <div className="media-generation-preview-inner">
          <h1 className="media-generation-preview-title">Media generation</h1>
          <p className="media-generation-preview-subtitle">
            Media generation category from Kun settings-section-media-generation.tsx.
          </p>
          <div className="media-generation-preview-stack">
            <MediaGenerationSettingsSectionPreview mode={mediaGenerationPreviewMode} />
          </div>
        </div>
      </div>
    )
  }

  if (worktreePreviewMode) {
    return (
      <div className="worktree-preview">
        <div className="worktree-preview-inner">
          <h1 className="worktree-preview-title">Worktree pool</h1>
          <p className="worktree-preview-subtitle">
            Worktree category from Kun settings-section-worktree.tsx.
          </p>
          <div className="worktree-preview-stack">
            <WorktreeSettingsSectionPreview mode={worktreePreviewMode} />
          </div>
        </div>
      </div>
    )
  }

  if (clawPreviewMode) {
    return (
      <div className="claw-preview">
        <div className="claw-preview-inner">
          <h1 className="claw-preview-title">Connect phone</h1>
          <p className="claw-preview-subtitle">
            Claw category from Kun settings-section-claw.tsx.
          </p>
          <div className="claw-preview-stack">
            <ClawSettingsSectionPreview mode={clawPreviewMode} />
          </div>
        </div>
      </div>
    )
  }

  if (writePreviewMode) {
    return (
      <div className="write-preview">
        <div className="write-preview-inner">
          <h1 className="write-preview-title">Write</h1>
          <p className="write-preview-subtitle">
            Write category from Kun settings-section-write.tsx.
          </p>
          <div className="write-preview-stack">
            <WriteSettingsSectionPreview mode={writePreviewMode} />
          </div>
        </div>
      </div>
    )
  }

  if (providersPreviewMode) {
    return (
      <div className="providers-preview">
        <div className="providers-preview-inner">
          <h1 className="providers-preview-title">Providers</h1>
          <p className="providers-preview-subtitle">
            Providers category from Kun settings-section-providers.tsx.
          </p>
          <div className="providers-preview-stack">
            <ProvidersSettingsSectionPreview mode={providersPreviewMode} />
          </div>
        </div>
      </div>
    )
  }

  if (agentsPreviewMode) {
    return (
      <div className="agents-preview">
        <div className="agents-preview-inner">
          <h1 className="agents-preview-title">AI assistant</h1>
          <p className="agents-preview-subtitle">
            Agents category from Kun settings-section-agents.tsx.
          </p>
          <div className="agents-preview-stack">
            <AgentsSettingsSectionPreview mode={agentsPreviewMode} />
          </div>
        </div>
      </div>
    )
  }

  if (settingsControlsPreviewMode) {
    return (
      <div className="settings-controls-preview">
        <div className="settings-controls-preview-inner">
          <h1 className="settings-controls-preview-title">Settings controls</h1>
          <p className="settings-controls-preview-subtitle">
            Shared form primitives from Kun settings-controls.tsx.
          </p>
          <SettingsControlsPreview mode={settingsControlsPreviewMode} />
        </div>
      </div>
    )
  }

  if (settingsSidebarPreviewMode) {
    return (
      <div className="settings-sidebar-preview">
        <SettingsSidebar
          category={settingsSidebarPreviewCategory}
          setCategory={setSettingsSidebarPreviewCategory}
          goBack={() => undefined}
        />
        <div className="settings-sidebar-preview-main">
          <SettingsSidebarPreviewContent category={settingsSidebarPreviewCategory} />
        </div>
      </div>
    )
  }

  return (
    <>
      {sessionHeaderPreviewMode === 'compact' ||
      sessionHeaderPreviewMode === 'fork' ||
      sessionHeaderPreviewMode === 'busy' ? (
        <header className="topbar">
          <div className="topbar-session">
            {collapsed ? (
              <button
                className="sidebar-titlebar-toggle"
                onClick={toggle}
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <PanelLeft />
              </button>
            ) : null}
            <SessionHeader
              snapshot={
                sessionHeaderPreviewMode === 'fork'
                  ? SESSION_HEADER_PREVIEW.fork
                  : SESSION_HEADER_PREVIEW.default
              }
              compact
              busy={sessionHeaderPreviewMode === 'busy'}
            />
          </div>
          <div className="topbar-actions">
            {renderWorkbenchTopBarPreview()}
          </div>
        </header>
      ) : workbenchTopBarPreviewMode ? (
        <header className="topbar">
          <div className="topbar-session">
            {collapsed ? (
              <button
                className="sidebar-titlebar-toggle"
                onClick={toggle}
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <PanelLeft />
              </button>
            ) : null}
            <div style={{ minWidth: 0 }}>
              <div className="topbar-title">Refactor auth middleware</div>
              <div className="topbar-subtitle">
                <span>navi</span>
                <span className="dot">·</span>
                <span>chat</span>
              </div>
            </div>
          </div>
          <div className="topbar-actions">{renderWorkbenchTopBarPreview()}</div>
        </header>
      ) : (
        <TopBar
          title={empty ? 'New conversation' : 'Conversation'}
          subtitle={statusLabel(status.ready, hasProvider, status.error)}
          sidebarCollapsed={collapsed}
          onToggleSidebar={toggle}
          onOpenSettings={toggleSettings}
          settingsActive={settingsOpen}
        />
      )}

      {sessionHeaderPreviewMode &&
      sessionHeaderPreviewMode !== 'compact' &&
      sessionHeaderPreviewMode !== 'fork' &&
      sessionHeaderPreviewMode !== 'busy' ? (
        <div className="session-header-preview-panel">
          <SessionHeader
            snapshot={sessionHeaderPreviewSnapshot}
            workspaceLabel={SESSION_HEADER_PREVIEW_EMPTY.workspaceLabel}
            compact={false}
            busy={false}
            forceEditing={sessionHeaderPreviewMode === 'editing'}
          />
        </div>
      ) : null}

      {runtimeStatusBannerPreviewMode ? (
        <RuntimeStatusBanner status={RUNTIME_STATUS_BANNER_PREVIEW[runtimeStatusBannerPreviewMode]} />
      ) : null}

      {runtimeBannerPreviewMode ? (
        <RuntimeBanner
          snapshot={RUNTIME_BANNER_PREVIEW[runtimeBannerPreviewMode]}
          forceDetailsOpen={runtimeBannerPreviewMode === 'expanded'}
        />
      ) : null}

      {todoPanelPreviewMode ? (
        <div className="todo-panel-preview-wrap">
          <TodoPanel
            items={todoPanelPreviewItems}
            onCollapse={() => setTodoPanelPreviewItems([])}
            onOpenPlan={() => undefined}
            onStatusChange={(id, status) =>
              setTodoPanelPreviewItems((current) =>
                current.map((item) =>
                  item.id === id
                    ? { ...item, status, updatedAt: new Date().toISOString() }
                    : item,
                ),
              )
            }
            onClear={() => setTodoPanelPreviewItems([])}
          />
        </div>
      ) : null}

      {changeInspectorPreviewMode ? (
        <div className="change-inspector-preview-wrap">
          <ChangeInspector
            items={changeInspectorPreviewItems}
            workspaceRoot="/Users/season/Personal/navi"
            selectedId={changeInspectorPreviewSelectedId}
            onSelect={setChangeInspectorPreviewSelectedId}
            onCollapse={() => setChangeInspectorPreviewItems([])}
          />
        </div>
      ) : null}

      {devBrowserPanelPreviewMode ? (
        <div className="dev-browser-panel-preview-wrap">
          <DevBrowserPanel
            activeUrl={devBrowserPanelPreview.activeUrl}
            draftUrl={devBrowserPanelPreview.draftUrl}
            pageTitle={devBrowserPanelPreview.pageTitle}
            loading={devBrowserPanelPreview.loading}
            loadError={devBrowserPanelPreview.loadError}
            autoFollow={devBrowserPanelPreview.autoFollow}
            canGoBack={devBrowserPanelPreview.canGoBack}
            canGoForward={devBrowserPanelPreview.canGoForward}
            detectedUrls={devBrowserPanelPreview.detectedUrls}
            onCollapse={() =>
              setDevBrowserPanelPreview((current) => ({ ...current, activeUrl: null }))
            }
            onDraftUrlChange={(value) =>
              setDevBrowserPanelPreview((current) => ({ ...current, draftUrl: value }))
            }
            onSubmitUrl={(value) =>
              setDevBrowserPanelPreview((current) => ({
                ...current,
                activeUrl: value.startsWith('http') ? value : `http://${value}`,
                draftUrl: value,
                loadError: null,
                loading: false,
              }))
            }
            onGoBack={() =>
              setDevBrowserPanelPreview((current) => ({
                ...current,
                canGoBack: false,
                canGoForward: true,
              }))
            }
            onGoForward={() =>
              setDevBrowserPanelPreview((current) => ({
                ...current,
                canGoBack: true,
                canGoForward: false,
              }))
            }
            onReload={() =>
              setDevBrowserPanelPreview((current) => ({ ...current, loading: true, loadError: null }))
            }
            onReset={() =>
              setDevBrowserPanelPreview({
                activeUrl: null,
                draftUrl: '',
                pageTitle: '',
                loading: false,
                loadError: null,
                autoFollow: true,
                canGoBack: false,
                canGoForward: false,
                detectedUrls: DEV_BROWSER_PANEL_PREVIEW.detectedUrls,
              })
            }
            onToggleAutoFollow={() =>
              setDevBrowserPanelPreview((current) => ({ ...current, autoFollow: !current.autoFollow }))
            }
            onOpenExternal={() => undefined}
            onSelectDetectedUrl={(url) =>
              setDevBrowserPanelPreview((current) => ({
                ...current,
                activeUrl: url,
                draftUrl: url.replace(/^https?:\/\//, ''),
                pageTitle: url.includes('5173') ? 'Vite + React' : '',
                loadError: null,
                loading: false,
              }))
            }
          />
        </div>
      ) : null}

      {chatFileTreePanelPreviewMode && chatFileTreePanelPreviewProps ? (
        <div className="chat-file-tree-panel-preview-wrap">
          <ChatFileTreePanel
            workspaceRoot={chatFileTreePanelPreviewProps.workspaceRoot}
            entries={chatFileTreePanelPreviewProps.entries}
            selectedPath={chatFileTreePanelPreviewSelectedPath}
            loading={chatFileTreePanelPreviewProps.loading}
            error={chatFileTreePanelPreviewProps.error}
            fill
            onPreviewFile={setChatFileTreePanelPreviewSelectedPath}
            onAddReference={() => undefined}
          />
        </div>
      ) : null}

      {terminalPanelPreviewMode && terminalPanelPreviewProps && terminalPanelPreviewOpen ? (
        <div className="terminal-panel-preview-wrap">
          <TerminalPanel
            height={280}
            tabs={terminalPanelPreviewProps.tabs}
            error={terminalPanelPreviewProps.error}
            exited={terminalPanelPreviewProps.exited}
            onCollapse={() => setTerminalPanelPreviewOpen(false)}
          />
        </div>
      ) : null}

      {sideConversationPanelPreviewMode &&
      sideConversationPanelPreviewProps &&
      sideConversationPanelPreviewOpen ? (
        <div className="side-conversation-panel-preview-wrap">
          <SideConversationPanel
            sides={sideConversationPanelPreviewProps.sides}
            activeSideId={sideConversationPanelPreviewActiveId}
            showDraft={sideConversationPanelPreviewProps.showDraft}
            minimized={sideConversationPanelPreviewMinimized}
            onSelectSide={setSideConversationPanelPreviewActiveId}
            onMinimize={() => setSideConversationPanelPreviewMinimized(true)}
            onExpand={() => setSideConversationPanelPreviewMinimized(false)}
            onClose={() => setSideConversationPanelPreviewOpen(false)}
            onNewDraft={() => {
              setSideConversationPanelPreviewActiveId(null)
            }}
          />
        </div>
      ) : null}

      {workspaceFilePreviewPanelMode &&
      workspaceFilePreviewPanelProps &&
      workspaceFilePreviewPanelOpen ? (
        <div className="workspace-file-preview-panel-preview-wrap">
          <WorkspaceFilePreviewPanel
            target={workspaceFilePreviewPanelTarget}
            openTargets={workspaceFilePreviewPanelOpenTargets}
            workspaceRoot={WORKSPACE_FILE_PREVIEW_WORKSPACE}
            result={workspaceFilePreviewPanelResult}
            loading={workspaceFilePreviewPanelProps.loading}
            onSelectTarget={handleWorkspaceFilePreviewSelectTarget}
            onCloseTarget={handleWorkspaceFilePreviewCloseTarget}
            onCollapse={() => setWorkspaceFilePreviewPanelOpen(false)}
          />
        </div>
      ) : null}

      {planPanelPreviewMode && planPanelPreviewProps ? (
        <div className="plan-panel-preview-wrap">
          <PlanPanel
            workspaceRoot={planPanelPreviewProps.workspaceRoot}
            activePlan={planPanelPreviewProps.activePlan}
            saveStatus={planPanelPreviewProps.saveStatus}
            operationStatus={planPanelPreviewProps.operationStatus}
            error={planPanelPreviewProps.error}
            coverage={planPanelPreviewProps.coverage}
            onCollapse={() => undefined}
            onOpenPlanFile={() => undefined}
            onBuildPlan={() => undefined}
            onVerifyPlan={planPanelPreviewProps.coverage ? () => undefined : undefined}
            onReplanChanged={
              planPanelPreviewProps.coverage?.driftIds.length
                ? () => undefined
                : undefined
            }
          />
        </div>
      ) : null}

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
          ) : workspaceSelectEmptyHeroPreview ? (
            <WorkspaceSelectEmptyHero />
          ) : initialSessionUsageHeatmapPreviewMode ? (
            <InitialSessionUsageHeatmap previewMode={initialSessionUsageHeatmapPreviewMode} />
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

      {processSectionRowPreviewMode ? (
        <div className="process-section-row-preview">
          <ProcessSectionRow
            section={PROCESS_SECTION_ROW_PREVIEW[processSectionRowPreviewMode]}
            expanded={
              processSectionRowPreviewMode === 'reasoningExpanded' ||
              processSectionRowPreviewMode === 'reasoningActive' ||
              processSectionRowPreviewMode === 'executionExpanded' ||
              processSectionRowPreviewMode === 'error'
                ? true
                : processSectionRowExpanded
            }
            onToggle={() => setProcessSectionRowExpanded((value) => !value)}
          />
        </div>
      ) : null}

      {processEntryRowPreviewMode ? (
        <div className="process-entry-row-preview">
          <ProcessEntryRow
            entry={PROCESS_ENTRY_ROW_PREVIEW[processEntryRowPreviewMode]}
            expanded={
              processEntryRowPreviewMode === 'expanded' ||
              processEntryRowPreviewMode === 'active' ||
              processEntryRowPreviewMode === 'error' ||
              processEntryRowPreviewMode === 'assistant'
                ? true
                : processEntryRowExpanded
            }
            onToggle={() => setProcessEntryRowExpanded((value) => !value)}
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

      {guiUpdateControlPreviewMode ? (
        <div className="gui-update-control-preview">
          <div className="gui-update-control-preview-card">
            <GuiUpdateControl
              {...GUI_UPDATE_CONTROL_PREVIEW[guiUpdateControlPreviewMode]}
              onCheck={async () => undefined}
              onDownload={async () => undefined}
              onInstall={async () => undefined}
            />
          </div>
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
