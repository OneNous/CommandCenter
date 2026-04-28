// CoilShield mobile screens — shared between iOS and Android.
// Style: v77 dark/cool with sky-300 accent + Geist; ICCP dashboard data model.

const { useState: useS, useEffect: useE, useMemo: useM, useRef: useR } = React;

/* ──────────────────────────── tokens ──────────────────────────── */
const T = {
  bg:          "#05070a",
  surface:     "#0b0f14",
  surfaceUp:   "#121922",
  surfaceMax:  "#1a2431",
  border:      "rgba(255,255,255,0.10)",
  borderS:     "rgba(255,255,255,0.18)",
  text:        "#f5f7fb",
  muted:       "rgba(245,247,251,0.72)",
  subtle:      "rgba(245,247,251,0.52)",
  accent:      "#7dd3fc",
  accentS:     "#38bdf8",
  accentSoft:  "rgba(56,189,248,0.14)",
  // semantic — flat, low-saturation
  green:   "#34d399",  greenBg: "rgba(52,211,153,0.12)",
  amber:   "#fbbf24",  amberBg: "rgba(251,191,36,0.12)",
  red:     "#fb7185",  redBg:   "rgba(251,113,133,0.14)",
  violet:  "#a78bfa",  violetBg:"rgba(167,139,250,0.14)",
  // channel identity
  ch: ["#7dd3fc", "#34d399", "#fb923c", "#fb7185", "#a78bfa"],
  fontSans: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontMono: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
};

/* ──────────────────────────── data ──────────────────────────── */
const FIXTURE = {
  now:        "Apr 21, 14:32",
  feedAge:    0.32,
  simMode:    true,
  tempF:      68.4,
  supplyV:    4.85,
  totalMa:    6.724,
  totalPowW:  0.031,
  channels: [
    { idx:0, name:"Anode 1", state:"PROTECTING", ma:1.681, target:1.70, bus:4.852, duty:42.0, z:2881, energyJ:137.42, wet:14 },
    { idx:1, name:"Anode 2", state:"PROTECTING", ma:1.712, target:1.70, bus:4.841, duty:44.5, z:2755, energyJ:132.05, wet:12 },
    { idx:2, name:"Anode 3", state:"REGULATE",   ma:0.842, target:1.50, bus:4.860, duty:18.2, z:5772, energyJ: 98.11, wet: 8 },
    { idx:3, name:"Anode 4", state:"FAULT",      ma:null,  target:0.50, bus:null,  duty: 0.0, z:null, energyJ:  0.00, wet: 0,
      faultReason: "OVERCURRENT (2.88 mA > 2.50 limit)" },
  ],
  ref: { rawMv: 112.3, shiftMv: 87.4, band: "IN RANGE", baseline: true, adc: "ADS1115 OK" },
  series: {
    xs:    Array.from({length:30}, (_,i)=>i),
    ch0:   [1.50,1.55,1.60,1.62,1.63,1.64,1.65,1.66,1.66,1.67,1.67,1.67,1.68,1.68,1.68,1.68,1.68,1.68,1.68,1.68,1.68,1.68,1.68,1.68,1.68,1.68,1.68,1.68,1.68,1.68],
    ch1:   [1.55,1.58,1.60,1.63,1.65,1.67,1.68,1.69,1.70,1.70,1.70,1.70,1.70,1.71,1.71,1.71,1.71,1.71,1.71,1.71,1.71,1.71,1.71,1.71,1.71,1.71,1.71,1.71,1.71,1.71],
    ch2:   [0.92,0.91,0.90,0.90,0.89,0.88,0.87,0.87,0.86,0.86,0.85,0.85,0.85,0.85,0.84,0.84,0.84,0.84,0.84,0.84,0.84,0.84,0.84,0.84,0.84,0.84,0.84,0.84,0.84,0.84],
    ch3:   [1.82,1.78,1.68,1.55,1.28,0.75,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    total: [5.8,5.9,6.1,6.0,6.2,6.2,6.3,6.3,6.4,6.4,6.4,6.5,6.5,6.6,6.6,6.6,6.6,6.7,6.7,6.7,6.7,6.7,6.7,6.72,6.72,6.72,6.72,6.72,6.72,6.72],
    target:[1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60,1.60],
  },
  sessions: [
    { id:142, when:"13:58", dur:"02:08", avgMa:1.70, chs:[0,1],   end:"manual stop" },
    { id:141, when:"11:22", dur:"01:47", avgMa:1.67, chs:[0,1,2], end:"dry detected" },
    { id:140, when:"09:08", dur:"03:12", avgMa:1.71, chs:[0,1,2], end:"scheduled" },
    { id:139, when:"19:44", dur:"00:22", avgMa:2.88, chs:[3],     end:"FAULT — overcurrent", isFault:true },
  ],
  alerts: [
    { level:"fault",  text:"Anode 4 — OVERCURRENT (2.88 mA > 2.50 limit). Touch ~/coilshield/clear_fault to clear latch." },
    { level:"stale",  text:"reference ADC threshold init skipped — ALRT pulsing may be unreliable." },
    { level:"system", text:"tick_writer_error: [Errno 5] Input/output error on TCA9548A @ 0x70 (3 recent)." },
  ],
};

const STATE_COLOR = {
  PROTECTING: { fg: T.green,  bg: T.greenBg },
  REGULATE:   { fg: T.amber,  bg: T.amberBg },
  PROBING:    { fg: T.amber,  bg: T.amberBg },
  FAULT:      { fg: T.red,    bg: T.redBg   },
  OPEN:       { fg: T.muted,  bg: "rgba(255,255,255,0.06)" },
  OFF:        { fg: T.muted,  bg: "rgba(255,255,255,0.06)" },
  DRY:        { fg: T.muted,  bg: "rgba(255,255,255,0.06)" },
  DORMANT:    { fg: T.muted,  bg: "rgba(255,255,255,0.06)" },
  UNKNOWN:    { fg: T.muted,  bg: "rgba(255,255,255,0.06)" },
};

/* ──────────────────────────── atoms ──────────────────────────── */
function Pill({ state, children, size = "md" }) {
  const s = STATE_COLOR[state] || STATE_COLOR.UNKNOWN;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center",
      background: s.bg, color: s.fg,
      padding: size === "sm" ? "2px 7px" : "3px 9px",
      borderRadius: 999,
      fontSize: size === "sm" ? 9.5 : 10.5,
      fontWeight: 600, letterSpacing: "0.10em", textTransform:"uppercase",
      fontFamily: T.fontSans, whiteSpace:"nowrap",
      border: `1px solid ${s.fg}30`,
    }}>{children || state}</span>
  );
}

function Eyebrow({ children, style }) {
  return <div style={{
    fontFamily: T.fontSans, fontSize: 10, fontWeight: 600,
    letterSpacing: "0.28em", textTransform:"uppercase",
    color: "rgba(125,211,252,0.75)",
    ...style,
  }}>{children}</div>;
}

function Card({ children, style, glow }) {
  return (
    <div style={{
      position:"relative", overflow:"hidden",
      borderRadius: 18,
      border: `1px solid ${T.border}`,
      background: T.cardBg || "rgba(12,18,24,0.65)",
      backdropFilter: "blur(14px) saturate(120%)",
      WebkitBackdropFilter: "blur(14px) saturate(120%)",
      padding: 16,
      ...style,
    }}>
      {glow && <LivingGlow palette={glow}/>}
      <div style={{ position:"relative", zIndex:1 }}>{children}</div>
    </div>
  );
}

/* Sticky-card style living gradient; per-card unique stops */
function LivingGlow({ palette = ["#05070a","#0b1017","#121b25","#1d2a38","#7dd3fc","#e8f4fc"], duration = "26s" }) {
  return (
    <>
      <div style={{
        position:"absolute", inset:"-30%", zIndex:0,
        background: `conic-gradient(from 0deg, ${palette[0]}, ${palette[1]}, ${palette[2]}, ${palette[3]}, ${palette[4]}, ${palette[5]}, ${palette[0]})`,
        filter: "blur(48px) saturate(120%)",
        opacity: 0.55,
        animation: `cs-spin ${duration} linear infinite`,
      }}/>
      <div style={{
        position:"absolute", inset:0, zIndex:0, borderRadius:"inherit",
        background:
          "linear-gradient(180deg, rgba(125,211,252,0.10), transparent 30%),"+
          `radial-gradient(ellipse 92% 88% at 50% 38%, ${T.cardBg||"rgba(12,18,24,0.65)"} 0%, ${T.cardBg||"rgba(12,18,24,0.65)"} 48%, rgba(12,18,24,0) 100%)`,
        pointerEvents:"none",
      }}/>
    </>
  );
}

function StatusDot({ color = T.green }) {
  return (
    <span style={{ position:"relative", display:"inline-block", width:8, height:8 }}>
      <span style={{
        position:"absolute", inset:0, borderRadius:"50%",
        background: color, animation: "cs-pulse 2s infinite",
      }}/>
      <span style={{
        position:"absolute", inset:-4, borderRadius:"50%",
        background: color, opacity:0.25, filter:"blur(3px)",
      }}/>
    </span>
  );
}

function Mono({ children, size = 13, weight = 500, color = T.text, style }) {
  return <span style={{
    fontFamily: T.fontMono, fontSize: size, fontWeight: weight,
    fontVariantNumeric:"tabular-nums", color, letterSpacing:"-0.01em",
    ...style,
  }}>{children}</span>;
}

function Row({ k, v, unit }) {
  return (
    <div style={{
      display:"grid", gridTemplateColumns:"1fr auto", gap:8,
      padding: "9px 0",
      borderBottom: `1px solid ${T.border}`,
      fontSize: 13,
    }}>
      <span style={{ color: T.muted, fontFamily: T.fontSans }}>{k}</span>
      <span>
        <Mono>{v}</Mono>
        {unit && <Mono color={T.subtle} weight={400} style={{ marginLeft: 4 }}>{unit}</Mono>}
      </span>
    </div>
  );
}

/* ──────────────────────────── HEADER (per screen) ──────────────────────────── */
function ScreenHeader({ title, sub, right }) {
  return (
    <div style={{ padding: "16px 20px 10px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
        <Eyebrow style={{ margin:0 }}>{sub || "CoilShield ICCP"}</Eyebrow>
        <div style={{ flex:1 }}/>
        {right}
      </div>
      <h1 style={{
        margin:0, color: T.text,
        fontFamily: T.fontSans,
        fontSize: 30, fontWeight: 600, letterSpacing: "-0.04em",
        lineHeight: 1.05,
      }}>{title}</h1>
    </div>
  );
}

/* ──────────────────────────── DASHBOARD ──────────────────────────── */
function DashboardScreen({ data = FIXTURE, onChannelTap, onClearFault }) {
  const protCount = data.channels.filter(c => c.state === "PROTECTING").length;
  return (
    <div style={{ padding: "8px 0 100px", color: T.text, fontFamily: T.fontSans }}>
      <ScreenHeader
        title="System OK"
        sub="Live · feed 0.32s"
        right={<StatusDot color={T.green}/>}
      />

      {/* Hero KPI — total output, with living palette */}
      <div style={{ padding: "8px 16px 14px" }}>
        <Card glow={["#040a0a","#0a1615","#122624","#1a3834","#2dd4bf","#d1faf4"]} style={{ padding: 22, borderRadius: 22 }}>
          <Eyebrow>Total output</Eyebrow>
          <div style={{ display:"flex", alignItems:"baseline", gap:8, marginTop: 8 }}>
            <Mono size={48} weight={600} style={{ letterSpacing:"-0.04em", lineHeight:0.95 }}>
              {data.totalMa.toFixed(3)}
            </Mono>
            <Mono size={16} weight={500} color={T.muted}>mA</Mono>
          </div>
          <div style={{ display:"flex", gap: 18, marginTop: 18, flexWrap:"wrap" }}>
            <Mini label="Power"      value={data.totalPowW.toFixed(3)} unit="W"/>
            <Mini label="Supply"     value={data.supplyV.toFixed(2)}    unit="V"/>
            <Mini label="Temp"       value={data.tempF.toFixed(1)}      unit="°F"/>
            <Mini label="Protecting" value={`${protCount}/${data.channels.length}`}/>
          </div>
        </Card>
      </div>

      {/* Reference electrode strip */}
      <div style={{ padding: "0 16px 14px" }}>
        <Card style={{ padding: 14 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 8 }}>
            <Eyebrow style={{ color: T.muted }}>Reference · Ag/AgCl</Eyebrow>
            <Pill state="PROTECTING" size="sm">{data.ref.band}</Pill>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize:11, color: T.subtle, fontFamily: T.fontSans, marginBottom:2 }}>Raw</div>
              <Mono size={18} weight={500}>{data.ref.rawMv.toFixed(1)}<Mono color={T.subtle} size={11} weight={400} style={{ marginLeft:3 }}>mV</Mono></Mono>
            </div>
            <div>
              <div style={{ fontSize:11, color: T.subtle, fontFamily: T.fontSans, marginBottom:2 }}>Shift</div>
              <Mono size={18} weight={500}>+{data.ref.shiftMv.toFixed(1)}<Mono color={T.subtle} size={11} weight={400} style={{ marginLeft:3 }}>mV</Mono></Mono>
            </div>
          </div>
        </Card>
      </div>

      {/* Channels list */}
      <div style={{ padding: "0 20px 8px", display:"flex", alignItems:"baseline", justifyContent:"space-between" }}>
        <h2 style={{ margin:0, fontSize:15, fontWeight:600, letterSpacing:"-0.02em", color: T.text }}>Channels</h2>
        <Mono size={11} color={T.subtle}>{data.channels.length} of 5</Mono>
      </div>
      <div style={{ padding: "0 16px", display:"flex", flexDirection:"column", gap: 10 }}>
        {data.channels.map(ch => (
          <ChannelRow key={ch.idx} ch={ch} onTap={() => onChannelTap && onChannelTap(ch.idx)} onClearFault={onClearFault}/>
        ))}
      </div>

      {/* Alerts */}
      {data.alerts && data.alerts.length > 0 && (
        <div style={{ padding: "20px 20px 6px" }}>
          <h2 style={{ margin:"0 0 8px", fontSize:15, fontWeight:600, letterSpacing:"-0.02em", color: T.text }}>System health</h2>
        </div>
      )}
      <div style={{ padding: "0 16px", display:"flex", flexDirection:"column", gap: 8 }}>
        {data.alerts.map((a, i) => <AlertBar key={i} {...a}/>)}
      </div>
    </div>
  );
}

function Mini({ label, value, unit }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: T.subtle, fontFamily: T.fontSans, letterSpacing:"0.04em", textTransform:"uppercase" }}>{label}</div>
      <div style={{ marginTop: 2 }}>
        <Mono size={15} weight={500}>{value}</Mono>
        {unit && <Mono color={T.subtle} size={10} weight={400} style={{ marginLeft: 3 }}>{unit}</Mono>}
      </div>
    </div>
  );
}

function ChannelRow({ ch, onTap, onClearFault }) {
  const isFault = ch.state === "FAULT";
  const color = T.ch[ch.idx % T.ch.length];
  const pct = ch.target ? Math.min(100, ((ch.ma || 0) / ch.target) * 100) : 0;

  return (
    <div onClick={onTap} role="button" tabIndex={0} style={{
      width:"100%", textAlign:"left", cursor:"pointer",
      background: isFault ? (T.cardBgFault || "rgba(60,12,24,0.65)") : (T.cardBg || "rgba(12,18,24,0.65)"),
      backdropFilter: "blur(14px) saturate(120%)",
      WebkitBackdropFilter: "blur(14px) saturate(120%)",
      border: `1px solid ${isFault ? "rgba(251,113,133,0.30)" : T.border}`,
      borderRadius: 14, padding: 14,
      fontFamily: T.fontSans, color: T.text,
      display:"flex", flexDirection:"column", gap: 10,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius:"50%", background: color, boxShadow: `0 0 12px ${color}80`, flexShrink:0 }}/>
        <div style={{ display:"flex", flexDirection:"column", flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{ch.name}</span>
            <Mono size={10} color={T.subtle}>idx {ch.idx}</Mono>
          </div>
        </div>
        <Pill state={ch.state}/>
      </div>

      {isFault && ch.faultReason && (
        <Mono size={11} color={T.red} weight={500}>{ch.faultReason}</Mono>
      )}

      <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
        <Mono size={26} weight={600} style={{ letterSpacing:"-0.03em" }}>
          {ch.ma == null ? "—" : ch.ma.toFixed(2)}
        </Mono>
        <Mono size={11} color={T.muted}>mA</Mono>
        <span style={{ flex:1 }}/>
        <Mono size={11} color={T.subtle}>target {ch.target.toFixed(2)} mA</Mono>
      </div>

      {/* progress / target marker */}
      {!isFault && (
        <div style={{ position:"relative", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow:"visible" }}>
          <div style={{ position:"absolute", inset:0, width: `${pct}%`, background: color, borderRadius: 2, boxShadow: `0 0 8px ${color}80` }}/>
          <div style={{ position:"absolute", left: "100%", top: -2, width: 1, height: 8, background: T.violet, transform:"translateX(-1px)" }}/>
        </div>
      )}

      <div style={{ display:"flex", gap: 14, marginTop: 2 }}>
        <Tiny label="Duty"     value={ch.duty.toFixed(1)} unit="%"/>
        <Tiny label="Bus"      value={ch.bus == null ? "—" : ch.bus.toFixed(2)} unit="V"/>
        <Tiny label="Imp"      value={ch.z   == null ? "—" : ch.z.toLocaleString()} unit="Ω"/>
      </div>

      {isFault && (
        <button onClick={(e) => { e.stopPropagation(); onClearFault && onClearFault(ch.idx); }} style={{
          marginTop: 4,
          background: "#fff", color: "#000",
          border: "1px solid rgba(255,255,255,0.14)",
          padding: "10px 14px", borderRadius: 8,
          fontSize: 13, fontWeight: 500, cursor:"pointer",
          fontFamily: T.fontSans,
        }}>Clear fault latch</button>
      )}
    </div>
  );
}

function Tiny({ label, value, unit }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 1 }}>
      <Mono size={9} color={T.subtle} weight={500} style={{ letterSpacing:"0.10em", textTransform:"uppercase", fontFamily: T.fontSans }}>{label}</Mono>
      <div>
        <Mono size={12} weight={500}>{value}</Mono>
        {unit && <Mono size={10} color={T.subtle} weight={400} style={{ marginLeft: 2 }}>{unit}</Mono>}
      </div>
    </div>
  );
}

function AlertBar({ level, text }) {
  const styles = {
    fault:  { bg: T.redBg,    fg: T.red,    bd: "rgba(251,113,133,0.32)" },
    stale:  { bg: T.amberBg,  fg: T.amber,  bd: "rgba(251,191,36,0.32)" },
    system: { bg: T.redBg,    fg: T.red,    bd: "rgba(251,113,133,0.32)" },
    info:   { bg: T.accentSoft, fg: T.accent, bd: "rgba(56,189,248,0.32)" },
  };
  const s = styles[level] || styles.info;
  return (
    <div style={{
      background: s.bg, color: s.fg,
      border: `1px solid ${s.bd}`,
      borderRadius: 12, padding: "10px 14px",
      fontSize: 12.5, fontWeight: 500, lineHeight: 1.5,
      fontFamily: T.fontSans,
    }}>{text}</div>
  );
}

/* ──────────────────────────── REPORTS / TRENDS ──────────────────────────── */
function ReportsScreen({ data = FIXTURE }) {
  const [range, setRange] = useS("1h");
  const [mode, setMode]   = useS("mA");
  const [visible, setVisible] = useS({});
  const ranges = ["15m","1h","6h","24h"];
  const modes  = ["mA","Ω"];

  return (
    <div style={{ padding: "8px 0 100px", color: T.text, fontFamily: T.fontSans }}>
      <ScreenHeader title="Trends" sub="Last 24h · live tail"/>

      <div style={{ padding: "0 16px 14px" }}>
        <Card style={{ padding: 14 }}>
          {/* segmented controls */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:10, alignItems:"center", marginBottom: 12 }}>
            <Seg items={ranges} value={range} onChange={setRange}/>
            <Seg items={modes}  value={mode}  onChange={setMode}/>
          </div>

          <ChartSVG series={data.series} mode={mode} visible={visible}/>

          {/* legend */}
          <div style={{ display:"flex", flexWrap:"wrap", gap: 14, marginTop: 12 }}>
            <LegendDot color={T.violet} dashed label="Target"
              on={visible.target !== false} onClick={() => setVisible({ ...visible, target: visible.target === false })}/>
            {data.channels.map(ch => (
              <LegendDot key={ch.idx} color={T.ch[ch.idx]} label={ch.name}
                on={visible["ch"+ch.idx] !== false}
                onClick={() => setVisible({ ...visible, ["ch"+ch.idx]: visible["ch"+ch.idx] === false })}/>
            ))}
            <LegendDot color={T.text} label="Total"
              on={visible.total !== false}
              onClick={() => setVisible({ ...visible, total: visible.total === false })}/>
          </div>
        </Card>
      </div>

      {/* Export bar */}
      <div style={{ padding: "0 16px 14px", display:"flex", gap: 8 }}>
        <ExportBtn>↓ CSV</ExportBtn>
        <ExportBtn>↓ SQLite</ExportBtn>
        <ExportBtn>↓ JSON</ExportBtn>
      </div>

      {/* sessions */}
      <div style={{ padding:"4px 20px 8px", display:"flex", alignItems:"baseline", justifyContent:"space-between" }}>
        <h2 style={{ margin:0, fontSize: 15, fontWeight: 600, letterSpacing:"-0.02em" }}>Recent wet sessions</h2>
        <Mono size={11} color={T.subtle}>{data.sessions.length} · 48h</Mono>
      </div>
      <div style={{ padding:"0 16px", display:"flex", flexDirection:"column", gap: 8 }}>
        {data.sessions.map(s => (
          <Card key={s.id} style={{ padding: 12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <Mono size={12} weight={600}>#{s.id}</Mono>
              <Mono size={11} color={T.subtle}>{s.when} · {s.dur}</Mono>
              <span style={{ flex: 1 }}/>
              <Mono size={13} weight={600}>{s.avgMa.toFixed(2)}<Mono color={T.subtle} size={10} weight={400} style={{ marginLeft:3 }}>mA</Mono></Mono>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <div style={{ display:"flex", gap: 4 }}>
                {s.chs.map(c => (
                  <span key={c} style={{
                    width: 18, height: 18, borderRadius: 5,
                    background: T.ch[c]+"22", color: T.ch[c],
                    fontSize: 9.5, fontWeight: 600,
                    display:"inline-flex", alignItems:"center", justifyContent:"center",
                    fontFamily: T.fontMono, border: `1px solid ${T.ch[c]}40`,
                  }}>A{c+1}</span>
                ))}
              </div>
              <span style={{ flex:1 }}/>
              <span style={{
                fontSize: 11, color: s.isFault ? T.red : T.muted,
                fontWeight: s.isFault ? 600 : 400,
              }}>{s.end}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Seg({ items, value, onChange }) {
  return (
    <div style={{
      display:"inline-flex",
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${T.border}`,
      borderRadius: 8, padding: 2,
    }}>
      {items.map(it => {
        const active = value === it;
        return (
          <button key={it} onClick={() => onChange(it)} style={{
            background: active ? "rgba(255,255,255,0.10)" : "transparent",
            color: active ? T.text : T.muted,
            border: "none",
            padding: "5px 12px", borderRadius: 6,
            fontSize: 12, fontWeight: 500, cursor:"pointer",
            fontFamily: T.fontSans, fontVariantNumeric:"tabular-nums",
            boxShadow: active ? "inset 0 1px 0 rgba(255,255,255,0.1)" : "none",
          }}>{it}</button>
        );
      })}
    </div>
  );
}

function ExportBtn({ children }) {
  return (
    <button style={{
      background: "transparent", color: T.text,
      border: `1px solid ${T.border}`,
      padding: "8px 14px", borderRadius: 8,
      fontSize: 12, fontWeight: 500, cursor:"pointer",
      fontFamily: T.fontSans,
    }}>{children}</button>
  );
}

function LegendDot({ color, label, on, dashed, onClick }) {
  return (
    <button onClick={onClick} style={{
      background:"transparent", border:"none", padding:"2px 0", cursor:"pointer",
      display:"inline-flex", alignItems:"center", gap:6,
      fontSize: 11, color: T.muted, opacity: on ? 1 : 0.35,
      fontFamily: T.fontSans,
    }}>
      {dashed
        ? <span style={{ width:14, height:0, borderTop: `1.5px dashed ${color}` }}/>
        : <span style={{ width:14, height:2, borderRadius:1, background: color, boxShadow: `0 0 6px ${color}80` }}/>
      }
      {label}
    </button>
  );
}

function ChartSVG({ series, mode, visible }) {
  const W = 320, H = 160, pad = { t: 8, r: 6, b: 18, l: 28 };
  const xs = series.xs;
  const xMax = xs[xs.length - 1];
  const allVals = [];
  ["ch0","ch1","ch2","ch3","total","target"].forEach(k => {
    if (visible[k] === false) return;
    (series[k] || []).forEach(v => v != null && allVals.push(v));
  });
  const yMax = Math.max(...allVals, 1) * 1.08;
  const sx = (x) => pad.l + (x / xMax) * (W - pad.l - pad.r);
  const sy = (y) => H - pad.b - (y / yMax) * (H - pad.t - pad.b);

  const poly = (arr, stroke, dash, w = 1.6, key) => {
    if (!arr) return null;
    const parts = []; let cur = [];
    arr.forEach((v, i) => {
      if (v == null) { if (cur.length) { parts.push(cur); cur = []; } }
      else cur.push(`${sx(xs[i])},${sy(v)}`);
    });
    if (cur.length) parts.push(cur);
    return parts.map((pts, i) => (
      <polyline key={key+"-"+i} fill="none" stroke={stroke} strokeWidth={w}
        strokeDasharray={dash} strokeLinejoin="round" strokeLinecap="round"
        points={pts.join(" ")}/>
    ));
  };

  const ticks = 4;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:"block" }}>
      <defs>
        <linearGradient id="totGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={T.accent} stopOpacity="0.20"/>
          <stop offset="1" stopColor={T.accent} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {Array.from({length: ticks+1}).map((_,i) => {
        const t = (yMax * i) / ticks;
        return (
          <g key={i}>
            <line x1={pad.l} x2={W-pad.r} y1={sy(t)} y2={sy(t)} stroke="rgba(255,255,255,0.06)"/>
            <text x={pad.l-4} y={sy(t)+3} textAnchor="end" fontSize="8.5" fontFamily={T.fontMono} fill={T.subtle}>{t.toFixed(1)}</text>
          </g>
        );
      })}
      <text x={W-4} y={11} textAnchor="end" fontSize="8.5" fontFamily={T.fontMono} fill={T.subtle}>{mode}</text>

      {/* total area */}
      {visible.total !== false && series.total && (() => {
        const pts = series.total.map((v,i) => v == null ? null : `${sx(xs[i])},${sy(v)}`).filter(Boolean);
        if (!pts.length) return null;
        const first = pts[0].split(",");
        const last  = pts[pts.length-1].split(",");
        const path = `M${first[0]},${sy(0)} L${pts.join(" ")} L${last[0]},${sy(0)} Z`;
        return <path d={path} fill="url(#totGrad)"/>;
      })()}

      {visible.target !== false && poly(series.target, T.violet, "5 3", 1.4, "tg")}
      {[0,1,2,3].map(i => visible["ch"+i] !== false && poly(series["ch"+i], T.ch[i], null, 1.6, "ch"+i))}
      {visible.total !== false && poly(series.total, T.text, null, 2, "tot")}
    </svg>
  );
}

/* ──────────────────────────── SETTINGS ──────────────────────────── */
function SettingsScreen() {
  const [notif, setNotif] = useS(true);
  const [auto,  setAuto]  = useS(true);
  const [haptic,setHaptic]= useS(true);
  return (
    <div style={{ padding: "8px 0 100px", color: T.text, fontFamily: T.fontSans }}>
      <ScreenHeader title="Settings" sub="Account · device"/>

      <div style={{ padding:"0 16px 14px" }}>
        <Card style={{ padding: 18, display:"flex", alignItems:"center", gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: `linear-gradient(135deg, ${T.accent}, #2563eb)`,
            display:"grid", placeItems:"center",
            color:"#000", fontWeight: 700, fontSize: 20,
          }}>JK</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Jordan Kim</div>
            <Mono size={11} color={T.subtle}>field-ops · org/onenous</Mono>
          </div>
          <span style={{ color: T.muted, fontSize: 18 }}>›</span>
        </Card>
      </div>

      <Group label="Device">
        <Toggle label="System notifications" on={notif} onChange={setNotif} sub="Faults, stale-feed, overcurrent"/>
        <Toggle label="Auto-clear non-latched" on={auto} onChange={setAuto} sub="Resume PROTECTING when telemetry recovers"/>
        <Toggle label="Haptics" on={haptic} onChange={setHaptic}/>
      </Group>

      <Group label="Connection">
        <Link label="Pi controller" detail="10.0.4.18 · LAN"/>
        <Link label="Log directory" detail="/var/lib/coilshield/logs"/>
        <Link label="Webhook" detail="not configured"/>
      </Group>

      <Group label="About">
        <Link label="Firmware"     detail="2.1.4"/>
        <Link label="App version"  detail="1.0.0 (build 142)"/>
        <Link label="Documentation"/>
        <Link label="Sign out" danger/>
      </Group>
    </div>
  );
}

function Group({ label, children }) {
  return (
    <div style={{ padding: "0 16px 14px" }}>
      <Eyebrow style={{ padding:"0 4px 8px", color: T.muted }}>{label}</Eyebrow>
      <Card style={{ padding: 4 }}>{children}</Card>
    </div>
  );
}

function Toggle({ label, sub, on, onChange }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap: 12,
      padding: "12px 12px",
      borderBottom: `1px solid ${T.border}`,
    }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize: 14, color: T.text }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: T.subtle, marginTop: 2, lineHeight: 1.4 }}>{sub}</div>}
      </div>
      <button onClick={() => onChange(!on)} style={{
        width: 42, height: 24, borderRadius: 999,
        background: on ? T.accentS : "rgba(255,255,255,0.10)",
        border:"none", padding: 2, cursor:"pointer", position:"relative",
      }}>
        <span style={{
          display:"block", width: 20, height: 20, borderRadius: "50%",
          background:"#fff", boxShadow:"0 1px 2px rgba(0,0,0,0.2)",
          transform: on ? "translateX(18px)" : "translateX(0)",
          transition: "transform 160ms ease",
        }}/>
      </button>
    </div>
  );
}

function Link({ label, detail, danger }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap: 12,
      padding: "13px 12px",
      borderBottom: `1px solid ${T.border}`,
      cursor:"pointer",
    }}>
      <div style={{ flex:1, fontSize: 14, color: danger ? T.red : T.text }}>{label}</div>
      {detail && <Mono size={11} color={T.subtle}>{detail}</Mono>}
      <span style={{ color: T.subtle, fontSize: 14 }}>›</span>
    </div>
  );
}

/* ──────────────────────────── LOGIN ──────────────────────────── */
function LoginScreen({ sky }) {
  return (
    <div style={{
      position:"relative", width:"100%", height:"100%",
      color: T.text, fontFamily: T.fontSans,
      display:"flex", flexDirection:"column",
      overflow:"hidden", background:"#05070a",
    }}>
      {/* ArtSky swirl from v77 */}
      <ArtSky {...(sky || {})}/>
      <div style={{ position:"absolute", inset:0, zIndex:4,
        background: "linear-gradient(180deg, rgba(5,7,10,0) 0%, rgba(5,7,10,0.55) 60%, rgba(5,7,10,0.85) 100%)" }}/>

      <div style={{ position:"relative", zIndex:1, flex:1, padding: "80px 28px 28px", display:"flex", flexDirection:"column" }}>
        {/* logomark */}
        <div style={{ display:"flex", alignItems:"center", gap: 10, marginBottom: 56 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "#fff", color:"#000",
            display:"grid", placeItems:"center",
            fontFamily: T.fontMono, fontWeight: 700, fontSize: 14, letterSpacing:"-0.04em",
          }}>CS</div>
          <span style={{ fontFamily: T.fontMono, fontWeight: 700, fontSize: 14, letterSpacing:"0.02em" }}>CoilShield</span>
        </div>

        <div style={{ marginTop:"auto" }}>
          <Eyebrow>ICCP control</Eyebrow>
          <h1 style={{
            margin:"10px 0 8px",
            fontSize: 40, fontWeight: 600, letterSpacing:"-0.05em",
            lineHeight: 1.0,
          }}>Cathodic protection in your pocket.</h1>
          <p style={{
            color: T.muted, fontSize: 14, lineHeight: 1.6,
            margin:"0 0 28px", maxWidth: 320,
          }}>Live telemetry, fault clearing, and trend export from any anode channel — over LAN or remote.</p>

          {/* form */}
          <div style={{ display:"flex", flexDirection:"column", gap: 10 }}>
            <Field label="Email" value="jordan@onenous.io"/>
            <Field label="Password" value="••••••••••" />
          </div>

          <button style={{
            width:"100%", marginTop: 18,
            background:"#fff", color:"#000",
            border:"1px solid rgba(255,255,255,0.14)",
            padding:"14px 16px", borderRadius: 10,
            fontSize: 14, fontWeight: 500, cursor:"pointer",
            fontFamily: T.fontSans,
            boxShadow: "0 1px 2px rgba(0,0,0,0.24)",
          }}>Sign in</button>
          <button style={{
            width:"100%", marginTop: 8,
            background:"transparent", color: T.text,
            border:`1px solid ${T.border}`,
            padding:"14px 16px", borderRadius: 10,
            fontSize: 14, fontWeight: 500, cursor:"pointer",
            fontFamily: T.fontSans,
          }}>Pair a controller</button>

          <div style={{ display:"flex", justifyContent:"center", marginTop: 18 }}>
            <Mono size={11} color={T.subtle}>v1.0.0 · build 142</Mono>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <label style={{ display:"flex", flexDirection:"column", gap: 6 }}>
      <span style={{ fontSize: 11, color: T.muted, fontWeight: 500, letterSpacing:"0.04em", textTransform:"uppercase" }}>{label}</span>
      <input defaultValue={value} style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        padding: "12px 14px",
        color: T.text, fontSize: 14, fontFamily: T.fontSans,
        outline:"none",
      }}/>
    </label>
  );
}

/* ──────────────────────────── BOTTOM NAV (shared) ──────────────────────────── */
function BottomTabs({ tab, setTab, platform = "ios" }) {
  const tabs = [
    { id: "dash",     label: "Live"     },
    { id: "trends",   label: "Trends"   },
    { id: "settings", label: "Settings" },
  ];
  // Sit above iOS home indicator (34px) and Android nav (24px)
  const bottomPad = platform === "ios" ? 34 : 24;
  return (
    <div style={{
      position:"absolute", left: 0, right: 0, bottom: 0,
      paddingBottom: bottomPad,
      background: "linear-gradient(180deg, rgba(5,7,10,0) 0%, rgba(5,7,10,0.95) 40%)",
      pointerEvents:"none",
      zIndex: 30,
    }}>
      <div style={{
        margin:"0 16px",
        background: "rgba(12,18,24,0.85)",
        border: `1px solid ${T.border}`,
        borderRadius: 18,
        padding: 6,
        display:"flex", gap: 4,
        backdropFilter: "blur(18px) saturate(140%)",
        WebkitBackdropFilter: "blur(18px) saturate(140%)",
        pointerEvents:"auto",
        boxShadow: "0 12px 32px rgba(0,0,0,0.55)",
      }}>
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex:1, padding: "10px 8px",
              background: active ? "rgba(125,211,252,0.14)" : "transparent",
              color: active ? T.accent : T.muted,
              border: active ? `1px solid rgba(125,211,252,0.35)` : "1px solid transparent",
              borderRadius: 14,
              fontSize: 12, fontWeight: 600,
              cursor:"pointer", fontFamily: T.fontSans,
              letterSpacing:"-0.01em",
            }}>{t.label}</button>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, {
  CS_T: T, FIXTURE,
  DashboardScreen, ReportsScreen, SettingsScreen, LoginScreen,
  BottomTabs,
});
