// Persistent store for the *display threads* of Navi conversations — the
// message bubbles the renderer shows. This is distinct from the agent's own
// memory: Flue persists each conversation's model context in flue.db keyed by
// the same conversation id, so resuming a stored thread and sending again
// continues with full context. We only own what to render.
//
// Backed by a single JSON file under userData, written atomically (temp +
// rename) and with mutations serialized through a queue so concurrent saves
// can't lose updates.

import { app } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'
import type { ConversationMeta, PersistedMessage } from '../shared/flue'

interface ConversationRecord extends ConversationMeta {
  messages: PersistedMessage[]
}

interface Store {
  conversations: ConversationRecord[]
}

function storePath(): string {
  // An explicit path wins (tests, or relocating the store); otherwise default
  // to userData. Mirrors FLUE_DB_PATH's dev/test fallback in .flue/db.ts.
  const override = process.env.NAVI_CONVERSATIONS_PATH?.trim()
  return override ? override : path.join(app.getPath('userData'), 'navi-conversations.json')
}

async function read(): Promise<Store> {
  const file = storePath()
  let raw: string
  try {
    raw = await fs.readFile(file, 'utf8')
  } catch {
    return { conversations: [] } // no file yet — fresh start
  }
  try {
    const parsed = JSON.parse(raw) as Partial<Store>
    return { conversations: Array.isArray(parsed.conversations) ? parsed.conversations : [] }
  } catch {
    // The file exists but is corrupt. Preserve it instead of silently
    // overwriting (the next save would otherwise destroy recoverable data),
    // then start fresh.
    try {
      await fs.rename(file, `${file}.corrupt-${Date.now()}`)
    } catch {
      // best effort — if we can't move it aside, still avoid throwing here
    }
    return { conversations: [] }
  }
}

async function write(store: Store): Promise<void> {
  const file = storePath()
  await fs.mkdir(path.dirname(file), { recursive: true })
  const tmp = `${file}.tmp`
  await fs.writeFile(tmp, JSON.stringify(store, null, 2), { mode: 0o600 })
  await fs.rename(tmp, file) // atomic: readers never see a torn file
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

export async function listConversations(): Promise<ConversationMeta[]> {
  const { conversations } = await read()
  return conversations
    .map(({ id, title, createdAt, updatedAt }) => ({ id, title, createdAt, updatedAt }))
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getConversation(id: string): Promise<PersistedMessage[]> {
  const { conversations } = await read()
  return conversations.find((c) => c.id === id)?.messages ?? []
}

export function saveConversation(
  id: string,
  title: string,
  messages: PersistedMessage[],
): Promise<void> {
  return enqueue(async () => {
    const store = await read()
    // Strictly monotonic: a save is always newer than every existing record,
    // even when two saves land in the same wall-clock millisecond. Keeps the
    // most-recent-first ordering deterministic (Date.now() alone can tie).
    const newest = store.conversations.reduce((max, c) => Math.max(max, c.updatedAt), 0)
    const now = Math.max(Date.now(), newest + 1)
    const existing = store.conversations.find((c) => c.id === id)
    if (existing) {
      if (title) existing.title = title
      existing.messages = messages
      existing.updatedAt = now
    } else {
      store.conversations.push({
        id,
        title: title || 'New conversation',
        createdAt: now,
        updatedAt: now,
        messages,
      })
    }
    await write(store)
  })
}

export function deleteConversation(id: string): Promise<void> {
  return enqueue(async () => {
    const store = await read()
    const next = store.conversations.filter((c) => c.id !== id)
    if (next.length !== store.conversations.length) await write({ conversations: next })
  })
}
