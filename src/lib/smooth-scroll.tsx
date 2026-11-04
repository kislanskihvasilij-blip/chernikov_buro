import * as React from "react"
import Lenis from "lenis"

import { prefersReducedMotion } from "@/lib/utils"

const LenisContext = React.createContext<Lenis | null>(null)

/** How long a link like /#catalog waits for its lazily loaded section before giving up. */
const HASH_WAIT_MS = 8000
const HASH_SETTLE_MS = 100

/**
 * Sections below the hero load lazily, so the browser finds nothing to land on for /#catalog.
 * Waits for the target to appear and jumps to it. Returns a cleanup that stops waiting.
 */
function scrollToInitialHash(lenis: Lenis | null): () => void {
  const hash = window.location.hash
  if (hash.length < 2) return () => {}
  const find = (): HTMLElement | null => {
    try {
      return document.querySelector<HTMLElement>(hash)
    } catch {
      return null
    }
  }
  // the browser would otherwise put the page back where it was before the reload
  history.scrollRestoration = "manual"
  const jump = (el: HTMLElement) => {
    if (!lenis) {
      el.scrollIntoView()
      return
    }
    // Lenis measured the page before the sections arrived and would clamp to the old height
    lenis.resize()
    lenis.scrollTo(el, { immediate: true, force: true })
  }
  const found = find()
  if (found) {
    jump(found)
    return () => {}
  }
  const observer = new MutationObserver(() => {
    const el = find()
    if (!el) return
    stop()
    // let the rest of the lazily loaded sections commit first, so the measured offset is final
    window.setTimeout(() => jump(el), HASH_SETTLE_MS)
  })
  const timer = window.setTimeout(() => stop(), HASH_WAIT_MS)
  function stop() {
    observer.disconnect()
    window.clearTimeout(timer)
  }
  observer.observe(document.body, { childList: true, subtree: true })
  return stop
}

/**
 * Lenis inertia scrolling on its own rAF loop. Sections that scrub with ScrollTrigger hook in via
 * `useLenisScrollTrigger` (lib/scroll-trigger), so GSAP stays out of the first bundle.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = React.useState<Lenis | null>(null)

  React.useEffect(() => {
    if (prefersReducedMotion()) return scrollToInitialHash(null)
    const instance = new Lenis({ duration: 1.15, smoothWheel: true, autoRaf: true })

    // Radix dialogs lock the page by flagging <body>; pause inertia while they are open
    const observer = new MutationObserver(() => {
      if (document.body.hasAttribute("data-scroll-locked")) instance.stop()
      else instance.start()
    })
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked"] })

    setLenis(instance)
    const stopHashScroll = scrollToInitialHash(instance)
    return () => {
      stopHashScroll()
      observer.disconnect()
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}

export function useLenis(): Lenis | null {
  return React.useContext(LenisContext)
}

export function useScrollTo(): (target: string, offset?: number) => void {
  const lenis = useLenis()
  return React.useCallback(
    (target: string, offset = 0) => {
      if (lenis) {
        lenis.scrollTo(target, { offset, duration: 1.4 })
        return
      }
      document.querySelector(target)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" })
    },
    [lenis]
  )
}
