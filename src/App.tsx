import * as React from "react"

import { Hero } from "@/components/sections/hero"
import { ProductDialogProvider, preloadProductDialog } from "@/components/sections/product-dialog"
import { RequestToast } from "@/components/sections/request-toast"
import { SiteHeader, preloadMobileMenu } from "@/components/sections/site-header"
import { Statement } from "@/components/sections/statement"
import { RequestProvider, useRequest } from "@/lib/request-store"
import { SmoothScroll } from "@/lib/smooth-scroll"

// Everything below the first two screens is split out: the hero paints without GSAP or Radix,
// and these chunks start downloading as soon as the first render commits.
const ScatterGallery = React.lazy(() => import("@/components/sections/scatter-gallery").then((m) => ({ default: m.ScatterGallery })))
const Catalog = React.lazy(() => import("@/components/sections/catalog").then((m) => ({ default: m.Catalog })))
const LightDemo = React.lazy(() => import("@/components/sections/light-demo").then((m) => ({ default: m.LightDemo })))
const Benefits = React.lazy(() => import("@/components/sections/benefits").then((m) => ({ default: m.Benefits })))
const Process = React.lazy(() => import("@/components/sections/process").then((m) => ({ default: m.Process })))
const Documents = React.lazy(() => import("@/components/sections/documents").then((m) => ({ default: m.Documents })))
const Contact = React.lazy(() => import("@/components/sections/contact").then((m) => ({ default: m.Contact })))
const SiteFooter = React.lazy(() => import("@/components/sections/site-footer").then((m) => ({ default: m.SiteFooter })))
const loadRequestSheet = () => import("@/components/sections/request-sheet")
const RequestSheet = React.lazy(() => loadRequestSheet().then((m) => ({ default: m.RequestSheet })))

/** Mounts the request drawer the first time it is opened, then keeps it for its close animation. */
function LazyRequestSheet() {
  const { isOpen } = useRequest()
  const [mounted, setMounted] = React.useState(false)
  if (isOpen && !mounted) setMounted(true)
  if (!mounted) return null
  return (
    <React.Suspense fallback={null}>
      <RequestSheet />
    </React.Suspense>
  )
}

/** Fetches the on-click chunks (dialogs, drawers) once the browser has nothing better to do. */
function useIdlePreload() {
  React.useEffect(() => {
    const preload = () => {
      preloadProductDialog()
      preloadMobileMenu()
      void loadRequestSheet()
    }
    // Safari has no requestIdleCallback: fall back to a plain delay
    const requestIdle = window.requestIdleCallback as typeof window.requestIdleCallback | undefined
    if (requestIdle) {
      const id = requestIdle(preload, { timeout: 4000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(preload, 2500)
    return () => window.clearTimeout(id)
  }, [])
}

export default function App() {
  useIdlePreload()
  return (
    <SmoothScroll>
      <RequestProvider>
        <ProductDialogProvider>
          <SiteHeader />
          <main>
            <Hero />
            <Statement />
            <React.Suspense fallback={<div className="min-h-[100svh]" aria-hidden="true" />}>
              <ScatterGallery />
              <Catalog />
              <LightDemo />
              <Benefits />
              <Process />
              <Documents />
              <Contact />
            </React.Suspense>
          </main>
          <React.Suspense fallback={null}>
            <SiteFooter />
          </React.Suspense>
          <LazyRequestSheet />
          <RequestToast />
        </ProductDialogProvider>
      </RequestProvider>
    </SmoothScroll>
  )
}
