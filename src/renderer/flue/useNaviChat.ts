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
  FlueStatus,
  FlueStreamMessage,
  PersistedMessage,
} from '../../shared/flue'

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
  currentId: string
  send(text: string): Promise<void>
  cancel(): void
  /** Start a fresh conversation (persisting the current one first). */
  newConversation(): void
  /** Switch to a stored conversation, loading its thread. */
  selectConversation(id: string): Promise<void>
  /** Delete a stored conversation; if it was active, start a fresh one. */
  deleteConversation(id: string): Promise<void>
  setApiKey(key: string): Promise<{ ok: boolean; error?: string }>
  setBaseUrl(url: string): Promise<{ ok: boolean; error?: string }>
}

export function useNaviChat(): NaviChat {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<FlueStatus>({ ready: false, hasApiKey: false })
  const [busy, setBusy] = useState(false)
  const [conversations, setConversations] = useState<ConversationMeta[]>([])

  const conversationIdRef = useRef<string>(newId())
  const [currentId, setCurrentId] = useState<string>(conversationIdRef.current)
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

  const refreshList = useCallback(async () => {
    setConversations(await window.navi.flue.listConversations())
  }, [])

  const persistCurrent = useCallback(async () => {
    const msgs = messagesRef.current
    if (msgs.length === 0) return
    await window.navi.flue.saveConversation(conversationIdRef.current, deriveTitle(msgs), toPersisted(msgs))
    await refreshList()
  }, [refreshList])

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

  // Subscribe to backend status + streamed events.
  useEffect(() => {
    let mounted = true
    window.navi.flue.status().then((s) => {
      if (mounted) setStatus(s)
    })
    const offStatus = window.navi.flue.onStatus((s) => setStatus(s))
    const offEvent = window.navi.flue.onEvent(applyEvent)
    return () => {
      mounted = false
      offStatus()
      offEvent()
    }
  }, [applyEvent])

  // On launch, load the conversation list and reopen the most recent thread.
  // Capture the pristine initial id: if the user starts typing/sending or
  // switches conversations before this async load resolves, bail rather than
  // clobbering their in-flight conversation.
  useEffect(() => {
    let mounted = true
    const initialId = conversationIdRef.current
    const pristine = () =>
      mounted && conversationIdRef.current === initialId && messagesRef.current.length === 0
    ;(async () => {
      const list = await window.navi.flue.listConversations()
      if (!mounted) return
      setConversations(list)
      if (list.length === 0 || !pristine()) return
      const id = list[0].id
      const loaded = await window.navi.flue.getConversation(id)
      if (!pristine()) return
      conversationIdRef.current = id
      setCurrentId(id)
      commit(fromPersisted(loaded))
    })()
    return () => {
      mounted = false
    }
  }, [commit])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || busy) return

      const userMsg: ChatMessage = { id: newId(), role: 'user', text: trimmed, status: 'done' }
      const assistantId = newId()
      const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', text: '', status: 'streaming' }
      commit([...messagesRef.current, userMsg, assistantMsg])
      setBusy(true)
      // Persist now (the streaming placeholder is excluded) so the conversation
      // appears in the list immediately, before the first token arrives.
      void persistCurrent()

      const convAtSend = conversationIdRef.current
      try {
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
      commit([])
    },
    [commit, persistCurrent, stopActive],
  )

  const newConversation = useCallback(() => startBlank(true), [startBlank])

  const selectConversation = useCallback(
    async (id: string) => {
      if (id === conversationIdRef.current) return
      void persistCurrent()
      stopActive()
      // Mark the target current *before* the async load so rapid switches
      // dedupe correctly and an out-of-order load for a stale target is
      // discarded rather than overwriting the thread we actually landed on.
      conversationIdRef.current = id
      setCurrentId(id)
      const loaded = await window.navi.flue.getConversation(id)
      if (conversationIdRef.current !== id) return
      commit(fromPersisted(loaded))
    },
    [commit, persistCurrent, stopActive],
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

  const setApiKey = useCallback(async (key: string) => {
    const res = await window.navi.flue.setApiKey(key)
    if (res.ok) setStatus(await window.navi.flue.status())
    return res
  }, [])

  const setBaseUrl = useCallback(async (url: string) => {
    const res = await window.navi.flue.setBaseUrl(url)
    if (res.ok) setStatus(await window.navi.flue.status())
    return res
  }, [])

  return {
    messages,
    status,
    busy,
    conversations,
    currentId,
    send,
    cancel,
    newConversation,
    selectConversation,
    deleteConversation,
    setApiKey,
    setBaseUrl,
  }
}
