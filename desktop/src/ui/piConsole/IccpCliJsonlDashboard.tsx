import { Card, Eyebrow, Mono, ScreenHeader, StatusDot } from '../reference/primitives'
import { T } from '../reference/tokens'
import type { IccpCliEventV1, IccpCliJsonlProgress } from './parseIccpCliJsonl'

function levelColor(level: string | undefined): string {
  const l = (level ?? 'info').toLowerCase()
  if (l === 'error') return T.red
  if (l === 'warn' || l === 'warning') return T.amber
  if (l === 'debug') return T.muted
  return T.accentS
}

function ProgressBar({ p }: { p: IccpCliJsonlProgress }) {
  const cur = typeof p.current === 'number' ? p.current : 0
  const tot = typeof p.total === 'number' && p.total > 0 ? p.total : null
  const pct =
    typeof p.pct === 'number' && Number.isFinite(p.pct)
      ? Math.min(100, Math.max(0, p.pct))
      : tot !== null
        ? Math.min(100, Math.max(0, (cur / tot) * 100))
        : null
  if (pct === null) return null
  return (
    <div
      style={{
        marginTop: 6,
        height: 6,
        borderRadius: 3,
        background: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
        maxWidth: 280,
      }}
    >
      <div style={{ width: `${pct}%`, height: '100%', background: T.accentS }} />
    </div>
  )
}

export function IccpCliJsonlDashboard({
  title,
  subtitle,
  exitOk,
  events,
}: {
  title: string
  subtitle?: string
  exitOk: boolean
  events: IccpCliEventV1[]
}) {
  return (
    <div style={{ width: '100%', fontFamily: T.fontSans, color: T.text }}>
      <Mono size={10} color={T.subtle} style={{ display: 'block', marginBottom: 8 }}>
        ICCP JSONL · iccp.cli.event.v1
      </Mono>
      <ScreenHeader title={title} sub={subtitle ?? ''} right={<StatusDot color={exitOk ? T.green : T.red} />} />

      {events.map((ev, i) => {
        const evName = typeof ev.event === 'string' ? ev.event : 'event'
        const msg = typeof ev.msg === 'string' ? ev.msg : ''
        const src = typeof ev.source === 'string' ? ev.source : 'iccp'
        const cmd = typeof ev.cmd === 'string' ? ev.cmd : ''
        const ts =
          typeof ev.ts_unix === 'number' ? new Date(ev.ts_unix * 1000).toLocaleTimeString() : '—'
        const dot = levelColor(ev.level)
        const prog = ev.progress as IccpCliJsonlProgress | undefined

        return (
          <Card
            key={`${evName}-${i}-${ts}`}
            style={{
              padding: 12,
              marginBottom: 10,
              borderRadius: 14,
              borderLeft: `3px solid ${dot}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: dot,
                  flexShrink: 0,
                }}
              />
              <Eyebrow style={{ margin: 0 }}>{evName}</Eyebrow>
              <Mono size={10} color={T.muted}>
                {ts} · {cmd} · {src}
              </Mono>
            </div>
            {msg ? (
              <Mono size={11} color={T.text} style={{ display: 'block', lineHeight: 1.45 }}>
                {msg}
              </Mono>
            ) : null}
            {prog && (typeof prog.current === 'number' || typeof prog.pct === 'number') ? (
              <ProgressBar p={prog} />
            ) : null}
            {ev.err != null ? (
              <pre
                className="log mono"
                style={{
                  margin: '8px 0 0',
                  fontSize: 10,
                  color: T.red,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {typeof ev.err === 'object' ? JSON.stringify(ev.err, null, 2) : String(ev.err)}
              </pre>
            ) : null}
            {ev.data != null && typeof ev.data === 'object' && Object.keys(ev.data as object).length > 0 ? (
              <details style={{ marginTop: 8, color: T.muted }}>
                <summary style={{ cursor: 'pointer', fontSize: 11 }}>data</summary>
                <pre
                  className="log mono"
                  style={{
                    margin: '6px 0 0',
                    fontSize: 10,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {JSON.stringify(ev.data, null, 2)}
                </pre>
              </details>
            ) : null}
          </Card>
        )
      })}
    </div>
  )
}
