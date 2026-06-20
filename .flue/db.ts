import { sqlite } from '@flue/runtime/node'

// File-backed persistence so sessions and run history survive restarts.
// The Electron main process sets FLUE_DB_PATH to a file under
// app.getPath('userData'). When it is unset (e.g. plain `flue dev`), fall
// back to an in-memory database so the dev server still boots.
const dbPath = process.env.FLUE_DB_PATH?.trim()

export default sqlite(dbPath ? dbPath : undefined)
