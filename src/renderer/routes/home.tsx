import { useCallback, useEffect, useMemo, useState } from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { TopBar } from '../components/TopBar'
import { HeroStage } from '../components/HeroStage'
import { Composer } from '../components/Composer'
import { ChatThread } from '../components/ChatThread'
import { FloatingModelPicker } from '../components/FloatingModelPicker'
import { ProvidersSettings } from '../components/providers/ProvidersSettings'
import { SkillsSettings } from '../components/skills/SkillsSettings'
import { hasUsableProvider, type SkillSummary } from '../../shared/flue'
import { useNaviList, useNaviThread } from '../flue/NaviChatContext'
import { useSidebar } from '../sidebar'

function statusLabel(ready: boolean, hasProvider: boolean, error?: string): string {
  if (!hasProvider) return 'needs provider'
  if (error) return 'backend error'
  if (!ready) return 'connecting…'
  return 'ready'
}

// Which settings sub-panel is open. Null = no settings panel; the chat/hero
// stage renders instead.
type SettingsTab = 'providers' | 'skills'

function HomePage() {
  const { collapsed, toggle } = useSidebar()
  const [draft, setDraft] = useState('')
  const [settingsTab, setSettingsTab] = useState<SettingsTab | null>(null)
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

  // The active project's cwd, for scoping project skills in the Skills panel.
  // A no-project chat (navi-default) has no path → project skills aren't listed.
  const projectPath = useMemo(() => {
    const proj = projects.find((p) => p.id === currentProjectId)
    return proj?.path || undefined
  }, [projects, currentProjectId])

  // Available skills for the composer `/skill` picker, scoped to the active
  // project. Reloaded when the project changes or after the Skills panel closes
  // (a create/enable/disable may have changed the set).
  const [skills, setSkills] = useState<SkillSummary[]>([])
  const refreshSkills = useCallback(() => {
    void window.navi.flue.listSkills(projectPath).then(setSkills)
  }, [projectPath])
  useEffect(() => {
    refreshSkills()
  }, [refreshSkills, settingsTab])

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
        onOpenSettings={() =>
          setSettingsTab((v) => (v === null ? 'providers' : null))
        }
        settingsActive={settingsTab !== null}
      />

      {settingsTab !== null ? (
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
                onClose={() => setSettingsTab(null)}
              />
            ) : (
              <SkillsSettings
                projectPath={projectPath}
                onClose={() => setSettingsTab(null)}
              />
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
              <button className="btn btn-primary connect-provider" onClick={() => setSettingsTab('providers')}>
                Connect a provider
              </button>
            ) : null}
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
            onConfigure={() => setSettingsTab('providers')}
          />
        }
      />
    </>
  )
}

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})
