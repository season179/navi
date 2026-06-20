// IPC bridge between the renderer and the Flue backend. The renderer calls
// these via the preload-exposed window.navi.flue API; the main process owns the
// SDK client and the bearer token, so the renderer only ever sees plain text.

import { BrowserWindow, dialog, ipcMain } from 'electron'
import type { FlueStatus, FlueStreamMessage, PersistedMessage } from '../shared/flue'
import { flueBackend } from './flue-backend'
import { setApiKey, setBaseUrl } from './settings'
import {
  listConversations,
  getConversation,
  saveConversation,
  deleteConversation,
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

  ipcMain.handle('flue:setApiKey', async (_evt, key: string) => {
    try {
      await setApiKey(key)
      await flueBackend.refreshApiKey()
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle('flue:setBaseUrl', async (_evt, url: string) => {
    try {
      await setBaseUrl(url)
      await flueBackend.restart()
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

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
