// Media generation settings section echoing Kun's settings-section-media-generation.tsx
// (../Kun/src/renderer/src/components/settings-section-media-generation.tsx).
// Visual only: mock form state and preview modes.

import { useState, type ReactElement } from 'react'
import {
  formatMediaGenerationSettingsModelSelectDefaultOption,
  formatMediaGenerationSettingsProviderMissingKey,
  MEDIA_GENERATION_SETTINGS_DESC,
  MEDIA_GENERATION_SETTINGS_MUSIC_API_KEY_DESC,
  MEDIA_GENERATION_SETTINGS_MUSIC_API_KEY_LABEL,
  MEDIA_GENERATION_SETTINGS_MUSIC_BASE_URL_DESC,
  MEDIA_GENERATION_SETTINGS_MUSIC_BASE_URL_LABEL,
  MEDIA_GENERATION_SETTINGS_MUSIC_BASE_URL_PLACEHOLDER,
  MEDIA_GENERATION_SETTINGS_MUSIC_ENABLED_DESC,
  MEDIA_GENERATION_SETTINGS_MUSIC_ENABLED_LABEL,
  MEDIA_GENERATION_SETTINGS_MUSIC_FORMAT_DESC,
  MEDIA_GENERATION_SETTINGS_MUSIC_FORMAT_LABEL,
  MEDIA_GENERATION_SETTINGS_MUSIC_MODEL_DESC,
  MEDIA_GENERATION_SETTINGS_MUSIC_MODEL_LABEL,
  MEDIA_GENERATION_SETTINGS_MUSIC_MODEL_PLACEHOLDER,
  MEDIA_GENERATION_SETTINGS_MUSIC_PROTOCOL_DESC,
  MEDIA_GENERATION_SETTINGS_MUSIC_PROTOCOL_LABEL,
  MEDIA_GENERATION_SETTINGS_MUSIC_PROTOCOL_MINIMAX,
  MEDIA_GENERATION_SETTINGS_MUSIC_PROVIDER_CUSTOM,
  MEDIA_GENERATION_SETTINGS_MUSIC_PROVIDER_DESC,
  MEDIA_GENERATION_SETTINGS_MUSIC_PROVIDER_LABEL,
  MEDIA_GENERATION_SETTINGS_MUSIC_TIMEOUT_DESC,
  MEDIA_GENERATION_SETTINGS_MUSIC_TIMEOUT_LABEL,
  MEDIA_GENERATION_SETTINGS_MUSIC_TITLE,
  MEDIA_GENERATION_SETTINGS_SPEECH_API_KEY_DESC,
  MEDIA_GENERATION_SETTINGS_SPEECH_API_KEY_LABEL,
  MEDIA_GENERATION_SETTINGS_SPEECH_BASE_URL_DESC,
  MEDIA_GENERATION_SETTINGS_SPEECH_BASE_URL_LABEL,
  MEDIA_GENERATION_SETTINGS_SPEECH_BASE_URL_PLACEHOLDER,
  MEDIA_GENERATION_SETTINGS_SPEECH_ENABLED_DESC,
  MEDIA_GENERATION_SETTINGS_SPEECH_ENABLED_LABEL,
  MEDIA_GENERATION_SETTINGS_SPEECH_FORMAT_DESC,
  MEDIA_GENERATION_SETTINGS_SPEECH_FORMAT_LABEL,
  MEDIA_GENERATION_SETTINGS_SPEECH_MODEL_DESC,
  MEDIA_GENERATION_SETTINGS_SPEECH_MODEL_LABEL,
  MEDIA_GENERATION_SETTINGS_SPEECH_MODEL_PLACEHOLDER,
  MEDIA_GENERATION_SETTINGS_SPEECH_PROTOCOL_DESC,
  MEDIA_GENERATION_SETTINGS_SPEECH_PROTOCOL_LABEL,
  MEDIA_GENERATION_SETTINGS_SPEECH_PROVIDER_CUSTOM,
  MEDIA_GENERATION_SETTINGS_SPEECH_PROVIDER_DESC,
  MEDIA_GENERATION_SETTINGS_SPEECH_PROVIDER_LABEL,
  MEDIA_GENERATION_SETTINGS_SPEECH_TIMEOUT_DESC,
  MEDIA_GENERATION_SETTINGS_SPEECH_TIMEOUT_LABEL,
  MEDIA_GENERATION_SETTINGS_SPEECH_TITLE,
  MEDIA_GENERATION_SETTINGS_SPEECH_VOICE_DESC,
  MEDIA_GENERATION_SETTINGS_SPEECH_VOICE_LABEL,
  MEDIA_GENERATION_SETTINGS_SPEECH_VOICE_PLACEHOLDER,
  MEDIA_GENERATION_SETTINGS_TITLE,
  MEDIA_GENERATION_SETTINGS_VIDEO_API_KEY_DESC,
  MEDIA_GENERATION_SETTINGS_VIDEO_API_KEY_LABEL,
  MEDIA_GENERATION_SETTINGS_VIDEO_BASE_URL_DESC,
  MEDIA_GENERATION_SETTINGS_VIDEO_BASE_URL_LABEL,
  MEDIA_GENERATION_SETTINGS_VIDEO_BASE_URL_PLACEHOLDER,
  MEDIA_GENERATION_SETTINGS_VIDEO_DEFAULT_DURATION_DESC,
  MEDIA_GENERATION_SETTINGS_VIDEO_DEFAULT_DURATION_LABEL,
  MEDIA_GENERATION_SETTINGS_VIDEO_DEFAULT_RESOLUTION_DESC,
  MEDIA_GENERATION_SETTINGS_VIDEO_DEFAULT_RESOLUTION_LABEL,
  MEDIA_GENERATION_SETTINGS_VIDEO_ENABLED_DESC,
  MEDIA_GENERATION_SETTINGS_VIDEO_ENABLED_LABEL,
  MEDIA_GENERATION_SETTINGS_VIDEO_MODEL_DESC,
  MEDIA_GENERATION_SETTINGS_VIDEO_MODEL_LABEL,
  MEDIA_GENERATION_SETTINGS_VIDEO_MODEL_PLACEHOLDER,
  MEDIA_GENERATION_SETTINGS_VIDEO_POLL_INTERVAL_DESC,
  MEDIA_GENERATION_SETTINGS_VIDEO_POLL_INTERVAL_LABEL,
  MEDIA_GENERATION_SETTINGS_VIDEO_PROTOCOL_DESC,
  MEDIA_GENERATION_SETTINGS_VIDEO_PROTOCOL_LABEL,
  MEDIA_GENERATION_SETTINGS_VIDEO_PROTOCOL_MINIMAX,
  MEDIA_GENERATION_SETTINGS_VIDEO_PROVIDER_CUSTOM,
  MEDIA_GENERATION_SETTINGS_VIDEO_PROVIDER_DESC,
  MEDIA_GENERATION_SETTINGS_VIDEO_PROVIDER_LABEL,
  MEDIA_GENERATION_SETTINGS_VIDEO_TIMEOUT_DESC,
  MEDIA_GENERATION_SETTINGS_VIDEO_TIMEOUT_LABEL,
  MEDIA_GENERATION_SETTINGS_VIDEO_TITLE,
  resolveMediaGenerationSettingsSpeechProtocolLabel,
} from '../../lib/mediaGenerationSettingsSection'
import {
  PROVIDERS_SETTINGS_HIDE_SECRET,
  PROVIDERS_SETTINGS_SHOW_SECRET,
} from '../../lib/providersSettingsSection'
import {
  ModelSelect,
  SETTINGS_SELECT_CLASS,
  SettingsSecretInput,
  SettingRow,
  SettingsCard,
  Toggle,
} from './SettingsControls'

export const CUSTOM_TEXT_TO_SPEECH_PROVIDER_ID = 'custom'
export const CUSTOM_MUSIC_GENERATION_PROVIDER_ID = 'custom'
export const CUSTOM_VIDEO_GENERATION_PROVIDER_ID = 'custom'

const TEXT_TO_SPEECH_PROTOCOLS = ['openai-speech', 'minimax-t2a', 'mimo-tts'] as const
const MUSIC_GENERATION_PROTOCOLS = ['minimax-music'] as const
const VIDEO_GENERATION_PROTOCOLS = ['minimax-video'] as const
const AUDIO_FORMATS = ['mp3', 'wav', 'flac'] as const
const VIDEO_RESOLUTIONS = ['768P', '1080P'] as const

type TextToSpeechProtocol = (typeof TEXT_TO_SPEECH_PROTOCOLS)[number]
type MusicGenerationProtocol = (typeof MUSIC_GENERATION_PROTOCOLS)[number]
type VideoGenerationProtocol = (typeof VIDEO_GENERATION_PROTOCOLS)[number]

const DEFAULT_TEXT_TO_SPEECH_PROTOCOL: TextToSpeechProtocol = 'openai-speech'
const DEFAULT_MUSIC_GENERATION_PROTOCOL: MusicGenerationProtocol = 'minimax-music'
const DEFAULT_VIDEO_GENERATION_PROTOCOL: VideoGenerationProtocol = 'minimax-video'

export type TextToSpeechSettings = {
  enabled: boolean
  providerId: string
  protocol: TextToSpeechProtocol
  baseUrl: string
  apiKey: string
  model: string
  voice: string
  format: string
  timeoutMs: number
}

export type MusicGenerationSettings = {
  enabled: boolean
  providerId: string
  protocol: MusicGenerationProtocol
  baseUrl: string
  apiKey: string
  model: string
  format: string
  timeoutMs: number
}

export type VideoGenerationSettings = {
  enabled: boolean
  providerId: string
  protocol: VideoGenerationProtocol
  baseUrl: string
  apiKey: string
  model: string
  defaultDuration: number
  defaultResolution: string
  timeoutMs: number
  pollIntervalMs: number
}

export type MediaGenerationSettings = {
  textToSpeech: TextToSpeechSettings
  musicGeneration: MusicGenerationSettings
  videoGeneration: VideoGenerationSettings
}

type ProviderCapability = {
  protocol: string
  models: string[]
}

export type MediaProviderSnapshot = {
  id: string
  name: string
  hasApiKey?: boolean
  textToSpeech?: ProviderCapability
  music?: ProviderCapability
  video?: ProviderCapability
}

export const MEDIA_GENERATION_PREVIEW_PROVIDERS: MediaProviderSnapshot[] = [
  {
    id: 'minimax',
    name: 'MiniMax',
    hasApiKey: true,
    textToSpeech: {
      protocol: 'minimax-t2a',
      models: ['speech-2.8-hd'],
    },
    music: {
      protocol: 'minimax-music',
      models: ['music-2.6'],
    },
    video: {
      protocol: 'minimax-video',
      models: ['MiniMax-Hailuo-2.3'],
    },
  },
  {
    id: 'openai',
    name: 'OpenAI',
    hasApiKey: false,
    textToSpeech: {
      protocol: 'openai-speech',
      models: ['tts-1'],
    },
  },
  {
    id: 'suno',
    name: 'Suno',
    hasApiKey: false,
    music: {
      protocol: 'minimax-music',
      models: ['music-2.6'],
    },
  },
]

export const MEDIA_GENERATION_PREVIEW_DEFAULT: MediaGenerationSettings = {
  textToSpeech: {
    enabled: true,
    providerId: 'minimax',
    protocol: 'minimax-t2a',
    baseUrl: '',
    apiKey: '',
    model: 'speech-2.8-hd',
    voice: 'male-qn-qingse',
    format: 'mp3',
    timeoutMs: 120000,
  },
  musicGeneration: {
    enabled: true,
    providerId: 'minimax',
    protocol: 'minimax-music',
    baseUrl: '',
    apiKey: '',
    model: 'music-2.6',
    format: 'mp3',
    timeoutMs: 300000,
  },
  videoGeneration: {
    enabled: true,
    providerId: 'minimax',
    protocol: 'minimax-video',
    baseUrl: '',
    apiKey: '',
    model: 'MiniMax-Hailuo-2.3',
    defaultDuration: 6,
    defaultResolution: '1080P',
    timeoutMs: 900000,
    pollIntervalMs: 10000,
  },
}

type CapabilityKey = 'textToSpeech' | 'music' | 'video'

function selectedProviderState(input: {
  settingProviderId: string
  customProviderId: string
  providers: MediaProviderSnapshot[]
  capabilityKey: CapabilityKey
}): {
  providerId: string
  provider?: MediaProviderSnapshot
  capability?: ProviderCapability
  usingCustom: boolean
} {
  const providerId = input.settingProviderId || input.customProviderId
  const provider = input.providers.find((item) => item.id === providerId)
  return {
    providerId,
    provider,
    capability: provider?.[input.capabilityKey],
    usingCustom: providerId === input.customProviderId || !provider,
  }
}

function textToSpeechProtocolLabel(protocol: string): string {
  return resolveMediaGenerationSettingsSpeechProtocolLabel(protocol)
}

type Props = {
  settings: MediaGenerationSettings
  onSettingsChange?: (next: MediaGenerationSettings) => void
  providers?: MediaProviderSnapshot[]
}

export function MediaGenerationSettingsSection({
  settings,
  onSettingsChange,
  providers = MEDIA_GENERATION_PREVIEW_PROVIDERS,
}: Props): ReactElement {
  const [showTtsApiKey, setShowTtsApiKey] = useState(false)
  const [showMusicApiKey, setShowMusicApiKey] = useState(false)
  const [showVideoApiKey, setShowVideoApiKey] = useState(false)

  const textToSpeechProviders = providers.filter((item) => Boolean(item.textToSpeech))
  const musicProviders = providers.filter((item) => Boolean(item.music))
  const videoProviders = providers.filter((item) => Boolean(item.video))

  const selectedTts = selectedProviderState({
    settingProviderId: settings.textToSpeech.providerId,
    customProviderId: CUSTOM_TEXT_TO_SPEECH_PROVIDER_ID,
    providers: textToSpeechProviders,
    capabilityKey: 'textToSpeech',
  })
  const selectedMusic = selectedProviderState({
    settingProviderId: settings.musicGeneration.providerId,
    customProviderId: CUSTOM_MUSIC_GENERATION_PROVIDER_ID,
    providers: musicProviders,
    capabilityKey: 'music',
  })
  const selectedVideo = selectedProviderState({
    settingProviderId: settings.videoGeneration.providerId,
    customProviderId: CUSTOM_VIDEO_GENERATION_PROVIDER_ID,
    providers: videoProviders,
    capabilityKey: 'video',
  })

  const updateTextToSpeech = (patch: Partial<TextToSpeechSettings>): void => {
    onSettingsChange?.({
      ...settings,
      textToSpeech: { ...settings.textToSpeech, ...patch },
    })
  }
  const updateMusicGeneration = (patch: Partial<MusicGenerationSettings>): void => {
    onSettingsChange?.({
      ...settings,
      musicGeneration: { ...settings.musicGeneration, ...patch },
    })
  }
  const updateVideoGeneration = (patch: Partial<VideoGenerationSettings>): void => {
    onSettingsChange?.({
      ...settings,
      videoGeneration: { ...settings.videoGeneration, ...patch },
    })
  }

  return (
    <div className="media-generation-grid">
      <SettingsCard title={MEDIA_GENERATION_SETTINGS_TITLE}>
        <div className="media-generation-intro">{MEDIA_GENERATION_SETTINGS_DESC}</div>
      </SettingsCard>

      <SettingsCard title={MEDIA_GENERATION_SETTINGS_SPEECH_TITLE}>
        <SettingRow
          title={MEDIA_GENERATION_SETTINGS_SPEECH_ENABLED_LABEL}
          description={MEDIA_GENERATION_SETTINGS_SPEECH_ENABLED_DESC}
          control={
            <Toggle
              checked={settings.textToSpeech.enabled}
              onChange={(enabled) => updateTextToSpeech({ enabled })}
            />
          }
        />
        {settings.textToSpeech.enabled ? (
          <>
            {renderProviderRow({
              title: MEDIA_GENERATION_SETTINGS_SPEECH_PROVIDER_LABEL,
              description: MEDIA_GENERATION_SETTINGS_SPEECH_PROVIDER_DESC,
              providers: textToSpeechProviders,
              selected: selectedTts,
              capabilityKey: 'textToSpeech',
              customProviderId: CUSTOM_TEXT_TO_SPEECH_PROVIDER_ID,
              customLabel: MEDIA_GENERATION_SETTINGS_SPEECH_PROVIDER_CUSTOM,
              missingKeyLabel: formatMediaGenerationSettingsProviderMissingKey,
              setting: settings.textToSpeech,
              defaultProtocol: DEFAULT_TEXT_TO_SPEECH_PROTOCOL,
              update: updateTextToSpeech,
            })}
            {selectedTts.usingCustom ? (
              <>
                <SettingRow
                  title={MEDIA_GENERATION_SETTINGS_SPEECH_PROTOCOL_LABEL}
                  description={MEDIA_GENERATION_SETTINGS_SPEECH_PROTOCOL_DESC}
                  control={
                    <select
                      className={SETTINGS_SELECT_CLASS}
                      value={settings.textToSpeech.protocol}
                      onChange={(event) =>
                        updateTextToSpeech({
                          protocol: event.target.value as TextToSpeechProtocol,
                        })
                      }
                    >
                      {TEXT_TO_SPEECH_PROTOCOLS.map((protocol) => (
                        <option key={protocol} value={protocol}>
                          {textToSpeechProtocolLabel(protocol)}
                        </option>
                      ))}
                    </select>
                  }
                />
                {renderBaseUrlRow(
                  MEDIA_GENERATION_SETTINGS_SPEECH_BASE_URL_LABEL,
                  MEDIA_GENERATION_SETTINGS_SPEECH_BASE_URL_DESC,
                  settings.textToSpeech.baseUrl,
                  MEDIA_GENERATION_SETTINGS_SPEECH_BASE_URL_PLACEHOLDER,
                  (baseUrl) => updateTextToSpeech({ baseUrl }),
                )}
                {renderApiKeyRow({
                  title: MEDIA_GENERATION_SETTINGS_SPEECH_API_KEY_LABEL,
                  description: MEDIA_GENERATION_SETTINGS_SPEECH_API_KEY_DESC,
                  value: settings.textToSpeech.apiKey,
                  visible: showTtsApiKey,
                  setVisible: setShowTtsApiKey,
                  update: (apiKey) => updateTextToSpeech({ apiKey }),
                })}
              </>
            ) : null}
            {renderModelRow({
              title: MEDIA_GENERATION_SETTINGS_SPEECH_MODEL_LABEL,
              description: MEDIA_GENERATION_SETTINGS_SPEECH_MODEL_DESC,
              usingCustom: selectedTts.usingCustom,
              model: settings.textToSpeech.model,
              options: selectedTts.capability?.models ?? [],
              placeholder: MEDIA_GENERATION_SETTINGS_SPEECH_MODEL_PLACEHOLDER,
              update: (model) => updateTextToSpeech({ model }),
            })}
            <SettingRow
              title={MEDIA_GENERATION_SETTINGS_SPEECH_VOICE_LABEL}
              description={MEDIA_GENERATION_SETTINGS_SPEECH_VOICE_DESC}
              control={
                <input
                  className="settings-text-input"
                  value={settings.textToSpeech.voice}
                  placeholder={MEDIA_GENERATION_SETTINGS_SPEECH_VOICE_PLACEHOLDER}
                  onChange={(event) => updateTextToSpeech({ voice: event.target.value })}
                />
              }
            />
            {renderAudioFormatRow(
              MEDIA_GENERATION_SETTINGS_SPEECH_FORMAT_LABEL,
              MEDIA_GENERATION_SETTINGS_SPEECH_FORMAT_DESC,
              settings.textToSpeech.format,
              (format) => updateTextToSpeech({ format }),
            )}
            {renderTimeoutRow(
              MEDIA_GENERATION_SETTINGS_SPEECH_TIMEOUT_LABEL,
              MEDIA_GENERATION_SETTINGS_SPEECH_TIMEOUT_DESC,
              settings.textToSpeech.timeoutMs,
              10000,
              900000,
              (timeoutMs) => updateTextToSpeech({ timeoutMs }),
            )}
          </>
        ) : null}
      </SettingsCard>

      <SettingsCard title={MEDIA_GENERATION_SETTINGS_MUSIC_TITLE}>
        <SettingRow
          title={MEDIA_GENERATION_SETTINGS_MUSIC_ENABLED_LABEL}
          description={MEDIA_GENERATION_SETTINGS_MUSIC_ENABLED_DESC}
          control={
            <Toggle
              checked={settings.musicGeneration.enabled}
              onChange={(enabled) => updateMusicGeneration({ enabled })}
            />
          }
        />
        {settings.musicGeneration.enabled ? (
          <>
            {renderProviderRow({
              title: MEDIA_GENERATION_SETTINGS_MUSIC_PROVIDER_LABEL,
              description: MEDIA_GENERATION_SETTINGS_MUSIC_PROVIDER_DESC,
              providers: musicProviders,
              selected: selectedMusic,
              capabilityKey: 'music',
              customProviderId: CUSTOM_MUSIC_GENERATION_PROVIDER_ID,
              customLabel: MEDIA_GENERATION_SETTINGS_MUSIC_PROVIDER_CUSTOM,
              missingKeyLabel: formatMediaGenerationSettingsProviderMissingKey,
              setting: settings.musicGeneration,
              defaultProtocol: DEFAULT_MUSIC_GENERATION_PROTOCOL,
              update: updateMusicGeneration,
            })}
            {selectedMusic.usingCustom ? (
              <>
                <SettingRow
                  title={MEDIA_GENERATION_SETTINGS_MUSIC_PROTOCOL_LABEL}
                  description={MEDIA_GENERATION_SETTINGS_MUSIC_PROTOCOL_DESC}
                  control={
                    <select
                      className={SETTINGS_SELECT_CLASS}
                      value={settings.musicGeneration.protocol}
                      onChange={(event) =>
                        updateMusicGeneration({
                          protocol: event.target.value as MusicGenerationProtocol,
                        })
                      }
                    >
                      {MUSIC_GENERATION_PROTOCOLS.map((protocol) => (
                        <option key={protocol} value={protocol}>
                          {MEDIA_GENERATION_SETTINGS_MUSIC_PROTOCOL_MINIMAX}
                        </option>
                      ))}
                    </select>
                  }
                />
                {renderBaseUrlRow(
                  MEDIA_GENERATION_SETTINGS_MUSIC_BASE_URL_LABEL,
                  MEDIA_GENERATION_SETTINGS_MUSIC_BASE_URL_DESC,
                  settings.musicGeneration.baseUrl,
                  MEDIA_GENERATION_SETTINGS_MUSIC_BASE_URL_PLACEHOLDER,
                  (baseUrl) => updateMusicGeneration({ baseUrl }),
                )}
                {renderApiKeyRow({
                  title: MEDIA_GENERATION_SETTINGS_MUSIC_API_KEY_LABEL,
                  description: MEDIA_GENERATION_SETTINGS_MUSIC_API_KEY_DESC,
                  value: settings.musicGeneration.apiKey,
                  visible: showMusicApiKey,
                  setVisible: setShowMusicApiKey,
                  update: (apiKey) => updateMusicGeneration({ apiKey }),
                })}
              </>
            ) : null}
            {renderModelRow({
              title: MEDIA_GENERATION_SETTINGS_MUSIC_MODEL_LABEL,
              description: MEDIA_GENERATION_SETTINGS_MUSIC_MODEL_DESC,
              usingCustom: selectedMusic.usingCustom,
              model: settings.musicGeneration.model,
              options: selectedMusic.capability?.models ?? [],
              placeholder: MEDIA_GENERATION_SETTINGS_MUSIC_MODEL_PLACEHOLDER,
              update: (model) => updateMusicGeneration({ model }),
            })}
            {renderAudioFormatRow(
              MEDIA_GENERATION_SETTINGS_MUSIC_FORMAT_LABEL,
              MEDIA_GENERATION_SETTINGS_MUSIC_FORMAT_DESC,
              settings.musicGeneration.format,
              (format) => updateMusicGeneration({ format }),
            )}
            {renderTimeoutRow(
              MEDIA_GENERATION_SETTINGS_MUSIC_TIMEOUT_LABEL,
              MEDIA_GENERATION_SETTINGS_MUSIC_TIMEOUT_DESC,
              settings.musicGeneration.timeoutMs,
              10000,
              1800000,
              (timeoutMs) => updateMusicGeneration({ timeoutMs }),
            )}
          </>
        ) : null}
      </SettingsCard>

      <SettingsCard title={MEDIA_GENERATION_SETTINGS_VIDEO_TITLE}>
        <SettingRow
          title={MEDIA_GENERATION_SETTINGS_VIDEO_ENABLED_LABEL}
          description={MEDIA_GENERATION_SETTINGS_VIDEO_ENABLED_DESC}
          control={
            <Toggle
              checked={settings.videoGeneration.enabled}
              onChange={(enabled) => updateVideoGeneration({ enabled })}
            />
          }
        />
        {settings.videoGeneration.enabled ? (
          <>
            {renderProviderRow({
              title: MEDIA_GENERATION_SETTINGS_VIDEO_PROVIDER_LABEL,
              description: MEDIA_GENERATION_SETTINGS_VIDEO_PROVIDER_DESC,
              providers: videoProviders,
              selected: selectedVideo,
              capabilityKey: 'video',
              customProviderId: CUSTOM_VIDEO_GENERATION_PROVIDER_ID,
              customLabel: MEDIA_GENERATION_SETTINGS_VIDEO_PROVIDER_CUSTOM,
              missingKeyLabel: formatMediaGenerationSettingsProviderMissingKey,
              setting: settings.videoGeneration,
              defaultProtocol: DEFAULT_VIDEO_GENERATION_PROTOCOL,
              update: updateVideoGeneration,
            })}
            {selectedVideo.usingCustom ? (
              <>
                <SettingRow
                  title={MEDIA_GENERATION_SETTINGS_VIDEO_PROTOCOL_LABEL}
                  description={MEDIA_GENERATION_SETTINGS_VIDEO_PROTOCOL_DESC}
                  control={
                    <select
                      className={SETTINGS_SELECT_CLASS}
                      value={settings.videoGeneration.protocol}
                      onChange={(event) =>
                        updateVideoGeneration({
                          protocol: event.target.value as VideoGenerationProtocol,
                        })
                      }
                    >
                      {VIDEO_GENERATION_PROTOCOLS.map((protocol) => (
                        <option key={protocol} value={protocol}>
                          {MEDIA_GENERATION_SETTINGS_VIDEO_PROTOCOL_MINIMAX}
                        </option>
                      ))}
                    </select>
                  }
                />
                {renderBaseUrlRow(
                  MEDIA_GENERATION_SETTINGS_VIDEO_BASE_URL_LABEL,
                  MEDIA_GENERATION_SETTINGS_VIDEO_BASE_URL_DESC,
                  settings.videoGeneration.baseUrl,
                  MEDIA_GENERATION_SETTINGS_VIDEO_BASE_URL_PLACEHOLDER,
                  (baseUrl) => updateVideoGeneration({ baseUrl }),
                )}
                {renderApiKeyRow({
                  title: MEDIA_GENERATION_SETTINGS_VIDEO_API_KEY_LABEL,
                  description: MEDIA_GENERATION_SETTINGS_VIDEO_API_KEY_DESC,
                  value: settings.videoGeneration.apiKey,
                  visible: showVideoApiKey,
                  setVisible: setShowVideoApiKey,
                  update: (apiKey) => updateVideoGeneration({ apiKey }),
                })}
              </>
            ) : null}
            {renderModelRow({
              title: MEDIA_GENERATION_SETTINGS_VIDEO_MODEL_LABEL,
              description: MEDIA_GENERATION_SETTINGS_VIDEO_MODEL_DESC,
              usingCustom: selectedVideo.usingCustom,
              model: settings.videoGeneration.model,
              options: selectedVideo.capability?.models ?? [],
              placeholder: MEDIA_GENERATION_SETTINGS_VIDEO_MODEL_PLACEHOLDER,
              update: (model) => updateVideoGeneration({ model }),
            })}
            <SettingRow
              title={MEDIA_GENERATION_SETTINGS_VIDEO_DEFAULT_DURATION_LABEL}
              description={MEDIA_GENERATION_SETTINGS_VIDEO_DEFAULT_DURATION_DESC}
              control={
                <input
                  type="number"
                  min={1}
                  max={30}
                  step={1}
                  className="settings-text-input media-generation-compact-input"
                  value={settings.videoGeneration.defaultDuration}
                  onChange={(event) =>
                    updateVideoGeneration({ defaultDuration: Number(event.target.value) })
                  }
                />
              }
            />
            <SettingRow
              title={MEDIA_GENERATION_SETTINGS_VIDEO_DEFAULT_RESOLUTION_LABEL}
              description={MEDIA_GENERATION_SETTINGS_VIDEO_DEFAULT_RESOLUTION_DESC}
              control={
                <select
                  className={`${SETTINGS_SELECT_CLASS} media-generation-resolution-select`}
                  value={settings.videoGeneration.defaultResolution}
                  onChange={(event) =>
                    updateVideoGeneration({ defaultResolution: event.target.value })
                  }
                >
                  {VIDEO_RESOLUTIONS.map((resolution) => (
                    <option key={resolution} value={resolution}>
                      {resolution}
                    </option>
                  ))}
                </select>
              }
            />
            {renderTimeoutRow(
              MEDIA_GENERATION_SETTINGS_VIDEO_TIMEOUT_LABEL,
              MEDIA_GENERATION_SETTINGS_VIDEO_TIMEOUT_DESC,
              settings.videoGeneration.timeoutMs,
              30000,
              3600000,
              (timeoutMs) => updateVideoGeneration({ timeoutMs }),
            )}
            <SettingRow
              title={MEDIA_GENERATION_SETTINGS_VIDEO_POLL_INTERVAL_LABEL}
              description={MEDIA_GENERATION_SETTINGS_VIDEO_POLL_INTERVAL_DESC}
              control={
                <input
                  type="number"
                  min={1000}
                  max={120000}
                  step={1000}
                  className="settings-text-input media-generation-compact-input"
                  value={settings.videoGeneration.pollIntervalMs}
                  onChange={(event) =>
                    updateVideoGeneration({ pollIntervalMs: Number(event.target.value) })
                  }
                />
              }
            />
          </>
        ) : null}
      </SettingsCard>
    </div>
  )
}

function renderProviderRow(input: {
  title: string
  description: string
  providers: MediaProviderSnapshot[]
  selected: ReturnType<typeof selectedProviderState>
  capabilityKey: CapabilityKey
  customProviderId: string
  customLabel: string
  missingKeyLabel: (provider: string) => string
  setting: { baseUrl: string; apiKey: string; protocol: string; model: string }
  defaultProtocol: string
  update: (patch: Record<string, unknown>) => void
}): ReactElement {
  return (
    <SettingRow
      title={input.title}
      description={input.description}
      control={
        <div className="media-generation-provider-control">
          <select
            className={SETTINGS_SELECT_CLASS}
            value={
              input.selected.usingCustom ? input.customProviderId : input.selected.providerId
            }
            onChange={(event) => {
              const providerId = event.target.value
              const nextProvider = input.providers.find((item) => item.id === providerId)
              const capability = nextProvider?.[input.capabilityKey]
              input.update({
                providerId,
                baseUrl: providerId === input.customProviderId ? input.setting.baseUrl : '',
                apiKey: providerId === input.customProviderId ? input.setting.apiKey : '',
                protocol:
                  providerId === input.customProviderId
                    ? input.setting.protocol
                    : capability?.protocol ?? input.defaultProtocol,
                model:
                  providerId === input.customProviderId
                    ? input.setting.model
                    : capability?.models?.[0] ?? '',
              })
            }}
          >
            {input.providers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
            <option value={input.customProviderId}>{input.customLabel}</option>
          </select>
          {!input.selected.usingCustom && !input.selected.provider?.hasApiKey ? (
            <p className="media-generation-provider-warning">
              {input.missingKeyLabel(
                input.selected.provider?.name ?? input.selected.providerId,
              )}
            </p>
          ) : null}
        </div>
      }
    />
  )
}

function renderBaseUrlRow(
  title: string,
  description: string,
  value: string,
  placeholder: string,
  update: (baseUrl: string) => void,
): ReactElement {
  return (
    <SettingRow
      title={title}
      description={description}
      control={
        <input
          className="settings-text-input media-generation-text-input"
          value={value}
          placeholder={placeholder}
          onChange={(event) => update(event.target.value)}
        />
      }
    />
  )
}

function renderApiKeyRow(input: {
  title: string
  description: string
  value: string
  visible: boolean
  setVisible: (value: boolean | ((prev: boolean) => boolean)) => void
  update: (apiKey: string) => void
}): ReactElement {
  return (
    <SettingRow
      title={input.title}
      description={input.description}
      control={
        <SettingsSecretInput
          value={input.value}
          onChange={input.update}
          visible={input.visible}
          onToggleVisibility={() => input.setVisible((value) => !value)}
          autoComplete="off"
          showLabel={PROVIDERS_SETTINGS_SHOW_SECRET}
          hideLabel={PROVIDERS_SETTINGS_HIDE_SECRET}
          className="media-generation-secret-input"
        />
      }
    />
  )
}

function renderModelRow(input: {
  title: string
  description: string
  usingCustom: boolean
  model: string
  options: string[]
  placeholder: string
  update: (model: string) => void
}): ReactElement {
  return (
    <SettingRow
      title={input.title}
      description={input.description}
      control={
        <div className="media-generation-provider-control">
          {input.usingCustom ? (
            <input
              className="settings-text-input"
              value={input.model}
              placeholder={input.placeholder}
              onChange={(event) => input.update(event.target.value)}
            />
          ) : (
            <ModelSelect
              value={input.options.includes(input.model) ? input.model : ''}
              options={input.options}
              defaultLabel={formatMediaGenerationSettingsModelSelectDefaultOption(input.options[0] ?? '')}
              selectClassName={SETTINGS_SELECT_CLASS}
              onChange={input.update}
            />
          )}
        </div>
      }
    />
  )
}

function renderAudioFormatRow(
  title: string,
  description: string,
  value: string,
  update: (format: string) => void,
): ReactElement {
  return (
    <SettingRow
      title={title}
      description={description}
      control={
        <select
          className={`${SETTINGS_SELECT_CLASS} media-generation-format-select`}
          value={value}
          onChange={(event) => update(event.target.value)}
        >
          {AUDIO_FORMATS.map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </select>
      }
    />
  )
}

function renderTimeoutRow(
  title: string,
  description: string,
  value: number,
  min: number,
  max: number,
  update: (timeoutMs: number) => void,
): ReactElement {
  return (
    <SettingRow
      title={title}
      description={description}
      control={
        <input
          type="number"
          min={min}
          max={max}
          step={10000}
          className="settings-text-input media-generation-compact-input"
          value={value}
          onChange={(event) => update(Number(event.target.value))}
        />
      }
    />
  )
}

export type MediaGenerationPreviewMode =
  | 'default'
  | 'disabled'
  | 'ttsCustom'
  | 'musicMissingKey'
  | 'videoCustom'
  | 'ttsOnly'

export function MediaGenerationSettingsSectionPreview({
  mode = 'default',
}: {
  mode?: MediaGenerationPreviewMode
}): ReactElement {
  const [settings, setSettings] = useState<MediaGenerationSettings>(() => {
    if (mode === 'disabled') {
      return {
        textToSpeech: { ...MEDIA_GENERATION_PREVIEW_DEFAULT.textToSpeech, enabled: false },
        musicGeneration: { ...MEDIA_GENERATION_PREVIEW_DEFAULT.musicGeneration, enabled: false },
        videoGeneration: { ...MEDIA_GENERATION_PREVIEW_DEFAULT.videoGeneration, enabled: false },
      }
    }
    if (mode === 'ttsCustom') {
      return {
        ...MEDIA_GENERATION_PREVIEW_DEFAULT,
        textToSpeech: {
          enabled: true,
          providerId: CUSTOM_TEXT_TO_SPEECH_PROVIDER_ID,
          protocol: 'openai-speech',
          baseUrl: 'https://api.minimax.io',
          apiKey: 'sk-preview-key',
          model: 'speech-2.8-hd',
          voice: 'male-qn-qingse',
          format: 'mp3',
          timeoutMs: 120000,
        },
        musicGeneration: { ...MEDIA_GENERATION_PREVIEW_DEFAULT.musicGeneration, enabled: false },
        videoGeneration: { ...MEDIA_GENERATION_PREVIEW_DEFAULT.videoGeneration, enabled: false },
      }
    }
    if (mode === 'musicMissingKey') {
      return {
        ...MEDIA_GENERATION_PREVIEW_DEFAULT,
        musicGeneration: {
          ...MEDIA_GENERATION_PREVIEW_DEFAULT.musicGeneration,
          providerId: 'suno',
          model: 'music-2.6',
        },
      }
    }
    if (mode === 'videoCustom') {
      return {
        ...MEDIA_GENERATION_PREVIEW_DEFAULT,
        textToSpeech: { ...MEDIA_GENERATION_PREVIEW_DEFAULT.textToSpeech, enabled: false },
        musicGeneration: { ...MEDIA_GENERATION_PREVIEW_DEFAULT.musicGeneration, enabled: false },
        videoGeneration: {
          enabled: true,
          providerId: CUSTOM_VIDEO_GENERATION_PROVIDER_ID,
          protocol: 'minimax-video',
          baseUrl: 'https://api.minimax.io',
          apiKey: 'sk-preview-key',
          model: 'MiniMax-Hailuo-2.3',
          defaultDuration: 6,
          defaultResolution: '1080P',
          timeoutMs: 900000,
          pollIntervalMs: 10000,
        },
      }
    }
    if (mode === 'ttsOnly') {
      return {
        ...MEDIA_GENERATION_PREVIEW_DEFAULT,
        musicGeneration: { ...MEDIA_GENERATION_PREVIEW_DEFAULT.musicGeneration, enabled: false },
        videoGeneration: { ...MEDIA_GENERATION_PREVIEW_DEFAULT.videoGeneration, enabled: false },
      }
    }
    return MEDIA_GENERATION_PREVIEW_DEFAULT
  })

  return <MediaGenerationSettingsSection settings={settings} onSettingsChange={setSettings} />
}
