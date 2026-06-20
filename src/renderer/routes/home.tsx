import { useState } from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { TopBar } from '../components/TopBar'
import { HeroStage } from '../components/HeroStage'
import { Composer } from '../components/Composer'

function HomePage() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <TopBar
        title="New conversation"
        subtitle="agent · just now"
        sidebarCollapsed={collapsed}
        onToggleSidebar={() => setCollapsed((v) => !v)}
      />
      <div className="stage-scroll">
        <div className="hero">
          <HeroStage />
          <h1 className="hero-greeting">Good to see you</h1>
          <p className="hero-sub">
            Navi is your local-first companion. Start a conversation below.
          </p>
        </div>
      </div>
      <Composer />
    </>
  )
}

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})
