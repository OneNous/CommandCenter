/* eslint-disable react-refresh/only-export-components -- useTweaks hook exported with UI */
import { useCallback, useState } from 'react'

export function useTweaks(defaults) {
  const [t, setT] = useState(defaults)
  const setField = useCallback((key, value) => {
    setT((prev) => ({ ...prev, [key]: value }))
  }, [])
  return [t, setField]
}

export function TweaksPanel({ title, children }) {
  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        top: 96,
        width: 320,
        maxHeight: 'calc(100vh - 120px)',
        overflow: 'auto',
        background: 'rgba(255,255,255,0.96)',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 12,
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        padding: 14,
        zIndex: 60,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(40,30,20,0.85)', marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </div>
  )
}

export function TweakSection({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 650, color: 'rgba(60,50,40,0.55)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  )
}

export function TweakRadio({ label, value, options, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'rgba(40,30,20,0.75)', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {options.map((o) => {
          const active = value === o.value
          return (
            <button
              type="button"
              key={o.value}
              onClick={() => onChange(o.value)}
              style={{
                border: `1px solid ${active ? 'rgba(201,100,66,0.55)' : 'rgba(0,0,0,0.10)'}`,
                background: active ? 'rgba(201,100,66,0.10)' : 'transparent',
                color: 'rgba(40,30,20,0.9)',
                borderRadius: 999,
                padding: '6px 10px',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function TweakToggle({ label, value, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 12, color: 'rgba(40,30,20,0.85)' }}>
      <span>{label}</span>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

export function TweakSlider({ label, value, min, max, step, unit, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
        <div style={{ fontSize: 12, color: 'rgba(40,30,20,0.75)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'rgba(40,30,20,0.55)', fontVariantNumeric: 'tabular-nums' }}>
          {value}
          {unit ? ` ${unit}` : ''}
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: '100%' }} />
    </div>
  )
}

export function TweakSelect({ label, value, options, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'rgba(40,30,20,0.75)', marginBottom: 6 }}>{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.12)' }}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
