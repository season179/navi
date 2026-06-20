# Plan: Integrate Flue into Navi

**Status**: Plan (not started)
**Goal**: Turn Navi from a UI shell into a working AI chat app powered by [Flue](https://flueframework.com)

---

## 1. Architecture

**Flue runs as an in-process HTTP server in Electron's main process, bound to `127.0.0.1:<ephemeral-port>`.**

Why not in-process JS API directly? Flue's `init()` / `harness.session()` / `session.prompt()` API is only available inside workflow contexts. Its designed consumption path is HTTP (agents export `route`, served by a Hono app). The `@flue/runtime/routing` module exports a `flue()` Hono middleware that sets up all agent routes with streaming support. This is the correct integration path.

**Communication model (two options):**

| Approach | Pros | Cons |
|---|---|---|
| **A. IPC bridge** (renderer → IPC main → HTTP to Flue) | Maintains contextIsolation, no direct port exposure, history goes through main | Extra hop, more code |
| **B. Direct fetch** (renderer → `localhost:<port>`) | Simplest, no IPC overhead, Full SDK access | Breaks `contextIsolation: true` abstraction, any process on machine could reach the port |

**Recommendation**: Start with **A (IPC bridge)** for safety and clean abstraction. The IPC handlers in main are thin HTTP proxies to Flue -- minimal code, easy to test, and streaming is additive.

---

## 2. Source Layout

Flue recommends the `.flue/` layout when adding to an existing app (it keeps agents self-contained, separate from the app's `src/`).

```
navi/
├── .flue/
│   └── agents/
│       └── navi-assistant.ts      # The chat agent
├── flue.config.ts                 # Created by `npx flue init`
├── src/
│   ├── main/
│   │   ├── main.ts                # Electron entry (start Flue server here)
│   │   ├── preload.ts             # contextBridge for agent API
│   │   └── flue-server.ts         # Hono + Flue server setup
│   └── renderer/
│       ├── main.tsx               # React entry
│       ├── router.ts              # Routes
│       ├── components/
│       │   └── Composer.tsx        # Wire send button to agent
│       ├── routes/
│       │   └── home.tsx            # Conversation view
│       └── styles/
│           └── ...
├── package.json
└── PLAN.md
```

### `.flue/agents/navi-assistant.ts`

```ts
import { createAgent } from '@flue/runtime'

export default createAgent(() => ({
  model: 'anthropic/claude-sonnet-4-6',  // or from config
  instructions: [
    'You are Navi, an AI assistant inside a desktop app.',
    'Be concise and helpful. You can help with writing, coding, analysis, and questions.',
    'When asked about files or system, use the available tools to read and explore.',
  ].join('\n'),
}))
```

---

## 3. Dependencies

| Package | Why | Type |
|---|---|---|
| `@flue/runtime` | Agent runtime, routing, Hono middleware | dependency |
| `@flue/cli` | Dev commands (`flue connect`, `flue dev`, `flue docs`) | devDependency |
| `@hono/node-server` | Serve the Hono/Flue app on a local port | dependency (Flue peer dep) |

The `sqlite()` persistence adapter uses Node 22+'s built-in `node:sqlite` -- no additional native deps.

Total expected bundle addition: ~3-5 MB for the main process. This is fine for Electron.

---

## 4. Implementation Phases

### Phase 0: Scaffold Flue in the project

1. `npm install @flue/runtime`
2. `npm install --save-dev @flue/cli`
3. `npx flue init --target node` -- creates `flue.config.ts` and `.flue/` directory structure
4. Create `.flue/agents/navi-assistant.ts` with the agent above
5. Verify: `npx flue connect navi-assistant local` and send a message

### Phase 1: Flue server in main process

Create `src/main/flue-server.ts`:

```ts
import { Hono } from 'hono'                              // from @flue/runtime deps
import { serve } from '@hono/node-server'                 // from @flue/runtime deps
import { flue } from '@flue/runtime/routing'              // Flue's Hono middleware
import { sqlite } from '@flue/runtime/node'               // SQLite persistence
import { app, BrowserWindow } from 'electron'

export async function startFlueServer(userDataPath: string): Promise<number> {
  const persistence = sqlite(`${userDataPath}/flue.db`)
  persistence.migrate()

  const app = new Hono()
  app.use('/flue/*', flue({ db: persistence }))           // mounts agent/workflow routes

  return new Promise((resolve) => {
    const server = serve({
      fetch: app.fetch,
      port: 0,                                            // ephemeral port
      hostname: '127.0.0.1',
    }, (info) => resolve(info.port))
  })
}
```

Wire into `src/main/main.ts`:

```ts
import { startFlueServer } from './flue-server'

app.whenReady().then(async () => {
  const fluePort = await startFlueServer(app.getPath('userData'))
  // store fluePort for IPC handlers
  createWindow()
})
```

**Build note**: esbuild's existing `--platform=node --external:electron` will bundle `@flue/runtime` and its deps into `dist/main/main.js`. Verify this works by running `npm run build:main` and checking for errors. If bundle size is a concern, use `--external:@flue/runtime` and copy the package to `dist/` manually.

### Phase 2: IPC bridge

**Preload** (`src/main/preload.ts`):

```ts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('navi', {
  versions: () => ({
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
  }),
  agent: {
    createSession: () =>
      ipcRenderer.invoke('agent:session.create'),
    prompt: (sessionId: string, text: string) =>
      ipcRenderer.invoke('agent:prompt', { sessionId, text }),
    disposeSession: (sessionId: string) =>
      ipcRenderer.invoke('agent:session.dispose', { sessionId }),
  },
})
```

**Main IPC handlers** (`src/main/main.ts`):

```ts
import { ipcMain } from 'electron'

let fluePort: number

function setupIpcHandlers() {
  ipcMain.handle('agent:session.create', async () => {
    const res = await fetch(`http://127.0.0.1:${fluePort}/flue/agents/navi-assistant/session-1`, {
      method: 'POST',
      body: JSON.stringify({ message: '' }),     // create session handshake
      headers: { 'Content-Type': 'application/json' },
    })
    return { sessionId: 'session-1' }
  })

  ipcMain.handle('agent:prompt', async (_event, { sessionId, text }) => {
    const res = await fetch(
      `http://127.0.0.1:${fluePort}/flue/agents/navi-assistant/${sessionId}`, {
        method: 'POST',
        body: JSON.stringify({ message: text }),
        headers: { 'Content-Type': 'application/json' },
      }
    )
    const data = await res.json()
    return { text: data.text, usage: data.usage }
  })

  ipcMain.handle('agent:session.dispose', async (_event, { sessionId }) => {
    // Flue sessions persist automatically via sqlite adapter
    return { ok: true }
  })
}
```

### Phase 3: Wire the React UI

Replace hardcoded content in `src/renderer/routes/home.tsx`:

1. **State**: Track `{ messages: Array<{ role: 'user' | 'assistant', text }>, sessionId: string | null, isLoading: boolean }`
2. **On mount**: Call `window.navi.agent.createSession()` to get a session ID
3. **Composer send**: Call `window.navi.agent.prompt(sessionId, text)`, push user message + response to `messages` array
4. **Loading state**: Disable send button, show typing indicator while waiting
5. **Thread management**: Store thread metadata (sessionId, title, timestamp) in localStorage for the sidebar

### Phase 4: Streaming (additive, not required for v1)

Flue's agent routes support SSE at `GET /agents/:name/:id`. Implementation:

1. Main process consumes the EventSource from Flue
2. On each token event, forwards to renderer: `webContents.send('agent:token', { sessionId, delta })`
3. On done event: `webContents.send('agent:done', { sessionId, fullText })`
4. Preload exposes `onToken(cb)` and `onDone(cb)` with unsubscribe return values
5. Renderer accumulates tokens into live-updating message state

### Phase 5: Testing

"All tests must be protecting something real."

| Test | What it protects | How |
|---|---|---|
| **Agent integration** | Agent config is valid, prompts get responses | Create agent with mock provider, init harness, send prompt |
| **IPC handlers** | IPC contract is correct, errors propagate | Mock `fetch` to fake Flue server, test each handler |
| **React components** | UI renders messages correctly, loading/error states work | Render Composer + conversation list with mock agent API via context bridge |
| **E2E (future)** | Full flow works in real Electron | agent-browser launches Electron, creates session, sends message, asserts response appears |

---

## 5. Key Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| esbuild can't bundle `@flue/runtime` | Medium | Test `npm run build:main` immediately after install. Fallback: `--external:@flue/runtime` + copy to `dist/` |
| `node:sqlite` not available in Electron's Node | Low | Electron >=33 bundles Node 22+. Verify with `process.versions.node`. Fallback: in-memory only (data lost on quit) or use `better-sqlite3` |
| Model provider not configured / API key missing | Medium | Log clear error in main process. Show config hint in the UI. Use env vars or a config file in `userData` |
| Flue's stream protocol doesn't match simple chat UX | Low | Start with non-streaming. Streaming is an additive improvement, not a blocker |
| `@hono/node-server` startup blocks window creation | Low | Start Flue server before `createWindow()`. If slow, move to lazy init or a loading screen |

---

## 6. Future Considerations

- **Multiple agents**: Define additional agents in `.flue/agents/` (e.g. `code-reviewer`, `summarizer`). Add agent selector to the UI.
- **Custom tools**: Use `defineTool()` to give the agent access to Electron APIs (clipboard, notifications, file dialogs).
- **Subagents**: For complex tasks, the main agent delegates to specialist subagents.
- **Channels**: Flue supports Slack, Discord, GitHub, etc. Could make Navi multi-platform.
