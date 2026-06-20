import { app, BrowserWindow, shell } from 'electron'
import path from 'path'
import { flueBackend } from './flue-backend'
import { registerFlueIpc } from './ipc'

// Schemes we are willing to hand to the OS browser. Everything else is dropped.
function isExternalUrl(url: string): boolean {
  return /^(https?:|mailto:)/i.test(url)
}

// Hand http(s)/mailto URLs to the OS browser instead of letting them open a new
// in-app BrowserWindow or replace the app frame. Other schemes are dropped.
function openExternalIfSafe(url: string): void {
  if (isExternalUrl(url)) void shell.openExternal(url)
}

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
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      // The preload only touches contextBridge/ipcRenderer (no Node built-ins),
      // so it runs fine under the OS sandbox — the strongest renderer isolation.
      sandbox: true,
    },
  })

  // Assistant markdown renders links with target="_blank"; route those (and any
  // window.open) to the OS browser and never spawn a child window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    openExternalIfSafe(url)
    return { action: 'deny' }
  })

  // The app shell is the loaded index.html; nothing should replace the top
  // frame. Block every will-navigate unconditionally (covers file:/data:/
  // javascript: and relative URLs, not just http/mailto), then externalize the
  // safe schemes. Hash-history route changes fire did-navigate-in-page (not
  // will-navigate) and reloads don't emit it either, so TanStack routing and
  // Cmd-R are unaffected.
  win.webContents.on('will-navigate', (event, url) => {
    event.preventDefault()
    openExternalIfSafe(url)
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
