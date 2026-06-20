import { createAgent, type AgentRouteHandler } from '@flue/runtime'

// Expose the agent over HTTP. Flue only marks an agent's `transports.http` when
// its module exports a `route` middleware (see normalizeBuiltModules in the
// generated server); without this the `POST /agents/navi-assistant/:id` route
// 404s with agent_not_found. Auth is already enforced globally in app.ts, so
// this is a passthrough.
export const route: AgentRouteHandler = async (_c, next) => next()

export default createAgent(() => ({
  model: 'openai/gpt-5.4-nano-2026-03-17',
  instructions: [
    'You are Navi, an AI assistant inside a local-first desktop app.',
    'Be concise and helpful with writing, coding, analysis, and questions.',
  ].join('\n'),
}))
