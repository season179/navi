# Projects sidebar + project-aware agent

**Status:** Planned (rev. 3 — mechanism reworked + verified) · **Audience:** the AI coding
agent implementing this · **Scope:** renderer UI + main-process persistence + Flue agent config.

This document is self-contained — it includes the current state of every file you'll
touch, the target design with concrete types/signatures, reference code, and how to
verify. You should not need to re-explore the codebase before starting.

> **What changed in rev. 2 (read this).** The original plan passed each conversation's
> project directory to the Flue child through a separate `navi-project-map.json` side-file
> written per-`send`. That mechanism is **removed.** It was the root of three independent
> defects (unbounded growth + silent downgrade, a write race, untestable inline logic) and
> duplicated state navi already owns. The agent now resolves its working directory from
> navi's **own** durable store (`navi-conversations.json`) — the single source of truth.
> See §3.5. This was a deliberate decision: Flue's database (`db.ts`/`flue.db`) stores
> *runtime* state only (sessions, submissions, run records) and exposes **no app-data API**
> — its own docs say *"keep business data in your own application database."* navi's store
> is that database. Findings from two independent review passes (verified against the
> installed `@flue/runtime@1.0.0-beta.2` source) are folded throughout and tagged `[review]`.
> **Rev. 3** applies the verification pass: the original "throw from the initializer on a
> missing folder" idea is replaced by a **main-process pre-send check** — an initializer
> throw on an attached submission emits no terminal stream event and would surface as a
> blank success bubble, not an error (see `[review R1]` in §3.5).

---

## 1. Goal & context

navi's sidebar today shows a **flat list of conversations**, rendered inline in
`src/renderer/routes/__root.tsx`, backed by a single JSON store
(`src/main/conversations.ts`). There is no concept of a folder/workspace, and the Flue
agent (`navi-assistant`) is a plain chat assistant with no filesystem access.

We are adding a **"Projects" section** to the sidebar, modeled on the reference app
**kun** (`../kun`): a `Projects` header with a collapse caret, a search (magnifier)
icon, a "new folder" (`FolderPlus`) icon, and below it a tree of projects — each a real
directory shown as *name* + a muted *parent-dir label* (kun shows e.g. "Personal" /
".kun") — each expandable to its conversations with relative timestamps ("now", "2 days").

We are also making the agent **project-aware**: a conversation that belongs to a real
project runs as a **full coding agent** inside that project's directory.

### Confirmed product decisions
1. **Directory-backed projects.** The `FolderPlus` icon opens a **native folder picker**
   (`dialog.showOpenDialog`, `properties: ['openDirectory']`). Project *name* = directory
   basename; *label* = parent directory's basename. Both are derived from the path and
   **stored on the project record** (authoritative).
2. **Project-aware = full coding agent.** For a conversation in a real project, the agent
   runs with `sandbox: local()` + `cwd: <projectDir>`, giving it Flue's built-in
   read/write/edit/grep/glob/shell tools on that host directory. **No hand-written file
   tools.**
3. **Existing conversations auto-migrate** into one default project named **"navi"** with
   an empty path. Empty path ⇒ no `cwd`/`sandbox` ⇒ today's plain-chat behavior is preserved.

> **Trust boundary — read carefully `[review]`.** `local()` (from `@flue/runtime/node`)
> grants model-directed read/write/shell with **NO path confinement and no host
> isolation.** `cwd` is only a *default base directory*: a tool call with an absolute path
> (`/etc/passwd`, `~/.ssh/id_rsa`) or a `../../` relative path resolves **outside** the
> project folder, and shell commands run with the **user's full privileges**. This is the
> real boundary — *full host access, scoped by convention to a folder, not jailed to it.*
> It is an accepted, deliberate choice for a local-first app where the user explicitly
> picks the folder, but the project-creation `confirm()` (§3.8) must say so plainly, and
> the `.is-missing` styling (§3.10) is **cosmetic**, never a security control.

---

## 2. Current state (grounding — what exists today)

### Persistence — `src/main/conversations.ts`
Single JSON file at `userData/navi-conversations.json` (overridable via
`NAVI_CONVERSATIONS_PATH`). Atomic temp+rename writes; mutations serialized through an
`enqueue()` queue; corrupt files are moved aside. `storePath()` is module-private today —
**you will export it** (§3.5) so the backend can hand the child the same path. Current shapes:

```ts
interface ConversationRecord extends ConversationMeta { messages: PersistedMessage[] }
interface Store { conversations: ConversationRecord[] }
```

Exports: `listConversations()`, `getConversation(id)`,
`saveConversation(id, title, messages)`, `deleteConversation(id)`.
`saveConversation` computes a strictly-monotonic `updatedAt` (`Math.max(Date.now(), newest+1)`).

### Shared contract — `src/shared/flue.ts` (type-only, imported by all three bundles)
```ts
export interface PersistedMessage { id: string; role: 'user'|'assistant'; text: string; status: 'done'|'error' }
export interface ConversationMeta { id: string; title: string; createdAt: number; updatedAt: number }
export interface FlueBridge {
  status(): Promise<FlueStatus>
  send(conversationId: string, message: string): Promise<FlueSendResult>
  cancel(requestId: string): Promise<void>
  setApiKey(key: string): Promise<{ ok: boolean; error?: string }>
  setBaseUrl(url: string): Promise<{ ok: boolean; error?: string }>
  onEvent(listener: (m: FlueStreamMessage) => void): () => void
  onStatus(listener: (s: FlueStatus) => void): () => void
  listConversations(): Promise<ConversationMeta[]>
  getConversation(id: string): Promise<PersistedMessage[]>
  saveConversation(id: string, title: string, messages: PersistedMessage[]): Promise<void>
  deleteConversation(id: string): Promise<void>
}
export const AGENT_NAME = 'navi-assistant'
export const MODEL_ID = 'openai/gpt-5.4-nano-2026-03-17'   // and MODEL_NAME / MODEL_LABEL
```

### IPC — `src/main/ipc.ts`
`registerFlueIpc()` registers `ipcMain.handle` for `flue:status|send|cancel|setApiKey|setBaseUrl`
and `conversations:list|get|save|delete`, and broadcasts `flue:event` / `flue:status-changed`.

### Preload — `src/main/preload.ts`
Exposes `window.navi.flue` (the `FlueBridge`) via `contextBridge`; each method is a thin
`ipcRenderer.invoke(...)`.

### Flue backend — `src/main/flue-backend.ts`
Spawns the Flue server (`dist/server.mjs`) as a child via `ELECTRON_RUN_AS_NODE=1`, binds
loopback, gated by a per-launch bearer token. Env passed in `doStart()`:
`PORT`, `FLUE_TOKEN`, `FLUE_DB_PATH=userData/flue.db`, plus `OPENAI_API_KEY`/`OPENAI_BASE_URL`.
`send(conversationId, message)` calls `client.agents.send(AGENT_NAME, conversationId, …)`
(admission resolves synchronously) then streams via `client.agents.stream(...)`.
**`agents.send` carries no per-prompt metadata** — confirmed: an addressable agent's
`AgentCreateContext.payload` is always `undefined` (payload exists only for `ctx.init()`
workflows). This is *why* the child must read the binding from a file, not from the prompt.

### Agent — `.flue/agents/navi-assistant.ts`
```ts
export const route: AgentRouteHandler = async (_c, next) => next()  // makes it HTTP-reachable
export default createAgent(() => ({ model: MODEL_ID, instructions: '...static...' }))
```
The initializer is `createAgent((ctx) => config)`. **`ctx.id` is the agent instance id =
navi's `conversationId`** (verified: the HTTP `:id` segment flows to `ctx.id`).
`AgentRuntimeConfig` supports `model`, `instructions`, `tools`, `cwd`, `sandbox`,
`durability` (all verified present in the installed runtime types). `local()` is imported
from `@flue/runtime/node` (Node target only — `flue.config.ts` already targets `node`).

> **`[review]` The initializer runs on EVERY turn, not once per instance.** Flue builds a
> fresh `AgentCreateContext` and re-invokes the initializer for *each* submission — there
> is no instance-level config cache. **Consequence we rely on:** the agent re-derives `cwd`
> from the store on every turn, so the binding is always current and survives child
> restarts automatically. **Do not** rewrite the initializer to cache config "once per
> conversation" — that would be a correctness bug, not an optimization.

### Renderer state — `src/renderer/flue/useNaviChat.ts`
Core hook. `conversationIdRef` (a `newId()` UUID) **is** the Flue instance id. Key pieces:
`persistCurrent()` (saves the settled thread + `refreshList()`), `send()`, `selectConversation()`,
`newConversation()` (→ `startBlank(true)`), `deleteConversation()`, `startBlank(persistPrevious)`
(aborts in-flight stream, resets to a blank thread). Launch effect loads the list and reopens
the most-recent thread behind a "pristine" guard. **Today `send()` does `void persistCurrent()`
(fire-and-forget) before `flue.send` — §3.6 changes this to `await`.**

### Context — `src/renderer/flue/NaviChatContext.tsx`
Splits state into **`ListContext`** (`conversations`, `currentId`, `newConversation`,
`selectConversation`, `deleteConversation`) and **`ThreadContext`** (messages/status/busy/send/...).
The sidebar consumes `useNaviList()` so it does **not** re-render per streamed token. **Preserve
this split** — all new project state goes in the List slice.

### Sidebar UI — `src/renderer/routes/__root.tsx` (lines ~40–67)
Inline: a `.cmd-row.is-accent` "New conversation" button, a `.sidebar-section-header`
("Conversations"), then `conversations.map(...)` of `.conv-item > .conv-open (.cmd-row) +
.conv-delete`. Footer has theme toggle + Settings.

### Styling — `src/renderer/styles/app.css` + `tokens.css`
Token-based CSS, **no Tailwind**. Reusable classes/tokens already present:
`.cmd-row`, `.cmd-row.is-active`, `.conv-item`, `.conv-open` (`padding-right:34px`),
`.conv-delete` (absolute, opacity 0→1 on `.conv-item:hover`), `.sidebar-empty`,
`.sidebar-section-header` + its `.icon-btn`. Tokens: `--ds-sidebar-row-hover|-active|-ring`,
`--ds-text|-muted|-faint|-placeholder`, `--ds-sidebar-border`,
`--ds-sidebar-field-bg|-focus` (check tokens.css; add if missing). Icons: **lucide-react**.

### Durable agent state — already in place `[review]`
`FLUE_DB_PATH=userData/flue.db` already wires Flue's **file-backed SQLite adapter**
(`.flue/db.ts` → `sqlite(FLUE_DB_PATH)`). Per the Flue durable-execution docs, this means
agent **session history and accepted submissions already survive Electron restarts**, and a
restarted Node child reconciles interrupted turns (resumes from durable partial output;
never blindly replays tool calls). We are *not* changing this — see §3.5b for how it
interacts with project-aware agents and the one optional addition (`durability` config).

### kun reference files (adapt, don't copy — kun uses Tailwind + i18n + Zustand)
Treat these as *conceptual* references; **the exact paths may have drifted** `[review]`,
so rely on the verbal spec in §3.8–§3.10 and only mine kun for layout/structure ideas:
- `../kun/.../components/chat/SidebarProjectsSection.tsx` — the section UI.
- `../kun/.../components/sidebar/SidebarPrimitives.tsx` — row/search/icon primitives.
- `../kun/.../lib/format-relative-time.ts` — `Intl.RelativeTimeFormat` formatter.
- `../kun/.../lib/workspace-label.ts` / `workspace-path.ts` — path → name/label.

---

## 3. Target design

### 3.1 Data model — `src/shared/flue.ts`
- Add `projectId: string` to `ConversationMeta`.
- Add:
  ```ts
  export interface ProjectMeta {
    id: string
    path: string    // absolute dir; '' for the default "navi" project
    name: string    // basename (or 'navi')
    label: string   // parent-dir basename ('' when path empty or top-level)
    createdAt: number
    updatedAt: number
  }
  ```
- Extend `FlueBridge` (keep the existing naming style):
  ```ts
  listProjects(): Promise<ProjectMeta[]>
  createProject(): Promise<ProjectMeta | null>     // opens native picker; null = canceled
  deleteProject(id: string): Promise<void>          // cascade-deletes its conversations
  // CHANGED signature (the ONLY breaking bridge change):
  saveConversation(id: string, projectId: string, title: string, messages: PersistedMessage[]): Promise<void>
  ```
- **`send()` is UNCHANGED** — it stays `send(conversationId, message)`. The child resolves
  `cwd` itself from the store (§3.5), so no `projectDir` argument is threaded through IPC.
  This is a deliberate simplification over rev. 1 and shrinks the breaking surface to one
  method.

### 3.2 Persistence — `src/main/conversations.ts`
- `Store` gains `projects: ProjectRecord[]` (`ProjectRecord extends ProjectMeta`).
- **Export `storePath()`** (currently module-private) so `flue-backend.ts` can pass the
  identical resolved path to the child.
- Constants `DEFAULT_PROJECT_ID = 'navi-default'`, `DEFAULT_PROJECT_NAME = 'navi'`.
- `import { randomUUID } from 'crypto'` for new project ids.
- **Path helpers come from the shared module** (§3.9 — `src/shared/projects.ts`), so the
  main process, the agent, the renderer, and tests all derive name/label from **one**
  implementation. Do not re-implement `basename`/`parentName` here `[review N1]`.
- **Migration — write-through, applied inside `read()` `[review S1]`:** make migration
  idempotent *and self-persisting on first read*, instead of coupling persistence to a
  specific caller. Invariant: *after any read of an un-migrated file, the file is migrated.*
  ```ts
  function migrate(store: Store): { store: Store; changed: boolean } {
    let changed = false
    if (!store.projects?.some(p => p.id === DEFAULT_PROJECT_ID)) {
      const now = Date.now()
      store.projects = [{ id: DEFAULT_PROJECT_ID, path: '', name: DEFAULT_PROJECT_NAME, label: '', createdAt: now, updatedAt: now }, ...(store.projects ?? [])]
      changed = true
    }
    for (const c of store.conversations) if (!c.projectId) { c.projectId = DEFAULT_PROJECT_ID; changed = true }
    return { store, changed }
  }
  // read(): after parsing, run migrate(); if changed, write() the migrated store
  // (best-effort, swallow write errors) BEFORE returning. Keep it inside enqueue()
  // discipline if you write — or accept that the first read may write once.
  ```
- New/changed functions (all that write go through `enqueue()`):
  ```ts
  listProjects(): Promise<ProjectMeta[]>            // returns projects sorted by updatedAt desc
  createProject(absPath: string): Promise<ProjectMeta>  // dedupe by full path; derive name/label; push; write
  deleteProject(id: string): Promise<void>          // no-op for DEFAULT_PROJECT_ID; else drop project + its conversations
  listConversations(projectId?: string): Promise<ConversationMeta[]>  // now includes projectId; optional filter
  saveConversation(id, projectId, title, messages): Promise<void>     // see FK rule below; also bump owning project's updatedAt
  ```
  - **`saveConversation` FK rule `[review S2]`:** if `projectId` is not found in
    `store.projects`, **coerce it to `DEFAULT_PROJECT_ID`** (don't persist a dangling FK).
    This guarantees every conversation is always groupable in the sidebar and can never
    silently vanish from the tree.
  - `getConversation` / `deleteConversation` unchanged.

### 3.3 IPC — `src/main/ipc.ts`
Add three handlers; change only `conversations:save`. **`flue:send` is unchanged.**
```ts
ipcMain.handle('projects:list', () => listProjects())
ipcMain.handle('projects:create', async (evt) => {
  const win = BrowserWindow.fromWebContents(evt.sender) ?? BrowserWindow.getAllWindows()[0]
  const opts = { title: 'Select project folder', properties: ['openDirectory','createDirectory','dontAddToRecent'] as const }
  const res = win ? await dialog.showOpenDialog(win, opts) : await dialog.showOpenDialog(opts)
  if (res.canceled || !res.filePaths[0]) return null
  return createProject(res.filePaths[0])
})
ipcMain.handle('projects:delete', (_e, id: string) => deleteProject(id))
// CHANGED:
ipcMain.handle('conversations:save', (_e, id, projectId, title, messages) => saveConversation(id, projectId, title, messages))
```
(`dialog` and `BrowserWindow` come from `electron`. `createDirectory` is a harmless no-op
for directory pickers on macOS `[review N2]`.)

### 3.4 Preload — `src/main/preload.ts`
```ts
listProjects: () => ipcRenderer.invoke('projects:list'),
createProject: () => ipcRenderer.invoke('projects:create'),
deleteProject: (id) => ipcRenderer.invoke('projects:delete', id),
saveConversation: (id, projectId, title, messages) => ipcRenderer.invoke('conversations:save', id, projectId, title, messages),
// send: UNCHANGED
```

### 3.5 Project-aware agent (Flue) — store-resolved `cwd`
**The mechanism (rev. 2).** `agents.send` can't carry metadata, but the agent initializer
runs in the child with `ctx.id` (= conversationId) **on every turn**. navi's own store
(`navi-conversations.json`) already records `conversationId → projectId → project.path`.
So: pass the child the store's path via env, and have the initializer resolve `cwd` from it
by `ctx.id`. **No second file, no per-send write, no pruning, no race** — deletes/renames
are already handled by the store, and the binding is always read fresh.

**Pure resolver — `src/shared/projects.ts` (§3.9):**
```ts
// Structural store shape — no electron/node deps, so it bundles into the agent & tests.
interface StoreLike {
  conversations: { id: string; projectId?: string }[]
  projects: { id: string; path: string }[]
}
export function resolveProjectCwd(store: StoreLike, conversationId: string): string | undefined {
  const conv = store.conversations.find(c => c.id === conversationId)
  if (!conv?.projectId) return undefined
  const proj = store.projects.find(p => p.id === conv.projectId)
  const cwd = proj?.path?.trim()
  return cwd ? cwd : undefined          // empty path (default "navi" project) ⇒ plain chat
}
```

**`src/main/flue-backend.ts`:**
- In `doStart()` env, add one line: `NAVI_CONVERSATIONS_PATH: storePath()`
  (`import { storePath } from './conversations'`). The child has `ELECTRON_RUN_AS_NODE=1`
  and **no `electron.app`**, so the main process resolves the absolute path and passes it down.
- **In `send()`, validate the folder BEFORE `client.agents.send` `[review R1]`.** This is the
  *only* place a missing-folder error can be surfaced cleanly. Resolve the cwd the child will
  use and fail fast through navi's proven error path:
  ```ts
  // import { readFileSync, existsSync } from 'fs'
  // import { resolveProjectCwd } from '../shared/projects'
  try {
    const store = JSON.parse(readFileSync(storePath(), 'utf8'))
    const cwd = resolveProjectCwd(store, conversationId)
    if (cwd && !existsSync(cwd)) {
      throw new Error(`Project folder no longer exists: ${cwd}. Re-create the project or pick a new folder.`)
    }
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('Project folder')) throw e   // surface to renderer
    // store unreadable/corrupt → don't over-block; let the turn proceed
  }
  ```
  The throw propagates out of the `flue:send` IPC handler → rejects the renderer's
  `await window.navi.flue.send(...)` → `useNaviChat.send`'s existing `catch` renders it as a
  `kind:'error'` turn. The binding is already on disk here because `useNaviChat.send` awaits
  `persistCurrent()` first (§3.6). `client.agents.send` is otherwise unchanged. **No
  `NAVI_PROJECT_MAP_PATH`, no map write.**

**`.flue/agents/navi-assistant.ts`:**
```ts
import { createAgent, type AgentRouteHandler } from '@flue/runtime'
import { local } from '@flue/runtime/node'
import { readFileSync, existsSync } from 'fs'
import { MODEL_ID } from '../../src/shared/flue'
import { resolveProjectCwd } from '../../src/shared/projects'

export const route: AgentRouteHandler = async (_c, next) => next()

function projectCwdFor(id: string, storePath: string | undefined): string | undefined {
  if (!storePath) return undefined
  try {
    const store = JSON.parse(readFileSync(storePath, 'utf8'))   // atomic temp+rename ⇒ never torn
    return resolveProjectCwd(store, id)
  } catch (e: any) {
    // ENOENT = store absent on very first launch ⇒ plain chat, self-heals next turn.
    // Anything else (corrupt bytes, transient read) is logged so a downgrade is at least
    // diagnosable rather than fully silent. [review R3]
    if (e?.code !== 'ENOENT') process.stderr.write(`[navi-agent] store read failed: ${e?.message}\n`)
    return undefined
  }
}

export default createAgent((ctx) => {
  const cwd = projectCwdFor(ctx.id, ctx.env.NAVI_CONVERSATIONS_PATH)
  const base = [
    'You are Navi, an AI assistant inside a local-first desktop app.',
    'Be concise and helpful with writing, coding, analysis, and questions.',
  ]
  // No cwd (default project / empty path), or — defensively — a folder that vanished in the
  // narrow window between the main-process pre-send check and now: fall back to plain chat.
  // DO NOT throw here. [review R1] An initializer throw on an attached submission emits no
  // terminal stream event, so navi would render a blank 'done' bubble, not an error. The
  // user-facing missing-folder guard lives in flue-backend.send (main), which has a proven
  // error path. This existsSync is belt-and-braces for the deleted-mid-flight race only.
  if (!cwd || !existsSync(cwd)) return { model: MODEL_ID, instructions: base.join('\n') }
  return {
    model: MODEL_ID,
    sandbox: local(),
    cwd,
    instructions: [
      ...base,
      `You are working inside the project directory: ${cwd}.`,
      'You can read, search, edit files, and run shell commands here via your workspace tools. Prefer relative paths.',
    ].join('\n'),
  }
})
```
Rebuild after editing (`npm run build:flue`).

> **`[review]` Ordering invariant — the one thing that makes this correct.** The child reads
> the store at init, so the conversation's record (with its `projectId`) **must be on disk
> before admission.** §3.6 enforces this by making `send()` **`await persistCurrent()`**
> before `flue.send`. Because `persistCurrent` writes atomically and is awaited, the write
> *happens-before* the child's read on the first turn of a brand-new project conversation.
>
> **`[review R2]` The statement order is load-bearing — do not reorder.** `persistCurrent`
> early-returns on an empty thread (`if (msgs.length === 0) return`). The first project turn
> works only because `send()` runs `commit([...userMsg, assistantMsg])` *first* (making the
> thread non-empty), *then* `await persistCurrent()`, *then* `flue.send`. Reorder these and
> the first turn of every project conversation silently runs as plain chat — keep them in
> this order and comment why.
>
> **`[review R4]`** Reading the full store (with message bodies) per init is negligible for a
> personal app — `readFileSync` blocks the child <1ms vs. an LLM round-trip. Note the file
> includes message bodies and `conversations.ts` has **no thread-pruning today**, so it grows
> unbounded across all conversations (pre-existing, out of scope — flag a future "cap stored
> thread length"). If it ever matters, switch to a small derived `{convId: dir}` index
> without changing the `resolveProjectCwd` contract.

### 3.5b Durable agents (`db.ts`) — what we keep, what we add `[review]`
- **Keep:** the file-backed `sqlite()` adapter via `FLUE_DB_PATH` already makes sessions +
  submissions durable across Electron restarts — exactly the "durable agents" property we
  want. A project conversation interrupted mid-turn (app quit, crash) is reconciled on the
  next launch by Flue's conservative replay rules. No change needed.
- **Note the boundary:** durability covers *conversation history*, **not the sandbox.**
  `local()` operates on the real host folder, which persists on its own; nothing to do.
- **Optional add:** for long-running coding turns, set `durability` on the project-agent
  config: `durability: { maxAttempts: 10, timeoutMs: 3_600_000 }` (defaults shown; raise
  `timeoutMs` for agents expected to run many minutes). Skip if turns are short.
- **Not a workflow.** Chat is a *continuing agent*, not a finite `ctx.init()` workflow, so
  it stays an addressable durable agent. (Workflows are for finite input→result ops and
  would not fit an open-ended chat thread.)

### 3.6 Renderer state — `src/renderer/flue/useNaviChat.ts`
Add to the hook (and to the `NaviChat` interface):
- State: `projects: ProjectMeta[]`; `currentProjectId` + `currentProjectIdRef` (seed `'navi-default'`).
- `refreshProjects()` → `setProjects(await window.navi.flue.listProjects())`.
- **Launch effect:** call `listProjects()` first (triggers migration + persist), set state; when
  reopening the most-recent thread, seed `currentProjectId(Ref)` from that conversation's `projectId`.
- **`persistCurrent()`:** pass `currentProjectIdRef.current` to `saveConversation`; then refresh
  **list and projects** (project `updatedAt` changed).
- **`send()` — CRITICAL CHANGE `[review R2]`:** replace the current `void persistCurrent()`
  with **`await persistCurrent()`** *before* `window.navi.flue.send(conv, text)`. The exact
  order is **load-bearing**: `commit([...userMsg, assistantMsg])` → `await persistCurrent()`
  → `flue.send`. `commit` must precede the persist (else `persistCurrent`'s empty-thread
  early-return no-ops and the first project turn runs as plain chat); the persist must
  complete before `flue.send` (so the binding is on disk before the child reads it, §3.5).
  Add a comment saying so. `send()` no longer resolves or passes a `projectDir`. Keep the
  existing "abandon if the user switched conversations during admission" guard.
- New actions:
  - `createProject()`: `const p = await window.navi.flue.createProject(); if (!p) return; await refreshProjects(); await selectProject(p.id)`.
  - `selectProject(id)`: persist current, set `currentProjectId(Ref)`, `startBlank(false)` (next send lands in this project; does **not** auto-open a conversation — matches kun).
  - `deleteProject(id)`: if `id === currentProjectIdRef.current` → set to default + `startBlank(false)` first; then `await window.navi.flue.deleteProject(id)`; refresh projects + list.
  - widen `newConversation(projectId?: string)` so a per-project "+" can target a project.
- **`selectConversation(id)`:** after the `getConversation` load resolves, set
  `currentProjectId(Ref)` from the **freshly-listed** conversation record, not from the
  possibly-stale `conversations` state `[review N3]` — e.g. read it off the `list`/lookup
  you already awaited, or re-`listConversations()`. This keeps the active project (and the
  next `send`'s `cwd`) following the open thread.

### 3.7 Context — `src/renderer/flue/NaviChatContext.tsx`
Add `projects`, `currentProjectId`, `createProject`, `selectProject`, `deleteProject` to the
**`ListValue`** Pick and its `useMemo` (and deps). **Do not** touch `ThreadValue`.

### 3.8 Sidebar UI — new `src/renderer/routes/SidebarProjects.tsx`
`__root.tsx` replaces the inline conversation block (lines ~40–67) with `<SidebarProjects />`;
keep the "New conversation" accent button and footer. The component consumes `useNaviList()` and
renders:
- **Header:** `Projects` + caret button (toggles a local `allCollapsed`); right-side actions:
  `Search` (toggles a search field) and `FolderPlus` (→ `createProject()`).
- **Search field** (conditional): plain `<input>` with a `Search` icon; case-insensitive filter
  over project `name` + conversation `title`.
- **Tree:** group `conversations` by `projectId` (`useMemo`), iterate in `projects` order.
  Group any conversation with an **unknown `projectId` under the default project** as a
  belt-and-braces fallback (the store already coerces, §3.2 — this is defense in depth so a
  conversation can never disappear) `[review S2]`. Each **project row**
  (`.cmd-row.project-row`, `Folder`/`FolderOpen`, `name`, muted right `label`; `.is-active`
  when `currentProjectId`; per-project `Trash2` hidden for `navi-default`) toggles a local
  `expanded[id]` and calls `selectProject(id)`. Expanded → its **conversation rows**
  (`.conv-item > .conv-open` with `MessageSquare`, title, right-aligned **relative
  timestamp**, plus hover-reveal `.conv-delete`). Empty project → `.sidebar-empty` "No
  conversations".
- **Active-project semantics — document this invariant `[review S3]`:** the highlighted
  (`is-active`) project is **"where the open conversation lives,"** not "the last header you
  clicked." `selectConversation` sets `currentProjectId` from the opened thread; clicking a
  project header selects it for the *next* new conversation but does not open one. State
  this in a comment so the conversation-driven highlight isn't later "fixed" into a bug.
- Icons (lucide-react): `ChevronRight`, `ChevronDown`, `Search`, `FolderPlus`, `Folder`,
  `FolderOpen`, `MessageSquare`, `Trash2`.
- **Delete a project:** `confirm()` first — and the message must name the **cascade** (its
  conversations are deleted) **and** the host-access nature of the folder binding, per §1.

### 3.9 Shared + renderer utils
- **`src/shared/projects.ts` (NEW, pure — no electron/node imports) `[review N1, N5]`:** the
  single home for path → name/label derivation **and** `resolveProjectCwd` (§3.5), so main,
  the agent, the renderer, and tests share one implementation and can't diverge.
  ```ts
  const stripTrailing = (p: string) => (p ?? '').trim().replace(/[/\\]+$/, '')
  export function projectName(p: string): string {
    const parts = stripTrailing(p).split(/[/\\]/); return parts[parts.length - 1] || ''
  }
  export function projectLabel(p: string): string {   // parent-dir basename
    const parts = stripTrailing(p).split(/[/\\]/).filter(Boolean)
    return parts.length >= 2 ? parts[parts.length - 2] : ''
  }
  export function resolveProjectCwd(store, conversationId): string | undefined { /* §3.5 */ }
  ```
- **`src/renderer/lib/format-relative-time.ts`** — adapt kun's, but accept a **numeric epoch**
  (navi stores `updatedAt: number`):
  ```ts
  export function formatRelativeTime(input: number, locale: string): string {
    if (!Number.isFinite(input)) return ''
    const now = Date.now(); const diff = input - now; const absS = Math.abs(diff)/1000
    const f = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    if (absS < 60) return f.format(Math.round(diff/1e3), 'second')      // "now"
    if (absS < 3600) return f.format(Math.round(diff/6e4), 'minute')
    if (absS < 86400) return f.format(Math.round(diff/3.6e6), 'hour')
    if (absS < 604800) return f.format(Math.round(diff/8.64e7), 'day')  // "2 days ago"
    if (absS < 2592000) return f.format(Math.round(diff/6.048e8), 'week')
    const d = new Date(input); const sameYear = d.getFullYear() === new Date(now).getFullYear()
    return new Intl.DateTimeFormat(locale, { month:'short', day:'numeric', ...(sameYear?{}:{year:'numeric'}) }).format(d)
  }
  ```
  Call with `navigator.language || 'en'`.
- **`src/renderer/lib/workspace-label.ts`** — thin re-export of `projectName`/`projectLabel`
  from `src/shared/projects.ts` (renderer-side display/preview only; stored record values
  remain authoritative). Do **not** fork the logic.

### 3.10 CSS — append to `src/renderer/styles/app.css`
Reuse existing classes; add:
- `.projects-title` — caret button (transparent, `--ds-text-faint`, 12px, small svg).
- `.sidebar-section-actions` — inline-flex gap for the two icon buttons.
- `.sidebar-search` — flex row, `--ds-sidebar-field-bg` (and `:focus-within` → `-focus`), inner
  `<input>` transparent, `::placeholder` = `--ds-text-placeholder`. (Add the field tokens to
  tokens.css if absent.)
- `.project-row .project-context` — muted label, `margin-left:auto`, ellipsis, `max-width:42%`.
- `.project-children` — `padding-left:14px`, column gap.
- `.conv-open .conv-time` — muted, `margin-left:auto`, `tabular-nums`; **fade to opacity:0 on
  `.conv-item:hover`** so it yields to the delete affordance (mirrors kun).
- `.project-row.is-missing .cmd-label` — greyed/italic stub for a future "folder not found" state.

---

## 4. Edge cases & decisions
- **Single source of truth `[review]`.** The conversation→project→path binding lives **only**
  in `navi-conversations.json`. The agent reads it; nothing writes a parallel copy. Deleting
  or reassigning is just a normal store mutation — there is nothing else to keep in sync.
- **Ordering (§3.5/§3.6).** `send()` awaits `persistCurrent()` so the binding is on disk
  before the child resolves `cwd`. The store's atomic temp+rename means the child never
  reads a torn file. Skipping the `await` would make the *first* turn of a new project
  conversation silently run as plain chat.
- **Full host access, not a folder jail `[review B1]`.** Restated from §1: `local()` is not a
  sandbox boundary. The `confirm()` dialog must say so; `.is-missing` is cosmetic.
- **Missing project folder `[review B2, R1]`.** If a conversation's project path is set but
  the directory is gone, **`flue-backend.send` (main process) throws before admission**, and
  the existing renderer `catch` renders a clear `kind:'error'` turn. The check lives in main
  — **not** as a `throw` in the agent initializer, which would vanish (no terminal stream
  event on an attached submission → blank `done` bubble). The child initializer defensively
  falls back to plain chat if the folder is missing, covering only the deleted-mid-flight
  race. Path is not required to pre-exist at creation time; `.is-missing` styling is a later
  `fs.access` UI nicety.
- **Honest failure bounds `[review R3]`.** The child's store read self-heals on the next turn
  if the file was briefly absent (`ENOENT`). It is **not** "never silently downgrades": a
  corrupt store (which `conversations.ts` renames aside, briefly diverging main's and the
  child's view) or a rare transient read error yields plain chat for *that one turn* — now
  logged to the child's stderr so it's diagnosable.
- **Delete project cascades** its conversations (a project *is* the folder). The default
  `navi` project is **undeletable** (guarded in `deleteProject`; no delete button). Confirm
  in the UI first. **Known limitation `[review S5]` — decided for v1:** the cascade removes
  display threads from `navi-conversations.json` but **does not** garbage-collect the matching
  agent-memory rows in `flue.db` (the SDK exposes no history-delete API). This is harmless
  (orphan rows, invisible to the user; only cost is slow `flue.db` growth). **Decision:
  accept it — do not add `flue.db` GC in v1; revisit only if bloat becomes real.**
- **Active project deleted** → switch to default + `startBlank(false)` *before* the IPC
  delete, so no late stream re-saves into a removed project (reuses the abort discipline).
- **Orphan `projectId` `[review S2]`** can't strand a conversation: `saveConversation` coerces
  unknown FKs to default, and the sidebar groups unknowns under default too.
- **Empty states:** default project always exists post-migration (tree never truly empty);
  per-project "No conversations"; search with zero matches hides empty projects / shows "No matches".
- **Duplicate basenames:** disambiguated by the muted parent label; `createProject` dedupes by
  full path, so two different `web/` folders coexist.
- **Default project's empty path** ⇒ `resolveProjectCwd` returns `undefined` ⇒ no
  `cwd`/`sandbox` ⇒ plain chat (current behavior preserved).

---

## 5. Implementation order
The breaking surface is now a **single** signature (`saveConversation` gains `projectId`).
Do steps 1–4 (+ their renderer caller in step 8) as **one atomic commit** so `typecheck`
never sees a half-updated signature `[review S4]`.

1. `src/shared/projects.ts` — pure helpers: `projectName`, `projectLabel`, `resolveProjectCwd`.
2. `src/shared/flue.ts` — `projectId` on `ConversationMeta`; `ProjectMeta`; bridge additions;
   `saveConversation` signature change. (`send` unchanged.)
3. `src/main/conversations.ts` — `projects`, write-through `migrate` in `read()`, `createProject`/
   `deleteProject`/`listProjects`, `saveConversation` FK coercion + project bump, **export `storePath()`**.
4. `src/main/ipc.ts` — `projects:*` handlers; widen `conversations:save`. (`flue:send` unchanged.)
5. `src/main/preload.ts` — expose new methods; widen `saveConversation`.
6. `src/main/flue-backend.ts` — add `NAVI_CONVERSATIONS_PATH: storePath()` to child env, **and**
   add the pre-send missing-folder validation in `send()` (resolve cwd via `resolveProjectCwd`,
   `throw` if set-but-missing, before `client.agents.send`) `[review R1]`.
7. `.flue/agents/navi-assistant.ts` — per-turn `cwd` via `resolveProjectCwd`, `local()` sandbox,
   missing-dir throw, optional `durability`. **Run `npm run build:flue` after.**
8. `src/renderer/flue/useNaviChat.ts` — project state/refs/actions; **`send()` awaits
   `persistCurrent()`**; `selectConversation` reads projectId from fresh data.
9. `src/renderer/flue/NaviChatContext.tsx` — widen the List slice.
10. `src/renderer/lib/format-relative-time.ts` + `workspace-label.ts` (re-export).
11. `src/renderer/routes/SidebarProjects.tsx` — new component.
12. `src/renderer/routes/__root.tsx` — swap in `<SidebarProjects />`.
13. `src/renderer/styles/app.css` (+ `tokens.css` if field tokens missing) — append new classes.

Steps 1–7 are the data/agent backbone (the flat list keeps working — everything falls back to
`navi-default`). Steps 8–13 are the UI layer.

---

## 6. Verification
1. **Typecheck + build:** `npm run typecheck`, then `npm run build` (runs `build:flue` →
   `flue build --target node` + `scripts/patch-flue-server.mjs`, then main/preload/renderer).
2. **Migration:** launch `npm start`; confirm existing conversations appear under a **"navi"**
   project and behave as before (plain chat — no file access). Restart and confirm the
   migration persisted (no re-migration churn).
3. **Create project:** click `FolderPlus` → native dialog → pick a real folder (e.g. this repo).
   Verify the row shows the folder's *name* + parent *label*, becomes active, opens a blank
   conversation, and the `confirm()` text warns about host access on the *next* delete.
4. **Project-aware agent (the load-bearing check) `[review S4]`:** in that project's conversation
   ask *"list the files in this directory"* and *"read package.json and summarize it"* — verify
   it reads the **real** folder (confirms `cwd` resolved + `local()` applied on the **first**
   turn, proving the `await persistCurrent()` ordering). Confirm a conversation under default
   "navi" does **not** have file access. **Do not declare done without this manual check** —
   a forgotten `await` regresses every project conversation to plain chat *with no error*.
5. **Missing folder `[review R1]`:** rename/remove a project's folder on disk, send a prompt →
   confirm a clear `kind:'error'` turn (from the main-process pre-send check), **not** a blank
   assistant bubble and **not** a silent plain-chat downgrade. This specifically guards against
   the initializer-throw-vanishes failure mode.
6. **Tree / search / timestamps:** expand/collapse projects; toggle search and filter; confirm
   relative timestamps ("now", "2 days").
7. **Delete + persistence:** delete a non-default project (confirm cascade); confirm "navi" can't
   be deleted; restart and confirm projects + assignments persist.
8. **Durability spot-check `[review]`:** start a longer agent turn in a project, quit the app
   mid-turn, relaunch → confirm the conversation history is intact (file-backed `flue.db`).
9. **Automated tests** (`node --test "test/**/*.test.mjs"`; `pretest` runs `build:flue`):
   - Extend `test/conversations.test.mjs` (bundles `conversations.ts`, temp `NAVI_CONVERSATIONS_PATH`):
     migration idempotency (default project created once; `projectId` back-filled *and written
     through on read*), `createProject` path-dedupe + name/label derivation, `saveConversation`
     FK coercion of unknown `projectId` to default + project `updatedAt` bump, cascade delete
     (incl. default protected).
   - **New `test/projects.test.mjs`** for the pure `src/shared/projects.ts` (no Electron needed):
     `resolveProjectCwd` (project path → cwd; empty path / unknown id / unknown project →
     `undefined`), and `projectName`/`projectLabel` edge cases (`'/foo/'`, `'/'`, `''`,
     mixed separators) `[review N1, N5]`.
   - Per `AGENTS.md`: no flaky tests — each must protect something real.

> `AGENTS.md` notes: personal-use Electron app; use **deepwiki** / `npx flue docs` for library
> docs, **agent-browser** to test the UI, and the preconfigured **`pi`** agent for
> delegation/review. The Flue mechanism and `db.ts` behavior here were verified against the
> installed `@flue/runtime@1.0.0-beta.2` source and version-matched docs.
