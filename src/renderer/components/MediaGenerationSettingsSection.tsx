// Media generation settings section echoing Kun's settings-section-media-generation.tsx
// (../Kun/src/renderer/src/components/settings-section-media-generation.tsx).
// Visual only: mock form state and preview modes.

import { useState, type ReactElement } from 'react'
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

const COPY = {
  mediaGeneration: 'Media generation',
  mediaGenerationDesc:
    'Expose speech, music, and video generation as agent tools. When enabled, Kun registers generate_speech, generate_music, and generate_video.',
  textToSpeech: 'Speech generation',
  textToSpeechEnabled: 'Enable speech generation',
  textToSpeechEnabledDesc:
    'Enables the generate_speech tool in agent chats to synthesize text into audio files.',
  textToSpeechProvider: 'Speech generation provider',
  textToSpeechProviderDesc:
    'Choose a configured provider with TTS models, or use a custom speech generation API.',
  textToSpeechProviderCustom: 'Custom speech generation API',
  textToSpeechProviderMissingKey: (provider: string) =>
    `${provider} has no API key yet. Add it in Providers.`,
  textToSpeechProtocol: 'Speech generation protocol',
  textToSpeechProtocolDesc: 'Request shape used by the custom speech generation API.',
  textToSpeechProtocolOpenAi: 'OpenAI Speech',
  textToSpeechProtocolMiniMax: 'MiniMax t2a_v2',
  textToSpeechProtocolMimo: 'Xiaomi MiMo TTS',
  textToSpeechBaseUrl: 'API base URL',
  textToSpeechBaseUrlDesc:
    'Speech generation endpoint root, e.g. https://api.minimax.io or https://api.xiaomimimo.com/v1.',
  textToSpeechBaseUrlPlaceholder: 'https://api.minimax.io',
  textToSpeechApiKey: 'API key',
  textToSpeechApiKeyDesc:
    'Key for the speech generation provider. Independent from the chat model key.',
  textToSpeechModel: 'Speech generation model',
  textToSpeechModelDesc:
    'Model id sent to the provider, e.g. speech-2.8-hd or mimo-v2.5-tts.',
  textToSpeechModelPlaceholder: 'speech-2.8-hd',
  textToSpeechVoice: 'Voice',
  textToSpeechVoiceDesc:
    'Optional voice id/name. MiniMax falls back to male-qn-qingse; Xiaomi can use the provider\'s voice value.',
  textToSpeechVoicePlaceholder: 'male-qn-qingse',
  textToSpeechFormat: 'Output format',
  textToSpeechFormatDesc: 'Default format for generated speech files.',
  textToSpeechTimeout: 'Timeout (ms)',
  textToSpeechTimeoutDesc: 'Per-request timeout for speech generation.',
  musicGeneration: 'Music generation',
  musicGenerationEnabled: 'Enable music generation',
  musicGenerationEnabledDesc:
    'Enables the generate_music tool in agent chats to create songs, instrumentals, or covers.',
  musicGenerationProvider: 'Music provider',
  musicGenerationProviderDesc:
    'Choose a configured provider with music models, or use a custom music generation API.',
  musicGenerationProviderCustom: 'Custom music generation API',
  musicGenerationProviderMissingKey: (provider: string) =>
    `${provider} has no API key yet. Add it in Providers.`,
  musicGenerationProtocol: 'Music generation protocol',
  musicGenerationProtocolDesc: 'Request shape used by the custom music generation API.',
  musicGenerationProtocolMiniMax: 'MiniMax music_generation',
  musicGenerationBaseUrl: 'API base URL',
  musicGenerationBaseUrlDesc: 'Music generation endpoint root, e.g. https://api.minimax.io.',
  musicGenerationBaseUrlPlaceholder: 'https://api.minimax.io',
  musicGenerationApiKey: 'API key',
  musicGenerationApiKeyDesc:
    'Key for the music generation provider. Independent from the chat model key.',
  musicGenerationModel: 'Music model',
  musicGenerationModelDesc: 'Model id sent to the provider, e.g. music-2.6 or music-cover.',
  musicGenerationModelPlaceholder: 'music-2.6',
  musicGenerationFormat: 'Output format',
  musicGenerationFormatDesc: 'Default format for generated music files.',
  musicGenerationTimeout: 'Timeout (ms)',
  musicGenerationTimeoutDesc: 'Per-request timeout for music generation.',
  videoGeneration: 'Video generation',
  videoGenerationEnabled: 'Enable video generation',
  videoGenerationEnabledDesc:
    'Enables the generate_video tool in agent chats, with text-to-video and optional first/last frame references.',
  videoGenerationProvider: 'Video provider',
  videoGenerationProviderDesc:
    'Choose a configured provider with video models, or use a custom video generation API.',
  videoGenerationProviderCustom: 'Custom video generation API',
  videoGenerationProviderMissingKey: (provider: string) =>
    `${provider} has no API key yet. Add it in Providers.`,
  videoGenerationProtocol: 'Video generation protocol',
  videoGenerationProtocolDesc: 'Request shape used by the custom video generation API.',
  videoGenerationProtocolMiniMax: 'MiniMax video_generation',
  videoGenerationBaseUrl: 'API base URL',
  videoGenerationBaseUrlDesc: 'Video generation endpoint root, e.g. https://api.minimax.io.',
  videoGenerationBaseUrlPlaceholder: 'https://api.minimax.io',
  videoGenerationApiKey: 'API key',
  videoGenerationApiKeyDesc:
    'Key for the video generation provider. Independent from the chat model key.',
  videoGenerationModel: 'Video model',
  videoGenerationModelDesc: 'Model id sent to the provider, e.g. MiniMax-Hailuo-2.3.',
  videoGenerationModelPlaceholder: 'MiniMax-Hailuo-2.3',
  videoGenerationDefaultDuration: 'Default duration (sec)',
  videoGenerationDefaultDurationDesc: 'Used when the agent does not specify a duration.',
  videoGenerationDefaultResolution: 'Default resolution',
  videoGenerationDefaultResolutionDesc: 'Used when the agent does not specify a resolution.',
  videoGenerationTimeout: 'Timeout (ms)',
  videoGenerationTimeoutDesc: 'Total wait time for one video task.',
  videoGenerationPollInterval: 'Poll interval (ms)',
  videoGenerationPollIntervalDesc: 'How often the runtime checks asynchronous video task status.',
  showSecret: 'Show',
  hideSecret: 'Hide',
  modelSelectDefaultOption: (model: string) => (model ? `Default (${model})` : 'Default'),
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
  if (protocol === 'minimax-t2a') return COPY.textToSpeechProtocolMiniMax
  if (protocol === 'mimo-tts') return COPY.textToSpeechProtocolMimo
  return COPY.textToSpeechProtocolOpenAi
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
      <SettingsCard title={COPY.mediaGeneration}>
        <div className="media-generation-intro">{COPY.mediaGenerationDesc}</div>
      </SettingsCard>

      <SettingsCard title={COPY.textToSpeech}>
        <SettingRow
          title={COPY.textToSpeechEnabled}
          description={COPY.textToSpeechEnabledDesc}
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
              title: COPY.textToSpeechProvider,
              description: COPY.textToSpeechProviderDesc,
              providers: textToSpeechProviders,
              selected: selectedTts,
              capabilityKey: 'textToSpeech',
              customProviderId: CUSTOM_TEXT_TO_SPEECH_PROVIDER_ID,
              customLabel: COPY.textToSpeechProviderCustom,
              missingKeyLabel: COPY.textToSpeechProviderMissingKey,
              setting: settings.textToSpeech,
              defaultProtocol: DEFAULT_TEXT_TO_SPEECH_PROTOCOL,
              update: updateTextToSpeech,
            })}
            {selectedTts.usingCustom ? (
              <>
                <SettingRow
                  title={COPY.textToSpeechProtocol}
                  description={COPY.textToSpeechProtocolDesc}
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
                  COPY.textToSpeechBaseUrl,
                  COPY.textToSpeechBaseUrlDesc,
                  settings.textToSpeech.baseUrl,
                  COPY.textToSpeechBaseUrlPlaceholder,
                  (baseUrl) => updateTextToSpeech({ baseUrl }),
                )}
                {renderApiKeyRow({
                  title: COPY.textToSpeechApiKey,
                  description: COPY.textToSpeechApiKeyDesc,
                  value: settings.textToSpeech.apiKey,
                  visible: showTtsApiKey,
                  setVisible: setShowTtsApiKey,
                  update: (apiKey) => updateTextToSpeech({ apiKey }),
                })}
              </>
            ) : null}
            {renderModelRow({
              title: COPY.textToSpeechModel,
              description: COPY.textToSpeechModelDesc,
              usingCustom: selectedTts.usingCustom,
              model: settings.textToSpeech.model,
              options: selectedTts.capability?.models ?? [],
              placeholder: COPY.textToSpeechModelPlaceholder,
              update: (model) => updateTextToSpeech({ model }),
            })}
            <SettingRow
              title={COPY.textToSpeechVoice}
              description={COPY.textToSpeechVoiceDesc}
              control={
                <input
                  className="settings-text-input"
                  value={settings.textToSpeech.voice}
                  placeholder={COPY.textToSpeechVoicePlaceholder}
                  onChange={(event) => updateTextToSpeech({ voice: event.target.value })}
                />
              }
            />
            {renderAudioFormatRow(
              COPY.textToSpeechFormat,
              COPY.textToSpeechFormatDesc,
              settings.textToSpeech.format,
              (format) => updateTextToSpeech({ format }),
            )}
            {renderTimeoutRow(
              COPY.textToSpeechTimeout,
              COPY.textToSpeechTimeoutDesc,
              settings.textToSpeech.timeoutMs,
              10000,
              900000,
              (timeoutMs) => updateTextToSpeech({ timeoutMs }),
            )}
          </>
        ) : null}
      </SettingsCard>

      <SettingsCard title={COPY.musicGeneration}>
        <SettingRow
          title={COPY.musicGenerationEnabled}
          description={COPY.musicGenerationEnabledDesc}
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
              title: COPY.musicGenerationProvider,
              description: COPY.musicGenerationProviderDesc,
              providers: musicProviders,
              selected: selectedMusic,
              capabilityKey: 'music',
              customProviderId: CUSTOM_MUSIC_GENERATION_PROVIDER_ID,
              customLabel: COPY.musicGenerationProviderCustom,
              missingKeyLabel: COPY.musicGenerationProviderMissingKey,
              setting: settings.musicGeneration,
              defaultProtocol: DEFAULT_MUSIC_GENERATION_PROTOCOL,
              update: updateMusicGeneration,
            })}
            {selectedMusic.usingCustom ? (
              <>
                <SettingRow
                  title={COPY.musicGenerationProtocol}
                  description={COPY.musicGenerationProtocolDesc}
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
                          {COPY.musicGenerationProtocolMiniMax}
                        </option>
                      ))}
                    </select>
                  }
                />
                {renderBaseUrlRow(
                  COPY.musicGenerationBaseUrl,
                  COPY.musicGenerationBaseUrlDesc,
                  settings.musicGeneration.baseUrl,
                  COPY.musicGenerationBaseUrlPlaceholder,
                  (baseUrl) => updateMusicGeneration({ baseUrl }),
                )}
                {renderApiKeyRow({
                  title: COPY.musicGenerationApiKey,
                  description: COPY.musicGenerationApiKeyDesc,
                  value: settings.musicGeneration.apiKey,
                  visible: showMusicApiKey,
                  setVisible: setShowMusicApiKey,
                  update: (apiKey) => updateMusicGeneration({ apiKey }),
                })}
              </>
            ) : null}
            {renderModelRow({
              title: COPY.musicGenerationModel,
              description: COPY.musicGenerationModelDesc,
              usingCustom: selectedMusic.usingCustom,
              model: settings.musicGeneration.model,
              options: selectedMusic.capability?.models ?? [],
              placeholder: COPY.musicGenerationModelPlaceholder,
              update: (model) => updateMusicGeneration({ model }),
            })}
            {renderAudioFormatRow(
              COPY.musicGenerationFormat,
              COPY.musicGenerationFormatDesc,
              settings.musicGeneration.format,
              (format) => updateMusicGeneration({ format }),
            )}
            {renderTimeoutRow(
              COPY.musicGenerationTimeout,
              COPY.musicGenerationTimeoutDesc,
              settings.musicGeneration.timeoutMs,
              10000,
              1800000,
              (timeoutMs) => updateMusicGeneration({ timeoutMs }),
            )}
          </>
        ) : null}
      </SettingsCard>

      <SettingsCard title={COPY.videoGeneration}>
        <SettingRow
          title={COPY.videoGenerationEnabled}
          description={COPY.videoGenerationEnabledDesc}
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
              title: COPY.videoGenerationProvider,
              description: COPY.videoGenerationProviderDesc,
              providers: videoProviders,
              selected: selectedVideo,
              capabilityKey: 'video',
              customProviderId: CUSTOM_VIDEO_GENERATION_PROVIDER_ID,
              customLabel: COPY.videoGenerationProviderCustom,
              missingKeyLabel: COPY.videoGenerationProviderMissingKey,
              setting: settings.videoGeneration,
              defaultProtocol: DEFAULT_VIDEO_GENERATION_PROTOCOL,
              update: updateVideoGeneration,
            })}
            {selectedVideo.usingCustom ? (
              <>
                <SettingRow
                  title={COPY.videoGenerationProtocol}
                  description={COPY.videoGenerationProtocolDesc}
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
                          {COPY.videoGenerationProtocolMiniMax}
                        </option>
                      ))}
                    </select>
                  }
                />
                {renderBaseUrlRow(
                  COPY.videoGenerationBaseUrl,
                  COPY.videoGenerationBaseUrlDesc,
                  settings.videoGeneration.baseUrl,
                  COPY.videoGenerationBaseUrlPlaceholder,
                  (baseUrl) => updateVideoGeneration({ baseUrl }),
                )}
                {renderApiKeyRow({
                  title: COPY.videoGenerationApiKey,
                  description: COPY.videoGenerationApiKeyDesc,
                  value: settings.videoGeneration.apiKey,
                  visible: showVideoApiKey,
                  setVisible: setShowVideoApiKey,
                  update: (apiKey) => updateVideoGeneration({ apiKey }),
                })}
              </>
            ) : null}
            {renderModelRow({
              title: COPY.videoGenerationModel,
              description: COPY.videoGenerationModelDesc,
              usingCustom: selectedVideo.usingCustom,
              model: settings.videoGeneration.model,
              options: selectedVideo.capability?.models ?? [],
              placeholder: COPY.videoGenerationModelPlaceholder,
              update: (model) => updateVideoGeneration({ model }),
            })}
            <SettingRow
              title={COPY.videoGenerationDefaultDuration}
              description={COPY.videoGenerationDefaultDurationDesc}
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
              title={COPY.videoGenerationDefaultResolution}
              description={COPY.videoGenerationDefaultResolutionDesc}
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
              COPY.videoGenerationTimeout,
              COPY.videoGenerationTimeoutDesc,
              settings.videoGeneration.timeoutMs,
              30000,
              3600000,
              (timeoutMs) => updateVideoGeneration({ timeoutMs }),
            )}
            <SettingRow
              title={COPY.videoGenerationPollInterval}
              description={COPY.videoGenerationPollIntervalDesc}
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
          showLabel={COPY.showSecret}
          hideLabel={COPY.hideSecret}
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
              defaultLabel={COPY.modelSelectDefaultOption(input.options[0] ?? '')}
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
