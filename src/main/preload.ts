import { contextBridge, ipcRenderer } from 'electron'
import type { FlueBridge, FlueStatus, FlueStreamMessage } from '../shared/flue'

const flue: FlueBridge = {
  status: () => ipcRenderer.invoke('flue:status'),
  send: (conversationId, message) => ipcRenderer.invoke('flue:send', conversationId, message),
  cancel: (requestId) => ipcRenderer.invoke('flue:cancel', requestId),
  setApiKey: (key) => ipcRenderer.invoke('flue:setApiKey', key),
  setBaseUrl: (url) => ipcRenderer.invoke('flue:setBaseUrl', url),
  onEvent: (listener) => {
    const handler = (_evt: unknown, message: FlueStreamMessage) => listener(message)
    ipcRenderer.on('flue:event', handler)
    return () => ipcRenderer.off('flue:event', handler)
  },
  onStatus: (listener) => {
    const handler = (_evt: unknown, status: FlueStatus) => listener(status)
    ipcRenderer.on('flue:status-changed', handler)
    return () => ipcRenderer.off('flue:status-changed', handler)
  },
  listConversations: () => ipcRenderer.invoke('conversations:list'),
  getConversation: (id) => ipcRenderer.invoke('conversations:get', id),
  listProjects: () => ipcRenderer.invoke('projects:list'),
  createProject: () => ipcRenderer.invoke('projects:create'),
  deleteProject: (id) => ipcRenderer.invoke('projects:delete', id),
  saveConversation: (id, projectId, title, messages) =>
    ipcRenderer.invoke('conversations:save', id, projectId, title, messages),
  deleteConversation: (id) => ipcRenderer.invoke('conversations:delete', id),
}

contextBridge.exposeInMainWorld('navi', {
  versions: () => ({
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
  }),
  flue,
})
