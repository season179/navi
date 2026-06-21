// Composer execution picker echoing Kun's FloatingComposerExecutionPicker
// (../Kun/src/renderer/src/components/chat/FloatingComposerExecutionPicker.tsx).
// Visual only: parent supplies approval/sandbox settings; no backend wiring.

import { useEffect, useRef, useState, type ReactElement } from 'react'
import { Check, ChevronDown, ShieldAlert, ShieldCheck } from 'lucide-react'

export type ApprovalPolicy = 'auto' | 'on-request' | 'untrusted' | 'suggest' | 'never'

export type SandboxMode =
  | 'workspace-write'
  | 'read-only'
  | 'danger-full-access'
  | 'external-sandbox'

export type ComposerExecutionSettings = {
  approvalPolicy: ApprovalPolicy
  sandboxMode: SandboxMode
}

type Props = {
  value: ComposerExecutionSettings
  applying?: boolean
  disabled?: boolean
  onChange: (patch: Partial<ComposerExecutionSettings>) => void
}

type ApprovalOption = {
  value: ApprovalPolicy
  label: string
}

type SandboxOption = {
  value: SandboxMode
  label: string
}

const APPROVAL_OPTIONS: ApprovalOption[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'on-request', label: 'Ask first' },
  { value: 'untrusted', label: 'Risky only' },
  { value: 'suggest', label: 'Suggest' },
  { value: 'never', label: 'Never' },
]

const SANDBOX_OPTIONS: SandboxOption[] = [
  { value: 'workspace-write', label: 'Workspace write' },
  { value: 'read-only', label: 'Read only' },
  { value: 'danger-full-access', label: 'Full access' },
  { value: 'external-sandbox', label: 'External' },
]

function approvalLabel(policy: ApprovalPolicy): string {
  return APPROVAL_OPTIONS.find((option) => option.value === policy)?.label ?? 'Auto'
}

function sandboxLabel(mode: SandboxMode): string {
  return SANDBOX_OPTIONS.find((option) => option.value === mode)?.label ?? 'Workspace write'
}

/** Sample settings for ?executionPickerPreview=1 visual verification. */
export const EXECUTION_PICKER_PREVIEW: ComposerExecutionSettings = {
  approvalPolicy: 'on-request',
  sandboxMode: 'workspace-write',
}

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
  const title = `Approval: ${approvalLabel(value.approvalPolicy)} / Access: ${sandboxLabel(value.sandboxMode)}`

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
        aria-label="Execution"
      >
        <Icon strokeWidth={1.8} />
        <span className="execution-picker-label">
          {applying ? 'Applying…' : sandboxLabel(value.sandboxMode)}
        </span>
        <ChevronDown strokeWidth={1.8} />
      </button>

      {open ? (
        <div role="menu" className="execution-picker-menu">
          <div className="execution-picker-section-label">Approval</div>
          {APPROVAL_OPTIONS.map((option) => (
            <ExecutionRow
              key={option.value}
              selected={value.approvalPolicy === option.value}
              label={option.label}
              onClick={() => update({ approvalPolicy: option.value })}
            />
          ))}

          <div className="execution-picker-divider" />

          <div className="execution-picker-section-label">Access</div>
          <div className="execution-picker-hint">
            Only Full access can run terminal commands (bash).
          </div>
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
