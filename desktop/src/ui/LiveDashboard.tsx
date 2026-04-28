import type { ApiLive, ApiMeta } from './api'
import {
  AlertBar,
  Card,
  ChannelRow,
  Eyebrow,
  Mini,
  Mono,
  Pill,
  Row,
  ScreenHeader,
  StatusDot,
} from './reference/primitives'
import { T } from './reference/tokens'
import { humanAgeSeconds, mapLiveToDashboard } from './live/mapLiveToDashboard'

export function LiveDashboard({
  apiBase,
  live,
  meta,
}: {
  apiBase: string
  live: ApiLive | null
  meta: ApiMeta | null
}) {
  if (!live) {
    return (
      <p style={{ color: T.muted, fontFamily: T.fontSans, margin: '12px 20px' }}>
        Waiting for first /api/live response…
      </p>
    )
  }

  const d = mapLiveToDashboard(live, meta)

  const powLabel = d.totalPowW != null ? d.totalPowW.toFixed(3) : '—'
  const supplyLabel = d.supplyV != null ? d.supplyV.toFixed(2) : '—'
  const tempLabel = d.tempF != null ? d.tempF.toFixed(1) : '—'

  const refPillState =
    d.ref.band.toUpperCase().includes('RANGE') || d.ref.band.toUpperCase().includes('OK')
      ? 'PROTECTING'
      : d.ref.band.toUpperCase().includes('FAULT')
        ? 'FAULT'
        : 'REGULATE'

  return (
    <div
      style={{
        padding: '8px 0 48px',
        color: T.text,
        fontFamily: T.fontSans,
        maxWidth: 720,
      }}
    >
      <div style={{ padding: '0 20px 8px' }}>
        <Mono size={11} color={T.subtle}>
          {apiBase}
        </Mono>
      </div>

      <ScreenHeader title={d.headerTitle} sub={d.feedSubtitle} right={<StatusDot color={d.statusColor} />} />

      <div style={{ padding: '8px 16px 14px' }}>
        <Card
          glow={['#040a0a', '#0a1615', '#122624', '#1a3834', '#2dd4bf', '#d1faf4']}
          style={{ padding: 22, borderRadius: 22 }}
        >
          <Eyebrow>Total output</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <Mono size={48} weight={600} style={{ letterSpacing: '-0.04em', lineHeight: 0.95 }}>
              {d.totalMa.toFixed(3)}
            </Mono>
            <Mono size={16} weight={500} color={T.muted}>
              mA
            </Mono>
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 18, flexWrap: 'wrap' }}>
            <Mini label="Power" value={powLabel} unit={d.totalPowW != null ? 'W' : undefined} />
            <Mini label="Supply" value={supplyLabel} unit={d.supplyV != null ? 'V' : undefined} />
            <Mini label="Temp" value={tempLabel} unit={d.tempF != null ? '°F' : undefined} />
            <Mini label="Protecting" value={`${d.protCount}/${d.channels.length}`} />
          </div>
        </Card>
      </div>

      <div style={{ padding: '0 16px 14px' }}>
        <Card style={{ padding: 14 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <Eyebrow style={{ color: T.muted }}>Reference · Ag/AgCl</Eyebrow>
            <Pill state={refPillState} size="sm">
              {d.ref.band}
            </Pill>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: T.subtle,
                  fontFamily: T.fontSans,
                  marginBottom: 2,
                }}
              >
                Raw
              </div>
              <Mono size={18} weight={500}>
                {d.ref.rawMv != null ? d.ref.rawMv.toFixed(1) : '—'}
                {d.ref.rawMv != null ? (
                  <Mono color={T.subtle} size={11} weight={400} style={{ marginLeft: 3 }}>
                    mV
                  </Mono>
                ) : null}
              </Mono>
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: T.subtle,
                  fontFamily: T.fontSans,
                  marginBottom: 2,
                }}
              >
                Shift
              </div>
              <Mono size={18} weight={500}>
                {d.ref.shiftMv != null ? `+${d.ref.shiftMv.toFixed(1)}` : '—'}
                {d.ref.shiftMv != null ? (
                  <Mono color={T.subtle} size={11} weight={400} style={{ marginLeft: 3 }}>
                    mV
                  </Mono>
                ) : null}
              </Mono>
            </div>
          </div>
          {d.ref.adc ? (
            <Mono size={11} color={T.subtle} style={{ marginTop: 10 }}>
              {d.ref.adc}
            </Mono>
          ) : null}
        </Card>
      </div>

      <div
        style={{
          padding: '0 20px 8px',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: T.text,
          }}
        >
          Channels
        </h2>
        <Mono size={11} color={T.subtle}>
          {d.channels.length} of {d.maxChannels}
        </Mono>
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {d.channels.length === 0 ? (
          <Mono size={13} color={T.muted}>
            No channel rows in this payload — expand Raw JSON below to inspect keys.
          </Mono>
        ) : (
          d.channels.map((ch) => <ChannelRow key={`${ch.idx}-${ch.name}`} ch={ch} />)
        )}
      </div>

      <div style={{ padding: '20px 20px 6px' }}>
        <h2
          style={{
            margin: '0 0 8px',
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: T.text,
          }}
        >
          Telemetry details
        </h2>
      </div>
      <div style={{ padding: '0 16px 12px' }}>
        <Card style={{ padding: 14 }}>
          <Row k="File age (mtime) · feed_age_s" v={d.fileAgeS != null ? humanAgeSeconds(d.fileAgeS) : '—'} />
          <Row k="JSON ts age" v={d.jsonAgeS != null ? humanAgeSeconds(d.jsonAgeS) : '—'} />
          <Row k="feed_ok" v={String(d.feedOk)} />
          <Row k="Channel metrics trusted" v={String(d.trustMetrics)} />
          <div style={{ paddingTop: 8 }}>
            <Eyebrow style={{ marginBottom: 6 }}>Controller</Eyebrow>
            <Mono size={13}>
              {meta?.package != null ? String(meta.package) : '—'}{' '}
              <Mono size={12} color={T.subtle}>
                {meta?.package_version != null ? String(meta.package_version) : ''}
              </Mono>
            </Mono>
          </div>
        </Card>
      </div>

      {d.alerts.length > 0 ? (
        <>
          <div style={{ padding: '20px 20px 6px' }}>
            <h2
              style={{
                margin: '0 0 8px',
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: T.text,
              }}
            >
              System health
            </h2>
          </div>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {d.alerts.map((a, i) => (
              <AlertBar key={i} level={a.level} text={a.text} />
            ))}
          </div>
        </>
      ) : null}

      <details style={{ margin: '20px 16px 0', color: T.muted }}>
        <summary style={{ cursor: 'pointer', fontFamily: T.fontSans, fontSize: 13 }}>
          Raw /api/live (full JSON)
        </summary>
        <pre
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 12,
            border: `1px solid ${T.border}`,
            background: 'rgba(0,0,0,0.35)',
            overflow: 'auto',
            fontFamily: T.fontMono,
            fontSize: 11,
            lineHeight: 1.45,
            color: T.text,
          }}
        >
          {JSON.stringify(live, null, 2)}
        </pre>
      </details>
    </div>
  )
}
