import * as React from "react"
import { ArrowRight } from "lucide-react"

import { PhotoReveal } from "@/components/ui/photo-reveal"
import { findProduct, productImage, startPrice } from "@/data/products"
import { justifiedRows, type FrameChrome } from "@/lib/justified-layout"
import { gsap, ScrollTrigger, useGSAP, useLenisScrollTrigger } from "@/lib/scroll-trigger"
import { useScrollTo } from "@/lib/smooth-scroll"
import { asset, formatPrice } from "@/lib/utils"
import { useOpenProduct } from "./product-dialog"

interface Pose {
  /** centre, as a fraction of the stage */
  x: number
  y: number
  /** width as a fraction of the stage width */
  w: number
  r: number
}

interface Shot {
  slug: string
  src: string
  srcSet?: string
  /** natural width / height of the photo — frames take exactly this shape, so nothing is cropped */
  aspect: number
  alt: string
  desktop: Pose
  mobile: Pose
}

const PORTRAIT = 1179 / 1766

const productShot = (slug: string, n: 1 | 2) => ({
  src: productImage(slug, n, "sm"),
  srcSet: `${productImage(slug, n, "sm")} 600w, ${productImage(slug, n, "lg")} 1200w`,
})

// only photos where the whole product is in frame
const SHOTS: readonly Shot[] = [
  { slug: "mid-century-dub-800", ...productShot("mid-century-dub-800", 1), aspect: PORTRAIT, alt: "Светильник Mid Century Дуб-800", desktop: { x: 0.88, y: 0.27, w: 0.09, r: 6 }, mobile: { x: 0.84, y: 0.22, w: 0.24, r: 6 } },
  { slug: "aalto", ...productShot("aalto", 2), aspect: 1, alt: "Столик Аалто у дивана", desktop: { x: 0.13, y: 0.3, w: 0.13, r: -7 }, mobile: { x: 0.2, y: 0.2, w: 0.32, r: -7 } },
  { slug: "vertikal", src: asset("brand/interior-vertikal.webp"), aspect: 1.5, alt: "Стеллаж Вертикаль в спальне", desktop: { x: 0.34, y: 0.14, w: 0.15, r: 3 }, mobile: { x: 0.5, y: 0.08, w: 0.42, r: 3 } },
  { slug: "balans", ...productShot("balans", 1), aspect: 1, alt: "Кресло Баланс", desktop: { x: 0.63, y: 0.13, w: 0.11, r: -4 }, mobile: { x: 0.78, y: 0.83, w: 0.3, r: -6 } },
  { slug: "lam", ...productShot("lam", 1), aspect: 1, alt: "Стул Лам у стола", desktop: { x: 0.27, y: 0.8, w: 0.11, r: 5 }, mobile: { x: 0.22, y: 0.82, w: 0.28, r: 5 } },
  { slug: "osnova-600", ...productShot("osnova-600", 2), aspect: 1, alt: "Стол Основа 600 с книгами", desktop: { x: 0.72, y: 0.83, w: 0.11, r: -6 }, mobile: { x: 0.9, y: 0.6, w: 0.22, r: 8 } },
  { slug: "sloi", ...productShot("sloi", 1), aspect: 1, alt: "Стол Слой в гостиной", desktop: { x: 0.93, y: 0.66, w: 0.1, r: 8 }, mobile: { x: 0.12, y: 0.6, w: 0.22, r: -4 } },
  { slug: "oro", ...productShot("oro", 1), aspect: 1, alt: "Стеллаж Оро в спальне", desktop: { x: 0.07, y: 0.68, w: 0.09, r: -4 }, mobile: { x: 0.5, y: 0.95, w: 0.22, r: 3 } },
  { slug: "simplex-black-1000", ...productShot("simplex-black-1000", 1), aspect: PORTRAIT, alt: "Чёрный светильник Simplex Black-1000", desktop: { x: 0.5, y: 0.9, w: 0.07, r: -3 }, mobile: { x: 0.88, y: 0.4, w: 0.18, r: 5 } },
]

const ASPECTS = SHOTS.map((s) => s.aspect)
const ROWS = {
  desktop: [[0, 1, 2, 3], [4, 5, 6, 7, 8]],
  mobile: [[0, 1], [2, 3], [4, 5, 6], [7, 8]],
} as const
const CHROME: Record<"desktop" | "mobile", FrameChrome> = {
  desktop: { gap: 12, pad: 5, caption: 34 },
  mobile: { gap: 8, pad: 4, caption: 26 },
}

export function ScatterGallery() {
  const sectionRef = React.useRef<HTMLElement>(null)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const areaRef = React.useRef<HTMLDivElement>(null)
  const [shown, setShown] = React.useState(false)
  const openProduct = useOpenProduct()
  const scrollTo = useScrollTo()
  useLenisScrollTrigger()

  React.useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return
    // develop the photos once; float only while the section is on screen
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setShown(true)
      stage.dataset.offscreen = String(!entry.isIntersecting)
    }, { rootMargin: "0px 0px -25% 0px" })
    io.observe(section)
    return () => io.disconnect()
  }, [])

  useGSAP(
    () => {
      const section = sectionRef.current
      const stage = stageRef.current
      const area = areaRef.current
      if (!section || !stage || !area) return
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", stage)
      const mm = gsap.matchMedia()

      // matchMedia only runs the setup when at least one condition matches, so pair mobile with desktop
      mm.add({ isMobile: "(max-width: 767px)", isDesktop: "(min-width: 768px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
        const { isMobile, reduce } = ctx.conditions as { isMobile: boolean; reduce: boolean }
        const chrome = CHROME[isMobile ? "mobile" : "desktop"]
        stage.style.setProperty("--pad", `${chrome.pad}px`)
        stage.style.setProperty("--cap", `${chrome.caption}px`)

        // each card's final frame comes from the justified layout; the scroll only animates transforms
        const place = () => {
          const sb = stage.getBoundingClientRect()
          const ab = area.getBoundingClientRect()
          const rects = justifiedRows({ x: ab.left - sb.left, y: ab.top - sb.top, w: ab.width, h: ab.height }, ROWS[isMobile ? "mobile" : "desktop"], ASPECTS, chrome)
          cards.forEach((card, i) => {
            const r = rects[i]
            gsap.set(card, r ? { display: "block", left: r.x, top: r.y, width: r.w, height: r.h } : { display: "none" })
          })
        }
        const scatter = (i: number) => {
          const pose = isMobile ? SHOTS[i].mobile : SHOTS[i].desktop
          const card = cards[i]
          const w = card.offsetWidth || 1
          const h = card.offsetHeight || 1
          return {
            x: pose.x * stage.clientWidth - (card.offsetLeft + w / 2),
            y: pose.y * stage.clientHeight - (card.offsetTop + h / 2),
            scale: (pose.w * stage.clientWidth) / w,
            rotation: pose.r,
          }
        }
        place()
        ScrollTrigger.addEventListener("refreshInit", place)
        if (reduce) {
          gsap.set("[data-board]", { opacity: 1 })
          return () => ScrollTrigger.removeEventListener("refreshInit", place)
        }

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.9,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const amp = Math.max(0, 1 - self.progress * 1.6)
              stage.style.setProperty("--float-amp", String(amp))
              // once the collage has landed the float is invisible: stop paying for it
              stage.dataset.settled = String(amp === 0)
            },
          },
        })
        cards.forEach((card, i) => {
          tl.fromTo(
            card,
            { x: () => scatter(i).x, y: () => scatter(i).y, scale: () => scatter(i).scale, rotation: () => scatter(i).rotation },
            { x: 0, y: 0, scale: 1, rotation: 0, duration: 1 },
            0.05 + i * 0.035
          )
        })
        tl.to("[data-gallery-title]", { opacity: 0, scale: 0.9, filter: "blur(10px)", duration: 0.45, ease: "power1.in" }, 0.08)
        tl.fromTo("[data-board]", { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0.85)
        // staggered fromTo only primes its first target, so hide every caption up front
        gsap.set("[data-caption]", { opacity: 0, y: 6 })
        tl.to("[data-caption]", { opacity: 1, y: 0, duration: 0.25, stagger: 0.02 }, 1.0)
        // hold the finished collage for a beat before the section scrolls away
        tl.to({}, { duration: 0.45 })

        return () => ScrollTrigger.removeEventListener("refreshInit", place)
      })
      return () => mm.revert()
    },
    { scope: sectionRef }
  )

  return (
    <section ref={sectionRef} id="interiors" aria-labelledby="interiors-title" className="relative h-[290vh]">
      <div ref={stageRef} className="group/stage sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-x-3 top-[calc(var(--header-h)-28px)] bottom-3 flex flex-col md:inset-x-10 md:bottom-8">
          <div data-board className="pointer-events-none absolute inset-0 rounded-2xl border bg-card/60 shadow-warm" />
          <div data-board className="relative flex items-center justify-between gap-4 px-3 py-3 md:px-6 md:py-5">
            <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Коллекция · 30 моделей</p>
            <button
              type="button"
              onClick={() => scrollTo("#catalog")}
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold transition hover:text-primary"
            >
              Весь каталог <ArrowRight className="size-4" />
            </button>
          </div>
          {/* the collage is laid out inside this box */}
          <div ref={areaRef} className="relative mx-2 mb-2 flex-1 md:mx-5 md:mb-5" />
        </div>

        <div data-gallery-title className="pointer-events-none absolute inset-0 z-[5] grid place-items-center px-6 text-center">
          <div>
            <p className="eyebrow mb-5 justify-center text-muted-foreground">Интерьеры</p>
            <h2 id="interiors-title" className="text-[clamp(36px,5.6vw,84px)] leading-[0.98] font-medium tracking-[-0.04em]">
              Дерево и свет
              <br />
              <span className="font-serif font-normal text-primary italic">в живых интерьерах</span>
            </h2>
            <p className="mx-auto mt-6 max-w-sm text-[15px] text-muted-foreground">Листайте — снимки соберутся в коллекцию</p>
          </div>
        </div>

        {SHOTS.map((shot, i) => {
          const product = findProduct(shot.slug)
          return (
            <div key={shot.slug} data-card className="absolute z-10 will-change-transform" style={{ display: "none" }}>
              <div
                className="h-full w-full group-data-[offscreen=true]/stage:[animation-play-state:paused] group-data-[settled=true]/stage:[animation-play-state:paused]"
                style={{ animation: `float-y ${5 + (i % 3)}s ease-in-out ${i * -0.7}s infinite` }}
              >
                <button
                  type="button"
                  onClick={() => openProduct(shot.slug)}
                  className="flex h-full w-full cursor-pointer flex-col rounded-xl bg-card p-[var(--pad)] pb-0 text-left shadow-[0_18px_40px_-18px_rgb(74_63_53/0.45)] transition-shadow hover:shadow-[0_24px_50px_-16px_rgb(74_63_53/0.6)]"
                  aria-label={product ? `${product.title} — подробнее` : shot.alt}
                >
                  <PhotoReveal
                    src={shot.src}
                    srcSet={shot.srcSet}
                    sizes="(max-width: 767px) 50vw, 32vw"
                    alt={shot.alt}
                    shown={shown}
                    delay={i * 110}
                    className="min-h-0 w-full flex-1 rounded-lg"
                  />
                  {product && (
                    <span data-caption className="flex h-[var(--cap)] w-full shrink-0 items-center justify-between gap-2 px-1 text-[11px] md:text-[13px]">
                      <span className="truncate font-semibold">{product.title}</span>
                      <span className="hidden shrink-0 font-mono text-muted-foreground sm:inline">{formatPrice(startPrice(product))}</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
