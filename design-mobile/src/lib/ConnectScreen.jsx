import { useMemo } from 'react'
import { useApp } from './app-context.jsx'
import { Card, Eyebrow, Mono, ScreenHeader, T } from './screens.jsx'

function ConnectBrandStrip({ connected, brandStatus }) {
  return (
    <div style={{ padding: '0 16px 14px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span
        aria-hidden
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          marginTop: 7,
          flexShrink: 0,
          background: connected ? T.green : T.muted,
          boxShadow: connected ? `0 0 0 3px ${T.greenBg}` : 'none',
        }}
      />
      <div style={{ minWidth: 0 }}>
        <Eyebrow style={{ color: T.muted, letterSpacing: '0.14em' }}>ICCP</Eyebrow>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 }}>Command Center</div>
        <Mono size={11} color={T.subtle} style={{ display: 'block', marginTop: 6 }}>
          {brandStatus}
        </Mono>
      </div>
    </div>
  )
}

function inputStyle(full) {
  return {
    width: full ? '100%' : undefined,
    minWidth: 0,
    boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    padding: '10px 12px',
    color: T.text,
    fontSize: 14,
    fontFamily: T.fontSans,
    outline: 'none',
  }
}

export function ConnectScreen() {
  const app = useApp()
  const d = app.draft
  const connected = app.httpConnected

  const brandStatus = useMemo(() => {
    if (app.httpConnected && app.apiBase.trim()) {
      const b = app.apiBase.trim().replace(/\/$/, '')
      return `Connected · ${b}`
    }
    return 'Disconnected'
  }, [app.httpConnected, app.apiBase])

  if (!d) {
    return (
      <div style={{ padding: '8px 0 120px', color: T.text, fontFamily: T.fontSans }}>
        <ConnectBrandStrip connected={connected} brandStatus={brandStatus} />
        <div style={{ padding: '0 24px', color: T.muted }}>
          <Mono size={12}>Add a profile…</Mono>
        </div>
      </div>
    )
  }

  const tunnel = app.buildSshTunnelCommand(d, 9080)

  return (
    <div style={{ padding: '8px 0 120px', color: T.text, fontFamily: T.fontSans }}>
      <ConnectBrandStrip connected={connected} brandStatus={brandStatus} />

      <ScreenHeader title="Connect" sub="Profiles · forwarded dashboard (same contract as Desktop)" />

      <div style={{ padding: '0 16px 12px' }}>
        <Card style={{ padding: 14, marginBottom: 12 }}>
          <Eyebrow style={{ color: T.amber }}>SSH + tunnel</Eyebrow>
          <p style={{ margin: '8px 0 0', fontSize: 12.5, color: T.muted, lineHeight: 1.55 }}>
            The desktop app runs <Mono size={11}>ssh2</Mono> and port-forward in Electron. On mobile, create the tunnel
            with CoilShield Desktop, Terminal, or your SSH client, then paste the <strong>forwarded dashboard URL</strong>{' '}
            below (e.g. <Mono size={11}>http://127.0.0.1:9080</Mono>).
          </p>
        </Card>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => app.saveProfile()}
            disabled={connected}
            style={{ ...btnPrimary(), opacity: connected ? 0.5 : 1 }}
          >
            Save profile
          </button>
          <button type="button" onClick={() => void app.connectFromDraftHttp()} style={btnPrimary()}>
            Connect HTTP
          </button>
          <button type="button" onClick={() => app.disconnectController()} disabled={!connected} style={btnGhost()}>
            Disconnect
          </button>
          <button type="button" onClick={() => app.addProfile()} disabled={connected} style={btnGhost()}>
            New profile
          </button>
          <button type="button" onClick={() => app.removeProfile()} disabled={connected || !app.selectedProfileId} style={btnGhost()}>
            Remove
          </button>
        </div>
        {app.profileDirty ? (
          <Mono size={11} color={T.amber} style={{ display: 'block', marginBottom: 10 }}>
            Unsaved changes — Save profile (same as Desktop).
          </Mono>
        ) : null}

        <label style={{ display: 'block', marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: T.muted }}>Profile</span>
          <select
            value={app.selectedProfileId ?? ''}
            onChange={(e) => app.setSelectedProfileId(e.target.value || null)}
            style={{ ...inputStyle(true), marginTop: 6 }}
          >
            {app.profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Field label="Name" value={d.name} onChange={(v) => app.patchDraft({ name: v })} />
          <Field label="Forwarded dashboard URL (http://…)" value={d.httpApiBase ?? ''} onChange={(v) => app.patchDraft({ httpApiBase: v })} ph="http://127.0.0.1:9080" />
          <Eyebrow style={{ color: T.muted, marginTop: 8 }}>SSH profile (for tunnel command + copy-paste exec)</Eyebrow>
          <Field label="SSH host" value={d.host} onChange={(v) => app.patchDraft({ host: v })} ph="pi.local" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="SSH port" value={String(d.port ?? 22)} onChange={(v) => app.patchDraft({ port: Number(v) || 22 })} />
            <Field label="Username" value={d.username} onChange={(v) => app.patchDraft({ username: v })} />
          </div>
          <label style={{ fontSize: 11, color: T.muted }}>
            Auth
            <select
              value={d.auth.type}
              onChange={(e) => {
                const t = e.target.value === 'privateKey' ? 'privateKey' : 'password'
                app.patchDraftAuth(
                  t === 'password'
                    ? { type: 'password', password: '' }
                    : { type: 'privateKey', privateKey: '', passphrase: '' },
                )
              }}
              style={{ ...inputStyle(true), marginTop: 6 }}
            >
              <option value="password">Password</option>
              <option value="privateKey">Private key PEM</option>
            </select>
          </label>
          {d.auth.type === 'password' ? (
            <Field label="Password (stored locally)" value={d.auth.password} onChange={(v) => app.patchDraftAuth({ type: 'password', password: v })} password />
          ) : (
            <>
              <label style={{ fontSize: 11, color: T.muted }}>
                PEM
                <textarea
                  value={d.auth.privateKey}
                  onChange={(e) =>
                    app.patchDraftAuth({
                      type: 'privateKey',
                      privateKey: e.target.value,
                      passphrase: d.auth.type === 'privateKey' ? d.auth.passphrase ?? '' : '',
                    })
                  }
                  rows={4}
                  style={{ ...inputStyle(true), marginTop: 6, fontFamily: T.fontMono, fontSize: 11 }}
                />
              </label>
              <Field
                label="Key passphrase"
                value={d.auth.type === 'privateKey' ? d.auth.passphrase ?? '' : ''}
                onChange={(v) => {
                  if (d.auth.type !== 'privateKey') return
                  app.patchDraftAuth({ type: 'privateKey', privateKey: d.auth.privateKey, passphrase: v })
                }}
                password
              />
            </>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Dashboard host on Pi" value={d.remoteDashboardHost} onChange={(v) => app.patchDraft({ remoteDashboardHost: v })} />
            <Field label="Dashboard port on Pi" value={String(d.remoteDashboardPort ?? 8080)} onChange={(v) => app.patchDraft({ remoteDashboardPort: Number(v) || 8080 })} />
          </div>
          <label style={{ fontSize: 11, color: T.muted }}>
            remoteEnvLines (optional)
            <textarea
              value={(d.remoteEnvLines ?? []).join('\n')}
              onChange={(e) =>
                app.patchDraft({
                  remoteEnvLines: e.target.value
                    .split('\n')
                    .map((x) => x.trim())
                    .filter(Boolean),
                })
              }
              rows={3}
              style={{ ...inputStyle(true), marginTop: 6, fontFamily: T.fontMono, fontSize: 11 }}
            />
          </label>
        </div>

        <Card style={{ padding: 12, marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <Eyebrow style={{ margin: 0 }}>Suggested tunnel</Eyebrow>
            <button type="button" style={btnGhostSm()} onClick={() => app.copyToClipboard(tunnel, 'ssh -L')}>
              Copy
            </button>
          </div>
          <pre style={{ margin: '10px 0 0', fontSize: 10.5, color: T.muted, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{tunnel}</pre>
        </Card>

        <Eyebrow style={{ margin: '16px 4px 8px', color: T.muted }}>
          ICCP CLI (wrapped <code className="mono">bash -lc</code> — same idea as Desktop Pi console)
        </Eyebrow>
        {[
          { label: 'iccp start', cmd: 'iccp start' },
          { label: 'iccp commission', cmd: 'iccp commission' },
          { label: 'iccp probe', cmd: 'iccp probe' },
          { label: 'iccp live', cmd: 'iccp live' },
          { label: 'iccp version', cmd: 'iccp version' },
          { label: 'iccp diag --request', cmd: 'iccp diag --request' },
          { label: 'systemctl status iccp', cmd: 'systemctl --no-pager status iccp 2>&1 | head -50' },
        ].map((row) => {
          const wrapped = app.buildRemoteExecShell(d, row.cmd)
          return (
            <Card key={row.label} style={{ padding: 10, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Mono size={11} color={T.text}>
                  {row.label}
                </Mono>
                <button type="button" style={btnGhostSm()} onClick={() => app.copyToClipboard(wrapped, row.label)}>
                  Copy wrapped
                </button>
              </div>
              <pre style={{ margin: '8px 0 0', fontSize: 9.5, color: T.subtle, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{wrapped}</pre>
            </Card>
          )
        })}

        {connected && (
          <Mono size={11} color={T.green} style={{ marginTop: 12, display: 'block' }}>
            Connected · polling ~{app.metaPollMs} ms
            {app.meta && typeof app.meta.sample_interval_s === 'number'
              ? ` (sample_interval_s=${app.meta.sample_interval_s})`
              : ''}
          </Mono>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, ph, password }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: T.muted }}>{label}</span>
      <input
        type={password ? 'password' : 'text'}
        value={value}
        placeholder={ph}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle(true)}
        autoComplete="off"
      />
    </label>
  )
}

function btnPrimary() {
  return {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid rgba(125,211,252,0.4)',
    background: 'rgba(125,211,252,0.18)',
    color: T.text,
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: T.fontSans,
  }
}

function btnGhost() {
  return {
    padding: '10px 14px',
    borderRadius: 10,
    border: `1px solid ${T.border}`,
    background: 'rgba(255,255,255,0.06)',
    color: T.text,
    fontWeight: 500,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: T.fontSans,
  }
}

function btnGhostSm() {
  return {
    padding: '6px 10px',
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    background: 'rgba(255,255,255,0.06)',
    color: T.muted,
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: T.fontSans,
  }
}
