// Composer execution picker echoing Kun's FloatingComposerExecutionPicker
// (../Kun/src/renderer/src/components/chat/FloatingComposerExecutionPicker.tsx).
// Visual only: parent supplies approval/sandbox settings; no backend wiring.

import { useEffect, useRef, useState, type ReactElement } from 'react'
import { Check, ChevronDown, ShieldAlert, ShieldCheck } from 'lucide-react'
import {
  APPROVAL_POLICY_LABELS,
  COMPOSER_ACCESS_COMMANDS_HINT,
  COMPOSER_ACCESS_SHORT_LABEL,
  COMPOSER_APPROVAL_SHORT_LABEL,
  COMPOSER_EXECUTION_APPLYING_LABEL,
  COMPOSER_EXECUTION_LABEL,
  EXECUTION_PICKER_PREVIEW,
  SANDBOX_MODE_LABELS,
  formatComposerExecutionPickerTitle,
  sandboxModeLabel,
  type ApprovalPolicy,
  type ComposerExecutionSettings,
  type SandboxMode,
} from '../../lib/composerExecutionPicker'

export type { ApprovalPolicy, SandboxMode, ComposerExecutionSettings }

export { EXECUTION_PICKER_PREVIEW }

type Props = {
  value: ComposerExecutionSettings
  applying?: boolean
  disabled?: boolean
  onChange: (patch: Partial<ComposerExecutionSettings>) => void
}

const APPROVAL_OPTIONS = Object.entries(APPROVAL_POLICY_LABELS).map(([value, label]) => ({
  value: value as ApprovalPolicy,
  label,
}))

const SANDBOX_OPTIONS = Object.entries(SANDBOX_MODE_LABELS).map(([value, label]) => ({
  value: value as SandboxMode,
  label,
}))

export function FloatingComposerExecutionPicker({
  value,
  applying = false,
  disabled = false,
  onChange,
}: Props): ReactElement {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const fullAccess = value.sandboxMode === 'danger-full-access'
  const Icon = fullAccess ? ShieldAlert : ShieldCheck
  const title = formatComposerExecutionPickerTitle(value.approvalPolicy, value.sandboxMode)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target
      if (target instanceof Node && rootRef.current?.contains(target)) return
      setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const update = (patch: Partial<ComposerExecutionSettings>): void => {
    onChange(patch)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="execution-picker">
      <button
        type="button"
        disabled={disabled || applying}
        onClick={() => setOpen((current) => !current)}
        className={fullAccess ? 'execution-picker-trigger is-danger' : 'execution-picker-trigger'}
        title={title}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={COMPOSER_EXECUTION_LABEL}
      >
        <Icon strokeWidth={1.8} />
        <span className="execution-picker-label">
          {applying ? COMPOSER_EXECUTION_APPLYING_LABEL : sandboxModeLabel(value.sandboxMode)}
        </span>
        <ChevronDown strokeWidth={1.8} />
      </button>

      {open ? (
        <div role="menu" className="execution-picker-menu">
          <div className="execution-picker-section-label">{COMPOSER_APPROVAL_SHORT_LABEL}</div>
          {APPROVAL_OPTIONS.map((option) => (
            <ExecutionRow
              key={option.value}
              selected={value.approvalPolicy === option.value}
              label={option.label}
              onClick={() => update({ approvalPolicy: option.value })}
            />
          ))}

          <div className="execution-picker-divider" />

          <div className="execution-picker-section-label">{COMPOSER_ACCESS_SHORT_LABEL}</div>
          <div className="execution-picker-hint">{COMPOSER_ACCESS_COMMANDS_HINT}</div>
          {SANDBOX_OPTIONS.map((option) => (
            <ExecutionRow
              key={option.value}
              selected={value.sandboxMode === option.value}
              label={option.label}
              onClick={() => update({ sandboxMode: option.value })}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ExecutionRow({
  selected,
  label,
  onClick,
}: {
  selected: boolean
  label: string
  onClick: () => void
}): ReactElement {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onClick}
      className={selected ? 'execution-picker-row is-selected' : 'execution-picker-row'}
    >
      <span className="execution-picker-row-label">{label}</span>
      {selected ? <Check strokeWidth={2} /> : null}
    </button>
  )
}
