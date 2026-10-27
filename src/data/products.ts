import { asset } from "@/lib/utils"

export type ProductKind = "lamp" | "furniture"
export type LampSeries = "Mid Century" | "Simplex" | "Rounded"
export type EditionKey = "base" | "dim" | "dimWarm" | "smart"

export interface Edition {
  key: EditionKey
  title: string
  note: string
}

/** The live store sells every lamp in these four editions (Tilda "Умный дом / яркость / теплота" options). */
export const EDITIONS: readonly Edition[] = [
  { key: "base", title: "Базовая", note: "Включение и выключение с пульта" },
  { key: "dim", title: "Регулировка яркости", note: "Плавно приглушайте свет пультом" },
  { key: "dimWarm", title: "Яркость и теплота света", note: "От бодрого белого до тёплого вечернего" },
  { key: "smart", title: "Умный дом · Алиса", note: "Голосом и из приложения, с яркостью и теплотой" },
]

export interface Product {
  slug: string
  title: string
  type: string
  kind: ProductKind
  series?: LampSeries
  finish?: string
  lengthMm?: 800 | 1000 | 1200
  prices: { base: number } & Partial<Record<Exclude<EditionKey, "base">, number>>
  /** the base edition is out of stock on the live site, so it starts from "dim" */
  baseSoldOut?: boolean
  size?: { l: number; w: number; h: number }
  weightG?: number
  description: string
}

const LAMP = "Потолочный светильник"
const PLYWOOD_LAMP =
  "Светильник из фанеры. Покрытие — премиальное итальянское масло «Borma». В комплекте пульт для быстрого доступа к основным функциям."
const VENEER_LAMP =
  "Светильник из МДФ в натуральном шпоне дуба. Покрытие — премиальное итальянское масло «Borma». В комплекте пульт для быстрого доступа к основным функциям."
const ROUND_TABLE =
  "Круглый стол из натуральной фанеры станет гармоничным элементом интерьера благодаря сдержанному и современному дизайну. Экологичный материал и продуманная самосборная конструкция делают его удобным в использовании и лёгким в сборке."
const SMALL_TABLE =
  "Компактный стол из прочной и экологичной фанеры. Лёгкая конструкция обеспечивает удобство перемещения, а самосборный формат позволяет быстро собрать изделие без сложного монтажа и дополнительных инструментов."
const RECT_TABLE =
  "Прямоугольный столик из фанеры сочетает лаконичный дизайн и функциональность. Удобные пропорции делают его универсальным решением для интерьера, а самосборная конструкция обеспечивает простой и быстрый монтаж."

function lamp(
  slug: string,
  title: string,
  series: LampSeries,
  finish: string,
  lengthMm: 800 | 1000 | 1200,
  [base, dim, dimWarm, smart]: [number, number, number, number],
  extra: Partial<Product> = {}
): Product {
  return { slug, title, type: LAMP, kind: "lamp", series, finish, lengthMm, prices: { base, dim, dimWarm, smart }, description: PLYWOOD_LAMP, ...extra }
}

// Order, names, prices and editions mirror the live catalog (scraped 27.10.2026).
export const PRODUCTS: readonly Product[] = [
  // the live card lists 1000x64x64 mm for this 800 model (copied from Simplex) — size left out until confirmed
  lamp("rounded-plywood-800", "Rounded Plywood 800", "Rounded", "Фанера", 800, [21500, 25000, 25000, 30000], { weightG: 1800 }),
  lamp("simplex-plywood-1000", "Simplex Plywood 1000", "Simplex", "Фанера", 1000, [20000, 22500, 24000, 25000], { size: { l: 1000, w: 64, h: 64 }, weightG: 1800 }),
  {
    slug: "lam", title: "Лам", type: "Стул", kind: "furniture", prices: { base: 5000 }, size: { l: 500, w: 450, h: 850 },
    description: "Лёгкий самосборный стул из экологичной фанеры, в котором конструкция становится частью дизайна. Ритм деревянных планок создаёт комфортную посадку и визуальную лёгкость, а сборка без лишних элементов делает его удобным в использовании и транспортировке.",
  },
  lamp("mid-century-black-800", "Mid Century Black-800", "Mid Century", "Шпон дуба · чёрный", 800, [25000, 28000, 30000, 35000], { size: { l: 800, w: 86, h: 86 }, weightG: 3700, description: VENEER_LAMP }),
  lamp("mid-century-63-1200", "Mid Century 63-1200", "Mid Century", "Шпон дуба · тон 63", 1200, [30000, 34000, 38000, 40000], { size: { l: 1200, w: 86, h: 86 }, weightG: 4600, description: VENEER_LAMP, baseSoldOut: true }),
  {
    slug: "balans", title: "Баланс", type: "Кресло", kind: "furniture", prices: { base: 6500 }, size: { l: 800, w: 760, h: 750 },
    description: "Удобное кресло из фанеры сочетает продуманную эргономику и современный лаконичный дизайн. Конструкция обеспечивает комфортную посадку и гармонично вписывается в интерьер, создавая уютную зону для отдыха.",
  },
  lamp("mid-century-63-800", "Mid Century 63-800", "Mid Century", "Шпон дуба · тон 63", 800, [25000, 30000, 33000, 35000], { size: { l: 800, w: 86, h: 86 }, weightG: 3700, description: VENEER_LAMP }),
  { slug: "rondo-700", title: "Рондо 700", type: "Стол круглый 700 мм", kind: "furniture", prices: { base: 4000 }, size: { l: 700, w: 700, h: 500 }, description: ROUND_TABLE },
  lamp("mid-century-black-1000", "Mid Century Black-1000", "Mid Century", "Шпон дуба · чёрный", 1000, [27500, 33500, 35500, 37500], { size: { l: 1000, w: 86, h: 86 }, weightG: 3900, description: VENEER_LAMP }),
  {
    slug: "aalto", title: "Аалто", type: "Прикроватный столик", kind: "furniture", prices: { base: 2500 }, size: { l: 390, w: 390, h: 600 },
    description: "Практичный прикроватный стол из прочной и экологичной фанеры. Лёгкая конструкция позволяет удобно разместить его у дивана или кровати, а самосборный формат обеспечивает быструю сборку без сложного монтажа и дополнительных инструментов.",
  },
  { slug: "sloi", title: "Слой", type: "Стол прямоугольный", kind: "furniture", prices: { base: 4000 }, size: { l: 1000, w: 350, h: 470 }, description: RECT_TABLE },
  lamp("simplex-plywood-800", "Simplex Plywood 800", "Simplex", "Фанера", 800, [18000, 20000, 23000, 25000], { size: { l: 800, w: 64, h: 64 }, weightG: 1800 }),
  { slug: "gran", title: "Грань", type: "Стол прямоугольный", kind: "furniture", prices: { base: 3000 }, size: { l: 600, w: 350, h: 470 }, description: RECT_TABLE },
  lamp("simplex-black-plywood-1000", "Simplex Black Plywood 1000", "Simplex", "Фанера · чёрная", 1000, [20000, 22500, 25000, 27500], { size: { l: 1000, w: 64, h: 64 }, weightG: 1800 }),
  lamp("mid-century-black-plywood-1000", "Mid Century Black Plywood 1000", "Mid Century", "Фанера · чёрная", 1000, [20000, 22500, 25000, 27500], { size: { l: 1000, w: 86, h: 86 }, weightG: 1800 }),
  { slug: "osnova-400", title: "Основа 400", type: "Стол круглый 400 мм", kind: "furniture", prices: { base: 2500 }, size: { l: 400, w: 400, h: 470 }, description: SMALL_TABLE },
  { slug: "osnova-500", title: "Основа 500", type: "Стол круглый 500 мм", kind: "furniture", prices: { base: 3000 }, size: { l: 500, w: 500, h: 470 }, description: SMALL_TABLE },
  lamp("mid-century-dub-1000", "Mid Century Дуб-1000", "Mid Century", "Шпон дуба", 1000, [27500, 33500, 35500, 37500], { size: { l: 1000, w: 86, h: 86 }, weightG: 3900, description: VENEER_LAMP }),
  lamp("simplex-black-1000", "Simplex Black-1000", "Simplex", "Шпон дуба · чёрный", 1000, [27500, 33500, 35500, 37500], { size: { l: 1000, w: 64, h: 64 }, weightG: 2600, description: VENEER_LAMP }),
  { slug: "osnova-600", title: "Основа 600", type: "Стол круглый 600 мм", kind: "furniture", prices: { base: 3500 }, description: SMALL_TABLE },
  lamp("mid-century-plywood-800", "Mid Century Plywood 800", "Mid Century", "Фанера", 800, [18000, 22000, 23000, 25000], { size: { l: 800, w: 86, h: 86 }, weightG: 1700 }),
  { slug: "osnova-700", title: "Основа 700", type: "Стол круглый 700 мм", kind: "furniture", prices: { base: 4000 }, description: ROUND_TABLE },
  lamp("mid-century-dub-800", "Mid Century Дуб-800", "Mid Century", "Шпон дуба", 800, [25000, 30000, 33000, 35000], { size: { l: 800, w: 86, h: 86 }, weightG: 3700, description: VENEER_LAMP }),
  {
    slug: "oro", title: "Оро", type: "Стеллаж", kind: "furniture", prices: { base: 4000 },
    description: "Стеллаж из экологичной фанеры с четырьмя круглыми полками сочетает стильный лаконичный дизайн и практичность. Самосборная конструкция легко собирается без дополнительных инструментов.",
  },
  lamp("mid-century-63-1000", "Mid Century 63-1000", "Mid Century", "Шпон дуба · тон 63", 1000, [27500, 33500, 35500, 37500], { size: { l: 1000, w: 86, h: 86 }, weightG: 3900, description: VENEER_LAMP }),
  {
    slug: "vertikal", title: "Вертикаль", type: "Стеллаж", kind: "furniture", prices: { base: 4500 }, size: { l: 720, w: 250, h: 1140 },
    description: "Стеллаж из экологичной фанеры с четырьмя полками сочетает стильный лаконичный дизайн и практичность. Самосборная конструкция легко собирается без дополнительных инструментов.",
  },
  lamp("mid-century-black-1200", "Mid Century Black-1200", "Mid Century", "Шпон дуба · чёрный", 1200, [30000, 35000, 38000, 40000], { size: { l: 1200, w: 86, h: 86 }, weightG: 4600, description: VENEER_LAMP }),
  lamp("mid-century-dub-1200", "Mid Century Дуб-1200", "Mid Century", "Шпон дуба", 1200, [30000, 35000, 38000, 40000], { size: { l: 1200, w: 86, h: 86 }, weightG: 4600, description: VENEER_LAMP }),
  lamp("simplex-black-800", "Simplex Black-800", "Simplex", "Шпон дуба · чёрный", 800, [18000, 20000, 23000, 25000], { size: { l: 800, w: 64, h: 64 }, weightG: 2200, description: VENEER_LAMP }),
  lamp("simplex-black-1200", "Simplex Black-1200", "Simplex", "Шпон дуба · чёрный", 1200, [22000, 25000, 27000, 30000], { size: { l: 1200, w: 64, h: 64 }, weightG: 3100, description: VENEER_LAMP }),
]

const BY_SLUG = new Map(PRODUCTS.map((p) => [p.slug, p]))

export function findProduct(slug: string): Product | undefined {
  return BY_SLUG.get(slug)
}

export function productImage(slug: string, index: 1 | 2, size: "sm" | "lg" = "sm"): string {
  return asset(`products/${slug}-${index}${size === "sm" ? "-sm" : ""}.webp`)
}

export function editionPrice(product: Product, edition: EditionKey | null): number {
  if (!edition) return product.prices.base
  return product.prices[edition] ?? product.prices.base
}

export function defaultEdition(product: Product): EditionKey | null {
  if (product.kind !== "lamp") return null
  return product.baseSoldOut ? "dim" : "base"
}

/** The price a visitor can actually order at (what the live card shows). */
export function startPrice(product: Product): number {
  return editionPrice(product, defaultEdition(product))
}

export function isEditionAvailable(product: Product, edition: EditionKey): boolean {
  return !(edition === "base" && product.baseSoldOut) && product.prices[edition] !== undefined
}

export function editionTitle(edition: EditionKey | null): string | undefined {
  return EDITIONS.find((e) => e.key === edition)?.title
}
