import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const PARTS = [
  {
    title: "Свет, который работает на атмосферу",
    text: "Подвесные линейные светильники из шпона дуба и фанеры — ключевое направление бюро. Серии Mid Century, Simplex и Rounded выпускаются длиной 800, 1000 и 1200 мм и подходят для обеденного стола, кухни-гостиной или спальни. Светильники мы покрываем маслом, которое сохраняет фактуру дерева.",
  },
  {
    title: "Умный свет",
    text: "Каждый светильник доступен в четырёх комплектациях: базовой с включением от пульта, с регулировкой яркости, с регулировкой яркости и теплоты света и «Умный дом» с управлением голосом через Алису и из приложения. Пульт входит в комплект всегда.",
  },
  {
    title: "Мебель из фанеры",
    text: "Помимо света, бюро делает мебель из фанеры для дома: стулья, кресла, круглые и прямоугольные столы, прикроватные столики и стеллажи. Многие модели самосборные, их легко собрать дома.",
  },
  {
    title: "Почему ручная работа",
    text: "Ручная сборка позволяет учесть особенности каждого листа шпона и фанеры, а покрытие маслом сохраняет тактильность натуральной поверхности. Рисунок дерева у каждого изделия свой, поэтому двух одинаковых светильников не бывает.",
  },
  {
    title: "Стили и интерьеры",
    text: "Изделия бюро вписываются в современные интерьеры: минимализм, лофт, mid-century, сканди и эко. Подвесной светильник из шпона становится акцентом обеденной группы, линейный — световым сценарием для кухни-гостиной. Мы делаем свет и мебель для частных и коммерческих интерьеров.",
  },
  {
    title: "Как заказать",
    text: "Выберите модель и комплектацию в каталоге и оставьте заявку или напишите нам в MAX — поможем подобрать длину и комплектацию под ваш интерьер.",
  },
] as const

/** Long-form copy for search engines; collapsed by default, the full text stays in the markup. */
export function SeoText() {
  const [open, setOpen] = React.useState(false)
  const bodyId = React.useId()

  return (
    <section aria-labelledby="seo-title" className="border-t px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow mb-6 text-muted-foreground">О светильниках из дерева</p>
        <h2 id="seo-title" className="text-[clamp(26px,2.6vw,38px)] leading-[1.1] font-medium tracking-[-0.03em]">
          Дизайнерские светильники и мебель из дерева от бюро «Черников»
        </h2>
        <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground md:text-base">
          Столярное бюро «Черников» более 10 лет работает с деревом, шпоном и фанерой. Мы сами проектируем и собираем каждое изделие на
          собственном производстве в Краснодаре — от подбора материала до финальной сборки и покрытия маслом. Наш подход — минимализм с
          точными пропорциями, где дерево остаётся главным выразительным средством.
        </p>

        <div
          id={bodyId}
          className={cn(
            "relative overflow-hidden transition-[max-height] duration-700 ease-[var(--ease-out-expo)]",
            open ? "max-h-[3000px]" : "max-h-48"
          )}
        >
          {PARTS.map((part) => (
            <div key={part.title} className="mt-8">
              <h3 className="text-lg font-medium tracking-[-0.01em]">{part.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground md:text-base">{part.text}</p>
            </div>
          ))}
          {!open && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="mt-6 inline-flex cursor-pointer items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-primary uppercase transition hover:text-foreground"
        >
          {open ? "Свернуть" : "Читать дальше"}
          <ChevronDown className={cn("size-4 transition-transform duration-300", open && "rotate-180")} />
        </button>
      </div>
    </section>
  )
}
