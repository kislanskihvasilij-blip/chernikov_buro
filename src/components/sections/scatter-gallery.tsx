import * as React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { ArrowRight } from "lucide-react"

import { PhotoReveal } from "@/components/ui/photo-reveal"
import { findProduct, productImage, startPrice } from "@/data/products"
import { useScrollTo } from "@/lib/smooth-scroll"
import { asset, formatPrice } from "@/lib/utils"
import { useOpenProduct } from "./product-dialog"

gsap.registerPlugin(ScrollTrigger, useGSAP)

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
  alt: string
  /** grid placement: 2 × 5 on phones, 5 × 3 from md */
  slot: string
  desktop: Pose
  mobile: Pose | null
}

const SHOTS: readonly Shot[] = [
  { slug: "aalto", src: productImage("aalto", 2), alt: "Столик Аалто у дивана", slot: "col-start-2 row-start-1 md:col-start-1 md:col-span-2 md:row-span-2", desktop: { x: 0.13, y: 0.3, w: 0.15, r: -7 }, mobile: { x: 0.22, y: 0.2, w: 0.34, r: -7 } },
  { slug: "mid-century-dub-1000", src: productImage("mid-century-dub-1000", 2), alt: "Светильник Mid Century Дуб со светом снизу", slot: "col-start-1 row-start-1 row-span-2 md:col-start-3 md:row-span-2", desktop: { x: 0.87, y: 0.27, w: 0.11, r: 6 }, mobile: { x: 0.84, y: 0.22, w: 0.25, r: 6 } },
  { slug: "lam", src: productImage("lam", 2), alt: "Стул Лам у стола", slot: "col-start-2 row-start-2 md:col-start-4 md:row-start-1", desktop: { x: 0.27, y: 0.8, w: 0.11, r: 5 }, mobile: { x: 0.24, y: 0.8, w: 0.28, r: 5 } },
  { slug: "simplex-black-1000", src: productImage("simplex-black-1000", 2), alt: "Чёрный светильник Simplex", slot: "col-start-2 row-start-4 row-span-2 md:col-start-5 md:row-start-1 md:row-span-2", desktop: { x: 0.07, y: 0.7, w: 0.09, r: -4 }, mobile: { x: 0.1, y: 0.55, w: 0.2, r: -4 } },
  { slug: "balans", src: productImage("balans", 2), alt: "Кресло Баланс", slot: "col-start-1 row-start-4 md:col-start-4 md:row-start-2", desktop: { x: 0.72, y: 0.83, w: 0.12, r: -6 }, mobile: { x: 0.76, y: 0.83, w: 0.3, r: -6 } },
  { slug: "osnova-600", src: productImage("osnova-600", 2), alt: "Стол Основа с книгой", slot: "col-start-1 row-start-5 md:col-start-1 md:row-start-3", desktop: { x: 0.93, y: 0.66, w: 0.1, r: 8 }, mobile: { x: 0.9, y: 0.6, w: 0.22, r: 8 } },
  { slug: "vertikal", src: asset("brand/interior-vertikal.webp"), alt: "Стеллаж Вертикаль в спальне", slot: "col-span-2 col-start-1 row-start-3 md:col-start-2 md:row-start-3", desktop: { x: 0.34, y: 0.14, w: 0.14, r: 3 }, mobile: { x: 0.5, y: 0.09, w: 0.42, r: 3 } },
  { slug: "sloi", src: productImage("sloi", 2), alt: "Стол Слой с настольной лампой", slot: "hidden md:block md:col-span-2 md:col-start-4 md:row-start-3", desktop: { x: 0.63, y: 0.13, w: 0.12, r: -4 }, mobile: null },
]

export function ScatterGallery() {
  const sectionRef = React.useRef<HTMLElement>(null)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const [shown, setShown] = React.useState(false)
  const openProduct = useOpenProduct()
  const scrollTo = useScrollTo()

  React.useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShown(true)
        io.disconnect()
      }
    }, { rootMargin: "0px 0px -25% 0px" })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useGSAP(
    () => {
      const section = sectionRef.current
      const stage = stageRef.current
      if (!section || !stage) return
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", stage)
      const slots = gsap.utils.toArray<HTMLElement>("[data-slot]", stage)
      const mm = gsap.matchMedia()

      // matchMedia only runs the setup when at least one condition matches, so pair mobile with desktop
      mm.add({ isMobile: "(max-width: 767px)", isDesktop: "(min-width: 768px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
        const { isMobile, reduce } = ctx.conditions as { isMobile: boolean; reduce: boolean }

        // each card sits exactly over its grid slot; the scroll only animates transforms
        const place = () => {
          const sb = stage.getBoundingClientRect()
          cards.forEach((card, i) => {
            const r = slots[i].getBoundingClientRect()
            gsap.set(card, { display: r.width > 0 ? "block" : "none", left: r.left - sb.left, top: r.top - sb.top, width: r.width, height: r.height })
          })
        }
        const scatter = (i: number) => {
          const pose = (isMobile ? SHOTS[i].mobile : SHOTS[i].desktop) ?? SHOTS[i].desktop
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
            onUpdate: (self) => stage.style.setProperty("--float-amp", String(Math.max(0, 1 - self.progress * 1.6))),
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
        gsap.set("[data-caption]", { opacity: 0, y: 8 })
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
      <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-hidden">
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
          <div className="relative grid flex-1 grid-cols-2 grid-rows-5 gap-2 px-2 pb-2 md:grid-cols-5 md:grid-rows-3 md:gap-3 md:px-5 md:pb-5">
            {SHOTS.map((shot) => (
              <div key={shot.slug} data-slot className={shot.slot} />
            ))}
          </div>
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
              <div className="h-full w-full" style={{ animation: `float-y ${5 + (i % 3)}s ease-in-out ${i * -0.7}s infinite` }}>
                <button
                  type="button"
                  onClick={() => openProduct(shot.slug)}
                  className="group block h-full w-full cursor-pointer rounded-xl bg-card p-[5px] text-left shadow-[0_18px_40px_-18px_rgb(74_63_53/0.45)] transition-shadow hover:shadow-[0_24px_50px_-16px_rgb(74_63_53/0.6)]"
                  aria-label={product ? `${product.title} — подробнее` : shot.alt}
                >
                  <PhotoReveal src={shot.src} alt={shot.alt} shown={shown} delay={i * 110} className="h-full w-full rounded-lg">
                    {product && (
                      <span data-caption className="absolute bottom-2 left-2 flex items-center gap-2 rounded-md bg-card/90 px-2.5 py-1.5 text-[11px] font-semibold shadow-sm backdrop-blur md:text-xs">
                        {product.title}
                        <span className="font-mono font-normal text-muted-foreground">{formatPrice(startPrice(product))}</span>
                      </span>
                    )}
                  </PhotoReveal>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
