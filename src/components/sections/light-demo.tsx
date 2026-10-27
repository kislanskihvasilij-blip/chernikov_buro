import * as React from "react"
import { Lock, Mic, Power } from "lucide-react"

import { GlowCard } from "@/components/ui/glow-card"
import { EDITIONS, findProduct, type EditionKey } from "@/data/products"
import { asset, cn, formatPrice } from "@/lib/utils"

const EXAMPLE = findProduct("mid-century-dub-1000")

const CAN_DIM: readonly EditionKey[] = ["dim", "dimWarm", "smart"]
const CAN_WARM: readonly EditionKey[] = ["dimWarm", "smart"]

/** Voice presets the "Алиса" edition cycles through: [phrase, brightness, warmth]. */
const VOICE: ReadonlyArray<readonly [string, number, number]> = [
  ["Алиса, сделай свет теплее", 0.8, 0.95],
  ["Алиса, приглуши свет", 0.3, 0.85],
  ["Алиса, рабочий свет", 1, 0.15],
  ["Алиса, включи свет на кухне", 0.85, 0.55],
]

const COOL: readonly [number, number, number] = [226, 234, 255]
const WARM: readonly [number, number, number] = [255, 168, 92]

function mixColor(t: number): string {
  return COOL.map((c, i) => Math.round(c + (WARM[i] - c) * t)).join(" ")
}

export function LightDemo() {
  const [edition, setEdition] = React.useState<EditionKey>("dimWarm")
  const [on, setOn] = React.useState(true)
  const [brightness, setBrightness] = React.useState(0.85)
  const [warmth, setWarmth] = React.useState(0.7)
  const [voiceIndex, setVoiceIndex] = React.useState<number | null>(null)

  const canDim = CAN_DIM.includes(edition)
  const canWarm = CAN_WARM.includes(edition)
  // what the selected edition can actually do: locked controls fall back to the lamp's fixed light
  const level = on ? (canDim ? brightness : 1) : 0
  const tone = canWarm ? warmth : 0.62

  const selectEdition = (key: EditionKey) => {
    setEdition(key)
    setVoiceIndex(null)
    setOn(true)
  }

  const speak = () => {
    const next = voiceIndex === null ? 0 : (voiceIndex + 1) % VOICE.length
    const [, b, w] = VOICE[next]
    setVoiceIndex(next)
    setOn(true)
    setBrightness(b)
    setWarmth(w)
  }

  const scene = { "--c": mixColor(tone), "--l": String(level) } as React.CSSProperties

  return (
    <section id="light" data-header="dark" aria-labelledby="light-title" className="grain relative overflow-hidden bg-night px-5 py-24 text-on-night md:px-10 md:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_160_90/0.16),transparent)]" />
      <div className="relative mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <div>
          <p className="eyebrow mb-6 text-on-night-muted">Умный свет</p>
          <h2 id="light-title" className="text-[clamp(34px,4.4vw,64px)] leading-[1] font-medium tracking-[-0.04em]">
            Один светильник —
            <br />
            <span className="font-serif font-normal italic text-glow">четыре сценария света</span>
          </h2>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-on-night/70">
            Выберите комплектацию и попробуйте справа: пульт идёт в комплекте всегда, а яркость, теплота и голосовое управление добавляются по желанию.
          </p>

          <div role="radiogroup" aria-label="Комплектация" className="mt-9 space-y-2">
            {EDITIONS.map((e, i) => {
              const active = e.key === edition
              const price = EXAMPLE?.prices[e.key]
              return (
                <button
                  key={e.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => selectEdition(e.key)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-4 rounded-lg border px-4 py-3.5 text-left transition duration-300",
                    active ? "border-glow/60 bg-on-night/[0.07] shadow-[0_0_40px_-12px_rgb(255_160_90/0.6)]" : "border-on-night/10 hover:border-on-night/30"
                  )}
                >
                  <span className={cn("font-mono text-xs", active ? "text-glow" : "text-on-night-muted")}>0{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold">{e.title}</span>
                    <span className="block text-[13px] text-on-night/60">{e.note}</span>
                  </span>
                  {price !== undefined && <span className="font-mono text-sm whitespace-nowrap text-on-night/80">{formatPrice(price)}</span>}
                </button>
              )
            })}
          </div>
          {EXAMPLE && <p className="mt-3 font-mono text-[11px] tracking-[0.08em] text-on-night-muted uppercase">Цены на примере {EXAMPLE.title}</p>}
        </div>

        <GlowCard className="rounded-xl border border-on-night/10 bg-night-2 p-3 md:p-4">
          <div style={scene} className="relative aspect-[4/3.3] overflow-hidden rounded-lg bg-[linear-gradient(180deg,#1b1511_0%,#130f0c_70%,#1d1712_100%)]">
            {/* beam, floor pool and the LED line, all tinted by --c and scaled by --l */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-[46%] bottom-0 transition-[opacity,background] duration-700"
              style={{
                opacity: "var(--l)",
                clipPath: "polygon(15% 0, 85% 0, 104% 100%, -4% 100%)",
                background: "linear-gradient(180deg, rgb(var(--c) / 0.5) 0%, rgb(var(--c) / 0.14) 45%, transparent 85%)",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-[8%] bottom-[4%] h-[22%] rounded-[50%] transition-[opacity,background] duration-700"
              style={{ opacity: "var(--l)", background: "radial-gradient(closest-side, rgb(var(--c) / 0.45), transparent)" }}
            />
            {/* lamp is 72% wide at 4% from the top, so its bar bottom (96% of the image) sits at ~46% */}
            <div className="absolute inset-x-[14%] top-[4%]">
              <img src={asset("hero/lamp-cutout.webp")} alt="Светильник в демонстрации" className="relative z-[1] w-full" draggable={false} />
              <div
                aria-hidden="true"
                className="absolute inset-x-[2%] top-[95.6%] z-[2] h-[3px] rounded-full transition-[opacity,box-shadow,background] duration-700"
                style={{
                  opacity: "var(--l)",
                  background: "rgb(var(--c))",
                  boxShadow: "0 0 12px 3px rgb(var(--c) / 0.9), 0 6px 60px 18px rgb(var(--c) / 0.45)",
                }}
              />
            </div>
            <div aria-live="polite" className="absolute inset-x-0 bottom-[8%] flex justify-center px-4">
              {edition === "smart" && voiceIndex !== null && (
                <span key={voiceIndex} className="animate-in rounded-full bg-on-night/10 px-4 py-2 text-sm backdrop-blur duration-500 fade-in zoom-in-95">
                  «{VOICE[voiceIndex][0]}»
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-4 px-1 pb-1 sm:grid-cols-[auto_1fr_1fr] sm:items-end">
            <button
              type="button"
              onClick={() => setOn((v) => !v)}
              aria-pressed={on}
              className={cn(
                "flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition",
                on ? "border-glow/50 bg-glow/15 text-glow-soft" : "border-on-night/15 text-on-night/70"
              )}
            >
              <Power className="size-4" /> {on ? "Вкл" : "Выкл"}
            </button>
            <Slider label="Яркость" value={brightness} onChange={setBrightness} disabled={!canDim || !on} lockedNote={!canDim ? "от комплектации 02" : undefined} />
            <Slider label="Теплота света" value={warmth} onChange={setWarmth} disabled={!canWarm || !on} lockedNote={!canWarm ? "от комплектации 03" : undefined} />
          </div>
          {edition === "smart" && (
            <button
              type="button"
              onClick={speak}
              className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-on-night/15 py-3 text-sm font-semibold transition hover:border-glow/60 hover:text-glow-soft"
            >
              <Mic className="size-4" /> Скажите Алисе
            </button>
          )}
        </GlowCard>
      </div>
    </section>
  )
}

interface SliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  disabled: boolean
  lockedNote?: string
}

function Slider({ label, value, onChange, disabled, lockedNote }: SliderProps) {
  const id = React.useId()
  return (
    <div className={cn("transition-opacity", disabled && "opacity-45")}>
      <label htmlFor={id} className="mb-2 flex items-center justify-between gap-2 font-mono text-[11px] tracking-[0.1em] text-on-night-muted uppercase">
        {label}
        {lockedNote ? (
          <span className="flex items-center gap-1 normal-case">
            <Lock className="size-3" /> {lockedNote}
          </span>
        ) : (
          <span>{Math.round(value * 100)}%</span>
        )}
      </label>
      <input
        id={id}
        type="range"
        min={0.1}
        max={1}
        step={0.01}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer accent-[var(--glow)] disabled:cursor-not-allowed"
      />
    </div>
  )
}
