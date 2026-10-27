import { Hammer, Leaf, Sparkles, Wrench } from "lucide-react"

import { GlowCard } from "@/components/ui/glow-card"

// wording follows the bureau's own "О нас" page
const BENEFITS = [
  {
    icon: Sparkles,
    title: "Эксклюзивность",
    text: "Мы не просто делаем светильники — мы создаём атмосферу. Каждый потолочный светильник из натурального шпона уникален, как узор на живом листе.",
  },
  {
    icon: Hammer,
    title: "Качество",
    text: "Полный контроль процесса на собственном производстве: сами отбираем материалы и комплектующие, сами проектируем и собираем каждый светильник.",
  },
  {
    icon: Leaf,
    title: "Экологичность",
    text: "Возобновляемые природные материалы, безопасные лаки и масла. Светильники не выделяют вредных веществ и наполняют дом тёплой энергией дерева.",
  },
  {
    icon: Wrench,
    title: "Сборка без инструментов",
    text: "Столы, стеллажи, стул и кресло из фанеры — самосборные: собираются быстро, без сложного монтажа и дополнительных инструментов.",
  },
] as const

export function Benefits() {
  return (
    <section data-header="dark" aria-labelledby="benefits-title" className="relative bg-night px-5 pb-28 text-on-night md:px-10 md:pb-36">
      <div className="mx-auto max-w-[1440px] border-t border-on-night/10 pt-20 md:pt-28">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 id="benefits-title" className="max-w-2xl text-[clamp(30px,3.6vw,52px)] leading-[1.05] font-medium tracking-[-0.035em]">
            Почему наш свет <span className="font-serif font-normal italic text-glow">выбирают</span>
          </h2>
          <p className="max-w-sm text-[15px] leading-relaxed text-on-night/60">Наведите на карточку — дерево и свет всегда работают вместе.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, text }, i) => (
            <GlowCard key={title} as="article" className="flex min-h-[300px] flex-col rounded-xl border border-on-night/10 bg-night-2 p-7">
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-full border border-on-night/15 bg-on-night/[0.04] text-glow shadow-[0_0_40px_-10px_rgb(255_160_90/0.7)]">
                  <Icon className="size-5" />
                </span>
                <span className="font-mono text-xs text-on-night-muted">0{i + 1}</span>
              </div>
              <h3 className="mt-auto pt-10 font-serif text-2xl tracking-[-0.02em]">{title}</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-on-night/65">{text}</p>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  )
}
