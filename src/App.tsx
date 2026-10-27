import { Benefits } from "@/components/sections/benefits"
import { Catalog } from "@/components/sections/catalog"
import { Contact } from "@/components/sections/contact"
import { Documents } from "@/components/sections/documents"
import { Hero } from "@/components/sections/hero"
import { LightDemo } from "@/components/sections/light-demo"
import { Process } from "@/components/sections/process"
import { ProductDialogProvider } from "@/components/sections/product-dialog"
import { RequestSheet, RequestToast } from "@/components/sections/request-sheet"
import { ScatterGallery } from "@/components/sections/scatter-gallery"
import { SiteFooter } from "@/components/sections/site-footer"
import { SiteHeader } from "@/components/sections/site-header"
import { Statement } from "@/components/sections/statement"
import { RequestProvider } from "@/lib/request-store"
import { SmoothScroll } from "@/lib/smooth-scroll"

export default function App() {
  return (
    <SmoothScroll>
      <RequestProvider>
        <ProductDialogProvider>
          <SiteHeader />
          <main>
            <Hero />
            <Statement />
            <ScatterGallery />
            <Catalog />
            <LightDemo />
            <Benefits />
            <Process />
            <Documents />
            <Contact />
          </main>
          <SiteFooter />
          <RequestSheet />
          <RequestToast />
        </ProductDialogProvider>
      </RequestProvider>
    </SmoothScroll>
  )
}
