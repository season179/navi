// Renderer-side state for Navi conversations. Wraps the window.navi.flue
// bridge: tracks the active conversation's message thread, applies streamed
// deltas to the in-flight assistant message, and persists each settled thread
// to the main-process store so conversations survive restarts.
//
// The conversation id is the Flue agent instance id, so the agent keeps its
// model context across turns *and* across restarts (Flue persists it in
// flue.db). We separately persist the display thread (the bubbles) here; the
// shared id ties the two together, so resuming a stored thread continues with
// full agent memory.

import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  ConversationMeta,
  DefaultSelection,
  FlueStatus,
  FlueStreamMessage,
  PersistedMessage,
  ProbeResult,
  ProjectMeta,
  ProviderProfile,
  ReasoningLevel,
} from '../../shared/flue'

interface ProbeReq {
  baseUrl?: string
  api: string
  apiKey: string
  id?: string
}

const DEFAULT_PROJECT_ID = 'navi-default'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  status: 'streaming' | 'done' | 'error'
}

function newId(): string {
  const c = globalThis.crypto as Crypto | undefined
  if (c && typeof c.randomUUID === 'function') return c.randomUUID()
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

/** First user line, condensed to a single ≤60-char label for the sidebar. */
function deriveTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === 'user' && m.text.trim())
  if (!firstUser) return ''
  const oneLine = firstUser.text.trim().replace(/\s+/g, ' ')
  return oneLine.length > 60 ? oneLine.slice(0, 60) + '…' : oneLine
}

/** Drop the in-flight (streaming) placeholder; only settled turns persist. */
function toPersisted(messages: ChatMessage[]): PersistedMessage[] {
  const out: PersistedMessage[] = []
  for (const m of messages) {
    if (m.status === 'streaming') continue
    out.push({ id: m.id, role: m.role, text: m.text, status: m.status === 'error' ? 'error' : 'done' })
  }
  return out
}

function fromPersisted(messages: PersistedMessage[]): ChatMessage[] {
  return messages.map((m) => ({ id: m.id, role: m.role, text: m.text, status: m.status }))
}

export interface NaviChat {
  messages: ChatMessage[]
  status: FlueStatus
  busy: boolean
  conversations: ConversationMeta[]
  projects: ProjectMeta[]
  currentId: string
  currentProjectId: string
  send(text: string): Promise<void>
  cancel(): void
  /** Start a fresh conversation (persisting the current one first). */
  newConversation(projectId?: string): void
  /** Switch to a stored conversation, loading its thread. */
  selectConversation(id: string): Promise<void>
  /** Delete a stored conversation; if it was active, start a fresh one. */
  deleteConversation(id: string): Promise<void>
  /** Open folder picker and select the new project for the next conversation. */
  createProject(): Promise<void>
  /** Select a project for the next new conversation (does not open one). */
  selectProject(id: string): Promise<void>
  /** Delete a project and its conversations. */
  deleteProject(id: string): Promise<void>
  // --- Multi-provider ---
  providerProfiles: ProviderProfile[]
  defaultSelection?: DefaultSelection
  upsertProvider(profile: ProviderProfile, apiKey?: string): Promise<{ ok: boolean; error?: string }>
  removeProvider(id: string): Promise<{ ok: boolean; error?: string }>
  probeProvider(req: ProbeReq): Promise<ProbeResult>
  setDefaultSelection(sel: DefaultSelection): Promise<void>
  /** The current conversation's resolved model + reasoning (for the composer chip). */
  activeSelection?: DefaultSelection
  /** Point the current conversation at a provider+model (persists if it has a record). */
  pickModel(providerId: string, modelId: string): void
  /** Set the current conversation's reasoning effort. */
  pickReasoning(level: ReasoningLevel): void
}

export function useNaviChat(): NaviChat {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<FlueStatus>({ ready: false, providers: [] })
  const [busy, setBusy] = useState(false)
  const [conversations, setConversations] = useState<ConversationMeta[]>([])
  const [projects, setProjects] = useState<ProjectMeta[]>([])
  const [currentProjectId, setCurrentProjectId] = useState(DEFAULT_PROJECT_ID)
  const [providerProfiles, setProviderProfiles] = useState<ProviderProfile[]>([])
  const [defaultSelection, setDefaultSelectionState] = useState<DefaultSelection | undefined>(undefined)
  const defaultSelectionRef = useRef<DefaultSelection | undefined>(undefined)
  // The current conversation's selection. Authoritative for the composer chip and
  // flushed to the conversation pointer on send (F-firstturn).
  const [activeSelection, setActiveSelectionRaw] = useState<DefaultSelection | undefined>(undefined)
  const activeSelectionRef = useRef<DefaultSelection | undefined>(undefined)

  const conversationIdRef = useRef<string>(newId())
  const [currentId, setCurrentId] = useState<string>(conversationIdRef.current)
  const currentProjectIdRef = useRef(DEFAULT_PROJECT_ID)
  const messagesRef = useRef<ChatMessage[]>([])
  const requestToMessage = useRef(new Map<string, string>())
  const pendingEvents = useRef(new Map<string, FlueStreamMessage[]>())
  const activeRequestRef = useRef<string | null>(null)
  // Requests we've abandoned (cancelled, or switched/deleted away from). Late
  // terminal events for these still cross IPC; we drop them instead of
  // buffering them forever in pendingEvents.
  const discarded = useRef(new Set<string>())

  // Single writer for both the rendered state and the ref the async helpers
  // (persist, delta application) read from, so they never see a stale thread.
  const commit = useCallback((next: ChatMessage[]) => {
    messagesRef.current = next
    setMessages(next)
  }, [])

  // Single writer for the active selection (state + the ref send() reads).
  const commitSelection = useCallback((sel: DefaultSelection | undefined) => {
    activeSelectionRef.current = sel
    setActiveSelectionRaw(sel)
  }, [])

  // Resolve a conversation's selection from its stored pointer, else the default.
  const selectionFromMeta = useCallback((meta?: ConversationMeta): DefaultSelection | undefined => {
    if (meta?.providerId && meta?.modelId) {
      return {
        providerId: meta.providerId,
        modelId: meta.modelId,
        reasoning: meta.reasoning ?? defaultSelectionRef.current?.reasoning ?? 'medium',
      }
    }
    return defaultSelectionRef.current
  }, [])

  const refreshList = useCallback(async () => {
    setConversations(await window.navi.flue.listConversations())
  }, [])

  const refreshProjects = useCallback(async () => {
    setProjects(await window.navi.flue.listProjects())
  }, [])

  const refreshProviders = useCallback(async () => {
    setProviderProfiles(await window.navi.flue.listProviders())
  }, [])

  const refreshStatus = useCallback(async () => {
    setStatus(await window.navi.flue.status())
  }, [])

  const persistCurrent = useCallback(async () => {
    const msgs = messagesRef.current
    if (msgs.length === 0) return
    await window.navi.flue.saveConversation(
      conversationIdRef.current,
      currentProjectIdRef.current,
      deriveTitle(msgs),
      toPersisted(msgs),
    )
    await Promise.all([refreshList(), refreshProjects()])
  }, [refreshList, refreshProjects])

  const applyEvent = useCallback(
    (msg: FlueStreamMessage) => {
      if (discarded.current.has(msg.requestId)) {
        // Abandoned request: drain it on its terminal event so the set stays small.
        if (msg.kind === 'done' || msg.kind === 'error') discarded.current.delete(msg.requestId)
        return
      }

      const messageId = requestToMessage.current.get(msg.requestId)
      if (!messageId) {
        // Mapping not registered yet (admission still resolving) — buffer.
        const buf = pendingEvents.current.get(msg.requestId) ?? []
        buf.push(msg)
        pendingEvents.current.set(msg.requestId, buf)
        return
      }

      if (msg.kind === 'thinking') return // not surfaced in the thread in v1

      const next = messagesRef.current.map((m): ChatMessage => {
        if (m.id !== messageId) return m
        if (msg.kind === 'delta') return { ...m, text: m.text + msg.text, status: 'streaming' }
        if (msg.kind === 'done') return { ...m, text: msg.text || m.text, status: 'done' }
        return { ...m, text: msg.error, status: 'error' }
      })
      commit(next)

      if (msg.kind === 'done' || msg.kind === 'error') {
        if (activeRequestRef.current === msg.requestId) {
          activeRequestRef.current = null
          setBusy(false)
        }
        requestToMessage.current.delete(msg.requestId)
        pendingEvents.current.delete(msg.requestId)
        void persistCurrent()
      }
    },
    [commit, persistCurrent],
  )

  // Subscribe to backend status + streamed events; load provider config once.
  useEffect(() => {
    let mounted = true
    window.navi.flue.status().then((s) => {
      if (mounted) setStatus(s)
    })
    window.navi.flue.listProviders().then((p) => {
      if (mounted) setProviderProfiles(p)
    })
    window.navi.flue.getDefaultSelection().then((d) => {
      if (!mounted) return
      setDefaultSelectionState(d)
      defaultSelectionRef.current = d
      // Seed the current conversation's selection if it hasn't been set yet
      // (fresh blank conversation before any pick / select).
      if (!activeSelectionRef.current && d) commitSelection(d)
    })
    const offStatus = window.navi.flue.onStatus((s) => setStatus(s))
    const offEvent = window.navi.flue.onEvent(applyEvent)
    return () => {
      mounted = false
      offStatus()
      offEvent()
    }
  }, [applyEvent])

  // On launch, load projects (triggers migration + persist) and the conversation
  // list, then reopen the most recent thread. Capture the pristine initial id:
  // if the user starts typing/sending or switches conversations before this
  // async load resolves, bail rather than clobbering their in-flight conversation.
  useEffect(() => {
    let mounted = true
    const initialId = conversationIdRef.current
    const pristine = () =>
      mounted && conversationIdRef.current === initialId && messagesRef.current.length === 0
    ;(async () => {
      const projectList = await window.navi.flue.listProjects()
      if (!mounted) return
      setProjects(projectList)
      const list = await window.navi.flue.listConversations()
      if (!mounted) return
      setConversations(list)
      if (list.length === 0 || !pristine()) return
      const meta = list[0]
      const loaded = await window.navi.flue.getConversation(meta.id)
      if (!pristine()) return
      conversationIdRef.current = meta.id
      setCurrentId(meta.id)
      currentProjectIdRef.current = meta.projectId
      setCurrentProjectId(meta.projectId)
      commitSelection(selectionFromMeta(meta))
      commit(fromPersisted(loaded))
    })()
    return () => {
      mounted = false
    }
  }, [commit, commitSelection, selectionFromMeta])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || busy) return

      const userMsg: ChatMessage = { id: newId(), role: 'user', text: trimmed, status: 'done' }
      const assistantId = newId()
      const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', text: '', status: 'streaming' }
      commit([...messagesRef.current, userMsg, assistantMsg])
      setBusy(true)
      // Load-bearing order [review R2]: commit first (non-empty thread, so
      // persistCurrent won't no-op), then await persist (project binding on
      // disk before the Flue child reads the store), then send.
      await persistCurrent()

      const convAtSend = conversationIdRef.current
      try {
        // F-firstturn: persistCurrent just created/updated this record, so the
        // pointer write lands on an existing record. Await it BEFORE send so the
        // agent reads the picked model on the very first turn (not the default).
        const sel = activeSelectionRef.current
        if (sel) {
          // Two independent pointer writes on the same (already-persisted) record;
          // issue both round-trips concurrently. Main-side they still serialize
          // through conversations.ts enqueue(), so there's no lost-update race.
          await Promise.all([
            window.navi.flue.setActiveModel(convAtSend, sel.providerId, sel.modelId),
            window.navi.flue.setReasoning(convAtSend, sel.reasoning),
          ])
        }
        const { requestId } = await window.navi.flue.send(convAtSend, trimmed)
        // The user switched/started another conversation while admission was in
        // flight — abandon this request so it can't strand busy state or stream
        // into the now-hidden thread.
        if (conversationIdRef.current !== convAtSend) {
          discarded.current.add(requestId)
          window.navi.flue.cancel(requestId)
          return
        }
        requestToMessage.current.set(requestId, assistantId)
        activeRequestRef.current = requestId
        // Replay any events that arrived before the mapping existed.
        const buffered = pendingEvents.current.get(requestId)
        if (buffered) {
          pendingEvents.current.delete(requestId)
          buffered.forEach(applyEvent)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        commit(
          messagesRef.current.map((m) => (m.id === assistantId ? { ...m, text: message, status: 'error' } : m)),
        )
        setBusy(false)
        void persistCurrent()
      }
    },
    [busy, commit, persistCurrent, applyEvent],
  )

  const cancel = useCallback(() => {
    const requestId = activeRequestRef.current
    if (!requestId) return
    window.navi.flue.cancel(requestId)
    discarded.current.add(requestId)
    const messageId = requestToMessage.current.get(requestId)
    commit(
      messagesRef.current.map((m) =>
        m.id === messageId
          ? { ...m, status: m.text ? 'done' : 'error', text: m.text || 'Cancelled.' }
          : m,
      ),
    )
    requestToMessage.current.delete(requestId)
    pendingEvents.current.delete(requestId)
    activeRequestRef.current = null
    setBusy(false)
    void persistCurrent()
  }, [commit, persistCurrent])

  // Abort any in-flight prompt and reset per-conversation streaming state.
  const stopActive = useCallback(() => {
    if (activeRequestRef.current) {
      window.navi.flue.cancel(activeRequestRef.current)
      discarded.current.add(activeRequestRef.current)
      activeRequestRef.current = null
    }
    requestToMessage.current.clear()
    pendingEvents.current.clear()
    setBusy(false)
  }, [])

  const startBlank = useCallback(
    (persistPrevious: boolean) => {
      if (persistPrevious) void persistCurrent()
      stopActive()
      const id = newId()
      conversationIdRef.current = id
      setCurrentId(id)
      commitSelection(defaultSelectionRef.current)
      commit([])
    },
    [commit, commitSelection, persistCurrent, stopActive],
  )

  const newConversation = useCallback(
    (projectId?: string) => {
      // Persist the outgoing conversation under its *current* project binding
      // before switching: persistCurrent reads both refs synchronously, so the
      // project ref must not flip until after it has snapshotted the old one.
      // (startBlank persists too, but only after we'd already changed the ref.)
      void persistCurrent()
      if (projectId && projectId !== currentProjectIdRef.current) {
        currentProjectIdRef.current = projectId
        setCurrentProjectId(projectId)
      }
      startBlank(false)
    },
    [persistCurrent, startBlank],
  )

  const selectConversation = useCallback(
    async (id: string) => {
      if (id === conversationIdRef.current) return
      await persistCurrent()
      stopActive()
      // Mark the target current *before* the async load so rapid switches
      // dedupe correctly and an out-of-order load for a stale target is
      // discarded rather than overwriting the thread we actually landed on.
      conversationIdRef.current = id
      setCurrentId(id)
      const list = await window.navi.flue.listConversations()
      const meta = list.find((c) => c.id === id)
      if (meta) {
        currentProjectIdRef.current = meta.projectId
        setCurrentProjectId(meta.projectId)
      }
      commitSelection(selectionFromMeta(meta))
      const loaded = await window.navi.flue.getConversation(id)
      if (conversationIdRef.current !== id) return
      commit(fromPersisted(loaded))
    },
    [commit, commitSelection, persistCurrent, selectionFromMeta, stopActive],
  )

  const selectProject = useCallback(
    async (id: string) => {
      await persistCurrent()
      currentProjectIdRef.current = id
      setCurrentProjectId(id)
      startBlank(false)
    },
    [persistCurrent, startBlank],
  )

  const createProject = useCallback(async () => {
    const p = await window.navi.flue.createProject()
    if (!p) return
    await refreshProjects()
    await selectProject(p.id)
  }, [refreshProjects, selectProject])

  const deleteProject = useCallback(
    async (id: string) => {
      if (id === currentProjectIdRef.current) {
        currentProjectIdRef.current = DEFAULT_PROJECT_ID
        setCurrentProjectId(DEFAULT_PROJECT_ID)
        startBlank(false)
      }
      await window.navi.flue.deleteProject(id)
      await refreshProjects()
      await refreshList()
    },
    [refreshList, refreshProjects, startBlank],
  )

  const deleteConversation = useCallback(
    async (id: string) => {
      // If we're deleting the active conversation, leave it for a fresh blank
      // first — startBlank aborts the in-flight stream, so no late 'done' can
      // re-save (resurrect) the record after we delete it below.
      if (id === conversationIdRef.current) startBlank(false)
      await window.navi.flue.deleteConversation(id)
      await refreshList()
    },
    [refreshList, startBlank],
  )

  const upsertProvider = useCallback(
    async (profile: ProviderProfile, apiKey?: string) => {
      const res = await window.navi.flue.upsertProvider(profile, apiKey)
      if (res.ok) await Promise.all([refreshProviders(), refreshStatus()])
      return res
    },
    [refreshProviders, refreshStatus],
  )

  const removeProvider = useCallback(
    async (id: string) => {
      const res = await window.navi.flue.deleteProvider(id)
      if (res.ok) await Promise.all([refreshProviders(), refreshStatus()])
      return res
    },
    [refreshProviders, refreshStatus],
  )

  const probeProvider = useCallback((req: ProbeReq) => window.navi.flue.probeProvider(req), [])

  const setDefaultSelection = useCallback(
    async (sel: DefaultSelection) => {
      await window.navi.flue.setDefaultSelection(sel)
      setDefaultSelectionState(sel)
      defaultSelectionRef.current = sel
      await refreshStatus()
    },
    [refreshStatus],
  )

  // Point the current conversation at a provider+model. Keep the existing
  // reasoning effort. Persist eagerly (fire-and-forget): no-ops on disk until
  // the conversation has a record, at which point send()'s flush rewrites it.
  const pickModel = useCallback(
    (providerId: string, modelId: string) => {
      const reasoning = activeSelectionRef.current?.reasoning ?? defaultSelectionRef.current?.reasoning ?? 'medium'
      commitSelection({ providerId, modelId, reasoning })
      // Fire-and-forget: no-ops on disk until the conversation has a record, at
      // which point send()'s flush rewrites it. Swallow rejections so a transient
      // IPC/write error can't become an unhandled promise rejection.
      void window.navi.flue.setActiveModel(conversationIdRef.current, providerId, modelId).catch(() => {})
    },
    [commitSelection],
  )

  // Change the current conversation's reasoning effort (keeps the model).
  const pickReasoning = useCallback(
    (level: ReasoningLevel) => {
      const cur = activeSelectionRef.current ?? defaultSelectionRef.current
      if (!cur) return
      commitSelection({ ...cur, reasoning: level })
      void window.navi.flue.setReasoning(conversationIdRef.current, level).catch(() => {})
    },
    [commitSelection],
  )

  return {
    messages,
    status,
    busy,
    conversations,
    projects,
    currentId,
    currentProjectId,
    send,
    cancel,
    newConversation,
    selectConversation,
    deleteConversation,
    createProject,
    selectProject,
    deleteProject,
    providerProfiles,
    defaultSelection,
    upsertProvider,
    removeProvider,
    probeProvider,
    setDefaultSelection,
    activeSelection,
    pickModel,
    pickReasoning,
  }
}
