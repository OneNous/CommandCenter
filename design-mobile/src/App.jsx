import { useEffect } from 'react'
import { DesignCanvas, DCSection, DCArtboard } from './lib/DesignCanvas.jsx'
import { applyDesignAppearance, LoginScreen } from './lib/screens.jsx'
import { IOSDevice } from './lib/iOS.jsx'
import { buildSkyProps, PhoneShell, useApplyTheme } from './lib/phone-shell.jsx'
import {
  TweakRadio,
  TweakSection,
  TweakSelect,
  TweakSlider,
  TweakToggle,
  TweaksPanel,
  useTweaks,
} from './lib/tweaks-ios.jsx'

const TWEAK_DEFAULTS = {
  platforms: 'both',
  showLogin: true,
  showDash: true,
  showTrends: true,
  showSettings: true,
  skyTheme: 'cerulean',
  skySpeed: 62,
  skyZoom: 40,
  skyWarp: 235,
  skyWind: 144,
  skyFbm: 91,
  skyBlur: 127,
  skyGrain: 14,
  blackVeil: 0,
  cardOpacity: 65,
  accent: 'sky',
  channelCount: 4,
  /** Shop / v77 `white-ice-blue` + light `T` tokens (same as production mobile “Light appearance”). */
  lightAppearance: false,
}

function IOSPhone({ tab = 'dash', sky, shellBg, deviceDark }) {
  return (
    <IOSDevice width={390} height={844} dark={deviceDark}>
      <PhoneShell key={tab} platform="ios" initialTab={tab} sky={sky} contentBg={shellBg} />
    </IOSDevice>
  )
}

function AndroidShell({ children, chromeBg = '#05070a' }) {
  return (
    <div
      style={{
        width: 390,
        height: 844,
        borderRadius: 18,
        overflow: 'hidden',
        background: chromeBg,
        border: `8px solid rgba(116,119,117,0.45)`,
        boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
          color: '#fff',
          fontFamily: 'Roboto, system-ui',
          fontSize: 13,
          fontWeight: 500,
          position: 'relative',
        }}
      >
        <span>9:30</span>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 6,
            transform: 'translateX(-50%)',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#000',
          }}
        />
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 11 }}>5G</span>
          <span style={{ width: 16, height: 9, border: '1px solid #fff', borderRadius: 2, position: 'relative' }}>
            <span style={{ position: 'absolute', inset: 1, background: '#fff' }} />
          </span>
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>{children}</div>
      <div style={{ height: 24, display: 'grid', placeItems: 'center', background: 'rgba(5,7,10,0.95)' }}>
        <div style={{ width: 108, height: 4, borderRadius: 2, background: '#fff', opacity: 0.5 }} />
      </div>
    </div>
  )
}

function AndroidPhone({ tab = 'dash', sky, shellBg, chromeBg }) {
  return (
    <AndroidShell chromeBg={chromeBg}>
      <PhoneShell key={tab} platform="android" initialTab={tab} sky={sky} contentBg={shellBg} />
    </AndroidShell>
  )
}

function IOSLogin({ sky, deviceDark }) {
  return (
    <IOSDevice width={390} height={844} dark={deviceDark}>
      <LoginScreen sky={sky} />
    </IOSDevice>
  )
}

function AndroidLogin({ sky, chromeBg }) {
  return (
    <AndroidShell chromeBg={chromeBg}>
      <LoginScreen sky={sky} />
    </AndroidShell>
  )
}

export default function App() {
  const [t, setT] = useTweaks(TWEAK_DEFAULTS)
  const appearance = t.lightAppearance ? 'light' : 'dark'
  applyDesignAppearance(appearance)
  useApplyTheme(t.accent, t.cardOpacity, appearance)

  const showIOS = t.platforms === 'both' || t.platforms === 'ios'
  const showAndroid = t.platforms === 'both' || t.platforms === 'android'

  const sky = buildSkyProps({
    ...t,
    skyThemeOverride: t.lightAppearance ? 'white-ice-blue' : undefined,
  })
  const shellBg = t.lightAppearance ? '#eef4f9' : '#05070a'
  const androidChromeBg = t.lightAppearance ? '#eef4f9' : '#05070a'
  const deviceDark = !t.lightAppearance

  const vk = `${t.accent}-${t.cardOpacity}-${t.skyTheme}-${t.channelCount}-${appearance}`

  useEffect(() => {
    if (typeof window === 'undefined' || !window.FIXTURE) return
    const all = window.__FIXTURE_FULL || (window.__FIXTURE_FULL = window.FIXTURE.channels.slice())
    const n = Math.max(2, Math.min(5, t.channelCount))
    window.FIXTURE.channels = all.slice(0, n)
  }, [t.channelCount])

  const sections = []
  if (t.showLogin) {
    sections.push(
      <DCSection key="login" id="login" title="Login / onboarding">
        {showIOS && (
          <DCArtboard id="ios-login" label="iOS · Sign in" width={390} height={844}>
            <IOSLogin sky={sky} deviceDark={deviceDark} />
          </DCArtboard>
        )}
        {showAndroid && (
          <DCArtboard id="android-login" label="Android · Sign in" width={390} height={844}>
            <AndroidLogin sky={sky} chromeBg={androidChromeBg} />
          </DCArtboard>
        )}
      </DCSection>,
    )
  }
  if (t.showDash) {
    sections.push(
      <DCSection key="dash" id="dash" title="Dashboard / live">
        {showIOS && (
          <DCArtboard id="ios-dash" label="iOS · Live" width={390} height={844}>
            <IOSPhone tab="dash" sky={sky} shellBg={shellBg} deviceDark={deviceDark} />
          </DCArtboard>
        )}
        {showAndroid && (
          <DCArtboard id="android-dash" label="Android · Live" width={390} height={844}>
            <AndroidPhone tab="dash" sky={sky} shellBg={shellBg} chromeBg={androidChromeBg} />
          </DCArtboard>
        )}
      </DCSection>,
    )
  }
  if (t.showTrends) {
    sections.push(
      <DCSection key="trends" id="trends" title="Reports / trends">
        {showIOS && (
          <DCArtboard id="ios-trends" label="iOS · Trends" width={390} height={844}>
            <IOSPhone tab="trends" sky={sky} shellBg={shellBg} deviceDark={deviceDark} />
          </DCArtboard>
        )}
        {showAndroid && (
          <DCArtboard id="android-trends" label="Android · Trends" width={390} height={844}>
            <AndroidPhone tab="trends" sky={sky} shellBg={shellBg} chromeBg={androidChromeBg} />
          </DCArtboard>
        )}
      </DCSection>,
    )
  }
  if (t.showSettings) {
    sections.push(
      <DCSection key="settings" id="settings" title="Settings / profile">
        {showIOS && (
          <DCArtboard id="ios-settings" label="iOS · Settings" width={390} height={844}>
            <IOSPhone tab="settings" sky={sky} shellBg={shellBg} deviceDark={deviceDark} />
          </DCArtboard>
        )}
        {showAndroid && (
          <DCArtboard id="android-settings" label="Android · Settings" width={390} height={844}>
            <AndroidPhone tab="settings" sky={sky} shellBg={shellBg} chromeBg={androidChromeBg} />
          </DCArtboard>
        )}
      </DCSection>,
    )
  }

  return (
    <>
      <DesignCanvas
        key={vk}
        title="CoilShield ICCP — Mobile"
        subtitle="iOS 17 + Android 14 · Geist · ArtSky ambient · v77 visual language"
      >
        {sections}
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Layout">
          <TweakRadio
            label="Platforms"
            value={t.platforms}
            options={[
              { value: 'both', label: 'Both' },
              { value: 'ios', label: 'iOS' },
              { value: 'android', label: 'Android' },
            ]}
            onChange={(v) => setT('platforms', v)}
          />
        </TweakSection>

        <TweakSection label="Sections">
          <TweakToggle label="Login" value={t.showLogin} onChange={(v) => setT('showLogin', v)} />
          <TweakToggle label="Dashboard" value={t.showDash} onChange={(v) => setT('showDash', v)} />
          <TweakToggle label="Trends" value={t.showTrends} onChange={(v) => setT('showTrends', v)} />
          <TweakToggle label="Settings" value={t.showSettings} onChange={(v) => setT('showSettings', v)} />
        </TweakSection>

        <TweakSection label="Theme">
          <TweakToggle
            label="Light appearance (shop sky + UI)"
            value={t.lightAppearance}
            onChange={(v) => setT('lightAppearance', v)}
          />
          <TweakRadio
            label="Accent"
            value={t.accent}
            options={[
              { value: 'sky', label: 'Sky' },
              { value: 'emerald', label: 'Emerald' },
              { value: 'violet', label: 'Violet' },
              { value: 'amber', label: 'Amber' },
            ]}
            onChange={(v) => setT('accent', v)}
          />
          <TweakSlider label="Card opacity" value={t.cardOpacity} min={0} max={100} step={5} unit="%" onChange={(v) => setT('cardOpacity', v)} />
        </TweakSection>

        <TweakSection label="ArtSky · v77 fluid sky">
          <TweakSelect
            label="Palette"
            value={t.skyTheme}
            options={[
              { value: 'cerulean', label: 'Cerulean (homepage)' },
              { value: 'depth', label: 'Depth' },
              { value: 'abyss', label: 'Abyss' },
              { value: 'slate', label: 'Slate' },
              { value: 'indigo', label: 'Indigo' },
              { value: 'arctic', label: 'Arctic' },
              { value: 'storm', label: 'Storm' },
              { value: 'nebula', label: 'Nebula' },
              { value: 'frost', label: 'Frost' },
              { value: 'holo', label: 'Holo' },
              { value: 'synthwave', label: 'Synthwave' },
              { value: 'white-ice-blue', label: 'White ice blue (v77 shop)' },
            ]}
            onChange={(v) => setT('skyTheme', v)}
          />
          <TweakSlider label="Speed" value={t.skySpeed} min={0} max={200} step={2} unit="%" onChange={(v) => setT('skySpeed', v)} />
          <TweakSlider label="Zoom" value={t.skyZoom} min={10} max={100} step={1} unit="%" onChange={(v) => setT('skyZoom', v)} />
          <TweakSlider label="Warp" value={t.skyWarp} min={0} max={600} step={5} onChange={(v) => setT('skyWarp', v)} />
          <TweakSlider label="Wind speed" value={t.skyWind} min={0} max={400} step={2} onChange={(v) => setT('skyWind', v)} />
          <TweakSlider label="FBM strength" value={t.skyFbm} min={0} max={150} step={1} unit="%" onChange={(v) => setT('skyFbm', v)} />
          <TweakSlider label="Wave blur" value={t.skyBlur} min={0} max={300} step={2} onChange={(v) => setT('skyBlur', v)} />
          <TweakSlider label="Grain" value={t.skyGrain} min={0} max={50} step={1} unit="‰" onChange={(v) => setT('skyGrain', v)} />
          <TweakSlider label="Black veil" value={t.blackVeil} min={0} max={90} step={5} unit="%" onChange={(v) => setT('blackVeil', v)} />
        </TweakSection>

        <TweakSection label="Data">
          <TweakSlider label="Channels" value={t.channelCount} min={2} max={5} step={1} onChange={(v) => setT('channelCount', v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  )
}
