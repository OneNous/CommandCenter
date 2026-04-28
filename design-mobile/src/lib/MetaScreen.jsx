import { Card, Mono, ScreenHeader, T } from './screens.jsx'

export function MetaScreen({ apiBase, meta, onRefresh, refreshing, error }) {
  const connected = apiBase.trim().startsWith('http')
  return (
    <div style={{ padding: '8px 0 100px', color: T.text, fontFamily: T.fontSans }}>
      <ScreenHeader title="Controller meta" sub="/api/meta" />
      {!connected ? (
        <div style={{ padding: '0 16px' }}>
          <Mono size={12} color={T.muted}>
            Connect an HTTP dashboard base URL on the Connect tab (same as desktop after SSH tunnel).
          </Mono>
        </div>
      ) : (
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 12 }}>
            <Mono size={11} color={T.subtle}>
              {apiBase}
            </Mono>
            <button
              type="button"
              disabled={refreshing}
              onClick={() => onRefresh?.()}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                background: 'rgba(255,255,255,0.08)',
                color: T.text,
                fontWeight: 600,
                cursor: refreshing ? 'wait' : 'pointer',
                fontFamily: T.fontSans,
              }}
            >
              {refreshing ? '…' : 'Refresh /api/meta'}
            </button>
          </div>
          {error && (
            <Mono size={12} color={T.red} style={{ marginBottom: 10, display: 'block' }}>
              {error}
            </Mono>
          )}
          <Card style={{ padding: 12 }}>
            <pre
              className="mono"
              style={{
                margin: 0,
                fontSize: 11,
                lineHeight: 1.45,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: T.muted,
                maxHeight: 'min(70vh, 520px)',
                overflow: 'auto',
              }}
            >
              {meta ? JSON.stringify(meta, null, 2) : 'Loading…'}
            </pre>
          </Card>
        </div>
      )}
    </div>
  )
}
