import { CONTACTS } from "@/data/site"
import { asset, formatPrice } from "@/lib/utils"

const LEAD_ENDPOINT = asset("api/lead.php")
const LEAD_TIMEOUT_MS = 12000

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
 * Posts the lead to public/api/lead.php, which e-mails it to the studio. `website` is the hidden
 * anti-bot field. Resolves to false on any failure so the form can offer another way to reach us.
 */
export async function sendLead(lead: Lead, website: string): Promise<boolean> {
  try {
    const response = await fetch(LEAD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lead, consent: true, website }),
      signal: AbortSignal.timeout(LEAD_TIMEOUT_MS),
    })
    if (!response.ok) return false
    const result: unknown = await response.json()
    return typeof result === "object" && result !== null && "success" in result && result.success === true
  } catch {
    return false
  }
}
