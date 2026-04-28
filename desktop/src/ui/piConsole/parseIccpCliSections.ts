export type IccpCliSection = {
  tag: string
  lines: string[]
}

export type ParsedIccpCli = {
  /** Lines before the first tagged section (banners, `# Reading:`, etc.). */
  preamble: string[]
  sections: IccpCliSection[]
}

const TAG_LINE = /^\[([^\]]+)\]\s*(.*)$/
const HASH_HEADING = /^#\s+(.+)$/

/**
 * Horizontal rule line: same character repeated (CoilShield `console_ui.print_commission_section`
 * uses U+2500 × 80; `hw_probe.section` uses U+2550 × 62). ASCII `=-_.` included for copies.
 */
function isHorizontalRuleLine(line: string): boolean {
  const t = line.replace(/\s+$/, '')
  if (t.length < 12) return false
  const chars = [...t]
  const uniq = new Set(chars)
  if (uniq.size !== 1) return false
  const c = chars[0]
  if (c === undefined) return false
  return (
    c === '\u2500' || // ─ commission / status tables (console_ui.py)
    c === '\u2550' || // ═ hw_probe.section() (hw_probe.py)
    c === '=' ||
    c === '-' ||
    c === '_' ||
    c === '.'
  )
}

/** Title line between two rulers: `print(f"  {title}")` in console_ui / hw_probe. */
const RULER_SANDWICH_TITLE = /^  (\S.*)$/

/**
 * Parses CoilShield CLI logs (`iccp commission`, `iccp probe`, `iccp start` / main):
 *
 * - **`[tag]` lines** — e.g. `[iccp]`, `[iccp commission]`, `[main]`, `[reference]`, `[sensors]`
 *   (iccp_cli.py, commissioning.py, reference.py, sensors.py).
 * - **`# Heading`** — e.g. `iccp live` prints `# Reading: …` before JSON (iccp_cli.py).
 * - **Ruler sandwich** — `console_ui.print_commission_section`: `─×80`, `  Title`, `─×80`;
 *   `hw_probe.section`: `═×62`, `  Title`, `═×62`.
 *
 * Pass **stderr + stdout** combined; commission errors are often on stderr first.
 */
export function parseIccpCliSections(combinedText: string): ParsedIccpCli | null {
  const raw = combinedText.replace(/\r\n/g, '\n')
  if (!raw.trim()) return null

  const lines = raw.split('\n')
  const preamble: string[] = []
  const sections: IccpCliSection[] = []
  let current: IccpCliSection | null = null

  const flush = () => {
    if (current) {
      sections.push(current)
      current = null
    }
  }

  let i = 0
  while (i < lines.length) {
    const line = lines[i]!

    if (i + 2 < lines.length && isHorizontalRuleLine(line) && isHorizontalRuleLine(lines[i + 2]!)) {
      const mid = lines[i + 1]!
      const titleM = mid.match(RULER_SANDWICH_TITLE)
      if (titleM && mid.startsWith('  ')) {
        flush()
        current = { tag: titleM[1]!.trim(), lines: [] }
        i += 3
        continue
      }
    }

    const tm = line.match(TAG_LINE)
    if (tm) {
      flush()
      const tag = tm[1]!.trim()
      const rest = tm[2] ?? ''
      current = { tag, lines: rest ? [rest] : [] }
      i += 1
      continue
    }

    const hm = line.match(HASH_HEADING)
    if (hm) {
      flush()
      current = { tag: hm[1]!.trim().slice(0, 96), lines: [] }
      i += 1
      continue
    }

    if (current) {
      current.lines.push(line)
    } else {
      preamble.push(line)
    }
    i += 1
  }
  flush()

  return { preamble, sections }
}

export function sectionSeverity(sec: IccpCliSection): 'error' | 'warn' | 'ok' | 'neutral' {
  const blob = `${sec.tag}\n${sec.lines.join('\n')}`
  if (/\bERROR\b/i.test(blob) || /\bFAIL\b/i.test(blob)) return 'error'
  if (/\bWARN(ING)?\b/i.test(blob)) return 'warn'
  if (/\bOK\b/i.test(blob) || /initialized/i.test(blob)) return 'ok'
  return 'neutral'
}
