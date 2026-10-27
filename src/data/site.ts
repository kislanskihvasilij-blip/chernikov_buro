const ORIGIN = "https://xn----btbblpmtkdmh8e2e.xn--p1ai"

export const CONTACTS = {
  phoneDisplay: "+7 961 535 39 55",
  phoneHref: "tel:+79615353955",
  phoneIntl: "79615353955",
  email: "chernikov.buro@mail.ru",
  address: "г. Краснодар, ул. Зиповская, 5В",
  mapHref: `https://yandex.ru/maps/?text=${encodeURIComponent("Краснодар, улица Зиповская, 5В")}`,
} as const

export type SocialId = "telegram" | "whatsapp" | "max" | "vk" | "pinterest"

export interface Social {
  id: SocialId
  label: string
  href: string
}

export const SOCIALS: readonly Social[] = [
  { id: "whatsapp", label: "WhatsApp", href: "https://wa.me/79615353955" },
  { id: "telegram", label: "Telegram", href: "https://t.me/chernikov_buro" },
  { id: "max", label: "MAX", href: "https://web.max.ru/229909870" },
  { id: "vk", label: "ВКонтакте", href: "https://vk.com/club234231538" },
  { id: "pinterest", label: "Pinterest", href: "https://www.pinterest.com/Chernikov_buro" },
]

export interface NavLink {
  label: string
  href: `#${string}`
}

export const NAV: readonly NavLink[] = [
  { label: "Каталог", href: "#catalog" },
  { label: "Интерьеры", href: "#interiors" },
  { label: "Умный свет", href: "#light" },
  { label: "О бюро", href: "#about" },
  { label: "Как заказать", href: "#process" },
  { label: "Контакты", href: "#contact" },
]

export const DOCUMENTS = [
  { title: "Инструкция по установке", href: `${ORIGIN}/page96895356.html` },
  { title: "Руководство по эксплуатации", href: `${ORIGIN}/page97904946.html` },
  { title: "Сертификат соответствия", href: `${ORIGIN}/page98717036.html` },
] as const

export const PARTNERS = [
  { name: "Лемана ПРО", logo: "brand/partner-lemana.svg" },
  { name: "Партнёр бюро", logo: "brand/partner-1.svg" },
  { name: "Партнёр бюро", logo: "brand/partner-3.svg" },
] as const

export const LEGAL = {
  owner: "ИП Вербицкий А. Ю.",
  inn: "262704613025",
  ogrnip: "321265100009545",
  privacyHref: `${ORIGIN}/privacy_policy`,
  personalDataHref: `${ORIGIN}/page258051709.html`,
} as const
