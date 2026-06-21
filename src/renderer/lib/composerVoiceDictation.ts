/** English copy matching Kun's composerVoiceMicDenied locale string. */
export const COMPOSER_VOICE_MIC_DENIED_LABEL =
  'Microphone access was denied. Allow it in system settings and try again.'

/** @deprecated Use COMPOSER_VOICE_MIC_DENIED_LABEL. */
export const COMPOSER_DICTATION_ERROR_PREVIEW = COMPOSER_VOICE_MIC_DENIED_LABEL

/** English copy matching Kun's composerVoiceTooShort locale string. */
export const COMPOSER_VOICE_TOO_SHORT_LABEL =
  'Recording was too short. Hold on a bit longer.'

/** Sample message for composerVoiceFailed preview verification. */
export const COMPOSER_VOICE_FAILED_SAMPLE_MESSAGE = 'Network request failed'

/** Formats Kun's composerVoiceFailed locale string with a runtime error message. */
export function formatComposerVoiceFailed(message: string): string {
  return `Voice transcription failed: ${message}`
}

/** English copy matching Kun's composerVoiceStart locale string. */
export const COMPOSER_VOICE_START_LABEL = 'Voice input'

/** English copy matching Kun's composerVoiceStop locale string. */
export const COMPOSER_VOICE_STOP_LABEL = 'Stop recording'

/** English copy matching Kun's composerVoiceSend locale string. */
export const COMPOSER_VOICE_SEND_LABEL = 'Stop and send'

/** English copy matching Kun's composerVoiceTranscribing locale string. */
export const COMPOSER_VOICE_TRANSCRIBING_LABEL = 'Transcribing…'

/** Resolves dictation error preview copy from ?composerDictationErrorPreview query values. */
export function resolveComposerDictationErrorPreview(
  value: string | null,
): string | undefined {
  if (value === 'tooShort') return COMPOSER_VOICE_TOO_SHORT_LABEL
  if (value === 'failed') {
    return formatComposerVoiceFailed(COMPOSER_VOICE_FAILED_SAMPLE_MESSAGE)
  }
  if (value === '1' || value === 'true' || value === 'micDenied') {
    return COMPOSER_VOICE_MIC_DENIED_LABEL
  }
  return undefined
}
