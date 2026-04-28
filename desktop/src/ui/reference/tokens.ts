/**
 * CoilShield / ICCP v77 tokens — mirrors `reference/screens.jsx` `T` object exactly,
 * plus card backgrounds used by Card / ChannelRow.
 */
export const T = {
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
  cardBg: 'rgba(12,18,24,0.65)',
  cardBgFault: 'rgba(60,12,24,0.65)',
  fontSans:
    '"Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontMono: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
} as const

export type TToken = typeof T
