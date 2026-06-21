// Lifecycle and streaming bridge for the Flue agent backend.
//
// The backend is the Flue-generated server (dist/server.mjs), spawned as a
// child of the Electron main process. It runs on Electron's bundled Node via
// ELECTRON_RUN_AS_NODE=1, binds 127.0.0.1 on an OS-assigned port, and is gated
// by a per-launch random bearer token. The main process is the only client:
// it speaks to the child through @flue/sdk over loopback. The renderer never
// sees the token or the port (its CSP forbids loopback fetches anyway) and
// reaches the agent only through the IPC bridge.

import { app } from 'electron'
import { spawn, type ChildProcessByStdio } from 'child_process'
import type { Readable } from 'stream'
import { randomBytes, randomUUID } from 'crypto'
import { EventEmitter } from 'events'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { createFlueClient, type FlueClient } from '@flue/sdk'
import {
  AGENT_NAME,
  type DefaultSelection,
  type FlueStatus,
  type FlueStreamMessage,
  type ProviderProfile,
  type ProviderStatus,
} from '../shared/flue'
import { resolveProjectCwd } from '../shared/projects'
import { storePath } from './conversations'
import { getDefaultSelection, getProviderKey, listProviders } from './settings'

// pi-ai env vars we scrub from the child: keys reach it via the keys file +
// explicit registerProvider(apiKey), never the env fallback (§F4).
const SCRUBBED_KEY_VARS = [
  'OPENAI_API_KEY',
  'DEEPSEEK_API_KEY',
  'ZAI_API_KEY',
  'ZAI_CODING_PLAN_API_KEY',
  'ZAI_CODING_CN_API_KEY',
]

/** How long to wait for the child to print FLUE_READY before giving up. */
const READY_TIMEOUT_MS = 20_000
/** Coalesce text deltas into one IPC message at most this often. */
const STREAM_FLUSH_MS = 40

interface ReadyInfo {
  host: string
  port: number
}

interface ActivePrompt {
  controller: AbortController
}

class FlueBackend extends EventEmitter {
  private child: ChildProcessByStdio<null, Readable, Readable> | null = null
  private client: FlueClient | null = null
  private ready = false
  private lastError: string | undefined
  private hasKey = false
  private providerStatuses: ProviderStatus[] = []
  private activeDefault: FlueStatus['active']
  private starting: Promise<void> | null = null
  private readonly active = new Map<string, ActivePrompt>()

  /** Subscribe to streamed prompt events. */
  onStream(listener: (msg: FlueStreamMessage) => void): () => void {
    this.on('stream', listener)
    return () => this.off('stream', listener)
  }

  /** Subscribe to backend status changes. */
  onStatus(listener: (status: FlueStatus) => void): () => void {
    this.on('status', listener)
    return () => this.off('status', listener)
  }

  status(): FlueStatus {
    return {
      ready: this.ready,
      providers: this.providerStatuses,
      active: this.activeDefault,
      error: this.lastError,
    }
  }

  private resolveActive(
    profiles: ProviderProfile[],
    def: DefaultSelection | undefined,
  ): FlueStatus['active'] {
    if (!def) return undefined
    const model = profiles
      .find((p) => p.id === def.providerId)
      ?.models.find((m) => m.id === def.modelId)
    return {
      providerId: def.providerId,
      modelId: def.modelId,
      label: model?.label ?? def.modelId,
      reasoning: def.reasoning,
    }
  }

  private emitStatus() {
    this.emit('status', this.status())
  }

  private serverPath(): string {
    // dist/main/main.cjs (this bundle) -> dist/server.mjs
    return path.join(__dirname, '..', 'server.mjs')
  }

  /** Start (or restart) the child. Idempotent while a start is in flight. */
  async start(): Promise<void> {
    if (this.starting) return this.starting
    this.starting = this.doStart().finally(() => {
      this.starting = null
    })
    return this.starting
  }

  private async doStart(): Promise<void> {
    await this.stop()

    // Resolve every provider's key in MAIN (env-first → safeStorage), build the
    // per-provider status, and the keys map the child receives via a 0600 file.
    const profiles = await listProviders()
    const keys: Record<string, string> = {}
    const statuses: ProviderStatus[] = []
    for (const p of profiles) {
      const k = await getProviderKey(p.id)
      if (k.state === 'ok') keys[p.id] = k.key
      statuses.push({ id: p.id, name: p.name, keyState: k.state, baseUrl: p.baseUrl })
    }
    this.providerStatuses = statuses
    this.hasKey = statuses.some((s) => s.keyState === 'ok')

    const def = await getDefaultSelection()
    this.activeDefault = this.resolveActive(profiles, def)
    // The OpenAI provider still honors a dev's OPENAI_BASE_URL env override when
    // its profile leaves baseUrl blank (applied per-provider below).
    const openaiEnvBase = process.env.OPENAI_BASE_URL?.trim() || undefined
    this.lastError = undefined

    const userData = app.getPath('userData')
    // The child can't call Electron, so it reads providers/keys from 0600 files
    // and we inject only their paths (mirrors FLUE_DB_PATH / NAVI_CONVERSATIONS_PATH).
    const providersFile = path.join(userData, 'navi-providers.json')
    const keysFile = path.join(userData, 'navi-provider-keys.json')
    const naviProviders = profiles.map((p) => {
      const baseUrl = p.id === 'openai' ? (p.baseUrl ?? openaiEnvBase) : p.baseUrl
      return {
        id: p.id,
        ...(p.api ? { api: p.api } : {}),
        ...(baseUrl ? { baseUrl } : {}),
        ...(p.headers ? { headers: p.headers } : {}),
        models: p.models.map((m) => ({
          id: m.id,
          ...(m.contextWindow ? { contextWindow: m.contextWindow } : {}),
          ...(m.maxTokens ? { maxTokens: m.maxTokens } : {}),
        })),
      }
    })
    writeFileSync(providersFile, JSON.stringify(naviProviders), { mode: 0o600 })
    writeFileSync(keysFile, JSON.stringify(keys), { mode: 0o600 })

    const token = randomBytes(32).toString('hex')
    const port = '0'
    const dbPath = path.join(userData, 'flue.db')

    const env: NodeJS.ProcessEnv = {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      PORT: port,
      FLUE_TOKEN: token,
      FLUE_DB_PATH: dbPath,
      NAVI_CONVERSATIONS_PATH: storePath(),
      NAVI_PROVIDERS_PATH: providersFile,
      NAVI_PROVIDER_KEYS_PATH: keysFile,
    }
    // Scrub pi-ai key vars + OPENAI_BASE_URL so the child can't pick up a
    // stale/shell-inherited credential; keys flow only through the keys file (§F4).
    for (const v of SCRUBBED_KEY_VARS) delete env[v]
    delete env.OPENAI_BASE_URL
    if (def) {
      env.NAVI_DEFAULT_MODEL = `${def.providerId}/${def.modelId}`
      env.NAVI_DEFAULT_REASONING = def.reasoning
    }

    const child = spawn(process.execPath, ['--no-warnings', this.serverPath()], {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    this.child = child

    const ready = await this.waitForReady(child)
    this.client = createFlueClient({
      baseUrl: `http://${ready.host}:${ready.port}`,
      token,
    })
    this.ready = true
    this.emitStatus()
  }

  private waitForReady(child: ChildProcessByStdio<null, Readable, Readable>): Promise<ReadyInfo> {
    return new Promise<ReadyInfo>((resolve, reject) => {
      let settled = false
      let buf = ''
      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        reject(new Error('Flue backend did not become ready within timeout.'))
      }, READY_TIMEOUT_MS)

      const onStdout = (chunk: Buffer) => {
        const text = chunk.toString()
        buf += text
        const m = buf.match(/FLUE_READY (\{.*\})/)
        if (m && !settled) {
          try {
            const info = JSON.parse(m[1]) as ReadyInfo
            settled = true
            clearTimeout(timer)
            resolve(info)
          } catch (err) {
            settled = true
            clearTimeout(timer)
            reject(err instanceof Error ? err : new Error(String(err)))
          }
        }
      }
      child.stdout.on('data', onStdout)
      child.stderr.on('data', (chunk: Buffer) => {
        // Surface child stderr to the main process log for diagnosis.
        process.stderr.write(`[flue-child] ${chunk.toString()}`)
      })
      child.on('exit', (code, signal) => {
        this.ready = false
        this.client = null
        this.child = null
        const reason = `Flue backend exited (code ${code ?? 'null'}, signal ${signal ?? 'null'}).`
        if (!settled) {
          settled = true
          clearTimeout(timer)
          reject(new Error(reason))
        } else {
          this.lastError = reason
          this.emitStatus()
        }
      })
      child.on('error', (err) => {
        this.ready = false
        if (!settled) {
          settled = true
          clearTimeout(timer)
          reject(err)
        }
      })
    })
  }

  /** Stop the child and tear down the client. Safe to call when not running. */
  async stop(): Promise<void> {
    for (const [, prompt] of this.active) prompt.controller.abort()
    this.active.clear()

    const child = this.child
    this.child = null
    this.client = null
    this.ready = false
    if (!child || child.exitCode !== null) return

    await new Promise<void>((resolve) => {
      const done = () => resolve()
      const killTimer = setTimeout(() => {
        if (child.exitCode === null) child.kill('SIGKILL')
        resolve()
      }, 4000)
      child.once('exit', () => {
        clearTimeout(killTimer)
        done()
      })
      child.kill('SIGTERM')
    })
  }

  /** Restart after a settings change (e.g. a new API key). */
  async restart(): Promise<void> {
    await this.start()
  }

  /**
   * Admit one prompt against a conversation (agent instance) and stream its
   * events back to subscribers as batched FlueStreamMessages. Resolves with the
   * requestId as soon as the prompt is admitted; streaming continues async.
   */
  async send(conversationId: string, message: string): Promise<{ requestId: string }> {
    if (!this.client || !this.ready) {
      throw new Error('Flue backend is not ready.')
    }
    if (!this.hasKey) {
      throw new Error('No model provider configured. Add one in Settings.')
    }

    // Resolve the bound project folder up front. A missing/corrupt store must
    // not block the turn (fall through to plain chat), but a project whose
    // folder was deleted should fail loudly before we spend a request on it.
    let projectCwd: string | undefined
    try {
      const store = JSON.parse(readFileSync(storePath(), 'utf8'))
      projectCwd = resolveProjectCwd(store, conversationId)
    } catch {
      // store unreadable/corrupt → don't over-block; let the turn proceed
    }
    if (projectCwd && !existsSync(projectCwd)) {
      throw new Error(
        `Project folder no longer exists: ${projectCwd}. Re-create the project or pick a new folder.`,
      )
    }

    const requestId = randomUUID()
    const controller = new AbortController()
    this.active.set(requestId, { controller })

    const client = this.client
    void this.streamPrompt(client, conversationId, requestId, message, controller)
    return { requestId }
  }

  private async streamPrompt(
    client: FlueClient,
    conversationId: string,
    requestId: string,
    message: string,
    controller: AbortController,
  ): Promise<void> {
    let assembled = ''
    let pending = ''
    let flushTimer: ReturnType<typeof setTimeout> | null = null

    const flush = () => {
      if (pending) {
        this.emit('stream', {
          requestId,
          conversationId,
          kind: 'delta',
          text: pending,
        } satisfies FlueStreamMessage)
        pending = ''
      }
      if (flushTimer) {
        clearTimeout(flushTimer)
        flushTimer = null
      }
    }
    const scheduleFlush = () => {
      if (!flushTimer) flushTimer = setTimeout(flush, STREAM_FLUSH_MS)
    }
    // Shared terminal-success path: drain buffered text, then emit the done.
    const settle = () => {
      flush()
      this.finishPrompt(requestId, conversationId, assembled)
    }

    try {
      const admission = await client.agents.send(AGENT_NAME, conversationId, {
        message,
        signal: controller.signal,
      })

      const stream = client.agents.stream(AGENT_NAME, conversationId, {
        offset: admission.offset,
        live: true,
        signal: controller.signal,
      })

      for await (const event of stream) {
        // Events scoped to this prompt by the admission offset; when a
        // submissionId is present, double-check it matches ours.
        const sid = (event as { submissionId?: string }).submissionId
        if (sid && sid !== admission.submissionId) continue

        switch (event.type) {
          case 'text_delta': {
            assembled += event.text
            pending += event.text
            scheduleFlush()
            break
          }
          case 'thinking_delta': {
            this.emit('stream', {
              requestId,
              conversationId,
              kind: 'thinking',
              text: event.delta,
            } satisfies FlueStreamMessage)
            break
          }
          case 'turn': {
            // Fallback: if no text_delta arrived, recover the assistant text
            // from the completed turn's output message.
            if (!assembled && event.output) {
              const text = event.output.content
                .filter((c): c is { type: 'text'; text: string } => (c as { type?: string }).type === 'text')
                .map((c) => c.text)
                .join('')
              assembled += text
              pending += text
            }
            if (event.isError) {
              throw new Error(
                typeof event.error === 'string' ? event.error : 'Model turn failed.',
              )
            }
            break
          }
          case 'submission_settled': {
            // Recovery settled an interrupted submission. If it failed, surface
            // the error rather than reporting the partial text as a clean done.
            if (event.outcome === 'failed') {
              flush()
              this.active.delete(requestId)
              this.emit('stream', {
                requestId,
                conversationId,
                kind: 'error',
                error: event.error || 'The request failed.',
              } satisfies FlueStreamMessage)
              return
            }
            settle()
            return
          }
          case 'idle': {
            settle()
            return
          }
          default:
            break
        }
      }
      // Stream ended without an explicit terminal event.
      settle()
    } catch (err) {
      if (flushTimer) clearTimeout(flushTimer)
      this.active.delete(requestId)
      if (controller.signal.aborted) return
      this.emit('stream', {
        requestId,
        conversationId,
        kind: 'error',
        error: err instanceof Error ? err.message : String(err),
      } satisfies FlueStreamMessage)
    }
  }

  private finishPrompt(requestId: string, conversationId: string, text: string) {
    this.active.delete(requestId)
    this.emit('stream', {
      requestId,
      conversationId,
      kind: 'done',
      text,
    } satisfies FlueStreamMessage)
  }

  /** Abort an in-flight prompt. */
  cancel(requestId: string): void {
    const prompt = this.active.get(requestId)
    if (prompt) {
      prompt.controller.abort()
      this.active.delete(requestId)
    }
  }
}

export const flueBackend = new FlueBackend()
