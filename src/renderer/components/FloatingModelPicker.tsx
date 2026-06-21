// Composer model picker (Kun's FloatingComposerModelPicker). Replaces the static
// model chip: a popover grouped by provider, each model row carrying a capability
// badge, plus a reasoning-effort submenu. Selecting writes the conversation's
// {providerId, modelId} pointer; changing effort writes its reasoning — both
// per-conversation, no backend restart. When no provider is keyed it shows a
// "configure providers" empty state.

import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import type {
  DefaultSelection,
  ProviderProfile,
  ProviderStatus,
  ReasoningLevel,
} from '../../shared/flue'
import { REASONING_LEVELS } from '../../shared/flue'
import { ModelCapabilityBadge } from './ModelCapabilityBadge'

interface FloatingModelPickerProps {
  providers: ProviderProfile[]
  statuses: ProviderStatus[]
  active?: DefaultSelection
  onPickModel: (providerId: string, modelId: string) => void
  onPickReasoning: (level: ReasoningLevel) => void
  onConfigure: () => void
}

function modelLabel(providers: ProviderProfile[], active?: DefaultSelection): string {
  if (!active) return 'Select model'
  const model = providers.find((p) => p.id === active.providerId)?.models.find((m) => m.id === active.modelId)
  return model?.label ?? active.modelId
}

export function FloatingModelPicker({
  providers,
  statuses,
  active,
  onPickModel,
  onPickReasoning,
  onConfigure,
}: FloatingModelPickerProps) {
  const [open, setOpen] = useState(false)
  const chipRef = useRef<HTMLButtonElement>(null)
  // Viewport-fixed anchor for the portalled popover (see render note below).
  const [anchor, setAnchor] = useState<{ left: number; bottom: number } | null>(null)

  // The popover is rendered in a portal to document.body so it escapes the
  // composer's `overflow: hidden` (which otherwise clips the upward-opening
  // menu — only the bottom reasoning row survived). Mirrors Kun's
  // FloatingComposerModelPicker, which portals its menu and positions it from
  // the chip's getBoundingClientRect. Measure on open and on resize/scroll.
  useLayoutEffect(() => {
    if (!open) return
    const measure = () => {
      const el = chipRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      // `bottom` is the distance from the viewport bottom to the chip's top,
      // so the popover (position: fixed; bottom) grows upward from just above
      // the chip — preserving the original "opens upward" placement.
      const next = { left: r.left, bottom: window.innerHeight - r.top + 8 }
      // The capture-phase scroll listener also fires when the popover's own
      // (overflow-y) list scrolls, where the chip rect hasn't moved. Bail on an
      // unchanged anchor so list-scrolling doesn't re-render the portal per frame.
      setAnchor((prev) => (prev && prev.left === next.left && prev.bottom === next.bottom ? prev : next))
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [open])

  // Only providers with a usable key can be selected.
  const keyedIds = new Set(statuses.filter((s) => s.keyState === 'ok').map((s) => s.id))
  const usable = providers.filter((p) => keyedIds.has(p.id) && p.models.length > 0)

  const chipLabel = modelLabel(providers, active)
  const reasoning = active?.reasoning ?? 'medium'

  return (
    <div className="model-picker">
      <button
        ref={chipRef}
        className="model-chip"
        aria-label="Model"
        onClick={() => setOpen((v) => !v)}
      >
        {chipLabel}
        {active ? <span className="model-chip-reasoning">{reasoning}</span> : null}
        <ChevronDown />
      </button>

      {open && anchor
        ? createPortal(
            <>
              <div className="picker-backdrop" onClick={() => setOpen(false)} />
              <div
                className="model-picker-pop"
                role="menu"
                style={{ position: 'fixed', left: anchor.left, bottom: anchor.bottom }}
              >
            {usable.length === 0 ? (
              <div className="picker-empty">
                <div className="picker-empty-title">No providers configured</div>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setOpen(false)
                    onConfigure()
                  }}
                >
                  Configure providers
                </button>
              </div>
            ) : (
              <>
                {usable.map((p) => (
                  <div key={p.id} className="picker-group">
                    <div className="picker-group-name">{p.name}</div>
                    {p.models.map((m) => {
                      const isActive = active?.providerId === p.id && active?.modelId === m.id
                      return (
                        <button
                          key={m.id}
                          className={isActive ? 'picker-model is-active' : 'picker-model'}
                          onClick={() => {
                            onPickModel(p.id, m.id)
                            setOpen(false)
                          }}
                        >
                          <span className="picker-model-name">{m.label ?? m.id}</span>
                          <ModelCapabilityBadge vision={m.vision} />
                        </button>
                      )
                    })}
                  </div>
                ))}

                <div className="picker-reasoning">
                  <div className="picker-group-name">Reasoning effort</div>
                  <div className="picker-reasoning-row">
                    {REASONING_LEVELS.map((level) => (
                      <button
                        key={level}
                        className={reasoning === level ? 'reasoning-pill is-active' : 'reasoning-pill'}
                        onClick={() => onPickReasoning(level)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
              </div>
            </>,
            document.body,
          )
        : null}
    </div>
  )
}
