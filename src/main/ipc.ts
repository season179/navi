// IPC bridge between the renderer and the Flue backend. The renderer calls
// these via the preload-exposed window.navi.flue API; the main process owns the
// SDK client and the bearer token, so the renderer only ever sees plain text.

import { BrowserWindow, dialog, ipcMain } from 'electron'
import type {
  DefaultSelection,
  FlueStatus,
  FlueStreamMessage,
  PersistedMessage,
  ProviderProfile,
  ReasoningLevel,
} from '../shared/flue'
import { flueBackend } from './flue-backend'
import {
  deleteProvider,
  getProviderKey,
  listProviders,
  setDefaultSelection,
  getDefaultSelection,
  setProviderKey,
  upsertProvider,
} from './settings'
import { probeProvider, type ProbeRequest } from './provider-probe'
import {
  listConversations,
  getConversation,
  saveConversation,
  deleteConversation,
  setActiveModel,
  setReasoning,
  clearProviderPointers,
  listProjects,
  createProject,
  deleteProject,
} from './conversations'

function broadcast(channel: string, payload: FlueStreamMessage | FlueStatus) {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) win.webContents.send(channel, payload)
  }
}

let registered = false

export function registerFlueIpc(): void {
  if (registered) return
  registered = true

  flueBackend.onStream((msg) => broadcast('flue:event', msg))
  flueBackend.onStatus((status) => broadcast('flue:status-changed', status))

  ipcMain.handle('flue:status', () => flueBackend.status())

  ipcMain.handle('flue:send', async (_evt, conversationId: string, message: string) => {
    return flueBackend.send(conversationId, message)
  })

  ipcMain.handle('flue:cancel', (_evt, requestId: string) => {
    flueBackend.cancel(requestId)
  })

  // --- Multi-provider ---

  ipcMain.handle('providers:list', () => listProviders())

  // Create/replace a provider (+ optional key), then restart so registerProvider
  // (boot-only) picks it up.
  ipcMain.handle(
    'providers:upsert',
    async (_evt, profile: ProviderProfile, apiKey?: string) => {
      try {
        await upsertProvider(profile)
        if (apiKey && apiKey.trim()) await setProviderKey(profile.id, apiKey)
        await flueBackend.restart()
        return { ok: true }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) }
      }
    },
  )

  ipcMain.handle('providers:delete', async (_evt, id: string) => {
    try {
      await deleteProvider(id)
      await clearProviderPointers(id) // cascade-clear stale conversation pointers (§F1d)
      await flueBackend.restart()
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle('providers:getDefault', () => getDefaultSelection())

  ipcMain.handle('providers:setDefault', async (_evt, sel: DefaultSelection) => {
    await setDefaultSelection(sel)
    // Refresh NAVI_DEFAULT_MODEL/_REASONING in the child. A restart failure (e.g.
    // the ready-timeout) is reported via the status emitter, so swallow it here
    // rather than rejecting the invoke — this handler returns void and the
    // renderer's awaited call has no catch (unlike the upsert/delete handlers).
    try {
      await flueBackend.restart()
    } catch {
      // surfaced through the 'status' event (lastError / ready=false)
    }
  })

  // Probe with the request's key, or fall back to the stored key for an
  // existing provider so "Test connection" works without re-entering it.
  ipcMain.handle('providers:probe', async (_evt, req: ProbeRequest) => {
    let apiKey = req.apiKey
    if (!apiKey?.trim() && req.id) {
      const k = await getProviderKey(req.id)
      if (k.state === 'ok') apiKey = k.key
    }
    return probeProvider({ ...req, apiKey })
  })

  // Per-conversation selection — store pointers only; NO restart.
  ipcMain.handle(
    'conversations:setActiveModel',
    (_evt, id: string, providerId: string, modelId: string) =>
      setActiveModel(id, providerId, modelId),
  )

  ipcMain.handle('conversations:setReasoning', (_evt, id: string, level: ReasoningLevel) =>
    setReasoning(id, level),
  )

  ipcMain.handle('projects:list', () => listProjects())

  ipcMain.handle('projects:create', async (evt) => {
    const win = BrowserWindow.fromWebContents(evt.sender) ?? BrowserWindow.getAllWindows()[0]
    const opts = {
      title: 'Select project folder',
      properties: ['openDirectory', 'createDirectory', 'dontAddToRecent'] as (
        | 'openDirectory'
        | 'createDirectory'
        | 'dontAddToRecent'
      )[],
    }
    const res = win ? await dialog.showOpenDialog(win, opts) : await dialog.showOpenDialog(opts)
    if (res.canceled || !res.filePaths[0]) return null
    return createProject(res.filePaths[0])
  })

  ipcMain.handle('projects:delete', (_e, id: string) => deleteProject(id))

  ipcMain.handle('conversations:list', () => listConversations())

  ipcMain.handle('conversations:get', (_evt, id: string) => getConversation(id))

  ipcMain.handle(
    'conversations:save',
    (_evt, id: string, projectId: string, title: string, messages: PersistedMessage[]) =>
      saveConversation(id, projectId, title, messages),
  )

  ipcMain.handle('conversations:delete', (_evt, id: string) => deleteConversation(id))
}
