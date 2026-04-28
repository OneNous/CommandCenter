import type { IccpBridge } from '../electron/preload'

declare global {
  interface Window {
    iccp: IccpBridge
  }
}

export {}

