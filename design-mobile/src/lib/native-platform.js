import { Capacitor } from '@capacitor/core'

/**
 * @returns {'ios' | 'android'}
 */
export function getNativePlatform() {
  if (typeof window === 'undefined') return 'ios'
  if (Capacitor.isNativePlatform()) {
    return Capacitor.getPlatform() === 'android' ? 'android' : 'ios'
  }
  return /android/i.test(navigator.userAgent) ? 'android' : 'ios'
}
