// Composer model picker (Kun's FloatingComposerModelPicker). Replaces the static
// model chip: a popover grouped by provider with a model submenu, reasoning-effort
// rows, and vision/text capability badges. Selecting writes the conversation's
// {providerId, modelId} pointer; changing effort writes its reasoning — both
// per-conversation, no backend restart. When no provider is keyed it shows a
// "configure providers" empty state.

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'
import { createPortal } from 'react-dom'
import {
  Brain,
  Check,
  ChevronDown,
  ChevronRight,
  Gauge,
  Image as ImageIcon,
  Search,
  Type as TypeIcon,
} from 'lucide-react'
import type {
  DefaultSelection,
  ProviderProfile,
  ProviderStatus,
  ReasoningLevel,
} from '../../shared/flue'
import { REASONING_LEVELS } from '../../shared/flue'
import {
  COMPOSER_CONFIGURE_PROVIDERS_LABEL,
  COMPOSER_MODEL_CONTROLS_LABEL,
  COMPOSER_MODEL_LABEL,
  COMPOSER_MODEL_SEARCH_PLACEHOLDER,
  COMPOSER_MODEL_TEXT_ONLY_LABEL,
  COMPOSER_MODEL_VISION_LABEL,
  COMPOSER_NAVI_REASONING_LABELS,
  COMPOSER_NO_MATCHING_MODELS_LABEL,
  COMPOSER_NO_PROVIDERS_LABEL,
  COMPOSER_NO_PROVIDERS_SHORT_LABEL,
  COMPOSER_REASONING_SECTION_LABEL,
  formatComposerModelControlsTitle,
} from '../lib/composerModelPicker'

interface FloatingModelPickerProps {
  providers: ProviderProfile[]
  statuses: ProviderStatus[]
  active?: DefaultSelection
  onPickModel: (providerId: string, modelId: string) => void
  onPickReasoning: (level: ReasoningLevel) => void
  onConfigure: () => void
  compact?: boolean
  disabled?: boolean
  /** Preview-only: force menu open */
  menuOpen?: boolean
  /** Preview-only: force active provider submenu */
  activeProviderId?: string | null
}

type ProviderGroup = {
  providerId: string
  label: string
  modelIds: string[]
  modelVision: Record<string, boolean>
}

function ComposerModelCapabilityBadge({ vision }: { vision: boolean }): ReactElement {
  const label = vision ? COMPOSER_MODEL_VISION_LABEL : COMPOSER_MODEL_TEXT_ONLY_LABEL
  const Icon = vision ? ImageIcon : TypeIcon
  return (
    <span
      className={
        vision ? 'composer-model-cap-badge is-vision' : 'composer-model-cap-badge is-text'
      }
      title={label}
    >
      <Icon strokeWidth={1.9} />
      <span>{label}</span>
    </span>
  )
}

function modelLabel(providers: ProviderProfile[], active?: DefaultSelection): string {
  if (!active) return 'Select model'
  const model = providers
    .find((p) => p.id === active.providerId)
    ?.models.find((m) => m.id === active.modelId)
  return model?.label ?? active.modelId
}

function groupsFromProviders(providers: ProviderProfile[]): ProviderGroup[] {
  return providers.map((provider) => ({
    providerId: provider.id,
    label: provider.name,
    modelIds: provider.models.map((model) => model.id),
    modelVision: Object.fromEntries(
      provider.models.map((model) => [model.id, Boolean(model.vision)]),
    ),
  }))
}

export function FloatingModelPicker({
  providers,
  statuses,
  active,
  onPickModel,
  onPickReasoning,
  onConfigure,
  compact = false,
  disabled = false,
  menuOpen: menuOpenProp,
  activeProviderId: activeProviderIdProp,
}: FloatingModelPickerProps): ReactElement {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const submenuRef = useRef<HTMLDivElement | null>(null)
  const providerRowRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [menuOpenInternal, setMenuOpenInternal] = useState(false)
  const [activeProviderIdInternal, setActiveProviderIdInternal] = useState<string | null>(null)
  const [modelFilter, setModelFilter] = useState('')
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({ visibility: 'hidden' })
  const [submenuStyle, setSubmenuStyle] = useState<CSSProperties>({ visibility: 'hidden' })

  const menuOpen = menuOpenProp ?? menuOpenInternal
  const activeProviderId = activeProviderIdProp ?? activeProviderIdInternal

  const keyedIds = useMemo(
    () => new Set(statuses.filter((status) => status.keyState === 'ok').map((status) => status.id)),
    [statuses],
  )
  const usableProviders = useMemo(
    () => providers.filter((provider) => keyedIds.has(provider.id) && provider.models.length > 0),
    [providers, keyedIds],
  )
  const groups = useMemo(() => groupsFromProviders(usableProviders), [usableProviders])
  const needsProviderSetup = groups.length === 0
  const canOpen = !disabled && (needsProviderSetup || groups.length > 0)

  const selectedGroup =
    groups.find((group) => group.providerId === active?.providerId) ??
    groups.find((group) => group.modelIds.includes(active?.modelId ?? '')) ??
    null
  const activeGroup = groups.find((group) => group.providerId === activeProviderId) ?? null
  const filteredModelIds = activeGroup
    ? activeGroup.modelIds.filter(
        (id) => !modelFilter.trim() || id.toLowerCase().includes(modelFilter.trim().toLowerCase()),
      )
    : []

  const chipModelLabel = needsProviderSetup ? COMPOSER_NO_PROVIDERS_SHORT_LABEL : modelLabel(providers, active)
  const reasoning = active?.reasoning ?? 'medium'
  const reasoningLabel = COMPOSER_NAVI_REASONING_LABELS[reasoning]
  const controlsTitle = formatComposerModelControlsTitle(chipModelLabel, reasoningLabel)

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (rootRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      if (submenuRef.current?.contains(target)) return
      if (menuOpenProp !== undefined) return
      setMenuOpenInternal(false)
      setActiveProviderIdInternal(null)
      setModelFilter('')
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen, menuOpenProp])

  useLayoutEffect(() => {
    if (!menuOpen) {
      setMenuStyle({ visibility: 'hidden' })
      setSubmenuStyle({ visibility: 'hidden' })
      return
    }

    const updatePlacement = (): void => {
      const picker = rootRef.current
      if (!picker) return
      const rect = picker.getBoundingClientRect()
      const menuHeight = menuRef.current?.offsetHeight ?? 280
      const menuWidth = 208
      const left = Math.max(12, rect.right - menuWidth)
      const spaceAbove = rect.top - 12 - 7
      const openAbove = spaceAbove >= menuHeight
      const top = openAbove
        ? Math.max(12, rect.top - 7 - Math.min(menuHeight, 336))
        : rect.bottom + 7

      setMenuStyle({
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${menuWidth}px`,
        maxHeight: '336px',
        zIndex: 1000,
      })

      const activeRow = activeProviderId
        ? providerRowRefs.current.get(activeProviderId)
        : null
      if (activeRow) {
        const rowRect = activeRow.getBoundingClientRect()
        const submenuWidth = 232
        const submenuHeight = submenuRef.current?.offsetHeight ?? 240
        const spaceRight = window.innerWidth - rowRect.right - 12
        const openRight = spaceRight >= submenuWidth + 6
        const submenuLeft = openRight
          ? rowRect.right + 6
          : Math.max(12, rowRect.left - submenuWidth - 6)
        const submenuTop = Math.max(12, rowRect.top - 8)

        setSubmenuStyle({
          position: 'fixed',
          left: `${submenuLeft}px`,
          top: `${submenuTop}px`,
          width: `${submenuWidth}px`,
          maxHeight: '320px',
          zIndex: 1001,
        })
      } else {
        setSubmenuStyle({ visibility: 'hidden' })
      }
    }

    updatePlacement()
    window.addEventListener('resize', updatePlacement)
    window.addEventListener('scroll', updatePlacement, true)
    return () => {
      window.removeEventListener('resize', updatePlacement)
      window.removeEventListener('scroll', updatePlacement, true)
    }
  }, [menuOpen, activeProviderId, filteredModelIds.length, modelFilter])

  const toggleMenu = (): void => {
    if (!canOpen || menuOpenProp !== undefined) return
    setMenuOpenInternal((open) => {
      if (open) {
        setActiveProviderIdInternal(null)
        setModelFilter('')
      }
      return !open
    })
  }

  const selectReasoning = (level: ReasoningLevel): void => {
    onPickReasoning(level)
    if (menuOpenProp === undefined) {
      setMenuOpenInternal(false)
      setActiveProviderIdInternal(null)
    }
  }

  const selectModel = (providerId: string, modelId: string): void => {
    onPickModel(providerId, modelId)
    if (menuOpenProp === undefined) {
      setMenuOpenInternal(false)
      setActiveProviderIdInternal(null)
      setModelFilter('')
    }
  }

  const renderMenu = (): ReactElement | null => {
    if (!menuOpen || !canOpen) return null

    const menu = (
      <>
        <div ref={menuRef} role="menu" className="composer-model-picker-menu" style={menuStyle}>
          {!needsProviderSetup ? (
            <>
              <div className="composer-model-picker-section-title">
                <Brain strokeWidth={1.9} />
                <span>{COMPOSER_REASONING_SECTION_LABEL}</span>
              </div>
              <div className="composer-model-picker-reasoning-list">
                {REASONING_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    role="menuitemradio"
                    aria-checked={reasoning === level}
                    className={
                      reasoning === level
                        ? 'composer-model-picker-row is-selected'
                        : 'composer-model-picker-row'
                    }
                    onClick={() => selectReasoning(level)}
                  >
                    <span className="composer-model-picker-row-label">
                      {COMPOSER_NAVI_REASONING_LABELS[level]}
                    </span>
                    {reasoning === level ? (
                      <Check className="composer-model-picker-check" strokeWidth={2} />
                    ) : null}
                  </button>
                ))}
              </div>
              <div className="composer-model-picker-separator" />
            </>
          ) : null}

          <div className="composer-model-picker-section-title">
            <Gauge strokeWidth={1.9} />
            <span>{COMPOSER_MODEL_LABEL}</span>
          </div>

          {needsProviderSetup ? (
            <div className="composer-model-picker-empty">
              <p>{COMPOSER_NO_PROVIDERS_LABEL}</p>
              <button
                type="button"
                className="composer-model-picker-configure"
                onClick={() => {
                  if (menuOpenProp === undefined) setMenuOpenInternal(false)
                  onConfigure()
                }}
              >
                {COMPOSER_CONFIGURE_PROVIDERS_LABEL}
              </button>
            </div>
          ) : (
            <div className="composer-model-picker-provider-list">
              {groups.map((group) => {
                const selectedModel =
                  group.providerId === selectedGroup?.providerId &&
                  group.modelIds.includes(active?.modelId ?? '')
                    ? active?.modelId ?? ''
                    : ''
                return (
                  <button
                    key={group.providerId}
                    ref={(node) => {
                      if (node) providerRowRefs.current.set(group.providerId, node)
                      else providerRowRefs.current.delete(group.providerId)
                    }}
                    type="button"
                    role="menuitem"
                    aria-haspopup="menu"
                    aria-expanded={activeProviderId === group.providerId}
                    className={
                      activeProviderId === group.providerId
                        ? 'composer-model-picker-provider-row is-active'
                        : selectedGroup?.providerId === group.providerId
                          ? 'composer-model-picker-provider-row is-selected'
                          : 'composer-model-picker-provider-row'
                    }
                    onMouseEnter={() => {
                      if (activeProviderIdProp === undefined) {
                        setActiveProviderIdInternal(group.providerId)
                      }
                    }}
                    onFocus={() => {
                      if (activeProviderIdProp === undefined) {
                        setActiveProviderIdInternal(group.providerId)
                      }
                    }}
                    onClick={() => {
                      if (activeProviderIdProp === undefined) {
                        setActiveProviderIdInternal(group.providerId)
                      }
                    }}
                  >
                    <span className="composer-model-picker-provider-copy">
                      <span className="composer-model-picker-provider-label">{group.label}</span>
                      {selectedModel ? (
                        <span className="composer-model-picker-provider-subtitle">{selectedModel}</span>
                      ) : null}
                    </span>
                    <ChevronRight className="composer-model-picker-chevron" strokeWidth={1.8} />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {activeGroup && !needsProviderSetup ? (
          <div
            ref={submenuRef}
            role="menu"
            aria-label={activeGroup.label}
            className="composer-model-picker-submenu"
            style={submenuStyle}
          >
            <div className="composer-model-picker-submenu-title">{COMPOSER_MODEL_LABEL}</div>
            <label className="composer-model-picker-search">
              <Search strokeWidth={1.8} />
              <input
                type="search"
                value={modelFilter}
                onChange={(event) => setModelFilter(event.target.value)}
                placeholder={COMPOSER_MODEL_SEARCH_PLACEHOLDER}
              />
            </label>
            {filteredModelIds.length > 0 ? (
              filteredModelIds.map((modelId) => {
                const selected =
                  active?.providerId === activeGroup.providerId && active?.modelId === modelId
                return (
                  <button
                    key={`${activeGroup.providerId}:${modelId}`}
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    className={
                      selected
                        ? 'composer-model-picker-row is-selected'
                        : 'composer-model-picker-row'
                    }
                    onClick={() => selectModel(activeGroup.providerId, modelId)}
                  >
                    <span className="composer-model-picker-row-label">{modelId}</span>
                    <ComposerModelCapabilityBadge vision={activeGroup.modelVision[modelId] ?? false} />
                    {selected ? (
                      <Check className="composer-model-picker-check" strokeWidth={2} />
                    ) : null}
                  </button>
                )
              })
            ) : (
              <div className="composer-model-picker-no-match">{COMPOSER_NO_MATCHING_MODELS_LABEL}</div>
            )}
          </div>
        ) : null}
      </>
    )

    if (typeof document === 'undefined') return menu
    return createPortal(menu, document.body)
  }

  return (
    <div
      ref={rootRef}
      className={`ds-composer-model-picker composer-model-picker${compact ? ' is-compact' : ''}${
        canOpen ? '' : ' is-disabled'
      }`}
      title={controlsTitle}
    >
      <button
        type="button"
        disabled={!canOpen}
        onClick={toggleMenu}
        className="composer-model-picker-trigger"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label={COMPOSER_MODEL_CONTROLS_LABEL}
      >
        <span className="composer-model-picker-model-label">{chipModelLabel}</span>
        {!needsProviderSetup ? (
          <span className="composer-model-picker-reasoning-label">{reasoningLabel}</span>
        ) : null}
        <ChevronDown className="composer-model-picker-trigger-chevron" strokeWidth={1.8} />
      </button>
      {renderMenu()}
    </div>
  )
}

const PREVIEW_PROVIDERS: ProviderProfile[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    api: 'anthropic',
    models: [
      { id: 'claude-sonnet-4-20250514', vision: true },
      { id: 'claude-opus-4-20250514', vision: true },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    api: 'openai',
    models: [
      { id: 'gpt-4.1', vision: true },
      { id: 'gpt-4.1-mini', vision: true },
    ],
  },
]

const PREVIEW_STATUSES: ProviderStatus[] = PREVIEW_PROVIDERS.map((provider) => ({
  id: provider.id,
  name: provider.name,
  keyState: 'ok',
}))

export type FloatingModelPickerPreviewMode = 'default' | 'menu' | 'submenu' | 'noProviders'

export function FloatingModelPickerPreview({
  mode = 'default',
}: {
  mode?: FloatingModelPickerPreviewMode
}): ReactElement {
  const [active, setActive] = useState<DefaultSelection>({
    providerId: 'anthropic',
    modelId: 'claude-sonnet-4-20250514',
    reasoning: 'medium',
  })

  if (mode === 'noProviders') {
    return (
      <div className="composer-model-picker-preview-wrap">
        <FloatingModelPicker
          providers={[]}
          statuses={[]}
          onPickModel={() => undefined}
          onPickReasoning={() => undefined}
          onConfigure={() => undefined}
        />
      </div>
    )
  }

  return (
    <div className="composer-model-picker-preview-wrap">
      <FloatingModelPicker
        providers={PREVIEW_PROVIDERS}
        statuses={PREVIEW_STATUSES}
        active={active}
        menuOpen={mode === 'menu' || mode === 'submenu'}
        activeProviderId={mode === 'submenu' ? 'anthropic' : null}
        onPickModel={(providerId, modelId) => setActive((current) => ({ ...current, providerId, modelId }))}
        onPickReasoning={(reasoning) => setActive((current) => ({ ...current, reasoning }))}
        onConfigure={() => undefined}
      />
    </div>
  )
}
