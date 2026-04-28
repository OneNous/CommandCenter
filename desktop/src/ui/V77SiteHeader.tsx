import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { ThemeToggle } from './ThemeToggle'
import { killNavFlipTargets, runNavShellFlip } from './navFlip'
import type { AppTabId } from './tabIds'

const NAV_WORDMARK = 'CoilShield'
const NAV_WORDMARK_PALETTE = ['f', 'l', 'i', 'p'] as const

type Props = {
  tab: AppTabId
  setTab: (t: AppTabId) => void
  sshLinked: boolean
  hasApi: boolean
  appearance: 'light' | 'dark'
  setAppearance: (a: 'light' | 'dark') => void
}

const ITEMS: { id: AppTabId; label: string; needsSsh: boolean; needsApi: boolean }[] = [
  { id: 'connect', label: 'Connect', needsSsh: false, needsApi: false },
  { id: 'live', label: 'Live', needsSsh: false, needsApi: true },
  { id: 'console', label: 'Pi console', needsSsh: true, needsApi: false },
  { id: 'meta', label: 'Controller meta', needsSsh: false, needsApi: true },
]

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * v77 `SiteHeader.astro` — liquid glass pill, hamburger, wordmark, mega-menu.
 * Open/close uses GSAP Flip (same duration/ease as v77 `runFlip`).
 */
export function V77SiteHeader({
  tab,
  setTab,
  sshLinked,
  hasApi,
  appearance,
  setAppearance,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const barRef = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)
  const glareRef = useRef<HTMLDivElement | null>(null)
  const animatingRef = useRef(false)

  useEffect(() => {
    const bar = barRef.current
    const glare = glareRef.current
    if (!bar || !glare) return
    if (prefersReducedMotion()) return

    const onMove = (e: MouseEvent) => {
      const rect = bar.getBoundingClientRect()
      glare.style.setProperty('--x', `${e.clientX - rect.left}px`)
      glare.style.setProperty('--y', `${e.clientY - rect.top}px`)
    }
    bar.addEventListener('mousemove', onMove)
    return () => bar.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    return () => {
      killNavFlipTargets([barRef.current, panelRef.current, innerRef.current])
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const flipTo = useCallback((next: boolean) => {
    const bar = barRef.current
    const panel = panelRef.current
    const inner = innerRef.current
    if (!bar || !panel || !inner) {
      flushSync(() => setIsOpen(next))
      return Promise.resolve()
    }

    const anim = runNavShellFlip([bar, panel, inner], () => {
      flushSync(() => setIsOpen(next))
    }, { reducedMotion: prefersReducedMotion() })

    if (!anim) return Promise.resolve()
    return anim.then(() => {})
  }, [])

  const safeFlipTo = useCallback(
    async (next: boolean) => {
      if (animatingRef.current) return
      animatingRef.current = true
      try {
        await flipTo(next)
      } finally {
        animatingRef.current = false
      }
    },
    [flipTo],
  )

  const pickTab = useCallback(
    (id: AppTabId) => {
      setTab(id)
      void safeFlipTo(false)
    },
    [setTab, safeFlipTo],
  )

  const onToggle = useCallback(() => {
    void safeFlipTo(!isOpen)
  }, [isOpen, safeFlipTo])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) void safeFlipTo(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, safeFlipTo])

  return (
    <>
      <div className="iccp-site-nav-fixed-shell">
        <header
          ref={barRef}
          id="iccp-nav-bar"
          data-nav-mode="nav"
          className={`liquid-nav nav-bar--flip-palette ${isOpen ? 'is-open' : ''}`}
        >
          <div className="liquid-glare-container" aria-hidden>
            <div ref={glareRef} id="iccp-nav-bar-glare" className="liquid-glare" />
          </div>

          <div className="nav-bar__chrome">
            <div className="iccp-nav-bar__top">
              <div className="iccp-nav-bar__left">
                <button
                  id="iccp-nav-toggle"
                  type="button"
                  className="iccp-nav-toggle"
                  aria-label="Navigation menu"
                  aria-expanded={isOpen}
                  aria-controls="iccp-nav-panel"
                  onClick={onToggle}
                >
                  <span className="iccp-nav-toggle__hamburger" aria-hidden>
                    <span id="iccp-ham-top" className="iccp-ham iccp-ham--top" />
                    <span id="iccp-ham-bot" className="iccp-ham iccp-ham--bot" />
                  </span>
                </button>
              </div>

              <div className="iccp-nav-bar__center">
                <button
                  type="button"
                  className="nav-wordmark nav-wordmark--btn"
                  aria-label={isOpen ? 'Close menu' : 'CoilShield'}
                  onClick={() => {
                    if (isOpen) void safeFlipTo(false)
                  }}
                >
                  <span className="nav-wordmark__stage nav-wordmark__stage--final nav-wordmark__stage--columns" aria-hidden>
                    {NAV_WORDMARK.split('').map((ch, i) => (
                      <span
                        key={`${ch}-${i}`}
                        className={`nav-wordmark__letter nav-wordmark__letter--${NAV_WORDMARK_PALETTE[i % NAV_WORDMARK_PALETTE.length]}`}
                      >
                        {ch}
                      </span>
                    ))}
                  </span>
                </button>
              </div>

              <div className="iccp-nav-bar__right">
                <ThemeToggle appearance={appearance} setAppearance={setAppearance} />
              </div>

              <div id="iccp-nav-line" className="iccp-nav-line" aria-hidden />
            </div>

            <div
              ref={panelRef}
              id="iccp-nav-panel"
              className="iccp-nav-panel"
              aria-hidden={!isOpen}
            >
              <div className="iccp-nav-panel__stretch">
                <div ref={innerRef} id="iccp-nav-panel-inner" className="iccp-nav-panel__inner">
                  <nav aria-label="Primary" className="iccp-nav-primary">
                    <div className="nav-mega-columns">
                      <div className="iccp-nav-col iccp-nav-col--primary">
                        <div className="iccp-nav-eyebrow iccp-nav-eyebrow--sky">
                          <span>ICCP Command Center</span>
                        </div>
                        <ul className="iccp-nav-list">
                          {ITEMS.map((item) => (
                            <li key={item.id}>
                              <button
                                type="button"
                                disabled={(item.needsSsh && !sshLinked) || (item.needsApi && !hasApi)}
                                className="iccp-nav-mega-link"
                                onClick={() => pickTab(item.id)}
                              >
                                <span
                                  className={
                                    tab === item.id
                                      ? 'nav-mega-link-text nav-mega-link-text--active'
                                      : 'nav-mega-link-text'
                                  }
                                >
                                  {item.label}
                                </span>
                                {tab === item.id ? (
                                  <span className="iccp-nav-tag">
                                    <span className="iccp-nav-tag__bg" aria-hidden />
                                    <span className="iccp-nav-tag__fg">Active</span>
                                  </span>
                                ) : null}
                              </button>
                              <div className="nav-mega-line" aria-hidden />
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="iccp-nav-col iccp-nav-col--explore">
                        <div className="iccp-nav-eyebrow iccp-nav-eyebrow--muted iccp-nav-eyebrow--desktop-only">
                          <span>Explore</span>
                        </div>
                        <ul className="iccp-nav-list iccp-nav-list--plain">
                          <li>
                            <p className="iccp-nav-blurb">
                              SSH + dashboard tunnel + Pi shell — aligned with the CoilShield controller workflow.
                            </p>
                            <div className="nav-mega-line nav-mega-line--spaced" aria-hidden />
                          </li>
                          <li>
                            <p className="iccp-nav-blurb iccp-nav-blurb--dim">
                              Open <kbd className="iccp-nav-kbd">Connect</kbd> first, then{' '}
                              <kbd className="iccp-nav-kbd">Live</kbd> for HTTP telemetry from the Pi dashboard.
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      <div className="iccp-site-header-fixed-spacer" aria-hidden />
    </>
  )
}
