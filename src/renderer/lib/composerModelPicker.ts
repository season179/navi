// Kun composer model picker chrome
// (../Kun/src/renderer/src/components/chat/FloatingComposerModelPicker.tsx).
// Visual only — used for production Composer and preview hooks.

import type { ReasoningLevel } from '../../shared/flue'

/** English copy matching Kun's composerModel locale string. */
export const COMPOSER_MODEL_LABEL = 'Model'

/** English copy matching Kun's composerOtherModels locale string. */
export const COMPOSER_OTHER_MODELS_LABEL = 'Other models'

/** English copy matching Kun's composerModelControls locale string. */
export const COMPOSER_MODEL_CONTROLS_LABEL = 'Model and reasoning settings'

/** English copy matching Kun's composerNoProvidersShort locale string. */
export const COMPOSER_NO_PROVIDERS_SHORT_LABEL = 'Set up provider'

/** English copy matching Kun's composerNoProviders locale string. */
export const COMPOSER_NO_PROVIDERS_LABEL = 'No chat model provider is available yet.'

/** English copy matching Kun's composerConfigureProviders locale string. */
export const COMPOSER_CONFIGURE_PROVIDERS_LABEL = 'Open provider settings'

/** English copy matching Kun's composerModelSearchPlaceholder locale string. */
export const COMPOSER_MODEL_SEARCH_PLACEHOLDER = 'Filter models'

/** English copy matching Kun's composerNoMatchingModels locale string. */
export const COMPOSER_NO_MATCHING_MODELS_LABEL = 'No matching models'

/** English copy matching Kun's composerModelVision locale string. */
export const COMPOSER_MODEL_VISION_LABEL = 'Vision'

/** English copy matching Kun's composerModelTextOnly locale string. */
export const COMPOSER_MODEL_TEXT_ONLY_LABEL = 'Text'

/** English copy matching Kun's composerReasoning locale string. */
export const COMPOSER_REASONING_SECTION_LABEL = 'Reasoning'

/** English copy matching Kun's autoLabel locale string. */
export const COMPOSER_AUTO_LABEL = 'Auto'

/** English copy matching Kun's composerReasoningAuto locale string. */
export const COMPOSER_REASONING_AUTO_LABEL = 'Adaptive'

/** English copy matching Kun's composerReasoningOff locale string. */
export const COMPOSER_REASONING_OFF_LABEL = 'Off'

/** English copy matching Kun's composerReasoningLow locale string. */
export const COMPOSER_REASONING_LOW_LABEL = 'Low'

/** English copy matching Kun's composerReasoningMedium locale string. */
export const COMPOSER_REASONING_MEDIUM_LABEL = 'Med'

/** English copy matching Kun's composerReasoningHigh locale string. */
export const COMPOSER_REASONING_HIGH_LABEL = 'High'

/** English copy matching Kun's composerReasoningMax locale string. */
export const COMPOSER_REASONING_MAX_LABEL = 'Ultra'

export type ComposerReasoningEffortOption = 'auto' | 'off' | 'low' | 'medium' | 'high' | 'max'

/** Kun FloatingComposerModelPicker reasoning rows. */
export const COMPOSER_REASONING_OPTIONS: Array<{
  id: ComposerReasoningEffortOption
  label: string
}> = [
  { id: 'auto', label: COMPOSER_REASONING_AUTO_LABEL },
  { id: 'off', label: COMPOSER_REASONING_OFF_LABEL },
  { id: 'low', label: COMPOSER_REASONING_LOW_LABEL },
  { id: 'medium', label: COMPOSER_REASONING_MEDIUM_LABEL },
  { id: 'high', label: COMPOSER_REASONING_HIGH_LABEL },
  { id: 'max', label: COMPOSER_REASONING_MAX_LABEL },
]

/** navi production reasoning levels mapped to closest Kun labels. */
export const COMPOSER_NAVI_REASONING_LABELS: Record<ReasoningLevel, string> = {
  minimal: 'Minimal',
  low: COMPOSER_REASONING_LOW_LABEL,
  medium: COMPOSER_REASONING_MEDIUM_LABEL,
  high: COMPOSER_REASONING_HIGH_LABEL,
  xhigh: COMPOSER_REASONING_MAX_LABEL,
}

export function getComposerReasoningLabel(
  effort: ComposerReasoningEffortOption,
): string {
  return (
    COMPOSER_REASONING_OPTIONS.find((option) => option.id === effort)?.label ??
    COMPOSER_REASONING_MAX_LABEL
  )
}

export function formatComposerModelControlsTitle(
  modelLabel: string,
  reasoningLabel?: string,
): string {
  return reasoningLabel ? `${modelLabel} / ${reasoningLabel}` : modelLabel
}
