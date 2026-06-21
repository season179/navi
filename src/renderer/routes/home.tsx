import { useState } from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { TopBar } from '../components/TopBar'
import { HeroStage } from '../components/HeroStage'
import { Composer } from '../components/Composer'
import { ChatThread } from '../components/ChatThread'
import { FloatingModelPicker } from '../components/FloatingModelPicker'
import { ProvidersSettings } from '../components/providers/ProvidersSettings'
import { hasUsableProvider } from '../../shared/flue'
import { useNaviList, useNaviThread } from '../flue/NaviChatContext'
import { useSidebar } from '../sidebar'

function statusLabel(ready: boolean, hasProvider: boolean, error?: string): string {
  if (!hasProvider) return 'needs provider'
  if (error) return 'backend error'
  if (!ready) return 'connecting…'
  return 'ready'
}

function HomePage() {
  const { collapsed, toggle } = useSidebar()
  const [draft, setDraft] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const { messages, status, busy, send, cancel, activeSelection, pickModel, pickReasoning } =
    useNaviThread()
  const {
    providerProfiles,
    defaultSelection,
    upsertProvider,
    removeProvider,
    probeProvider,
    setDefaultSelection,
  } = useNaviList()

  const empty = messages.length === 0
  const hasProvider = hasUsableProvider(status, providerProfiles)
  const composerDisabled = !status.ready || !hasProvider

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
        onOpenSettings={() => setShowSettings((v) => !v)}
        settingsActive={showSettings}
      />

      {showSettings ? (
        <div className="stage-scroll">
          <div className="providers-wrap">
            <ProvidersSettings
              providers={providerProfiles}
              statuses={status.providers}
              ready={status.ready}
              defaultSelection={defaultSelection}
              onUpsert={upsertProvider}
              onDelete={removeProvider}
              onSetDefault={setDefaultSelection}
              onProbe={probeProvider}
              onClose={() => setShowSettings(false)}
            />
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
              <button className="btn btn-primary connect-provider" onClick={() => setShowSettings(true)}>
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
        modelChip={
          <FloatingModelPicker
            providers={providerProfiles}
            statuses={status.providers}
            active={activeSelection}
            onPickModel={pickModel}
            onPickReasoning={pickReasoning}
            onConfigure={() => setShowSettings(true)}
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
