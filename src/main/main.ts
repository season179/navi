import { app, BrowserWindow } from 'electron'
import path from 'path'
import { flueBackend } from './flue-backend'
import { registerFlueIpc } from './ipc'

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 720,
    minHeight: 480,
    backgroundColor: '#0f1422',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.loadFile(path.join(__dirname, '../../index.html'))
}

app.whenReady().then(() => {
  registerFlueIpc()
  createWindow()
  // Start the agent backend in the background. The renderer reflects readiness
  // via flue:status / flue:status-changed; a failed start surfaces as an error
  // in the status rather than blocking the window.
  flueBackend.start().catch((err) => {
    console.error('[flue] backend failed to start:', err)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// Tear the child down cleanly so it never outlives the app. Defer the quit
// once until the child has exited, then hard-exit (app.exit does not re-emit
// before-quit, so this runs at most once).
let stopping = false
app.on('before-quit', (event) => {
  if (stopping) return
  stopping = true
  event.preventDefault()
  flueBackend.stop().finally(() => app.exit(0))
})
