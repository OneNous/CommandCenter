import type { ParsedIccpCli } from './parseIccpCliSections'

type JsonlEvent = {
  schema?: string
  ts_unix?: number
  level?: string
  cmd?: string
  source?: string
  event?: string
  msg?: string
  data?: unknown
  err?: unknown
  [key: string]: unknown
}

function tryParseLine(line: string): JsonlEvent | null {
  const t = line.trim()
  if (!t || t[0] !== '{') return null
  try {
    const o = JSON.parse(t) as unknown
    if (!o || typeof o !== 'object') return null
    return o as JsonlEvent
  } catch {
    return null
  }
}

/**
 * Parse ICCP JSONL output (one object per line) into the existing ParsedIccpCli
 * shape so the UI can reuse `IccpCliSectionsDashboard`.
 */
export function parseIccpJsonlAsSections(combinedText: string): ParsedIccpCli | null {
  const raw = combinedText.replace(/\r\n/g, '\n')
  const lines = raw.split('\n').filter((l) => l.trim().length > 0)
  if (lines.length === 0) return null

  const parsed: JsonlEvent[] = []
  for (const ln of lines) {
    const ev = tryParseLine(ln)
    if (ev && ev.schema === 'iccp.cli.event.v1') parsed.push(ev)
  }

  // Require that a meaningful fraction of lines are valid ICCP JSONL.
  if (parsed.length < 2) return null
  if (parsed.length / lines.length < 0.6) return null

  const sections: ParsedIccpCli['sections'] = []
  const byKey = new Map<string, string[]>()
  const order: string[] = []

  for (const ev of parsed) {
    const key = `${ev.cmd ?? 'cmd'} · ${ev.event ?? 'event'}`
    if (!byKey.has(key)) {
      byKey.set(key, [])
      order.push(key)
    }
    const ts = typeof ev.ts_unix === 'number' ? new Date(ev.ts_unix * 1000).toLocaleTimeString() : '—'
    const lvl = typeof ev.level === 'string' ? ev.level.toUpperCase() : 'INFO'
    const src = typeof ev.source === 'string' ? ev.source : 'iccp'
    const msg = typeof ev.msg === 'string' && ev.msg.trim() ? ev.msg.trim() : '(no msg)'
    const bits = [`${ts}`, lvl, src, msg]
    if (ev.err != null) bits.push(`err=${JSON.stringify(ev.err)}`)
    byKey.get(key)!.push(bits.join(' · '))
  }

  for (const tag of order) {
    sections.push({ tag, lines: byKey.get(tag) ?? [] })
  }

  return { preamble: [], sections }
}

