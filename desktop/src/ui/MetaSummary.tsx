import type { ApiMeta } from './api'
import { Card, Eyebrow, Mono, Row } from './reference/primitives'
import { T } from './reference/tokens'

export function MetaSummary({ meta, apiBase }: { meta: ApiMeta | null; apiBase?: string | null }) {
  if (!meta) {
    return (
      <p style={{ color: T.muted, fontFamily: T.fontSans, margin: '12px 20px' }}>Loading…</p>
    )
  }

  const rows: { k: string; hint?: string; v: string }[] = [
    { k: 'package', v: meta.package != null ? String(meta.package) : '—' },
    { k: 'package_version', v: meta.package_version != null ? String(meta.package_version) : '—' },
    { k: 'num_channels', v: meta.num_channels != null ? String(meta.num_channels) : '—' },
    { k: 'sample_interval_s', v: meta.sample_interval_s != null ? String(meta.sample_interval_s) : '—' },
    {
      k: 'log_dir',
      hint: 'Dashboard resolved log root — align COILSHIELD_LOG_DIR / ICCP_LOG_DIR on the Pi with this path.',
      v: meta.log_dir != null ? String(meta.log_dir) : '—',
    },
    {
      k: 'latest_json',
      hint: 'File the dashboard reads for /api/live; should update while the controller runs and writes the same tree.',
      v: meta.latest_json != null ? String(meta.latest_json) : '—',
    },
    {
      k: 'sqlite_db',
      hint: 'SQLite path under the same log layout as the dashboard.',
      v: meta.sqlite_db != null ? String(meta.sqlite_db) : '—',
    },
  ]

  return (
    <div style={{ padding: '8px 0 48px', color: T.text, fontFamily: T.fontSans, maxWidth: 720 }}>
      {apiBase ? (
        <div style={{ padding: '0 20px 12px' }}>
          <Mono size={11} color={T.subtle}>
            {apiBase}
          </Mono>
        </div>
      ) : null}

      <div style={{ padding: '0 20px 14px' }}>
        <Eyebrow>Controller meta</Eyebrow>
        <h1
          style={{
            margin: '6px 0 0',
            color: T.text,
            fontFamily: T.fontSans,
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          Paths & build
        </h1>
      </div>

      <div style={{ padding: '0 16px 14px' }}>
        <Card style={{ padding: 14 }}>
          <Mono size={12} style={{ lineHeight: 1.55 }}>
            Values below come from <Mono size={12}>GET /api/meta</Mono>. Align{' '}
            <Mono size={12}>COILSHIELD_LOG_DIR</Mono> / <Mono size={12}>ICCP_LOG_DIR</Mono> on the Pi with{' '}
            <Mono size={12}>log_dir</Mono> so <Mono size={12}>latest.json</Mono> updates match the running controller.
          </Mono>
        </Card>
      </div>

      <div style={{ padding: '0 16px' }}>
        <Card style={{ padding: 14 }}>
          {rows.map(({ k, hint, v }) => (
            <div key={k} title={hint}>
              <Row
                k={k}
                v={v}
                breakAll={k === 'log_dir' || k === 'latest_json' || k === 'sqlite_db'}
              />
            </div>
          ))}
        </Card>
      </div>

      <details style={{ margin: '20px 16px 0', color: T.muted }}>
        <summary style={{ cursor: 'pointer', fontFamily: T.fontSans, fontSize: 13 }}>
          Raw /api/meta (full JSON)
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
          {JSON.stringify(meta, null, 2)}
        </pre>
      </details>
    </div>
  )
}
