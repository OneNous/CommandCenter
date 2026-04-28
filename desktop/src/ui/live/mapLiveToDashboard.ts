import type { ApiLive, ApiMeta } from '../api'
import type { AlertLevel } from '../reference/primitives'
import type { ChannelFixture } from '../reference/primitives'

export function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v)
  return null
}

/** Human-readable duration; raw seconds still shown elsewhere where needed. */
export function humanAgeSeconds(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '—'
  if (s < 90) return `${s.toFixed(0)} s`
  if (s < 7200) return `${(s / 60).toFixed(1)} min`
  if (s < 172800) return `${(s / 3600).toFixed(1)} h`
  return `${(s / 86400).toFixed(2)} d`
}

function channelEntries(live: ApiLive): Array<{ key: string; row: Record<string, unknown> }> {
  const ch =
    live.channels ??
    (typeof live.channel_metrics === 'object' && live.channel_metrics != null
      ? live.channel_metrics
      : undefined)
  if (Array.isArray(ch)) {
    return ch.map((row, i) => ({
      key: `i${i}`,
      row: typeof row === 'object' && row != null ? (row as Record<string, unknown>) : {},
    }))
  }
  if (ch && typeof ch === 'object' && !Array.isArray(ch)) {
    return Object.entries(ch as Record<string, unknown>).map(([key, row]) => ({
      key,
      row: typeof row === 'object' && row != null ? (row as Record<string, unknown>) : {},
    }))
  }
  return []
}

function normalizeState(row: Record<string, unknown>): string {
  const raw = row.state ?? row.mode ?? 'UNKNOWN'
  return String(raw).toUpperCase()
}

function rowToChannel(
  key: string,
  row: Record<string, unknown>,
  index: number,
): ChannelFixture {
  const idxRaw = num(row.idx ?? row.index ?? row.channel)
  const idx = idxRaw != null ? Math.floor(idxRaw) : index
  const name =
    typeof row.name === 'string' && row.name.trim()
      ? row.name
      : typeof row.label === 'string'
        ? row.label
        : `Channel ${key}`
  const ma = num(row.ma ?? row.current_ma ?? row.i_ma)
  const target = num(row.target ?? row.target_ma ?? row.setpoint_ma)
  const bus = num(row.bus_v ?? row.bus ?? row.vbus)
  const duty = num(row.duty_pct ?? row.duty ?? row.pwm_duty) ?? 0
  const z = num(row.z_ohms ?? row.impedance_ohms ?? row.z ?? row.imp)
  const faultReason =
    typeof row.fault_reason === 'string'
      ? row.fault_reason
      : typeof row.faultReason === 'string'
        ? row.faultReason
        : typeof row.fault === 'string'
          ? row.fault
          : undefined
  return {
    idx,
    name,
    state: normalizeState(row),
    ma,
    target,
    bus,
    duty,
    z,
    faultReason,
  }
}

export type RefBlock = {
  rawMv: number | null
  shiftMv: number | null
  band: string
  baseline?: boolean
  adc?: string
}

export type DashboardMapped = {
  feedSubtitle: string
  headerTitle: string
  statusColor: string
  totalMa: number
  totalPowW: number | null
  supplyV: number | null
  tempF: number | null
  protCount: number
  channels: ChannelFixture[]
  maxChannels: number
  ref: RefBlock
  alerts: Array<{ level: AlertLevel; text: string }>
  feedOk: boolean
  trustMetrics: boolean
  fileAgeS: number | null
  jsonAgeS: number | null
}

function pickRef(live: ApiLive): RefBlock {
  const refObj =
    live.ref && typeof live.ref === 'object'
      ? (live.ref as Record<string, unknown>)
      : live.reference && typeof live.reference === 'object'
        ? (live.reference as Record<string, unknown>)
        : null

  const rawMv =
    num(live.ref_raw_mv ?? live.reference_raw_mv) ??
    (refObj ? num(refObj.raw_mv ?? refObj.rawMv ?? refObj.raw) : null)
  const shiftMv =
    num(live.ref_shift_mv ?? live.reference_shift_mv) ??
    (refObj ? num(refObj.shift_mv ?? refObj.shiftMv ?? refObj.shift) : null)

  let band = '—'
  if (typeof live.ref_band === 'string') band = live.ref_band
  else if (typeof live.reference_band === 'string') band = live.reference_band
  else if (refObj && typeof refObj.band === 'string') band = refObj.band
  else if (refObj && typeof refObj.status === 'string') band = refObj.status

  const baseline =
    typeof live.ref_baseline_ok === 'boolean'
      ? live.ref_baseline_ok
      : refObj && typeof refObj.baseline === 'boolean'
        ? refObj.baseline
        : typeof (live as { ref_baseline_set?: boolean }).ref_baseline_set === 'boolean'
          ? (live as { ref_baseline_set: boolean }).ref_baseline_set
          : undefined

  const adc =
    typeof live.ref_adc === 'string'
      ? live.ref_adc
      : refObj && typeof refObj.adc === 'string'
        ? refObj.adc
        : undefined

  let adcOut: string | undefined = adc
  if (!adcOut && typeof (live as { ref_hw_message?: string }).ref_hw_message === 'string') {
    adcOut = (live as { ref_hw_message: string }).ref_hw_message
  }

  let bandOut = band
  if (bandOut === '—' && typeof (live as { ref_status?: string }).ref_status === 'string') {
    bandOut = (live as { ref_status: string }).ref_status
  }

  return { rawMv, shiftMv, band: bandOut, baseline, adc: adcOut }
}

export function mapLiveToDashboard(live: ApiLive, meta: ApiMeta | null): DashboardMapped {
  const entries = channelEntries(live)
  const channels = entries.map(({ key, row }, i) => rowToChannel(key, row, i))

  const sumMa = channels.reduce((acc, c) => acc + (c.ma != null && Number.isFinite(c.ma) ? c.ma : 0), 0)
  const totalMaRaw = num(live.total_ma ?? live.total_mA ?? live.total_current_ma)
  const totalMa = totalMaRaw != null ? totalMaRaw : sumMa

  const totalPowW = num(live.total_power_w ?? live.power_w ?? live.total_w)
  const supplyV = num(live.supply_v ?? live.bus_v ?? live.v_supply ?? live.supply_v_avg)
  let tempF = num(live.temp_f ?? live.tempF)
  if (tempF == null) {
    const tc = num(live.temp_c)
    tempF = tc != null ? (tc * 9) / 5 + 32 : null
  }

  const protCount = channels.filter((c) => c.state === 'PROTECTING').length

  const maxChannels =
    typeof meta?.num_channels === 'number' && meta.num_channels > 0
      ? meta.num_channels
      : Math.max(channels.length, 5)

  const fileAge = num(live.feed_age_s)
  const jsonAge = num(live.json_payload_age_s)
  const feedAgeForLabel = fileAge ?? jsonAge
  const feedSubtitle =
    feedAgeForLabel != null
      ? `Live · feed ${feedAgeForLabel.toFixed(2)}s`
      : 'Live · ICCP'

  const feedOk = live.feed_ok !== false
  const trustMetrics = live.feed_trust_channel_metrics !== false
  const healthAlert = live.health_alert === true

  const hasFault = channels.some((c) => c.state === 'FAULT')
  let headerTitle = 'System OK'
  if (hasFault) headerTitle = 'Fault active'
  else if (!feedOk) headerTitle = 'Telemetry stale'
  else if (!trustMetrics) headerTitle = 'Metrics uncertain'
  else if (healthAlert) headerTitle = 'Health alert'

  let statusColor = '#34d399'
  if (hasFault) statusColor = '#fb7185'
  else if (!feedOk || !trustMetrics) statusColor = '#fbbf24'
  else if (healthAlert) statusColor = '#fbbf24'

  const alerts: Array<{ level: AlertLevel; text: string }> = []

  const staleReasons = Array.isArray(live.feed_stale_reasons)
    ? (live.feed_stale_reasons as unknown[]).filter((x): x is string => typeof x === 'string')
    : []
  for (const r of staleReasons) {
    alerts.push({ level: 'stale', text: r })
  }
  if (!feedOk && staleReasons.length === 0) {
    alerts.push({
      level: 'stale',
      text:
        'feed_ok is false — snapshot on disk may be old. Confirm controller is writing latest.json under log_dir from /api/meta.',
    })
  }
  for (const ch of channels) {
    if (ch.state === 'FAULT' && ch.faultReason) {
      alerts.push({ level: 'fault', text: `${ch.name} — ${ch.faultReason}` })
    }
  }

  const telemIncomplete = live.telemetry_incomplete === true
  if (telemIncomplete) {
    alerts.push({ level: 'system', text: 'telemetry_incomplete flag set in /api/live payload.' })
  }

  if (healthAlert) {
    const hs = num(live.system_health)
    alerts.push({
      level: 'system',
      text: `health_alert · system_health ${hs != null ? hs.toFixed(4) : '—'}`,
    })
  }
  if (live.fault_latched === true) {
    alerts.push({ level: 'fault', text: 'fault_latched is true in snapshot.' })
  }
  if (live.wet === true) {
    const wc = num(live.wet_channels)
    alerts.push({
      level: 'info',
      text: `Wet mode · wet_channels ${wc != null ? String(wc) : '—'}`,
    })
  }
  if (live.galvanic_offset_service_recommended === true) {
    alerts.push({
      level: 'info',
      text: 'galvanic_offset_service_recommended — offset baseline service suggested.',
    })
  }

  return {
    feedSubtitle,
    headerTitle,
    statusColor,
    totalMa,
    totalPowW,
    supplyV,
    tempF,
    protCount,
    channels,
    maxChannels,
    ref: pickRef(live),
    alerts,
    feedOk,
    trustMetrics,
    fileAgeS: fileAge,
    jsonAgeS: jsonAge,
  }
}
