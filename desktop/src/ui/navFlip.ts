/**
 * v77 `flip-layout-helpers.ts` — GSAP Flip for SiteHeader shell morph (open / close).
 */
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(Flip)

const NAV_SHELL_FLIP_DURATION = 0.75
const NAV_SHELL_FLIP_EASE = 'sine.inOut'

export function killNavFlipTargets(nodes: readonly (HTMLElement | null)[]) {
  const els = nodes.filter((n): n is HTMLElement => n != null)
  if (els.length) Flip.killFlipsOf(els)
}

/**
 * Capture layout → synchronous DOM mutate (React flushSync) → Flip.from.
 * Same options as v77 `runFlip` for `ssh:exec` nav shell.
 */
export function runNavShellFlip(
  targets: readonly (HTMLElement | null)[],
  mutate: () => void,
  opts?: { reducedMotion?: boolean },
): gsap.core.Animation | void {
  const els = targets.filter((n): n is HTMLElement => n != null)
  if (els.length === 0) {
    mutate()
    return
  }
  if (opts?.reducedMotion) {
    mutate()
    return
  }

  killNavFlipTargets(els)
  const state = Flip.getState(els, { simple: true })
  mutate()

  return Flip.from(state, {
    duration: NAV_SHELL_FLIP_DURATION,
    ease: NAV_SHELL_FLIP_EASE,
    nested: true,
    absolute: true,
    simple: true,
  })
}
