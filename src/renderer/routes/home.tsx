import { useState } from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { FolderOpen, Bug, Lightbulb } from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { HeroStage } from '../components/HeroStage'
import { Composer } from '../components/Composer'

const STARTERS = [
  {
    icon: FolderOpen,
    tone: 'tone-blue',
    title: 'Structure a project',
    sub: 'Scaffold a clean architecture for a new app.',
  },
  {
    icon: Bug,
    tone: 'tone-emerald',
    title: 'Debug an issue',
    sub: 'Track down a failing test or a tricky error.',
  },
  {
    icon: Lightbulb,
    tone: 'tone-violet',
    title: 'Plan a feature',
    sub: 'Sketch out requirements and an approach.',
  },
]

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
            Navi is your local-first companion. Start a conversation or pick a
            starting point below.
          </p>
          <div className="hero-cards">
            {STARTERS.map((card) => {
              const Icon = card.icon
              return (
                <button key={card.title} className="starter-card">
                  <span className={`starter-icon ${card.tone}`}>
                    <Icon />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span className="starter-title">{card.title}</span>
                    <span className="starter-sub">{card.sub}</span>
                  </span>
                </button>
              )
            })}
          </div>
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
