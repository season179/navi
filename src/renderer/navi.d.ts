import type { FlueBridge } from '../shared/flue'

declare global {
  interface Window {
    navi: {
      versions(): { electron: string; node: string; chrome: string }
      flue: FlueBridge
    }
  }
}

export {}
