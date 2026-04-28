import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { AppProvider, ToastStack, useApp } from './lib/app-context.jsx'
import { applyDesignAppearance, LoginScreen } from './lib/screens.jsx'
import { buildSkyProps, MOBILE_DEFAULTS, PhoneShell, useApplyTheme } from './lib/phone-shell.jsx'
import { getNativePlatform } from './lib/native-platform.js'

function MobileChrome() {
  const app = useApp()
  const platform = getNativePlatform()
  const t = MOBILE_DEFAULTS
  const appearance = app.prefs.appearance === 'light' ? 'light' : 'dark'
  applyDesignAppearance(appearance)
  useApplyTheme(t.accent, t.cardOpacity, appearance)
  const sky = buildSkyProps({
    ...t,
    skyThemeOverride: appearance === 'light' ? 'white-ice-blue' : undefined,
  })
  const shellBg = appearance === 'light' ? '#eef4f9' : '#05070a'

  useEffect(() => {
    if (typeof window === 'undefined' || !window.FIXTURE) return
    const all = window.__FIXTURE_FULL || (window.__FIXTURE_FULL = window.FIXTURE.channels.slice())
    const n = Math.max(2, Math.min(5, t.channelCount))
    window.FIXTURE.channels = all.slice(0, n)
  }, [t.channelCount])

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    const light = appearance === 'light'
    void StatusBar.setStyle({ style: light ? Style.Light : Style.Dark })
    void StatusBar.setBackgroundColor({ color: light ? '#eef4f9' : '#05070a' })
  }, [appearance])

  return (
    <>
      <ToastStack />
      <div className="mobile-app-root" style={{ background: shellBg }}>
        {app.session === 'login' ? (
          <LoginScreen
            sky={sky}
            mode={app.loginMode}
            onBackFromPair={() => app.setLoginMode('signIn')}
            email={app.email}
            password={app.password}
            onEmailChange={app.setEmail}
            onPasswordChange={app.setPassword}
            loginError={app.loginError}
            pairError={app.pairError}
            loginLoading={app.loginLoading}
            pairTesting={app.pairTesting}
            onSignIn={() => void app.signIn()}
            onOpenPair={() => app.setLoginMode('pair')}
            onTestPair={() => void app.testPairConnection()}
            onSavePair={() => void app.savePairAndEnter()}
            pairHost={app.pairHost}
            pairPort={app.pairPort}
            onPairHostChange={app.setPairHost}
            onPairPortChange={app.setPairPort}
          />
        ) : (
          <PhoneShell platform={platform} initialTab="connect" sky={sky} contentBg={shellBg} />
        )}
      </div>
    </>
  )
}

/**
 * Full-screen CoilShield ICCP: opens into Command Center like the desktop app (Connect first), mobile viewport.
 * Optional login only after sign-out from Setup. Packaged with Capacitor (`npm run build` then `npx cap sync`).
 */
export function MobileApp() {
  return (
    <AppProvider>
      <MobileChrome />
    </AppProvider>
  )
}
