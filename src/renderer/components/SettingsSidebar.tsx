// Settings navigation sidebar echoing Kun's SettingsSidebar
// (../Kun/src/renderer/src/components/SettingsSidebar.tsx).
// Visual only: parent supplies active category and navigation callbacks.

import type { Dispatch, ReactElement, SetStateAction } from 'react'
import { SettingsControlsPreview } from './SettingsControls'
import {
  Archive,
  AudioLines,
  Bot,
  BrainCircuit,
  Bug,
  ChevronLeft,
  GitBranch,
  Globe,
  ImageIcon,
  Keyboard,
  Mic,
  PencilLine,
  RefreshCw,
  ServerCog,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react'

export type SettingsCategory =
  | 'general'
  | 'providers'
  | 'write'
  | 'imageGeneration'
  | 'mediaGeneration'
  | 'speechToText'
  | 'agents'
  | 'archives'
  | 'permissions'
  | 'worktree'
  | 'memory'
  | 'shortcuts'
  | 'easterEgg'
  | 'claw'
  | 'updates'
  | 'debug'

const COPY: Record<string, string> = {
  back: 'Back',
  general: 'General',
  providers: 'Providers',
  write: 'Write',
  imageGen: 'Image generation',
  mediaGeneration: 'Media generation',
  speechToText: 'Speech to text',
  agents: 'Agents',
  archives: 'Archives',
  permissions: 'Permissions',
  worktree: 'Worktree',
  memory: 'Memory',
  keyboardShortcuts: 'Keyboard shortcuts',
  easterEgg: 'Easter egg',
  updates: 'Updates',
  claw: 'Claw',
  debug: 'Debug',
  settingsFooter: 'Personal settings',
}

type CategoryItem = {
  id: SettingsCategory
  labelKey: string
  icon: typeof Globe
}

const SETTINGS_CATEGORIES: readonly CategoryItem[] = [
  { id: 'general', labelKey: 'general', icon: Globe },
  { id: 'providers', labelKey: 'providers', icon: ServerCog },
  { id: 'write', labelKey: 'write', icon: PencilLine },
  { id: 'imageGeneration', labelKey: 'imageGen', icon: ImageIcon },
  { id: 'mediaGeneration', labelKey: 'mediaGeneration', icon: AudioLines },
  { id: 'speechToText', labelKey: 'speechToText', icon: Mic },
  { id: 'agents', labelKey: 'agents', icon: Bot },
  { id: 'archives', labelKey: 'archives', icon: Archive },
  { id: 'permissions', labelKey: 'permissions', icon: ShieldCheck },
  { id: 'worktree', labelKey: 'worktree', icon: GitBranch },
  { id: 'memory', labelKey: 'memory', icon: BrainCircuit },
  { id: 'shortcuts', labelKey: 'keyboardShortcuts', icon: Keyboard },
  { id: 'easterEgg', labelKey: 'easterEgg', icon: Sparkles },
  { id: 'updates', labelKey: 'updates', icon: RefreshCw },
  { id: 'claw', labelKey: 'claw', icon: Smartphone },
  { id: 'debug', labelKey: 'debug', icon: Bug },
]

export type SettingsSidebarPreviewMode = SettingsCategory | 'default'

export function resolveSettingsSidebarPreviewCategory(
  mode: SettingsSidebarPreviewMode | null,
): SettingsCategory {
  if (!mode || mode === 'default') return 'providers'
  return mode
}

type Props = {
  category: SettingsCategory
  goBack: () => void
  setCategory: Dispatch<SetStateAction<SettingsCategory>>
  appName?: string
}

export function SettingsSidebar({
  category,
  goBack,
  setCategory,
  appName = 'Navi',
}: Props): ReactElement {
  return (
    <aside className="settings-sidebar">
      <div className="settings-sidebar-header">
        <div aria-hidden className="settings-sidebar-titlebar-safe" />
        <button type="button" onClick={goBack} className="settings-sidebar-back">
          <ChevronLeft className="settings-sidebar-back-icon" strokeWidth={1.75} />
          {COPY.back}
        </button>
      </div>

      <nav className="settings-sidebar-nav">
        {SETTINGS_CATEGORIES.map((item) => {
          const Icon = item.icon
          const active = category === item.id
          return (
            <button
              key={item.id}
              type="button"
              className={active ? 'settings-sidebar-category is-active' : 'settings-sidebar-category'}
              onClick={() => setCategory(item.id)}
            >
              <Icon className="settings-sidebar-category-icon" strokeWidth={1.75} />
              {COPY[item.labelKey] ?? item.labelKey}
            </button>
          )
        })}
      </nav>

      <div className="settings-sidebar-footer">
        <div className="settings-sidebar-footer-card">
          <div className="settings-sidebar-footer-icon">
            <Settings className="settings-sidebar-footer-icon-svg" strokeWidth={1.75} />
          </div>
          <div className="settings-sidebar-footer-copy">
            <div className="settings-sidebar-footer-title">{appName}</div>
            <div className="settings-sidebar-footer-subtitle">{COPY.settingsFooter}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export function SettingsSidebarPreviewContent({
  category,
}: {
  category: SettingsCategory
}): ReactElement {
  const label = COPY[SETTINGS_CATEGORIES.find((item) => item.id === category)?.labelKey ?? ''] ?? category

  return (
    <div className="settings-sidebar-preview-content">
      <h1 className="settings-sidebar-preview-title">Settings</h1>
      <p className="settings-sidebar-preview-subtitle">Configure {label.toLowerCase()} preferences.</p>
      {category === 'general' ? (
        <div className="settings-controls-preview-stack">
          <SettingsControlsPreview />
        </div>
      ) : category === 'agents' ? (
        <div className="settings-controls-preview-stack">
          <SettingsControlsPreview mode="modelSelect" />
        </div>
      ) : category === 'updates' ? (
        <div className="settings-controls-preview-stack">
          <SettingsControlsPreview mode="disclosure" />
        </div>
      ) : (
        <div className="settings-sidebar-preview-panel">
          <div className="settings-sidebar-preview-panel-title">{label}</div>
          <p className="settings-sidebar-preview-panel-body">
            Mock settings content for visual verification of the sidebar chrome.
          </p>
        </div>
      )}
    </div>
  )
}
