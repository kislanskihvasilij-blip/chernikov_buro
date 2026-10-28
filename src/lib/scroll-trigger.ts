import * as React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

import { useLenis } from "@/lib/smooth-scroll"

// GSAP lives here so only the lazily loaded sections that scrub on scroll pull it in
gsap.registerPlugin(ScrollTrigger, useGSAP)

/** Keeps scrubbed timelines in step with Lenis' smoothed scroll position. */
export function useLenisScrollTrigger(): void {
  const lenis = useLenis()
  React.useEffect(() => {
    if (!lenis) return
    const unsubscribe = lenis.on("scroll", ScrollTrigger.update)
    ScrollTrigger.refresh()
    return unsubscribe
  }, [lenis])
}

export { gsap, ScrollTrigger, useGSAP }
