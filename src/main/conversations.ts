// Persistent store for the *display threads* of Navi conversations — the
// message bubbles the renderer shows. This is distinct from the agent's own
// memory: Flue persists each conversation's model context in flue.db keyed by
// the same conversation id, so resuming a stored thread and sending again
// continues with full context. We only own what to render.
//
// Backed by a single JSON file under userData, written atomically (temp +
// rename) and with mutations serialized through a queue so concurrent saves
// can't lose updates.

import { randomUUID } from 'crypto'
import { app } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'
import type { ConversationMeta, PersistedMessage, ProjectMeta, ReasoningLevel } from '../shared/flue'
import { projectLabel, projectName } from '../shared/projects'

export const DEFAULT_PROJECT_ID = 'navi-default'
export const DEFAULT_PROJECT_NAME = 'navi'

interface ConversationRecord extends ConversationMeta {
  messages: PersistedMessage[]
}

interface ProjectRecord extends ProjectMeta {}

interface Store {
  projects: ProjectRecord[]
  conversations: ConversationRecord[]
}

export function storePath(): string {
  // An explicit path wins (tests, or relocating the store); otherwise default
  // to userData. Mirrors FLUE_DB_PATH's dev/test fallback in .flue/db.ts.
  const override = process.env.NAVI_CONVERSATIONS_PATH?.trim()
  return override ? override : path.join(app.getPath('userData'), 'navi-conversations.json')
}

// Bring a loaded store up to the current shape in memory: guarantee the default
// project exists and back-fill projectId on legacy conversations. Idempotent, so
// it's safe (and cheap) to run on every read.
function migrate(store: Store): Store {
  if (!store.projects?.some((p) => p.id === DEFAULT_PROJECT_ID)) {
    const now = Date.now()
    store.projects = [
      {
        id: DEFAULT_PROJECT_ID,
        path: '',
        name: DEFAULT_PROJECT_NAME,
        label: '',
        createdAt: now,
        updatedAt: now,
      },
      ...(store.projects ?? []),
    ]
  }
  for (const c of store.conversations) {
    if (!c.projectId) c.projectId = DEFAULT_PROJECT_ID
  }
  return store
}

async function read(): Promise<Store> {
  const file = storePath()
  let raw: string
  try {
    raw = await fs.readFile(file, 'utf8')
  } catch {
    return migrate({ projects: [], conversations: [] }) // no file yet — fresh start
  }
  try {
    const parsed = JSON.parse(raw) as Partial<Store>
    // Migrate in memory only — never write from read(). Reads run unqueued, so
    // persisting here could interleave with a queued mutation's write and clobber
    // it (a lost update). Migration is idempotent; the next queued mutation
    // (save/create/delete) persists the upgraded shape. Until then disk stays in
    // its legacy form, which all readers already tolerate (missing projectId →
    // default → plain chat).
    return migrate({
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      conversations: Array.isArray(parsed.conversations) ? parsed.conversations : [],
    })
  } catch {
    // The file exists but is corrupt. Preserve it instead of silently
    // overwriting (the next save would otherwise destroy recoverable data),
    // then start fresh.
    try {
      await fs.rename(file, `${file}.corrupt-${Date.now()}`)
    } catch {
      // best effort — if we can't move it aside, still avoid throwing here
    }
    return migrate({ projects: [], conversations: [] })
  }
}

async function write(store: Store): Promise<void> {
  const file = storePath()
  await fs.mkdir(path.dirname(file), { recursive: true })
  // Unique temp per write: read() persists migrations outside the mutation
  // queue, so two writes can be in flight at once. A shared temp path would let
  // them clobber each other's bytes before the rename; a per-write name keeps
  // every rename an atomic promotion of one fully-written file.
  const tmp = `${file}.${randomUUID()}.tmp`
  try {
    await fs.writeFile(tmp, JSON.stringify(store, null, 2), { mode: 0o600 })
    await fs.rename(tmp, file) // atomic: readers never see a torn file
  } catch (e) {
    await fs.rm(tmp, { force: true }).catch(() => {}) // don't leak a temp on failure
    throw e
  }
}

// Serialize read-modify-write cycles so two overlapping saves can't clobber
// each other. Reads (list/get) are safe to run unqueued thanks to atomic write.
let queue: Promise<unknown> = Promise.resolve()
function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn)
  queue = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

export async function listProjects(): Promise<ProjectMeta[]> {
  const { projects } = await read()
  return projects
    .map(({ id, path: p, name, label, createdAt, updatedAt }) => ({
      id,
      path: p,
      name,
      label,
      createdAt,
      updatedAt,
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export function createProject(absPath: string): Promise<ProjectMeta> {
  return enqueue(async () => {
    const store = await read()
    const dirPath = absPath.trim()
    const existing = store.projects.find((p) => p.path === dirPath)
    if (existing) {
      return {
        id: existing.id,
        path: existing.path,
        name: existing.name,
        label: existing.label,
        createdAt: existing.createdAt,
        updatedAt: existing.updatedAt,
      }
    }
    const now = Date.now()
    const project: ProjectRecord = {
      id: randomUUID(),
      path: dirPath,
      name: projectName(dirPath),
      label: projectLabel(dirPath),
      createdAt: now,
      updatedAt: now,
    }
    store.projects.push(project)
    await write(store)
    return project
  })
}

export function deleteProject(id: string): Promise<void> {
  if (id === DEFAULT_PROJECT_ID) return Promise.resolve()
  return enqueue(async () => {
    const store = await read()
    const nextProjects = store.projects.filter((p) => p.id !== id)
    if (nextProjects.length === store.projects.length) return
    store.projects = nextProjects
    store.conversations = store.conversations.filter((c) => c.projectId !== id)
    await write(store)
  })
}

export async function listConversations(projectId?: string): Promise<ConversationMeta[]> {
  const { conversations } = await read()
  const filtered = projectId ? conversations.filter((c) => c.projectId === projectId) : conversations
  return filtered
    .map(({ id, projectId: pid, title, createdAt, updatedAt, providerId, modelId, reasoning }) => ({
      id,
      projectId: pid,
      title,
      createdAt,
      updatedAt,
      // Carry the per-conversation selection so the renderer can render the
      // composer chip without a separate fetch on select.
      ...(providerId ? { providerId } : {}),
      ...(modelId ? { modelId } : {}),
      ...(reasoning ? { reasoning } : {}),
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getConversation(id: string): Promise<PersistedMessage[]> {
  const { conversations } = await read()
  return conversations.find((c) => c.id === id)?.messages ?? []
}

export function saveConversation(
  id: string,
  projectId: string,
  title: string,
  messages: PersistedMessage[],
): Promise<void> {
  return enqueue(async () => {
    const store = await read()
    let resolvedProjectId = projectId
    if (!store.projects.some((p) => p.id === resolvedProjectId)) {
      resolvedProjectId = DEFAULT_PROJECT_ID
    }
    // Strictly monotonic: a save is always newer than every existing record,
    // even when two saves land in the same wall-clock millisecond. Keeps the
    // most-recent-first ordering deterministic (Date.now() alone can tie).
    const newestConv = store.conversations.reduce((max, c) => Math.max(max, c.updatedAt), 0)
    const newestProj = store.projects.reduce((max, p) => Math.max(max, p.updatedAt), 0)
    const now = Math.max(Date.now(), newestConv + 1, newestProj + 1)
    const existing = store.conversations.find((c) => c.id === id)
    if (existing) {
      if (title) existing.title = title
      existing.messages = messages
      existing.projectId = resolvedProjectId
      existing.updatedAt = now
    } else {
      store.conversations.push({
        id,
        projectId: resolvedProjectId,
        title: title || 'New conversation',
        createdAt: now,
        updatedAt: now,
        messages,
      })
    }
    const project = store.projects.find((p) => p.id === resolvedProjectId)
    if (project) project.updatedAt = now
    await write(store)
  })
}

export function deleteConversation(id: string): Promise<void> {
  return enqueue(async () => {
    const store = await read()
    const next = store.conversations.filter((c) => c.id !== id)
    if (next.length !== store.conversations.length) {
      store.conversations = next
      await write(store)
    }
  })
}

// Per-conversation model selection. These set app-owned pointers the Flue agent
// reads per turn (no backend restart). They mutate in place and do NOT bump
// updatedAt — switching models must not reorder the sidebar. No-op if the record
// doesn't exist yet (the renderer persists the thread first, so on send the
// record is present; see F-firstturn).
export function setActiveModel(id: string, providerId: string, modelId: string): Promise<void> {
  return enqueue(async () => {
    const store = await read()
    const conv = store.conversations.find((c) => c.id === id)
    if (!conv) return
    conv.providerId = providerId
    conv.modelId = modelId
    await write(store)
  })
}

export function setReasoning(id: string, reasoning: ReasoningLevel): Promise<void> {
  return enqueue(async () => {
    const store = await read()
    const conv = store.conversations.find((c) => c.id === id)
    if (!conv) return
    conv.reasoning = reasoning
    await write(store)
  })
}

// Cascade-clear pointers referencing a deleted provider (§F1d) so a stale
// `<deletedProvider>/<model>` specifier can never reach the agent. The agent
// then falls back to the app default.
export function clearProviderPointers(providerId: string): Promise<void> {
  return enqueue(async () => {
    const store = await read()
    let changed = false
    for (const c of store.conversations) {
      if (c.providerId === providerId) {
        delete c.providerId
        delete c.modelId
        changed = true
      }
    }
    if (changed) await write(store)
  })
}
