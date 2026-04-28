/** @param {any} src */
export function deepCloneFixture(src) {
  return JSON.parse(JSON.stringify(src))
}

/** @param {any[]} channels */
function sumMa(channels) {
  return channels.reduce((s, c) => s + (typeof c.ma === 'number' && !Number.isNaN(c.ma) ? c.ma : 0), 0)
}

/**
 * Map ICCP `GET /api/live` JSON to the mobile dashboard fixture shape.
 * @param {any} j
 * @param {any} fallback
 */
export function mapLiveJsonToFixture(j, fallback) {
  const next = deepCloneFixture(fallback)
  if (typeof j.feed_age_s === 'number') next.feedAge = j.feed_age_s
  if (typeof j.feed_trust_channel_metrics === 'boolean') next.feedTrust = j.feed_trust_channel_metrics
  if (typeof j.feed_ok === 'boolean' && j.feed_trust_channel_metrics === undefined) {
    next.feedTrust = j.feed_ok
  }
  if (j.telemetry_incomplete) next.telemetryIncomplete = true
  if (typeof j.sim_mode === 'boolean') next.simMode = j.sim_mode
  if (typeof j.total_ma === 'number') next.totalMa = j.total_ma
  if (typeof j.total_pow_w === 'number') next.totalPowW = j.total_pow_w
  if (typeof j.supply_v === 'number') next.supplyV = j.supply_v
  if (typeof j.temp_f === 'number') next.tempF = j.temp_f

  if (j.channels && typeof j.channels === 'object') {
    const keys = Object.keys(j.channels).sort((a, b) => Number(a) - Number(b))
    next.channels = keys.slice(0, 8).map((k, i) => {
      const c = j.channels[k]
      const name = c?.name ?? `Channel ${i + 1}`
      const raw = String(c?.state ?? c?.state_v2 ?? 'UNKNOWN').toUpperCase().replace(/\s/g, '_')
      const allowed = ['PROTECTING', 'REGULATE', 'FAULT', 'OPEN', 'OFF', 'DRY', 'DORMANT', 'PROBING', 'UNKNOWN']
      const state = allowed.includes(raw) ? raw : 'UNKNOWN'
      const ma = typeof c?.ma === 'number' ? c.ma : c?.ma == null ? null : Number(c.ma)
      return {
        idx: i,
        name,
        state,
        ma: Number.isFinite(ma) ? ma : null,
        target: Number(c?.target_ma ?? c?.target ?? 1.5),
        bus: c?.bus_v == null ? null : Number(c.bus_v),
        duty: Number(c?.duty ?? 0),
        z: c?.z_ohm == null ? null : Number(c.z_ohm),
        energyJ: Number(c?.energy_j ?? 0),
        wet: Number(c?.wet_minutes ?? 0),
        faultReason: c?.fault_reason,
      }
    })
  }
  next.totalMa = +sumMa(next.channels).toFixed(3)
  return next
}

/**
 * @param {any} data
 */
export function tickTelemetry(data) {
  data.feedAge = +(data.feedAge + 0.08 + Math.random() * 0.06).toFixed(2)
  data.now = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  for (const ch of data.channels) {
    if (ch.state === 'FAULT' || ch.ma == null) continue
    const wobble = (Math.random() - 0.5) * 0.04
    ch.ma = Math.max(0, +(ch.ma + wobble).toFixed(3))
    if (typeof ch.duty === 'number') ch.duty = Math.min(99, Math.max(0, +(ch.duty + (Math.random() - 0.5) * 1.2).toFixed(1)))
    if (typeof ch.bus === 'number') ch.bus = +(ch.bus + (Math.random() - 0.5) * 0.008).toFixed(3)
    if (typeof ch.z === 'number') ch.z = Math.max(500, Math.round(ch.z + (Math.random() - 0.5) * 40))
  }

  data.totalMa = +sumMa(data.channels).toFixed(3)
  data.totalPowW = +(data.totalMa * 0.0045 + Math.random() * 0.002).toFixed(3)
  if (typeof data.supplyV === 'number') data.supplyV = +(data.supplyV + (Math.random() - 0.5) * 0.006).toFixed(2)
  if (typeof data.tempF === 'number') data.tempF = +(data.tempF + (Math.random() - 0.5) * 0.03).toFixed(1)
  if (data.ref && typeof data.ref.rawMv === 'number') {
    data.ref.rawMv = +(data.ref.rawMv + (Math.random() - 0.5) * 0.15).toFixed(1)
    data.ref.shiftMv = +(data.ref.shiftMv + (Math.random() - 0.5) * 0.08).toFixed(1)
  }

  rollSeries(data)
  if (typeof data.feedTrust === 'boolean') {
    data.feedTrust = data.feedAge < 1.35 && !data.telemetryIncomplete
  }
}

/** @param {any} data */
function rollSeries(data) {
  const { series, channels } = data
  if (!series?.xs?.length) return
  const xs = series.xs
  const nextX = xs[xs.length - 1] + 1
  series.xs = [...xs.slice(1), nextX]
  for (let i = 0; i < channels.length; i++) {
    const key = `ch${i}`
    const arr = series[key]
    if (!Array.isArray(arr)) continue
    const v = channels[i].ma
    series[key] = [...arr.slice(1), v == null ? null : +Number(v).toFixed(3)]
  }
  if (Array.isArray(series.total)) {
    series.total = [...series.total.slice(1), data.totalMa]
  }
}

/**
 * @param {any} data
 * @param {number} chIdx
 */
export function clearFaultOnChannel(data, chIdx) {
  const ch = data.channels.find((c) => c.idx === chIdx)
  if (!ch || ch.state !== 'FAULT') return false
  ch.state = 'PROTECTING'
  ch.ma = 0.42
  ch.target = 1.5
  ch.bus = 4.85
  ch.duty = 12
  ch.z = 4100
  ch.energyJ = 12
  ch.wet = 2
  delete ch.faultReason
  data.totalMa = +sumMa(data.channels).toFixed(3)
  data.alerts = (data.alerts || []).filter((a) => {
    if (a.level !== 'fault') return true
    return !String(a.text).includes(`Anode ${chIdx + 1}`)
  })
  data.feedAge = Math.max(0.12, data.feedAge * 0.35)
  data.feedTrust = true
  data.telemetryIncomplete = false
  return true
}

/**
 * @param {string} apiBase
 * @param {any} fallback
 * @returns {Promise<{ fixture: any; raw: any }>}
 */
export async function fetchLiveTelemetry(apiBase, fallback) {
  const url = `${apiBase.replace(/\/$/, '')}/api/live`
  const res = await fetch(url, { method: 'GET', cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const j = await res.json()
  return { fixture: mapLiveJsonToFixture(j, fallback), raw: j }
}
