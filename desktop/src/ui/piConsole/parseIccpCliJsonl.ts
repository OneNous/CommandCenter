/**
 * Parse CoilShield `iccp` JSONL (`iccp.cli.event.v1`, one object per line).
 */

export type IccpCliJsonlProgress = {
  current?: number
  total?: number
  pct?: number
}

export type IccpCliEventV1 = {
  schema?: string
  ts_unix?: number
  level?: string
  cmd?: string
  source?: string
  event?: string
  msg?: string
  step?: string | number
  progress?: IccpCliJsonlProgress
  data?: unknown
  err?: unknown
  [key: string]: unknown
}

function tryParseLine(line: string): IccpCliEventV1 | null {
  const t = line.trim()
  if (!t || t[0] !== '{') return null
  try {
    const o = JSON.parse(t) as unknown
    if (!o || typeof o !== 'object') return null
    return o as IccpCliEventV1
  } catch {
    return null
  }
}

export type ParsedIccpCliJsonl = {
  events: IccpCliEventV1[]
}

/**
 * Returns structured ICCP CLI events when `combinedText` looks like an ICCP JSONL stream.
 */
export function parseIccpCliJsonl(combinedText: string): ParsedIccpCliJsonl | null {
  const raw = combinedText.replace(/\r\n/g, '\n')
  const lines = raw.split('\n').filter((l) => l.trim().length > 0)
  if (lines.length === 0) return null

  const events: IccpCliEventV1[] = []
  for (const ln of lines) {
    const ev = tryParseLine(ln)
    if (ev && ev.schema === 'iccp.cli.event.v1') events.push(ev)
  }

  const jsonLikeLines = lines.filter((l) => l.trim().startsWith('{'))
  if (events.length < 1) return null
  const denom = Math.max(jsonLikeLines.length, 1)
  if (events.length / denom < 0.5) return null

  return { events }
}
