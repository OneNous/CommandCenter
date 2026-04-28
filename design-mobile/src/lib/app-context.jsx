/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  buildRemoteExecShell,
  buildSshTunnelCommand,
  createDefaultProfile,
  normalizeProfile,
} from './connection-profile.js'
import { apiGet, livePollIntervalMs } from './iccp-api.js'
import { FIXTURE } from './screens.jsx'
import { clearFaultOnChannel, deepCloneFixture, fetchLiveTelemetry, tickTelemetry } from './telemetry-sim.js'

const LS_KEY = 'iccp-mobile-app-v1'

function loadPersisted() {
  try {
    const s = localStorage.getItem(LS_KEY)
    return s ? JSON.parse(s) : {}
  } catch {
    return {}
  }
}

function savePersisted(payload) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(payload))
  } catch {
    /* */
  }
}

function initialsFromEmail(email) {
  const p = (email || '').split('@')[0] || '—'
  return p
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('') || 'CS'
}

function seedFixture() {
  const d = deepCloneFixture(FIXTURE)
  d.feedTrust = true
  d.telemetryIncomplete = false
  return d
}

/** @typedef {{ id: string; message: string; kind?: 'ok' | 'err' | 'info' }} Toast */

export const IccpAppContext = createContext(null)

export function useOptionalApp() {
  return useContext(IccpAppContext)
}

export function useApp() {
  const v = useContext(IccpAppContext)
  if (!v) throw new Error('useApp outside AppProvider')
  return v
}

function loadProfilesAndSelection() {
  const p = loadPersisted()
  const raw = Array.isArray(p.profiles) ? p.profiles : []
  const list = raw.length ? raw.map(normalizeProfile) : [createDefaultProfile()]
  const sel = p.selectedProfileId ?? p.activeProfileId ?? list[0]?.id ?? null
  return { list, sel }
}

export function AppProvider({ children }) {
  const persisted = loadPersisted()
  const initProfiles = loadProfilesAndSelection()

  /** Desktop opens straight into Command Center; use login only after explicit sign-out. */
  const [session, setSession] = useState(() => (persisted.session === 'login' ? 'login' : 'app'))
  const [user, setUser] = useState(() => ({
    email: persisted.email ?? '',
    displayName: persisted.displayName ?? '',
  }))
  const [prefs, setPrefs] = useState(() => ({
    notif: persisted.notif !== false,
    autoClear: persisted.autoClear !== false,
    haptic: persisted.haptic !== false,
    appearance: persisted.appearance === 'light' ? 'light' : 'dark',
  }))

  const [profiles, setProfiles] = useState(initProfiles.list)
  const [activeProfileId, setActiveProfileId] = useState(persisted.activeProfileId ?? null)
  const [selectedProfileId, setSelectedProfileId] = useState(initProfiles.sel)
  const [draft, setDraft] = useState(/** @type {import('./connection-profile.js').ConnectionProfile | null} */ (null))
  const [profileDirty, setProfileDirty] = useState(false)

  const [apiBase, setApiBase] = useState(persisted.apiBase ?? '')
  const [meta, setMeta] = useState(/** @type {Record<string, unknown> | null} */ (null))
  const [metaError, setMetaError] = useState(/** @type {string | null} */ (null))
  const [lastLiveRaw, setLastLiveRaw] = useState(/** @type {unknown} */ (null))
  const [metaPollMs, setMetaPollMs] = useState(450)

  const [liveData, setLiveData] = useState(seedFixture)
  const [selectedChIdx, setSelectedChIdx] = useState(/** @type {number | null} */ (null))
  const [refreshing, setRefreshing] = useState(false)

  const [loginMode, setLoginMode] = useState(/** @type {'signIn' | 'pair'} */ ('signIn'))
  const [loginError, setLoginError] = useState(/** @type {string | null} */ (null))
  const [pairError, setPairError] = useState(/** @type {string | null} */ (null))
  const [email, _setEmail] = useState(() => persisted.email ?? '')
  const [password, _setPassword] = useState('')
  const [pairHost, _setPairHost] = useState(() => persisted.pairHost ?? '127.0.0.1')
  const [pairPort, _setPairPort] = useState(() => persisted.pairPort ?? '9080')

  const setEmail = useCallback((v) => {
    setLoginError(null)
    _setEmail(v)
  }, [])
  const setPassword = useCallback((v) => {
    setLoginError(null)
    _setPassword(v)
  }, [])
  const setPairHost = useCallback((v) => {
    setPairError(null)
    _setPairHost(v)
  }, [])
  const setPairPort = useCallback((v) => {
    setPairError(null)
    _setPairPort(v)
  }, [])

  const [pairTesting, setPairTesting] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [toasts, setToasts] = useState(/** @type {Toast[]} */ ([]))
  const toastId = useRef(0)
  const liveRef = useRef(liveData)

  useEffect(() => {
    liveRef.current = liveData
  }, [liveData])

  // Keep an editable draft copy in sync with the selected profile (desktop-style).
  /* eslint-disable react-hooks/set-state-in-effect -- intentional reset when selection or profile list changes */
  useEffect(() => {
    if (selectedProfileId == null) {
      setDraft(null)
      setProfileDirty(false)
      return
    }
    const p = profiles.find((x) => x.id === selectedProfileId) ?? null
    setDraft(p ? { ...p } : null)
    setProfileDirty(false)
  }, [selectedProfileId, profiles])
  /* eslint-enable react-hooks/set-state-in-effect */

  const pushToast = useCallback((message, kind = 'info') => {
    const id = `t-${++toastId.current}`
    setToasts((prev) => [...prev.slice(-3), { id, message, kind }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const persistProfiles = useCallback((next, active) => {
    setProfiles(next)
    setActiveProfileId(active)
  }, [])

  const persistSlice = useCallback(() => {
    savePersisted({
      session,
      email: user.email || email,
      displayName: user.displayName,
      notif: prefs.notif,
      autoClear: prefs.autoClear,
      haptic: prefs.haptic,
      appearance: prefs.appearance,
      apiBase,
      pairHost,
      pairPort,
      profiles,
      activeProfileId,
      selectedProfileId,
    })
  }, [session, user, prefs, apiBase, pairHost, pairPort, email, profiles, activeProfileId, selectedProfileId])

  useEffect(() => {
    persistSlice()
  }, [persistSlice])

  const tryHaptic = useCallback(() => {
    if (!prefs.haptic) return
    try {
      navigator.vibrate?.(12)
    } catch {
      /* */
    }
  }, [prefs.haptic])

  const applyLivePatch = useCallback((next) => {
    setLiveData(next)
    if (typeof window !== 'undefined') window.FIXTURE = next
  }, [])

  const disconnectController = useCallback(() => {
    setApiBase('')
    setMeta(null)
    setMetaError(null)
    setLastLiveRaw(null)
    setMetaPollMs(450)
    applyLivePatch(seedFixture())
    pushToast('Disconnected (same as Desktop Disconnect)', 'info')
  }, [applyLivePatch, pushToast])

  const connectHttp = useCallback(
    async (baseRaw) => {
      const base = baseRaw.trim().replace(/\/$/, '')
      if (!base.startsWith('http://') && !base.startsWith('https://')) {
        pushToast('URL must start with http:// or https://', 'err')
        return
      }
      setMetaError(null)
      tryHaptic()
      try {
        const m = await apiGet(base, '/api/meta')
        setMeta(m)
        setMetaPollMs(livePollIntervalMs(m))
        const { fixture, raw } = await fetchLiveTelemetry(base, liveRef.current)
        setLastLiveRaw(raw)
        applyLivePatch(fixture)
        setApiBase(base)
        pushToast(`HTTP OK · ${base}`, 'ok')
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        setMetaError(msg)
        pushToast(msg, 'err')
      }
    },
    [applyLivePatch, pushToast, tryHaptic],
  )

  const saveProfile = useCallback(() => {
    if (!draft) {
      pushToast('Select a profile', 'err')
      return
    }
    const host = draft.host.trim()
    if (!host) {
      pushToast('SSH host is required before saving (same as Desktop).', 'err')
      return
    }
    const merged = normalizeProfile({ ...draft, host })
    const next = profiles.map((p) => (p.id === merged.id ? merged : p))
    if (!next.some((p) => p.id === merged.id)) {
      pushToast('Profile missing from list', 'err')
      return
    }
    persistProfiles(next, activeProfileId)
    setDraft({ ...merged })
    setProfileDirty(false)
    pushToast('Profile saved', 'ok')
  }, [draft, profiles, activeProfileId, persistProfiles, pushToast])

  const addProfile = useCallback(() => {
    const p = createDefaultProfile()
    setProfiles((prev) => {
      const next = [...prev, p]
      setActiveProfileId(p.id)
      return next
    })
    setSelectedProfileId(p.id)
    pushToast('New profile', 'info')
  }, [pushToast])

  const removeProfile = useCallback(() => {
    if (!selectedProfileId) return
    const next = profiles.filter((p) => p.id !== selectedProfileId)
    setProfiles(next)
    setActiveProfileId(activeProfileId === selectedProfileId ? null : activeProfileId)
    setSelectedProfileId(next[0]?.id ?? null)
    pushToast('Profile removed', 'info')
  }, [profiles, selectedProfileId, activeProfileId, pushToast])

  const patchDraft = useCallback((patch) => {
    setDraft((d) => (d ? { ...d, ...patch } : null))
    setProfileDirty(true)
  }, [])

  const patchDraftAuth = useCallback((auth) => {
    setDraft((d) => (d ? { ...d, auth } : null))
    setProfileDirty(true)
  }, [])

  const connectFromDraftHttp = useCallback(async () => {
    const url = (draft?.httpApiBase ?? '').trim()
    if (!url) {
      pushToast('Set “Forwarded dashboard URL” on this profile (Desktop tunnel target).', 'err')
      return
    }
    if (draft) {
      const merged = normalizeProfile(draft)
      const next = profiles.map((p) => (p.id === merged.id ? merged : p))
      persistProfiles(next, activeProfileId)
      setDraft({ ...merged })
      setProfileDirty(false)
    }
    await connectHttp(url)
  }, [draft, profiles, activeProfileId, persistProfiles, connectHttp, pushToast])

  const runRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const base = apiBase.trim()
      if (base.startsWith('http://') || base.startsWith('https://')) {
        const { fixture, raw } = await fetchLiveTelemetry(base, liveRef.current)
        setLastLiveRaw(raw)
        applyLivePatch(fixture)
        pushToast('Live synced', 'ok')
      } else {
        pushToast('Connect HTTP on the Connect tab first (matches Desktop after tunnel).', 'info')
      }
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Refresh failed', 'err')
    } finally {
      setRefreshing(false)
    }
  }, [apiBase, applyLivePatch, pushToast])

  const fetchMetaNow = useCallback(async () => {
    const base = apiBase.trim()
    if (!base.startsWith('http')) return
    setMetaError(null)
    setRefreshing(true)
    try {
      const m = await apiGet(base, '/api/meta')
      setMeta(m)
      setMetaPollMs(livePollIntervalMs(m))
      pushToast('/api/meta refreshed', 'ok')
    } catch (e) {
      setMetaError(e instanceof Error ? e.message : String(e))
    } finally {
      setRefreshing(false)
    }
  }, [apiBase, pushToast])

  useEffect(() => {
    if (session !== 'app') return undefined
    const base = apiBase.trim()
    if (!base.startsWith('http://') && !base.startsWith('https://')) return undefined
    const id = window.setInterval(() => {
      fetchLiveTelemetry(base, liveRef.current)
        .then(({ fixture, raw }) => {
          setLastLiveRaw(raw)
          applyLivePatch(fixture)
        })
        .catch(() => {
          setLiveData((prev) => {
            const x = deepCloneFixture(prev)
            tickTelemetry(x)
            x.feedTrust = false
            if (typeof window !== 'undefined') window.FIXTURE = x
            return x
          })
        })
    }, metaPollMs)
    return () => window.clearInterval(id)
  }, [session, apiBase, metaPollMs, applyLivePatch])

  const signIn = useCallback(async () => {
    setLoginError(null)
    const em = email.trim()
    if (!em.includes('@')) {
      setLoginError('Enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setLoginError('Password must be at least 6 characters.')
      return
    }
    setLoginLoading(true)
    tryHaptic()
    await new Promise((r) => setTimeout(r, 520))
    const local = em.split('@')[0]
    setUser({ email: em, displayName: local.charAt(0).toUpperCase() + local.slice(1) })
    setLoginLoading(false)
    setSession('app')
    setPassword('')
    pushToast(`Signed in as ${em}`, 'ok')
  }, [email, password, tryHaptic, pushToast, setPassword])

  const signOut = useCallback(() => {
    tryHaptic()
    disconnectController()
    setSession('login')
    setSelectedChIdx(null)
    setLoginMode('signIn')
    pushToast('Signed out', 'info')
  }, [tryHaptic, disconnectController, pushToast])

  const testPairConnection = useCallback(async () => {
    setPairError(null)
    const host = pairHost.trim() || '127.0.0.1'
    const port = pairPort.replace(/\D/g, '') || '8080'
    const base = `http://${host}:${port}`
    setPairTesting(true)
    tryHaptic()
    await connectHttp(base)
    setPairTesting(false)
  }, [pairHost, pairPort, tryHaptic, connectHttp])

  const savePairAndEnter = useCallback(async () => {
    setPairError(null)
    const host = pairHost.trim() || '127.0.0.1'
    const port = pairPort.replace(/\D/g, '') || '8080'
    const base = `http://${host}:${port}`
    setPairTesting(true)
    tryHaptic()
    await connectHttp(base)
    setPairTesting(false)
    setLoginMode('signIn')
    setSession('app')
    pushToast('Opening live dashboard', 'ok')
  }, [pairHost, pairPort, connectHttp, tryHaptic, pushToast])

  const clearFault = useCallback(
    (chIdx) => {
      tryHaptic()
      setLiveData((d) => {
        const x = deepCloneFixture(d)
        if (clearFaultOnChannel(x, chIdx)) {
          queueMicrotask(() => pushToast(`Fault cleared on channel ${chIdx + 1}`, 'ok'))
        }
        if (typeof window !== 'undefined') window.FIXTURE = x
        return x
      })
    },
    [tryHaptic, pushToast],
  )

  const dismissAlert = useCallback(
    (index) => {
      tryHaptic()
      setLiveData((d) => {
        const x = deepCloneFixture(d)
        x.alerts = (x.alerts || []).filter((_, i) => i !== index)
        if (typeof window !== 'undefined') window.FIXTURE = x
        return x
      })
    },
    [tryHaptic],
  )

  const setPrefsField = useCallback(
    (key, value) => {
      tryHaptic()
      setPrefs((p) => ({ ...p, [key]: value }))
      const label =
        key === 'notif'
          ? 'Notifications'
          : key === 'autoClear'
            ? 'Auto-clear'
            : key === 'haptic'
              ? 'Haptics'
              : key === 'appearance'
                ? 'Appearance'
                : String(key)
      const detail =
        key === 'appearance' ? (value === 'light' ? 'light' : 'dark') : value ? 'on' : 'off'
      pushToast(`${label} · ${detail}`, 'info')
    },
    [tryHaptic, pushToast],
  )

  const exportReport = useCallback(
    (kind) => {
      tryHaptic()
      const payload = lastLiveRaw ?? liveData
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `iccp-export-${kind}-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(a.href)
      pushToast(`Exported ${kind}`, 'ok')
    },
    [liveData, lastLiveRaw, tryHaptic, pushToast],
  )

  const copyToClipboard = useCallback(
    (text, label) => {
      tryHaptic()
      void navigator.clipboard?.writeText(text).then(
        () => pushToast(label ? `Copied: ${label}` : 'Copied', 'ok'),
        () => pushToast('Copy failed', 'err'),
      )
    },
    [tryHaptic, pushToast],
  )

  const dashHeader = useMemo(() => {
    const fault = liveData.channels?.some((c) => c.state === 'FAULT')
    if (fault) return { title: 'Attention needed', sub: `Live · feed ${liveData.feedAge?.toFixed?.(2) ?? '?'}s` }
    if (liveData.feedTrust === false) return { title: 'Telemetry degraded', sub: 'Stale or incomplete feed' }
    return { title: 'System OK', sub: `Live · feed ${liveData.feedAge?.toFixed?.(2) ?? '?'}s` }
  }, [liveData])

  const connectionDetail = useMemo(() => {
    const b = apiBase.trim()
    if (b) return `${b.replace(/^https?:\/\//, '')} · HTTP`
    return 'Not connected · set URL on Connect tab'
  }, [apiBase])

  const httpConnected = apiBase.trim().startsWith('http')

  const value = useMemo(
    () => ({
      session,
      setSession,
      user,
      prefs,
      setPrefsField,
      apiBase,
      httpConnected,
      meta,
      metaError,
      lastLiveRaw,
      metaPollMs,
      liveData,
      runRefresh,
      fetchMetaNow,
      refreshing,
      selectedChIdx,
      setSelectedChIdx,
      signIn,
      signOut,
      clearFault,
      dismissAlert,
      pushToast,
      loginMode,
      setLoginMode,
      email,
      setEmail,
      password,
      setPassword,
      pairHost,
      setPairHost,
      pairPort,
      setPairPort,
      loginError,
      pairError,
      pairTesting,
      loginLoading,
      testPairConnection,
      savePairAndEnter,
      dashHeader,
      connectionDetail,
      exportReport,
      initials: initialsFromEmail(user.email),
      toasts,
      profiles,
      activeProfileId,
      selectedProfileId,
      setSelectedProfileId,
      draft,
      profileDirty,
      saveProfile,
      addProfile,
      removeProfile,
      patchDraft,
      patchDraftAuth,
      connectFromDraftHttp,
      disconnectController,
      connectHttp,
      copyToClipboard,
      buildSshTunnelCommand,
      buildRemoteExecShell,
    }),
    [
      session,
      user,
      prefs,
      setPrefsField,
      apiBase,
      httpConnected,
      meta,
      metaError,
      lastLiveRaw,
      metaPollMs,
      liveData,
      runRefresh,
      fetchMetaNow,
      refreshing,
      selectedChIdx,
      signIn,
      signOut,
      clearFault,
      dismissAlert,
      pushToast,
      loginMode,
      email,
      password,
      pairHost,
      pairPort,
      loginError,
      pairError,
      pairTesting,
      loginLoading,
      testPairConnection,
      savePairAndEnter,
      dashHeader,
      connectionDetail,
      exportReport,
      toasts,
      profiles,
      activeProfileId,
      selectedProfileId,
      draft,
      profileDirty,
      saveProfile,
      addProfile,
      removeProfile,
      patchDraft,
      patchDraftAuth,
      connectFromDraftHttp,
      disconnectController,
      connectHttp,
      copyToClipboard,
      setSession,
      setSelectedProfileId,
      setSelectedChIdx,
      setLoginMode,
      setEmail,
      setPassword,
      setPairHost,
      setPairPort,
    ],
  )

  return <IccpAppContext.Provider value={value}>{children}</IccpAppContext.Provider>
}

export function ToastStack() {
  const { toasts } = useApp()
  return (
    <div
      style={{
        position: 'fixed',
        top: 'max(12px, env(safe-area-inset-top))',
        left: 14,
        right: 14,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            pointerEvents: 'none',
            alignSelf: 'center',
            maxWidth: 420,
            padding: '11px 16px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
            border:
              t.kind === 'err'
                ? '1px solid rgba(251,113,133,0.45)'
                : t.kind === 'ok'
                  ? '1px solid rgba(52,211,153,0.45)'
                  : '1px solid rgba(125,211,252,0.35)',
            background: t.kind === 'err' ? 'rgba(60,12,24,0.92)' : t.kind === 'ok' ? 'rgba(6,40,28,0.92)' : 'rgba(12,22,34,0.92)',
            color: 'rgba(245,247,251,0.95)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
