/* eslint-disable react-refresh/only-export-components -- shared theme helpers + shell */
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArtSky } from './ArtSky.jsx'
import { useOptionalApp } from './app-context.jsx'
import { ConnectScreen } from './ConnectScreen.jsx'
import { MetaScreen } from './MetaScreen.jsx'
import {
  BottomTabs,
  ChannelDetailSheet,
  DashboardScreen,
  Mono,
  ReportsScreen,
  SettingsScreen,
  T,
} from './screens.jsx'

function shellTabFor(app, tab) {
  if (!app) return tab
  if (!app.httpConnected && (tab === 'dash' || tab === 'meta' || tab === 'trends')) return 'connect'
  return tab
}

export const ACCENTS = {
  sky: { accent: '#7dd3fc', accentS: '#38bdf8', accentSoft: 'rgba(56,189,248,0.14)' },
  emerald: { accent: '#6ee7b7', accentS: '#34d399', accentSoft: 'rgba(52,211,153,0.14)' },
  violet: { accent: '#c4b5fd', accentS: '#a78bfa', accentSoft: 'rgba(167,139,250,0.16)' },
  amber: { accent: '#fcd34d', accentS: '#f59e0b', accentSoft: 'rgba(245,158,11,0.16)' },
}

/** Default ArtSky + theme values for the production mobile shell (no design tweaks panel). */
export const MOBILE_DEFAULTS = {
  accent: 'sky',
  cardOpacity: 65,
  skyTheme: 'cerulean',
  skySpeed: 62,
  skyZoom: 40,
  skyWarp: 235,
  skyWind: 144,
  skyFbm: 91,
  skyBlur: 127,
  skyGrain: 14,
  blackVeil: 0,
  channelCount: 4,
}

export function useApplyTheme(accentKey, cardOpacity, appearance = 'dark') {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.CS_T) return
    const a = ACCENTS[accentKey] || ACCENTS.sky
    window.CS_T.accent = a.accent
    window.CS_T.accentS = a.accentS
    window.CS_T.accentSoft = a.accentSoft
    window.CS_T.ch[0] = a.accent
    const o = cardOpacity / 100
    if (appearance === 'light') {
      window.CS_T.surface = `rgba(255,255,255,${0.48 + o * 0.38})`
      window.CS_T.surfaceUp = `rgba(255,255,255,${0.58 + o * 0.32})`
      window.CS_T.surfaceMax = `rgba(255,255,255,${0.72 + o * 0.26})`
      window.CS_T.cardBg = `rgba(255,255,255,${0.52 + o * 0.35})`
      window.CS_T.cardBgFault = `rgba(254,226,226,${0.75 + o * 0.2})`
    } else {
      window.CS_T.surface = `rgba(11,15,20,${o})`
      window.CS_T.surfaceUp = `rgba(18,25,34,${o})`
      window.CS_T.surfaceMax = `rgba(26,36,49,${o})`
      window.CS_T.cardBg = `rgba(12,18,24,${o})`
      window.CS_T.cardBgFault = `rgba(60,12,24,${o})`
    }
  }, [accentKey, cardOpacity, appearance])
}

export function buildSkyProps(t) {
  const theme = t.skyThemeOverride ?? t.skyTheme
  return {
    theme,
    speed: t.skySpeed / 100,
    zoom: t.skyZoom / 100,
    warpPower: t.skyWarp / 1000,
    windSpeed: t.skyWind / 1000,
    fbmStrength: t.skyFbm / 100,
    blurRadius: t.skyBlur / 100,
    grainStrength: t.skyGrain / 1000,
    blackVeil: t.blackVeil / 100,
  }
}

export function PhoneShell({ platform, initialTab = 'dash', sky, contentBg = '#05070a' }) {
  const app = useOptionalApp()
  const [tab, setTab] = useState(initialTab)
  const shellTab = useMemo(() => shellTabFor(app, tab), [app, tab])

  /** Desktop jumps to Live after SSH+tunnel; mobile jumps to Live after HTTP connect (or on reopen if already connected). */
  const prevHttpOk = useRef(/** @type {boolean | null} */ (null))
  /* eslint-disable react-hooks/set-state-in-effect -- mirrors desktop `setTab('live')` after tunnel; intentional tab sync */
  useEffect(() => {
    if (!app) return
    const ok = app.httpConnected
    if (prevHttpOk.current === null) {
      prevHttpOk.current = ok
      if (ok) setTab('dash')
      return
    }
    const was = prevHttpOk.current
    prevHttpOk.current = ok
    if (ok && !was) setTab('dash')
  }, [app, app?.httpConnected])
  /* eslint-enable react-hooks/set-state-in-effect */

  const tabItems = useMemo(() => {
    if (!app) return undefined
    const h = app.httpConnected
    return [
      { id: 'connect', label: 'Connect' },
      { id: 'dash', label: 'Live', disabled: !h },
      { id: 'meta', label: 'Meta', disabled: !h },
      { id: 'trends', label: 'Trends', disabled: !h },
      { id: 'settings', label: 'Setup' },
    ]
  }, [app])

  const dash = app ? (
    <>
      <DashboardScreen
        data={app.liveData}
        title={app.dashHeader.title}
        subtitle={app.dashHeader.sub}
        trustBanner={
          app.liveData.feedTrust === false
            ? 'Telemetry may be stale or incomplete — do not trust raw mA as sole CP truth until the feed recovers.'
            : undefined
        }
        onChannelTap={(idx) => app.setSelectedChIdx(idx)}
        onClearFault={app.clearFault}
        onRefresh={app.runRefresh}
        refreshing={app.refreshing}
        onDismissAlert={app.dismissAlert}
      />
      {app.httpConnected && app.lastLiveRaw != null && (
        <div style={{ padding: '0 16px 100px' }}>
          <details style={{ color: T.muted, fontSize: 12 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600, color: T.text }}>Raw /api/live (Desktop Live tab)</summary>
            <pre
              style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 12,
                border: `1px solid ${T.border}`,
                background: 'rgba(0,0,0,0.35)',
                fontSize: 10,
                lineHeight: 1.4,
                overflow: 'auto',
                maxHeight: 280,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {JSON.stringify(app.lastLiveRaw, null, 2)}
            </pre>
          </details>
        </div>
      )}
      {!app.httpConnected && (
        <div style={{ padding: '0 20px 100px' }}>
          <Mono size={11} color={T.subtle}>
            Connect HTTP on the Connect tab to stream the same /api/live and /api/meta as the desktop Command Center (after
            SSH tunnel or LAN URL).
          </Mono>
        </div>
      )}
    </>
  ) : (
    <DashboardScreen />
  )

  const trends = app ? (
    <ReportsScreen data={app.liveData} onExport={app.httpConnected ? app.exportReport : undefined} />
  ) : (
    <ReportsScreen />
  )

  const settings = app ? (
    <SettingsScreen
      displayName={app.user.displayName}
      email={app.user.email}
      initials={app.initials}
      prefs={app.prefs}
      onPrefsChange={app.setPrefsField}
      connectionDetail={app.connectionDetail}
      logDirDetail={
        app.meta?.log_dir
          ? String(app.meta.log_dir)
          : app.meta?.latest_json
            ? String(app.meta.latest_json)
            : app.apiBase.trim()
              ? 'See /api/meta on Meta tab'
              : '—'
      }
      firmwareDetail={app.meta?.package_version != null ? String(app.meta.package_version) : undefined}
      onSignOut={app.signOut}
      onOpenDocs={() => {
        app.pushToast('ICCP contract: same as desktop — docs/desktop-app-integration.md in the ICCP repo.', 'info')
      }}
    />
  ) : (
    <SettingsScreen />
  )

  const connect = app ? <ConnectScreen /> : null
  const meta = app ? (
    <MetaScreen
      apiBase={app.apiBase}
      meta={app.meta}
      error={app.metaError}
      onRefresh={() => void app.fetchMetaNow()}
      refreshing={app.refreshing}
    />
  ) : null

  const screen =
    shellTab === 'connect'
      ? connect
      : shellTab === 'dash'
        ? dash
        : shellTab === 'meta'
          ? meta
          : shellTab === 'trends'
            ? trends
            : shellTab === 'settings'
              ? settings
              : connect

  const selectedCh =
    app && app.selectedChIdx != null ? app.liveData.channels.find((c) => c.idx === app.selectedChIdx) : null

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: contentBg }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <ArtSky {...sky} />
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'auto' }}>{screen}</div>
      <BottomTabs tab={shellTab} setTab={setTab} platform={platform} items={tabItems} />
      {app && (
        <ChannelDetailSheet
          open={app.selectedChIdx != null}
          ch={selectedCh}
          series={app.liveData.series}
          onClose={() => app.setSelectedChIdx(null)}
        />
      )}
    </div>
  )
}
