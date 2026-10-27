import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ArrowUpRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { whatsappHref } from "@/lib/leads"

gsap.registerPlugin(useGSAP)

const STEPS = [
  { title: "Выберите модель", text: "В каталоге — или пришлите фото интерьера в WhatsApp: подскажем серию, длину и отделку." },
  { title: "Подтвердим комплектацию", text: "Управление светом на выбор: пульт, регулировка яркости и теплоты или Алиса." },
  { title: "Изготовим у себя", text: "Подбор шпона, сборка и покрытие маслом Borma — на собственном производстве в Краснодаре." },
  { title: "Получите и подключите", text: "Самовывоз с ул. Зиповской, 5В или доставка — условия обсудим. Пульт в комплекте." },
] as const

/** a step marker once the glowing line has reached it */
const DOT_LIT = {
  backgroundColor: "#d9773a",
  borderColor: "#d9773a",
  color: "#16110e",
  boxShadow: "0 0 0 6px rgb(217 119 58 / 0.15), 0 0 36px 4px rgb(255 160 90 / 0.65)",
}

export function Process() {
  const ref = React.useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      // matchMedia only runs the setup when at least one condition matches, so pair wide with narrow
      mm.add({ wide: "(min-width: 768px)", narrow: "(max-width: 767px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
        const { wide, reduce } = ctx.conditions as { wide: boolean; reduce: boolean }
        const line = wide ? "[data-line='h']" : "[data-line='v']"
        if (reduce) {
          gsap.set(line, { scaleX: 1, scaleY: 1 })
          gsap.set("[data-dot]", DOT_LIT)
          return
        }
        const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-steps]", start: "top 75%", end: "bottom 55%", scrub: 0.6 } })
        tl.fromTo(line, wide ? { scaleX: 0 } : { scaleY: 0 }, { scaleX: 1, scaleY: 1, ease: "none", duration: 1 }, 0)
        gsap.utils.toArray<HTMLElement>("[data-dot]").forEach((dot, i, all) => {
          tl.to(dot, { ...DOT_LIT, duration: 0.08 }, (i / Math.max(1, all.length - 1)) * 0.95)
        })
      })
      return () => mm.revert()
    },
    { scope: ref }
  )

  return (
    <section ref={ref} id="process" aria-labelledby="process-title" className="px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-6 text-muted-foreground">Как заказать</p>
            <h2 id="process-title" className="text-[clamp(34px,4.4vw,64px)] leading-[1] font-medium tracking-[-0.04em]">
              Четыре шага
              <br />
              <span className="font-serif font-normal text-primary italic">до тёплого света дома</span>
            </h2>
          </div>
          <Button variant="ember" size="lg" asChild>
            <a href={whatsappHref("Здравствуйте! Хочу заказать светильник. Подскажите, с чего начать?")} target="_blank" rel="noopener noreferrer">
              Начать с консультации <ArrowUpRight />
            </a>
          </Button>
        </div>

        <ol data-steps className="relative mt-16 grid gap-10 pl-12 md:grid-cols-4 md:gap-8 md:pt-14 md:pl-0">
          <span aria-hidden="true" className="absolute top-5 left-[19px] h-[calc(100%-40px)] w-px bg-border md:top-[19px] md:left-0 md:h-px md:w-full" />
          <span data-line="h" aria-hidden="true" className="absolute top-[19px] left-0 hidden h-px w-full origin-left scale-x-0 bg-gradient-to-r from-ember to-glow md:block" />
          <span data-line="v" aria-hidden="true" className="absolute top-5 left-[19px] h-[calc(100%-40px)] w-px origin-top scale-y-0 bg-gradient-to-b from-ember to-glow md:hidden" />
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative">
              <span
                data-dot
                className="absolute top-0 -left-12 grid size-10 place-items-center rounded-full border bg-background font-mono text-xs md:-top-14 md:left-0"
              >
                0{i + 1}
              </span>
              <h3 className="font-serif text-2xl tracking-[-0.02em]">{step.title}</h3>
              <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
