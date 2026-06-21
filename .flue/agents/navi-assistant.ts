import { createAgent, type AgentRouteHandler } from '@flue/runtime'
import { local } from '@flue/runtime/node'
import { readFileSync, existsSync } from 'fs'
import { MODEL_ID } from '../../src/shared/flue'
import { resolveProjectCwd } from '../../src/shared/projects'

// Expose the agent over HTTP. Flue only marks an agent's `transports.http` when
// its module exports a `route` middleware (see normalizeBuiltModules in the
// generated server); without this the `POST /agents/navi-assistant/:id` route
// 404s with agent_not_found. Auth is already enforced globally in app.ts, so
// this is a passthrough.
export const route: AgentRouteHandler = async (_c, next) => next()

function projectCwdFor(id: string, storePath: string | undefined): string | undefined {
  if (!storePath) return undefined
  try {
    const store = JSON.parse(readFileSync(storePath, 'utf8'))
    return resolveProjectCwd(store, id)
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string }
    if (err?.code !== 'ENOENT') {
      process.stderr.write(`[navi-agent] store read failed: ${err?.message ?? e}\n`)
    }
    return undefined
  }
}

export default createAgent((ctx) => {
  const cwd = projectCwdFor(ctx.id, ctx.env.NAVI_CONVERSATIONS_PATH)
  const base = [
    'You are Navi, an AI assistant inside a local-first desktop app.',
    'Be concise and helpful with writing, coding, analysis, and questions.',
  ]
  if (!cwd || !existsSync(cwd)) return { model: MODEL_ID, instructions: base.join('\n') }
  return {
    model: MODEL_ID,
    sandbox: local(),
    cwd,
    durability: { maxAttempts: 10, timeoutMs: 3_600_000 },
    instructions: [
      ...base,
      `You are working inside the project directory: ${cwd}.`,
      'You can read, search, edit files, and run shell commands here via your workspace tools. Prefer relative paths.',
    ].join('\n'),
  }
})
