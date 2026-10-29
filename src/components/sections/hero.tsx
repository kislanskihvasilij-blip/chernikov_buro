import * as React from "react"
import { ArrowRight, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlowField, type LampBar } from "@/components/ui/glow-field"
import { LiquidSculpture } from "@/components/ui/liquid-sculpture-hero"
import { RevealWords } from "@/components/ui/reveal-words"
import { whatsappHref } from "@/lib/leads"
import { useScrollTo } from "@/lib/smooth-scroll"
import { asset, cn } from "@/lib/utils"

/** public/hero/lamp-cutout.webp: Rounded Plywood 800 cut from its studio photo with a straight-edged mask (1343 × 673) */
const LAMP_SRC = asset("hero/lamp-cutout.webp")
const LAMP_ASPECT = 1343 / 673
const LAMP_BAR: LampBar = { x0: 0.0194, x1: 0.9792, y0: 0.8663, y1: 0.9614 }

const SCULPTURE_OPTIONS = {
  density: 1.25,
  dotSize: 1.7,
  radius: 170,
  strength: 1.1,
  turbulence: 1.15,
  introDuration: 4600,
  bg: [0.086, 0.067, 0.055] as [number, number, number],
}

const FACTS = [
  { value: "10 лет", label: "работаем с деревом" },
  { value: "от 18 000 ₽", label: "светильники" },
  { value: "Алиса", label: "яркость · теплота" },
] as const

export function Hero() {
  const rootRef = React.useRef<HTMLElement>(null)
  const slotRef = React.useRef<HTMLDivElement>(null)
  const controlRef = React.useRef<{ replay: () => void } | null>(null)
  const [assembled, setAssembled] = React.useState(false)
  const scrollTo = useScrollTo()
  const handleAssembled = React.useCallback(() => setAssembled(true), [])

  const replay = () => {
    setAssembled(false)
    controlRef.current?.replay()
  }

  return (
    <section
      ref={rootRef}
      id="top"
      data-header="dark"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] touch-pan-y flex-col overflow-hidden bg-night text-on-night"
    >
      <GlowField
        className="absolute inset-0 -z-10"
        rootRef={rootRef}
        lamp={{ slotRef, aspect: LAMP_ASPECT, bar: LAMP_BAR }}
        lampOn={assembled}
      />
      <LiquidSculpture
        className="absolute inset-0 z-0"
        src={LAMP_SRC}
        aspect={LAMP_ASPECT}
        alt="Подвесной светильник Rounded Plywood 800 из фанеры"
        rootRef={rootRef}
        slotRef={slotRef}
        options={SCULPTURE_OPTIONS}
        onAssembled={handleAssembled}
        controlRef={controlRef}
      />
      <div aria-hidden="true" className="grain pointer-events-none absolute inset-0 z-[1]" />

      <div className="relative z-[2] flex flex-1 flex-col px-5 pt-[calc(var(--header-h)+3svh)] pb-6 md:px-10 md:pb-8">
        {/* the lamp hangs here; the canvas behind draws it */}
        <div ref={slotRef} aria-hidden="true" className="aspect-[1343/673] max-h-[34svh] w-[150vw] self-center sm:w-[min(1040px,92vw)]" />

        <div className="mx-auto mt-[5svh] flex max-w-5xl flex-col items-center text-center">
          <p
            className={cn(
              "eyebrow mb-6 text-on-night/80 transition-all delay-300 duration-1000",
              assembled ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            )}
          >
            Столярное бюро · Краснодар
          </p>
          <RevealWords
            as="h1"
            trigger="mount"
            delay={700}
            stagger={70}
            className="font-display text-[clamp(44px,7.4vw,112px)] leading-[0.95] font-medium tracking-[-0.045em]"
            segments={[
              { text: "Свет, собранный" },
              { text: "из дерева", breakBefore: true, className: "font-display-serif font-normal italic tracking-[-0.03em] text-glow" },
            ]}
          />
          <RevealWords
            trigger="mount"
            delay={1100}
            stagger={18}
            className="mt-7 max-w-xl text-[clamp(15px,1.25vw,18px)] leading-relaxed text-on-night/85"
            segments={[
              {
                text: "Потолочные светильники из шпона дуба и фанеры и мебель для дома. Проектируем, собираем и покрываем маслом на собственном производстве.",
              },
            ]}
          />
          <div className={cn("mt-9 flex flex-wrap justify-center gap-3 transition-all duration-1000", assembled ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0")}>
            <Button variant="ember" size="lg" onClick={() => scrollTo("#catalog")}>
              Выбрать светильник <ArrowRight />
            </Button>
            <Button variant="night" size="lg" asChild>
              <a href={whatsappHref("Здравствуйте! Помогите подобрать светильник.")} target="_blank" rel="noopener noreferrer">
                Консультация в WhatsApp
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-auto grid items-end gap-6 pt-12 md:grid-cols-[1fr_auto_1fr]">
          <dl className="hidden gap-8 md:flex">
            {FACTS.map((f) => (
              <div key={f.value}>
                <dt className="font-mono text-[11px] tracking-[0.14em] text-on-night-muted uppercase">{f.label}</dt>
                <dd className="mt-1 text-lg font-semibold tracking-tight">{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex items-center justify-center gap-3 font-mono text-[11px] tracking-[0.14em] text-on-night-muted uppercase">
            <span className="size-1.5 animate-[pulse-dot_2.4s_ease-in-out_infinite] rounded-full bg-glow" />
            Собран из частиц дерева
            <button
              type="button"
              onClick={replay}
              className="ml-1 grid size-7 cursor-pointer place-items-center rounded-full border border-on-night/20 transition hover:border-glow hover:text-glow"
              aria-label="Собрать светильник заново"
              title="Собрать заново"
            >
              <RotateCcw className="size-3" />
            </button>
          </div>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault()
              scrollTo("#about")
            }}
            className="hidden items-center justify-end gap-3 font-mono text-[11px] tracking-[0.14em] text-on-night-muted uppercase transition hover:text-on-night md:flex"
          >
            Листайте
            <span className="relative h-10 w-px overflow-hidden bg-on-night/15">
              <span className="absolute inset-0 animate-[scroll-cue_2.2s_ease-in-out_infinite] bg-glow" />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
