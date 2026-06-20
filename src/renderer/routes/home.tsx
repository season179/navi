import { useState } from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { TopBar } from '../components/TopBar'
import { HeroStage } from '../components/HeroStage'
import { Composer } from '../components/Composer'
import { ChatThread } from '../components/ChatThread'
import { ApiKeyBanner } from '../components/ApiKeyBanner'
import { useNaviThread } from '../flue/NaviChatContext'
import { useSidebar } from '../sidebar'

function statusLabel(ready: boolean, hasApiKey: boolean, error?: string): string {
  if (!hasApiKey) return 'needs API key'
  if (error) return 'backend error'
  if (!ready) return 'connecting…'
  return 'ready'
}

function HomePage() {
  const { collapsed, toggle } = useSidebar()
  const [draft, setDraft] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const { messages, status, busy, send, cancel, setApiKey, setBaseUrl } = useNaviThread()

  const empty = messages.length === 0
  const composerDisabled = !status.ready || !status.hasApiKey

  const handleSend = () => {
    const text = draft
    setDraft('')
    void send(text)
  }

  return (
    <>
      <TopBar
        title={empty ? 'New conversation' : 'Conversation'}
        subtitle={statusLabel(status.ready, status.hasApiKey, status.error)}
        sidebarCollapsed={collapsed}
        onToggleSidebar={toggle}
        onOpenSettings={() => setShowSettings((v) => !v)}
        settingsActive={showSettings}
      />

      {showSettings ? (
        <div className="composer-wrap">
          <div style={{ width: '100%', maxWidth: 760 }}>
            <ApiKeyBanner
              mode="settings"
              currentBaseUrl={status.baseUrl}
              onSaveKey={setApiKey}
              onSaveBaseUrl={setBaseUrl}
              onClose={() => setShowSettings(false)}
            />
          </div>
        </div>
      ) : null}

      {empty ? (
        <div className="stage-scroll">
          <div className="hero">
            <HeroStage />
            <h1 className="hero-greeting">Good to see you</h1>
            <p className="hero-sub">
              Navi is your local-first companion. Start a conversation below.
            </p>
            {!status.hasApiKey && !showSettings ? (
              <ApiKeyBanner
                currentBaseUrl={status.baseUrl}
                onSaveKey={setApiKey}
                onSaveBaseUrl={setBaseUrl}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <ChatThread messages={messages} />
      )}

      {!empty && !status.hasApiKey && !showSettings ? (
        <div className="composer-wrap">
          <div style={{ width: '100%', maxWidth: 760 }}>
            <ApiKeyBanner
              currentBaseUrl={status.baseUrl}
              onSaveKey={setApiKey}
              onSaveBaseUrl={setBaseUrl}
            />
          </div>
        </div>
      ) : null}

      <Composer
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        onCancel={cancel}
        busy={busy}
        disabled={composerDisabled}
        placeholder={
          !status.hasApiKey
            ? 'Add your API key to start chatting…'
            : !status.ready
              ? 'Connecting to Navi…'
              : 'Send a message to Navi…'
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
