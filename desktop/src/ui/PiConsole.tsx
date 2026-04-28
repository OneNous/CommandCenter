import { useCallback, useMemo, useState, type CSSProperties } from 'react'
import { CliLiveDashboard } from './piConsole/CliLiveDashboard'
import { IccpCliSectionsDashboard, IccpPlainOpsCard } from './piConsole/IccpCliSectionsDashboard'
import { tryParseIccpLiveSnapshot } from './piConsole/extractIccpLiveJson'
import { parseIccpCliSections } from './piConsole/parseIccpCliSections'
import { Sparkline } from './piConsole/Sparkline'
import type { PiPreset, PiRunRecord } from './piConsole/types'
import { Card, Eyebrow, Mono, ScreenHeader } from './reference/primitives'
import { T } from './reference/tokens'

const PRESETS: PiPreset[] = [
  { id: 'iccp-start', label: 'iccp start', command: 'iccp start', group: 'ICCP · ops', hint: 'Controller start path' },
  {
    id: 'iccp-commission',
    label: 'iccp commission',
    command: 'iccp commission',
    group: 'ICCP · ops',
    hint: 'Fails if another controller is active — stop first: sudo systemctl stop iccp',
  },
  { id: 'iccp-probe', label: 'iccp probe', command: 'iccp probe', group: 'ICCP · ops' },
  { id: 'iccp-live', label: 'iccp live', command: 'iccp live', group: 'ICCP · telemetry', hint: 'CLI snapshot (Live tab is HTTP JSON)' },
  { id: 'iccp-version', label: 'iccp version', command: 'iccp version', group: 'ICCP · meta' },
  { id: 'iccp-diag', label: 'iccp diag', command: 'iccp diag --request', group: 'ICCP · meta' },
  { id: 'sys-status', label: 'systemctl status', command: 'systemctl --no-pager status iccp 2>&1 | head -60', group: 'systemd' },
  { id: 'sys-active', label: 'systemctl is-active', command: 'systemctl is-active iccp', group: 'systemd' },
  { id: 'which', label: 'which iccp', command: 'command -v iccp || type iccp', group: 'PATH' },
  { id: 'uptime', label: 'uptime', command: 'uptime', group: 'host' },
]

const MAX_RUNS = 32
const CUSTOM_ID = 'custom'

/** Presets whose logs should use dashboard-style cards (tag parsing or single card fallback). */
const OPS_DASH_PRESETS = new Set(['iccp-start', 'iccp-commission', 'iccp-probe'])

function presetLabel(id: string | null | undefined): string {
  if (!id || id === CUSTOM_ID) return 'Custom'
  return PRESETS.find((p) => p.id === id)?.label ?? id
}

function formatAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

/** First meaningful line for a compact failure strip (commission errors are stderr-heavy). */
function failurePreviewLine(r: PiRunRecord): string | null {
  if (r.error) {
    const line = r.error.trim().split('\n')[0]
    return line ? line.slice(0, 220) : null
  }
  if (r.code === 0 || r.code === null) return null
  const errLines = r.stderr.split('\n').map((l) => l.trim())
  const errHit = errLines.find((l) => l.includes('ERROR') || l.includes('error:'))
  if (errHit) return errHit.slice(0, 220)
  const errLine = errLines.find((l) => l.length > 0)
  if (errLine) return errLine.slice(0, 220)
  const outLine = r.stdout
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0)
  return outLine ? outLine.slice(0, 220) : null
}

function preBox(style: CSSProperties): CSSProperties {
  return {
    margin: 0,
    marginTop: 6,
    padding: '10px 10px',
    borderRadius: 10,
    fontSize: 11,
    lineHeight: 1.45,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    minHeight: 0,
    maxHeight: 280,
    overflow: 'auto',
    fontFamily: T.fontMono,
    ...style,
  }
}

/** Hero output panel: taller scroll regions */
function preBoxHero(style: CSSProperties): CSSProperties {
  return {
    ...preBox(style),
    maxHeight: 'min(42vh, 520px)',
  }
}

function RunOutputBody({
  run,
  hero,
  presetId,
}: {
  run: PiRunRecord
  hero?: boolean
  presetId?: string | null
}) {
  const box = hero ? preBoxHero : preBox
  const liveSnap = useMemo(() => {
    if (run.error) return null
    return tryParseIccpLiveSnapshot(run.stdout)
  }, [run.error, run.stdout])

  const combined = useMemo(
    () => [run.stderr, run.stdout].filter((s) => s?.trim()).join('\n'),
    [run.stderr, run.stdout],
  )

  const parsedCli = useMemo(() => {
    if (run.error) return null
    return parseIccpCliSections(combined)
  }, [run.error, combined])

  const exitOk = !run.error && run.code === 0
  const exitSubtitle = run.error ? 'SSH error' : `Exit ${run.code ?? '—'}`

  if (run.error) {
    return (
      <pre className="log mono" style={box({ border: `1px solid ${T.red}`, background: T.redBg })}>
        {run.error}
      </pre>
    )
  }

  const err = run.stderr.trim()
  const out = run.stdout.trim()
  const exitBits = [`exit ${run.code ?? 'null'}`]
  if (run.signal) exitBits.push(`signal ${run.signal}`)
  const exitLine = `[${exitBits.join(' · ')}]`

  if (!err && !out) {
    return (
      <>
        <Mono size={11} color={T.subtle}>
          (no output)
        </Mono>
        <Mono size={10} color={T.muted} style={{ display: 'block', marginTop: 8 }}>
          {exitLine}
        </Mono>
      </>
    )
  }

  if (liveSnap) {
    return (
      <>
        {err ? (
          <div>
            <Mono size={9} color={T.red} style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              stderr
            </Mono>
            <pre
              className="log mono"
              style={box({
                border: `1px solid ${T.border}`,
                borderLeft: `3px solid ${T.red}`,
                background: T.redBg,
              })}
            >
              {run.stderr.trimEnd()}
            </pre>
          </div>
        ) : null}
        <div style={{ marginTop: err ? 14 : 0 }}>
          <CliLiveDashboard live={liveSnap} />
        </div>
        <details style={{ marginTop: 14, color: T.muted }}>
          <summary style={{ cursor: 'pointer', fontFamily: T.fontSans, fontSize: 12 }}>
            Raw stdout (verbatim)
          </summary>
          <pre
            className="log mono"
            style={{
              ...box({
                border: `1px solid ${T.border}`,
                background: 'rgba(255,255,255,0.03)',
                maxHeight: hero ? 'min(28vh, 240px)' : 160,
              }),
              marginTop: 8,
            }}
          >
            {run.stdout.trimEnd()}
          </pre>
        </details>
        <Mono size={10} color={T.muted} style={{ display: 'block', marginTop: 10 }}>
          {exitLine}
        </Mono>
      </>
    )
  }

  if (parsedCli && parsedCli.sections.length > 0) {
    return (
      <>
        <IccpCliSectionsDashboard
          title={presetLabel(presetId)}
          subtitle={exitSubtitle}
          exitOk={exitOk}
          parsed={parsedCli}
        />
        <details style={{ marginTop: 14, color: T.muted }}>
          <summary style={{ cursor: 'pointer', fontFamily: T.fontSans, fontSize: 12 }}>
            Raw log (stderr + stdout verbatim)
          </summary>
          <pre
            className="log mono"
            style={{
              ...box({
                border: `1px solid ${T.border}`,
                background: 'rgba(255,255,255,0.03)',
                maxHeight: hero ? 'min(28vh, 240px)' : 160,
              }),
              marginTop: 8,
            }}
          >
            {combined.trimEnd()}
          </pre>
        </details>
        <Mono size={10} color={T.muted} style={{ display: 'block', marginTop: 10 }}>
          {exitLine}
        </Mono>
      </>
    )
  }

  if (presetId && OPS_DASH_PRESETS.has(presetId) && combined.trim()) {
    return (
      <>
        <IccpPlainOpsCard title={presetLabel(presetId)} exitOk={exitOk} combinedText={combined} />
        <details style={{ marginTop: 14, color: T.muted }}>
          <summary style={{ cursor: 'pointer', fontFamily: T.fontSans, fontSize: 12 }}>
            Raw log (verbatim)
          </summary>
          <pre
            className="log mono"
            style={{
              ...box({
                border: `1px solid ${T.border}`,
                background: 'rgba(255,255,255,0.03)',
                maxHeight: hero ? 'min(28vh, 240px)' : 160,
              }),
              marginTop: 8,
            }}
          >
            {combined.trimEnd()}
          </pre>
        </details>
        <Mono size={10} color={T.muted} style={{ display: 'block', marginTop: 10 }}>
          {exitLine}
        </Mono>
      </>
    )
  }

  return (
    <>
      {err ? (
        <div>
          <Mono size={9} color={T.red} style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            stderr
          </Mono>
          <pre
            className="log mono"
            style={box({
              border: `1px solid ${T.border}`,
              borderLeft: `3px solid ${T.red}`,
              background: T.redBg,
            })}
          >
            {run.stderr.trimEnd()}
          </pre>
        </div>
      ) : null}
      {out ? (
        <div style={{ marginTop: err ? 12 : 0 }}>
          <Mono size={9} color={T.muted} style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            stdout
          </Mono>
          <pre
            className="log mono"
            style={box({
              border: `1px solid ${T.border}`,
              background: 'rgba(255,255,255,0.03)',
            })}
          >
            {run.stdout.trimEnd()}
          </pre>
        </div>
      ) : null}
      <Mono size={10} color={T.muted} style={{ display: 'block', marginTop: 10 }}>
        {exitLine}
      </Mono>
    </>
  )
}

function appendHistory(
  prev: Record<string, PiRunRecord[]>,
  id: string,
  run: PiRunRecord,
): Record<string, PiRunRecord[]> {
  const list = [...(prev[id] ?? []), run].slice(-MAX_RUNS)
  return { ...prev, [id]: list }
}

function presetById(id: string): PiPreset | undefined {
  return PRESETS.find((p) => p.id === id)
}

type Props = {
  connected: boolean
}

export function PiConsole({ connected }: Props) {
  const [histories, setHistories] = useState<Record<string, PiRunRecord[]>>({})
  const [wrapEnv, setWrapEnv] = useState(true)
  const [customCmd, setCustomCmd] = useState('iccp live')
  const [busyKey, setBusyKey] = useState<string | null>(null)
  /** Which command’s output the big panel shows (follows last run; user can override via picker). */
  const [outputFocusKey, setOutputFocusKey] = useState<string | null>(null)

  const run = useCallback(
    async (key: string, cmd: string) => {
      if (!connected || !cmd.trim()) return
      setBusyKey(key)
      const start = performance.now()
      try {
        const { result } = await window.iccp.sshExec({
          command: cmd.trim(),
          wrapEnv,
        })
        const durationMs = Math.round(performance.now() - start)
        const runRecord: PiRunRecord = {
          at: Date.now(),
          durationMs,
          code: result.code ?? null,
          signal: result.signal ?? null,
          stdout: result.stdout ?? '',
          stderr: result.stderr ?? '',
        }
        setHistories((h) => appendHistory(h, key, runRecord))
        setOutputFocusKey(key)
      } catch (e) {
        const durationMs = Math.round(performance.now() - start)
        const msg = e instanceof Error ? e.message : String(e)
        setHistories((h) =>
          appendHistory(h, key, {
            at: Date.now(),
            durationMs,
            code: null,
            stdout: '',
            stderr: '',
            error: msg,
          }),
        )
        setOutputFocusKey(key)
      } finally {
        setBusyKey(null)
      }
    },
    [connected, wrapEnv],
  )

  const latencySeries = useCallback((runs: PiRunRecord[] | undefined) => {
    if (!runs?.length) return []
    return runs.map((r) => Math.min(8000, r.durationMs))
  }, [])

  const okSeries = useCallback((runs: PiRunRecord[] | undefined) => {
    if (!runs?.length) return []
    return runs.map((r) => {
      if (r.error) return 0
      if (r.code === 0) return 1
      if (r.code === null) return 0.35
      return 0
    })
  }, [])

  const grouped = useMemo(() => {
    const m = new Map<string, PiPreset[]>()
    for (const p of PRESETS) {
      const list = m.get(p.group) ?? []
      list.push(p)
      m.set(p.group, list)
    }
    return [...m.entries()]
  }, [])

  const keysWithHistory = useMemo(() => {
    const keys = Object.keys(histories).filter((k) => (histories[k]?.length ?? 0) > 0)
    keys.sort()
    return keys
  }, [histories])

  const focusedRuns = outputFocusKey ? histories[outputFocusKey] : undefined
  const focusedLast = focusedRuns?.length ? focusedRuns[focusedRuns.length - 1] : null
  const failPreview = focusedLast ? failurePreviewLine(focusedLast) : null

  const focusLabel =
    outputFocusKey === CUSTOM_ID
      ? 'Custom'
      : presetById(outputFocusKey ?? '')?.label ?? outputFocusKey ?? '—'

  return (
    <div style={{ padding: '8px 0 48px', color: T.text, fontFamily: T.fontSans, width: '100%' }}>
      <div style={{ padding: '0 12px 12px', maxWidth: 1120, margin: '0 auto' }}>
        <ScreenHeader
          title="Pi commands"
          sub="One command strip · one shared output panel · same SSH session as Connect"
          right={
            <Mono size={11} color={connected ? T.green : T.muted}>
              {connected ? 'SSH linked' : 'Offline'}
            </Mono>
          }
        />

        <p style={{ margin: '0 0 14px', fontSize: 13, lineHeight: 1.55, color: T.muted, maxWidth: 720 }}>
          Same session as <strong>Connect</strong>. With <strong>Use login shell</strong>, commands run as{' '}
          <code style={{ fontFamily: T.fontMono, fontSize: 12 }}>bash -lc '…'</code> so <code style={{ fontFamily: T.fontMono }}>iccp</code> matches Terminal.
          The <strong>Live</strong> tab remains the HTTP dashboard (JSON).
        </p>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 16,
            cursor: 'pointer',
            fontSize: 13,
            color: T.text,
          }}
        >
          <input type="checkbox" checked={wrapEnv} onChange={(e) => setWrapEnv(e.target.checked)} />
          <span style={{ color: T.muted }}>
            Use login shell (<code style={{ fontFamily: T.fontMono }}>bash -lc</code>) + profile{' '}
            <code style={{ fontFamily: T.fontMono }}>remoteEnvLines</code>
          </span>
        </label>

        {/* —— Commands (full width) —— */}
        <Card style={{ padding: 18, borderRadius: 18, marginBottom: 16 }}>
          <Eyebrow style={{ marginBottom: 12, opacity: 0.95 }}>Run</Eyebrow>

          {grouped.map(([groupName, items]) => (
            <div key={groupName} style={{ marginBottom: 14 }}>
              <Mono size={10} color={T.subtle} style={{ display: 'block', marginBottom: 8, letterSpacing: '0.06em' }}>
                {groupName}
              </Mono>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                {items.map((p) => {
                  const active = outputFocusKey === p.id
                  const busy = busyKey === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      title={p.hint ?? p.command}
                      className={active ? 'primary' : 'ghost'}
                      disabled={!connected || busyKey !== null}
                      onClick={() => void run(p.id, p.command)}
                      style={{
                        borderRadius: 10,
                        padding: '8px 12px',
                        fontSize: 12,
                        fontFamily: T.fontSans,
                        fontWeight: 600,
                      }}
                    >
                      {busy ? '…' : p.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <div
            style={{
              marginTop: 4,
              paddingTop: 14,
              borderTop: `1px solid ${T.border}`,
            }}
          >
            <Mono size={10} color={T.subtle} style={{ display: 'block', marginBottom: 8, letterSpacing: '0.06em' }}>
              Custom shell
            </Mono>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'stretch' }}>
              <textarea
                className="mono input-textarea"
                rows={2}
                value={customCmd}
                onChange={(e) => setCustomCmd(e.target.value)}
                disabled={!connected || busyKey !== null}
                spellCheck={false}
                style={{
                  flex: '1 1 240px',
                  minWidth: 0,
                  minHeight: 52,
                }}
              />
              <button
                type="button"
                className={outputFocusKey === CUSTOM_ID ? 'primary' : 'ghost'}
                disabled={!connected || busyKey !== null}
                onClick={() => void run(CUSTOM_ID, customCmd)}
                style={{
                  borderRadius: 10,
                  padding: '10px 18px',
                  alignSelf: 'stretch',
                  fontWeight: 600,
                }}
              >
                {busyKey === CUSTOM_ID ? '…' : 'Run'}
              </button>
            </div>
          </div>
        </Card>

        {/* —— Output (full width) —— */}
        <Card style={{ padding: 18, borderRadius: 18, minHeight: 280 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <Eyebrow style={{ marginBottom: 6, opacity: 0.95 }}>Output</Eyebrow>
              <Mono size={14} weight={700} style={{ letterSpacing: '-0.02em' }}>
                {focusLabel}
              </Mono>
              {outputFocusKey && outputFocusKey !== CUSTOM_ID ? (
                <Mono size={10} color={T.muted} style={{ display: 'block', marginTop: 6, wordBreak: 'break-all' }}>
                  {presetById(outputFocusKey)?.command}
                </Mono>
              ) : outputFocusKey === CUSTOM_ID ? (
                <Mono size={10} color={T.muted} style={{ display: 'block', marginTop: 6, wordBreak: 'break-all' }}>
                  {customCmd}
                </Mono>
              ) : null}
            </div>

            {keysWithHistory.length > 0 ? (
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: T.muted }}>
                <span style={{ fontFamily: T.fontSans }}>Show output for</span>
                <select
                  className="mono input-textarea"
                  value={outputFocusKey ?? ''}
                  onChange={(e) => setOutputFocusKey(e.target.value || null)}
                  style={{
                    fontSize: 12,
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: `1px solid ${T.border}`,
                    background: T.surface,
                    color: T.text,
                    minWidth: 200,
                  }}
                >
                  {keysWithHistory.map((k) => (
                    <option key={k} value={k}>
                      {k === CUSTOM_ID ? 'Custom' : presetById(k)?.label ?? k}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          {!focusedLast ? (
            <Mono size={13} color={T.subtle} style={{ display: 'block', padding: '24px 8px' }}>
              Run a command above — output and trends appear here.
            </Mono>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', marginBottom: 12 }}>
                <Mono size={11} color={T.muted}>
                  Last · {formatAgo(focusedLast.at)}
                </Mono>
                <Mono size={11} color={T.muted}>
                  {focusedLast.durationMs} ms
                </Mono>
                <Mono
                  size={11}
                  weight={600}
                  style={{
                    color:
                      focusedLast.error || (focusedLast.code != null && focusedLast.code !== 0)
                        ? T.red
                        : focusedLast.code === 0
                          ? T.green
                          : T.amber,
                  }}
                >
                  exit {focusedLast.error ? 'err' : focusedLast.code ?? '—'}
                </Mono>
              </div>

              {failPreview ? (
                <Mono
                  size={11}
                  color={T.amber}
                  style={{
                    display: 'block',
                    lineHeight: 1.45,
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: T.amberBg,
                    border: `1px solid ${T.border}`,
                    marginBottom: 14,
                  }}
                >
                  {failPreview}
                </Mono>
              ) : null}

              <div style={{ marginBottom: 16 }}>
                <TrendBlock runs={focusedRuns} latencySeries={latencySeries} okSeries={okSeries} />
              </div>

              <Mono size={10} color={T.muted} style={{ marginBottom: 8 }}>
                Latest run (scroll)
              </Mono>
              <RunOutputBody run={focusedLast} hero presetId={outputFocusKey} />
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

function TrendBlock({
  runs,
  latencySeries,
  okSeries,
}: {
  runs: PiRunRecord[] | undefined
  latencySeries: (r: PiRunRecord[] | undefined) => number[]
  okSeries: (r: PiRunRecord[] | undefined) => number[]
}) {
  const lat = latencySeries(runs)
  const ok = okSeries(runs)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
      <div>
        <Eyebrow style={{ fontSize: 9, letterSpacing: '0.14em', marginBottom: 4, opacity: 0.85 }}>Success trend</Eyebrow>
        <Sparkline values={ok} stroke={T.accentS} />
      </div>
      <div>
        <Eyebrow style={{ fontSize: 9, letterSpacing: '0.14em', marginBottom: 4, opacity: 0.85 }}>
          Latency (ms, capped 8s)
        </Eyebrow>
        <Sparkline values={lat} stroke={T.violet} />
      </div>
    </div>
  )
}
