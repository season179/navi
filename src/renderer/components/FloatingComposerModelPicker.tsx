// Composer model picker echoing Kun's FloatingComposerModelPicker
// (../Kun/src/renderer/src/components/chat/FloatingComposerModelPicker.tsx).
// Visual only: mock provider groups and reasoning options; no backend wiring.

import {
  useEffect,
  useLayoutEffect,
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

export type ComposerReasoningEffort = 'auto' | 'off' | 'low' | 'medium' | 'high' | 'max'

export type ComposerModelProviderGroup = {
  providerId: string
  label: string
  modelIds: string[]
  /** Model id → supports vision input */
  modelVision?: Record<string, boolean>
}

export type ComposerModelPickerSettings = {
  modelId: string
  providerId: string
  reasoningEffort: ComposerReasoningEffort
}

type Props = {
  value: ComposerModelPickerSettings
  groups: ComposerModelProviderGroup[]
  compact?: boolean
  /** Compact write sidebar: model picker grows to fill toolbar space. */
  stretch?: boolean
  disabled?: boolean
  needsProviderSetup?: boolean
  /** Preview-only: force menu open */
  menuOpen?: boolean
  /** Preview-only: force active provider submenu */
  activeProviderId?: string | null
  onChange?: (patch: Partial<ComposerModelPickerSettings>) => void
  onConfigureProviders?: () => void
}

const REASONING_OPTIONS: Array<{ id: ComposerReasoningEffort; label: string }> = [
  { id: 'auto', label: 'Auto' },
  { id: 'off', label: 'Off' },
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
  { id: 'max', label: 'Max' },
]

/** Sample settings for ?floatingComposerModelPickerPreview visual verification. */
export const COMPOSER_MODEL_PICKER_PREVIEW: ComposerModelPickerSettings = {
  modelId: 'claude-sonnet-4-20250514',
  providerId: 'anthropic',
  reasoningEffort: 'medium',
}

export const COMPOSER_MODEL_PICKER_GROUPS_PREVIEW: ComposerModelProviderGroup[] = [
  {
    providerId: 'anthropic',
    label: 'Anthropic',
    modelIds: ['claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'claude-haiku-3-5-20241022'],
    modelVision: {
      'claude-sonnet-4-20250514': true,
      'claude-opus-4-20250514': true,
      'claude-haiku-3-5-20241022': true,
    },
  },
  {
    providerId: 'openai',
    label: 'OpenAI',
    modelIds: ['gpt-4.1', 'gpt-4.1-mini', 'o3'],
    modelVision: {
      'gpt-4.1': true,
      'gpt-4.1-mini': true,
      'o3': false,
    },
  },
  {
    providerId: 'deepseek',
    label: 'DeepSeek',
    modelIds: ['deepseek-chat', 'deepseek-reasoner'],
    modelVision: {
      'deepseek-chat': false,
      'deepseek-reasoner': false,
    },
  },
]

function reasoningLabel(effort: ComposerReasoningEffort): string {
  return REASONING_OPTIONS.find((option) => option.id === effort)?.label ?? 'Max'
}

function modelSupportsVision(
  group: ComposerModelProviderGroup,
  modelId: string,
): boolean {
  return group.modelVision?.[modelId] ?? false
}

function ComposerModelCapabilityBadge({
  vision,
}: {
  vision: boolean
}): ReactElement {
  const label = vision ? 'Vision' : 'Text'
  const Icon = vision ? ImageIcon : TypeIcon
  return (
    <span
      className={
        vision
          ? 'composer-model-cap-badge is-vision'
          : 'composer-model-cap-badge is-text'
      }
      title={vision ? 'Vision — accepts text and images' : 'Text only'}
    >
      <Icon strokeWidth={1.9} />
      <span>{label}</span>
    </span>
  )
}

export function FloatingComposerModelPicker({
  value,
  groups,
  compact = false,
  stretch = false,
  disabled = false,
  needsProviderSetup = false,
  menuOpen: menuOpenProp,
  activeProviderId: activeProviderIdProp,
  onChange,
  onConfigureProviders,
}: Props): ReactElement {
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
  const canOpen = !disabled && (needsProviderSetup ? Boolean(onConfigureProviders) : groups.length > 0)

  const selectedGroup =
    groups.find((group) => group.providerId === value.providerId) ??
    groups.find((group) => group.modelIds.includes(value.modelId)) ??
    null

  const activeGroup = groups.find((group) => group.providerId === activeProviderId) ?? null
  const filteredModelIds = activeGroup
    ? activeGroup.modelIds.filter((id) =>
        !modelFilter.trim() || id.toLowerCase().includes(modelFilter.trim().toLowerCase()),
      )
    : []

  const modelLabel = needsProviderSetup
    ? 'No providers'
    : value.modelId.trim() || 'Auto'
  const reasoningLabelText = reasoningLabel(value.reasoningEffort)
  const controlsTitle = `${modelLabel} / ${reasoningLabelText}`

  useEffect(() => {
    if (!menuOpen || menuOpenProp !== undefined) return
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (rootRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      if (submenuRef.current?.contains(target)) return
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
    if (!canOpen) return
    if (menuOpenProp !== undefined) return
    setMenuOpenInternal((open) => !open)
    if (menuOpenInternal) {
      setActiveProviderIdInternal(null)
      setModelFilter('')
    }
  }

  const selectReasoning = (effort: ComposerReasoningEffort): void => {
    onChange?.({ reasoningEffort: effort })
    if (menuOpenProp === undefined) {
      setMenuOpenInternal(false)
      setActiveProviderIdInternal(null)
    }
  }

  const selectModel = (providerId: string, modelId: string): void => {
    onChange?.({ providerId, modelId })
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
                <span>Reasoning</span>
              </div>
              <div className="composer-model-picker-reasoning-list">
                {REASONING_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={value.reasoningEffort === option.id}
                    className={
                      value.reasoningEffort === option.id
                        ? 'composer-model-picker-row is-selected'
                        : 'composer-model-picker-row'
                    }
                    onClick={() => selectReasoning(option.id)}
                  >
                    <span className="composer-model-picker-row-label">{option.label}</span>
                    {value.reasoningEffort === option.id ? (
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
            <span>Model</span>
          </div>

          {needsProviderSetup ? (
            <div className="composer-model-picker-empty">
              <p>No providers configured yet. Add an API key in Settings to pick a model.</p>
              {onConfigureProviders ? (
                <button
                  type="button"
                  className="composer-model-picker-configure"
                  onClick={() => {
                    if (menuOpenProp === undefined) setMenuOpenInternal(false)
                    onConfigureProviders()
                  }}
                >
                  Configure providers
                </button>
              ) : null}
            </div>
          ) : (
            <div className="composer-model-picker-provider-list">
              {groups.map((group) => {
                const selectedModel =
                  group.providerId === selectedGroup?.providerId &&
                  group.modelIds.includes(value.modelId)
                    ? value.modelId
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
            <div className="composer-model-picker-submenu-title">Model</div>
            <label className="composer-model-picker-search">
              <Search strokeWidth={1.8} />
              <input
                type="search"
                value={modelFilter}
                onChange={(event) => setModelFilter(event.target.value)}
                placeholder="Search models…"
              />
            </label>
            {filteredModelIds.length > 0 ? (
              filteredModelIds.map((modelId) => {
                const selected =
                  value.providerId === activeGroup.providerId && value.modelId === modelId
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
                    <ComposerModelCapabilityBadge
                      vision={modelSupportsVision(activeGroup, modelId)}
                    />
                    {selected ? (
                      <Check className="composer-model-picker-check" strokeWidth={2} />
                    ) : null}
                  </button>
                )
              })
            ) : (
              <div className="composer-model-picker-no-match">No matching models</div>
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
        stretch ? ' is-stretch' : ''
      }${canOpen ? '' : ' is-disabled'}`}
      title={controlsTitle}
    >
      <button
        type="button"
        disabled={!canOpen}
        onClick={toggleMenu}
        className="composer-model-picker-trigger"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label="Model controls"
      >
        <span className="composer-model-picker-model-label">{modelLabel}</span>
        {!needsProviderSetup ? (
          <span className="composer-model-picker-reasoning-label">{reasoningLabelText}</span>
        ) : null}
        <ChevronDown className="composer-model-picker-trigger-chevron" strokeWidth={1.8} />
      </button>
      {renderMenu()}
    </div>
  )
}

export function FloatingComposerModelPickerPreview({
  mode = 'default',
}: {
  mode?: 'default' | 'menu' | 'submenu' | 'noProviders'
}): ReactElement {
  const [value, setValue] = useState(COMPOSER_MODEL_PICKER_PREVIEW)

  return (
    <div className="composer-model-picker-preview-wrap">
      <FloatingComposerModelPicker
        value={value}
        groups={mode === 'noProviders' ? [] : COMPOSER_MODEL_PICKER_GROUPS_PREVIEW}
        needsProviderSetup={mode === 'noProviders'}
        menuOpen={mode === 'menu' || mode === 'submenu'}
        activeProviderId={mode === 'submenu' ? 'anthropic' : null}
        onChange={(patch) => setValue((current) => ({ ...current, ...patch }))}
        onConfigureProviders={() => undefined}
      />
    </div>
  )
}
