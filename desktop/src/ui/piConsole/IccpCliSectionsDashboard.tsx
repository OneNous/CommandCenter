import { Card, Eyebrow, Mono, ScreenHeader, StatusDot } from '../reference/primitives'
import { T } from '../reference/tokens'
import type { ParsedIccpCli } from './parseIccpCliSections'
import { sectionSeverity } from './parseIccpCliSections'

function borderFor(sev: ReturnType<typeof sectionSeverity>): string {
  switch (sev) {
    case 'error':
      return `3px solid ${T.red}`
    case 'warn':
      return `3px solid ${T.amber}`
    case 'ok':
      return `3px solid ${T.green}`
    default:
      return `1px solid ${T.border}`
  }
}

function dotFor(sev: ReturnType<typeof sectionSeverity>): string {
  switch (sev) {
    case 'error':
      return T.red
    case 'warn':
      return T.amber
    case 'ok':
      return T.green
    default:
      return T.accentS
  }
}

export function IccpCliSectionsDashboard({
  title,
  subtitle,
  exitOk,
  parsed,
}: {
  title: string
  subtitle?: string
  exitOk: boolean
  parsed: ParsedIccpCli
}) {
  return (
    <div style={{ width: '100%', fontFamily: T.fontSans, color: T.text }}>
      <Mono size={10} color={T.subtle} style={{ display: 'block', marginBottom: 8 }}>
        Parsed CLI output · `[tag]` / `#` / ruler blocks (matches CoilShield `console_ui` + `hw_probe`)
      </Mono>
      <ScreenHeader
        title={title}
        sub={subtitle ?? ''}
        right={<StatusDot color={exitOk ? T.green : T.red} />}
      />

      {parsed.preamble.length > 0 ? (
        <Card style={{ padding: 14, marginBottom: 12, borderRadius: 16 }}>
          <Eyebrow style={{ marginBottom: 8 }}>Log · preamble</Eyebrow>
          <pre
            className="log mono"
            style={{
              margin: 0,
              fontSize: 11,
              lineHeight: 1.45,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: T.muted,
            }}
          >
            {parsed.preamble.join('\n').trimEnd()}
          </pre>
        </Card>
      ) : null}

      {parsed.sections.map((sec, i) => {
        const sev = sectionSeverity(sec)
        const body = sec.lines.join('\n').trimEnd()
        return (
          <Card
            key={`${sec.tag}-${i}`}
            style={{
              padding: 14,
              marginBottom: 12,
              borderRadius: 16,
              borderLeft: borderFor(sev),
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: dotFor(sev),
                  flexShrink: 0,
                }}
              />
              <Eyebrow style={{ margin: 0 }}>{sec.tag}</Eyebrow>
            </div>
            <pre
              className="log mono"
              style={{
                margin: 0,
                fontSize: 11,
                lineHeight: 1.45,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: sev === 'error' ? T.red : T.text,
              }}
            >
              {body || '—'}
            </pre>
          </Card>
        )
      })}
    </div>
  )
}

/** Single styled card for ops commands whose output has no `[tag]` lines yet. */
export function IccpPlainOpsCard({
  title,
  exitOk,
  combinedText,
}: {
  title: string
  exitOk: boolean
  combinedText: string
}) {
  return (
    <div style={{ width: '100%', fontFamily: T.fontSans, color: T.text }}>
      <Mono size={10} color={T.subtle} style={{ display: 'block', marginBottom: 8 }}>
        Command output
      </Mono>
      <ScreenHeader title={title} sub="Parsed line output where possible · full log below" right={<StatusDot color={exitOk ? T.green : T.red} />} />
      <Card style={{ padding: 16, borderRadius: 18, marginTop: 10 }}>
        <Eyebrow style={{ marginBottom: 8 }}>Output</Eyebrow>
        <pre
          className="log mono"
          style={{
            margin: 0,
            fontSize: 11,
            lineHeight: 1.45,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: 'min(48vh, 560px)',
            overflow: 'auto',
          }}
        >
          {combinedText.trimEnd()}
        </pre>
      </Card>
    </div>
  )
}
