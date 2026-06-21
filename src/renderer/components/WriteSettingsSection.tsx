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

const WRITE_FONT_PRESETS = [
  'system',
  'sourceHanSans',
  'yahei',
  'pingfang',
  'simhei',
  'simsun',
  'kaiti',
  'custom',
] as const
type WriteFontPreset = (typeof WRITE_FONT_PRESETS)[number]

const WRITE_EDITOR_FONT_SIZE_MIN = 13
const WRITE_EDITOR_FONT_SIZE_MAX = 22
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

const FONT_PRESET_LABELS: Record<WriteFontPreset, string> = {
  system: 'System default',
  sourceHanSans: 'Source Han Sans',
  yahei: 'Microsoft YaHei',
  pingfang: 'PingFang SC',
  simhei: 'SimHei',
  simsun: 'SimSun',
  kaiti: 'KaiTi',
  custom: 'Custom font family',
}

const COPY = {
  sectionWrite: 'Write workspace',
  writeWorkspaceRoot: 'Default write workspace',
  writeWorkspaceRootDesc: 'Root folder for write-mode documents and assets.',
  writeWorkspaceRootPlaceholder: '/Users/you/Documents/write',
  restoreWorkspaceDefault: 'Restore default',
  browse: 'Browse',
  writeTypography: 'Typography',
  writeFontPreset: 'Font preset',
  writeFontPresetDesc: 'Editor font stack for write mode.',
  writeFontCustomPlaceholder: 'e.g. "Georgia", "Times New Roman", serif',
  writeFontSize: 'Font size',
  writeFontSizeDesc: `Editor font size (${WRITE_EDITOR_FONT_SIZE_MIN}–${WRITE_EDITOR_FONT_SIZE_MAX}px).`,
  writeLineHeight: 'Line height',
  writeLineHeightDesc: 'Line spacing multiplier for the write editor.',
  writeTypographyReset: 'Reset typography',
  writeTypographyResetDesc: 'Restore default font preset, size, and line height.',
  writeTypographyResetButton: 'Reset',
  writeInlineCompletion: 'Inline completion',
  writeInlineCompletionEnabled: 'Enable inline completion',
  writeInlineCompletionEnabledDesc:
    'Suggest continuations while typing in write mode using the selected provider and model.',
  writeInlineCompletionProvider: 'Completion provider',
  writeInlineCompletionProviderDesc:
    'Inherit the assistant provider or choose a dedicated write completion provider.',
  writeInlineCompletionProviderInherit: (value: string) => `Inherit (${value})`,
  writeInlineCompletionModel: 'Completion model',
  writeInlineCompletionModelDesc: 'Model used for inline write suggestions.',
  modelSelectDefaultOption: (model: string) => `Default (${model})`,
  modelSelectCustomOption: 'Custom model…',
  modelSelectCustomPlaceholder: 'Enter model id',
  writeInlineCompletionRetrieval: 'Workspace retrieval',
  writeInlineCompletionRetrievalDesc:
    'Include nearby workspace snippets as context for inline completion.',
  writeInlineCompletionAdvanced: 'Advanced completion options',
  writeInlineCompletionAdvancedDesc: 'Debounce, quality threshold, token limits, and long completion.',
  writeInlineCompletionDelayFast: 'Fast (300 ms)',
  writeInlineCompletionDelayBalanced: 'Balanced (650 ms)',
  writeInlineCompletionDelayCalm: 'Calm (1000 ms)',
  writeInlineCompletionDelaySlow: 'Slow (1500 ms)',
  writeInlineCompletionDebounce: 'Debounce',
  writeInlineCompletionDebounceDesc: 'Delay before requesting a completion after typing stops.',
  writeInlineCompletionThresholdCreative: 'Creative (0.38)',
  writeInlineCompletionThresholdBalanced: 'Balanced (0.52)',
  writeInlineCompletionThresholdStrict: 'Strict (0.68)',
  writeInlineCompletionThresholdVeryStrict: 'Very strict (0.82)',
  writeInlineCompletionThreshold: 'Accept threshold',
  writeInlineCompletionThresholdDesc: 'Minimum score required before showing a suggestion.',
  writeInlineCompletionMaxTokens: 'Max tokens',
  writeInlineCompletionMaxTokensDesc: 'Token cap for standard inline completions.',
  writeInlineLongCompletion: 'Long completion',
  writeInlineLongCompletionDesc: 'Allow longer multi-sentence continuations on demand.',
  writeInlineLongCompletionMaxTokens: 'Long max tokens',
  writeInlineLongCompletionMaxTokensDesc: 'Token cap when long completion is triggered.',
  writeSelectionAssistTitle: 'Selection assist',
  writeSelectionAssistAdvanced: 'Selection assist prompts',
  writeSelectionAssistAdvancedDesc:
    'Custom prompts for infographic, design draft, prototype, and quick actions.',
  writeInfographicPromptLabel: 'Infographic prompt',
  writeInfographicPromptDesc: 'Prompt template for turning selection into an infographic brief.',
  writeDesignDraftPromptLabel: 'Design draft prompt',
  writeDesignDraftPromptDesc: 'Prompt template for generating a visual design draft from selection.',
  writePrototypePromptLabel: 'Prototype prompt',
  writePrototypePromptDesc: 'Prompt template for turning selection into a UI prototype brief.',
  writeQuickActionsLabel: 'Quick actions',
  writeQuickActionsDesc: 'Toolbar actions shown when text is selected in write mode.',
  writeQuickActionLabelPlaceholder: 'Action label',
  writeQuickActionPromptPlaceholder: 'Prompt sent when the action is triggered',
  writeQuickActionModeLabel: 'Mode',
  writeQuickActionModeEdit: 'Edit selection',
  writeQuickActionModeChat: 'Send to chat',
  writeQuickActionRemove: 'Remove action',
  writeQuickActionAdd: 'Add action',
  writeQuickActionsReset: 'Reset quick actions',
  writeAgentPresets: 'Write agent presets',
  writeAgentPresetsDesc:
    'Preset personas available when starting a write-mode agent session.',
  writeAgentPresetNamePlaceholder: 'Preset name',
  writeAgentPersonaPlaceholder: 'Persona and behavior instructions for this preset',
  writeAgentPresetRemove: 'Remove preset',
  writeAgentPresetAdd: 'Add preset',
  writeDebugLogTitle: 'Write debug log',
  writeDebugLogOpen: 'Open debug log',
  writeDebugLogDesc: 'Inspect recent inline completion and selection-assist requests.',
  writeDebugLogOpenButton: 'Open log',
  modelProviderDefault: 'Default provider',
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
      <SettingsCard title={COPY.sectionWrite}>
        <SettingRow
          title={COPY.writeWorkspaceRoot}
          description={COPY.writeWorkspaceRootDesc}
          control={
            <div className="write-settings-workspace">
              <div className="write-settings-workspace-row">
                <input
                  className="settings-text-input"
                  value={settings.defaultWorkspaceRoot}
                  onChange={(e) => updateSettings({ defaultWorkspaceRoot: e.target.value })}
                  placeholder={COPY.writeWorkspaceRootPlaceholder}
                />
                <button type="button" className="settings-action-button">
                  {COPY.restoreWorkspaceDefault}
                </button>
                <button type="button" className="settings-action-button">
                  {COPY.browse}
                </button>
              </div>
              {workspacePickerError ? (
                <p className="write-settings-workspace-error">{workspacePickerError}</p>
              ) : null}
            </div>
          }
        />
      </SettingsCard>

      <SettingsCard title={COPY.writeTypography} className="settings-card-spaced">
        <SettingRow
          title={COPY.writeFontPreset}
          description={COPY.writeFontPresetDesc}
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
                    {FONT_PRESET_LABELS[preset]}
                  </option>
                ))}
              </select>
              {typography.fontPreset === 'custom' ? (
                <input
                  className="settings-text-input write-settings-font-custom"
                  value={typography.customFontFamily}
                  onChange={(e) => updateTypography({ customFontFamily: e.target.value })}
                  placeholder={COPY.writeFontCustomPlaceholder}
                />
              ) : null}
            </div>
          }
        />
        <SettingRow
          title={COPY.writeFontSize}
          description={COPY.writeFontSizeDesc}
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
                aria-label={COPY.writeFontSize}
              />
              <span className="write-settings-range-value">{typography.fontSizePx}px</span>
            </div>
          }
        />
        <SettingRow
          title={COPY.writeLineHeight}
          description={COPY.writeLineHeightDesc}
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
                aria-label={COPY.writeLineHeight}
              />
              <span className="write-settings-range-value">
                {typography.lineHeight.toFixed(2)}
              </span>
            </div>
          }
        />
        <SettingRow
          title={COPY.writeTypographyReset}
          description={COPY.writeTypographyResetDesc}
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
              {COPY.writeTypographyResetButton}
            </button>
          }
        />
      </SettingsCard>

      <SettingsCard title={COPY.writeInlineCompletion} className="settings-card-spaced">
        <SettingRow
          title={COPY.writeInlineCompletionEnabled}
          description={COPY.writeInlineCompletionEnabledDesc}
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
              title={COPY.writeInlineCompletionProvider}
              description={COPY.writeInlineCompletionProviderDesc}
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
                      {COPY.writeInlineCompletionProviderInherit(
                        effectiveWriteProvider?.name ?? COPY.modelProviderDefault,
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
              title={COPY.writeInlineCompletionModel}
              description={COPY.writeInlineCompletionModelDesc}
              control={
                <div className="write-settings-inline-control">
                  <ModelSelect
                    value={writeInlineModelInherited ? '' : inline.model}
                    options={writeInlineModelOptions}
                    defaultLabel={COPY.modelSelectDefaultOption(writeInlineInheritDefault)}
                    allowCustom
                    customLabel={COPY.modelSelectCustomOption}
                    customPlaceholder={COPY.modelSelectCustomPlaceholder}
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
              title={COPY.writeInlineCompletionRetrieval}
              description={COPY.writeInlineCompletionRetrievalDesc}
              control={
                <Toggle
                  checked={inline.retrievalEnabled}
                  onChange={(retrievalEnabled) => updateInlineCompletion({ retrievalEnabled })}
                />
              }
            />
            <div className="write-settings-advanced-wrap">
              <AdvancedSettingsDisclosure
                title={COPY.writeInlineCompletionAdvanced}
                description={COPY.writeInlineCompletionAdvancedDesc}
                defaultOpen={inlineAdvancedOpen}
              >
                <div className="write-settings-advanced-rows">
                  <SettingRow
                    title={COPY.writeInlineCompletionDebounce}
                    description={COPY.writeInlineCompletionDebounceDesc}
                    control={
                      <select
                        className={SETTINGS_SELECT_CLASS}
                        value={inline.debounceMs}
                        onChange={(e) =>
                          updateInlineCompletion({ debounceMs: Number(e.target.value) })
                        }
                      >
                        <option value={300}>{COPY.writeInlineCompletionDelayFast}</option>
                        <option value={650}>{COPY.writeInlineCompletionDelayBalanced}</option>
                        <option value={1000}>{COPY.writeInlineCompletionDelayCalm}</option>
                        <option value={1500}>{COPY.writeInlineCompletionDelaySlow}</option>
                      </select>
                    }
                  />
                  <SettingRow
                    title={COPY.writeInlineCompletionThreshold}
                    description={COPY.writeInlineCompletionThresholdDesc}
                    control={
                      <select
                        className={SETTINGS_SELECT_CLASS}
                        value={inline.minAcceptScore}
                        onChange={(e) =>
                          updateInlineCompletion({ minAcceptScore: Number(e.target.value) })
                        }
                      >
                        <option value={0.38}>{COPY.writeInlineCompletionThresholdCreative}</option>
                        <option value={0.52}>{COPY.writeInlineCompletionThresholdBalanced}</option>
                        <option value={0.68}>{COPY.writeInlineCompletionThresholdStrict}</option>
                        <option value={0.82}>
                          {COPY.writeInlineCompletionThresholdVeryStrict}
                        </option>
                      </select>
                    }
                  />
                  <SettingRow
                    title={COPY.writeInlineCompletionMaxTokens}
                    description={COPY.writeInlineCompletionMaxTokensDesc}
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
                    title={COPY.writeInlineLongCompletion}
                    description={COPY.writeInlineLongCompletionDesc}
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
                    title={COPY.writeInlineLongCompletionMaxTokens}
                    description={COPY.writeInlineLongCompletionMaxTokensDesc}
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

      <SettingsCard title={COPY.writeSelectionAssistTitle} className="settings-card-spaced">
        <div className="write-settings-advanced-wrap">
          <AdvancedSettingsDisclosure
            title={COPY.writeSelectionAssistAdvanced}
            description={COPY.writeSelectionAssistAdvancedDesc}
            defaultOpen={selectionAssistAdvancedOpen}
          >
            <div className="write-settings-selection-body">
              <div className="write-settings-prompt-block">
                <div className="write-settings-prompt-title">{COPY.writeInfographicPromptLabel}</div>
                <p className="write-settings-prompt-desc">{COPY.writeInfographicPromptDesc}</p>
                <textarea
                  className="write-settings-textarea"
                  value={selectionAssist.infographicPrompt}
                  spellCheck={false}
                  onChange={(e) => updateSelectionAssist({ infographicPrompt: e.target.value })}
                />
              </div>

              <div className="write-settings-prompt-block">
                <div className="write-settings-prompt-title">{COPY.writeDesignDraftPromptLabel}</div>
                <p className="write-settings-prompt-desc">{COPY.writeDesignDraftPromptDesc}</p>
                <textarea
                  className="write-settings-textarea"
                  value={selectionAssist.designDraftPrompt}
                  spellCheck={false}
                  onChange={(e) => updateSelectionAssist({ designDraftPrompt: e.target.value })}
                />
              </div>

              <div className="write-settings-prompt-block">
                <div className="write-settings-prompt-title">{COPY.writePrototypePromptLabel}</div>
                <p className="write-settings-prompt-desc">{COPY.writePrototypePromptDesc}</p>
                <textarea
                  className="write-settings-textarea"
                  value={selectionAssist.prototypePrompt}
                  spellCheck={false}
                  onChange={(e) => updateSelectionAssist({ prototypePrompt: e.target.value })}
                />
              </div>

              <div className="write-settings-prompt-block">
                <div className="write-settings-prompt-title">{COPY.writeQuickActionsLabel}</div>
                <p className="write-settings-prompt-desc">{COPY.writeQuickActionsDesc}</p>
                <div className="write-settings-quick-actions">
                  {selectionAssist.quickActions.map((action, index) => (
                    <div key={action.id} className="write-settings-quick-action-card">
                      <div className="write-settings-quick-action-row">
                        <input
                          className="settings-text-input write-settings-quick-action-label"
                          value={action.label}
                          placeholder={COPY.writeQuickActionLabelPlaceholder}
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
                          title={COPY.writeQuickActionModeLabel}
                          aria-label={COPY.writeQuickActionModeLabel}
                          onChange={(e) => {
                            const next = [...selectionAssist.quickActions]
                            next[index] = {
                              ...action,
                              mode: e.target.value === 'edit' ? 'edit' : 'chat',
                            }
                            updateQuickActions(next)
                          }}
                        >
                          <option value="edit">{COPY.writeQuickActionModeEdit}</option>
                          <option value="chat">{COPY.writeQuickActionModeChat}</option>
                        </select>
                        <button
                          type="button"
                          className="write-settings-remove-button"
                          title={COPY.writeQuickActionRemove}
                          aria-label={COPY.writeQuickActionRemove}
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
                        placeholder={COPY.writeQuickActionPromptPlaceholder}
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
                    {COPY.writeQuickActionAdd}
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
                    {COPY.writeQuickActionsReset}
                  </button>
                </div>
              </div>
            </div>
          </AdvancedSettingsDisclosure>
        </div>
      </SettingsCard>

      <SettingsCard title={COPY.writeAgentPresets} className="settings-card-spaced">
        <p className="write-settings-agent-presets-desc">{COPY.writeAgentPresetsDesc}</p>
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
                  placeholder={COPY.writeAgentPresetNamePlaceholder}
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
                  title={COPY.writeAgentPresetRemove}
                  aria-label={COPY.writeAgentPresetRemove}
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
                placeholder={COPY.writeAgentPersonaPlaceholder}
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
            {COPY.writeAgentPresetAdd}
          </button>
        </div>
      </SettingsCard>

      <SettingsCard title={COPY.writeDebugLogTitle} className="settings-card-spaced">
        <SettingRow
          title={COPY.writeDebugLogOpen}
          description={COPY.writeDebugLogDesc}
          control={
            <button type="button" className="write-settings-ghost-button">
              <PencilLine className="write-settings-button-icon" strokeWidth={1.75} />
              {COPY.writeDebugLogOpenButton}
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
