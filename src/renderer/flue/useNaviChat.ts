// Renderer-side state for one Navi conversation. Wraps the window.navi.flue
// bridge: keeps a stable conversation id (the agent instance, so the agent
// remembers across turns), tracks the message thread, and applies streamed
// deltas to the in-flight assistant message.

import { useCallback, useEffect, useRef, useState } from 'react'
import type { FlueStatus, FlueStreamMessage } from '../../shared/flue'

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

export interface NaviChat {
  messages: ChatMessage[]
  status: FlueStatus
  busy: boolean
  send(text: string): Promise<void>
  cancel(): void
  reset(): void
  setApiKey(key: string): Promise<{ ok: boolean; error?: string }>
}

export function useNaviChat(): NaviChat {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<FlueStatus>({ ready: false, hasApiKey: false })
  const [busy, setBusy] = useState(false)

  const conversationIdRef = useRef<string>(newId())
  const requestToMessage = useRef(new Map<string, string>())
  const pendingEvents = useRef(new Map<string, FlueStreamMessage[]>())
  const activeRequestRef = useRef<string | null>(null)

  const applyEvent = useCallback((msg: FlueStreamMessage) => {
    const messageId = requestToMessage.current.get(msg.requestId)
    if (!messageId) {
      // Mapping not registered yet (admission still resolving) — buffer.
      const buf = pendingEvents.current.get(msg.requestId) ?? []
      buf.push(msg)
      pendingEvents.current.set(msg.requestId, buf)
      return
    }

    setMessages((prev) =>
      prev.map((m): ChatMessage => {
        if (m.id !== messageId) return m
        if (msg.kind === 'delta') return { ...m, text: m.text + msg.text, status: 'streaming' }
        if (msg.kind === 'done') return { ...m, text: msg.text || m.text, status: 'done' }
        if (msg.kind === 'error') return { ...m, text: msg.error, status: 'error' }
        return m // 'thinking' does not alter the thread text in v1
      }),
    )

    if (msg.kind === 'done' || msg.kind === 'error') {
      if (activeRequestRef.current === msg.requestId) {
        activeRequestRef.current = null
        setBusy(false)
      }
      requestToMessage.current.delete(msg.requestId)
      pendingEvents.current.delete(msg.requestId)
    }
  }, [])

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

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || busy) return

      const userMsg: ChatMessage = { id: newId(), role: 'user', text: trimmed, status: 'done' }
      const assistantId = newId()
      const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', text: '', status: 'streaming' }
      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setBusy(true)

      try {
        const { requestId } = await window.navi.flue.send(conversationIdRef.current, trimmed)
        requestToMessage.current.set(requestId, assistantId)
        activeRequestRef.current = requestId
        // Replay any events that arrived before the mapping existed.
        const buffered = pendingEvents.current.get(requestId)
        if (buffered) {
          pendingEvents.current.delete(requestId)
          buffered.forEach(applyEvent)
        }
      } catch (err) {
        const text = err instanceof Error ? err.message : String(err)
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, text, status: 'error' } : m)),
        )
        setBusy(false)
      }
    },
    [busy, applyEvent],
  )

  const cancel = useCallback(() => {
    const requestId = activeRequestRef.current
    if (!requestId) return
    window.navi.flue.cancel(requestId)
    const messageId = requestToMessage.current.get(requestId)
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, status: m.text ? 'done' : 'error', text: m.text || 'Cancelled.' }
          : m,
      ),
    )
    requestToMessage.current.delete(requestId)
    pendingEvents.current.delete(requestId)
    activeRequestRef.current = null
    setBusy(false)
  }, [])

  const reset = useCallback(() => {
    conversationIdRef.current = newId()
    requestToMessage.current.clear()
    pendingEvents.current.clear()
    activeRequestRef.current = null
    setMessages([])
    setBusy(false)
  }, [])

  const setApiKey = useCallback(async (key: string) => {
    const res = await window.navi.flue.setApiKey(key)
    if (res.ok) setStatus(await window.navi.flue.status())
    return res
  }, [])

  return { messages, status, busy, send, cancel, reset, setApiKey }
}
