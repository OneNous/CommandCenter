/* eslint-disable react-refresh/only-export-components -- T, FIXTURE, and many leaf components */
import { useState } from 'react'
import { ArtSky } from './ArtSky.jsx'

const fontSans = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
const fontMono = 'ui-monospace, SFMono-Regular, Menlo, monospace'

const T_DARK = {
  bg: '#05070a',
  surface: '#0b0f14',
  surfaceUp: '#121922',
  surfaceMax: '#1a2431',
  border: 'rgba(255,255,255,0.10)',
  borderS: 'rgba(255,255,255,0.18)',
  text: '#f5f7fb',
  muted: 'rgba(245,247,251,0.72)',
  subtle: 'rgba(245,247,251,0.52)',
  accent: '#7dd3fc',
  accentS: '#38bdf8',
  accentSoft: 'rgba(56,189,248,0.14)',
  green: '#34d399',
  greenBg: 'rgba(52,211,153,0.12)',
  amber: '#fbbf24',
  amberBg: 'rgba(251,191,36,0.12)',
  red: '#fb7185',
  redBg: 'rgba(251,113,133,0.14)',
  violet: '#a78bfa',
  violetBg: 'rgba(167,139,250,0.14)',
  ch: ['#7dd3fc', '#34d399', '#fb923c', '#fb7185', '#a78bfa'],
  fontSans,
  fontMono,
  cardBg: 'rgba(12,18,24,0.65)',
  cardBgFault: 'rgba(60,12,24,0.65)',
  eyebrow: 'rgba(125,211,252,0.75)',
  scrim: 'rgba(0,0,0,0.55)',
  fillTrack: 'rgba(255,255,255,0.06)',
  fillPress: 'rgba(255,255,255,0.08)',
  fillSubtle: 'rgba(255,255,255,0.06)',
  fillRow: 'rgba(255,255,255,0.10)',
  inputBg: 'rgba(255,255,255,0.04)',
  segBg: 'rgba(255,255,255,0.04)',
  segActive: 'rgba(255,255,255,0.10)',
  segInShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
  toggleOff: 'rgba(255,255,255,0.10)',
  chartGrid: 'rgba(255,255,255,0.06)',
  sheetShadow: '0 -20px 60px rgba(0,0,0,0.5)',
  loginFade: 'linear-gradient(180deg, rgba(5,7,10,0) 0%, rgba(5,7,10,0.55) 60%, rgba(5,7,10,0.85) 100%)',
  tabBarFade: 'linear-gradient(180deg, rgba(5,7,10,0) 0%, rgba(5,7,10,0.95) 40%)',
  tabBarWell: 'rgba(12,18,24,0.85)',
  tabBarShadow: '0 12px 32px rgba(0,0,0,0.55)',
  tabActiveBg: 'rgba(125,211,252,0.14)',
  tabActiveBorder: 'rgba(125,211,252,0.35)',
}

const T_LIGHT = {
  bg: '#eef4f9',
  surface: 'rgba(255,255,255,0.55)',
  surfaceUp: 'rgba(255,255,255,0.72)',
  surfaceMax: 'rgba(255,255,255,0.94)',
  border: 'rgba(15,23,42,0.10)',
  borderS: 'rgba(15,23,42,0.16)',
  text: '#0f172a',
  muted: 'rgba(15,23,42,0.62)',
  subtle: 'rgba(15,23,42,0.44)',
  accent: '#0284c7',
  accentS: '#0369a1',
  accentSoft: 'rgba(14,165,233,0.14)',
  green: '#059669',
  greenBg: 'rgba(5,150,105,0.10)',
  amber: '#d97706',
  amberBg: 'rgba(217,119,6,0.12)',
  red: '#e11d48',
  redBg: 'rgba(225,29,72,0.10)',
  violet: '#7c3aed',
  violetBg: 'rgba(124,58,237,0.10)',
  ch: ['#0284c7', '#059669', '#ea580c', '#e11d48', '#7c3aed'],
  fontSans,
  fontMono,
  cardBg: 'rgba(255,255,255,0.58)',
  cardBgFault: 'rgba(254,226,226,0.78)',
  eyebrow: 'rgba(2,132,199,0.78)',
  scrim: 'rgba(15,23,42,0.30)',
  fillTrack: 'rgba(15,23,42,0.08)',
  fillPress: 'rgba(15,23,42,0.10)',
  fillSubtle: 'rgba(15,23,42,0.06)',
  fillRow: 'rgba(15,23,42,0.12)',
  inputBg: 'rgba(255,255,255,0.88)',
  segBg: 'rgba(15,23,42,0.05)',
  segActive: 'rgba(15,23,42,0.10)',
  segInShadow: 'inset 0 1px 0 rgba(15,23,42,0.08)',
  toggleOff: 'rgba(15,23,42,0.14)',
  chartGrid: 'rgba(15,23,42,0.10)',
  sheetShadow: '0 -20px 48px rgba(15,23,42,0.15)',
  loginFade: 'linear-gradient(180deg, rgba(238,244,249,0) 0%, rgba(238,244,249,0.75) 55%, rgba(226,236,246,0.92) 100%)',
  tabBarFade: 'linear-gradient(180deg, rgba(238,244,249,0) 0%, rgba(238,244,249,0.97) 38%)',
  tabBarWell: 'rgba(255,255,255,0.82)',
  tabBarShadow: '0 12px 32px rgba(15,23,42,0.12)',
  tabActiveBg: 'rgba(14,165,233,0.16)',
  tabActiveBorder: 'rgba(2,132,199,0.35)',
}

/** Mutable design tokens — use `applyDesignAppearance` so Pill/charts track light/dark. */
export const T = { ...T_DARK }

export function applyDesignAppearance(mode) {
  const src = mode === 'light' ? T_LIGHT : T_DARK
  Object.assign(T, src)
}

function pillStateStyle(state) {
  const idle = { fg: T.muted, bg: T.fillSubtle }
  const map = {
    PROTECTING: { fg: T.green, bg: T.greenBg },
    REGULATE: { fg: T.amber, bg: T.amberBg },
    PROBING: { fg: T.amber, bg: T.amberBg },
    FAULT: { fg: T.red, bg: T.redBg },
    OPEN: idle,
    OFF: idle,
    DRY: idle,
    DORMANT: idle,
    UNKNOWN: idle,
  }
  return map[state] || map.UNKNOWN
}

export const FIXTURE = {
  now: 'Apr 21, 14:32',
  feedAge: 0.32,
  jsonAge: 0.28,
  simMode: true,
  tempF: 68.4,
  supplyV: 4.85,
  totalMa: 6.724,
  totalPowW: 0.031,
  staleReasons: [],
  channels: [
    { idx: 0, name: 'Anode 1', state: 'PROTECTING', ma: 1.681, target: 1.7, bus: 4.852, duty: 42.0, z: 2881, energyJ: 137.42, wet: 14 },
    { idx: 1, name: 'Anode 2', state: 'PROTECTING', ma: 1.712, target: 1.7, bus: 4.841, duty: 44.5, z: 2755, energyJ: 132.05, wet: 12 },
    { idx: 2, name: 'Anode 3', state: 'REGULATE', ma: 0.842, target: 1.5, bus: 4.86, duty: 18.2, z: 5772, energyJ: 98.11, wet: 8 },
    {
      idx: 3,
      name: 'Anode 4',
      state: 'FAULT',
      ma: null,
      target: 0.5,
      bus: null,
      duty: 0.0,
      z: null,
      energyJ: 0.0,
      wet: 0,
      faultReason: 'OVERCURRENT (2.88 mA > 2.50 limit)',
    },
  ],
  ref: { rawMv: 112.3, shiftMv: 87.4, band: 'IN RANGE', baseline: true, adc: 'ADS1115 OK' },
  series: {
    xs: Array.from({ length: 30 }, (_, i) => i),
    ch0: [1.5, 1.55, 1.6, 1.62, 1.63, 1.64, 1.65, 1.66, 1.66, 1.67, 1.67, 1.67, 1.68, 1.68, 1.68, 1.68, 1.68, 1.68, 1.68, 1.68, 1.68, 1.68, 1.68, 1.68, 1.68, 1.68, 1.68, 1.68, 1.68, 1.68],
    ch1: [1.55, 1.58, 1.6, 1.63, 1.65, 1.67, 1.68, 1.69, 1.7, 1.7, 1.7, 1.7, 1.7, 1.71, 1.71, 1.71, 1.71, 1.71, 1.71, 1.71, 1.71, 1.71, 1.71, 1.71, 1.71, 1.71, 1.71, 1.71, 1.71, 1.71],
    ch2: [0.92, 0.91, 0.9, 0.9, 0.89, 0.88, 0.87, 0.87, 0.86, 0.86, 0.85, 0.85, 0.85, 0.85, 0.84, 0.84, 0.84, 0.84, 0.84, 0.84, 0.84, 0.84, 0.84, 0.84, 0.84, 0.84, 0.84, 0.84, 0.84, 0.84],
    ch3: [1.82, 1.78, 1.68, 1.55, 1.28, 0.75, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    total: [5.8, 5.9, 6.1, 6.0, 6.2, 6.2, 6.3, 6.3, 6.4, 6.4, 6.4, 6.5, 6.5, 6.6, 6.6, 6.6, 6.6, 6.7, 6.7, 6.7, 6.7, 6.7, 6.7, 6.72, 6.72, 6.72, 6.72, 6.72, 6.72, 6.72],
    target: Array.from({ length: 30 }, () => 1.6),
  },
  sessions: [
    { id: 142, when: '13:58', dur: '02:08', avgMa: 1.7, chs: [0, 1], end: 'manual stop' },
    { id: 141, when: '11:22', dur: '01:47', avgMa: 1.67, chs: [0, 1, 2], end: 'dry detected' },
    { id: 140, when: '09:08', dur: '03:12', avgMa: 1.71, chs: [0, 1, 2], end: 'scheduled' },
    { id: 139, when: '19:44', dur: '00:22', avgMa: 2.88, chs: [3], end: 'FAULT — overcurrent', isFault: true },
  ],
  alerts: [
    {
      level: 'fault',
      text: 'Anode 4 — OVERCURRENT (2.88 mA > 2.50 limit). Touch ~/coilshield/clear_fault to clear latch.',
    },
    { level: 'stale', text: 'reference ADC threshold init skipped — ALRT pulsing may be unreliable.' },
    { level: 'system', text: 'tick_writer_error: [Errno 5] Input/output error on TCA9548A @ 0x70 (3 recent).' },
  ],
}

if (typeof window !== 'undefined') {
  window.CS_T = T
  window.FIXTURE = FIXTURE
}

export function Pill({ state, children, size = 'md' }) {
  const s = pillStateStyle(state)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: s.bg,
        color: s.fg,
        padding: size === 'sm' ? '2px 7px' : '3px 9px',
        borderRadius: 999,
        fontSize: size === 'sm' ? 9.5 : 10.5,
        fontWeight: 600,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        fontFamily: T.fontSans,
        whiteSpace: 'nowrap',
        border: `1px solid ${s.fg}30`,
      }}
    >
      {children || state}
    </span>
  )
}

export function Eyebrow({ children, style }) {
  return (
    <div
      style={{
        fontFamily: T.fontSans,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: T.eyebrow,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function Card({ children, style, glow, onClick }) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 18,
        border: `1px solid ${T.border}`,
        background: T.cardBg,
        backdropFilter: 'blur(14px) saturate(120%)',
        WebkitBackdropFilter: 'blur(14px) saturate(120%)',
        padding: 16,
        ...style,
      }}
    >
      {glow && <LivingGlow palette={glow} />}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}

function LivingGlow({ palette = ['#05070a', '#0b1017', '#121b25', '#1d2a38', '#7dd3fc', '#e8f4fc'], duration = '26s' }) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: '-30%',
          zIndex: 0,
          background: `conic-gradient(from 0deg, ${palette[0]}, ${palette[1]}, ${palette[2]}, ${palette[3]}, ${palette[4]}, ${palette[5]}, ${palette[0]})`,
          filter: 'blur(48px) saturate(120%)',
          opacity: 0.55,
          animation: `cs-spin ${duration} linear infinite`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          borderRadius: 'inherit',
          background:
            'linear-gradient(180deg, rgba(125,211,252,0.10), transparent 30%),' +
            `radial-gradient(ellipse 92% 88% at 50% 38%, ${T.cardBg} 0%, ${T.cardBg} 48%, rgba(12,18,24,0) 100%)`,
          pointerEvents: 'none',
        }}
      />
    </>
  )
}

export function StatusDot({ color = T.green }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: 8, height: 8 }}>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: color,
          animation: 'cs-pulse 2s infinite',
        }}
      />
      <span
        style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          background: color,
          opacity: 0.25,
          filter: 'blur(3px)',
        }}
      />
    </span>
  )
}

export function Mono({ children, size = 13, weight = 500, color = T.text, style }) {
  return (
    <span
      style={{
        fontFamily: T.fontMono,
        fontSize: size,
        fontWeight: weight,
        fontVariantNumeric: 'tabular-nums',
        color,
        letterSpacing: '-0.01em',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

export function ScreenHeader({ title, sub, right }) {
  return (
    <div style={{ padding: '16px 20px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <Eyebrow style={{ margin: 0 }}>{sub || 'CoilShield ICCP'}</Eyebrow>
        <div style={{ flex: 1 }} />
        {right}
      </div>
      <h1
        style={{
          margin: 0,
          color: T.text,
          fontFamily: T.fontSans,
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: '-0.04em',
          lineHeight: 1.05,
        }}
      >
        {title}
      </h1>
    </div>
  )
}

export function DashboardScreen({
  data = FIXTURE,
  title = 'System OK',
  subtitle,
  trustBanner,
  onChannelTap,
  onClearFault,
  onRefresh,
  refreshing,
  onDismissAlert,
}) {
  const protCount = data.channels.filter((c) => c.state === 'PROTECTING').length
  const fileLabel = typeof data.feedAge === 'number' ? data.feedAge.toFixed(2) : '?'
  const jsonLabel = typeof data.jsonAge === 'number' ? data.jsonAge.toFixed(2) : null
  const sub =
    subtitle ??
    (jsonLabel != null
      ? `Live · file ${fileLabel}s · json ${jsonLabel}s · ${data.simMode ? 'SIM' : 'LIVE'}`
      : `Live · feed ${fileLabel}s · ${data.simMode ? 'SIM' : 'LIVE'}`)
  const fault = data.channels.some((c) => c.state === 'FAULT')
  const dotColor = fault ? T.red : data.feedTrust === false ? T.amber : T.green
  return (
    <div style={{ padding: '8px 0 100px', color: T.text, fontFamily: T.fontSans }}>
      <ScreenHeader
        title={title}
        sub={sub}
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {onRefresh && (
              <button
                type="button"
                onClick={() => onRefresh()}
                disabled={refreshing}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: `1px solid ${T.border}`,
                  background: refreshing ? T.fillSubtle : T.fillPress,
                  color: T.text,
                  cursor: refreshing ? 'wait' : 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 16,
                }}
                aria-label="Refresh telemetry"
              >
                {refreshing ? '…' : '↻'}
              </button>
            )}
            <StatusDot color={dotColor} />
          </div>
        }
      />

      {trustBanner && (
        <div style={{ padding: '0 16px 12px' }}>
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 14,
              border: '1px solid rgba(251,191,36,0.35)',
              background: T.amberBg,
              color: T.amber,
              fontSize: 12.5,
              fontWeight: 500,
              lineHeight: 1.45,
            }}
          >
            {trustBanner}
          </div>
        </div>
      )}

      <div style={{ padding: '8px 16px 14px' }}>
        <Card
          glow={['#040a0a', '#0a1615', '#122624', '#1a3834', '#2dd4bf', '#d1faf4']}
          style={{ padding: 22, borderRadius: 22 }}
        >
          <Eyebrow>Total output</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <Mono size={48} weight={600} style={{ letterSpacing: '-0.04em', lineHeight: 0.95 }}>
              {data.totalMa.toFixed(3)}
            </Mono>
            <Mono size={16} weight={500} color={T.muted}>
              mA
            </Mono>
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 18, flexWrap: 'wrap' }}>
            <Mini label="Power" value={data.totalPowW.toFixed(3)} unit="W" />
            <Mini label="Supply" value={data.supplyV.toFixed(2)} unit="V" />
            <Mini label="Temp" value={data.tempF.toFixed(1)} unit="°F" />
            <Mini label="Protecting" value={`${protCount}/${data.channels.length}`} />
          </div>
        </Card>
      </div>

      <div style={{ padding: '0 16px 14px' }}>
        <Card style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Eyebrow style={{ color: T.muted }}>Reference · Ag/AgCl</Eyebrow>
            <Pill state="PROTECTING" size="sm">
              {data.ref.band}
            </Pill>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: T.subtle, fontFamily: T.fontSans, marginBottom: 2 }}>Raw</div>
              <Mono size={18} weight={500}>
                {data.ref.rawMv.toFixed(1)}
                <Mono color={T.subtle} size={11} weight={400} style={{ marginLeft: 3 }}>
                  mV
                </Mono>
              </Mono>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.subtle, fontFamily: T.fontSans, marginBottom: 2 }}>Shift</div>
              <Mono size={18} weight={500}>
                +{data.ref.shiftMv.toFixed(1)}
                <Mono color={T.subtle} size={11} weight={400} style={{ marginLeft: 3 }}>
                  mV
                </Mono>
              </Mono>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', color: T.text }}>Channels</h2>
        <Mono size={11} color={T.subtle}>
          {data.channels.length} of 5
        </Mono>
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.channels.map((ch) => (
          <ChannelRow key={ch.idx} ch={ch} onTap={() => onChannelTap && onChannelTap(ch.idx)} onClearFault={onClearFault} />
        ))}
      </div>

      {data.alerts && data.alerts.length > 0 && (
        <div style={{ padding: '20px 20px 6px' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', color: T.text }}>System health</h2>
        </div>
      )}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.alerts.map((a, i) => (
          <AlertBar key={i} {...a} onDismiss={onDismissAlert ? () => onDismissAlert(i) : undefined} />
        ))}
      </div>
    </div>
  )
}

function Mini({ label, value, unit }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          color: T.subtle,
          fontFamily: T.fontSans,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 2 }}>
        <Mono size={15} weight={500}>
          {value}
        </Mono>
        {unit && (
          <Mono color={T.subtle} size={10} weight={400} style={{ marginLeft: 3 }}>
            {unit}
          </Mono>
        )}
      </div>
    </div>
  )
}

function ChannelRow({ ch, onTap, onClearFault }) {
  const isFault = ch.state === 'FAULT'
  const color = T.ch[ch.idx % T.ch.length]
  const pct = ch.target ? Math.min(100, ((ch.ma || 0) / ch.target) * 100) : 0

  return (
    <div
      onClick={onTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onTap?.()
        }
      }}
      style={{
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        background: isFault ? T.cardBgFault : T.cardBg,
        backdropFilter: 'blur(14px) saturate(120%)',
        WebkitBackdropFilter: 'blur(14px) saturate(120%)',
        border: `1px solid ${isFault ? 'rgba(251,113,133,0.30)' : T.border}`,
        borderRadius: 14,
        padding: 14,
        fontFamily: T.fontSans,
        color: T.text,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 12px ${color}80`,
            flexShrink: 0,
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{ch.name}</span>
            <Mono size={10} color={T.subtle}>
              idx {ch.idx}
            </Mono>
          </div>
        </div>
        <Pill state={ch.state} />
      </div>

      {isFault && ch.faultReason && (
        <Mono size={11} color={T.red} weight={500}>
          {ch.faultReason}
        </Mono>
      )}

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <Mono size={26} weight={600} style={{ letterSpacing: '-0.03em' }}>
          {ch.ma == null ? '—' : ch.ma.toFixed(2)}
        </Mono>
        <Mono size={11} color={T.muted}>
          mA
        </Mono>
        <span style={{ flex: 1 }} />
        <Mono size={11} color={T.subtle}>
          target {ch.target.toFixed(2)} mA
        </Mono>
      </div>

      {!isFault && (
        <div style={{ position: 'relative', height: 4, borderRadius: 2, background: T.fillTrack, overflow: 'visible' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: `${pct}%`,
              background: color,
              borderRadius: 2,
              boxShadow: `0 0 8px ${color}80`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '100%',
              top: -2,
              width: 1,
              height: 8,
              background: T.violet,
              transform: 'translateX(-1px)',
            }}
          />
        </div>
      )}

      <div style={{ display: 'flex', gap: 14, marginTop: 2 }}>
        <Tiny label="Duty" value={ch.duty.toFixed(1)} unit="%" />
        <Tiny label="Bus" value={ch.bus == null ? '—' : ch.bus.toFixed(2)} unit="V" />
        <Tiny label="Imp" value={ch.z == null ? '—' : ch.z.toLocaleString()} unit="Ω" />
      </div>

      {isFault && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClearFault && onClearFault(ch.idx)
          }}
          style={{
            marginTop: 4,
            background: '#fff',
            color: '#000',
            border: `1px solid ${T.borderS}`,
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: T.fontSans,
          }}
        >
          Clear fault latch
        </button>
      )}
    </div>
  )
}

function Tiny({ label, value, unit }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Mono
        size={9}
        color={T.subtle}
        weight={500}
        style={{ letterSpacing: '0.10em', textTransform: 'uppercase', fontFamily: T.fontSans }}
      >
        {label}
      </Mono>
      <div>
        <Mono size={12} weight={500}>
          {value}
        </Mono>
        {unit && (
          <Mono size={10} color={T.subtle} weight={400} style={{ marginLeft: 2 }}>
            {unit}
          </Mono>
        )}
      </div>
    </div>
  )
}

function AlertBar({ level, text, onDismiss }) {
  const styles = {
    fault: { bg: T.redBg, fg: T.red, bd: 'rgba(251,113,133,0.32)' },
    stale: { bg: T.amberBg, fg: T.amber, bd: 'rgba(251,191,36,0.32)' },
    system: { bg: T.redBg, fg: T.red, bd: 'rgba(251,113,133,0.32)' },
    info: { bg: T.accentSoft, fg: T.accent, bd: 'rgba(56,189,248,0.32)' },
  }
  const s = styles[level] || styles.info
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.bd}`,
        borderRadius: 12,
        padding: '10px 12px 10px 14px',
        fontSize: 12.5,
        fontWeight: 500,
        lineHeight: 1.5,
        fontFamily: T.fontSans,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>{text}</div>
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          style={{
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: 8,
            border: `1px solid ${s.bd}`,
            background: 'rgba(0,0,0,0.15)',
            color: s.fg,
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

export function ChannelDetailSheet({ open, ch, series, onClose }) {
  if (!open || !ch) return null
  const key = `ch${ch.idx}`
  const pts = (series && series[key]) || []
  const W = 280
  const H = 72
  const pad = 4
  const vals = pts.filter((v) => v != null)
  const lo = vals.length ? Math.min(...vals) : 0
  const hi = vals.length ? Math.max(...vals, 0.001) : 1
  const sx = (i) => pad + (i / Math.max(pts.length - 1, 1)) * (W - pad * 2)
  const sy = (v) => H - pad - ((v - lo) / (hi - lo)) * (H - pad * 2)
  const line = pts
    .map((v, i) => (v == null ? null : `${sx(i)},${sy(v)}`))
    .filter(Boolean)
    .join(' ')

  return (
    <div
      role="dialog"
      aria-modal
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: T.scrim,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '12px 12px calc(24px + env(safe-area-inset-bottom))',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 20,
          border: `1px solid ${T.border}`,
          background: T.surfaceMax,
          padding: 18,
          boxShadow: T.sheetShadow,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <Eyebrow style={{ color: T.muted }}>Channel</Eyebrow>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{ch.name}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: `1px solid ${T.border}`,
              background: T.fillSubtle,
              color: T.text,
              width: 36,
              height: 36,
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 18,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <Pill state={ch.state} />
        <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
          <div>
            <Mono size={10} color={T.subtle}>
              mA
            </Mono>
            <div style={{ marginTop: 2 }}>
              <Mono size={22} weight={600}>
                {ch.ma == null ? '—' : ch.ma.toFixed(3)}
              </Mono>
            </div>
          </div>
          <div>
            <Mono size={10} color={T.subtle}>
              Target
            </Mono>
            <div style={{ marginTop: 2 }}>
              <Mono size={22} weight={600}>
                {ch.target?.toFixed?.(2) ?? '—'}
              </Mono>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <Mono size={10} color={T.subtle}>
            Last {pts.length} samples
          </Mono>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', marginTop: 6 }}>
            <polyline fill="none" stroke={T.ch[ch.idx % T.ch.length]} strokeWidth="2" points={line} strokeLinejoin="round" />
          </svg>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: 16,
            padding: '12px',
            borderRadius: 12,
            border: `1px solid ${T.border}`,
            background: T.fillPress,
            color: T.text,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: T.fontSans,
          }}
        >
          Done
        </button>
      </div>
    </div>
  )
}

export function ReportsScreen({ data = FIXTURE, onExport }) {
  const [range, setRange] = useState('1h')
  const [mode, setMode] = useState('mA')
  const [visible, setVisible] = useState({})
  const [sessionOpen, setSessionOpen] = useState(/** @type {number | null} */ (null))
  const ranges = ['15m', '1h', '6h', '24h']
  const modes = ['mA', 'Ω']

  return (
    <div style={{ padding: '8px 0 100px', color: T.text, fontFamily: T.fontSans }}>
      <ScreenHeader title="Trends" sub="Last 24h · live tail" />

      <div style={{ padding: '0 16px 14px' }}>
        <Card style={{ padding: 14 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 12 }}>
            <Seg items={ranges} value={range} onChange={setRange} />
            <Seg items={modes} value={mode} onChange={setMode} />
          </div>

          <ChartSVG series={data.series} mode={mode} visible={visible} channelCount={data.channels.length} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 12 }}>
            <LegendDot
              color={T.violet}
              dashed
              label="Target"
              on={visible.target !== false}
              onClick={() => setVisible((v) => ({ ...v, target: v.target === false ? true : false }))}
            />
            {data.channels.map((ch) => (
              <LegendDot
                key={ch.idx}
                color={T.ch[ch.idx % T.ch.length]}
                label={ch.name}
                on={visible['ch' + ch.idx] !== false}
                onClick={() => setVisible((v) => ({ ...v, ['ch' + ch.idx]: v['ch' + ch.idx] === false ? true : false }))}
              />
            ))}
            <LegendDot
              color={T.text}
              label="Total"
              on={visible.total !== false}
              onClick={() => setVisible((v) => ({ ...v, total: v.total === false ? true : false }))}
            />
          </div>
        </Card>
      </div>

      <div style={{ padding: '0 16px 14px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <ExportBtn onClick={() => onExport?.('csv')}>↓ CSV</ExportBtn>
        <ExportBtn onClick={() => onExport?.('sqlite')}>↓ SQLite</ExportBtn>
        <ExportBtn onClick={() => onExport?.('json')}>↓ JSON</ExportBtn>
      </div>

      <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em' }}>Recent wet sessions</h2>
        <Mono size={11} color={T.subtle}>
          {data.sessions.length} · 48h
        </Mono>
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.sessions.map((s) => (
          <Card
            key={s.id}
            style={{ padding: 12, cursor: onExport ? 'pointer' : 'default' }}
            onClick={onExport ? () => setSessionOpen((prev) => (prev === s.id ? null : s.id)) : undefined}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Mono size={12} weight={600}>
                #{s.id}
              </Mono>
              <Mono size={11} color={T.subtle}>
                {s.when} · {s.dur}
              </Mono>
              <span style={{ flex: 1 }} />
              <Mono size={13} weight={600}>
                {s.avgMa.toFixed(2)}
                <Mono color={T.subtle} size={10} weight={400} style={{ marginLeft: 3 }}>
                  mA
                </Mono>
              </Mono>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {s.chs.map((c) => (
                  <span
                    key={c}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      background: T.ch[c] + '22',
                      color: T.ch[c],
                      fontSize: 9.5,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: T.fontMono,
                      border: `1px solid ${T.ch[c]}40`,
                    }}
                  >
                    A{c + 1}
                  </span>
                ))}
              </div>
              <span style={{ flex: 1 }} />
              <span
                style={{
                  fontSize: 11,
                  color: s.isFault ? T.red : T.muted,
                  fontWeight: s.isFault ? 600 : 400,
                }}
              >
                {s.end}
              </span>
            </div>
            {onExport && sessionOpen === s.id && (
              <Mono size={10} color={T.subtle} style={{ marginTop: 8, lineHeight: 1.45, display: 'block' }}>
                Session artifact: wet_minutes={JSON.stringify(s.dur)}, channels={JSON.stringify(s.chs)}, avg_mA=
                {s.avgMa.toFixed(3)}. Tap export above for full bundle.
              </Mono>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

function Seg({ items, value, onChange }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        background: T.segBg,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: 2,
      }}
    >
      {items.map((it) => {
        const active = value === it
        return (
          <button
            type="button"
            key={it}
            onClick={() => onChange(it)}
            style={{
              background: active ? T.segActive : 'transparent',
              color: active ? T.text : T.muted,
              border: 'none',
              padding: '5px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: T.fontSans,
              fontVariantNumeric: 'tabular-nums',
              boxShadow: active ? T.segInShadow : 'none',
            }}
          >
            {it}
          </button>
        )
      })}
    </div>
  )
}

function ExportBtn({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'transparent',
        color: T.text,
        border: `1px solid ${T.border}`,
        padding: '8px 14px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: T.fontSans,
      }}
    >
      {children}
    </button>
  )
}

function LegendDot({ color, label, on, dashed, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        padding: '2px 0',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11,
        color: T.muted,
        opacity: on ? 1 : 0.35,
        fontFamily: T.fontSans,
      }}
    >
      {dashed ? (
        <span style={{ width: 14, height: 0, borderTop: `1.5px dashed ${color}` }} />
      ) : (
        <span style={{ width: 14, height: 2, borderRadius: 1, background: color, boxShadow: `0 0 6px ${color}80` }} />
      )}
      {label}
    </button>
  )
}

function ChartSVG({ series, mode, visible, channelCount = 4 }) {
  const W = 320
  const H = 160
  const pad = { t: 8, r: 6, b: 18, l: 28 }
  const xs = series.xs
  const xMax = xs[xs.length - 1]
  const allVals = []
  ;['ch0', 'ch1', 'ch2', 'ch3', 'total', 'target'].forEach((k) => {
    if (visible[k] === false) return
    ;(series[k] || []).forEach((v) => v != null && allVals.push(v))
  })
  const yMax = Math.max(...allVals, 1) * 1.08
  const sx = (x) => pad.l + (x / xMax) * (W - pad.l - pad.r)
  const sy = (y) => H - pad.b - (y / yMax) * (H - pad.t - pad.b)

  const poly = (arr, stroke, dash, w = 1.6, key) => {
    if (!arr) return null
    const parts = []
    let cur = []
    arr.forEach((v, i) => {
      if (v == null) {
        if (cur.length) {
          parts.push(cur)
          cur = []
        }
      } else cur.push(`${sx(xs[i])},${sy(v)}`)
    })
    if (cur.length) parts.push(cur)
    return parts.map((pts, i) => (
      <polyline
        key={key + '-' + i}
        fill="none"
        stroke={stroke}
        strokeWidth={w}
        strokeDasharray={dash}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts.join(' ')}
      />
    ))
  }

  const ticks = 4
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="totGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={T.accent} stopOpacity="0.20" />
          <stop offset="1" stopColor={T.accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const t = (yMax * i) / ticks
        return (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={sy(t)} y2={sy(t)} stroke={T.chartGrid} />
            <text x={pad.l - 4} y={sy(t) + 3} textAnchor="end" fontSize="8.5" fontFamily={T.fontMono} fill={T.subtle}>
              {t.toFixed(1)}
            </text>
          </g>
        )
      })}
      <text x={W - 4} y={11} textAnchor="end" fontSize="8.5" fontFamily={T.fontMono} fill={T.subtle}>
        {mode}
      </text>

      {visible.total !== false &&
        series.total &&
        (() => {
          const pts = series.total.map((v, i) => (v == null ? null : `${sx(xs[i])},${sy(v)}`)).filter(Boolean)
          if (!pts.length) return null
          const first = pts[0].split(',')
          const last = pts[pts.length - 1].split(',')
          const path = `M${first[0]},${sy(0)} L${pts.join(' ')} L${last[0]},${sy(0)} Z`
          return <path d={path} fill="url(#totGrad)" />
        })()}

      {visible.target !== false && poly(series.target, T.violet, '5 3', 1.4, 'tg')}
      {Array.from({ length: channelCount }, (_, i) =>
        visible['ch' + i] !== false && poly(series['ch' + i], T.ch[i % T.ch.length], null, 1.6, 'ch' + i),
      )}
      {visible.total !== false && poly(series.total, T.text, null, 2, 'tot')}
    </svg>
  )
}

export function SettingsScreen({
  displayName = 'Jordan Kim',
  email = 'jordan@onenous.io',
  initials = 'JK',
  prefs = { notif: true, autoClear: true, haptic: true, appearance: 'dark' },
  onPrefsChange,
  connectionDetail = '10.0.4.18 · LAN',
  logDirDetail = '/var/lib/coilshield/logs',
  firmwareDetail = '2.1.4',
  onSignOut,
  onOpenDocs,
}) {
  return (
    <div style={{ padding: '8px 0 100px', color: T.text, fontFamily: T.fontSans }}>
      <ScreenHeader title="Settings" sub="Account · device" />

      <div style={{ padding: '0 16px 14px' }}>
        <Card style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${T.accent}, #2563eb)`,
              display: 'grid',
              placeItems: 'center',
              color: '#000',
              fontWeight: 700,
              fontSize: initials.length > 2 ? 14 : 20,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{displayName || 'Operator'}</div>
            <Mono size={11} color={T.subtle}>
              {email || '—'}
            </Mono>
          </div>
        </Card>
      </div>

      <Group label="Device">
        <Toggle
          label="System notifications"
          on={prefs.notif}
          onChange={(v) => onPrefsChange?.('notif', v)}
          sub="Faults, stale-feed, overcurrent"
        />
        <Toggle
          label="Auto-clear non-latched"
          on={prefs.autoClear}
          onChange={(v) => onPrefsChange?.('autoClear', v)}
          sub="Resume PROTECTING when telemetry recovers"
        />
        <Toggle label="Haptics" on={prefs.haptic} onChange={(v) => onPrefsChange?.('haptic', v)} />
        <Toggle
          label="Light appearance"
          on={prefs.appearance === 'light'}
          onChange={(v) => onPrefsChange?.('appearance', v ? 'light' : 'dark')}
          sub="Ice-white fluid sky — same ArtSky preset as the v77 shop (white-ice-blue)"
        />
      </Group>

      <Group label="Connection">
        <Link label="Controller endpoint" detail={connectionDetail} />
        <Link label="Log directory" detail={logDirDetail} />
        <Link label="Webhook" detail="not configured" />
      </Group>

      <Group label="About">
        <Link label="Firmware" detail={firmwareDetail} />
        <Link label="App version" detail="1.0.0 (build 142)" />
        <Link label="Documentation" onClick={onOpenDocs} />
        <Link label="Sign out" danger onClick={onSignOut} />
      </Group>
    </div>
  )
}

function Group({ label, children }) {
  return (
    <div style={{ padding: '0 16px 14px' }}>
      <Eyebrow style={{ padding: '0 4px 8px', color: T.muted }}>{label}</Eyebrow>
      <Card style={{ padding: 4 }}>{children}</Card>
    </div>
  )
}

function Toggle({ label, sub, on, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 12px',
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: T.text }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: T.subtle, marginTop: 2, lineHeight: 1.4 }}>{sub}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!on)}
        style={{
          width: 42,
          height: 24,
          borderRadius: 999,
          background: on ? T.accentS : T.toggleOff,
          border: 'none',
          padding: 2,
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <span
          style={{
            display: 'block',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            transform: on ? 'translateX(18px)' : 'translateX(0)',
            transition: 'transform 160ms ease',
          }}
        />
      </button>
    </div>
  )
}

function Link({ label, detail, danger, onClick }) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '13px 12px',
        borderBottom: `1px solid ${T.border}`,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ flex: 1, fontSize: 14, color: danger ? T.red : T.text }}>{label}</div>
      {detail && (
        <Mono size={11} color={T.subtle}>
          {detail}
        </Mono>
      )}
      <span style={{ color: T.subtle, fontSize: 14 }}>{onClick ? '›' : ''}</span>
    </div>
  )
}

export function LoginScreen({
  sky,
  mode = 'signIn',
  onBackFromPair,
  email = 'jordan@onenous.io',
  password = '',
  onEmailChange,
  onPasswordChange,
  loginError,
  pairError,
  loginLoading,
  pairTesting,
  onSignIn,
  onOpenPair,
  onTestPair,
  onSavePair,
  pairHost = '127.0.0.1',
  pairPort = '9080',
  onPairHostChange,
  onPairPortChange,
}) {
  const pair = mode === 'pair'
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        color: T.text,
        fontFamily: T.fontSans,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: T.bg,
      }}
    >
      <ArtSky {...(sky || {})} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 4,
          background: T.loginFade,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          padding: 'max(52px, env(safe-area-inset-top)) 28px 28px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          {pair && (
            <button
              type="button"
              onClick={() => onBackFromPair?.()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                background: T.fillSubtle,
                color: T.text,
                cursor: 'pointer',
                fontSize: 18,
              }}
              aria-label="Back"
            >
              ←
            </button>
          )}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: '#fff',
              color: '#000',
              display: 'grid',
              placeItems: 'center',
              fontFamily: T.fontMono,
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: '-0.04em',
            }}
          >
            CS
          </div>
          <span style={{ fontFamily: T.fontMono, fontWeight: 700, fontSize: 14, letterSpacing: '0.02em' }}>CoilShield</span>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <Eyebrow>{pair ? 'On-device pairing' : 'ICCP control'}</Eyebrow>
          <h1
            style={{
              margin: '10px 0 8px',
              fontSize: 34,
              fontWeight: 600,
              letterSpacing: '-0.05em',
              lineHeight: 1.05,
            }}
          >
            {pair ? 'Point the app at your Pi dashboard.' : 'Cathodic protection in your pocket.'}
          </h1>
          <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6, margin: '0 0 22px', maxWidth: 340 }}>
            {pair
              ? 'After SSH port-forward (e.g. local 9080 → Pi 8080), enter host and port. We hit /api/meta to verify, then stream /api/live.'
              : 'Live telemetry, fault clearing, and trend export from any anode channel — over LAN or remote.'}
          </p>

          {pair ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Field label="Host" value={pairHost} onChange={onPairHostChange} placeholder="127.0.0.1" autoComplete="off" />
              <Field
                label="Port"
                value={pairPort}
                onChange={onPairPortChange}
                placeholder="9080"
                autoComplete="off"
                inputMode="numeric"
              />
              {pairError && (
                <Mono size={12} color={T.red} weight={500}>
                  {pairError}
                </Mono>
              )}
              <button
                type="button"
                disabled={pairTesting}
                onClick={() => (onTestPair ? onTestPair() : undefined)}
                style={{
                  width: '100%',
                  marginTop: 6,
                  background: T.fillRow,
                  color: T.text,
                  border: `1px solid ${T.border}`,
                  padding: '14px 16px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: pairTesting ? 'wait' : 'pointer',
                  fontFamily: T.fontSans,
                }}
              >
                {pairTesting ? 'Testing…' : 'Test connection (/api/meta)'}
              </button>
              <button
                type="button"
                disabled={pairTesting}
                onClick={() => (onSavePair ? onSavePair() : undefined)}
                style={{
                  width: '100%',
                  marginTop: 4,
                  background: '#fff',
                  color: '#000',
                  border: `1px solid ${T.borderS}`,
                  padding: '14px 16px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: pairTesting ? 'wait' : 'pointer',
                  fontFamily: T.fontSans,
                }}
              >
                Save & open dashboard
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Field
                  label="Email"
                  value={email}
                  onChange={onEmailChange}
                  placeholder="you@organization.com"
                  autoComplete="username"
                />
                <Field
                  label="Password"
                  value={password}
                  onChange={onPasswordChange}
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              {loginError && (
                <Mono size={12} color={T.red} weight={500} style={{ marginTop: 10, display: 'block' }}>
                  {loginError}
                </Mono>
              )}
              <button
                type="button"
                disabled={loginLoading}
                onClick={() => void onSignIn?.()}
                style={{
                  width: '100%',
                  marginTop: 18,
                  background: '#fff',
                  color: '#000',
                  border: `1px solid ${T.borderS}`,
                  padding: '14px 16px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loginLoading ? 'wait' : 'pointer',
                  fontFamily: T.fontSans,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.24)',
                  opacity: loginLoading ? 0.75 : 1,
                }}
              >
                {loginLoading ? 'Signing in…' : 'Sign in'}
              </button>
              <button
                type="button"
                onClick={() => onOpenPair?.()}
                style={{
                  width: '100%',
                  marginTop: 8,
                  background: 'transparent',
                  color: T.text,
                  border: `1px solid ${T.border}`,
                  padding: '14px 16px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: T.fontSans,
                }}
              >
                Pair a controller
              </button>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
            <Mono size={11} color={T.subtle}>
              v1.0.0 · build 142
            </Mono>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, autoComplete, inputMode }) {
  const controlled = typeof onChange === 'function'
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, color: T.muted, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <input
        value={controlled ? value ?? '' : undefined}
        defaultValue={!controlled ? value : undefined}
        onChange={controlled ? (e) => onChange(e.target.value) : undefined}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        style={{
          background: T.inputBg,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: '12px 14px',
          color: T.text,
          fontSize: 14,
          fontFamily: T.fontSans,
          outline: 'none',
        }}
      />
    </label>
  )
}

const DEFAULT_TAB_ITEMS = [
  { id: 'dash', label: 'Live' },
  { id: 'trends', label: 'Trends' },
  { id: 'settings', label: 'Settings' },
]

/** @param {{ tab: string; setTab: (t: string) => void; platform?: string; items?: { id: string; label: string; disabled?: boolean }[] }} props */
export function BottomTabs({ tab, setTab, platform = 'ios', items }) {
  const tabs = items ?? DEFAULT_TAB_ITEMS
  const bottomPad = platform === 'ios' ? 20 : 16
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: `calc(${bottomPad}px + env(safe-area-inset-bottom, 0px))`,
        background: T.tabBarFade,
        pointerEvents: 'auto',
        zIndex: 40,
      }}
    >
      <div
        style={{
          margin: '0 16px',
          background: T.tabBarWell,
          border: `1px solid ${T.border}`,
          borderRadius: 18,
          padding: 6,
          display: 'flex',
          gap: 4,
          backdropFilter: 'blur(18px) saturate(140%)',
          WebkitBackdropFilter: 'blur(18px) saturate(140%)',
          boxShadow: T.tabBarShadow,
        }}
      >
        {tabs.map((t) => {
          const active = tab === t.id
          const dis = !!t.disabled
          return (
            <button
              type="button"
              key={t.id}
              disabled={dis}
              onClick={() => !dis && setTab(t.id)}
              style={{
                flex: 1,
                padding: '10px 6px',
                background: active ? T.tabActiveBg : 'transparent',
                color: dis ? T.subtle : active ? T.accent : T.muted,
                border: active ? `1px solid ${T.tabActiveBorder}` : '1px solid transparent',
                borderRadius: 14,
                fontSize: 11,
                fontWeight: 600,
                cursor: dis ? 'not-allowed' : 'pointer',
                fontFamily: T.fontSans,
                letterSpacing: '-0.01em',
                opacity: dis ? 0.45 : 1,
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
