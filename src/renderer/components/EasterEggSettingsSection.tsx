// Easter egg / UI mode workshop settings section echoing Kun's settings-section-easter-egg.tsx
// (../Kun/src/renderer/src/components/settings-section-easter-egg.tsx).
// Visual only: mock mode cards and preview modes.

import { useState, type ReactElement, type ReactNode } from 'react'
import { FolderPlus, Trash2 } from 'lucide-react'
import { GreetingMascot, SleepingMascot } from './Mascot'
import { SettingRow, SettingsCard } from './SettingsControls'

type ModeCard = {
  mode: string
  title: string
  subtitle: string
  preview: ReactNode | null
  removable: boolean
}

const COPY = {
  easterEggSection: 'Mode workshop',
  uiModeWorkshopTitle: 'Mascot modes',
  uiModeWorkshopDesc:
    'Pick the workspace mascot pack. The built-in iKun mode is itself a pre-installed UI plugin example — build and install your own packs with the developer guide (declarative image packs, no executable code).',
  uiModeDefaultTitle: 'Default Navi',
  uiModeDefaultSubtitle: 'The little blue bird',
  uiPluginInstall: 'Install plugin folder…',
  uiPluginActivate: 'Use',
  uiPluginActive: 'Active',
  uiPluginRemove: 'Remove plugin',
  uiPluginEmpty:
    'No UI plugins installed. The bundled iKun example may have been removed; install a plugin folder, or build one with the developer guide.',
  uiPluginInstallFailed: 'Install failed',
  uiPluginDocsHint: 'Developer guide: docs/UI_PLUGINS.md',
}

export const EASTER_EGG_PREVIEW_DEFAULT_MODE = 'default'

export const EASTER_EGG_PREVIEW_PLUGIN: ModeCard = {
  mode: 'ikun',
  title: 'iKun',
  subtitle: 'Kun team · v1.0.0',
  preview: <SleepingMascot className="easter-egg-mode-card-mascot" />,
  removable: true,
}

export const EASTER_EGG_PREVIEW_BUILTIN: ModeCard = {
  mode: EASTER_EGG_PREVIEW_DEFAULT_MODE,
  title: COPY.uiModeDefaultTitle,
  subtitle: COPY.uiModeDefaultSubtitle,
  preview: <GreetingMascot className="easter-egg-mode-card-mascot" />,
  removable: false,
}

type ModeCardButtonProps = {
  card: ModeCard
  active: boolean
  busy: boolean
  onActivate: () => void
  onRemove?: () => void
}

function ModeCardButton({
  card,
  active,
  busy,
  onActivate,
  onRemove,
}: ModeCardButtonProps): ReactElement {
  return (
    <div
      className={
        active ? 'easter-egg-mode-card is-active' : 'easter-egg-mode-card'
      }
    >
      <span className="easter-egg-mode-card-preview">
        {card.preview ?? <span className="easter-egg-mode-card-placeholder" />}
      </span>
      <span className="easter-egg-mode-card-copy">
        <span className="easter-egg-mode-card-title">{card.title}</span>
        <span className="easter-egg-mode-card-subtitle">{card.subtitle}</span>
      </span>
      <button
        type="button"
        disabled={busy || active}
        onClick={onActivate}
        className={
          active
            ? 'easter-egg-mode-card-action is-active'
            : 'easter-egg-mode-card-action'
        }
      >
        {active ? COPY.uiPluginActive : COPY.uiPluginActivate}
      </button>
      {card.removable && onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          title={COPY.uiPluginRemove}
          aria-label={COPY.uiPluginRemove}
          className="easter-egg-mode-card-remove"
        >
          <Trash2 className="easter-egg-mode-card-remove-icon" strokeWidth={1.8} />
        </button>
      ) : null}
    </div>
  )
}

type Props = {
  activeMode: string
  pluginCards: ModeCard[]
  busy?: boolean
  installErrors?: string[]
  lastError?: string | null
  onActivateMode?: (mode: string) => void
  onRemovePlugin?: (mode: string) => void
  onInstall?: () => void
}

export function EasterEggSettingsSection({
  activeMode,
  pluginCards,
  busy = false,
  installErrors = [],
  lastError = null,
  onActivateMode,
  onRemovePlugin,
  onInstall,
}: Props): ReactElement {
  const cards = [EASTER_EGG_PREVIEW_BUILTIN, ...pluginCards]

  return (
    <SettingsCard title={COPY.easterEggSection}>
      <SettingRow
        title={COPY.uiModeWorkshopTitle}
        description={COPY.uiModeWorkshopDesc}
        wideControl
        control={
          <div className="easter-egg-settings-control">
            <div className="easter-egg-mode-grid">
              {cards.map((card) => (
                <ModeCardButton
                  key={card.mode}
                  card={card}
                  active={activeMode === card.mode}
                  busy={busy}
                  onActivate={() => onActivateMode?.(card.mode)}
                  onRemove={
                    card.removable
                      ? () => onRemovePlugin?.(card.mode)
                      : undefined
                  }
                />
              ))}
            </div>
            {pluginCards.length === 0 ? (
              <p className="easter-egg-plugin-empty">{COPY.uiPluginEmpty}</p>
            ) : null}
            <div className="easter-egg-install-row">
              <button
                type="button"
                disabled={busy}
                onClick={() => onInstall?.()}
                className="easter-egg-install-button"
              >
                <FolderPlus className="easter-egg-install-icon" strokeWidth={1.8} />
                {COPY.uiPluginInstall}
              </button>
              <span className="easter-egg-install-hint">{COPY.uiPluginDocsHint}</span>
            </div>
            {installErrors.length > 0 ? (
              <ul className="easter-egg-install-errors">
                {installErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            ) : null}
            {lastError ? <p className="easter-egg-last-error">{lastError}</p> : null}
          </div>
        }
      />
    </SettingsCard>
  )
}

export type EasterEggPreviewMode =
  | 'default'
  | 'empty'
  | 'pluginActive'
  | 'installError'
  | 'lastError'
  | 'busy'

export function EasterEggSettingsSectionPreview({
  mode = 'default',
}: {
  mode?: EasterEggPreviewMode
}): ReactElement {
  const [activeMode, setActiveMode] = useState(() => {
    if (mode === 'pluginActive') return EASTER_EGG_PREVIEW_PLUGIN.mode
    return EASTER_EGG_PREVIEW_DEFAULT_MODE
  })

  const pluginCards =
    mode === 'empty' ? [] : [EASTER_EGG_PREVIEW_PLUGIN]

  return (
    <EasterEggSettingsSection
      activeMode={activeMode}
      pluginCards={pluginCards}
      busy={mode === 'busy'}
      installErrors={
        mode === 'installError'
          ? [COPY.uiPluginInstallFailed, 'Invalid manifest.json']
          : []
      }
      lastError={mode === 'lastError' ? 'Could not activate UI plugin pack.' : null}
      onActivateMode={setActiveMode}
      onRemovePlugin={() => undefined}
      onInstall={() => undefined}
    />
  )
}
