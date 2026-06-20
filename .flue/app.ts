import { Hono } from 'hono'
import { flue } from '@flue/runtime/routing'
import { registerProvider } from '@flue/runtime'

// User-supplied app owns the entire request pipeline (see the generated
// server entry). We mirror createDefaultFlueApp()'s composition — mount the
// public flue() router at root — but gate every request behind a bearer
// token first.
//
// The Electron main process generates a fresh random FLUE_TOKEN per launch
// and passes it to this child. Together with loopback-only binding
// (hostname 127.0.0.1, applied to the generated serve() call by
// scripts/patch-flue-server.mjs) this keeps the agent backend private to a
// single app instance: nothing else on the machine can reach it without the
// token, and nothing off the machine can reach it at all.
const token = process.env.FLUE_TOKEN?.trim()

// Use the OpenAI Chat Completions API (`/v1/chat/completions`). Without this
// registration, `openai/<model>` would resolve to the catalog default wire
// protocol (the newer Responses API); `api: 'openai-completions'` overrides it.
// The key is read from OPENAI_API_KEY in the env (pi-ai's env fallback). The
// base URL defaults to api.openai.com; OPENAI_BASE_URL points it at a custom
// OpenAI-compatible gateway instead. The model is pinned to a dated snapshot
// the installed catalog doesn't know yet, so we supply its context/output
// budget explicitly (mirrors the catalog's `gpt-5.4-nano`).
const openaiBaseUrl = process.env.OPENAI_BASE_URL?.trim() || undefined
registerProvider('openai', {
  api: 'openai-completions',
  ...(openaiBaseUrl ? { baseUrl: openaiBaseUrl } : {}),
  models: {
    'gpt-5.4-nano-2026-03-17': { contextWindow: 400_000, maxTokens: 128_000 },
  },
})

const app = new Hono()

app.use('*', async (c, next) => {
  if (!token) {
    return c.json({ error: 'flue backend token not configured' }, 503)
  }
  if (c.req.header('authorization') !== `Bearer ${token}`) {
    return c.json({ error: 'unauthorized' }, 401)
  }
  await next()
})

app.route('/', flue())

export default app
