/**
 * Atoms from `reference/screens.jsx` — inlined styles preserved for pixel-parity with design reference.
 */
import type { CSSProperties, ReactNode } from 'react'
import { T } from './tokens'

const STATE_COLOR: Record<
  string,
  { fg: string; bg: string }
> = {
  PROTECTING: { fg: T.green, bg: T.greenBg },
  REGULATE: { fg: T.amber, bg: T.amberBg },
  PROBING: { fg: T.amber, bg: T.amberBg },
  FAULT: { fg: T.red, bg: T.redBg },
  OPEN: { fg: T.muted, bg: 'rgba(255,255,255,0.06)' },
  OFF: { fg: T.muted, bg: 'rgba(255,255,255,0.06)' },
  DRY: { fg: T.muted, bg: 'rgba(255,255,255,0.06)' },
  DORMANT: { fg: T.muted, bg: 'rgba(255,255,255,0.06)' },
  UNKNOWN: { fg: T.muted, bg: 'rgba(255,255,255,0.06)' },
}

export function Pill({
  state,
  children,
  size = 'md',
}: {
  state: string
  children?: ReactNode
  size?: 'sm' | 'md'
}) {
  const s = STATE_COLOR[state] ?? STATE_COLOR.UNKNOWN
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
      {children ?? state}
    </span>
  )
}

export function Eyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: T.fontSans,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: 'rgba(125,211,252,0.75)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function LivingGlow({
  palette = ['#05070a', '#0b1017', '#121b25', '#1d2a38', '#7dd3fc', '#e8f4fc'],
  duration = '26s',
}: {
  palette?: string[]
  duration?: string
}) {
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

export function Card({
  children,
  style,
  glow,
}: {
  children: ReactNode
  style?: CSSProperties
  glow?: string[]
}) {
  return (
    <div
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
      {glow ? <LivingGlow palette={glow} /> : null}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}

export function StatusDot({ color = T.green }: { color?: string }) {
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

export function Mono({
  children,
  size = 13,
  weight = 500,
  color = T.text,
  style,
}: {
  children: ReactNode
  size?: number
  weight?: number
  color?: string
  style?: CSSProperties
}) {
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

export function Row({
  k,
  v,
  unit,
  breakAll,
}: {
  k: string
  v: ReactNode
  unit?: string
  /** Long paths / URLs — match `.meta-summary__path` behavior */
  breakAll?: boolean
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 8,
        padding: '9px 0',
        borderBottom: `1px solid ${T.border}`,
        fontSize: 13,
      }}
    >
      <span style={{ color: T.muted, fontFamily: T.fontSans }}>{k}</span>
      <span style={breakAll ? { minWidth: 0 } : undefined}>
        <Mono style={breakAll ? { wordBreak: 'break-all' } : undefined}>{v}</Mono>
        {unit ? (
          <Mono color={T.subtle} weight={400} style={{ marginLeft: 4 }}>
            {unit}
          </Mono>
        ) : null}
      </span>
    </div>
  )
}

export function ScreenHeader({
  title,
  sub,
  right,
}: {
  title: string
  sub?: string
  right?: ReactNode
}) {
  return (
    <div style={{ padding: '16px 20px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <Eyebrow style={{ margin: 0 }}>{sub ?? 'CoilShield ICCP'}</Eyebrow>
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

export function Mini({
  label,
  value,
  unit,
}: {
  label: string
  value: ReactNode
  unit?: string
}) {
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
        {unit ? (
          <Mono color={T.subtle} size={10} weight={400} style={{ marginLeft: 3 }}>
            {unit}
          </Mono>
        ) : null}
      </div>
    </div>
  )
}

function Tiny({ label, value, unit }: { label: string; value: ReactNode; unit?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Mono
        size={9}
        color={T.subtle}
        weight={500}
        style={{
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          fontFamily: T.fontSans,
        }}
      >
        {label}
      </Mono>
      <div>
        <Mono size={12} weight={500}>
          {value}
        </Mono>
        {unit ? (
          <Mono size={10} color={T.subtle} weight={400} style={{ marginLeft: 2 }}>
            {unit}
          </Mono>
        ) : null}
      </div>
    </div>
  )
}

export type ChannelFixture = {
  idx: number
  name: string
  state: string
  ma: number | null
  target: number | null
  bus: number | null
  duty: number
  z: number | null
  faultReason?: string
}

export function ChannelRow({
  ch,
  onTap,
  onClearFault,
}: {
  ch: ChannelFixture
  onTap?: () => void
  onClearFault?: (idx: number) => void
}) {
  const isFault = ch.state === 'FAULT'
  const color = T.ch[ch.idx % T.ch.length]
  const targetNum = ch.target ?? 0
  const pct = targetNum > 0 ? Math.min(100, (((ch.ma ?? 0) / targetNum) * 100)) : 0

  return (
    <div
      role={onTap ? 'button' : undefined}
      tabIndex={onTap ? 0 : undefined}
      onClick={onTap}
      onKeyDown={
        onTap
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onTap()
              }
            }
          : undefined
      }
      style={{
        width: '100%',
        textAlign: 'left',
        cursor: onTap ? 'pointer' : 'default',
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

      {isFault && ch.faultReason ? (
        <Mono size={11} color={T.red} weight={500}>
          {ch.faultReason}
        </Mono>
      ) : null}

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <Mono size={26} weight={600} style={{ letterSpacing: '-0.03em' }}>
          {ch.ma == null ? '—' : ch.ma.toFixed(2)}
        </Mono>
        <Mono size={11} color={T.muted}>
          mA
        </Mono>
        <span style={{ flex: 1 }} />
        <Mono size={11} color={T.subtle}>
          target {ch.target != null ? ch.target.toFixed(2) : '—'} mA
        </Mono>
      </div>

      {!isFault ? (
        <div
          style={{
            position: 'relative',
            height: 4,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.06)',
            overflow: 'visible',
          }}
        >
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
      ) : null}

      <div style={{ display: 'flex', gap: 14, marginTop: 2 }}>
        <Tiny label="Duty" value={ch.duty.toFixed(1)} unit="%" />
        <Tiny label="Bus" value={ch.bus == null ? '—' : ch.bus.toFixed(2)} unit="V" />
        <Tiny label="Imp" value={ch.z == null ? '—' : ch.z.toLocaleString()} unit="Ω" />
      </div>

      {isFault && onClearFault ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClearFault(ch.idx)
          }}
          style={{
            marginTop: 4,
            background: '#fff',
            color: '#000',
            border: '1px solid rgba(255,255,255,0.14)',
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
      ) : null}
    </div>
  )
}

export type AlertLevel = 'fault' | 'stale' | 'system' | 'info'

export function AlertBar({ level, text }: { level: AlertLevel; text: string }) {
  const styles: Record<AlertLevel, { bg: string; fg: string; bd: string }> = {
    fault: { bg: T.redBg, fg: T.red, bd: 'rgba(251,113,133,0.32)' },
    stale: { bg: T.amberBg, fg: T.amber, bd: 'rgba(251,191,36,0.32)' },
    system: { bg: T.redBg, fg: T.red, bd: 'rgba(251,113,133,0.32)' },
    info: { bg: T.accentSoft, fg: T.accent, bd: 'rgba(56,189,248,0.32)' },
  }
  const s = styles[level] ?? styles.info
  return (
    <div
      style={{
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.bd}`,
        borderRadius: 12,
        padding: '10px 14px',
        fontSize: 12.5,
        fontWeight: 500,
        lineHeight: 1.5,
        fontFamily: T.fontSans,
      }}
    >
      {text}
    </div>
  )
}
