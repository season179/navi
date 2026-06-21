# Multi-provider support (z.ai / GLM + DeepSeek)

**Status:** Design only — no code changes yet. Self-contained for handoff to another agent.
**Date:** 2026-06-21. **Repo:** `/Users/season/Personal/navi`. **Revision 2** (incorporates a code-verified review by `pi` + product decisions below).
**Goal:** Let navi talk to multiple OpenAI-compatible model providers — at minimum **z.ai (GLM)** and **DeepSeek** alongside the existing **OpenAI** — and replicate **Kun's provider UI/UX** for configuring providers and switching models.

Researched against Kun's source (`../kun`), navi's source, the installed `@flue/runtime 1.0.0-beta.2` / `@flue/sdk 1.0.0-beta.1`, the bundled `@earendil-works/pi-ai@0.79.8` catalog, and live z.ai / DeepSeek docs (June 2026).

### Product decisions (locked)
- **Model selection is per-conversation** (each chat remembers its own provider+model), a deliberate improvement over Kun's single global active model. Resolved via a store pointer the agent reads per turn.
- **Composer reaches full Kun parity:** the picker has a **reasoning-effort submenu** (also per-conversation) and **vision/text capability badges** per model.

---

## 0. TL;DR

- The **backend is nearly free**: `deepseek` and `zai` are already **built-in catalog providers** in pi-ai (the model layer under Flue). `registerProvider('deepseek', {})` / `registerProvider('zai', {})` work with no `api`/`baseUrl` — the catalog supplies the `openai-completions` wire protocol, model list, and compat quirks. We loop `registerProvider` and inject per-provider API keys as env vars.
- The **real work is the UI/UX**: rebuild Kun's provider-settings flow (provider cards, add-from-preset, masked key entry, **main-process** test-connection probe, fetch-and-pick model import) **and** its composer model picker (per-conversation model + reasoning-effort submenu + capability badges), on navi's React + IPC + `safeStorage` stack.
- **One hard architectural constraint** (from navi's transport, not from Flue): navi drives Flue over the **loopback-HTTP SDK** (`client.agents.send(name, id, {message, signal})`), and `AgentPromptOptions` has **no per-prompt `model`/`thinkingLevel`**. So the active model and reasoning effort **cannot** ride the send call — both must be **store pointers** the `createAgent((ctx) => …)` factory reads per turn, exactly how the agent already resolves `cwd` from `ctx.id`.
- **Verified provider gotchas:**
  - z.ai ships **two presets**: `zai` (general, `https://api.z.ai/api/paas/v4`) and `zai-coding-plan` (`https://api.z.ai/api/coding/paas/v4`, what Kun ships). pi-ai's catalog defaults `zai` to the *coding-plan* path, against which a general pay-as-you-go key fails auth — so the general preset must override `baseUrl`.
  - The "Fetch models" probe URL is **not** `${base}/models`; it must use Kun's `versionedBaseUrl` normalizer (port `openai-compat-url.ts`), or DeepSeek 404s.
- **Secrets never enter the renderer.** The connection-freshness fingerprint is computed over **non-secret** fields only (`id, baseUrl, api, modelsHash, hasKey`) — *not* over the API key the way Kun does (Kun stores keys in plaintext; navi keeps them as `safeStorage` ciphertext in main).

---

## 1. How navi works today (single provider)

navi is an Electron app whose AI backend is a Flue-generated Node server (`dist/server.mjs`) spawned as a loopback HTTP child of the main process. There is exactly **one** provider and **one** pinned model.

### Single source of truth — `src/shared/flue.ts`
- `MODEL_NAME = 'gpt-5.4-nano-2026-03-17'` — provider-local model id.
- `` MODEL_ID = `openai/${MODEL_NAME}` `` — the `<provider>/<model>` specifier; the `openai/` prefix is **hardcoded** (line 13).
- `MODEL_LABEL = 'GPT-5.4 nano'` — rendered by the composer chip.
- `FlueStatus { ready, hasApiKey, baseUrl?, error? }` — single-provider shaped. `FlueUsage` carries `costUsd?` and is forwarded on terminal stream events (relevant to §5 cost quirk).
- `FlueBridge` — the IPC contract; `setApiKey(key)`, `setBaseUrl(url)` are single-value.

### Provider registration — `.flue/app.ts` (the ONLY `registerProvider` call)
```ts
const openaiBaseUrl = process.env.OPENAI_BASE_URL?.trim() || undefined
registerProvider('openai', {
  api: 'openai-completions',
  ...(openaiBaseUrl ? { baseUrl: openaiBaseUrl } : {}),
  models: { [MODEL_NAME]: { contextWindow: 400_000, maxTokens: 128_000 } },
})
```
Runs at child **module load**. The key is **not** passed here — pi-ai reads `OPENAI_API_KEY` from the child env at call time.

### Agent model binding — `.flue/agents/navi-assistant.ts`
`createAgent((ctx) => {…})` runs **per interaction** — `@flue/runtime/docs/api/agent-api.md:195`: the initializer "runs whenever the runtime … prepares an addressable agent interaction. Do not treat it as a one-time constructor." It already reads `ctx.env.NAVI_CONVERSATIONS_PATH`, resolves the bound project folder via `resolveProjectCwd(store, ctx.id)`, and returns `{ model: MODEL_ID, … }` in both branches. **This `ctx.id` + store lookup is the seam we reuse for model + reasoning selection.**

### Key / base-URL flow + storage
- `src/main/settings.ts` — `StoredSettings { apiKeyEnc?, baseUrl? }` in `navi-settings.json` (userData, mode `0600`). Key encrypted with `safeStorage`; base URL plaintext. `getApiKey()` (lines 47-62) and `getBaseUrl()` are **env-first** then stored. Note: when `safeStorage` can't decrypt, `getApiKey` returns `undefined` *silently* — a degradation we must fix per-provider (§7-F8).
- `src/main/flue-backend.ts` `doStart()` (lines 82-121) — builds a **fresh local `env` object** each call: `{ ...process.env, ELECTRON_RUN_AS_NODE, PORT:'0', FLUE_TOKEN, FLUE_DB_PATH, NAVI_CONVERSATIONS_PATH }`, then `if (apiKey) env.OPENAI_API_KEY = apiKey; else delete env.OPENAI_API_KEY` (and same for `OPENAI_BASE_URL`). It does **not** mutate the main process's `process.env`. Generates a per-launch bearer token, `PORT=0`. `send()` hardcodes `'No OpenAI API key configured.'`; `this.hasKey` is a single boolean. `registerProvider` runs only at module load, so **every settings change restarts the child** (`refreshApiKey`/`setBaseUrl` → `restart`). `stop()` (lines 158-176) aborts in-flight prompts.
- `src/main/ipc.ts` — `flue:setApiKey`, `flue:setBaseUrl` handlers. `src/main/preload.ts` bridges them onto `window.navi.flue`.

### Renderer
- `src/renderer/flue/useNaviChat.ts` — owns thread state, `setApiKey`/`setBaseUrl`, conversation list/selection, project binding. `status` is `FlueStatus`.
- `src/renderer/flue/NaviChatContext.tsx` — splits state into a **thread** context (re-renders per token) and a **list** context (re-renders on list changes).
- `src/renderer/components/ApiKeyBanner.tsx` — single password input + optional base-URL input, hardcoded OpenAI copy; used by `home.tsx` in `onboard` and `settings` modes.
- `src/renderer/components/Composer.tsx` — renders `MODEL_LABEL` as a **static, non-interactive** `model-chip` button (line 66) with a `ChevronDown`. Comment: "echoing Kun's chat composer" — **the model-picker hook already exists here.**
- `src/renderer/routes/home.tsx` / `TopBar.tsx` — gear opens the settings banner via `showSettings`.
- `src/main/conversations.ts` — `navi-conversations.json` with `projects[]` + `conversations[]`. **`ConversationRecord extends ConversationMeta { messages }`** (line 21-23). All mutations serialized through `enqueue()` (line 116). `saveConversation` (lines 200-238) **mutates the existing record in place** (lines 219-223) and **constructs a fresh literal** for new conversations (lines 225-232). `read()` migrates in memory only, never writes (lines 71-93); the `as Partial<Store>` cast does **not** strip extra runtime fields. **This is where the per-conversation pointers belong.**

### Build glue (unaffected)
`scripts/patch-flue-server.mjs` (host/port patch, pinned to beta.2 codegen, fails loud on change), `flue.config.ts`, `.flue/db.ts` are provider-agnostic — **no changes**.

### Confirmed constraints from the installed packages
- `@flue/runtime/docs/api/provider-api.md` — `HttpProviderRegistration { api?, baseUrl?, apiKey?, headers?, contextWindow?, maxTokens?, models?, storeResponses? }`. Catalog ids hydrate from catalog + your overrides; per-model `contextWindow`/`maxTokens` **override** catalog values. **Non-catalog ids must supply `api` AND `baseUrl` or throw `ProviderRegistrationError`**. Each call replaces the previous registration for that id.
- `@flue/runtime/docs/guide/models.md` — specifier is `<providerId>/<modelId>`; built-in catalog providers need no registration, just credentials.
- `@flue/sdk/dist/index.d.mts` — `AgentPromptOptions { message; images?; signal? }`. **No per-prompt `model` or `thinkingLevel`.** (The in-process `session.prompt()` *does* take a per-op `model` per agent-api.md:428, but navi can't reach it over the HTTP SDK — so the store-pointer approach is forced by navi's **transport choice**, not by Flue.)
- pi-ai catalog (`@earendil-works/pi-ai@0.79.8`, `dist/models.generated.js`): `deepseek` → `baseUrl https://api.deepseek.com`, `api openai-completions`, models `deepseek-v4-flash`/`deepseek-v4-pro` (`deepseek-v4-pro`: ctx 1,000,000 / maxTokens 384,000), compat `requiresReasoningContentOnAssistantMessages:true` + `thinkingFormat:'deepseek'`. `zai` → `baseUrl https://api.z.ai/api/coding/paas/v4`, `api openai-completions`, models `glm-4.5-air`/`glm-4.7`/`glm-5-turbo`/`glm-5.1`/`glm-5.2` (ctx 1,000,000 / maxTokens 131,072, `supportsReasoningEffort:true`)/`glm-5v-turbo` (vision), compat `supportsDeveloperRole:false` + `thinkingFormat:'zai'`; **all cost fields are 0**. Env-var map (`dist/env-api-keys.js`): `deepseek→DEEPSEEK_API_KEY`, `zai→ZAI_API_KEY`, `zai-coding-cn→ZAI_CODING_CN_API_KEY`.

---

## 2. What to borrow from Kun (and what to drop)

**Borrow:**
1. **Data-driven catalog, one runtime, no per-provider code path.** A provider is fully described by data `(id, name, baseUrl, api, models)`. navi is even simpler than Kun: Flue's single client already speaks `openai-completions`, so navi only loops `registerProvider`.
2. **Two-tier model: "what exists" vs "what's selected."** Kun stores profiles in `settings.provider.providers[]` and the active selection as a **global** pointer (`agents.kun.providerId`/`.model`/reasoning). navi maps profiles into `navi-settings.json` but makes selection **per-conversation** in `navi-conversations.json` (decision above), resolved inside `createAgent`.
3. **Run the credential-bearing probe in MAIN, never the renderer** (`../kun/src/main/provider-connection.ts`). Key stays out of the renderer and CORS doesn't apply — critical because navi's renderer CSP forbids loopback/cross-origin fetches.
4. **Fetch-then-pick model import, never dump the catalog** (`../kun/.../provider-model-import-dialog.tsx`). The probe returns model ids; show a dialog that searches/pre-selects *new* ids.
5. **Draft-before-commit** for new providers — a half-configured provider is never persisted.
6. **Connection fingerprint** to gate Test/Fetch result freshness after edits — **but over non-secret fields only** (see §7-F2; Kun's includes the raw key, which navi must not do).
7. **Composer picker** grouped by provider, with **reasoning-effort submenu** + **vision/text capability badges** + a "configure providers" empty state (`../kun/.../chat/FloatingComposerModelPicker.tsx`: `composerModel`/`composerProviderId`, `composerReasoningEffort` default `'max'`, `ModelCapabilityBadge`).
8. **Self-heal known-provider metadata** from a static preset catalog so older saves with empty model lists recover.

**Deliberately drop** (sensible local-app adaptation): Kun's `endpointFormat`/`requestProtocol` reasoning-*protocol* machinery (Flue + pi-ai own the wire protocol + `thinkingFormat` via catalog compat flags — navi only passes Flue's `thinkingLevel`); the subscription-vs-API grouping; token-plan `-token-plan` provider variants; media-capability blocks beyond a vision badge; **plaintext key storage** (navi keeps `safeStorage`). Keep a small static **preset catalog** so "Add provider" offers DeepSeek / z.ai (×2) / OpenAI one-click.

---

## 3. Proposed architecture

### 3.1 Provider/model data model — new shared types in `src/shared/flue.ts`
Replace the three single-model constants with a catalog + profile shape. Keep `AGENT_NAME`. Keep `MODEL_*` only as a transitional default during migration, then remove (Phase 5).

```ts
export interface ProviderPreset {
  id: string            // pi-ai/Flue providerId, e.g. 'deepseek', 'zai', 'zai-coding-plan', 'openai'
  name: string          // display name
  catalog: boolean      // true => Flue catalog id (api/baseUrl optional)
  api?: string          // required only when catalog === false; else 'openai-completions'
  defaultBaseUrl?: string  // probe + display + override default
  apiKeyEnv: string     // env var pi-ai reads, e.g. 'DEEPSEEK_API_KEY'
  defaultModels: ProviderModel[]
  apiKeyUrl?: string    // "get a key" link  (web-verify before shipping)
}

export interface ProviderModel {
  id: string            // provider-local model id, e.g. 'glm-5.2'
  label?: string
  vision?: boolean      // drives the capability badge; from preset/catalog, default false
  contextWindow?: number  // OMIT for catalog models — see §7-F5
  maxTokens?: number      // OMIT for catalog models — see §7-F5
}

export interface ProviderProfile {
  id: string            // providerId; validate to /^[a-z0-9-]+$/ (no '_' or '.', reject '/') — see §7-F9
  name: string
  api: string           // 'openai-completions' for all targets
  baseUrl?: string      // undefined => catalog/default
  models: ProviderModel[]
  headers?: Record<string, string>
  // apiKey is NOT here — it lives encrypted in main settings, keyed by id.
}

/** Flue reasoning levels (per docs). pi-ai maps these per-provider via thinkingFormat. */
export type ReasoningLevel = 'off' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh'

export interface ProviderStatus {
  id: string
  name: string
  keyState: 'ok' | 'absent' | 'unreadable'   // 'unreadable' = stored but safeStorage can't decrypt (§7-F8)
  baseUrl?: string
}

export interface FlueStatus {
  ready: boolean
  providers: ProviderStatus[]
  active?: { providerId: string; modelId: string; label: string; reasoning: ReasoningLevel }
  error?: string
}

/** Renderer-safe freshness fingerprint — NO secret. (§7-F2) */
export type ProviderFingerprint = string  // = [id, baseUrl ?? '', api, modelsHash, hasKey].join('\0')

export type ProbeResult =
  | { ok: true; latencyMs: number; modelIds: string[] }
  | { ok: false; message: string }
```

### 3.2 Where things are stored

| Datum | Location | Notes |
| --- | --- | --- |
| Provider profiles (`ProviderProfile[]`) | `navi-settings.json` (main) | Non-secret; plaintext. |
| Per-provider API key | `navi-settings.json` as `providerKeys: { [id]: apiKeyEnc }` | `safeStorage`-encrypted **per provider**. |
| Active provider+model+reasoning for a conversation | `navi-conversations.json`: new `providerId?`/`modelId?`/`reasoning?` on `ConversationRecord` | App-owned, like the project binding. Resolved by `ctx.id`. |
| App default selection (new conversations) | `navi-settings.json` `defaultSelection: { providerId, modelId, reasoning }` | User-facing source of truth; injected as `NAVI_DEFAULT_MODEL` (+ `NAVI_DEFAULT_REASONING`) by `flue-backend` so the agent has a single read path (§7-F10). |

`src/main/settings.ts` reshaped:
```ts
interface StoredSettings {
  providers?: ProviderProfile[]
  providerKeys?: Record<string, string>   // id -> base64 safeStorage ciphertext
  defaultSelection?: { providerId: string; modelId: string; reasoning: ReasoningLevel }
  // legacy: apiKeyEnc?, baseUrl?  (migrated on first read — Phase 0)
}
```
New main helpers: `listProviders()`, `upsertProvider(profile)`, `deleteProvider(id)`, `setProviderKey(id, key)`, `getDefaultSelection()`, `setDefaultSelection(sel)`, and a **discriminated** key reader:
```ts
// env-first per provider, then safeStorage. Distinguishes "no key" from "stored but unreadable" (§7-F8).
function getProviderKey(id): { state: 'ok'; key: string } | { state: 'absent' } | { state: 'unreadable' }
```

### 3.3 Registration flow into Flue — `.flue/app.ts`
Register **all** configured providers at boot. The child can't call Electron, so `flue-backend` writes two `0600` temp files under userData and injects only their **paths**: the profile array (no keys) as `NAVI_PROVIDERS_PATH`, and a `{ [id]: key }` map as `NAVI_PROVIDER_KEYS_PATH`. This mirrors how `FLUE_DB_PATH`/`NAVI_CONVERSATIONS_PATH` are already path-injected. (Avoids a large env var / the ~32 KB Windows env-block limit; rewritten cleanly each `doStart`. Note: there is **no** stale-`process.env` leak today — `doStart` builds a fresh local `env` object and never mutates `process.env` — so the file is for size/cleanliness, not to fix a leak.)

> **Why a keys file instead of per-provider key env vars (§7-F4):** pi-ai's env-var fallback (`getEnvApiKey`) only resolves keys for **catalog** ids it knows (`openai`/`deepseek`/`zai`). A **non-catalog** id (`zai-coding-plan`, any Custom provider) would be **silently unauthenticated** if we relied on an env var pi-ai never reads. Passing `apiKey` into `registerProvider(id, { apiKey })` works uniformly for every provider (`getRegisteredApiKey` returns it before any env fallback), so we source every key from the keys file. Bonus: this also makes shell-inherited `OPENAI_API_KEY`/`DEEPSEEK_API_KEY` irrelevant (no env fallback is ever hit), closing the leak F4 guarded against. Keys are still resolved **env-first in main** by `getProviderKey` (preserving the dev-override), so the value written to the file already honors a dev's shell override.

```ts
import { readFileSync } from 'fs'
import { registerProvider } from '@flue/runtime'

interface NaviProvider {
  id: string; api?: string; baseUrl?: string
  models: { id: string; contextWindow?: number; maxTokens?: number }[]
  headers?: Record<string, string>
}

const path = process.env.NAVI_PROVIDERS_PATH
const providers: NaviProvider[] = path ? JSON.parse(readFileSync(path, 'utf8')) : []
const keysPath = process.env.NAVI_PROVIDER_KEYS_PATH
const keys: Record<string, string> = keysPath ? JSON.parse(readFileSync(keysPath, 'utf8')) : {}

if (providers.length === 0) {
  // Legacy / pre-migration fallback — preserves today's exact behavior. MUST keep api:'openai-completions'.
  const openaiBaseUrl = process.env.OPENAI_BASE_URL?.trim() || undefined
  registerProvider('openai', {
    api: 'openai-completions',
    ...(openaiBaseUrl ? { baseUrl: openaiBaseUrl } : {}),
    models: { [MODEL_NAME]: { contextWindow: 400_000, maxTokens: 128_000 } },
  })
} else {
  for (const p of providers) {
    // INVARIANT (§7-F5): for catalog ids, omit contextWindow/maxTokens entirely so the
    // catalog's real values win. Only the 'openai' pinned snapshot supplies them.
    const models = Object.fromEntries(
      p.models
        .filter((m) => m.contextWindow || m.maxTokens)
        .map((m) => [m.id, {
          ...(m.contextWindow ? { contextWindow: m.contextWindow } : {}),
          ...(m.maxTokens ? { maxTokens: m.maxTokens } : {}),
        }]),
    )
    registerProvider(p.id, {
      ...(p.api ? { api: p.api } : {}),           // openai MUST carry api:'openai-completions' (§7-F3)
      ...(p.baseUrl ? { baseUrl: p.baseUrl } : {}),
      ...(p.headers ? { headers: p.headers } : {}),
      ...(keys[p.id] ? { apiKey: keys[p.id] } : {}),   // explicit key — required for non-catalog ids (§7-F4)
      ...(Object.keys(models).length ? { models } : {}),
    })
  }
}
```
For catalog ids, `registerProvider(id, {})` is technically optional per Flue docs — we still loop to keep OpenAI's `api` override, apply per-provider `baseUrl`/`headers` overrides, and pass the explicit `apiKey` (mandatory for non-catalog ids; see the keys-file note above and §7-F4).

### 3.4 Per-conversation model + reasoning resolution — `.flue/agents/navi-assistant.ts`
Forced by navi's HTTP transport (§1). Resolve both pointers from `ctx.id` + the store, like `cwd`. The factory **re-runs per turn** (agent-api.md:195), so a switch takes effect next turn with **no restart**.

```ts
function activeSelectionFor(id: string, storePath: string | undefined):
  { model?: string; reasoning?: ReasoningLevel } {
  if (!storePath) return {}
  try {
    const store = JSON.parse(readFileSync(storePath, 'utf8'))
    const conv = store.conversations?.find((c: { id: string }) => c.id === id)
    if (conv?.providerId && conv?.modelId)
      return { model: `${conv.providerId}/${conv.modelId}`, reasoning: conv.reasoning }
  } catch { /* fall through to env default */ }
  return {}
}

export default createAgent((ctx) => {
  const sel = activeSelectionFor(ctx.id, ctx.env.NAVI_CONVERSATIONS_PATH)
  const model = sel.model ?? ctx.env.NAVI_DEFAULT_MODEL ?? DEFAULT_MODEL_ID
  const thinkingLevel = sel.reasoning ?? ctx.env.NAVI_DEFAULT_REASONING ?? 'medium'
  const cwd = projectCwdFor(ctx.id, ctx.env.NAVI_CONVERSATIONS_PATH)
  // ...existing instructions/cwd branches; return { model, thinkingLevel, ... }
})
```
> Flue defaults `thinkingLevel` to `medium` when unset, so today's OpenAI agent already runs at medium — making the level explicit is not a regression. pi-ai maps the level per-provider via `thinkingFormat` (e.g. deepseek `medium`→null).

### 3.5 Restart semantics + the switch/restart race
- **Add / edit / delete a provider, or change a key / baseUrl** → restart the child (registerProvider is boot-only). Reuses `flueBackend.restart()`.
- **Switch the active model or reasoning for a conversation** → write the pointer; **no restart** (agent re-reads next turn).
- **Race (§7-F7):** a provider edit (restart) can interleave with a model switch or a streaming turn. `restart()`'s `stop()` aborts in-flight prompts. So: `setActiveModel`/`setReasoning` must be no-ops while the backend is restarting (check `flueBackend.ready` / await `start()`), and the composer must show a **"reconnecting…"** state during a provider-change restart. A provider edit mid-stream cancels the turn (already true via `stop()`); surface that instead of the bare "backend is not ready".

---

## 4. UI/UX — replicate Kun's provider UX in navi

Target = Kun's flow. **Five surfaces**, mapped component-by-component.

### 4.1 Screens
1. **Settings → Providers (master/detail).** Opened from `TopBar` gear. Left: provider cards (name, key-state dot: ok / needs-key / **unreadable**, model count). Top: an **"Add provider"** dropdown listing presets (DeepSeek, Z.ai (GLM), Z.ai (Coding Plan), OpenAI) + "Custom…". Right: detail pane for the selected/draft provider.
2. **Add/Edit provider detail.** Fields: name; id (locked for presets, `[a-z0-9-]` validated for custom); base URL (pre-filled from preset, blank = catalog default); `api` (locked to `openai-completions` for presets); **API key** via masked `SecretInput`; **Test connection**; a **Models** section with **"Fetch models"** + per-model list (with vision/text badge). Draft-before-commit; committing the first keyed provider sets it as `defaultSelection`.
3. **API-key entry.** `SecretInput` (password + reveal). Key → main, encrypted, never echoed. Placeholder hints `apiKeyUrl`.
4. **Test-connection + model-import dialog.** "Test connection" → MAIN probe (`provider:probe`, mode `'test'`). "Fetch models" → mode `'fetch'`; returned ids open a `ProviderModelImportDialog` (search, pre-select *new* ids, confirm-merge into `models[]`). Freshness gated by the **non-secret** `ProviderFingerprint`.
5. **Composer model picker** (`FloatingModelPicker`, full Kun parity). Replaces the static `MODEL_LABEL` chip. Provider-grouped popover; each row shows a **vision/text capability badge**; a **reasoning-effort submenu** (off/minimal/low/medium/high/xhigh); chip renders `modelLabel / reasoning` (e.g. `GLM-5.2 / high`); a "Configure providers…" empty state when none are keyed. Selecting **writes `{providerId, modelId}`**, and changing effort **writes `reasoning`**, onto the current conversation (no restart).

### 4.2 Component-by-component mapping (Kun → navi)

| Kun component / file | navi target (create or change) | Notes |
| --- | --- | --- |
| `settings-section-providers.tsx` (master/detail, add-from-preset, draft, Test/Fetch) | **NEW** `src/renderer/components/providers/ProvidersSettings.tsx` | Drop subscription grouping. Replaces `ApiKeyBanner` as the settings surface. **Fingerprint over non-secret fields only (§7-F2).** |
| `provider-model-import-dialog.tsx` | **NEW** `src/renderer/components/providers/ProviderModelImportDialog.tsx` | Search / pre-select-new / confirm-merge. Skip Kun's kind classification — just dedupe + set `vision` if known. |
| `settings-section-provider-models.tsx` + `provider-model-editor.ts` | **NEW** `src/renderer/components/providers/ProviderModels.tsx` (+ `providerModelForm.ts`) | List/add/edit/delete models; context-window/max-tokens fields (only meaningful for non-catalog/unknown snapshots). |
| `chat/FloatingComposerModelPicker.tsx` (incl. `ModelCapabilityBadge`, reasoning submenu) | **NEW** `src/renderer/components/FloatingModelPicker.tsx` + `ModelCapabilityBadge.tsx`; **CHANGE** `src/renderer/components/Composer.tsx` (replace static chip line 66; add `active`, `onPickModel`, `onPickReasoning` props) | Provider-grouped; badges; reasoning submenu; empty state opens `ProvidersSettings`. |
| `src/main/provider-connection.ts` + **`../kun/src/shared/openai-compat-url.ts`** (`upstreamOpenAiModelsUrl`, `versionedBaseUrl`) | **NEW** `src/main/provider-probe.ts` + **NEW** `src/shared/openai-compat-url.ts` (port verbatim) | Probe in MAIN; key never crosses to renderer. **Build the models URL via `upstreamOpenAiModelsUrl` — not `${base}/models` (§7-F6).** `Authorization: Bearer`, 10s `AbortSignal.timeout`, parse `{data:[{id}]}`, return first ~300 chars of any error body. |
| `src/main/upstream-models.ts` (composer pick list) | folded into renderer state from `FlueStatus.providers[].models` | Composer list = configured models per provider; no separate network call. |
| `src/shared/model-provider-presets.ts` | **NEW** `src/shared/provider-presets.ts` (`PROVIDER_PRESETS`) | Four presets (§5). |
| `src/shared/app-settings-provider.ts` (`resolveKunRuntimeSettings`) | split: **CHANGE** `src/main/settings.ts` (storage + key resolution) + `.flue/agents/navi-assistant.ts` (`activeSelectionFor`) | navi has no in-process runtime — resolution is the agent factory. |
| `register-app-ipc-handlers.ts` / `src/preload/index.ts` | **CHANGE** `src/main/ipc.ts` + `src/main/preload.ts` | New channels/bridge (§4.3). |
| Kun `SecretInput` | **NEW** `src/renderer/components/providers/SecretInput.tsx` | Masked input + reveal toggle. |

### 4.3 IPC + bridge changes
`FlueBridge` + `src/main/preload.ts` add: `listProviders()`, `upsertProvider(profile, apiKey?)` (→ write + restart), `deleteProvider(id)` (→ write + restart + cascade-clear pointers, §7-F1), `probeProvider({id?, baseUrl?, api, apiKey, mode})` (→ MAIN), `setActiveModel(conversationId, providerId, modelId)` (→ store, no restart), `setReasoning(conversationId, level)` (→ store, no restart), `setDefaultSelection(providerId, modelId, reasoning)`. Matching `ipcMain.handle` channels in `src/main/ipc.ts`. Keep `flue:setApiKey`/`flue:setBaseUrl` as thin `openai`-provider aliases during migration, then remove (Phase 5).

### 4.4 Renderer state (`useNaviChat.ts` / `NaviChatContext.tsx`)
- `useNaviChat` gains `providers` state, provider CRUD + probe wrappers, `setActiveModel`/`setReasoning` (write the current conversation's pointers; optimistic `status.active`), and reads the active selection on `selectConversation`.
- `status` becomes the new `FlueStatus`. `home.tsx` `composerDisabled` ⟸ "≥1 provider keyed AND a model selected".
- Put provider CRUD + probe in the **list** context (infrequent); put `setActiveModel`/`setReasoning`/`active` in the **thread** context (changes the chip). Update both `useMemo` dependency arrays in `NaviChatContext.tsx`.

### 4.5 Onboarding & empty states
- First run, no providers: hero shows "Connect a provider" → opens `ProvidersSettings` (replaces the OpenAI-only `ApiKeyBanner`). Composer disabled with "Add a provider to start chatting…".
- Composer picker with no keyed providers shows the "no providers configured" prompt + "Configure providers" button.

---

## 5. Concrete provider configs

All use Flue's `openai-completions`. `deepseek`/`zai` are pi-ai **catalog ids** (api/baseUrl optional). Keys via env-var fallback. **Probe URLs are built by `upstreamOpenAiModelsUrl(baseUrl)`** (port of Kun's normalizer): it appends `v1` only when the base's last segment isn't `v\d+`/`beta`, then appends `models`.

### DeepSeek  *(web-verified 2026-06-21)*
- providerId `deepseek` (catalog). baseUrl `https://api.deepseek.com`. api `openai-completions`. env `DEEPSEEK_API_KEY`. Specifier `deepseek/deepseek-v4-pro`.
- Models: **`deepseek-v4-pro`** (default), `deepseek-v4-flash`. ⚠️ Legacy `deepseek-chat`/`deepseek-reasoner` are **deprecated 2026-07-24** — the V4 ids are correct/future-proof.
- pi-ai-handled quirks: `requiresReasoningContentOnAssistantMessages:true`, `thinkingFormat:'deepseek'`.
- Probe URL = `upstreamOpenAiModelsUrl('https://api.deepseek.com')` → `https://api.deepseek.com/v1/models` (the normalizer adds `v1`; a naive `${base}/models` would 404 — §7-F6).

### Z.ai (GLM) — general  *(web-verified 2026-06-21)*
- providerId `zai` (catalog). **baseUrl default `https://api.z.ai/api/paas/v4`** (general API). ⚠️ pi-ai's catalog default is the *coding-plan* path; a general key fails there, so this preset **overrides** `baseUrl`. api `openai-completions`. env `ZAI_API_KEY`. Specifier `zai/glm-5.2`.
- Models: **`glm-5.2`** (default, `supportsReasoningEffort`), `glm-5.1`, `glm-5-turbo`, `glm-4.7`, `glm-4.5-air`, `glm-5v-turbo` (**vision badge**).
- pi-ai-handled quirks: `supportsDeveloperRole:false`, `thinkingFormat:'zai'`.
- Probe URL = `…/api/paas/v4/models` (`v4` matches `v\d+`, so no `v1` added). ⚠️ Web-verify the general-paas models endpoint before shipping (§7-F6 / open task).

### Z.ai (Coding Plan) — Kun-exact
- providerId `zai-coding-plan` (custom id; **must supply `api:'openai-completions'` + `baseUrl`** since it's not a catalog id, **and its key must be passed via `registerProvider(apiKey)`** — pi-ai has no env fallback for it, §7-F4). baseUrl `https://api.z.ai/api/coding/paas/v4`. Key stored under `providerKeys['zai-coding-plan']` — a **distinct** entry from `zai`, so a user can hold a general key and a coding-plan key at once with no collision. Same model list as `zai`. This is the preset Kun ships; included so coding-plan subscribers get one-click parity. ⚠️ A known integration bug elsewhere appends a spurious `/v1` to this `/v4` base → 404; Kun's `versionedBaseUrl` (§7-F6) correctly preserves `v4`.
- (China mainland alt, optional: `zai-coding-cn`, `https://open.bigmodel.cn/api/coding/paas/v4`, env `ZAI_CODING_CN_API_KEY`.)

### OpenAI (existing default, preserved)
- providerId `openai` (catalog). baseUrl `https://api.openai.com` (overridable for any OpenAI-compatible gateway). **MUST pass `api:'openai-completions'`** to force Chat Completions over the catalog Responses default (§7-F3). env `OPENAI_API_KEY`. Pinned `gpt-5.4-nano-2026-03-17` supplies `{ contextWindow: 400_000, maxTokens: 128_000 }` (catalog lacks the dated id — this is the **only** profile that sets these).

### Custom
Must supply `api: 'openai-completions'` + `baseUrl` or `registerProvider` throws. Validate/lowercase ids to `[a-z0-9-]`; a typo of a catalog id (`z-ai`, `zhipu`) becomes a non-catalog id and throws.

> **Cost-display quirk (M1):** all GLM catalog `cost` fields are `0`, and `FlueUsage.costUsd` is already forwarded to the renderer on terminal events. navi ships no cost UI, so this is inert today — but if any cost UI is ever added, GLM will read `$0`. Documented, not dismissed.

---

## 6. Phased implementation

Each phase ships independently; the build chain and `patch-flue-server.mjs` are untouched.

**Phase 0 — settings reshape + migration + presets (main only).** Reshape `StoredSettings`; add provider CRUD + `getProviderKey` (discriminated) + `getDefaultSelection`. `provider-presets.ts` with the four presets. Migrate legacy `{ apiKeyEnc, baseUrl }`: on first read, if `providers` absent, seed an `openai` profile (**`api:'openai-completions'` hard-coded**; baseUrl from legacy; models = pinned snapshot), move `apiKeyEnc` → `providerKeys.openai` **verbatim (no re-encrypt)**, set `defaultSelection`. Idempotent; **write-on-next-save**. *Tests:* migration correctness; **every `catalog:true` preset's `defaultModels[].id` exists in `models.generated.js`** (M2).

**Phase 1 — backend multi-provider registration (behavior unchanged for existing users).** `provider-probe.ts`'s sibling: write the providers file + inject `NAVI_PROVIDERS_PATH`, `NAVI_DEFAULT_MODEL`, `NAVI_DEFAULT_REASONING`, and per-provider key vars in `doStart()`; **delete all known key vars first, then inject configured ones** (§7-F4). Generalize `hasKey`/`send()` guard to "≥1 provider keyed." Rewrite `.flue/app.ts` (loop + empty-file single-openai fallback that keeps `api`). Extend `ConversationRecord` with `providerId?`/`modelId?`/`reasoning?`; add `setActiveModel`/`setReasoning` mutations **through `enqueue()`** and include them in the new-conversation push branch (§7-F1). Implement `activeSelectionFor` in `navi-assistant.ts`. *Test:* `registerProvider('deepseek', {models:{'deepseek-v4-pro':{}}})` still resolves the catalog's 1M window (§7-F5).

**Phase 2 — provider settings UI (Kun parity).** `SecretInput`, `ProvidersSettings` (master/detail + draft + **non-secret fingerprint**), `ProviderModels`. Wire `providers:*` IPC + bridge. Replace `ApiKeyBanner` usage in `home.tsx`. Restart-on-change + **reconnecting state** (§7-F7). Surface `keyState: 'unreadable'` (§7-F8).

**Phase 3 — test-connection + model import.** `src/shared/openai-compat-url.ts` (port) + `provider-probe.ts` + `provider:probe` IPC. "Test connection" + "Fetch models" buttons; `ProviderModelImportDialog`. **Web-verify the z.ai general-paas `/models` path** before relying on Fetch for `zai` (§7-F6).

**Phase 4 — composer picker (full parity).** `FloatingModelPicker` + `ModelCapabilityBadge`; change `Composer.tsx` to render it + accept `active`/`onPickModel`/`onPickReasoning`. `setActiveModel`/`setReasoning` write conversation pointers. **Renderer awaits the persistence before `send()` on a brand-new conversation** (§7-F-firstturn). Empty-state prompt. Plumb `FlueStatus.active` through `useNaviChat`/`NaviChatContext`.

**Phase 5 — cleanup.** Remove `MODEL_NAME`/`MODEL_ID`/`MODEL_LABEL` and `flue:setApiKey`/`flue:setBaseUrl` once unreferenced. Update `AGENTS.md` + memory docs.

---

## 7. Correctness fixes (must-implement; each verified against installed code)

- **F1 — Per-conversation pointers: type + push branch + cascade.** `saveConversation` mutates `existing` in place (conversations.ts:219-223), so pointers already on a record **survive** edits — *no clobber risk there.* The real work: (a) extend `ConversationRecord` with `providerId?`/`modelId?`/`reasoning?` (else `tsc` fails); (b) include the current selection in the **new-conversation push literal** (conversations.ts:225-232) so a first save persists it; (c) `setActiveModel`/`setReasoning` route through `enqueue()` like every other write; (d) on `deleteProvider`, **cascade-clear** pointers referencing it and reset `defaultSelection` if it pointed there (do it in a queued mutation; `migrate()` can also defensively null a pointer whose provider no longer exists).
- **F2 — Fingerprint must not contain the key.** Kun's `providerConnectionFingerprint` includes `apiKey` (it stores keys plaintext, `../kun/src/shared/model-provider-presets.ts:411`). navi keeps keys in main only, so the renderer fingerprint is `[id, baseUrl ?? '', api, modelsHash, hasKey].join('\0')` — `hasKey` from `FlueStatus`. Never hold the raw key in renderer state.
- **F3 — Pin OpenAI's wire protocol through migration.** The Phase-0 seed and the loop must emit `api:'openai-completions'` for `openai`, or the rebuilt registration falls back to the catalog **Responses** API and breaks the pinned `gpt-5.4-nano`. The empty-file fallback in `.flue/app.ts` also keeps it.
- **F4 — Keys reach the child via the keys file + explicit `apiKey`, not per-provider env vars.** pi-ai's `getEnvApiKey` only resolves keys for **catalog** ids, so a non-catalog id (`zai-coding-plan`, Custom) relying on an env var would be **silently unauthenticated**. Instead, `doStart` resolves each configured key via `getProviderKey(id)` (env-first → safeStorage), writes a `{ [id]: key }` map to a `0600` file, injects `NAVI_PROVIDER_KEYS_PATH`, and `.flue/app.ts` passes `apiKey` into `registerProvider` for every provider. Because an explicit `apiKey` short-circuits pi-ai's env fallback, this also makes shell-inherited `OPENAI_API_KEY`/`DEEPSEEK_API_KEY`/`ZAI_API_KEY` irrelevant — no leak. Defensively, still `delete` those known key vars from the spawned `env` so nothing in the child can read a stale one. Each provider's key is keyed by **profile id** (not a shared env-var name), so two z.ai profiles never collide.
- **F5 — Don't mask catalog context windows.** For catalog provider ids, the injected `models` map must **omit** `contextWindow`/`maxTokens` (the §3.3 loop filters them out) so the catalog's real values (deepseek-v4-pro 1M/384k, glm-5.2 1M/131k) win. Only the `openai` pinned snapshot supplies them. Phase-1 test asserts this.
- **F6 — Probe URL via the normalizer.** Port `../kun/src/shared/openai-compat-url.ts` (`versionedBaseUrl`+`upstreamOpenAiModelsUrl`) verbatim; the probe calls it. Naive `${base}/models` 404s for DeepSeek (`https://api.deepseek.com/models` is not the documented endpoint; `/v1/models` is). **Open task:** web-verify the z.ai *general* paas models endpoint; if unverifiable, ship `zai` with the catalog coding-plan base (Kun-exact) and let users edit.
- **F7 — Switch/restart race + reconnecting state.** `setActiveModel`/`setReasoning` are no-ops while restarting; show "reconnecting…" during a provider-change restart; a provider edit mid-stream cancels the turn (via `stop()`) — surface that, not the bare "backend is not ready."
- **F8 — safeStorage read-path degradation.** When `safeStorage.isEncryptionAvailable()` is false, `getProviderKey` must return `{state:'unreadable'}` for a stored-but-undecryptable key (not silently `undefined`), surfaced as `ProviderStatus.keyState='unreadable'` so the UI re-prompts rather than treating the provider as unkeyed. The **write** path (`setProviderKey`) must error rather than store plaintext.
- **F9 — Provider-id charset.** Validate custom ids to `/^[a-z0-9-]+$/` (no `_`, no `.`, reject `/`) so the `<providerId>/<modelId>` specifier never parses ambiguously.
- **F10 — Single default-model read path.** `doStart` reads `getDefaultSelection()` → injects `NAVI_DEFAULT_MODEL` (+ `NAVI_DEFAULT_REASONING`); the agent reads only the env var. `navi-settings.json`'s `defaultSelection` is the user-facing source; they never drift because the env var is derived from it each `doStart`.
- **F-firstturn — New-conversation ordering.** `read()` never writes, so a brand-new conversation has no pointer on disk until a mutation lands. The renderer must **await** `setActiveModel`/`setReasoning` **before** `send()` on a new conversation, or the first turn uses `NAVI_DEFAULT_MODEL`/`_REASONING` regardless of the composer pick.

---

## 8. Open questions

*(Resolved by product decision: selection is **per-conversation**; the composer ships the **reasoning submenu + capability badges**; z.ai ships **two presets**.)*

1. **z.ai general models endpoint (only real open item).** Both z.ai bases are confirmed OpenAI-compatible for `/chat/completions` (so chat works on the general base), but the `/models` *list* shape on `…/api/paas/v4` isn't documented. Confirm `https://api.z.ai/api/paas/v4/models` returns `{data:[{id}]}` before relying on "Fetch models" for the `zai` preset. The curated preset model list covers the common case regardless; fallback is to ship `zai` on the coding-plan base (Kun-exact) until verified. *(Resolve before Phase 3.)*
2. ~~`zai-coding-plan` key var~~ — **resolved:** keys are stored per **profile id** in `providerKeys` and passed via `registerProvider(apiKey)`, so the two z.ai profiles never collide (§7-F4).
3. **Restart latency UX** — is the "reconnecting…" state (F7) enough, or do we want optimistic local echo of the model/key change before the child is back?
4. **Include China `zai-coding-cn`** (open.bigmodel.cn) as a 5th preset, or leave it to "Custom…"?
5. **Pre-implementation web re-check** — model ids churn fast; re-verify current z.ai/DeepSeek ids and the list-models path right before coding. Treat the pi-ai catalog as a snapshot.

---

## Sources
- [Z.AI Developer Docs — Quick Start](https://docs.z.ai/devpack/quick-start)
- [Z.ai API Complete Guide — GLM Models, Pricing, Setup (2026)](https://www.aimadetools.com/blog/z-ai-api-complete-guide/)
- [zai-org/z-ai-sdk-python (official SDK)](https://github.com/zai-org/z-ai-sdk-python)
- [DeepSeek API Docs — Your First API Call](https://api-docs.deepseek.com/)
- [DeepSeek API Docs — List Models](https://api-docs.deepseek.com/api/list-models)
- [DeepSeek API Docs — Change Log (deepseek-chat/reasoner deprecation 2026-07-24)](https://api-docs.deepseek.com/updates)
- Installed packages: `@flue/runtime@1.0.0-beta.2` (`docs/api/provider-api.md`, `docs/api/agent-api.md:195/428`, `docs/guide/models.md`), `@flue/sdk@1.0.0-beta.1` (`dist/index.d.mts`), `@earendil-works/pi-ai@0.79.8` (`dist/models.generated.js`, `dist/env-api-keys.js`)
- Kun source: `../kun/src/main/provider-connection.ts`, `../kun/src/main/upstream-models.ts`, `../kun/src/shared/openai-compat-url.ts`, `../kun/src/shared/model-provider-presets.ts`, `../kun/src/renderer/src/components/settings-section-providers.tsx`, `…/provider-model-import-dialog.tsx`, `…/settings-section-provider-models.tsx`, `…/chat/FloatingComposerModelPicker.tsx`
- navi source verified: `src/main/conversations.ts:21-23,116,200-238`, `src/main/flue-backend.ts:82-121,158-176`, `src/main/settings.ts:47-62`, `src/shared/flue.ts`, `.flue/app.ts`, `.flue/agents/navi-assistant.ts`
