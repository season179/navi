// Shared settings form primitives echoing Kun's settings-controls.tsx
// (../Kun/src/renderer/src/components/settings-controls.tsx).
// Visual only: parent supplies values and change handlers.

import { isValidElement, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { ChevronDown, Eye, EyeOff } from 'lucide-react'

export type InlineNotice = {
  tone: 'success' | 'error' | 'info'
  message: string
}

/** Kun selectControlClass — shared by settings selects and ModelSelect. */
export const SETTINGS_SELECT_CLASS = 'settings-control-select'

export function SettingsSecretInput({
  value,
  onChange,
  visible,
  onToggleVisibility,
  placeholder,
  autoComplete,
  invalid = false,
  showLabel,
  hideLabel,
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  visible: boolean
  onToggleVisibility: () => void
  placeholder?: string
  autoComplete?: string
  invalid?: boolean
  showLabel: string
  hideLabel: string
  className?: string
}): ReactElement {
  return (
    <div
      className={`settings-secret-input ${invalid ? 'is-invalid' : ''} ${className}`.trim()}
    >
      <input
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="settings-secret-input-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        aria-label={visible ? hideLabel : showLabel}
        title={visible ? hideLabel : showLabel}
        onClick={onToggleVisibility}
        className="settings-secret-input-toggle"
      >
        {visible ? (
          <EyeOff className="settings-secret-input-icon" strokeWidth={1.75} />
        ) : (
          <Eye className="settings-secret-input-icon" strokeWidth={1.75} />
        )}
      </button>
    </div>
  )
}

export function SectionJumpButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}): ReactElement {
  return (
    <button type="button" onClick={onClick} className="settings-section-jump-button">
      {label}
    </button>
  )
}

export function InlineNoticeView({ notice }: { notice: InlineNotice }): ReactElement {
  return (
    <div className={`settings-inline-notice is-${notice.tone}`}>{notice.message}</div>
  )
}

export function SettingsCard({
  title,
  children,
  className = '',
}: {
  title: string
  children: ReactNode
  className?: string
}): ReactElement {
  return (
    <section className={`settings-card ${className}`.trim()}>
      <div className="settings-card-header">
        <h2 className="settings-card-title">{title}</h2>
      </div>
      <div className="settings-card-body">{children}</div>
    </section>
  )
}

export function SettingRow({
  title,
  description,
  control,
  wideControl = false,
}: {
  title: string
  description?: string
  control: ReactNode
  wideControl?: boolean
}): ReactElement {
  const compactControl =
    !wideControl &&
    isValidElement(control) &&
    (control.type === Toggle || control.type === 'button')

  return (
    <div
      className={`settings-setting-row ${wideControl ? 'is-wide' : ''} ${
        compactControl ? 'has-compact-control' : ''
      }`.trim()}
    >
      <div className="settings-setting-row-copy">
        <div className="settings-setting-row-title">{title}</div>
        {description ? <p className="settings-setting-row-description">{description}</p> : null}
      </div>
      <div className="settings-setting-row-control">{control}</div>
    </div>
  )
}

const CUSTOM_MODEL_OPTION = '__custom__'

export function ModelSelect({
  value,
  options,
  defaultLabel,
  optionLabel,
  allowCustom = false,
  customLabel = '',
  customPlaceholder = '',
  disabled = false,
  selectClassName = SETTINGS_SELECT_CLASS,
  onChange,
}: {
  value: string
  options: string[]
  defaultLabel?: string
  optionLabel?: (model: string) => string
  allowCustom?: boolean
  customLabel?: string
  customPlaceholder?: string
  disabled?: boolean
  selectClassName?: string
  onChange: (model: string) => void
}): ReactElement {
  const trimmed = value.trim()
  const listed = trimmed === '' || options.includes(trimmed)
  const [customSelected, setCustomSelected] = useState(allowCustom && !listed)
  const [customDraft, setCustomDraft] = useState(trimmed)
  const [customEditing, setCustomEditing] = useState(false)
  const lastValueRef = useRef(trimmed)
  if (trimmed !== lastValueRef.current) {
    lastValueRef.current = trimmed
    if (!customEditing && trimmed !== customDraft.trim()) {
      setCustomDraft(trimmed)
      if (listed) setCustomSelected(false)
    }
  }
  const customActive = allowCustom && (customSelected || !listed)
  const selectValue = customActive ? CUSTOM_MODEL_OPTION : trimmed
  return (
    <div className="settings-model-select">
      <select
        className={selectClassName}
        value={selectValue}
        disabled={disabled}
        onChange={(e) => {
          const next = e.target.value
          if (next === CUSTOM_MODEL_OPTION) {
            setCustomDraft(trimmed)
            setCustomSelected(true)
            return
          }
          setCustomSelected(false)
          setCustomDraft(next)
          onChange(next)
        }}
      >
        {defaultLabel !== undefined ? <option value="">{defaultLabel}</option> : null}
        {options.map((model) => (
          <option key={model} value={model}>
            {optionLabel ? optionLabel(model) : model}
          </option>
        ))}
        {allowCustom ? <option value={CUSTOM_MODEL_OPTION}>{customLabel}</option> : null}
      </select>
      {customActive ? (
        <input
          className="settings-model-select-custom"
          value={customDraft}
          placeholder={customPlaceholder}
          spellCheck={false}
          disabled={disabled}
          onFocus={() => setCustomEditing(true)}
          onChange={(e) => {
            setCustomDraft(e.target.value)
            onChange(e.target.value)
          }}
          onBlur={() => {
            setCustomEditing(false)
            const draft = customDraft.trim()
            const stored = value.trim()
            if (!draft) {
              setCustomDraft(stored)
              if (stored === '' || options.includes(stored)) setCustomSelected(false)
            } else if (draft !== stored) {
              setCustomDraft(stored)
            }
          }}
        />
      ) : null}
    </div>
  )
}

export function AdvancedSettingsDisclosure({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}): ReactElement {
  return (
    <details className="settings-advanced-disclosure">
      <summary className="settings-advanced-disclosure-summary">
        <span className="settings-advanced-disclosure-copy">
          <span className="settings-advanced-disclosure-title">{title}</span>
          {description ? (
            <span className="settings-advanced-disclosure-description">{description}</span>
          ) : null}
        </span>
        <ChevronDown className="settings-advanced-disclosure-chevron" strokeWidth={1.9} />
      </summary>
      <div className="settings-advanced-disclosure-body">{children}</div>
    </details>
  )
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}): ReactElement {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => {
        if (!disabled) onChange(!checked)
      }}
      className={`settings-toggle ${checked ? 'is-checked' : ''} ${disabled ? 'is-disabled' : ''}`.trim()}
    >
      <span className="settings-toggle-thumb" />
    </button>
  )
}

export type SettingsControlsPreviewMode =
  | 'default'
  | 'notices'
  | 'modelSelect'
  | 'disclosure'
  | 'invalid'

const MODEL_OPTIONS = ['gpt-4.1', 'gpt-4.1-mini', 'claude-sonnet-4-20250514']

export function SettingsControlsPreview({
  mode = 'default',
}: {
  mode?: SettingsControlsPreviewMode
}): ReactElement {
  const [toggleOn, setToggleOn] = useState(true)
  const [toggleOff, setToggleOff] = useState(false)
  const [secretVisible, setSecretVisible] = useState(false)
  const [secretValue, setSecretValue] = useState('sk-preview-key-abc123')
  const [model, setModel] = useState('gpt-4.1-mini')
  const [customModel, setCustomModel] = useState('my-custom-model-id')

  if (mode === 'notices') {
    return (
      <div className="settings-controls-preview-stack">
        <InlineNoticeView notice={{ tone: 'success', message: 'Settings saved successfully.' }} />
        <InlineNoticeView notice={{ tone: 'error', message: 'Could not apply settings. Check your connection.' }} />
        <InlineNoticeView notice={{ tone: 'info', message: 'Changes apply automatically when valid.' }} />
      </div>
    )
  }

  if (mode === 'modelSelect') {
    return (
      <SettingsCard title="Model selection">
        <SettingRow
          title="Listed model"
          description="Pick from the provider catalog."
          control={
            <ModelSelect
              value={model}
              options={MODEL_OPTIONS}
              defaultLabel="Use provider default"
              onChange={setModel}
            />
          }
        />
        <SettingRow
          title="Custom model"
          description="Select Custom to enter an unlisted model id."
          wideControl
          control={
            <ModelSelect
              value={customModel}
              options={MODEL_OPTIONS}
              allowCustom
              customLabel="Custom model id…"
              customPlaceholder="provider/model-id"
              onChange={setCustomModel}
            />
          }
        />
      </SettingsCard>
    )
  }

  if (mode === 'disclosure') {
    return (
      <AdvancedSettingsDisclosure
        title="Advanced runtime options"
        description="Optional overrides for local development."
      >
        <SettingRow
          title="Allow insecure runtime"
          description="Skip TLS verification for localhost debugging."
          control={<Toggle checked={false} onChange={() => undefined} />}
        />
        <SettingRow
          title="Runtime token"
          description="Bearer token sent to the local runtime."
          wideControl
          control={
            <SettingsSecretInput
              value="local-dev-token"
              onChange={() => undefined}
              visible={secretVisible}
              onToggleVisibility={() => setSecretVisible((v) => !v)}
              showLabel="Show token"
              hideLabel="Hide token"
            />
          }
        />
      </AdvancedSettingsDisclosure>
    )
  }

  if (mode === 'invalid') {
    return (
      <SettingsCard title="API credentials">
        <SettingRow
          title="API key"
          description="Required for model requests."
          wideControl
          control={
            <SettingsSecretInput
              value={secretValue}
              onChange={setSecretValue}
              visible={secretVisible}
              onToggleVisibility={() => setSecretVisible((v) => !v)}
              invalid
              placeholder="sk-…"
              showLabel="Show key"
              hideLabel="Hide key"
            />
          }
        />
      </SettingsCard>
    )
  }

  return (
    <div className="settings-controls-preview-stack">
      <SettingsCard title="General">
        <SettingRow
          title="Language"
          description="Interface language for menus and labels."
          control={
            <select className={SETTINGS_SELECT_CLASS} defaultValue="en">
              <option value="en">English</option>
              <option value="zh">简体中文</option>
            </select>
          }
        />
        <SettingRow
          title="Start at login"
          description="Launch Navi when you sign in to your computer."
          control={<Toggle checked={toggleOn} onChange={setToggleOn} />}
        />
        <SettingRow
          title="Send analytics"
          description="Help improve the app with anonymous usage data."
          control={<Toggle checked={toggleOff} onChange={setToggleOff} disabled />}
        />
      </SettingsCard>

      <div className="settings-controls-preview-jumps">
        <SectionJumpButton label="Agents" onClick={() => undefined} />
        <SectionJumpButton label="Memory" onClick={() => undefined} />
        <SectionJumpButton label="Shortcuts" onClick={() => undefined} />
      </div>

      <InlineNoticeView notice={{ tone: 'info', message: 'Changes apply automatically when valid.' }} />
    </div>
  )
}
