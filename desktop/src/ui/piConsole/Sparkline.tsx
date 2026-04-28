/**
 * Minimal SVG sparkline for Pi Console run history (trends).
 */
export function Sparkline({
  values,
  stroke,
  height = 36,
  fillAlpha = 0.12,
}: {
  values: number[]
  stroke: string
  height?: number
  /** Area fill under line — rgba alpha */
  fillAlpha?: number
}) {
  const w = 140
  const pad = 3
  if (values.length === 0) {
    return (
      <div style={{ height, opacity: 0.35, fontSize: 11, fontFamily: 'var(--cs-font)', color: 'var(--cs-muted)' }}>
        No runs yet
      </div>
    )
  }
  if (values.length === 1) {
    values = [values[0], values[0]]
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts: string[] = []
  for (let i = 0; i < values.length; i++) {
    const x = pad + (i / (values.length - 1)) * (w - 2 * pad)
    const y = pad + (1 - (values[i] - min) / span) * (height - 2 * pad)
    pts.push(`${x},${y}`)
  }
  const line = pts.join(' ')
  const baseY = height - pad
  const area = `${pad},${baseY} ${line} ${w - pad},${baseY}`

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" aria-hidden>
      <polygon points={area} fill={stroke} fillOpacity={fillAlpha} />
      <polyline fill="none" stroke={stroke} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" points={line} />
    </svg>
  )
}
