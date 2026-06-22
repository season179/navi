// Kun WriteSettingsSection chrome
// (../Kun/src/renderer/src/components/settings-section-write.tsx).
// Visual only — used for production WriteSettingsSection and preview hooks.

export const WRITE_EDITOR_FONT_SIZE_MIN = 12
export const WRITE_EDITOR_FONT_SIZE_MAX = 28

export type WriteFontPreset =
  | 'system'
  | 'sourceHanSans'
  | 'yahei'
  | 'pingfang'
  | 'simhei'
  | 'simsun'
  | 'kaiti'
  | 'custom'

/** English copy matching Kun's sectionWrite locale string. */
export const WRITE_SETTINGS_SECTION_TITLE = 'Write mode'

/** English copy matching Kun's writeWorkspaceRoot locale string. */
export const WRITE_SETTINGS_WORKSPACE_ROOT_LABEL = 'Default writing workspace'

/** English copy matching Kun's writeWorkspaceRootDesc locale string. */
export const WRITE_SETTINGS_WORKSPACE_ROOT_DESC =
  'Writing mode reads Markdown documents from here by default. A welcome.md file is created on first launch.'

/** English copy matching Kun's writeWorkspaceRootPlaceholder locale string. */
export const WRITE_SETTINGS_WORKSPACE_ROOT_PLACEHOLDER = '~/.kun/write_workspace'

/** English copy matching Kun's writeTypography locale string. */
export const WRITE_SETTINGS_TYPOGRAPHY_TITLE = 'Typography & font'

/** English copy matching Kun's writeFontPreset locale string. */
export const WRITE_SETTINGS_FONT_PRESET_LABEL = 'Editor font'

/** English copy matching Kun's writeFontPresetDesc locale string. */
export const WRITE_SETTINGS_FONT_PRESET_DESC =
  'Font for the writing surface — pick a comfortable face for long-form Chinese.'

/** English copy matching Kun's writeFontSystem locale string. */
export const WRITE_SETTINGS_FONT_SYSTEM = 'System default'

/** English copy matching Kun's writeFontSourceHanSans locale string. */
export const WRITE_SETTINGS_FONT_SOURCE_HAN_SANS = 'Source Han Sans'

/** English copy matching Kun's writeFontYahei locale string. */
export const WRITE_SETTINGS_FONT_YAHEI = 'Microsoft YaHei'

/** English copy matching Kun's writeFontPingfang locale string. */
export const WRITE_SETTINGS_FONT_PINGFANG = 'PingFang SC'

/** English copy matching Kun's writeFontSimhei locale string. */
export const WRITE_SETTINGS_FONT_SIMHEI = 'SimHei'

/** English copy matching Kun's writeFontSimsun locale string. */
export const WRITE_SETTINGS_FONT_SIMSUN = 'SimSun (serif)'

/** English copy matching Kun's writeFontKaiti locale string. */
export const WRITE_SETTINGS_FONT_KAITI = 'KaiTi (serif)'

/** English copy matching Kun's writeFontCustom locale string. */
export const WRITE_SETTINGS_FONT_CUSTOM = 'Custom…'

/** English copy matching Kun's writeFontCustomPlaceholder locale string. */
export const WRITE_SETTINGS_FONT_CUSTOM_PLACEHOLDER =
  'CSS font-family, e.g. "LXGW WenKai", serif'

/** English copy matching Kun's writeFontSize locale string. */
export const WRITE_SETTINGS_FONT_SIZE_LABEL = 'Font size'

/** Format Kun's writeFontSizeDesc locale string. */
export function formatWriteSettingsFontSizeDesc(min: number, max: number): string {
  return `Body text size (${min}–${max}px). Applies to the editor and preview.`
}

/** English copy matching Kun's writeLineHeight locale string. */
export const WRITE_SETTINGS_LINE_HEIGHT_LABEL = 'Line spacing'

/** English copy matching Kun's writeLineHeightDesc locale string. */
export const WRITE_SETTINGS_LINE_HEIGHT_DESC =
  'Body line height — larger values add more breathing room.'

/** English copy matching Kun's writeTypographyReset locale string. */
export const WRITE_SETTINGS_TYPOGRAPHY_RESET_LABEL = 'Reset typography'

/** English copy matching Kun's writeTypographyResetDesc locale string. */
export const WRITE_SETTINGS_TYPOGRAPHY_RESET_DESC =
  'Restore the default font, size, and spacing.'

/** English copy matching Kun's writeTypographyResetButton locale string. */
export const WRITE_SETTINGS_TYPOGRAPHY_RESET_BUTTON = 'Reset'

/** English copy matching Kun's writeInlineCompletion locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_TITLE = 'Writing suggestions'

/** English copy matching Kun's writeInlineCompletionEnabled locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_ENABLED_LABEL = 'Show suggestions after you pause'

/** English copy matching Kun's writeInlineCompletionEnabledDesc locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_ENABLED_DESC =
  'Show gray continuation suggestions in the Markdown editor that you can accept with Tab.'

/** English copy matching Kun's writeInlineCompletionProvider locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_PROVIDER_LABEL = 'Writing provider'

/** English copy matching Kun's writeInlineCompletionProviderDesc locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_PROVIDER_DESC =
  'Leave this inherited to use the AI assistant provider, or choose another configured provider for writing suggestions.'

/** Format Kun's writeInlineCompletionProviderInherit locale string. */
export function formatWriteSettingsInlineCompletionProviderInherit(value: string): string {
  return `Inherit AI assistant (${value})`
}

/** English copy matching Kun's modelProviderDefault locale string. */
export const WRITE_SETTINGS_MODEL_PROVIDER_DEFAULT = 'Default provider'

/** English copy matching Kun's writeInlineCompletionModel locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_MODEL_LABEL = 'Writing suggestion model'

/** English copy matching Kun's writeInlineCompletionModelDesc locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_MODEL_DESC =
  'Leave this empty to use the assistant\'s default model. Fill it only if writing suggestions need their own model.'

/** Format Kun's modelSelectDefaultOption locale string. */
export function formatWriteSettingsModelSelectDefaultOption(model: string): string {
  return `Default (${model})`
}

/** English copy matching Kun's modelSelectCustomOption locale string. */
export const WRITE_SETTINGS_MODEL_SELECT_CUSTOM_OPTION = 'Custom…'

/** English copy matching Kun's modelSelectCustomPlaceholder locale string. */
export const WRITE_SETTINGS_MODEL_SELECT_CUSTOM_PLACEHOLDER = 'Enter a model id'

/** English copy matching Kun's writeInlineCompletionRetrieval locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_RETRIEVAL_LABEL = 'Reference other documents'

/** English copy matching Kun's writeInlineCompletionRetrievalDesc locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_RETRIEVAL_DESC =
  'Before generating a suggestion, quickly reference Markdown files in the writing workspace so terminology, facts, and style stay consistent.'

/** English copy matching Kun's writeInlineCompletionAdvanced locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_ADVANCED_TITLE = 'Advanced tuning'

/** English copy matching Kun's writeInlineCompletionAdvancedDesc locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_ADVANCED_DESC =
  'Trigger pacing, accept threshold, and completion length. Defaults fit most cases.'

/** English copy matching Kun's writeInlineCompletionDebounce locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_DEBOUNCE_LABEL = 'Suggestion speed'

/** English copy matching Kun's writeInlineCompletionDebounceDesc locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_DEBOUNCE_DESC =
  'How long the editor waits after typing stops before showing a suggestion. Shorter is more responsive; longer is quieter and saves requests.'

/** English copy matching Kun's writeInlineCompletionDelayFast locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_DELAY_FAST = 'Fast · 300 ms'

/** English copy matching Kun's writeInlineCompletionDelayBalanced locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_DELAY_BALANCED = 'Balanced · 650 ms'

/** English copy matching Kun's writeInlineCompletionDelayCalm locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_DELAY_CALM = 'Calm · 1000 ms'

/** English copy matching Kun's writeInlineCompletionDelaySlow locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_DELAY_SLOW = 'Quiet · 1500 ms'

/** English copy matching Kun's writeInlineCompletionThreshold locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_LABEL = 'Suggestion frequency'

/** English copy matching Kun's writeInlineCompletionThresholdDesc locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_DESC =
  'Controls how often suggestions appear. Stricter settings show fewer, steadier suggestions.'

/** English copy matching Kun's writeInlineCompletionThresholdCreative locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_CREATIVE = 'Active · more suggestions'

/** English copy matching Kun's writeInlineCompletionThresholdBalanced locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_BALANCED = 'Balanced · recommended'

/** English copy matching Kun's writeInlineCompletionThresholdStrict locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_STRICT = 'Strict · fewer interruptions'

/** English copy matching Kun's writeInlineCompletionThresholdVeryStrict locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_THRESHOLD_VERY_STRICT =
  'Very strict · high confidence only'

/** English copy matching Kun's writeInlineCompletionMaxTokens locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_MAX_TOKENS_LABEL = 'Short suggestion max length'

/** English copy matching Kun's writeInlineCompletionMaxTokensDesc locale string. */
export const WRITE_SETTINGS_INLINE_COMPLETION_MAX_TOKENS_DESC =
  'Higher numbers allow longer suggestions. Keep this short so suggestions feel like the next few lines, not a full draft.'

/** English copy matching Kun's writeInlineLongCompletion locale string. */
export const WRITE_SETTINGS_INLINE_LONG_COMPLETION_LABEL = 'Paragraph inspiration suggestions'

/** English copy matching Kun's writeInlineLongCompletionDesc locale string. */
export const WRITE_SETTINGS_INLINE_LONG_COMPLETION_DESC =
  'When the cursor rests longer at a line end or paragraph boundary, show a fuller next sentence or paragraph idea.'

/** English copy matching Kun's writeInlineLongCompletionMaxTokens locale string. */
export const WRITE_SETTINGS_INLINE_LONG_COMPLETION_MAX_TOKENS_LABEL = 'Long suggestion max length'

/** English copy matching Kun's writeInlineLongCompletionMaxTokensDesc locale string. */
export const WRITE_SETTINGS_INLINE_LONG_COMPLETION_MAX_TOKENS_DESC =
  'Controls the maximum length for paragraph inspiration suggestions, best for about one paragraph of continuation.'

/** English copy matching Kun's writeSelectionAssistTitle locale string. */
export const WRITE_SETTINGS_SELECTION_ASSIST_TITLE = 'Selection toolbar'

/** English copy matching Kun's writeSelectionAssistAdvanced locale string. */
export const WRITE_SETTINGS_SELECTION_ASSIST_ADVANCED_TITLE = 'Advanced: custom prompts'

/** English copy matching Kun's writeSelectionAssistAdvancedDesc locale string. */
export const WRITE_SETTINGS_SELECTION_ASSIST_ADVANCED_DESC =
  'Edit the prompts used by infographic generation and quick actions like polish. Leave empty to use the built-in defaults.'

/** English copy matching Kun's writeInfographicPromptLabel locale string. */
export const WRITE_SETTINGS_INFOGRAPHIC_PROMPT_LABEL = 'Infographic prompt'

/** English copy matching Kun's writeInfographicPromptDesc locale string. */
export const WRITE_SETTINGS_INFOGRAPHIC_PROMPT_DESC =
  'Prompt prefix sent to the image model when generating an infographic; the selected text is appended after it.'

/** English copy matching Kun's writeDesignDraftPromptLabel locale string (common.json). */
export const WRITE_SETTINGS_DESIGN_DRAFT_PROMPT_LABEL = 'Design mockup prompt'

/** English copy matching Kun's writeDesignDraftPromptDesc locale string (common.json). */
export const WRITE_SETTINGS_DESIGN_DRAFT_PROMPT_DESC =
  'Custom prompt prefix for Generate design mockup; leave empty for the built-in default. The selected text is appended after it.'

/** English copy matching Kun's writePrototypePromptLabel locale string (common.json). */
export const WRITE_SETTINGS_PROTOTYPE_PROMPT_LABEL = 'Interactive prototype prompt'

/** English copy matching Kun's writePrototypePromptDesc locale string (common.json). */
export const WRITE_SETTINGS_PROTOTYPE_PROMPT_DESC =
  'Custom requirements for Generate interactive prototype; leave empty for the built-in default. The sidebar AI follows them when building the prototype.'

/** English copy matching Kun's writeQuickActionsLabel locale string. */
export const WRITE_SETTINGS_QUICK_ACTIONS_LABEL = 'AI quick actions'

/** English copy matching Kun's writeQuickActionsDesc locale string. */
export const WRITE_SETTINGS_QUICK_ACTIONS_DESC =
  'Quick actions shown in the selection toolbar. "Edit in place" replaces the selection with the AI result (reformat); "Send to assistant" hands the selection to the sidebar (polish, explain).'

/** English copy matching Kun's writeQuickActionLabelPlaceholder locale string. */
export const WRITE_SETTINGS_QUICK_ACTION_LABEL_PLACEHOLDER = 'Button label'

/** English copy matching Kun's writeQuickActionPromptPlaceholder locale string. */
export const WRITE_SETTINGS_QUICK_ACTION_PROMPT_PLACEHOLDER =
  'Prompt (an edit instruction in place, or chat content for the assistant)'

/** English copy matching Kun's writeQuickActionModeLabel locale string. */
export const WRITE_SETTINGS_QUICK_ACTION_MODE_LABEL = 'Behavior'

/** English copy matching Kun's writeQuickActionModeEdit locale string. */
export const WRITE_SETTINGS_QUICK_ACTION_MODE_EDIT = 'Edit in place'

/** English copy matching Kun's writeQuickActionModeChat locale string. */
export const WRITE_SETTINGS_QUICK_ACTION_MODE_CHAT = 'Send to assistant'

/** English copy matching Kun's writeQuickActionRemove locale string. */
export const WRITE_SETTINGS_QUICK_ACTION_REMOVE = 'Remove this action'

/** English copy matching Kun's writeQuickActionAdd locale string. */
export const WRITE_SETTINGS_QUICK_ACTION_ADD = 'Add quick action'

/** English copy matching Kun's writeQuickActionsReset locale string. */
export const WRITE_SETTINGS_QUICK_ACTIONS_RESET = 'Restore defaults'

/** English copy matching Kun's writeAgentPresets locale string. */
export const WRITE_SETTINGS_AGENT_PRESETS_TITLE = 'Custom writing agent prompts'

/** English copy matching Kun's writeAgentPresetsDesc locale string. */
export const WRITE_SETTINGS_AGENT_PRESETS_DESC =
  'Configure dedicated agents for long-form writing — each agent is a persona/behavior prompt (e.g. plot coordinator, line editor, foreshadowing tracker, continuity checker). Switch between them from the selection popover in the editor. Off by default; add what you need.'

/** English copy matching Kun's writeAgentPresetNamePlaceholder locale string. */
export const WRITE_SETTINGS_AGENT_PRESET_NAME_PLACEHOLDER = 'Name this agent'

/** English copy matching Kun's writeAgentPersonaPlaceholder locale string. */
export const WRITE_SETTINGS_AGENT_PERSONA_PLACEHOLDER =
  'Describe this agent\'s persona, role, and behavior rules…'

/** English copy matching Kun's writeAgentPresetRemove locale string. */
export const WRITE_SETTINGS_AGENT_PRESET_REMOVE = 'Remove'

/** English copy matching Kun's writeAgentPresetAdd locale string. */
export const WRITE_SETTINGS_AGENT_PRESET_ADD = 'Add agent'

/** English copy matching Kun's writeDebugLogTitle locale string. */
export const WRITE_SETTINGS_DEBUG_LOG_TITLE = 'Writing suggestion logs'

/** English copy matching Kun's writeDebugLogOpen locale string. */
export const WRITE_SETTINGS_DEBUG_LOG_OPEN_LABEL = 'View recent calls'

/** English copy matching Kun's writeDebugLogDesc locale string. */
export const WRITE_SETTINGS_DEBUG_LOG_DESC =
  'View recent writing suggestion requests and responses to understand why suggestions did not appear or felt off.'

/** English copy matching Kun's writeDebugLogOpenButton locale string. */
export const WRITE_SETTINGS_DEBUG_LOG_OPEN_BUTTON = 'View logs'

/** Kun writeFont* labels keyed by preset id. */
export const WRITE_SETTINGS_FONT_PRESET_LABELS: Record<WriteFontPreset, string> = {
  system: WRITE_SETTINGS_FONT_SYSTEM,
  sourceHanSans: WRITE_SETTINGS_FONT_SOURCE_HAN_SANS,
  yahei: WRITE_SETTINGS_FONT_YAHEI,
  pingfang: WRITE_SETTINGS_FONT_PINGFANG,
  simhei: WRITE_SETTINGS_FONT_SIMHEI,
  simsun: WRITE_SETTINGS_FONT_SIMSUN,
  kaiti: WRITE_SETTINGS_FONT_KAITI,
  custom: WRITE_SETTINGS_FONT_CUSTOM,
}
