// Write settings section echoing Kun's settings-section-write.tsx
// (../Kun/src/renderer/src/components/settings-section-write.tsx).
// Visual only: mock form state and preview modes.

import { useState, type ReactElement } from 'react'
import { PencilLine, Plus, RotateCcw, Trash2 } from 'lucide-react'
import {
  AdvancedSettingsDisclosure,
  ModelSelect,
  SETTINGS_SELECT_CLASS,
  SettingRow,
  SettingsCard,
  Toggle,
} from './SettingsControls'
import {
  GENERAL_SETTINGS_BROWSE_LABEL,
  GENERAL_SETTINGS_RESTORE_WORKSPACE_DEFAULT,
} from '../lib/generalSettingsSection'
import {
  WRITE_EDITOR_FONT_SIZE_MAX,
  WRITE_EDITOR_FONT_SIZE_MIN,
  WRITE_SETTINGS_AGENT_PRESET_ADD,
  WRITE_SETTINGS_AGENT_PRESET_NAME_PLACEHOLDER,
  WRITE_SETTINGS_AGENT_PRESET_REMOVE,
  WRITE_SETTINGS_AGENT_PRESETS_DESC,
  WRITE_SETTINGS_AGENT_PRESETS_TITLE,
  WRITE_SETTINGS_AGENT_PERSONA_PLACEHOLDER,
  WRITE_SETTINGS_DEBUG_LOG_DESC,
  WRITE_SETTINGS_DEBUG_LOG_OPEN_BUTTON,
  WRITE_SETTINGS_DEBUG_LOG_OPEN_LABEL,
  WRITE_SETTINGS_DEBUG_LOG_TITLE,
  WRITE_SETTINGS_DESIGN_DRAFT_PROMPT_DESC,
  WRITE_SETTINGS_DESIGN_DRAFT_PROMPT_LABEL,
  WRITE_SETTINGS_FONT_CUSTOM_PLACEHOLDER,
  WRITE_SETTINGS_FONT_PRESET_DESC,
  WRITE_SETTINGS_FONT_PRESET_LABEL,
  WRITE_SETTINGS_FONT_PRESET_LABELS,
  WRITE_SETTINGS_FONT_SIZE_LABEL,
  WRITE_SETTINGS_INFOGRAPHIC_PROMPT_DESC,
  WRITE_SETTINGS_INFOGRAPHIC_PROMPT_LABEL,
  WRITE_SETTINGS_INLINE_COMPLETION_ADVANCED_DESC,
  WRITE_SETTINGS_INLINE_COMPLETION_ADVANCED_TITLE,
  WRITE_SETTINGS_INLINE_COMPLETION_DEBOUNCE_DESC,
  WRITE_SETTINGS_INLINE_COMPLETION_DEBOUNCE_LABEL,
  WRITE_SETTINGS_INLINE_COMPLETION_DELAY_BALANCED,
  WRITE_SETTINGS_INLINE_COMPLETION_DELAY_CALM,
  WRITE_SETTINGS_INLINE_COMPLETION_DELAY_FAST,
  WRITE_SETTINGS_INLINE_COMPLETION_DELAY_SLOW,
  WRITE_SETTINGS_INLINE_COMPLETION_ENABLED_DESC,
  WRITE_SETTINGS_INLINE_COMPLETION_ENABLED_LABEL,
  WRITE_SETTINGS_INLINE_COMPLETION_MAX_TOKENS_DESC,
  WRITE_SETTINGS_INLINE_COMPLETION_MAX_TOKENS_LABEL,
  WRITE_SETTINGS_INLINE_COMPLETION_MODEL_DESC,
  WRITE_SETTINGS_INLINE_COMPLETION_MODEL_LABEL,
  WRITE_SETTINGS_INLINE_COMPLETION_PROVIDER_DESC,
  WRITE_SETTINGS_INLINE_COMPLETION_PROVIDER_LABEL,
  WRITE_SETTINGS_INLINE_COMPLETION_RETRIEVAL_DESC,
  WRITE_SETTINGS_INLINE_COMPLETION_RETRIEVAL_LABEL,
  WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_BALANCED,
  WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_CREATIVE,
  WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_DESC,
  WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_LABEL,
  WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_STRICT,
  WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_VERY_STRICT,
  WRITE_SETTINGS_INLINE_COMPLETION_TITLE,
  WRITE_SETTINGS_INLINE_LONG_COMPLETION_DESC,
  WRITE_SETTINGS_INLINE_LONG_COMPLETION_LABEL,
  WRITE_SETTINGS_INLINE_LONG_COMPLETION_MAX_TOKENS_DESC,
  WRITE_SETTINGS_INLINE_LONG_COMPLETION_MAX_TOKENS_LABEL,
  WRITE_SETTINGS_LINE_HEIGHT_DESC,
  WRITE_SETTINGS_LINE_HEIGHT_LABEL,
  WRITE_SETTINGS_MODEL_PROVIDER_DEFAULT,
  WRITE_SETTINGS_MODEL_SELECT_CUSTOM_OPTION,
  WRITE_SETTINGS_MODEL_SELECT_CUSTOM_PLACEHOLDER,
  WRITE_SETTINGS_PROTOTYPE_PROMPT_DESC,
  WRITE_SETTINGS_PROTOTYPE_PROMPT_LABEL,
  WRITE_SETTINGS_QUICK_ACTION_ADD,
  WRITE_SETTINGS_QUICK_ACTION_LABEL_PLACEHOLDER,
  WRITE_SETTINGS_QUICK_ACTION_MODE_CHAT,
  WRITE_SETTINGS_QUICK_ACTION_MODE_EDIT,
  WRITE_SETTINGS_QUICK_ACTION_MODE_LABEL,
  WRITE_SETTINGS_QUICK_ACTION_PROMPT_PLACEHOLDER,
  WRITE_SETTINGS_QUICK_ACTION_REMOVE,
  WRITE_SETTINGS_QUICK_ACTIONS_DESC,
  WRITE_SETTINGS_QUICK_ACTIONS_LABEL,
  WRITE_SETTINGS_QUICK_ACTIONS_RESET,
  WRITE_SETTINGS_SECTION_TITLE,
  WRITE_SETTINGS_SELECTION_ASSIST_ADVANCED_DESC,
  WRITE_SETTINGS_SELECTION_ASSIST_ADVANCED_TITLE,
  WRITE_SETTINGS_SELECTION_ASSIST_TITLE,
  WRITE_SETTINGS_TYPOGRAPHY_RESET_BUTTON,
  WRITE_SETTINGS_TYPOGRAPHY_RESET_DESC,
  WRITE_SETTINGS_TYPOGRAPHY_RESET_LABEL,
  WRITE_SETTINGS_TYPOGRAPHY_TITLE,
  WRITE_SETTINGS_WORKSPACE_ROOT_DESC,
  WRITE_SETTINGS_WORKSPACE_ROOT_LABEL,
  WRITE_SETTINGS_WORKSPACE_ROOT_PLACEHOLDER,
  formatWriteSettingsFontSizeDesc,
  formatWriteSettingsInlineCompletionProviderInherit,
  formatWriteSettingsModelSelectDefaultOption,
  type WriteFontPreset,
} from '../lib/writeSettingsSection'

const WRITE_FONT_PRESETS = [
  'system',
  'sourceHanSans',
  'yahei',
  'pingfang',
  'simhei',
  'simsun',
  'kaiti',
  'custom',
] as const satisfies readonly WriteFontPreset[]
const WRITE_EDITOR_LINE_HEIGHT_MIN = 1.35
const WRITE_EDITOR_LINE_HEIGHT_MAX = 2.1
const WRITE_QUICK_ACTION_MAX_COUNT = 8
const WRITE_AGENT_PRESET_MAX_COUNT = 12

const WRITE_INLINE_COMPLETION_MODEL_IDS = [
  'deepseek-v4-pro',
  'deepseek-v4-flash',
  'deepseek-chat',
] as const

export type WriteQuickActionSnapshot = {
  id: string
  label: string
  prompt: string
  mode: 'edit' | 'chat'
}

export type WriteAgentPresetSnapshot = {
  id: string
  name: string
  emoji: string
  persona: string
}

export type WriteTypographySnapshot = {
  fontPreset: WriteFontPreset
  customFontFamily: string
  fontSizePx: number
  lineHeight: number
}

export type WriteInlineCompletionSnapshot = {
  enabled: boolean
  inheritProvider: boolean
  providerId: string
  inheritModel: boolean
  model: string
  retrievalEnabled: boolean
  debounceMs: number
  minAcceptScore: number
  maxTokens: number
  longCompletionEnabled: boolean
  longMaxTokens: number
}

export type WriteSelectionAssistSnapshot = {
  infographicPrompt: string
  designDraftPrompt: string
  prototypePrompt: string
  quickActions: WriteQuickActionSnapshot[]
}

export type WriteSettingsSnapshot = {
  defaultWorkspaceRoot: string
  typography: WriteTypographySnapshot
  inlineCompletion: WriteInlineCompletionSnapshot
  selectionAssist: WriteSelectionAssistSnapshot
  agentPresets: WriteAgentPresetSnapshot[]
}

export type WriteProviderSnapshot = {
  id: string
  name: string
  models: string[]
}

export const WRITE_SETTINGS_PREVIEW_PROVIDERS: WriteProviderSnapshot[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    models: ['deepseek-v4-pro', 'deepseek-v4-flash', 'deepseek-chat'],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4.1', 'gpt-4.1-mini'],
  },
]

export const WRITE_SETTINGS_PREVIEW_DEFAULT: WriteSettingsSnapshot = {
  defaultWorkspaceRoot: '/Users/season/Personal/navi/write',
  typography: {
    fontPreset: 'system',
    customFontFamily: '',
    fontSizePx: 16,
    lineHeight: 1.65,
  },
  inlineCompletion: {
    enabled: true,
    inheritProvider: true,
    providerId: '',
    inheritModel: true,
    model: 'deepseek-v4-pro',
    retrievalEnabled: true,
    debounceMs: 650,
    minAcceptScore: 0.52,
    maxTokens: 64,
    longCompletionEnabled: false,
    longMaxTokens: 256,
  },
  selectionAssist: {
    infographicPrompt: '',
    designDraftPrompt: '',
    prototypePrompt: '',
    quickActions: [
      {
        id: 'improve-writing',
        label: 'Improve writing',
        prompt: 'Polish the selected text for clarity and flow while preserving meaning.',
        mode: 'edit',
      },
      {
        id: 'make-shorter',
        label: 'Make shorter',
        prompt: 'Shorten the selected text without losing key facts.',
        mode: 'edit',
      },
    ],
  },
  agentPresets: [
    {
      id: 'editor-helper',
      name: 'Editor helper',
      emoji: '✍️',
      persona: 'You help refine prose, fix grammar, and tighten structure in long-form drafts.',
    },
    {
      id: 'research-assistant',
      name: 'Research assistant',
      emoji: '🔍',
      persona: 'You summarize sources, compare viewpoints, and suggest follow-up questions.',
    },
  ],
}

function resolveWriteInlineModelOptions(providerModels: readonly string[]): string[] {
  const scopedModels = providerModels.map((model) => model.trim()).filter(Boolean)
  return scopedModels.length > 0 ? [...new Set(scopedModels)] : [...WRITE_INLINE_COMPLETION_MODEL_IDS]
}

type Props = {
  settings: WriteSettingsSnapshot
  providers?: WriteProviderSnapshot[]
  assistantModel?: string
  workspacePickerError?: string | null
  inlineAdvancedOpen?: boolean
  selectionAssistAdvancedOpen?: boolean
  onSettingsChange?: (next: WriteSettingsSnapshot) => void
}

export function WriteSettingsSection({
  settings,
  providers = WRITE_SETTINGS_PREVIEW_PROVIDERS,
  assistantModel = 'deepseek-v4-pro',
  workspacePickerError = null,
  inlineAdvancedOpen = false,
  selectionAssistAdvancedOpen = false,
  onSettingsChange,
}: Props): ReactElement {
  const updateSettings = (patch: Partial<WriteSettingsSnapshot>): void => {
    onSettingsChange?.({ ...settings, ...patch })
  }

  const updateTypography = (patch: Partial<WriteTypographySnapshot>): void => {
    updateSettings({ typography: { ...settings.typography, ...patch } })
  }

  const updateInlineCompletion = (patch: Partial<WriteInlineCompletionSnapshot>): void => {
    updateSettings({ inlineCompletion: { ...settings.inlineCompletion, ...patch } })
  }

  const updateSelectionAssist = (patch: Partial<WriteSelectionAssistSnapshot>): void => {
    updateSettings({ selectionAssist: { ...settings.selectionAssist, ...patch } })
  }

  const updateQuickActions = (quickActions: WriteQuickActionSnapshot[]): void => {
    updateSelectionAssist({ quickActions })
  }

  const updateAgentPresets = (agentPresets: WriteAgentPresetSnapshot[]): void => {
    updateSettings({ agentPresets })
  }

  const inline = settings.inlineCompletion
  const typography = settings.typography
  const selectionAssist = settings.selectionAssist

  const effectiveWriteProvider =
    providers.find((item) => item.id === (inline.providerId || providers[0]?.id)) ?? providers[0]
  const writeInlineProviderInherited = inline.inheritProvider
  const writeInlineProviderModels = effectiveWriteProvider?.models ?? []
  const writeInlineModelOptions = resolveWriteInlineModelOptions(writeInlineProviderModels)
  const writeInlineInheritDefault =
    (!writeInlineProviderInherited && inline.providerId.trim()
      ? writeInlineProviderModels[0]
      : undefined) || assistantModel.trim() || WRITE_INLINE_COMPLETION_MODEL_IDS[0]
  const writeInlineModelInherited = inline.inheritModel

  return (
    <>
      <SettingsCard title={WRITE_SETTINGS_SECTION_TITLE}>
        <SettingRow
          title={WRITE_SETTINGS_WORKSPACE_ROOT_LABEL}
          description={WRITE_SETTINGS_WORKSPACE_ROOT_DESC}
          control={
            <div className="write-settings-workspace">
              <div className="write-settings-workspace-row">
                <input
                  className="settings-text-input"
                  value={settings.defaultWorkspaceRoot}
                  onChange={(e) => updateSettings({ defaultWorkspaceRoot: e.target.value })}
                  placeholder={WRITE_SETTINGS_WORKSPACE_ROOT_PLACEHOLDER}
                />
                <button type="button" className="settings-action-button">
                  {GENERAL_SETTINGS_RESTORE_WORKSPACE_DEFAULT}
                </button>
                <button type="button" className="settings-action-button">
                  {GENERAL_SETTINGS_BROWSE_LABEL}
                </button>
              </div>
              {workspacePickerError ? (
                <p className="write-settings-workspace-error">{workspacePickerError}</p>
              ) : null}
            </div>
          }
        />
      </SettingsCard>

      <SettingsCard title={WRITE_SETTINGS_TYPOGRAPHY_TITLE} className="settings-card-spaced">
        <SettingRow
          title={WRITE_SETTINGS_FONT_PRESET_LABEL}
          description={WRITE_SETTINGS_FONT_PRESET_DESC}
          control={
            <div className="write-settings-font-control">
              <select
                className={SETTINGS_SELECT_CLASS}
                value={typography.fontPreset}
                onChange={(e) =>
                  updateTypography({ fontPreset: e.target.value as WriteFontPreset })
                }
              >
                {WRITE_FONT_PRESETS.map((preset) => (
                  <option key={preset} value={preset}>
                    {WRITE_SETTINGS_FONT_PRESET_LABELS[preset]}
                  </option>
                ))}
              </select>
              {typography.fontPreset === 'custom' ? (
                <input
                  className="settings-text-input write-settings-font-custom"
                  value={typography.customFontFamily}
                  onChange={(e) => updateTypography({ customFontFamily: e.target.value })}
                  placeholder={WRITE_SETTINGS_FONT_CUSTOM_PLACEHOLDER}
                />
              ) : null}
            </div>
          }
        />
        <SettingRow
          title={WRITE_SETTINGS_FONT_SIZE_LABEL}
          description={formatWriteSettingsFontSizeDesc(
            WRITE_EDITOR_FONT_SIZE_MIN,
            WRITE_EDITOR_FONT_SIZE_MAX,
          )}
          control={
            <div className="write-settings-range-control">
              <input
                type="range"
                min={WRITE_EDITOR_FONT_SIZE_MIN}
                max={WRITE_EDITOR_FONT_SIZE_MAX}
                step={1}
                value={typography.fontSizePx}
                onChange={(e) => updateTypography({ fontSizePx: Number(e.target.value) })}
                className="write-settings-range-input"
                aria-label={WRITE_SETTINGS_FONT_SIZE_LABEL}
              />
              <span className="write-settings-range-value">{typography.fontSizePx}px</span>
            </div>
          }
        />
        <SettingRow
          title={WRITE_SETTINGS_LINE_HEIGHT_LABEL}
          description={WRITE_SETTINGS_LINE_HEIGHT_DESC}
          control={
            <div className="write-settings-range-control">
              <input
                type="range"
                min={WRITE_EDITOR_LINE_HEIGHT_MIN}
                max={WRITE_EDITOR_LINE_HEIGHT_MAX}
                step={0.05}
                value={typography.lineHeight}
                onChange={(e) => updateTypography({ lineHeight: Number(e.target.value) })}
                className="write-settings-range-input"
                aria-label={WRITE_SETTINGS_LINE_HEIGHT_LABEL}
              />
              <span className="write-settings-range-value">
                {typography.lineHeight.toFixed(2)}
              </span>
            </div>
          }
        />
        <SettingRow
          title={WRITE_SETTINGS_TYPOGRAPHY_RESET_LABEL}
          description={WRITE_SETTINGS_TYPOGRAPHY_RESET_DESC}
          control={
            <button
              type="button"
              className="write-settings-ghost-button"
              onClick={() =>
                updateTypography({
                  fontPreset: 'system',
                  customFontFamily: '',
                  fontSizePx: 16,
                  lineHeight: 1.65,
                })
              }
            >
              <RotateCcw className="write-settings-button-icon" strokeWidth={1.8} />
              {WRITE_SETTINGS_TYPOGRAPHY_RESET_BUTTON}
            </button>
          }
        />
      </SettingsCard>

      <SettingsCard title={WRITE_SETTINGS_INLINE_COMPLETION_TITLE} className="settings-card-spaced">
        <SettingRow
          title={WRITE_SETTINGS_INLINE_COMPLETION_ENABLED_LABEL}
          description={WRITE_SETTINGS_INLINE_COMPLETION_ENABLED_DESC}
          control={
            <Toggle
              checked={inline.enabled}
              onChange={(enabled) => updateInlineCompletion({ enabled })}
            />
          }
        />
        {inline.enabled ? (
          <>
            <SettingRow
              title={WRITE_SETTINGS_INLINE_COMPLETION_PROVIDER_LABEL}
              description={WRITE_SETTINGS_INLINE_COMPLETION_PROVIDER_DESC}
              control={
                <div className="write-settings-inline-control">
                  <select
                    className={SETTINGS_SELECT_CLASS}
                    value={writeInlineProviderInherited ? '' : inline.providerId}
                    onChange={(e) => {
                      const providerId = e.target.value
                      updateInlineCompletion({
                        inheritProvider: !providerId,
                        providerId,
                      })
                    }}
                  >
                    <option value="">
                      {formatWriteSettingsInlineCompletionProviderInherit(
                        effectiveWriteProvider?.name ?? WRITE_SETTINGS_MODEL_PROVIDER_DEFAULT,
                      )}
                    </option>
                    {providers.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              }
            />
            <SettingRow
              title={WRITE_SETTINGS_INLINE_COMPLETION_MODEL_LABEL}
              description={WRITE_SETTINGS_INLINE_COMPLETION_MODEL_DESC}
              control={
                <div className="write-settings-inline-control">
                  <ModelSelect
                    value={writeInlineModelInherited ? '' : inline.model}
                    options={writeInlineModelOptions}
                    defaultLabel={formatWriteSettingsModelSelectDefaultOption(writeInlineInheritDefault)}
                    allowCustom
                    customLabel={WRITE_SETTINGS_MODEL_SELECT_CUSTOM_OPTION}
                    customPlaceholder={WRITE_SETTINGS_MODEL_SELECT_CUSTOM_PLACEHOLDER}
                    selectClassName={SETTINGS_SELECT_CLASS}
                    onChange={(value) => {
                      const model = value.trim()
                      updateInlineCompletion({
                        inheritModel: !model,
                        model: model || writeInlineInheritDefault,
                      })
                    }}
                  />
                </div>
              }
            />
            <SettingRow
              title={WRITE_SETTINGS_INLINE_COMPLETION_RETRIEVAL_LABEL}
              description={WRITE_SETTINGS_INLINE_COMPLETION_RETRIEVAL_DESC}
              control={
                <Toggle
                  checked={inline.retrievalEnabled}
                  onChange={(retrievalEnabled) => updateInlineCompletion({ retrievalEnabled })}
                />
              }
            />
            <div className="write-settings-advanced-wrap">
              <AdvancedSettingsDisclosure
                title={WRITE_SETTINGS_INLINE_COMPLETION_ADVANCED_TITLE}
                description={WRITE_SETTINGS_INLINE_COMPLETION_ADVANCED_DESC}
                defaultOpen={inlineAdvancedOpen}
              >
                <div className="write-settings-advanced-rows">
                  <SettingRow
                    title={WRITE_SETTINGS_INLINE_COMPLETION_DEBOUNCE_LABEL}
                    description={WRITE_SETTINGS_INLINE_COMPLETION_DEBOUNCE_DESC}
                    control={
                      <select
                        className={SETTINGS_SELECT_CLASS}
                        value={inline.debounceMs}
                        onChange={(e) =>
                          updateInlineCompletion({ debounceMs: Number(e.target.value) })
                        }
                      >
                        <option value={300}>{WRITE_SETTINGS_INLINE_COMPLETION_DELAY_FAST}</option>
                        <option value={650}>{WRITE_SETTINGS_INLINE_COMPLETION_DELAY_BALANCED}</option>
                        <option value={1000}>{WRITE_SETTINGS_INLINE_COMPLETION_DELAY_CALM}</option>
                        <option value={1500}>{WRITE_SETTINGS_INLINE_COMPLETION_DELAY_SLOW}</option>
                      </select>
                    }
                  />
                  <SettingRow
                    title={WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_LABEL}
                    description={WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_DESC}
                    control={
                      <select
                        className={SETTINGS_SELECT_CLASS}
                        value={inline.minAcceptScore}
                        onChange={(e) =>
                          updateInlineCompletion({ minAcceptScore: Number(e.target.value) })
                        }
                      >
                        <option value={0.38}>{WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_CREATIVE}</option>
                        <option value={0.52}>{WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_BALANCED}</option>
                        <option value={0.68}>{WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_STRICT}</option>
                        <option value={0.82}>
                          {WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_VERY_STRICT}
                        </option>
                      </select>
                    }
                  />
                  <SettingRow
                    title={WRITE_SETTINGS_INLINE_COMPLETION_MAX_TOKENS_LABEL}
                    description={WRITE_SETTINGS_INLINE_COMPLETION_MAX_TOKENS_DESC}
                    control={
                      <input
                        type="number"
                        min={16}
                        max={512}
                        step={8}
                        className="write-settings-number-input"
                        value={inline.maxTokens}
                        onChange={(e) =>
                          updateInlineCompletion({ maxTokens: Number(e.target.value) })
                        }
                      />
                    }
                  />
                  <SettingRow
                    title={WRITE_SETTINGS_INLINE_LONG_COMPLETION_LABEL}
                    description={WRITE_SETTINGS_INLINE_LONG_COMPLETION_DESC}
                    control={
                      <Toggle
                        checked={inline.longCompletionEnabled}
                        onChange={(longCompletionEnabled) =>
                          updateInlineCompletion({ longCompletionEnabled })
                        }
                      />
                    }
                  />
                  <SettingRow
                    title={WRITE_SETTINGS_INLINE_LONG_COMPLETION_MAX_TOKENS_LABEL}
                    description={WRITE_SETTINGS_INLINE_LONG_COMPLETION_MAX_TOKENS_DESC}
                    control={
                      <input
                        type="number"
                        min={64}
                        max={1024}
                        step={16}
                        className="write-settings-number-input"
                        value={inline.longMaxTokens}
                        onChange={(e) =>
                          updateInlineCompletion({ longMaxTokens: Number(e.target.value) })
                        }
                      />
                    }
                  />
                </div>
              </AdvancedSettingsDisclosure>
            </div>
          </>
        ) : null}
      </SettingsCard>

      <SettingsCard title={WRITE_SETTINGS_SELECTION_ASSIST_TITLE} className="settings-card-spaced">
        <div className="write-settings-advanced-wrap">
          <AdvancedSettingsDisclosure
            title={WRITE_SETTINGS_SELECTION_ASSIST_ADVANCED_TITLE}
            description={WRITE_SETTINGS_SELECTION_ASSIST_ADVANCED_DESC}
            defaultOpen={selectionAssistAdvancedOpen}
          >
            <div className="write-settings-selection-body">
              <div className="write-settings-prompt-block">
                <div className="write-settings-prompt-title">{WRITE_SETTINGS_INFOGRAPHIC_PROMPT_LABEL}</div>
                <p className="write-settings-prompt-desc">{WRITE_SETTINGS_INFOGRAPHIC_PROMPT_DESC}</p>
                <textarea
                  className="write-settings-textarea"
                  value={selectionAssist.infographicPrompt}
                  spellCheck={false}
                  onChange={(e) => updateSelectionAssist({ infographicPrompt: e.target.value })}
                />
              </div>

              <div className="write-settings-prompt-block">
                <div className="write-settings-prompt-title">{WRITE_SETTINGS_DESIGN_DRAFT_PROMPT_LABEL}</div>
                <p className="write-settings-prompt-desc">{WRITE_SETTINGS_DESIGN_DRAFT_PROMPT_DESC}</p>
                <textarea
                  className="write-settings-textarea"
                  value={selectionAssist.designDraftPrompt}
                  spellCheck={false}
                  onChange={(e) => updateSelectionAssist({ designDraftPrompt: e.target.value })}
                />
              </div>

              <div className="write-settings-prompt-block">
                <div className="write-settings-prompt-title">{WRITE_SETTINGS_PROTOTYPE_PROMPT_LABEL}</div>
                <p className="write-settings-prompt-desc">{WRITE_SETTINGS_PROTOTYPE_PROMPT_DESC}</p>
                <textarea
                  className="write-settings-textarea"
                  value={selectionAssist.prototypePrompt}
                  spellCheck={false}
                  onChange={(e) => updateSelectionAssist({ prototypePrompt: e.target.value })}
                />
              </div>

              <div className="write-settings-prompt-block">
                <div className="write-settings-prompt-title">{WRITE_SETTINGS_QUICK_ACTIONS_LABEL}</div>
                <p className="write-settings-prompt-desc">{WRITE_SETTINGS_QUICK_ACTIONS_DESC}</p>
                <div className="write-settings-quick-actions">
                  {selectionAssist.quickActions.map((action, index) => (
                    <div key={action.id} className="write-settings-quick-action-card">
                      <div className="write-settings-quick-action-row">
                        <input
                          className="settings-text-input write-settings-quick-action-label"
                          value={action.label}
                          placeholder={WRITE_SETTINGS_QUICK_ACTION_LABEL_PLACEHOLDER}
                          spellCheck={false}
                          onChange={(e) => {
                            const next = [...selectionAssist.quickActions]
                            next[index] = { ...action, label: e.target.value }
                            updateQuickActions(next)
                          }}
                        />
                        <select
                          className={SETTINGS_SELECT_CLASS}
                          value={action.mode}
                          title={WRITE_SETTINGS_QUICK_ACTION_MODE_LABEL}
                          aria-label={WRITE_SETTINGS_QUICK_ACTION_MODE_LABEL}
                          onChange={(e) => {
                            const next = [...selectionAssist.quickActions]
                            next[index] = {
                              ...action,
                              mode: e.target.value === 'edit' ? 'edit' : 'chat',
                            }
                            updateQuickActions(next)
                          }}
                        >
                          <option value="edit">{WRITE_SETTINGS_QUICK_ACTION_MODE_EDIT}</option>
                          <option value="chat">{WRITE_SETTINGS_QUICK_ACTION_MODE_CHAT}</option>
                        </select>
                        <button
                          type="button"
                          className="write-settings-remove-button"
                          title={WRITE_SETTINGS_QUICK_ACTION_REMOVE}
                          aria-label={WRITE_SETTINGS_QUICK_ACTION_REMOVE}
                          onClick={() =>
                            updateQuickActions(
                              selectionAssist.quickActions.filter((item) => item.id !== action.id),
                            )
                          }
                        >
                          <Trash2 className="write-settings-button-icon" strokeWidth={1.8} />
                        </button>
                      </div>
                      <textarea
                        className="write-settings-textarea is-compact"
                        value={action.prompt}
                        placeholder={WRITE_SETTINGS_QUICK_ACTION_PROMPT_PLACEHOLDER}
                        spellCheck={false}
                        onChange={(e) => {
                          const next = [...selectionAssist.quickActions]
                          next[index] = { ...action, prompt: e.target.value }
                          updateQuickActions(next)
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="write-settings-action-row">
                  <button
                    type="button"
                    className="write-settings-ghost-button"
                    disabled={selectionAssist.quickActions.length >= WRITE_QUICK_ACTION_MAX_COUNT}
                    onClick={() =>
                      updateQuickActions([
                        ...selectionAssist.quickActions,
                        {
                          id: `custom-${Date.now().toString(36)}`,
                          label: '',
                          prompt: '',
                          mode: 'chat',
                        },
                      ])
                    }
                  >
                    <Plus className="write-settings-button-icon" strokeWidth={2} />
                    {WRITE_SETTINGS_QUICK_ACTION_ADD}
                  </button>
                  <button
                    type="button"
                    className="write-settings-ghost-button"
                    onClick={() =>
                      updateSelectionAssist({
                        quickActions: WRITE_SETTINGS_PREVIEW_DEFAULT.selectionAssist.quickActions,
                      })
                    }
                  >
                    <RotateCcw className="write-settings-button-icon" strokeWidth={1.8} />
                    {WRITE_SETTINGS_QUICK_ACTIONS_RESET}
                  </button>
                </div>
              </div>
            </div>
          </AdvancedSettingsDisclosure>
        </div>
      </SettingsCard>

      <SettingsCard title={WRITE_SETTINGS_AGENT_PRESETS_TITLE} className="settings-card-spaced">
        <p className="write-settings-agent-presets-desc">{WRITE_SETTINGS_AGENT_PRESETS_DESC}</p>
        <div className="write-settings-agent-presets">
          {settings.agentPresets.map((preset, index) => (
            <div key={preset.id} className="write-settings-agent-preset-card">
              <div className="write-settings-agent-preset-header">
                <input
                  className="settings-text-input write-settings-emoji-input"
                  value={preset.emoji}
                  placeholder="🤖"
                  spellCheck={false}
                  onChange={(e) => {
                    const next = [...settings.agentPresets]
                    next[index] = { ...preset, emoji: e.target.value }
                    updateAgentPresets(next)
                  }}
                />
                <input
                  className="settings-text-input write-settings-agent-name-input"
                  value={preset.name}
                  placeholder={WRITE_SETTINGS_AGENT_PRESET_NAME_PLACEHOLDER}
                  spellCheck={false}
                  onChange={(e) => {
                    const next = [...settings.agentPresets]
                    next[index] = { ...preset, name: e.target.value }
                    updateAgentPresets(next)
                  }}
                />
                <button
                  type="button"
                  className="write-settings-remove-button"
                  title={WRITE_SETTINGS_AGENT_PRESET_REMOVE}
                  aria-label={WRITE_SETTINGS_AGENT_PRESET_REMOVE}
                  onClick={() =>
                    updateAgentPresets(
                      settings.agentPresets.filter((item) => item.id !== preset.id),
                    )
                  }
                >
                  <Trash2 className="write-settings-button-icon" strokeWidth={1.8} />
                </button>
              </div>
              <textarea
                className="write-settings-textarea"
                value={preset.persona}
                placeholder={WRITE_SETTINGS_AGENT_PERSONA_PLACEHOLDER}
                spellCheck={false}
                onChange={(e) => {
                  const next = [...settings.agentPresets]
                  next[index] = { ...preset, persona: e.target.value }
                  updateAgentPresets(next)
                }}
              />
            </div>
          ))}
        </div>
        <div className="write-settings-action-row">
          <button
            type="button"
            className="write-settings-ghost-button"
            disabled={settings.agentPresets.length >= WRITE_AGENT_PRESET_MAX_COUNT}
            onClick={() =>
              updateAgentPresets([
                ...settings.agentPresets,
                {
                  id: `custom-${Date.now().toString(36)}`,
                  name: '',
                  emoji: '🤖',
                  persona: '',
                },
              ])
            }
          >
            <Plus className="write-settings-button-icon" strokeWidth={2} />
            {WRITE_SETTINGS_AGENT_PRESET_ADD}
          </button>
        </div>
      </SettingsCard>

      <SettingsCard title={WRITE_SETTINGS_DEBUG_LOG_TITLE} className="settings-card-spaced">
        <SettingRow
          title={WRITE_SETTINGS_DEBUG_LOG_OPEN_LABEL}
          description={WRITE_SETTINGS_DEBUG_LOG_DESC}
          control={
            <button type="button" className="write-settings-ghost-button">
              <PencilLine className="write-settings-button-icon" strokeWidth={1.75} />
              {WRITE_SETTINGS_DEBUG_LOG_OPEN_BUTTON}
            </button>
          }
        />
      </SettingsCard>
    </>
  )
}

export type WritePreviewMode =
  | 'default'
  | 'disabled'
  | 'workspaceError'
  | 'customFont'
  | 'advanced'
  | 'emptyPresets'

export function WriteSettingsSectionPreview({
  mode = 'default',
}: {
  mode?: WritePreviewMode
}): ReactElement {
  const [settings, setSettings] = useState<WriteSettingsSnapshot>(() => {
    if (mode === 'emptyPresets') {
      return { ...WRITE_SETTINGS_PREVIEW_DEFAULT, agentPresets: [] }
    }
    if (mode === 'customFont') {
      return {
        ...WRITE_SETTINGS_PREVIEW_DEFAULT,
        typography: {
          ...WRITE_SETTINGS_PREVIEW_DEFAULT.typography,
          fontPreset: 'custom',
          customFontFamily: '"Georgia", "Times New Roman", serif',
        },
      }
    }
    if (mode === 'disabled') {
      return {
        ...WRITE_SETTINGS_PREVIEW_DEFAULT,
        inlineCompletion: {
          ...WRITE_SETTINGS_PREVIEW_DEFAULT.inlineCompletion,
          enabled: false,
        },
      }
    }
    return WRITE_SETTINGS_PREVIEW_DEFAULT
  })

  return (
    <WriteSettingsSection
      settings={settings}
      workspacePickerError={
        mode === 'workspaceError' ? 'Could not open workspace picker: permission denied.' : null
      }
      inlineAdvancedOpen={mode === 'advanced'}
      selectionAssistAdvancedOpen={mode === 'advanced'}
      onSettingsChange={setSettings}
    />
  )
}
