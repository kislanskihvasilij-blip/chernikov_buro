import { CONTACTS } from "@/data/site"
import { formatPrice } from "@/lib/utils"

export interface LeadLine {
  title: string
  edition?: string
  qty: number
  price: number
}

export interface Lead {
  name: string
  phone: string
  comment?: string
  items: readonly LeadLine[]
}

/** Digits only; accepts 8XXXXXXXXXX, 7XXXXXXXXXX, +7… and 10-digit local numbers. */
export function isValidPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 10) return true
  return digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))
}

export function buildLeadMessage(lead: Lead): string {
  const lines = [`Здравствуйте! Заявка с сайта Черников Бюро.`, `Имя: ${lead.name.trim()}`, `Телефон: ${lead.phone.trim()}`]
  if (lead.items.length) {
    lines.push("", "Интересует:")
    for (const item of lead.items) {
      const edition = item.edition ? ` (${item.edition})` : ""
      lines.push(`• ${item.title}${edition} × ${item.qty} — ${formatPrice(item.price * item.qty)}`)
    }
    const total = lead.items.reduce((sum, i) => sum + i.price * i.qty, 0)
    lines.push(`Итого по каталогу: ${formatPrice(total)}`)
  }
  if (lead.comment?.trim()) lines.push("", `Комментарий: ${lead.comment.trim()}`)
  return lines.join("\n")
}

export function buildProductQuestion(title: string, edition: string | undefined, price: number): string {
  const what = edition ? `${title} (${edition})` : title
  return `Здравствуйте! Интересует ${what} — ${formatPrice(price)} по каталогу. Подскажите, пожалуйста, по срокам и доставке.`
}

export function whatsappHref(text: string): string {
  return `https://wa.me/${CONTACTS.phoneIntl}?text=${encodeURIComponent(text)}`
}

export function mailtoHref(subject: string, body: string): string {
  return `mailto:${CONTACTS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/**
 * The site is static (no backend), so a lead is delivered by opening the studio's WhatsApp
 * with the message typed in. Returns false when the browser blocked the new tab.
 */
export function sendLeadToWhatsapp(lead: Lead): boolean {
  const opened = window.open(whatsappHref(buildLeadMessage(lead)), "_blank", "noopener,noreferrer")
  return opened !== null
}
