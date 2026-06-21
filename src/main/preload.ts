import { contextBridge, ipcRenderer } from 'electron'
import type { FlueBridge, FlueStatus, FlueStreamMessage } from '../shared/flue'

const flue: FlueBridge = {
  status: () => ipcRenderer.invoke('flue:status'),
  send: (conversationId, message) => ipcRenderer.invoke('flue:send', conversationId, message),
  cancel: (requestId) => ipcRenderer.invoke('flue:cancel', requestId),
  listProviders: () => ipcRenderer.invoke('providers:list'),
  upsertProvider: (profile, apiKey) => ipcRenderer.invoke('providers:upsert', profile, apiKey),
  deleteProvider: (id) => ipcRenderer.invoke('providers:delete', id),
  getDefaultSelection: () => ipcRenderer.invoke('providers:getDefault'),
  setDefaultSelection: (sel) => ipcRenderer.invoke('providers:setDefault', sel),
  probeProvider: (req) => ipcRenderer.invoke('providers:probe', req),
  setActiveModel: (conversationId, providerId, modelId) =>
    ipcRenderer.invoke('conversations:setActiveModel', conversationId, providerId, modelId),
  setReasoning: (conversationId, level) =>
    ipcRenderer.invoke('conversations:setReasoning', conversationId, level),
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

  // --- Agent skills ---
  listSkills: (projectPath) => ipcRenderer.invoke('skills:list', projectPath),
  getSkill: (source, name, projectPath) =>
    ipcRenderer.invoke('skills:get', source, name, projectPath),
  createGlobalSkill: (draft) => ipcRenderer.invoke('skills:createGlobal', draft),
  updateGlobalSkill: (name, draft) => ipcRenderer.invoke('skills:updateGlobal', name, draft),
  deleteGlobalSkill: (name) => ipcRenderer.invoke('skills:deleteGlobal', name),
  setGlobalSkillEnabled: (name, enabled) =>
    ipcRenderer.invoke('skills:setEnabled', name, enabled),
  openSkillFile: (source, name) => ipcRenderer.invoke('skills:openFile', source, name),
}

contextBridge.exposeInMainWorld('navi', {
  versions: () => ({
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
  }),
  flue,
})
