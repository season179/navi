// IPC bridge between the renderer and the Flue backend. The renderer calls
// these via the preload-exposed window.navi.flue API; the main process owns the
// SDK client and the bearer token, so the renderer only ever sees plain text.

import { BrowserWindow, ipcMain } from 'electron'
import type { FlueStatus, FlueStreamMessage } from '../shared/flue'
import { flueBackend } from './flue-backend'
import { setApiKey, clearApiKey } from './settings'

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

  ipcMain.handle('flue:clearApiKey', async () => {
    await clearApiKey()
    await flueBackend.refreshApiKey()
  })
}
