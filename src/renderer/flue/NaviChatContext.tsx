// Shares one useNaviChat instance across the app so the sidebar (conversation
// list + "new") and the home route (active thread + composer) drive the same
// state. Provided once near the root, above the router.
//
// The state is split into two contexts on purpose. The *thread* slice changes
// on every streamed token (messages); the *list* slice changes only when the
// conversation set or selection changes. Keeping them separate means the
// sidebar (a list consumer) does not re-render on every delta of an in-flight
// reply — only the chat view (a thread consumer) does.

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useNaviChat, type NaviChat } from './useNaviChat'

type ThreadValue = Pick<
  NaviChat,
  | 'messages'
  | 'status'
  | 'busy'
  | 'send'
  | 'cancel'
  // The composer model picker is a thread consumer: the active selection is
  // per-conversation, and picking changes it without touching the list slice.
  | 'activeSelection'
  | 'pickModel'
  | 'pickReasoning'
>
type ListValue = Pick<
  NaviChat,
  | 'conversations'
  | 'projects'
  | 'currentId'
  | 'currentProjectId'
  | 'newConversation'
  | 'selectConversation'
  | 'deleteConversation'
  | 'createProject'
  | 'selectProject'
  | 'deleteProject'
  // Provider config + CRUD live here (infrequent changes), not in the thread slice.
  | 'providerProfiles'
  | 'defaultSelection'
  | 'upsertProvider'
  | 'removeProvider'
  | 'probeProvider'
  | 'setDefaultSelection'
>

const ThreadContext = createContext<ThreadValue | null>(null)
const ListContext = createContext<ListValue | null>(null)

export function NaviChatProvider({ children }: { children: ReactNode }) {
  const chat = useNaviChat()

  const thread = useMemo<ThreadValue>(
    () => ({
      messages: chat.messages,
      status: chat.status,
      busy: chat.busy,
      send: chat.send,
      cancel: chat.cancel,
      activeSelection: chat.activeSelection,
      pickModel: chat.pickModel,
      pickReasoning: chat.pickReasoning,
    }),
    [
      chat.messages,
      chat.status,
      chat.busy,
      chat.send,
      chat.cancel,
      chat.activeSelection,
      chat.pickModel,
      chat.pickReasoning,
    ],
  )

  const list = useMemo<ListValue>(
    () => ({
      conversations: chat.conversations,
      projects: chat.projects,
      currentId: chat.currentId,
      currentProjectId: chat.currentProjectId,
      newConversation: chat.newConversation,
      selectConversation: chat.selectConversation,
      deleteConversation: chat.deleteConversation,
      createProject: chat.createProject,
      selectProject: chat.selectProject,
      deleteProject: chat.deleteProject,
      providerProfiles: chat.providerProfiles,
      defaultSelection: chat.defaultSelection,
      upsertProvider: chat.upsertProvider,
      removeProvider: chat.removeProvider,
      probeProvider: chat.probeProvider,
      setDefaultSelection: chat.setDefaultSelection,
    }),
    [
      chat.conversations,
      chat.projects,
      chat.currentId,
      chat.currentProjectId,
      chat.newConversation,
      chat.selectConversation,
      chat.deleteConversation,
      chat.createProject,
      chat.selectProject,
      chat.deleteProject,
      chat.providerProfiles,
      chat.defaultSelection,
      chat.upsertProvider,
      chat.removeProvider,
      chat.probeProvider,
      chat.setDefaultSelection,
    ],
  )

  return (
    <ListContext.Provider value={list}>
      <ThreadContext.Provider value={thread}>{children}</ThreadContext.Provider>
    </ListContext.Provider>
  )
}

/** Active thread + composer state (re-renders on every streamed token). */
export function useNaviThread(): ThreadValue {
  const ctx = useContext(ThreadContext)
  if (!ctx) throw new Error('useNaviThread must be used within a NaviChatProvider')
  return ctx
}

/** Conversation list + selection actions (re-renders only on list changes). */
export function useNaviList(): ListValue {
  const ctx = useContext(ListContext)
  if (!ctx) throw new Error('useNaviList must be used within a NaviChatProvider')
  return ctx
}
