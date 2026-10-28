import * as React from "react"
import Lenis from "lenis"

import { prefersReducedMotion } from "@/lib/utils"

const LenisContext = React.createContext<Lenis | null>(null)

/**
 * Lenis inertia scrolling on its own rAF loop. Sections that scrub with ScrollTrigger hook in via
 * `useLenisScrollTrigger` (lib/scroll-trigger), so GSAP stays out of the first bundle.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = React.useState<Lenis | null>(null)

  React.useEffect(() => {
    if (prefersReducedMotion()) return
    const instance = new Lenis({ duration: 1.15, smoothWheel: true, autoRaf: true })

    // Radix dialogs lock the page by flagging <body>; pause inertia while they are open
    const observer = new MutationObserver(() => {
      if (document.body.hasAttribute("data-scroll-locked")) instance.stop()
      else instance.start()
    })
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked"] })

    setLenis(instance)
    return () => {
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
