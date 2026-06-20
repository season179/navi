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
import path from 'path'
import { createFlueClient, type FlueClient } from '@flue/sdk'
import { AGENT_NAME, type FlueStatus, type FlueStreamMessage } from '../shared/flue'
import { getApiKey, getBaseUrl } from './settings'

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
  private baseUrl: string | undefined
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
    return { ready: this.ready, hasApiKey: this.hasKey, baseUrl: this.baseUrl, error: this.lastError }
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

    const apiKey = await getApiKey()
    this.hasKey = apiKey !== undefined
    const baseUrl = await getBaseUrl()
    this.baseUrl = baseUrl
    this.lastError = undefined

    const token = randomBytes(32).toString('hex')
    const port = '0'
    const dbPath = path.join(app.getPath('userData'), 'flue.db')

    const env: NodeJS.ProcessEnv = {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      PORT: port,
      FLUE_TOKEN: token,
      FLUE_DB_PATH: dbPath,
    }
    if (apiKey) env.OPENAI_API_KEY = apiKey
    else delete env.OPENAI_API_KEY
    if (baseUrl) env.OPENAI_BASE_URL = baseUrl
    else delete env.OPENAI_BASE_URL

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
      throw new Error('No OpenAI API key configured. Add one in Settings.')
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

  /** Recompute key presence and restart so the child gets the new key. */
  async refreshApiKey(): Promise<void> {
    await this.restart()
  }
}

export const flueBackend = new FlueBackend()
