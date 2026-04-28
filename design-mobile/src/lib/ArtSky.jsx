import React, { useEffect, useMemo, useRef } from 'react'

/* Per-platform palettes (from v77 artsky-extended-palettes) */
export const ARTSKY_PALETTES = {
  cerulean: ['#050a10', '#0a1622', '#122334', '#1b3448', '#38bdf8', '#e0f2fe'],
  slate: ['#06080b', '#0d1219', '#151d2a', '#1f2d40', '#8da4b8', '#e8eef4'],
  abyss: ['#030508', '#071018', '#0e1e2e', '#163042', '#22d3ee', '#ecfeff'],
  indigo: ['#07060e', '#100e1a', '#1a1730', '#262447', '#7c86f8', '#e8eafe'],
  graphite: ['#050506', '#0a0b0e', '#13151a', '#1c2129', '#5c6575', '#eef1f6'],
  arctic: ['#04090b', '#0a1519', '#11202a', '#1a2e3b', '#4fd4c9', '#dcfdf7'],
  storm: ['#06080d', '#0e131c', '#151d2a', '#1f2b3d', '#5b9cf7', '#e0edff'],
  nebula: ['#060510', '#100e1c', '#1a1830', '#252344', '#99a3f5', '#f0f2ff'],
  depth: ['#02060d', '#07121c', '#0e2030', '#163040', '#0ea5e9', '#e0f4ff'],
  frost: ['#080a0e', '#101521', '#182030', '#263245', '#7dd3fc', '#f5f9fc'],
  holo: ['#04020c', '#0c0830', '#18145c', '#3d2a7a', '#00f5ff', '#f8e8ff'],
  synthwave: ['#0a0218', '#16082e', '#32145c', '#6b1a8f', '#ff2d9a', '#ffd6f7'],
}

function hexToVec3(hex) {
  const h = hex.slice(1)
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255]
}
function avgVec3(a, b) {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
}
function paletteToBloop(stops) {
  const v = stops.map(hexToVec3)
  return {
    low: avgVec3(v[0], v[1]),
    main: avgVec3(v[1], v[2]),
    mid: avgVec3(v[3], v[4]),
    high: avgVec3(v[4], v[5]),
  }
}

const VERT = `#version 300 es
in vec3 position;
in vec2 uv;
out vec2 out_uv;
void main(){
  out_uv = uv;
  out_uv.y = 1.0 - out_uv.y;
  gl_Position = vec4(position, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;
#define NUM_OCTAVES (4)
in vec2 out_uv;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_viewport;
uniform sampler2D uTextureNoise;
uniform vec3 u_bloopColorMain;
uniform vec3 u_bloopColorLow;
uniform vec3 u_bloopColorMid;
uniform vec3 u_bloopColorHigh;
uniform float u_windSpeed;
uniform float u_warpPower;
uniform float u_fbmStrength;
uniform float u_blurRadius;
uniform float u_zoom;
uniform float u_grainStrength;
uniform float u_grainScale;
uniform float u_noiseScale;

vec3 blendLinearBurn_13_5(vec3 base, vec3 blend, float opacity){
  return (max(base + blend - vec3(1.0), vec3(0.0))) * opacity + base * (1.0 - opacity);
}
vec4 permute(vec4 x){ return mod((x*34.0+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t){ return t*t*t*(t*(t*6.0-15.0)+10.0); }
float rand(vec2 n){ return fract(sin(dot(n, vec2(12.9898,4.1414))) * 43758.5453); }
float noise(vec2 p){
  vec2 ip=floor(p); vec2 u=fract(p); u=u*u*(3.0-2.0*u);
  float res = mix(mix(rand(ip), rand(ip+vec2(1,0)), u.x), mix(rand(ip+vec2(0,1)), rand(ip+vec2(1,1)), u.x), u.y);
  return res*res;
}
float fbm(vec2 x){
  float v=0.0; float a=0.5; vec2 shift=vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i=0; i<NUM_OCTAVES; ++i){ v += a*noise(x); x = rot*x*2.0 + shift; a *= 0.5; }
  return v;
}
float cnoise(vec3 P){
  vec3 Pi0 = floor(P); vec3 Pi1 = Pi0+vec3(1.0);
  Pi0 = mod(Pi0, 289.0); Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = vec4(Pi0.z); vec4 iz1 = vec4(Pi1.z);
  vec4 ixy = permute(permute(ix)+iy);
  vec4 ixy0 = permute(ixy+iz0); vec4 ixy1 = permute(ixy+iz1);
  vec4 gx0 = ixy0/7.0; vec4 gy0 = fract(floor(gx0)/7.0)-0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5)-abs(gx0)-abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0*(step(vec4(0.0), gx0)-0.5);
  gy0 -= sz0*(step(vec4(0.0), gy0)-0.5);
  vec4 gx1 = ixy1/7.0; vec4 gy1 = fract(floor(gx1)/7.0)-0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5)-abs(gx1)-abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1*(step(vec4(0.0), gx1)-0.5);
  gy1 -= sz1*(step(vec4(0.0), gy1)-0.5);
  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x); vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z); vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x); vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z); vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000), dot(g010,g010), dot(g100,g100), dot(g110,g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001), dot(g011,g011), dot(g101,g101), dot(g111,g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0); float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z)); float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z)); float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz)); float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000,n100,n010,n110), vec4(n001,n101,n011,n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

vec3 getFluidColor(vec2 st, float time){
  float scaleFactor = 1.0/(2.0*u_zoom);
  vec2 uv = st*scaleFactor + 0.5;
  uv.y = 1.0 - uv.y;
  float noiseScale = u_noiseScale;
  float windSpeed = u_windSpeed;
  float warpPower = u_warpPower;
  float fbmStrength = u_fbmStrength;
  float blurRadius = u_blurRadius;
  float waterColorNoiseScale = 18.0;
  float waterColorNoiseStrength = 0.02;
  float textureNoiseScale = u_grainScale;
  float textureNoiseStrength = u_grainStrength;
  float verticalOffset = 0.09;
  float waveSpread = 1.0;
  float layer1Amplitude = 1.5; float layer1Frequency = 1.0;
  float layer2Amplitude = 1.4; float layer2Frequency = 1.0;
  float layer3Amplitude = 1.3; float layer3Frequency = 1.0;
  float fbmPowerDamping = 0.55;
  float timescale = 1.0;
  time = time * timescale * 0.85;
  verticalOffset += 1.0 - waveSpread;

  float noiseX = cnoise(vec3(uv*noiseScale + vec2(0.0, 74.8572), time*0.3));
  float noiseY = cnoise(vec3(uv*noiseScale + vec2(203.91282, 10.0), time*0.3));
  uv += vec2(noiseX*2.0, noiseY) * warpPower;

  float noiseA = cnoise(vec3(uv*waterColorNoiseScale + vec2(344.91282, 0.0), time*0.3))
               + cnoise(vec3(uv*waterColorNoiseScale*2.2 + vec2(723.937, 0.0), time*0.4))*0.5;
  uv += noiseA * waterColorNoiseStrength;
  uv.y -= verticalOffset;

  vec2 textureUv = uv * textureNoiseScale;
  float r0 = texture(uTextureNoise, textureUv).r;
  float g0 = texture(uTextureNoise, vec2(textureUv.x, 1.0-textureUv.y)).g;
  float d0 = mix(r0-0.5, g0-0.5, (sin(time)+1.0)*0.5) * textureNoiseStrength;
  textureUv += vec2(63.861, 368.937);
  float r1 = texture(uTextureNoise, textureUv).r;
  float g1 = texture(uTextureNoise, vec2(textureUv.x, 1.0-textureUv.y)).g;
  float d1 = mix(r1-0.5, g1-0.5, (sin(time)+1.0)*0.5) * textureNoiseStrength;
  textureUv += vec2(272.861, 829.937);
  textureUv += vec2(180.302, 819.871);
  float r3 = texture(uTextureNoise, textureUv).r;
  float g3 = texture(uTextureNoise, vec2(textureUv.x, 1.0-textureUv.y)).g;
  float d3 = mix(r3-0.5, g3-0.5, (sin(time)+1.0)*0.5) * textureNoiseStrength;
  uv += d0;

  vec2 st_fbm = uv * noiseScale;
  vec2 q = vec2(0.0);
  q.x = fbm(st_fbm*0.5 + windSpeed*time);
  q.y = fbm(st_fbm*0.5 + windSpeed*time);
  vec2 r = vec2(0.0);
  r.x = fbm(st_fbm + 1.0*q + vec2(0.3,9.2) + 0.15*time);
  r.y = fbm(st_fbm + 1.0*q + vec2(8.3,0.8) + 0.126*time);
  float f = fbm(st_fbm + r - q);
  float fullFbm = (f + 0.6*f*f + 0.7*f + 0.5) * 0.5;
  fullFbm = pow(fullFbm, fbmPowerDamping);
  fullFbm *= fbmStrength;
  blurRadius = blurRadius * 1.5;

  vec2 snUv = (uv + vec2((fullFbm-0.5)*1.2) + vec2(0.0,0.025) + d0)*vec2(layer1Frequency,1.0);
  float sn  = noise(snUv*2.0 + vec2(0.0, time*0.5)) * 2.0 * layer1Amplitude;
  float sn2 = smoothstep(sn-1.2*blurRadius, sn+1.2*blurRadius, (snUv.y-0.5*waveSpread)*5.0+0.5);

  vec2 snUvBis = (uv + vec2((fullFbm-0.5)*0.85) + vec2(0.0,0.025) + d1)*vec2(layer2Frequency,1.0);
  float snBis = noise(snUvBis*4.0 + vec2(293.0, time*1.0)) * 2.0 * layer2Amplitude;
  float sn2Bis = smoothstep(snBis-0.9*blurRadius, snBis+0.9*blurRadius, (snUvBis.y-0.6*waveSpread)*5.0+0.5);

  vec2 snUvThird = (uv + vec2((fullFbm-0.5)*1.1) + d3)*vec2(layer3Frequency,1.0);
  float snThird = noise(snUvThird*6.0 + vec2(153.0, time*1.2)) * 2.0 * layer3Amplitude;
  float sn2Third = smoothstep(snThird-0.7*blurRadius, snThird+0.7*blurRadius, (snUvThird.y-0.9*waveSpread)*6.0+0.5);

  sn2 = pow(sn2, 0.8);
  sn2Bis = pow(sn2Bis, 0.9);

  vec3 sinColor;
  sinColor = blendLinearBurn_13_5(u_bloopColorMain, u_bloopColorLow, 1.0 - sn2);
  sinColor = blendLinearBurn_13_5(sinColor, mix(u_bloopColorMain, u_bloopColorMid, 1.0 - sn2Bis), sn2);
  sinColor = mix(sinColor, mix(u_bloopColorMain, u_bloopColorHigh, 1.0 - sn2Third), sn2*sn2Bis);
  return sinColor;
}

void main(){
  vec2 st = out_uv - 0.5;
  st.x *= u_viewport.x / u_viewport.y;
  vec3 finalColor = getFluidColor(st, u_time);
  fragColor = vec4(finalColor, 1.0);
}`

function makeNoiseTexture(gl) {
  const size = 256
  const data = new Uint8Array(size * size * 4)
  for (let i = 0; i < data.length; i += 4) {
    const v = (Math.random() * 255) | 0
    data[i] = v
    data[i + 1] = v
    data[i + 2] = v
    data[i + 3] = 255
  }
  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  return tex
}

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s)
    gl.deleteShader(s)
    throw new Error('shader compile: ' + log)
  }
  return s
}
function link(gl, vs, fs) {
  const p = gl.createProgram()
  gl.attachShader(p, vs)
  gl.attachShader(p, fs)
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(p)
    throw new Error('program link: ' + log)
  }
  return p
}

export function ArtSky({
  theme = 'cerulean',
  windSpeed = 0.144,
  warpPower = 0.2355,
  fbmStrength = 0.912,
  blurRadius = 1.2673,
  zoom = 0.3971,
  grainStrength = 0.014,
  grainScale = 2,
  noiseScale = 0.8673,
  speed = 0.62,
  blackVeil = 0,
}) {
  const hostRef = useRef(null)
  const canvasRef = useRef(null)
  const stateRef = useRef({})

  const colors = useMemo(
    () => paletteToBloop(ARTSKY_PALETTES[theme] || ARTSKY_PALETTES.cerulean),
    [theme],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return

    let gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
    })
    if (!gl) {
      host.dataset.gl = 'no'
      return
    }
    let vs
    let fs
    let prog
    try {
      vs = compile(gl, gl.VERTEX_SHADER, VERT)
      fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
      prog = link(gl, vs, fs)
    } catch (e) {
      console.warn('ArtSky shader error', e)
      host.dataset.gl = 'err'
      return
    }

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]),
      gl.STATIC_DRAW,
    )

    const aPos = gl.getAttribLocation(prog, 'position')
    const aUv = gl.getAttribLocation(prog, 'uv')
    gl.enableVertexAttribArray(aPos)
    gl.enableVertexAttribArray(aUv)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0)
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8)

    const tex = makeNoiseTexture(gl)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, tex)

    gl.useProgram(prog)
    const loc = (n) => gl.getUniformLocation(prog, n)
    const u = {
      u_time: loc('u_time'),
      u_viewport: loc('u_viewport'),
      uTextureNoise: loc('uTextureNoise'),
      u_bloopColorMain: loc('u_bloopColorMain'),
      u_bloopColorLow: loc('u_bloopColorLow'),
      u_bloopColorMid: loc('u_bloopColorMid'),
      u_bloopColorHigh: loc('u_bloopColorHigh'),
      u_windSpeed: loc('u_windSpeed'),
      u_warpPower: loc('u_warpPower'),
      u_fbmStrength: loc('u_fbmStrength'),
      u_blurRadius: loc('u_blurRadius'),
      u_zoom: loc('u_zoom'),
      u_grainStrength: loc('u_grainStrength'),
      u_grainScale: loc('u_grainScale'),
      u_noiseScale: loc('u_noiseScale'),
    }
    gl.uniform1i(u.uTextureNoise, 0)

    stateRef.current = { gl, prog, u, tex, buf, vs, fs }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25)
      const w = Math.max(1, Math.floor(host.clientWidth * dpr))
      const h = Math.max(1, Math.floor(host.clientHeight * dpr))
      if (canvas.width !== w) canvas.width = w
      if (canvas.height !== h) canvas.height = h
      gl.viewport(0, 0, w, h)
      gl.uniform2f(u.u_viewport, w, h)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    let raf
    let last = performance.now()
    let tAcc = 0
    let alive = true
    const tick = (now) => {
      if (!alive) return
      const dt = (now - last) / 1000
      last = now
      const s = stateRef.current
      tAcc += dt * (s.speed ?? 0.62)
      gl.uniform1f(u.u_time, tAcc * 0.95)
      const c = s.colors
      if (c) {
        gl.uniform3f(u.u_bloopColorMain, c.main[0], c.main[1], c.main[2])
        gl.uniform3f(u.u_bloopColorLow, c.low[0], c.low[1], c.low[2])
        gl.uniform3f(u.u_bloopColorMid, c.mid[0], c.mid[1], c.mid[2])
        gl.uniform3f(u.u_bloopColorHigh, c.high[0], c.high[1], c.high[2])
      }
      gl.uniform1f(u.u_windSpeed, s.windSpeed ?? 0.144)
      gl.uniform1f(u.u_warpPower, s.warpPower ?? 0.2355)
      gl.uniform1f(u.u_fbmStrength, s.fbmStrength ?? 0.912)
      gl.uniform1f(u.u_blurRadius, s.blurRadius ?? 1.2673)
      gl.uniform1f(u.u_zoom, s.zoom ?? 0.3971)
      gl.uniform1f(u.u_grainStrength, s.grainStrength ?? 0.014)
      gl.uniform1f(u.u_grainScale, s.grainScale ?? 2)
      gl.uniform1f(u.u_noiseScale, s.noiseScale ?? 0.8673)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      gl.deleteBuffer(buf)
      gl.deleteTexture(tex)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [])

  stateRef.current.colors = colors
  stateRef.current.windSpeed = windSpeed
  stateRef.current.warpPower = warpPower
  stateRef.current.fbmStrength = fbmStrength
  stateRef.current.blurRadius = blurRadius
  stateRef.current.zoom = zoom
  stateRef.current.grainStrength = grainStrength
  stateRef.current.grainScale = grainScale
  stateRef.current.noiseScale = noiseScale
  stateRef.current.speed = speed

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        background: '#050a10',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      {blackVeil > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(3,5,8,${blackVeil * 0.55}) 0%, rgba(3,5,8,${blackVeil}) 100%)`,
          }}
        />
      )}
    </div>
  )
}
