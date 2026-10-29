import { PhotoReveal } from "@/components/ui/photo-reveal"
import { RevealWords } from "@/components/ui/reveal-words"
import { asset } from "@/lib/utils"

const FACTS = [
  { value: "10 лет", label: "делаем мебель для частных и коммерческих интерьеров" },
  { value: "1 команда", label: "от подбора шпона до финальной сборки — на своей базе" },
] as const

export function Statement() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative overflow-hidden px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-12">
        <div className="lg:col-span-9">
          <h2 id="about-title" className="eyebrow mb-10 text-muted-foreground">
            О нас
          </h2>
          <RevealWords
            className="text-[clamp(28px,3.6vw,54px)] leading-[1.12] font-medium tracking-[-0.03em]"
            stagger={40}
            segments={[
              { text: "Мы — столярное бюро «Черников» из Краснодара. Десять лет работаем с деревом как с основным материалом, а столярный подход переносим" },
              { text: "в свет:", className: "font-serif font-normal italic text-primary" },
              { text: "точные пропорции, чистые линии и внимание к тому, как предмет живёт в интерьере." },
            ]}
          />
        </div>
        <div className="lg:col-span-3 lg:pt-28">
          <PhotoReveal
            src={asset("brand/assembly.webp")}
            alt="Мастер бюро собирает светильник"
            rotate={-4}
            className="mx-auto aspect-[589/641] w-full max-w-[300px] rounded-lg border-[6px] border-card shadow-warm"
          />
          <p className="mx-auto mt-4 max-w-[300px] font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
            Сами проектируем и сами собираем каждый светильник
          </p>
        </div>
      </div>

      <dl className="mx-auto mt-20 grid max-w-[1440px] gap-px overflow-hidden rounded-lg border bg-border md:mt-28 md:grid-cols-2">
        {FACTS.map((f) => (
          <div key={f.value} className="bg-background p-7 md:p-9">
            <dt className="font-serif text-4xl tracking-[-0.03em] md:text-5xl">{f.value}</dt>
            <dd className="mt-3 max-w-[30ch] text-[15px] leading-relaxed text-muted-foreground">{f.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
