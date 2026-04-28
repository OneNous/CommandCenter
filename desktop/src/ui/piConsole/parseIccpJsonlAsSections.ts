import type { ParsedIccpCli } from './parseIccpCliSections'
import { parseIccpCliJsonl } from './parseIccpCliJsonl'

/**
 * Parse ICCP JSONL into the legacy `ParsedIccpCli` shape for `IccpCliSectionsDashboard`.
 */
export function parseIccpJsonlAsSections(combinedText: string): ParsedIccpCli | null {
  const parsed = parseIccpCliJsonl(combinedText)
  if (!parsed) return null

  const sections: ParsedIccpCli['sections'] = []
  const byKey = new Map<string, string[]>()
  const order: string[] = []

  for (const ev of parsed.events) {
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
