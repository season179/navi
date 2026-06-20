# Plan: Integrate Flue into Navi (agreed)

**Status**: **Implemented** — Phases 1–5 built and verified at the app-boot level (full vertical slice runs in Electron). The only step outstanding is the **live model round-trip (Gate 2)**, which needs an Anthropic API key; that is now enterable in-app via the Settings flow.
**Goal**: Turn Navi from a UI shell into a working AI chat app powered by [Flue](https://flueframework.com).
**Authors**: Converged plan by **Claude + pi**. Supersedes `integrate-flue-into-navi-by-cmd.md` (kept for history). Every API claim below was verified against the Flue docs, the Cloudflare/Flue blog, the `withastro/flue` repo (DeepWiki), and — for `node:sqlite` — empirically against the installed Electron.

---

## Update (2026-06-20) — Phase 0 findings & transport revision

Phase 0 surfaced one fact that the original transport assumption (decision #1 below) got wrong, and we revised accordingly. Per the plan's own rule — *"if a gate fails, revisit the decision, not patch around"* — this was taken back to the user, who chose the **thin 127.0.0.1 HTTP entry**.

**Finding (Gate 3).** Flue's generated `dist/server.mjs` **cannot** bind `127.0.0.1` as shipped. The serving block is emitted from a fixed codegen template in `@flue/cli` (`flue.js`, the `NodePlugin.generateEntryPoint`): it calls `@hono/node-server`'s `serve({ fetch, port, serverOptions })` with **no `hostname`** (so it binds `0.0.0.0` — every interface) and logs the **requested** `process.env.PORT` (so with `PORT=0` it can't report the OS-assigned ephemeral port). Neither is configurable via `flue.config.ts` (no host/port keys on the node target) nor via `.flue/app.ts` (which only supplies the Hono app, not the listener). `normalizeBuiltModules`/`getPackagedSkills` are *inline-only* in the generated bundle, so a fully hand-written entry would have to reproduce them **and** separately compile the agent `.ts` — more internal coupling than "thin," and it would drift **silently** on a Flue upgrade.

**Chosen transport (thin entry = app.ts gate + db.ts + a fail-loud post-build patch).** We keep 100% of Flue's correct bootstrap and change only the two things nothing else can reach:
- **`.flue/app.ts`** — a Hono app mirroring `createDefaultFlueApp()` (`app.route('/', flue())`) with a bearer-token middleware in front. `flue build` wires it in as `userApp` (it *owns the request pipeline*), so the token gate needs no generated-file edit. Requires `hono` as an explicit dep (pinned `^4.12.26`).
- **`.flue/db.ts`** — `export default sqlite(process.env.FLUE_DB_PATH || <in-memory>)`. `flue build` wires it in as `userPersistenceAdapter`, fully replacing the in-memory default.
- **`scripts/patch-flue-server.mjs`** — run by `build:flue` immediately after `flue build`. Anchored on the stable `serverOptions: { requestTimeout: 0 }` string, it injects `hostname: process.env.FLUE_HOST || "127.0.0.1"` and a `serve()` listening callback that prints `[flue] FLUE_READY {"host","port"}` with the **real bound port**. It is idempotent and **fails loudly** if the anchor is absent (a Flue codegen change surfaces here instead of silently regressing the bind). Pinned to `@flue/runtime@1.0.0-beta.2`.

**Ready-line correction.** The token is **generated in main** and passed to the child via the `FLUE_TOKEN` env var — the child does **not** report it. So the stdout ready-line is host+port only: `[flue] FLUE_READY {"host":"127.0.0.1","port":N}` (not the planned `{"ready":true,"port":N,"token":"…"}`).

**Gate status.** ✅ #1 deps/init · ⏳ #2 live agent response (needs API key — Settings flow built) · ✅ #3 serving contract (finding + patch above) · ✅ #4 child under `ELECTRON_RUN_AS_NODE=1` (boots as Node, `node:sqlite` works, no Electron-API probe) · ✅ #5 port handshake (`FLUE_READY` parsed by main; 20s timeout) · ⏳ #6 `flue dev` parity (dev path unchanged; not re-tested) · ✅ #7 `npm run build` unaffected · ✅ #8 file-backed sqlite (verified: `flue.db` + WAL created in `userData`).

**Verified end-to-end (no API key needed):** a standalone harness spawned the patched server under Electron's Node and confirmed loopback-only binding (lsof: `127.0.0.1:<eph> (LISTEN)`, no `0.0.0.0`/`*`), real ephemeral port via `FLUE_READY`, the token gate (401 / 401 / 200), and the on-disk db. Then the **full app** booted in Electron: main spawned the child (`Electron --no-warnings dist/server.mjs`, listening on `127.0.0.1:51512`), the renderer loaded, and `before-quit` tore the child down cleanly.

**New/changed files vs the layout in §2:** added `.flue/app.ts`, `.flue/db.ts`, `scripts/patch-flue-server.mjs`, `src/shared/flue.ts` (IPC contract), `src/main/settings.ts` (safeStorage), `src/renderer/flue/useNaviChat.ts`, `src/renderer/components/{ChatThread,ApiKeyBanner}.tsx`; `package.json` gained `hono` + a `build:flue` step prepended to `build`.

---

## 0. Verified facts (the plan rests on these)

**Navi codebase**
- Electron `^39.8.10` (Node **22.22.1**, modules 140), React 19, `@tanstack/react-router`, esbuild via 3 CLI calls in `package.json` (no bundler config).
- `src/main/main.ts`: creates one `BrowserWindow` (`contextIsolation: true`, `nodeIntegration: false`), loads `index.html`. No IPC yet.
- `src/main/preload.ts`: exposes only `window.navi.versions()`.
- `index.html` CSP: `default-src 'self'; style-src 'self' 'unsafe-inline'`. **A renderer→localhost `fetch` is blocked by this CSP** — confirms the renderer must go through an IPC bridge, never talk to Flue directly.
- `Composer.tsx` / `home.tsx`: visual-only, no message state, no send wiring.

**Flue API**
- `createAgent(() => ({ model, instructions, tools, skills, subagents, thinkingLevel, compaction }))` from `@flue/runtime`; default export of an agent module registers it. ✅
- In-process JS API (`ctx.init(agent)` → `harness.session()` → `session.prompt()`) is **workflow-context only** → a chat app consumes agents over **HTTP**. ✅
- `flue()` Hono middleware from `@flue/runtime/routing` is real. Routes: `POST /agents/:name/:id` (prompt → terminal `{text, usage, model}`), `GET /agents/:name/:id` (stream events via the **Durable Streams** protocol), plus `/workflows`, `/runs`. A user `app.ts` can wrap it with auth/middleware (`app.route('/', flue())`).
- `flue build --target node` emits `dist/server.mjs` (full entrypoint: manifest + agent registration + dispatch queues + persistence + `@hono/node-server`'s `serve`).
- Official client **`@flue/sdk`**: `createFlueClient({ baseUrl, token, headers, fetch })` → `client.agents.prompt(name, id, {message})`, `.send(...)`, `.stream(name, id, {offset, live})` (async iterator; `event.type === 'idle'` is terminal).
- `sqlite()` from `@flue/runtime/node` (added v0.10.0): `sqlite('./path.db')` file-backed or `sqlite()` in-memory; returns a `PersistenceAdapter` with `.migrate()`; lives in `db.ts`.
- Source discovery: `.flue/` → `src/` → project root (first match wins). **`.flue/agents/` is valid and takes precedence.**
- Model string `anthropic/claude-sonnet-4-6` is valid (`provider/id`).

**`node:sqlite` in this Electron — empirically tested (not assumed)**
```
ELECTRON_RUN_AS_NODE=1 electron -e "new (require('node:sqlite').DatabaseSync)(':memory:')"
→ works, no flag needed. Only emits a cosmetic ExperimentalWarning. Same with/without --experimental-sqlite.
```
→ **File-backed persistence is viable in v1.** (The flag gate was dropped in late Node 22.x; Electron 39 ships 22.22.1.) Suppress the warning by spawning the child with `--no-warnings` (not a global `removeAllListeners('warning')` — that would hide real warnings).

---

## 1. Architecture (decided)

**Renderer ↔ IPC ↔ Electron main ↔ (spawned child process running Flue) over loopback HTTP, consumed via `@flue/sdk`.**

```
┌────────────┐  IPC   ┌──────────────────┐  loopback HTTP   ┌─────────────────────┐
│  Renderer  │ ─────► │  Electron main    │ ───────────────► │ Flue server (child) │
│ (React)    │ ◄───── │  @flue/sdk client │ ◄─────────────── │ flue dev / server.mjs│
└────────────┘ events │  spawns + owns ↑  │  127.0.0.1:<eph> │  sqlite() persistence│
   no port/token         child lifecycle      Bearer <token>   ELECTRON_RUN_AS_NODE=1
```

**Two decisions, both jointly agreed:**

1. **Loopback port + bearer token (not no-port-embedded, not direct-renderer-fetch).**
   - Direct renderer fetch (cmd's option B): rejected — CSP blocks it and it breaks `contextIsolation`.
   - In-process `honoApp.fetch()` with a custom-`fetch` SDK client (the elegant "no open port" option): rejected — it requires reproducing Flue's runtime bootstrap (manifest, agent registration, dispatch queues) against an internal API that shifts between minor versions. The only thing it buys is closing a `127.0.0.1` port that's already gated by a per-launch 256-bit token. Bad trade for a personal app.
   - **Chosen:** Flue's blessed serving path on `127.0.0.1:<ephemeral>`, protected by a per-launch random bearer token (Hono middleware in `app.ts`). Main holds the `@flue/sdk` client; the renderer never sees the port or token. **⚠️ Revised in Phase 0 — see the "Update (2026-06-20)" section above:** the stock node server binds `0.0.0.0` with no host option and can't report an ephemeral port, so the `127.0.0.1` bind + real-port reporting come from a small fail-loud post-build patch (`scripts/patch-flue-server.mjs`); the token gate lives in `.flue/app.ts` as planned.

2. **Run Flue as a spawned child process (not embedded in main via `serve()`).**
   - Spawn with `ELECTRON_RUN_AS_NODE=1` so the child runs on **Electron's own Node 22.22.1** (so `node:sqlite` works in the child; no separate Node install).
   - Why child over embedded: teardown is `child.kill()`; crash isolation (a Flue panic can't take down the Electron main); and it **sidesteps esbuild entirely** — the child resolves `@flue/runtime` + `node:sqlite` from `node_modules` normally instead of fighting `--bundle` in `build:main`. Matches Flue's own Node model ("each agent runs as a long-lived process").

**Trust boundary:** renderer is the only untrusted-ish surface; it can call `navi.agent.*` but can never reach Flue, the token, or the port. Main is the sole `@flue/sdk` consumer.

---

## 2. Source layout

```
navi/
├── .flue/
│   ├── agents/navi-assistant.ts   # the chat agent (createAgent)
│   ├── app.ts                     # Hono: bearer-token middleware + app.route('/', flue())
│   └── db.ts                      # export default sqlite(<userData>/flue.db)
├── flue.config.ts                 # from `npx flue init --target node`
├── src/main/
│   ├── main.ts                    # whenReady → start backend → window; before-quit → teardown
│   ├── flue-backend.ts            # spawn/own child, parse ready-line, hold @flue/sdk client, restart policy
│   ├── ipc.ts                     # agent + config + status IPC handlers
│   └── preload.ts                 # contextBridge: navi.agent.*, navi.config.*, navi.onBackendStatus
└── src/renderer/                  # Composer wiring, message state, settings, status pill
```

`.flue/agents/navi-assistant.ts`:
```ts
import { createAgent } from '@flue/runtime'
export default createAgent(() => ({
  model: 'anthropic/claude-sonnet-4-6',
  instructions: [
    'You are Navi, an AI assistant inside a local-first desktop app.',
    'Be concise and helpful with writing, coding, analysis, and questions.',
  ].join('\n'),
}))
```
The API key is supplied to the **child** via env (read by main from `userData/config.json` before spawn) — the child has no Electron `app` to read `userData` itself.

---

## 3. Dependencies

| Package | Why | Type |
|---|---|---|
| `@flue/runtime` | Agent runtime + `flue()` routing + `sqlite()` | dependency |
| `@flue/sdk` | `createFlueClient` — main's only Flue consumer | dependency |
| `@flue/cli` | `flue init` / `flue dev` / `flue build` | devDependency |
| `@hono/node-server`, `hono` | Flue's server deps (resolved in the child) | (transitive; mark `--external` if main ever imports them) |

No native modules (`node:sqlite` is built in). esbuild's `build:main` is **unchanged** — Flue is never bundled into `main.js`; the child runs Flue from `node_modules`.

---

## 4. Phase 0 — Spike & de-risk (no UI changes). Each step is a GATE.

1. `npm i @flue/runtime @flue/sdk` ; `npm i -D @flue/cli` ; `npx flue init --target node`. Add `.flue/agents/navi-assistant.ts`.
2. **Agent responds:** `npx flue dev` standalone, send a prompt. Gate.
3. **Serving contract:** inspect `dist/server.mjs` from `flue build --target node`. Confirm we can (a) bind `127.0.0.1:0` and (b) add the bearer-token middleware via `.flue/app.ts`. Gate.
4. **Child spawn under `ELECTRON_RUN_AS_NODE=1`:** confirm the child boots as plain Node, can `require('node:sqlite')`, binds a port, and that **Flue's runtime does not probe for Electron APIs** (under `ELECTRON_RUN_AS_NODE`, `process.versions.electron` is set but there is no `app` object). Confirm the sqlite path (passed in via env from `app.getPath('userData')`) resolves. Gate.
5. **Port + token handoff — frozen contract:** *child chooses, child reports.* Child binds `:0`, prints exactly one line to **stdout**: `{"ready":true,"port":N,"token":"…"}`, then sends nothing else to stdout (all Flue logs → stderr → `userData/logs/flue.log`, truncated on start). Main reads stdout line-by-line until it parses `ready` (5–10s timeout → fatal error window). Gate.
6. **`flue dev` parity:** confirm `flue dev` can bind `127.0.0.1:0` and emit the same ready-line. If it can't, **wrap it in a shim** that reads `flue dev`'s port, injects the token, and re-emits the canonical JSON line — so dev and packaged share one handoff protocol. Gate.
7. **Build unaffected:** `npm run build` still succeeds with Flue installed (main does not import Flue's server). Gate.
8. **Persistence:** file-backed `sqlite(userData/flue.db)` as v1 default (accept the warning; child spawned with `--no-warnings`); `sqlite()` in-memory documented as fallback. Gate.

---

## 5. Implementation phases

### Phase 1 — Backend lifecycle in main (`flue-backend.ts`)
- `startBackend({ userDataPath, apiKey })`: spawn child (`ELECTRON_RUN_AS_NODE=1`, `--no-warnings`, env: `FLUE_DB_PATH`, `ANTHROPIC_API_KEY`, `FLUE_TOKEN` if main-assigned — else child generates). Parse the ready-line → `{ port, token }` → build `createFlueClient({ baseUrl: \`http://127.0.0.1:${port}\`, token })`.
- **Restart policy:** bounded backoff (≤5 attempts, 1s→2s→5s, then fatal window). **Regenerate the token on restart**; reject any in-flight prompt/stream cleanly (no hangs). Never infinite-restart (a bad key / corrupt db would hot-loop and peg CPU). Surface attempt count to the renderer.
- **Teardown** (`before-quit`): `SIGTERM` → wait ≤2s for clean exit (Flue flushes Durable Streams + closes sqlite) → `SIGKILL` fallback → `app.quit()`. Never fire-and-forget (SIGKILL on an unflushed sqlite write can corrupt the db).
- `main.ts`: `whenReady` → read `userData/config.json` → `startBackend` (try/catch → fatal error window if it never becomes ready) → `createWindow`. Push `navi:backend-status` (`starting|ready|restarting|dead`) over IPC — renderer never polls.

### Phase 2 — IPC bridge (non-streaming first)
- **preload** (`window.navi`): keep `versions()`; add `agent.prompt(sessionId, text)`, `config.getStatus()` (`{ ready, hasKey, model }`), `config.setKey(key)`, `onBackendStatus(cb)` (returns unsubscribe).
- **main handlers**: `agent:prompt` → `client.agents.prompt('navi-assistant', sessionId, { message: text })`. **Session id is generated in main** (a UUID per thread); there is no "create session" call — POSTing to a fresh id creates it, sqlite persists it. Map Flue errors to a typed taxonomy `{ error: 'no_key' | 'provider' | 'unknown', message }`.

### Phase 3 — React UI: working non-streaming chat
- `home.tsx`: `messages: {role,text}[]`, `sessionId` (per thread), `isLoading`, `error`. Send → push user msg → `await navi.agent.prompt` → push assistant msg / render error.
- `Composer.tsx`: wire send, clear on send, disable while loading, inline error. Model chip reads the real model from `config.getStatus()` (drop the hardcoded "GLM-5.2").
- **Settings (Phase 1 deliverable, not "future"):** API-key form → `config.setKey` writes `userData/config.json` (encrypt at rest via Electron `safeStorage`/Keychain) → main **restarts the child** to pick it up (restart-on-config-change reuses the Phase 1 restart path). A backend-status pill reflects `starting|ready|restarting|dead`.
- Thread list metadata (`id`, title from first message, `ts`) in `localStorage`.

### Phase 4 — Streaming (additive, batched)
- main: `client.agents.stream('navi-assistant', sessionId, { live: true })`; accumulate deltas and **flush to the renderer every ~30ms / ~8 tokens** via `event.sender.send('agent:delta', { sessionId, chunk })` — never one IPC per token. Emit `agent:done` / `agent:error`; terminate on `event.type === 'idle'`. Key streams by `sessionId → sender` (forward-compat for multi-window).
- preload: `agent.onDelta/onDone/onError(cb)` returning unsubscribers; renderer accumulates into the live assistant message.

### Phase 5 — Tests (each protects something real)
- **Child-process contract (the keystone test):** spawn the real child against a mock-provider agent → assert the ready-line parses → a prompt round-trips → `kill` frees the port within 2s. Catches any skipped Phase-0 gate in one integration test.
- **Agent contract:** `POST /agents/navi-assistant/:id` returns `{text, usage, model}` (mock provider).
- **IPC handlers:** inject a mock `@flue/sdk` client; assert arg→call→shape mapping and that `no_key`/`provider` map correctly.
- **Renderer:** mock `window.navi`; assert send→loading→message and error rendering.
- E2E (agent-browser) deferred until the app is stable.

### Phase 6 — Deferred
Multi-window stream routing (design already accommodates it), multi-agent selector, custom Electron tools via `defineTool` (clipboard/dialogs/notifications), subagents, Postgres adapter if cross-host sharing ever matters.

---

## 6. Risks & mitigations (updated)

| Risk | Likelihood | Mitigation |
|---|---|---|
| Flue runtime probes Electron APIs under `ELECTRON_RUN_AS_NODE` | Low–Med | Phase 0 gate #4; child runs as plain Node, userData passed via env |
| stdout handshake corrupted by Flue logging | Med | Reserve stdout for the single ready-line; all logs → stderr → file (Phase 0 #5) |
| `flue dev` won't bind `:0` / emit ready-line | Med | Shim it to the canonical protocol (Phase 0 #6) |
| Child hot-loops on bad key / corrupt db | Med | Bounded backoff + fatal window; never infinite-restart |
| sqlite corruption on quit | Low | SIGTERM→2s→SIGKILL ordering; never fire-and-forget |
| `node:sqlite` "experimental, may change" across Electron upgrades | Low | Re-run the Phase 0 sqlite probe on each Electron bump; in-memory fallback documented |
| API key missing in packaged app | Med | Settings UI (Phase 3) + `safeStorage` config file read by main pre-spawn |

---

## 7. What changed from cmd's draft (and why)

| cmd's draft | Agreed plan | Reason |
|---|---|---|
| Embed `flue()` in main via `serve()` | **Child process** (`ELECTRON_RUN_AS_NODE=1`) | Clean teardown, crash isolation, no esbuild fight over `@flue/runtime`+`node:sqlite` |
| Hand-rolled `fetch` + fake "session create handshake" | **`@flue/sdk`**; session id is a client UUID, no create call | Handshake is fiction; SDK handles the real Durable Streams protocol |
| Hand-parsed EventSource streaming | `client.agents.stream()` async iterator, **batched** over IPC | Don't reinvent the protocol; one IPC per token would flood |
| `flue-server.ts` mounting `flue()` alone | Flue's built/`dev` server (agents+manifest+dispatch wired) | Mounting `flue()` alone doesn't register/run agents |
| `node:sqlite` rated Low risk, unexamined | **Empirically confirmed working** in Electron 39.8.10/Node 22.22.1 | Verified, not assumed; file persistence is v1 default |
| API key as "env var / future" | **Settings UI + `safeStorage` in Phase 1/3** | `.env` doesn't load in packaged builds |
| No lifecycle/teardown/restart story | Bounded restart + ordered SIGTERM→SIGKILL + status events | Durable Streams replay zombies; a crash must surface, not hang |
```
