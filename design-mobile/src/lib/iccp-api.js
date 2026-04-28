/** Mirrors `desktop/src/ui/api.ts` for ICCP dashboard HTTP contract. */

export function makeApiBaseFromLocalPort(localPort) {
  return `http://127.0.0.1:${localPort}`
}

/**
 * @template T
 * @param {string} base
 * @param {string} path
 * @returns {Promise<T>}
 */
export async function apiGet(base, path) {
  const res = await fetch(`${base.replace(/\/$/, '')}${path}`, { method: 'GET', cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`)
  return res.json()
}

/**
 * @param {Record<string, unknown> | null} meta
 * @param {number} [fallbackMs]
 */
export function livePollIntervalMs(meta, fallbackMs = 450) {
  const s = meta && typeof meta.sample_interval_s === 'number' ? meta.sample_interval_s : null
  if (s == null || !Number.isFinite(s) || s <= 0) return fallbackMs
  const ms = Math.round(s * 1000)
  return Math.min(5000, Math.max(400, ms))
}
