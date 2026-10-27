import * as React from "react"
import Lenis from "lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import { prefersReducedMotion } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

const LenisContext = React.createContext<Lenis | null>(null)

/** Lenis inertia scrolling, driven by GSAP's ticker so ScrollTrigger scrubs stay in sync. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = React.useState<Lenis | null>(null)

  React.useEffect(() => {
    if (prefersReducedMotion()) return
    const instance = new Lenis({ duration: 1.15, smoothWheel: true })
    instance.on("scroll", ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Radix dialogs lock the page by flagging <body>; pause inertia while they are open
    const observer = new MutationObserver(() => {
      if (document.body.hasAttribute("data-scroll-locked")) instance.stop()
      else instance.start()
    })
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked"] })

    setLenis(instance)
    return () => {
      observer.disconnect()
      gsap.ticker.remove(tick)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}

export function useScrollTo(): (target: string, offset?: number) => void {
  const lenis = React.useContext(LenisContext)
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
