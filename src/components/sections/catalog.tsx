import * as React from "react"

import { PRODUCTS, startPrice, type LampSeries, type Product } from "@/data/products"
import { cn } from "@/lib/utils"
import { ProductCard } from "./product-card"

type KindFilter = "all" | "lamp" | "furniture"
type LengthFilter = "all" | 800 | 1000 | 1200
type SortKey = "default" | "asc" | "desc"

const SERIES: readonly (LampSeries | "all")[] = ["all", "Mid Century", "Simplex", "Rounded"]
const LENGTHS: readonly LengthFilter[] = ["all", 800, 1000, 1200]

const count = (kind: KindFilter) => (kind === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.kind === kind).length)

function applyFilters(kind: KindFilter, series: LampSeries | "all", length: LengthFilter, sort: SortKey): Product[] {
  const filtered = PRODUCTS.filter(
    (p) =>
      (kind === "all" || p.kind === kind) &&
      (kind !== "lamp" || series === "all" || p.series === series) &&
      (kind !== "lamp" || length === "all" || p.lengthMm === length)
  )
  if (sort === "default") return filtered
  const dir = sort === "asc" ? 1 : -1
  return [...filtered].sort((a, b) => (startPrice(a) - startPrice(b)) * dir)
}

export function Catalog() {
  const [kind, setKind] = React.useState<KindFilter>("all")
  const [series, setSeries] = React.useState<LampSeries | "all">("all")
  const [length, setLength] = React.useState<LengthFilter>("all")
  const [sort, setSort] = React.useState<SortKey>("default")
  const items = applyFilters(kind, series, length, sort)
  // re-keying the grid on every filter change replays the photo arrival
  const filterKey = `${kind}-${series}-${length}-${sort}`

  return (
    <section id="catalog" aria-labelledby="catalog-title" className="relative px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <p className="eyebrow mb-6 text-muted-foreground">Каталог</p>
            <h2 id="catalog-title" className="text-[clamp(34px,4.6vw,68px)] leading-[1] font-medium tracking-[-0.04em]">
              Светильники и мебель
              <br />
              <span className="font-serif font-normal text-primary italic">собственного производства</span>
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground md:justify-self-end">
            Цены — как в нашем магазине. Каждый светильник доступен в четырёх комплектациях: от пульта до управления голосом через Алису.
          </p>
        </div>

        <div className="sticky top-0 z-20 -mx-5 mt-12 border-b bg-background/85 px-5 py-3 backdrop-blur-xl md:-mx-10 md:px-10">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Segmented
              label="Тип"
              value={kind}
              onChange={(v) => {
                setKind(v)
                setSeries("all")
                setLength("all")
              }}
              options={[
                { value: "all", label: `Все · ${count("all")}` },
                { value: "lamp", label: `Светильники · ${count("lamp")}` },
                { value: "furniture", label: `Мебель · ${count("furniture")}` },
              ]}
            />
            {kind === "lamp" && (
              <>
                <Segmented label="Серия" value={series} onChange={setSeries} options={SERIES.map((s) => ({ value: s, label: s === "all" ? "Все серии" : s }))} />
                <Segmented label="Длина" value={length} onChange={setLength} options={LENGTHS.map((l) => ({ value: l, label: l === "all" ? "Любая" : `${l} мм` }))} />
              </>
            )}
            <label className="ml-auto flex items-center gap-2 text-[13px] text-muted-foreground">
              <span className="sr-only md:not-sr-only">Сортировка</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-9 cursor-pointer rounded-md border bg-card px-3 text-[13px] font-medium text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
              >
                <option value="default">Рекомендуемые</option>
                <option value="asc">Сначала дешевле</option>
                <option value="desc">Сначала дороже</option>
              </select>
            </label>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          Найдено товаров: {items.length}
        </p>
        <div key={filterKey} className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 md:gap-y-14 xl:grid-cols-4">
          {items.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
        {items.length === 0 && <p className="py-20 text-center text-muted-foreground">Нет моделей с такими параметрами — сбросьте фильтр.</p>}
      </div>
    </section>
  )
}

interface SegmentedProps<T extends string | number> {
  label: string
  value: T
  onChange: (value: T) => void
  options: readonly { value: T; label: string }[]
}

function Segmented<T extends string | number>({ label, value, onChange, options }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="no-scrollbar flex max-w-full gap-1 overflow-x-auto">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "h-9 shrink-0 cursor-pointer rounded-md px-3.5 text-[13px] font-semibold whitespace-nowrap transition duration-300",
              active ? "bg-foreground text-background shadow-warm" : "text-foreground/70 hover:bg-foreground/[0.06] hover:text-foreground"
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
