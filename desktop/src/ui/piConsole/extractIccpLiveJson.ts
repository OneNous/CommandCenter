import type { ApiLive } from '../api'

/**
 * Extract first top-level JSON object from mixed text (e.g. `iccp live` banner + `# Reading:` + `{...}`).
 */
export function extractFirstJsonObject(text: string): unknown | null {
  const start = text.indexOf('{')
  if (start < 0) return null
  let depth = 0
  let inString = false
  let escape = false
  for (let i = start; i < text.length; i++) {
    const c = text[i]
    if (inString) {
      if (escape) {
        escape = false
      } else if (c === '\\') {
        escape = true
      } else if (c === '"') {
        inString = false
      }
      continue
    }
    if (c === '"') {
      inString = true
      continue
    }
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(start, i + 1))
        } catch {
          return null
        }
      }
    }
  }
  return null
}

/** True when parsed JSON looks like `latest.json` / `iccp live` snapshot. */
export function tryParseIccpLiveSnapshot(stdout: string): ApiLive | null {
  const raw = extractFirstJsonObject(stdout)
  if (!raw || typeof raw !== 'object' || raw === null) return null
  const o = raw as Record<string, unknown>
  if (typeof o.channels !== 'object' || o.channels === null) return null
  const hasTelemetry =
    o.total_ma !== undefined ||
    o.telemetry_seq !== undefined ||
    o.supply_v_avg !== undefined
  if (!hasTelemetry) return null
  return raw as ApiLive
}
