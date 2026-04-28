import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArtSky } from '@shared-artsky'
import { buildArtSkyProps, DESKTOP_SKY_DEFAULTS } from './artSkyProps'
import type { ConnectionProfile, SshAuth, SshConnectParams } from '../../electron/types'
import {
  apiGet,
  livePollIntervalMs,
  makeApiBase,
  type ApiLive,
  type ApiMeta,
} from './api'

type TabId = 'connect' | 'live' | 'meta'

const APPEARANCE_LS = 'iccp-desktop-appearance'

function readStoredAppearance(): 'light' | 'dark' {
  try {
    return window.localStorage.getItem(APPEARANCE_LS) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

/** Defaults mirror typical Pi setup: `ssh onenous@192.168.1.137` (password still entered locally). */
function defaultProfile(): ConnectionProfile {
  return {
    id: crypto.randomUUID(),
    name: 'Pi @ 192.168.1.137',
    host: '192.168.1.137',
    port: 22,
    username: 'onenous',
    auth: { type: 'password', password: '' },
    remoteDashboardHost: '127.0.0.1',
    remoteDashboardPort: 8080,
    remoteEnvLines: [],
  }
}

function profileToConnectParams(profile: ConnectionProfile): SshConnectParams {
  return {
    host: profile.host,
    port: profile.port,
    username: profile.username,
    auth: profile.auth,
  }
}

export function App() {
  const [appearance, setAppearance] = useState<'light' | 'dark'>(() =>
    typeof window !== 'undefined' ? readStoredAppearance() : 'dark',
  )
  const [tab, setTab] = useState<TabId>('connect')
  const [profiles, setProfiles] = useState<ConnectionProfile[]>([])
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  /** Editable copy of the selected profile; persisted only via Save profile or SSH + tunnel. */
  const [draft, setDraft] = useState<ConnectionProfile | null>(null)
  const [profileDirty, setProfileDirty] = useState(false)
  const [status, setStatus] = useState<string>('Disconnected')
  const [error, setError] = useState<string | null>(null)
  const [localPort, setLocalPort] = useState<number | null>(null)
  const [meta, setMeta] = useState<ApiMeta | null>(null)
  const [live, setLive] = useState<ApiLive | null>(null)
  const [liveError, setLiveError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const profilesRef = useRef(profiles)
  profilesRef.current = profiles

  const apiBase = localPort != null ? makeApiBase(localPort) : null

  useEffect(() => {
    try {
      window.localStorage.setItem(APPEARANCE_LS, appearance)
    } catch {
      /* */
    }
    document.documentElement.setAttribute('data-appearance', appearance)
  }, [appearance])

  const sky = useMemo(
    () =>
      buildArtSkyProps({
        ...DESKTOP_SKY_DEFAULTS,
        skyThemeOverride: appearance === 'light' ? 'white-ice-blue' : undefined,
      }),
    [appearance],
  )

  useEffect(() => {
    void (async () => {
      const { profiles: list, activeProfileId: active } = await window.iccp.profilesGet()
      setProfiles(list)
      setActiveProfileId(active)
      setSelectedId((prev) => prev ?? active ?? list[0]?.id ?? null)
    })()
  }, [])

  useEffect(() => {
    if (selectedId == null) {
      setDraft(null)
      setProfileDirty(false)
      return
    }
    const p = profilesRef.current.find((x) => x.id === selectedId) ?? null
    setDraft(p ? { ...p } : null)
    setProfileDirty(false)
  }, [selectedId])

  const persistProfiles = useCallback(
    async (next: ConnectionProfile[], active: string | null) => {
      await window.iccp.profilesSet({ profiles: next, activeProfileId: active })
      setProfiles(next)
      setActiveProfileId(active)
    },
    [],
  )

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const fetchMeta = useCallback(async (base: string) => {
    const m = await apiGet<ApiMeta>(base, '/api/meta')
    setMeta(m)
    return m
  }, [])

  const fetchLiveOnce = useCallback(async (base: string) => {
    const l = await apiGet<ApiLive>(base, '/api/live')
    setLive(l)
    setLiveError(null)
  }, [])

  useEffect(() => {
    stopPolling()
    if (!apiBase || tab !== 'live') return

    let cancelled = false
    const tick = async () => {
      try {
        await fetchLiveOnce(apiBase)
      } catch (e) {
        if (!cancelled) setLiveError(e instanceof Error ? e.message : String(e))
      }
    }
    void tick()
    const interval = livePollIntervalMs(meta)
    pollRef.current = setInterval(() => void tick(), interval)
    return () => {
      cancelled = true
      stopPolling()
    }
  }, [apiBase, tab, meta, fetchLiveOnce, stopPolling])

  useEffect(() => {
    if (!apiBase || tab !== 'meta') return
    let cancelled = false
    void (async () => {
      try {
        const m = await fetchMeta(apiBase)
        if (!cancelled) setMeta(m)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [apiBase, tab, fetchMeta])

  const saveProfile = useCallback(async () => {
    setError(null)
    if (!draft) {
      setError('Nothing to save.')
      return
    }
    const host = draft.host.trim()
    if (!host) {
      setError('SSH host is required before saving.')
      return
    }
    const merged: ConnectionProfile = { ...draft, host }
    try {
      const next = profiles.map((p) => (p.id === merged.id ? merged : p))
      if (!next.some((p) => p.id === merged.id)) {
        setError('Profile is missing from the list — try New profile again.')
        return
      }
      await persistProfiles(next, activeProfileId)
      setDraft({ ...merged })
      setProfileDirty(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [draft, profiles, activeProfileId, persistProfiles])

  const connect = async () => {
    setError(null)
    if (!draft) {
      setError('Select or create a profile.')
      return
    }
    const host = draft.host.trim()
    if (!host) {
      setError('Enter an SSH host (IP or hostname), then connect.')
      return
    }
    const toUse: ConnectionProfile = { ...draft, host }
    try {
      setStatus('Connecting…')
      const next = profiles.map((p) => (p.id === toUse.id ? toUse : p))
      await persistProfiles(next, activeProfileId)
      setDraft({ ...toUse })
      setProfileDirty(false)
      await window.iccp.sessionSetProfile(toUse)
      await window.iccp.sshConnect(profileToConnectParams(toUse))
      const { localPort: port } = await window.iccp.tunnelStart({
        remoteHost: toUse.remoteDashboardHost,
        remotePort: toUse.remoteDashboardPort,
      })
      setLocalPort(port)
      const base = makeApiBase(port)
      await fetchMeta(base)
      setStatus(`Tunnel → ${base}`)
      setTab('live')
    } catch (e) {
      setStatus('Disconnected')
      setLocalPort(null)
      setMeta(null)
      setLive(null)
      setError(e instanceof Error ? e.message : String(e))
      try {
        await window.iccp.tunnelStop()
        await window.iccp.sshDisconnect()
      } catch {
        /* best effort */
      }
    }
  }

  const disconnect = async () => {
    stopPolling()
    setError(null)
    setStatus('Disconnecting…')
    setLocalPort(null)
    setMeta(null)
    setLive(null)
    setLiveError(null)
    try {
      await window.iccp.tunnelStop()
      await window.iccp.sshDisconnect()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
    setStatus('Disconnected')
    setTab('connect')
  }

  const addProfile = () => {
    const p = defaultProfile()
    void persistProfiles([...profiles, p], p.id)
    setSelectedId(p.id)
  }

  const removeProfile = async () => {
    if (!selectedId) return
    const next = profiles.filter((p) => p.id !== selectedId)
    await persistProfiles(next, activeProfileId === selectedId ? null : activeProfileId)
    setSelectedId(next[0]?.id ?? null)
  }

  const patchDraft = (patch: Partial<ConnectionProfile>) => {
    setDraft((d) => (d ? { ...d, ...patch } : null))
    setProfileDirty(true)
  }

  const patchDraftAuth = (auth: SshAuth) => {
    setDraft((d) => (d ? { ...d, auth } : null))
    setProfileDirty(true)
  }

  const trustDegraded =
    live != null &&
    (live.feed_trust_channel_metrics === false || live.feed_ok === false)

  const connected = localPort != null

  return (
    <div className="app-root">
      <div className="artsky-host" aria-hidden>
        <ArtSky {...sky} />
      </div>
      <div className="shell">
      <aside className="nav">
        <div className="brand">
          <span className={`dot ${connected ? 'good' : ''}`} aria-hidden />
          <div>
            <p className="eyebrow eyebrow--nav">ICCP</p>
            <h1>Command Center</h1>
            <p className="brand-status">{status}</p>
          </div>
        </div>
        <button type="button" className={tab === 'connect' ? 'active' : ''} onClick={() => setTab('connect')}>
          Connect
        </button>
        <button
          type="button"
          className={tab === 'live' ? 'active' : ''}
          onClick={() => setTab('live')}
          disabled={!connected}
        >
          Live
        </button>
        <button
          type="button"
          className={tab === 'meta' ? 'active' : ''}
          onClick={() => setTab('meta')}
          disabled={!connected}
        >
          Controller meta
        </button>

        <div className="appearance-row">
          <label className="appearance-label">
            <input
              type="checkbox"
              checked={appearance === 'light'}
              onChange={(e) => setAppearance(e.target.checked ? 'light' : 'dark')}
            />
            <span>Light appearance</span>
          </label>
          <p className="appearance-hint">Ice-white sky (v77 shop · white-ice-blue)</p>
        </div>
      </aside>

      <main className="content">
        {error ? (
          <div className="panel pad panel--danger">
            <div className="k">Error</div>
            <div className="v mono">{error}</div>
          </div>
        ) : null}

        {trustDegraded ? (
          <div className="panel pad panel--warn">
            <div className="k">Telemetry</div>
            <div className="v">
              Feed is stale or incomplete (feed_trust_channel_metrics / feed_ok). Channel metrics may
              not reflect live control-plane state — see ICCP dashboard docs.
            </div>
          </div>
        ) : null}

        {tab === 'connect' ? (
          <div className="panel pad">
            <div className="toolbar">
              <button type="button" className="primary" onClick={() => void saveProfile()} disabled={!draft || connected}>
                Save profile
              </button>
              <button type="button" className="primary" onClick={() => void connect()} disabled={connected || !draft}>
                SSH + tunnel
              </button>
              <button type="button" className="ghost" onClick={() => void disconnect()} disabled={!connected}>
                Disconnect
              </button>
              <button type="button" className="ghost" onClick={addProfile}>
                New profile
              </button>
              <button type="button" className="ghost" onClick={() => void removeProfile()} disabled={!selectedId}>
                Remove profile
              </button>
            </div>
            {profileDirty ? (
              <p className="hint">
                Unsaved changes — use Save profile before switching away, or SSH + tunnel saves automatically when you
                connect.
              </p>
            ) : null}

            <div className="row">
              <label className="k field-label">
                Profile
                <select
                  value={selectedId ?? ''}
                  onChange={(e) => setSelectedId(e.target.value || null)}
                  disabled={!profiles.length}
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {draft ? (
              <div className="form-grid">
                <div className="card" style={{ gridColumn: 'span 6' }}>
                  <div className="k">Name</div>
                  <input value={draft.name} onChange={(e) => patchDraft({ name: e.target.value })} />
                </div>
                <div className="card" style={{ gridColumn: 'span 6' }}>
                  <div className="k">SSH host</div>
                  <input
                    value={draft.host}
                    onChange={(e) => patchDraft({ host: e.target.value })}
                    placeholder="e.g. 192.168.1.137 or pi.local"
                    autoComplete="off"
                  />
                </div>
                <div className="card" style={{ gridColumn: 'span 4' }}>
                  <div className="k">SSH port</div>
                  <input
                    type="number"
                    value={draft.port ?? 22}
                    onChange={(e) => patchDraft({ port: Number(e.target.value) || 22 })}
                  />
                </div>
                <div className="card" style={{ gridColumn: 'span 4' }}>
                  <div className="k">Username</div>
                  <input
                    value={draft.username}
                    onChange={(e) => patchDraft({ username: e.target.value })}
                    autoComplete="username"
                  />
                </div>
                <div className="card" style={{ gridColumn: 'span 4' }}>
                  <div className="k">Auth</div>
                  <select
                    value={draft.auth.type}
                    onChange={(e) => {
                      const t = e.target.value === 'privateKey' ? 'privateKey' : 'password'
                      patchDraftAuth(
                        t === 'password'
                          ? { type: 'password', password: '' }
                          : { type: 'privateKey', privateKey: '', passphrase: '' },
                      )
                    }}
                  >
                    <option value="password">Password</option>
                    <option value="privateKey">Private key PEM</option>
                  </select>
                </div>
                {draft.auth.type === 'password' ? (
                  <div className="card" style={{ gridColumn: 'span 12' }}>
                    <div className="k">Password (stored locally)</div>
                    <input
                      type="password"
                      className="input-full"
                      value={draft.auth.password}
                      onChange={(e) => patchDraftAuth({ type: 'password', password: e.target.value })}
                      autoComplete="current-password"
                    />
                  </div>
                ) : (
                  <>
                    <div className="card wide">
                      <div className="k">Private key (PEM)</div>
                      <textarea
                        className="mono input-textarea"
                        rows={6}
                        value={draft.auth.privateKey}
                        onChange={(e) =>
                          patchDraftAuth({
                            type: 'privateKey',
                            privateKey: e.target.value,
                            passphrase: draft.auth.type === 'privateKey' ? draft.auth.passphrase : '',
                          })
                        }
                      />
                    </div>
                    <div className="card" style={{ gridColumn: 'span 12' }}>
                      <div className="k">Key passphrase (optional)</div>
                      <input
                        type="password"
                        className="input-full"
                        value={draft.auth.type === 'privateKey' ? draft.auth.passphrase ?? '' : ''}
                        onChange={(e) => {
                          if (draft.auth.type !== 'privateKey') return
                          patchDraftAuth({
                            type: 'privateKey',
                            privateKey: draft.auth.privateKey,
                            passphrase: e.target.value,
                          })
                        }}
                      />
                    </div>
                  </>
                )}
                <div className="card" style={{ gridColumn: 'span 6' }}>
                  <div className="k">Dashboard remote host (on Pi)</div>
                  <input
                    value={draft.remoteDashboardHost}
                    onChange={(e) => patchDraft({ remoteDashboardHost: e.target.value })}
                  />
                </div>
                <div className="card" style={{ gridColumn: 'span 6' }}>
                  <div className="k">Dashboard remote port</div>
                  <input
                    type="number"
                    value={draft.remoteDashboardPort}
                    onChange={(e) =>
                      patchDraft({ remoteDashboardPort: Number(e.target.value) || 8080 })
                    }
                  />
                </div>
                <div className="card wide">
                  <div className="k">remoteEnvLines (optional, one export per line)</div>
                  <textarea
                    className="mono input-textarea"
                    rows={3}
                    value={(draft.remoteEnvLines ?? []).join('\n')}
                    onChange={(e) =>
                      patchDraft({
                        remoteEnvLines: e.target.value
                          .split('\n')
                          .map((l) => l.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
              </div>
            ) : (
              <p className="muted">Add a profile to connect.</p>
            )}
          </div>
        ) : null}

        {tab === 'live' && apiBase ? (
          <div className="panel pad">
            <div className="row" style={{ marginBottom: 10 }}>
              <span className="muted mono">{apiBase}</span>
              <span className="muted">
                Polling ~{livePollIntervalMs(meta)} ms
                {meta?.sample_interval_s != null ? ` (sample_interval_s=${meta.sample_interval_s})` : ''}
              </span>
            </div>
            {liveError ? <div className="v text-bad">{liveError}</div> : null}
            <pre className="log mono">{live ? JSON.stringify(live, null, 2) : 'Loading…'}</pre>
          </div>
        ) : null}

        {tab === 'meta' && apiBase ? (
          <div className="panel pad">
            <div className="row" style={{ marginBottom: 12 }}>
              <button type="button" className="ghost" onClick={() => void fetchMeta(apiBase).catch((e) => setError(String(e)))}>
                Refresh /api/meta
              </button>
            </div>
            <pre className="log mono">{meta ? JSON.stringify(meta, null, 2) : 'Loading…'}</pre>
          </div>
        ) : null}
      </main>
      </div>
    </div>
  )
}
