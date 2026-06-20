import { contextBridge, ipcRenderer } from 'electron'
import type { FlueBridge, FlueStatus, FlueStreamMessage } from '../shared/flue'

const flue: FlueBridge = {
  status: () => ipcRenderer.invoke('flue:status'),
  send: (conversationId, message) => ipcRenderer.invoke('flue:send', conversationId, message),
  cancel: (requestId) => ipcRenderer.invoke('flue:cancel', requestId),
  setApiKey: (key) => ipcRenderer.invoke('flue:setApiKey', key),
  clearApiKey: () => ipcRenderer.invoke('flue:clearApiKey'),
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
}

contextBridge.exposeInMainWorld('navi', {
  versions: () => ({
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
  }),
  flue,
})
