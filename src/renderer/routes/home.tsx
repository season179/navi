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
    </>
  )
}

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})
