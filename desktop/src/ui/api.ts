export function makeApiBase(localPort: number) {
  return `http://127.0.0.1:${localPort}`
}

export async function apiGet<T>(base: string, path: string): Promise<T> {
  const res = await fetch(`${base}${path}`, { method: 'GET' })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`)
  return (await res.json()) as T
}

/** `/api/meta` — see ICCP `docs/desktop-app-integration.md` and `dashboard.py` `api_meta`. */
export type ApiMeta = {
  package?: string
  package_version?: string | null
  num_channels?: number
  sample_interval_s?: number
  target_ma?: number
  max_ma?: number
  pwm_frequency_hz?: number
  sim_mode?: boolean
  log_dir?: string
  latest_json?: string
  sqlite_db?: string
  [key: string]: unknown
}

/** `/api/live` envelope fields the desktop UI depends on; body extends `latest.json`. */
export type ApiLive = {
  feed_ok?: boolean
  feed_trust_channel_metrics?: boolean
  feed_age_s?: number
  /** Age of ``latest.json`` on disk from mtime (controller not writing if large). */
  feed_file_mtime_unix?: number
  json_payload_age_s?: number
  feed_stale_threshold_s?: number
  /** From dashboard: ``file_mtime`` / ``json_ts`` / ``telemetry_incomplete``. */
  feed_stale_reasons?: string[]
  telemetry_incomplete?: boolean
  channels?: Record<string, unknown>
  [key: string]: unknown
}

export function livePollIntervalMs(meta: ApiMeta | null, fallbackMs = 450) {
  const s = meta?.sample_interval_s
  if (typeof s !== 'number' || !Number.isFinite(s) || s <= 0) return fallbackMs
  const ms = Math.round(s * 1000)
  return Math.min(5000, Math.max(400, ms))
}

