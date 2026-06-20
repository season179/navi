import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('navi', {
  versions: () => ({
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
  }),
})
