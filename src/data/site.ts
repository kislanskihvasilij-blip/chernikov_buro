const ORIGIN = "https://xn----btbblpmtkdmh8e2e.xn--p1ai"

export const CONTACTS = {
  phoneDisplay: "+7 961 535 39 55",
  phoneHref: "tel:+79615353955",
  phoneIntl: "79615353955",
  email: "chernikov.buro@mail.ru",
  address: "г. Краснодар, ул. Зиповская, 5В",
  mapHref: `https://yandex.ru/maps/?text=${encodeURIComponent("Краснодар, улица Зиповская, 5В")}`,
} as const

export const MAX_HREF = "https://web.max.ru/229909870"

export type SocialId = "telegram" | "whatsapp" | "max" | "vk" | "pinterest"

export interface Social {
  id: SocialId
  label: string
  href: string
}

export const SOCIALS: readonly Social[] = [
  { id: "whatsapp", label: "WhatsApp", href: "https://wa.me/79615353955" },
  { id: "telegram", label: "Telegram", href: "https://t.me/chernikov_buro" },
  { id: "max", label: "MAX", href: MAX_HREF },
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
  { label: "О нас", href: "#about" },
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
  owner: "ИП Вербицкая И. И.",
  inn: "262902377718",
  ogrnip: "324237500196416",
  privacyHref: `${ORIGIN}/privacy_policy`,
  personalDataHref: `${ORIGIN}/page258051709.html`,
} as const
