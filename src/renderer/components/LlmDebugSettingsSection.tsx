// LLM debug settings section echoing Kun's settings-section-llm-debug.tsx
// (../Kun/src/renderer/src/components/settings-section-llm-debug.tsx).
// Visual only: mock round snapshots and preview modes.

import { useState, type ReactElement } from 'react'
import { RefreshCw } from 'lucide-react'
import {
  LLM_DEBUG_SETTINGS_DESC,
  LLM_DEBUG_SETTINGS_EMPTY,
  LLM_DEBUG_SETTINGS_OUTPUT,
  LLM_DEBUG_SETTINGS_REASONING,
  LLM_DEBUG_SETTINGS_REFRESH_LABEL,
  LLM_DEBUG_SETTINGS_REQUEST,
  LLM_DEBUG_SETTINGS_TITLE,
  LLM_DEBUG_SETTINGS_TOOL_CALLS,
  LLM_DEBUG_SETTINGS_USAGE,
} from '../lib/llmDebugSettingsSection'
import { SettingsCard } from './SettingsControls'

export type LlmDebugToolCall = {
  callId: string
  toolName: string
  arguments: Record<string, unknown>
}

export type LlmDebugRound = {
  id: number
  threadId: string
  turnId: string
  provider: string
  model: string
  url: string
  startedAt: string
  finishedAt: string
  durationMs: number
  requestBody: Record<string, unknown> | null
  output: {
    text: string
    reasoning: string
    toolCalls: LlmDebugToolCall[]
    usage?: Record<string, unknown>
    stopReason?: string
    error?: string
  }
}

function pretty(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function RoundCard({
  round,
  defaultOpen = false,
}: {
  round: LlmDebugRound
  defaultOpen?: boolean
}): ReactElement {
  const [open, setOpen] = useState(defaultOpen)
  const out = round.output
  const status = out.error ? `⚠ ${out.error}` : (out.stopReason ?? '')

  return (
    <div className="llm-debug-round-card">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="llm-debug-round-toggle"
      >
        <span className="llm-debug-round-id">#{round.id}</span>
        <span className="llm-debug-round-summary">
          <span className="llm-debug-round-model">{round.model}</span>
          <span className="llm-debug-round-meta">
            {round.startedAt} · {round.durationMs}ms{status ? ` · ${status}` : ''}
          </span>
        </span>
        <span className={out.error ? 'llm-debug-round-chevron is-error' : 'llm-debug-round-chevron'}>
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open ? (
        <div className="llm-debug-round-body">
          <div className="llm-debug-round-turn">
            turn: <span className="llm-debug-round-turn-id">{round.turnId}</span> · {round.provider} ·{' '}
            {round.url}
          </div>

          <div className="llm-debug-round-section">
            <div className="llm-debug-round-section-label">{LLM_DEBUG_SETTINGS_REQUEST}</div>
            <pre className="llm-debug-pre">
              {round.requestBody ? pretty(round.requestBody) : '—'}
            </pre>
          </div>

          <div className="llm-debug-round-section">
            <div className="llm-debug-round-section-label">{LLM_DEBUG_SETTINGS_OUTPUT}</div>
            {out.text ? <pre className="llm-debug-pre">{out.text}</pre> : null}
            {out.reasoning ? (
              <>
                <div className="llm-debug-round-sub-label">{LLM_DEBUG_SETTINGS_REASONING}</div>
                <pre className="llm-debug-pre">{out.reasoning}</pre>
              </>
            ) : null}
            {out.toolCalls.length > 0 ? (
              <>
                <div className="llm-debug-round-sub-label">{LLM_DEBUG_SETTINGS_TOOL_CALLS}</div>
                <pre className="llm-debug-pre">{pretty(out.toolCalls)}</pre>
              </>
            ) : null}
            {out.usage ? (
              <>
                <div className="llm-debug-round-sub-label">{LLM_DEBUG_SETTINGS_USAGE}</div>
                <pre className="llm-debug-pre">{pretty(out.usage)}</pre>
              </>
            ) : null}
            {out.error ? <pre className="llm-debug-pre is-danger">{out.error}</pre> : null}
            {!out.text && !out.reasoning && out.toolCalls.length === 0 && !out.error ? (
              <pre className="llm-debug-pre">—</pre>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

type Props = {
  rounds: LlmDebugRound[]
  loading?: boolean
  error?: string | null
  defaultOpenRoundIds?: number[]
  onRefresh?: () => void
}

export function LlmDebugSettingsSection({
  rounds,
  loading = false,
  error = null,
  defaultOpenRoundIds,
  onRefresh,
}: Props): ReactElement {
  return (
    <SettingsCard title={LLM_DEBUG_SETTINGS_TITLE}>
      <div className="llm-debug-section">
        <div className="llm-debug-header">
          <p className="llm-debug-desc">{LLM_DEBUG_SETTINGS_DESC}</p>
          <button
            type="button"
            disabled={loading}
            onClick={() => onRefresh?.()}
            className="llm-debug-refresh-btn"
          >
            <RefreshCw
              className={loading ? 'llm-debug-refresh-icon is-spinning' : 'llm-debug-refresh-icon'}
              strokeWidth={1.8}
            />
            {LLM_DEBUG_SETTINGS_REFRESH_LABEL}
          </button>
        </div>

        {error ? <p className="llm-debug-error">{error}</p> : null}

        {rounds.length === 0 ? (
          <p className="llm-debug-empty">{LLM_DEBUG_SETTINGS_EMPTY}</p>
        ) : (
          <div className="llm-debug-rounds">
            {rounds.map((round) => (
              <RoundCard
                key={round.id}
                round={round}
                defaultOpen={defaultOpenRoundIds?.includes(round.id) ?? false}
              />
            ))}
          </div>
        )}
      </div>
    </SettingsCard>
  )
}

export const LLM_DEBUG_PREVIEW_ROUNDS: LlmDebugRound[] = [
  {
    id: 42,
    threadId: 'thread-abc123',
    turnId: 'turn-7f3a',
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    url: 'https://api.anthropic.com/v1/messages',
    startedAt: '2026-06-22T14:32:01.042Z',
    finishedAt: '2026-06-22T14:32:04.891Z',
    durationMs: 3849,
    requestBody: {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: 'You are a helpful coding assistant.',
      messages: [{ role: 'user', content: 'Port the LlmDebugSettingsSection from Kun.' }],
      tools: [{ name: 'read_file', description: 'Read a file from the workspace.' }],
    },
    output: {
      text: 'I will port LlmDebugSettingsSection with matching collapsible round cards and JSON pre blocks.',
      reasoning: 'The component is self-contained with SettingsCard, refresh button, and RoundCard sub-component.',
      toolCalls: [],
      usage: { input_tokens: 1240, output_tokens: 186 },
      stopReason: 'end_turn',
    },
  },
  {
    id: 41,
    threadId: 'thread-abc123',
    turnId: 'turn-6e2b',
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    url: 'https://api.anthropic.com/v1/messages',
    startedAt: '2026-06-22T14:28:15.331Z',
    finishedAt: '2026-06-22T14:28:18.102Z',
    durationMs: 2771,
    requestBody: {
      model: 'claude-sonnet-4-20250514',
      messages: [{ role: 'user', content: 'List remaining Kun settings sections.' }],
    },
    output: {
      text: '',
      reasoning: '',
      toolCalls: [
        {
          callId: 'toolu_01A',
          toolName: 'grep',
          arguments: { pattern: 'settings-section', path: 'src/renderer/src/components' },
        },
      ],
      usage: { input_tokens: 980, output_tokens: 64 },
      stopReason: 'tool_use',
    },
  },
  {
    id: 40,
    threadId: 'thread-abc123',
    turnId: 'turn-5d1a',
    provider: 'openai',
    model: 'gpt-4.1',
    url: 'https://api.openai.com/v1/chat/completions',
    startedAt: '2026-06-22T14:20:00.000Z',
    finishedAt: '2026-06-22T14:20:02.500Z',
    durationMs: 2500,
    requestBody: {
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: 'Trigger a rate limit test.' }],
    },
    output: {
      text: '',
      reasoning: '',
      toolCalls: [],
      error: '429 Too Many Requests — rate limit exceeded',
    },
  },
]

export type LlmDebugPreviewMode = 'default' | 'empty' | 'error' | 'expanded' | 'loading'

export function LlmDebugSettingsSectionPreview({
  mode = 'default',
}: {
  mode?: LlmDebugPreviewMode
}): ReactElement {
  const [loading, setLoading] = useState(mode === 'loading')

  const rounds =
    mode === 'empty' || mode === 'error' || mode === 'loading'
      ? []
      : mode === 'expanded'
        ? [LLM_DEBUG_PREVIEW_ROUNDS[0]!]
        : LLM_DEBUG_PREVIEW_ROUNDS

  const error = mode === 'error' ? 'HTTP 503' : null

  return (
    <LlmDebugSettingsSection
      rounds={rounds}
      loading={loading}
      error={error}
      defaultOpenRoundIds={mode === 'expanded' ? [LLM_DEBUG_PREVIEW_ROUNDS[0]!.id] : undefined}
      onRefresh={() => {
        setLoading(true)
        window.setTimeout(() => setLoading(false), 1200)
      }}
    />
  )
}
