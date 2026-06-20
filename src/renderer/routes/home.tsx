import { useState } from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { TopBar } from '../components/TopBar'
import { HeroStage } from '../components/HeroStage'
import { Composer } from '../components/Composer'
import { ChatThread } from '../components/ChatThread'
import { ApiKeyBanner } from '../components/ApiKeyBanner'
import { useNaviChat } from '../flue/useNaviChat'

function statusLabel(ready: boolean, hasApiKey: boolean, error?: string): string {
  if (!hasApiKey) return 'needs API key'
  if (error) return 'backend error'
  if (!ready) return 'connecting…'
  return 'ready'
}

function HomePage() {
  const [collapsed, setCollapsed] = useState(false)
  const [draft, setDraft] = useState('')
  const { messages, status, busy, send, cancel, setApiKey } = useNaviChat()

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
        onToggleSidebar={() => setCollapsed((v) => !v)}
      />

      {empty ? (
        <div className="stage-scroll">
          <div className="hero">
            <HeroStage />
            <h1 className="hero-greeting">Good to see you</h1>
            <p className="hero-sub">
              Navi is your local-first companion. Start a conversation below.
            </p>
            {!status.hasApiKey ? <ApiKeyBanner onSave={setApiKey} /> : null}
          </div>
        </div>
      ) : (
        <ChatThread messages={messages} />
      )}

      {!empty && !status.hasApiKey ? (
        <div className="composer-wrap">
          <div style={{ width: '100%', maxWidth: 760 }}>
            <ApiKeyBanner onSave={setApiKey} />
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
