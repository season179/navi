import { Hono } from 'hono'
import { flue } from '@flue/runtime/routing'
import { registerProvider } from '@flue/runtime'
import { readFileSync } from 'fs'
import { OPENAI_PINNED_MODEL } from '../src/shared/provider-presets'

// Shape of one entry in the providers file the main process writes (no keys).
interface NaviProvider {
  id: string
  api?: string
  baseUrl?: string
  models: { id: string; contextWindow?: number; maxTokens?: number }[]
  headers?: Record<string, string>
}

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

// Register every configured provider at boot. The main process writes two
// 0600 files under userData and injects only their paths (mirroring
// FLUE_DB_PATH / NAVI_CONVERSATIONS_PATH): the profile array (no keys) and a
// { [id]: key } map. registerProvider is boot-only, so any provider/key/baseUrl
// change restarts this child.
//
// Why an explicit apiKey per provider (not env vars): pi-ai's env-var fallback
// only resolves keys for *catalog* ids, so a non-catalog id (zai-coding-plan,
// any custom provider) would be silently unauthenticated. Passing apiKey into
// registerProvider works uniformly and short-circuits the env fallback (§F4).
// Read + parse a JSON file injected by the main process. A corrupt, truncated,
// or empty file (e.g. an interrupted writeFileSync) must NOT throw at module
// load — that would crash the child before it prints FLUE_READY and leave the
// backend permanently not-ready with no recovery. On any failure we fall back to
// the empty case (which preserves single-OpenAI behavior below), mirroring the
// guarded store read in navi-assistant.ts.
function readJsonFile<T>(path: string | undefined, fallback: T): T {
  if (!path) return fallback
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T
  } catch {
    return fallback
  }
}

const providersRaw = readJsonFile<NaviProvider[]>(process.env.NAVI_PROVIDERS_PATH, [])
const providers: NaviProvider[] = Array.isArray(providersRaw) ? providersRaw : []
const keysRaw = readJsonFile<Record<string, string>>(process.env.NAVI_PROVIDER_KEYS_PATH, {})
const keys: Record<string, string> = keysRaw && typeof keysRaw === 'object' ? keysRaw : {}

if (providers.length === 0) {
  // Legacy / pre-migration fallback — preserves today's exact single-OpenAI
  // behavior. MUST keep api:'openai-completions' to force Chat Completions over
  // the catalog Responses default. Key + base URL still come from the env here.
  const openaiBaseUrl = process.env.OPENAI_BASE_URL?.trim() || undefined
  registerProvider('openai', {
    api: 'openai-completions',
    ...(openaiBaseUrl ? { baseUrl: openaiBaseUrl } : {}),
    models: {
      [OPENAI_PINNED_MODEL.id]: {
        contextWindow: OPENAI_PINNED_MODEL.contextWindow,
        maxTokens: OPENAI_PINNED_MODEL.maxTokens,
      },
    },
  })
} else {
  for (const p of providers) {
    // INVARIANT (§F5): for catalog ids, omit contextWindow/maxTokens entirely so
    // the catalog's real values win. Only the pinned OpenAI snapshot supplies them.
    const models = Object.fromEntries(
      p.models
        .filter((m) => m.contextWindow || m.maxTokens)
        .map((m) => [
          m.id,
          {
            ...(m.contextWindow ? { contextWindow: m.contextWindow } : {}),
            ...(m.maxTokens ? { maxTokens: m.maxTokens } : {}),
          },
        ]),
    )
    registerProvider(p.id, {
      ...(p.api ? { api: p.api } : {}), // openai MUST carry api:'openai-completions' (§F3)
      ...(p.baseUrl ? { baseUrl: p.baseUrl } : {}),
      ...(p.headers ? { headers: p.headers } : {}),
      ...(keys[p.id] ? { apiKey: keys[p.id] } : {}), // explicit key — required for non-catalog ids (§F4)
      ...(Object.keys(models).length ? { models } : {}),
    })
  }
}

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
